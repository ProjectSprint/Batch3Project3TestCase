export interface ValidationContext {
  definitions: Record<string, JSONSchemaDefinition>;
  rootSchema: JSONSchemaDefinition;
}

export interface JSONSchemaDefinition {
  type?: string | string[];
  additionalProperties?: boolean;
  properties?: Record<string, JSONSchemaDefinition>;
  required?: string[];
  items?: JSONSchemaDefinition;
  enum?: string[];
  $ref?: string;
  definitions?: Record<string, JSONSchemaDefinition>;
  $schema?: string;
}
