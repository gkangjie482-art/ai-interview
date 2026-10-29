import { ArrowRight, Clock, MessageSquareText } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import { PastReportsSection } from "@/features/interview-report/client/components/past-reports-section";
import type { PublicInterviewReport } from "@/features/interview-report/server/loaders/get-public-reports-by-bill-id";
import type { UserReportsResult } from "@/features/interview-report/server/loaders/get-user-reports-by-interview-config";
import { ReportCard } from "@/features/interview-report/shared/components/report-card";
import { InterviewStatusBadge } from "@/features/interview-session/client/components/interview-status-badge";
import { NewInterviewButton } from "@/features/interview-session/client/components/new-interview-button";
import type { LatestInterviewSession } from "@/features/interview-session/server/loaders/get-latest-interview-session";
import { formatEstimatedDuration } from "@/features/interviews/shared/utils/format-estimated-duration";
import { getInterviewDisclosureLink } from "@/features/interviews/shared/utils/interview-links";
import { routes } from "@/lib/routes";
import type {
  Interview,
  InterviewMetrics,
} from "../../server/loaders/get-interview";
import { formatClosesAt } from "../../shared/utils/format-closes-at";
import { InterviewActionButtons } from "./interview-action-buttons";
import { InterviewOpenBadge } from "./interview-open-badge";

interface InterviewLPPageProps {
  interview: Interview;
  /** description を Markdown から変換したもの */
  descriptionElement: ReactElement | null;
  sessionInfo: LatestInterviewSession | null;
  metrics: InterviewMetrics;
  publicReports: PublicInterviewReport[];
  previewToken?: string;
  userReports?: UserReportsResult | null;
}

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="w-full max-w-[640px] mx-auto bg-white rounded-2xl p-6 space-y-4">
      {title && (
        <h2 className="text-[20px] font-bold text-black leading-[1.6]">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function _Hero({
  interview,
  sessionInfo,
}: {
  interview: Interview;
  sessionInfo: LatestInterviewSession | null;
}) {
  const duration = formatEstimatedDuration(interview.estimated_duration);
  const closesAt = formatClosesAt(interview.closes_at);
  return (
    <div className="w-full max-w-[640px] mx-auto flex flex-col gap-4">
      {interview.thumbnail_url && (
        <div className="relative w-full aspect-[1200/630] overflow-hidden rounded-2xl">
          <Image
            src={interview.thumbnail_url}
            alt={interview.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 640px"
            priority
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 text-sm text-mirai-text-secondary">
        <InterviewOpenBadge status={interview.status} />
        {duration && (
          <span className="inline-flex items-center gap-1">
            <Clock className="size-4" />
            所要時間 {duration}
          </span>
        )}
        {closesAt && <span>{closesAt} まで</span>}
        {sessionInfo && <InterviewStatusBadge status={sessionInfo.status} />}
      </div>
      <h1 className="text-2xl font-bold leading-[1.5]">{interview.name}</h1>
      {interview.summary && (
        <p className="text-[15px] leading-[1.87] text-black">
          {interview.summary}
        </p>
      )}
    </div>
  );
}

function _HowItWorks({ interview }: { interview: Interview }) {
  const themeCount = interview.themes?.length ?? 0;
  const duration = formatEstimatedDuration(interview.estimated_duration);
  return (
    <ul className="grid gap-2 text-[14px] leading-[1.7] text-black sm:grid-cols-2">
      <li className="flex items-center gap-2">
        <MessageSquareText className="size-5 text-primary" />
        AIが聞き手のチャット形式
      </li>
      <li className="flex items-center gap-2">
        <MessageSquareText className="size-5 text-primary" />
        公開に同意した会話は全文を掲載
      </li>
      {(themeCount > 0 || duration) && (
        <li className="sm:col-span-2 text-mirai-text-secondary">
          {themeCount > 0 && `質問テーマは${themeCount}つ`}
          {themeCount > 0 && duration && "、"}
          {duration && `所要時間の目安は${duration}`}
          です。
        </li>
      )}
    </ul>
  );
}

function _Themes({ themes }: { themes: string[] | null }) {
  if (!themes || themes.length === 0) return null;
  return (
    <Section title="質問テーマ">
      <ol className="flex flex-col gap-3">
        {themes.map((theme, i) => (
          <li key={theme} className="flex gap-3">
            <span className="flex-shrink-0 size-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="text-[15px] leading-[1.87] text-black">
              {theme}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-[13px] text-mirai-text-secondary leading-[1.7]">
        回答内容に応じて、AIが追加の質問をすることがあります。答えたくない質問はスキップできます。
      </p>
    </Section>
  );
}

function _Notice() {
  return (
    <div className="space-y-2 text-[13px] leading-[1.7] text-mirai-text-note">
      <p>公開に同意した場合は、AIとのやりとり全文がそのまま掲載されます。</p>
      <p>
        氏名・住所・連絡先・勤務先など、個人が特定できる情報は入力しないでください。
      </p>
    </div>
  );
}

function _Voices({
  interview,
  metrics,
  publicReports,
}: {
  interview: Interview;
  metrics: InterviewMetrics;
  publicReports: PublicInterviewReport[];
}) {
  const stats = [
    { label: "回答者", value: metrics.conductedCount, unit: "人" },
    { label: "最後まで回答", value: metrics.completedCount, unit: "件" },
    { label: "公開された会話", value: metrics.publicCount, unit: "件" },
  ];
  return (
    <Section>
      <div>
        <p className="font-lexend text-sm font-semibold tracking-[0.14em] text-primary-accent">
          VOICES
        </p>
        <h2 className="text-[20px] font-bold text-black">寄せられた声</h2>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-mirai-surface p-3">
            <dt className="text-xs text-mirai-text-secondary">{s.label}</dt>
            <dd className="text-xl font-bold text-black">
              {s.value.toLocaleString()}
              <span className="ml-0.5 text-xs font-normal">{s.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
      {publicReports.length > 0 ? (
        <div className="flex flex-col gap-3">
          {publicReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
          <Link
            href={routes.interviewSessions(interview.slug) as Route}
            className="inline-flex items-center gap-1 self-end text-sm font-bold text-primary-accent hover:opacity-70"
          >
            公開された会話をすべて読む（{metrics.publicCount}件）
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <p className="text-sm text-mirai-text-secondary">
          公開された会話はまだありません。
        </p>
      )}
    </Section>
  );
}

export function InterviewLPPage({
  interview,
  descriptionElement,
  sessionInfo,
  metrics,
  publicReports,
  previewToken,
  userReports,
}: InterviewLPPageProps) {
  const isOpen = interview.status === "public";
  const disclosureLink = getInterviewDisclosureLink(interview.id, previewToken);
  return (
    <div className="flex flex-col gap-6 px-4 pt-24 pb-12 md:pt-12 bg-mirai-light-gradient">
      <_Hero interview={interview} sessionInfo={sessionInfo} />

      <Section>
        {descriptionElement && (
          <div className="prose prose-sm max-w-none text-black leading-[1.87]">
            {descriptionElement}
          </div>
        )}
        <_HowItWorks interview={interview} />
      </Section>

      {userReports && userReports.reports.length > 0 && (
        <div className="w-full max-w-[640px] mx-auto">
          <PastReportsSection reports={userReports.reports} />
        </div>
      )}

      <Section title={isOpen ? "インタビューに参加する" : undefined}>
        {isOpen ? (
          <>
            {sessionInfo?.status === "completed" && sessionInfo.reportId ? (
              <NewInterviewButton
                billId={interview.id}
                previewToken={previewToken}
              />
            ) : (
              <InterviewActionButtons
                billId={interview.id}
                sessionInfo={sessionInfo}
                previewToken={previewToken}
              />
            )}
            <_Notice />
          </>
        ) : (
          <p className="text-[15px] text-black">
            このインタビューの募集は終了しました。寄せられた声は下からご覧いただけます。
          </p>
        )}
      </Section>

      <_Themes themes={interview.themes} />

      <_Voices
        interview={interview}
        metrics={metrics}
        publicReports={publicReports}
      />

      {interview.show_prompt && (
        <div className="w-full max-w-[640px] mx-auto">
          <Link
            href={disclosureLink as Route}
            className="text-xs text-black leading-[1.83] underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            AIへの指示（プロンプト）を見る
          </Link>
        </div>
      )}
    </div>
  );
}
