// testRequest.js
import http from "k6/http";
import { assert } from "./testAssertion.js"; // Adjust path if needed
import { generateParamFromObj } from "./generator.js"; // Adjust path if needed

/**
 * Sends a Get request with JSON data to the specified route.
 * @param {string} route - The route to send the request to.
 * @param {import('../types/schema.d.ts').Params} params - The params that will be parsed into the URL.
 * @param {{[name: string]: string}} headersObj - Request headers.
 * @param {{[name: string]: string}} tags - Request tags.
 * @returns {import("../types/k6-http.d.ts").RefinedResponse<any>} - k6 http response.
 */
export function testGet(route, params, headersObj = {}, tags = {}) {
  const queryParams = generateParamFromObj(params);
  const modifiedRoute = route + "?" + queryParams;

  // Ensure object shorthand rule is followed for params if k6 API requires it
  const requestParams = { headers: headersObj, tags: tags };
  return http.get(modifiedRoute, requestParams);
}

/**
 * Sends a POST request with Multipart data to the specified route.
 * @param {string} route - The route to send the request to.
 * @param {import("k6/http").StructuredRequestBody} body - The request body data
 * @param {{ [name: string]: string }} headers - External headers other than `Content-Type`
 * @param {{ [name: string]: string }} tags - Tags for the request
 * @returns {import("../types/k6-http.d.ts").RefinedResponse<any>} - k6 http response.
 */
export function testPostMultipart(route, body, headers = {}, tags = {}) {
  // Ensure object shorthand rule is followed for params if k6 API requires it
  const requestParams = { headers: headers, tags: tags };
  return http.post(route, body, requestParams);
}

/**
 * Sends a POST request with JSON data to the specified route.
 * @param {string} route - The route to send the request to.
 * @param {string | import("k6").JSONValue} body - The request body data
 * @param {{ [name: string]: string }} headers - Request headers.
 * @param {{ [name: string]: string }} tags - Tags for the request
 * @param {import('../types/testRequest.d.ts').RequestBodyOption[]} options - Additional options for the request.
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

  // Ensure object shorthand rule is followed for params if k6 API requires it
  const requestParams = { headers: headers, tags: tags };
  return http.post(route, parsedBody, requestParams);
}

/**
 * Sends a PATCH request with JSON data to the specified route.
 * @param {string} route - The route to send the request to.
 * @param {string | import("k6").JSONValue} body - The JSON data to send in the request body.
 * @param {{[name: string]: string}} headers - Request headers.
 * @param {{[name: string]: string}} tags - Request tags.
 * @param {import('../types/testRequest.d.ts').RequestBodyOption[]} options - Additional options for the request.
 * @returns {import("../types/k6-http.d.ts").RefinedResponse<any>} - k6 http response.
 */
export function testPatchJson(
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

  // Ensure object shorthand rule is followed for params if k6 API requires it
  const requestParams = { headers: headers, tags: tags };
  return http.patch(route, parsedBody, requestParams);
}

/**
 * Sends a PUT request with JSON data to the specified route.
 * @param {string} route - The route to send the request to.
 * @param {string | import("k6").JSONValue} body - The JSON data to send in the request body.
 * @param {{[name: string]: string}} headers - Request headers.
 * @param {{[name: string]: string}} tags - Request tags.
 * @param {import('../types/testRequest.d.ts').RequestBodyOption[]} options - Additional options for the request.
 * @returns {import("../types/k6-http.d.ts").RefinedResponse<any>} - k6 http response.
 */
export function testPutJson(
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

  // Ensure object shorthand rule is followed for params if k6 API requires it
  const requestParams = { headers: headers, tags: tags };
  return http.put(route, parsedBody, requestParams);
}

/**
 * Sends a DELETE request to the specified route.
 * @param {string} route - The route to send the request to.
 * @param {import('../types/schema.d.ts').Params} params - The params that will be parsed into the URL.
 * @param {{[name: string]: string}} headersObj - Request headers.
 * @param {{[name: string]: string}} tags - Request tags.
 * @returns {import("../types/k6-http.d.ts").RefinedResponse<any>} - k6 http response.
 */
export function testDelete(route, params, headersObj = {}, tags = {}) {
  const queryParams = generateParamFromObj(params);
  const modifiedRoute = route + "?" + queryParams;
  const headers = Object.assign({}, headersObj); // Keep explicit assignment for clarity / eslint rule

  // Ensure object shorthand rule is followed for params if k6 API requires it
  const requestParams = { headers: headers, tags: tags };
  return http.del(modifiedRoute, null, requestParams); // Body is null for DELETE
}

/**
 * Sends a Get request and asserts the response using object parameters.
 * @param {import("../types/testRequest.d.ts").GetTestAssertArgs} args - Arguments for the GET request and assertion.
 * @returns {import("../types/schema.d.ts").RequestAssertResponse<any>} - Assertion result and k6 http response.
 */
export function testGetAssert(args) {
  // Destructure arguments
  const {
    currentTestName,
    featureName,
    route,
    params,
    headers = {}, // Default optional args
    expectedCase,
    config,
    tags = {}, // Default optional args
  } = args;

  const res = testGet(route, params, headers, tags);
  const requestPayloadString = generateParamFromObj(params); // As per original assert usage
  const isSuccess = assert(
    res,
    "GET",
    requestPayloadString, // Pass stringified params to assert
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
 * Sends a POST Multipart request and asserts the response using object parameters.
 * @param {import("../types/testRequest.d.ts").PostMultipartTestAssertArgs} args - Arguments for the POST Multipart request and assertion.
 * @returns {import("../types/schema.d.ts").RequestAssertResponse<any>} - Assertion result and k6 http response.
 */
export function testPostMultipartAssert(args) {
  // Destructure arguments
  const {
    currentTestName,
    featureName,
    route,
    body,
    headers = {}, // Default optional args
    expectedCase,
    config,
    tags = {}, // Default optional args
  } = args;

  const res = testPostMultipart(route, body, headers, tags);
  const isSuccess = assert(
    res,
    "POST",
    body, // Pass the original body to assert
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
 * Sends a POST JSON request and asserts the response using object parameters.
 * @param {import("../types/testRequest.d.ts").PostJsonTestAssertArgs} args - Arguments for the POST JSON request and assertion.
 * @returns {import("../types/schema.d.ts").RequestAssertResponse<any>} - Assertion result and k6 http response.
 */
export function testPostJsonAssert(args) {
  // Destructure arguments
  const {
    currentTestName,
    featureName,
    route,
    body,
    headers: headersObj = {}, // Default optional args
    expectedCase,
    options = [], // Default optional args
    config,
    tags = {}, // Default optional args
  } = args;

  // Handle Content-Type header based on options
  const headers = options.includes("noContentType")
    ? Object.assign({}, headersObj)
    : Object.assign({ "Content-Type": "application/json" }, headersObj);

  const res = testPostJson(route, body, headers, tags, options);
  const isSuccess = assert(
    res,
    "POST",
    body, // Pass the original body to assert
    headers, // Pass potentially modified headers
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
 * Sends a PATCH JSON request and asserts the response using object parameters.
 * @param {import("../types/testRequest.d.ts").PatchJsonTestAssertArgs} args - Arguments for the PATCH JSON request and assertion.
 * @returns {import("../types/schema.d.ts").RequestAssertResponse<any>} - Assertion result and k6 http response.
 */
export function testPatchJsonAssert(args) {
  // Destructure arguments
  const {
    currentTestName,
    featureName,
    route,
    body,
    headers: headersObj = {}, // Default optional args
    expectedCase,
    options = [], // Default optional args
    config,
    tags = {}, // Default optional args
  } = args;

  // Handle Content-Type header based on options
  const headers = options.includes("noContentType")
    ? Object.assign({}, headersObj)
    : Object.assign({ "Content-Type": "application/json" }, headersObj);

  const res = testPatchJson(route, body, headers, tags, options);
  const isSuccess = assert(
    res,
    "PATCH",
    body, // Pass the original body to assert
    headers, // Pass potentially modified headers
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
 * Sends a PUT JSON request and asserts the response using object parameters.
 * @param {import("../types/testRequest.d.ts").PutJsonTestAssertArgs} args - Arguments for the PUT JSON request and assertion.
 * @returns {import("../types/schema.d.ts").RequestAssertResponse<any>} - Assertion result and k6 http response.
 */
export function testPutJsonAssert(args) {
  // Destructure arguments
  const {
    currentTestName,
    featureName,
    route,
    body,
    headers: headersObj = {}, // Default optional args
    expectedCase,
    options = [], // Default optional args
    config,
    tags = {}, // Default optional args
  } = args;

  // Handle Content-Type header based on options
  const headers = options.includes("noContentType")
    ? Object.assign({}, headersObj)
    : Object.assign({ "Content-Type": "application/json" }, headersObj);

  const res = testPutJson(route, body, headers, tags, options);
  const isSuccess = assert(
    res,
    "PUT",
    body, // Pass the original body to assert
    headers, // Pass potentially modified headers
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
 * Sends a DELETE request and asserts the response using object parameters.
 * @param {import("../types/testRequest.d.ts").DeleteTestAssertArgs} args - Arguments for the DELETE request and assertion.
 * @returns {import("../types/schema.d.ts").RequestAssertResponse<any>} - Assertion result and k6 http response.
 */
export function testDeleteAssert(args) {
  // Destructure arguments
  const {
    currentTestName,
    featureName,
    route,
    params,
    body, // Optional body for assertion/logging purposes
    headers = {}, // Default optional args
    expectedCase,
    config,
    tags = {}, // Default optional args
  } = args;

  const res = testDelete(route, params, headers, tags);
  const requestPayloadString = generateParamFromObj(params); // As per original assert usage
  const isSuccess = assert(
    res,
    "DELETE",
    body, // Use the body passed in args for assertion, even if not sent in DEL request itself
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
