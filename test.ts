import fs from 'fs'
import axios from 'axios'
import FTL from './dist'


// create our axios client
const instance = axios.create()
// setup retry
 // create rate limit queue
const rateLimitedAxiosQueue = new FTL({
  maxRequestsPerSecond: 4,
  burstRequests: 10,
  burstTime: 10,
  instance
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
