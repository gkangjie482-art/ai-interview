import Link from "next/link";
import type { ReactNode } from "react";
import {
  LegalList,
  LegalParagraph,
  LegalSectionTitle,
  LegalSubSectionTitle,
} from "@/components/layouts/legal-page-layout";
import { EXTERNAL_LINKS } from "@/config/external-links";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

function Label({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-slate-800">{children}</span>;
}

/**
 * TermsContent の本文。ページと、インタビュー開始前の同意画面の両方で使う。
 */
export function TermsContent({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-10", className)}>
      <LegalParagraph className="text-right">
        最終更新日：2026年11月7日
      </LegalParagraph>

      <LegalParagraph>
        「AIインタビュー」（以下「本サービス」といいます。）は、チームみらい学生チーム（以下「当チーム」といいます。）が提供する、意見を聞き取るためのインタビューの場です。各インタビューのテーマと質問は、当チームが用意します。本サービスは、チームみらい学生チームのメンバーが、オープンソースの「みらい議会」をもとに作成したものであり、政党チームみらいが作成・運営しているものではありません。本サービスをご利用いただく場合、以下の規約に同意いただいたものとみなします。
      </LegalParagraph>

      <section className="space-y-4">
        <LegalSectionTitle>第1条（本サービスの内容）</LegalSectionTitle>
        <LegalParagraph>
          本サービスは、AIが聞き手となって、テーマに沿ってお話を伺う対話形式のインタビューです。回答はテキストで行います。
        </LegalParagraph>
        <LegalParagraph>
          回答にあたって、氏名・住所・連絡先などの入力は必要ありません。
        </LegalParagraph>
        <LegalParagraph>
          <span className="font-semibold">
            本サービスでは、提出された回答は原則としてすべて公開されます。
          </span>
          インタビューを始める前に、回答が公開されることへの同意をお願いしており、同意いただいた場合にのみ回答を始められます。公開を希望しない内容は回答しないでください。回答は、第4条のとおり当チームが利用し、チームみらいと共有します。
        </LegalParagraph>
        <LegalParagraph>
          18歳未満の方は、保護者の同意を得たうえでご利用ください。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>第2条（禁止事項）</LegalSectionTitle>
        <LegalParagraph>
          ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
        </LegalParagraph>

        <div className="space-y-3">
          <LegalSubSectionTitle>不適切な投稿・入力行為</LegalSubSectionTitle>
          <LegalParagraph>
            以下の内容を含む投稿、AIへの入力、または対話を行うことを禁止します。
          </LegalParagraph>
          <LegalList
            items={[
              "個人情報の入力：氏名、住所、電話番号、メールアドレス、SNS ID、口座番号、所属組織等、本人・他人を問わず特定の個人を識別できる情報の入力（当チームが別途入力を依頼した場合を除きます。）。",
              "法令違反：犯罪予告、薬物・武器の製造情報の流布、公職選挙法違反、その他法令に抵触する、または助長する行為。",
              "権利侵害：第三者の著作権、肖像権、プライバシー権、名誉、信用を毀損・侵害する行為。",
              "権限のない情報の入力：ユーザーが公開する正当な権限を持たない情報の入力。",
              "危害の予告：自殺・自傷行為の示唆、他人への攻撃的な脅迫、犯罪の予告。",
              "公序良俗違反：わいせつ、暴力的、猟奇的な表現、差別的発言、ヘイトスピーチ、および一般人が不快と感じる内容。",
              "誹謗中傷・過度な批判：特定の個人や団体に対する人格否定、侮辱、嫌がらせ。",
              "不謹慎・配慮欠如：事件事故の被害者や遺族の感情を逆なでするような投稿。",
              "関連性のない内容：そのインタビューの趣旨と全く無関係な投稿、私的な交流。",
              "虚偽情報の拡散：明らかな偽情報、誤情報により社会的な混乱や健康被害を招くおそれのある行為。",
              "宣伝・営業活動：商業目的の広告、布教活動、特定のサイトへの誘導、またはこれらに準ずる行為。",
              "その他：当チームが社会通念上不適切と判断する一切の投稿。",
            ]}
          />
        </div>

        <div className="space-y-3">
          <LegalSubSectionTitle>
            システムの不正利用および運営妨害
          </LegalSubSectionTitle>
          <LegalList
            items={[
              "本サービスの運営を妨げる行為、または同一内容を執拗に繰り返すなどの荒らし行為。",
              "本サービスの情報を改ざん・加工し、誤解を招く形で利用する行為。",
              "サーバへの過剰な負荷、システムへの妨害、不正な侵入。",
              "自動化ツール、ボット等による不正操作、および同一人物が別の回答者を装って繰り返し回答する行為。",
              "AIモデルの悪用：システムプロンプト等の内部設定の推測、プロンプトインジェクション等による意図的な誤動作の誘発。",
              "目的外利用：そのインタビューの趣旨を著しく逸脱した応答を生成させる行為。",
              "なりすまし：他の人物や組織（当チームおよびチームみらいを含みます。）になりすまして本サービスを利用する行為。",
            ]}
          />
        </div>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>第3条（違反行為への対応）</LegalSectionTitle>
        <LegalParagraph>
          当チームは、ユーザーが前条の禁止事項に該当すると判断した場合、事前に通知することなく以下の措置を講じることができるものとします。
        </LegalParagraph>
        <LegalList
          ordered
          items={[
            "当該対話ログ、投稿、または回答内容の削除・非公開",
            "本サービスの利用停止または制限",
            "その他、当チームが必要と判断する適切な措置",
          ]}
        />
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>
          第4条（回答内容およびログの取り扱い）
        </LegalSectionTitle>
        <LegalParagraph>
          AIインタビューを通じて取得した回答ログおよびその要約（以下「インタビューデータ」といいます。）は、以下のとおり取り扱います。
        </LegalParagraph>
        <LegalList
          items={[
            {
              id: "team-use",
              content: (
                <>
                  <Label>当チームによる利用：</Label>
                  当チームは、インタビューデータを、チームみらい学生チームの活動の一環として、インタビューの集計・分析や、その結果の報告に利用します。また、本サービスの運営、不正対策、規約違反への対応、およびサービスの改善のために、インタビューデータを閲覧・利用します。
                </>
              ),
            },
            {
              id: "share-with-team-mirai",
              content: (
                <>
                  <Label>チームみらいとの共有：</Label>
                  当チームは、インタビューデータを、チームみらいと共有します。共有したインタビューデータは、チームみらいの活動に利用されることがあります。
                </>
              ),
            },
            {
              id: "publish",
              content: (
                <>
                  <Label>公開：</Label>
                  ユーザーは、インタビューを始める際に、インタビューデータが本サービス上で匿名で公開されることに同意するものとします。提出されたインタビューデータは、人手による確認を経ずに公開されることがあります。ただし、公開に適さない内容（個人を特定できる情報、誹謗中傷や差別的な表現、インタビューの趣旨と関係のない内容など、第2条の禁止事項に当たるもの）を含むと当チームが判断したときは、公開しない、公開を取りやめる、または削除することがあります。
                </>
              ),
            },
            {
              id: "aggregate",
              content: (
                <>
                  <Label>集約しての公開：</Label>
                  インタビューデータは、個人を特定できない形に集計・要約したうえで、集計・分析の結果として公表することがあります。
                </>
              ),
            },
            {
              id: "license",
              content: (
                <>
                  <Label>利用の許諾：</Label>
                  ユーザーは、インタビューデータのうちユーザーが権利を有する部分について、当チームおよびチームみらいに対し、本条に定める目的の範囲で、無償で利用（複製、翻案、要約、および公表を含みます。）することを許諾します。また、ユーザーは、当チームおよびチームみらいに対し、著作者人格権を行使しないものとします。
                </>
              ),
            },
          ]}
        />
        <LegalParagraph>
          回答の公開の取りやめや削除を希望するときは、第10条のお問い合わせ窓口までご連絡ください。削除の前に作成・公表した報告等への引用や、集約して公表した内容は、削除後もそのまま残ることがあります。また、すでにチームみらいと共有したものや、第三者が取得・複製した情報など、当チームが管理していない情報については、当チームが削除できない場合があります。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>
          第5条（インタビューの終了・公開停止）
        </LegalSectionTitle>
        <LegalParagraph>
          当チームは、インタビューの募集を予告なく終了したり、インタビューの公開を停止したりすることがあります。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>第6条（AIの利用について）</LegalSectionTitle>
        <LegalParagraph>
          本サービスの聞き手、および回答の要約・分析にはAIを利用しています。AIによる応答や分析結果は、その性質上、誤った情報を含む可能性があることを理解した上で利用するものとします。
        </LegalParagraph>
        <LegalParagraph>
          AIによる応答は、医療、法律、税務その他の専門的な助言ではありません。個別の判断が必要な事柄については、専門家にご相談ください。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>第7条（知的財産権）</LegalSectionTitle>
        <LegalParagraph>
          本サービスの提供に用いられるプログラムは、GNU Affero General Public
          License
          v3.0（AGPL-3.0）のもとで公開されており、同ライセンスの条件に従って利用できます。プログラム以外のコンテンツ、テキスト、画像等に関する権利は、当チームまたは正当な権利者に帰属し、ユーザーは私的利用の範囲を超えてこれらを使用してはなりません。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>第8条（情報に係る不保証・免責）</LegalSectionTitle>
        <LegalParagraph>
          当チームは、本サービス（AIによる回答を含みます。）が提供する情報の正確性、完全性、最新性、有用性、真実性等について、いかなる保証も行いません。
        </LegalParagraph>
        <LegalParagraph>
          また、本サービスの利用によってユーザーに生じた損害について、当チームの故意または重過失による場合を除き、責任を負いません。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>
          第9条（サービスの変更・停止、規約の変更）
        </LegalSectionTitle>
        <LegalParagraph>
          当チームは、ユーザーへの事前通知なく本サービスの内容を変更・停止できるものとし、それにより生じた損害について、当チームの故意または重過失による場合を除き、責任を負いません。
        </LegalParagraph>
        <LegalParagraph>
          当チームは、民法第548条の4の規定に基づき、本規約を変更することがあります。変更するときは、変更後の内容と変更の効力が生じる日を、効力が生じる日より前に本サービス上に掲示してお知らせします。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>第10条（お問い合わせ窓口）</LegalSectionTitle>
        <LegalParagraph>
          本規約や回答内容の取り扱いに関するお問い合わせは、
          <a
            href={EXTERNAL_LINKS.CONTACT_FORM}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-accent underline"
          >
            お問い合わせフォーム
          </a>
          からご連絡ください。個人情報の取り扱いについては
          <Link
            href={routes.privacy()}
            className="text-primary-accent underline"
          >
            プライバシーポリシー
          </Link>
          をご覧ください。
        </LegalParagraph>
      </section>

      <section className="space-y-4">
        <LegalSectionTitle>第11条（準拠法・管轄）</LegalSectionTitle>
        <LegalParagraph>
          本規約は日本法に準拠し、本サービスに関連して生じる一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
        </LegalParagraph>
      </section>
    </div>
  );
}
