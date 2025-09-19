import { combine } from "../helper/generator.js";

import { object, string, number, validate } from "../helper/typeAssertion.js";

// ProductCategory enum
export const ProductCategory = string({
	enum: ["Food", "Beverage", "Clothes", "Furniture", "Tools"],
});

// Product schema
export const ProductSchema = object(
	{
		name: string({ minLength: 4, maxLength: 32 }),
		category: ProductCategory,
		qty: number({ minimum: 1 }),
		price: number({ minimum: 100 }),
		sku: string(),
		fileId: string(),
	},
	{
		required: ["name", "category", "qty", "price", "sku", "fileId"],
		additionalProperties: false,
	},
);

/**
 * Asserts that a value is a valid Product object
 * @param {any} value - The value to assert
 * @returns {value is import("../entity/app.js").Product}
 * @throws {import("test/types/typeAssertion.js").ValidationError[]}
 */
export function isProduct(value) {
	const obj = value;
	const res = validate(ProductSchema, obj);
	if (!res.length) {
		return true;
	}
	throw res;
}

/**
 * @param {import("k6/http").RefinedResponse<any>} res
 * @param {any} positivePayload
 * @param {string} featureName
 * @returns {import('../entity/app.js').Product | undefined}
 */
export function getProduct(res, positivePayload, featureName) {
	let obj;
	try {
		const jsonResult = res.json();
		if (jsonResult && typeof jsonResult == "object") {
			obj = combine(jsonResult, positivePayload);
			if (isProduct(obj)) {
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
