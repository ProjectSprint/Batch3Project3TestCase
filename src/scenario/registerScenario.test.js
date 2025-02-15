import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import TestServer from '../helper/testServer.node.js';
import { exec } from 'node:child_process';

const s = new TestServer({})
s.addRoute('POST', '/v1/register/email', async (req, res) => {
  try {
    const body = await s.getRequestBody(req)
    console.log("body received", body)
    s.sendJsonResponse(res, 200, { status: "ok" })
  } catch (error) {
    console.log("error happened", error)
    s.sendJsonResponse(res, 500, { status: "failed" })
  }
})

const commandEnv = `RUN_UNIT_TEST=true TEST_NAME=RegisterEmailScenario `
describe('Register Scenario', () => {
  let serverPort = 0
  before(async () => {
    serverPort = await s.start();
  });
  after(async () => {
    await s.stop();
  });
  it('valid body should return 200', () => {
    const user = {
      email: "",
      phone: "",
      token: "",
      password: "",
    }
    exec(`${commandEnv} BASE_URL=http://localhost:${serverPort} MOCK_USER='${JSON.stringify(user)}' k6 run main.js`, (err, stdout, stderr) => {
      console.log('stdout:\n', stdout)
      console.log('stderr:\n', stderr)
      console.log('error:\n', err)
    })
  });
});
