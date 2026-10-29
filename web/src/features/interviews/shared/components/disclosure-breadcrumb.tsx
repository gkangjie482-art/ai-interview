import { Breadcrumb } from "@/components/ui/breadcrumb";
import { routes } from "@/lib/routes";
import { getInterviewLPLink } from "../utils/interview-links";

interface DisclosureBreadcrumbProps {
  billId: string;
  previewToken?: string;
}

export function DisclosureBreadcrumb({
  billId,
  previewToken,
}: DisclosureBreadcrumbProps) {
  const items = [
    { label: "TOP", href: routes.home() },
    { label: "法案詳細", href: getInterviewLPLink(billId, previewToken) },
    {
      label: "AIインタビュー",
      href: getInterviewLPLink(billId, previewToken),
    },
    { label: "情報開示" },
  ];

  return <Breadcrumb items={items} />;
}
