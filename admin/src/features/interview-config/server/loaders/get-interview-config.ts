import type { InterviewConfig } from "../../shared/types";
import { findInterviewConfigById } from "../repositories/interview-config-repository";

/**
 * インタビューIDからインタビュー設定（interviews 行）を取得する
 */
export async function getInterviewConfigById(
  configId: string
): Promise<InterviewConfig | null> {
  try {
    return await findInterviewConfigById(configId);
  } catch (error) {
    console.error("Failed to fetch interview config:", error);
    return null;
  }
}
