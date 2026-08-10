export interface FeedAuthor {
  id: string;
  name: string | null;
  email: string;
  role: "admin" | "member";
}

export interface FeedComment {
  id: string;
  content: string;
  createdAt: string;
  author: FeedAuthor;
}

export interface FeedPost {
  id: string;
  content: string;
  createdAt: string;
  author: FeedAuthor;
  comments: FeedComment[];
}

export function authorLabel(author: FeedAuthor): string {
  return author.name?.trim() || author.email;
}

export function authorInitial(author: FeedAuthor): string {
  const label = authorLabel(author);
  return label.charAt(0).toUpperCase();
}

export function timeAgo(iso: string): string {
  const ts = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "baru saja";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} menit lalu`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} jam lalu`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day} hari lalu`;
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
