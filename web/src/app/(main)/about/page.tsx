import type { Metadata } from "next";
import {
  LegalList,
  LegalPageLayout,
  LegalParagraph,
  LegalSectionTitle,
} from "@/components/layouts/legal-page-layout";
import { EXTERNAL_LINKS } from "@/config/external-links";

export const metadata: Metadata = {
  title: "このサービスについて",
  description: "AIインタビューの目的・仕組み・運営について",
};

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-accent underline"
    >
      {children}
    </a>
  );
}

export default function AboutPage() {
  return (
    <LegalPageLayout
      className="bg-transparent pt-24 md:pt-12"
      title="このサービスについて"
      enLabel="About"
      description="AIインタビューは、AIの聞き手がテーマごとに一人ひとりのお話をうかがい、集まった声を見える形にするサービスです。"
    >
      <section className="space-y-4">
        <LegalSectionTitle>しくみ</LegalSectionTitle>
        <LegalList
          items={[
            "運営者がテーマと質問を用意し、AIがチャットで聞き手を務めます。",
            "AIは回答に合わせて深掘りの質問をし、最後に回答の要点をまとめます。",
            "回答者が公開に同意した会話だけが、サイト上で誰でも読める形で掲載されます。",
            "AIに渡している指示（プロンプト）は、各インタビューのページから確認できます。",
          ]}
        />
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>運営とソースコード</LegalSectionTitle>
        <LegalParagraph>
          本サービスは、政党チームみらいがオープンソースで公開している「みらい議会」（AGPL-3.0）をもとに改変し、個人が運営しています。これは政党チームみらいが運営しているものではありません。
        </LegalParagraph>
        <LegalParagraph>
          <ExternalLink href={EXTERNAL_LINKS.GITHUB_REPO}>
            このサービスのソースコード
          </ExternalLink>
          {" ／ "}
          <ExternalLink href={EXTERNAL_LINKS.UPSTREAM_REPO}>
            fork 元（みらい議会）
          </ExternalLink>
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>AIについての注意</LegalSectionTitle>
        <LegalParagraph>
          AIは、不正確な内容や意図と異なる質問を生成することがあります。気になる点があれば、まとめの確認時に修正を伝えるか、お問い合わせフォームからお知らせください。
        </LegalParagraph>
      </section>
    </LegalPageLayout>
  );
}
