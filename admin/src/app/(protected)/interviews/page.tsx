import { InterviewList } from "@/features/interviews/server/components/interview-list";

export const dynamic = "force-dynamic";

export default function InterviewsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">インタビュー管理</h1>
        <p className="mt-1 text-gray-600">
          インタビューの作成・公開・回答の確認ができます
        </p>
      </div>

      <InterviewList />
    </div>
  );
}
