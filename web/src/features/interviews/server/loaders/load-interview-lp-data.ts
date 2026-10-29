import "server-only";

import { getPublicReportsByBillId } from "@/features/interview-report/server/loaders/get-public-reports-by-bill-id";
import { getUserReportsByInterviewConfig } from "@/features/interview-report/server/loaders/get-user-reports-by-interview-config";
import { getLatestInterviewSession } from "@/features/interview-session/server/loaders/get-latest-interview-session";
import { parseMarkdown } from "@/lib/markdown";
import { type Interview, getInterviewMetrics } from "./get-interview";

/**
 * インタビュー紹介ページの表示に必要なデータをまとめて取得する
 */
export async function loadInterviewLPData(interview: Interview) {
  const [sessionInfo, userReports, metrics, publicReports, descriptionElement] =
    await Promise.all([
      getLatestInterviewSession(interview.id),
      getUserReportsByInterviewConfig(interview.id),
      getInterviewMetrics(interview.id),
      getPublicReportsByBillId(interview.id).catch((error) => {
        console.error("Failed to fetch public reports:", error);
        return { reports: [], totalCount: 0 };
      }),
      interview.description ? parseMarkdown(interview.description) : null,
    ]);

  return {
    sessionInfo,
    userReports,
    metrics,
    publicReports: publicReports.reports,
    descriptionElement,
  };
}
