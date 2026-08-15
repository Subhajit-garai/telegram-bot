export type question_extra = {
  [key: string]: string;
};
export type quiz_question_type = {
  id: string;
  title: string;
  options: string[];
  ans: string[];
  explanation: string | null;
  format: string;
  map?: number[];
  extra: any;
  is_multiple_ans: boolean;
};

export type quiz_info_type = {
  quiz_id: string;
  chat_id: number;
  message_id: number;
  correct_option_id: number;
  poll_id: string;
  user_id: number;
};

export type quiz_user_answer_type = {
  [user_id: string]: {
    name: string;
    username?: string;
    score: number;
    attemp: number;
    notattemp: number;
    wrong: number;
  };
};

export type exam_question_format_type = {
  number: number;
  part: string;
  question: quiz_question_type;
};
