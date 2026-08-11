const CNBC_MARKET_RSS = "https://www.cnbcindonesia.com/market/rss";
const CNBC_HOSTNAME = "www.cnbcindonesia.com";
const SERVER_CACHE_MS = 5 * 60_000;

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  publishedAt: string | null;
  source: "CNBC Indonesia";
}

interface NewsCache {
  items: NewsItem[];
  freshUntil: number;
  inFlight: Promise<NewsItem[]> | null;
}

const globalForNews = globalThis as unknown as { veloxNewsCache?: NewsCache };
const newsCache = globalForNews.veloxNewsCache ?? { items: [], freshUntil: 0, inFlight: null };
globalForNews.veloxNewsCache = newsCache;

function unwrapCdata(value: string): string {
  return value.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/i, "$1");
}

function decodeXmlEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#x")) {
      const codePoint = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(codePoint) && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
    }
    if (entity.startsWith("#")) {
      const codePoint = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(codePoint) && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
    }
    return named[entity.toLowerCase()] ?? match;
  });
}

function tagValue(xml: string, tag: string): string {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(new RegExp(`<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`, "i"));
  return match ? decodeXmlEntities(unwrapCdata(match[1])).trim() : "";
}

function plainText(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  const shortened = value.slice(0, maxLength + 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > maxLength * 0.7 ? lastSpace : maxLength).trimEnd()}…`;
}

function safeArticleUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== CNBC_HOSTNAME) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function parseCnbcRss(xml: string): NewsItem[] {
  const items = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)];

  return items
    .map((match): NewsItem | null => {
      const block = match[1];
      const title = truncate(plainText(tagValue(block, "title")), 180);
      const url = safeArticleUrl(tagValue(block, "link"));
      const rawExcerpt = tagValue(block, "content:encoded") || tagValue(block, "description");
      const excerpt = truncate(plainText(rawExcerpt), 280);
      if (!title || !url || !excerpt) return null;

      const published = new Date(tagValue(block, "pubDate"));
      return {
        id: url,
        title,
        excerpt,
        url,
        publishedAt: Number.isNaN(published.getTime()) ? null : published.toISOString(),
        source: "CNBC Indonesia",
      };
    })
    .filter((item): item is NewsItem => item !== null)
    .slice(0, 24);
}

async function fetchMarketNews(): Promise<NewsItem[]> {
  const response = await fetch(CNBC_MARKET_RSS, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
      "User-Agent": "VeloxNews/1.0 (market-news-reader)",
    },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(3_500),
  });

  if (!response.ok) throw new Error(`CNBC RSS returned ${response.status}`);
  const items = parseCnbcRss(await response.text());
  if (!items.length) throw new Error("CNBC RSS returned no usable items");
  return items;
}

function refreshMarketNews(): Promise<NewsItem[]> {
  if (newsCache.inFlight) return newsCache.inFlight;

  const request = fetchMarketNews().then((items) => {
    newsCache.items = items;
    newsCache.freshUntil = Date.now() + SERVER_CACHE_MS;
    return items;
  });
  newsCache.inFlight = request;
  const clearRequest = () => {
    if (newsCache.inFlight === request) newsCache.inFlight = null;
  };
  void request.then(clearRequest, clearRequest);
  return request;
}

export async function getMarketNews(forceRefresh = false): Promise<NewsItem[]> {
  if (forceRefresh) return refreshMarketNews();
  if (newsCache.items.length && newsCache.freshUntil > Date.now()) return newsCache.items;

  if (newsCache.items.length) {
    void refreshMarketNews().catch(() => undefined);
    return newsCache.items;
  }

  return refreshMarketNews();
}

export { CNBC_MARKET_RSS };
