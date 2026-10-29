import type { Metadata } from "next";
import { PublicOpinionsPage } from "@/features/interview-report/server/components/public-opinions-page";
import type { SortOrder } from "@/features/interview-report/shared/utils/sort-order";
import { getInterview } from "@/features/interviews/server/loaders/get-interview";

interface SessionsPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    sort?: string;
  }>;
}

export async function generateMetadata({
  params,
}: SessionsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const interview = await getInterview(slug);
  const title = interview?.name ?? "インタビュー";

  return {
    title: `公開された会話 - ${title}`,
    description: `${title}に寄せられ、回答者が公開に同意した会話の一覧`,
  };
}

export default async function SessionsPage({
  params,
  searchParams,
}: SessionsPageProps) {
  const [{ slug }, { sort }] = await Promise.all([params, searchParams]);
  const initialSort: SortOrder = sort === "newest" ? "newest" : "recommended";
  return (
    <PublicOpinionsPage
      billId={slug}
      initialFilter="all"
      initialSort={initialSort}
    />
  );
}
