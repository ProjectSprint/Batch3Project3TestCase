import {
	RegisterEmailScenario,
	RegisterPhoneScenario,
} from "./scenario/registerScenario.js";
import {
	LoginEmailScenario,
	LoginPhoneScenario,
} from "./scenario/loginScenario.js";
import { UploadFileScenario } from "./scenario/fileScenario.js";
import { generateRandomNumber } from "./helper/generator.js";
import {
	GetProfileScenario,
	PostProfileEmailScenario,
	PostProfilePhoneScenario,
	PutProfileScenario,
} from "./scenario/profileScenario.js";
import {
	DeleteProductScenario,
	GetProductScenario,
	PostProductScenario,
	PutProductScenario,
} from "./scenario/productScenario.js";
import {
	PostPurchaseIdScenario,
	PostPurchaseScenario,
} from "./scenario/purchaseScenario.js";

export const options = {
	vus: 1,
	iterations: 1,
	tresholds: {
		http_req_failed: ["count<1"],
	},
};

const smallFile = open("./figure/image-50KB.jpg", "b");
const medFile = open("./figure/image-100KB.jpg", "b");
const bigFile = open("./figure/image-200KB.jpg", "b");
const invalidFile = open("./figure/sql-5KB.sql", "b");

/**
 * Represents a collection of file variants with different sizes and states.
 *
 * @typedef {Object} FileCollection
 * @property {ArrayBuffer} small - The binary data of the small file variant.
 * @property {string} smallName - The filename for the small file.
 * @property {ArrayBuffer} medium - The binary data of the medium file variant.
 * @property {string} mediumName - The filename for the medium file.
 * @property {ArrayBuffer} big - The binary data of the big file variant.
 * @property {string} bigName - The filename for the big file.
 * @property {ArrayBuffer} invalid - The binary data of the invalid file variant (e.g., corrupted or placeholder).
 * @property {string} invalidName - The filename for the invalid file.
 */

export default function () {
	/** @type {import("./types/config.js").Config} */
	const config = {
		baseUrl: __ENV.BASE_URL ? __ENV.BASE_URL : "http://localhost:8080",
		debug: __ENV.DEBUG ? true : false,
		runNegativeCase: true,
		runLoadTest: __ENV.LOAD_TEST ? true : false,
	};

	const tags = {
		env: "local",
	};
	console.log(`k6 | Firing to ${config.baseUrl}`);

	if (config.runLoadTest) {
	} else {
		runScenarios(config, tags);
	}

	// ===== PROFILE TEST =====
	// ===== DEPARTMENT TEST =====
}
/**
 *
 * @param {import("./types/config.js").Config} config ()
 * @param {Record<string,string>} tags
 * @returns
 */
function runScenarios(config, tags) {
	const emailUsr = RegisterEmailScenario(config, tags, {});
	LoginEmailScenario(config, tags, { user: emailUsr });

	/** @type {FileCollection} */
	const fileTest = {
		small: smallFile,
		smallName: `small_${generateRandomNumber(5, 32)}.jpg`,
		medium: medFile,
		mediumName: `med_${generateRandomNumber(5, 32)}.jpg`,
		big: bigFile,
		bigName: `big_${generateRandomNumber(5, 32)}.jpg`,
		invalid: invalidFile,
		invalidName: `invalid_${generateRandomNumber(5, 32)}.sql`,
	};
	const uploadedFile = UploadFileScenario(config, tags, {
		user: emailUsr,
		file: fileTest,
	});
	GetProfileScenario(config, tags, { user: emailUsr });
	PutProfileScenario(config, tags, { user: emailUsr, file: uploadedFile });
	PostProfilePhoneScenario(config, tags, {
		user: emailUsr,
	});
	PostProfileEmailScenario(config, tags, {
		user: emailUsr,
	});

	let postedProducts = PostProductScenario(config, tags, {
		user: emailUsr,
		file: uploadedFile,
		createCount: 10,
	});
	if (!postedProducts) {
		return;
	}
	PutProductScenario(config, tags, {
		user: emailUsr,
		file: uploadedFile,
		product: postedProducts[0],
	});
	GetProductScenario(config, tags, {});
	DeleteProductScenario(config, tags, {
		user: emailUsr,
		product: postedProducts[0],
	});
	postedProducts.shift();
	const purchase = PostPurchaseScenario(config, tags, {
		products: postedProducts,
	});
	PostPurchaseIdScenario(config, tags, {
		file: uploadedFile,
		purchase: purchase,
	});

	const phoneUsr = RegisterPhoneScenario(config, tags, {});
	LoginPhoneScenario(config, tags, { user: phoneUsr });
}
