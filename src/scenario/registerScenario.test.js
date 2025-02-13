import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import TestServer from '../helper/testServer.test.js';
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
  before(async () => {
    await s.start();
  });
  after(async () => {
    await s.stop();
  });
  it('valid body should return 200', () => {
    exec(`${commandEnv} MOCK_USER='{"invalid":"true"}' k6 run main.js`, (err, stdout, stderr) => {
      console.log('error:\n', err)
      console.log('stdout:\n', stdout)
      console.log('stderr:\n', stderr)
    })
  });
});
