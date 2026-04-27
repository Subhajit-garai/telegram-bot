
import { QueueManager } from "@/queue/queueManager.js";
const queueManager = QueueManager.getInstance();



export const QuizeSetupFunction = async (
  user_id: string,
  chat_id: string,
  type: "quiz",
  platform: string,
  chat_type: string,

) => {


  const cbUrl = `${process.env.WEBHOOK_URL}/survertask`;




  let Notifystatus = await queueManager.push({
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
