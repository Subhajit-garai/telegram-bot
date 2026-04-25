import { relations } from "drizzle-orm/relations";
import { user, dppProgress, subject, subjectSyllabusMap, syllabus, quizProgress, examYear, social, topic, topicNoteVersion, topicsSubjectMap, tier, tierBenefit, userActivity, question, userAns, badge, userBadge, balance, botInfo, botQuizConfig, exam, leaderboard, userStreak, payment, prime, quiz, quizRegister, quizQuestionMap, userTopicProgress, questionMap, targetExam, subcriptionOffers, telegramGroupInfo, telegramGroupTopic, activityLeaderboard, comment, coupon, couponUsage, examProgress, examTimeline, category, examPattern, contestRegister, order, questionProcessing, relatedTopics } from "./schema";

export const dppProgressRelations = relations(dppProgress, ({one}) => ({
	user: one(user, {
		fields: [dppProgress.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	dppProgresses: many(dppProgress),
	quizProgresses: many(quizProgress),
	socials: many(social),
	userActivities: many(userActivity),
	userAns: many(userAns),
	userBadges: many(userBadge),
	balances: many(balance),
	botInfos: many(botInfo),
	botQuizConfigs: many(botQuizConfig),
	leaderboards: many(leaderboard),
	userStreaks: many(userStreak),
	payments: many(payment),
	primes: many(prime),
	quizzes: many(quiz),
	userTopicProgresses: many(userTopicProgress),
	activityLeaderboards: many(activityLeaderboard),
	comments: many(comment),
	topics: many(topic),
	coupons: many(coupon),
	couponUsages: many(couponUsage),
	examProgresses: many(examProgress),
	exams: many(exam),
	examPatterns: many(examPattern),
	orders: many(order),
	questionProcessings_createdBy: many(questionProcessing, {
		relationName: "questionProcessing_createdBy_user_id"
	}),
	questionProcessings_processedBy: many(questionProcessing, {
		relationName: "questionProcessing_processedBy_user_id"
	}),
	questions: many(question),
}));

export const subjectSyllabusMapRelations = relations(subjectSyllabusMap, ({one, many}) => ({
	subject: one(subject, {
		fields: [subjectSyllabusMap.subjectId],
		references: [subject.id]
	}),
	syllabus: one(syllabus, {
		fields: [subjectSyllabusMap.syllabusId],
		references: [syllabus.id]
	}),
	topicsSubjectMaps: many(topicsSubjectMap),
}));

export const subjectRelations = relations(subject, ({one, many}) => ({
	subjectSyllabusMaps: many(subjectSyllabusMap),
	topics: many(topic),
	questionProcessings: many(questionProcessing),
	category: one(category, {
		fields: [subject.categoryId],
		references: [category.id]
	}),
	questions: many(question),
}));

export const syllabusRelations = relations(syllabus, ({one, many}) => ({
	subjectSyllabusMaps: many(subjectSyllabusMap),
	examYear: one(examYear, {
		fields: [syllabus.examYearId],
		references: [examYear.id]
	}),
}));

export const quizProgressRelations = relations(quizProgress, ({one}) => ({
	user: one(user, {
		fields: [quizProgress.userId],
		references: [user.id]
	}),
}));

export const examYearRelations = relations(examYear, ({one, many}) => ({
	syllabi: many(syllabus),
	targetExam: one(targetExam, {
		fields: [examYear.targetExamId],
		references: [targetExam.id]
	}),
	examTimelines: many(examTimeline),
}));

export const socialRelations = relations(social, ({one}) => ({
	user: one(user, {
		fields: [social.userId],
		references: [user.id]
	}),
}));

export const topicNoteVersionRelations = relations(topicNoteVersion, ({one}) => ({
	topic: one(topic, {
		fields: [topicNoteVersion.topicId],
		references: [topic.id]
	}),
}));

export const topicRelations = relations(topic, ({one, many}) => ({
	topicNoteVersions: many(topicNoteVersion),
	topicsSubjectMaps: many(topicsSubjectMap),
	userTopicProgresses: many(userTopicProgress),
	comments: many(comment),
	user: one(user, {
		fields: [topic.createdBy],
		references: [user.id]
	}),
	topic: one(topic, {
		fields: [topic.parentTopicId],
		references: [topic.id],
		relationName: "topic_parentTopicId_topic_id"
	}),
	topics: many(topic, {
		relationName: "topic_parentTopicId_topic_id"
	}),
	subject: one(subject, {
		fields: [topic.subjectId],
		references: [subject.id]
	}),
	questionProcessings: many(questionProcessing),
	questions: many(question),
	relatedTopics_a: many(relatedTopics, {
		relationName: "relatedTopics_a_topic_id"
	}),
	relatedTopics_b: many(relatedTopics, {
		relationName: "relatedTopics_b_topic_id"
	}),
}));

export const topicsSubjectMapRelations = relations(topicsSubjectMap, ({one}) => ({
	subjectSyllabusMap: one(subjectSyllabusMap, {
		fields: [topicsSubjectMap.subjectMapId],
		references: [subjectSyllabusMap.id]
	}),
	topic: one(topic, {
		fields: [topicsSubjectMap.topicId],
		references: [topic.id]
	}),
}));

export const tierBenefitRelations = relations(tierBenefit, ({one}) => ({
	tier: one(tier, {
		fields: [tierBenefit.tierId],
		references: [tier.id]
	}),
}));

export const tierRelations = relations(tier, ({many}) => ({
	tierBenefits: many(tierBenefit),
	subcriptionOffers: many(subcriptionOffers),
}));

export const userActivityRelations = relations(userActivity, ({one}) => ({
	user: one(user, {
		fields: [userActivity.userId],
		references: [user.id]
	}),
}));

export const userAnsRelations = relations(userAns, ({one}) => ({
	question: one(question, {
		fields: [userAns.questionId],
		references: [question.id]
	}),
	user: one(user, {
		fields: [userAns.userId],
		references: [user.id]
	}),
}));

export const questionRelations = relations(question, ({one, many}) => ({
	userAns: many(userAns),
	quizQuestionMaps: many(quizQuestionMap),
	questionMaps: many(questionMap),
	category: one(category, {
		fields: [question.categoryid],
		references: [category.id]
	}),
	user: one(user, {
		fields: [question.createdBy],
		references: [user.id]
	}),
	subject: one(subject, {
		fields: [question.subjectId],
		references: [subject.id]
	}),
	topic: one(topic, {
		fields: [question.topicId],
		references: [topic.id]
	}),
}));

export const userBadgeRelations = relations(userBadge, ({one}) => ({
	badge: one(badge, {
		fields: [userBadge.badgeId],
		references: [badge.id]
	}),
	user: one(user, {
		fields: [userBadge.userId],
		references: [user.id]
	}),
}));

export const badgeRelations = relations(badge, ({many}) => ({
	userBadges: many(userBadge),
}));

export const balanceRelations = relations(balance, ({one}) => ({
	user: one(user, {
		fields: [balance.userid],
		references: [user.id]
	}),
}));

export const botInfoRelations = relations(botInfo, ({one}) => ({
	user: one(user, {
		fields: [botInfo.botuserId],
		references: [user.id]
	}),
}));

export const botQuizConfigRelations = relations(botQuizConfig, ({one}) => ({
	user: one(user, {
		fields: [botQuizConfig.createdBy],
		references: [user.id]
	}),
}));

export const leaderboardRelations = relations(leaderboard, ({one}) => ({
	exam: one(exam, {
		fields: [leaderboard.examId],
		references: [exam.id]
	}),
	user: one(user, {
		fields: [leaderboard.userId],
		references: [user.id]
	}),
}));

export const examRelations = relations(exam, ({one, many}) => ({
	leaderboards: many(leaderboard),
	questionMaps: many(questionMap),
	user: one(user, {
		fields: [exam.createdBy],
		references: [user.id]
	}),
	examPattern: one(examPattern, {
		fields: [exam.examPatternId],
		references: [examPattern.id]
	}),
	contestRegister: one(contestRegister, {
		fields: [exam.registerId],
		references: [contestRegister.id]
	}),
}));

export const userStreakRelations = relations(userStreak, ({one}) => ({
	user: one(user, {
		fields: [userStreak.userId],
		references: [user.id]
	}),
}));

export const paymentRelations = relations(payment, ({one}) => ({
	user: one(user, {
		fields: [payment.userId],
		references: [user.id]
	}),
}));

export const primeRelations = relations(prime, ({one}) => ({
	user: one(user, {
		fields: [prime.userid],
		references: [user.id]
	}),
}));

export const quizRelations = relations(quiz, ({one, many}) => ({
	user: one(user, {
		fields: [quiz.createdBy],
		references: [user.id]
	}),
	quizRegister: one(quizRegister, {
		fields: [quiz.quizRegisterId],
		references: [quizRegister.id]
	}),
	quizQuestionMaps: many(quizQuestionMap),
}));

export const quizRegisterRelations = relations(quizRegister, ({many}) => ({
	quizzes: many(quiz),
}));

export const quizQuestionMapRelations = relations(quizQuestionMap, ({one}) => ({
	question: one(question, {
		fields: [quizQuestionMap.questionid],
		references: [question.id]
	}),
	quiz: one(quiz, {
		fields: [quizQuestionMap.quizid],
		references: [quiz.id]
	}),
}));

export const userTopicProgressRelations = relations(userTopicProgress, ({one}) => ({
	topic: one(topic, {
		fields: [userTopicProgress.topicId],
		references: [topic.id]
	}),
	user: one(user, {
		fields: [userTopicProgress.userId],
		references: [user.id]
	}),
}));

export const questionMapRelations = relations(questionMap, ({one}) => ({
	exam: one(exam, {
		fields: [questionMap.examid],
		references: [exam.id]
	}),
	question: one(question, {
		fields: [questionMap.questionid],
		references: [question.id]
	}),
}));

export const subcriptionOffersRelations = relations(subcriptionOffers, ({one}) => ({
	targetExam: one(targetExam, {
		fields: [subcriptionOffers.targetExamId],
		references: [targetExam.id]
	}),
	tier: one(tier, {
		fields: [subcriptionOffers.tierId],
		references: [tier.id]
	}),
}));

export const targetExamRelations = relations(targetExam, ({one, many}) => ({
	subcriptionOffers: many(subcriptionOffers),
	examYears: many(examYear),
	category: one(category, {
		fields: [targetExam.categoryId],
		references: [category.id]
	}),
}));

export const telegramGroupTopicRelations = relations(telegramGroupTopic, ({one}) => ({
	telegramGroupInfo: one(telegramGroupInfo, {
		fields: [telegramGroupTopic.groupId],
		references: [telegramGroupInfo.id]
	}),
}));

export const telegramGroupInfoRelations = relations(telegramGroupInfo, ({many}) => ({
	telegramGroupTopics: many(telegramGroupTopic),
}));

export const activityLeaderboardRelations = relations(activityLeaderboard, ({one}) => ({
	user: one(user, {
		fields: [activityLeaderboard.userId],
		references: [user.id]
	}),
}));

export const commentRelations = relations(comment, ({one}) => ({
	user: one(user, {
		fields: [comment.authorId],
		references: [user.id]
	}),
	topic: one(topic, {
		fields: [comment.topicId],
		references: [topic.id]
	}),
}));

export const couponRelations = relations(coupon, ({one, many}) => ({
	user: one(user, {
		fields: [coupon.createdBy],
		references: [user.id]
	}),
	couponUsages: many(couponUsage),
}));

export const couponUsageRelations = relations(couponUsage, ({one}) => ({
	coupon: one(coupon, {
		fields: [couponUsage.couponId],
		references: [coupon.id]
	}),
	user: one(user, {
		fields: [couponUsage.userId],
		references: [user.id]
	}),
}));

export const examProgressRelations = relations(examProgress, ({one}) => ({
	user: one(user, {
		fields: [examProgress.userId],
		references: [user.id]
	}),
}));

export const examTimelineRelations = relations(examTimeline, ({one}) => ({
	examYear: one(examYear, {
		fields: [examTimeline.examYear],
		references: [examYear.id]
	}),
}));

export const categoryRelations = relations(category, ({many}) => ({
	targetExams: many(targetExam),
	examPatterns: many(examPattern),
	subjects: many(subject),
	questions: many(question),
}));

export const examPatternRelations = relations(examPattern, ({one, many}) => ({
	exams: many(exam),
	category: one(category, {
		fields: [examPattern.categoryId],
		references: [category.id]
	}),
	user: one(user, {
		fields: [examPattern.createdBy],
		references: [user.id]
	}),
}));

export const contestRegisterRelations = relations(contestRegister, ({many}) => ({
	exams: many(exam),
}));

export const orderRelations = relations(order, ({one}) => ({
	user: one(user, {
		fields: [order.userId],
		references: [user.id]
	}),
}));

export const questionProcessingRelations = relations(questionProcessing, ({one}) => ({
	user_createdBy: one(user, {
		fields: [questionProcessing.createdBy],
		references: [user.id],
		relationName: "questionProcessing_createdBy_user_id"
	}),
	user_processedBy: one(user, {
		fields: [questionProcessing.processedBy],
		references: [user.id],
		relationName: "questionProcessing_processedBy_user_id"
	}),
	subject: one(subject, {
		fields: [questionProcessing.subjectId],
		references: [subject.id]
	}),
	topic: one(topic, {
		fields: [questionProcessing.topicId],
		references: [topic.id]
	}),
}));

export const relatedTopicsRelations = relations(relatedTopics, ({one}) => ({
	topic_a: one(topic, {
		fields: [relatedTopics.a],
		references: [topic.id],
		relationName: "relatedTopics_a_topic_id"
	}),
	topic_b: one(topic, {
		fields: [relatedTopics.b],
		references: [topic.id],
		relationName: "relatedTopics_b_topic_id"
	}),
}));