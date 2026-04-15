
import prisma from "@repo/db/index.js";
import { logger } from "./logger.js";
import { TaskQueue } from "./radisProvider.js";
const redis = TaskQueue.getInstance();



export const QuizeSetupFunction = async (
  user_id: string,
  chat_id: string,
  type: "quiz",
  platform: string,
  chat_type: string,

) => {


  const cbUrl = `${process.env.WEBHOOK_URL}/survertask`;

  let Notifystatus = await redis.push({
    type: "SEND_QUIZ_DATA",
    id: String(chat_id),
    payload: {
      cburl: cbUrl,
      userid: user_id,
      chatid: chat_id,
      platfrom: platform,
      chat_type: chat_type,
    },
    variant: "Quiz",
    category: "JECA"
  });

  return Notifystatus;
};
