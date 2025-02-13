import { check } from "k6";

/**
 * Asserts the response of a k6 request.
 * @param {import('../types/k6-http.d.ts').RefinedResponse<import("../types/k6-http.d.ts").ResponseType | undefined>} k6response
 * @param {string} httpMethod
 * @param {import("k6").JSONValue | import("../types/k6-http.d.ts").StructuredRequestBody} requestPayload
 * @param {{[name: string]: string}} requestHeader
 * @param {string} featureName
 * @param {import("src/types/k6.js").Checkers<any>} conditions
 * @param {import("src/entity/config.js").Config} config
 * @returns {Boolean}
 */
export function assert(
  k6response,
  httpMethod,
  requestPayload,
  requestHeader,
  featureName,
  conditions,
  config,
) {
  /** @type Record<string, import("src/types/k6.js").Checker<any>> **/
  const checks = {};

  Object.keys(conditions).forEach((testMsg) => {
    let condition = conditions[testMsg];
    let testName = featureName + " | " + testMsg;
    if (config.debug) {
      condition = () => {
        const res = conditions[testMsg](k6response);
        console.log(testName + " | assert result:", res);
        return res;
      };
    }
    checks[testName] = condition;
  });

  if (config.debug) {
    console.log(featureName + " | request path:", httpMethod, k6response.url);
    console.log(featureName + " | request header:", requestHeader);
    console.log(featureName + " | request payload:", requestPayload);
    console.log(featureName + " | response code:", k6response.status);
    console.log(featureName + " | response payload:", k6response.body);
  }

  return check(k6response, checks);
}
/**
 * Checks whether k6 response has the data that the query asks
 * @param {import('../types/k6-http.d.ts').RefinedResponse<import("../types/k6-http.d.ts").ResponseType | undefined>} v
 * @param {import('../types/k6-http.d.ts').RefinedResponse<import("../types/k6-http.d.ts").ResponseType | undefined>} vc
 * @param {string} query
 * @returns {Boolean}
 */
export function isEveryItemDifferent(v, vc, query,) {
  try {
    const obj = v.json();
    const vComparator = vc.json()
    const res = traverseObject(obj, query);
    const resComparator = traverseObject(vComparator, query);

    // Compare each item against all items in comparator
    return res.every((item) => {
      // Return false if query wasn't deep enough (still array or object)
      if (Array.isArray(item) || (typeof item === 'object' && item !== null)) {
        return false;
      }

      // Compare against each comparator item
      return resComparator.every(comparatorItem => {
        // Return false if query wasn't deep enough for comparator
        if (Array.isArray(comparatorItem) ||
          (typeof comparatorItem === 'object' && comparatorItem !== null)) {
          return false;
        }

        // Handle null cases
        if (item === null || comparatorItem === null) {
          return false;
        }

        // Return false if types are different
        if (typeof item !== typeof comparatorItem) {
          return false;
        }

        // For primitive types, must be different from all comparator items
        return item !== comparatorItem;
      });
    });
  } catch (e) {
    return false;
  }
}

/**
 * Checks whether k6 response has the data that the query asks
 * @param {import('../types/k6-http.d.ts').RefinedResponse<import("../types/k6-http.d.ts").ResponseType | undefined>} v
 * @param {string} searchStr
 * @param {string} query
 * @returns {Boolean}
 */
export function isEveryItemContain(v, query, searchStr) {
  try {
    const obj = v.json();
    const res = traverseObject(obj, query);

    // Check each item
    return res.every(item => {
      // Handle null and undefined cases
      if (item === null || item === undefined) {
        return false;
      }

      // Return false if not a string
      if (typeof item !== 'string') {
        return false;
      }

      // Check if string contains searchStr
      return item.toLowerCase().includes(searchStr.toLowerCase());
    });
  } catch (e) {
    return false;
  }
}

/**
 * Checks whether k6 response has the data that the query asks and matches any of the expected types
 * @param {import('../types/k6-http.d.ts').RefinedResponse<import("../types/k6-http.d.ts").ResponseType | undefined>} v
 * @param {string} query
 * @param {Array<'string'|'number'|'object'|'boolean'|null>} expectedTypes
 * @returns {Boolean}
 */
export function isExists(v, query, expectedTypes) {
  try {
    const obj = v.json();
    const res = traverseObject(obj, query);

    return res.every(value => {
      if (expectedTypes.includes(null) && value === null) {
        return true;
      }
      const valueType = typeof value;
      if (valueType === 'string' || valueType === 'number' ||
        valueType === 'boolean' || valueType === 'object') {
        return expectedTypes.includes(valueType);
      }
      return false;
    });
  } catch (e) {
    return false;
  }
}
/**
 * validate ISO date string
 * @param {string} dateString
 * @returns {Boolean}
 */
export function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime()); // getTime() returns NaN for 'Invalid Date'
}

/**
 * Helper function to check if a string is a valid URL.
 * @param {string} url - The URL to check.
 * @returns {boolean} - Returns true if the URL is valid, otherwise false.
 */
export function isValidUrl(url) {
  // Implement your URL validation logic here
  // This is just a placeholder implementation
  return url.startsWith("http://") || url.startsWith("https://");
}

/**
 * This is a callback function.
 * @callback EqualWithCallback
 * @param {Array<import("k6").JSONValue>} arr - The array parameter.
 * @returns {boolean} - The return value.
 */

/**
 * Checks if the value `v` is equal to the result of traversing the object `v.json()` using the provided `query`.
 *
 * @param {import('../types/k6-http.d.ts').RefinedResponse<import("../types/k6-http.d.ts").ResponseType | undefined>} v
 * @param {string} query - The query used to traverse the object.
 * @param {EqualWithCallback} cb - The callback function to be called with the result of the traversal.
 * @returns {boolean} - Returns `true` if the value is equal to the result of the traversal, otherwise `false`.
 */
export function isEqualWith(v, query, cb) {
  try {
    const obj = v.json();
    const res = traverseObject(obj, query);
    return cb(res);

  } catch (e) {
    return false;
  }
}

/**
 * Checks whether k6 response has the data that the query asks and matches it
 * @param {import('../types/k6-http.d.ts').RefinedResponse<import("../types/k6-http.d.ts").ResponseType | undefined>} v
 * @param {string} query
 * @param {any} expected
 * @returns {Boolean}
 */
export function isEqual(v, query, expected) {
  try {
    const obj = v.json();
    const res = traverseObject(obj, query);
    return res.includes(expected);

  } catch (e) {
    return false;
  }
}

/**
 * This is a callback function.
 * @callback ConversionCallback
 * @param {any} item - The array parameter.
 * @returns {any} - The return value.
 */

/**
 * Checks if the values in an object's property are ordered in a specified manner.
 * @param {import('../types/k6-http.d.ts').RefinedResponse<import("../types/k6-http.d.ts").ResponseType | undefined>} v
 * @param {"asc"|"desc"} ordered - The order in which the values should be checked. Can be 'asc' for ascending order or 'desc' for descending order.
 * @param {string} key - The key of the property to be checked.
 * @param {ConversionCallback} conversion - The callback function to convert the values to the desired type.
 * @returns {boolean} - Returns true if the values are ordered as specified, false otherwise.
 */
export function isOrdered(v, key, ordered, conversion) {
  try {
    const obj = v.json();
    const res = traverseObject(obj, key).map(conversion);
    if (ordered === "asc") {
      return res.every((val, i) => i === 0 || val >= res[i - 1]);
    } else {
      return res.every((val, i) => i === 0 || val <= res[i - 1]);
    }

  } catch (e) {
    return false;
  }
}

/**
 * Checks if the total data in a given object is within a specified range.
 * @param {import('../types/k6-http.d.ts').RefinedResponse<import("../types/k6-http.d.ts").ResponseType | undefined>} v
 * @param {string} key - The key to traverse in the object.
 * @param {number} min - The minimum number of elements allowed in the range.
 * @param {number} max - The maximum number of elements allowed in the range.
 * @returns {boolean} - Returns true if the total data is within the specified range, false otherwise.
 */
export function isTotalDataInRange(v, key, min, max) {
  try {
    const obj = v.json();
    const res = traverseObject(obj, key);
    return res.length >= min && res.length <= max;

  } catch (e) {
    return false;
  }
}
/**
 * @callback MapCallback
 * @param {import("k6").JSONValue} item - The current item being processed
 * @returns {Array<import("k6").JSONValue>} The transformed items
 */

/**
 * flat the map
 * @param {Array<import("k6").JSONValue>} arr - The array to traverse
 * @param {MapCallback} callback - The callback function to transform items
 * @returns {Array<import("k6").JSONValue>}
 */
function flatMap(arr, callback) {
  /** @type {Array<import("k6").JSONValue>} */
  const result = [];

  for (const item of arr) {
    const callbackResult = callback(item);
    if (Array.isArray(callbackResult)) {
      for (const value of callbackResult) {
        result.push(value);
      }
    }
  }

  return result;
}

/**
 * Traverses an object and retrieves the values based on the provided query.
 * Supports array traversal with "[]" notation.
 *
 * @param {import("k6").JSONValue} obj - The object to traverse.
 * @param {string} query - The query to specify the path of the values to retrieve.
 * @returns {Array<import("k6").JSONValue>} - An array of values retrieved from the object based on the query.
 */
export function traverseObject(obj, query) {
  if (Array.isArray(obj)) {
    if (!query.startsWith("[]")) {
      return [];
    }
    const remainingQuery = query.slice(2);
    if (!remainingQuery || remainingQuery === ".") {
      // Ensure we return an array that matches JSONValue
      return obj.map(item => item);
    }
    const cleanQuery = remainingQuery.startsWith(".") ? remainingQuery.slice(1) : remainingQuery;
    return flatMap(obj, item => traverseObject(item, cleanQuery));
  }

  const keys = query.split(".");
  /** @type {Array<import("k6").JSONValue>} */
  let result = [obj];

  for (const key of keys) {
    if (key === "[]") {
      result = flatMap(result, (item) =>
        Array.isArray(item) ? item.map(subItem => subItem) : []
      );
    } else if (key.endsWith("[]")) {
      const arrayKey = key.slice(0, -2);
      result = flatMap(result, (item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          const value = /** @type {import("k6").JSONObject} */ (item)[arrayKey];
          return Array.isArray(value) ? value.map(subItem => subItem) : [];
        }
        return [];
      });
    } else {
      result = result.map((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          const value = /** @type {import("k6").JSONObject} */ (item)[key];
          return value !== undefined ? value : null;
        }
        return null;
      });
    }
  }

  return result;
}
