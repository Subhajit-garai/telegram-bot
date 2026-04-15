
import TelegramBot from "../utils/Telegrambot.js";
import { TelegramUpdate } from "../types/index.js";

import {
  quiz_info_type,
  quiz_user_answer_type,
  quizConfig_data_type,
} from "../types/quizTypes";
import { randomInt } from "crypto";


class QuizManager {
  private userAnswers: Map<string, quiz_user_answer_type>;
  private quizInfo: Map<string, quiz_info_type>;

  bot: TelegramBot;

  constructor() {
    this.quizInfo = new Map();
    this.userAnswers = new Map();
    this.bot = TelegramBot.getInstance();
  }

  clearcache() {
    console.log("clearing quiz manager cache ....");
    this.userAnswers.clear();
    this.quizInfo.clear();
  }

  reportQuestionError(number?: number) { }
  CheckQuestion(number?: number) { }



  async quiz(data: quizConfig_data_type) {
    let { chatid, thread_id } = data.config;
    // count down
    this.bot.sendMessage(chatid, "Are you ready to quiz?", "TEXT", thread_id);
    this.bot
      .sendMessage(chatid, "Quiz will start in 3 seconds...", "TEXT", thread_id)
      .then((mesg) =>
        this.countdown(chatid, mesg.result.message_id, data, this.sendQuestion)
      );
  }

  countdown = async (
    chatid: number,
    message_id: number,
    data: any,
    next: (data: any) => any
  ) => {
    const countdownSteps = ["⏳ 3", "⏳ 2", "⏳ 1", "🎉 Let's go!"];

    countdownSteps.forEach((text, i) => {
      setTimeout(() => {
        this.bot.editMessageText(chatid, message_id, text);
        if (i === countdownSteps.length - 1) {
          setTimeout(() => {
            next(data);
          }, 500); // 0.5 sec buffer
        }
      }, i * 2000); // each step every 2 second
    });
  };

  handle_poll_answer = async (update: TelegramUpdate) => {
    console.log("collecting ans ....");

    let answer = update?.poll_answer;
    let poll_id = answer.poll_id;
    let selected_option = answer.option_ids[0];
    let data = this.quizInfo.get(poll_id);
    if (!data) {
      console.log("No quiz data found for poll ID:", poll_id);
      return;
    }
    const userId = answer.user.id;
    const quizId = data.quiz_id;
    const correct_option_id = data.correct_option_id;

    // Always get or create the userMap
    const userMap = this.userAnswers.get(quizId) || {};
    const user = userMap[userId];

    // Check answer correctness
    if (correct_option_id === selected_option) {
      if (user) {
        user.score += 1;
        user.attemp += 1;
      } else {
        userMap[userId] = {
          first_name: answer.user.first_name ?? "No name",
          username: answer.user.username ?? "N/A",
          score: 1,
          attemp: 1,
          notattemp: 0,
          wrong: 0,
        };
      }
    } else {
      if (user) {
        user.wrong += 1;
      } else {
        userMap[userId] = {
          first_name: answer.user.first_name,
          username: answer.user.username ?? "N/A",
          score: 0,
          attemp: 0,
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

  sendQuestion = async (data: quizConfig_data_type) => {
    let {
      chatid,
      thread_id,
      userid,
      topics,
      total_questions,
      quizOpenFor,
      nextQuestionTime,
    } = data.config;

    let quiz_id = randomInt(0, 1000000).toString();

    data.questions.map(async (question, i) => {
      let { title, options, ans, explanation, id, extra, format } =
        question;
      let ansid = parseInt(ans[0]) - 1;
      let question_time = i * nextQuestionTime * 1000;
      setTimeout(
        async () => {
          switch (format) {
            case "Code":
              extra
                ? this.bot.sendMessage(
                  chatid,
                  await this.codeFormatter(extra[format]),
                  "HTML",
                  thread_id

                )
                : null;
              break;
            case "Image":
              break;
            default:
              break;
          }

          let message = await this.bot.sendPoll(
            `${i + 1}`,
            chatid,
            (title = `${i + 1}) ${title}`),
            options,
            ansid,
            (explanation =
              explanation.length > 200
                ? explanation.slice(0, 197) + "..."
                : explanation),
            false,
            quizOpenFor,
            thread_id
          );
          if (message) {
            let data: quiz_info_type = {
              quiz_id: quiz_id,
              chat_id: message.result.chat.id,
              message_id: message.result.message_id,
              correct_option_id: ansid,
              poll_id: message.result.poll.id,
              user_id: userid,
            };
            this.quizInfo.set(message.result.poll.id, data); // key is  poll id

            // console.log("quiz info", this.quizInfo);
          }
        },
        question_time
      );
    });

    let Leaderboard_time = total_questions * nextQuestionTime * 1000 + 2 * quizOpenFor * 1000
    setTimeout(
      () => {
        this.showleaderBoard(quiz_id, chatid, thread_id);
      },
      Leaderboard_time
    );
  };

  showleaderBoard(
    quiz_id: string,
    chat_id: number,
    thread_id: number | undefined = undefined
  ) {
    let all_user_data = this.userAnswers.get(quiz_id);
    console.log("quiz id is (in showleaderboard) --->", quiz_id);

    if (!all_user_data) {
      console.log(
        "No quiz data found for quiz ID (in showleaderboard):",
        quiz_id
      );
      return;
    }
    let sorted_users = Object.values(all_user_data).sort(
      (a, b) => b.score - a.score
    );
    let leaderboard_text = "🏆 Quiz Leaderboard 🏆\n\n";
    sorted_users.forEach((user, index) => {
      leaderboard_text += `${index + 1}. ${user.first_name ? user.first_name : user.username
        }  - Score: ${user.score}\n`;
    });
    this.bot.sendMessage(chat_id, leaderboard_text, "TEXT", thread_id);
  }
}

export default QuizManager;
