import { Middleware, Context } from "@subhajit60/bot";
import { TelegramUpdate } from "../types/index.js";

export const isGroupValid: Middleware = async (
  ctx: Context,
  data: any,
  next?: any,
) => {
  const actualNext = typeof data === "function" ? data : next;
  let ChatType = ctx.update.raw?.chat?.type;
  let chatId = parseInt(ctx.chatId);

  switch (ChatType) {
    case "group":
      {
        let isValidChat = false;
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
        let isValidChat = false;
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
  let chatId = parseInt(ctx.chatId);
  let userId = parseInt(ctx.userId);
  let ChatType = ctx.update.raw?.chat?.type;
  let isAdmin = false;
  let isGroupAdmin;
  ChatType == "private"
    ? (isGroupAdmin = false)
    : // : (isGroupAdmin =
      //     await ctx.platformInstance?.isGroupAdmin(chatId, userId));
      false;

  if (isAdmin || isGroupAdmin) {
    if (actualNext) await actualNext(); // Continue if admin
  } else {
    await ctx.reply("❌ You must be an admin to use this command.");
  }
};
