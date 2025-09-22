// VU credential throughout iterations

import { isFile } from "./assertion/fileAssertion.js";
import { isProduct } from "./assertion/productAssertion.js";
import { isPurchaseResponse } from "./assertion/purchaseAssertion.js";
import { isUser } from "./assertion/userAssertion.js";
import { runMultiplier, runWeighted } from "./helper/execution.js";
import {
	combine,
	generateRandomEmail,
	generateRandomName,
	generateRandomNumber,
	generateRandomPassword,
	generateRandomPhoneNumber,
	generateRandomUsername,
} from "./helper/generator.js";
import {
	testGet,
	testPostJson,
	testPostMultipart,
	testPutJson,
} from "./helper/testRequest.js";
import { file } from "k6/http";

const productTypes = ["Food", "Beverage", "Clothes", "Furniture", "Tools"];

/** @type {import("./entity/app.js").Product[]} */
let globalProducts = [];

/** @type {import("./entity/app.js").User} */
let user = {
	email: "",
	password: "",
	phone: "",
	token: "",
	bankAccountHolder: "",
	bankAccountNumber: "",
	bankAccountName: "",
	fileId: "",
	fileUri: "",
	fileThumbnailUri: "",
};

/**
 * @param {import("./types/config").Config} config
 */
function signUpUser(config) {
	/** @type {import("k6/http").RefinedResponse<any>} */
	let res;
	const route = { suffix: "email", payload: {} };
	if (Math.random() >= 0.5) {
		route.payload = {
			email: generateRandomEmail(),
			password: generateRandomPassword(8, 32),
		};
	} else {
		route.suffix = "phone";
		route.payload = {
			phone: generateRandomPhoneNumber(true),
			password: generateRandomPassword(8, 32),
		};
	}

	res = testPostJson(
		config.baseUrl + "/v1/register/" + route.suffix,
		route.payload,
		{},
	);
	if (!res || !res.body) return;
	try {
		const usrJson = JSON.parse(res.body.toString());
		route.payload = combine(usrJson, route.payload);
		if (isUser(route.payload)) {
			user = combine(usrJson, route.payload);
			return true;
		}
		return undefined;
	} catch {
		return undefined;
	}
}

/**
 * @param {import("./types/config").Config} config
 */
function loginUser(config) {
	/** {@type {RefinedResponse<any>} */
	let res;
	const route = { suffix: "email", payload: {} };
	if (user.email != "") {
		route.payload = {
			email: user.email,
			password: user.password,
		};
	} else {
		route.suffix = "phone";
		route.payload = {
			phone: user.phone,
			password: user.password,
		};
	}

	res = testPostJson(
		config.baseUrl + "/v1/login/" + route.suffix,
		route.payload,
		{},
	);

	if (!res || !res.body) return;
	try {
		const usrJson = JSON.parse(res.body.toString());
		route.payload = combine(usrJson, route.payload);
		if (isUser(route.payload)) {
			user = combine(usrJson, route.payload);
			return true;
		}
		return undefined;
	} catch {
		return undefined;
	}
}

const medFile = open("./figure/image-100KB.jpg", "b");
/**
 * @param {import("./types/config").Config} config
 */
function uploadFile(config) {
	const filePayload = {
		file: file(medFile, `med_${generateRandomNumber(5, 32)}.jpg`, "image/jpeg"),
	};
	const fileRes = testPostMultipart(
		config.baseUrl + "/v1/file",
		filePayload,
		{},
	);
	try {
		const fileJson = fileRes.json();
		if (isFile(fileJson)) {
			return fileJson;
		}
		return undefined;
	} catch {
		return undefined;
	}
}
/**
 * @param {import("./types/config").Config} config
 */
function updateUserProfile(config) {
	const usrHeader = { Authorization: `Bearer ${user.token}` };
	const file = uploadFile(config);
	if (!file) {
		return undefined;
	}
	runMultiplier(
		testGet,
		[config.baseUrl + "/v1/user", {}, usrHeader, {}],
		10,
		0.3,
	);

	runWeighted(
		testPutJson,
		[
			config.baseUrl + "/v1/user",
			{
				fileId: file.fileId,
				bankAccountName: generateRandomUsername(),
				bankAccountHolder: generateRandomUsername(),
				bankAccountNumber: `${generateRandomNumber(9999, 999999999999)}`,
			},
			usrHeader,
			{},
		],
		0.2,
	);

	if (user.email == "") {
		const generatedEmail = generateRandomEmail();
		const res = runWeighted(
			testPostJson,
			[
				config.baseUrl + "/v1/user/link/email",
				{
					email: generatedEmail,
				},
				usrHeader,
				{},
			],
			0.2,
		);
		if (res && res.status == 200) {
			user.email = generatedEmail;
		}
	}
	if (user.phone == "") {
		const generatedPhone = generateRandomPhoneNumber(true);
		const res = runWeighted(
			testPostJson,
			[
				config.baseUrl + "/v1/user/link/phone",
				{
					phone: generatedPhone,
				},
				usrHeader,
				{},
			],
			0.2,
		);
		if (res && res.status == 200) {
			user.phone = generatedPhone;
		}
	}
}

/**
 * @param {import("./types/config").Config} config
 */
function manageProducts(config) {
	const usrHeader = { Authorization: `Bearer ${user.token}` };
	if (globalProducts.length < 20) {
		const productFile = uploadFile(config);
		if (!productFile) return;
		const productRes = testPostJson(
			config.baseUrl + "/v1/product",
			{
				name: generateRandomName(),
				category:
					productTypes[generateRandomNumber(0, productTypes.length - 1)],

				qty: 1,
				price: 100,
				sku: `sku${generateRandomNumber(10000, 99999)}`,
				fileId: productFile.fileId,
			},
			usrHeader,
			{},
		);
		try {
			const productJson = productRes.json();
			if (isProduct(productJson)) {
				globalProducts.push(productJson);
			}
		} catch {
			return undefined;
		}
	} else {
		if (Math.random() < 0.2) {
			const productFile = uploadFile(config);
			if (!productFile) return;
			testPostJson(
				config.baseUrl + "/v1/product",
				{
					name: generateRandomName(),
					category:
						productTypes[generateRandomNumber(0, productTypes.length - 1)],

					qty: 1,
					price: 100,
					sku: `sku${generateRandomNumber(10000, 99999)}`,
					fileId: productFile.fileId,
				},
				usrHeader,
				{},
			);
		}
	}

	if (Math.random() < 0.2) {
		const productFile = uploadFile(config);
		if (!productFile) return;
		testPutJson(
			config.baseUrl + "/v1/product",
			{
				name: generateRandomName(),
				category:
					productTypes[generateRandomNumber(0, productTypes.length - 1)],
				qty: 1,
				price: 100,
				sku: `sku${generateRandomNumber(10000, 99999)}`,
				fileId: productFile.fileId,
			},
			usrHeader,
			{},
		);
	}

	runMultiplier(
		testGet,
		[
			config.baseUrl + "/v1/product",
			{
				category:
					productTypes[generateRandomNumber(0, productTypes.length - 1)],
			},
			{},
			{},
		],
		2,
		0.2,
	);

	runMultiplier(
		testGet,
		[config.baseUrl + "/v1/product", {}, usrHeader, {}],
		20,
		0.1,
	);

	if (globalProducts.length === 0) return;
	runMultiplier(
		testGet,
		[
			config.baseUrl + "/v1/product",
			{
				sku: globalProducts[generateRandomNumber(0, globalProducts.length - 1)]
					.sku,
			},
			{},
			{},
		],
		2,
		0.2,
	);
	runMultiplier(
		testGet,
		[
			config.baseUrl + "/v1/product",
			{
				productId:
					globalProducts[generateRandomNumber(0, globalProducts.length - 1)]
						.productId,
			},
			{},
			{},
		],
		2,
		0.2,
	);
}

/**
 * @param {import("./types/config").Config} config
 */
function browseAndPurchaseProducts(config) {
	/** @type {import("./entity/app.js").Product[]} */
	const products = [];
	const getFirst = runMultiplier(
		testGet,
		[
			config.baseUrl + "/v1/product",
			{
				limit: 10,
				offset: 0,
			},
			{},
			{},
		],
		10,
		0.1,
	);
	getFirst.forEach((res) => {
		try {
			const json = res.json();
			if (Array.isArray(json) && json.every(isProduct)) {
				json.forEach((i) => {
					products.push(i);
				});
			}
		} catch {}
	});
	const getSecond = runMultiplier(
		testGet,
		[
			config.baseUrl + "/v1/product",
			{
				limit: 10,
				offset: 10,
			},
			{},
			{},
		],
		3,
		0.1,
	);
	getSecond.forEach((res) => {
		try {
			const json = res.json();
			if (Array.isArray(json) && json.every(isProduct)) {
				json.forEach((i) => {
					products.push(i);
				});
			}
		} catch {}
	});
	runWeighted(
		testGet,
		[
			config.baseUrl + "/v1/product",
			{
				limit: 10,
				offset: 20,
			},
			{},
			{},
		],
		0.5,
	);

	if (Math.random() < 0.8) {
		/** @type {Array<{ productId: string; qty: number }>} */
		const items = [];
		products.forEach((p) => {
			if (p && Math.random() > 0.8) {
				items.push({
					productId: p.productId,
					qty: generateRandomNumber(1, p.qty),
				});
			}
		});
		if (items.length === 0) return;

		/** @type {import("./entity/app.js").PurchaseRequest} */
		let purchaseRequest = {
			purchasedItems: items,
			senderName: generateRandomName(),
			senderContactType: "phone",
			senderContactDetail: "",
		};
		if (Math.random() <= 0.5) {
			purchaseRequest.senderContactDetail = generateRandomPhoneNumber(true);
		} else {
			purchaseRequest.senderContactType = "email";
			purchaseRequest.senderContactDetail = generateRandomEmail();
		}

		const purchaseRes = testPostJson(
			config.baseUrl + "/v1/purchase",
			purchaseRequest,
			{},
			{},
		);
		try {
			const purchaseJson = purchaseRes.json();
			if (isPurchaseResponse(purchaseJson)) {
				/** @type {string[]} */
				const fileReceipts = [];
				const filesRes = runMultiplier(uploadFile, [config], 2, 0.5);
				filesRes.forEach((fileRes) => {
					if (fileRes) {
						fileReceipts.push(fileRes.fileId);
					}
				});

				if (fileReceipts.length) {
					testPostJson(
						config.baseUrl + "/v1/purchase/" + purchaseJson.purchaseId,
						{
							fileIds: fileReceipts,
						},
						{},
						{},
					);
				}
			}
			return undefined;
		} catch {
			return undefined;
		}
	}
}
/**
 * @param {import("./types/config").Config} config
 */
export function runLoadTest(config) {
	if (!user.token) {
		if (!signUpUser(config)) {
			return;
		}
	}
	loginUser(config);
	updateUserProfile(config);
	manageProducts(config);
	browseAndPurchaseProducts(config);
}
