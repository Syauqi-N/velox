import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { takeRateLimit } from "@/lib/rate-limit";
import { readJsonObject } from "@/lib/request";
import { askTrista } from "@/lib/trista";
import { normalizeChatMessages } from "@/lib/trista-core";

export async function POST(request: NextRequest) {
  const user = await authenticatedUser();
  if (!user || user.status !== "ACTIVE") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimit = takeRateLimit(`trista-chat:${user.id}`, 30, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Batas chat TRISTA tercapai. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = await readJsonObject(request);
  const messages = normalizeChatMessages(body?.messages);
  if (!messages) return NextResponse.json({ error: "Riwayat chat tidak valid." }, { status: 400 });

  try {
    const message = await askTrista(messages);
    return NextResponse.json({ message });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("TRISTA chat failed", detail);
    return NextResponse.json(
      { error: `TRISTA error: ${detail}` },
      { status: 503 },
    );
  }
}
