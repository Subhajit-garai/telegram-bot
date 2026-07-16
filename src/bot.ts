import { IBot, messageManager } from "@subhajit60/bot";
import { TelegramAdaptor } from "./adapter/telegram.js";
import QuizManager from "./manager/quizManager.js";
import { BotService } from "@/services/bot.service.js";
import { QueueManager } from "./queue/queueManager.js";

type handlerType = "command" | "message" | "error" | "quiz" | "question";

export class TelegramBot extends IBot {
  messagehandler = new messageManager<handlerType>();
  platform: TelegramAdaptor;
  quizmanager: QuizManager;
  queue: QueueManager;
  botservice: BotService;

  constructor(PlatformAdaptor: TelegramAdaptor) {
    super();
    if (!PlatformAdaptor) {
      throw new Error("Platform Adaptor is required");
    }

    this.messagehandler.mapCommand("/", "command");
    this.messagehandler.mapCommand("?", "question");
    this.messagehandler.mapCommand("!", "error");
    this.messagehandler.mapCommand(" ", "message");

    this.platform = PlatformAdaptor;
    this.quizmanager = new QuizManager();
    this.botservice = new BotService();
    this.queue = QueueManager.getInstance();
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
