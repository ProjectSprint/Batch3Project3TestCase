// schema.d.ts
import { RefinedResponse, ResponseType, StructuredRequestBody } from "./k6-http"; // Adjust path if needed
import { Checkers } from "./k6"; // Adjust path if needed
import { Config } from "../entity/config"; // Adjust path if needed
import { JSONValue } from "k6";

export type RequestAssertResponse<T> = {
  res: RefinedResponse<T>;
  isSuccess: boolean;
};
export type SchemaRule = {
  notNull?: boolean;
  isUrl?: boolean;
  isEmail?: boolean;
  isPhoneNumber?: boolean;
  addPlusPrefixPhoneNumber?: boolean;
  type?: "string" | "string-param" | "number" | "boolean" | "object" | "array";
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: readonly string[];
  items?: SchemaRule;
  properties?: Record<string, SchemaRule>;
};

export type Schema = Record<string, SchemaRule>;

export type Params = Record<string, string | number | boolean>;

/**
 * Contextual information about the HTTP request that
 * produced the response being asserted. Used primarily for debugging.
 */
export type RequestContext = {
  method: string;
  /** The payload sent. Can be query string, JSON object/value, or structured body. */
  payload: JSONValue | StructuredRequestBody | string | null;
  headers: { [name: string]: string };
  /** The URL that was requested (can be useful if redirects occurred) */
  requestedUrl: string;
};

/**
 * Contextual information about the specific test being executed.
 */
export type TestContext = {
  /** A descriptive prefix for check names, e.g., "Feature Name | Test Case Name" */
  namePrefix: string;
};

/**
 * Options object for the main assertion function.
 */
export type AssertOptions = {
  /** The k6 response object to assert against. */
  response: RefinedResponse<ResponseType | undefined>;
  /** The checks (conditions) to perform on the response. */
  conditions: Checkers<any>; // Using 'conditions' as per original code
  /** Context about the test itself. */
  testContext: TestContext;
  /** Context about the request that led to the response. */
  requestContext: RequestContext;
  /** Configuration object (primarily for the debug flag). */
  config: Config;
};
