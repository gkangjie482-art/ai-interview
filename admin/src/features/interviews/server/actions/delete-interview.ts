"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { routes } from "@/lib/routes";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { softDeleteInterviewById } from "../repositories/interview-repository";

/**
 * インタビューを削除する（論理削除。回答データは残る）
 */
export async function deleteInterview(id: string) {
  try {
    await requireAdmin();
    await softDeleteInterviewById(id);
    await invalidateWebCache([
      WEB_CACHE_TAGS.INTERVIEWS,
      WEB_CACHE_TAGS.PUBLIC_INTERVIEW_REPORTS,
    ]);
    revalidatePath(routes.interviews());
  } catch (error) {
    console.error("Delete interview error:", error);
    throw new Error(
      getErrorMessage(error, "インタビューの削除中にエラーが発生しました")
    );
  }
}
