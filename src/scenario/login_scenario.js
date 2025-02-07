import { isUser } from "../caster/caster.js";
import { isEqual, isExists } from "../helper/assertion.js";
import {
  combine,
} from "../helper/generator.js";
import { testPostJsonAssert } from "../helper/request.js";

/**
 * @param {import("../types/config.d.ts").Config} config
 * @param {User} user
 * @returns {User | undefined}
 */
export function doLogin(config, user) {
  const featureName = "Login";
  const route = config.baseUrl + "/v1/login";
  const assertHandler = testPostJsonAssert;

  const positivePayload = {
    email: user.email,
    password: user.password,
  };

  const res = assertHandler(
    "valid payload", featureName, route, positivePayload, {},
    {
      ["should return 200"]: (v) => v.status === 200,
      ["should have email and equal"]: (v) => isEqual(v, "email", user.email),
      ["should have token"]: (v) => isExists(v, "token", ["string"]),
    },
    [], config, {});
  if (res.isSuccess) {
    try {
      const jsonResult = res.res.json();
      if (jsonResult && isUser(jsonResult)) {
        return combine(jsonResult, positivePayload)

      }
    } catch (e) {
      console.log(featureName + " | failed to parse json", e)
    }
  }
  return
}
