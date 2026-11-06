import type { Metadata } from "next";
import { Container } from "@/components/layouts/container";
import { LegalPageLayout } from "@/components/layouts/legal-page-layout";
import { TermsContent } from "@/components/legal/terms-content";

export const metadata: Metadata = {
  title: "利用規約 | AIインタビュー",
  description: "AIインタビューの利用規約",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="利用規約"
      enLabel="Terms of Service"
      description="AIインタビューをご利用いただくにあたっての基本的なルールを定めています。"
      className="pt-24 md:pt-12"
    >
      <Container>
        <TermsContent />
      </Container>
    </LegalPageLayout>
  );
}
