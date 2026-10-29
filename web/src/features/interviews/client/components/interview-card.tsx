import { Clock } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";
import type { InterviewListItem } from "../../server/loaders/get-interview";
import { formatEstimatedDuration } from "../../shared/utils/format-estimated-duration";
import { InterviewOpenBadge } from "./interview-open-badge";

/**
 * インタビュー一覧のカード
 */
export function InterviewCard({
  interview,
  variant = "default",
}: {
  interview: InterviewListItem;
  variant?: "default" | "pickup";
}) {
  const duration = formatEstimatedDuration(interview.estimated_duration);
  const lpHref = routes.interviewLP(interview.slug) as Route;
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {variant === "pickup" && interview.thumbnail_url && (
        <Link href={lpHref} className="relative block aspect-[1200/630]">
          <Image
            src={interview.thumbnail_url}
            alt={interview.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 640px"
          />
        </Link>
      )}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-mirai-text-secondary">
          <InterviewOpenBadge status={interview.status} />
          {duration && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {duration}
            </span>
          )}
          <span>{interview.publicReportCount.toLocaleString()}件の声</span>
        </div>
        <Link href={lpHref}>
          <h3 className="text-lg font-bold leading-[1.5] text-black hover:underline">
            {interview.name}
          </h3>
        </Link>
        {interview.summary && (
          <p className="line-clamp-3 text-sm leading-[1.8] text-mirai-text-note">
            {interview.summary}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {interview.status === "public" && (
            <Link
              href={lpHref}
              className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-bold text-white hover:opacity-90"
            >
              参加する
            </Link>
          )}
          {interview.publicReportCount > 0 && (
            <Link
              href={routes.interviewSessions(interview.slug) as Route}
              className="inline-flex h-10 items-center rounded-full border border-black px-5 text-sm font-bold text-black hover:bg-mirai-surface"
            >
              会話を読む（{interview.publicReportCount}件）
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
