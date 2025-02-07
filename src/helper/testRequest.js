import http from "k6/http";
import { assert } from "./assertion.js";
import { generateParamFromObj } from "./generator.js";

/**
 * Sends a Get request with JSON data to the specified route.
 * @param {string} route - The route to send the request to.
 * @param {import('../types/schema.d.ts').Params} params - The params that will be parsed into the URL.
 * @param {{[name: string]: string}} headersObj
 * @returns {import("../types/k6-http.d.ts").RefinedResponse<any>} - k6 http response.
 */
export function testGet(route, params, headersObj, tags = {}) {
  const queryParams = generateParamFromObj(params);
  const modifiedRoute = route + "?" + queryParams;

  return http.get(modifiedRoute, { headers: headersObj, tags: tags });
}

/**
 * Sends a Get request with JSON data to the specified route and asserts the response.
 * @param {string} featureName
 * @param {string} currentTestName
 * @param {string} route
 * @param {import('../types/schema.d.ts').Params} params
 * @param {{[name: string]: string}} headersObj
 * @param {import("../types/k6.d.ts").Checkers<import("k6/http").RefinedResponse<any>>} expectedCase
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @returns {import("../types/schema.d.ts").RequestAssertResponse<any>} - k6 http response.
 */
export function testGetAssert(
  currentTestName,
  featureName,
  route,
  params,
  headersObj,
  expectedCase,
  config,
  tags,
) {
  const res = testGet(route, params, headersObj, tags);
  const isSuccess = assert(
    res,
    "GET",
    generateParamFromObj(params),
    headersObj,
    `${featureName} | ${currentTestName}`,
    expectedCase,
    config,
  );
  return {
    isSuccess: isSuccess,
    res: res,
  };
}

/**
 * Sends a POST request with Multipart data to the specified route.
 * @param {string} route - The route to send the request to.
 * @param {import("k6/http").StructuredRequestBody} body - The request body data
 * @param {{ [name: string]: string }} headers - External headers other than `Content-Type`
 * @param {{ [name: string]: string }} tags - Tags for the request
 * @returns {import("../types/k6-http.d.ts").RefinedResponse<any>} - k6 http response.
 */
export function testPostMultipart(
  route,
  body,
  headers = {},
  tags = {},
) {
  return http.post(route, body, { headers: headers, tags: tags });
}
/**
 * Sends a POST request with JSON data to the specified route and asserts the response.
 * @param {string} featureName
 * @param {string} currentTestName
 * @param {string} route
 * @param {import("k6/http").StructuredRequestBody} body
 * @param {{[name: string]: string}} headers
 * @param {import("../types/k6.d.ts").Checkers<import("k6/http").RefinedResponse<any>>} expectedCase
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @returns {import("../types/schema.d.ts").RequestAssertResponse<any>} - k6 http response.
 */
export function testPostMultipartAssert(
  currentTestName,
  featureName,
  route,
  body,
  headers,
  expectedCase,
  config,
  tags,
) {

  const res = testPostMultipart(route, body, headers, tags);
  const isSuccess = assert(
    res,
    "POST",
    body,
    headers,
    `${featureName} | ${currentTestName}`,
    expectedCase,
    config,
  );
  return {
    isSuccess: isSuccess,
    res: res,
  };
}
/**
 * Sends a POST request with JSON data to the specified route.
 * @param {string} route - The route to send the request to.
 * @param {string | import("k6").JSONValue} body - The request body data
 * @param {{ [name: string]: string }} headers - External headers other than `Content-Type`
 * @param {{ [name: string]: string }} tags - Tags for the request
 * @param {("noContentType"|"plainBody")[]} options - Additional options for the request.
 *                                                     Available options: "", "noContentType", "plainBody"
 *                            Available options: `"noContentType"`, `"plainBody"`
 * @returns {import("../types/k6-http.d.ts").RefinedResponse<any>} - k6 http response.
 */
export function testPostJson(
  route,
  body,
  headers = {},
  tags = {},
  options = [],
) {
  let parsedBody =
    typeof body === "string" && options.includes("plainBody")
      ? body
      : JSON.stringify(body);
  return http.post(route, parsedBody, { headers: headers, tags: tags });
}

/**
 * Sends a POST request with JSON data to the specified route and asserts the response.
 * @param {string} featureName
 * @param {string} currentTestName
 * @param {string} route
 * @param {import("k6").JSONValue} body
 * @param {{[name: string]: string}} headersObj
 * @param {import("../types/k6.d.ts").Checkers<import("k6/http").RefinedResponse<any>>} expectedCase
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @param {("noContentType"|"plainBody")[]} options - Additional options for the request.
 * @returns {import("../types/schema.d.ts").RequestAssertResponse<any>} - k6 http response.
 */
export function testPostJsonAssert(
  currentTestName,
  featureName,
  route,
  body,
  headersObj,
  expectedCase,
  options = [],
  config,
  tags,
) {
  const headers = options.includes("noContentType")
    ? Object.assign({}, headersObj)
    : Object.assign({ "Content-Type": "application/json" }, headersObj);
  const res = testPostJson(route, body, headers, tags, options);
  const isSuccess = assert(
    res,
    "POST",
    body,
    headers,
    `${featureName} | ${currentTestName}`,
    expectedCase,
    config,
  );
  return {
    isSuccess: isSuccess,
    res: res,
  };
}

/**
 * Sends a PATCH request with JSON data to the specified route.
 * @param {string} route - The route to send the request to.
 * @param {string | import("k6").JSONValue} body - The JSON data to send in the request body.
 * @param {("noContentType"|"plainBody")[]} options - Additional options for the request.
 *                                                     Available options: "", "noContentType", "plainBody"
 * @param {{[name: string]: string}} headers - External headers other than `Content-Type`
 * @returns {import("../types/k6-http.d.ts").RefinedResponse<any>} - k6 http response.
 */
export function testPatchJson(
  route,
  body,
  headers,
  tags = {},
  options = [],
) {
  let parsedBody =
    typeof body === "string" && options.includes("plainBody")
      ? body
      : JSON.stringify(body);

  return http.patch(route, parsedBody, { headers: headers, tags: tags });
}

/**
 * Sends a PUT request with JSON data to the specified route and asserts the response.
 * @param {string} featureName
 * @param {string} currentTestName
 * @param {string} route
 * @param {string | import("k6").JSONValue} body
 * @param {{[name: string]: string}} headersObj
 * @param {import("../types/k6.d.ts").Checkers<import("k6/http").RefinedResponse<any>>} expectedCase
 * @param {import("../types/config.d.ts").Config} config
 * @param {("noContentType"|"plainBody")[]} options - Additional options for the request.
 * @param {{[name: string]: string}} tags
 * @returns {import("../types/schema.d.ts").RequestAssertResponse<any>} - k6 http response.
 */
export function testPatchJsonAssert(
  currentTestName,
  featureName,
  route,
  body,
  headersObj,
  expectedCase,
  options = [],
  config,
  tags,
) {
  const headers = options.includes("noContentType")
    ? Object.assign({}, headersObj)
    : Object.assign({ "Content-Type": "application/json" }, headersObj);
  const res = testPatchJson(route, body, headers, tags, options);
  const isSuccess = assert(
    res,
    "PATCH",
    body,
    headers,
    `${featureName} | ${currentTestName}`,
    expectedCase,
    config,
  );
  return {
    isSuccess: isSuccess,
    res: res,
  };
}
/**
 * Sends a PUT request with JSON data to the specified route.
 * @param {string} route - The route to send the request to.
 * @param {string | import("k6").JSONValue} body - The JSON data to send in the request body.
 * @param {("noContentType"|"plainBody")[]} options - Additional options for the request.
 *                                                     Available options: "", "noContentType", "plainBody"
 * @param {{[name: string]: string}} headers - External headers other than `Content-Type`
 * @returns {import("../types/k6-http.d.ts").RefinedResponse<any>} - k6 http response.
 */
export function testPutJson(route, body, headers, tags = {}, options = []) {
  let parsedBody =
    typeof body === "string" && options.includes("plainBody")
      ? body
      : JSON.stringify(body);

  return http.put(route, parsedBody, { headers: headers, tags: tags });
}

/**
 * Sends a PUT request with JSON data to the specified route and asserts the response.
 * @param {string} featureName
 * @param {string} currentTestName
 * @param {string} route
 * @param {string | import("k6").JSONValue} body
 * @param {{[name: string]: string}} headersObj
 * @param {import("../types/k6.d.ts").Checkers<import("k6/http").RefinedResponse<any>>} expectedCase
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @param {("noContentType"|"plainBody")[]} options - Additional options for the request.
 * @returns {import("../types/schema.d.ts").RequestAssertResponse<any>} - k6 http response.
 */
export function testPutJsonAssert(
  currentTestName,
  featureName,
  route,
  body,
  headersObj,
  expectedCase,
  options = [],
  config,
  tags,
) {
  const headers = options.includes("noContentType")
    ? Object.assign({}, headersObj)
    : Object.assign({ "Content-Type": "application/json" }, headersObj);
  const res = testPutJson(route, body, headers, tags, options);
  const isSuccess = assert(
    res,
    "PUT",
    body,
    headers,
    `${featureName} | ${currentTestName}`,
    expectedCase,
    config,
  );
  return {
    isSuccess: isSuccess,
    res: res,
  };
}
/**
 * Sends a DELETE request to the specified route.
 * @param {string} route - The route to send the request to.
 * @param {object} params - The params that will be parsed into the URL.
 * @param {{[name: string]: string}} headersObj - External headers other than `Content-Type`.
 * @returns {import("../types/k6-http.d.ts").RefinedResponse<any>} - k6 http response.
 */
export function testDelete(route, params, headersObj, tags = {}) {
  const queryParams = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");
  const modifiedRoute = route + "?" + queryParams;
  const headers = Object.assign({}, headersObj);

  return http.del(modifiedRoute, null, { headers: headers, tags: tags });
}

/**
 * Sends a DELETE request with JSON data to the specified route and asserts the response.
 * @param {string} featureName
 * @param {string} currentTestName
 * @param {string} route
 * @param {import('../types/schema.d.ts').Params} params
 * @param {import("k6").JSONValue} body
 * @param {{[name: string]: string}} headersObj
 * @param {import("../types/k6.d.ts").Checkers<import("k6/http").RefinedResponse<any>>} expectedCase
 * @param {import("../types/config.d.ts").Config} config
 * @param {{[name: string]: string}} tags
 * @returns {import("../types/schema.d.ts").RequestAssertResponse<any>} - k6 http response.
 */
export function testDeleteAssert(
  currentTestName,
  featureName,
  route,
  params,
  body,
  headersObj,
  expectedCase,
  config,
  tags,
) {
  const res = testDelete(route, params, headersObj, tags);
  const isSuccess = assert(
    res,
    "DELETE",
    body,
    headersObj,
    `${featureName} | ${currentTestName}`,
    expectedCase,
    config,
  );
  return {
    isSuccess: isSuccess,
    res: res,
  };
}
