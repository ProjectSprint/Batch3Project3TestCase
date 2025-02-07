import { file } from "k6/http";
import { isExists } from "../helper/assertion.js";
import { withProbability } from "../helper/generator.js";
import { testPostMultipartAssert } from "../helper/request.js";

/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {User} user
 * @param {{small: ArrayBuffer, smallName:string,medium: ArrayBuffer, mediumName:string,big: ArrayBuffer, bigName: string,invalid: ArrayBuffer,invalidName:string}} fileToTest
  * @param {number} failedCaseProbability
  * @returns {string | undefined} uri
 */
export function doUpload(config, user, failedCaseProbability, fileToTest) {
  const featureName = "Upload File";
  const route = config.baseUrl + "/v1/file";
  const assertHandler = testPostMultipartAssert;
  const positivePayload = {
    file: file(fileToTest.small, fileToTest.smallName)
  };
  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };
  withProbability(failedCaseProbability, () => {
    assertHandler(
      "invalid file size", featureName, route,
      {
        file: file(fileToTest.big, fileToTest.bigName)
      },
      positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      config, {},
    );
  })

  const res = assertHandler(
    "valid payload", featureName, route, positivePayload, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have uri"]: (v) => isExists(v, "uri", ["string"]),
    },
    config, {},
  );
  if (res.isSuccess) {
    const jsonResult = res.res.json();
    if (jsonResult) {
      return /** @type {{uri:string}} */ (jsonResult).uri
    }
  }
}

