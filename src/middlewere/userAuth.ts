import axios from "axios";
import { Middleware, TelegramUpdate } from "../types";
import { bot, um } from "..";

export const isGroupValid: Middleware = async (
  update: TelegramUpdate,
  next
) => {
  let ChatType = update.message.chat.type;
  let chatId = update.message.chat.id;

  switch (ChatType) {
    case "group":
      {
        let isValidChat = um.isValidChatId(chatId);
        if (isValidChat) {
          await next(); // Continue if valid group
        } else {
          await bot.sendMessage(
            chatId,
            "❌ This group is not registered with the bot. Please register it first. Contact the @exambuddys admins for more information."
          );
        }
      }
      break;
    case "supergroup":
      {
        let isValidChat = um.isValidChatId(chatId);
        if (isValidChat) {
          await next(); // Continue if valid group
        } else {
          await bot.sendMessage(
            chatId,
            "❌ This group is not registered with the bot. Please register it first. Contact the @exambuddys admins for more information."
          );
        }
      }
      break;
    case "channel":
      await bot.sendMessage(
        chatId,
        "❌ This channel is not registered with the bot. Please register it first. Contact the @exambuddys admins for more information."
      );
      break;

    default:  await next(); // user --> "private"
      break;
  }
};




export const isAdmin: Middleware = async (update: TelegramUpdate , next) => {
  let chatId = update.message.chat.id;
  let userId = update.message.from.id;
  let ChatType = update.message.chat.type;
  let isAdmin = um.isAdmin(userId);
  let isGroupAdmin;
  ChatType == "private"
    ? (isGroupAdmin = false)
    : (isGroupAdmin = await bot.isGroupAdmin(chatId, userId));

  if (isAdmin || isGroupAdmin) {
    // console.log("isAdmin" ,isAdmin);
    // console.log("isGroupAdmin" ,isGroupAdmin);
    
    await next(); // Continue if admin
  } else {
    await bot.sendMessage(
      chatId,
      "❌ You must be an admin to use this command."
    );
  }
};

export const AproveUserTojoin = async (update: TelegramUpdate) => {
  const request = update.chat_join_request;
  const chatId = request.chat.id;
  const userId = request.from.id;
  let linkCreator = request.invite_link.creator.id;

  if (um.isAdmin(linkCreator)) {
    if (!(await um.isGroupOnline(chatId))) {
      await bot.sendMessage(
        userId,
        `❌ Sorry, you are not allowed to join this group.`
      );
      return;
    }

    // user is prime
    let userIsaccessableToJoin = await um.isUserAccessableToJoin(
      userId,
      chatId
    );

    if (!userIsaccessableToJoin.success) {
      await bot.sendMessage(userId, userIsaccessableToJoin.message);
      return;
    }

    // aprove user into group
    let result = await bot.aproveJoinRequest(chatId, userId);
    if (result.ok) {
      await bot.sendMessage(userId, `✅ Welcome to the group!`);
    }
  } else {
    // not tested
    console.log("pass ------ > 5");
    let result = await bot.rejectJoinRequest(chatId, userId);
    if (result.ok) {
      console.log("pass ------ > 6");

      await bot.sendMessage(
        userId,
        `❌ Sorry, you are not allowed to join this group.`
      );
    }
  }
};

// export const isPrimeUser: Middleware = async (chatId, userId, next) => {
//   if () {
//     await next();
//   } else {
//     await bot.sendMessage(chatId, "🔒 This feature is for Prime users only.");
//   }
// };
