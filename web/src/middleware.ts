import { type NextRequest, NextResponse } from "next/server";
import {
  createUnauthorizedResponse,
  getBasicAuthConfig,
  validateBasicAuth,
} from "./lib/basic-auth";
import { updateSupabaseSession } from "./lib/supabase/middleware";

/**
 * 開発用プレビュー（/dev 配下）のルートか判定する。
 * 単純な startsWith("/dev") だと /developers 等の通常ページまで
 * 巻き込むため、完全一致か "/dev/" 配下のみを対象にする。
 */
export function isDevRoute(pathname: string): boolean {
  return pathname === "/dev" || pathname.startsWith("/dev/");
}

export async function middleware(request: NextRequest) {
  // /dev routes: 本番では404、開発ではauthスキップ
  if (isDevRoute(request.nextUrl.pathname)) {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }
    return NextResponse.next();
  }

  // Supabaseセッションをリフレッシュ（トークン期限切れ時に自動更新）
  const response = await updateSupabaseSession(request);

  const authConfig = getBasicAuthConfig();

  // Basic認証の設定がない場合はスキップ
  if (!authConfig) {
    return response;
  }

  // HTML ナビゲーションだけ認証（画像やJSON, css/js, fetch等は通す）
  if (!_isHtmlRequest(request)) return response;

  // Basic認証の検証
  if (validateBasicAuth(request, authConfig)) {
    return response;
  }

  return createUnauthorizedResponse();
}

export function isHtmlAcceptHeader(accept: string): boolean {
  return accept.includes("text/html");
}

function _isHtmlRequest(request: NextRequest) {
  const accept = request.headers.get("accept") || "";
  return isHtmlAcceptHeader(accept);
}

export const config = {
  matcher: [
    /*
     * _next/static, _next/image, favicon.ico, 画像ファイル等の
     * 静的アセットを除外し、ページリクエストのみでミドルウェアを実行する
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
