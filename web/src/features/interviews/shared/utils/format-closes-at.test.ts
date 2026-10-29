import { describe, expect, it } from "vitest";
import { formatClosesAt } from "./format-closes-at";

describe("formatClosesAt", () => {
  it("日本時間で年月日と時刻を返す", () => {
    expect(formatClosesAt("2026-10-31T14:59:00Z")).toBe("2026/10/31 23:59");
  });

  it("未設定・不正な値は null", () => {
    expect(formatClosesAt(null)).toBeNull();
    expect(formatClosesAt("not-a-date")).toBeNull();
  });
});
