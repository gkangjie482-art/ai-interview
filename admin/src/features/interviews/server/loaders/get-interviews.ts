import "server-only";

import {
  countSessionsByInterviewIds,
  findInterviewById,
  findInterviews,
} from "../repositories/interview-repository";

/** 管理画面の一覧用（回答数つき） */
export async function getInterviewsWithCounts() {
  const interviews = await findInterviews();
  const counts = await countSessionsByInterviewIds(interviews.map((i) => i.id));
  return interviews.map((i) => ({
    ...i,
    sessionCount: counts.get(i.id) ?? 0,
  }));
}

export async function getInterviewById(id: string) {
  return findInterviewById(id);
}
