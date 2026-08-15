# Database Services & Redis Caching Layer

This document explains the database integration layer (Drizzle ORM), table schemas, service methods, Redis connection singleton, and caching providers.

---

## 🗄️ Database Connection Setup

We use **Drizzle ORM** with a PostgreSQL backend (`@repo/db`) managed through `DATABASE_URL` in the environment.

* **Connection Pool (`src/db/index.ts`)**:
  Initializes a database client using connection configurations defined by `DATABASE_URL`.
* **Schema Files (`src/db/schema/` & `@repo/db/schema`)**:
  Tables are modularly declared and imported:
  * `telegram_group_infos`: Group registrations, permissions (`is_banned`, `is_premium`), group types (`group_type`).
  * `bot_quiz_configs`: Configured settings per chat (`total_questions`, `topics`, `is_multiple_answers`, `next_question_time`, `quiz_open_for`).
  * `telegram_group_topics`: Mapped topics per Telegram group chat ID.
  * `telegram_ban_users`: Banned Telegram user records (`user_telegram_id`, `ban_from_id`, `ban_from_type`, `status`).
  * `users` & `socials`: User authentication, platform social links (e.g. `telegram`), roles (`Admin`, `User`, `Bot`), and prime membership statuses (`status`, `expiry`).
  * `question.ts`: Database questions layout (`title`, `options`, `ans`, `explanation`, `format`, `is_multiple_answers`, `extra`).

---

## 🛠️ Service Components

Services are housed in `/src/services/` and bundled inside `BotService` (`/src/services/bot.service.ts`).

### 1. Question Service (`src/services/bot/QuestionService.service.ts`)
Exposes database query helpers to fetch programming questions:

```typescript
export class QuestionService {
  async getQuizQuestions() {
    let question = await db
      .select({
        id: questions.id,
        title: questions.title,
        options: questions.options,
        ans: questions.ans,
        explanation: questions.explanation,
        format: questions.format,
        allows_multiple_answers: questions.is_multiple_answers,
        extra: questions.extra,
      })
      .from(questions)
      .limit(2);
    return question;
  }
}
```

### 2. Telegram Bot Service (`src/services/bot/bot.telegram.service.ts`)
Exposes helpers to manage chat settings, user bans, and premium subscription status:
* `getQuizConfig(chatid: string)`: Retrieves group quiz configuration (`total_questions`, `topics`, `is_multiple_ans`, `nextQuestionTime`, `quizOpenFor`).
* `getValidChatIds()`: Returns valid, non-banned group chat IDs.
* `processNotification(type, data)`: Handles `banuser` and `unbanuser` operations validated with Zod schemas (`banuser_notification_zod_type`, `unbanuser_notification_zod_type`).
* `isPrimeUser(telegramid: string)`: Verifies user premium status against database records.

---

## ⚡ Redis Caching & Connection Layer (`src/utils/radisProvider.ts`)

To optimize database access, reduce connection overhead, and handle cached quiz data, the application uses a centralized Redis singleton pattern.

### 1. `redisClient` Singleton
Provides a single shared `ioredis` connection instance across all Redis providers:
```typescript
export class redisClient {
  public static getInstance(): redisClient;
  getClient(): Redis;
  disconnect(): Promise<void>;
}
```

### 2. `quizCacheManager`
Manages cached quiz metadata and questions stored in Redis to accelerate live quiz execution:
* **Key Patterns**:
  * `quiz:meta:<quizid>`: Stores JSON stringified quiz metadata.
  * `quiz:data:<quizid>`: Stores question sets for active quizzes.
* **Methods**:
  * `getquizmeta(quizid: string)`: Fetches and parses metadata for a specific quiz ID.
  * `getquizid()`: Scans keys matching `quiz:meta:*` and randomly selects an active quiz ID.
  * `getQuizQuestions(quizid: string)`: Retrieves cached questions for the designated quiz.

### 3. Queue Providers (`QuizJobQueue` & `TaskQueue`)
* **`QuizJobQueue`**: Uses a Redis Sorted Set (`telegramquiz_scheduled`) to queue scheduled jobs with epoch millisecond timestamps as scores (`zadd` / `zrangebyscore`).
* **`TaskQueue`**: Uses a Redis List (`task`) for fast FIFO job pushing (`lpush`) and popping (`rpop`).

