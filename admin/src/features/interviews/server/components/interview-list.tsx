import { ExternalLink, Plus } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { env } from "@/lib/env";
import { routes } from "@/lib/routes";
import { PreviewButton } from "../../client/components/preview-button";
import { OPEN_STATUS_LABELS, PUBLISH_STATUS_LABELS } from "../../shared/types";
import { getInterviewsWithCounts } from "../loaders/get-interviews";

export async function InterviewList() {
  const interviews = await getInterviewsWithCounts();

  return (
    <div>
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="text-sm text-gray-600">
          {interviews.length}件のインタビュー
        </div>
        <Link href={routes.interviewNew()}>
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            新規作成
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>公開状態</TableHead>
              <TableHead>募集状況</TableHead>
              <TableHead className="text-right">回答数</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-gray-500"
                >
                  まだインタビューがありません。「新規作成」から作成してください。
                </TableCell>
              </TableRow>
            )}
            {interviews.map((interview) => (
              <TableRow key={interview.id}>
                <TableCell className="max-w-[360px]">
                  <Link
                    href={routes.interviewEdit(interview.id) as Route}
                    className="block truncate font-medium hover:underline"
                  >
                    {interview.name}
                  </Link>
                  <span className="text-xs text-gray-500">
                    /interview/{interview.slug}
                    {interview.is_featured && "・注目"}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      interview.publish_status === "published"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {PUBLISH_STATUS_LABELS[interview.publish_status]}
                  </Badge>
                </TableCell>
                <TableCell>{OPEN_STATUS_LABELS[interview.status]}</TableCell>
                <TableCell className="text-right">
                  {interview.sessionCount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Link href={routes.interviewEdit(interview.id) as Route}>
                      <Button variant="outline" size="sm">
                        基本情報
                      </Button>
                    </Link>
                    <Link
                      href={routes.interviewSettings(interview.id) as Route}
                    >
                      <Button variant="outline" size="sm">
                        AI設定・質問
                      </Button>
                    </Link>
                    <Link href={routes.billReports(interview.id) as Route}>
                      <Button variant="outline" size="sm">
                        回答
                      </Button>
                    </Link>
                    {interview.publish_status === "published" ? (
                      <a
                        href={`${env.webUrl}/interview/${interview.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                          表示
                        </Button>
                      </a>
                    ) : (
                      <PreviewButton interviewId={interview.id} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
