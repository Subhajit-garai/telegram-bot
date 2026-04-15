import express from "express";
import "dotenv/config";
import TelegramBot from "./utils/Telegrambot.js";
import QuizManager from "./manager/quizManager.js";
import UserManager from "./manager/userManager.js";
import { isAdmin, isGroupValid } from "./middlewere/userAuth.js";
import { Conversation } from "./manager/conversationSession.js";
import "./conversation/feedback.js";
import { logger } from "./utils/logger.js";
import { QuizeSetupFunction } from "./utils/TelegramQuiz.js";

const PORT = process.env.PORT || 4444;
const WEBHOOK_URL = `${process.env.WEBHOOK_URL}/webhook`;

const app = express();
app.use(express.json());

export const quiz = new QuizManager();
export const bot = TelegramBot.getInstance();
export const um = UserManager.getInstance();
export const conv = Conversation.getInstance();

// Handle incoming Telegram updates
bot.on("/start", async (update) => {
  let chatId = update.message.chat.id;
  await bot.sendMessage(
    chatId,
    `Welcome to the exambuddys !! \n
     Type /sendMyId to get your telegram id.
     Type /help to get more info.
     Type /quiz to start a quiz.
     Type /schdule to get schdule of quiz.

     ** Error Reporting **
     Type !Error to report any error.
     Type !Error 20 to report error with question number (20).
     `
  );
});


bot.on("/sendchatid", isAdmin, async (update) => {
  let userid = update.message.from.id;
  let chatId = update.message.chat.id;
  await bot.sendMessage(userid, `chat id is : ->${chatId}`);
});
bot.on("/sendthreadid", isAdmin, async (update) => {
  let userid = update.message.from.id;
  let thread_id = update.message.message_thread_id;
  await bot.sendMessage(userid, `thread id is : ->${thread_id}`);
});

bot.setPollHandler(quiz.handle_poll_answer);

bot.on("/sendMyId", async (update) => {
  let chatId = update.message.chat.id;
  let userId = update.message.from.id;

  await bot.sendMessage(chatId, `your id is : ->${userId}`);
});



bot.on("/quiz", isGroupValid, isAdmin, async (update) => {
  logger.success("starting new quiz ...")

  await QuizeSetupFunction(
    String(update.message.from.id),
    String(update.message.chat.id),
    "quiz",
    "TELEGRAM",
    update.message.chat.type
  );

});

// need some security and authentication
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  await bot.handleUpdate(req.body);
});

app.post("/survertask", async (req, res) => {
  let data = req.body;
  switch (data.type) {
    case "quizquestionset":
      quiz.quiz(data);
      break;
    case "unbanuser":
      {
        console.log("unban user request", data);
        await um.unbanUsertask(data.user_id);
      }
      break;
    case "cleaupcache":
      {
        console.log("cleaup cache request..", data);

        quiz.clearcache();
        um.clearcache();

        console.log("cleaup cache done ..");
      }
      break;
    default:
      res.sendStatus(400);
      break;
  }
  res.sendStatus(200);
});

process.on("uncaughtException", (err) => {
  console.error("Unhandled Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

// Start server and set webhook
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
