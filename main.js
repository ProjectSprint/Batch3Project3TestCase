import { mock } from "node:test";
import { isUser } from "./src/assertion/userAssertion.js";
import { LoginEmailScenario, LoginPhoneScenario } from "./src/scenario/loginScenario.js";
import { RegisterEmailScenario, RegisterPhoneScenario } from "./src/scenario/registerScenario.js";

export const options = {
  vus: 1,
  iterations: 1
};

const smallFile = open('./src/figure/image-50KB.jpg', 'b');
const medFile = open('./src/figure/image-100KB.jpg', 'b');
const bigFile = open('./src/figure/image-200KB.jpg', 'b');
const invalidFile = open('./src/figure/sql-5KB.sql', 'b');
/**
 * @param {import("./src/entity/config.js").UnitTestConfig} mocks
 * @param {import("./src/entity/config.js").Config} config 
 * @param {{ [name: string]: string }} tags
 * @returns {Error | TestScenarios}
 */
function unitTest(mocks, config, tags) {
  const { mockUser } = mocks
  if (!isUser(mockUser)) {
    return new Error("User structure is not valid")
  }
  return {
    RegisterEmailScenario: function() {
      return RegisterEmailScenario(config, tags);
    },
    LoginEmailScenario: function() {
      return LoginEmailScenario(mockUser, config, tags);
    }
  }
}

export default function() {
  /** @type {import("./src/entity/config.js").Config} */
  const config = {
    baseUrl: __ENV.BASE_URL ? __ENV.BASE_URL : "http://localhost:8080",
    debug: __ENV.DEBUG ? true : false,
    runNegativeCase: true,
    runUnitTest: __ENV.RUN_UNIT_TEST ? __ENV.RUN_UNIT_TEST == "true" : false,
  };

  const tags = {
    env: "local"
  };
  console.log(`Running k6!`);

  if (config.runUnitTest) {
    console.log(`Run unit test received!`);
    /** @type {keyof TestScenarios} */
    const testName = /** @type {any} */ (__ENV.TEST_NAME);
    const mockUser = JSON.parse(__ENV.MOCK_USER ? __ENV.MOCK_USER : "{}");
    console.log(`Executing ${testName}`);
    console.log(`Parsed user body`, mockUser);

    const tests = unitTest({
      mockUser: mockUser,
      mockActivity: ""
    }, config, tags);

    // Type guard to check if tests is not an Error
    if (!(tests instanceof Error)) {
      const test = tests[testName];
      if (test) {
        test();
        return;
      }
      console.log(`test ${testName} doesn't exist`);
      return;
    }

    console.log(tests);
    return;
  }

  // ===== REGISTER TEST =====
  const userFromEmail = RegisterEmailScenario(config, tags)
  LoginEmailScenario(userFromEmail, config, tags)

  const userFromPhone = RegisterPhoneScenario(config, tags)
  LoginPhoneScenario(userFromPhone, config, tags)



  // ===== PROFILE TEST =====
  // ===== DEPARTMENT TEST =====
}

