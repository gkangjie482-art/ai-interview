import "server-only";

import { convertToModelMessages, Output, streamText } from "ai";
import { getInterviewById } from "@/features/interviews/server/loaders/get-interviews";
import { AI_MODELS } from "@/lib/ai/models";
import { injectJsonFields } from "@/lib/stream/inject-json-fields";
import {
  type ConfigGenerationStage,
  defaultQuestionsGenerationSchema,
  questionProposalSchema,
  themeProposalSchema,
} from "../../shared/schemas";
import { buildConfigGenerationPrompt } from "../utils/build-config-generation-prompt";

interface ExistingQuestion {
  question: string;
  follow_up_guide?: string | null;
  quick_replies?: string[] | null;
}

interface HandleConfigGenerationParams {
  messages: Array<{ role: string; content: string }>;
  billId: string;
  stage: ConfigGenerationStage;
  existingThemes?: string[];
  existingQuestions?: ExistingQuestion[];
  confirmedQuestions?: ExistingQuestion[];
}

export async function handleConfigGeneration({
  messages,
  billId,
  stage,
  existingThemes,
  existingQuestions,
  confirmedQuestions,
}: HandleConfigGenerationParams) {
  const interview = await getInterviewById(billId);

  if (!interview) {
    throw new Error("Interview not found");
  }

  const systemPrompt = buildConfigGenerationPrompt({
    billName: interview.name,
    billTitle: interview.name,
    billSummary: interview.summary || "",
    billContent: interview.description || "",
    stage,
    knowledgeSource: interview.background ?? undefined,
    existingThemes,
    existingQuestions,
    confirmedQuestions,
  });

  const initialUserMessage =
    stage === "default_questions"
      ? "テーマの内容を分析して、topics（Q1の論点選択肢）とstance（Q2の立場選択肢）を生成してください。"
      : stage === "theme_proposal"
        ? "確定した質問とテーマの内容をもとに、テーマを提案してください。"
        : "質問を提案・ブラッシュアップしてください。";

  const effectiveMessages =
    messages.length === 0
      ? [{ role: "user" as const, content: initialUserMessage }]
      : messages;

  const uiMessages = effectiveMessages.map((message) => ({
    role: message.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: message.content }],
  }));

  const modelMessages = await convertToModelMessages(uiMessages);

  const onError = (error: unknown) => {
    console.error("LLM generation error:", error);
  };

  const result =
    stage === "default_questions"
      ? streamText({
          model: AI_MODELS.gpt5_2,
          system: systemPrompt,
          messages: modelMessages,
          output: Output.object({ schema: defaultQuestionsGenerationSchema }),
          onError,
        })
      : stage === "theme_proposal"
        ? streamText({
            model: AI_MODELS.gpt5_2,
            system: systemPrompt,
            messages: modelMessages,
            output: Output.object({ schema: themeProposalSchema }),
            onError,
          })
        : streamText({
            model: AI_MODELS.gpt5_2,
            system: systemPrompt,
            messages: modelMessages,
            output: Output.object({ schema: questionProposalSchema }),
            onError,
          });

  // ストリームにstageを注入
  const transformedStream = injectJsonFields(result.textStream, {
    stage,
  });

  return new Response(transformedStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
