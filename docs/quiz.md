# Quiz Manager & Score Tracking

This document explains the interactive quiz mechanics, scheduling timeline, question formats, user answer registration, and leaderboard calculation.

---

## 📅 Quiz Scheduling Timeline

A quiz is triggered by an authorized group user or admin sending the `/quiz` command (or via an enqueued `CREATE_QUIZ` job). `QuizManager` schedules a sequence of delayed worker tasks:

```
T+0s  : Pushes Intro Message 1 ("Are you ready to quiz?")
T+1s  : Pushes Intro Message 2 ("Quiz will start in 3 seconds...")
T+3s  : Question 1 Code block arrives (if format === "Code")
T+3.2s: Question 1 Poll arrives (delayed offset +200ms guarantees code renders before poll)
T+33s : Question 2 Code block / Poll arrives (delay = 3000ms + i * nextQuestionTime * 1000)
...
T+End : Pushes Leaderboard computation task (Leaderboard_time = 3000ms + total_questions * nextQuestionTime * 1000 + 2 * quizOpenFor * 1000)
```

---

## 🧠 Data Types & Structures (`src/types/quizTypes.ts`)

```typescript
export type quiz_question_type = {
  id: string;
  title: string;
  options: string[];
  ans: string[];
  explanation: string | null;
  format: string;
  map?: number[];
  extra: any;
  is_multiple_ans: boolean; // Note: replaces former allows_multiple_answers
};

export type exam_question_format_type = {
  number: number;
  part: string;
  question: quiz_question_type;
};
```

---

## 🧠 Core Methods (`src/manager/quizManager.ts`)

### 1. `quiz(chatid: string)`
* Initializes the quiz session for the group chat.
* Enqueues introductory notification messages (`SEND_NOFTIFICATION`).
* Invokes `this.sendQuestion(chatid, quiz_id, thread_id)`.

### 2. `sendQuestion(chatid: string, quiz_id: string, thread_id?: number | null)`
* Fetches target group configuration via `this.botService.telegram.getQuizConfig(chatid)` (falling back to default: `nextQuestionTime = 30s`, `quizOpenFor = 20s`).
* Fetches questions from Redis cache via `this.quizdb.getQuizQuestions(quiz_id)` (`quizCacheManager`).
* Iterates through the questions array:
  * Formats code blocks using HTML character escaping in `codeFormatter` (`<pre><code>...</code></pre>`) and enqueues `SEND_HTML_NOFTIFICATION` at `delay = question_time`.
  * Enqueues `SEND_POLL` at `pollDelay = format === "Code" ? question_time + 200 : question_time`, truncating explanations over 200 characters (`explanation.slice(0, 197) + "..."`).
* Enqueues `SHOW_LEADERBOARD` job at `Leaderboard_time = 3000 + total_questions * nextQuestionTime * 1000 + 2 * quizOpenFor * 1000`.

### 3. `registerPollInfo(pollId: string, info: quiz_info_type)`
* Invoked by `QueueWorker` when Telegram returns the generated `poll.id`.
* Stores mapping in `this.quizInfo` (`pollId` -> `{ quiz_id, chat_id, message_id, correct_option_id, poll_id, user_id }`).

---

## 📊 Score Calculations & Leaderboards

### 🗳️ Async Answer Tracking (`handle_poll_answer`)
1. Telegram forwards `poll_answer` webhook payloads to `src/index.ts`.
2. Express normalizes payload and enqueues a `HANDLE_POLL_ANSWER` job to BullMQ `TaskQueue`.
3. `QueueWorker` pops `HANDLE_POLL_ANSWER` and invokes `quiz.handle_poll_answer`:
   * Retrieves poll metadata from `this.quizInfo.get(poll_id)`.
   * Compares `selected_option` (`option_ids[0]`) with `correct_option_id`.
   * Gets or initializes user score record in `this.userAnswers` map for `quiz_id`.
   * Updates stats:
     * Correct answer: `score += 1`, `attemp += 1`.
     * Incorrect answer: `wrong += 1`, `attemp += 1`.

### 🏆 Announcing Results (`showleaderBoard`)
1. Triggered when `"SHOW_LEADERBOARD"` fires in `QueueWorker`.
2. Retrieves `userAnswers` record for `quiz_id`.
3. Sorts participants descending by `score`.
4. Calculates user accuracy:
   $$\text{Accuracy (\%)} = \left( \frac{\text{score}}{\text{score} + \text{wrong}} \right) \times 100$$
5. Formats leaderboard text (e.g. `1. John - Score: 8 (80.00%), A-10 W-2`).
6. Enqueues a `"SEND_NOFTIFICATION"` job to post final rankings to the chat.

