import { testPostJsonAssert } from "../helper/testRequest.js";
import { getUser } from "../assertion/userAssertion.js";
import {
  combine,
  generateRandomEmail,
  generateRandomPhoneNumber,
  generateTestObjects,
} from "../helper/generator.js";
import { isEqual, isExists } from "../helper/testAssertion.js";

/**
 * @param {import("../entity/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @param {import("src/entity/types.js").User} user
 * @returns {import("src/entity/types.js").User | undefined}
 */
export function LoginEmailScenario(user, config, tags) {
  const featureName = "Login Email";
  const route = config.baseUrl + "/v1/login/email";
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    email: user.email,
    password: user.password,
  };

  if (config.runNegativeCase) {
    assertHandler(
      "empty body", featureName, route, {}, {},
      {
        ["should return 400"]: (v) => v.status === 400,
      },
      [], config, tags,);

    const testObjects = generateTestObjects(
      {
        email: {
          type: "string",
          notNull: true,
          isEmail: true,
        },
        password: {
          type: "string",
          notNull: true,
          minLength: 8,
          maxLength: 32,
        },
      },
      positivePayload,
    );
    testObjects.forEach((payload) => {
      assertHandler(
        "invalid payload", featureName, route, payload, {},
        {
          ["should return 400"]: (res) => res.status === 400,
        },
        [], config, tags,);
    });
    assertHandler(
      "email not exists",
      featureName, route, combine(positivePayload, {
        email: generateRandomEmail(),
      }),
      {},
      {
        ["should return 404"]: (res) => res.status === 404,
      },
      [], config, tags,);
  }

  const res = assertHandler(
    "valid payload", featureName, route, positivePayload, {},
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have email and equal"]: (v) => isEqual(v, "email", user.email),
      ["should have token"]: (v) => isExists(v, "token", ["string"]),
    },
    [], config, tags,);

  return getUser(res, positivePayload, featureName)
}
/**
 * @param {import("../entity/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @param {import("src/entity/types.js").User} user
 * @returns {import("src/entity/types.js").User | undefined}
 */
export function LoginPhoneScenario(user, config, tags) {
  const featureName = "Login Phone";
  const route = config.baseUrl + "/v1/login/phone";
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    phone: user.phone,
    password: user.password,
  };

  if (config.runNegativeCase) {
    assertHandler(
      "empty body", featureName, route, {}, {},
      {
        ["should return 400"]: (v) => v.status === 400,
      },
      [], config, tags,);

    const testObjects = generateTestObjects(
      {
        phone: {
          type: "string",
          notNull: true,
          isPhoneNumber: true
        },
        password: {
          type: "string",
          notNull: true,
          minLength: 8,
          maxLength: 32,
        },
      },
      positivePayload,
    );
    testObjects.forEach((payload) => {
      assertHandler(
        "invalid payload", featureName, route, payload, {},
        {
          ["should return 400"]: (res) => res.status === 400,
        },
        [], config, tags,);
    });
    assertHandler(
      "email not exists",
      featureName, route, combine(positivePayload, {
        phone: generateRandomPhoneNumber(true),
      }),
      {},
      {
        ["should return 404"]: (res) => res.status === 404,
      },
      [], config, tags,);
  }

  const res = assertHandler(
    "valid payload", featureName, route, positivePayload, {},
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have email"]: (v) => isExists(v, "email", ["string"]),
      ["should have phone"]: (v) => isExists(v, "phone", ["string"]),
      ["should have token"]: (v) => isExists(v, "token", ["string"]),
    },
    [], config, tags,);

  return getUser(res, positivePayload, featureName)
}
