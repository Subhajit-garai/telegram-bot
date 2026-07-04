# Database Services & Drizzle ORM

This document explains the database integration layer, table models, service methods, and environment configurations.

---

## 🗄️ Database Connection Setup

We use **Drizzle ORM** to execute SQL queries on a PostgreSQL database.

* **Connection Pool (`src/db/index.ts`)**:
  Initializes a database client using connection configurations defined by `DATABASE_URL` in the environment.
* **Schema Files (`src/db/schema/`)**:
  Tables are modularly declared:
  * `question.ts`: Declares the `questions` table layout (structure, options, correct answer indices, explanations, formatting styles, difficulty levels).
  * `telegram.ts`: Declares `telegram_group_configs` tables mapping chat IDs to configurations like the number of quiz questions, durations, active topics, etc.

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
      .limit(10);
    return question;
  }
}
```

### 2. Telegram Bot Service (`src/services/bot/bot.telegram.service.ts`)
Exposes helpers to manage chat settings and premium subscription status:
* `getQuizConfig(chatid: string)`: Retrieves the target group configuration, returning:
  * `total_questions`
  * `nextQuestionTime`
  * `quizOpenFor`
* `isGroupRegistered(chatid: string)`: Checks if the bot is authorized to operate within the specific group chat.
* `updatePrimeStatus(userid: string, status: boolean)`: Toggles user premium status.
