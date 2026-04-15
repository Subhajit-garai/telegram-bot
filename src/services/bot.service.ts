
import { BotScoreService } from "./bot/bot.score.service.js";
import { BotTelegramService } from "./bot/bot.telegram.service.js";

export class BotService {

    public score: BotScoreService;
    public telegram: BotTelegramService;

    constructor() {
        this.score = new BotScoreService();
        this.telegram = new BotTelegramService();
    }
}
