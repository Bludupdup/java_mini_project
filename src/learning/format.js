/** Small text helpers shared by the pages. */

export const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

export const formatDate = (time) =>
  new Date(time).toLocaleDateString(undefined, { day: "numeric", month: "short" });

/** "just now", "5 min ago", "3 h ago", "yesterday", "4 days ago", then a date. */
export function timeAgo(time, now) {
  const minutes = Math.floor((now - time) / 60_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;

  return formatDate(time);
}

/** "Ada Lovelace" → "AL", "sam" → "S", "" → "". */
export function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}
