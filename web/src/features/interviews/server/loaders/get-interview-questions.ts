import type { InterviewQuestion } from "@/features/interview-session/shared/types";
import { findInterviewQuestionsByInterviewId } from "../repositories/interview-repository";

export async function getInterviewQuestions(
  interviewId: string
): Promise<InterviewQuestion[]> {
  try {
    const data = await findInterviewQuestionsByInterviewId(interviewId);
    return data || [];
  } catch (error) {
    console.error("Failed to fetch interview questions:", error);
    return [];
  }
}
