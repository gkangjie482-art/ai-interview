import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  adminClient,
  createTestUser,
  cleanupTestUser,
  createTestInterviewData,
  cleanupTestBill,
  type TestUser,
} from "@test-utils/utils";
import { completeInterviewSession } from "./complete-interview-session";

const contentRichness = {
  total: 70,
  clarity: 80,
  specificity: 60,
  impact: 70,
  constructiveness: 65,
  reasoning: "明確な意見表明があり、具体的な理由も述べられている",
};

// interviewChatWithReportSchema に準拠したレポートデータ
const validReportMessage = JSON.stringify({
  text: "インタビューのまとめです。",
  report: {
    summary: "テスト法案に賛成の立場",
    stance: "for",
    role: "general_citizen",
    role_description: "一般市民として法案に関心がある",
    role_title: "会社員",
    opinions: [
      {
        title: "賛成の理由",
        content: "社会全体の利益になると考える",
        source_message_id: null,
        contextual_quote: "（法案について）社会全体の利益になると思う",
        bill_sentiment: "期待",
      },
    ],
    content_richness: contentRichness,
  },
});

// 2件の意見を持つレポート（dual-write の縮小・id安定性検証用）
function buildReportMessage(
  opinions: Array<{
    title: string;
    content: string;
    source_message_id: string | null;
    contextual_quote?: string | null;
    bill_sentiment?: "期待" | "懸念" | null;
  }>
): string {
  return JSON.stringify({
    text: "インタビューのまとめです。",
    report: {
      summary: "テスト法案に賛成の立場",
      stance: "for",
      role: "general_citizen",
      role_description: "一般市民として法案に関心がある",
      role_title: "会社員",
      opinions: opinions.map((o) => ({
        contextual_quote: null,
        bill_sentiment: null,
        ...o,
      })),
      content_richness: contentRichness,
    },
  });
}

describe("completeInterviewSession 統合テスト", () => {
  let testUser: TestUser;
  let sessionId: string;
  let billId: string;

  beforeEach(async () => {
    testUser = await createTestUser();
    const data = await createTestInterviewData(testUser.id);
    sessionId = data.session.id;
    billId = data.bill.id;
  });

  afterEach(async () => {
    await cleanupTestBill(billId);
    await cleanupTestUser(testUser.id);
  });

  it("レポート入りメッセージからセッションを完了できる", async () => {
    // assistant メッセージ（レポート付き）を作成
    await adminClient.from("interview_messages").insert([
      {
        interview_session_id: sessionId,
        role: "user",
        content: "この法案に賛成です",
      },
      {
        interview_session_id: sessionId,
        role: "assistant",
        content: validReportMessage,
      },
    ]);

    const report = await completeInterviewSession({ sessionId });

    // 戻り値を検証
    expect(report.interview_session_id).toBe(sessionId);
    expect(report.summary).toBe("テスト法案に賛成の立場");
    expect(report.stance).toBe("for");
    expect(report.role).toBe("general_citizen");

    // DB 状態を検証: レポートが保存されていること
    const { data: dbReport } = await adminClient
      .from("interview_report")
      .select("*")
      .eq("interview_session_id", sessionId)
      .single();

    expect(dbReport).toBeTruthy();
    expect(dbReport?.summary).toBe("テスト法案に賛成の立場");
    expect(dbReport?.stance).toBe("for");

    // DB 状態を検証: セッションが completed になっていること
    const { data: dbSession } = await adminClient
      .from("interview_sessions")
      .select("completed_at")
      .eq("id", sessionId)
      .single();

    expect(dbSession?.completed_at).toBeTruthy();
  });

  it("意見はレポートの opinions（JSONB）に保存される", async () => {
    await adminClient.from("interview_messages").insert({
      interview_session_id: sessionId,
      role: "assistant",
      content: buildReportMessage([
        { title: "意見A", content: "内容A", source_message_id: null },
        { title: "意見B", content: "内容B", source_message_id: null },
      ]),
    });

    const report = await completeInterviewSession({ sessionId });
    const opinions = report.opinions as Array<{ title: string }>;
    expect(opinions.map((o) => o.title)).toEqual(["意見A", "意見B"]);
  });

  it("レポートが見つからない場合はエラーを throw する", async () => {
    // レポートなしのメッセージのみ
    await adminClient.from("interview_messages").insert([
      {
        interview_session_id: sessionId,
        role: "user",
        content: "普通のメッセージ",
      },
      {
        interview_session_id: sessionId,
        role: "assistant",
        content: "普通の応答メッセージ",
      },
    ]);

    await expect(completeInterviewSession({ sessionId })).rejects.toThrow(
      "No report found in conversation messages"
    );

    // DB 状態を検証: セッションが completed になっていないこと
    const { data: dbSession } = await adminClient
      .from("interview_sessions")
      .select("completed_at")
      .eq("id", sessionId)
      .single();

    expect(dbSession?.completed_at).toBeNull();

    // DB 状態を検証: レポートが作成されていないこと
    const { data: dbReport } = await adminClient
      .from("interview_report")
      .select("*")
      .eq("interview_session_id", sessionId);

    expect(dbReport).toHaveLength(0);
  });

  it("複数の assistant メッセージがある場合、最新のレポートを使う", async () => {
    // 古い assistant メッセージ（レポートなし）→ 新しい assistant メッセージ（レポートあり）
    await adminClient.from("interview_messages").insert([
      {
        interview_session_id: sessionId,
        role: "assistant",
        content: "最初の質問です",
      },
      {
        interview_session_id: sessionId,
        role: "user",
        content: "回答です",
      },
      {
        interview_session_id: sessionId,
        role: "assistant",
        content: validReportMessage,
      },
    ]);

    const report = await completeInterviewSession({ sessionId });
    expect(report.summary).toBe("テスト法案に賛成の立場");
  });
});
