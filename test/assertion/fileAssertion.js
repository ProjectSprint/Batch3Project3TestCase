import { combine } from "../helper/generator.js";
import { object, string, validate } from "../helper/typeAssertion.js";

export const FileSchema = object(
	{
		fileId: string(),
		fileThumbnailUri: string(),
		fileUri: string(),
	},
	{
		required: ["fileId", "fileUri", "fileThumbnailUri"],
		additionalProperties: true,
	},
);

/**
 * Asserts that a value is a valid User object
 * @param {any} value - The value to assert
 * @returns {value is import("../entity/app.js").UploadedFile}
 * @throws {import("test/types/typeAssertion.js").ValidationError[]}
 */
export function isFile(value) {
	const res = validate(FileSchema, value);
	if (!res.length) {
		return true;
	}
	throw res;
}

/**
 * @param {import("k6/http").RefinedResponse<any>} res
 * @param {any} positivePayload
 * @param {string} featureName
 * @returns {import('../entity/app.js').UploadedFile | undefined}
 */
export function getFile(res, positivePayload, featureName) {
	try {
		const jsonResult = res.json();
		if (jsonResult && typeof jsonResult == "object") {
			const obj = combine(jsonResult, positivePayload);
			if (isFile(obj)) {
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
			e,
			"body:",
			res.body,
		);
		return;
	}
}
