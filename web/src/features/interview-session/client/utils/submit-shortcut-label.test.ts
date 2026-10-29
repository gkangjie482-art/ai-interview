import { describe, expect, it } from "vitest";
import { getSubmitShortcutLabel } from "./submit-shortcut-label";

describe("getSubmitShortcutLabel", () => {
  it("Mac では ⌘+Enter", () => {
    expect(getSubmitShortcutLabel("MacIntel")).toBe("⌘+Enter");
    expect(getSubmitShortcutLabel("macOS")).toBe("⌘+Enter");
  });

  it("それ以外は Ctrl+Enter", () => {
    expect(getSubmitShortcutLabel("Win32")).toBe("Ctrl+Enter");
    expect(getSubmitShortcutLabel("Linux x86_64")).toBe("Ctrl+Enter");
    expect(getSubmitShortcutLabel("")).toBe("Ctrl+Enter");
  });
});
