import { IPlatformAdaptor, NormalizedContext } from "@subhajit60/bot";
// import TelegramBot from "../utils/Telegrambot.js";
import axios from "axios";
import { logger } from "@/utils/logger.js";

export class TelegramAdaptor extends IPlatformAdaptor {
  #token: string; //private infomation , it not log
  #WEBHOOK_URL: string;
  #apiUrl: string;

  constructor() {
    super();
    this.#token = process.env.BOT_TOKEN?.trim()!;
    this.#WEBHOOK_URL = `${process.env.WEBHOOK_URL?.trim()!}/webhook`;
    this.#apiUrl = `https://api.telegram.org/bot${this.#token}`;

    if (!this.#token || !this.#WEBHOOK_URL) {
      throw new Error(
        "Please provide BOT_TOKEN and WEBHOOK_URL in the environment variables",
      );
    }

    this.init();
  }
  getPlatformName(): string {
    return "Telegram";
  }

  getPlatformVersion(): string {
    return "1.0.0";
  }

  getPlatformType(): string {
    return "Mobile";
  }

  getPlatformInfo(): { name: string; version: string; type: string } {
    return {
      name: this.getPlatformName(),
      version: this.getPlatformVersion(),
      type: this.getPlatformType(),
    };
  }

  // copy from telegram bot lib

  async init() {
    await this.setWebhook(this.#WEBHOOK_URL);
  }

  getUrl(path: string): string {
    return `${this.#apiUrl}${path}`;
  }

  async isAdmin(chatId: string, userId: string): Promise<boolean> {
    try {
      const url = this.getUrl("/getChatAdministrators");
      const response = await axios.get(url, { params: { chat_id: chatId } });

      const admins = response.data.result;
      // console.log("is admin ", admins);

      let status = admins.some((admin: any) => admin.user.id === userId);
      return status;
    } catch (error: any) {
      console.error(
        "Error checking admin status:",
        error.response?.data || error,
      );
      return false;
    }
  }

  // isChatValid = async (update: TelegramUpdate) => {
  //   let ChatType = update.message.chat.type;
  //   let chatId = update.message.chat.id;

  //   switch (ChatType) {
  //     case "group":
  //       {
  //         let isValidChat = this.um.isValidChatId(chatId);
  //         if (isValidChat) {
  //           return true; // Continue if valid group
  //         } else {
  //           await this.sendMessage(
  //             chatId,
  //             "❌ This group is not registered with the bot. Please register it first. Contact the @exambuddys admins for more information."
  //           );
  //           return false;
  //         }
  //       }
  //       break;
  //     case "supergroup":
  //       {
  //         let isValidChat = this.um.isValidChatId(chatId);
  //         if (isValidChat) {
  //           return true; // Continue if valid group
  //         } else {
  //           await this.sendMessage(
  //             chatId,
  //             "❌ This group is not registered with the bot. Please register it first. Contact the @exambuddys admins for more information."
  //           );
  //           return false;
  //         }
  //       }
  //       break;
  //     case "channel":
  //       await this.sendMessage(
  //         chatId,
  //         "❌ This channel is not registered with the bot. Please register it first. Contact the @exambuddys admins for more information."
  //       );
  //       break;

  //     default:
  //       return true; // user --> "private"
  //       break;
  //   }
  // };

  handleNewUsers(update: NormalizedContext) {
    const chatId = update.raw?.message?.chat?.id!;
    const newUsers = update.raw?.message?.new_chat_members!.map(
      (user: any) => user.username,
    );
    const welcomeMessage = `Welcome to the exambudys! New members: ${newUsers?.join(", ")}`;
    this.sendMessage(chatId, welcomeMessage); // here it will be fixes thread
  }
  async sendHtmlMessage(
    text: string,
    chatId: string,
    thread_id: number | undefined = undefined,
  ) {
    let url = this.getUrl("/sendMessage");
    let res = await axios.post(url, {
      chat_id: parseInt(chatId),
      ...(thread_id ? { message_thread_id: thread_id } : {}),
      text: text,
      parse_mode: "HTML", // for markdown and html
    });
  }
  async sendMessage(
    text: string,
    chatId: string,
    thread_id: number | undefined = undefined,
  ) {
    try {
      let url = this.getUrl("/sendMessage");
      let res;
      res = await axios.post(url, {
        chat_id: parseInt(chatId),
        ...(thread_id ? { message_thread_id: thread_id } : {}),
        text,
      });

      if (res.status === 200) {
        return res.data;
      } else {
        return false;
      }
    } catch (error: any) {
      console.error("Error sending message:", error.response?.data);
    }
  }

  async editMessageText(
    chatId: number,
    messageId: number,
    newText: string,
    thread_id: number | undefined = undefined,
  ) {
    let url = this.getUrl("/editMessageText");
    const payload = {
      chat_id: chatId,
      ...(thread_id ? { message_thread_id: thread_id } : {}),

      message_id: messageId,
      text: newText,
    };

    let res = await axios.post(url, payload);
    if (res.status === 200) {
      return res.data;
    } else {
      return false;
    }
  }
  // Send POLL to a user
  //   async sendPoll(number: string, chatId: string, data: any) {
  async sendPoll(poll: any) {
    type question_data = {
      question: string;
      options: string[];
      ansid: number;
      explanation: string;
      allows_multiple_answers: boolean;
      quizOpenFor: number;
      thread_id: number | undefined;
    };

    type poll_data = {
      number: string;
      chatId: string;
      data: question_data;
    };

    let { number, chatId } = poll as poll_data;

    let {
      question,
      options,
      ansid,
      explanation,
      allows_multiple_answers,
      quizOpenFor,
      thread_id,
    } = poll.data as question_data;
    try {
      let response = await axios.post(this.getUrl("/sendPoll"), {
        chat_id: parseInt(chatId),
        ...(thread_id ? { message_thread_id: thread_id } : {}),

        question: question,
        options: options,
        type: "quiz", // Makes it a quiz
        correct_option_id: ansid,
        is_anonymous: false, // Users should see their answers
        explanation: explanation, // Optional explanation
        open_period: quizOpenFor,
        allows_multiple_answers: allows_multiple_answers,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error sending message:", error.response?.data);
      this.sendMessage(
        chatId,
        `${number} Error:-> Content length has exceeded the maximum allowed characters.`,
      );
    }
  }

  // Set webhook for Telegram
  private async setWebhook(url: string) {
    try {
      const res = await axios.get(`${this.#apiUrl}/getWebhookInfo`);
      if (res.status !== 200) {
        console.error("Failed to get webhook info:", res);
        console.error("requested url :", `${this.#apiUrl}/getWebhookInfo`);
        return;
      }
      const data = res.data;
      if (data.result && data.result.url === url) {
        // can be here
        console.log("Webhook is already set correctly.");
        return;
      }
      console.log("Updating webhook to:", url);
      const response = await axios.post(`${this.#apiUrl}/setWebhook`, { url });
      console.log("Webhook set:", response.data);
    } catch (error: any) {
      console.error("Error setting webhook:", error.response?.data || error);
    }
  }

  async getChatMember(userid: number, chatid: number) {
    if (userid == null || isNaN(userid)) {
      logger.error("Invalid User ID: ID is null, undefined, or NaN");
      return;
    }
    let url = this.getUrl(`/getChatMember?chat_id=${chatid}&user_id=${userid}`);

    try {
      let responce = await axios.post(url);
      if (responce.status === 200) {
        return responce.data.result;
      }
    } catch (error: any) {
      logger.error(error?.response?.data?.description);
    }
  }
  // ban and unban`

  async banUser(userid: number, chatid: number) {
    let url = this.getUrl(`/banChatMember?chat_id=${chatid}&user_id=${userid}`);
    let responce = await axios.post(url);
    if (responce.status === 200) {
      console.log("ban user successful .... ", responce.data);
      return responce.data;
    }
    return null;
  }

  async UnbanUser(userid: number, chatid: number) {
    let url = this.getUrl(
      `/unbanChatMember?chat_id=${chatid}&user_id=${userid}`,
    );
    let responce = await axios.post(url);
    if (responce.status === 200) {
      console.log("unban user successful .... ", responce.data);
      return responce.data;
    } else {
      console.log("unban user failed .... ", responce.data);
    }

    return null;
  }
  // aprove join request

  async aproveJoinRequest(chatid: number, userId: number) {
    let url = this.getUrl(
      `/approveChatJoinRequest?chat_id=${chatid}&user_id=${userId}`,
    );
    let responce = await axios.post(url);
    if (responce.status === 200) {
      return responce.data;
    }
  }
  async rejectJoinRequest(chatid: number, userId: number) {
    let url = this.getUrl(
      `/rejectChatJoinRequest?chat_id=${chatid}&user_id=${userId}`,
    );
    let responce = await axios.post(url);
    if (responce.status === 200) {
      return responce.data;
    }
  }
}
