ALTER TABLE "public"."interview_questions"
  ADD COLUMN "allow_multiple" boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN "public"."interview_questions"."allow_multiple" IS 'クイックリプライを複数選択できるか（false は単一選択）';
