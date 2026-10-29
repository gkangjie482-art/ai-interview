import type { Database } from "@mirai-gikai/supabase";
import { z } from "zod";

export type Interview = Database["public"]["Tables"]["interviews"]["Row"];
export type InterviewInsert =
  Database["public"]["Tables"]["interviews"]["Insert"];
export type InterviewUpdate =
  Database["public"]["Tables"]["interviews"]["Update"];
export type InterviewPublishStatus = Interview["publish_status"];
export type InterviewOpenStatus = Interview["status"];

export const PUBLISH_STATUS_LABELS: Record<InterviewPublishStatus, string> = {
  draft: "下書き",
  published: "公開中",
};

export const OPEN_STATUS_LABELS: Record<InterviewOpenStatus, string> = {
  public: "募集中",
  closed: "募集終了",
};

/** slug に使える文字（URL の /interview/<slug>） */
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

/**
 * 基本情報（タイトル・説明・公開状態など）の入力スキーマ。
 * AIの動き（モード・モデル・質問など）は interview-config 側で扱う。
 */
export const interviewBasicSchema = z.object({
  name: z
    .string()
    .min(1, "タイトルは必須です")
    .max(200, "タイトルは200文字以内で入力してください"),
  slug: z
    .string()
    .min(1, "URL（slug）は必須です")
    .max(100, "URL（slug）は100文字以内で入力してください")
    .regex(
      SLUG_PATTERN,
      "半角の英小文字・数字・ハイフンで入力してください（先頭は英数字）"
    ),
  summary: z.string().max(400, "概要は400文字以内で入力してください"),
  description: z
    .string()
    .max(20_000, "紹介文は20,000文字以内で入力してください"),
  background: z
    .string()
    .max(40_000, "背景資料は40,000文字以内で入力してください"),
  thumbnail_url: z.string().nullable(),
  publish_status: z.enum(["draft", "published"]),
  status: z.enum(["public", "closed"]),
  is_featured: z.boolean(),
  featured_order: z
    .number()
    .int("整数で入力してください")
    .min(0, "0以上で入力してください")
    .max(999, "999以下で入力してください"),
  /** 締切（日本時間の "YYYY-MM-DDTHH:mm"、空欄なら締切なし） */
  closes_at: z.string(),
  show_prompt: z.boolean(),
});

export type InterviewBasicInput = z.infer<typeof interviewBasicSchema>;
