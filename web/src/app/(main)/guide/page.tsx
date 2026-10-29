import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import {
  LegalList,
  LegalPageLayout,
  LegalParagraph,
  LegalSectionTitle,
} from "@/components/layouts/legal-page-layout";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "はじめての方へ",
  description: "AIインタビューへの参加方法と、回答の扱いについて",
};

export default function GuidePage() {
  return (
    <LegalPageLayout
      className="bg-transparent pt-24 md:pt-12"
      title="はじめての方へ"
      enLabel="Guide"
      description="AIインタビューは、AIの聞き手とチャットで話しながら、テーマについてのあなたの経験や考えをうかがうサービスです。"
    >
      <section className="space-y-4">
        <LegalSectionTitle>1. インタビューをえらぶ</LegalSectionTitle>
        <LegalParagraph>
          <Link href={routes.home()} className="text-primary-accent underline">
            インタビュー一覧
          </Link>
          から、関心のあるテーマを選んでください。各インタビューのページに、質問テーマと所要時間の目安が書かれています。専門知識は必要ありません。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>2. AIと話す</LegalSectionTitle>
        <LegalList
          items={[
            "「インタビューを始める」を押すと、AIが質問を始めます。チャットに入力して答えてください。",
            "回答内容に応じて、AIが追加の質問をすることがあります。答えにくい質問は飛ばせます。",
            "途中でやめても、同じブラウザなら続きから再開できます（回答履歴から開けます）。",
          ]}
        />
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>
          3. まとめを確認して、公開するか選ぶ
        </LegalSectionTitle>
        <LegalParagraph>
          最後に、AIがあなたの回答をまとめます。内容を確認し、修正したい点があれば伝えてください。そのうえで、会話を公開するかどうかを選べます。公開に同意した場合だけ、AIとのやりとり全文がサイト上に掲載されます。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>入力しないでほしいこと</LegalSectionTitle>
        <LegalList
          items={[
            "氏名・住所・電話番号・メールアドレスなど、あなたや他の人が特定できる情報",
            "勤務先・学校・利用しているサービスの名称など、所属が特定できる情報",
            "公表されていない社内情報などの機密情報",
          ]}
        />
        <LegalParagraph>
          回答は匿名で行われ、ログインは必要ありません。詳しくは
          <Link
            href={routes.privacy() as Route}
            className="text-primary-accent underline"
          >
            プライバシーポリシー
          </Link>
          をご覧ください。
        </LegalParagraph>
      </section>
    </LegalPageLayout>
  );
}
