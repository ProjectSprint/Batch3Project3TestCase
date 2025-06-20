import {
  testGetAssert,
  testPatchJsonAssert,
  testPostJsonAssert,
} from "../helper/testRequest.js";
import { getUser, isUser } from "../assertion/userAssertion.js";
import {
  combine,
  generateRandomEmail,
  generateRandomNumber,
  generateRandomPhoneNumber,
  generateRandomUsername,
  generateTestObjects,
} from "../helper/generator.js";
import { isEqual, isEqualWith, isExists } from "../helper/assertion.js";
import { getProfile, isProfile } from "../assertion/profileAssertion.js";
import { isFile } from "../assertion/fileAssertion.js";

/**
 * @type {import("src/types/scenario.js").Scenario<import("src/entity/app.js").Profile | undefined>}
 */
export function GetProfileScenario(config, tags, info) {
  const featureName = "Get Profile";
  const route = config.baseUrl + "/v1/user";
  const assertHandler = testGetAssert;

  const user = info.user;
  if (!isUser(user)) {
    console.warn(`${featureName} needs a valid user`);
    return undefined;
  }

  if (config.runNegativeCase) {
    assertHandler({
      featureName: featureName,
      config: config,
      route: route,
      params: {},
      headers: {},
      currentTestName: "unauthorized",
      expectedCase: {
        ["should return 401"]: (_parsed, res) => res.status === 401,
      },
      tags: {},
    });
  }

  // --- Positive Case ---
  const positiveResult = assertHandler({
    featureName: featureName,
    config: config,
    route: route,
    params: {},
    headers: { Authorization: user.token },
    currentTestName: "success get profile",
    expectedCase: {
      ["should return 200"]: (_parsed, res) => res.status === 200,
      ["email should be string"]: (parsed, _res) =>
        isEqualWith(parsed, "email", (val) => {
          if (typeof val[0] === "string") {
            if (val[0].length === 0) return true;

            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return regex.test(val[0]);
          }
          return false;
        }),
      ["phone should be string"]: (parsed, _res) =>
        isEqualWith(parsed, "phone", (val) => {
          if (typeof val[0] === "string") {
            if (val[0].length === 0) return true;
            if (val[0][0] === "+") return true;
          }
          return false;
        }),
      ["fileId should be string"]: (parsed, _res) =>
        isExists(parsed, "fileId", ["string"]),
      ["fileUri should be string"]: (parsed, _res) =>
        isExists(parsed, "fileUri", ["string"]),
      ["fileThumbnailUri should be string"]: (parsed, _res) =>
        isExists(parsed, "fileThumbnailUri", ["string"]),
      ["bankAccountName should be string"]: (parsed, _res) =>
        isExists(parsed, "bankAccountName", ["string"]),
      ["bankAccountHolder should be string"]: (parsed, _res) =>
        isExists(parsed, "bankAccountHolder", ["string"]),
      ["bankAccountNumber should be string"]: (parsed, _res) =>
        isExists(parsed, "bankAccountNumber", ["string"]),
    },
    tags: {},
  });

  console.log("res:", positiveResult.res.status, positiveResult.res.body);
  if (positiveResult.isSuccess) {
    return getProfile(positiveResult.res, {}, featureName);
  } else {
    console.warn(`${featureName} | Skipping due to failed assertions.`);
    return undefined;
  }
}

/**
 * @type {import("src/types/scenario.js").Scenario<import("src/entity/app.js").Profile | undefined>}
 */
export function PutProfileScenario(config, tags, info) {
  const featureName = "Put Profile";
  const route = config.baseUrl + "/v1/user";
  const assertHandler = testPatchJsonAssert;

  const user = info.user;
  const file = info.file;
  if (!isUser(user) || !isFile(file)) {
    console.warn(`${featureName} needs a valid user or file`);
    return undefined;
  }

  const positivePayload = {
    fileId: file.fileId,
    bankAccountName: generateRandomUsername(),
    bankAccountHolder: generateRandomUsername(),
    bankAccountNumber: `${generateRandomNumber(9999, 999999999999)}`,
  };

  if (config.runNegativeCase) {
    assertHandler({
      currentTestName: "no token",
      featureName: featureName,
      route: route,
      body: {},
      headers: {},
      expectedCase: {
        ["should return 401"]: (_parsed, res) => res.status === 401,
      },
      options: [],
      config: config,
      tags: tags,
    });
    assertHandler({
      currentTestName: "empty body",
      featureName: featureName,
      route: route,
      body: {},
      headers: { Authorization: user.token },
      expectedCase: {
        ["should return 400"]: (_parsed, res) => res.status === 400,
      },
      options: [],
      config: config,
      tags: tags,
    });

    const testObjects = generateTestObjects(
      {
        fileId: {
          type: "string",
          notNull: false,
        },
        bankAccountName: {
          type: "string",
          notNull: true,
          minLength: 4,
          maxLength: 32,
        },
        bankAccountHolder: {
          type: "string",
          notNull: true,
          minLength: 4,
          maxLength: 32,
        },
        bankAccountNumber: {
          type: "string",
          notNull: true,
          minLength: 4,
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
        headers: { Authorization: user.token },
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
  const positiveResult = assertHandler({
    currentTestName: "valid payload",
    featureName: featureName,
    route: route,
    body: positivePayload,
    headers: { Authorization: user.token },
    expectedCase: {
      ["should return 200"]: (_parsed, res) => res.status === 200,
      ["email should be string"]: (parsed, _res) =>
        isEqualWith(parsed, "email", (val) => {
          if (typeof val[0] === "string") {
            if (val[0].length === 0) return true;

            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return regex.test(val[0]);
          }
          return false;
        }),
      ["phone should be string"]: (parsed, _res) =>
        isEqualWith(parsed, "phone", (val) => {
          if (typeof val[0] === "string") {
            if (val[0].length === 0) return true;
            if (val[0][0] === "+") return true;
          }
          return false;
        }),
      ["fileId should be string"]: (parsed, _res) =>
        isExists(parsed, "fileId", ["string"]),
      ["fileUri should be string"]: (parsed, _res) =>
        isExists(parsed, "fileUri", ["string"]),
      ["fileThumbnailUri should be string"]: (parsed, _res) =>
        isExists(parsed, "fileThumbnailUri", ["string"]),
      ["bankAccountName should be string"]: (parsed, _res) =>
        isExists(parsed, "bankAccountName", ["string"]),
      ["bankAccountHolder should be string"]: (parsed, _res) =>
        isExists(parsed, "bankAccountHolder", ["string"]),
      ["bankAccountNumber should be string"]: (parsed, _res) =>
        isExists(parsed, "bankAccountNumber", ["string"]),
    },
    options: [],
    config: config,
    tags: tags,
  });

  if (positiveResult.isSuccess) {
    return getProfile(positiveResult.res, {}, featureName);
  } else {
    console.warn(
      `${featureName} | Skipping getUser due to failed login assertions.`,
    );
    return undefined;
  }
}

/**
 * @type {import("src/types/scenario.js").Scenario<import("src/entity/app.js").Profile | undefined>}
 */
export function PostProfilePhoneScenario(config, tags, info) {
  const featureName = "Post Profile's Phone";
  const route = config.baseUrl + "/v1/user/link/phone";
  const assertHandler = testPatchJsonAssert;

  const user = info.user;
  if (!isUser(user)) {
    console.warn(`${featureName} needs a valid user or file`);
    return undefined;
  }

  const positivePayload = {
    phone: generateRandomPhoneNumber(true)
  };

  if (config.runNegativeCase) {
    assertHandler({
      currentTestName: "no token",
      featureName: featureName,
      route: route,
      body: {},
      headers: {},
      expectedCase: {
        ["should return 401"]: (_parsed, res) => res.status === 401,
      },
      options: [],
      config: config,
      tags: tags,
    });
    assertHandler({
      currentTestName: "empty body",
      featureName: featureName,
      route: route,
      body: {},
      headers: { Authorization: user.token },
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
          notNull: false,
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
        headers: { Authorization: user.token },
        expectedCase: {
          ["should return 400"]: (_parsed, res) => res.status === 400,
          ["should return 409"]: (_parsed, res) => res.status === 409, // phone is taken
        },
        options: [],
        config: config,
        tags: tags,
      });
    });
  }

  // --- Positive Case ---
  const positiveResult = assertHandler({
    currentTestName: "valid payload",
    featureName: featureName,
    route: route,
    body: positivePayload,
    headers: { Authorization: user.token },
    expectedCase: {
      ["should return 200"]: (_parsed, res) => res.status === 200,
      ["email should be string"]: (parsed, _res) =>
        isEqualWith(parsed, "email", (val) => {
          if (typeof val[0] === "string") {
            if (val[0].length === 0) return true;

            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return regex.test(val[0]);
          }
          return false;
        }),
      ["phone should be string"]: (parsed, _res) =>
        isEqualWith(parsed, "phone", (val) => {
          if (typeof val[0] === "string") {
            if (val[0].length === 0) return true;
            if (val[0][0] === "+") return true;
          }
          return false;
        }),
      ["fileId should be string"]: (parsed, _res) =>
        isExists(parsed, "fileId", ["string"]),
      ["fileUri should be string"]: (parsed, _res) =>
        isExists(parsed, "fileUri", ["string"]),
      ["fileThumbnailUri should be string"]: (parsed, _res) =>
        isExists(parsed, "fileThumbnailUri", ["string"]),
      ["bankAccountName should be string"]: (parsed, _res) =>
        isExists(parsed, "bankAccountName", ["string"]),
      ["bankAccountHolder should be string"]: (parsed, _res) =>
        isExists(parsed, "bankAccountHolder", ["string"]),
      ["bankAccountNumber should be string"]: (parsed, _res) =>
        isExists(parsed, "bankAccountNumber", ["string"]),
    },
    options: [],
    config: config,
    tags: tags,
  });

  if (positiveResult.isSuccess) {
    return getProfile(positiveResult.res, {}, featureName);
  } else {
    console.warn(
      `${featureName} | Skipping getUser due to failed login assertions.`,
    );
    return undefined;
  }
}

/**
 * @type {import("src/types/scenario.js").Scenario<import("src/entity/app.js").Profile | undefined>}
 */
export function PostProfileEmailScenario(config, tags, info) {
  const featureName = "Post Profile's Email";
  const route = config.baseUrl + "/v1/user/link/email";
  const assertHandler = testPatchJsonAssert;

  const user = info.user;
  if (!isUser(user)) {
    console.warn(`${featureName} needs a valid user or file`);
    return undefined;
  }

  const positivePayload = {
    email: generateRandomEmail()
  };

  if (config.runNegativeCase) {
    assertHandler({
      currentTestName: "no token",
      featureName: featureName,
      route: route,
      body: {},
      headers: {},
      expectedCase: {
        ["should return 401"]: (_parsed, res) => res.status === 401,
      },
      options: [],
      config: config,
      tags: tags,
    });
    assertHandler({
      currentTestName: "empty body",
      featureName: featureName,
      route: route,
      body: {},
      headers: { Authorization: user.token },
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
          notNull: false,
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
        headers: { Authorization: user.token },
        expectedCase: {
          ["should return 400"]: (_parsed, res) => res.status === 400,
          ["should return 409"]: (_parsed, res) => res.status === 409, // email is taken
        },
        options: [],
        config: config,
        tags: tags,
      });
    });
  }

  // --- Positive Case ---
  const positiveResult = assertHandler({
    currentTestName: "valid payload",
    featureName: featureName,
    route: route,
    body: positivePayload,
    headers: { Authorization: user.token },
    expectedCase: {
      ["should return 200"]: (_parsed, res) => res.status === 200,
      ["email should be string"]: (parsed, _res) =>
        isEqualWith(parsed, "email", (val) => {
          if (typeof val[0] === "string") {
            if (val[0].length === 0) return true;

            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return regex.test(val[0]);
          }
          return false;
        }),
      ["phone should be string"]: (parsed, _res) =>
        isEqualWith(parsed, "phone", (val) => {
          if (typeof val[0] === "string") {
            if (val[0].length === 0) return true;
            if (val[0][0] === "+") return true;
          }
          return false;
        }),
      ["fileId should be string"]: (parsed, _res) =>
        isExists(parsed, "fileId", ["string"]),
      ["fileUri should be string"]: (parsed, _res) =>
        isExists(parsed, "fileUri", ["string"]),
      ["fileThumbnailUri should be string"]: (parsed, _res) =>
        isExists(parsed, "fileThumbnailUri", ["string"]),
      ["bankAccountName should be string"]: (parsed, _res) =>
        isExists(parsed, "bankAccountName", ["string"]),
      ["bankAccountHolder should be string"]: (parsed, _res) =>
        isExists(parsed, "bankAccountHolder", ["string"]),
      ["bankAccountNumber should be string"]: (parsed, _res) =>
        isExists(parsed, "bankAccountNumber", ["string"]),
    },
    options: [],
    config: config,
    tags: tags,
  });

  if (positiveResult.isSuccess) {
    return getProfile(positiveResult.res, {}, featureName);
  } else {
    console.warn(
      `${featureName} | Skipping getUser due to failed login assertions.`,
    );
    return undefined;
  }
}