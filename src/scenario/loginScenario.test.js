import test from "node:test";
import { z } from "zod";
import TestServer from "../test/testServer.node.js";

import { promisify } from "node:util";
import child_process from "node:child_process";
import assert from "node:assert";
const exec = promisify(child_process.exec);

// Password schema used across multiple requests
const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(32, { message: "Password must be no more than 32 characters long" });

const phoneSchema = z.string().regex(/^\+\d+$/, {
  message: "Phone number must start with '+' followed by digits",
});

const LoginEmailRequestSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: passwordSchema,
});

const LoginPhoneRequestSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
});

const s = new TestServer({});

const validPhone = "+628123123123";
s.addRoute("POST", "/v1/login/phone", async (req, res) => {
  try {
    const body = await s.getRequestBody(req);
    const validate = LoginPhoneRequestSchema.safeParse(body);
    if (validate.success) {
      if (validate.data.phone === validPhone) {
        s.sendJsonResponse(res, 201, {
          email: null,
          phone: validate.data.phone,
          token: "token",
        });
      } else {
        s.sendJsonResponse(res, 404, { status: "failed" });
        return;
      }
    } else {
      s.sendJsonResponse(res, 400, { status: "failed" });
      return;
    }
    return;
  } catch (error) {
    s.sendJsonResponse(res, 500, { status: "failed" });
  }
});

const validEmail = "test@email.com";
s.addRoute("POST", "/v1/login/email", async (req, res) => {
  try {
    const body = await s.getRequestBody(req);
    const validate = LoginEmailRequestSchema.safeParse(body);
    if (validate.success) {
      if (validate.data.email === validEmail) {
        s.sendJsonResponse(res, 201, {
          email: validate.data.email,
          phone: null,
          token: "token",
        });
      } else {
        s.sendJsonResponse(res, 404, { status: "failed" });
        return;
      }
    } else {
      s.sendJsonResponse(res, 400, { status: "failed" });
      return;
    }
    return;
  } catch (error) {
    s.sendJsonResponse(res, 500, { status: "failed" });
  }
});

test("Login Scenario", async (go) => {
  let serverPort = 0;
  go.before(async () => {
    serverPort = await s.start();
  });
  go.after(() => {
    s.stop();
  });
  go.test("LoginEmailScenario should return 0 exit code", async () => {
    await assert.doesNotReject(
      exec(`${process.env.K6_PATH} run src/main.js`, {
        env: {
          BASE_URL: `http://127.0.0.1:${serverPort}`,
          MOCK_INFO: ``,
          RUN_UNIT_TEST: "true",
          SCENARIO_NAME: "LoginEmailScenario",
        },
      }),
      console.error,
    );
  });

  go.test("LoginPhoneScenario should return 0 exit code", async () => {
    await assert.doesNotReject(
      exec(`${process.env.K6_PATH} run src/main.js`, {
        env: {
          BASE_URL: `http://127.0.0.1:${serverPort}`,
          MOCK_INFO: ``,
          RUN_UNIT_TEST: "true",
          SCENARIO_NAME: "LoginPhoneScenario",
        },
      }),
      console.error,
    );
  });
});
