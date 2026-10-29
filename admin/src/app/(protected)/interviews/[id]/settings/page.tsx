import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InterviewConfigEditClient } from "@/features/interview-config/client/components/interview-config-edit-client";
import { getInterviewConfigById } from "@/features/interview-config/server/loaders/get-interview-config";
import { getInterviewQuestions } from "@/features/interview-config/server/loaders/get-interview-questions";
import { InterviewTabs } from "@/features/interviews/client/components/interview-tabs";
import { PreviewButton } from "@/features/interviews/client/components/preview-button";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

interface InterviewSettingsPageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewSettingsPage({
  params,
}: InterviewSettingsPageProps) {
  const { id } = await params;
  const config = await getInterviewConfigById(id);

  if (!config || config.deleted_at) {
    notFound();
  }

  const questions = await getInterviewQuestions(config.id);

  return (
    <div>
      <div className="mb-6">
        <Link
          href={routes.interviews()}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          一覧に戻る
        </Link>
      </div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{config.name}</h1>
          <p className="mt-1 text-gray-600">
            AIの聞き方（モード・モデル・所要時間・質問テーマ）と質問を設定します。右側のAIと相談しながら作ることもできます。
          </p>
        </div>
        <PreviewButton interviewId={config.id} />
      </div>
      <InterviewTabs interviewId={config.id} current="settings" />

      <InterviewConfigEditClient
        billId={config.id}
        config={config}
        questions={questions}
      />
    </div>
  );
}
