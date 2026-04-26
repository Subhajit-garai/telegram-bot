import { db, schema } from "@repo/db/index.js";
import { eq, and } from "drizzle-orm";
import { SocialPlatform } from "@repo/db/schema/enums.js";
import { logger } from "@/utils/logger.js";
import {
    banuser_notification_zod_type,
    unbanuser_notification_zod_type,
} from "../../zod/bot.zod.js";



export class BotTelegramService {
    /**
     * Handles bot notifications (ban/unban).
     */
    async processNotification(type: string, data: any) {
        switch (type) {
            case "unbanuser":
                return this.handleUnbanUser(data);
            case "banuser":
                return this.handleBanUser(data);
            default:
                throw new Error(`Unknown notification type: ${type}`);
        }
    }

    private async handleUnbanUser(data: any) {
        const validation = unbanuser_notification_zod_type.safeParse(data);
        if (!validation.success) throw new Error("Invalid data format for unbanuser");

        const { user_id, chat_id } = validation.data;

        const banRecord = await db.query.telegram_ban_users.findFirst({
            where: and(
                eq(schema.telegram_ban_users.user_telegram_id, user_id),
                eq(schema.telegram_ban_users.ban_from_id, chat_id)
            )
        });

        if (!banRecord) throw new Error("Ban record not found or already unbanned");

        await db.delete(schema.telegram_ban_users).where(
            and(
                eq(schema.telegram_ban_users.user_telegram_id, user_id),
                eq(schema.telegram_ban_users.ban_from_id, chat_id)
            )
        );

        return { message: "User unbanned successfully" };
    }

    private async handleBanUser(data: any) {
        const validation = banuser_notification_zod_type.safeParse(data);
        if (!validation.success) throw new Error("Invalid data format for banuser");

        const { user_id, chat_id, ban_from_type } = validation.data;
        let botuser = await db.query.users.findFirst({
            where: eq(schema.users.role, "Bot")
        });

        if (!botuser) throw Error("Bot user not found")

        await db.insert(schema.telegram_ban_users).values({
            user_telegram_id: user_id,
            ban_from_id: chat_id,
            bot_id: botuser.id,
            ban_from_type: ban_from_type,
            status: "Ban",
        });

        return { message: "User banned successfully" };
    }

    async getAllUsersForTelegram() {
        const users = await db.query.users.findMany({
            with: {
                socials: {
                    where: eq(schema.socials.platform, SocialPlatform.enumValues.find((v: string) => v === "telegram") || "telegram"),
                },
                prime: true,
            },
        });


        return users.map(user => ({
            social: user.socials,
            prime: user.prime ? { status: user.prime.status } : null
        }));
    }

    async getValidChatIds() {
        const groupDatas = await db.select({
            groupid: schema.telegram_group_infos.group_id,
            groupType: schema.telegram_group_infos.group_type,
            isBanned: schema.telegram_group_infos.is_banned,
            isPremium: schema.telegram_group_infos.is_premium,
        }).from(schema.telegram_group_infos);

        return groupDatas
            .filter((g) => !g.isBanned)
            .map((g) => ({
                id: g.groupid,
                type: g.groupType,
                isPremium: g.isPremium,
            }));
    }

    async getGroupTopicInfo(groupId: string, name: string) {
        const results = await db.select({
            topic: schema.telegram_group_topics
        })
            .from(schema.telegram_group_topics)
            .innerJoin(schema.telegram_group_infos, eq(schema.telegram_group_topics.group_id, schema.telegram_group_infos.id))
            .where(and(
                eq(schema.telegram_group_topics.name, name),
                eq(schema.telegram_group_infos.group_id, groupId)
            ))
            .limit(1);

        const info = results[0]?.topic;
        if (!info) throw new Error("Group topic info not available for that given name or group id");
        return info;
    }

    async getGroupInfo(chatid: string) {
        const groupInfo = await db.query.telegram_group_infos.findFirst({
            where: eq(schema.telegram_group_infos.group_id, chatid),
        });
        return groupInfo || null;
    }

    async isGroupJoinable(chatid: string) {
        const groupInfo = await db.query.telegram_group_infos.findFirst({
            where: eq(schema.telegram_group_infos.group_id, chatid),
        });
        return groupInfo?.is_banned === false;
    }

    async getUsersByRole(role: "User" | "Admin" = "User") {

        let users = await db.query.users.findMany({
            where: eq(schema.users.role, role),
            with: {
                socials: true,
                prime: true,
            },
        });

        if (!users) throw new Error("No users found");

        return users.map(user => ({
            social: user.socials.map(s => ({ platform: s.platform, link: s.link })),
            prime: user.prime ? { status: user.prime.status, expiry: user.prime.expiry } : null,
        }));
    }

    async isPrimeUser(telegramid: string) {

        const userTelegramdata = await db.query.socials.findFirst({
            where: and(
                eq(schema.socials.platform, "telegram"),
                eq(schema.socials.link, telegramid)
            )
        });

        if (!userTelegramdata) throw new Error("User not found");

        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userTelegramdata.user_id),
            with: { prime: true },
        });
        if (!user) throw new Error("User not found");
        return user.prime?.status !== "None";
    }

    async getQuizConfig(chatid: string) {
        const config = await db.query.bot_quiz_configs.findFirst({
            where: eq(schema.bot_quiz_configs.chat_id, chatid),
        });
        if (!config) throw new Error("Quiz config not found");
        return {
            total_questions: config.total_questions,
            topics: config.topics,
            is_multiple_ans: config.is_multiple_answers,
            nextQuestionTime: config.next_question_time,
            quizOpenFor: config.quiz_open_for,
        };
    }
}
