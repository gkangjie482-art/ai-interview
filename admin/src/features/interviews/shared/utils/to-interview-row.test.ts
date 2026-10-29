import { describe, expect, it } from "vitest";
import type { InterviewBasicInput } from "../types";
import { toInterviewRow } from "./to-interview-row";

const base: InterviewBasicInput = {
  name: " 子育てについて ",
  slug: "childcare",
  summary: "",
  description: "本文",
  background: "  ",
  thumbnail_url: null,
  publish_status: "draft",
  status: "public",
  is_featured: false,
  featured_order: 0,
  closes_at: "",
  show_prompt: true,
};

describe("toInterviewRow", () => {
  it("前後の空白を除き、空文字は null にする", () => {
    const row = toInterviewRow(base);
    expect(row.name).toBe("子育てについて");
    expect(row.summary).toBeNull();
    expect(row.description).toBe("本文");
    expect(row.background).toBeNull();
    expect(row.closes_at).toBeNull();
  });

  it("締切を ISO に変換する", () => {
    const row = toInterviewRow({ ...base, closes_at: "2026-10-31T23:59" });
    expect(row.closes_at).toBe("2026-10-31T14:59:00.000Z");
  });
});
