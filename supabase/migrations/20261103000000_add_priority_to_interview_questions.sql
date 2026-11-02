ALTER TABLE "public"."interview_questions"
  ADD COLUMN "priority" text NOT NULL DEFAULT 'normal'
  CONSTRAINT "interview_questions_priority_check" CHECK ("priority" IN ('required', 'normal', 'optional'));

COMMENT ON COLUMN "public"."interview_questions"."priority" IS '質問の優先度（required=必ず聞く / normal=通常 / optional=時間が足りなければ省略してよい）';

COMMENT ON COLUMN "public"."interview_questions"."target_audience" IS '対象者条件（任意）。全モードで、当てはまらない回答者にはAIが質問を飛ばす';
