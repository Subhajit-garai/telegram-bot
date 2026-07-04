# ExamBuddy Telegram Bot Documentation Index

Welcome to the documentation for the ExamBuddy Telegram Bot. This system is designed as a modular, event-driven service powered by a local queue worker processing delayed jobs in Redis.

Below are the separate documentation modules created for detailed reference:

---

## 📚 Documentation Modules

1. ### 🏗️ [System Architecture & Lifecycle](file:///p:/Project/exambuddys/telegram-bot/doc/architecture.md)
   Learn about the bot framework, platform adapter, Express webhook setup, context normalization, and end-to-end event lifecycles.

2. ### 🗃️ [Queue Architecture & Redis Jobs](file:///p:/Project/exambuddys/telegram-bot/doc/queue.md)
   Understand the BullMQ setup, the `QueueManager` scheduling, delayed jobs (for countdowns and spacing questions), and background processing via `QueueWorker`.

3. ### 🧠 [Quiz Manager & Score Tracking](file:///p:/Project/exambuddys/telegram-bot/doc/quiz.md)
   Read about the timeline execution of programming quizzes, mapping active poll questions, registering poll IDs, collecting answers, and generating the leaderboard.

4. ### 💾 [Database Services & Drizzle ORM](file:///p:/Project/exambuddys/telegram-bot/doc/database.md)
   Inspect the database connections, Drizzle migrations, the `QuestionService` bank selector, and the group configuration schemas.
