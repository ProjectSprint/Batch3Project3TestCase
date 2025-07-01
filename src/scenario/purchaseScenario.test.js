import test from "node:test";
import { Schema, z } from "zod";
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

const purchaseItemsSchema = z.object({
    productId: z.string(),
    qty: z.number()
});

const purchasePostSchema = z.object({
    purchasedItems: z.array(purchaseItemsSchema),
    senderName: z.string().min(4, { message: "senderName must be at least 4 characters long" }).max(55, { message: "senderName must be no more than 55 characters long" }),
    senderContactType: z.enum(["email", "phone"]),
    senderContactDetail: z.string()
})

const purchaseIdPostSchema = z.object({
    fileIds: z.array(z.string()).min(1, {message: "file id must at least one item"})
});

const s = new TestServer({});

const productIds = ["1", "3"]
const fileIds = ["file123", "oka955"]
/** @type {string[]} */
s.addRoute("POST", "/v1/purchase", async (req, res) => {
  try {
    const body = await s.getRequestBody(req);
    const validate = purchasePostSchema.safeParse(body);
      
    if (validate.success) {
        if (validate.data.senderContactType === "email") {
            const validateEmail = emailSchema.safeParse(validate.data.senderContactDetail);
            if (!validateEmail.success) {
                s.sendJsonResponse(res, 400, { status: "failed" });
                return;
            }
        } else {
            const validatePhone = phoneSchema.safeParse(validate.data.senderContactDetail);
            if (!validatePhone.success) {
                s.sendJsonResponse(res, 400, { status: "failed" });
                return; 
            }
        }
        
        if (validate.data.purchasedItems.length > 0) {
          for (let i = 0; i < validate.data.purchasedItems.length; i++) {
            if (productIds.includes(validate.data.purchasedItems[i].productId)) {
              s.sendJsonResponse(res, 400, { status: "failed" });
              return;
            }
          }
        }

        s.sendJsonResponse(res, 201, {
          purchaseId: "abc123def",
          purchaseItems: [
            {
                productId: "xyz789",
                name: "",
                category: "",
                qty: 1,
                price: 100,
                sku: "",
                fileId: "file789xyz",
                fileUri: "1618x8068",
                fileThumbnailUri: "",
                createdAt: "",
                updatedAt: ""
            }
          ],
          totalPrice: 1,
          paymentDetails: [
            {
                bankAccountName: "",
                bankAccountHolder: "",
                bankAccountNumber: "",
                totalPrice: 1
            }
          ]
        });
      } else {
        s.sendJsonResponse(res, 400, { status: "failed" });
      }

    return;
  } catch (error) {
    s.sendJsonResponse(res, 500, { status: "failed" });
  }
});

/** @type {string[]} */
s.addRoute("POST", "/v1/purchase/:purchaseId", async (req, res) => {
  try {
    const body = await s.getRequestBody(req);
    const validate = purchaseIdPostSchema.safeParse(body);
      
    if (validate.success) {
        if (body.fileId.length < 3 || body.fileId.length > 3) {
          s.sendJsonResponse(res, 400, { status: "failed" });  
        }
        s.sendJsonResponse(res, 201, {});
      } else {
        s.sendJsonResponse(res, 400, { status: "failed" });
      }

    return;
  } catch (error) {
    s.sendJsonResponse(res, 500, { status: "failed" });
  }
});

test("Purchase Scenario", async (go) => {
  let serverPort = 0;
  go.before(async () => {
    serverPort = await s.start();
  });
  go.after(() => {
    s.stop();
  });
  
  go.test("PostPurchaseScenario should return 0 exit code", async () => {
    await assert.doesNotReject(
      exec(`${process.env.K6_PATH} run src/main.js`, {
        env: {
          BASE_URL: `http://127.0.0.1:${serverPort}`,
          MOCK_INFO: '',
          RUN_UNIT_TEST: "true",
          SCENARIO_NAME: "PostPurchaseScenario",
        },
      }),
      console.error,
    );
  });

  go.test("PostPurchaseIdScenario should return 0 exit code", async () => {
    await assert.doesNotReject(
      exec(`${process.env.K6_PATH} run src/main.js`, {
        env: {
          BASE_URL: `http://127.0.0.1:${serverPort}`,
          MOCK_INFO: '',
          RUN_UNIT_TEST: "true",
          SCENARIO_NAME: "PostPurchaseIdScenario",
        },
      }),
      console.error,
    );
  });

});
