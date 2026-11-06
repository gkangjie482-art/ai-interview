import "server-only";

import { DEFAULT_INTERVIEW_CHAT_MODEL } from "@/lib/ai/models";
import { DisclosureBreadcrumb } from "../../shared/components/disclosure-breadcrumb";
import type { InterviewConfig } from "../loaders/get-interview";

interface InterviewDisclosurePageProps {
  billId: string;
  billName: string;
  interviewConfig: InterviewConfig;
  systemPrompt: string;
  summaryPrompt: string;
  previewToken?: string;
}

function StaticDisclosureSection() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold text-black leading-[1.5] my-4">
        AIインタビューに関する情報開示
      </h1>
      <div className="bg-white rounded-2xl p-6 space-y-4">
        <h2 className="text-[22px] font-bold text-black leading-[1.64]">
          AIインタビューの透明性および技術仕様に関する開示事項
        </h2>
        <div className="text-sm leading-[1.83] text-black space-y-4">
          <div>
            <p className="font-bold">
              AIインタビューの透明性と技術仕様について
            </p>
            <p className="mt-1">
              本インタビューの実施にあたり、公平性の確保および回答者との信頼関係に基づくAIとの共存を目的として、以下の通り技術仕様および運用方針を開示いたします。
            </p>
          </div>

          <div>
            <p className="font-bold">1. 実施目的</p>
            <p className="mt-1">
              本インタビューは、テーマについての一人ひとりの考えや経験を聞き取るために実施します。集めた回答は、チームみらい学生チームが活動の一環としてテーマについての集計や分析に利用し、チームみらいとも共有します。
            </p>
          </div>

          <div>
            <p className="font-bold">2. 透明性の担保（プロンプトの開示）</p>
            <p className="mt-1">
              AIがブラックボックス化することを回避し、回答者がAIの振る舞いを事前に確認できるよう、AIインタビューアーに設定されている全てのプロンプト（指示書）を以下の通り公開いたします。
            </p>
            <p className="mt-1">
              これにより、質問内容における誘導の有無や、特定の意図への偏りがないことを担保し、安心して参加いただける環境を整えています。
            </p>
          </div>

          <div>
            <p className="font-bold">3. 回答データの取り扱い</p>
            <p className="mt-1">
              収集された回答データの管理および活用については、以下の通り規定します。
            </p>
            <ul className="mt-2 space-y-2 list-none">
              <li>
                <span className="font-bold">外部のAIサービスへの送信：</span>
                入力内容は、外部のAIサービス事業者（Vercel AI Gateway を経由した
                OpenAI 等）に送信して処理します。OpenAI の API の規約では、API
                で送信したデータはモデルの学習に使われないことになっています。
              </li>
              <li>
                <span className="font-bold">活用の範囲：</span>
                回答内容は、このインタビューの集計と、AIを用いた分析に利用します。また、チームみらいと共有します。
              </li>
              <li>
                <span className="font-bold">分析プロセスの透明化：</span>
                AIを用いた分析手法およびそのプロセスについては、客観性を担保するため、適宜その詳細を開示するものとします。
              </li>
            </ul>

            <div className="mt-3">
              <p className="font-bold">回答の公開：</p>
              <p className="mt-1">
                提出された回答は、レポートとAIとのやりとりの全文が「AIインタビュー」上に匿名で掲載され、誰でも読める状態で公開されます。これにより、利用者間での意見の共有および議論の活性化を図ります。ただし、公開に適さない内容を含む回答は公開しません。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelSection({
  interviewConfig,
}: Pick<InterviewDisclosurePageProps, "interviewConfig">) {
  const chatModel = interviewConfig?.chat_model ?? DEFAULT_INTERVIEW_CHAT_MODEL;

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold text-black leading-[1.5]">
        使用モデル
      </h1>
      <div className="bg-white rounded-2xl p-6 space-y-2">
        <p className="text-sm leading-[1.83] text-black">
          対話エンジンには以下のモデルを採用しています。
        </p>
        <p className="text-sm leading-[1.83] text-black">
          モデル名称： {chatModel}
        </p>
      </div>
    </div>
  );
}

function PromptSection({
  billName,
  systemPrompt,
  summaryPrompt,
}: Pick<
  InterviewDisclosurePageProps,
  "billName" | "systemPrompt" | "summaryPrompt"
>) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold text-black leading-[1.5]">
        AIに与えられているプロンプト
      </h1>

      <div className="bg-white rounded-2xl p-6 space-y-4">
        <p className="text-[15px] font-normal text-black leading-[1.87]">
          {billName}に関するAIインタビューにおけるプロンプト
        </p>

        <div className="space-y-2">
          <p className="text-sm font-bold text-black">
            インタビュー用プロンプト（指示書）
          </p>
          <pre className="text-sm leading-[1.83] text-black whitespace-pre-wrap break-words">
            {systemPrompt}
          </pre>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-bold text-black">
            要約・レポート生成用プロンプト（指示書）
          </p>
          <p className="text-sm leading-[1.83] text-black">
            インタビュー終了後、回答内容をレポートにまとめる際にAIに与えられるプロンプトです。
          </p>
          <pre className="text-sm leading-[1.83] text-black whitespace-pre-wrap break-words">
            {summaryPrompt}
          </pre>
        </div>
      </div>
    </div>
  );
}

export function InterviewDisclosurePage({
  billId,
  previewToken,
  ...props
}: InterviewDisclosurePageProps) {
  return (
    <div className="flex flex-col gap-8 pb-8 bg-mirai-light-gradient">
      <div className="flex flex-col gap-8 px-4 pt-24 md:pt-12 max-w-[600px] mx-auto w-full">
        <DisclosureBreadcrumb billId={billId} previewToken={previewToken} />
        <StaticDisclosureSection />
        <ModelSection interviewConfig={props.interviewConfig} />
        <PromptSection
          billName={props.billName}
          systemPrompt={props.systemPrompt}
          summaryPrompt={props.summaryPrompt}
        />
        <DisclosureBreadcrumb billId={billId} previewToken={previewToken} />
      </div>
    </div>
  );
}
