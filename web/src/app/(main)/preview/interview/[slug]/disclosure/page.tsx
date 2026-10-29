import { AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";
import { getInterviewAdmin as getBillByIdAdmin } from "@/features/interviews/server/loaders/get-interview";
import { validatePreviewToken } from "@/features/interviews/server/loaders/get-interview";
import { getInterviewConfigAdmin } from "@/features/interviews/server/loaders/get-interview";
import { loadDisclosureData } from "@/features/interviews/server/loaders/load-disclosure-data";
import { InterviewDisclosurePage } from "@/features/interviews/server/components/interview-disclosure-page";
import { env } from "@/lib/env";

interface DisclosurePreviewPageProps {
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

export default async function DisclosurePreviewPage({
  params,
  searchParams,
}: DisclosurePreviewPageProps) {
  const [{ slug: billId }, { token }] = await Promise.all([
    params,
    searchParams,
  ]);

  const interviewConfig = await getInterviewConfigAdmin(billId);
  if (!interviewConfig) {
    notFound();
  }

  const isValidToken = await validatePreviewToken(interviewConfig.id, token);
  if (!isValidToken) {
    notFound();
  }

  const disclosureData = await loadDisclosureData(interviewConfig);

  return (
    <>
      <PreviewBanner />
      <InterviewDisclosurePage {...disclosureData} previewToken={token} />
    </>
  );
}
