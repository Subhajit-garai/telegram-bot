import axios from "axios";
import { logger } from "./logger";

export class Network {
  private static instance: Network | null = null;

  private username: string;
  private password: string;
  private botauthtoken: string;
  islogin: boolean = false;
  private be_url: string = process.env.BE_URL || "";

  private constructor() {
    this.username = process.env.BE_USERNAME || "";
    this.password = process.env.BE_PASSWORD || "";
    this.botauthtoken = "";

    this.login();
  }

  public static getInstance(): Network {
    if (!Network.instance) {
      Network.instance = new Network();
    }
    return Network.instance;
  }

  getUrl(path: string): string {
    return `${this.be_url}${path}`;
  }
  getAccessToken(): string {
    return this.botauthtoken;
  }

  async postRequest(
    url: string,
    data: any,
    isOnlyData: boolean = false,
    isOnlyMessage: boolean = false
  ) {
    try {
      if (!this.botauthtoken) {
        await this.login();
      }

      let header = {
        Authorization: this.botauthtoken,
      };
      let responce = await axios.post(url, data, { headers: header });
      if (responce.data.success) {
        return isOnlyData
          ? responce.data?.data
          : isOnlyMessage
            ? responce.data?.message
            : responce.data;
      }
      return null;
    } catch (error: any) {
      logger.error(error?.response?.data?.message)
      if (error?.response?.data?.message === "Invalid or expired token") {
        await this.login();
        return await this.getRequest(url, isOnlyData, isOnlyMessage);
      } else {
        return null;
      }
    }
  }

  async getRequest(
    url: string,
    isOnlyData: boolean = false,
    isOnlyMessage: boolean = false
  ): Promise<any> {
    try {
      if (!this.botauthtoken) {
        await this.login();
      }

      let header = {
        Authorization: this.botauthtoken,
      };

      let responce = await axios.get(url, { headers: header });

      if (responce.data.success) {
        return isOnlyData
          ? responce.data?.data
          : isOnlyMessage
            ? responce.data?.message
            : responce.data;
      }
      return null;
    } catch (error: any) {
      logger.error(error?.response?.data?.message)
      if (error?.response?.data?.message === "Invalid or expired token") {
        await this.login();
        return await this.getRequest(url, isOnlyData, isOnlyMessage);
      } else {
        return null;
      }

    }
  }
  async auth() {
    try {
      let url = `${this.be_url}/api/v1/bot/auth`;
      let header = {
        Authorization: this.botauthtoken,
      };
      let request = await axios.get(url, { headers: header });
      console.log("response", request.status);
    } catch (error) { }
  }

  async login(retries = 10, delayMs = 3000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log("login porcess started .... ", `Attempt ${attempt}`);
        let url = `${this.be_url}/api/v1/bot/login`;
        let logindata = {
          email: this.username,
          password: this.password,
        };
        let request = await axios.post(url, logindata);

        console.log("login request", request.status);

        if (request) {
          console.log("Login successful");
          if (request?.data?.success) {
            console.log("Setting bot token....");
            this.botauthtoken = request?.data?.data;
            this.islogin = true;
            console.log("Bot token set successfully");
            return true;
          }
          return true;
        } else {
          console.log("Login failed");
          return false;
        }
      } catch (error: any) {
        console.error(`❌ Login attempt ${attempt} failed:`, error?.message);

        if (attempt === retries) {
          console.error("❌ All login attempts failed. Exiting.");
          process.exit(1); // exit app if still not successful
        }

        console.log(`🔁 Waiting ${delayMs}ms before retrying...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  async SendNotificationToSurver(type = "", data: any = null) {
    let url = this.getUrl(`/api/v1/bot/notification?type=${type}`);
    return await this.postRequest(url, data);
  }

  async isprimeUser(user_id: number): Promise<Boolean> {
    let url = this.getUrl(`/api/v1/bot/isprimeuser?userid=${user_id}`);
    return await this.getRequest(url);
  }
  async groupinfo(chat_id: number) {
    let url = this.getUrl(`/api/v1/bot/group/info?chatid=${chat_id}`);
    return await this.getRequest(url);
  }
  async isgroupjoinable(chat_id: number) {
    let url = this.getUrl(`/api/v1/bot/isgroupjoinable?chatid=${chat_id}`);
    return await this.getRequest(url);
  }

  async getvalidChatids(): Promise<{
    success: boolean;
    message: string;
    data: any;
  } | null> {
    let url = `${process.env.BE_URL}/api/v1/bot/validchatids`;
    return await this.getRequest(url);
  }
  async getUserInfomation(role: "User" | "Admin"): Promise<{
    success: boolean;
    message: string;
    data: any;
  } | null> {
    let url = `${process.env.BE_URL}/api/v1/bot/getusersdata?role=${role}`;
    return await this.getRequest(url);
  }

  async getquestions(
    update: {
      chatid: number,
      chat_type: string,
      userid: number,
      platform: string
    },
    type: "quiz" = "quiz"
  ) {
    try {
      logger.info("getquestions method called");

      let url = this.getUrl(`/api/v1/bot/getquestionsset`);
      let chatid = update.chatid;
      let chat_type = update.chat_type;
      let userid = update.userid;
      let data = {
        type: type,
        chat_type: chat_type,
        user_id: userid,
        chat_id: chatid,
        platform: update.platform,
      };

      let request = await this.postRequest(url, data);
      if (request) {
        logger.info("getquestions method return success");
        console.log("getquestions method return success", request);
        return request;
      }
    } catch (error: any) {
      logger.error("error in getquestions", error);
    }
  }


}

export const network = Network.getInstance();
