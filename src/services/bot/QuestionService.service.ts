import { db } from "@/db/index.js";
import { questions } from "@/db/schema/index.js";

export class QuestionService {
  async getQuizQuestions() {
    let question = await db
      .select({
        id: questions.id,
        title: questions.title,
        options: questions.options,
        ans: questions.ans,
        explanation: questions.explanation,
        format: questions.format,
        allows_multiple_answers: questions.is_multiple_answers,
        extra: questions.extra,
      })
      .from(questions)
      .limit(2);
    return question;
  }
}
