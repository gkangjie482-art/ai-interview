import { describe, expect, it } from "vitest";
import {
  extractBillIdFromPath,
  isInterviewPage,
  isInterviewSection,
} from "./page-layout-utils";

describe("isInterviewPage", () => {
  it("チャットページを判定する", () => {
    expect(isInterviewPage("/interview/childcare/chat")).toBe(true);
    expect(isInterviewPage("/preview/interview/childcare/chat")).toBe(true);
    expect(isInterviewPage("/interview/childcare")).toBe(false);
    expect(isInterviewPage("/")).toBe(false);
  });
});

describe("isInterviewSection", () => {
  it("インタビュー配下のページを判定する", () => {
    expect(isInterviewSection("/interview/childcare")).toBe(true);
    expect(isInterviewSection("/interview/childcare/sessions")).toBe(true);
    expect(isInterviewSection("/report/abc")).toBe(false);
  });
});

describe("extractBillIdFromPath", () => {
  it("slug を取り出す", () => {
    expect(extractBillIdFromPath("/interview/childcare/chat")).toBe(
      "childcare"
    );
    expect(extractBillIdFromPath("/history")).toBeNull();
  });
});
