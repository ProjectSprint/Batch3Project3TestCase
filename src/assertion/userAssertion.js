import { combine } from "../helper/generator.js";
import { createValidator } from "../helper/typeAssertion.js";

const userSchema = open("../schemas/user.schema.json");
const isUserValidator = createValidator(userSchema);

/**
 * Asserts that a value is a valid User object
 * @param {any} value - The value to assert
 * @returns {value is import("src/entity/app.js").User}
 */
export function isUser(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  /** @type {import("k6").JSONObject} */
  const obj = value;
  return isUserValidator(obj);
}

/**
 * @param {import('src/types/testRequest.js').RequestAssertResponse<any>} res
 * @param {any} positivePayload
 * @param {string} featureName
 * @returns {import('src/entity/app.js').User | undefined}
 */
export function getUser(res, positivePayload, featureName) {
  if (res.isSuccess) {
    try {
      const jsonResult = res.res.json();
      if (jsonResult && isUser(jsonResult)) {
        return combine(jsonResult, positivePayload);
      }
      console.log(
        featureName +
          " | assert returns true but assertion failed, please check schema",
        jsonResult,
      );
    } catch (e) {
      console.log(
        featureName + " | assert returns true but failed to parse json",
        e,
      );
    }
  }
}
