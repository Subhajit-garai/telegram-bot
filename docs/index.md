# ExamBuddy Telegram Bot Documentation Index

Welcome to the documentation for the ExamBuddy Telegram Bot. This system is designed as a modular, event-driven service powered by a local queue worker processing delayed jobs in Redis, a Redis caching provider, Drizzle ORM database services, and an AI Agent layer.

Below are the separate documentation modules created for detailed reference:

---

## 📚 Documentation Modules

1. ### 🏗️ [System Architecture & Lifecycle](file:///p:/Project/exambuddys/telegram-bot/docs/architecture.md)
   Learn about the bot framework, platform adapter, Express webhook setup, context normalization, AI Agent layer integration, authorization middleware, and end-to-end event lifecycles.

2. ### 🗃️ [Queue Architecture & Redis Jobs](file:///p:/Project/exambuddys/telegram-bot/docs/queue.md)
   Understand the BullMQ setup, `QueueManager` scheduling, delayed jobs (for countdowns and spacing questions), background processing via `QueueWorker`, and custom Redis queues (`QuizJobQueue`, `TaskQueue`, `redisClient` singleton).

3. ### 🧠 [Quiz Manager & Score Tracking](file:///p:/Project/exambuddys/telegram-bot/docs/quiz.md)
   Read about the timeline execution of programming quizzes, fetching quiz questions from Redis cache (`quizCacheManager`), mapping active poll questions, registering poll IDs, collecting answers asynchronously, and generating the leaderboard with accuracy tracking.

4. ### 💾 [Database Services & Drizzle ORM](file:///p:/Project/exambuddys/telegram-bot/docs/database.md)
   Inspect the database connections, Drizzle ORM models, `@repo/db` schema integration, the `QuestionService` bank selector, group configuration schemas, user subscription handling, and Redis cache provider structures (`redisClient`, `quizCacheManager`).

