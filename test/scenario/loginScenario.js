import { testPostJsonAssert } from "../helper/testRequest.js";
import { getUser, isUser } from "../assertion/userAssertion.js";
import {
  combine,
  generateRandomEmail,
  generateRandomPhoneNumber,
  generateTestObjects,
} from "../helper/generator.js";
import { isEqual, isExists } from "../helper/assertion.js";

/**
 * @type {import("../types/scenario.js").Scenario<import("../entity/app.js").User | undefined>}
 */
export function LoginEmailScenario(config, tags, info) {
  const featureName = "Login Email";
  const route = config.baseUrl + "/v1/login/email";
  const assertHandler = testPostJsonAssert;

  const user = info.user;
  console.info("user", user);
  if (!isUser(user)) {
    console.warn(`${featureName} needs a valid user`);
    return undefined;
  }

  const positivePayload = {
    email: user.email,
    password: user.password,
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
    assertHandler({
      currentTestName: "email not exists",
      featureName: featureName,
      route: route,
      body: combine(positivePayload, {
        email: generateRandomEmail(),
      }),
      headers: {},
      expectedCase: {
        ["should return 404"]: (_parsed, res) => res.status === 404,
      },
      options: [],
      config: config,
      tags: tags,
    });
  }

  // --- Positive Case ---
  const loginResult = assertHandler({
    currentTestName: "valid payload",
    featureName: featureName,
    route: route,
    body: positivePayload,
    headers: {},
    expectedCase: {
      ["should return 200"]: (_parsed, res) => res.status === 200,
      ["should have email and equal"]: (parsed, _res) =>
        isEqual(parsed, "email", user.email),
      // Assuming phone might not be returned on email login
      ["should have phone or be null"]: (parsed, _res) =>
        isExists(parsed, "phone", ["string", null]),
      ["should have token"]: (parsed, _res) =>
        isExists(parsed, "token", ["string"]),
    },
    options: [],
    config: config,
    tags: tags,
  });

  if (loginResult.isSuccess) {
    return getUser(loginResult.res, positivePayload, featureName);
  } else {
    console.warn(
      `${featureName} | Skipping getUser due to failed login assertions.`,
    );
    return undefined;
  }
}

/**
 * @type {import("../types/scenario.js").Scenario<import("../entity/app.js").User | undefined>}
 */
export function LoginPhoneScenario(config, tags, user) {
  const featureName = "Login Phone";
  const route = config.baseUrl + "/v1/login/phone";
  const assertHandler = testPostJsonAssert;

  if (!isUser(user)) {
    console.warn(`${featureName} needs a valid user`);
    return undefined;
  }

  // Ensure user has a phone number for this test
  if (!user.phone) {
    console.warn(
      `${featureName} | Skipping scenario because user has no phone number.`,
    );
    return undefined;
  }

  const positivePayload = {
    phone: user.phone,
    password: user.password,
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
    assertHandler({
      currentTestName: "phone not exists", // Corrected test name
      featureName: featureName,
      route: route,
      body: combine(positivePayload, {
        phone: generateRandomPhoneNumber(true), // Assuming this generates a valid format phone number unlikely to exist
      }),
      headers: {},
      expectedCase: {
        ["should return 404"]: (_parsed, res) => res.status === 404,
      },
      options: [],
      config: config,
      tags: tags,
    });
  }

  // --- Positive Case ---
  const loginResult = assertHandler({
    currentTestName: "valid payload",
    featureName: featureName,
    route: route,
    body: positivePayload,
    headers: {},
    expectedCase: {
      ["should return 200"]: (_parsed, res) => res.status === 200,
      // Assuming email might not be returned on phone login, adjust if needed
      ["should have email or be null"]: (parsed, _res) =>
        isExists(parsed, "email", ["string", null]),
      ["should have phone and equal"]: (parsed, _res) =>
        isEqual(parsed, "phone", user.phone),
      ["should have token"]: (parsed, _res) =>
        isExists(parsed, "token", ["string"]),
    },
    options: [],
    config: config,
    tags: tags,
  });

  if (loginResult.isSuccess) {
    // Pass the original user object to potentially merge/update details if needed by getUser
    return getUser(loginResult.res, user, featureName);
  } else {
    console.warn(
      `${featureName} | Skipping getUser due to failed login assertions.`,
    );
    return undefined;
  }
}
