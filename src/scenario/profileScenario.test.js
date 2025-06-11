import test from "node:test";
import { z } from "zod";
import TestServer from "../test/testServer.node.js";

import { promisify } from "node:util";
import child_process from "node:child_process";
import assert from "node:assert";
const exec = promisify(child_process.exec);

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
});
