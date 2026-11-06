import { DISCLAIMER } from "@/config/disclaimer";
import { cn } from "@/lib/utils";

/** 制作・運営主体を明示する注意書き（政党チームみらいが作成・運営したものではないこと） */
export function SiteDisclaimer({ className }: { className?: string }) {
  return (
    <aside
      aria-label="制作・運営についての注意"
      className={cn(
        "rounded-lg border border-mirai-border bg-mirai-surface px-4 py-3 text-[13px] leading-[1.7] text-mirai-text",
        className
      )}
    >
      <p className="font-bold">{DISCLAIMER.NOT_OPERATED_BY_PARTY}</p>
      <p className="mt-1">{DISCLAIMER.BUILT_BY_STUDENT_TEAM}</p>
    </aside>
  );
}
