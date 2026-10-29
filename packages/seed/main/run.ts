import { seedLocalAdminUser } from "../shared/admin-user";
import { clearAllData, createAdminClient } from "../shared/helper";
import { sampleInterviews, sampleReports } from "./data";

async function seedDatabase() {
  const supabase = createAdminClient();
  console.log("🌱 Starting database seeding...");

  await clearAllData(supabase);

  // ローカル開発用の admin ユーザー（ローカル接続時のみ作成される）
  await seedLocalAdminUser(supabase);

  const interviewIds: string[] = [];
  for (const { interview, questions } of sampleInterviews) {
    const { data, error } = await supabase
      .from("interviews")
      .insert(interview)
      .select("id")
      .single();
    if (error) throw new Error(`Failed to insert interview: ${error.message}`);
    interviewIds.push(data.id);

    const { error: qError } = await supabase
      .from("interview_questions")
      .insert(questions.map((q) => ({ ...q, interview_id: data.id })));
    if (qError) throw new Error(`Failed to insert questions: ${qError.message}`);
  }
  console.log(`✅ Inserted ${interviewIds.length} interviews`);

  // 公開された会話のサンプル（匿名ユーザーで作る）
  const targetInterviewId = interviewIds[0];
  for (const report of sampleReports) {
    const { data: auth, error: authError } =
      await supabase.auth.admin.createUser({
        email: `seed-${crypto.randomUUID()}@example.com`,
        email_confirm: true,
      });
    if (authError) throw new Error(`Failed to create user: ${authError.message}`);

    const startedAt = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    const { data: session, error: sError } = await supabase
      .from("interview_sessions")
      .insert({
        interview_id: targetInterviewId,
        user_id: auth.user.id,
        started_at: startedAt,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (sError) throw new Error(`Failed to insert session: ${sError.message}`);

    const { error: mError } = await supabase.from("interview_messages").insert(
      report.messages.map((m, i) => ({
        ...m,
        interview_session_id: session.id,
        created_at: new Date(Date.now() - (20 - i) * 60 * 1000).toISOString(),
      }))
    );
    if (mError) throw new Error(`Failed to insert messages: ${mError.message}`);

    const { error: rError } = await supabase.from("interview_report").insert({
      interview_session_id: session.id,
      summary: report.summary,
      role: report.role,
      role_title: report.role_title,
      stance: report.stance,
      opinions: [],
      is_public_by_user: true,
      is_public_by_admin: true,
      moderation_score: 0,
      content_richness: { total: 60 },
    });
    if (rError) throw new Error(`Failed to insert report: ${rError.message}`);
  }
  console.log(`✅ Inserted ${sampleReports.length} public reports`);
  console.log("🎉 Database seeding completed!");
}

seedDatabase().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
