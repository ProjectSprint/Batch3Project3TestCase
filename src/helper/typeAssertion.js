/**
 * @typedef {Object} ValidationContext
 * @property {Object.<string, JSONSchemaDefinition>} definitions
 * @property {JSONSchemaDefinition} rootSchema
 */

/**
 * @typedef {Object} JSONSchemaDefinition
 * @property {string | string[]} [type]
 * @property {boolean} [additionalProperties]
 * @property {Object.<string, JSONSchemaDefinition>} [properties]
 * @property {string[]} [required]
 * @property {JSONSchemaDefinition} [items]
 * @property {string[]} [enum]
 * @property {string} [$ref]
 * @property {Object.<string, JSONSchemaDefinition>} [definitions]
 * @property {string} [$schema]
 */

/**
 * @param {JSONSchemaDefinition} schema
 * @returns {function(any): boolean}
 */
export function createValidator(schema) {
  /** @type {ValidationContext} */
  const context = {
    definitions: schema.definitions ? { ...schema.definitions } : {},
    rootSchema: schema
  };

  return function validate(value) {
    const resolvedSchema = resolveSchema(schema, context);
    return validateAgainstSchema(value, resolvedSchema, context);
  };
}

/**
 * @param {JSONSchemaDefinition} schema 
 * @param {ValidationContext} context
 * @returns {JSONSchemaDefinition}
 */
function resolveSchema(schema, context) {
  if (schema.$ref) {
    const path = schema.$ref.split('/');
    /** @type {Record<string, any>} */
    let currentSchema = context.rootSchema;

    // Skip the first element if it's # (common in OpenAPI)
    const startIndex = path[0] === '#' ? 1 : 0;

    for (let i = startIndex; i < path.length; i++) {
      const segment = path[i];
      if (typeof currentSchema !== 'object' || currentSchema === null) {
        throw new Error(`Invalid reference path: ${schema.$ref}`);
      }
      currentSchema = currentSchema[segment];
      if (!currentSchema) {
        throw new Error(`Invalid reference: ${schema.$ref}`);
      }
    }

    // Handle nested references
    if (currentSchema.$ref) {
      return resolveSchema(/** @type {JSONSchemaDefinition} */(currentSchema), context);
    }

    return /** @type {JSONSchemaDefinition} */ (currentSchema);
  }

  return schema;
}

/**
 * @param {any} value 
 * @param {string} type 
 * @returns {boolean}
 */
function validateType(value, type) {
  switch (type) {
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    case 'string':
      return typeof value === 'string';
    case 'number':
    case 'integer':
      return typeof value === 'number' && (type === 'number' || Number.isInteger(value));
    case 'boolean':
      return typeof value === 'boolean';
    case 'null':
      return value === null;
    default:
      return false;
  }
}

/**
 * @param {any} value
 * @param {JSONSchemaDefinition} schema
 * @param {ValidationContext} context
 * @returns {boolean}
 */
function validateAgainstSchema(value, schema, context) {
  // Handle null values with type arrays
  if (value === null) {
    if (Array.isArray(schema.type)) {
      return schema.type.includes('null');
    }
    return schema.type === 'null';
  }

  // Handle enums first
  if (schema.enum) {
    return schema.enum.includes(value);
  }

  // Handle type validation
  const types = Array.isArray(schema.type) ? schema.type : [schema.type || 'any'];

  const matchesType = types.some(type => {
    if (type === 'object' && (schema.properties || schema.additionalProperties !== undefined)) {
      return validateObject(value, schema, context);
    }
    if (type === 'array' && schema.items) {
      return validateArray(value, schema, context);
    }
    return validateType(value, type);
  });

  return matchesType;
}

/**
 * @param {any} value
 * @param {JSONSchemaDefinition} schema
 * @param {ValidationContext} context
 * @returns {boolean}
 */
function validateObject(value, schema, context) {
  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    return false;
  }

  // Validate required properties
  if (schema.required) {
    for (const requiredProp of schema.required) {
      if (!(requiredProp in value)) {
        return false;
      }
    }
  }

  // Validate additional properties
  if (schema.additionalProperties === false) {
    const allowedProperties = Object.keys(schema.properties || {});
    const actualProperties = Object.keys(value);
    if (actualProperties.some(prop => !allowedProperties.includes(prop))) {
      return false;
    }
  }

  // Validate defined properties
  if (schema.properties) {
    for (const [prop, propValue] of Object.entries(value)) {
      const propSchema = schema.properties[prop];
      if (propSchema && !validateAgainstSchema(propValue, resolveSchema(propSchema, context), context)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * @param {any} value
 * @param {JSONSchemaDefinition} schema
 * @param {ValidationContext} context
 * @returns {boolean}
 */
function validateArray(value, schema, context) {
  if (!Array.isArray(value)) {
    return false;
  }

  const itemsSchema = schema.items;
  if (!itemsSchema) {
    return true;
  }

  return value.every(item => validateAgainstSchema(item, resolveSchema(itemsSchema, context), context));
}
