import axios from "axios";

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
  async auth() {
    try {
      let url = `${this.be_url}/api/v1/bot/auth`;
      let header = {
        Authorization: this.botauthtoken,
      };
      let request = await axios.get(url, { headers: header });
      console.log("response", request.status);
    } catch (error) {}
  }
  async SendNotificationToSurver(type = "", data: any = null) {
    let url = this.getUrl(`/api/v1/bot/notification?type=${type}`);
    let header = {
      Authorization: this.botauthtoken,
    };
    let request = await axios.post(url, data, { headers: header });
    if (request.status == 200) {
      console.log("response", request.status);
      console.log("notification sended ..");
    }
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

  async isprimeUser(user_id: number): Promise<Boolean> {
    let url = this.getUrl(`/api/v1/bot/isprimeuser?userid=${user_id}`);
    let header = {
      Authorization: this.botauthtoken,
    };
    let responce = await axios.get(url, { headers: header });

    console.log("isprime user ", responce.data);

    if (responce.data.success && responce.data.data) {
      return true;
    }
    return false;
  }
  async groupinfo(chat_id: number) {
    let url = this.getUrl(`/api/v1/bot/group/info?chatid=${chat_id}`);
    let header = {
      Authorization: this.botauthtoken,
    };
    let responce = await axios.get(url, { headers: header });
    if (responce.data.success) {
      return responce.data;
    }
    return false;
  }
  async isgroupjoinable(chat_id: number) {
    let url = this.getUrl(`/api/v1/bot/isgroupjoinable?chatid=${chat_id}`);
    let header = {
      Authorization: this.botauthtoken,
    };
    let responce = await axios.get(url, { headers: header });
    if (responce.data.success) {
      return responce.data;
    }
    return false;
  }

  async getvalidChatids(): Promise<{
    success: boolean;
    message: string;
    data: any;
  }|null> {
    let url = `${process.env.BE_URL}/api/v1/bot/validchatids`;
    let header = {
      Authorization: this.botauthtoken,
    };

    let responce = await axios.get(url, { headers: header });

    if (responce.data.success) {
      return responce.data;
    }
    return null;
  }
  async getUserInfomation(role:"User"|"Admin"): Promise<{
    success: boolean;
    message: string;
    data: any;
  }|null> {
   let url = `${process.env.BE_URL}/api/v1/bot/getusersdata?role=${role}`;
    let header = {
      Authorization: this.botauthtoken,
    };

    let responce = await axios.get(url, { headers: header });

    if (responce.data.success) {
      return responce.data;
    }
    return null;
  }


}

export const network = Network.getInstance();
