# Queue Architecture & Redis Jobs

This document explains the BullMQ-backed queue architecture, Redis configuration, task definitions, and background worker processing.

---

## 🚀 Why a Queue System?

Programming quizzes involve strict timings (e.g. countdowns, showing code blocks, waiting for answers, revealing scoreboards). Storing these timers in Node.js memory (`setTimeout`) is high-risk:
1. **Loss on Restart**: If the server restarts or crashes, all active quizzes and future questions are permanently lost.
2. **Rate Limits**: Dispatched messages must be spaced to respect Telegram's rate-limiting rules.
3. **Task Decoupling**: Separation of concerns between timing calculations (Manager) and HTTP delivery (Worker).

---

## 🛠️ Queue Components

```mermaid
graph LR
    QuizManager[QuizManager] -->|push(payload, delay)| QueueManager[QueueManager]
    QueueManager -->|Store delayed job| Redis[(Redis Database)]
    QueueWorker[QueueWorker] -->|Poll & process| Redis
    QueueWorker -->|Execute API| Telegram[Telegram API]
```

### 1. `QueueManager` (`src/queue/queueManager.ts`)
* Acts as a wrapper around the BullMQ `Queue` instance.
* Manages connection clients via a Redis credentials client.
* Implements the `push(data: Task, options?: JobsOptions)` method to submit tasks to the Redis store, passing parameters like `{ delay: ms }` directly to BullMQ.

### 2. `QueueWorker` (`src/queue/queueWorker.ts`)
* Launches a persistent BullMQ `Worker` thread listening to the `"task"` queue.
* Handled as a background process initialized on startup in `src/index.ts` via `initQueueWorker(telegramAdaptor, bot.quizmanager)`.
* Processes job types inside a `switch (job.name)` block.

---

## 📦 Job Types & Payloads

### `SEND_NOFTIFICATION`
* **Payload**: `{ chatId: string | number, text: string, thread_id?: number }`
* **Action**: Calls `telegramAdaptor.sendMessage()` to dispatch plain text.

### `SEND_HTML_NOFTIFICATION`
* **Payload**: `{ chatId: string | number, text: string, thread_id?: number }`
* **Action**: Calls `telegramAdaptor.sendHtmlMessage()` to dispatch formatted HTML code (e.g. escaped preformatted code blocks).

### `SEND_POLL`
* **Payload**: `{ poll: { chatId: string, data: { question, options, ansid, explanation, quizOpenFor, thread_id }, quizId: string } }`
* **Action**: 
  1. Invokes `telegramAdaptor.sendPoll()` to post a native Telegram poll.
  2. Receives the successful response from Telegram containing the new `poll.id`.
  3. Registers this mapping by calling `quiz.registerPollInfo(...)` so that future user votes can be scored against the correct option ID.

### `SHOW_LEADERBOARD`
* **Payload**: `{ quiz_id: string, chatid: number, thread_id?: number }`
* **Action**: Invokes `quiz.showleaderBoard(quiz_id, chatid, thread_id)` to tally user scores from memory and announce winners.

### `CREATE_QUIZ` / `SEND_QUIZ_DATA`
* **Payload**: `{ chatId: string | number }` (or nested within payload)
* **Action**: Begins the quiz process by invoking `quiz.quiz(chatId)`.
