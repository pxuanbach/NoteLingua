const mongoose = require('mongoose');

/**
 * Convert Mongoose schema type to OpenAPI type
 */
const mongooseTypeToOpenAPIType = (schemaType) => {
  if (!schemaType) return { type: 'string' };
  
  const type = schemaType.instance || schemaType.name;
  
  switch (type) {
    case 'String':
      return { type: 'string' };
    case 'Number':
      return { type: 'number' };
    case 'Date':
      return { type: 'string', format: 'date-time' };
    case 'Boolean':
      return { type: 'boolean' };
    case 'ObjectId':
      return { type: 'string', description: 'MongoDB ObjectId' };
    case 'Array':
      return { type: 'array' };
    case 'Mixed':
    case 'Object':
      return { type: 'object' };
    default:
      return { type: 'string' };
  }
};

/**
 * Process schema options and validations
 */
const processSchemaOptions = (schemaTypeOptions) => {
  const openApiProperty = {};
  
  if (schemaTypeOptions.enum) {
    openApiProperty.enum = schemaTypeOptions.enum;
  }
  
  if (schemaTypeOptions.min !== undefined) {
    openApiProperty.minimum = schemaTypeOptions.min;
  }
  
  if (schemaTypeOptions.max !== undefined) {
    openApiProperty.maximum = schemaTypeOptions.max;
  }
  
  if (schemaTypeOptions.minlength !== undefined) {
    openApiProperty.minLength = schemaTypeOptions.minlength;
  }
  
  if (schemaTypeOptions.maxlength !== undefined) {
    openApiProperty.maxLength = schemaTypeOptions.maxlength;
  }
  
  if (schemaTypeOptions.required) {
    openApiProperty.required = true;
  }
  
  if (schemaTypeOptions.default !== undefined) {
    openApiProperty.default = schemaTypeOptions.default;
  }
  
  if (schemaTypeOptions.match) {
    if (schemaTypeOptions.match.toString().includes('@')) {
      openApiProperty.format = 'email';
    }
  }
  
  return openApiProperty;
};

/**
 * Convert Mongoose schema path to OpenAPI property
 */
const convertSchemaPath = (path, schemaType) => {
  let property = mongooseTypeToOpenAPIType(schemaType);
  
  // Handle array types
  if (schemaType.instance === 'Array') {
    const arrayType = schemaType.schema || schemaType.caster;
    if (arrayType) {
      if (arrayType.instance === 'String') {
        property.items = { type: 'string' };
      } else if (arrayType.instance === 'ObjectId') {
        property.items = { type: 'string', description: 'MongoDB ObjectId' };
      } else if (arrayType.schema) {
        // Nested schema in array
        property.items = convertNestedSchema(arrayType.schema);
      } else {
        property.items = mongooseTypeToOpenAPIType(arrayType);
      }
    }
  }
  
  // Handle nested objects
  if (schemaType.schema) {
    property = convertNestedSchema(schemaType.schema);
  }
  
  // Process schema options
  const options = schemaType.options || {};
  const additionalProps = processSchemaOptions(options);
  
  return { ...property, ...additionalProps };
};

/**
 * Convert nested schema to OpenAPI object
 */
const convertNestedSchema = (schema) => {
  const properties = {};
  const required = [];
  
  schema.eachPath((path, schemaType) => {
    if (path === '_id' || path === '__v') return;
    
    properties[path] = convertSchemaPath(path, schemaType);
    
    if (schemaType.isRequired) {
      required.push(path);
    }
  });
  
  const result = {
    type: 'object',
    properties
  };
  
  if (required.length > 0) {
    result.required = required;
  }
  
  return result;
};

/**
 * Generate OpenAPI schema from Mongoose model
 */
const generateSchemaFromModel = (model) => {
  const schema = model.schema;
  const properties = {};
  const required = [];
  
  schema.eachPath((path, schemaType) => {
    // Skip internal MongoDB fields
    if (path === '__v') return;
    
    // Convert _id to id for API response
    const propertyName = path === '_id' ? 'id' : path;
    properties[propertyName] = convertSchemaPath(path, schemaType);
    
    // Add description for common fields
    if (path === '_id') {
      properties[propertyName].description = 'Unique identifier';
      properties[propertyName].example = '507f1f77bcf86cd799439011';
    }
    
    if (path.endsWith('_id')) {
      properties[propertyName].description = `Reference to ${path.replace('_id', '')} ID`;
    }
    
    if (path.endsWith('_at')) {
      properties[propertyName].description = `${path.replace('_at', '').replace('_', ' ')} timestamp`;
    }
    
    // Check if field is required
    if (schemaType.isRequired) {
      required.push(propertyName);
    }
  });
  
  const result = {
    type: 'object',
    properties
  };
  
  if (required.length > 0) {
    result.required = required;
  }
  
  return result;
};

/**
 * Generate all schemas from models directory
 */
const generateSchemasFromModels = () => {
  // Import models
  const User = require('../models/users.model');
  const Vocabulary = require('../models/vocabs.model');
  const Document = require('../models/documents.model');
  
  const schemas = {
    User: generateSchemaFromModel(User),
    Vocab: generateSchemaFromModel(Vocabulary), // Use 'Vocab' instead of 'Vocabulary'
    Document: generateSchemaFromModel(Document),
    
    // Standard response schemas
    Error: {
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Error type',
          example: 'Validation Error'
        },
        message: {
          type: 'string',
          description: 'Error message',
          example: 'Please check your input data'
        },
        details: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: {
                type: 'string',
                example: 'email'
              },
              message: {
                type: 'string',
                example: 'Please provide a valid email'
              }
            }
          },
          description: 'Validation error details'
        }
      }
    },
    
    SuccessResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true
        },
        data: {
          type: 'object',
          description: 'Response data'
        },
        message: {
          type: 'string',
          description: 'Success message',
          example: 'Operation completed successfully'
        }
      }
    },
    
    PaginatedResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true
        },
        data: {
          type: 'array',
          items: {
            type: 'object'
          },
          description: 'Array of data items'
        },
        pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Current page number',
              example: 1
            },
            limit: {
              type: 'integer',
              description: 'Items per page',
              example: 10
            },
            total: {
              type: 'integer',
              description: 'Total items count',
              example: 100
            },
            pages: {
              type: 'integer',
              description: 'Total pages count',
              example: 10
            }
          }
        }
      }
    }
  };
  
  return schemas;
};

module.exports = {
  generateSchemasFromModels,
  generateSchemaFromModel
};
