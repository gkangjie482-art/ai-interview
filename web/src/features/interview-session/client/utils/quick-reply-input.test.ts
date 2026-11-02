import { describe, expect, it } from "vitest";
import {
  isQuickReplySelected,
  selectSingleQuickReply,
  toggleQuickReply,
} from "./quick-reply-input";

describe("toggleQuickReply", () => {
  it("空の入力欄に選択肢を入れる", () => {
    expect(toggleQuickReply("", "賛成")).toBe("賛成");
  });

  it("複数選ぶと読点でつなぐ", () => {
    expect(toggleQuickReply("カレー", "肉じゃが")).toBe("カレー、肉じゃが");
  });

  it("手で書いた文章の後ろに足す", () => {
    expect(toggleQuickReply("迷いますが ", "カレー")).toBe(
      "迷いますが、カレー"
    );
  });

  it("もう一度選ぶと取り除く（先頭・途中・末尾）", () => {
    expect(toggleQuickReply("A、B、C", "A")).toBe("B、C");
    expect(toggleQuickReply("A、B、C", "B")).toBe("A、C");
    expect(toggleQuickReply("A、B、C", "C")).toBe("A、B");
    expect(toggleQuickReply("A", "A")).toBe("");
  });

  it("読点を含む選択肢も取り除ける", () => {
    expect(toggleQuickReply("はい、そうです、B", "はい、そうです")).toBe("B");
  });
});

describe("isQuickReplySelected", () => {
  it("1項目として入っていれば選択中", () => {
    expect(isQuickReplySelected("カレー、肉じゃが", "肉じゃが")).toBe(true);
    expect(isQuickReplySelected("カレー\n肉じゃが", "カレー")).toBe(true);
  });

  it("文章の一部に含まれるだけなら選択中にしない", () => {
    expect(isQuickReplySelected("やや賛成", "賛成")).toBe(false);
    expect(isQuickReplySelected("カレーが好き", "カレー")).toBe(false);
  });
});

describe("selectSingleQuickReply", () => {
  const replies = ["寿司", "ラーメン", "カレー"];

  it("別の選択肢を選ぶと入れ替わる", () => {
    expect(selectSingleQuickReply("寿司", "カレー", replies)).toBe("カレー");
  });

  it("手で書いた文章は残す", () => {
    expect(selectSingleQuickReply("迷います、寿司", "カレー", replies)).toBe(
      "迷います、カレー"
    );
  });

  it("同じ選択肢をもう一度選ぶと外れる", () => {
    expect(selectSingleQuickReply("寿司", "寿司", replies)).toBe("");
  });
});
