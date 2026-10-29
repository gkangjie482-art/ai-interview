/**
 * <input type="datetime-local"> の値（日本時間 "YYYY-MM-DDTHH:mm"）と ISO 文字列を相互変換する
 */

const JST_OFFSET = "+09:00";

/** 日本時間の datetime-local 値 → ISO 文字列。空欄・不正値は null */
export function jstLocalToIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(`${value}:00${JST_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** ISO 文字列 → 日本時間の datetime-local 値。null は空欄 */
export function isoToJstLocal(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 16);
}
