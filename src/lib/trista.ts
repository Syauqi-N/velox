import { prisma } from "@/lib/db";
import { TRISTA_MODEL, TRISTA_SYSTEM_PROMPT, type TristaMessage } from "@/lib/trista-core";

const TRISTA_EMAIL = "trista@velox.ai";
const DEFAULT_NINEROUTER_URL = "http://127.0.0.1:20128/v1";

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>;
  error?: { message?: string };
}

function completionText(payload: ChatCompletionResponse): string | null {
    const unwrapped = (payload as any).data?.choices ? (payload as any).data : payload;
  const content = unwrapped.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim() || null;
  if (Array.isArray(content)) {
    const text = content.map((part) => part.text ?? "").join("\n").trim();
    return text || null;
  }
  return null;
}

function nineRouterBaseUrl(): string {
  const configured = process.env.NINEROUTER_URL?.trim() || DEFAULT_NINEROUTER_URL;
  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new Error(`NINEROUTER_URL tidak valid: ${configured}`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error(`NINEROUTER_URL protocol tidak valid: ${configured}`);
  return url.toString().replace(/\/$/, "");
}

export async function askTrista(messages: TristaMessage[], maxTokens = 1_000): Promise<string> {
  const baseUrl = nineRouterBaseUrl();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const apiKey = process.env.NINEROUTER_KEY?.trim();
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: TRISTA_MODEL,
      messages: [{ role: "system", content: TRISTA_SYSTEM_PROMPT }, ...messages],
      temperature: 0.35,
      max_tokens: maxTokens,
      stream: false,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(45_000),
  }).catch((err: Error) => {
    throw new Error(`Tidak dapat terhubung ke 9Router di ${baseUrl}: ${err.message}`);
  });

  const payload = await response.json().catch(() => ({})) as ChatCompletionResponse;
  if (!response.ok) throw new Error(payload.error?.message || `9Router returned ${response.status}`);
  const text = completionText(payload);
  if (!text) throw new Error("9Router mengembalikan jawaban kosong");
  return text;
}

async function ensureTristaUser() {
  return prisma.user.upsert({
    where: { email: TRISTA_EMAIL },
    update: {
      name: "TRISTA",
      bio: "Trust in Rational Investing, Strategy, Timing & Analysis. Asisten AI untuk riset dan diskusi saham Indonesia.",
      memberTags: ["AI Investment Analyst", "Saham Indonesia"],
      status: "ACTIVE",
      isAi: true,
    },
    create: {
      id: "trista-ai",
      email: TRISTA_EMAIL,
      name: "TRISTA",
      bio: "Trust in Rational Investing, Strategy, Timing & Analysis. Asisten AI untuk riset dan diskusi saham Indonesia.",
      memberTags: ["AI Investment Analyst", "Saham Indonesia"],
      role: "member",
      status: "ACTIVE",
      isAi: true,
    },
    select: { id: true },
  });
}

export async function createTristaPlaceholder(postId: string): Promise<string> {
  const trista = await ensureTristaUser();
  const comment = await prisma.comment.create({
    data: {
      postId,
      authorId: trista.id,
      content: "TRISTA sedang membaca seluruh thread dan menyusun analisis…",
      aiStatus: "PENDING",
    },
    select: { id: true },
  });
  return comment.id;
}

function threadAuthor(name: string | null, isAi: boolean): string {
  if (isAi) return "TRISTA (AI)";
  return name?.trim() || "Member";
}

export async function answerTristaMention(postId: string, placeholderId: string): Promise<void> {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        content: true,
        symbol: true,
        priceSnapshot: true,
        changePercentSnapshot: true,
        priceCapturedAt: true,
        imageMimeType: true,
        author: { select: { name: true, isAi: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            imageMimeType: true,
            aiStatus: true,
            author: { select: { name: true, isAi: true } },
          },
        },
      },
    });
    if (!post) throw new Error("Thread tidak ditemukan");

    const lines = [
      "Berikut konteks lengkap thread Velox. Tanggapi mention @TRISTA yang paling baru dengan tetap mempertimbangkan seluruh percakapan sebelumnya.",
      "",
      `POST oleh ${threadAuthor(post.author.name, post.author.isAi)}:`,
      post.content || "[Postingan tanpa teks]",
      post.imageMimeType ? "[Postingan menyertakan gambar yang tidak dapat dibaca model]" : "",
      post.symbol ? `Saham terkait: ${post.symbol.replace(".JK", "")}` : "",
      post.priceSnapshot != null ? `Snapshot harga saat posting: Rp ${post.priceSnapshot.toLocaleString("id-ID")}` : "",
      post.changePercentSnapshot != null ? `Perubahan saat posting: ${post.changePercentSnapshot.toFixed(2)}%` : "",
      post.priceCapturedAt ? `Waktu snapshot: ${post.priceCapturedAt.toISOString()}` : "",
      "",
      "KOMENTAR (urutan lama ke baru):",
    ].filter(Boolean);

    const comments = post.comments.filter((comment) => comment.id !== placeholderId && comment.aiStatus !== "PENDING");
    if (!comments.length) lines.push("[Belum ada komentar sebelum mention ini]");
    comments.forEach((comment, index) => {
      lines.push(`${index + 1}. ${threadAuthor(comment.author.name, comment.author.isAi)}: ${comment.content || "[Tanpa teks]"}${comment.imageMimeType ? " [menyertakan gambar yang tidak dapat dibaca model]" : ""}`);
    });

    const reply = await askTrista([{ role: "user", content: lines.join("\n") }], 1_300);
    await prisma.comment.update({
      where: { id: placeholderId },
      data: { content: reply.slice(0, 8_000), aiStatus: "COMPLETE" },
    });
  } catch (error) {
    console.error("TRISTA mention failed", error);
    await prisma.comment.updateMany({
      where: { id: placeholderId },
      data: {
        content: "TRISTA belum dapat menjawab. Pastikan provider clinepass aktif di 9Router, lalu mention kembali.",
        aiStatus: "FAILED",
      },
    }).catch(() => undefined);
  }
}
