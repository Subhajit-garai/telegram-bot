// import axios from "axios";
// import { Middleware, TelegramUpdate } from "../types/index.js";

// import { logger } from "./logger.js";

// class TelegramBot {
//   private token: string;
//   private MESSANGER_BOT_TOKEN: string;
//   private AI_MENTOR_BOT_TOKEN: string;
//   private apiUrl: string;
//   private WEBHOOK_URL: string;
//   // private um = UserManager.getInstance();
//   private commands: Map<
//     string,
//     (update: TelegramUpdate, ...args: any[]) => void
//   >;
//   private correctAnswers: Map<number, number>; // Store correct answers
//   private static instance: TelegramBot | null = null;
//   private pollHandler: (pollAnswer: TelegramUpdate) => Promise<void> =
//     async () => {};

//   private constructor() {
//     this.token = process.env.BOT_TOKEN?.trim()!;
//     this.MESSANGER_BOT_TOKEN = process.env.MESSANGER_BOT_TOKEN?.trim()!;
//     this.AI_MENTOR_BOT_TOKEN = process.env.AI_MENTOR_BOT_TOKEN?.trim()!;

//     this.WEBHOOK_URL = `${process.env.WEBHOOK_URL?.trim()!}/webhook`;

//     this.apiUrl = `https://api.telegram.org/bot${this.token}`;
//     this.commands = new Map();
//     this.correctAnswers = new Map();
//     // Initialize webhook asynchronously
//     this.init();
//   }

//   // Get the singleton instance
//   public static getInstance(): TelegramBot {
//     if (!TelegramBot.instance) {
//       TelegramBot.instance = new TelegramBot();
//     }
//     return TelegramBot.instance;
//   }

//   // Initialize webhook separately (constructor can't await)
//   private async init() {
//     await this.setWebhook(this.WEBHOOK_URL);
//   }
//   setPollHandler(func: (pollAnswer: TelegramUpdate) => Promise<void>) {
//     console.log("Poll handler set.");
//     this.pollHandler = func;
//   }

//   getUrl(path: string): string {
//     return `${this.apiUrl}${path}`;
//   }

//   // Register a command
//   on(command: string, ...middlewares: Middleware[]) {
//     const callback =
//       typeof middlewares[middlewares.length - 1] === "function"
//         ? middlewares.pop()
//         : undefined;

//     this.commands.set(command, async (update) => {
//       let index = 0;

//       const next = async (): Promise<void> => {
//         if (index < middlewares.length) {
//           const middleware = middlewares[index++];
//           await middleware(update, next);
//         } else if (callback) {
//           await callback(update);
//         }
//       };

//       await next(); // Start executing middlewares if any, else execute the callback directly
//     });
//   }

//   // Handle updates and execute commands
//   async handleUpdate(update: TelegramUpdate) {
//     // this.isChatValid(update);

//     // const chatId = update.message.chat.id;
//     const userId = update?.message?.from?.id;
//     const text = update?.message?.text?.trim();
//     const [command, ...args] = text?.split(" ") ?? [];
//     update.command = command;
//     update.args = args;

//     if (update.message) {
//       // const session = this.Conversation.userSessions.get(userId)!; // getting session info

//       if (this.commands.has(update.command)) {
//         // this check is any command like /start then it will be executed asociet function
//         this.commands.get(update.command)?.(update);
//       } else {
//         // conversation  removed
//       }
//     } else if (update?.chat_join_request) {
//       // AproveUserTojoin(update);
//     } else if (update?.poll_answer) {
//       console.log(
//         "Poll answer received for user :---->",
//         update.poll_answer?.user?.first_name +
//           "(" +
//           update.poll_answer?.user?.id +
//           ")",
//       );

//       this.pollHandler(update);
//     } else if (update?.new_chat_members) {
//     }
//   }
// }

// export default TelegramBot;
