import express from "express";
import "dotenv/config";
import TelegramBot from "./utils/Telegrambot";
import QuizManager from "./manager/quizManager";
import UserManager from "./manager/userManager";
import { isAdmin, isGroupValid } from "./middlewere/userAuth";
import { Conversation } from "./manager/conversationSession";
import "./conversation/feedback"
import { logger } from "./utils/logger";

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
    `Welcome to the exambuddys ! \n
     Type /sendMyId to get your telegram id.`
  );
});



bot.on("/feedback", async (update) => {
  let chatId = update.message.chat.id;
  let userId = update.message.from.id;
  conv.dispatch("feedback", update)
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


bot.on("!Error", isGroupValid, isAdmin, async (update) => {
  let chatId = update.message.chat.id;
  let userId = update.message.from.id;

  await bot.sendMessage(
    chatId,
    `Can you share more detail about Error : ->${update?.args[0]}`
  );

  // transaction
});

bot.on("!Check", isGroupValid, isAdmin, async (update) => { });

bot.on("/quiz", isGroupValid, isAdmin, async (update) => {
  logger.success("starting new quiz ...")
  await quiz.network.getquestions({
    chatid: update.message.chat.id,
    chat_type: update.message.chat.type,
    userid: update.message.from.id,
    platform: "TELEGRAM"
  });

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
