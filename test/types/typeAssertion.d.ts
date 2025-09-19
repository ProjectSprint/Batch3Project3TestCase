export type JSONSchema =
	| StringSchema
	| NumberSchema
	| BooleanSchema
	| ObjectSchema
	| ArraySchema;

export interface StringSchema {
	type: "string";
	minLength?: number;
	maxLength?: number;
	pattern?: string;
	nullable?: boolean;
}

export interface NumberSchema {
	type: "number" | "integer";
	minimum?: number;
	maximum?: number;
	nullable?: boolean;
}

export interface BooleanSchema {
	type: "boolean";
	nullable?: boolean;
}

export interface ObjectSchema {
	type: "object";
	properties: Record<string, JSONSchema>;
	required?: string[];
	additionalProperties?: boolean;
	nullable?: boolean;
}

export interface ArraySchema {
	type: "array";
	items: JSONSchema;
	minItems?: number;
	maxItems?: number;
	uniqueItems?: boolean;
	nullable?: boolean;
}

export interface ValidationError {
	path: string;
	message: string;
	value: unknown;
}
