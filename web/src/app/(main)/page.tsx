import { Container } from "@/components/layouts/container";
import { InterviewCard } from "@/features/interviews/client/components/interview-card";
import { InterviewList } from "@/features/interviews/client/components/interview-list";
import { getInterviewList } from "@/features/interviews/server/loaders/get-interview";

// 一覧はキャッシュ（unstable_cache）で返すので、ページ自体は動的に描画する
export const dynamic = "force-dynamic";

export default async function Home() {
  const interviews = await getInterviewList();
  const pickups = interviews.filter((i) => i.is_featured);

  return (
    <Container>
      <div className="flex flex-col gap-10 pt-24 pb-16 md:pt-10">
        <section className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-black">インタビュー一覧</h1>
          <p className="text-[15px] leading-[1.8] text-mirai-text-note">
            AIインタビュアーが、テーマごとにあなたのお話をうかがいます。匿名で参加できます。
          </p>
        </section>

        {pickups.length > 0 && (
          <section className="flex flex-col gap-4">
            <div>
              <p className="font-lexend text-sm font-semibold tracking-[0.14em] text-primary-accent">
                PICKUP
              </p>
              <h2 className="text-xl font-bold text-black">
                注目のインタビュー
              </h2>
            </div>
            {pickups.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                variant="pickup"
              />
            ))}
          </section>
        )}

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-black">すべてのインタビュー</h2>
          {interviews.length > 0 ? (
            <InterviewList interviews={interviews} />
          ) : (
            <p className="text-sm text-mirai-text-secondary">
              公開中のインタビューはまだありません。
            </p>
          )}
        </section>
      </div>
    </Container>
  );
}
