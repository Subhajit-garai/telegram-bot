import express from "express";
import "dotenv/config";
import { isAdmin, isGroupValid } from "./middlewere/userAuth.js";
import { logger } from "./utils/logger.js";
import { Context, NormalizedContext } from "@subhajit60/bot";
import { TelegramAdaptor } from "./adapter/telegram.js";
import { initQueueWorker } from "./queue/queueWorker.js";
import { TelegramBot } from "./bot.js";

const PORT = process.env.PORT || 4444;
const app = express();
app.use(express.json());

const telegramAdaptor = new TelegramAdaptor();

const bot = new TelegramBot(telegramAdaptor);

// Initialize the queue worker to process jobs from Redis
initQueueWorker(telegramAdaptor, bot.quizmanager);

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

bot.messagehandler.on("/quiz", isGroupValid, async (ctx) => {
  logger.success("starting new quiz ...");
  await bot.quizmanager.quiz(ctx.chatId);
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
