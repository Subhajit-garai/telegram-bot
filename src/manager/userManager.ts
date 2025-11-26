import axios from "axios";
import dayjs from "dayjs";
import { Network } from "../utils/network";
import TelegramBot from "../utils/Telegrambot";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { loggeDate, logger } from "../utils/logger";

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
  network: Network;
  bot: TelegramBot;
  refreshtime: number = parseInt(process.env.REFRESH_TIME?.trim()!) ?? 60; // in minutes

  private constructor() {
    this.init();
    this.refreshUserdataList();
    this.network = Network.getInstance();
    this.bot = TelegramBot.getInstance();
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
      loggeDate();
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
    console.log("init ....");

    await this.waitForLogin();

    let isSucess = await this.getUserInfomationfromServer();
    let isAdminSuccess = await this.getAdmins();
    await this.getValidChatidsInfoFromServer();

    if (isSucess && isAdminSuccess) {
      console.log("user data setup successful");
      this.lastupdatedTime = dayjs().format();
      console.log("lastupdatedTime ", this.lastupdatedTime);
      return true;
    }

    return false;
  }

  private waitForLogin(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (this.network?.islogin ?? false) {
          resolve();
        } else {
          console.log("checking again ...");

          setTimeout(check, 3000); // check again after 1 second
        }
      };
      check();
    });
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
    return this.validChatIds.hasOwnProperty(chat_id.toString());
  }
  async getAdmins() {
    let url = `${process.env.BE_URL}/api/v1/bot/getusersdata?role=Admin`;
    let header = {
      Authorization: this.network.getAccessToken(),
    };

    console.log("getting admin user data ");

    let responce = await axios.get(url, { headers: header });
    let data = responce.data.data;

    if (responce.status) {
      if (Array.isArray(data)) {
        console.log("adding user to local db .....");

        data.map((user) => {
          this.admin.push(parseInt(user.telegram.telegramid));
        });
      }
    }
  }

  private async getUserInfomationfromServer() {
    let url = `${process.env.BE_URL}/api/v1/bot/getusersdata?role=User`;

    let header = {
      Authorization: this.network.getAccessToken(),
    };

    let responce = await axios.get(url, { headers: header });

    let data = responce.data.data;

    if (responce.status) {
      if (Array.isArray(data)) {
        console.log("adding user to local db .....");

        data.map((user) => {
          let data: User_type = {
            id: user.telegram.telegramid,
            expiry: user.prime.expiry,
            primeStaus: user.prime.status,
          };
          this.addUser(user.telegram.telegramid, data);
        });
      }
    }

    return true;
  }

  private async getValidChatidsInfoFromServer() {
    let url = `${process.env.BE_URL}/api/v1/bot/validchatids`;
    let header = {
      Authorization: this.network.getAccessToken(),
    };

    let responce = await axios.get(url, { headers: header });

    let data = responce.data.data;

    if (responce.status) {
      console.log("adding group info  to local db .....");
      if (Array.isArray(data)) {
        data.map((group: validChatid_type) => {
          this.validChatIds[group.id] = group;
        });
      }
    }

    if (this.validChatIds) {
      console.log(" checking user access  .....");
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
    let isgroupjoinable = await this.network.isgroupjoinable(chat_id);

    if (isgroupjoinable) {
      return true;
    }

    return false;
  }

  async isUserAccessableToJoin(
    user_id: number,
    chat_id: number
  ): Promise<{ success: boolean; message: string }> {
    let isprime = await this.network.isprimeUser(user_id);

    if (isprime) {
      return { success: true, message: "user is eligible " };
    }
    return {
      success: false,
      message:
        "You don't have any subscription. Please purchase at least a basic subscription to use this service.",
    };
  }

  // ongoing

  // check if user prime status is valid , if valid then return true if not then remove user or ban user
  // send them a message to renew their subscription
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
                await this.network.SendNotificationToSurver("banuser", {
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
    //     {
    //   "ok": true,
    //   "result": {
    //     "user": {
    //       "id": 123456789,
    //       "is_bot": false,
    //       "first_name": "John",
    //     },
    //     "status": "member"
    //   }
    // }
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
          await this.network.SendNotificationToSurver("unbanuser", {
            user_id: String(user_id),
            chat_id: String(chat_id),
          });
        } else {
          await this.network.SendNotificationToSurver("unbanuser", {
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
