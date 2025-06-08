import { after, before, describe, it, suite } from "node:test";
import { exec, spawn } from "node:child_process";
import { z } from "zod";
import TestServer from "../test/testServer.node.js";
import assert from "node:assert";

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

const RegisterEmailRequestSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: passwordSchema,
});

const RegisterPhoneRequestSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
});

const s = new TestServer({});

/** @type {string[]} */
const registerdPhone = [];
s.addRoute("POST", "/v1/register/phone", async (req, res) => {
  try {
    const body = await s.getRequestBody(req);
    const validate = RegisterPhoneRequestSchema.safeParse(body);
    if (!validate.success) {
      s.sendJsonResponse(res, 400, { status: "failed" });
      return;
    }
    if (registerdPhone.includes(validate.data.phone)) {
      s.sendJsonResponse(res, 409, { status: "failed" });
      return;
    }
    registerdPhone.push(validate.data.phone);
    s.sendJsonResponse(res, 201, {
      email: null,
      phone: validate.data.phone,
      token: "token",
    });
    return;
  } catch (error) {
    s.sendJsonResponse(res, 500, { status: "failed" });
  }
});

/** @type {string[]} */
const registerdEmail = [];
s.addRoute("POST", "/v1/register/email", async (req, res) => {
  try {
    const body = await s.getRequestBody(req);
    const validate = RegisterEmailRequestSchema.safeParse(body);
    if (!validate.success) {
      s.sendJsonResponse(res, 400, { status: "failed" });
      return;
    }
    if (registerdEmail.includes(validate.data.email)) {
      s.sendJsonResponse(res, 409, { status: "failed" });
      return;
    }
    registerdEmail.push(validate.data.email);
    s.sendJsonResponse(res, 201, {
      email: validate.data.email,
      phone: null,
      token: "token",
    });
    return;
  } catch (error) {
    s.sendJsonResponse(res, 500, { status: "failed" });
  }
});

describe("Register Scenario", () => {
  let serverPort = 0;
  before(async () => {
    serverPort = await s.start();
  });
  after(() => {
    s.stop();
  });
  it("valid body should return 200", async () => {
    const user = {
      email: "",
      phone: "",
      token: "",
      password: "",
    };
    exec(
      `${process.env.K6_PATH} run src/main.js 2>&1`,
      {
        env: {
          BASE_URL: `http://127.0.0.1:${serverPort}`,
          MOCK_INFO: `${JSON.stringify(user)}`,
          RUN_UNIT_TEST: "true",
          SCENARIO_NAME: "RegisterEmailScenario",
        },
      },
      (err, stdout) => {
        console.log(stdout);
        console.log("Error:", err);
        assert.ifError(err);
      },
    );
  });
});
