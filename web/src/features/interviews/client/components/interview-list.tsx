"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { InterviewListItem } from "../../server/loaders/get-interview";
import {
  countByStatus,
  filterInterviews,
  type InterviewStatusFilter,
} from "../../shared/utils/filter-interviews";
import { InterviewCard } from "./interview-card";

const FILTER_LABELS: Record<InterviewStatusFilter, string> = {
  all: "すべて",
  open: "募集中",
  closed: "終了",
};

/**
 * インタビュー一覧（募集状況の絞り込み・キーワード検索つき）
 */
export function InterviewList({
  interviews,
}: {
  interviews: InterviewListItem[];
}) {
  const [status, setStatus] = useState<InterviewStatusFilter>("all");
  const [keyword, setKeyword] = useState("");
  const counts = useMemo(() => countByStatus(interviews), [interviews]);
  const filtered = useMemo(
    () => filterInterviews(interviews, status, keyword),
    [interviews, status, keyword]
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="募集状況で絞り込み"
      >
        {(Object.keys(FILTER_LABELS) as InterviewStatusFilter[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={status === key}
            onClick={() => setStatus(key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-bold",
              status === key
                ? "border-primary bg-primary text-white"
                : "border-mirai-border bg-white text-black hover:bg-mirai-surface"
            )}
          >
            {FILTER_LABELS[key]}
            <span className="ml-1 text-xs font-normal">{counts[key]}</span>
          </button>
        ))}
      </div>
      <label className="relative block">
        <span className="sr-only">インタビューをキーワードで検索</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-mirai-text-muted" />
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="インタビューをキーワードで検索"
          className="h-11 w-full rounded-full border border-mirai-border bg-white pl-10 pr-4 text-sm outline-none focus:border-primary"
        />
      </label>
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filtered.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-mirai-text-secondary">
          該当するインタビューはありません。
        </p>
      )}
    </div>
  );
}
