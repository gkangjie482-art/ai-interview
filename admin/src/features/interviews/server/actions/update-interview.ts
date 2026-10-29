"use server";

import { revalidatePath } from "next/cache";
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
import {
  findInterviewById,
  updateInterviewById,
} from "../repositories/interview-repository";

/**
 * インタビューの基本情報を更新する
 */
export async function updateInterview(id: string, input: InterviewBasicInput) {
  try {
    await requireAdmin();
    const validated = interviewBasicSchema.parse(input);
    const current = await findInterviewById(id);
    if (!current) {
      throw new Error("インタビューが見つかりません");
    }
    const row = toInterviewRow(validated);
    // 初めて公開したときの日時を残す
    if (validated.publish_status === "published" && !current.published_at) {
      row.published_at = new Date().toISOString();
    }
    await updateInterviewById(id, row);
    await invalidateWebCache([WEB_CACHE_TAGS.INTERVIEWS]);
    revalidatePath(routes.interviews());
  } catch (error) {
    console.error("Update interview error:", error);
    throw new Error(
      getErrorMessage(error, "インタビューの更新中にエラーが発生しました")
    );
  }
}
