# Queue Architecture & Redis Jobs

This document explains the BullMQ-backed queue architecture, Redis configuration, task definitions, retry strategies, and background worker processing.

---

## 🚀 Why a Queue System?

Programming quizzes involve strict timings (e.g. countdowns, showing code blocks, waiting for answers, revealing scoreboards). Storing these timers in Node.js memory (`setTimeout`) is high-risk:
1. **Loss on Restart**: If the server restarts or crashes, all active quizzes and future questions are permanently lost.
2. **Rate Limits**: Dispatched messages must be spaced to respect Telegram's rate-limiting rules.
3. **Task Decoupling**: Separation of concerns between timing calculations (Manager) and HTTP delivery (Worker).
4. **Asynchronous Webhook Processing**: Offloads heavy tasks (such as poll answer handling) from Express HTTP response threads.

---

## 🛠️ Queue Components & Configuration

```mermaid
graph LR
    QuizManager[QuizManager] -->|push(payload, delay)| QueueManager[QueueManager]
    QueueManager -->|Store delayed job| Redis[(Redis Database)]
    QueueWorker[QueueWorker] -->|Poll & process| Redis
    QueueWorker -->|Execute API| Telegram[Telegram API]
```

### 1. `QueueManager` (`src/queue/queueManager.ts`)
* Acts as a singleton wrapper around BullMQ `Queue` instances.
* Manages connections via an `ioredis` client configured with automatic reconnects and exponential backoff.
* Restricts queue creation to authorized names defined in `allowedQueues` (e.g., `"task"`).
* **Default Job Options**:
  * `attempts`: 3 attempts.
  * `backoff`: Exponential with 1000ms base delay.
  * `removeOnComplete`: `true`
  * `removeOnFail`: `false`
* Exposes `push(data: Task, options?: JobsOptions)` and `addJob(queueName, jobName, data, options)`.

### 2. `QueueWorker` (`src/queue/queueWorker.ts`)
* Launches a persistent BullMQ `Worker` listening to the `"task"` queue.
* Initialized on startup in `src/index.ts` via `initQueueWorker(telegramAdaptor, bot.quizmanager)`.
* Emits lifecycle events (`completed`, `failed`) and routes jobs inside a `switch (job.name)` block.

---

## 📦 Complete Job Types & Payloads

### 1. `SEND_NOFTIFICATION`
* **Payload**: `{ chatId: string | number, text: string, thread_id?: number }`
* **Action**: Calls `telegramAdaptor.sendMessage()` to dispatch plain text to a chat or message thread.

### 2. `SEND_HTML_NOFTIFICATION`
* **Payload**: `{ chatId: string | number, text: string, thread_id?: number }`
* **Action**: Calls `telegramAdaptor.sendHtmlMessage()` to dispatch HTML formatted content (e.g. preformatted code blocks formatted via `codeFormatter`).

### 3. `SEND_POLL`
* **Payload**: `{ poll: { number: string, chatId: string, data: { question: string, options: string[], ansid: number, explanation: string, is_multiple_ans: boolean, quizOpenFor: number, thread_id?: number }, quizId: string } }`
* **Action**: 
  1. Invokes `telegramAdaptor.sendPoll()` to post a native Telegram poll.
  2. Receives the Telegram API response containing the generated `poll.id`.
  3. Registers the poll mapping via `quiz.registerPollInfo(...)` so user votes can be scored accurately.

### 4. `SHOW_LEADERBOARD`
* **Payload**: `{ quiz_id: string, chatid: number, thread_id?: number }`
* **Action**: Invokes `quiz.showleaderBoard(quiz_id, chatid, thread_id)` to aggregate score records from memory, rank participants by score, calculate accuracy percentages, and dispatch the final leaderboard message.

### 5. `HANDLE_POLL_ANSWER`
* **Payload**: `{ poll_id: string, options: number[], userid: string, name: string, username: string }`
* **Action**: Asynchronously processes a user's poll answer received via webhook, matching the selected option against `correct_option_id` and updating `userAnswers` stats (`score`, `attemp`, `wrong`).

### 6. `CREATE_QUIZ`
* **Payload**: `{ chatId: string | number }`
* **Action**: Begins a new quiz session for the designated chat ID by invoking `quiz.quiz(String(chatId))`.

### 7. `SEND_QUIZ_DATA`
* **Payload**: `{ ... }`
* **Action**: Handler placeholder for custom or external quiz data push operations.

