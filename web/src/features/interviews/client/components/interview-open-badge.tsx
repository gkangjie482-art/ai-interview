import { cn } from "@/lib/utils";
import type { Interview } from "../../server/loaders/get-interview";

/**
 * 募集中 / 終了 のバッジ
 */
export function InterviewOpenBadge({
  status,
  className,
}: {
  status: Interview["status"];
  className?: string;
}) {
  const isOpen = status === "public";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold",
        isOpen
          ? "bg-primary text-white"
          : "bg-mirai-surface-muted text-mirai-text-secondary",
        className
      )}
    >
      {isOpen ? "募集中" : "終了"}
    </span>
  );
}
