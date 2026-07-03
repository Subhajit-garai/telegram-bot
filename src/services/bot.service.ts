
import { BotTelegramService } from "./bot/bot.telegram.service.js";

export class BotService {
    public telegram: BotTelegramService;

    constructor() {
        this.telegram = new BotTelegramService();
    }
}
