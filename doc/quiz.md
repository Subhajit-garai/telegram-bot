# Quiz Manager & Score Tracking

This document explains the interactive quiz mechanics, scheduling timeline, user answer registration, and leaderboard calculation.

---

## 📅 Quiz Scheduling Timeline

A quiz is triggered by a group administrator sending the `/quiz` command. Once started, `QuizManager` schedules a sequence of delayed worker tasks:

```
T+0s  : Pushes Intro Message 1 ("Are you ready to quiz?")
T+1s  : Pushes Intro Message 2 ("Quiz will start in 3 seconds...")
T+3s  : Question 1 Code block arrives (delayed delay = 3000ms)
T+3.2s: Question 1 Poll arrives (delayed delay = 3200ms)
T+33s : Question 2 Code block arrives (delayed delay = 3000 + nextQuestionTime * 1000)
...
T+End : Pushes Leaderboard computation task (Leaderboard_time)
```

---

## 🧠 Core Methods

### 1. `quiz(chatid: string)`
* Initializes the quiz session, assigns a unique `quiz_id` using a random integer.
* Enqueues the introductory messages.
* Calls `this.sendQuestion(chatid, quiz_id)` to schedule questions.

### 2. `sendQuestion(chatid: string, quiz_id: string, thread_id?)`
* Queries the database to fetch 10 random questions via `this.botService.question.getQuizQuestions()`.
* Fetches the quiz configuration parameters (like `nextQuestionTime` and `quizOpenFor`) from the group config via `this.botService.telegram.getQuizConfig(chatid)`.
* Iterates through the questions:
  * Calculates the target delay `3000 + i * nextQuestionTime * 1000`.
  * If the format is `"Code"`, formats the raw source code utilizing `codeFormatter` and pushes `SEND_HTML_NOFTIFICATION`.
  * Pushes `SEND_POLL` with a small delay offset (+200ms) to guarantee that the code block always displays before the poll in the chat feed.
* Schedules `SHOW_LEADERBOARD` at the calculated end of the quiz timeline.

### 3. `registerPollInfo(pollId: string, info: quiz_info_type)`
* Invoked by the `QueueWorker` after a poll is successfully created by Telegram.
* Saves the poll configuration (mapping the dynamic Telegram `poll_id` to the local `quiz_id` and the `correct_option_id`) inside the `quizInfo` map.

---

## 📊 Score Calculations & Leaderboards

### 🗳️ Live Answer Tracking (`handle_poll_answer`)
When a user votes on an active poll, Telegram forwards a `poll_answer` update to our webhook. The bot routes this to `handle_poll_answer`:
1. Retrieves the quiz configuration from `this.quizInfo` using the update's `poll_id`.
2. Inspects `answer.option_ids[0]` (the user's chosen option) and matches it against `correct_option_id`.
3. Gets or creates the scoring record for this user within `this.userAnswers` (keyed by `quiz_id`).
4. Increments:
   * `score` (by 1 if correct).
   * `attempt` (by 1).
   * `wrong` (by 1 if incorrect).

### 🏆 Announcing Results (`showleaderBoard`)
Once the `"SHOW_LEADERBOARD"` worker task fires:
1. Retreives the `userAnswers` map for the current `quiz_id`.
2. Sorts users descending by `score`.
3. Formats a leaderboard text message containing user scores.
4. Enqueues a `"SEND_NOFTIFICATION"` job to post the final rankings into the group chat.
