"use server";

import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import {
  type InterviewConfigInput,
  interviewConfigSchema,
} from "../../shared/types";
import { normalizePromptOverrides } from "../../shared/utils/normalize-prompt-overrides";
import { updateInterviewConfigRecord } from "../repositories/interview-config-repository";

export type InterviewConfigResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string };

/**
 * インタビューのAI設定（モード・モデル・所要時間・質問テーマ・プロンプト上書き）を更新する
 */
export async function updateInterviewConfig(
  interviewId: string,
  input: InterviewConfigInput
): Promise<InterviewConfigResult> {
  try {
    await requireAdmin();

    const validatedData = interviewConfigSchema.parse(input);

    /*
      prompt_overrides を渡さない呼び出し元があるため、未指定なら列に触らない。
      渡した場合だけ更新する。ここを常に上書きにすると、テーマ確定など
      プロンプトと無関係な更新で編集内容が黙って消える。
    */
    const data = await updateInterviewConfigRecord(interviewId, {
      mode: validatedData.mode,
      themes: validatedData.themes || null,
      chat_model: validatedData.chat_model || null,
      estimated_duration: validatedData.estimated_duration ?? null,
      ...(validatedData.prompt_overrides === undefined
        ? {}
        : {
            prompt_overrides: normalizePromptOverrides(
              validatedData.prompt_overrides
            ),
          }),
      updated_at: new Date().toISOString(),
    });

    await invalidateWebCache([WEB_CACHE_TAGS.INTERVIEWS]);

    return { success: true, data: { id: data.id } };
  } catch (error) {
    console.error("Update interview config error:", error);
    return {
      success: false,
      error: getErrorMessage(
        error,
        "インタビュー設定の更新中にエラーが発生しました"
      ),
    };
  }
}
