import type { Database } from "@mirai-gikai/supabase";

type InterviewInsert = Database["public"]["Tables"]["interviews"]["Insert"];
type QuestionInsert = Omit<
  Database["public"]["Tables"]["interview_questions"]["Insert"],
  "interview_id"
>;

/** ローカル開発用のサンプルインタビュー */
export const sampleInterviews: Array<{
  interview: InterviewInsert;
  questions: QuestionInsert[];
}> = [
  {
    interview: {
      slug: "childcare-2026",
      name: "地域の子育て支援についてのインタビュー",
      summary:
        "保育園・学童・相談窓口など、地域の子育て支援で困っていることや、あったらいいと思う仕組みを伺います。",
      description:
        "子育て中の方、これから子育てをする方、子育てを支える立場の方のご経験やお考えを伺います。\n\n- 専門知識は必要ありません\n- 答えにくい質問は飛ばせます\n- 回答は匿名です",
      background:
        "自治体の子育て支援には、保育所・学童保育・一時預かり・子育て相談窓口などがある。待機児童、手続きの煩雑さ、情報の届きにくさが課題として挙げられることが多い。",
      publish_status: "published",
      published_at: new Date().toISOString(),
      status: "public",
      is_featured: true,
      featured_order: 0,
      themes: ["いま困っていること", "支援の使いやすさ", "あったらいい仕組み"],
      mode: "loop",
      estimated_duration: 10,
    },
    questions: [
      {
        question: "子育てに関わる中で、いま一番困っていることは何ですか？",
        follow_up_guide: "具体的な場面（時間帯・場所・相手）を聞く",
        quick_replies: ["預け先", "お金", "情報が少ない", "相談相手"],
        question_order: 1,
      },
      {
        question:
          "使ったことのある子育て支援で、使いにくかった点はありますか？",
        follow_up_guide: "手続き・窓口・時間など、どこで困ったかを深掘りする",
        quick_replies: ["手続きが大変", "時間が合わない", "使ったことがない"],
        question_order: 2,
      },
      {
        question: "こんな仕組みがあったら助かる、というものはありますか？",
        follow_up_guide: "なぜそれが必要か、理由を聞く",
        quick_replies: null,
        question_order: 3,
      },
    ],
  },
  {
    interview: {
      slug: "local-transport",
      name: "地域の移動手段（バス・乗り合い）についてのインタビュー",
      summary:
        "通院・買い物・通学などの移動で困っていることと、地域の交通に期待することを伺います。",
      description:
        "ふだんの移動手段や、移動で困った経験について教えてください。車を運転する方・しない方、どちらのお話も歓迎です。",
      background:
        "地方部では路線バスの減便や廃止が進み、デマンド交通（予約制の乗り合い）やライドシェアの導入が検討されている。",
      publish_status: "published",
      published_at: new Date().toISOString(),
      status: "public",
      is_featured: false,
      themes: ["ふだんの移動", "困った経験", "期待すること"],
      mode: "loop",
      estimated_duration: 8,
    },
    questions: [
      {
        question: "ふだん、どんな手段で移動することが多いですか？",
        follow_up_guide: null,
        quick_replies: ["自家用車", "バス・電車", "自転車・徒歩", "家族の送迎"],
        question_order: 1,
      },
      {
        question: "移動で困った経験があれば教えてください。",
        follow_up_guide: "いつ・どこへの移動か、代わりにどうしたかを聞く",
        quick_replies: null,
        question_order: 2,
      },
    ],
  },
  {
    interview: {
      slug: "disaster-preparedness",
      name: "家庭での防災の備えについてのインタビュー（募集終了）",
      summary: "家庭での防災の備えと、避難の不安について伺いました。",
      description: "このインタビューの募集は終了しました。",
      publish_status: "published",
      published_at: new Date().toISOString(),
      status: "closed",
      themes: ["家庭の備え", "避難の不安"],
      mode: "loop",
      estimated_duration: 8,
    },
    questions: [
      {
        question: "ご家庭で、どんな防災の備えをしていますか？",
        follow_up_guide: null,
        quick_replies: ["水・食料", "非常持ち出し袋", "特にしていない"],
        question_order: 1,
      },
    ],
  },
];

/** 公開された会話のサンプル（1件目のインタビューに付ける） */
export const sampleReports = [
  {
    summary:
      "共働きで保育園のお迎えに間に合わない日がある。延長保育の申し込みをもっと簡単にしてほしい。",
    role: "daily_life_affected" as const,
    role_title: "共働きの保護者",
    stance: "neutral" as const,
    messages: [
      { role: "assistant" as const, content: "子育てに関わる中で、いま一番困っていることは何ですか？" },
      { role: "user" as const, content: "仕事が長引いて、保育園のお迎えに間に合わない日があることです。" },
      { role: "assistant" as const, content: "そういう日はどうされていますか？" },
      { role: "user" as const, content: "延長保育を使いたいけど、前日までに紙で申し込む必要があって、急な残業だと使えません。" },
    ],
  },
  {
    summary:
      "子育ての相談窓口があることを知らなかった。必要な情報が届く仕組みがほしい。",
    role: "general_citizen" as const,
    role_title: "子育て中の会社員",
    stance: "neutral" as const,
    messages: [
      { role: "assistant" as const, content: "使ったことのある子育て支援で、使いにくかった点はありますか？" },
      { role: "user" as const, content: "そもそも相談窓口があるのを知らなかったです。子どもが2歳になってから知りました。" },
    ],
  },
];
