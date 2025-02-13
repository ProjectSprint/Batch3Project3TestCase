import { file, get } from "k6/http";
import { getFile, isFile } from "../assertion/fileAssertion.js";
import { check } from "k6";
import { testPostMultipartAssert } from "../helper/testRequest.js";
import { isExists } from "../helper/testAssertion.js";

/**
 * @param {import("src/entity/types.js").User} user
 * @param {{small: ArrayBuffer, smallName:string,medium: ArrayBuffer, mediumName:string,big: ArrayBuffer, bigName: string,invalid: ArrayBuffer,invalidName:string}} fileToTest
 * @param {import("../entity/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
  * @returns {import("src/entity/types.js").UploadedFile | undefined} uri
 */
export function UploadFileScenario(user, fileToTest, config, tags) {
  const featureName = "Upload File";
  const route = config.baseUrl + "/v1/file";
  const assertHandler = testPostMultipartAssert;

  const positivePayload = {
    file: file(fileToTest.small, fileToTest.smallName)
  };
  const positiveHeader = {
    Authorization: `Bearer ${user.token}`,
  };
  if (config.runNegativeCase) {
    assertHandler(
      "empty token", featureName, route, {}, {},
      {
        ["should return 401"]: (v) => v.status === 401,
      },
      config, tags,);
    const negativeHeaders = [
      { Authorization: `${user.token}`, },
      { Authorization: `Bearer asdf${user.token}`, },
      { Authorization: ``, },
    ];

    negativeHeaders.forEach((header) => {
      assertHandler(
        "invalid token", featureName, route, {}, header,
        {
          ["should return 401"]: (res) => res.status === 401,
        },
        config, tags,
      );
    });
    assertHandler(
      "invalid file type", featureName, route, {
      file: file(fileToTest.invalid, fileToTest.invalidName)
    },
      positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      config, tags,);
    assertHandler(
      "invalid file size", featureName, route,
      {
        file: file(fileToTest.big, fileToTest.bigName)
      },
      positiveHeader,
      {
        ["should return 400"]: (res) => res.status === 400,
      },
      config, tags,
    );
  }

  const res = assertHandler(
    "valid payload", featureName, route, positivePayload, positiveHeader,
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have fileId"]: (v) => isExists(v, "fileId", ["string"]),
      ["should have fileUri"]: (v) => isExists(v, "fileUri", ["string"]),
      ["should have fileThumbnailUri"]: (v) => isExists(v, "fileThumbnailUri", ["string"]),
    },
    config, tags,
  );

  if (res.isSuccess && config.runNegativeCase) {
    try {
      const result = res.res.json()
      if (isFile(result)) {
        const getResult = get(result.fileThumbnailUri)
        if (getResult.body instanceof ArrayBuffer) {
          const kilobytes = getResult.body.byteLength / 1024;
          check(kilobytes, { ['thumbnail should have less than 10KB']: (v) => v < 10 },)
        }
      }
    } catch (e) {
      console.log(featureName + " | error when checking the thumbnail", res)
    }
  }
  return getFile(res, {}, featureName)
}

