import fs from 'fs'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import chalk from 'chalk'
import { Configuration, SystemsApi } from 'spacetraders-api'
import RequestQueue from './axiosRequestQueue'
import env from './.env.js'

const configuration = new Configuration({
  // read token from environment variables
  accessToken: env.TOKEN
})

// create our axios client
const instance = axios.create()
// setup retry
axiosRetry(instance)

 // create rate limit queue
const rateLimitedAxiosQueue = new RequestQueue({
  maxRequestsPerSecond: 4,
  burstRequests: 10,
  burstTime: 10,
  instance
})

// pass axios instance with rate limit queue
const systems = new SystemsApi(configuration, undefined, rateLimitedAxiosQueue.getInstance())
// let currentSystem: System | null = null

process.on('exit', () => {
  const requestLogs = rateLimitedAxiosQueue.exportRequestLogs()
  fs.writeFileSync('run.json', JSON.stringify(requestLogs, null, 2));
})

async function run() {
  for (let i = 0; i < 120; i++) {
    // console.log(`Running: ${i}`)
    systems.getSystem(env.HOME_SYSTEM)
      .then(res => {
        // const remaining = res.headers['x-ratelimit-remaining']
        // const reset = res.headers['x-ratelimit-reset']
        // console.log('')
        // console.log(`${i}:${res.status}: Remaining:${remaining} reset:${Math.abs(new Date(reset).getTime() - new Date().getTime())}`)
    })
      .catch((err: Error) => console.log(chalk.red(err.message)))
  }
}

run().catch(() => console.log("The loop threw"))
