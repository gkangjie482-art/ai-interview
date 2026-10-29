import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Container } from "@/components/layouts/container";
import { getInterviewHistory } from "@/features/interview-session/server/loaders/get-interview-history";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "回答履歴",
  description: "このブラウザで回答したAIインタビューの一覧",
};

const STATUS_LABELS = {
  completed: "回答完了",
  active: "回答途中",
  archived: "中断",
} as const;

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function HistoryPage() {
  const history = await getInterviewHistory();

  return (
    <Container>
      <div className="flex flex-col gap-6 pt-24 pb-16 md:pt-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-black">回答履歴</h1>
          <p className="text-sm leading-[1.8] text-mirai-text-note">
            このブラウザで回答したインタビューが表示されます。別のブラウザや端末で回答したもの、ブラウザのデータを消去する前に回答したものは表示されません。
          </p>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-sm text-mirai-text-secondary">
            まだ回答したインタビューはありません。
            <Link
              href={routes.home()}
              className="ml-1 font-bold text-primary-accent underline"
            >
              インタビュー一覧を見る
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {history.map((item) => (
              <li
                key={item.sessionId}
                className="flex flex-col gap-2 rounded-2xl bg-white p-5"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-mirai-text-secondary">
                  <span className="rounded-full bg-mirai-surface px-2.5 py-0.5 font-bold text-black">
                    {STATUS_LABELS[item.status]}
                  </span>
                  <span>{formatDate(item.startedAt)}</span>
                  {item.reportId && (
                    <span>{item.isPublicByUser ? "公開に同意" : "非公開"}</span>
                  )}
                </div>
                <Link
                  href={routes.interviewLP(item.interviewSlug) as Route}
                  className="font-bold text-black hover:underline"
                >
                  {item.interviewName}
                </Link>
                <div className="flex flex-wrap gap-3 text-sm font-bold">
                  {item.reportId && (
                    <Link
                      href={routes.reportComplete(item.reportId) as Route}
                      className="text-primary-accent hover:opacity-70"
                    >
                      回答のまとめを見る
                    </Link>
                  )}
                  {item.status === "active" && item.isInterviewOpen && (
                    <Link
                      href={routes.interviewChat(item.interviewSlug) as Route}
                      className="text-primary-accent hover:opacity-70"
                    >
                      続きから回答する
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
