import test from "node:test";
import { z } from "zod";
import TestServer from "../test/testServer.node.js";

import { promisify } from "node:util";
import child_process from "node:child_process";
import assert from "node:assert";
const exec = promisify(child_process.exec);

const getSchema = z.object({
  name: z.string(),
  category: z.string(),
  qty: z.number(),
  price: z.number(),
  sku: z.string(),
  fileId: z.string()
});

const s = new TestServer({});

/** @type {string[]} */
s.addRoute("POST", "/v1/product", async (req, res) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) 
    {
      const body = await s.getRequestBody(req);
      const validate = getSchema.safeParse(body);

      if (validate.success) {
        s.sendJsonResponse(res, 200, {
          productId: "name@name.com",
          name: "",
          category: "",
          qty: 1,
          price: 100,

          fileId: "",
          fileUri: "",
          fileThumbnailUri: "",

          createdAt: "",
          updatedAt: "",
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
// s.addRoute("PUT", "/v1/user", async (req, res) => {
//   try {
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer")
//     ) {
//       const body = await s.getRequestBody(req);
//       const validate = profilePutSchema.safeParse(body);
//       if (validate.success) {
//         s.sendJsonResponse(res, 200, {
//           email: "name@name.com",
//           phone: "",
//           fileId: "",
//           fileUri: "",
//           fileThumbnailUri: "",
//           bankAccountName: "",
//           bankAccountHolder: "",
//           bankAccountNumber: "",
//         });
//       } else {
//         s.sendJsonResponse(res, 400, { status: "failed" });
//       }
//     } else {
//       s.sendJsonResponse(res, 401, { status: "failed" });
//     }
    
//     return;
//   } catch (error) {
//     s.sendJsonResponse(res, 500, { status: "failed" });
//   }
// });

// /** @type {string[]} */
// const registerdPhone = [];
// s.addRoute("POST", "/v1/user/link/phone", async (req, res) => {
//   try {
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer")
//     ) {
//       const body = await s.getRequestBody(req);
//       const validate = profilePhonePutSchema.safeParse(body);
      
//       if (validate.success) {

//         if (registerdPhone.includes(validate.data.phone)) {
//           s.sendJsonResponse(res, 409, { status: "failed" });
//           return;
//         }

//         registerdPhone.push(validate.data.phone);

//         s.sendJsonResponse(res, 200, {
//           email: "name@name.com",
//           phone: "",
//           fileId: "",
//           fileUri: "",
//           fileThumbnailUri: "",
//           bankAccountName: "",
//           bankAccountHolder: "",
//           bankAccountNumber: "",
//         });
//       } else {
//         s.sendJsonResponse(res, 400, { status: "failed" });
//       }
//     } else {
//       s.sendJsonResponse(res, 401, { status: "failed" });
//     }
    
//     return;
//   } catch (error) {
//     s.sendJsonResponse(res, 500, { status: "failed" });
//   }
// });

// /** @type {string[]} */
// const registerdEmail = [];
// s.addRoute("POST", "/v1/user/link/email", async (req, res) => {
//   try {
//     const body = await s.getRequestBody(req);
//     const validate = profileEmailPutSchema.safeParse(body);

//     if (validate.success) {
//       if (registerdEmail.includes(validate.data.email)) {
//         s.sendJsonResponse(res, 409, { status: "failed" });
//         return;
//       }

//       registerdEmail.push(validate.data.email);

//       s.sendJsonResponse(res, 200, {
//         email: validate.data.email,
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

test("Product Scenario", async (go) => {
  let serverPort = 0;
  go.before(async () => {
    serverPort = await s.start();
  });
  go.after(() => {
    s.stop();
  });
  go.test("PostProductScenario should return 0 exit code", async () => {
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
          SCENARIO_NAME: "PostProductScenario",
        },
      }),
      console.error,
    );
  });
});
