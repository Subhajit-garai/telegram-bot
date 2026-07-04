import { IBot } from "@subhajit60/bot";
import messageManager from "@subhajit60/bot/dist/managers/messageManager.js";
import { TelegramAdaptor } from "./adapter/telegram.js";
import QuizManager from "./manager/quizManager.js";
import { BotService } from "@/services/bot.service.js";

export class TelegramBot extends IBot {
  messagehandler = messageManager.getInstance();
  platform: TelegramAdaptor;
  quizmanager: QuizManager;
  botservice: BotService;

  constructor(PlatformAdaptor: TelegramAdaptor) {
    super();
    if (!PlatformAdaptor) {
      throw new Error("Platform Adaptor is required");
    }
    this.platform = PlatformAdaptor;
    this.quizmanager = new QuizManager();
    this.botservice = new BotService();
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(
          `Bot started on platform: ${this.platform.getPlatformName()} v${this.platform.getPlatformVersion()}`,
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(
          `Bot stopped on platform: ${this.platform.getPlatformName()} v${this.platform.getPlatformVersion()}`,
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
