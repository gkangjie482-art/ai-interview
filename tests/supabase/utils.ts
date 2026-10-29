import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../packages/supabase/types/supabase.types";

// ── 環境変数（`.env` または CI が供給。`npx supabase status` で確認） ──
const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54421";
const SECRET_KEY = requireEnv("SUPABASE_SECRET_KEY");
const PUBLISHABLE_KEY = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `環境変数 ${name} が未設定です。ローカル実行時は \`.env\` をコピーし、\`npx supabase status\` で値を確認してください。`
    );
  }
  return value;
}

// ── クライアント ──
/** secret key クライアント（RLS バイパス） */
export const adminClient = createClient<Database>(SUPABASE_URL, SECRET_KEY);

/** publishable key クライアント（RLS 適用） */
export function getAnonClient() {
  return createClient<Database>(SUPABASE_URL, PUBLISHABLE_KEY);
}

/** 認証済みクライアントを取得 */
export async function getAuthenticatedClient(email: string, password: string) {
  const client = createClient<Database>(SUPABASE_URL, PUBLISHABLE_KEY);
  const { error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(`サインイン失敗: ${error.message}`);
  return client;
}

// ── テストユーザー管理 ──
export type TestUser = {
  id: string;
  email: string;
  password: string;
};

/** admin 権限を持つテストユーザーを作成 */
export async function createTestAdminUser(
  email = `test-admin-${Date.now()}@example.com`,
  password = "test-password-123"
): Promise<TestUser> {
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { roles: ["admin"] },
  });
  if (error) throw new Error(`admin ユーザー作成失敗: ${error.message}`);
  return { id: data.user.id, email, password };
}

/** 一般テストユーザーを作成 */
export async function createTestUser(
  email = `test-user-${Date.now()}@example.com`,
  password = "test-password-123"
): Promise<TestUser> {
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`ユーザー作成失敗: ${error.message}`);
  return { id: data.user.id, email, password };
}

/** テストユーザーを削除 */
export async function cleanupTestUser(userId: string): Promise<void> {
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) {
    console.warn(`ユーザー ${userId} の削除失敗: ${error.message}`);
  }
}

// ── テストデータ作成ヘルパー ──
/**
 * テスト用インタビューを作成（既定は下書き・募集中）。
 * 旧スキーマの bills と interview_configs を統合したもの。関数名は既存テストとの互換のため据え置き。
 */
export async function createTestBill(
  overrides: Partial<{
    name: string;
    slug: string;
    publish_status: "draft" | "published";
    status: "public" | "closed";
    is_featured: boolean;
    mode: "loop" | "bulk" | "targeted";
    summary: string;
    description: string;
    background: string;
    themes: string[];
    estimated_duration: number;
    deleted_at: string | null;
  }> = {}
) {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const defaults = {
    name: `テストインタビュー ${unique}`,
    slug: `test-${unique}`,
    publish_status: "draft" as const,
    status: "public" as const,
    ...overrides,
  };
  const { data, error } = await adminClient
    .from("interviews")
    .insert(defaults)
    .select()
    .single();
  if (error) throw new Error(`interview 作成失敗: ${error.message}`);
  return data;
}

/** テスト用インタビューを作成（createTestBill の別名） */
export const createTestInterview = createTestBill;

/** テスト用インタビューを削除（CASCADE で関連データも削除） */
export async function cleanupTestBill(billId: string): Promise<void> {
  await adminClient.from("interviews").delete().eq("id", billId);
}

/**
 * テスト用インタビューデータを一括作成
 * interview → interview_session の階層。bill と config は同じインタビュー行を指す。
 */
export async function createTestInterviewData(userId: string) {
  const interview = await createTestBill({ publish_status: "published" });

  const { data: session, error: sessionError } = await adminClient
    .from("interview_sessions")
    .insert({
      interview_id: interview.id,
      user_id: userId,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (sessionError || !session)
    throw new Error(`interview_session 作成失敗: ${sessionError?.message}`);

  return { bill: interview, config: interview, session };
}

/** テスト用 preview_tokens を作成 */
export async function createTestPreviewToken(
  billId: string,
  overrides: Partial<{
    token: string;
    expires_at: string;
  }> = {}
) {
  const defaults = {
    interview_id: billId,
    token: `test-token-${Date.now()}`,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
  const { data, error } = await adminClient
    .from("preview_tokens")
    .insert(defaults)
    .select()
    .single();
  if (error) throw new Error(`preview_tokens 作成失敗: ${error.message}`);
  return data;
}

/** テスト用インタビューメッセージを作成 */
export async function createTestInterviewMessages(
  sessionId: string,
  count: number
) {
  const messages = Array.from({ length: count }, (_, i) => ({
    interview_session_id: sessionId,
    role: (i % 2 === 0 ? "assistant" : "user") as "assistant" | "user",
    content: `テストメッセージ ${i + 1}`,
  }));

  const { data, error } = await adminClient
    .from("interview_messages")
    .insert(messages)
    .select();
  if (error) throw new Error(`interview_messages 作成失敗: ${error.message}`);
  return data;
}
