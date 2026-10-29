/**
 * web アプリの内部ルート定義
 *
 * app/ ディレクトリの page.tsx と 1:1 対応する。
 * Link href や router.push には必ずこのファイルの関数を使うこと。
 * 新しいページを追加したらここにもルートを追加し、テストを通すこと。
 *
 * インタビュー系のルートは slug で組み立てるが、ページ側は id でも解決できる
 * （getInterviewByKey 参照）。
 */

export const routes = {
  // ── 静的ルート ──────────────────────────────────────
  home: () => "/" as const,
  guide: () => "/guide" as const,
  about: () => "/about" as const,
  history: () => "/history" as const,
  terms: () => "/terms" as const,
  privacy: () => "/privacy" as const,

  // ── インタビュー ──────────────────────────────────
  interviewLP: (key: string) => `/interview/${key}` as const,
  interviewDisclosure: (key: string) => `/interview/${key}/disclosure` as const,
  interviewChat: (key: string) => `/interview/${key}/chat` as const,
  interviewSessions: (key: string) => `/interview/${key}/sessions` as const,

  // ── プレビュー（token 付き） ──────────────────────
  previewInterviewLP: (key: string, token: string) =>
    `/preview/interview/${key}?token=${encodeURIComponent(token)}` as const,
  previewInterviewDisclosure: (key: string, token: string) =>
    `/preview/interview/${key}/disclosure?token=${encodeURIComponent(token)}` as const,
  previewInterviewChat: (key: string, token: string) =>
    `/preview/interview/${key}/chat?token=${encodeURIComponent(token)}` as const,

  // ── レポート ──────────────────────────────────────
  publicReport: (reportId: string) => `/report/${reportId}` as const,
  reportComplete: (reportId: string) => `/report/${reportId}/complete` as const,
  legacyReportChatLog: (reportId: string) =>
    `/report/${reportId}/chat-log` as const,
} as const;
