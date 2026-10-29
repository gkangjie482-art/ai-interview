import type { Database } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  countPublicReportsByInterviewIds,
  findInterviewByKey,
  findInterviewMetrics,
  findPreviewToken,
  findPublishedInterviews,
} from "../repositories/interview-repository";

export type Interview = Database["public"]["Tables"]["interviews"]["Row"];
/** インタビューの設定（AIモード・モデル・所要時間など）。interviews 行そのもの。 */
export type InterviewConfig = Interview;

export type InterviewListItem = Interview & { publicReportCount: number };

/**
 * 公開済みのインタビューを slug または id で取得する
 */
export async function getInterview(key: string): Promise<Interview | null> {
  return _getCachedInterview(key);
}

const _getCachedInterview = unstable_cache(
  async (key: string): Promise<Interview | null> => {
    try {
      return await findInterviewByKey(key, { publishedOnly: true });
    } catch (error) {
      console.error("Failed to fetch interview:", error);
      return null;
    }
  },
  ["interview-by-key"],
  { revalidate: 600, tags: [CACHE_TAGS.INTERVIEWS] }
);

/**
 * 下書きを含めてインタビューを取得する（プレビュー用）
 */
export async function getInterviewAdmin(
  key: string
): Promise<Interview | null> {
  return _getCachedInterviewAdmin(key);
}

const _getCachedInterviewAdmin = unstable_cache(
  async (key: string): Promise<Interview | null> => {
    try {
      return await findInterviewByKey(key, { publishedOnly: false });
    } catch (error) {
      console.error("Failed to fetch interview (admin):", error);
      return null;
    }
  },
  ["interview-by-key-admin"],
  // 非公開設定をプレビューするので短めに
  { revalidate: 60, tags: [CACHE_TAGS.INTERVIEWS] }
);

/**
 * 回答を受け付けている（公開済み かつ 募集中）インタビューの設定を取得する
 */
export async function getInterviewConfig(
  interviewId: string
): Promise<InterviewConfig | null> {
  const interview = await getInterview(interviewId);
  return interview?.status === "public" ? interview : null;
}

/**
 * プレビュー用：公開状態・募集状態を問わずインタビューの設定を取得する
 */
export async function getInterviewConfigAdmin(
  interviewId: string
): Promise<InterviewConfig | null> {
  return getInterviewAdmin(interviewId);
}

/**
 * 公開済みインタビューの一覧（公開された会話の件数つき）
 */
export async function getInterviewList(): Promise<InterviewListItem[]> {
  return _getCachedInterviewList();
}

const _getCachedInterviewList = unstable_cache(
  async (): Promise<InterviewListItem[]> => {
    const interviews = await findPublishedInterviews();
    const counts = await countPublicReportsByInterviewIds(
      interviews.map((i) => i.id)
    );
    return interviews.map((i) => ({
      ...i,
      publicReportCount: counts.get(i.id) ?? 0,
    }));
  },
  ["interview-list"],
  {
    revalidate: 300,
    tags: [CACHE_TAGS.INTERVIEWS, CACHE_TAGS.PUBLIC_INTERVIEW_REPORTS],
  }
);

export type InterviewMetrics = {
  conductedCount: number;
  completedCount: number;
  publicCount: number;
};

/**
 * 回答者数・最後まで回答した数・公開された会話の数
 */
export async function getInterviewMetrics(
  interviewId: string
): Promise<InterviewMetrics> {
  return _getCachedInterviewMetrics(interviewId);
}

const _getCachedInterviewMetrics = unstable_cache(
  async (interviewId: string): Promise<InterviewMetrics> => {
    try {
      const m = await findInterviewMetrics(interviewId);
      return {
        conductedCount: Number(m?.conducted_count ?? 0),
        completedCount: Number(m?.completed_count ?? 0),
        publicCount: Number(m?.public_count ?? 0),
      };
    } catch (error) {
      console.error("Failed to fetch interview metrics:", error);
      return { conductedCount: 0, completedCount: 0, publicCount: 0 };
    }
  },
  ["interview-metrics"],
  {
    revalidate: 300,
    tags: [CACHE_TAGS.INTERVIEWS, CACHE_TAGS.PUBLIC_INTERVIEW_REPORTS],
  }
);

/**
 * プレビュートークンが有効か
 */
export async function validatePreviewToken(
  interviewId: string,
  token?: string
): Promise<boolean> {
  if (!token) {
    return false;
  }
  try {
    const data = await findPreviewToken(interviewId, token);
    return !!data && new Date(data.expires_at) > new Date();
  } catch (error) {
    console.error("Error validating preview token:", error);
    return false;
  }
}

/**
 * インタビュー行を、プロンプト構築関数（@mirai-gikai/shared の interview-prompts）が
 * 受け取る形に変換する。
 * - title    : インタビューのタイトル
 * - summary  : 一覧・紹介用の短い説明
 * - content  : 紹介ページ本文（テーマの説明）
 * - knowledge_source : AIにだけ渡す背景資料
 */
export function toPromptTopic(interview: Interview | null) {
  if (!interview) return null;
  return {
    name: interview.name,
    knowledge_source: interview.background,
    bill_content: {
      title: interview.name,
      summary: interview.summary,
      content: interview.description,
    },
  };
}

export type PromptTopic = ReturnType<typeof toPromptTopic>;

/** 公開済みインタビューを、プロンプト用の形で取得する */
export async function getPromptTopic(interviewId: string) {
  return toPromptTopic(await getInterview(interviewId));
}

/** 下書きを含めて、プロンプト用の形で取得する（プレビュー用） */
export async function getPromptTopicAdmin(interviewId: string) {
  return toPromptTopic(await getInterviewAdmin(interviewId));
}
