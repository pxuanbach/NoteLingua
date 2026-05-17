# NoteLingua Backend - AGENTS.md

## Project Overview

NoteLingua Backend is an Express.js REST API with MongoDB for vocabulary learning. It handles authentication, document management, vocabulary tracking, and PDF highlights with JWT-based security.

---

## App Architecture

### Directory Structure

```
backend/
├── src/
│   ├── app.js              # Express app entry point
│   │
│   ├── config/              # Environment & app configuration
│   │   ├── app.config.js   # App settings (NODE_ENV, PORT)
│   │   ├── auth.config.js  # JWT secrets & token generation
│   │   ├── database.config.js  # MongoDB URI
│   │   ├── swagger.config.js   # OpenAPI/Swagger setup
│   │   └── upload.config.js    # File upload settings
│   │
│   ├── infrastructure/     # External services
│   │   ├── database/
│   │   │   ├── connection.js   # MongoDB connection + retry logic
│   │   │   └── index.js        # Database exports
│   │   ├── storage/
│   │   │   ├── upload.js       # File storage utilities
│   │   │   └── index.js        # Storage exports
│   │   └── index.js            # Infrastructure barrel
│   │
│   ├── middlewares/        # Express middleware
│   │   ├── auth.middleware.js    # JWT authentication
│   │   ├── admin.middleware.js    # Admin role check
│   │   ├── validation.middleware.js  # Error handling
│   │   └── upload.middleware.js     # Multer file upload
│   │
│   ├── models/             # Mongoose schemas
│   │   ├── users.model.js
│   │   ├── vocabs.model.js
│   │   ├── documents.model.js
│   │   └── highlights.model.js
│   │
│   ├── routers/            # Express routers
│   │   ├── auth.router.js + .doc.js    # Auth endpoints + Swagger
│   │   ├── users.router.js + .doc.js   # User endpoints + Swagger
│   │   ├── vocabs.router.js + .doc.js  # Vocabulary endpoints + Swagger
│   │   ├── documents.router.js + .doc.js  # Document endpoints + Swagger
│   │   └── highlights.router.js + .doc.js  # Highlight endpoints + Swagger
│   │
│   ├── services/           # Business logic
│   │   ├── auth.service.js
│   │   ├── users.service.js
│   │   ├── vocabs.service.js
│   │   ├── documents.service.js
│   │   └── highlights.service.js
│   │
│   └── utils/              # Helpers
│       ├── validation.js   # Custom validators
│       └── schema-generator.js  # Swagger schema from models
│
├── uploads/                # Uploaded files (gitignored)
├── Dockerfile
├── package.json
└── .env
```

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login & get tokens |
| POST | `/logout` | Private | Logout user |
| PUT | `/change-password` | Private | Change password |
| POST | `/forgot-password` | Public | Request password reset |
| POST | `/reset-password` | Public | Reset with token |
| POST | `/refresh-token` | Public | Refresh access token |

### Users (`/api/users`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/profile` | Private | Get current user |
| PUT | `/profile` | Private | Update profile |
| GET | `/stats` | Private | Get user statistics |
| PUT | `/deactivate` | Private | Deactivate account |
| GET | `/` | Admin | List all users |
| GET | `/:id` | Admin | Get user by ID |
| PUT | `/:id` | Admin | Update user |
| DELETE | `/:id` | Admin | Delete user |
| PUT | `/:id/change-password` | Admin | Admin change password |
| PUT | `/:id/deactivate` | Admin | Admin deactivate user |

### Vocabularies (`/api/vocabs`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/me` | Private | Get user's vocabularies (paginated) |
| GET | `/:id` | Private | Get vocabulary by ID |
| GET | `/stats` | Private | Get vocabulary statistics |
| POST | `/` | Private | Create vocabulary |
| PUT | `/:id` | Private | Update vocabulary |
| DELETE | `/:id` | Private | Delete vocabulary |
| POST | `/:id/review` | Private | Add review |
| GET | `/stats/user/:userId` | Admin | Admin get user stats |
| GET | `/admin/overview` | Admin | Admin overview |
| DELETE | `/admin/:id` | Admin | Admin delete vocab |

### Documents (`/api/documents`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/import` | Private | Upload document |
| GET | `/` | Private | List user's documents |
| GET | `/:id` | Private | Get document by ID |
| DELETE | `/:id` | Private | Delete document |
| GET | `/stats` | Private | Get document statistics |
| GET | `/stats/:userId` | Admin | Admin get user doc stats |
| GET | `/admin/overview` | Admin | Admin overview |
| DELETE | `/admin/:fileHash/user/:userId` | Admin | Admin delete |

### Highlights (`/api/highlights`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/` | Private | Create highlight |
| GET | `/document/:documentId` | Private | Get document highlights |
| GET | `/file/:fileHash` | Private | Get file highlights |
| GET | `/search` | Private | Search highlights |
| GET | `/:highlightId` | Private | Get highlight by ID |
| PUT | `/:highlightId` | Private | Update highlight |
| DELETE | `/:highlightId` | Private | Delete highlight |

### Health (`/api/health`)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Public | Health check |
| GET | `/db` | Public | Database status |

---

## Data Models

### User Model

```javascript
{
  email: String (unique, lowercase),
  password_hash: String (bcrypt, select: false),
  firstName: String,
  lastName: String,
  phoneNumber: String (optional),
  role: 'user' | 'admin' (default: 'user'),
  isActive: Boolean (default: true),
  created_at: Date
}

// Indexes: email, created_at, isActive, role
// Methods: comparePassword()
// Statics: findByEmail(), findByEmailIncludeInactive()
```

### Vocabulary Model

```javascript
{
  user: ObjectId (ref: User),
  word: String (lowercase),
  meaning: String,
  pronunciation_url: String (optional),
  tags: [String],
  source: String,
  source_type: 'document' | 'package' | 'self',
  examples: [String],
  review_history: [{
    date: Date,
    correct: Boolean
  }],
  created_at: Date
}

// Indexes: user+word, user+tags, user+created_at, source
// Methods: addReview()
// Statics: findByTag(), findBySource()
```

### Document Model

```javascript
{
  user: ObjectId (ref: User),
  file_hash: String (SHA-256),
  file_name: String,
  created_at: Date
}

// Indexes: user+file_hash (unique), user+created_at, file_hash
// Statics: generateFileHash(), findByHash()
```

### Highlight Model

```javascript
{
  user: ObjectId (ref: User),
  vocab: ObjectId (ref: Vocabulary),
  document: ObjectId (ref: Document),
  file_hash: String,
  content: { text: String },
  position: {
    boundingRect: { x1, y1, x2, y2, width, height, pageNumber },
    rects: [{ x1, y1, x2, y2, width, height, pageNumber }],
    pageNumber: Number
  },
  comment: { text: String, emoji: String },
  tags: [String],
  source_tag: String,
  created_at: Date,
  updated_at: Date
}

// Indexes: user+vocab, user+document, user+file_hash, vocab, document, created_at
// Methods: updateHighlight()
// Statics: findByDocument(), findByFileHash(), findByText(), findByTags()
```

---

## Middleware

### Auth Middleware (`auth.middleware.js`)

```javascript
// JWT Token verification
const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

// authenticateToken - validates JWT, checks user exists & isActive
// Sets req.user with user object (without password_hash)

// authorizeRoles(...roles) - factory returning middleware
// Checks req.user.role is in allowed roles
```

### Admin Middleware (`admin.middleware.js`)

```javascript
const requireAdmin = (req, res, next) => {
  // Checks req.user.role === 'admin'
  // Returns 403 if not admin
}
```

### Validation Middleware (`validation.middleware.js`)

```javascript
const handleValidationErrors = (req, res, next) => {
  // Uses express-validator results
  // Returns 400 with errors if validation failed
}
```

### Upload Middleware (`upload.middleware.js`)

```javascript
// Multer config: diskStorage to UPLOADS_DIR
// File filter: ALLOWED_FILE_TYPES (pdf, txt, doc, docx)
// Limits: MAX_FILE_SIZE (10MB default), 5 files max

const upload = multer({
  storage, fileFilter, limits
});

const handleMulterError = (err, req, res, next) => {
  // Handles MulterError (LIMIT_FILE_SIZE, etc.)
  // Handles file type errors
}
```

---

## Services (Business Logic)

### Auth Service (`auth.service.js`)

| Method | Purpose |
|--------|---------|
| `register(userData)` | Create user, generate tokens |
| `login(credentials)` | Verify credentials, generate tokens |
| `logout(userId)` | Log logout event |
| `changePassword(userId, data)` | Verify current, update password |
| `forgotPassword(email)` | Placeholder - TODO email |
| `resetPassword(token, newPassword)` | Not implemented |
| `refreshToken(refreshTokenString)` | Verify refresh, generate new tokens |

### Users Service (`users.service.js`)

| Method | Purpose |
|--------|---------|
| `getUserProfile(userId)` | Get user by ID |
| `updateUserProfile(userId, data, isAdmin)` | Update fields |
| `getUserStats(userId)` | Aggregated stats |
| `deactivateUserAccount(userId)` | Soft delete |
| `getAllUsers(query)` | Paginated list with filters |
| `getUserById(userId)` | Get by ID |
| `updateUserById(userId, data)` | Admin update |
| `deleteUserById(userId)` | Hard delete |
| `changeUserPassword(userId, newPassword)` | Admin reset |
| `deactivateUserById(userId)` | Admin soft delete |

### Vocabs Service (`vocabs.service.js`)

| Method | Purpose |
|--------|---------|
| `addVocabulary(vocabData)` | Create vocab |
| `getUserVocabulary(userId, query)` | Paginated list with filters |
| `getVocabularyById(vocabId, userId)` | Get single |
| `updateVocabulary(vocabId, userId, data)` | Update (limited fields) |
| `deleteVocabulary(vocabId, userId)` | Delete |
| `addReviewHistory(vocabId, userId, correct)` | Add review |
| `getVocabularyByTag(userId, tag)` | Filter by tag |
| `getVocabularyBySource(userId, source)` | Filter by source |
| `getVocabularyStats(userId, timeframe)` | Aggregated stats |
| `getVocabularyStatsByAdmin(userId)` | Admin stats |
| `getAllUsersVocabOverview()` | Admin overview |
| `deleteVocabularyByAdmin(vocabId)` | Admin delete |

### Documents Service (`documents.service.js`)

| Method | Purpose |
|--------|---------|
| `importDocument(file, userId)` | Upload & create record |
| `getUserDocuments(userId, query)` | Paginated list |
| `getDocumentById(documentId, userId)` | Get single |
| `deleteDocumentById(documentId, userId)` | Delete |
| `deleteDocument(fileHash, userId)` | Delete by hash |
| `searchDocumentsByWord(userId, word)` | Search in notes |
| `getDocumentStats(userId, timeframe)` | Aggregated stats |
| `getDocumentStatsByAdmin(userId)` | Admin stats |
| `getAllUsersDocumentOverview()` | Admin overview |
| `deleteDocumentByAdmin(fileHash, userId)` | Admin delete |

### Highlights Service (`highlights.service.js`)

| Method | Purpose |
|--------|---------|
| `createHighlight(userId, vocabId, docId, fileHash, data)` | Create |
| `getDocumentHighlights(userId, docId, query)` | Paginated |
| `getFileHighlights(userId, fileHash, query)` | By file |
| `searchHighlights(userId, searchText, query)` | Text search |
| `getHighlightById(highlightId, userId)` | Get single |
| `updateHighlight(highlightId, userId, data)` | Update |
| `deleteHighlight(highlightId, userId)` | Delete |

---

## Authentication & Security

### JWT Configuration (`auth.config.js`)

```javascript
// Access Token: 15 minutes expiry
JWT_SECRET / JWT_EXPIRE (default: 15m)

// Refresh Token: 7 days expiry
JWT_REFRESH_SECRET / JWT_REFRESH_EXPIRE (default: 7d)

// Token payload: { userId, email, role }
```

### Security Middleware Chain (`app.js`)

```javascript
// Helmet CSP (Content Security Policy)
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      frameAncestors: ["'self'", "http://localhost:3000", "http://localhost:3001"],
    }
  }
});

// CORS
cors({
  origin: NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
});

// Rate limiting via helmet (built-in)

// Password hashing: bcrypt with saltRounds: 12
```

---

## Coding Conventions

### Router Pattern

```javascript
// 1. Import dependencies
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// 2. Import services & middleware
const authService = require('../services/auth.service');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validation.middleware');

// 3. Define validation chains
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('firstName').trim().isLength({ min: 2, max: 50 }),
];

// 4. Define routes
router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ error: 'Registration Failed', message: error.message });
  }
});

module.exports = router;
```

### Service Pattern

```javascript
// services/auth.service.js
const bcrypt = require('bcryptjs');
const User = require('../models/users.model');
const { generateToken, generateRefreshToken } = require('../config/auth.config');

const register = async (userData) => {
  const { email, password, firstName, lastName } = userData;

  // Check existing
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create (password_hash auto-hashed by pre-save)
  const user = new User({ email, password_hash: password, firstName, lastName });
  await user.save();

  // Generate tokens
  const tokenPayload = { userId: user._id, email: user.email, role: user.role };
  return {
    user,
    access_token: generateToken(tokenPayload),
    refresh_token: generateRefreshToken(tokenPayload)
  };
};

module.exports = { register, ... };
```

### Model Pattern

```javascript
// models/users.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true, select: false },
  // ...
}, {
  toJSON: { virtuals: true, transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id; delete ret.__v; delete ret.password_hash;
    return ret;
  }}
});

// Pre-save password hash
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();
  this.password_hash = await bcrypt.hash(this.password_hash, 12);
  next();
});

// Instance method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// Static method
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ created_at: -1 });

module.exports = mongoose.model('User', userSchema);
```

### Swagger Documentation Pattern

```javascript
// routers/auth.router.doc.js
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *                     access_token: { type: string }
 *                     refresh_token: { type: string }
 */
```

---

## Project Strategy

### Strengths

1. **Clean layered architecture**: Routers → Services → Models
2. **Comprehensive validation**: express-validator on all inputs
3. **JWT dual-token**: Access (15min) + Refresh (7d)
4. **Role-based access**: User vs Admin routes
5. **Swagger documentation**: All endpoints documented
6. **Mongoose best practices**: Indexes, virtuals, pre-save hooks
7. **Error handling**: Consistent error response format
8. **Database retry logic**: Auto-reconnect with exponential backoff
9. **File deduplication**: SHA-256 hash prevents duplicate uploads

### Areas to Improve

1. **Password reset not implemented**: `forgotPassword` and `resetPassword` are stubs
2. **No rate limiting**: No express-rate-limit visible
3. **No input sanitization**: Potential XSS in some fields
4. **No email service**: Password reset can't actually send email
5. **No file cleanup**: Old uploads not automatically deleted
6. **Admin overview queries**: Could be slow with many users (no pagination)

### Development Patterns

**Adding a new endpoint**:

1. Add route in appropriate router file
2. Add validation chain if needed
3. Create/extend service method
4. Update Swagger doc in `.doc.js` file
5. Update tests if applicable

**Adding a new model**:

1. Create schema in `models/`
2. Add indexes for query fields
3. Add methods/statics as needed
4. Add to swagger schema generator if needed
5. Add service methods to interact

---

## Environment Variables

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:password123@localhost:27017/notelingua
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<refresh-secret>
UPLOADS_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,txt,doc,docx
```

---

## Dependencies

### Core
- `express@4.18.2` - Web framework
- `mongoose@8.0.0` - MongoDB ODM

### Security
- `jsonwebtoken@9.0.2` - JWT auth
- `bcryptjs@2.4.3` - Password hashing
- `helmet@7.1.0` - Security headers
- `cors@2.8.5` - CORS

### Validation
- `express-validator@7.0.1` - Input validation

### File Handling
- `multer@1.4.5-lts.1` - File uploads

### Documentation
- `swagger-jsdoc@6.2.8` - OpenAPI generation
- `swagger-ui-express@5.0.1` - Swagger UI

### Utilities
- `dotenv@16.3.1` - Environment variables
- `morgan@1.10.0` - HTTP logging

### Testing
- `jest@29.7.0` - Test framework
- `mongodb-memory-server@9.5.0` - In-memory MongoDB
- `supertest@6.3.4` - HTTP assertions
