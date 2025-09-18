import { file, get } from "k6/http";
import {
  testGetAssert,
  testPostJsonAssert,
  testPostMultipartAssert,
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
import { getFile } from "../assertion/fileAssertion.js";

/** @type {string[]} */
const validFileId = ["file1", "file2", "file3"];

/**
 * @type {import("../types/scenario.js").Scenario<import("../entity/app.js").Product | undefined>}
 */
export function PostProductScenario(config, tags, info) {
  const featureName = "Post Product";
  const route = config.baseUrl + "/v1/product";
  const routeFile = config.baseUrl + "/v1/file";
  const assertHandler = testPostJsonAssert;
  const multipartHandler = testPostMultipartAssert;

  const user = info.user;
  const fileToTest = info.file;
  if (!isUser(user)) {
    console.warn(`${featureName} needs a valid user or file`);
    return undefined;
  }

  const positiveHeader = {
    Authorization: `Bearer ${user.token}`
  }

  const positivePayload1 = {
    name: generateRandomName(),
    category: "Food",
    qty: 1,
    price: 100,
    sku: `sku${generateRandomNumber(10000,99999)}`,
    // added later when ready to test positive payload
    fileId: "", 
    fileUri: "",
    fileThumbnailUri: "",
  };
  
  const positivePayload2 = clone(positivePayload1);
  positivePayload2.sku = `sku${generateRandomNumber(10000,99999)}`;
  positivePayload2.category = "Beverage";
  const positivePayload3 = clone(positivePayload1);
  positivePayload3.sku = `sku${generateRandomNumber(10000,99999)}`;
  positivePayload3.category = "Clothes";
  const positivePayload4 = clone(positivePayload1);
  positivePayload4.sku = `sku${generateRandomNumber(10000,99999)}`;
  positivePayload4.category = "Furniture";
  const positivePayload5 = clone(positivePayload1);
  positivePayload5.sku = `sku${generateRandomNumber(10000,99999)}`;
  positivePayload5.category = "Tools";
  const negativePayload = clone(positivePayload1);
  negativePayload.sku = `sku${generateRandomNumber(10000,99999)}`;
  negativePayload.category = "WrongCategory";
  negativePayload.fileId = "notexist_id";
  const conflictPayload = clone(positivePayload1);

  
  let positivePayloads = [positivePayload1, positivePayload2, positivePayload3, positivePayload4, positivePayload5];
  if (config.runNegativeCase) {
    // Test with invalid Authorization headers
    const negativeHeaders = [
      { Authorization: `${user.token}` }, // Missing Bearer prefix
      { Authorization: `Bearer asdf${user.token}` }, // Invalid token
      { Authorization: `Bearer ` }, // Empty token
      { Authorization: `` }, // Empty header value
    ];

    assertHandler({
      currentTestName: "no token",
      featureName: featureName,
      route: route,
      body: positivePayload1,
      headers: {},
      expectedCase: {
        ["should return 401"]: (_parsed, res) => res.status === 401,
      },
      options: [],
      config: config,
      tags: {},
    });
    negativeHeaders.forEach((header, index) => {
      assertHandler({
        currentTestName: `invalid token ${index}`,
        featureName: featureName,
        route: route,
        body: positivePayload1,
        headers: header,
        expectedCase: {
          ["should return 401"]: (_parsed, res) => res.status === 401,
        },
        options: [],
        config: config,
        tags: {},
      });
    });
    assertHandler({
      currentTestName: "empty body",
      featureName: featureName,
      route: route,
      body: {},
      headers: positiveHeader,
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
      headers: positiveHeader,
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
      headers: positiveHeader,
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
        headers: positiveHeader,
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
      // Challenge: to Post a product is to post file. Every. Time
      // TODO: upload file first
      const fileToUpload = {
        file: file(fileToTest.small, `file_${generateRandomNumber(0, 4_294_967_295)}.jpg`),
      }

      // TODO: fetch uploaded file
      const fileResult = multipartHandler({
        currentTestName: "upload file",
        featureName: featureName,
        route: routeFile,
        body: fileToUpload,
        headers: positiveHeader,
        expectedCase: {},
        options: [],
        config: config,
        tags: {},
      });

      // TODO: assign to positive payload
      if (fileResult.isSuccess) {
        const file = getFile(fileResult.res, {}, featureName);
        payload.fileId = file.fileId;
        payload.fileUri = file.fileUri;
        payload.fileThumbnailUri = file.fileThumbnailUri;
      }

      return assertHandler({
        currentTestName: "valid payload",
        featureName: featureName,
        route: route,
        body: payload,
        headers: positiveHeader,
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
    
    // TODO: test conflict payload
    if (config.runNegativeCase) {
      const fileToUpload = {
        file: file(fileToTest.small, `file_${generateRandomNumber(0, 4_294_967_295)}.jpg`),
      }
      const fileResult = multipartHandler({
        currentTestName: "upload file",
        featureName: featureName,
        route: routeFile,
        body: fileToUpload,
        headers: positiveHeader,
        expectedCase: {},
        options: [],
        config: config,
        tags: {},
      });

      // TODO: assign to positive payload
      if (fileResult.isSuccess) {
        const file = getFile(fileResult.res, {}, featureName);
        conflictPayload.fileId = file.fileId;
        conflictPayload.fileUri = file.fileUri;
        conflictPayload.fileThumbnailUri = file.fileThumbnailUri;
      }

      assertHandler({
        currentTestName: "conflict product",
        featureName: featureName,
        route: route,
        body: conflictPayload,
        headers: positiveHeader,
        expectedCase: {
            ["should return 409"]: (_parsed, res) => res.status === 409,
          },
          options: [],
          config: config,
          tags: {},
        });
    }

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
  
  // Generate the important metric
  const cheapestPrice = 1_000;
  const expensivePrice = 5_042_690;
  const cheapest = {
    name: generateRandomName(),
    category: "Food",
    qty: 1_000,
    price: cheapestPrice,
    sku: `sku${generateRandomNumber(10000,99999)}`,
    // added later when ready to test positive payload
    fileId: "", 
    fileUri: "",
    fileThumbnailUri: "",
  };
  const expensive = {
    name: generateRandomName(),
    category: "Furniture",
    qty: 2,
    price: expensivePrice,
    sku: `sku${generateRandomNumber(10000,99999)}`,
    // added later when ready to test positive payload
    fileId: "", 
    fileUri: "",
    fileThumbnailUri: "",
  }
  const positivePayload2 = clone(positivePayload1);
  positivePayload2.sku = `sku${generateRandomNumber(10000,99999)}`;
  positivePayload2.category = "Beverage";
  const positivePayload3 = clone(positivePayload1);
  positivePayload3.sku = `sku${generateRandomNumber(10000,99999)}`;
  positivePayload3.category = "Clothes";
  const positivePayload4 = clone(positivePayload1);
  positivePayload4.sku = `sku${generateRandomNumber(10000,99999)}`;
  positivePayload4.category = "Furniture";
  const positivePayload5 = clone(positivePayload1);
  positivePayload5.sku = `sku${generateRandomNumber(10000,99999)}`;
  positivePayload5.category = "Tools";

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
  const route = config.baseUrl + "/v1/product/:productId";
  const assertHandler = testPutJsonAssert;
  const user = info.user;
  if (!isUser(user)) {
    console.warn(`${featureName} needs a valid user or file`);
    return undefined;
  }

  // akses objek produk via k6
  const mockProduct = info.product;
  if (!isProduct(mockProduct)) {
    console.warn(`${featureName} needs a valid product`);
    return undefined;
  }

  console.log("mockProduct", mockProduct);  
  // dari sini sudah bisa pakai mockProduct
  
  const positivePayload1 = {
    productId: mockProduct.productId,
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
  const negativePayload2 = clone(positivePayload1);
  negativePayload2.productId = "idSalah0123";
  
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
    assertHandler({
      currentTestName: "productId is not exist",
      featureName: featureName,
      route: route,
      body: negativePayload2,
      headers: { Authorization: user.token },
      expectedCase: {
        ["should return 404"]: (_parsed, res) => res.status === 404,
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
          ["should return 200"]: (_parsed, res) => res.status === 200,
          
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
 * @type {import("src/types/scenario.js").Scenario<import("src/entity/app.js").Product | undefined>}
 */
export function DeleteProductScenario(config, tags, info) {
  const featureName = "Delete Product";
  const route = config.baseUrl + "/v1/product/:productId";
  const assertHandler = testPutJsonAssert;
  const user = info.user;
  if (!isUser(user)) {
    console.warn(`${featureName} needs a valid user or file`);
    return undefined;
  }

  // akses objek produk via k6
  const mockProduct = info.product;
  if (!isProduct(mockProduct)) {
    console.warn(`${featureName} needs a valid product`);
    return undefined;
  }
  // dari sini sudah bisa pakai mockProduct
  
  const positivePayload1 = {
    productId: mockProduct.productId,
    name: generateRandomName(),
    category: "Food",
    qty: 1,
    price: 100,
    sku: "sku12345",
    fileId: validFileId[generateRandomNumber(0, validFileId.length - 1)],
    fileUri: "file1.jpeg",
    fileThumbnailUri: "tmb_file1.jpeg",
  };
  
  const negativePayload = clone(positivePayload1);
  negativePayload.productId = "idSalah0123";
  
  let positivePayloads = [positivePayload1];
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
      currentTestName: "productId is not exist",
      featureName: featureName,
      route: route,
      body: negativePayload,
      headers: { Authorization: user.token },
      expectedCase: {
        ["should return 404"]: (_parsed, res) => res.status === 404,
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
          ["should return 200"]: (_parsed, res) => res.status === 200,
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