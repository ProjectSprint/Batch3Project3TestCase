import { combine } from "../helper/generator.js";
import { createValidator } from "../helper/typeAssertion.js";

const productSchema = open("../schemas/product.schema.json");
const isValid = createValidator(productSchema);

/**
 * Asserts that a value is a valid User object
 * @param {any} value - The value to assert
 * @returns {value is import("src/entity/app.js").Product}
 * @throws {import("src/types/typeAssertion.js").ValidationError[]}
 */
export function isProduct(value) {
  const obj = value;
  const res = isValid(obj);
  if (res.valid) {
    return true;
  }
  throw res.errors;
}

/**
 * @param {import("k6/http").RefinedResponse<any>} res
 * @param {any} positivePayload
 * @param {string} featureName
 * @returns {import('src/entity/app.js').Product | undefined}
 */
export function getProduct(res, positivePayload, featureName) {
  let obj;
  try {
    const jsonResult = res.json();
    if (jsonResult && typeof jsonResult == "object") {
      obj = combine(jsonResult, positivePayload);
      console.log("obj", obj)
      if (isProduct(obj)) {
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
