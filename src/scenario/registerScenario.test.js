import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import TestServer from "../helper/testServer.node.js";
import { exec, spawn } from "node:child_process";
import isReachable from "is-reachable";

const s = new TestServer({});
s.addRoute("POST", "/v1/register/email", async (req, res) => {
  try {
    // todo create request validation
    const body = await s.getRequestBody(req);
    console.log("body received", body);
    s.sendJsonResponse(res, 200, { status: "ok" });
  } catch (error) {
    console.log("error happened", error);
    s.sendJsonResponse(res, 500, { status: "failed" });
  }
});

describe("Register Scenario", () => {
  let serverPort = 0;
  before(async () => {
    serverPort = await s.start();
  });
  after(async () => {
    await s.stop();
  });
  it("valid body should return 200", async () => {
    const user = {
      email: "",
      phone: "",
      token: "",
      password: "",
    };
    const ls = spawn(`k6 run`, ["main.js"], {
      env: {
        BASE_URL: `http://127.0.0.1:${serverPort}`,
        MOCK_USER: `${JSON.stringify(user)}`,
        RUN_UNIT_TEST: "true",
        TEST_NAME: "RegisterEmailScenario",
      },
      shell: true,
    });
    ls.stdout.on("data", (data) => {
      console.log(`spawn stdout: ${data}`);
    });

    ls.stderr.on("data", (data) => {
      console.error(`spawn stderr: ${data}`);
    });

    ls.on("close", (code) => {
      console.log(`spawn child process exited with code ${code}`);
    });
    await new Promise((resolve) => setTimeout(resolve, 1000000));
  });
});
