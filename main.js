import { fail } from 'k6';
import { generateRandomNumber } from "./src/helper/generator.js";
import { DeleteActivityTest, GetActivityTest, PatchActivityTest, PostActivityTest } from "./src/tests/activityTest.js";
import { UploadFileTest } from "./src/tests/fileTest.js";
import { LoginTest } from "./src/tests/loginTest.js";
import { GetProfileTest, PatchProfileTest } from "./src/tests/profileTest.js";
import { RegisterTest } from "./src/tests/registerTest.js";

export const options = {
  vus: 1,
  iterations: 1
};

const smallFile = open('./src/figure/image-50KB.jpg', 'b');
const medFile = open('./src/figure/image-100KB.jpg', 'b');
const bigFile = open('./src/figure/image-200KB.jpg', 'b');
const invalidFile = open('./src/figure/sql-5KB.sql', 'b');

export default function() {
  /** @type {import("./src/types/config.js").Config} */
  const config = {
    baseUrl: __ENV.BASE_URL ? __ENV.BASE_URL : "http://localhost:8080",
    debug: __ENV.DEBUG ? true : false,
    runNegativeCase: true,
    verifyChanges: true
  }
  const tags = {
    env: "local"
  }

  // ===== AUTH TEST =====
  let users = []
  for (let index = 0; index < 2; index++) {
    const user = RegisterTest(config, tags)
    if (!user)
      fail("test stop on Register feature, please check the logs")
    users.push(user)
  }
  const user = users[0]
  LoginTest(user, config, tags)

  // ===== UPLOAD TEST =====
  UploadFileTest(user, {
    small: smallFile,
    smallName: "small.jpg",
    medium: medFile,
    mediumName: "med.jpg",
    big: bigFile,
    bigName: "big.jpg",
    invalid: invalidFile,
    invalidName: "invalid.sql",
  }, config, tags)

  // ===== PROFILE TEST =====
  GetProfileTest(user, config, tags)
  PatchProfileTest(user, config, tags)

  // ===== DEPARTMENT TEST =====
  /** @type {Activity[]} */
  let activities = []
  for (let index = 0; index < 50; index++) {
    let department = PostActivityTest(user, config, tags)
    console.log(`Department Post test ${index} result:`, department);
    if (!department)
      fail(`test stop on Post Department feature loop ${index}, please check the logs`)
    activities.push(department)
  }
  GetActivityTest(user, config, tags)
  let pickedDepartmentIndex = generateRandomNumber(0, activities.length - 1)
  const department = PatchActivityTest(user, activities[pickedDepartmentIndex], config, tags)
  if (!department) {
    fail("test stop on patch Department feature, please check the logs")
  }
  DeleteActivityTest(user, department, config, tags)
  activities.splice(pickedDepartmentIndex, 1)
}

