import { bot } from "../index.js";
import { Conversation } from "../manager/conversationSession.js";
import { ContextStep, TelegramUpdate } from "../types/index.js";

let conv = Conversation.getInstance();

conv.addDispatcher("feedback", async (update: TelegramUpdate) => {
  let chatid = update.message.chat.id;
  let userid = update.message.from.id;

  let session = conv.getUserCurrentContext(userid);
  if (!session) return;
  let context = session.context;
  if (context !== "feedback") conv.switchContext(userid, "feedback");
  let step = session.step as ContextStep<"feedback">;

  switch (step) {
    case "start":
      bot.sendMessage(chatid, "Sure! What's your feedback?");
      conv.switchContextStep<"feedback">(userid, "collect");
      break;
    case "collect":
      bot.sendMessage(chatid, " your feedback collected ? any other intruction for me ");
      conv.switchContextStep<"feedback">(userid, "great");
      break;
    case "great":
      bot.sendMessage(chatid, "thank you for giving me feedback");
      conv.switchContextStep<"feedback">(userid, "end");
      break;
    case "end":
      conv.returnToPreviousContext(userid)
      break;
    default:
      console.log("invalid setp , can't be processed");

      break;
  }
});
