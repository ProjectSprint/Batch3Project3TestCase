import { file, get } from "k6/http";
import {
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
import { isExists, isEqualWith, isTotalDataInRange } from "../helper/assertion.js";
import { getProduct, isProduct } from "../assertion/productAssertion.js";
import { isFile } from "../assertion/fileAssertion.js";

/** @type {string[]} */
const validFileId = ["file1", "file2", "file3"];

const cheapestPrice = 1_000;
const expensivePrice = 5_042_690;

/**
 * @type {import("../types/scenario.js").Scenario<{user:import("../entity/app.js").User | undefined, file: import("../entity/app.js").UploadedFile|undefined},import("../entity/app.js").Product | undefined>}
 */
export function PostProductScenario(config, tags, info) {
	const featureName = "Post Product";
	const route = config.baseUrl + "/v1/product";
	const routeFile = config.baseUrl + "/v1/file";
	const assertHandler = testPostJsonAssert;
	const multipartHandler = testPostMultipartAssert;

	console.log(info)
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
		category: "Food",
		qty: 1,
		price: 100,
		sku: `sku${generateRandomNumber(10000, 99999)}`,
		// added later when ready to test positive payload
		fileId: fileToTest.fileId,
	};

	const positivePayload2 = clone(positivePayload1);
	positivePayload2.sku = `sku${generateRandomNumber(10000, 99999)}`;
	positivePayload2.category = "Beverage";
	const positivePayload3 = clone(positivePayload1);
	positivePayload3.sku = `sku${generateRandomNumber(10000, 99999)}`;
	positivePayload3.category = "Clothes";
	const positivePayload4 = clone(positivePayload1);
	positivePayload4.sku = `sku${generateRandomNumber(10000, 99999)}`;
	positivePayload4.category = "Furniture";
	const positivePayload5 = clone(positivePayload1);
	positivePayload5.sku = `sku${generateRandomNumber(10000, 99999)}`;
	positivePayload5.category = "Tools";
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
		// Test with invalid Authorization headers
		const negativeHeaders = [
			{ Authorization: `asdf${user.token}` }, // Invalid token
			{ Authorization: `` }, // Empty header value
		];

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
		negativeHeaders.forEach((header, index) => {
			assertHandler({
				currentTestName: `invalid token ${index}`,
				featureName: featureName,
				route: route,
				body: positivePayload1,
				headers: header,
				expectedCase: {
					["should return 401"]: (_parsed, res) => res.status === 401,
				},
				options: [],
				config: config,
				tags: {},
			});
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
		console.log("payload", payload)
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

	// TODO: test conflict payload
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

	// sempetin insert untuk assert get
		// Generate the important metric
		
		let dummyPayloads = [];
		dummyPayloads.push({
			name: generateRandomName(),
			category: "Food",
			qty: 1_000,
			price: cheapestPrice,
			sku: `sku${generateRandomNumber(10000, 99999)}`,
			// added later when ready to test positive payload
			fileId: fileToTest.fileId,
		});
		dummyPayloads.push({
			name: generateRandomName(),
			category: "Furniture",
			qty: 2,
			price: expensivePrice,
			sku: `sku${generateRandomNumber(10000, 99999)}`,
			// added later when ready to test positive payload
			fileId: fileToTest.fileId,
		})
	
		for (let i = 0; i < 10; i++) {
			const payload1 = {
				name: generateRandomName(),
				category: "Food",
				qty: generateRandomNumber(2,1000),
				price: generateRandomNumber(100,2_000_000),
				sku: `sku${generateRandomNumber(10000, 99999)}`,
				fileId: fileToTest.fileId,
			};
			const payload2 = clone(payload1);
			payload2.sku = `sku${generateRandomNumber(10000, 99999)}`;
			payload2.category = "Beverage";
			const payload3 = clone(payload1);
			payload3.sku = `sku${generateRandomNumber(10000, 99999)}`;
			payload3.category = "Clothes";
			const payload4 = clone(payload1);
			payload4.sku = `sku${generateRandomNumber(10000, 99999)}`;
			payload4.category = "Furniture";
			const payload5 = clone(payload1);
			payload5.sku = `sku${generateRandomNumber(10000, 99999)}`;
			payload5.category = "Tools";
			dummyPayloads.push(payload1);
			dummyPayloads.push(payload2);
			dummyPayloads.push(payload3);
			dummyPayloads.push(payload4);
			dummyPayloads.push(payload5);
		}
	
		dummyPayloads.forEach(payload => {
			console.log("dummy payload", payload)
			var postResult = assertHandler({
				currentTestName: "prepare dummy",
				featureName: featureName,
				route: route,
				body: payload,
				headers: positiveHeader,
				expectedCase: {},
				options: [],
				config: config,
				tags: {},
			});
			console.log("postResult", postResult)
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
 * @type {import("../types/scenario.js").Scenario<import("../entity/app.js").Product[]|undefined>>}
 */
export function GetProductScenario(config, tags, info) {
	const featureName = "Get Product";
	const route = config.baseUrl + "/v1/product";
	const assertHandler = testGetAssert;
	const postHandler = testPostJsonAssert;

	const user = info.user;
	if (!isUser(user)) {
		console.warn(`${featureName} needs a valid user`);
		return undefined;
	}

	const testBegin = new Date(info.testBeginTime);
	const now = new Date();

	// --- Positive Case ---
	/** @type {import("src/types/assertion.js").Checkers} */
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
    headers: { Authorization: user.token },
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
    headers: { Authorization: user.token },
    currentTestName: "success get product with limited date",
    expectedCase: combine(positiveCases, {
      ["should have less than 6 items"]: (parsed, _res) =>
        isTotalDataInRange(parsed, "[]", 0, 5),
      ["first item should the cheapest price of all"]: (parsed, _res) =>
        isEqualWith(parsed, "[0].price", (item) => {
					console.log("assert [0].price type", typeof item)
          if (typeof item === "number") {
            return item == cheapestPrice;
          }
          return false;
        }),
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
      newest: now.toISOString(),
    },
    headers: { Authorization: user.token },
    currentTestName: "success get product with limited date",
    expectedCase: combine(positiveCases, {
      ["should have less than 6 items"]: (parsed, _res) =>
        isTotalDataInRange(parsed, "[]", 0, 5),
      ["should have items within the range"]: (parsed, _res) =>
        isEqualWith(parsed, "[].createdAt", (item) => {
          if (typeof item === "string") {
            const date = new Date(item);
            return date <= now && date >= testBegin;
          }
          return false;
        }),
    }),
    tags: {},
  });

  // calorie range test
  assertHandler({
    featureName: featureName,
    config: config,
    route: route,
    params: {
      limit: 5,
      offset: 0,
      caloriesBurnedMin: 1,
      caloriesBurnedMax: 20,
    },
    headers: { Authorization: user.token },
    currentTestName: "success get product with limited calories",
    expectedCase: combine(positiveCases, {
      ["should have less than 6 items"]: (parsed, _res) =>
        isTotalDataInRange(parsed, "[]", 0, 5),
      ["should have items within the range"]: (parsed, _res) =>
        isEqualWith(parsed, "[].caloriesBurned", (item) => {
          if (typeof item === "number") {
            return item > 1 && item < 20;
          }
          return false;
        }),
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
      category: "Food",
    },
    headers: { Authorization: user.token },
    currentTestName: "success get product with limited pagination",
    expectedCase: combine(positiveCases, {
      ["should have less than 6 items"]: (parsed, _res) =>
        isTotalDataInRange(parsed, "[]", 0, 5),
      ["should have equal activityType"]: (parsed, _res) =>
        isEqual(parsed, "[].activityType", activities[0]),
    }),
    tags: {},
  });

  const positiveResult = assertHandler({
    featureName: featureName,
    config: config,
    route: route,
    params: {
      limit: 10,
      offset: 0,
    },
    headers: { Authorization: user.token },
    currentTestName: "success get product",
    expectedCase: combine(positiveCases, {
      ["should have less than 11 items"]: (parsed, _res) =>
        isTotalDataInRange(parsed, "[]", 0, 10),
    }),
    tags: {},
  });


	const positiveResultFetchAll = assertHandler({
		featureName: featureName,
		config: config,
		route: route,
		params: {},
		headers: { Authorization: user.token },
		currentTestName: "success get product",
		expectedCase: positiveCases,
		tags: {},
	});

	console.log("positiveResult", positiveResult)
	if (positiveResult.isSuccess) {
		return getProducts(positiveResult.res, {}, featureName);
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
 * @type {import("../types/scenario.js").Scenario<import("../entity/app.js").Product | undefined>}
 */
export function PutProductScenario(config, tags, info) {
	const featureName = "Put Product";
	const route = config.baseUrl + "/v1/product/:productId";
	const assertHandler = testPutJsonAssert;
	const user = info.user;
	if (!isUser(user)) {
		console.warn(`${featureName} needs a valid user or file`);
		return undefined;
	}

	// akses objek produk via k6
	const mockProduct = info.product;
	if (!isProduct(mockProduct)) {
		console.warn(`${featureName} needs a valid product`);
		return undefined;
	}

	console.log("mockProduct", mockProduct);
	// dari sini sudah bisa pakai mockProduct

	const positivePayload1 = {
		productId: mockProduct.productId,
		name: generateRandomName(),
		category: "Food",
		qty: 1,
		price: 100,
		sku: "sku12345",
		fileId: validFileId[generateRandomNumber(0, validFileId.length - 1)],
		fileUri: "file1.jpeg",
		fileThumbnailUri: "tmb_file1.jpeg",
	};

	const positivePayload2 = clone(positivePayload1);
	positivePayload2.category = "Beverage";
	const positivePayload3 = clone(positivePayload1);
	positivePayload3.category = "Clothes";
	const positivePayload4 = clone(positivePayload1);
	positivePayload4.category = "Furniture";
	const positivePayload5 = clone(positivePayload1);
	positivePayload5.category = "Tools";
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
			headers: { Authorization: user.token },
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
			headers: { Authorization: user.token },
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
			headers: { Authorization: user.token },
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
			headers: { Authorization: user.token },
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
				headers: { Authorization: user.token },
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
			headers: { Authorization: user.token },
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
 * @type {import("../types/scenario.js").Scenario<import("../entity/app.js").Product | undefined>}
 */
export function DeleteProductScenario(config, tags, info) {
	const featureName = "Delete Product";
	const route = config.baseUrl + "/v1/product/:productId";
	const assertHandler = testPutJsonAssert;
	const user = info.user;
	if (!isUser(user)) {
		console.warn(`${featureName} needs a valid user or file`);
		return undefined;
	}

	// akses objek produk via k6
	const mockProduct = info.product;
	if (!isProduct(mockProduct)) {
		console.warn(`${featureName} needs a valid product`);
		return undefined;
	}
	// dari sini sudah bisa pakai mockProduct

	const positivePayload1 = {
		productId: mockProduct.productId,
		name: generateRandomName(),
		category: "Food",
		qty: 1,
		price: 100,
		sku: "sku12345",
		fileId: validFileId[generateRandomNumber(0, validFileId.length - 1)],
		fileUri: "file1.jpeg",
		fileThumbnailUri: "tmb_file1.jpeg",
	};

	const negativePayload = clone(positivePayload1);
	negativePayload.productId = "idSalah0123";

	let positivePayloads = [positivePayload1];
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
			currentTestName: "productId is not exist",
			featureName: featureName,
			route: route,
			body: negativePayload,
			headers: { Authorization: user.token },
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
				headers: { Authorization: user.token },
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
			headers: { Authorization: user.token },
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
