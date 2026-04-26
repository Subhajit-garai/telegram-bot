
import dayjs from "dayjs";
import TelegramBot from "../utils/Telegrambot.js";

import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { logDate, logger } from "../utils/logger.js";
import { BotService } from "@/services/bot.service.js";
import { primeStatus } from "../db/schema/enums.js";


dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export type User_type = {
  id: string;
  primeStaus: string;
  expiry: Date;
};
export type validChatid_type = {
  id: string;
  type: string;
  isPremium: Boolean;
};

export type Users_type = {
  [key: string]: User_type;
};
export type validChatids_type = {
  [key: string]: validChatid_type;
};



class UserManager {
  private users: Users_type = {};
  private admin: number[] = [];
  private validChatIds: validChatids_type = {};
  private lastupdatedTime: string = "";
  private static instance: UserManager;
  botService: BotService;
  bot: TelegramBot;
  refreshtime: number = parseInt(process.env.REFRESH_TIME?.trim()!) ?? 60; // in minutes

  private constructor() {
    this.botService = new BotService();
    this.bot = TelegramBot.getInstance();
    this.init();
    this.refreshUserdataList();
    // this.refreshtime = parseInt(process.env.REFRESH_TIME!) ;
    console.log(
      "UserManager initialized with refresh time:",
      this.refreshtime,
      "minutes"
    );
  }
  private refreshUserdataList() {
    console.log("Refreshing user list every", this.refreshtime, "minutes");

    setInterval(async () => {
      logger.info("Refreshing user list......");
      logDate();
      await this.getUserInfomationfromServer();
      await this.getValidChatidsInfoFromServer();
    }, this.refreshtime * 60000);
  }

  clearcache() {
    console.log("clearing user manager cache ....");
    this.users = {};
    this.admin = [];
    this.validChatIds = {};
    this.lastupdatedTime = "";
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new UserManager();
    }
    return this.instance;
  }

  private async init() {
    logger.info("init ....");

    let isSucess = await this.getUserInfomationfromServer();
    let isAdminSuccess = await this.getAdmins();
    await this.getValidChatidsInfoFromServer();

    if (isSucess && isAdminSuccess) {
      logger.success("user data setup successful");
      this.lastupdatedTime = dayjs().format();
      logger.info("lastupdatedTime ", this.lastupdatedTime);
      return true;
    }

    return false;
  }



  addUser(id: string, data: User_type): void {
    this.users[id] = data;
  }

  getUser(id: string): User_type | undefined {
    return this.users[id];
  }

  removeUser(id: string): void {
    delete this.users[id];
  }

  isAdmin(userid: number) {
    return this.admin.includes(userid);
  }

  isValidChatId(chat_id: number): boolean {
    return this.validChatIds.hasOwnProperty(String(chat_id));
  }
  async getAdmins() {
    logger.info("getting admin user data ");
    let responce = await this.botService.telegram.getUsersByRole("Admin");

    if (!responce) throw Error("chat ids not found");




    if (Array.isArray(responce) && responce.length > 0) {
      logger.info("adding admin user to local db .....");
      responce.map((user) => {
        if (user.social.length < 1) {
          logger.error("telegram data not found or not updated"); //send notification to user to add telegram id
          return
        } else {
          user.social.map((s) => {
            if (s.platform === "telegram") {
              let id = parseInt(s.link);
              this.admin.push(id);
            }
          })
        }
      });
    }
  }

  private async getUserInfomationfromServer() {
    let users = await this.botService.telegram.getUsersByRole("User");
    if (!users) throw Error("chat ids not found");

    users.map((user) => {

      if (user.social.length < 1) {
        logger.error("telegram data not found or not updated"); //send notification to user to add telegram id
        return
      }


      users.map((user) => {
        if (user.social.length < 1) {
          logger.error("telegram data not found or not updated"); //send notification to user to add telegram id
          return
        } else {
          user.social.map((s) => {
            if (s.platform === "telegram") {
              let id = s.link;
              let data: User_type = {
                id,
                expiry: user?.prime?.expiry ?? new Date(),
                primeStaus: user?.prime?.status ?? "None",
              };
              this.addUser(user.social[0].link, data);
            }
          })
        }
      });



    }
    )
    console.log(this.users);
    return true;
  }

  private async getValidChatidsInfoFromServer() {
    let chatids = await this.botService.telegram.getValidChatIds();
    if (!chatids) throw Error("chat ids not found");

    if (chatids) {
      logger.info("adding group info  to local db .....");
      if (Array.isArray(chatids)) {
        chatids.map((group) => {
          this.validChatIds[group.id] = group;
        });
      }
    }

    if (this.validChatIds) {
      logger.info(" checking user access  .....");
      Object.keys(this.validChatIds).map(async (id: string) => {
        // if group is prime then check user prime status
        let group = this.validChatIds[id];
        if (group.isPremium) {
          await this.checkPrimeStatusJob(parseInt(id));
        } else {
          console.log(
            " group is not premium so no need to check user prime status. --->",
            id
          );
        }
      });
      console.log(" user access checking  successfull  .....");
    }

    return true;
  }

  async isGroupOnline(chat_id: number): Promise<boolean> {
    let isgroupjoinable = await this.botService.telegram.isGroupJoinable(String(chat_id));

    if (isgroupjoinable) {
      return true;
    }

    return false;
  }

  async isUserAccessableToJoin(
    user_id: number,
    chat_id: number
  ): Promise<{ success: boolean; message: string }> {
    let isprime = await this.botService.telegram.isPrimeUser(String(user_id));

    if (isprime) {
      return { success: true, message: "user is eligible " };
    }
    return {
      success: false,
      message:
        "You don't have any subscription. Please purchase at least a basic subscription to use this service.",
    };
  }


  async checkUserPrimeStatus(user_id: number): Promise<boolean> {
    let user = this.getUser(user_id.toString());
    if (user) {
      let expiry = dayjs.utc(user.expiry).tz("Asia/Kolkata");
      let currentTime = dayjs.utc().tz("Asia/Kolkata");
      if (expiry.isAfter(currentTime)) {
        return true;
      } else {
        // remove user from local db
        this.removeUser(user_id.toString());
        return false;
      }
    }
    return false;
  }

  async checkPrimeStatusJob(chat_id: number) {
    try {
      if (this.users) {
        Object.keys(this.users).map(async (userId: string) => {
          let isprimeUser = await this.checkUserPrimeStatus(parseInt(userId));

          if (isprimeUser) {
            console.log("The user has a valid Prime subscription period.");
          } else {
            let isuserExistsInChat = await this.bot.getChatMember(
              parseInt(userId),
              chat_id
            );
            if (isuserExistsInChat && isuserExistsInChat.status === "member") {
              // send them a message to renew their subscription
              await this.bot.sendMessangerBotMessage(
                parseInt(userId),
                "Your Prime subscription has expired. Please renew your subscription to continue using the service."
              );
              let isbanSuccess = await this.bot.banUser(
                parseInt(userId),
                chat_id
              );
              if (isbanSuccess && isbanSuccess.result) {
                // console.log("user is banned successfully");

                let chatData = this.validChatIds[chat_id.toString()];
                await this.botService.telegram.processNotification("banuser", {
                  user_id: String(userId),
                  chat_id: String(chat_id),
                  ban_from_type: chatData.type,
                });
              }
            } else {
              console.log(
                `user ${userId} is not a member of the chat ${chat_id}, so no need to ban them.`
              );
            }
          }
        });
      }
    } catch (error: any) {
      console.log("Error checking prime status job:", error.message);
    }
  }

  async unbanUsertask(
    user_id: number,
    chat_id: number | undefined = undefined
  ) {
    try {
      if (!chat_id) {
        chat_id = parseInt(Object.keys(this.validChatIds)[0]);
      }

      let isUserJoined = await this.bot.getChatMember(user_id, chat_id);
      if (isUserJoined && isUserJoined.status === "kicked") {
        let status = await this.bot.UnbanUser(user_id, chat_id);

        if (status && status.result) {
          await this.bot.sendMessangerBotMessage(
            user_id,
            "you can join the group again."
          );
          await this.botService.telegram.processNotification("unbanuser", {
            user_id: String(user_id),
            chat_id: String(chat_id),
          });
        } else {
          await this.botService.telegram.processNotification("unbanuser", {
            success: false,
            message: `un able to  unbaned user .Id is --> ${user_id} from ${chat_id}`,
          });
        }
      }
    } catch (error: any) {
      console.error("Error unbanning user:", error.message);
      return false;
    }
  }
}

export default UserManager;
