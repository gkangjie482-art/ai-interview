import { AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";
import { InterviewLPPage } from "@/features/interviews/client/components/interview-lp-page";
import {
  getInterviewAdmin,
  validatePreviewToken,
} from "@/features/interviews/server/loaders/get-interview";
import { loadInterviewLPData } from "@/features/interviews/server/loaders/load-interview-lp-data";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

interface InterviewPreviewPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

function PreviewBanner() {
  return (
    <div className="sticky top-0 z-50 bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              プレビューモード - このインタビューは一般公開されていません
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href={`${env.adminUrl}/interviews`}
              className="text-yellow-700 hover:text-yellow-900 underline"
            >
              管理画面に戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function InterviewPreviewPage({
  params,
  searchParams,
}: InterviewPreviewPageProps) {
  const [{ slug }, { token }] = await Promise.all([params, searchParams]);

  // 管理者用ローダー（下書き・募集終了も取得可能）
  const interview = await getInterviewAdmin(slug);
  if (!interview) {
    notFound();
  }

  // トークン検証
  const isValidToken = await validatePreviewToken(interview.id, token);
  if (!isValidToken) {
    notFound();
  }

  const data = await loadInterviewLPData(interview);

  return (
    <>
      <PreviewBanner />
      <InterviewLPPage interview={interview} previewToken={token} {...data} />
    </>
  );
}
