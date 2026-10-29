import { routes } from "@/lib/routes";

/** ヘッダーメニュー・デスクトップサイドバー共通のナビゲーション */
export const NAV_LINKS = [
  { label: "インタビュー一覧", href: routes.home() },
  { label: "はじめての方へ", href: routes.guide() },
  { label: "このサービスについて", href: routes.about() },
  { label: "回答履歴", href: routes.history() },
] as const;
