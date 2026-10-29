import { describe, expect, it } from "vitest";
import { countByStatus, filterInterviews } from "./filter-interviews";

const items = [
  {
    name: "子育て支援について",
    summary: "保育園の課題",
    status: "public" as const,
  },
  { name: "防災の備え", summary: null, status: "closed" as const },
  { name: "地域の交通", summary: "バスの本数", status: "public" as const },
];

describe("filterInterviews", () => {
  it("募集状況で絞り込む", () => {
    expect(filterInterviews(items, "open", "").map((i) => i.name)).toEqual([
      "子育て支援について",
      "地域の交通",
    ]);
    expect(filterInterviews(items, "closed", "")).toHaveLength(1);
    expect(filterInterviews(items, "all", "")).toHaveLength(3);
  });

  it("キーワード（スペース区切りはAND）で名前と概要を検索する", () => {
    expect(filterInterviews(items, "all", "保育園")).toHaveLength(1);
    expect(filterInterviews(items, "all", "地域 バス")).toHaveLength(1);
    expect(filterInterviews(items, "all", "地域 保育園")).toHaveLength(0);
  });
});

describe("countByStatus", () => {
  it("件数を数える", () => {
    expect(countByStatus(items)).toEqual({ all: 3, open: 2, closed: 1 });
  });
});
