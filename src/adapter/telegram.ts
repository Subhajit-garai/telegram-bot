import { IPlatformAdaptor } from "@subhajit60/bot";
import TelegramBot from "../utils/Telegrambot.js";

export class TelegramAdaptor extends IPlatformAdaptor {
  bot = TelegramBot.getInstance();
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

  sendMessage(message: string, id: string): void {
    console.log(`Sending message to ${id}: ${message}`);
    this.bot.sendMessage(parseInt(id), message);
  }

  sendPoll(poll: any, id: string): void {
    console.log(`Sending poll to ${id}:`, poll);
  }
}
