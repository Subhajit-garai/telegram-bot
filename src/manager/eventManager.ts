


import axios from "axios";
import dotenv from "dotenv";
import { Middleware, TelegramUpdate } from "../types";
dotenv.config();

class EventManager {


  private commands: Map<
    string,
    (event: any, ...args: any[]) => void
  >;
  private correctAnswers: Map<number, number>; // Store correct answers
  private static instance: EventManager | null = null;

  private constructor() {
    this.commands = new Map();
    this.correctAnswers = new Map();
    // Initialize webhook asynchronously
    this.init();
  }

  // Get the singleton instance
  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  // Initialize webhook separately (constructor can't await)
  private async init() {
  }

//   getUrl(path: string): string {
//     // return `${this.apiUrl}${path}`;
//   }

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


  // Handle updates and execute commands
  async handleEvent(event:any) {
    if (event.type) {
      if (this.commands.has(event.type)) {
        // this check is any command like /start then it will be executed asociet function
        this.commands.get(event.type)?.(event);
      } else {
        
      }
    }
    // else if (update?.poll_answer) {
    //   this.handlePollAnswer(update.poll_answer);
    // }
  }
  
 



  // Set webhook for Telegram
  
}

export default EventManager;
