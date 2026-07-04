import { BotTelegramService } from "./bot/bot.telegram.service.js";
import { QuestionService } from "./bot/QuestionService.service.js";

export class BotService {
  public telegram: BotTelegramService;
  public question: QuestionService;
  constructor() {
    this.telegram = new BotTelegramService();
    this.question = new QuestionService();
  }
}
