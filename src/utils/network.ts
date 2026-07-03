import axios from "axios";
import { logger } from "./logger.js";

export class Network {
  private static instance: Network | null = null;
  private be_url: string = process.env.BE_URL || "";

  private constructor() {}

  public static getInstance(): Network {
    if (!Network.instance) {
      Network.instance = new Network();
    }
    return Network.instance;
  }

  getUrl(path: string): string {
    return `${this.be_url}${path}`;
  }

  async postRequest(
    url: string,
    data: any,
    isOnlyData: boolean = false,
    isOnlyMessage: boolean = false,
  ) {
    try {
      let responce = await axios.post(url, data);
      if (responce.data.success) {
        return isOnlyData
          ? responce.data?.data
          : isOnlyMessage
            ? responce.data?.message
            : responce.data;
      }
      return null;
    } catch (error: any) {
      logger.error(error?.response?.data?.message);
    }
  }

  async getRequest(
    url: string,
    isOnlyData: boolean = false,
    isOnlyMessage: boolean = false,
  ): Promise<any> {
    try {
      let responce = await axios.get(url);

      if (responce.data.success) {
        return isOnlyData
          ? responce.data?.data
          : isOnlyMessage
            ? responce.data?.message
            : responce.data;
      }
      return null;
    } catch (error: any) {
      logger.error(error?.response?.data?.message);
    }
  }
}

export const network = Network.getInstance();
