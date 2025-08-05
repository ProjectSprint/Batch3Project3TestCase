import {
  testPostJsonAssert,
} from "../helper/testRequest.js";
import { getUser, isUser } from "../assertion/userAssertion.js";
import {
  clone,
  generateRandomName,
  generateRandomNumber,
  generateRandomWord,
  generateTestObjects,
} from "../helper/generator.js";
import { isExists } from "../helper/assertion.js";
import { getProduct } from "../assertion/productAssertion.js";

const fileIds = ["file123", "oka955"]
/**
 * @type {import("src/types/scenario.js").Scenario<import("src/entity/app.js").Product | undefined>}
 */
export function PostProductScenario(config, tags, info) {
  const featureName = "Post Product";
  const route = config.baseUrl + "/v1/product";

  console.log("route==", route)
  
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
      sku: generateRandomWord(0, 32),
      fileId: fileIds[generateRandomNumber(0,1)]
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
            notNull: false,
            min: 1
          },
          price: {
            type: "number",
            notNull: false,
            min: 100
          },
          sku: {
            type: "string",
            notNull: false,
            minLength: 0,
            maxLength: 32
          },
          fileId: {
            type: "string",
            notNull: false
          }
        },
        positivePayload1,
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
        `${featureName} | Skipping getUser due to failed login assertions.`,
      );
      return undefined;
    }
}