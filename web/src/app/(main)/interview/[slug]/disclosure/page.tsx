import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInterview as getBillById } from "@/features/interviews/server/loaders/get-interview";
import { loadDisclosureData } from "@/features/interviews/server/loaders/load-disclosure-data";
import { InterviewDisclosurePage } from "@/features/interviews/server/components/interview-disclosure-page";

interface DisclosurePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: DisclosurePageProps): Promise<Metadata> {
  const { slug: id } = await params;
  const bill = await getBillById(id);

  if (!bill) {
    return {
      title: "インタビューが見つかりません",
    };
  }

  const billName = bill.name;

  return {
    title: `AIへの指示（プロンプト） - ${billName}`,
    description: `${billName}のAIインタビューにおける透明性および技術仕様に関する開示事項`,
  };
}

export default async function DisclosurePage({ params }: DisclosurePageProps) {
  const { slug: id } = await params;
  // 公開済みで、プロンプトの公開を許可しているインタビューのみ
  const interviewConfig = await getBillById(id);

  if (!interviewConfig || !interviewConfig.show_prompt) {
    notFound();
  }

  const disclosureData = await loadDisclosureData(interviewConfig);

  return <InterviewDisclosurePage {...disclosureData} />;
}
