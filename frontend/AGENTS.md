# NoteLingua Frontend - AGENTS.md

## Project Overview

NoteLingua Frontend is a Next.js 15 (App Router) vocabulary learning application. Users can upload PDFs, highlight text, create vocabulary cards, and track learning progress.

---

## App Architecture

### Directory Structure

```
frontend/
├── app/                        # Next.js 15 App Router
│   ├── (auth)/                # Auth route group (unprotected)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (protected)/           # Protected route group
│   │   ├── client-wrapper.tsx # Client providers wrapper
│   │   ├── home/page.tsx
│   │   ├── imports/
│   │   │   ├── page.tsx       # Document list
│   │   │   └── [id]/page.tsx  # Document detail
│   │   ├── layout.tsx         # Protected layout (requireAuth)
│   │   ├── loading.tsx
│   │   └── not-found.tsx
│   ├── layout.tsx             # Root layout (Navbar, auth check)
│   ├── page.tsx               # Root redirect
│   └── globals.css
│
├── components/
│   ├── templates/              # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── navbar.tsx
│   │   ├── loading.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── alert.tsx
│   │   ├── confirm-modal.tsx
│   │   ├── empty-state.tsx
│   │   ├── floating-button.tsx
│   │   └── paginated-list.tsx
│   ├── auth/                   # Auth-specific components
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── documents/             # PDF viewer & document components
│   │   ├── pdf-viewer.tsx
│   │   ├── documents-list.tsx
│   │   ├── documents-template.tsx
│   │   ├── document-detail-template.tsx
│   │   ├── document-upload.tsx
│   │   ├── document-upload-modal.tsx
│   │   └── sidebar/
│   ├── home/                   # Dashboard components
│   │   ├── stats-cards.tsx
│   │   ├── recent-activity.tsx
│   │   ├── quick-actions.tsx
│   │   └── welcome-section.tsx
│   └── vocabularies/           # Vocabulary management
│       ├── vocab-list.tsx
│       ├── vocab-item.tsx
│       ├── add-edit-vocab-form.tsx
│       └── index.tsx
│
├── contexts/                   # React Context providers
│   ├── auth-context.tsx
│   ├── document-context.tsx
│   ├── alert-context.tsx
│   ├── confirm-modal-context.tsx
│   └── index.ts
│
├── hooks/                      # Custom React hooks
│   ├── use-refresh-token.ts
│   ├── use-pagination.ts
│   └── use-document-highlights.ts
│
├── lib/                        # Core utilities
│   ├── actions/                # Server Actions ('use server')
│   │   ├── auth.ts
│   │   ├── documents.ts
│   │   ├── highlights.ts
│   │   ├── users.ts
│   │   └── vocabularies.ts
│   ├── server-api.ts          # Server-side API client (Axios)
│   ├── auth.ts                # Auth utilities (getServerAuth, requireAuth)
│   └── utils.ts               # Helpers (cn, request wrappers)
│
├── types/                      # TypeScript definitions
│   ├── api.ts                 # ApiResponse, PaginatedResponse
│   ├── auth.ts                # LoginRequest, RegisterRequest, AuthData
│   ├── document.ts            # Document types
│   ├── highlight.ts           # Highlight types
│   ├── ui.ts                  # UI state types (FormState)
│   ├── user.ts                # User types
│   ├── vocab.ts               # Vocab types
│   └── index.ts               # Barrel export
│
└── utils/
    ├── format.ts              # Formatting utilities
    └── mapDataTo.ts           # Data mapping utilities
```

---

## Route Groups

### `(auth)` Route Group
- **Purpose**: Unauthenticated routes (login, register)
- **Protection**: Redirects to `/home` if already authenticated (`redirectIfAuthenticated`)
- **No layout.tsx**: Each page is standalone

### `(protected)` Route Group
- **Purpose**: Authenticated routes requiring user session
- **Protection**: `requireAuth()` in layout.tsx redirects to `/login` if unauthenticated
- **Wrapper**: `ClientWrapper` provides contexts (Auth, Alert, ConfirmModal)

---

## Component Architecture

### Templates (Reusable UI Primitives)

| Component | File | Props | Notes |
|-----------|------|-------|-------|
| Button | button.tsx | variant, size, isLoading | forwardRef, 6 variants |
| Card | card.tsx | compound (Card, CardHeader, etc.) | Compound component pattern |
| Input | input.tsx | type, placeholder, name | Controlled via form |
| Textarea | textarea.tsx | rows, placeholder | - |
| Select | select.tsx | options, onChange | - |
| Modal | modal.tsx | isOpen, onClose, title | Controlled visibility |
| Alert | alert.tsx | variant (success/error) | Auto-dismiss |
| ConfirmModal | confirm-modal.tsx | message, onConfirm, onCancel | Uses ConfirmModalContext |
| Navbar | navbar.tsx | user prop | Server-rendered |
| Loading | loading.tsx | - | Spinner component |
| EmptyState | empty-state.tsx | title, description, action | - |
| FloatingButton | floating-button.tsx | onClick, icon | Fixed position |
| PaginatedList | paginated-list.tsx | pagination props | Integrates PaginationControls |

### Feature Components

#### Auth Components
- `LoginForm` - Server Action form submission
- `RegisterForm` - Server Action form submission

#### Document Components
- `PdfViewer` - PDF rendering with highlights
- `DocumentsList` - Paginated document listing
- `DocumentsTemplate` - Shared document layout
- `DocumentDetailTemplate` - Single document view
- `DocumentUpload` - Drag & drop upload
- `DocumentUploadModal` - Modal wrapper for upload
- `Sidebar` + `HighlightItem` - Highlight navigation

#### Home Components
- `StatsCards` - Learning statistics
- `RecentActivity` - Activity feed
- `QuickActions` - Navigation shortcuts
- `WelcomeSection` - Greeting with user name

#### Vocabulary Components
- `VocabList` - Paginated vocabulary list
- `VocabItem` - Single vocab display/edit
- `AddEditVocabForm` - Form for create/update

---

## State Management

### Context Providers

```typescript
// contexts/index.ts - Barrel exports
export { AlertProvider, useAlert } from './alert-context';
export { ConfirmModalProvider, useConfirmModal } from './confirm-modal-context';
export { AuthProvider, useAuth } from './auth-context';
```

#### AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}
// AuthProvider(initialUser: User | null)
```

#### AlertContext
```typescript
interface AlertContextType {
  showAlert: (message: string, type: 'success' | 'error') => void;
}
// Provides toast-style notifications
```

#### ConfirmModalContext
```typescript
interface ConfirmModalContextType {
  showConfirm: (message: string) => Promise<boolean>;
}
// Returns promise, resolved on confirm/cancel
```

#### DocumentContext
```typescript
// PDF viewer state management
// Manages current document, highlights, zoom, etc.
```

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useRefreshToken` | Token refresh logic |
| `usePagination` | Pagination state management |
| `useDocumentHighlights` | Highlight CRUD operations |

---

## Server Actions (`lib/actions/`)

All server actions use `'use server'` directive.

| Action | File | Purpose |
|--------|------|---------|
| `loginAction` | auth.ts | Login with FormData |
| `registerAction` | auth.ts | Registration with FormData |
| `logoutAction` | auth.ts | Clear cookies, redirect |
| `refreshTokenAction` | auth.ts | Token refresh |
| `getNewTokensAction` | auth.ts | Get new tokens |
| `getMyDocumentsAction` | documents.ts | List user documents |
| `getDocumentByIdAction` | documents.ts | Get single document |
| `importDocumentAction` | documents.ts | Upload PDF |
| `deleteDocumentAction` | documents.ts | Remove document |
| `getDocumentHighlightsAction` | highlights.ts | List highlights |
| `createHighlightAction` | highlights.ts | Create highlight |
| `updateHighlightAction` | highlights.ts | Update highlight |
| `deleteHighlightAction` | highlights.ts | Remove highlight |
| `getProfileAction` | users.ts | Get user profile |
| `getStatsAction` | users.ts | Get user stats |
| `getMyVocabsAction` | vocabularies.ts | List vocabularies |
| `createVocabAction` | vocabularies.ts | Create vocabulary |
| `updateVocabAction` | vocabularies.ts | Update vocabulary |
| `deleteVocabAction` | vocabularies.ts | Remove vocabulary |

---

## API Client (`lib/server-api.ts`)

### Server-Side API (Axios)
- Base URL: `NEXT_PUBLIC_API_URL` (default: `http://localhost:5000`)
- Auth: Bearer token from httpOnly cookies
- Auto-refresh: Intercepts 401/403 responses

```typescript
// API structure (barrel by domain)
serverApi.auth.login(), serverApi.auth.register(), serverApi.auth.refresh()
serverApi.users.getProfile(), serverApi.users.getStats()
serverApi.vocabs.getMyVocabs(), serverApi.vocabs.create(), serverApi.vocabs.update(), serverApi.vocabs.delete()
serverApi.documents.getMyDocuments(), serverApi.documents.import(), serverApi.documents.delete()
serverApi.highlights.getDocumentHighlights(), serverApi.highlights.create(), serverApi.highlights.update(), serverApi.highlights.delete()
```

### Request Wrappers (`lib/utils.ts`)

```typescript
// Wraps API calls with error handling
makeRequestWrapper<T>(requestFunc) → ApiResponse<T>
makePaginatedRequestWrapper<T>(requestFunc) → PaginatedResponse<T>
refreshTokenInterceptor(instance) → Auto-refresh on 401
```

---

## Type Definitions (`types/`)

### Core Types

```typescript
// api.ts
ApiResponse<T> = { success: boolean; data: T; message: string }
PaginatedResponse<T> = { success: boolean; data: T[]; pagination: Pagination }
Pagination = { page: number; limit: number; total: number; pages: number }
PaginationQuery = { page?, limit?, search?, sort?, order? }

// auth.ts
LoginRequest = { email: string; password: string }
RegisterRequest = { email: string; password: string; firstName: string; lastName: string; phoneNumber? }
AuthData = { user: User; access_token: string; refresh_token: string }

// user.ts
User = { _id: string; email: string; firstName: string; lastName: string; createdAt; updatedAt }

// vocab.ts
Vocab = { _id: string; userId; word; definition; example; notes; masteryLevel; nextReviewDate; ... }

// document.ts
Document = { _id: string; userId; title; fileName; filePath; fileSize; pageCount; ... }

// highlight.ts
Highlight = { _id: string; documentId; userId; pageNumber; text; position; color; note; createdAt }

// ui.ts
FormState = { isLoading: boolean; error?: string; success?: string }
```

---

## Coding Conventions (Next.js 15)

### Server vs Client Components

**Server Components** (default):
- Async functions in page.tsx, layout.tsx
- Direct database/API calls
- No 'use client' directive
- Cannot use hooks or browser APIs

**Client Components** ('use client'):
- Interactive UI (forms, buttons, state)
- Hooks usage
- Event handlers
- Marked explicitly at file top

### Pattern: Protected Layout

```typescript
// app/(protected)/layout.tsx
export default async function ProtectedLayout({ children }) {
  const { user } = await requireAuth(); // Redirect if not auth
  return (
    <Suspense fallback={<Loading />}>
      <ClientWrapper user={user}>{children}</ClientWrapper>
    </Suspense>
  );
}
```

### Pattern: Client Wrapper

```typescript
// app/(protected)/client-wrapper.tsx
'use client'
export function ClientWrapper({ children, user }) {
  return (
    <AuthProvider initialUser={user}>
      <AlertProvider>
        <ConfirmModalProvider>{children}</ConfirmModalProvider>
      </AlertProvider>
    </AuthProvider>
  );
}
```

### Pattern: Server Action Form

```typescript
// components/auth/login-form.tsx
'use client'
export function LoginForm() {
  const [formState, setFormState] = useState<FormState>({ isLoading: false });

  const handleSubmit = async (formData: FormData) => {
    setFormState({ isLoading: true });
    const result = await loginAction(formData); // Server Action
    if (result?.error) setFormState({ isLoading: false, error: result.error });
  };

  return (
    <form action={handleSubmit}>
      {/* Form fields using name attribute */}
    </form>
  );
}
```

### Pattern: Server Action with Redirect

```typescript
// lib/actions/auth.ts
'use server'
export async function registerAction(formData: FormData) {
  const response = await serverApi.auth.register(data);
  if (response.success) {
    redirect('/login'); // Server-side redirect
  }
  return { error: 'Registration failed' };
}
```

### Styling Conventions (Tailwind CSS 4)

**CSS Variables Pattern**:
```typescript
// tailwind.config.ts - Uses CSS variables for theming
colors: {
  primary: "hsl(var(--primary))",
  destructive: "hsl(var(--destructive))",
  // ...
}
```

**Utility Function**:
```typescript
// lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// Usage: className={cn('base-class', condition && 'conditional-class')}
```

**Button Variants**:
```typescript
// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default (h-10), sm (h-9), lg (h-11), icon (h-10 w-10)
```

### File Naming Conventions

| Pattern | Example | Usage |
|---------|---------|-------|
| Page files | `page.tsx`, `loading.tsx`, `not-found.tsx` | Next.js reserved |
| Route groups | `(auth)/`, `(protected)/` | Grouping without URL impact |
| Component files | `camelCase.tsx` | `login-form.tsx`, `vocab-list.tsx` |
| Template components | `PascalCase.tsx` | `Button.tsx`, `Card.tsx` |
| Hook files | `camelCase.ts` | `usePagination.ts` |
| Server actions | `kebab-case.ts` | `vocabularies.ts`, `highlights.ts` |

### Import Aliases

```json
// tsconfig.json
{
  "paths": {
    "@/*": ["./*"]  // @/ maps to frontend/ root
  }
}
// Usage: import { Button } from '@/components/templates'
//        import { User } from '@/types'
```

### Next.js Configuration

```typescript
// next.config.ts
{
  reactStrictMode: false,      // Note: disabled
  env: { NEXT_PUBLIC_API_URL },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' }  // PDF uploads
  },
  images: {
    remotePatterns: [{ protocol, hostname, port, pathname }]
  }
}
```

---

## Data Flow

### Authentication Flow

```
1. Page load (Server Component)
   └─ getServerAuth() → serverApi.users.getProfile()
      └─ Reads access_token from httpOnly cookies
         └─ Returns { user } or { user: null }

2. Protected route check
   └─ requireAuth() → redirects to /login if no user

3. Login (Server Action)
   └─ loginAction(formData)
      └─ serverApi.auth.login() → sets httpOnly cookies
         └─ redirect('/home')

4. Token refresh
   └─ Axios interceptor catches 401
      └─ getNewTokensAction() → serverApi.auth.refresh()
         └─ Updates cookies, retries request
```

### Server Actions Flow

```
Client Component                    Server Action (lib/actions/)
     │                                    │
     │  <form action={handleSubmit}>      │
     │────────────────────────────► loginAction(formData)
     │                                    │
     │                         serverApi.auth.login()
     │                                    │
     │                         cookies().set(...)
     │                                    │
     │◄────────────── redirect('/home') ─┘
     │                                    │
     │  useFormState updates UI           │
```

---

## Project Strategy

### Strengths
- Clear separation: Server Components for data, Client Components for UI
- Reusable template components with consistent styling
- Type-safe API client with TypeScript
- Server Actions for form handling
- Context-based global state (auth, alerts, modals)

### Areas to Improve
- `reactStrictMode: false` - should be enabled
- `strict: false` in tsconfig - should use strict mode
- No error boundaries implemented
- DocumentContext exists but not fully utilized
- No testing infrastructure visible

### Development Patterns

**Adding a new page**:
1. Add to appropriate route group
2. Use `page.tsx` with async server component
3. Call `requireAuth()` for protected pages
4. Wrap children in `ClientWrapper` if contexts needed

**Adding a new template component**:
1. Create in `components/templates/`
2. Use `forwardRef` for ref forwarding
3. Use `cn()` for className composition
4. Export from `components/templates/index.ts`

**Adding a server action**:
1. Create `'use server'` function in `lib/actions/`
2. Use `serverApi.*` for backend calls
3. Handle errors, return `{ error }` on failure
4. Use `redirect()` for navigation

---

## Environment

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Dependencies

### Core
- `next@15.5.9` - Framework
- `react@18.2.0` - UI library

### State & Data
- `axios@1.11.0` - HTTP client

### PDF
- `react-pdf-highlighter-extended@8.1.0` - PDF annotation
- `react-resizable-panels@3.0.6` - Resizable panels

### Styling
- `tailwindcss@4` - CSS framework
- `clsx@2.1.1` - Class utilities
- `tailwind-merge@3.3.1` - Tailwind merge

### Utilities
- `js-cookie@3.0.5` - Cookie handling
- `query-string@9.3.0` - URL query parsing
