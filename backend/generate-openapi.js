const { swaggerSpec } = require('./src/config/swagger.config');
const fs = require('fs');
const path = require('path');

// Generate OpenAPI JSON file
const generateOpenAPI = () => {
  try {
    const outputPath = path.join(__dirname, 'docs', 'openapi.json');
    
    // Ensure docs directory exists
    const docsDir = path.dirname(outputPath);
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    // Write OpenAPI spec to file
    fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
    
    console.log('✅ OpenAPI specification generated successfully!');
    console.log(`📄 File saved to: ${outputPath}`);
    console.log('🌐 Swagger UI available at: http://localhost:5000/api-docs');
    console.log('📋 OpenAPI JSON available at: http://localhost:5000/api/openapi.json');
  } catch (error) {
    console.error('❌ Error generating OpenAPI specification:', error);
    process.exit(1);
  }
};

// Run the generator
generateOpenAPI();
