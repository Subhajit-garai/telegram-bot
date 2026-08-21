import Redis from "ioredis";

import { Job, Task } from "@repo/types/taskTypes.js";
import { logger } from "./logger.js";
import { exam_question_format_type, quiz_status } from "@/types/quizTypes.js";
export class redisClient {
  private static instance: redisClient;
  private Client: Redis;
  public static getInstance() {
    if (!this.instance) {
      this.instance = new redisClient();
    }
    return this.instance;
  }

  getClient(): Redis {
    return this.Client;
  }

  private constructor() {
    this.Client = new Redis(process.env.REDIS_URL!);
    this.Client.on("error", (err) => console.log("Redis Client Error", err));
  }

  async disconnect() {
    await this.Client.quit();
  }
}

export class QuizJobQueue {
  private static instance: QuizJobQueue;
  private redisClient: Redis;
  private queue: string = "telegramquiz_scheduled";

  public static getInstance() {
    if (!this.instance) {
      this.instance = new QuizJobQueue();
    }
    return this.instance;
  }

  private constructor() {
    this.redisClient = redisClient.getInstance().getClient();
  }

  // getclient(): Redis {
  //   return this.redisClient;
  // }

  push(data: Job, delayMs: number) {
    if (!this.redisClient) logger.error(" redis not connected....");
    let taskdata: string;
    taskdata = JSON.stringify(data);
    return this.redisClient.zadd(this.queue, delayMs, taskdata);
  }

  async pop(): Promise<Job | null> {
    let res = await this.redisClient.zrangebyscore(this.queue, 0, Date.now());
    if (!res) return null;
    let rawdata = res[1];
    let data: Job = JSON.parse(rawdata as string);
    return data;
  }
}

export class TaskQueue {
  private static instance: TaskQueue;
  private redisClient: Redis;
  private queue: string = "task";

  public static getInstance() {
    if (!this.instance) {
      this.instance = new TaskQueue();
    }
    return this.instance;
  }

  private constructor() {
    this.redisClient = redisClient.getInstance().getClient();
  }

  push(data: Task) {
    if (!this.redisClient) console.log("not connected....");
    let taskdata: string;
    taskdata = JSON.stringify(data);
    return this.redisClient.lpush(this.queue, taskdata);
  }

  async pop(): Promise<Task | null> {
    let rawdata = await this.redisClient.rpop(this.queue);
    if (rawdata) {
      let data: Task = JSON.parse(rawdata as string);
      return data;
    }
    return null;
  }
}

export class quizCacheManager {
  private static instance: quizCacheManager;
  private Redis: Redis;
  private basekey: string = "quiz"; // it is not a queue . it is cache    { quizmetadata , data}

  public static getInstance() {
    if (!this.instance) {
      this.instance = new quizCacheManager();
    }
    return this.instance;
  }

  private constructor() {
    this.Redis = redisClient.getInstance().getClient();
  }

  async getquizmeta(quizid: string) {
    let key = `${this.basekey}:meta:${quizid}`;
    let res = await this.Redis.get(key);
    if (!res) return null;
    return JSON.parse(res);
  }

  async getquizid(): Promise<string | undefined> {
    //here it pick a randon id form quiz . then this quiz's questions is use in quiz
    // which is done and not running , and not completed yet

    // quiz >  meta have multiple section for status like 1. created ,2.done 3.running , 4.completed
    let key = `${this.basekey}:meta:done*`;
    let res = await this.Redis.keys(key);
    if (res.length === 0) return undefined;
    let index = Math.floor(Math.random() * res.length);
    let quizKey = res[index];
    let quizId = quizKey.split(":").pop();
    return quizId;
  }

  async getQuizQuestions(
    quizid: string,
  ): Promise<exam_question_format_type[] | null> {
    // 1. Find the actual key in Redis using pattern match (since Redis GET does not evaluate wildcards like '*')
    let keys = await this.Redis.keys(`quiz:questions:${quizid}:part1:*`);
    if (keys.length === 0) {
      logger.error("redis : no questions key found for quiz id ", quizid);
      let meta = await this.getquizmeta(quizid);
      if (!meta) {
        logger.error("redis : no meta found for quiz id ", quizid);
      }
      return null;
    }

    // logger.info("[check] resolved exact key : ", keys);
    let questions = await this.Redis.mget(keys);

    if (!questions) {
      return null;
    }

    let formated_questions = questions.map((q) => {
      return JSON.parse(q as string);
    });

    // logger.info("[check] questions loaded: ", formated_questions);

    return formated_questions;
  }

  async updateStatus(quizid: string, status: quiz_status) {
    // created ->  done( quiz questions are selected ) -> running -> completed ( now we can remove questions from cache)

    switch (status) {
      case "done": {
        let key = `${this.basekey}:meta:created:${quizid}`;
        let res = await this.Redis.get(key);
        if (!res) throw Error("quiz not found id Is : " + quizid);
        let data = JSON.parse(res);
        if ((data.status as quiz_status) === "created") {
          await this.Redis.del(key);
          let newkey = `${this.basekey}:meta:done:${quizid}`;
          data.status = "done";
          await this.Redis.set(newkey, JSON.stringify(data));
        } else {
          throw Error("quiz status is invalid format");
        }

        return true;
      }
      case "running": {
        let key = `${this.basekey}:meta:done:${quizid}`;
        let res = await this.Redis.get(key);
        if (!res) throw Error("quiz not found id Is : " + quizid);
        let data = JSON.parse(res);
        if ((data.status as quiz_status) === "done") {
          await this.Redis.del(key);
          let newkey = `${this.basekey}:meta:running:${quizid}`;
          data.status = "running";
          await this.Redis.set(newkey, JSON.stringify(data));
        } else {
          throw Error("quiz status is invalid format");
        }

        return true;
      }
      case "completed": {
        let key = `${this.basekey}:meta:running:${quizid}`;
        let res = await this.Redis.get(key);
        if (!res) throw Error(`quiz not found id Is : ${quizid} `);
        let data = JSON.parse(res);
        if ((data.status as quiz_status) === "running") {
          await this.Redis.del(key);
          let newkey = `${this.basekey}:meta:completed:${quizid}`;
          data.status = "completed";
          await this.Redis.set(newkey, JSON.stringify(data));
        } else {
          throw Error("quiz status is invalid format");
        }

        return true;
      }
      default:
        logger.error("invald status value");
        break;
    }
    return false;
  }
}
