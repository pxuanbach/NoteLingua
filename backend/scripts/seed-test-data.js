/**
 * Seed test data for E2E testing
 * Run with: node scripts/seed-test-data.js
 */

// Note: Don't load .env - use environment variables set by docker-compose
const mongoose = require('mongoose');
const { register } = require('../src/services/auth.service');
const Document = require('../src/models/documents.model');
const Highlight = require('../src/models/highlights.model');
const Vocabulary = require('../src/models/vocabs.model');

const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://admin:password123@mongodb:27017/notelingua_test?authSource=admin';

const TEST_USER = {
  email: 'test@example.com',
  password: 'Password123',
  firstName: 'Test',
  lastName: 'User'
};

const SAMPLE_DOCUMENTS = [
  {
    file_name: 'sample-document-1.pdf',
    file_hash: 'abc123def456789012345678901234567890123456789012345678901234'
  },
  {
    file_name: 'sample-document-2.pdf',
    file_hash: 'xyz789012345678901234567890123456789012345678901234567890123'
  }
];

const SAMPLE_HIGHLIGHTS = [
  {
    word: 'Hello',
    meaning: 'A greeting used when meeting someone',
    examples: ['Hello, how are you?'],
    tags: ['greeting', 'basic'],
    text: 'Hello',
    position: {
      boundingRect: {
        x1: 100,
        y1: 200,
        x2: 200,
        y2: 220,
        width: 100,
        height: 20,
        pageNumber: 1
      },
      rects: [{
        x1: 100,
        y1: 200,
        x2: 200,
        y2: 220,
        width: 100,
        height: 20,
        pageNumber: 1
      }],
      pageNumber: 1
    }
  },
  {
    word: 'World',
    meaning: 'The earth and all its inhabitants',
    examples: ['The world is beautiful'],
    tags: ['noun'],
    text: 'World',
    position: {
      boundingRect: {
        x1: 300,
        y1: 200,
        x2: 400,
        y2: 220,
        width: 100,
        height: 20,
        pageNumber: 1
      },
      rects: [{
        x1: 300,
        y1: 200,
        x2: 400,
        y2: 220,
        width: 100,
        height: 20,
        pageNumber: 1
      }],
      pageNumber: 1
    }
  }
];

async function seedTestData() {
  console.log('🚀 Starting test data seeding...');

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Create test user first
    console.log('👤 Creating/looking up test user...');
    let testUser;
    try {
      const result = await register(TEST_USER);
      testUser = result.user;
      console.log('✅ Test user created:', testUser.email);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Test user already exists, using existing user');
        const User = require('../src/models/users.model');
        testUser = await User.findByEmail(TEST_USER.email);
      } else {
        throw error;
      }
    }

    // Clean up existing test data
    console.log('🧹 Cleaning up existing test data...');
    await Vocabulary.deleteMany({ user: testUser._id });
    await Highlight.deleteMany({ user: testUser._id });
    await Document.deleteMany({ user: testUser._id });

    // Create sample documents
    console.log('📄 Creating sample documents...');
    const documents = [];
    for (const docData of SAMPLE_DOCUMENTS) {
      const doc = new Document({
        ...docData,
        user: testUser._id
      });
      await doc.save();
      documents.push(doc);
      console.log('✅ Document created:', doc.file_name, '(_id:', doc._id, ')');
    }

    // Create sample highlights with vocabulary
    console.log('✨ Creating sample highlights...');
    for (let i = 0; i < SAMPLE_HIGHLIGHTS.length; i++) {
      const highlightData = SAMPLE_HIGHLIGHTS[i];
      const doc = documents[i % documents.length];

      // Create vocabulary first
      const vocab = new Vocabulary({
        user: testUser._id,
        word: highlightData.word,
        meaning: highlightData.meaning,
        examples: highlightData.examples,
        tags: highlightData.tags,
        source: doc.file_name,
        source_type: 'document'
      });
      await vocab.save();
      console.log('✅ Vocabulary created:', vocab.word, '(_id:', vocab._id, ')');

      // Create highlight linking to vocab and document
      const highlight = new Highlight({
        user: testUser._id,
        vocab: vocab._id,
        document: doc._id,
        file_hash: doc.file_hash,
        content: {
          text: highlightData.text
        },
        position: highlightData.position
      });
      await highlight.save();
      console.log('✅ Highlight created:', highlight.content.text, '(_id:', highlight._id, ')');
    }

    console.log('\n🎉 Test data seeding completed successfully!');
    console.log('\nTest credentials:');
    console.log('  Email:', TEST_USER.email);
    console.log('  Password:', TEST_USER.password);
    console.log('\nSample documents:');
    for (const doc of documents) {
      console.log('  -', doc.file_name, '(ID:', doc._id, ')');
    }

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n📡 MongoDB connection closed');
  }
}

seedTestData();