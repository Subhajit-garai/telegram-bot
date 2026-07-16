import { ExamType } from "../db/schema/enums.js";

export type ExamCategory = "JECA" | "GATE";

export type TaskType =
  | "CREATE_EXAM"
  | "MOCK_PROCESSING"
  | "CREATE_QUIZ"
  | "CREATE_SCORE"
  | "ANS_PROCESSING"
  | "SEND_NOFTIFICATION"
  | "HANDLE_POLL_ANSWER"
  | "SEND_QUIZ_DATA";

export interface Task {
  id: string;
  type: TaskType;
  payload: Record<string, any>;
  category?: ExamCategory;
  variant?: ExamType;
  retries?: number;
}

export type JobType =
  | "QUIZ_SETUP"
  | "QUIZ_PROCESSING"
  | "QUIZ_RESULT"
  | "QUIZ_ANALYSIS"
  | "QUIZ_NOTIFICATION"
  | "QUIZ_ERROR";
export interface Job {
  id: string;
  type: JobType;
  payload: Record<string, any>;
  category?: ExamCategory;
  variant?: ExamType;
  retries?: number;
}
