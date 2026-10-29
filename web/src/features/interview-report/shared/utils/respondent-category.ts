/** 回答者の区分（レポートの role から決まる表示用の4区分） */
export type RespondentCategory = "affected" | "industry" | "expert" | "citizen";

export const respondentCategoryLabels: Record<RespondentCategory, string> = {
  affected: "当事者",
  industry: "事業者",
  expert: "専門家",
  citizen: "市民",
};

/**
 * カテゴリ別アイコン色のテキストカラークラス。
 * globals.css の @theme で定義したトークンを参照する。
 */
export const respondentCategoryColorClass: Record<RespondentCategory, string> =
  {
    affected: "text-topic-affected",
    industry: "text-topic-industry",
    expert: "text-topic-expert",
    citizen: "text-topic-citizen",
  };

/** interview_report.role を表示用の区分に変換する */
export function mapRoleToCategory(role: string | null): RespondentCategory {
  switch (role) {
    case "daily_life_affected":
      return "affected";
    case "work_related":
      return "industry";
    case "subject_expert":
      return "expert";
    default:
      return "citizen";
  }
}
