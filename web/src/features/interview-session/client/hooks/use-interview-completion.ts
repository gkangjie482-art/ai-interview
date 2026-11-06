"use client";

import { useState } from "react";
import { getInterviewReportCompleteLink } from "@/features/interviews/shared/utils/interview-links";
import { callCompleteApi } from "../utils/interview-api-client";

interface UseInterviewCompletionProps {
  sessionId: string;
}

/**
 * インタビュー完了処理を管理するフック
 */
export function useInterviewCompletion({
  sessionId,
}: UseInterviewCompletionProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsCompleting(true);
    setCompleteError(null);
    try {
      // 回答はすべて公開する（サーバー側で公開として保存する）
      const result = await callCompleteApi({ sessionId });
      const reportId = result.report?.id;
      if (reportId) {
        window.location.href = getInterviewReportCompleteLink(reportId);
      }
      // 画面遷移するまで isCompleting を true のままにする
    } catch (err) {
      setCompleteError(
        err instanceof Error ? err.message : "Failed to complete interview"
      );
      setIsCompleting(false);
    }
  };

  return {
    isCompleting,
    completeError,
    handleSubmit,
  };
}
