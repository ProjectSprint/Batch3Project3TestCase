import { file, get } from "k6/http";
import {
	testDeleteAssert,
	testGetAssert,
	testPostJsonAssert,
	testPostMultipartAssert,
	testPutJsonAssert,
} from "../helper/testRequest.js";
import { getUser, isUser } from "../assertion/userAssertion.js";
import {
	clone,
	combine,
	generateRandomName,
	generateRandomNumber,
	generateRandomWord,
	generateTestObjects,
} from "../helper/generator.js";
import {
	isExists,
	isEqualWith,
	isTotalDataInRange,
	isOrdered,
	isEqual,
} from "../helper/assertion.js";
import { getProduct, isProduct } from "../assertion/productAssertion.js";
import { isFile } from "../assertion/fileAssertion.js";

const activityTypes = [
	"Walking",
	"Yoga",
	"Stretching",
	"Cycling",
	"Swimming",
	"Dancing",
	"Hiking",
	"Running",
	"HIIT",
	"JumpRope",
];

/**
 * @type {import("../types/scenario.js").Scenario<{user:import("../entity/app.js").User | undefined, file: import("../entity/app.js").UploadedFile|undefined},import("../entity/app.js").Product | undefined>}
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
		Authorization: `${user.token}`,
	};

	const positivePayload1 = {
		name: generateRandomName(),
		category: activityTypes[generateRandomNumber(0, activityTypes.length - 1)],
		qty: 1,
		price: 100,
		sku: `sku${generateRandomNumber(10000, 99999)}`,
		fileId: fileToTest.fileId,
		fileUri: fileToTest.fileUri,
		fileThumbnailUri: fileToTest.fileThumbnailUri,
	};

	const positivePayload2 = clone(positivePayload1);
	positivePayload2.sku = `sku${generateRandomNumber(10000, 99999)}`;
	positivePayload2.category =
		activityTypes[generateRandomNumber(0, activityTypes.length - 1)];

	const positivePayload3 = clone(positivePayload1);
	positivePayload3.sku = `sku${generateRandomNumber(10000, 99999)}`;
	positivePayload3.category =
		activityTypes[generateRandomNumber(0, activityTypes.length - 1)];

	const positivePayload4 = clone(positivePayload1);
	positivePayload4.sku = `sku${generateRandomNumber(10000, 99999)}`;
	positivePayload4.category =
		activityTypes[generateRandomNumber(0, activityTypes.length - 1)];

	const positivePayload5 = clone(positivePayload1);
	positivePayload5.sku = `sku${generateRandomNumber(10000, 99999)}`;
	positivePayload5.category =
		activityTypes[generateRandomNumber(0, activityTypes.length - 1)];

	const negativePayload = clone(positivePayload1);
	negativePayload.sku = `sku${generateRandomNumber(10000, 99999)}`;
	negativePayload.category = "WrongCategory";
	negativePayload.fileId = "notexist_id";
	const conflictPayload = clone(positivePayload1);

	let positivePayloads = [
		positivePayload1,
		positivePayload2,
		positivePayload3,
		positivePayload4,
		positivePayload5,
	];

	if (config.runNegativeCase) {
		assertHandler({
			currentTestName: "no token",
			featureName: featureName,
			route: route,
			body: positivePayload1,
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
			body: positivePayload1,
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
		assertHandler({
			currentTestName: "invalid file id",
			featureName: featureName,
			route: route,
			body: negativePayload,
			headers: positiveHeader,
			expectedCase: {
				["should return 400"]: (_parsed, res) => res.status === 400,
			},
			options: [],
			config: config,
			tags: {},
		});
		assertHandler({
			currentTestName: "invalid product category",
			featureName: featureName,
			route: route,
			body: negativePayload,
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
					enum: ["Food", "Beverage", "Clothes", "Furniture", "Tools"],
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
			negativePayload,
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
	let positiveResults = positivePayloads.map((payload, _index) => {
		return assertHandler({
			currentTestName: "valid payload",
			featureName: featureName,
			route: route,
			body: payload,
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
	});

	if (config.runNegativeCase) {
		assertHandler({
			currentTestName: "conflict product",
			featureName: featureName,
			route: route,
			body: conflictPayload,
			headers: positiveHeader,
			expectedCase: {
				["should return 409"]: (_parsed, res) => res.status === 409,
			},
			options: [],
			config: config,
			tags: {},
		});
	}

	if (
		positiveResults.every((result) => {
			return result.isSuccess;
		})
	) {
		return getProduct(positiveResults[0].res, {}, featureName);
	} else {
		console.warn(
			`${featureName} | Skipping getProduct due to failed assertions.`,
		);
		return undefined;
	}
}

/**
 * @type {import("../types/scenario.js").Scenario<{user:import("../entity/app.js").User | undefined},import("../entity/app.js").Product|undefined>}
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
	assertHandler({
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
		currentTestName: "success get product with limited date",
		expectedCase: combine(positiveCases, {
			["should have less than 6 items"]: (parsed, _res) =>
				isTotalDataInRange(parsed, "[]", 0, 5),
			["should have items within the range"]: (parsed, _res) =>
				isOrdered(parsed, "[].price", "asc"),
		}),
		tags: {},
	});
	const choosenCategory =
		activityTypes[generateRandomNumber(0, activityTypes.length - 1)];
	assertHandler({
		featureName: featureName,
		config: config,
		route: route,
		params: {
			limit: 5,
			offset: 0,
			category: choosenCategory,
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

/** @type {string[]} */
const validProductId = ["prdct001", "prdct002", "prdct003"];

/**
 * @type {import("../types/scenario.js").Scenario<{user:import("../entity/app.js").User | undefined,product:import("../entity/app.js").Product | undefined, file: import("../entity/app.js").UploadedFile|undefined},import("../entity/app.js").Product | undefined>}
 */
export function PutProductScenario(config, tags, info) {
	const featureName = "Put Product";
	const route = config.baseUrl + "/v1/product/:productId";
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

	const positivePayload1 = {
		productId: mockProduct.productId,
		name: generateRandomName(),
		category: activityTypes[generateRandomNumber(0, activityTypes.length - 1)],
		qty: 1,
		price: 100,
		sku: "sku12345",
		fileId: mockFile.fileId,
		fileUri: mockFile.fileUri,
		fileThumbnailUri: mockFile.fileThumbnailUri,
	};

	const positivePayload2 = clone(positivePayload1);
	positivePayload2.sku = `sku${generateRandomNumber(10000, 99999)}`;
	positivePayload2.category =
		activityTypes[generateRandomNumber(0, activityTypes.length - 1)];

	const positivePayload3 = clone(positivePayload1);
	positivePayload3.sku = `sku${generateRandomNumber(10000, 99999)}`;
	positivePayload3.category =
		activityTypes[generateRandomNumber(0, activityTypes.length - 1)];

	const positivePayload4 = clone(positivePayload1);
	positivePayload4.sku = `sku${generateRandomNumber(10000, 99999)}`;
	positivePayload4.category =
		activityTypes[generateRandomNumber(0, activityTypes.length - 1)];

	const positivePayload5 = clone(positivePayload1);
	positivePayload5.sku = `sku${generateRandomNumber(10000, 99999)}`;
	positivePayload5.category =
		activityTypes[generateRandomNumber(0, activityTypes.length - 1)];

	const negativePayload = clone(positivePayload1);
	negativePayload.category = "Electronic";
	negativePayload.fileId = "salah0123";
	const negativePayload2 = clone(positivePayload1);
	negativePayload2.productId = "idSalah0123";

	let positivePayloads = [
		positivePayload1,
		positivePayload2,
		positivePayload3,
		positivePayload4,
		positivePayload5,
	];
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
			headers: { Authorization: mockUser.token },
			expectedCase: {
				["should return 400"]: (_parsed, res) => res.status === 400,
			},
			options: [],
			config: config,
			tags: {},
		});
		assertHandler({
			currentTestName: "invalid file id",
			featureName: featureName,
			route: route,
			body: negativePayload,
			headers: { Authorization: mockUser.token },
			expectedCase: {
				["should return 400"]: (_parsed, res) => res.status === 400,
			},
			options: [],
			config: config,
			tags: {},
		});
		assertHandler({
			currentTestName: "invalid product category",
			featureName: featureName,
			route: route,
			body: negativePayload,
			headers: { Authorization: mockUser.token },
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
			route: route,
			body: negativePayload2,
			headers: { Authorization: mockUser.token },
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
					enum: ["Food", "Beverage", "Clothes", "Furniture", "Tools"],
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
			negativePayload,
		);

		testObjects.forEach((payload) => {
			assertHandler({
				currentTestName: "invalid payload",
				featureName: featureName,
				route: route,
				body: payload,
				headers: { Authorization: mockUser.token },
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
			headers: { Authorization: mockUser.token },
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
	});

	if (
		positiveResults.every((result) => {
			return result.isSuccess;
		})
	) {
		return getProduct(positiveResults[0].res, {}, featureName);
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
	const route = config.baseUrl + "/v1/product/:productId";
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
			route: route,
			body: negativePayload,
			headers: { Authorization: mockUser.token },
			expectedCase: {
				["should return 404"]: (_parsed, res) => res.status === 404,
			},
			params: {},
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
					enum: ["Food", "Beverage", "Clothes", "Furniture", "Tools"],
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
			negativePayload,
		);

		testObjects.forEach((payload) => {
			assertHandler({
				currentTestName: "invalid payload",
				featureName: featureName,
				route: route,
				body: payload,
				headers: { Authorization: mockUser.token },
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
			headers: { Authorization: mockUser.token },
			expectedCase: {
				["should return 200"]: (_parsed, res) => res.status === 200,
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
		return getProduct(positiveResults[0].res, {}, featureName);
	} else {
		console.warn(
			`${featureName} | Skipping getProduct due to failed assertions.`,
		);
		return undefined;
	}
}
