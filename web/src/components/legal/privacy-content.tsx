import Link from "next/link";
import type { ReactNode } from "react";
import {
  LegalList,
  LegalParagraph,
  LegalSectionTitle,
} from "@/components/layouts/legal-page-layout";
import { EXTERNAL_LINKS } from "@/config/external-links";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

function Label({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-slate-800">{children}</span>;
}

function ContactFormLink() {
  return (
    <a
      href={EXTERNAL_LINKS.CONTACT_FORM}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-accent underline"
    >
      お問い合わせフォーム
    </a>
  );
}

/**
 * PrivacyContent の本文。ページと、インタビュー開始前の同意画面の両方で使う。
 */
export function PrivacyContent({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-8", className)}>
      <p className="text-sm text-mirai-text-muted">最終更新日：2026年11月7日</p>

      <LegalParagraph>
        本プライバシーポリシーは、チームみらい学生チーム（以下「当チーム」といいます。）が提供する「AIインタビュー」（以下「本サービス」といいます。）における個人情報の取り扱いを定めるものです。本サービスは、チームみらい学生チームのメンバーが、オープンソースの「みらい議会」をもとに作成したものであり、政党チームみらいが作成・運営しているものではありません。
        <span className="font-semibold">
          本サービスでは、提出された回答は原則としてすべて公開されます。
        </span>
      </LegalParagraph>

      <section className="space-y-4">
        <LegalSectionTitle>1. 個人情報の定義</LegalSectionTitle>
        <LegalParagraph>
          個人情報とは、以下のような情報であって、特定の個人を識別することができるものを指します。
        </LegalParagraph>
        <LegalList
          items={[
            "氏名、年齢、性別、住所、電話番号、職業、メールアドレス",
            "個人ごとに割り当てられたIDやパスワード、その他識別可能な記号",
            "本サービスのAIインタビュー機能を通じて取得される対話ログおよび利用履歴",
            "他の情報と容易に照合することができ、それにより特定の個人を識別できることとなるもの",
          ]}
        />
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>2. 取得する情報</LegalSectionTitle>
        <LegalParagraph>
          インタビューへの回答にあたって、氏名・住所・連絡先の入力は必要ありません。本サービスで取得するのは以下の情報です。
        </LegalParagraph>
        <LegalList
          items={[
            {
              id: "dialogue",
              content: (
                <>
                  <Label>対話の内容：</Label>
                  AIからの質問と、それに対するあなたの回答。
                </>
              ),
            },
            {
              id: "record",
              content: (
                <>
                  <Label>回答に関する記録：</Label>
                  開始と終了の日時。
                </>
              ),
            },
            {
              id: "feedback",
              content: (
                <>
                  <Label>回答後にご入力いただく情報：</Label>
                  満足度の評価と、自由記述のご意見。いずれも任意です。
                </>
              ),
            },
            {
              id: "ai-generated",
              content: (
                <>
                  <Label>AIが作る情報：</Label>
                  回答内容をもとにAIが作る要約や、公開に適した内容かどうかの判定。
                </>
              ),
            },
            {
              id: "admin-account",
              content: (
                <>
                  <Label>管理者のアカウント情報：</Label>
                  当チームの管理者としてログインする場合のメールアドレス。回答者向けのログイン機能はありません。
                </>
              ),
            },
            {
              id: "cookie",
              content: (
                <>
                  <Label>Cookie・アクセス情報：</Label>
                  下記「8. Cookie（クッキー）について」をご覧ください。
                </>
              ),
            },
          ]}
        />
        <LegalParagraph>
          なお、回答の本文にご自身や他の方の氏名・連絡先などを入力された場合、その内容はそのまま対話ログとして保存されます。利用規約でも入力を禁止していますので、個人を特定できる情報は入力しないでください。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>3. 誰が回答を読むか</LegalSectionTitle>
        <LegalParagraph>
          回答内容は、公開されるかどうかにかかわらず、以下の者が読むことができます。途中でやめた回答も含みます。
        </LegalParagraph>
        <LegalList
          items={[
            {
              id: "team-admin",
              content: (
                <>
                  <Label>当チームの管理者：</Label>
                  インタビューの集計・分析、本サービスの運営、不正対策、規約違反への対応のために読みます。
                </>
              ),
            },
            {
              id: "team-mirai",
              content: (
                <>
                  <Label>チームみらい：</Label>
                  当チームは、回答内容をチームみらいと共有します（下記「6.
                  第三者への情報提供について」）。
                </>
              ),
            },
          ]}
        />
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>4. 回答内容の公開について</LegalSectionTitle>
        <LegalList
          items={[
            {
              id: "publish",
              content: (
                <>
                  <Label>公開：</Label>
                  インタビューを始める前に、回答が公開されることへの同意をお願いしており、同意いただいた場合にのみ回答を始められます。提出された回答は、回答の要約とAIとのやりとりの全文が、人手による確認を経ずに、匿名で本サービス上に公開されることがあります。
                </>
              ),
            },
            {
              id: "not-publish",
              content: (
                <>
                  <Label>公開しない場合：</Label>
                  公開に適さない内容（個人を特定できる情報、誹謗中傷や差別的な表現、インタビューの趣旨と関係のない内容など、利用規約第2条の禁止事項に当たるもの）を含むと当チームが判断した場合は、公開しない、公開を取りやめる、または削除することがあります。
                </>
              ),
            },
            {
              id: "aggregate",
              content: (
                <>
                  <Label>集約しての公開：</Label>
                  個人を特定できない形に集計・要約したうえで、集計・分析の結果として公表することがあります。
                </>
              ),
            },
            {
              id: "withdraw",
              content: (
                <>
                  <Label>公開の取りやめ・削除：</Label>
                  ご自身の回答の公開の取りやめや削除をご希望の場合は、下記「11.
                  開示・訂正・削除のご請求」の窓口までご連絡ください。それまでに作成・公表した報告等への引用や、集約して公表した内容は、そのまま残ることがあります。
                </>
              ),
            },
          ]}
        />
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>5. 利用目的</LegalSectionTitle>
        <LegalParagraph>
          個人情報をご提供いただく際には、ご本人の同意に基づいて行うことを原則とします。本サービスで取得した個人情報は、以下の目的で利用します。
        </LegalParagraph>
        <LegalList
          items={[
            "チームみらい学生チームの活動の一環としての、インタビューの集計・分析と、その結果の報告",
            "本サービスの運営およびそれに伴うご案内",
            "本サービスの安全な運営に必要な不正対策、および利用規約への違反の確認と対応",
            "本サービスの改善・新規開発",
            "上記の各利用目的に必要な各種調査・分析",
            "「6. 第三者への情報提供について」に定める第三者への提供",
          ]}
        />
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>6. 第三者への情報提供について</LegalSectionTitle>
        <LegalParagraph>
          当チームは、回答内容（公開されないものを含みます。）を、チームみらいに提供して共有します。インタビューを始める前に、このことへの同意をいただいています。共有した回答内容は、チームみらいの活動に利用されることがあります。
        </LegalParagraph>
        <LegalParagraph>
          このほか、当チームは、以下のいずれかに該当する場合を除き、個人情報を第三者に開示・提供することはありません。
        </LegalParagraph>
        <LegalList
          items={[
            "「4. 回答内容の公開について」に定める、インタビューの開始前にいただいた同意に基づく公開を行う場合",
            "ご本人の同意がある場合",
            "統計的なデータなど、個人を特定できない状態で提供する場合",
            "法令に基づく開示請求（裁判所・警察等）があった場合",
            "不正アクセスや規約違反など、緊急の対応が必要と判断された場合",
          ]}
        />
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>7. 外部サービスの利用</LegalSectionTitle>
        <LegalParagraph>
          本サービスは、その提供のために以下の外部サービスを利用しており、必要な範囲で情報の取り扱いを委託しています。
        </LegalParagraph>
        <LegalList
          items={[
            {
              id: "ai",
              content: (
                <>
                  <Label>AIモデルの提供事業者：</Label>
                  インタビューの進行、回答の要約・分析のために、回答内容を
                  Vercel AI Gateway を経由して OpenAI 等の事業者の API
                  へ送信します。OpenAI の API の規約では、API
                  で送信したデータはモデルの学習に使われないことになっています。所在国は主に米国です。利用するモデルの変更に伴い変わることがあります。当チームは、外国にある事業者への提供について、個人情報保護法第28条に従って取り扱います。
                </>
              ),
            },
            {
              id: "cloud",
              content: (
                <>
                  <Label>クラウド基盤の提供事業者：</Label>
                  本サービスのサーバおよびデータベースの稼働のために、Vercel と
                  Supabase を利用します。
                </>
              ),
            },
            {
              id: "analytics",
              content: (
                <>
                  <Label>アクセス解析：</Label>
                  利用状況の把握のために、Googleアナリティクスと Vercel Speed
                  Insights を利用します。
                </>
              ),
            },
          ]}
        />
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>8. Cookie（クッキー）について</LegalSectionTitle>
        <LegalParagraph>
          本サービスでは、以下の目的でCookieを使用しています。
        </LegalParagraph>
        <LegalList
          items={[
            "回答の途中でページを開き直しても、ご自身の回答を続けられるようにするため",
            "回答を終えたあとも、同じブラウザからご自身の回答を見返せるようにするため",
            "管理者としてログインした状態を保つため",
            "アクセス解析（Googleアナリティクス）による利用状況の把握のため",
          ]}
        />
        <LegalParagraph>
          アクセス解析で収集される情報は匿名で、単独で個人を特定するものではありません。Cookieはブラウザの設定で無効にできますが、その場合、回答の継続や回答履歴など一部の機能が正しく動作しないことがあります。ご自身の回答を見返すための情報は、同じ端末・同じブラウザを使う方であれば利用できてしまうため、共用の端末で回答した場合は、使い終わったらブラウザのCookieを消去してください。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>9. 安全管理措置</LegalSectionTitle>
        <LegalParagraph>
          当チームは、個人情報の適切な管理を行うために、責任者を定め、適切な管理に努めます。回答内容を読めるのは、当チームの管理者に限っています（チームみらいとの共有と、「4.
          回答内容の公開について」に定める公開を除きます）。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>10. 保管期間と廃棄</LegalSectionTitle>
        <LegalParagraph>
          回答内容は、ご本人からのご請求に応じて削除する場合を除き、上記「5.
          利用目的」のために保管を続けます。なお、すでにチームみらいと共有したものや、公開された回答内容を第三者が複製したものなど、当チームが管理していない情報については、当チームが廃棄・削除を行うことができない場合があります。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>11. 開示・訂正・削除のご請求</LegalSectionTitle>
        <LegalParagraph>
          ご自身の個人情報について、利用目的の通知、開示、訂正・追加・削除、利用の停止・消去、第三者への提供の停止、および回答の公開の取りやめをご希望の場合は、下記のお問い合わせ窓口までご連絡ください。ご本人であることを確認できた場合に、法令に従って対応します。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>12. 改訂と通知</LegalSectionTitle>
        <LegalParagraph>
          本ポリシーは必要に応じて改訂します。改訂するときは、改訂後の内容と効力が生じる日を、本サービス上に掲示してお知らせします。利用目的を変更する場合は、法令で認められる範囲で行い、それを超える変更をするときは、改めてご本人の同意をいただきます。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>
          13. 事業者の情報とお問い合わせ窓口
        </LegalSectionTitle>
        <LegalList
          items={[
            "名称：チームみらい学生チーム",
            {
              id: "contact",
              content: (
                <>
                  個人情報の取り扱いに関するご相談、開示等のご請求の窓口：
                  <ContactFormLink />
                </>
              ),
            },
          ]}
        />
        <LegalParagraph>
          本サービスのご利用条件については
          <Link href={routes.terms()} className="text-primary-accent underline">
            利用規約
          </Link>
          をご覧ください。
        </LegalParagraph>
      </section>
    </div>
  );
}
