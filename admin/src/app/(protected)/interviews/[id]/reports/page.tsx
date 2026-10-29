import { ArrowLeft, Search } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getInterviewById as getBillById } from "@/features/interviews/server/loaders/get-interviews";
import { BatchModerationButton } from "@/features/interview-reports/client/components/batch-moderation-button";
import { BatchPublishButton } from "@/features/interview-reports/client/components/batch-publish-button";
import { CopyTsvButton } from "@/features/interview-reports/client/components/copy-tsv-button";
import { InterviewStatistics } from "@/features/interview-reports/server/components/interview-statistics";
import { QuestionAnswerCounts } from "@/features/interview-reports/server/components/question-answer-counts";
import { SessionList } from "@/features/interview-reports/server/components/session-list";
import {
  getInterviewSessions,
  getInterviewSessionsCount,
} from "@/features/interview-reports/server/loaders/get-interview-sessions";
import { getInterviewStatistics } from "@/features/interview-reports/server/loaders/get-interview-statistics";
import { getQuestionAnswerCounts } from "@/features/interview-reports/server/loaders/get-question-answer-counts";
import { parseSessionFilterParams } from "@/features/interview-reports/shared/utils/parse-session-filter-params";
import { parseSessionSortParams } from "@/features/interview-reports/shared/utils/parse-session-sort-params";
import { InterviewTabs } from "@/features/interviews/client/components/interview-tabs";
import { routes } from "@/lib/routes";

interface ReportsPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    order?: string;
    status?: string;
    visibility?: string;
    stance?: string;
    role?: string;
    moderation?: string;
  }>;
}

export default async function ReportsPage({
  params,
  searchParams,
}: ReportsPageProps) {
  const { id } = await params;
  // インタビューIDとインタビュー設定IDは同じ（旧スキーマの名残で両方の名前を使う）
  const configId = id;
  const { page, sort, order, status, visibility, stance, role, moderation } =
    await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const sortConfig = parseSessionSortParams(sort, order);
  const filterConfig = parseSessionFilterParams(
    status,
    visibility,
    stance,
    role,
    moderation
  );

  const [bill, sessions, totalCount, statistics, questionAnswerCounts] =
    await Promise.all([
      getBillById(id),
      getInterviewSessions(configId, currentPage, sortConfig, filterConfig),
      getInterviewSessionsCount(configId, filterConfig),
      getInterviewStatistics(configId),
      getQuestionAnswerCounts(configId),
    ]);

  if (!bill) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={routes.interviews() as Route}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          一覧に戻る
        </Link>
      </div>

      <InterviewTabs interviewId={id} current="reports" />

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">回答一覧</h1>
          <p className="text-gray-600 mt-1">「{bill.name}」に寄せられた回答</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={routes.billReportsSearch(id, configId) as Route}>
              <Search className="h-4 w-4" />
              発言検索
            </Link>
          </Button>
          <CopyTsvButton billId={id} configId={configId} />
          <BatchPublishButton billId={id} configId={configId} />
          <BatchModerationButton />
        </div>
      </div>

      {statistics && (
        <div className="mb-6">
          <InterviewStatistics statistics={statistics} />
        </div>
      )}

      {questionAnswerCounts.length > 0 && (
        <div className="mb-6">
          <QuestionAnswerCounts counts={questionAnswerCounts} />
        </div>
      )}

      <SessionList
        billId={id}
        configId={configId}
        sessions={sessions}
        totalCount={totalCount}
        currentPage={currentPage}
        sort={sortConfig}
        filters={filterConfig}
      />
    </div>
  );
}
