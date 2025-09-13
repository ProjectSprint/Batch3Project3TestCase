import { combine } from "../helper/generator.js";
import { createValidator } from "../helper/typeAssertion.js";

<<<<<<< HEAD:src/assertion/purchaseAssertion.js
const purchaseRequestSchema = open("../schemas/PurchaseRequest.schema.json");
const purchaseSchema = open("../schemas/purchase.schema.json");
=======
const purchaseRequestSchema = open("./schemas/PurchaseRequest.schema.json");
const purchaseSchema = open("./schemas/purchase.schema.json");
>>>>>>> main:test/assertion/purchaseAssertion.js

const isValid = createValidator(purchaseRequestSchema);
const isResponseValid = createValidator(purchaseSchema);

/**
 * Asserts that a value is a valid User object
 * @param {any} value - The value to assert
<<<<<<< HEAD:src/assertion/purchaseAssertion.js
 * @returns {value is import("src/entity/app.js").PurchaseRequest}
 * @throws {import("src/types/typeAssertion.js").ValidationError[]}
=======
 * @returns {value is import("../entity/app.js").PurchaseRequest}
 * @throws {import("test/types/typeAssertion.js").ValidationError[]}
>>>>>>> main:test/assertion/purchaseAssertion.js
 */
export function isPurchaseRequest(value) {
  const obj = value;
  const res = isValid(obj);
  if (res.valid) {
    return true;
  }
  throw res.errors;
}

/**
 * Asserts that a value is a valid User object
 * @param {any} value - The value to assert
<<<<<<< HEAD:src/assertion/purchaseAssertion.js
 * @returns {value is import("src/entity/app.js").PurchaseResponse}
 * @throws {import("src/types/typeAssertion.js").ValidationError[]}
=======
 * @returns {value is import("../entity/app.js").PurchaseResponse}
 * @throws {import("test/types/typeAssertion.js").ValidationError[]}
>>>>>>> main:test/assertion/purchaseAssertion.js
 */
export function isPurchaseResponse(value) {
  const obj = value;
  const res = isResponseValid(obj);
  if (res.valid) {
    return true;
  }
  throw res.errors;
}

/**
 * @param {import("k6/http").RefinedResponse<any>} res
 * @param {any} positivePayload
 * @param {string} featureName
<<<<<<< HEAD:src/assertion/purchaseAssertion.js
 * @returns {import('src/entity/app.js').PurchaseRequest | undefined}
=======
 * @returns {import('../entity/app.js').PurchaseRequest | undefined}
>>>>>>> main:test/assertion/purchaseAssertion.js
 */
export function getPurchaseRequest(res, positivePayload, featureName) {
  let obj;
  try {
    const jsonResult = res.json();
    if (jsonResult && typeof jsonResult == "object") {
      obj = combine(jsonResult, positivePayload);
      if (isPurchaseRequest(obj)) {
        return obj;
      }
      console.log(featureName + " | object is not matching schema", obj);
      return;
    }
    console.log(featureName + " | json is not object", jsonResult);
    return;
  } catch (e) {
    console.log(featureName + " | json or validation error:", e, "body:", obj);
    return;
  }
}

/**
 * @param {import("k6/http").RefinedResponse<any>} res
 * @param {any} positivePayload
 * @param {string} featureName
<<<<<<< HEAD:src/assertion/purchaseAssertion.js
 * @returns {import('src/entity/app.js').PurchaseResponse | undefined}
=======
 * @returns {import('../entity/app.js').PurchaseResponse | undefined}
>>>>>>> main:test/assertion/purchaseAssertion.js
 */
export function getPurchaseResponse(res, positivePayload, featureName) {
  let obj;
  try {
    const jsonResult = res.json();
    if (jsonResult && typeof jsonResult == "object") {
      obj = combine(jsonResult, positivePayload);
      if (isPurchaseResponse(obj)) {
        return obj;
      }
      console.log(featureName + " | object is not matching schema", obj);
      return;
    }
    console.log(featureName + " | json is not object", jsonResult);
    return;
  } catch (e) {
    console.log(featureName + " | json or validation error:", e, "body:", obj);
    return;
  }
<<<<<<< HEAD:src/assertion/purchaseAssertion.js
}
=======
}
>>>>>>> main:test/assertion/purchaseAssertion.js
