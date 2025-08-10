import test from "node:test";
import { z } from "zod";
import TestServer from "../test/testServer.node.js";

import { promisify } from "node:util";
import child_process from "node:child_process";
import assert from "node:assert";
const exec = promisify(child_process.exec);

const postSchema = z.object({
  name: z.string(),
  category: z.string(),
  qty: z.number(),
  price: z.number(),
  sku: z.string(),
  fileId: z.string()
});

const putSchema = z.object({
  productId: z.string(),
  name: z.string(),
  category: z.string(),
  qty: z.number(),
  price: z.number(),
  sku: z.string(),
  fileId: z.string(),
  fileUri: z.string(),
  fileThumbnailUri: z.string(),
});

const deleteSchema = z.object({
  productId: z.string(),
});

const s = new TestServer({});

/** @type {string[]} */
const validFileId = ["file1", "file2", "file3"];

/** @type {string[]} */
const availableProduct = ["prd0123"];

/** @type {string[]} */
s.addRoute("POST", "/v1/product", async (req, res) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) 
    {
      const body = await s.getRequestBody(req);
      const validate = postSchema.safeParse(body);

      if (validate.success) {
        if (validFileId.includes(validate.data.fileId) === false) {
          s.sendJsonResponse(res, 400, { status: "failed" });
          return;
        }

        s.sendJsonResponse(res, 201, {
          productId: "prd0123",
          name: body.name,
          category: body.category,
          qty: body.qty,
          price: body.price,
          sku: body.sku,
          fileId: body.fileId,
          fileUri: body.fileUri,
          fileThumbnailUri: body.fileThumbnailUri,
          createdAt: "a",
          updatedAt: "b"
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

/** @type {string[]} */
s.addRoute("PUT", "/v1/product/:productId", async (req, res) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const body = await s.getRequestBody(req);
      const validate = putSchema.safeParse(body);
      if (validate.success) {
        if (validFileId.includes(validate.data.fileId) === false) {
          s.sendJsonResponse(res, 400, { status: "failed" });
          return;
        }
        
        if (!availableProduct.includes(validate.data.productId)) {
          s.sendJsonResponse(res, 404, { status: "failed" });
          return;
        }

        s.sendJsonResponse(res, 200, {
          productId: "prd0123",
          name: validate.data.name,
          category: validate.data.category,
          qty: validate.data.qty,
          price: validate.data.price,
          sku: validate.data.sku,
          fileId: validate.data.fileId,
          fileUri: validate.data.fileUri,
          fileThumbnailUri: validate.data.fileThumbnailUri,
          createdAt: "a",
          updatedAt: "b"
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

/** @type {string[]} */
s.addRoute("GET", "/v1/product", async (req, res) => {
  try {
    s.sendJsonResponse(res, 200, 
        [
          {
            productId: "prd0123",
            name: "sambalado",
            category: "Food",
            qty: 1,
            price: 100,
            sku: "FD1100",
            fileId: "file123",
            fileUri: "file123",
            fileThumbnailUri: "",
            createdAt: "a",
            updatedAt: "b"
          },
          {
            productId: "prd0124",
            name: "cap-cin-cai",
            category: "Food",
            qty: 1,
            price: 100,
            sku: "FD1101",
            fileId: "file124",
            fileUri: "file124",
            fileThumbnailUri: "",
            createdAt: "g",
            updatedAt: "c"
          },
        ]
      );

    return;
  } catch (error) {
    s.sendJsonResponse(res, 500, { status: "failed" });
  }
});

/** @type {string[]} */
const registerdEmail = [];
s.addRoute("DELETE", "/v1/product/:productId", async (req, res) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const body = await s.getRequestBody(req);
      const validate = deleteSchema.safeParse(body);
      if (validate.success) {
        if (!availableProduct.includes(validate.data.productId)) {
          s.sendJsonResponse(res, 404, { status: "failed" });
          return;
        }

        s.sendJsonResponse(res, 200, {});
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
        password: "asraf123",
        token: "Bearer asraf123",
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

  go.test("GetProductScenario should return 0 exit code", async () => {
    const info = {
      user: {
        email: "asdf@adf.com",
        phone: "+45646464",
        password: "asraf123",
        token: "Bearer asraf123",
      },
    };
    await assert.doesNotReject(
      exec(`${process.env.K6_PATH} run src/main.js`, {
        env: {
          BASE_URL: `http://127.0.0.1:${serverPort}`,
          MOCK_INFO: `${JSON.stringify(info)}`,
          RUN_UNIT_TEST: "true",
          SCENARIO_NAME: "GetProductScenario",
        },
      }),
      console.error,
    );
  });

  go.test("PutProductScenario should return 0 exit code", async () => {
    const info = {
      product: {
        productId: "prd0123",
        name: "sambalado",
        category: "Food",
        qty: 1,
        price: 100,
        sku: "FD1100",
        fileId: "file123",
        fileUri: "file123",
        fileThumbnailUri: "",
        createdAt: "a",
        updatedAt: "b",
      },
      user: {
        email: "asdf@adf.com",
        phone: "+45646464",
        password: "asraf123",
        token: "Bearer asraf123",
      },
    };
    await assert.doesNotReject(
      exec(`${process.env.K6_PATH} run src/main.js`, {
        env: {
          BASE_URL: `http://127.0.0.1:${serverPort}`,
          MOCK_INFO: `${JSON.stringify(info)}`,
          RUN_UNIT_TEST: "true",
          SCENARIO_NAME: "PutProductScenario",
        },
      }),
      console.error,
    );
  });

  go.test("DeleteProductScenario should return 0 exit code", async () => {
    const info = {
      product: {
        productId: "prd0123",
        name: "sambalado",
        category: "Food",
        qty: 1,
        price: 100,
        sku: "FD1100",
        fileId: "file123",
        fileUri: "file123",
        fileThumbnailUri: "",
        createdAt: "a",
        updatedAt: "b",
      },
      user: {
        email: "asdf@adf.com",
        phone: "+45646464",
        password: "asraf123",
        token: "Bearer asraf123",
      },
    };
    await assert.doesNotReject(
      exec(`${process.env.K6_PATH} run src/main.js`, {
        env: {
          BASE_URL: `http://127.0.0.1:${serverPort}`,
          MOCK_INFO: `${JSON.stringify(info)}`,
          RUN_UNIT_TEST: "true",
          SCENARIO_NAME: "DeleteProductScenario",
        },
      }),
      console.error,
    );
  });

});
