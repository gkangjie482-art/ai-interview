import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

type Tab = "edit" | "settings" | "reports";

/**
 * インタビュー配下の画面（基本情報 / AI設定・質問 / 回答）を切り替えるタブ
 */
export function InterviewTabs({
  interviewId,
  current,
}: {
  interviewId: string;
  current: Tab;
}) {
  const tabs: { key: Tab; label: string; href: string }[] = [
    { key: "edit", label: "基本情報", href: routes.interviewEdit(interviewId) },
    {
      key: "settings",
      label: "AI設定・質問",
      href: routes.interviewSettings(interviewId),
    },
    { key: "reports", label: "回答", href: routes.billReports(interviewId) },
  ];
  return (
    <nav
      className="mb-6 flex gap-1 border-b"
      aria-label="インタビューの管理メニュー"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href as Route}
          className={cn(
            "-mb-px border-b-2 px-4 py-2 text-sm font-medium",
            current === tab.key
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-900"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
