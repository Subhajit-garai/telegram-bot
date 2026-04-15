import Redis from "ioredis";

import { Job, Task } from "@repo/types/taskTypes.js";
import { logger } from "./logger.js";

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

    this.redisClient = new Redis(process.env.REDIS_URL!);
    this.redisClient.on("error", (err) =>
      console.log("Redis Client Error", err)
    );

  }

  getclient(): Redis {
    return this.redisClient;
  }

  push(data: Job, delayMs: number) {
    if (!this.redisClient) logger.error(" redis not connected....");
    let taskdata: string;
    taskdata = JSON.stringify(data);
    return this.redisClient.zadd(this.queue, delayMs, taskdata);
  }

  async pop(): Promise<Job | null> {
    let res = await this.redisClient.zrangebyscore(this.queue, 0, Date.now());
    if (!res) return null
    let rawdata = res[1]
    let data: Job = JSON.parse(rawdata as string);
    return data;
  }


  async disconnect() {
    await this.redisClient.quit();
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

    this.redisClient = new Redis(process.env.REDIS_URL!);
    this.redisClient.on("error", (err) =>
      console.log("Redis Client Error", err)
    );

  }

  getclient(): Redis {
    return this.redisClient;
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


  async disconnect() {
    await this.redisClient.quit();
  }
}

