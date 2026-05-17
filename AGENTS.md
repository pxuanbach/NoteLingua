# NoteLingua - AGENTS.md

> **📚 Detailed Documentation**: For in-depth information, see:
> - [Frontend AGENTS.md](./frontend/AGENTS.md) - Next.js 15 architecture, components, state management, server actions
> - [Backend AGENTS.md](./backend/AGENTS.md) - Express.js API, models, services, authentication, middleware

## Project Overview

NoteLingua is a vocabulary learning platform that helps users learn English words through document reading and note-taking. Users can upload PDFs, highlight text, create vocabulary cards from highlights, and track learning progress.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS 4
- **PDF Viewer**: react-pdf-highlighter-extended
- **State**: React Context (auth, document, alert, confirm-modal)
- **HTTP Client**: Axios with interceptors for token refresh
- **Package Manager**: pnpm

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (access + refresh tokens)
- **File Storage**: Local filesystem with multer
- **API Docs**: Swagger/OpenAPI via swagger-jsdoc + swagger-ui-express
- **Security**: Helmet, CORS, bcryptjs, express-validator
- **Testing**: Jest with mongodb-memory-server

---

## Architecture

```
NoteLingua/
├── frontend/          # Next.js 15 application
│   ├── app/          # App Router pages
│   │   ├── (auth)/   # Login/Register pages
│   │   ├── (protected)/  # Protected routes (vocabularies, imports, home)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/   # React components
│   │   ├── auth/
│   │   ├── documents/
│   │   ├── home/
│   │   ├── templates/  # Reusable UI (Button, Modal, Navbar, etc.)
│   │   └── vocabularies/
│   ├── contexts/     # React Context providers
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # API client, auth utilities
│   │   ├── actions/   # Server actions
│   │   ├── server-api.ts
│   │   └── utils.ts
│   ├── types/        # TypeScript interfaces
│   └── utils/        # Helper functions
│
├── backend/          # Express.js API
│   ├── src/
│   │   ├── app.js           # Express app entry
│   │   ├── config/          # Environment configs
│   │   ├── infrastructure/  # DB connection, storage
│   │   ├── middlewares/     # Auth, validation, upload
│   │   ├── models/         # Mongoose schemas
│   │   ├── routers/        # Express routers
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helpers
│   └── Dockerfile
│
├── docker-compose.yml  # MongoDB + Backend container
└── Makefile
```

---

## Key Modules

### Backend Structure

| Layer | Path | Purpose |
|-------|------|---------|
| **Routers** | `src/routers/*.router.js` | HTTP route handlers, map to `/api/*` |
| **Services** | `src/services/*.service.js` | Business logic |
| **Models** | `src/models/*.model.js` | Mongoose schemas |
| **Middleware** | `src/middlewares/*.js` | Auth, validation, upload |
| **Infrastructure** | `src/infrastructure/` | DB connection, file storage |

**API Endpoints**:
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh-token`
- `GET /api/users/profile`, `GET /api/users/stats`
- `GET /api/vocabs/me`, `POST /api/vocabs`, `PUT /api/vocabs/:id`, `DELETE /api/vocabs/:id`
- `GET /api/documents`, `POST /api/documents/import`, `DELETE /api/documents/:id`
- `GET /api/highlights/document/:id`, `POST /api/highlights`, `PUT /api/highlights/:id`
- `GET /api/health`, `GET /api/health/db`

### Frontend Structure

**Pages** (App Router):
- `/` - Home page
- `/login` - Authentication
- `/register` - User registration
- `/vocabularies` - Vocabulary list management
- `/imports/[id]` - Document import details

**Contexts**:
- `AuthContext` - User authentication state
- `DocumentContext` - PDF document state
- `AlertContext` - Notification system
- `ConfirmModalContext` - Confirmation dialogs

---

## Development

### Frontend Commands
```bash
cd frontend
pnpm install
pnpm dev        # Dev server with turbopack (localhost:3000)
pnpm build      # Production build
pnpm start      # Production server
```

### Backend Commands
```bash
cd backend
npm install
npm run dev     # Nodemon dev server (localhost:5000)
npm start       # Production server
npm test        # Run all tests
npm run test:unit    # Unit tests only
npm run test:integration  # Integration tests only
npm run docs:generate     # Generate OpenAPI spec
```

### Infrastructure
```bash
# Start MongoDB + Backend via Docker
docker-compose up -d

# Expose backend via ngrok (for mobile testing)
make server
```

---

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:password123@localhost:27017/notelingua
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<refresh-secret>
UPLOADS_DIR=./uploads
```

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Type Definitions

### Frontend Types (`frontend/types/`)
- `auth.ts` - Auth related types
- `user.ts` - User model
- `vocab.ts` - Vocabulary model
- `document.ts` - Document model
- `highlight.ts` - Highlight/annotation model
- `api.ts` - API response wrappers
- `ui.ts` - UI state types

---

## Conventions

### Backend
- CommonJS modules (`require`/`module.exports`)
- Async/await service methods
- Mongoose schemas with timestamps
- JWT access tokens (15min) + refresh tokens (7d)
- Swagger JSDoc comments on routes

### Frontend
- Next.js 15 App Router with React Server Components
- TypeScript strict mode
- Tailwind CSS for styling
- Client components marked with `'use client'`
- Server actions in `lib/actions/`

---

## Key Dependencies

### Frontend
- `next@15.5.9` - React framework
- `react@18.2.0` - UI library
- `react-pdf-highlighter-extended@8.1.0` - PDF annotation
- `axios@1.11.0` - HTTP client
- `tailwindcss@4` - CSS framework
- `js-cookie@3.0.5` - Cookie handling

### Backend
- `express@4.18.2` - Web framework
- `mongoose@8.0.0` - MongoDB ODM
- `jsonwebtoken@9.0.2` - JWT auth
- `bcryptjs@2.4.3` - Password hashing
- `multer@1.4.5-lts.1` - File uploads
- `swagger-jsdoc@6.2.8` - OpenAPI generation
- `helmet@7.1.0` - Security headers