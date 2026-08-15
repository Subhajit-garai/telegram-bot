import { Worker } from "bullmq";
import { QueueManager } from "./queueManager.js";
import { TelegramAdaptor } from "../adapter/telegram.js";
import { logger } from "../utils/logger.js";
import QuizManager from "@/manager/quizManager.js";

export function initQueueWorker(
  telegramAdaptor: TelegramAdaptor,
  quiz: QuizManager,
) {
  const queueManager = QueueManager.getInstance();
  const connection = queueManager.getclient();

  const worker = new Worker(
    "Ttask",
    async (job) => {
      logger.info(`[Queue] Processing job ${job.id} of type ${job.name}`);
      try {
        switch (job.name) {
          case "SEND_NOFTIFICATION":
            {
              const chatId =
                job.data.payload?.chatId ||
                job.data.chatId ||
                job.data.payload?.userid ||
                job.data.userid;
              const text = job.data.payload?.text || job.data.text;
              const thread_id =
                job.data.payload?.thread_id ||
                job.data.thread_id ||
                job.data.payload?.threadId ||
                job.data.threadId;
              if (chatId && text) {
                logger.info(`[Queue] Sending notification to ${chatId}`);
                await telegramAdaptor.sendMessage(
                  text,
                  String(chatId),
                  thread_id,
                );
              } else {
                logger.error(
                  `[Queue] Missing chatId or text in SEND_NOFTIFICATION job:`,
                  job.data,
                );
              }
            }
            break;

          case "SEND_HTML_NOFTIFICATION":
            {
              const chatId = job.data.payload?.chatId || job.data.chatId;
              const text = job.data.payload?.text || job.data.text;
              const thread_id =
                job.data.payload?.thread_id ||
                job.data.thread_id ||
                job.data.payload?.threadId ||
                job.data.threadId;
              if (chatId && text) {
                logger.info(`[Queue] Sending HTML notification to ${chatId}`);
                await telegramAdaptor.sendHtmlMessage(
                  text,
                  String(chatId),
                  thread_id,
                );
              } else {
                logger.error(
                  `[Queue] Missing chatId or text in SEND_HTML_NOFTIFICATION job:`,
                  job.data,
                );
              }
            }
            break;

          case "SEND_POLL":
            {
              const { poll } = job.data.payload;
              logger.info(`[Queue] Sending poll ${poll.number}`);
              const message = await telegramAdaptor.sendPoll(poll);
              if (message) {
                // Register this poll in the QuizManager so answers can be tracked!
                const quizId = poll.quizId;
                const ansid = poll.data.ansid;

                quiz.registerPollInfo(message.result.poll.id, {
                  quiz_id: quizId,
                  chat_id: message.result.chat.id,
                  message_id: message.result.message_id,
                  correct_option_id: ansid,
                  poll_id: message.result.poll.id,
                  user_id: parseInt(poll.chatId),
                });
              }
            }
            break;

          case "SHOW_LEADERBOARD":
            {
              const { quiz_id, chatid, thread_id } = job.data.payload;
              logger.info(`[Queue] Triggering leaderboard for quiz ${quiz_id}`);
              await quiz.showleaderBoard(quiz_id, chatid, thread_id);
            }
            break;

          case "HANDLE_POLL_ANSWER":
            {
              let { poll_id, options, userid, name, username } =
                job.data.payload;

              quiz.handle_poll_answer({
                poll_id: poll_id,
                option_ids: options,
                user_id: userid,
                quiz_id: poll_id,
                user_name: name,
                user_username: username,
              });
            }
            break;
          case "SEND_QUIZ_DATA":
            {
            }
            break;
          case "CREATE_QUIZ":
            {
              logger.info(`[Queue] Starting quiz setup`);
              const chatId =
                job.data.payload?.chatId ||
                job.data.chatId ||
                job.data.payload?.chatid ||
                job.data.chatid ||
                job.data.payload?.userid ||
                job.data.userid;
              if (chatId) {
                await quiz.quiz(String(chatId));
              } else {
                logger.error(
                  `[Queue] Missing chatId in CREATE_QUIZ job:`,
                  job.data,
                );
              }
            }
            break;

          default:
            logger.info(`[Queue] Unhandled job type: ${job.name}`);
            break;
        }
      } catch (err: any) {
        logger.error(`[Queue] Error processing job ${job.id}:`, err);
        throw err;
      }
    },
    { connection },
  );

  worker.on("completed", (job) => {
    logger.success(`[Queue] Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`[Queue] Job ${job?.id} failed with error:`, err);
  });

  logger.info("[Queue] Queue Worker initialized on 'task' queue");
  return worker;
}
