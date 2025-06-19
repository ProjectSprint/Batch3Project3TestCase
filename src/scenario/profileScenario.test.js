import test from "node:test";
import { z } from "zod";
import TestServer from "../test/testServer.node.js";

import { promisify } from "node:util";
import child_process from "node:child_process";
import assert from "node:assert";
const exec = promisify(child_process.exec);

const phoneSchema = z.string().regex(/^\+\d+$/, {
  message: "Phone number must start with '+' followed by digits",
});

const emailSchema = z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
  message: "Email must be in a valid format",
});

const requestSchema = z.object({
  email: z.string(),
  password: z.string(),
  fileId: z.string(),
  fileUri: z.string(),
  fileThumbnailUri: z.string(),
  bankAccountName: z.string(),
  bankAccountHolder: z.string(),
  bankAccountNumber: z.string(),
});

const profilePutSchema = z.object({
  fileId: z.string(),
  bankAccountName: z.string().min(4, { message: "bankAccountName must be at least 4 characters long" }).max(32, { message: "bankAccountName  must be no more than 32 characters long" }),
  bankAccountHolder: z.string().min(4, { message: "bankAccountHolder must be at least 4 characters long" }).max(32, { message: "bankAccountHolder  must be no more than 32 characters long" }),
  bankAccountNumber: z.string().min(4, { message: "bankAccountNumber must be at least 4 characters long" }).max(32, { message: "bankAccountNumber  must be no more than 32 characters long" }),
});

const s = new TestServer({});

/** @type {string[]} */
s.addRoute("GET", "/v1/user", async (req, res) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      s.sendJsonResponse(res, 200, {
        email: "name@name.com",
        phone: "",
        fileId: "",
        fileUri: "",
        fileThumbnailUri: "",
        bankAccountName: "",
        bankAccountHolder: "",
        bankAccountNumber: "",
      });
    } else {
      s.sendJsonResponse(res, 401, { status: "failed" });
    }
    return;
  } catch (error) {
    s.sendJsonResponse(res, 500, { status: "failed" });
  }
});

/** @type {string[]} */
s.addRoute("PUT", "/v1/user", async (req, res) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const body = await s.getRequestBody(req);
      const validate = profilePutSchema.safeParse(body);
      if (validate.success) {
        s.sendJsonResponse(res, 200, {
          email: "name@name.com",
          phone: "",
          fileId: "",
          fileUri: "",
          fileThumbnailUri: "",
          bankAccountName: "",
          bankAccountHolder: "",
          bankAccountNumber: "",
        });
      } else {
        s.sendJsonResponse(res, 400, { status: "failed" });
      }
    } else {
      s.sendJsonResponse(res, 401, { status: "failed" });
    }
    
    return;
  } catch (error) {
    s.sendJsonResponse(res, 500, { status: "failed" });
  }
});

// /** @type {string[]} */
// s.addRoute("POST", "/v1/user/link/phone", async (req, res) => {
//   try {
//     const body = await s.getRequestBody(req);
//     const validate = phoneSchema.safeParse(body);
//     if (validate.success) {
//       s.sendJsonResponse(res, 200, {
//         email: "name@name.com",
//         phone: "",
//         fileId: "",
//         fileUri: "",
//         fileThumbnailUri: "",
//         bankAccountName: "",
//         bankAccountHolder: "",
//         bankAccountNumber: "",
//       });
//     } else {
//       s.sendJsonResponse(res, 400, { status: "failed" });
//       return;
//     }
//     return;
//   } catch (error) {
//     s.sendJsonResponse(res, 500, { status: "failed" });
//   }
// });

// /** @type {string[]} */
// s.addRoute("POST", "/v1/user/link/email", async (req, res) => {
//   try {
//     const body = await s.getRequestBody(req);
//     const validate = emailSchema.safeParse(body);
//     if (validate.success) {
//       s.sendJsonResponse(res, 200, {
//         email: "name@name.com",
//         phone: "",
//         fileId: "",
//         fileUri: "",
//         fileThumbnailUri: "",
//         bankAccountName: "",
//         bankAccountHolder: "",
//         bankAccountNumber: "",
//       });
//     } else {
//       s.sendJsonResponse(res, 400, { status: "failed" });
//       return;
//     }
//     return;
//   } catch (error) {
//     s.sendJsonResponse(res, 500, { status: "failed" });
//   }
// });

test("Profile Scenario", async (go) => {
  let serverPort = 0;
  go.before(async () => {
    serverPort = await s.start();
  });
  go.after(() => {
    s.stop();
  });
  go.test("GetProfileScenario should return 0 exit code", async () => {
    const info = {
      user: {
        email: "asdf@adf.com",
        phone: "+45646464",
        password: "asdfasdf",
        token: "Bearer asdfasdf",
      },
    };
    await assert.doesNotReject(
      exec(`${process.env.K6_PATH} run src/main.js`, {
        env: {
          BASE_URL: `http://127.0.0.1:${serverPort}`,
          MOCK_INFO: `${JSON.stringify(info)}`,
          RUN_UNIT_TEST: "true",
          SCENARIO_NAME: "GetProfileScenario",
        },
      }),
      console.error,
    );
  });

  go.test("PutProfileScenario should return 0 exit code", async () => {
    const info = {
      user: {
        fileid: "abcdef123456",
        phone: "+62012380681",
        password: "nalokololo",
        token: "Bearer nalokolo",
      },
    };
    await assert.doesNotReject(
      exec(`${process.env.K6_PATH} run src/main.js`, {
        env: {
          BASE_URL: `http://127.0.0.1:${serverPort}`,
          MOCK_INFO: `${JSON.stringify(info)}`,
          RUN_UNIT_TEST: "true",
          SCENARIO_NAME: "PutProfileScenario",
        },
      }),
      console.error,
    );
  });
});
