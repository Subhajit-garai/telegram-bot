import {
  ContextName,
  ConversationSession,
  TelegramUpdate,
  StepMap,
} from "../types";

export class Conversation {
  private static instance: Conversation | null = null;
  userSessions = new Map<number, ConversationSession>();
  private commands: Map<
    string,
    (update: TelegramUpdate, ...args: any[]) => void
  >;

  constructor() {
    this.commands = new Map();
  }

  public static getInstance(): Conversation {
    if (!Conversation.instance) {
      Conversation.instance = new Conversation();
    }
    return Conversation.instance;
  }

  public initSession(userId: number) {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, {
        context: "idle",
        step: "none",
        data: {},
        previousContexts: [],
      });
    }
  }

  switchContext(userId: number, newContext: ContextName) {
    const session = this.userSessions.get(userId)!;
    session.previousContexts.push({
      context: session.context,
      step: session.step,
      data: session.data,
    });
    session.context = newContext;
    session.step = "start";
    session.data = {};
  }

 switchContextStep<C extends ContextName>(userId: number, newStep: StepMap[C]) {
  const session = this.userSessions.get(userId)!;

  // Ensure you're setting step and context correctly
  session.step = newStep as StepMap[typeof session.context];
  session.data = {};
}


  getUserCurrentContext(userId: number) {
    const session = this.userSessions.get(userId);
    if (!session) throw new Error("user dose not any active session");
    return session;
  }




  returnToPreviousContext(userId: number) {
    const session = this.getUserCurrentContext(userId);
    if (!session) return;
    const last = session.previousContexts.pop();
    if (last) {
      session.context = last.context;
      session.step = last.step;
      session.data = last.data;
    } else {
      session.context = "idle";
      session.step = "none";
      session.data = {};
    }
  }

  addDispatcher(
    context: string,
    fn: (update: TelegramUpdate, ...args: string[]) => Promise<void> | void
  ) {
    // Register a Dispatcher
    this.commands.set(context, fn);
    console.log("this.commands", this.commands);
  }

  dispatch(context: string, update: TelegramUpdate) {
    const command = context.replace(/[\/!]/g, "");
    const handler = this.commands.get(command);

    if (handler) {
      return handler(update);
    } else {
      console.warn(`No dispatcher found for command: ${command}`);
    }
  }
}

// function switchContext(userId: number, newContext: ContextName) {
//   const session = userSessions.get(userId)!;
//   session.previousContexts.push({
//     context: session.context,
//     step: session.step,
//     data: session.data,
//   });
//   session.context = newContext;
//   session.step = "start";
//   session.data = {};
// }

// function returnToPreviousContext(userId: number) {
//   const session = userSessions.get(userId)!;
//   const last = session.previousContexts.pop();
//   if (last) {
//     session.context = last.context;
//     session.step = last.step;
//     session.data = last.data;
//   } else {
//     session.context = "idle";
//     session.step = "";
//     session.data = {};
//   }
// }
