import {
	testDeleteAssert,
	testGetAssert,
	testPostJsonAssert,
	testPutJsonAssert,
} from "../helper/testRequest.js";
import { isUser } from "../assertion/userAssertion.js";
import {
	clone,
	combine,
	generateRandomName,
	generateRandomNumber,
	generateTestObjects,
} from "../helper/generator.js";
import {
	isExists,
	isTotalDataInRange,
	isOrdered,
	isEqual,
	traverseObject,
} from "../helper/assertion.js";
import { getProduct, isProduct } from "../assertion/productAssertion.js";
import { isFile } from "../assertion/fileAssertion.js";

const productTypes = ["Food", "Beverage", "Clothes", "Furniture", "Tools"];

/**
 * @type {import("../types/scenario.js").Scenario<{user:import("../entity/app.js").User | undefined,createCount: number, file: import("../entity/app.js").UploadedFile|undefined},import("../entity/app.js").Product[] | undefined>}
 */
export function PostProductScenario(config, tags, info) {
	const featureName = "Post Product";
	const route = config.baseUrl + "/v1/product";
	const assertHandler = testPostJsonAssert;

	const user = info.user;
	const fileToTest = info.file;
	if (!isUser(user)) {
		console.warn(`${featureName} needs a valid user or file`);
		return undefined;
	}
	if (!isFile(fileToTest)) {
		console.warn(`${featureName} needs a valid file`);
		return undefined;
	}

	const positiveHeader = {
		Authorization: `Bearer ${user.token}`,
	};

	const positivePayload = {
		name: generateRandomName(),
		category: productTypes[generateRandomNumber(0, productTypes.length - 1)],
		qty: 1,
		price: 100,
		sku: `sku${generateRandomNumber(10000, 99999)}`,
		fileId: fileToTest.fileId,
	};

	if (config.runNegativeCase) {
		assertHandler({
			currentTestName: "no token",
			featureName: featureName,
			route: route,
			body: positivePayload,
			headers: {},
			expectedCase: {
				["should return 401"]: (_parsed, res) => res.status === 401,
			},
			options: [],
			config: config,
			tags: {},
		});
		assertHandler({
			currentTestName: `invalid token`,
			featureName: featureName,
			route: route,
			body: positivePayload,
			headers: { Authorization: `` },
			expectedCase: {
				["should return 401"]: (_parsed, res) => res.status === 401,
			},
			options: [],
			config: config,
			tags: {},
		});
		assertHandler({
			currentTestName: "empty body",
			featureName: featureName,
			route: route,
			body: {},
			headers: positiveHeader,
			expectedCase: {
				["should return 400"]: (_parsed, res) => res.status === 400,
			},
			options: [],
			config: config,
			tags: {},
		});

		const testObjects = generateTestObjects(
			{
				name: {
					type: "string",
					notNull: false,
					minLength: 4,
					maxLength: 32,
				},
				category: {
					type: "string",
					notNull: false,
					enum: productTypes,
				},
				qty: {
					type: "number",
					min: 1,
				},
				price: {
					type: "number",
					min: 100,
				},
				sku: {
					type: "string",
					notNull: false,
					minLength: 1,
					maxLength: 32,
				},
				fileId: {
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
				headers: positiveHeader,
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
		headers: positiveHeader,
		expectedCase: {
			["should return 201"]: (_parsed, res) => res.status === 201,

			["productId should be string"]: (parsed, _res) =>
				isExists(parsed, "productId", ["string"]),
			["name should be string"]: (parsed, _res) =>
				isExists(parsed, "name", ["string"]),
			["category should be string"]: (parsed, _res) =>
				isExists(parsed, "category", ["string"]),
			["qty should be number"]: (parsed, _res) =>
				isExists(parsed, "qty", ["number"]),
			["price should be number"]: (parsed, _res) =>
				isExists(parsed, "price", ["number"]),
			["sku should be number"]: (parsed, _res) =>
				isExists(parsed, "sku", ["string"]),

			["fileId should be string"]: (parsed, _res) =>
				isExists(parsed, "fileId", ["string"]),
			["fileUri should be string"]: (parsed, _res) =>
				isExists(parsed, "fileUri", ["string"]),
			["fileThumbnailUri should be string"]: (parsed, _res) =>
				isExists(parsed, "fileThumbnailUri", ["string"]),

			["createdAt should be string"]: (parsed, _res) =>
				isExists(parsed, "createdAt", ["string"]),
			["updatedAt should be string"]: (parsed, _res) =>
				isExists(parsed, "updatedAt", ["string"]),
		},
		options: [],
		config: config,
		tags: {},
	});

	if (config.runNegativeCase) {
		assertHandler({
			currentTestName: "conflict product",
			featureName: featureName,
			route: route,
			body: positivePayload,
			headers: positiveHeader,
			expectedCase: {
				["should return 409"]: (_parsed, res) => res.status === 409,
			},
			options: [],
			config: config,
			tags: {},
		});
	}

	/** @type{import("../entity/app.js").Product[]}  */
	const resResults = [];
	if (positiveResult.isSuccess) {
		const posResJson = positiveResult.res.json();
		if (!posResJson) {
		}
		if (isProduct(posResJson)) {
			resResults.push(posResJson);
		}

		if (info.createCount > 1) {
			for (let index = 1; index < info.createCount; index++) {
				const resPayload = {
					name: generateRandomName(),
					category:
						productTypes[generateRandomNumber(0, productTypes.length - 1)],
					qty: 1,
					price: 100,
					sku: `sku${generateRandomNumber(10000, 99999)}`,
					fileId: fileToTest.fileId,
				};
				const res = assertHandler({
					currentTestName: "valid payload",
					featureName: featureName,
					route: route,
					body: resPayload,
					headers: positiveHeader,
					expectedCase: {
						["should return 201"]: (_parsed, res) => res.status === 201,
					},
					options: [],
					config: config,
					tags: {},
				});
				const resJson = res.res.json();
				if (!resJson) {
					continue;
				}
				if (isProduct(resJson)) {
					resResults.push(resJson);
				}
			}
		}

		return resResults;
	} else {
		console.warn(
			`${featureName} | Skipping getProduct due to failed assertions.`,
		);
		return undefined;
	}
}

/**
 * @type {import("../types/scenario.js").Scenario<any,import("../entity/app.js").Product|undefined>}
 */
export function GetProductScenario(config, tags, info) {
	const featureName = "Get Product";
	const route = config.baseUrl + "/v1/product";
	const assertHandler = testGetAssert;

	// --- Positive Case ---
	/** @type {import("../types/testRequest.js").Checkers} */
	const positiveCases = {
		["should return 200"]: (_parsed, res) => res.status === 200,

		["productId should be string"]: (parsed, _res) =>
			isExists(parsed, "[].productId", ["string"]),
		["name should be string"]: (parsed, _res) =>
			isExists(parsed, "[].name", ["string"]),
		["category should be string"]: (parsed, _res) =>
			isExists(parsed, "[].category", ["string"]),
		["qty should be number"]: (parsed, _res) =>
			isExists(parsed, "[].qty", ["number"]),
		["price should be number"]: (parsed, _res) =>
			isExists(parsed, "[].price", ["number"]),
		["sku should be number"]: (parsed, _res) =>
			isExists(parsed, "[].sku", ["string"]),

		["fileId should be string"]: (parsed, _res) =>
			isExists(parsed, "[]fileId", ["string"]),
		["fileUri should be string"]: (parsed, _res) =>
			isExists(parsed, "[].fileUri", ["string"]),
		["fileThumbnailUri should be string"]: (parsed, _res) =>
			isExists(parsed, "[].fileThumbnailUri", ["string"]),

		["createdAt should be string"]: (parsed, _res) =>
			isExists(parsed, "[].createdAt", ["string"]),
		["updatedAt should be string"]: (parsed, _res) =>
			isExists(parsed, "[].updatedAt", ["string"]),
	};

	// pagination test
	const getAssert = assertHandler({
		featureName: featureName,
		config: config,
		route: route,
		params: {
			limit: 1,
			offset: 0,
		},
		headers: {},
		currentTestName: "success get product with limited pagination",
		expectedCase: combine(positiveCases, {
			["should have less than 2 items"]: (parsed, _res) =>
				isTotalDataInRange(parsed, "[]", 0, 1),
		}),
		tags: {},
	});

	// sort: expensive
	assertHandler({
		featureName: featureName,
		config: config,
		route: route,
		params: {
			limit: 5,
			offset: 0,
			sortBy: "expensive",
		},
		headers: {},
		currentTestName: "success get product with limited date",
		expectedCase: combine(positiveCases, {
			["should have less than 6 items"]: (parsed, _res) =>
				isTotalDataInRange(parsed, "[]", 0, 5),
			["first item should the cheapest price of all"]: (parsed, _res) =>
				isOrdered(parsed, "[].price", "desc"),
		}),
		tags: {},
	});

	assertHandler({
		featureName: featureName,
		config: config,
		route: route,
		params: {
			limit: 5,
			offset: 0,
			sortBy: "cheapest",
		},
		headers: {},
		currentTestName: "success get cheapest product",
		expectedCase: combine(positiveCases, {
			["should have less than 6 items"]: (parsed, _res) =>
				isTotalDataInRange(parsed, "[]", 0, 5),
			["should have items within the range"]: (parsed, _res) =>
				isOrdered(parsed, "[].price", "asc"),
		}),
		tags: {},
	});

	const getAssertJson = getAssert.res.json();
	const choosenCategory = traverseObject(getAssertJson, "[].category")[0];
	if (!choosenCategory) {
		console.warn(
			`${featureName} | Skipping getProduct due to unable to get the product category.`,
		);
		return undefined;
	}
	const choosenSku = traverseObject(getAssertJson, "[].sku")[0];
	if (!choosenSku) {
		console.warn(
			`${featureName} | Skipping getProduct due to unable to get the sku.`,
		);
		return undefined;
	}
	const choosenProductId = traverseObject(getAssertJson, "[].productId")[0];
	if (!choosenProductId) {
		console.warn(
			`${featureName} | Skipping getProduct due to unable to get the productId.`,
		);
		return undefined;
	}

	// newest
	assertHandler({
		featureName: featureName,
		config: config,
		route: route,
		params: {
			limit: 5,
			offset: 0,
			sortBy: "newest",
		},
		headers: {},
		currentTestName: "success get newest product",
		expectedCase: combine(positiveCases, {
			["should have less than 6 items"]: (parsed, _res) =>
				isTotalDataInRange(parsed, "[]", 0, 5),
			["should have items within the range"]: (parsed, _res) =>
				isOrdered(parsed, "[].createdAt", "desc"),
		}),
		tags: {},
	});

	// oldest
	assertHandler({
		featureName: featureName,
		config: config,
		route: route,
		params: {
			limit: 5,
			offset: 0,
			sortBy: "oldest",
		},
		headers: {},
		currentTestName: "success get oldest product",
		expectedCase: combine(positiveCases, {
			["should have less than 6 items"]: (parsed, _res) =>
				isTotalDataInRange(parsed, "[]", 0, 5),
			["should have items within the range"]: (parsed, _res) =>
				isOrdered(parsed, "[].createdAt", "asc"),
		}),
		tags: {},
	});

	// sku
	assertHandler({
		featureName: featureName,
		config: config,
		route: route,
		params: {
			sku: choosenSku.toString(),
		},
		headers: {},
		currentTestName: "success get sku",
		expectedCase: combine(positiveCases, {
			["should have only 1 item"]: (parsed, _res) =>
				isTotalDataInRange(parsed, "[]", 0, 1),
			["should have sku"]: (parsed, _res) =>
				isEqual(parsed, "[].sku", choosenSku),
		}),
		tags: {},
	});

	// productId
	assertHandler({
		featureName: featureName,
		config: config,
		route: route,
		params: {
			productId: choosenProductId.toString(),
		},
		headers: {},
		currentTestName: "success get sku",
		expectedCase: combine(positiveCases, {
			["should have only 1 item"]: (parsed, _res) =>
				isTotalDataInRange(parsed, "[]", 0, 1),
			["should exist"]: (parsed, _res) =>
				isEqual(parsed, "[].productId", choosenProductId),
		}),
		tags: {},
	});

	assertHandler({
		featureName: featureName,
		config: config,
		route: route,
		params: {
			limit: 5,
			offset: 0,
			category: choosenCategory.toString(),
		},
		headers: {},
		currentTestName: "success get product with limited pagination",
		expectedCase: combine(positiveCases, {
			["should have less than 6 items"]: (parsed, _res) =>
				isTotalDataInRange(parsed, "[]", 0, 5),
			["should have equal category"]: (parsed, _res) =>
				isEqual(parsed, "[].category", choosenCategory),
		}),
		tags: {},
	});

	const positiveResult = assertHandler({
		featureName: featureName,
		config: config,
		route: route,
		params: {},
		headers: {},
		currentTestName: "success get product",
		expectedCase: positiveCases,
		tags: {},
	});

	if (positiveResult.isSuccess) {
		return getProduct(positiveResult.res, {}, featureName);
	} else {
		console.warn(
			`${featureName} | Skipping getProduct due to failed assertions.`,
		);
		return undefined;
	}
}

/**
 * @type {import("../types/scenario.js").Scenario<{user:import("../entity/app.js").User | undefined,product:import("../entity/app.js").Product | undefined, file: import("../entity/app.js").UploadedFile|undefined},import("../entity/app.js").Product | undefined>}
 */
export function PutProductScenario(config, tags, info) {
	const featureName = "Put Product";
	const assertHandler = testPutJsonAssert;
	const mockUser = info.user;
	const mockFile = info.file;
	const mockProduct = info.product;

	if (!isUser(mockUser)) {
		console.warn(`${featureName} needs a valid user or file`);
		return undefined;
	}
	if (!isFile(mockFile)) {
		console.warn(`${featureName} needs a valid file`);
		return undefined;
	}
	if (!isProduct(mockProduct)) {
		console.warn(`${featureName} needs a valid product`);
		return undefined;
	}

	const positiveHeader = {
		Authorization: `Bearer ${mockUser.token}`,
	};

	const positivePayload = {
		productId: mockProduct.productId,
		name: generateRandomName(),
		category: productTypes[generateRandomNumber(0, productTypes.length - 1)],
		qty: 1,
		price: 100,
		sku: `sku${generateRandomNumber(10000, 9999999)}`,
		fileId: mockFile.fileId,
		fileUri: mockFile.fileUri,
		fileThumbnailUri: mockFile.fileThumbnailUri,
	};
	const route = config.baseUrl + `/v1/product/${mockProduct.productId}`;
	const incorrectRoute = config.baseUrl + "/v1/product/asdfassdf";

	if (config.runNegativeCase) {
		assertHandler({
			currentTestName: "no token",
			featureName: featureName,
			route: route,
			body: {},
			headers: {},
			expectedCase: {
				["should return 401"]: (_parsed, res) => res.status === 401,
			},
			options: [],
			config: config,
			tags: {},
		});
		assertHandler({
			currentTestName: "empty body",
			featureName: featureName,
			route: route,
			body: {},
			headers: positiveHeader,
			expectedCase: {
				["should return 400"]: (_parsed, res) => res.status === 400,
			},
			options: [],
			config: config,
			tags: {},
		});
		assertHandler({
			currentTestName: "productId is not exist",
			featureName: featureName,
			route: incorrectRoute,
			body: positivePayload,
			headers: positiveHeader,
			expectedCase: {
				["should return 404"]: (_parsed, res) => res.status === 404,
			},
			options: [],
			config: config,
			tags: {},
		});

		const testObjects = generateTestObjects(
			{
				name: {
					type: "string",
					notNull: false,
					minLength: 4,
					maxLength: 32,
				},
				category: {
					type: "string",
					notNull: false,
					enum: productTypes,
				},
				qty: {
					type: "number",
					min: 1,
				},
				price: {
					type: "number",
					min: 100,
				},
				sku: {
					type: "string",
					notNull: false,
					minLength: 1,
					maxLength: 32,
				},
				fileId: {
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
				headers: positiveHeader,
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
		headers: positiveHeader,
		expectedCase: {
			["should return 200"]: (_parsed, res) => res.status === 200,

			["productId should be string"]: (parsed, _res) =>
				isExists(parsed, "productId", ["string"]),
			["name should be string"]: (parsed, _res) =>
				isExists(parsed, "name", ["string"]),
			["category should be string"]: (parsed, _res) =>
				isExists(parsed, "category", ["string"]),
			["qty should be number"]: (parsed, _res) =>
				isExists(parsed, "qty", ["number"]),
			["price should be number"]: (parsed, _res) =>
				isExists(parsed, "price", ["number"]),
			["sku should be number"]: (parsed, _res) =>
				isExists(parsed, "sku", ["string"]),

			["fileId should be string"]: (parsed, _res) =>
				isExists(parsed, "fileId", ["string"]),
			["fileUri should be string"]: (parsed, _res) =>
				isExists(parsed, "fileUri", ["string"]),
			["fileThumbnailUri should be string"]: (parsed, _res) =>
				isExists(parsed, "fileThumbnailUri", ["string"]),

			["createdAt should be string"]: (parsed, _res) =>
				isExists(parsed, "createdAt", ["string"]),
			["updatedAt should be string"]: (parsed, _res) =>
				isExists(parsed, "updatedAt", ["string"]),
		},
		options: [],
		config: config,
		tags: {},
	});

	if (positiveResult.isSuccess) {
		return getProduct(positiveResult.res, {}, featureName);
	} else {
		console.warn(
			`${featureName} | Skipping getProduct due to failed assertions.`,
		);
		return undefined;
	}
}

/**
 * @type {import("../types/scenario.js").Scenario<{user:import("../entity/app.js").User | undefined,product:import("../entity/app.js").Product | undefined},import("../entity/app.js").Product | undefined>}
 */
export function DeleteProductScenario(config, tags, info) {
	const featureName = "Delete Product";
	const assertHandler = testDeleteAssert;
	const mockUser = info.user;
	const mockProduct = info.product;
	if (!isUser(mockUser)) {
		console.warn(`${featureName} needs a valid user or file`);
		return undefined;
	}
	if (!isProduct(mockProduct)) {
		console.warn(`${featureName} needs a valid product`);
		return undefined;
	}

	const route = config.baseUrl + `/v1/product/${mockProduct.productId}`;
	const incorrectRoute = config.baseUrl + "/v1/product/asdfassdf";

	const positiveHeader = {
		Authorization: `Bearer ${mockUser.token}`,
	};

	if (config.runNegativeCase) {
		assertHandler({
			currentTestName: "no token",
			featureName: featureName,
			route: route,
			body: {},
			headers: {},
			expectedCase: {
				["should return 401"]: (_parsed, res) => res.status === 401,
			},
			config: config,
			tags: {},
			params: {},
		});
		assertHandler({
			currentTestName: "productId is not exist",
			featureName: featureName,
			route: incorrectRoute,
			body: {},
			headers: positiveHeader,
			expectedCase: {
				["should return 404"]: (_parsed, res) => res.status === 404,
			},
			params: {},
			config: config,
			tags: {},
		});
	}

	assertHandler({
		currentTestName: "valid payload",
		featureName: featureName,
		route: route,
		headers: positiveHeader,
		expectedCase: {
			["should return 200"]: (_parsed, res) => res.status === 200,
		},
		params: {},
		config: config,
		tags: {},
	});
}
