import { describe, expect, it } from "vitest";
import {
  buildQuestionConditionsGuidance,
  formatQuestionConditions,
} from "./common-sections";

describe("formatQuestionConditions", () => {
  it("必須・任意と対象者を添える", () => {
    expect(
      formatQuestionConditions({ priority: "required", target_audience: "学生" })
    ).toBe("\n   優先度: 必須\n   対象者: 学生");
    expect(formatQuestionConditions({ priority: "optional" })).toBe(
      "\n   優先度: 任意"
    );
  });

  it("通常・条件なしなら何も足さない", () => {
    expect(formatQuestionConditions({ priority: "normal" })).toBe("");
    expect(formatQuestionConditions({})).toBe("");
  });

  it("対象者を別の行で出すモードでは対象者を省ける", () => {
    expect(
      formatQuestionConditions(
        { target_audience: "学生" },
        { includeAudience: false }
      )
    ).toBe("");
  });
});

describe("buildQuestionConditionsGuidance", () => {
  it("優先度も対象者条件もなければ案内を出さない", () => {
    expect(
      buildQuestionConditionsGuidance([{ priority: "normal" }, {}])
    ).toBe("");
  });

  it("どれかに設定があれば案内を出す", () => {
    expect(
      buildQuestionConditionsGuidance([{ priority: "required" }])
    ).toContain("skipped_question_ids");
  });
});
