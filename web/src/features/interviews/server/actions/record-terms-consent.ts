"use server";

import { cookies } from "next/headers";
import {
  TERMS_CONSENT_COOKIE,
  TERMS_VERSION,
} from "../../shared/terms-consent";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** 利用規約・プライバシーポリシーに同意したことを Cookie に記録する */
export async function recordTermsConsent(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TERMS_CONSENT_COOKIE, TERMS_VERSION, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
}
