const SEPARATOR = "、";
const isBoundary = (char: string | undefined) =>
  char === undefined || char === SEPARATOR || char === "\n";

/** 入力欄の中で、選択肢が1項目として書かれている位置を探す（「賛成」は「やや賛成」に一致させない） */
function findQuickReply(input: string, reply: string): number {
  let index = input.indexOf(reply);
  while (index !== -1) {
    if (
      isBoundary(input[index - 1]) &&
      isBoundary(input[index + reply.length])
    ) {
      return index;
    }
    index = input.indexOf(reply, index + 1);
  }
  return -1;
}

/** 選択肢が入力欄に入っているか。入力欄の文章を選択状態の正とするので、手で消せば選択も外れる */
export function isQuickReplySelected(input: string, reply: string): boolean {
  return findQuickReply(input, reply) !== -1;
}

/** 選択肢を入力欄の文章に足す。すでに入っていれば取り除く */
export function toggleQuickReply(input: string, reply: string): string {
  const index = findQuickReply(input, reply);
  if (index !== -1) {
    const end = index + reply.length;
    return input[end] !== undefined
      ? input.slice(0, index) + input.slice(end + 1)
      : input.slice(0, Math.max(index - 1, 0));
  }
  const text = input.trimEnd();
  return !text || isBoundary(text.at(-1))
    ? `${text}${reply}`
    : `${text}${SEPARATOR}${reply}`;
}

/** 単一選択の質問用。別の選択肢に切り替えると前の選択肢を入力欄から取り除く */
export function selectSingleQuickReply(
  input: string,
  reply: string,
  replies: string[]
): string {
  if (isQuickReplySelected(input, reply)) {
    return toggleQuickReply(input, reply);
  }
  const cleared = replies.reduce(
    (text, other) =>
      isQuickReplySelected(text, other) ? toggleQuickReply(text, other) : text,
    input
  );
  return toggleQuickReply(cleared, reply);
}
