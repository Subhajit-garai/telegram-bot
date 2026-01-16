export type quizConfig_type = {
  chatid: number;
  thread_id: number;
  userid: number;
  topics: string[];
  total_questions: number;
  currentQuestionIndex: number;
  nextQuestionTime: number;
  quizOpenFor: number;
};

export type question_extra = {
  [key: string]: string
}
export type quiz_question_type = {
  id: string;
  topic: string;
  title: string;
  format: string;
  options: string[];
  explanation: string;
  ans: string[];
  extra: question_extra,
};

export type quizConfig_data_type = {
  type: string;
  questions: quiz_question_type[];
  config: quizConfig_type;
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
  // [quiz_id:string]: {
  [user_id: number]: {
    first_name: string;
    username: string;
    score: number;
    attemp: number;
    notattemp: number;
    wrong: number;
  };
  // },
};
