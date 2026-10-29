"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { routes } from "@/lib/routes";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import {
  type InterviewBasicInput,
  interviewBasicSchema,
} from "../../shared/types";
import { toInterviewRow } from "../../shared/utils/to-interview-row";
import { insertInterview } from "../repositories/interview-repository";

/**
 * インタビューを作成し、続けてAI設定・質問の画面へ移動する
 */
export async function createInterview(input: InterviewBasicInput) {
  let id: string;
  try {
    await requireAdmin();
    const validated = interviewBasicSchema.parse(input);
    const row = toInterviewRow(validated);
    const created = await insertInterview({
      ...row,
      name: validated.name.trim(),
      slug: validated.slug.trim(),
      published_at:
        validated.publish_status === "published"
          ? new Date().toISOString()
          : null,
    });
    id = created.id;
    await invalidateWebCache([WEB_CACHE_TAGS.INTERVIEWS]);
  } catch (error) {
    console.error("Create interview error:", error);
    throw new Error(
      getErrorMessage(error, "インタビューの作成中にエラーが発生しました")
    );
  }

  redirect(routes.interviewSettings(id));
}
