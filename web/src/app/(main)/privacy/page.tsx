import type { Metadata } from "next";
import { Container } from "@/components/layouts/container";
import { LegalPageLayout } from "@/components/layouts/legal-page-layout";
import { PrivacyContent } from "@/components/legal/privacy-content";

export const metadata: Metadata = {
  title: "プライバシーポリシー | AIインタビュー",
  description: "AIインタビューのプライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      className="bg-transparent pt-24 md:pt-12"
      title="プライバシーポリシー"
      enLabel="Privacy Policy"
      description="チームみらい学生チームが提供する「AIインタビュー」における個人情報の取り扱いについてご説明します。"
    >
      <Container>
        <PrivacyContent />
      </Container>
    </LegalPageLayout>
  );
}
