import {
  testGetAssert,
  testPostJsonAssert,
  testPutJsonAssert,
} from "../helper/testRequest.js";
import { getUser, isUser } from "../assertion/userAssertion.js";
import {
  clone,
  generateRandomName,
  generateRandomNumber,
  generateRandomWord,
  generateTestObjects,
} from "../helper/generator.js";
import { isExists, isEqualWith } from "../helper/assertion.js";
import { getProduct, getProducts, isProduct } from "../assertion/productAssertion.js";

/** @type {string[]} */
const validFileId = ["file1", "file2", "file3"];

/**
 * @type {import("src/types/scenario.js").Scenario<import("src/entity/app.js").PostProduct | undefined>}
 */
export function PostProductScenario(config, tags, info) {
  const featureName = "Post Product";
  const route = config.baseUrl + "/v1/product";
  const assertHandler = testPostJsonAssert;
  const user = info.user;
  if (!isUser(user)) {
    console.warn(`${featureName} needs a valid user or file`);
    return undefined;
  }
  
  const positivePayload1 = {
    name: generateRandomName(),
    category: "Food",
    qty: 1,
    price: 100,
    sku: "sku12345",
    fileId: validFileId[generateRandomNumber(0, validFileId.length - 1)],
    fileUri: "file1.jpeg",
    fileThumbnailUri: "tmb_file1.jpeg",
  };
  
  const positivePayload2 = clone(positivePayload1);
  positivePayload2.category = "Beverage";
  const positivePayload3 = clone(positivePayload1);
  positivePayload3.category = "Clothes";
  const positivePayload4 = clone(positivePayload1);
  positivePayload4.category = "Furniture";
  const positivePayload5 = clone(positivePayload1);
  positivePayload5.category = "Tools";
  const negativePayload = clone(positivePayload1);
  negativePayload.category = "Electronic";
  negativePayload.fileId = "salah0123";
  
  let positivePayloads = [positivePayload1, positivePayload2, positivePayload3, positivePayload4, positivePayload5];
  if (config.runNegativeCase) {
    assertHandler({
      currentTestName: "no token",
      featureName: featureName,
      route: route,
      body: {},
      headers: {},
      expectedCase: {
        ["should return 401"]: (_parsed, res) => res.status === 401,
      },
      options: [],
      config: config,
      tags: {},
    });
    assertHandler({
      currentTestName: "empty body",
      featureName: featureName,
      route: route,
      body: {},
      headers: { Authorization: user.token },
      expectedCase: {
        ["should return 400"]: (_parsed, res) => res.status === 400,
      },
      options: [],
      config: config,
      tags: {},
    });
    assertHandler({
      currentTestName: "invalid file id",
      featureName: featureName,
      route: route,
      body: negativePayload,
      headers: { Authorization: user.token },
      expectedCase: {
        ["should return 400"]: (_parsed, res) => res.status === 400,
      },
      options: [],
      config: config,
      tags: {},
    });
    assertHandler({
      currentTestName: "invalid product category",
      featureName: featureName,
      route: route,
      body: negativePayload,
      headers: { Authorization: user.token },
      expectedCase: {
        ["should return 400"]: (_parsed, res) => res.status === 400,
      },
      options: [],
      config: config,
      tags: {},
    });
    
    const testObjects = generateTestObjects(
      {
        name: {
          type: "string",
          notNull: false,
          minLength: 4,
          maxLength: 32
        },
        category: {
          type: "string",
          notNull: false,
          enum: ["Food", "Beverage", "Clothes", "Furniture", "Tools"]
        },
        qty: {
          type: "number",
          min: 1
        },
        price: {
          type: "number",
          min: 100
        },
        sku: {
          type: "string",
          notNull: false,
          minLength: 1,
          maxLength: 32
        },
        fileId: {
          type: "string",
          notNull: false
        }
      },
      negativePayload
    );
    
    
    testObjects.forEach((payload) => {
      assertHandler({
        currentTestName: "invalid payload",
        featureName: featureName,
        route: route,
        body: payload,
        headers: { Authorization: user.token },
        expectedCase: {
            ["should return 400"]: (_parsed, res) => res.status === 400,
          },
          options: [],
          config: config,
          tags: {},
        });
      });
    }
    
    // --- Positive Case ---
    let positiveResults = positivePayloads.map((payload, _index) => {
      return assertHandler({
        currentTestName: "valid payload",
        featureName: featureName,
        route: route,
        body: payload,
        headers: { Authorization: user.token },
        expectedCase: {
          ["should return 201"]: (_parsed, res) => res.status === 201,
          
          ["productId should be string"]: (parsed, _res) => 
            isExists(parsed, "productId", ["string"]),
          ["name should be string"]: (parsed, _res) =>
            isExists(parsed, "name", ["string"]),
          ["category should be string"]: (parsed, _res) =>
            isExists(parsed, "category", ["string"]),
          ["qty should be number"]: (parsed, _res) =>
            isExists(parsed, "qty", ["number"]),
          ["price should be number"]: (parsed, _res) =>
            isExists(parsed, "price", ["number"]),
          ["sku should be number"]: (parsed, _res) =>
            isExists(parsed, "sku", ["string"]),
          
          ["fileId should be string"]: (parsed, _res) =>
            isExists(parsed, "fileId", ["string"]),
          ["fileUri should be string"]: (parsed, _res) =>
            isExists(parsed, "fileUri", ["string"]),
          ["fileThumbnailUri should be string"]: (parsed, _res) =>
            isExists(parsed, "fileThumbnailUri", ["string"]),
          
          ["createdAt should be string"]: (parsed, _res) =>
            isExists(parsed, "createdAt", ["string"]),
          ["updatedAt should be string"]: (parsed, _res) =>
            isExists(parsed, "updatedAt", ["string"])
        },
        options: [],
        config: config,
        tags: {},
      });
    });
    
    if (positiveResults.every((result) => {return result.isSuccess})) {
      return getProduct(positiveResults[0].res, {}, featureName);
    } else {
      console.warn(
        `${featureName} | Skipping getProduct due to failed assertions.`,
      );
      return undefined;
    }
}

/**
 * @type {import("src/types/scenario.js").Scenario<import("src/entity/app.js").Product[] | undefined>}
 */
export function GetProductScenario(config, tags, info) {
  const featureName = "Get Product";
  const route = config.baseUrl + "/v1/product";
  const assertHandler = testGetAssert;

  const user = info.user;
  if (!isUser(user)) {
    console.warn(`${featureName} needs a valid user`);
    return undefined;
  }

  // --- Positive Case ---
  const positiveResult = assertHandler({
    featureName: featureName,
    config: config,
    route: route,
    params: {},
    headers: { Authorization: user.token },
    currentTestName: "success get product",
    expectedCase: {
          ["should return 200"]: (_parsed, res) => res.status === 200,
          
          ["productId should be string"]: (parsed, _res) => 
            isExists(parsed, "[].productId", ["string"]),
          ["name should be string"]: (parsed, _res) =>
            isExists(parsed, "[].name", ["string"]),
          ["category should be string"]: (parsed, _res) =>
            isExists(parsed, "[].category", ["string"]),
          ["qty should be number"]: (parsed, _res) =>
            isExists(parsed, "[].qty", ["number"]),
          ["price should be number"]: (parsed, _res) =>
            isExists(parsed, "[].price", ["number"]),
          ["sku should be number"]: (parsed, _res) =>
            isExists(parsed, "[].sku", ["string"]),
          
          ["fileId should be string"]: (parsed, _res) =>
            isExists(parsed, "[]fileId", ["string"]),
          ["fileUri should be string"]: (parsed, _res) =>
            isExists(parsed, "[].fileUri", ["string"]),
          ["fileThumbnailUri should be string"]: (parsed, _res) =>
            isExists(parsed, "[].fileThumbnailUri", ["string"]),
          
          ["createdAt should be string"]: (parsed, _res) =>
            isExists(parsed, "[].createdAt", ["string"]),
          ["updatedAt should be string"]: (parsed, _res) =>
            isExists(parsed, "[].updatedAt", ["string"])
        },
    tags: {},
  });

  if (positiveResult.isSuccess) {
    console.log("positiveResult", positiveResult.res.body);
    return getProducts(positiveResult.res, {}, featureName);
  } else {
    console.warn(
        `${featureName} | Skipping getProduct due to failed assertions.`,
      );
      return undefined;
  }
}

/** @type {string[]} */
const validProductId = ["prdct001", "prdct002", "prdct003"];

/**
 * @type {import("src/types/scenario.js").Scenario<import("src/entity/app.js").Product | undefined>}
 */
export function PutProductScenario(config, tags, info) {
  const featureName = "Put Product";
  const route = config.baseUrl + "/v1/product";
  const assertHandler = testPutJsonAssert;

  const user = info.user;
  if (!isUser(user)) {
    console.warn(`${featureName} needs a valid user`);
    return undefined;
  }

  // akses objek produk via k6
  const mockProduct = info.product;
  if (!isProduct(mockProduct)) {
    console.warn(`${featureName} needs a valid product`);
    return undefined;
  }

  // dari sini sudah bisa pakai mockProduct

  if (config.runNegativeCase) {
    assertHandler({
      featureName: featureName,
      config: config,
      route: route,
      headers: {},
      body: {},
      currentTestName: "unauthorized",
      expectedCase: {
        ["should return 401"]: (_parsed, res) => res.status === 401,
        ["should return 404"]: (_parsed, res) => res.status === 404,
      },
      tags: {},
    });
  }

  // --- Positive Case ---
  const positiveResult = assertHandler({
    featureName: featureName,
    config: config,
    route: route,
    headers: { Authorization: user.token },
    body: {},
    currentTestName: "success get product",
    expectedCase: {
      ["should return 200"]: (_parsed, res) => res.status === 200,
      ["email should be string"]: (parsed, _res) =>
        isEqualWith(parsed, "email", (val) => {
          if (typeof val[0] === "string") {
            if (val[0].length === 0) return true;

            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return regex.test(val[0]);
          }
          return false;
        }),
      ["phone should be string"]: (parsed, _res) =>
        isEqualWith(parsed, "phone", (val) => {
          if (typeof val[0] === "string") {
            if (val[0].length === 0) return true;
            if (val[0][0] === "+") return true;
          }
          return false;
        }),
      ["fileId should be string"]: (parsed, _res) =>
        isExists(parsed, "fileId", ["string"]),
      ["fileUri should be string"]: (parsed, _res) =>
        isExists(parsed, "fileUri", ["string"]),
      ["fileThumbnailUri should be string"]: (parsed, _res) =>
        isExists(parsed, "fileThumbnailUri", ["string"]),
      ["bankAccountName should be string"]: (parsed, _res) =>
        isExists(parsed, "bankAccountName", ["string"]),
      ["bankAccountHolder should be string"]: (parsed, _res) =>
        isExists(parsed, "bankAccountHolder", ["string"]),
      ["bankAccountNumber should be string"]: (parsed, _res) =>
        isExists(parsed, "bankAccountNumber", ["string"]),
    },
    tags: {},
  });

  if (positiveResult.isSuccess) {
    return getProduct(positiveResult.res, {}, featureName);
  } else {
    console.warn(
        `${featureName} | Skipping getProduct due to failed assertions.`,
      );
      return undefined;
  }
}