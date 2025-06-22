import exec from "k6/execution";
import {
  LoginEmailScenario,
  LoginPhoneScenario,
} from "./scenario/loginScenario.js";
import {
  RegisterEmailScenario,
  RegisterPhoneScenario,
} from "./scenario/registerScenario.js";
import { 
  GetProfileScenario, 
  PostProfileEmailScenario, 
  PostProfilePhoneScenario, 
  PutProfileScenario
} from "./scenario/profileScenario.js";
import { 
  PostPurchaseScenario,
  PostPurchaseIdScenario
} from "./scenario/pruchaseScenario.js";

export const options = {
  vus: 1,
  iterations: 1,
};

const smallFile = open("./figure/image-50KB.jpg", "b");
const medFile = open("./figure/image-100KB.jpg", "b");
const bigFile = open("./figure/image-200KB.jpg", "b");
const invalidFile = open("./figure/sql-5KB.sql", "b");

/**
 * @type {import("./types/scenario.js").Scenarios}
 */
const scenarios = {
  RegisterEmailScenario: RegisterEmailScenario,
  RegisterPhoneScenario: RegisterPhoneScenario,
  LoginEmailScenario: LoginEmailScenario,
  LoginPhoneScenario: LoginPhoneScenario,
  GetProfileScenario: GetProfileScenario,
  PutProfileScenario: PutProfileScenario,
  PostProfilePhoneScenario: PostProfilePhoneScenario,
  PostProfileEmailScenario: PostProfileEmailScenario,
  PostPurchaseScenario: PostPurchaseScenario,
  PostPurchaseIdScenario: PostPurchaseIdScenario
};

export default function () {
  /** @type {import("./types/config.js").Config} */
  const config = {
    baseUrl: __ENV.BASE_URL ? __ENV.BASE_URL : "http://localhost:8080",
    debug: __ENV.DEBUG ? true : false,
    runNegativeCase: true,
    runUnitTest: __ENV.RUN_UNIT_TEST ? __ENV.RUN_UNIT_TEST == "true" : false,
  };

  const tags = {
    env: "local",
  };
  console.log(`k6 | Firing to ${config.baseUrl}`);

  if (config.runUnitTest) {
    console.log(`k6 | Run unit test received!`);
    const scenarioName = /** @type {string} */ (__ENV.SCENARIO_NAME);
    const mockInfo = JSON.parse(__ENV.MOCK_INFO ? __ENV.MOCK_INFO : "{}");
    console.log(`k6 | Executing ${scenarioName} scenario`);
    console.log(`k6 | Mocked information:`, mockInfo);

    const test = scenarios[scenarioName];
    if (test) {
      const testResult = test(config, tags, mockInfo);
      if (!testResult) {
        return exec.test.abort(`${scenarioName} scenario failed`);
      }
      return;
    }
    console.log(`k6 | test ${scenarioName} doesn't exist`);
    return;
  }

  // ===== REGISTER TEST =====
  // ===== PROFILE TEST =====
  // ===== DEPARTMENT TEST =====
}
