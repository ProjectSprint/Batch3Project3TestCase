import { combine } from '../helper/generator.js';
import { createValidator } from '../helper/typeAssertion.js';
import userSchema from '../schemas/user.schema.json'

const isUserValidator = createValidator(userSchema)

/**
 * @param {import("k6").JSONValue} value
 * @returns {value is Types.User}
 */
export function isUser(value) {
  // Basic checks for object and required fields
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  /** @type {import("k6").JSONObject} */
  const obj = value;
  return isUserValidator(obj)
}

/**
 * @param {import('src/types/schema.js').RequestAssertResponse<any>} res
 * @param {any} positivePayload
 * @param {string} featureName
 * @returns {Types.User | undefined}
 */
export function getUser(res, positivePayload, featureName) {
  if (res.isSuccess) {
    try {
      const jsonResult = res.res.json();
      if (jsonResult && isUser(jsonResult)) {
        return combine(jsonResult, positivePayload)
      }
      console.log(featureName + " | assert returns true but assertion failed, please check schema", jsonResult)
    } catch (e) {
      console.log(featureName + " | assert returns true but failed to parse json", e)
    }
  }
}
