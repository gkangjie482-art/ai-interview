export type InterviewStatusFilter = "all" | "open" | "closed";

type FilterableInterview = {
  name: string;
  summary: string | null;
  status: "public" | "closed";
};

/**
 * 募集状況とキーワードでインタビュー一覧を絞り込む
 */
export function filterInterviews<T extends FilterableInterview>(
  interviews: T[],
  status: InterviewStatusFilter,
  keyword: string
): T[] {
  const terms = keyword.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return interviews.filter((i) => {
    if (status === "open" && i.status !== "public") return false;
    if (status === "closed" && i.status !== "closed") return false;
    const text = `${i.name} ${i.summary ?? ""}`.toLowerCase();
    return terms.every((t) => text.includes(t));
  });
}

/** 募集状況ごとの件数 */
export function countByStatus(interviews: FilterableInterview[]) {
  const open = interviews.filter((i) => i.status === "public").length;
  return { all: interviews.length, open, closed: interviews.length - open };
}
