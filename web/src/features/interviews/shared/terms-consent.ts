/**
 * 利用規約・プライバシーポリシーへの同意を記録する Cookie。
 * 規約を改定したら TERMS_VERSION を上げると、新しく回答を始める人に同意を取り直せる。
 */
export const TERMS_CONSENT_COOKIE = "interview_terms_consent";
export const TERMS_VERSION = "2026-11-07";

export function hasAgreedToCurrentTerms(cookieValue: string | undefined) {
  return cookieValue === TERMS_VERSION;
}
