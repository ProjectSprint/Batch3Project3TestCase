import { combine } from "../helper/generator.js";

import { object, string, nullable, validate } from "../helper/typeAssertion.js"; // adjust path

export const UserSchema = object(
	{
		bankAccountHolder: string(),
		bankAccountName: string(),
		bankAccountNumber: string(),
		email: nullable(string()),
		fileId: string(),
		fileUri: string(),
		imageUri: string(),
		password: string(),
		phone: nullable(string()),
		token: string(),
	},
	{
		required: ["email", "phone", "password", "token"],
		additionalProperties: true,
	},
);

/**
 * Asserts that a value is a valid User object
 * @param {any} value - The value to assert
 * @returns {value is import("../entity/app.js").User}
 * @throws {import("test/types/typeAssertion.js").ValidationError[]}
 */
export function isUser(value) {
	const obj = value;
	const res = validate(UserSchema, obj);
	if (!res.length) {
		return true;
	}
	throw res;
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
		console.warn(
			featureName + " | json or validation error:",
			JSON.stringify(e),
			"| body:",
			obj,
		);
		return;
	}
}
