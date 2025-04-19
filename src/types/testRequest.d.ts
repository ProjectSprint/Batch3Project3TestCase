import { RefinedResponse, StructuredRequestBody, JSONValue, ResponseType } from 'k6/http';
import { Config } from '../entity/config';
import { Params, RequestAssertResponse as BaseRequestAssertResponse } from './schema';

/**
 * Type definition for a single checker function.
 * It receives the pre-parsed JSON body (or null if parsing failed)
 * and the original k6 response object.
 * @returns {boolean} True if the check passes, false otherwise.
 */
export type Checker = (parsedJson: JSONValue | null, response: RefinedResponse<ResponseType>) => boolean;

/**
 * Type definition for the collection of checks passed to the assert function.
 */
export type Checkers = Record<string, Checker>;

// Define RequestAssertResponse using ResponseType
export type RequestAssertResponse<T = ResponseType> = BaseRequestAssertResponse<T>;


// Base interface for common arguments
export interface BaseTestAssertArgs {
  currentTestName: string;
  featureName: string;
  route: string;
  expectedCase: Checkers;
  config: Config;
  headers?: { [name: string]: string };
  tags?: { [name: string]: string };
}

// Specific arguments for GET requests
export interface GetTestAssertArgs extends BaseTestAssertArgs {
  params: Params;
}

// Specific arguments for POST Multipart requests
export interface PostMultipartTestAssertArgs extends BaseTestAssertArgs {
  // Use ResponseType for the expected response if possible, otherwise leave as is
  expectedCase: Checkers;
  body: StructuredRequestBody;
}

// Type for options used in JSON requests
export type RequestBodyOption = "noContentType" | "plainBody";

// Specific arguments for POST JSON requests
export interface PostJsonTestAssertArgs extends BaseTestAssertArgs {
  body: string | JSONValue;
  options?: RequestBodyOption[];
}

// Specific arguments for PATCH JSON requests
export interface PatchJsonTestAssertArgs extends BaseTestAssertArgs {
  body: string | JSONValue;
  options?: RequestBodyOption[];
}

// Specific arguments for PUT JSON requests
export interface PutJsonTestAssertArgs extends BaseTestAssertArgs {
  body: string | JSONValue;
  options?: RequestBodyOption[];
}

// Specific arguments for DELETE requests
export interface DeleteTestAssertArgs extends BaseTestAssertArgs {
  params: Params;
  body?: JSONValue; // Optional: Body might be relevant for assertion/logging even if not sent
}
