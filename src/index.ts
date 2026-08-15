import express from "express";
import "dotenv/config";
import { isAdmin, isGroupValid } from "./middlewere/userAuth.js";
import { logger } from "./utils/logger.js";
import { Context, NormalizedContext } from "@subhajit60/bot";
import { TelegramAdaptor } from "./adapter/telegram.js";
import { initQueueWorker } from "./queue/queueWorker.js";
import { TelegramBot } from "./bot.js";
import { agent } from "./agent/index.js";

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

bot.messagehandler.on("/question", async (ctx) => {
  let res = ctx;
  // let res = await agent.run("who is pm of india?");

  logger.success(res);
  ctx.reply(res.text);
});
// bot.setPollHandler(quiz.handle_poll_answer);

bot.messagehandler.on("!question", async (ctx) => {});
bot.messagehandler.on("question", async (ctx) => {});

bot.messagehandler.on("/sendMyId", async (ctx) => {
  ctx.reply(`your id is : ->${ctx.update.userId}`);
});

bot.messagehandler.on("/quiz", isGroupValid, async (ctx) => {
  logger.success("starting new quiz ...");
  await bot.quizmanager.quiz(ctx.chatId);
});
bot.messagehandler.on("/poll", isGroupValid, async (ctx) => {
  logger.success("poll reciver  ...");
});

bot.messagehandler.on("/poll_answer", async (ctx) => {
  bot.queue.push({
    id: ctx.chatId,
    type: "HANDLE_POLL_ANSWER",
    payload: ctx.update?.payload || {},
  });
});

bot
  .start()
  .then(() => {
    app.post("/webhook", async (req, res) => {
      res.sendStatus(200);
      // console.log(req.body);
      let ctx: NormalizedContext | undefined;

      let update = req.body;

      if (update?.poll_answer) {
        logger.success(
          "Poll answer received for user :---->",
          update.poll_answer?.user?.first_name +
            "(" +
            update.poll_answer?.user?.id +
            ")",
        );

        ctx = {
          platform: telegramAdaptor.getPlatformName(),
          userId: update.poll_answer.user.id,
          chatId: update.poll_answer.user.id,
          role: update?.message?.role || "User",
          command: "/poll_answer",
          args: [],
          text: "no text",
          type: "command",
          payload: {
            poll_id: update.poll_answer?.poll_id,
            options: update.poll_answer.option_ids,
            userid: update.poll_answer.user.id,
            name: update.poll_answer.user.first_name,
            username: update.poll_answer.user.username,
          },
          raw: update.poll_answer,
        };
      } else if (update?.new_chat_members) {
        const { command, args, messageType } =
          bot.messagehandler.messageExtractor(update?.message?.text);

        ctx = {
          platform: telegramAdaptor.getPlatformName(),
          userId: update.message.from.id,
          chatId: update.message.chat.id,
          role: update.message.role || "User",
          command: command,
          args: args,
          text: update?.message?.text,
          type: "new_member",
          raw: update.message,
        };
      } else if (update.message) {
        // const session = this.Conversation.userSessions.get(userId)!; // getting session info
        const { command, args, messageType } =
          bot.messagehandler.messageExtractor(update?.message?.text);
        ctx = {
          platform: telegramAdaptor.getPlatformName(),
          userId: update.message.from.id,
          chatId: update.message.chat.id,
          role: update.message.role || "User",
          command: command,
          args: args,
          text: update?.message?.text,
          type: messageType,
          raw: update.message,
        };
      } else if (update.poll) {
        // logger.info("recived poll data");
        ctx = {
          platform: telegramAdaptor.getPlatformName(),
          userId: update?.message?.from?.id,
          chatId: update?.message?.chat?.id,
          role: update?.message?.role || "User",
          command: "/poll",
          args: [],
          text: "no tex",
          type: "command",
          raw: update?.message,
        };
      }
      // else if (update?.chat_join_request) {
      //   // AproveUserTojoin(update);
      // }

      if (!ctx) {
        logger.info(
          "[Webhook] Received unhandled Telegram update type:",
          Object.keys(update),
        );

        logger.info("full info of new / unhandled update", update);
        return;
      }
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
