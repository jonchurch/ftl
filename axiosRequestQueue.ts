import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface Job {
  id: string;
  createdAt: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority?: number;
  retryCount?: number;
  data?: any;
  execute: () => void;
}

type ConstructArgs = {
  maxRequestsPerSecond: number,
  burstRequests: number,
  burstTime: number;
  instance: AxiosInstance
}

class RequestQueue {
  private instance: AxiosInstance;
  private queue: Job[];
  private maxRequestsPerSecond: number;
  private burstRequests: number;
  private burstTime: number;
  private requestsMade: number;
  private burstRequestsMade: number;
  private sending: boolean;
  private burstTimer: NodeJS.Timeout | null
  private rateTimer: NodeJS.Timeout | null
  private requestLogs: {time: string}[]
  private start: number | null

  constructor({maxRequestsPerSecond, burstRequests, burstTime, instance}: ConstructArgs) {
    this.queue = [];
    this.maxRequestsPerSecond = maxRequestsPerSecond;
    this.burstRequests = burstRequests;
    this.burstTime = burstTime;
    this.requestsMade = 0;
    this.burstRequestsMade = 0;
    this.sending = false;
    this.burstTimer = null
    this.rateTimer = null
    this.requestLogs = []
    this.start = null

    this.instance = instance ?? axios.create();
    this.addRequestInterceptor();
  }

  private async processQueue() {
    if (!this.sending) {
    }
    if (this.queue.length === 0) {
      this.sending = false;
      return;
    }

    const canProcessBurstRequest = this.burstRequestsMade < this.burstRequests;
    const canProcessNonBurstRequest = this.requestsMade < this.maxRequestsPerSecond;

    if (canProcessBurstRequest || canProcessNonBurstRequest) {
      // console.log(`requestsMade: ${this.requestsMade} burstRequestsMade:${this.burstRequestsMade}`);
      const { execute } = this.queue.shift() as Job;

      try {
        if (this.queue.length === 0) {
          // await execute()
          if (this.start) {
            // dang, I don't actually have the promise for the request
            // this won't be accurate if I can't tell when it's done
            console.log(`Queue drained after ${Date.now() - this.start}`)
          }
        }
        execute();
        this.handleRequestSent(); // Call after executing the job
      } catch (error) {
        // we retry if we hit an error
        // Idk what axios does when we throw in the interceptor
        console.log(error);
      }
    }

    // If there are more requests and we haven't exhausted the burst limit, process the next request immediately
    if (canProcessBurstRequest && this.queue.length > 0) {
      this.processQueue();
    } else {
      setTimeout(() => {
        this.processQueue();
      }, this.getRequestDelay());
    }
  }

  private getRequestDelay() {
    const delayBetweenRequests = 1000 / this.maxRequestsPerSecond;
    const burstWindowReset = this.burstTime * 1000;
    const rateLimitReset = 1000;

    if (!this.rateTimer) {
      this.rateTimer = setTimeout(() => {
        this.requestsMade = 0;
        // I think this should suffice for having a single reset for the overall called
        this.rateTimer = null
      }, rateLimitReset);
    }

   if (!this.burstTimer) {
      // does it matter that these are on static resets?
      // I can use the reset time on response header, but
      // I still don't know how bursts are tracked, is the window rolling? I doubt it
      this.burstTimer = setTimeout(() => {
        this.burstRequestsMade = 0;
        this.burstTimer = null
      }, burstWindowReset);
    }

    return delayBetweenRequests;
  }

  private handleRequestSent() {
    const timestamp = new Date()
    this.requestLogs.push({ time: timestamp.toISOString() });
      if (this.burstRequestsMade < this.burstRequests) {
        this.burstRequestsMade++;
      } else {
        this.requestsMade++;
      }
    }
  public exportRequestLogs() {
    return this.requestLogs
  }
  // should also ad a response interceptor to update 
  // the queue information based on returned rate limit data
  private addRequestInterceptor() {
    this.instance.interceptors.request.use(async (config: AxiosRequestConfig) => {
      return new Promise<AxiosRequestConfig>(async (resolve) => {
        const executeJob = () => {
          resolve(config);
          this.handleRequestSent();
        };
        const newJob: Job = {
          id: this.generateUniqueId(),
          createdAt: new Date().toISOString(),
          status: 'queued',
          execute: executeJob,
        };
        
        this.queue.push(newJob);
          
        if (!this.sending) {
          console.log('starting')
          this.start = Date.now()
          this.sending = true;
          this.processQueue();
        }
      });
    });
      
  }
    private generateUniqueId(): string {
      return (
        Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
      ).toUpperCase();
    }
    getInstance(): AxiosInstance {
      return this.instance;
    }
}

export default RequestQueue;
