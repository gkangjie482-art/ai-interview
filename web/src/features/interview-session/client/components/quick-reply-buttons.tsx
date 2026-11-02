"use client";

import { isQuickReplySelected } from "../utils/quick-reply-input";

interface QuickReplyButtonsProps {
  replies: string[];
  input: string;
  allowMultiple: boolean;
  onSelect: (reply: string) => void;
  disabled?: boolean;
}

export function QuickReplyButtons({
  replies,
  input,
  allowMultiple,
  onSelect,
  disabled = false,
}: QuickReplyButtonsProps) {
  if (replies.length === 0) {
    return null;
  }

  const isHorizontal = replies.length >= 5;

  return (
    <div className="flex flex-col gap-2">
      <div
        className={
          isHorizontal
            ? "flex flex-row flex-wrap justify-end gap-2 ml-auto w-[80%]"
            : "flex flex-col items-end gap-2"
        }
      >
        {replies.map((reply) => {
          const selected = isQuickReplySelected(input, reply);
          return (
            <button
              key={reply}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(reply)}
              disabled={disabled}
              className={`px-4 py-1.5 text-sm font-medium border border-primary-accent rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in ${
                selected
                  ? "bg-primary-accent text-white"
                  : "text-primary-accent hover:bg-primary-accent/5"
              }`}
            >
              {reply}
            </button>
          );
        })}
      </div>
      <p className="text-right text-xs text-mirai-text-secondary">
        {allowMultiple && "複数選べます。"}
        選んだ内容は入力欄に入るので、直してから送信できます
      </p>
    </div>
  );
}
