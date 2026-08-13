import { Middleware, Context } from "@subhajit60/bot";
import { logger } from "@subhajit60/aiagent";

export const isGroupValid: Middleware = async (
  ctx: Context,
  data: any,
  next?: any,
) => {
  const actualNext = typeof data === "function" ? data : next;
  let ChatType = ctx.update.raw?.chat?.type;
  let chatId = ctx.chatId;
  let isValidChat = false;
  switch (ChatType) {
    case "group":
      {
        isValidChat = await ctx.platformInstance.isValidChat(chatId);
        if (isValidChat) {
          if (actualNext) await actualNext(); // Continue if valid group
        } else {
          await ctx.reply(
            "❌ This group is not registered with the bot. Please register it first. Contact the @exambuddys admins for more information.",
          );
        }
      }
      break;
    case "supergroup":
      {
        isValidChat = await ctx.platformInstance.isValidChat(chatId);

        logger.info("is super group is valid ?  ", isValidChat);
        if (isValidChat) {
          if (actualNext) await actualNext(); // Continue if valid group
        } else {
          await ctx.reply(
            "❌ This group is not registered with the bot. Please register it first. Contact the @exambuddys admins for more information.",
          );
        }
      }
      break;
    case "channel":
      await ctx.reply(
        "❌ This channel is not registered with the bot. Please register it first. Contact the @exambuddys admins for more information.",
      );
      break;

    default:
      if (actualNext) await actualNext(); // user --> "private"
      break;
  }
};

export const isAdmin: Middleware = async (
  ctx: Context,
  data: any,
  next?: any,
) => {
  const actualNext = typeof data === "function" ? data : next;
  let ChatType = ctx.update.raw?.chat?.type;
  let isAdmin = false;
  let isGroupAdmin;
  ChatType == "private"
    ? (isGroupAdmin = false)
    : (isGroupAdmin = await ctx.isAdmin());

  if (isAdmin || isGroupAdmin) {
    if (actualNext) await actualNext(); // Continue if admin
  } else {
    await ctx.reply("❌ You must be an admin to use this command.");
  }
};
