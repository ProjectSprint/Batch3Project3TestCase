import { combine } from "../helper/generator.js";
import { createValidator } from "../helper/typeAssertion.js";
import fileSchema from '../schemas/File.schema.json'

const isFileValidator = createValidator(fileSchema)

/**
 * @param {import("k6").JSONValue} value
 * @returns {value is import("src/entity/types.js").UploadedFile}
 */
export function isFile(value) {
  // Basic checks for object and required fields
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  /** @type {import("k6").JSONObject} */
  const obj = value;
  return isFileValidator(obj)
}

/**
 * @param {import('src/types/schema.js').RequestAssertResponse<any>} res
 * @param {any} positivePayload
 * @param {string} featureName
 * @returns {import("src/entity/types.js").UploadedFile | undefined}
 */
export function getFile(res, positivePayload, featureName) {
  if (res.isSuccess) {
    try {
      const jsonResult = res.res.json();
      if (jsonResult && isFile(jsonResult)) {
        return combine(jsonResult, positivePayload)
      }
      console.log(featureName + " | assert returns true but assertion failed, please check schema", jsonResult)
    } catch (e) {
      console.log(featureName + " | assert returns true but failed to parse json", e)
    }
  }
}
