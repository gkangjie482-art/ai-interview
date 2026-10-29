/**
 * 締切日時を「2026/10/31 23:59」の形式（日本時間）にする。未設定なら null。
 */
export function formatClosesAt(closesAt: string | null): string | null {
  if (!closesAt) return null;
  const date = new Date(closesAt);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
