import { combine } from "../helper/generator.js";
import {
	object,
	string,
	number,
	array,
	nullable,
	validate,
} from "../helper/typeAssertion.js";
import { ProductSchema } from "./productAssertion.js";

export const PurchaseRequestSchema = object(
	{
		purchasedItems: array(
			object(
				{
					productId: string(),
					qty: number(),
				},
				{ required: ["productId", "qty"], additionalProperties: true },
			),
		),
		senderName: nullable(string()),
		senderContactType: string({ enum: ["email", "phone"] }),
		senderContactDetail: string(),
	},
	{
		required: ["purchasedItems", "senderContactType", "senderContactDetail"],
		additionalProperties: true,
	},
);

/**
 * Asserts that a value is a valid PurchaseRequest object
 * @param {any} value - The value to assert
 * @returns {value is import("../entity/app.js").PurchaseRequest}
 * @throws {import("test/types/typeAssertion.js").ValidationError[]}
 */
export function isPurchaseRequest(value) {
	const obj = value;
	const res = validate(PurchaseRequestSchema, obj);
	if (!res.length) {
		return true;
	}
	throw res;
}

/**
 * @param {import("k6/http").RefinedResponse<any>} res
 * @param {any} positivePayload
 * @param {string} featureName
 * @returns {import('../entity/app.js').PurchaseRequest | undefined}
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

export const PurchaseResponseSchema = object(
	{
		purchaseId: string(),
		purchasedItems: array(ProductSchema),
		totalPrice: number(),
		paymentDetails: array(
			object(
				{
					bankAccountName: string(),
					bankAccountHolder: string(),
					bankAccountNumber: string(),
					totalPrice: number(),
				},
				{
					required: [
						"bankAccountName",
						"bankAccountHolder",
						"bankAccountNumber",
						"totalPrice",
					],
					additionalProperties: true,
				},
			),
		),
	},
	{
		required: ["purchaseId", "purchasedItems", "totalPrice", "paymentDetails"],
		additionalProperties: true,
	},
);

/**
 * Asserts that a value is a valid PurchaseResponse object
 * @param {any} value - The value to assert
 * @returns {value is import("../entity/app.js").PurchaseResponse}
 * @throws {import("test/types/typeAssertion.js").ValidationError[]}
 */
export function isPurchaseResponse(value) {
	const obj = value;
	const res = validate(PurchaseResponseSchema, obj);
	if (!res.length) {
		return true;
	}
	throw res;
}

/**
 * @param {import("k6/http").RefinedResponse<any>} res
 * @param {any} positivePayload
 * @param {string} featureName
 * @returns {import('../entity/app.js').PurchaseResponse | undefined}
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
