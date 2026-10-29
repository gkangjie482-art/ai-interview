"use server";

import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { env } from "@/lib/env";
import { buildPreviewUrl } from "@/lib/utils/build-preview-url";
import { findInterviewById } from "../repositories/interview-repository";
import { getOrCreatePreviewToken } from "../services/preview-token-service";

interface GeneratePreviewUrlResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * 公開前のインタビューを確認できるプレビューURLを発行する（30日有効）
 */
export async function generatePreviewUrl(
  interviewId: string
): Promise<GeneratePreviewUrlResult> {
  const admin = await requireAdmin();

  try {
    const interview = await findInterviewById(interviewId);
    if (!interview) {
      return { success: false, error: "インタビューが見つかりません" };
    }
    const { token } = await getOrCreatePreviewToken(
      interviewId,
      admin.email ?? admin.id
    );
    return {
      success: true,
      url: buildPreviewUrl(
        env.webUrl,
        `/preview/interview/${interview.slug}`,
        token
      ),
    };
  } catch (error) {
    console.error("Error generating preview URL:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}
