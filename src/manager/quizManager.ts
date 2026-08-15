import { TelegramUpdate } from "../types/index.js";
import {
  exam_question_format_type,
  quiz_info_type,
  quiz_user_answer_type,
} from "../types/quizTypes.js";
import { randomInt } from "crypto";
import { QueueManager } from "../queue/queueManager.js";
import { BotService } from "../services/bot.service.js";
import { logger } from "@/utils/logger.js";
import { quizCacheManager } from "@/utils/radisProvider.js";

class QuizManager {
  private userAnswers: Map<string, quiz_user_answer_type>;
  public quizInfo: Map<string, quiz_info_type>;
  private queue: QueueManager;
  private botService: BotService;
  private quizdb: quizCacheManager; // redis cache db

  constructor() {
    this.quizInfo = new Map();
    this.userAnswers = new Map();
    this.queue = QueueManager.getInstance();
    this.botService = new BotService();
    this.quizdb = quizCacheManager.getInstance();
  }

  clearcache() {
    console.log("clearing quiz manager cache ....");
    this.userAnswers.clear();
    this.quizInfo.clear();
  }

  reportQuestionError(number?: number) {}
  CheckQuestion(number?: number) {}

  async quiz(chatid: string) {
    let thread_id = null;

    let quiz_id = ""; // pick one of quiz from redis cache

    await this.queue.push({
      id: `${quiz_id}_start_msg1`,
      type: "SEND_NOFTIFICATION" as any,
      payload: {
        chatId: chatid,
        text: "Are you ready to quiz?",
        thread_id,
      },
    });

    await this.queue.push(
      {
        id: `${quiz_id}_start_msg2`,
        type: "SEND_NOFTIFICATION" as any,
        payload: {
          chatId: chatid,
          text: "Quiz will start in 3 seconds...",
          thread_id,
        },
      },
      { delay: 1000 },
    );

    // Send questions starting 3 seconds later
    await this.sendQuestion(chatid, quiz_id, thread_id);
  }

  handle_poll_answer = async (answer: {
    poll_id: string;
    option_ids: number[];
    user_id: string;
    user_name: string;
    user_username: string;
    quiz_id: string;
  }) => {
    logger.info("collecting ans ....");
    let poll_id = answer.poll_id;
    let selected_option = answer.option_ids[0];
    let data = this.quizInfo.get(poll_id);

    if (!data) {
      logger.error("No quiz data found for poll ID:", poll_id);
      return;
    }
    const userId = answer.user_id;
    const quizId = data.quiz_id;
    const correct_option_id = data.correct_option_id;

    // get user data from user Manager

    let User = {
      name: answer.user_name,
      username: answer.user_username,
    };

    // Always get or create the userMap
    const userMap = this.userAnswers.get(quizId) || {};
    const userAnswerData = userMap[userId];

    // Check answer correctness
    if (correct_option_id === selected_option) {
      if (userAnswerData) {
        userAnswerData.score += 1;
        userAnswerData.attemp += 1;
      } else {
        userMap[userId] = {
          name: User.name ?? "No name",
          username: User.username ?? "N/A",
          score: 1,
          attemp: 1,
          notattemp: 0,
          wrong: 0,
        };
      }
    } else {
      if (userAnswerData) {
        userAnswerData.wrong += 1;
        userAnswerData.attemp += 1;
      } else {
        userMap[userId] = {
          name: User.name,
          username: User.username ?? "N/A",
          score: 0,
          attemp: 1,
          notattemp: 0,
          wrong: 1,
        };
      }
    }

    // Update the userMap in the main map
    this.userAnswers.set(quizId, userMap);
  };
  // in dev
  codeFormatter = async (code: string) => {
    let formatted: string = "";
    function escapeHTML(text: string) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    let escapedStr = escapeHTML(code);
    formatted = `<pre><code>${escapedStr}</code></pre>`;
    return formatted;
  };

  sendQuestion = async (
    chatid: string,
    quiz_id: string,
    thread_id?: number | null,
  ) => {
    let config: any = {
      total_questions: 2,
      nextQuestionTime: 30, // Default 30 seconds
      quizOpenFor: 20, // Default 20 seconds
    };

    //  reciveing question here

    // check is any quiz data in cache
    try {
      config = await this.botService.telegram.getQuizConfig(chatid);
    } catch (e) {
      logger.info("useing default config");
    }

    const nextQuestionTime = config.nextQuestionTime || 30;
    const quizOpenFor = config.quizOpenFor || 20;
    let key = "quiz:data:" + quiz_id;

    // const questions = await this.botService.question.getQuizQuestions(); // collect from cache
    const questions: exam_question_format_type[] =
      await this.quizdb.getQuizQuestions(quiz_id); // collect from cache

    // end quesion recive

    const total_questions = questions.length;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      let {
        title,
        options,
        ans,
        explanation, // this fields are not sended in live quiz .
        id,
        extra,
        format,
        is_multiple_ans,
      } = question?.question!;
      let ansid = ans ? parseInt(ans[0]) - 1 : 0;
      let question_time = 3000 + i * nextQuestionTime * 1000;

      if (format === "Code" && extra) {
        const formattedCode = await this.codeFormatter((extra as any)[format]);
        await this.queue.push(
          {
            id: `${quiz_id}_q${i}_code`,
            type: "SEND_HTML_NOFTIFICATION" as any,
            payload: {
              chatId: chatid,
              text: formattedCode,
              thread_id: thread_id ?? undefined,
            },
          },
          { delay: question_time },
        );
      }

      const pollDelay =
        format === "Code" && extra ? question_time + 200 : question_time;
      await this.queue.push(
        {
          id: `${quiz_id}_q${i}_poll`,
          type: "SEND_POLL" as any,
          payload: {
            poll: {
              number: `${i + 1}`,
              chatId: String(chatid),
              data: {
                question: `${i + 1}) ${title}`,
                options,
                ansid,
                explanation: explanation
                  ? explanation.length > 200
                    ? explanation.slice(0, 197) + "..."
                    : explanation
                  : "no explanation",
                is_multiple_ans: is_multiple_ans || false,
                quizOpenFor,
                thread_id: thread_id ?? undefined,
              },
              quizId: quiz_id,
            },
          },
        },
        { delay: pollDelay },
      );
    }

    let Leaderboard_time =
      3000 + total_questions * nextQuestionTime * 1000 + 2 * quizOpenFor * 1000;
    await this.queue.push(
      {
        id: `${quiz_id}_leaderboard_trigger`,
        type: "SHOW_LEADERBOARD" as any,
        payload: {
          quiz_id,
          chatid: parseInt(chatid),
          thread_id: thread_id ?? undefined,
        },
      },
      { delay: Leaderboard_time },
    );
  };

  registerPollInfo(pollId: string, info: quiz_info_type) {
    this.quizInfo.set(pollId, info);
    console.log(`[Quiz] Registered poll info for pollId: ${pollId}`);
  }

  showleaderBoard(
    quiz_id: string,
    chat_id: number,
    thread_id: number | undefined = undefined,
  ) {
    let all_user_data = this.userAnswers.get(quiz_id);
    logger.success("quiz id is (in showleaderboard) --->", quiz_id);

    if (!all_user_data) {
      logger.error(
        "No quiz data found for quiz ID (in showleaderboard):",
        quiz_id,
      );
      return;
    }

    logger.info("user data", all_user_data);

    let sorted_users = Object.values(all_user_data).sort(
      (a, b) => b.score - a.score,
    );
    let leaderboard_text = "🏆 Quiz Leaderboard 🏆\n\n";
    sorted_users.forEach((user, index) => {
      let accuracy = "";
      if (user.attemp + user.wrong > 0) {
        accuracy =
          ((user.score / (user.score + user.wrong)) * 100).toFixed(2) + "%";
      }
      leaderboard_text += `${index + 1}. ${
        user.name ? user.name : user.username
      }  - Score: ${user.score}( ${accuracy} ) ,A- ${user.attemp} W-${user.wrong} \n`;
    });

    this.queue.push({
      id: `${quiz_id}_leaderboard_msg`,
      type: "SEND_NOFTIFICATION" as any,
      payload: {
        chatId: chat_id,
        text: leaderboard_text,
        thread_id,
      },
    });
  }
}

export default QuizManager;
