const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export type ParsedImage = {
  data: Uint8Array;
  mimeType: string;
  name: string;
};

function hasValidSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/png") return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/gif") return bytes.length >= 6 && ["GIF87a", "GIF89a"].includes(String.fromCharCode(...bytes.slice(0, 6)));
  if (mimeType === "image/webp") return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

export async function parseImageUpload(value: FormDataEntryValue | null): Promise<{ image: ParsedImage | null; error: string | null }> {
  if (!(value instanceof File) || value.size === 0) return { image: null, error: null };
  if (value.size > MAX_IMAGE_BYTES || !allowedTypes.has(value.type)) return { image: null, error: "Gambar harus PNG, JPEG, WebP, atau GIF dengan ukuran maksimum 5 MB." };
  const bytes = new Uint8Array(await value.arrayBuffer());
  if (!hasValidSignature(bytes, value.type)) return { image: null, error: "Berkas gambar tidak valid." };
  return { image: { data: new Uint8Array(bytes), mimeType: value.type, name: value.name.slice(0, 150) || "gambar" }, error: null };
}
