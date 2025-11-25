import axios from "axios";
import { Middleware, TelegramUpdate } from "../types";
import { AproveUserTojoin, isAdmin } from "../middlewere/userAuth";
import { Conversation } from "../manager/conversationSession";
import { conv } from "..";

class TelegramBot {
  private token: string;
  private MESSANGER_BOT_TOKEN: string;
  private AI_MENTOR_BOT_TOKEN: string;
  private apiUrl: string;
  private WEBHOOK_URL: string;
  // private um = UserManager.getInstance();
  private commands: Map<
    string,
    (update: TelegramUpdate, ...args: any[]) => void
  >;
  private correctAnswers: Map<number, number>; // Store correct answers
  private static instance: TelegramBot | null = null;
  private pollHandler: (pollAnswer: TelegramUpdate) => Promise<void> =
    async () => {};

  Conversation: Conversation;

  private constructor() {
    this.token = process.env.BOT_TOKEN!;
    this.MESSANGER_BOT_TOKEN = process.env.MESSANGER_BOT_TOKEN!;
    this.AI_MENTOR_BOT_TOKEN = process.env.AI_MENTOR_BOT_TOKEN!;
    this.WEBHOOK_URL = `${process.env.WEBHOOK_URL}/webhook`;
    this.apiUrl = `https://api.telegram.org/bot${this.token}`;
    this.commands = new Map();
    this.correctAnswers = new Map();
    this.Conversation = Conversation.getInstance();
    // Initialize webhook asynchronously
    this.init();
  }


  // Get the singleton instance
  public static getInstance(): TelegramBot {
    if (!TelegramBot.instance) {
      TelegramBot.instance = new TelegramBot();
    }
    return TelegramBot.instance;
  }

  // Initialize webhook separately (constructor can't await)
  private async init() {
    await this.setWebhook(this.WEBHOOK_URL);
  }
  setPollHandler(func: (pollAnswer: TelegramUpdate) => Promise<void>) {
    console.log("Poll handler set.");
    this.pollHandler = func;
  }

  getUrl(path: string): string {
    return `${this.apiUrl}${path}`;
  }

  // Register a command
  on(command: string, ...middlewares: Middleware[]) {
    const callback =
      typeof middlewares[middlewares.length - 1] === "function"
        ? middlewares.pop()
        : undefined;

    this.commands.set(command, async (update) => {
      let index = 0;

      const next = async (): Promise<void> => {
        if (index < middlewares.length) {
          const middleware = middlewares[index++];
          await middleware(update, next);
        } else if (callback) {
          await callback(update);
        }
      };

      await next(); // Start executing middlewares if any, else execute the callback directly
    });
  }

  isGroupAdmin = async (chatId: number, userId: number): Promise<boolean> => {
    try {
      const url = `https://api.telegram.org/bot${this.token}/getChatAdministrators`;
      const response = await axios.get(url, { params: { chat_id: chatId } });

      const admins = response.data.result;
      // console.log("is admin ", admins);

      let status = admins.some((admin: any) => admin.user.id === userId);
      return status;
    } catch (error: any) {
      console.error(
        "Error checking admin status:",
        error.response?.data || error
      );
      return false;
    }
  };

  // Handle updates and execute commands
  async handleUpdate(update: TelegramUpdate) {
    // this.isChatValid(update);

    // const chatId = update.message.chat.id;
    const userId = update?.message?.from?.id;
    const text = update?.message?.text?.trim();
    const [command, ...args] =(text?.split(" ") ?? [])
    update.command = command;
    update.args = args;

    // Initialize if needed
    if (!this.Conversation.userSessions.has(userId)) {
      this.Conversation.userSessions.set(userId, {
        context: "idle",
        step: "none",
        data: {},
        previousContexts: [],
      });
    }
    if (update.message) {
      // const session = this.Conversation.userSessions.get(userId)!; // getting session info

      if (this.commands.has(update.command)) {
        // this check is any command like /start then it will be executed asociet function
        this.commands.get(update.command)?.(update);
      } else {
        let session = conv.getUserCurrentContext(userId);
        if(!session) return
        console.log("session---->", session);
        let context = session.context;
        conv.dispatch(context, update);
      }
    } else if (update?.chat_join_request) {
      AproveUserTojoin(update);
    } else if (update?.poll_answer) {
      console.log(
        "Poll answer received for user :---->",
        update.poll_answer?.user?.first_name +
          "(" +
          update.poll_answer?.user?.id +
          ")"
      );

      this.pollHandler(update);
    } else if (update?.new_chat_members) {
      this.handleNewUsers(update);
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

  handleNewUsers(update: TelegramUpdate) {
    const chatId = update.message.chat.id;
    const newUsers = update.new_chat_members.map((user) => user.username);
    const welcomeMessage = `Welcome to the exambudys! New members: ${newUsers.join(", ")}`;
    this.sendMessage(chatId, welcomeMessage); // here it will be fixes thread
  }
  // Send message to a user
  async sendAiMentorBotMessage(
    chatId: number,
    text: string,
    type: "HTML" | "TEXT" = "TEXT",
    thread_id: number | undefined = undefined
  ) {
    let MESSANGER_BOT_API_URL = `https://api.telegram.org/bot${this.AI_MENTOR_BOT_TOKEN}/sendMessage`;
    try {
      let url = MESSANGER_BOT_API_URL;
      let res;

      switch (type) {
        case "HTML":
          res = await axios.post(url, {
            chat_id: chatId,
            ...(thread_id ? { message_thread_id: thread_id } : {}),
            text: text,
            parse_mode: "HTML", // for markdown and html
          });

          break;

        default:
          res = await axios.post(url, {
            chat_id: chatId,
            ...(thread_id ? { message_thread_id: thread_id } : {}),
            text,
          });
          break;
      }

      if (res.status === 200) {
        return res.data;
      } else {
        return false;
      }
    } catch (error: any) {
      console.error("Error sending message:", error.response?.data);
    }
  }
  // Send message to a user
  async sendMessangerBotMessage(
    chatId: number,
    text: string,
    type: "HTML" | "TEXT" = "TEXT",
    thread_id: number | undefined = undefined
  ) {
    let MESSANGER_BOT_API_URL = `https://api.telegram.org/bot${this.MESSANGER_BOT_TOKEN}/sendMessage`;
    try {
      let url = MESSANGER_BOT_API_URL;
      let res;

      switch (type) {
        case "HTML":
          res = await axios.post(url, {
            chat_id: chatId,
            ...(thread_id ? { message_thread_id: thread_id } : {}),
            text: text,
            parse_mode: "HTML", // for markdown and html
          });

          break;

        default:
          res = await axios.post(url, {
            chat_id: chatId,
            ...(thread_id ? { message_thread_id: thread_id } : {}),
            text,
          });
          break;
      }

      if (res.status === 200) {
        return res.data;
      } else {
        return false;
      }
    } catch (error: any) {
      console.error("Error sending message:", error.response?.data);
    }
  }
  async sendMessage(
    chatId: number,
    text: string,
    type: "HTML" | "TEXT" = "TEXT",
    thread_id: number | undefined = undefined
  ) {
    try {
      let url = `${this.apiUrl}/sendMessage`;
      let res;

      switch (type) {
        case "HTML":
          res = await axios.post(url, {
            chat_id: chatId,
            ...(thread_id ? { message_thread_id: thread_id } : {}),
            text: text,
            parse_mode: "HTML", // for markdown and html
          });

          break;

        default:
          res = await axios.post(url, {
            chat_id: chatId,
            ...(thread_id ? { message_thread_id: thread_id } : {}),
            text,
          });
          break;
      }

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
    thread_id: number | undefined = undefined
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
  async sendPoll(
    number: string,
    chatId: number,

    question: string,
    options: string[],
    ansid: number,
    explanation: string,

    allows_multiple_answers: boolean = false,
    quizOpenFor = 40, // 40 seconds
    thread_id: number | undefined = undefined
  ) {
    try {
      let response = await axios.post(this.getUrl("/sendPoll"), {
        chat_id: chatId,
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
        `${number} Error:-> Content length has exceeded the maximum allowed characters.`
      );
    }
  }

  // Set webhook for Telegram
  private async setWebhook(url: string) {
    try {
      const { data } = await axios.get(`${this.apiUrl}/getWebhookInfo`);
      if (data.result && data.result.url === url) {
        console.log("Webhook is already set correctly.");
        return;
      }
      console.log("Updating webhook to:", url);
      const response = await axios.post(`${this.apiUrl}/setWebhook`, { url });
      console.log("Webhook set:", response.data);
    } catch (error: any) {
      console.error("Error setting webhook:", error.response?.data);
    }
  }

  async getChatMember(userid: number, chatid: number) {
    let url = this.getUrl(`/getChatMember?chat_id=${chatid}&user_id=${userid}`);

    try {
      let responce = await axios.post(url);
      if (responce.status === 200) {
        return responce.data.result;
      }
    } catch (error: any) {
      console.log(error?.response?.data?.description);
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
      `/unbanChatMember?chat_id=${chatid}&user_id=${userid}`
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
      `/approveChatJoinRequest?chat_id=${chatid}&user_id=${userId}`
    );
    let responce = await axios.post(url);
    if (responce.status === 200) {
      return responce.data;
    }
  }
  async rejectJoinRequest(chatid: number, userId: number) {
    let url = this.getUrl(
      `/rejectChatJoinRequest?chat_id=${chatid}&user_id=${userId}`
    );
    let responce = await axios.post(url);
    if (responce.status === 200) {
      return responce.data;
    }
  }
}

export default TelegramBot;
