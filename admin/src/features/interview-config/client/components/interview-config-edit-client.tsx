"use client";

import type { PromptOverridesByMode } from "@mirai-gikai/shared/interview-prompts/sections";
import type { InterviewMode } from "@mirai-gikai/shared/interview-prompts/types";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { saveInterviewQuestions } from "../../server/actions/save-interview-questions";
import { updateInterviewConfig } from "../../server/actions/upsert-interview-config";
import type {
  InterviewConfig,
  InterviewQuestion,
  InterviewQuestionInput,
} from "../../shared/types";
import { ConfigGenerationChat } from "./config-generation-chat";
import { InterviewConfigForm } from "./interview-config-form";
import { InterviewQuestionList } from "./interview-question-list";

interface InterviewConfigEditClientProps {
  billId: string;
  config: InterviewConfig;
  questions: InterviewQuestion[];
}

export function InterviewConfigEditClient({
  billId,
  config: initialConfig,
  questions,
}: InterviewConfigEditClientProps) {
  const router = useRouter();
  const configId = initialConfig.id;
  const [aiGeneratedThemes, setAiGeneratedThemes] = useState<string[] | null>(
    null
  );
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<
    InterviewQuestionInput[] | null
  >(null);

  // フォームの値を取得するためのref
  const getFormValuesRef = useRef<
    | (() => {
        name: string;
        mode: string;
        themes: string[];
        chat_model: string | null;
        estimated_duration: number | null;
        prompt_overrides: PromptOverridesByMode;
      })
    | null
  >(null);
  /** 質問・テーマを保存する先（インタビューは必ず作成済み） */
  const createConfigIfNeeded = useCallback(
    async (_themes: string[]): Promise<string | null> => configId,
    [configId]
  );

  // 質問確定時: configがなければ先に作成してから質問を保存する（テーマ未確定でもOK）
  const handleQuestionsConfirmed = useCallback(
    async (confirmedQuestions: InterviewQuestionInput[]) => {
      const targetConfigId = await createConfigIfNeeded([]);
      if (!targetConfigId) return;

      const result = await saveInterviewQuestions(
        targetConfigId,
        confirmedQuestions
      );
      if (result.success) {
        setAiGeneratedQuestions(confirmedQuestions);
        toast.success(`${confirmedQuestions.length}件の質問を保存しました`);
        router.refresh();
      } else {
        toast.error(result.error || "質問の保存に失敗しました");
      }
    },
    [createConfigIfNeeded, router]
  );

  // テーマ確定時: configがなければ作成、あれば更新
  const handleThemesConfirmed = useCallback(
    async (themes: string[]) => {
      // ref を優先して参照することで、state 更新待ちの間に二重作成されるのを防ぐ
      const targetConfigId = await createConfigIfNeeded(themes);
      if (!targetConfigId) return;

      // 既存 / 直前に作成済みだった場合はテーマを上書き更新（create は themes=[] で呼ばれる場合がある）
      // create と同じフォールバックを使って、未入力時に name/mode が空で上書きされるのを防ぐ。
      const formValues = getFormValuesRef.current?.();
      const result = await updateInterviewConfig(targetConfigId, {
        mode:
          (formValues?.mode as InterviewMode) || initialConfig?.mode || "loop",
        themes,
        chat_model: formValues?.chat_model ?? initialConfig?.chat_model ?? null,
        estimated_duration:
          formValues?.estimated_duration ??
          initialConfig?.estimated_duration ??
          null,
        // 取得できないときは undefined のまま送り、保存済みの文面を残す
        prompt_overrides: formValues?.prompt_overrides,
      });
      if (result.success) {
        setAiGeneratedThemes(themes);
      } else {
        toast.error(result.error || "テーマの更新に失敗しました");
      }
    },
    [createConfigIfNeeded, initialConfig]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左カラム: フォーム */}
      <div className="space-y-6">
        <InterviewConfigForm
          config={initialConfig}
          aiGeneratedThemes={aiGeneratedThemes}
          onAiThemesApplied={() => setAiGeneratedThemes(null)}
          getFormValuesRef={getFormValuesRef}
        />
        {configId ? (
          <InterviewQuestionList
            interviewConfigId={configId}
            questions={questions}
            aiGeneratedQuestions={aiGeneratedQuestions}
            onAiQuestionsApplied={() => setAiGeneratedQuestions(null)}
          />
        ) : (
          aiGeneratedQuestions &&
          aiGeneratedQuestions.length > 0 && (
            <AiQuestionsPreview questions={aiGeneratedQuestions} />
          )
        )}
      </div>

      {/* 右カラム: AI 設定生成チャット */}
      <div>
        <ConfigGenerationChat
          billId={configId}
          configId={configId}
          existingThemes={initialConfig?.themes ?? undefined}
          existingQuestions={questions.map((q) => ({
            question: q.question,
            follow_up_guide: q.follow_up_guide ?? undefined,
            quick_replies: q.quick_replies ?? undefined,
          }))}
          onQuestionsConfirmed={handleQuestionsConfirmed}
          onThemesConfirmed={handleThemesConfirmed}
        />
      </div>
    </div>
  );
}

/** 新規作成時のAI生成質問プレビュー */
function AiQuestionsPreview({
  questions,
}: {
  questions: InterviewQuestionInput[];
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">
              AI生成質問プレビュー ({questions.length}件)
            </h3>
          </div>
          <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded mb-4">
            設定を保存すると、以下の質問が登録されます。
          </p>
          <div className="space-y-3">
            {questions.map((question, index) => (
              <Card
                key={`preview-${index}-${question.question?.slice(0, 10) ?? ""}`}
              >
                <CardContent className="py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        Q{index + 1}
                      </span>
                      <div className="font-semibold text-gray-900">
                        {question.question}
                      </div>
                    </div>
                    {question.follow_up_guide && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">フォローアップ指針:</span>{" "}
                        {question.follow_up_guide}
                      </div>
                    )}
                    {question.quick_replies &&
                      question.quick_replies.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">クイックリプライ:</span>{" "}
                          {question.quick_replies.join(", ")}
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
