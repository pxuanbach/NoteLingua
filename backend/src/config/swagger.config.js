const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { generateSchemasFromModels } = require('../utils/schema-generator');

// Generate schemas from Mongoose models
const generatedSchemas = generateSchemasFromModels();

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'NoteLingua API',
    version: '1.0.0',
    description: 'API documentation for NoteLingua - A vocabulary learning platform',
    contact: {
      name: 'NoteLingua Team',
      email: 'support@notelingua.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server'
    },
    {
      url: 'https://api.notelingua.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token in format: Bearer <token>'
      }
    },
    schemas: generatedSchemas
  },
  security: [
    {
      BearerAuth: []
    }
  ]
};

// Options for the swagger docs
const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    './src/routers/*.doc.js', // Path to the API documentation files
    './src/models/*.js'       // Path to the model files (for additional schemas if needed)
  ]
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = {
  swaggerSpec,
  swaggerUi
};
