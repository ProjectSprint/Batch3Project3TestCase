import { combine } from "../helper/generator.js";
import { object, string, validate } from "../helper/typeAssertion.js";

// UserFile schema
export const UserFileSchema = object(
	{
		email: string(),
		phone: string(),
		fileId: string(),
		fileUri: string(),
		fileThumbnailUri: string(),
		bankAccountName: string(),
		bankAccountHolder: string(),
		bankAccountNumber: string(),
	},
	{
		required: [
			"email",
			"phone",
			"fileId",
			"fileUri",
			"fileThumbnailUri",
			"bankAccountName",
			"bankAccountHolder",
			"bankAccountNumber",
		],
		additionalProperties: false,
	},
);

/**
 * Asserts that a value is a valid UserFile object
 * @param {unknown} value - The value to assert
 * @returns {value is import("../entity/app.js").Profile}
 * @throws {import("test/types/typeAssertion.js").ValidationError[]}
 */
export function isProfile(value) {
	const obj = value;
	const res = validate(UserFileSchema, obj);
	if (!res.length) {
		return true;
	}
	throw res;
}

/**
 * Extracts a UserFile object from a k6 HTTP response
 * @param {import("k6/http").RefinedResponse<any>} res
 * @param {any} positivePayload
 * @param {string} featureName
 * @returns {import("../entity/app.js").Profile | undefined}
 */
export function getProfile(res, positivePayload, featureName) {
	let obj;
	try {
		const jsonResult = res.json();
		if (jsonResult && typeof jsonResult === "object") {
			obj = combine(jsonResult, positivePayload);
			if (isProfile(obj)) {
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
