import exec from "k6/execution";
import {
	RegisterEmailScenario,
	RegisterPhoneScenario,
} from "./scenario/registerScenario.js";
import {
	LoginEmailScenario,
	LoginPhoneScenario,
} from "./scenario/loginScenario.js";
import { GetProfileScenario } from "./scenario/profileScenario.js";
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
 * @type {import("./types/scenario.js").Scenarios}
 */
const scenarios = {
	RegisterEmailScenario: RegisterEmailScenario,
	RegisterPhoneScenario: RegisterPhoneScenario,
	LoginEmailScenario: LoginEmailScenario,
	LoginPhoneScenario: LoginPhoneScenario,
	// GetProfileScenario: GetProfileScenario,
	// PutProfileScenario: PutProfileScenario,
	// PostProfilePhoneScenario: PostProfilePhoneScenario,
	// PostProfileEmailScenario: PostProfileEmailScenario,
	// PostPurchaseScenario: PostPurchaseScenario,
	// PostPurchaseIdScenario: PostPurchaseIdScenario,
	// PostProductScenario: PostProductScenario,
	// GetProductScenario: GetProductScenario,
	// PutProductScenario: PutProductScenario,
	// DeleteProductScenario: DeleteProductScenario,
};

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
	GetProfileScenario(config, tags, { user: emailUsr });
	// PostProfilePhoneScenario(config, tags, { info: emailUsr });
	// PutProfileScenario(config, tags, { info: emailUsr });

	const phoneUsr = RegisterPhoneScenario(config, tags, {});
	LoginPhoneScenario(config, tags, { user: phoneUsr });
	// PostProfileEmailScenario(config, tags, { info: phoneUsr });

	// ===== PROFILE TEST =====
	// ===== DEPARTMENT TEST =====
}
