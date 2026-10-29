import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InterviewLPPage } from "@/features/interviews/client/components/interview-lp-page";
import { getInterview } from "@/features/interviews/server/loaders/get-interview";
import { loadInterviewLPData } from "@/features/interviews/server/loaders/load-interview-lp-data";
import { env } from "@/lib/env";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

interface InterviewPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: InterviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const interview = await getInterview(slug);

  if (!interview) {
    return {
      title: "インタビューが見つかりません",
    };
  }

  const title = interview.name;
  const description =
    interview.summary ?? `${interview.name}についてのAIインタビュー`;
  const shareImageUrl =
    interview.thumbnail_url || new URL("/ogp.jpg", env.webUrl).toString();

  return {
    title,
    description,
    alternates: {
      canonical: routes.interviewLP(interview.slug),
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: shareImageUrl, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImageUrl],
    },
  };
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { slug } = await params;
  const interview = await getInterview(slug);

  if (!interview) {
    notFound();
  }

  const data = await loadInterviewLPData(interview);

  return <InterviewLPPage interview={interview} {...data} />;
}
