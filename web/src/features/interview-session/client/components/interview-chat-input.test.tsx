// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InterviewChatInput } from "./interview-chat-input";

function renderInput() {
  render(
    <InterviewChatInput
      input="こんにちは"
      onInputChange={vi.fn()}
      onSubmit={vi.fn()}
      placeholder="入力してください"
      isResponding={false}
    />
  );
  const textarea = screen.getByPlaceholderText(
    "入力してください"
  ) as HTMLTextAreaElement;
  const form = textarea.closest("form") as HTMLFormElement;
  const requestSubmit = vi.fn();
  form.requestSubmit = requestSubmit;
  return { textarea, requestSubmit };
}

describe("InterviewChatInput", () => {
  it("Enter キーでは送信しない（改行になる）", () => {
    const { textarea, requestSubmit } = renderInput();
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });
    expect(requestSubmit).not.toHaveBeenCalled();
  });

  it("送信は送信ボタンで行う", () => {
    renderInput();
    const button = screen.getByRole("button", { name: "送信" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toBeEnabled();
  });
});
