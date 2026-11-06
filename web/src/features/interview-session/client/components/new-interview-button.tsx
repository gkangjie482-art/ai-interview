"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InterviewConsentModal } from "@/features/interviews/client/components/interview-consent-modal";

interface NewInterviewButtonProps {
  billId: string;
  previewToken?: string;
}

export function NewInterviewButton({
  billId,
  previewToken,
}: NewInterviewButtonProps) {
  const [showConsentModal, setShowConsentModal] = useState(false);

  // 新しく回答を始めるときも、そのつど利用規約とプライバシーポリシーへの同意を確かめる
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowConsentModal(true)}
        className="w-full bg-white border border-black rounded-[100px] h-[48px] px-6 font-bold text-[15px] hover:opacity-90 transition-opacity flex items-center justify-center gap-4"
      >
        <Image
          src="/icons/messages-square-icon.svg"
          alt=""
          width={24}
          height={24}
          className="object-contain"
        />
        <span>もう一度新たに回答する</span>
        <ArrowRight className="size-4" />
      </Button>
      <InterviewConsentModal
        open={showConsentModal}
        onOpenChange={setShowConsentModal}
        billId={billId}
        previewToken={previewToken}
      />
    </>
  );
}
