const sizeClasses = {
  sm: "h-6 w-6 text-[11px]",
  md: "h-9 w-9 text-sm",
  lg: "h-20 w-20 text-2xl",
};

export default function MemberAvatar({ author, size = "md" }: { author: { name: string | null; email?: string; avatarUrl: string | null }; size?: keyof typeof sizeClasses }) {
  const label = author.name?.trim() || author.email?.trim() || "Member";
  const classes = `${sizeClasses[size]} shrink-0 overflow-hidden rounded-full border border-[var(--border-strong)] bg-[var(--card-hover)] font-bold uppercase text-[var(--accent)]`;
  if (author.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Private authenticated endpoint cannot use the image proxy.
      <img src={author.avatarUrl} alt={`Avatar ${label}`} className={`${classes} object-cover`} />
    );
  }
  return <span className={`${classes} flex items-center justify-center`}>{label.charAt(0).toUpperCase()}</span>;
}
