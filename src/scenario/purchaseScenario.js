import {
  testGetAssert,
  testPatchJsonAssert,
  testPostJsonAssert,
  testPutJsonAssert,
} from "../helper/testRequest.js";
import { getUser, isUser } from "../assertion/userAssertion.js";
import {
  combine,
  clone,
  generateRandomEmail,
  generateRandomName,
  generateRandomPhoneNumber,
  generateTestObjects,
  generateRandomWord,
  generateRandomNumber,
} from "../helper/generator.js";
import { isEqual, isEqualWith, isExists } from "../helper/assertion.js";
import { getPurchaseRequest, getPurchaseResponse } from "../assertion/purchaseAssertion.js";

const productIds = ["1", "2", "3", "4"]
/**
 * @type {import("src/types/scenario.js").Scenario<import("src/entity/app.js").PurchaseResponse | undefined>}
 */
export function PostPurchaseScenario(config, tags, info) {
  const featureName = "Post Purchase";
  const route = config.baseUrl + "/v1/purchase";
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    purchasedItems: [ 
        {
          productId: "1",
          qty: generateRandomNumber(0,3)
        },
        {
          productId: "3",
          qty: generateRandomNumber(0,3)
        },
    ],
    senderName: generateRandomName(),
    senderContactType: "phone",
    senderContactDetail: generateRandomPhoneNumber(true),
  };
  const positivePayload2 = clone(positivePayload);
  positivePayload2.senderContactType = "email";
  positivePayload2.senderContactDetail = generateRandomEmail();

  let positivePayloads = [positivePayload, positivePayload2];

  if (config.runNegativeCase) {
    assertHandler({
      currentTestName: "empty body",
      featureName: featureName,
      route: route,
      body: {},
      headers: {},
      expectedCase: {
        ["should return 400"]: (_parsed, res) => res.status === 400,
      },
      options: [],
      config: config,
      tags: {},
    });

    let notValidProductId = clone(positivePayload)
    notValidProductId.purchasedItems[0].productId = "abc123";
    notValidProductId.purchasedItems[1].productId = "kzg980";

    assertHandler({
      currentTestName: "product id not valid",
      featureName: featureName,
      route: route,
      body: notValidProductId,
      headers: {},
      expectedCase: {
        ["should return 400"]: (_parsed, res) => res.status === 400,
      },
      options: [],
      config: config,
      tags: {},
    });

    const testObjects = generateTestObjects(
      {
        purchasedItems: {
          type: "array",
          notNull: false,
          properties: {
            productId: {
                type: "string",
                notNull: false
            },
            qty: {
                type: "number",
                notNull: false,
                min: 2
            }
          },
          min: 1
        },
        senderName: {
            type: "string",
            notNull: false,
            minLength: 4,
            maxLength: 55
        },
        senderContactType: {
            type: "string",
            notNull: false,
            enum: ["email", "phone"]
        },
        senderContactDetail: {
            type: "string",
            notNull: false,
        },
      },
      positivePayload,
    );

    testObjects.forEach((payload) => {
      assertHandler({
        currentTestName: "invalid payload",
        featureName: featureName,
        route: route,
        body: payload,
        headers: {},
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
      headers: {},
      expectedCase: {
        ["should return 201"]: (_parsed, res) => res.status === 201,
        ["should return purchaseId"]: (parsed, _res) => isExists(parsed, "purchaseId", ["string", "number"]),
        ["should return purchaseItems"]: (parsed, _res) => isExists(parsed, "purchaseItems", ["array"]),
  
        ["should return productId"]: (parsed, _res) => isExists(parsed, "purchaseItems[].productId", ["string", "number"]),
        ["should return productName"]: (parsed, _res) => isExists(parsed, "purchaseItems[].name", ["string"]),
        ["should return productCategory"]: (parsed, _res) => isExists(parsed, "purchaseItems[].category", ["string"]),
        ["should return productQty"]: (parsed, _res) => isExists(parsed, "purchaseItems[].qty", ["number"]),
        ["should return productPrice"]: (parsed, _res) => isExists(parsed, "purchaseItems[].price", ["number"]),
        ["should return productSku"]: (parsed, _res) => isExists(parsed, "purchaseItems[].sku", ["string"]),
        ["should return productFileId"]: (parsed, _res) => isExists(parsed, "purchaseItems[].fileId", ["string"]),
        ["should return productFileThumbnailUri"]: (parsed, _res) => isExists(parsed, "purchaseItems[].fileThumbnailUri", ["string"]),
        ["should return productCreatedAt"]: (parsed, _res) => isExists(parsed, "purchaseItems[].createdAt", ["string"]),
        ["should return productUpdatedAt"]: (parsed, _res) => isExists(parsed, "purchaseItems[].updatedAt", ["string"]),
  
        ["should return totalPrice"]: (parsed, _res) => isExists(parsed, "totalPrice", ["number"]),
  
        ["should return paymentDetails"]: (parsed, _res) => isExists(parsed, "paymentDetails", ["array"]),
        ["should return bankAccountName"]: (parsed, _res) => isExists(parsed, "paymentDetails[].bankAccountName", ["string"]),
        ["should return bankAccountHolder"]: (parsed, _res) => isExists(parsed, "paymentDetails[].bankAccountHolder", ["string"]),
        ["should return bankAccountNumber"]: (parsed, _res) => isExists(parsed, "paymentDetails[].bankAccountNumber", ["string"]),
        ["should return paymentDetails.totalPrice"]: (parsed, _res) => isExists(parsed, "paymentDetails[].totalPrice", ["number"]),
      },
      options: [],
      config: config,
      tags: {},
    });
  })
  
  console.log("positiveResults=====", positiveResults)

  if (positiveResults.every((result) => {return result.isSuccess})) {
    return getPurchaseResponse(positiveResults[0].res, {}, featureName);
  } else {
    console.warn(
      `${featureName} | Skipping getPurchaseResponse due to failed post assertions.`,
    );
    return undefined;
  }
}

const fileIds = ["file123", "oka955"]
/**
 * @type {import("src/types/scenario.js").Scenario<import("src/entity/app.js").PurchaseResponse | undefined>}
 */
export function PostPurchaseIdScenario(config, tags, info) {
  const featureName = "Post Purchase Id";
  const route = config.baseUrl + "/v1/purchase/:purchaseId";
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    fileIds: [ 
        fileIds[generateRandomNumber(0,1)],
        fileIds[generateRandomNumber(0,1)],
        fileIds[generateRandomNumber(0,1)]
    ]
  };

  if (config.runNegativeCase) {
    assertHandler({
      currentTestName: "empty body",
      featureName: featureName,
      route: route,
      body: {},
      headers: {},
      expectedCase: {
        ["should return 400"]: (_parsed, res) => res.status === 400,
      },
      options: [],
      config: config,
      tags: {},
    });

    const testObjects = generateTestObjects(
      {
        purchasedItems: {
          type: "array",
          notNull: false,
          min: 1
        }
      },
      positivePayload,
    );

    testObjects.forEach((payload) => {
      assertHandler({
        currentTestName: "invalid payload",
        featureName: featureName,
        route: route,
        body: payload,
        headers: {},
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
  const positiveResult = assertHandler({
    currentTestName: "valid payload",
    featureName: featureName,
    route: route,
    body: positivePayload,
    headers: {},
    expectedCase: {
      ["should return 201"]: (_parsed, res) => res.status === 201
    },
    options: [],
    config: config,
    tags: {},
  });

  if (positiveResult.isSuccess) {
    return getPurchaseResponse(positiveResult.res, {}, featureName);
  } else {
    console.warn(
      `${featureName} | Skipping getPurchaseResponse due to failed assertions.`,
    );
    return undefined;
  }
}