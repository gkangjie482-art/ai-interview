/**
 * admin アプリの内部ルート定義
 *
 * app/ ディレクトリの page.tsx と 1:1 対応する。
 * Link href や router.push には必ずこのファイルの関数を使うこと。
 * 新しいページを追加したらここにもルートを追加し、テストを通すこと。
 */

// ── 静的ルート ──────────────────────────────────────
export const routes = {
  login: () => "/login" as const,
  admins: () => "/admins" as const,
  interviews: () => "/interviews" as const,
  interviewNew: () => "/interviews/new" as const,

  // ── インタビュー配下 ──────────────────────────────
  /** 基本情報（タイトル・説明・公開状態など）の編集 */
  interviewEdit: (interviewId: string) =>
    `/interviews/${interviewId}/edit` as const,
  /** AI設定・質問の編集 */
  interviewSettings: (interviewId: string) =>
    `/interviews/${interviewId}/settings` as const,

  // レポート
  // 旧スキーマでは「議案 × インタビュー設定」の2階層だったため、
  // 呼び出し側の互換として第2引数（設定ID = インタビューID）を受け取るが使わない。
  billReports: (interviewId: string, _configId?: string) =>
    `/interviews/${interviewId}/reports` as const,
  billReportsSearch: (interviewId: string, _configId?: string) =>
    `/interviews/${interviewId}/reports/search` as const,
  billReportDetail: (
    interviewId: string,
    _configId: string,
    sessionId: string
  ) => `/interviews/${interviewId}/reports/${sessionId}` as const,
} as const;
