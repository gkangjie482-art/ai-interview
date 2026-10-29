import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteInterviewButton } from "@/features/interviews/client/components/delete-interview-button";
import { InterviewBasicForm } from "@/features/interviews/client/components/interview-basic-form";
import { InterviewTabs } from "@/features/interviews/client/components/interview-tabs";
import { PreviewButton } from "@/features/interviews/client/components/preview-button";
import { getInterviewById } from "@/features/interviews/server/loaders/get-interviews";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

interface InterviewEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewEditPage({
  params,
}: InterviewEditPageProps) {
  const { id } = await params;
  const interview = await getInterviewById(id);
  if (!interview) {
    notFound();
  }

  return (
    <div className="max-w-4xl">
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
        <h1 className="text-2xl font-bold text-gray-900">{interview.name}</h1>
        <div className="flex gap-2">
          <PreviewButton interviewId={interview.id} />
          <DeleteInterviewButton
            interviewId={interview.id}
            interviewName={interview.name}
          />
        </div>
      </div>
      <InterviewTabs interviewId={interview.id} current="edit" />
      <InterviewBasicForm interview={interview} />
    </div>
  );
}
