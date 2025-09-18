import { combine } from "../helper/generator.js";
import { createValidator } from "../helper/typeAssertion.js";

const userSchema = open("./schemas/user.schema.json");
const isValid = createValidator(userSchema);

/**
 * Asserts that a value is a valid User object
 * @param {any} value - The value to assert
 * @returns {value is import("../entity/app.js").User}
 * @throws {import("test/types/typeAssertion.js").ValidationError[]}
 */
export function isUser(value) {
	const obj = value;
	const res = isValid(obj);
	if (res.valid) {
		return true;
	}
	return false;
}

/**
 * @param {import("k6/http").RefinedResponse<any>} res
 * @param {any} positivePayload
 * @param {string} featureName
 * @returns {import('../entity/app.js').User | undefined}
 */
export function getUser(res, positivePayload, featureName) {
	let obj;
	try {
		const jsonResult = res.json();
		if (jsonResult && typeof jsonResult == "object") {
			obj = combine(jsonResult, positivePayload);
			if (isUser(obj)) {
				return obj;
			}
			console.warn(featureName + " | object is not matching schema", obj);
			return;
		}
		console.warn(featureName + " | json is not object", jsonResult);
		return;
	} catch (e) {
		console.warn(featureName + " | json or validation error:", e, "body:", obj);
		return;
	}
}
