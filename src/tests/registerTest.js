import { getUser } from "../assertion/userAssertion.js";
import { isEqual, isExists } from "../helper/assertion.js";
import {
  generateRandomEmail,
  generateRandomPassword,
  generateRandomPhoneNumber,
  generateTestObjects,
} from "../helper/generator.js";
import { testPostJsonAssert } from "../helper/request.js";

/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @returns {Types.User | undefined}
 */
export function RegisterEmailTest(config, tags) {
  const featureName = "Register Email";
  const route = config.baseUrl + "/v1/register/email";
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    email: generateRandomEmail(),
    password: generateRandomPassword(8, 32),
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
      positivePayload,); testObjects.forEach((payload) => {
        assertHandler(
          "invalid payload", featureName, route, payload, {},
          {
            ["should return 400"]: (res) => res.status === 400,
          },
          [], config, tags,);
      });
  }

  const res = assertHandler(
    "valid payload", featureName, route, positivePayload, {},
    {
      ["should return 201"]: (v) => v.status === 201,
      ["should have email"]: (v) => isExists(v, "email", ["string"]),
      ["should have phone"]: (v) => isExists(v, "phone", ["string"]),
      ["should have token"]: (v) => isExists(v, "token", ["string"]),
    },
    [], config, tags,);
  if (config.runNegativeCase) {
    testPostJsonAssert(
      "email conflict", featureName, route, positivePayload, {},
      {
        ["should return 409"]: (res) => res.status === 409,
      },
      [], config, tags,);
  }
  return getUser(res, positivePayload, featureName)
}

/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @returns {Types.User | undefined}
 */
export function RegisterPhoneTest(config, tags) {
  const featureName = "Register Phone";
  const route = config.baseUrl + "/v1/register/phone";
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    phone: generateRandomPhoneNumber(true),
    password: generateRandomPassword(8, 32),
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
          isPhoneNumber: true,
        },
        password: {
          type: "string",
          notNull: true,
          minLength: 8,
          maxLength: 32,
        },
      },
      positivePayload,); testObjects.forEach((payload) => {
        assertHandler(
          "invalid payload", featureName, route, payload, {},
          {
            ["should return 400"]: (res) => res.status === 400,
          },
          [], config, tags,);
      });
  }

  const res = assertHandler(
    "valid payload", featureName, route, positivePayload, {},
    {
      ["should return 201"]: (v) => v.status === 201,
      ["should have email"]: (v) => isExists(v, "email", ["string"]),
      ["should have phone"]: (v) => isExists(v, "phone", ["string"]),
      ["should have token"]: (v) => isExists(v, "token", ["string"]),
    },
    [], config, tags,);
  if (config.runNegativeCase) {
    testPostJsonAssert(
      "email conflict", featureName, route, positivePayload, {},
      {
        ["should return 409"]: (res) => res.status === 409,
      },
      [], config, tags,);
  }
  return getUser(res, positivePayload, featureName)
}

