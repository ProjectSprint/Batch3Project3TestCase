import { testPostJsonAssert } from "../helper/testRequest.js";
import {
	clone,
	generateRandomEmail,
	generateRandomName,
	generateRandomPhoneNumber,
	generateTestObjects,
	generateRandomNumber,
} from "../helper/generator.js";
import { isExists } from "../helper/assertion.js";
import {
	getPurchaseResponse,
	isPurchaseResponse,
} from "../assertion/purchaseAssertion.js";
import { isProduct } from "../assertion/productAssertion.js";
import { isFile } from "../assertion/fileAssertion.js";

/**
 * @type {import("../types/scenario.js").Scenario<{products: import("../entity/app.js").Product[]},import("../entity/app.js").PurchaseResponse | undefined>}
 */
export function PostPurchaseScenario(config, tags, info) {
	const featureName = "Post Purchase";
	const route = config.baseUrl + "/v1/purchase";
	const assertHandler = testPostJsonAssert;

	const mockProducts = info.products;
	if (!mockProducts.every((p) => isProduct(p))) {
		console.warn(`${featureName} needs a valid purchase`);
		return undefined;
	}

	const positivePayload = {
		purchasedItems: mockProducts.map((p) => ({
			productId: p.productId,
			qty: 1,
		})),
		senderName: generateRandomName(),
		senderContactType: "phone",
		senderContactDetail: generateRandomPhoneNumber(true),
	};

	const positivePayload2 = clone(positivePayload);
	positivePayload2.senderContactType = "email";
	positivePayload2.senderContactDetail = generateRandomEmail();

	let positivePayloads = [positivePayload, positivePayload2];

	if (config.runNegativeCase) {
		assertHandler({
			currentTestName: "empty body",
			featureName: featureName,
			route: route,
			body: {},
			headers: {},
			expectedCase: {
				["should return 400"]: (_parsed, res) => res.status === 400,
			},
			options: [],
			config: config,
			tags: {},
		});

		const testObjects = generateTestObjects(
			{
				purchasedItems: {
					type: "array",
					notNull: false,
					items: {
						type: "object",
						properties: {
							productId: {
								type: "string",
								notNull: false,
							},
							qty: {
								type: "number",
								notNull: false,
								min: 1,
							},
						},
					},
					min: 1,
				},
				senderName: {
					type: "string",
					notNull: false,
					minLength: 4,
					maxLength: 55,
				},
				senderContactType: {
					type: "string",
					notNull: false,
					enum: ["email", "phone"],
				},
				senderContactDetail: {
					type: "string",
					notNull: false,
				},
			},
			positivePayload,
		);

		testObjects.forEach((payload) => {
			assertHandler({
				currentTestName: "invalid payload",
				featureName: featureName,
				route: route,
				body: payload,
				headers: {},
				expectedCase: {
					["should return 400"]: (_parsed, res) => res.status === 400,
				},
				options: [],
				config: config,
				tags: {},
			});
		});
	}

	// --- Positive Case ---
	let positiveResults = positivePayloads.map((payload, _index) => {
		return assertHandler({
			currentTestName: "valid payload",
			featureName: featureName,
			route: route,
			body: payload,
			headers: {},
			expectedCase: {
				["should return 201"]: (_parsed, res) => res.status === 201,
				["should return purchaseId"]: (parsed, _res) =>
					isExists(parsed, "purchaseId", ["string", "number"]),
				["should return purchasedItems"]: (parsed, _res) =>
					isExists(parsed, "purchasedItems", ["array"]),

				["should return productId"]: (parsed, _res) =>
					isExists(parsed, "purchasedItems[].productId", ["string", "number"]),
				["should return productName"]: (parsed, _res) =>
					isExists(parsed, "purchasedItems[].name", ["string"]),
				["should return productCategory"]: (parsed, _res) =>
					isExists(parsed, "purchasedItems[].category", ["string"]),
				["should return productQty"]: (parsed, _res) =>
					isExists(parsed, "purchasedItems[].qty", ["number"]),
				["should return productPrice"]: (parsed, _res) =>
					isExists(parsed, "purchasedItems[].price", ["number"]),
				["should return productSku"]: (parsed, _res) =>
					isExists(parsed, "purchasedItems[].sku", ["string"]),
				["should return productFileId"]: (parsed, _res) =>
					isExists(parsed, "purchasedItems[].fileId", ["string"]),
				["should return productFileThumbnailUri"]: (parsed, _res) =>
					isExists(parsed, "purchasedItems[].fileThumbnailUri", ["string"]),
				["should return productCreatedAt"]: (parsed, _res) =>
					isExists(parsed, "purchasedItems[].createdAt", ["string"]),
				["should return productUpdatedAt"]: (parsed, _res) =>
					isExists(parsed, "purchasedItems[].updatedAt", ["string"]),

				["should return totalPrice"]: (parsed, _res) =>
					isExists(parsed, "totalPrice", ["number"]),

				["should return paymentDetails"]: (parsed, _res) =>
					isExists(parsed, "paymentDetails", ["array"]),
				["should return bankAccountName"]: (parsed, _res) =>
					isExists(parsed, "paymentDetails[].bankAccountName", ["string"]),
				["should return bankAccountHolder"]: (parsed, _res) =>
					isExists(parsed, "paymentDetails[].bankAccountHolder", ["string"]),
				["should return bankAccountNumber"]: (parsed, _res) =>
					isExists(parsed, "paymentDetails[].bankAccountNumber", ["string"]),
				["should return paymentDetails.totalPrice"]: (parsed, _res) =>
					isExists(parsed, "paymentDetails[].totalPrice", ["number"]),
			},
			options: [],
			config: config,
			tags: {},
		});
	});

	if (
		positiveResults.every((result) => {
			return result.isSuccess;
		})
	) {
		return getPurchaseResponse(positiveResults[0].res, {}, featureName);
	} else {
		console.warn(
			`${featureName} | Skipping getPurchaseResponse due to failed post assertions.`,
		);
		return undefined;
	}
}

const fileIds = ["file123", "oka955"];
/**
 * @type {import("../types/scenario.js").Scenario<{file: import("../entity/app.js").UploadedFile|undefined,purchase: import("../entity/app.js").PurchaseResponse|undefined},any>}
 */
export function PostPurchaseIdScenario(config, tags, info) {
	const featureName = "Post Purchase Id";
	const assertHandler = testPostJsonAssert;

	const mockPurchase = info.purchase;
	const fileToTest = info.file;
	if (!isPurchaseResponse(mockPurchase)) {
		console.warn(`${featureName} needs a valid purchase`);
		return undefined;
	}
	if (!isFile(fileToTest)) {
		console.warn(`${featureName} needs a valid file`);
		return undefined;
	}
	const positivePayload = {
		fileIds: [fileToTest.fileId],
	};

	const route = config.baseUrl + `/v1/purchase/${mockPurchase.purchaseId}`;
	const incorrectRoute = config.baseUrl + "/v1/purchase/asdfassdf";

	if (config.runNegativeCase) {
		assertHandler({
			currentTestName: "empty body",
			featureName: featureName,
			route: route,
			body: {},
			headers: {},
			expectedCase: {
				["should return 400"]: (_parsed, res) => res.status === 400,
			},
			options: [],
			config: config,
			tags: {},
		});

		assertHandler({
			currentTestName: "purchaseId is not exist",
			featureName: featureName,
			route: incorrectRoute,
			body: positivePayload,
			headers: {},
			expectedCase: {
				["should return 404"]: (_parsed, res) => res.status === 404,
			},
			options: [],
			config: config,
			tags: {},
		});

		const testObjects = generateTestObjects(
			{
				fileIds: {
					type: "array",
					notNull: false,
					min: 1,
					items: {
						type: "string",
					},
				},
			},
			positivePayload,
		);

		testObjects.forEach((payload) => {
			assertHandler({
				currentTestName: "invalid payload",
				featureName: featureName,
				route: route,
				body: payload,
				headers: {},
				expectedCase: {
					["should return 400"]: (_parsed, res) => res.status === 400,
				},
				options: [],
				config: config,
				tags: {},
			});
		});
	}

	// --- Positive Case ---
	const positiveResult = assertHandler({
		currentTestName: "valid payload",
		featureName: featureName,
		route: route,
		body: positivePayload,
		headers: {},
		expectedCase: {
			["should return 201"]: (_parsed, res) => res.status === 201,
		},
		options: [],
		config: config,
		tags: {},
	});

	if (positiveResult.isSuccess) {
		return undefined;
	} else {
		console.warn(
			`${featureName} | Skipping getPurchaseResponse due to failed assertions.`,
		);
		return undefined;
	}
}
