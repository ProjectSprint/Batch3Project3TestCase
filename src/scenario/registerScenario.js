import { testPostJsonAssert } from "../helper/testRequest.js";
import { getUser } from "../assertion/userAssertion.js";
import {
  generateRandomEmail,
  generateRandomPassword,
  generateRandomPhoneNumber,
  generateTestObjects,
} from "../helper/generator.js";
import { isExists } from "../helper/assertion.js";

/**
 * @type {import("src/types/scenario.js").Scenario<import("src/entity/app.js").User | undefined>}
 */
export function RegisterEmailScenario(config, tags, info) {
  const featureName = "Register Email";
  const route = config.baseUrl + "/v1/register/email";
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    email: generateRandomEmail(),
    password: generateRandomPassword(8, 32),
  };

  if (config.runNegativeCase) {
    assertHandler({
      currentTestName: "empty body",
      featureName: featureName,
      route: route,
      body: {},
      headers: {},
      expectedCase: {
        // Use underscore '_' prefix for unused 'parsed' parameter
        ["should return 400"]: (_parsed, res) => res.status === 400,
      },
      options: [],
      config: config,
      tags: tags,
    });

    const testObjects = generateTestObjects(
      {
        email: { type: "string", notNull: true, isEmail: true },
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
      assertHandler({
        currentTestName: "invalid payload",
        featureName: featureName,
        route: route,
        body: payload,
        headers: {},
        expectedCase: {
          ["should return 400"]: (_parsed, res) => res.status === 400,
        },
        options: [],
        config: config,
        tags: tags,
      });
    });
  }

  // --- Positive Case ---
  const registerResult = assertHandler({
    currentTestName: "valid payload",
    featureName: featureName,
    route: route,
    body: positivePayload,
    headers: {},
    expectedCase: {
      ["should return 201"]: (_parsed, res) => res.status === 201,
      ["should have email"]: (parsed, _res) =>
        isExists(parsed, "email", ["string"]),
      ["should have phone"]: (parsed, _res) =>
        isExists(parsed, "phone", ["string", null]),
      ["should have token"]: (parsed, _res) =>
        isExists(parsed, "token", ["string"]),
    },
    options: [],
    config: config,
    tags: tags,
  });

  if (config.runNegativeCase) {
    testPostJsonAssert({
      currentTestName: "email conflict",
      featureName: featureName,
      route: route,
      body: positivePayload,
      headers: {},
      expectedCase: {
        ["should return 409"]: (_parsed, res) => res.status === 409,
      },
      options: [],
      config: config,
      tags: tags,
    });
  }
  if (registerResult.isSuccess) {
    const usr = getUser(registerResult.res, positivePayload, featureName);
    console.log("usr: ", usr);
    return usr;
  } else {
    console.warn(
      `${featureName} | Skipping getUser due to failed registration assertions.`,
    );
    return undefined;
  }
}

/**
 * @type {import("src/types/scenario.js").Scenario<import("src/entity/app.js").User | undefined>}
 */
export function RegisterPhoneScenario(config, tags, info) {
  const featureName = "Register Phone";
  const route = config.baseUrl + "/v1/register/phone";
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    phone: generateRandomPhoneNumber(true),
    password: generateRandomPassword(8, 32),
  };

  if (config.runNegativeCase) {
    assertHandler({
      currentTestName: "empty body",
      featureName: featureName,
      route: route,
      body: {},
      headers: {},
      expectedCase: {
        ["should return 400"]: (_parsed, res) => res.status === 400,
      },
      options: [],
      config: config,
      tags: tags,
    });

    // Generate test objects for invalid phone/password combinations
    const testObjects = generateTestObjects(
      {
        phone: { type: "string", notNull: true, isPhoneNumber: true }, // <-- Updated schema field
        password: {
          type: "string",
          notNull: true,
          minLength: 8,
          maxLength: 32,
        },
      },
      positivePayload, // Base payload for variations
    );
    testObjects.forEach((payload) => {
      assertHandler({
        currentTestName: "invalid payload",
        featureName: featureName,
        route: route,
        body: payload,
        headers: {},
        expectedCase: {
          ["should return 400"]: (_parsed, res) => res.status === 400,
        },
        options: [],
        config: config,
        tags: tags,
      });
    });
  }

  // --- Positive Case ---
  const registerResult = assertHandler({
    currentTestName: "valid payload",
    featureName: featureName,
    route: route,
    body: positivePayload,
    headers: {},
    expectedCase: {
      ["should return 201"]: (_parsed, res) => res.status === 201,
      ["should have email or be null"]: (
        parsed,
        _res, // <-- Expect email might be null
      ) => isExists(parsed, "email", ["string", null]),
      ["should have phone"]: (
        parsed,
        _res, // <-- Expect phone to exist
      ) => isExists(parsed, "phone", ["string"]),
      ["should have token"]: (parsed, _res) =>
        isExists(parsed, "token", ["string"]),
    },
    options: [],
    config: config,
    tags: tags,
  });

  // --- Negative Case: Conflict Check ---
  if (config.runNegativeCase && registerResult.isSuccess) {
    testPostJsonAssert({
      currentTestName: "phone conflict",
      featureName: featureName,
      route: route,
      body: positivePayload,
      headers: {},
      expectedCase: {
        ["should return 409"]: (_parsed, res) => res.status === 409, // <-- Expect conflict
      },
      options: [],
      config: config,
      tags: tags,
    });
  }

  // --- Return User ---
  if (registerResult.isSuccess) {
    // Pass the successful response and original payload to getUser
    const usr = getUser(registerResult.res, positivePayload, featureName);
    return usr;
  } else {
    console.warn(
      `${featureName} | Skipping getUser due to failed registration assertions.`,
    );
    return undefined;
  }
}
