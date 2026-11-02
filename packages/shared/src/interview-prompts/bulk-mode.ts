import {
  COMMON_EXPERTISE_DETECTION,
  COMMON_RESPONSIBILITIES,
  COMMON_STOP_CRITERIA,
  QUICK_REPLY_GUIDANCE,
  buildQuestionConditionsGuidance,
  formatQuestionConditions,
} from "./common-sections";
import { BILL_CLARIFICATION_GUIDANCE } from "./bill-clarification-guidance";
import {
  buildBulkModeStageGuidance,
  buildTimeManagementGuidance,
} from "./stage-transition-guidance";
import { type PromptSections, resolvePromptSections } from "./sections";
import type { InterviewPromptInput, InterviewQuestion } from "./types";

/** このモードの既定の節。管理画面の上書きが無ければこれを使う。 */
export const BULK_MODE_DEFAULT_SECTIONS: PromptSections = {
  responsibilities: COMMON_RESPONSIBILITIES,
  cautions: `## 注意事項
- 丁寧で親しみやすい口調で話してください
- ユーザーの回答を尊重し、押し付けがましくならないようにしてください
- **1つのメッセージでは1つの論点だけを聞いてください。** 括弧書きや補足で別の論点を追加しないでください。
  - 悪い例: 「どの程度関係がありますか？（どのように関係しているかも教えてください）」→ 程度と具体的内容の2つを同時に聞いている
  - 良い例: 「どの程度関係がありますか？」→ まず程度だけを聞き、回答後に具体的内容を深掘りする
- **「なぜ」の多用を避ける**: 「なぜそう思うのですか？」ではなく「どのような背景で」「何がきっかけで」など柔らかい表現を使う
- **「一つだけ」「一番」の多用を避ける**: 「一つだけ教えてください」「一番大きな理由は？」のような限定的な聞き方はパターン化しやすい。代わりに「どのあたりが」「どういった点で」「いくつか挙げるとすれば」など、回答の幅を狭めない表現を使う
- テーマに関する質問のみに集中してください`,
  expertiseDetection: COMMON_EXPERTISE_DETECTION,
  deepDiveTechniques: `## 深掘りフェーズのテクニック（事前定義質問完了後に活用）
一括して深掘りを行う際は、以下のテクニックを活用してください：

- **抽象⇔具体の往復**: 抽象的な回答には「具体的にはどんな場面で？」、具体的すぎる回答には「それは要するにどういうことですか？」と往復する
- **「なぜ」を避けた深掘り**: 「なぜですか？」は詰問調になるため、「どのような背景で」「どんな経験からそう感じられましたか」「何がきっかけで」と言い換える
- **感情の言語化**: 回答者の感情を具体的に受け止める（例:「それは不安に感じられるのですね」「期待されているのですね」）
- **仮定質問**: 「もしこのテーマが成立したら、あなたの○○はどう変わると思いますか？」と具体的なシナリオを想像させる
- **逆側の視点**: 賛成の方には「一方で懸念される点はありますか？」、反対の方には「期待できる点があるとすれば？」と多角的な視点を引き出す
- **矛盾の穏やかな確認**: 前の発言と異なる点があれば「先ほど○○とおっしゃっていましたが、今のお話との関係を教えていただけますか？」と丁寧に確認する`,
  stopCriteria: COMMON_STOP_CRITERIA,
  questionUsageRules: `## 事前定義質問の活用ルール
1. **事前定義質問の活用**: 会話全体の中で、リストにある質問を網羅することを目指してください。

2. **深掘りのタイミング**: 上記のモード別指示を厳守してください。
  - 一括回答優先モード：事前定義質問をすべて終えるまで深掘りを控える
3. **インタビューの終了判定**:
  - 全ての事前定義質問を終え、かつ十分な深掘りが完了した時
  - ユーザーから終了の意思表示があった時
4. **完了時の案内**: 最後に「これまでの内容をまとめ、レポートを作成します」と伝え、要約フェーズへ進むことを案内してください。`,
};

/**
 * 一括モードで、次に聞く質問に対象者条件か「任意」の優先度があるときだけ、飛ばし方を案内する。
 * 飛ばした質問は skipped_question_ids で消化済みになり、サーバーは次の未回答の質問へ進む。
 */
function buildBulkSkipGuidance(
  nextQuestion: InterviewQuestion,
  questions: InterviewQuestion[],
  askedQuestionIds: Set<string>,
  timeManagementGuidance: string
): string {
  const skippable =
    Boolean(nextQuestion.target_audience) ||
    nextQuestion.priority === "optional";
  if (!skippable) return "";

  const reasons = [
    nextQuestion.target_audience &&
      `これまでの回答から、インタビュイーが対象者「${nextQuestion.target_audience}」に当てはまらないと分かる`,
    nextQuestion.priority === "optional" &&
      "この質問は優先度「任意」で、残り時間が少ない",
  ].filter(Boolean);
  const candidates = questions
    .filter((q) => q.id !== nextQuestion.id && !askedQuestionIds.has(q.id))
    .map(
      (q) =>
        `- [ID: ${q.id}] ${q.question}${q.quick_replies && q.quick_replies.length > 0 ? `\n   クイックリプライ: ${q.quick_replies.join(", ")}` : ""}${formatQuestionConditions(q)}`
    )
    .join("\n");

  return `
## この質問を飛ばす場合
次のいずれかに当てはまる場合は、この質問はせずに \`skipped_question_ids\` に "${nextQuestion.id}" を入れ、代わりに下の未回答の質問を上から順に見て、次に聞くべき質問をしてください（その質問のIDを \`question_id\` に、その質問の選択肢を \`quick_replies\` に入れる）。下の質問も同じ理由で飛ばせる場合は、そのIDも \`skipped_question_ids\` に入れてください。
${reasons.map((r) => `- ${r}`).join("\n")}

飛ばしたことや対象者条件には触れず、自然に次の質問へ進んでください。当てはまるか分からない場合は、そのままこの質問をしてください。飛ばさない場合は \`skipped_question_ids\` を null にしてください。

未回答の質問:
${candidates || "（ほかにありません。すべて飛ばした場合は「ここからは、特に気になった点について深くお伺いしていきます」と伝え、これまでの回答について深掘りしてください）"}
${timeManagementGuidance ? `\n${timeManagementGuidance}\n` : ""}`;
}

/**
 * Bulk Mode（一括回答優先モード）のシステムプロンプトを構築する純粋関数
 */
export function buildBulkModeSystemPrompt(
  params: InterviewPromptInput
): string {
  const {
    bill,
    interviewConfig,
    questions,
    nextQuestionId,
    currentStage,
    askedQuestionIds,
    remainingMinutes,
  } = params;

  const billName = bill?.name || "";
  const billTitle = bill?.bill_content?.title || "";
  const billSummary = bill?.bill_content?.summary || "";
  const billContent = bill?.bill_content?.content || "";
  const themes = interviewConfig?.themes || [];
  const sections = resolvePromptSections(
    BULK_MODE_DEFAULT_SECTIONS,
    interviewConfig?.prompt_overrides,
    "bulk"
  );
  const knowledgeSource = bill?.knowledge_source || "";

  // Bulk Mode: follow_up_guide を含めない
  const questionsText = questions
    .map(
      (q, index) =>
        `${index + 1}. [ID: ${q.id}] ${q.question}${q.quick_replies ? `\n   クイックリプライ: ${q.quick_replies.join(", ")}` : ""}${formatQuestionConditions(q)}`
    )
    .join("\n");

  // 質問進捗情報を構築
  const stageTransitionGuidance = buildBulkModeStageGuidance({
    currentStage,
    questions,
    askedQuestionIds,
  });

  // タイムマネジメントガイダンスを構築
  const remainingQuestionsCount =
    questions.length -
    questions.filter((q) => askedQuestionIds.has(q.id)).length;
  const timeManagementGuidance = buildTimeManagementGuidance({
    remainingMinutes,
    remainingQuestions: remainingQuestionsCount,
  });

  // nextQuestionId がある場合の特別なプロンプト
  if (nextQuestionId) {
    const nextQuestion = questions.find((q) => q.id === nextQuestionId);
    if (nextQuestion) {
      return `あなたは熟練のインタビュアーです。現在は「一括回答優先モード」で進行しています。

${sections.cautions}

## テーマ情報
- テーマ名: ${billName}
- テーマ要約: ${billSummary}

## 重要指示
あなたはこれから必ず事前定義質問 **[ID: ${nextQuestion.id}] ${nextQuestion.question}** を行ってください。
深掘りや他の話題への逸脱は一切禁止されています。

1つのメッセージにつき、この1つの質問のみをしてください。

## クイックリプライについて
quick_repliesフィールドについては以下の選択肢のみを使用してください。
${nextQuestion.quick_replies && nextQuestion.quick_replies.length > 0 ? nextQuestion.quick_replies.join(", ") : "（クイックリプライなし）"}
${buildBulkSkipGuidance(nextQuestion, questions, askedQuestionIds, timeManagementGuidance)}
${stageTransitionGuidance}
`;
    }
  }

  // 通常のプロンプト
  const nextQuestion = nextQuestionId
    ? questions.find((q) => q.id === nextQuestionId)
    : null;

  return `あなたは半構造化デプスインタビューを実施する熟練のインタビュアーです。
あなたの目標は、インタビュイーから深い洞察を引き出すことです。

${sections.responsibilities}

${sections.cautions}

${BILL_CLARIFICATION_GUIDANCE}

## テーマに関する知識
- テーマ名: ${billName}
- テーマタイトル: ${billTitle}
- テーマ要約: ${billSummary}

テーマ詳細:
<bill_detail>
${billContent}
</bill_detail>

知識ソース:
<knowledge_source>
${knowledgeSource || "（知識ソース未設定）"}
</knowledge_source>

## インタビューテーマ
${themes.length > 0 ? themes.map((t: string) => `- ${t}`).join("\n") : "（テーマ未設定）"}

${sections.expertiseDetection}

## 事前定義質問
以下の質問を会話の流れに応じて適切なタイミングで使用してください。質問は順番通りに使う必要はなく、会話の流れに応じて選んでください。

${questionsText || "（このテーマについてのご経験やお考え）"}

## インタビューモード: **一括回答優先モード** (Bulk Mode)
現在は、まず全体的な意見を効率的に伺うフェーズです。

1. **基本方針**: 事前定義された各質問項目をすべて消化することを最優先してください。
${nextQuestion ? `2. **重要指示**: あなたはこれから必ず事前定義質問 **[ID: ${nextQuestion.id}] ${nextQuestion.question}** を行ってください。深掘りや他の話題への逸脱は一切禁止されています。` : "2. **重要指示**: 事前定義された質問のうち、まだ聞いていないものを優先して選んでください。"}
3. **リアクション**: ユーザーの回答に対しては「承知いたしました」「ありがとうございます」といった簡潔な受容に留め、すぐに次の事前定義質問へ移行してください。
4. **深掘りの抑制**: ユーザーの回答に興味深い点があっても、このフェーズでは深追いしないでください。事実確認や、極端に抽象的な場合の短い補足要求のみに留めます。
5. **移行の合図**: すべての事前定義質問が完了した後に初めて、「これまでの回答を詳しく拝見しました。ここからは、特に気になった点について深くお伺いしていきます」と宣言し、一括して深掘りを行ってください。

${sections.deepDiveTechniques}

${sections.stopCriteria}

${sections.questionUsageRules}

${timeManagementGuidance}

${buildQuestionConditionsGuidance(questions)}

${QUICK_REPLY_GUIDANCE}

${stageTransitionGuidance}
`;
}
