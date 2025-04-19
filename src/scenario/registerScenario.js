// src/scenario/RegisterEmailScenario.js

import { testPostJsonAssert } from "../helper/testRequest.js"; // Adjust path
import { getUser } from "../assertion/userAssertion.js"; // Adjust path
import {
  generateRandomEmail,
  generateRandomPassword,
  generateRandomPhoneNumber,
  generateTestObjects,
} from "../helper/generator.js"; // Adjust path
import { isExists } from "../helper/testAssertion.js"; // Adjust path

/**
 * @param {import("../entity/config.d.ts").Config} config // Adjust path
 * @param {{[name: string]: string}} tags
 * @returns {import("src/entity/app.js").User | undefined} // Adjust path
 */
export function RegisterEmailScenario(config, tags) {
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
    return getUser(registerResult.res, positivePayload, featureName);
  } else {
    console.warn(
      `${featureName} | Skipping getUser due to failed registration assertions.`,
    );
    return undefined;
  }
}
/**
 * @param {import("../entity/config.d.ts").Config} config // Adjust path
 * @param {{[name: string]: string}} tags
 * @returns {import("src/entity/app.js").User | undefined} // Adjust path, verify correctness
 */
export function RegisterPhoneScenario(config, tags) {
  const featureName = "Register Phone";
  const route = config.baseUrl + "/v1/register/phone"; // <-- Updated route
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    phone: generateRandomPhoneNumber(true), // <-- Use phone generator (assuming 'true' gives valid format)
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
    // Added isSuccess check
    // Test conflict only if initial registration succeeded
    testPostJsonAssert({
      currentTestName: "phone conflict", // <-- Updated test name
      featureName: featureName,
      route: route,
      body: positivePayload, // <-- Use the same payload that just succeeded
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
    return getUser(registerResult.res, positivePayload, featureName);
  } else {
    console.warn(
      `${featureName} | Skipping getUser due to failed registration assertions.`,
    );
    return undefined;
  }
}
