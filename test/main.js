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
// import {
//   GetProfileScenario,
//   PostProfileEmailScenario,
//   PostProfilePhoneScenario,
//   PutProfileScenario,
// } from "./scenario/profileScenario.js";
// import {
//   PostPurchaseScenario,
//   PostPurchaseIdScenario
// } from "./scenario/purchaseScenario.js";
// import {
//   DeleteProductScenario,
//   GetProductScenario,
//   PostProductScenario,
//   PutProductScenario
// } from "./scenario/productScenario.js";

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
	};

	const tags = {
		env: "local",
	};
	console.log(`k6 | Firing to ${config.baseUrl}`);

	// ===== REGISTER TEST =====
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

	const postedProduct = PostProductScenario(config, tags, {
		user: emailUsr,
		file: uploadedFile,
	});
	PutProductScenario(config, tags, {
		user: emailUsr,
		file: uploadedFile,
		product: postedProduct,
	});
	GetProductScenario(config, tags, {
		user: emailUsr,
		product: postedProduct,
	});
	DeleteProductScenario(config, tags, {
		user: emailUsr,
		product: postedProduct,
	});
	const phoneUsr = RegisterPhoneScenario(config, tags, {});
	LoginPhoneScenario(config, tags, { user: phoneUsr });
	// PostProductScenario(config, tags, { user: emailUsr });
	// PostProfileEmailScenario(config, tags, { info: phoneUsr });

	// ===== PROFILE TEST =====
	// ===== DEPARTMENT TEST =====
}
