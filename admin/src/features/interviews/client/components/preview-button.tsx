"use client";

import { Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generatePreviewUrl } from "../../server/actions/generate-preview-url";

/**
 * 公開前のインタビューを新しいタブでプレビューする
 */
export function PreviewButton({ interviewId }: { interviewId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePreview = async () => {
    setIsLoading(true);
    try {
      const result = await generatePreviewUrl(interviewId);
      if (result.success && result.url) {
        window.open(result.url, "_blank");
      } else {
        alert(result.error || "プレビューURLの生成に失敗しました");
      }
    } catch (error) {
      console.error("Preview URL generation failed:", error);
      alert("プレビューURLの生成中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePreview}
      disabled={isLoading}
    >
      <Eye className="h-4 w-4" />
      {isLoading ? "準備中..." : "プレビュー"}
    </Button>
  );
}
