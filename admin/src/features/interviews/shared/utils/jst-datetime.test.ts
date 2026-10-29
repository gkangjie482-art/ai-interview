import { describe, expect, it } from "vitest";
import { isoToJstLocal, jstLocalToIso } from "./jst-datetime";

describe("jstLocalToIso", () => {
  it("日本時間として解釈して ISO にする", () => {
    expect(jstLocalToIso("2026-10-31T23:59")).toBe("2026-10-31T14:59:00.000Z");
  });

  it("空欄・不正値は null", () => {
    expect(jstLocalToIso("")).toBeNull();
    expect(jstLocalToIso("not-a-date")).toBeNull();
  });
});

describe("isoToJstLocal", () => {
  it("ISO を日本時間の datetime-local 値にする", () => {
    expect(isoToJstLocal("2026-10-31T14:59:00.000Z")).toBe("2026-10-31T23:59");
  });

  it("null は空欄", () => {
    expect(isoToJstLocal(null)).toBe("");
  });

  it("往復で値が変わらない", () => {
    expect(isoToJstLocal(jstLocalToIso("2027-01-01T00:00"))).toBe(
      "2027-01-01T00:00"
    );
  });
});
