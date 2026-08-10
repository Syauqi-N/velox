const APP_ORIGIN = "https://velox.local";

export function safeCallbackUrl(value: string | null | undefined): string {
  if (!value) return "/dashboard";

  try {
    const url = new URL(value, APP_ORIGIN);
    if (url.origin !== APP_ORIGIN || !value.startsWith("/")) {
      return "/dashboard";
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
}
