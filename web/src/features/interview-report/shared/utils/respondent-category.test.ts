import { describe, expect, it } from "vitest";
import { mapRoleToCategory } from "./respondent-category";

describe("mapRoleToCategory", () => {
  it("role を4区分に変換する", () => {
    expect(mapRoleToCategory("daily_life_affected")).toBe("affected");
    expect(mapRoleToCategory("work_related")).toBe("industry");
    expect(mapRoleToCategory("subject_expert")).toBe("expert");
    expect(mapRoleToCategory("general_citizen")).toBe("citizen");
    expect(mapRoleToCategory(null)).toBe("citizen");
  });
});
