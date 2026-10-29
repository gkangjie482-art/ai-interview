/**
 * ページレイアウトに関するユーティリティ
 */

/** インタビューチャットページかどうかを判定（/interview/[slug]/chat, /preview/interview/[slug]/chat） */
export function isInterviewPage(pathname: string): boolean {
  return /\/interview\/[^/]+\/chat$/.test(pathname);
}

/** インタビューセクション（紹介ページ・チャット含む）かどうかを判定 */
export function isInterviewSection(pathname: string): boolean {
  return /\/interview\/[^/]+(\/|$)/.test(pathname);
}

/** インタビューページの URL からインタビューの slug（または id）を取り出す */
export function extractBillIdFromPath(pathname: string): string | null {
  const match = pathname.match(/\/interview\/([^/]+)/);
  return match ? match[1] : null;
}
