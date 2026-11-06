// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InterviewConsentModal } from "./interview-consent-modal";

const push = vi.fn();
const recordTermsConsent = vi.fn().mockResolvedValue(undefined);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("../../server/actions/record-terms-consent", () => ({
  recordTermsConsent: () => recordTermsConsent(),
}));

function renderModal() {
  render(<InterviewConsentModal open onOpenChange={vi.fn()} billId="bill-1" />);
}

describe("InterviewConsentModal", () => {
  it("開始前モーダルにはオープンデータ提供の告知を表示しない", () => {
    renderModal();

    expect(
      screen.queryByText(/第三者にオープンデータとして提供されることがあります/)
    ).toBeNull();
    expect(
      screen.queryByRole("link", {
        name: "AIインタビューデータ利用規約",
      })
    ).toBeNull();
  });

  it("利用規約とプライバシーポリシーの本文を表示する", () => {
    renderModal();

    expect(screen.getByText("第1条（本サービスの内容）")).toBeInTheDocument();
    expect(screen.getByText("1. 個人情報の定義")).toBeInTheDocument();
  });

  it("両方にチェックを入れるまで開始ボタンが無効", async () => {
    const user = userEvent.setup();
    renderModal();

    const startButton = screen.getByRole("button", {
      name: /同意してはじめる/,
    });
    expect(startButton).toBeDisabled();

    await user.click(
      screen.getByRole("checkbox", { name: "利用規約に同意する" })
    );
    expect(startButton).toBeDisabled();

    await user.click(
      screen.getByRole("checkbox", { name: "プライバシーポリシーに同意する" })
    );
    expect(startButton).toBeEnabled();
  });

  it("同意すると同意を記録してからチャットへ進む", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(
      screen.getByRole("checkbox", { name: "利用規約に同意する" })
    );
    await user.click(
      screen.getByRole("checkbox", { name: "プライバシーポリシーに同意する" })
    );
    await user.click(screen.getByRole("button", { name: /同意してはじめる/ }));

    expect(recordTermsConsent).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/interview/bill-1/chat");
  });
});
