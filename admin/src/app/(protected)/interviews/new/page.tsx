import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { InterviewBasicForm } from "@/features/interviews/client/components/interview-basic-form";
import { routes } from "@/lib/routes";

export default function InterviewNewPage() {
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
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        インタビューを作成
      </h1>
      <p className="mb-6 text-gray-600">
        まず基本情報を入力してください。次の画面でAIの設定と質問を登録します。
      </p>
      <InterviewBasicForm />
    </div>
  );
}
