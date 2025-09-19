/** @returns {import("../types/typeAssertion").StringSchema} */
export const string = (opts = {}) => ({ type: "string", ...opts });

/** @returns {import("../types/typeAssertion").NumberSchema} */
export const number = (opts = {}) => ({ type: "number", ...opts });

/** @returns {import("../types/typeAssertion").NumberSchema} */
export const integer = (opts = {}) => ({ type: "integer", ...opts });

/** @returns {import("../types/typeAssertion").BooleanSchema} */
export const boolean = () => ({ type: "boolean" });

/** @template {import("../types/typeAssertion").JSONSchema} T @param {T} schema @returns {T} */
export const nullable = (schema) => ({ ...schema, nullable: true });

/**
 * @param {Record<string, import("../types/typeAssertion").JSONSchema>} properties
 * @param {{ required?: string[], additionalProperties?: boolean }} [opts]
 * @returns {import("../types/typeAssertion").ObjectSchema}
 */
export const object = (properties, opts = {}) => ({
	type: "object",
	properties: properties,
	required: opts && opts.required ? opts.required : [],
	additionalProperties:
		opts && typeof opts.additionalProperties === "boolean"
			? opts.additionalProperties
			: false,
});

/**
 * @param {import("../types/typeAssertion").JSONSchema} items
 * @param {{ minItems?: number, maxItems?: number, uniqueItems?: boolean }} [opts]
 * @returns {import("../types/typeAssertion").ArraySchema}
 */
export const array = (items, opts = {}) => ({
	type: "array",
	items: items,
	minItems:
		opts && typeof opts.minItems === "number" ? opts.minItems : undefined,
	maxItems:
		opts && typeof opts.maxItems === "number" ? opts.maxItems : undefined,
	uniqueItems:
		opts && typeof opts.uniqueItems === "boolean" ? opts.uniqueItems : false,
});

/**
 * Validate a value against a schema
 * @param {import("../types/typeAssertion").JSONSchema} schema
 * @param {unknown} value
 * @param {string} [path]
 * @returns {import("../types/typeAssertion").ValidationError[]}
 */
export function validate(schema, value, path = "") {
	/** @type {import("../types/typeAssertion").ValidationError[]} */
	const errors = [];

	/**
	 * @param {string} msg
	 * @param {unknown} val
	 * @param {string} [subPath]
	 */
	const fail = (msg, val, subPath) => {
		errors.push({
			path: subPath || path,
			message: msg,
			value: val,
		});
	};

	// Handle nullable
	if (schema.nullable && value === null) {
		return errors;
	}

	switch (schema.type) {
		case "string": {
			if (typeof value !== "string") {
				fail("Expected string", value, path);
			} else {
				if (schema.minLength !== undefined && value.length < schema.minLength)
					fail(`String shorter than ${schema.minLength}`, value, path);
				if (schema.maxLength !== undefined && value.length > schema.maxLength)
					fail(`String longer than ${schema.maxLength}`, value, path);
				if (schema.pattern && !new RegExp(schema.pattern).test(value))
					fail(`String does not match pattern ${schema.pattern}`, value, path);
			}
			break;
		}

		case "number":
		case "integer": {
			if (typeof value !== "number" || isNaN(value)) {
				fail("Expected number", value, path);
			} else {
				if (schema.type === "integer" && !Number.isInteger(value))
					fail("Expected integer", value, path);
				if (schema.minimum !== undefined && value < schema.minimum)
					fail(`Must be >= ${schema.minimum}`, value, path);
				if (schema.maximum !== undefined && value > schema.maximum)
					fail(`Must be <= ${schema.maximum}`, value, path);
			}
			break;
		}

		case "boolean": {
			if (typeof value !== "boolean") fail("Expected boolean", value, path);
			break;
		}

		case "object": {
			if (typeof value !== "object" || value === null || Array.isArray(value)) {
				fail("Expected object", value, path);
			} else {
				const props = schema.properties || {};

				for (const req of schema.required || []) {
					if (!(req in value))
						fail(
							`Missing required property: ${req}`,
							undefined,
							`${path}.${req}`,
						);
				}

				for (const [key, val] of Object.entries(value)) {
					if (props[key]) {
						errors.push(
							...validate(props[key], val, path ? `${path}.${key}` : key),
						);
					} else if (schema.additionalProperties === false) {
						fail(`Additional property '${key}' not allowed`, val, path);
					}
				}
			}
			break;
		}

		case "array": {
			if (!Array.isArray(value)) {
				fail("Expected array", value, path);
			} else {
				if (schema.minItems !== undefined && value.length < schema.minItems)
					fail(`Array too short, min ${schema.minItems}`, value, path);
				if (schema.maxItems !== undefined && value.length > schema.maxItems)
					fail(`Array too long, max ${schema.maxItems}`, value, path);
				if (schema.uniqueItems) {
					const seen = new Set();
					for (const item of value) {
						const key = JSON.stringify(item);
						if (seen.has(key)) fail("Array items must be unique", item, path);
						seen.add(key);
					}
				}
				for (let i = 0; i < value.length; i++) {
					errors.push(...validate(schema.items, value[i], `${path}[${i}]`));
				}
			}
			break;
		}
	}

	return errors;
}
