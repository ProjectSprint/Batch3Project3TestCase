import http from "k6/http";
import { combine } from "../helper/generator.js"
import { assert, isExists } from "../helper/assertion.js"
import { isUser } from "../caster/caster.js"

/**
 * @param {User} user to register
 * @param {import("../types/config.d.ts").Config} config
 * @returns {{isCreated:boolean, user: User | null}}
 */
export function doRegister(config, user) {
  const featureName = "Register";
  const route = config.baseUrl + "/v1/register";

  const positivePayload = {
    email: user.email,
    password: user.password,
  };

  const res = http.post(route, JSON.stringify(positivePayload), {
    headers: { "Content-Type": "application/json" }
  })
  if (res.status === 409) {
    return {
      isCreated: false,
      user: user,
    }
  }
  const isSuccess = assert(
    res,
    "POST",
    positivePayload,
    { "Content-Type": "application/json" },
    `${featureName} | valid payload`,
    {
      ["should return 201"]: (v) => v.status === 201,
      ["should have email"]: (v) => isExists(v, "email", ["string"]),
      ["should have token"]: (v) => isExists(v, "token", ["string"]),
    },
    config,
  );
  if (isSuccess) {
    try {
      const jsonResult = res.json();
      if (jsonResult && isUser(jsonResult)) {
        return {
          isCreated: true,
          user: combine(jsonResult, positivePayload)
        }
      }
    } catch (e) {
      console.log(featureName + " | failed to parse json", e)
    }
  }
  return {
    isCreated: false,
    user: null,
  }

}
