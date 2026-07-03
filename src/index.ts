import express from "express";
import "dotenv/config";
import QuizManager from "./manager/quizManager.js";
import { isAdmin, isGroupValid } from "./middlewere/userAuth.js";
import { logger } from "./utils/logger.js";
import { QuizeSetupFunction } from "./utils/TelegramQuiz.js";

import { Bot, Context, NormalizedContext } from "@subhajit60/bot";
import { TelegramAdaptor } from "./adapter/telegram.js";

const PORT = process.env.PORT || 4444;
const app = express();
app.use(express.json());

export const quiz = new QuizManager();

const telegramAdaptor = new TelegramAdaptor();
const bot = new Bot(telegramAdaptor);

// use bot lib

bot.messagehandler.on("/start", async (ctx) => {
  ctx.reply(
    `Welcome to the exambuddys !! \n
     Type /sendMyId to get your telegram id.
     Type /help to get more info.
     Type /quiz to start a quiz.
     Type /schdule to get schdule of quiz.

     ** Error Reporting **
     Type !Error to report any error.
     Type !Error 20 to report error with question number (20).
     `,
  );
});

bot.messagehandler.on("/sendchatid", isAdmin, async (ctx) => {
  ctx.reply(`chat id is : ->${ctx.update.chatId}`);
});
bot.messagehandler.on("/sendthreadid", isAdmin, async (ctx) => {
  let thread_id = ctx.update.raw?.message_thread_id;
  ctx.reply(`thread id is : ->${thread_id}`);
});

// bot.setPollHandler(quiz.handle_poll_answer);

bot.messagehandler.on("/sendMyId", async (ctx) => {
  ctx.reply(`your id is : ->${ctx.update.userId}`);
});

bot.messagehandler.on("/quiz", isGroupValid, isAdmin, async (ctx) => {
  logger.success("starting new quiz ...");

  await QuizeSetupFunction(
    String(ctx.update.userId),
    String(ctx.update.chatId),
    "quiz",
    "TELEGRAM",
    ctx.update.type,
  );
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
        // await um.unbanUsertask(data.user_id);
      }
      break;
    case "cleaupcache":
      {
        console.log("cleaup cache request..", data);

        quiz.clearcache();
        // um.clearcache();

        console.log("cleaup cache done ..");
      }
      break;
    default:
      res.sendStatus(400);
      break;
  }
  res.sendStatus(200);
});

bot
  .start()
  .then(() => {
    app.post("/webhook", async (req, res) => {
      res.sendStatus(200);
      console.log(req.body);

      // here check user is admin , from user manager .
      //  if no entry  then add user record .

      let ctx: NormalizedContext = {
        platform: telegramAdaptor.getPlatformName(),
        userId: req.body.message.from.id,
        chatId: req.body.message.chat.id,
        role: req.body.message.role || "User",
        text: req.body.message.text,
        type: req.body.message.text,
        raw: req.body.message,
      };

      let context = new Context(ctx, telegramAdaptor);
      await bot.messagehandler.handleEvent(context);
    });
  })
  .catch((reason) => {
    console.log(reason);
  });
// Handle incoming Telegram updates

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
