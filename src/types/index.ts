export type ContextName =
  | "idle"
  | "signup"
  | "feedback"
  | "quiz"
  | "error"
  | "question_error";

export type StepMap = {
  idle: "none";
  signup:
    | "start"
    | "message_entername"
    | "collect_name"
    | "message_enteremail"
    | "collect_email"
    | "end";
  feedback: "start" | "message" | "collect" | "great" | "end";
  quiz: "start" | "question" | "submit" | "end";
  error: "start" | "log" | "notify" | "end";
  question_error: "start" | "message" | "review" | "correct" | "end";
};

// export type  ContextStep : <C extends ContextName>
export type ContextStep<C extends ContextName> = StepMap[C];

export type ConversationSession = {
  [C in ContextName]: {
    context: C;
    step: StepMap[C];
    data: Record<string, any>;
    previousContexts: {
      context: ContextName;
      step: StepMap[ContextName];
      data: Record<string, any>;
    }[];
  };
}[ContextName];

export type Middleware = (
  update: TelegramUpdate,
  data?: any,
  // ...args: any[], // Accept additional dynamic arguments
  next?: () => Promise<void> | void // Must be last for middleware chaining
) => Promise<void>;

export type TelegramUpdate = {
  update_id: number;
  command: string;
  args: string[] | number[];
  // session: ConversationSession;

  chat_join_request: {
    chat: {
      id: number;
      type: string;
      title: string;
    };
    from: {
      id: number;
      first_name: string;
    };
    user_chat_id: number;
    date: number;
    invite_link: {
      invite_link: string;
      name: string;
      creator: {
        id: number;
        is_bot: boolean;
        first_name: string;
        username: string;
        language_code: string;
      };
      pending_join_request_count: number;
      creates_join_request: boolean;
      is_primary: boolean;
      is_revoked: boolean;
    };
  };
  message: {
    message_id: number;
    message_thread_id?: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    sender_chat?: {
      id: number;
      title: string;
      type: "supergroup" | "group" | "channel";
    };
    chat: {
      id: number;
      title: string;
      type: "supergroup" | "group" | "private" | "channel";
    };
    date: number;
    text: string | "";
    entities?: {
      offset: number;
      length: number;
      type: string;
    }[];
  };
  poll_answer: {
    poll_id: string;
    user: {
      id: 1192445803;
      is_bot: boolean;
      first_name: string;
      username: string;
    };
    option_ids: number[];
  };
  new_chat_members: [
    {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    },
  ];
};
