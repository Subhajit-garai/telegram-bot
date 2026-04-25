import { pgTable, uniqueIndex, text, jsonb, integer, timestamp, boolean, foreignKey, doublePrecision, index, varchar, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const activityType = pgEnum("ActivityType", ['DAILY_CHALLENGE', 'QUIZ', 'TEST', 'DPP', 'MOCK', 'CHAPTER', 'STREAK_BONUS', 'OTHER'])
export const badgeRule = pgEnum("BadgeRule", ['ACTIVITY_COUNT', 'STREAK_COUNT', 'XP_THRESHOLD', 'TOPIC_MASTERY'])
export const creationTypes = pgEnum("CreationTypes", ['Updated', 'Created', 'Processing', 'Done', 'Suspended'])
export const eventStatus = pgEnum("EventStatus", ['completed', 'current', 'upcoming'])
export const examScope = pgEnum("ExamScope", ['NATIONAL', 'STATE', 'COLLEGE', 'OTHER'])
export const examStage = pgEnum("ExamStage", ['Registration', 'Started', 'Ended'])
export const examStatus = pgEnum("ExamStatus", ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'SCHEDULED', 'ONGOING', 'COMPLETED', 'EVALUATION_IN_PROGRESS', 'RESULT_PUBLISHED', 'ARCHIVED'])
export const examType = pgEnum("ExamType", ['Test', 'Contest', 'Mock', 'PYQ', 'Subject', 'Dpp', 'Quiz'])
export const issueType = pgEnum("IssueType", ['QUESTION', 'UI', 'EXAM', 'PAYMENT', 'LOGIN', 'SIGNUP'])
export const offerPlan = pgEnum("OfferPlan", ['BASIC', 'STANDARD', 'PREMIUM', 'PLATINUM'])
export const platform = pgEnum("Platform", ['NONE', 'WEBAPP', 'ANDROIDAPP', 'TELEGRAM', 'WHATSAPP'])
export const processingStatus = pgEnum("ProcessingStatus", ['Pending', 'Approved', 'Rejected'])
export const progressStatus = pgEnum("ProgressStatus", ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])
export const socialPlatform = pgEnum("SocialPlatform", ['email', 'telegram', 'whatsApp', 'linkedIn', 'gitHub', 'twitter', 'instagram', 'facebook', 'website'])
export const status = pgEnum("Status", ['Created', 'Processing', 'Done', 'Duplicate', 'Suspended', 'Close'])
export const syllabusType = pgEnum("SyllabusType", ['EXAM', 'QUIZ', 'TEST'])
export const topicStatus = pgEnum("TopicStatus", ['draft', 'published', 'archived'])
export const userRole = pgEnum("UserRole", ['Admin', 'User', 'Tutor', 'Bot'])
export const visibility = pgEnum("Visibility", ['Public', 'Private'])
export const accessType = pgEnum("access_type", ['Free', 'Paid'])
export const banStatus = pgEnum("ban_status", ['Ban', 'UnBan', 'Block'])
export const check = pgEnum("check", ['Normal', 'Hybrid'])
export const diffcultlevel = pgEnum("diffcultlevel", ['Easy', 'Medium', 'Hard'])
export const eventRuns = pgEnum("eventRuns", ['ONE', 'DAILY', 'WEEKLY', 'MONTHLY'])
export const eventType = pgEnum("eventType", ['RUN_NEW_QUIZ', 'CREATE_QUIZ_CONTEST', 'SEND_MESSAGE', 'CREATE_DPP', 'CREATE_EXAM', 'CLEAR_BOT_CACHE', 'ACTIVITY_LEADERBOARD_ARCHIVE'])
export const examformat = pgEnum("examformat", ['Text', 'Image', 'Code'])
export const primeStatus = pgEnum("primeStatus", ['None', 'Bronze', 'Silver', 'Gold'])
export const purchaseType = pgEnum("purchaseType", ['SUBSCRIPTION', 'TOKEN'])
export const quizType = pgEnum("quiz_type", ['telegram_quiz', 'quiz'])
export const syllabusType = pgEnum("syllabusType", ['Generic', 'Syllabus'])
export const telegramgroupType = pgEnum("telegramgroupType", ['group', 'private', 'channel', 'supergroup'])


export const badge = pgTable("Badge", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	icon: text(),
	ruleType: badgeRule().notNull(),
	condition: jsonb().notNull(),
	xpBonus: integer().default(0).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("Badge_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const appConfig = pgTable("AppConfig", {
	id: text().primaryKey().notNull(),
	feature: text().notNull(),
	settings: jsonb().notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("AppConfig_feature_key").using("btree", table.feature.asc().nullsLast().op("text_ops")),
]);

export const dailyChallenge = pgTable("DailyChallenge", {
	id: text().primaryKey().notNull(),
	date: timestamp({ precision: 3, mode: 'string' }).notNull(),
	title: text().notNull(),
	description: text().notNull(),
	xp: integer().notNull(),
	createdBy: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("DailyChallenge_date_key").using("btree", table.date.asc().nullsLast().op("timestamp_ops")),
]);

export const entryChargeList = pgTable("EntryChargeList", {
	id: text().primaryKey().notNull(),
	type: text().default('not set').notNull(),
	charge: integer("Charge").default(0).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdBy: text("created_by"),
}, (table) => [
	uniqueIndex("EntryChargeList_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
]);

export const issue = pgTable("Issue", {
	id: text().primaryKey().notNull(),
	type: issueType().notNull(),
	subType: text("sub_type").default('General'),
	note: text(),
	issueDetails: jsonb("IssueDetails").notNull(),
	status: status().default('Created').notNull(),
	upVote: integer().default(0).notNull(),
	downVote: integer().default(0).notNull(),
	priorityVote: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	creatorRole: userRole("creator_role").default('User').notNull(),
	createdBy: text("created_by"),
}, (table) => [
	uniqueIndex("Issue_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
]);

export const notification = pgTable("Notification", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	link: text(),
	type: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	seen: boolean().default(false).notNull(),
	seenAt: timestamp({ precision: 3, mode: 'string' }),
});

export const dppProgress = pgTable("DppProgress", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	solvedCount: integer().default(0).notNull(),
	questionsSolved: integer().default(0).notNull(),
	lastDppId: text(),
	lastDppDate: timestamp({ precision: 3, mode: 'string' }),
	currentStreak: integer().default(0).notNull(),
}, (table) => [
	uniqueIndex("DppProgress_userId_key").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "DppProgress_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const subjectSyllabusMap = pgTable("SubjectSyllabusMap", {
	id: text().primaryKey().notNull(),
	syllabusId: text().notNull(),
	subjectId: text("subject_id").notNull(),
	weightage: doublePrecision().default(0),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("SubjectSyllabusMap_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	uniqueIndex("SubjectSyllabusMap_syllabusId_subject_id_key").using("btree", table.syllabusId.asc().nullsLast().op("text_ops"), table.subjectId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subject.id],
			name: "SubjectSyllabusMap_subject_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.syllabusId],
			foreignColumns: [syllabus.id],
			name: "SubjectSyllabusMap_syllabusId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const quizProgress = pgTable("QuizProgress", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	attended: integer().default(0).notNull(),
	totalScore: integer().default(0).notNull(),
	lastQuizId: text(),
	lastQuizDate: timestamp({ precision: 3, mode: 'string' }),
}, (table) => [
	uniqueIndex("QuizProgress_userId_key").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "QuizProgress_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const syllabus = pgTable("Syllabus", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	type: syllabusType().default('EXAM').notNull(),
	examYearId: text("exam_year_id"),
	title: text().notNull(),
	description: text(),
}, (table) => [
	uniqueIndex("Syllabus_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	uniqueIndex("Syllabus_title_key").using("btree", table.title.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.examYearId],
			foreignColumns: [examYear.id],
			name: "Syllabus_exam_year_id_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const tier = pgTable("Tier", {
	id: text().primaryKey().notNull(),
	name: primeStatus().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("Tier_name_key").using("btree", table.name.asc().nullsLast().op("enum_ops")),
]);

export const social = pgTable("Social", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	platform: socialPlatform().notNull(),
	link: text().notNull(),
	isVerified: boolean().default(false).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("Social_platform_link_key").using("btree", table.platform.asc().nullsLast().op("text_ops"), table.link.asc().nullsLast().op("text_ops")),
	uniqueIndex("Social_userId_platform_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.platform.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Social_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const topicNoteVersion = pgTable("TopicNoteVersion", {
	id: text().primaryKey().notNull(),
	topicId: text().notNull(),
	content: text(),
	version: integer(),
	attachments: text().array().default(["RAY"]),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [topic.id],
			name: "TopicNoteVersion_topicId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const topicsSubjectMap = pgTable("TopicsSubjectMap", {
	id: text().primaryKey().notNull(),
	subjectMapId: text("subject_map_id").notNull(),
	topicId: text("topic_id").notNull(),
	weightage: doublePrecision().default(0),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("TopicsSubjectMap_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	uniqueIndex("TopicsSubjectMap_subject_map_id_topic_id_key").using("btree", table.subjectMapId.asc().nullsLast().op("text_ops"), table.topicId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.subjectMapId],
			foreignColumns: [subjectSyllabusMap.id],
			name: "TopicsSubjectMap_subject_map_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [topic.id],
			name: "TopicsSubjectMap_topic_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const tierBenefit = pgTable("TierBenefit", {
	id: text().primaryKey().notNull(),
	tierId: text().notNull(),
	feature: examType().notNull(),
	access: boolean().notNull(),
	limit: integer(),
	used: integer(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("TierBenefit_tierId_feature_key").using("btree", table.tierId.asc().nullsLast().op("text_ops"), table.feature.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.tierId],
			foreignColumns: [tier.id],
			name: "TierBenefit_tierId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const userActivity = pgTable("UserActivity", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	date: timestamp({ precision: 3, mode: 'string' }).notNull(),
	type: activityType().notNull(),
	meta: jsonb(),
	xp: integer().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("UserActivity_date_idx").using("btree", table.date.asc().nullsLast().op("timestamp_ops")),
	index("UserActivity_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "UserActivity_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const userAns = pgTable("UserAns", {
	id: text().primaryKey().notNull(),
	number: integer().default(0).notNull(),
	part: text().default('part1').notNull(),
	examId: text().notNull(),
	userId: text().notNull(),
	questionId: text().default('not set').notNull(),
	shuffleMap: integer().array(),
	selectedOption: text().array(),
	isCorrect: boolean(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("UserAns_examId_userId_questionId_key").using("btree", table.examId.asc().nullsLast().op("text_ops"), table.userId.asc().nullsLast().op("text_ops"), table.questionId.asc().nullsLast().op("text_ops")),
	uniqueIndex("UserAns_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [question.id],
			name: "UserAns_questionId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "UserAns_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const userBadge = pgTable("UserBadge", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	badgeId: text().notNull(),
	earnedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("UserBadge_userId_badgeId_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.badgeId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.badgeId],
			foreignColumns: [badge.id],
			name: "UserBadge_badgeId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "UserBadge_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const user = pgTable("User", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	contactno: text().default('0000000000'),
	password: text().notNull(),
	targetedExamId: text("targeted_exam_id").default('not set'),
	examYearId: text("exam_year_id").default('not set'),
	academicProfile: jsonb(),
	school: text(),
	standard: text(),
	stream: text(),
	role: userRole().default('User').notNull(),
	joinAt: timestamp("join_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	forgotpasswordToken: text(),
	resetTokenExpires: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	accesstoken: text().array().default(["RAY"]),
	isOnline: boolean().default(false).notNull(),
	lastSeen: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	avater: text(),
}, (table) => [
	uniqueIndex("User_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("User_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	index("User_role_idx").using("btree", table.role.asc().nullsLast().op("enum_ops")),
]);

export const balance = pgTable("balance", {
	id: text().primaryKey().notNull(),
	userid: text().notNull(),
	amount: integer().default(0).notNull(),
	ticket: integer().default(0).notNull(),
	lastUpdate: timestamp("last_update", { precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("balance_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	uniqueIndex("balance_userid_key").using("btree", table.userid.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userid],
			foreignColumns: [user.id],
			name: "balance_userid_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const prismaMigrations = pgTable("_prisma_migrations", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	checksum: varchar({ length: 64 }).notNull(),
	finishedAt: timestamp("finished_at", { withTimezone: true, mode: 'string' }),
	migrationName: varchar("migration_name", { length: 255 }).notNull(),
	logs: text(),
	rolledBackAt: timestamp("rolled_back_at", { withTimezone: true, mode: 'string' }),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const botInfo = pgTable("botInfo", {
	id: text().primaryKey().notNull(),
	botuserId: text("botuser_id").notNull(),
	token: text().notNull(),
	webhook: jsonb(),
}, (table) => [
	uniqueIndex("botInfo_botuser_id_key").using("btree", table.botuserId.asc().nullsLast().op("text_ops")),
	uniqueIndex("botInfo_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.botuserId],
			foreignColumns: [user.id],
			name: "botInfo_botuser_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const botQuizConfig = pgTable("botQuizConfig", {
	id: text().primaryKey().notNull(),
	title: text(),
	chatId: text(),
	platform: platform().default('NONE').notNull(),
	check: check().default('Normal'),
	syllabusid: text(),
	syllabus: syllabusType().default('Syllabus').notNull(),
	topics: text().array(),
	exam: text(),
	nextQuestionTime: integer().default(40).notNull(),
	quizOpenFor: integer().default(60).notNull(),
	variableDelay: boolean().default(false).notNull(),
	suffleQuestions: boolean().default(true).notNull(),
	totalQuestions: integer("total_questions").default(0).notNull(),
	marksValues: integer("marks_values").default(1).notNull(),
	negValues: integer("neg_values").default(0).notNull(),
	isMultipleAns: boolean("is_multiple_ans").default(false).notNull(),
	waitingTime: integer("waiting_time").default(10).notNull(),
	createdBy: text("created_by"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("botQuizConfig_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	uniqueIndex("botQuizConfig_title_key").using("btree", table.title.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "botQuizConfig_created_by_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const leaderboard = pgTable("leaderboard", {
	id: text().primaryKey().notNull(),
	userId: text("user_id"),
	examId: text("exam_id").notNull(),
	rank: integer().notNull(),
	score: integer().notNull(),
	time: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("leaderboard_user_id_exam_id_time_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.examId.asc().nullsLast().op("text_ops"), table.time.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.examId],
			foreignColumns: [exam.id],
			name: "leaderboard_exam_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "leaderboard_user_id_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const userStreak = pgTable("UserStreak", {
	userId: text().primaryKey().notNull(),
	streak: integer().default(0).notNull(),
	maxStreak: integer().default(0).notNull(),
	lastActivity: timestamp({ precision: 3, mode: 'string' }),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "UserStreak_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const payment = pgTable("payment", {
	id: text().primaryKey().notNull(),
	razorpayOrderId: text("razorpay_order_id").notNull(),
	razorpayPaymentId: text("razorpay_payment_id").notNull(),
	razorpaySignature: text("razorpay_signature").notNull(),
	amount: integer().notNull(),
	currency: text().default('INR').notNull(),
	status: text().default('pending').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	userId: text(),
}, (table) => [
	uniqueIndex("payment_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	uniqueIndex("payment_razorpay_order_id_key").using("btree", table.razorpayOrderId.asc().nullsLast().op("text_ops")),
	uniqueIndex("payment_razorpay_payment_id_key").using("btree", table.razorpayPaymentId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "payment_userId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const prime = pgTable("prime", {
	id: text().primaryKey().notNull(),
	status: primeStatus().default('None').notNull(),
	userid: text().notNull(),
	expiryInday: integer().default(0),
	expiry: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("prime_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	uniqueIndex("prime_userid_key").using("btree", table.userid.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userid],
			foreignColumns: [user.id],
			name: "prime_userid_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const quiz = pgTable("quiz", {
	id: text().primaryKey().notNull(),
	displayId: text("display_id"),
	quizRegisterId: text("quizRegister_id").default('Private quiz'),
	isNeedRegistration: boolean("is_need_registration").default(false).notNull(),
	name: text().default('No name'),
	category: text().notNull(),
	topics: text().array().default(["RAY[''::tex"]),
	subjects: text().array().default(["RAY[''::tex"]),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	createdBy: text("created_by").default('No name').notNull(),
	visibility: visibility("Visibility").default('Private').notNull(),
	creationstatus: creationTypes().default('Processing').notNull(),
	starttime: text().default('00:00 pm'),
	endtime: text().default('00:00 h').notNull(),
	nextQuestionTime: integer().default(40).notNull(),
	quizOpenFor: integer().default(60).notNull(),
	questionCount: integer("question_count").default(0).notNull(),
	quizType: quizType("quiz_type").default('quiz').notNull(),
	chatId: text(),
	date: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	stage: examStage().default('Registration').notNull(),
}, (table) => [
	uniqueIndex("quiz_display_id_key").using("btree", table.displayId.asc().nullsLast().op("text_ops")),
	uniqueIndex("quiz_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "quiz_created_by_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.quizRegisterId],
			foreignColumns: [quizRegister.id],
			name: "quiz_quizRegister_id_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const quizQuestionMap = pgTable("quiz_question_map", {
	id: text().primaryKey().notNull(),
	number: integer().default(0).notNull(),
	questionid: text().notNull(),
	quizid: text(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("quiz_question_map_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	index("quiz_question_map_quizid_idx").using("btree", table.quizid.asc().nullsLast().op("text_ops")),
	uniqueIndex("quiz_question_map_quizid_questionid_key").using("btree", table.quizid.asc().nullsLast().op("text_ops"), table.questionid.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.questionid],
			foreignColumns: [question.id],
			name: "quiz_question_map_questionid_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.quizid],
			foreignColumns: [quiz.id],
			name: "quiz_question_map_quizid_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const quizRegister = pgTable("quizRegister", {
	id: text().primaryKey().notNull(),
	quizId: text("quiz_id").default('new_value_not_seted'),
	count: integer().default(0).notNull(),
	users: text().array().default(["RAY"]),
}, (table) => [
	uniqueIndex("quizRegister_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	uniqueIndex("quizRegister_quiz_id_key").using("btree", table.quizId.asc().nullsLast().op("text_ops")),
]);

export const events = pgTable("events", {
	id: text().primaryKey().notNull(),
	type: eventType().notNull(),
	description: text().notNull(),
	payload: jsonb().notNull(),
	conditions: jsonb(),
	isActive: boolean().default(true).notNull(),
	createdBy: userRole("created_by").default('Bot').notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	runs: eventRuns().default('ONE').notNull(),
	runAt: text("run_at").notNull(),
}, (table) => [
	uniqueIndex("events_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	index("events_run_at_idx").using("btree", table.runAt.asc().nullsLast().op("text_ops")),
	index("events_runs_idx").using("btree", table.runs.asc().nullsLast().op("enum_ops")),
	index("events_type_idx").using("btree", table.type.asc().nullsLast().op("enum_ops")),
]);

export const userTopicProgress = pgTable("UserTopicProgress", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	topicId: text().notNull(),
	timeSpent: integer().default(0).notNull(),
	status: progressStatus().default('NOT_STARTED').notNull(),
	lastReadAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("UserTopicProgress_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	uniqueIndex("UserTopicProgress_userId_topicId_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.topicId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [topic.id],
			name: "UserTopicProgress_topicId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "UserTopicProgress_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const questionMap = pgTable("question_map", {
	id: text().primaryKey().notNull(),
	number: integer().default(0).notNull(),
	questionid: text().notNull(),
	part: text().default('part1').notNull(),
	examid: text(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("question_map_examid_idx").using("btree", table.examid.asc().nullsLast().op("text_ops")),
	uniqueIndex("question_map_examid_questionid_part_key").using("btree", table.examid.asc().nullsLast().op("text_ops"), table.questionid.asc().nullsLast().op("text_ops"), table.part.asc().nullsLast().op("text_ops")),
	uniqueIndex("question_map_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.examid],
			foreignColumns: [exam.id],
			name: "question_map_examid_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.questionid],
			foreignColumns: [question.id],
			name: "question_map_questionid_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const telegramGroupInfo = pgTable("telegramGroupInfo", {
	id: text().primaryKey().notNull(),
	groupid: text().notNull(),
	groupname: text().notNull(),
	groupType: telegramgroupType().default('group').notNull(),
	grouplink: text(),
	isTopic: boolean().default(false).notNull(),
	isPremium: boolean().default(false).notNull(),
	adminIds: text().array(),
	isBanned: boolean().default(false).notNull(),
	lastActiveAt: timestamp({ precision: 3, mode: 'string' }),
	messageCount: integer().default(0).notNull(),
	quizCount: integer().default(0).notNull(),
	language: text().default('en').notNull(),
	timezone: text(),
	features: jsonb(),
	groupstatus: text().default('open'),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("telegramGroupInfo_groupid_key").using("btree", table.groupid.asc().nullsLast().op("text_ops")),
	uniqueIndex("telegramGroupInfo_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
]);

export const telegramBanUser = pgTable("telegram_ban_user", {
	id: text().primaryKey().notNull(),
	botId: text("bot_id").notNull(),
	userTelegramId: text("user_telegram_id").notNull(),
	banFromType: text("ban_from_type").notNull(),
	banFromId: text("ban_from_id").notNull(),
	status: banStatus().default('Ban').notNull(),
	at: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("telegram_ban_user_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	uniqueIndex("telegram_ban_user_user_telegram_id_ban_from_id_key").using("btree", table.userTelegramId.asc().nullsLast().op("text_ops"), table.banFromId.asc().nullsLast().op("text_ops")),
]);

export const subcriptionOffers = pgTable("subcriptionOffers", {
	id: text().primaryKey().notNull(),
	markedPrice: integer().notNull(),
	discount: integer().notNull(),
	type: purchaseType().notNull(),
	title: text().notNull(),
	price: integer().notNull(),
	token: integer(),
	isExamBased: boolean().default(false).notNull(),
	targetExamId: text("target_exam_id"),
	tierId: text(),
	time: text(),
	offerActive: text().array().default(["RAY"]),
	offerInActive: text().array().default(["RAY"]),
	btncolor: text().default(').notNull(),
	createdBy: text("created_by"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("subcriptionOffers_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.targetExamId],
			foreignColumns: [targetExam.id],
			name: "subcriptionOffers_target_exam_id_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.tierId],
			foreignColumns: [tier.id],
			name: "subcriptionOffers_tierId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const telegramGroupTopic = pgTable("telegramGroupTopic", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	topicId: integer().notNull(),
	groupId: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [telegramGroupInfo.id],
			name: "telegramGroupTopic_groupId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const score = pgTable("score", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	examId: text("exam_id").notNull(),
	leaderboardId: text("leaderboard_id").notNull(),
	notAttempt: integer("not_attempt").default(0),
	score: integer().notNull(),
	totalQuestions: integer("total_questions").default(0).notNull(),
	topicWiseResult: jsonb("topic_wise_result"),
	result: jsonb(),
	time: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("score_exam_id_idx").using("btree", table.examId.asc().nullsLast().op("text_ops")),
	index("score_time_idx").using("btree", table.time.desc().nullsFirst().op("timestamp_ops")),
	uniqueIndex("score_user_id_exam_id_time_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.examId.asc().nullsLast().op("text_ops"), table.time.asc().nullsLast().op("text_ops")),
	index("score_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const activityLeaderboard = pgTable("ActivityLeaderboard", {
	id: text().primaryKey().notNull(),
	date: timestamp({ precision: 3, mode: 'string' }).notNull(),
	userId: text().notNull(),
	rank: integer().notNull(),
	score: integer().notNull(),
	type: text().default('daily').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("ActivityLeaderboard_date_idx").using("btree", table.date.asc().nullsLast().op("timestamp_ops")),
	uniqueIndex("ActivityLeaderboard_date_userId_type_key").using("btree", table.date.asc().nullsLast().op("text_ops"), table.userId.asc().nullsLast().op("text_ops"), table.type.asc().nullsLast().op("timestamp_ops")),
	index("ActivityLeaderboard_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "ActivityLeaderboard_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const comment = pgTable("Comment", {
	id: text().primaryKey().notNull(),
	content: text().notNull(),
	topicId: text().notNull(),
	authorId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [user.id],
			name: "Comment_authorId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [topic.id],
			name: "Comment_topicId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const topic = pgTable("Topic", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	subjectId: text().notNull(),
	isparentTopic: boolean().default(false).notNull(),
	parentTopicId: text(),
	shortName: text(),
	order: integer().default(100).notNull(),
	description: text().default('No description provided'),
	slug: text().notNull(),
	iconUrl: text(),
	color: text(),
	tags: text().array().default(["RAY"]),
	content: text().default('no content added ').notNull(),
	like: integer().default(0).notNull(),
	dislike: integer().default(0).notNull(),
	readCount: integer().default(0).notNull(),
	comments: integer().default(0).notNull(),
	isPublic: boolean().default(false).notNull(),
	commentEnabled: boolean().default(true).notNull(),
	verified: boolean().default(false).notNull(),
	estimatedReadTime: integer(),
	version: integer().default(100).notNull(),
	attachments: text().array().default(["RAY"]),
	publishedAt: timestamp({ precision: 3, mode: 'string' }),
	language: text(),
	status: topicStatus().default('draft').notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	createdBy: text(),
	updatedBy: text(),
}, (table) => [
	uniqueIndex("Topic_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	uniqueIndex("Topic_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("Topic_shortName_key").using("btree", table.shortName.asc().nullsLast().op("text_ops")),
	uniqueIndex("Topic_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("Topic_subjectId_idx").using("btree", table.subjectId.asc().nullsLast().op("text_ops")),
	uniqueIndex("Topic_subjectId_order_key").using("btree", table.subjectId.asc().nullsLast().op("int4_ops"), table.order.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "Topic_createdBy_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.parentTopicId],
			foreignColumns: [table.id],
			name: "Topic_parentTopicId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subject.id],
			name: "Topic_subjectId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const coupon = pgTable("Coupon", {
	id: text().primaryKey().notNull(),
	code: text().notNull(),
	description: text(),
	discountType: text().notNull(),
	discountValue: doublePrecision().notNull(),
	maxUses: integer(),
	usedCount: integer().default(0).notNull(),
	perUserLimit: integer(),
	minOrderAmount: doublePrecision(),
	expiresAt: timestamp({ precision: 3, mode: 'string' }),
	isActive: boolean().default(true).notNull(),
	createdBy: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("Coupon_code_key").using("btree", table.code.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "Coupon_createdBy_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const couponUsage = pgTable("CouponUsage", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	couponId: text().notNull(),
	usedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("CouponUsage_userId_couponId_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.couponId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.couponId],
			foreignColumns: [coupon.id],
			name: "CouponUsage_couponId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "CouponUsage_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const examProgress = pgTable("ExamProgress", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	attended: integer().default(0).notNull(),
	totalQuestionsAttempted: integer().default(0).notNull(),
	totalCorrect: integer().default(0).notNull(),
	accuracy: doublePrecision().default(0).notNull(),
	lastExamId: text(),
	lastExamDate: timestamp({ precision: 3, mode: 'string' }),
	lastRank: integer().default(0).notNull(),
	bestRank: integer().default(0).notNull(),
}, (table) => [
	uniqueIndex("ExamProgress_userId_key").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "ExamProgress_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const examYear = pgTable("ExamYear", {
	id: text().primaryKey().notNull(),
	targetExamId: text().notNull(),
	year: integer().notNull(),
	slug: text().notNull(),
	status: examStatus().default('SCHEDULED').notNull(),
	isPublic: boolean().default(false).notNull(),
	registrationOpenDate: timestamp({ precision: 3, mode: 'string' }),
	registrationCloseDate: timestamp({ precision: 3, mode: 'string' }),
	examDate: timestamp({ precision: 3, mode: 'string' }),
	resultDate: timestamp({ precision: 3, mode: 'string' }),
	notes: jsonb(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	isDeleted: boolean().default(false).notNull(),
}, (table) => [
	uniqueIndex("ExamYear_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.targetExamId],
			foreignColumns: [targetExam.id],
			name: "ExamYear_targetExamId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const examTimeline = pgTable("ExamTimeline", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	date: timestamp({ precision: 3, mode: 'string' }).notNull(),
	description: text(),
	status: examStatus().notNull(),
	notification: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	examYear: text("exam_year").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.examYear],
			foreignColumns: [examYear.id],
			name: "ExamTimeline_exam_year_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const targetExam = pgTable("TargetExam", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	shortCode: text(),
	description: text(),
	examScope: examScope().default('NATIONAL').notNull(),
	isPublic: boolean().default(false).notNull(),
	categoryId: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("TargetExam_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("TargetExam_shortCode_key").using("btree", table.shortCode.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [category.id],
			name: "TargetExam_categoryId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const exam = pgTable("Exam", {
	id: text().primaryKey().notNull(),
	displayId: text("display_id"),
	name: text().default('No name'),
	examtype: examType().default('Test').notNull(),
	accessType: accessType("access_type").default('Paid').notNull(),
	examPatternId: text("exam_pattern_id").notNull(),
	isMultipleAttemp: boolean().default(true).notNull(),
	isLive: boolean().default(true).notNull(),
	visibility: visibility("Visibility").default('Private').notNull(),
	creationstatus: creationTypes().default('Processing').notNull(),
	starttime: text().default('08:00 pm'),
	jointime: text().default('00:15 m'),
	duration: text().default('02:00 h').notNull(),
	date: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	stage: examStage().default('Registration').notNull(),
	registerId: text("register_id").default(').notNull(),
	questionDifficultyWeight: jsonb("question_difficulty_weight"),
	questionTopicCount: jsonb("question_topic_count"),
	questionPartCount: jsonb("question_part_count"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	createdBy: text("created_by"),
}, (table) => [
	uniqueIndex("Exam_display_id_key").using("btree", table.displayId.asc().nullsLast().op("text_ops")),
	index("Exam_examtype_idx").using("btree", table.examtype.asc().nullsLast().op("enum_ops")),
	uniqueIndex("Exam_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "Exam_created_by_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.examPatternId],
			foreignColumns: [examPattern.id],
			name: "Exam_exam_pattern_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.registerId],
			foreignColumns: [contestRegister.id],
			name: "Exam_register_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const examPattern = pgTable("Exam_pattern", {
	id: text().primaryKey().notNull(),
	title: text(),
	format: examformat().default('Text').notNull(),
	examname: text().notNull(),
	categoryId: text(),
	syllabus: syllabusType().default('Syllabus').notNull(),
	syllabusid: text(),
	topics: text().array(),
	difficulty: diffcultlevel().default('Easy').notNull(),
	part: boolean(),
	checkbox: boolean(),
	partCount: integer("part_Count").default(1).notNull(),
	totalQuestions: integer("total_questions").array(),
	check: check(),
	marksValues: integer("marks_values").array(),
	negValues: integer("neg_values").array(),
	isMultipleAns: integer("is_multiple_ans").array().default([RAY[0, ]),
	createdBy: text("created_by"),
}, (table) => [
	uniqueIndex("Exam_pattern_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	uniqueIndex("Exam_pattern_title_key").using("btree", table.title.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [category.id],
			name: "Exam_pattern_categoryId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "Exam_pattern_created_by_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const category = pgTable("Category", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	shortName: text(),
	description: text(),
	iconUrl: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("Category_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("Category_shortName_key").using("btree", table.shortName.asc().nullsLast().op("text_ops")),
	uniqueIndex("Category_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
]);

export const contestRegister = pgTable("ContestRegister", {
	id: text().primaryKey().notNull(),
	examId: text().default('new_value_not_seted'),
	count: integer().default(0).notNull(),
	users: text().array().default(["RAY"]),
}, (table) => [
	uniqueIndex("ContestRegister_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
]);

export const order = pgTable("Order", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	razorpayOrderId: text("razorpay_order_id").notNull(),
	amount: integer().notNull(),
	type: purchaseType().default('TOKEN').notNull(),
	token: integer().default(0),
	subcription: primeStatus().default('None'),
	couponId: text(),
	status: text().default('pending').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("Order_razorpay_order_id_key").using("btree", table.razorpayOrderId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Order_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const questionProcessing = pgTable("QuestionProcessing", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	options: text().array(),
	oldTopic: text("old_topic"),
	oldSubTopic: text("old_sub_topic"),
	extra: jsonb(),
	ans: text().array(),
	topicId: text("topic_id").notNull(),
	subjectId: text("subject_id").notNull(),
	format: examformat().default('Text').notNull(),
	category: text().notNull(),
	difficulty: diffcultlevel().notNull(),
	isMultipleAns: boolean("is_multiple_ans").default(false).notNull(),
	history: text().array().default(["RAY[''::tex"]),
	explanation: text().default('no explanation added'),
	links: text().array().default(["RAY[''::tex"]),
	status: status().default('Processing').notNull(),
	weight: integer().default(0).notNull(),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).notNull(),
	questionId: text("question_id"),
	processingStatus: processingStatus("processing_status").default('Pending').notNull(),
	adminComment: text("admin_comment"),
	processedBy: text("processed_by"),
	processedAt: timestamp("processed_at", { precision: 3, mode: 'string' }),
}, (table) => [
	uniqueIndex("QuestionProcessing_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	index("QuestionProcessing_processing_status_idx").using("btree", table.processingStatus.asc().nullsLast().op("enum_ops")),
	index("QuestionProcessing_subject_id_idx").using("btree", table.subjectId.asc().nullsLast().op("text_ops")),
	index("QuestionProcessing_topic_id_idx").using("btree", table.topicId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "QuestionProcessing_created_by_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.processedBy],
			foreignColumns: [user.id],
			name: "QuestionProcessing_processed_by_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subject.id],
			name: "QuestionProcessing_subject_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [topic.id],
			name: "QuestionProcessing_topic_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const subject = pgTable("Subject", {
	id: text().primaryKey().notNull(),
	order: integer().notNull(),
	name: text().notNull(),
	shortName: text(),
	description: text().default('No description provided'),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	slug: text().notNull(),
	iconUrl: text(),
	color: text(),
	isPublic: boolean().default(true).notNull(),
	category: text().notNull(),
	categoryId: text(),
	level: text(),
	difficulty: integer(),
}, (table) => [
	uniqueIndex("Subject_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	uniqueIndex("Subject_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("Subject_order_key").using("btree", table.order.asc().nullsLast().op("int4_ops")),
	uniqueIndex("Subject_shortName_key").using("btree", table.shortName.asc().nullsLast().op("text_ops")),
	uniqueIndex("Subject_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [category.id],
			name: "Subject_categoryId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const question = pgTable("Question", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	options: text().array(),
	oldTopic: text("old_topic").notNull(),
	oldSubTopic: text("old_sub_topic").notNull(),
	extra: jsonb(),
	ans: text().array(),
	topicId: text("topic_id"),
	subjectId: text("subject_id").notNull(),
	format: examformat().default('Text').notNull(),
	category: text().notNull(),
	categoryid: text(),
	difficulty: diffcultlevel().notNull(),
	isMultipleAns: boolean("is_multiple_ans").default(false).notNull(),
	history: text().array().default(["RAY[''::tex"]),
	explanation: text().default('no explanation added'),
	links: text().array().default(["RAY[''::tex"]),
	status: status().default('Processing').notNull(),
	weight: integer().default(0).notNull(),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("Question_id_key").using("btree", table.id.asc().nullsLast().op("text_ops")),
	index("Question_subject_id_idx").using("btree", table.subjectId.asc().nullsLast().op("text_ops")),
	index("Question_topic_id_idx").using("btree", table.topicId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.categoryid],
			foreignColumns: [category.id],
			name: "Question_categoryid_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "Question_created_by_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subject.id],
			name: "Question_subject_id_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [topic.id],
			name: "Question_topic_id_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const questionsBackup = pgTable("questions_backup", {
	id: text(),
	title: text(),
	options: text(),
	oldTopic: text("old_topic"),
	oldSubTopic: text("old_sub_topic"),
	extra: jsonb(),
	ans: text(),
	topicId: text("topic_id"),
	subjectId: text("subject_id"),
	format: examformat(),
	category: text(),
	categoryid: text(),
	difficulty: diffcultlevel(),
	isMultipleAns: boolean("is_multiple_ans"),
	history: text(),
	explanation: text(),
	links: text(),
	status: status(),
	weight: integer(),
	createdBy: text("created_by"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }),
});

export const relatedTopics = pgTable("_RelatedTopics", {
	a: text("A").notNull(),
	b: text("B").notNull(),
}, (table) => [
	index().using("btree", table.b.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.a],
			foreignColumns: [topic.id],
			name: "_RelatedTopics_A_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.b],
			foreignColumns: [topic.id],
			name: "_RelatedTopics_B_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	primaryKey({ columns: [table.a, table.b], name: "_RelatedTopics_AB_pkey"}),
]);

export const timescaleScore = pgTable("timescale_score", {
	id: text().notNull(),
	userId: text("user_id").notNull(),
	examId: text("exam_id").notNull(),
	score: integer().notNull(),
	notAttempt: integer("not_attempt").default(0),
	topicWiseResult: jsonb("topic_wise_result"),
	result: jsonb(),
	time: timestamp({ precision: 6, withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("timescale_score_time_idx").using("btree", table.time.desc().nullsFirst().op("timestamptz_ops")),
	uniqueIndex("timescale_score_user_id_exam_id_time_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.examId.asc().nullsLast().op("text_ops"), table.time.asc().nullsLast().op("text_ops")),
	primaryKey({ columns: [table.id, table.time], name: "timescale_score_pkey"}),
]);
