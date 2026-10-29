import "server-only";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layouts/container";
import { InterviewLandingSection } from "@/features/interviews/client/components/interview-landing-section";
import { getInterview } from "@/features/interviews/server/loaders/get-interview";
import { getReportReactionsBatch } from "@/features/report-reaction/server/loaders/get-report-reactions";
import { routes } from "@/lib/routes";
import { PublicOpinionsList } from "../../client/components/public-opinions-list";
import { OpinionsBreadcrumb } from "../../shared/components/opinions-breadcrumb";
import type { SortOrder } from "../../shared/utils/sort-order";
import type { StanceFilter } from "../../shared/utils/stance-filter";
import { getInitialPublicReportsByBillId } from "../loaders/get-all-public-reports-by-bill-id";

interface PublicOpinionsPageProps {
  billId: string;
  initialFilter: StanceFilter;
  initialSort: SortOrder;
}

export async function PublicOpinionsPage({
  billId: interviewKey,
  initialFilter,
  initialSort,
}: PublicOpinionsPageProps) {
  const bill = await getInterview(interviewKey);

  if (!bill) {
    notFound();
  }

  const billId = bill.id;
  const billTitle = bill.name;
  const initialData = await getInitialPublicReportsByBillId(
    billId,
    initialFilter,
    initialSort
  );

  const reportIds = initialData.reports.map((r) => r.id);
  const reactionsMap = await getReportReactionsBatch(reportIds);
  const reactionsRecord: Record<
    string,
    { counts: { helpful: number; hmm: number }; userReaction: string | null }
  > = {};
  for (const [id, data] of reactionsMap) {
    reactionsRecord[id] = {
      counts: data.counts,
      userReaction: data.userReaction,
    };
  }

  return (
    <div className="min-h-dvh bg-mirai-surface">
      {/* ヒーロー画像 */}
      {bill.thumbnail_url && (
        <div className="relative w-full h-[200px] md:h-[320px]">
          <Image
            src={bill.thumbnail_url}
            alt={billTitle}
            fill
            className="object-cover"
          />
        </div>
      )}

      <Container>
        {/* インタビューのタイトル（紹介ページへのリンク） */}
        <div className="py-6">
          <p className="text-sm font-bold text-primary-accent">
            公開された会話
          </p>
          <Link href={routes.interviewLP(bill.slug)}>
            <h1 className="text-2xl font-bold leading-[1.5] text-black hover:underline">
              {billTitle}
            </h1>
          </Link>
        </div>

        {/* 意見一覧（フィルター付き・スクロールページネーション） */}
        <PublicOpinionsList
          billId={billId}
          initialReports={initialData.reports}
          initialReactionsRecord={reactionsRecord}
          stanceCounts={initialData.stanceCounts}
          initialHasMore={initialData.hasMore}
          initialFilter={initialFilter}
          initialSort={initialSort}
        />

        {/* AIインタビューCTAバナー */}
        {bill.status === "public" && (
          <div className="my-8">
            <InterviewLandingSection billId={billId} />
          </div>
        )}
        {/* パンくずリスト */}
        <div className="pb-8">
          <OpinionsBreadcrumb billId={billId} />
        </div>
      </Container>
    </div>
  );
}
