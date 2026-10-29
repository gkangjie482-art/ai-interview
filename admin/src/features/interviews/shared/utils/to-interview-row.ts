import type { InterviewBasicInput, InterviewUpdate } from "../types";
import { jstLocalToIso } from "./jst-datetime";

/**
 * フォーム入力を DB の列に変換する。空文字は null として保存する。
 */
export function toInterviewRow(input: InterviewBasicInput): InterviewUpdate {
  return {
    name: input.name.trim(),
    slug: input.slug.trim(),
    summary: input.summary.trim() || null,
    description: input.description.trim() || null,
    background: input.background.trim() || null,
    thumbnail_url: input.thumbnail_url,
    publish_status: input.publish_status,
    status: input.status,
    is_featured: input.is_featured,
    featured_order: input.featured_order,
    closes_at: jstLocalToIso(input.closes_at),
    show_prompt: input.show_prompt,
  };
}
