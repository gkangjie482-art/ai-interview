import "server-only";

import { randomBytes } from "node:crypto";
import {
  createPreviewToken,
  deletePreviewTokensByInterviewId,
  findPreviewToken,
} from "../repositories/interview-repository";

const TOKEN_TTL_DAYS = 30;

/**
 * プレビュー用トークンを取得し、なければ（または期限切れなら）新しく発行する
 */
export async function getOrCreatePreviewToken(
  interviewId: string,
  createdBy: string
): Promise<{ token: string; expiresAt: string }> {
  const existing = await findPreviewToken(interviewId);
  if (existing && new Date(existing.expires_at) > new Date()) {
    return { token: existing.token, expiresAt: existing.expires_at };
  }
  if (existing) {
    await deletePreviewTokensByInterviewId(interviewId);
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date();
  expires.setDate(expires.getDate() + TOKEN_TTL_DAYS);
  const expiresAt = expires.toISOString();
  await createPreviewToken({ interviewId, token, expiresAt, createdBy });
  return { token, expiresAt };
}
