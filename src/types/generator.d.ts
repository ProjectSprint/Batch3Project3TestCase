import { RefinedResponse, ResponseType, StructuredRequestBody } from "./k6-http"; // Adjust path if needed
import { Checkers } from "./k6";
import { Config } from "../entity/config";
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
