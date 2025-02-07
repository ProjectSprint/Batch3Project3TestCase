import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { Client } from 'k6/experimental/redis';
import { combine, generateRandomEmail, generateRandomNumber, generateRandomPassword, withProbability } from './src/helper/generator.js';
import { doRegister } from './src/scenario/register_scenario.js'
import { doLogin } from './src/scenario/login_scenario.js'
import { doUpload } from './src/scenario/upload_scenario.js'
import { doGetProfile, doPatchProfile } from './src/scenario/profile_scenario.js'
import { doDeleteTest, doGetActivity, doPatchActivity, doPostActivity } from './src/scenario/activity_scenario.js'
export const options = {
  scenarios: {
    ramping_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 50, },
        { duration: '30s', target: 200, },
        { duration: '1m', target: 800, },
        { duration: '1m', target: 1500, },
        { duration: '30s', target: 3000, },
        { duration: '30s', target: 6000, },
        { duration: '1m', target: 6000, }
      ]
    }
  },
  thresholds: {
    http_req_duration: [{
      threshold: 'avg < 2000', // Average latency below 2s
      abortOnFail: true,
      delayAbortEval: '10s'
    }],
  }
};
http.setResponseCallback(
  http.expectedStatuses(404, 401, 400, 409, { min: 200, max: 204 })
);
const users = new SharedArray('user', function() {
  /** @type {User[]} */
  const res = []
  for (let index = 0; index < 200; index++) {
    res.push({
      email: generateRandomEmail(),
      password: generateRandomPassword(8, 32), token: ""
    })
  }
  return res
});

const smallFile = open('./src/figure/image-50KB.jpg', 'b');
const medFile = open('./src/figure/image-100KB.jpg', 'b');
const bigFile = open('./src/figure/image-200KB.jpg', 'b');
const invalidFile = open('./src/figure/sql-5KB.sql', 'b');
const redisClient = new Client('redis://localhost:6379')

export default async function() {
  /** @type {import("./src/types/config.js").Config} */
  const config = {
    baseUrl: __ENV.BASE_URL ? __ENV.BASE_URL : "http://localhost:8080",
    debug: __ENV.DEBUG ? true : false,
    runNegativeCase: true,
    verifyChanges: true
  }
  let usr = doRegister(config, users[Math.floor(Math.random() * users.length)])
  if (!usr.isCreated && usr.user) {
    let token = ""
    try {
      token = await redisClient.get(usr.user.email)
    } catch (err) { }
    if (token) {
      usr.user = combine(usr.user, { token: token })
      usr.isCreated = true
    } else {
      const loginRes = doLogin(config, usr.user)
      if (loginRes) {
        usr.user = loginRes
        usr.isCreated = true
      }
    }
  } if (usr.isCreated && usr.user) {
    await redisClient.set(usr.user.email, usr.user.token, 0);
  } else {
    return;
  }
  if (!usr.user) {
    return;
  }
  const user = usr.user
  withProbability(0.2, () => {
    doUpload(config, user, 0.1, {
      small: smallFile,
      smallName: "small.jpg",
      medium: medFile,
      mediumName: "med.jpg",
      big: bigFile,
      bigName: "big.jpg",
      invalid: invalidFile,
      invalidName: "invalid.sql",
    })
  })

  //=== profile & file test ===
  doGetProfile(config, user)
  withProbability(0.2, () => {
    doPatchProfile(config, user)
  })
  withProbability(0.2, () => {
    doUpload(config, user, 0.3, {
      small: smallFile,
      smallName: "small.jpg",
      medium: medFile,
      mediumName: "med.jpg",
      big: bigFile,
      bigName: "big.jpg",
      invalid: invalidFile,
      invalidName: "invalid.sql",
    })
  })
  //=== activity test ===
  let activities = doGetActivity(config, user, generateRandomNumber(5, 10))
  const activity = doPostActivity(config, user,)
  if (activity) {
    activities.push(activity)
  } else {
    console.log('activity not pushed', activity)
  }
  withProbability(0.2, () => {
    const activity = doPostActivity(config, user,)
    if (activity) {
      activities.push(activity)
    }
  })

  withProbability(0.2, () => {
    const selectedIndex = generateRandomNumber(0, activities.length - 1)
    if (!activities[selectedIndex]) {
      console.log("activity non exist", activities[selectedIndex], activities)
    } else {
      const activity = doPatchActivity(config, user, activities[selectedIndex])
      if (activity) {
        activities[selectedIndex] = activity
      }
    }
  })
  withProbability(0.1, () => {
    const selectedIndex = generateRandomNumber(0, activities.length - 1)
    if (!activities[selectedIndex]) {
      console.log("activity non exist", activities[selectedIndex], activities)
    } else {
      doDeleteTest(config, user, activities[selectedIndex])
      activities.splice(selectedIndex, 1)
    }
  })

}

