"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { SiteDisclaimer } from "@/components/disclaimer/site-disclaimer";
import { PrivacyContent } from "@/components/legal/privacy-content";
import { TermsContent } from "@/components/legal/terms-content";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getInterviewChatLink } from "@/features/interviews/shared/utils/interview-links";
import { recordTermsConsent } from "../../server/actions/record-terms-consent";

interface InterviewConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId: string;
  previewToken?: string;
}

interface ConsentDocumentProps {
  id: string;
  title: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
}

function ConsentDocument({
  id,
  title,
  checked,
  onCheckedChange,
  children,
}: ConsentDocumentProps) {
  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-2">
      <h3 id={`${id}-title`} className="text-sm font-bold text-gray-800">
        {title}
      </h3>
      <div
        // biome-ignore lint/a11y/noNoninteractiveTabindex: キーボードでも本文をスクロールできるようにする
        tabIndex={0}
        className="h-48 overflow-y-auto rounded-md border border-gray-300 bg-gray-50 p-3 [&_h2]:text-sm [&_h3]:text-sm [&_li]:text-xs [&_p]:text-xs"
      >
        {children}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="size-4 shrink-0 rounded accent-primary"
        />
        <label htmlFor={id} className="text-sm font-bold text-black">
          {title}に同意する
        </label>
      </div>
    </section>
  );
}

export function InterviewConsentModal({
  open,
  onOpenChange,
  billId,
  previewToken,
}: InterviewConsentModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const agreed = agreedTerms && agreedPrivacy;

  const handleAgree = async () => {
    if (!agreed) return;
    setIsLoading(true);
    try {
      await recordTermsConsent();
    } catch (error) {
      console.error("Failed to record terms consent:", error);
      setIsLoading(false);
      return;
    }
    const destination = getInterviewChatLink(billId, previewToken);
    router.push(destination as Route);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setAgreedTerms(false);
      setAgreedPrivacy(false);
      setIsLoading(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto px-6 py-10 sm:px-8">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-primary text-center">
            AIインタビュー同意事項
          </DialogTitle>
          <div className="h-[1px] bg-mirai-gradient mt-6" />
        </DialogHeader>

        <div className="flex flex-col gap-6 mt-6">
          <SiteDisclaimer />
          <ul className="flex flex-col gap-3 list-disc pl-5 text-sm font-bold text-gray-800 leading-[22px]">
            <li>
              回答データは、チームみらい学生チームが活動の一環として集計や分析に利用し、チームみらいとも共有します。
            </li>
            <li>個人情報や機密情報の記載はお控えください。</li>
            <li>
              回答は、レポートとAIとのやりとりの全文が、匿名で本サービス上に公開されます。公開されたくない内容は回答しないでください。
            </li>
          </ul>

          <p className="text-sm text-gray-800">
            回答を始める前に、利用規約とプライバシーポリシーをお読みのうえ、それぞれにチェックを入れてください。
          </p>

          <ConsentDocument
            id="consent-terms"
            title="利用規約"
            checked={agreedTerms}
            onCheckedChange={setAgreedTerms}
          >
            <TermsContent className="space-y-4" />
          </ConsentDocument>

          <ConsentDocument
            id="consent-privacy"
            title="プライバシーポリシー"
            checked={agreedPrivacy}
            onCheckedChange={setAgreedPrivacy}
          >
            <PrivacyContent className="space-y-4" />
          </ConsentDocument>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <Button
            onClick={handleAgree}
            disabled={isLoading || !agreed}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                処理中...
              </>
            ) : (
              <>
                同意してはじめる
                <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="w-full"
          >
            同意せずに戻る
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
