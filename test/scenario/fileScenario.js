import { file, get } from "k6/http";
import { check } from "k6";
import { getFile, isFile } from "../assertion/fileAssertion.js";
import { testPostMultipartAssert } from "../helper/testRequest.js";
import { isExists } from "../helper/assertion.js";
import { isUser } from "../assertion/userAssertion.js";

/**
 * @type {import("../types/scenario.js").Scenario<{file: import("../main.js").FileCollection, user: import("../entity/app.js").User | undefined},import("../entity/app.js").UploadedFile | undefined>}
 */
export function UploadFileScenario(config, tags, info) {
	const featureName = "Upload File";
	const route = config.baseUrl + "/v1/file";
	const assertHandler = testPostMultipartAssert;

	const user = info.user;
	const fileToTest = info.file;

	if (!isUser(user)) {
		console.warn(`${featureName} needs a valid user Type`);
		return undefined;
	}

	const positivePayload = {
		file: file(fileToTest.medium, fileToTest.mediumName, "image/jpeg"),
	};
	const positiveHeader = {
		Authorization: `${user.token}`,
	};

	if (config.runNegativeCase) {
		// Test without Authorization header
		assertHandler({
			currentTestName: "empty token",
			featureName: featureName,
			route: route,
			body: positivePayload, // Need a body for multipart request usually
			headers: {}, // No auth header
			expectedCase: {
				["should return 401"]: (_parsed, res) => res.status === 401,
			},
			config: config,
			tags: tags,
		});

		assertHandler({
			currentTestName: `invalid token`,
			featureName: featureName,
			route: route,
			body: positivePayload, // Need a body for multipart request
			headers: { Authorization: `` },
			expectedCase: {
				["should return 401"]: (_parsed, res) => res.status === 401,
			},
			config: config,
			tags: tags,
		});

		// Test invalid file type
		assertHandler({
			currentTestName: "invalid file type",
			featureName: featureName,
			route: route,
			body: {
				file: file(fileToTest.invalid, fileToTest.invalidName),
			},
			headers: positiveHeader,
			expectedCase: {
				["should return 400"]: (_parsed, res) => res.status === 400,
			},
			config: config,
			tags: tags,
		});

		// Test invalid file size
		assertHandler({
			currentTestName: "invalid file size",
			featureName: featureName,
			route: route,
			body: {
				file: file(fileToTest.big, fileToTest.bigName),
			},
			headers: positiveHeader,
			expectedCase: {
				["should return 400"]: (_parsed, res) => res.status === 400,
			},
			config: config,
			tags: tags,
		});
	}

	// --- Positive Case ---
	const uploadResult = assertHandler({
		currentTestName: "valid payload",
		featureName: featureName,
		route: route,
		body: positivePayload,
		headers: positiveHeader,
		expectedCase: {
			["should return 200"]: (_parsed, res) => res.status === 200,
			["should have fileId"]: (parsed, _res) =>
				isExists(parsed, "fileId", ["string"]),
			["should have fileUri"]: (parsed, _res) =>
				isExists(parsed, "fileUri", ["string"]),
			["should have fileThumbnailUri"]: (parsed, _res) =>
				isExists(parsed, "fileThumbnailUri", ["string"]),
		},
		config: config,
		tags: tags,
	});

	if (uploadResult.isSuccess) {
		return getFile(uploadResult.res, {}, featureName);
	} else {
		console.warn(
			`${featureName} | Skipping getFile due to failed upload assertions.`,
		);
		return undefined;
	}
}
