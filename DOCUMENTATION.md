# 📄 DocuLens AI — AI Document Intelligence Platform

> **An intelligent document processing platform that automatically detects, classifies, and extracts structured data from any document using AI.**

**Status**: 🟡 In Development  
**Last Updated**: 2026-06-28  
**Monorepo**: Turborepo + pnpm  

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Architecture](#2-architecture)
- [3. Tech Stack](#3-tech-stack)
- [4. Monorepo Structure](#4-monorepo-structure)
- [5. Core Feature — Auto Document Intelligence Pipeline](#5-core-feature--auto-document-intelligence-pipeline)
- [6. Authentication System](#6-authentication-system)
- [7. Database Schema](#7-database-schema)
- [8. API Design](#8-api-design)
- [9. Supported Document Types & Schemas](#9-supported-document-types--schemas)
- [10. Native App (Expo)](#10-native-app-expo)
- [11. Web App (Next.js)](#11-web-app-nextjs)
- [12. Shared Packages](#12-shared-packages)
- [13. Environment Variables](#13-environment-variables)
- [14. Development Setup](#14-development-setup)
- [15. Deployment](#15-deployment)
- [16. Build Log / Changelog](#16-build-log--changelog)

---

## 1. Project Overview

### What Is This?

DocuLens AI is a cross-platform (iOS, Android, Web) document intelligence platform. Users upload or scan any document — invoices, receipts, CVs, contracts, bank statements, IDs — and the AI automatically:

1. **Detects** what type of document it is
2. **Routes** it to the correct extraction schema
3. **Extracts** structured, validated JSON data
4. **Presents** clean, organized results

### The Magic Moment

> The user drops a document. No dropdowns, no "select document type." The AI figures it out, routes to the right schema, and returns perfectly structured data. Upload anything → get clean JSON back automatically.

### Why This Stands Out (Portfolio Value)

| Interviewer Question | What Your Answer Demonstrates |
|---|---|
| "How does it know the document type?" | Two-stage AI pipeline — classify first, then extract with the right schema |
| "What if the AI gets it wrong?" | Confidence scoring + user override + fallback to generic schema |
| "How do you validate AI output?" | Zod schemas — AI output is **type-checked at runtime**, not blindly trusted |
| "Can you add new document types?" | Just add a new Zod schema to the registry — zero pipeline changes |
| "Why two AI calls instead of one?" | Separation of concerns — classification accuracy improves when isolated |

---

## 2. Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐              │
│  │   Native App (Expo)  │    │   Web App (Next.js)  │              │
│  │  • Camera Scanning   │    │  • File Upload       │              │
│  │  • Photo Gallery     │    │  • Dashboard         │              │
│  │  • On-the-go Access  │    │  • Document Mgmt     │              │
│  └──────────┬───────────┘    └──────────┬───────────┘              │
│             │         Shared UI Package (@repo/ui)                  │
│             └────────────────┬──────────┘                          │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ tRPC (Type-safe API)
┌──────────────────────────────┼──────────────────────────────────────┐
│                        API LAYER (Next.js API Routes)               │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐      │
│  │  Auth Routes   │  │  Document API │  │  AI Pipeline API  │      │
│  │  (NextAuth v5) │  │  (CRUD)       │  │  (Process/Extract)│      │
│  └───────────────┘  └───────────────┘  └───────────────────┘      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────┐
│                        AI PROCESSING LAYER                          │
│  ┌────────────┐  ┌──────────────────┐  ┌────────────────────┐     │
│  │ Tesseract  │  │  Gemini Flash    │  │  Schema Registry   │     │
│  │ OCR Engine │→ │  Classification  │→ │  (Zod Schemas)     │     │
│  │            │  │  + Extraction    │  │  Dynamic Routing   │     │
│  └────────────┘  └──────────────────┘  └────────────────────┘     │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────┐
│                        DATA LAYER                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐      │
│  │  Neon Postgres │  │  Vercel Blob  │  │  Upstash Redis    │      │
│  │  (Drizzle ORM) │  │  (File Store) │  │  (Cache/Sessions) │      │
│  │  Metadata +    │  │  Original     │  │  Rate Limiting    │      │
│  │  Extracted Data│  │  Documents    │  │  AI Response Cache│      │
│  └───────────────┘  └───────────────┘  └───────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow — Document Processing

```
User uploads file
       │
       ▼
┌─────────────────┐
│  Vercel Blob    │ ← Store original file, get URL
│  (File Upload)  │
└────────┬────────┘
         │
         ▼
┌───────────────────────────────────────────────┐
│          Parallel Extraction Engines          │
│                                               │
│  ┌─────────────────┐     ┌─────────────────┐  │
│  │  Tesseract.js   │     │  Gemini Vision  │  │
│  │  (OCR Text)     │     │  (Visual Data)  │  │
│  └────────┬────────┘     └────────┬────────┘  │
│           │                       │           │
└───────────┼───────────────────────┼───────────┘
            ▼                       ▼
    raw text (fallback)       raw text (visual)
            │                       │
         ▼
┌─────────────────┐
│  Gemini Flash   │ ← AI Call #1: "What type of document is this?"
│  (Classify)     │ → Returns: { type: "invoice", confidence: 0.95 }
└────────┬────────┘
         │ document type
         ▼
┌─────────────────┐
│  Schema Router  │ ← Lookup Zod schema from registry
│  (Registry)     │ → Selects: invoiceSchema
└────────┬────────┘
         │ target schema
         ▼
┌─────────────────┐
│  Gemini Flash   │ ← AI Call #2: "Extract data using this schema"
│  (Extract)      │ → Returns: validated, structured JSON
└────────┬────────┘
         │ structured data
         ▼
┌─────────────────┐
│  Neon Postgres  │ ← Save metadata + extracted data
│  (Persist)      │
└────────┬────────┘
         │
         ▼
   Return to client
   (Document card with structured data)
```

---

## 3. Tech Stack

### Core Libraries (Open Source / Free)

| Library | Purpose | Why This? |
|---|---|---|
| **Zod** | Runtime schema validation | Type-safe AI output validation, shared between classify + extract |
| **Zustand** | Client state management | Lightweight, no boilerplate, works with React Native |
| **react-hook-form** | Form handling | Pairs natively with Zod resolvers |
| **tRPC** | Type-safe API layer | End-to-end type safety between client and server |
| **Drizzle ORM** | Database ORM | Pure TypeScript, no code generation, lightweight |
| **bcryptjs** | Password hashing | Auth password security |
| **Tesseract.js** | OCR engine | Free, runs locally, no API key needed |

### Infrastructure (Free Tiers)

| Service | Purpose | Free Tier |
|---|---|---|
| **Neon Postgres** | Relational database | 0.5 GB, 190 compute hrs/month |
| **Vercel Blob** | File/document storage | 250 MB storage |
| **Upstash Redis** | Cache, rate-limiting, sessions | 10K commands/day |
| **Google Gemini API** | LLM (classification + extraction) | 15 RPM, 1M tokens/day (Flash) |

### Frameworks

| Framework | App | Details |
|---|---|---|
| **Expo (React Native)** | `apps/native` | iOS + Android, camera scanning, file picker |
| **Next.js 16** | `apps/web` | Dashboard, API routes, SSR |
| **Turborepo** | Monorepo orchestration | Shared packages, parallel builds |

### Authentication

| Tool | Purpose |
|---|---|
| **NextAuth v5 (Auth.js)** | Custom auth — credentials (email/password) + Google OAuth |
| **JWT Sessions** | Stateless session management |
| **Middleware** | Route protection (same pattern as ChowVest) |

---

## 4. Monorepo Structure

```
document-intel-monorepo/
├── apps/
│   ├── native/                   # Expo React Native app
│   │   ├── app/                  # Expo Router screens
│   │   │   ├── _layout.tsx       # Root layout
│   │   │   ├── index.tsx         # Home screen
│   │   │   ├── (auth)/           # Auth screens (signin, signup)
│   │   │   ├── (tabs)/           # Tab-based navigation
│   │   │   │   ├── scan.tsx      # Camera document scanner
│   │   │   │   ├── documents.tsx # Document library
│   │   │   │   ├── dashboard.tsx # Overview stats
│   │   │   │   └── profile.tsx   # User profile
│   │   │   └── document/[id].tsx # Document detail view
│   │   ├── assets/               # Images, fonts
│   │   ├── app.json              # Expo config
│   │   └── package.json
│   │
│   └── web/                      # Next.js web app
│       ├── app/
│       │   ├── layout.tsx        # Root layout + providers
│       │   ├── page.tsx          # Landing page
│       │   ├── auth/             # Auth pages
│       │   │   ├── signin/
│       │   │   └── signup/
│       │   ├── dashboard/        # Protected dashboard
│       │   │   ├── page.tsx      # Overview
│       │   │   └── documents/    # Document management
│       │   └── api/              # API routes
│       │       ├── auth/         # NextAuth handlers
│       │       ├── documents/    # Document CRUD
│       │       ├── process/      # AI processing pipeline
│       │       └── trpc/         # tRPC handler
│       ├── styles/
│       └── package.json
│
├── packages/
│   ├── ui/                       # Shared React Native / Web components
│   │   └── src/
│   │       ├── button.tsx
│   │       ├── document-card.tsx
│   │       ├── upload-zone.tsx
│   │       └── index.tsx
│   │
│   ├── api/                      # Shared API layer (tRPC routers)
│   │   └── src/
│   │       ├── routers/
│   │       │   ├── document.ts
│   │       │   ├── auth.ts
│   │       │   └── ai.ts
│   │       └── trpc.ts
│   │
│   ├── db/                       # Database package (Drizzle)
│   │   └── src/
│   │       ├── schema/
│   │       │   ├── users.ts
│   │       │   ├── documents.ts
│   │       │   └── index.ts
│   │       ├── drizzle.ts        # DB connection
│   │       └── migrate.ts
│   │
│   ├── ai/                       # AI processing pipeline
│   │   └── src/
│   │       ├── pipeline.ts       # Main orchestrator
│   │       ├── classify.ts       # Document classification
│   │       ├── extract.ts        # Schema-based extraction
│   │       ├── ocr.ts            # Tesseract.js wrapper
│   │       └── schemas/          # Zod schemas per document type
│   │           ├── registry.ts   # Schema registry + router
│   │           ├── invoice.ts
│   │           ├── receipt.ts
│   │           ├── cv.ts
│   │           ├── contract.ts
│   │           ├── bank-statement.ts
│   │           ├── id-document.ts
│   │           └── generic.ts    # Fallback schema
│   │
│   ├── shared/                   # Shared types, constants, utils
│   │   └── src/
│   │       ├── types.ts
│   │       ├── constants.ts
│   │       └── utils.ts
│   │
│   └── typescript-config/        # Shared tsconfig
│       ├── base.json
│       └── react-library.json
│
├── DOCUMENTATION.md              # ← You are here
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 5. Core Feature — Auto Document Intelligence Pipeline

### Overview

The flagship feature. Users upload any document and receive perfectly structured JSON back — no manual categorization required. The system uses a **two-stage AI pipeline**: classify first, then extract with the correct schema.

### Stage 1: OCR — Text Extraction

```typescript
// packages/ai/src/ocr.ts
import Tesseract from 'tesseract.js';

export async function extractText(imageUrl: string): Promise<string> {
  const { data: { text, confidence } } = await Tesseract.recognize(imageUrl, 'eng');
  
  if (confidence < 30) {
    throw new Error('OCR confidence too low — image may be unreadable');
  }
  
  return text;
}
```

**Why Tesseract.js?** Free, no API key, runs server-side in Node.js. Good enough for typed/printed documents. Can be swapped for Google Cloud Vision later for handwriting support.

### Stage 2: AI Classification

```typescript
// packages/ai/src/classify.ts
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const classificationSchema = z.object({
  documentType: z.enum([
    'invoice',
    'receipt', 
    'cv',
    'contract',
    'bank_statement',
    'id_document',
    'letter',
    'generic',
  ]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().describe('Brief explanation of why this classification was chosen'),
});

export type DocumentClassification = z.infer<typeof classificationSchema>;

export async function classifyDocument(text: string): Promise<DocumentClassification> {
  const { object } = await generateObject({
    model: google('gemini-2.0-flash'),
    schema: classificationSchema,
    prompt: `You are a document classification expert. Analyze the following text extracted from a document and determine what type of document it is.

Consider key indicators:
- Invoices: line items, totals, "invoice number", vendor/billing info
- Receipts: merchant name, transaction date, items purchased, total paid
- CVs/Resumes: personal info, work experience, education, skills
- Contracts: parties involved, terms, signatures, legal language
- Bank Statements: account number, transactions, balance
- ID Documents: name, date of birth, ID number, nationality
- Letters: salutation, body text, closing, signature

Document text:
${text}`,
  });

  return object;
}
```

### Stage 3: Schema Routing

```typescript
// packages/ai/src/schemas/registry.ts
import { z } from 'zod';
import { invoiceSchema } from './invoice';
import { receiptSchema } from './receipt';
import { cvSchema } from './cv';
import { contractSchema } from './contract';
import { bankStatementSchema } from './bank-statement';
import { idDocumentSchema } from './id-document';
import { genericSchema } from './generic';

export const schemaRegistry = {
  invoice: invoiceSchema,
  receipt: receiptSchema,
  cv: cvSchema,
  contract: contractSchema,
  bank_statement: bankStatementSchema,
  id_document: idDocumentSchema,
  letter: genericSchema,
  generic: genericSchema,
} as const;

export type DocumentType = keyof typeof schemaRegistry;

export function getSchemaForType(type: DocumentType) {
  return schemaRegistry[type] ?? schemaRegistry.generic;
}
```

### Stage 4: Structured Extraction

```typescript
// packages/ai/src/extract.ts
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { getSchemaForType, type DocumentType } from './schemas/registry';

export async function extractStructuredData(
  text: string,
  documentType: DocumentType,
) {
  const schema = getSchemaForType(documentType);

  const { object } = await generateObject({
    model: google('gemini-2.0-flash'),
    schema,
    prompt: `You are a data extraction expert. Extract all relevant structured data from this ${documentType}.

Be precise and thorough. If a field cannot be determined from the text, use null.

Document text:
${text}`,
  });

  return object;
}
```

### Full Pipeline Orchestrator

```typescript
// packages/ai/src/pipeline.ts
import { extractText } from './ocr';
import { classifyDocument } from './classify';
import { extractStructuredData } from './extract';
import { extractWithVision } from './cross-validate';

export interface ProcessingResult {
  classification: {
    documentType: string;
    confidence: number;
    reasoning: string;
  };
  extractedData: Record<string, unknown>;
  rawText: string;
  processingTimeMs: number;
}

export async function processDocument(fileUrl: string): Promise<ProcessingResult> {
  const startTime = Date.now();

  // Stage 1: OCR
  const rawText = await extractText(fileUrl);

  // Stage 2: Classify
  const classification = await classifyDocument(rawText);

  // Stage 3 & 4: Route to schema + Extract (Parallel Engine Cross-Validation)
  // We run Gemini Vision extraction and Standard OCR extraction simultaneously
  const [visionData, ocrExtractedData] = await Promise.all([
    extractWithVision(fileUrl, classification.documentType),
    extractStructuredData(rawText, classification.documentType)
  ]);
  
  // Prefer Vision data for general fields, use OCR as fallback
  const extractedData = visionData || ocrExtractedData;

  return {
    classification,
    extractedData,
    rawText,
    processingTimeMs: Date.now() - startTime,
  };
}
```

### Example Zod Schemas

#### Invoice Schema

```typescript
// packages/ai/src/schemas/invoice.ts
import { z } from 'zod';

export const invoiceSchema = z.object({
  invoiceNumber: z.string().nullable(),
  issueDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  vendor: z.object({
    name: z.string(),
    address: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
  }),
  billTo: z.object({
    name: z.string().nullable(),
    address: z.string().nullable(),
  }),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().nullable(),
    unitPrice: z.number().nullable(),
    total: z.number().nullable(),
  })),
  subtotal: z.number().nullable(),
  tax: z.number().nullable(),
  total: z.number(),
  currency: z.string().default('USD'),
  paymentTerms: z.string().nullable(),
  keyInformation: z.array(z.object({
    key: z.string().describe("Name of the custom field (e.g., 'Tax ID', 'Reference')"),
    value: z.string()
  })).describe("Any additional custom fields not covered by the standard schema").optional(),
});
```

#### CV / Resume Schema

```typescript
// packages/ai/src/schemas/cv.ts
import { z } from 'zod';

export const cvSchema = z.object({
  personalInfo: z.object({
    fullName: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
    linkedIn: z.string().nullable(),
    portfolio: z.string().nullable(),
  }),
  summary: z.string().nullable(),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    description: z.string().nullable(),
    highlights: z.array(z.string()),
  })),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    graduationDate: z.string().nullable(),
    gpa: z.string().nullable(),
  })),
  skills: z.array(z.string()),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string().nullable(),
    date: z.string().nullable(),
  })),
  languages: z.array(z.string()),
});
```

---

## 6. Authentication System

> Based on the ChowVest authentication pattern — custom NextAuth v5 with credentials + Google OAuth.

### Auth Architecture

```
┌────────────────────────────────────────────┐
│              NextAuth v5 (Auth.js)          │
│  ┌──────────────┐  ┌───────────────┐      │
│  │  Credentials  │  │  Google OAuth  │      │
│  │  Provider     │  │  Provider      │      │
│  │  (email/pass) │  │  (optional)    │      │
│  └──────┬───────┘  └───────┬───────┘      │
│         │                   │               │
│         ▼                   ▼               │
│  ┌────────────────────────────────┐        │
│  │  JWT Session Strategy          │        │
│  │  • Stateless                   │        │
│  │  • Token contains user ID      │        │
│  └──────────────┬─────────────────┘        │
│                 │                            │
│  ┌──────────────▼─────────────────┐        │
│  │  Middleware Route Protection    │        │
│  │  • /dashboard/* → requires auth │        │
│  │  • /auth/* → redirect if authed │        │
│  └────────────────────────────────┘        │
└────────────────────────────────────────────┘
```

### Auth Flow

1. **Registration**: User submits form → API hashes password (bcrypt, 12 rounds) → stores in Postgres → auto sign-in
2. **Sign In**: User submits credentials → NextAuth verifies against DB → issues JWT
3. **Session**: JWT stored in cookie → middleware checks on every request
4. **Route Protection**: Middleware redirects unauthenticated users from protected routes

### Key Files

| File | Purpose |
|---|---|
| `apps/web/auth.ts` | NextAuth config (providers, callbacks, pages) |
| `apps/web/middleware.ts` | Route protection middleware |
| `apps/web/app/api/auth/[...nextauth]/route.ts` | NextAuth API handler |
| `apps/web/app/api/auth/register/route.ts` | Registration endpoint |
| `apps/web/app/auth/signin/page.tsx` | Sign in page |
| `apps/web/app/auth/signup/page.tsx` | Sign up page |
| `apps/web/app/providers.tsx` | SessionProvider wrapper |

---

## 7. Database Schema

### Entity Relationship Diagram

```
┌──────────────────────┐     ┌──────────────────────┐
│       users           │     │      documents        │
├──────────────────────┤     ├──────────────────────┤
│ id          (PK)     │────<│ id           (PK)     │
│ fullName             │     │ userId       (FK)     │
│ email       (unique) │     │ fileName              │
│ password    (hashed) │     │ fileUrl      (blob)   │
│ phoneNumber          │     │ fileSize              │
│ image                │     │ mimeType              │
│ emailVerified        │     │ documentType          │
│ createdAt            │     │ confidence            │
│ updatedAt            │     │ rawText               │
└──────────────────────┘     │ extractedData (JSON)  │
                              │ processingStatus      │
                              │ processingTimeMs      │
                              │ tags         (array)  │
                              │ createdAt             │
                              │ updatedAt             │
                              └──────────────────────┘
```

### Processing Status Enum

```typescript
type ProcessingStatus = 
  | 'uploading'    // File being uploaded to Vercel Blob
  | 'processing'   // AI pipeline running
  | 'completed'    // Successfully extracted
  | 'failed'       // Pipeline error
  | 'needs_review' // Low confidence — user should verify
```

---

## 8. API Design

### tRPC Routers

```
api/trpc/
├── document
│   ├── upload        # Upload file → trigger pipeline
│   ├── getAll        # List user's documents (with filters)
│   ├── getById       # Single document with extracted data
│   ├── reprocess     # Re-run AI pipeline on existing doc
│   ├── updateType    # Manual override of document type
│   ├── delete        # Delete document + blob
│   └── search        # Full-text search across documents
│
├── ai
│   ├── classify      # Standalone classification
│   └── extract       # Standalone extraction with custom schema
│
└── auth
    ├── register      # Create account
    └── getSession    # Current session info
```

---

## 9. Supported Document Types & Schemas

| Document Type | Key Fields Extracted | Status |
|---|---|---|
| **Invoice** | Invoice #, vendor, line items, totals, due date, currency | 🔲 Planned |
| **Receipt** | Merchant, items, tax, total, payment method, date | 🔲 Planned |
| **CV / Resume** | Name, experience, education, skills, certifications | 🔲 Planned |
| **Contract** | Parties, effective date, terms, clauses, signatures | 🔲 Planned |
| **Bank Statement** | Account #, period, transactions, opening/closing balance | 🔲 Planned |
| **ID Document** | Full name, DOB, ID number, nationality, expiry | 🔲 Planned |
| **Letter** | Sender, recipient, date, subject, body | 🔲 Planned |
| **Generic** | Title, date, key-value pairs, summary | 🔲 Planned |

> **Adding a new document type** requires only:
> 1. Create a new Zod schema file in `packages/ai/src/schemas/`
> 2. Add it to the schema registry
> 3. Add the type to the classification enum
> 
> Zero pipeline changes. Zero new API endpoints. The system automatically routes to it.

---

## 10. Native App (Expo)

### Platform: iOS + Android
### Framework: Expo SDK 55, React Native 0.83, Expo Router

### Key Screens

| Screen | Description |
|---|---|
| **(auth) signin** | Email/password login |
| **(auth) signup** | Registration form |
| **(tabs) scan** | Camera-based document scanner |
| **(tabs) documents** | Document library with search/filter |
| **(tabs) dashboard** | Stats overview |
| **(tabs) profile** | User profile + settings |
| **document/[id]** | Document detail — original image + extracted data |

### Native-Specific Dependencies

| Package | Purpose |
|---|---|
| `expo-camera` | Document scanning via camera |
| `expo-image-picker` | Import from photo gallery |
| `expo-file-system` | Local file handling |

---

## 11. Web App (Next.js)

### Framework: Next.js 16, App Router, React 19

### Key Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/auth/signin` | Sign in |
| `/auth/signup` | Sign up |
| `/dashboard` | Overview stats, recent documents |
| `/dashboard/documents` | Full document library |
| `/dashboard/documents/[id]` | Document detail view |
| `/dashboard/upload` | Upload zone |

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handlers |
| `/api/auth/register` | POST | User registration |
| `/api/trpc/[trpc]` | ALL | tRPC handler |
| `/api/upload` | POST | File upload to Vercel Blob |
| `/api/process` | POST | Trigger AI pipeline |

---

## 12. Shared Packages

### `@repo/ui` — Shared Components

Cross-platform components used by both native and web apps:

| Component | Description |
|---|---|
| `Button` | Primary action button ✅ Exists |
| `DocumentCard` | Document preview card with type badge |
| `UploadZone` | Drag-and-drop / tap-to-upload area |
| `StatusBadge` | Processing status indicator |
| `DataTable` | Key-value display for extracted data |
| `SearchInput` | Search bar with filters |
| `EmptyState` | Empty state illustrations |

### `@repo/ai` — AI Pipeline

The complete document processing pipeline (see Section 5).

### `@repo/db` — Database

Drizzle ORM schema definitions and connection management.

### `@repo/api` — tRPC Routers

Type-safe API definitions shared across apps.

### `@repo/shared` — Types & Utils

Shared TypeScript types, constants, and utility functions.

---

## 13. Environment Variables

```bash
# ─── Database ───
DATABASE_URL="postgresql://user:pass@host/dbname"      # Neon Postgres

# ─── Auth ───
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"  # JWT signing
NEXTAUTH_URL="http://localhost:3000"                     # App URL
GOOGLE_CLIENT_ID="your-google-client-id"                 # Optional OAuth
GOOGLE_CLIENT_SECRET="your-google-client-secret"         # Optional OAuth

# ─── Storage ───
BLOB_READ_WRITE_TOKEN="vercel-blob-token"                # Vercel Blob

# ─── AI ───
GOOGLE_GENERATIVE_AI_API_KEY="gemini-api-key"            # Gemini Flash

# ─── Cache ───
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

---

## 14. Development Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd document-intel-monorepo
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Fill in all required values

# 3. Set up database
pnpm db:push        # Push Drizzle schema to Neon

# 4. Run development
pnpm dev             # Starts all apps via Turborepo
# OR individually:
pnpm --filter native ios      # Run iOS app
pnpm --filter native android  # Run Android app
pnpm --filter web dev         # Run web app
```

---

## 15. Deployment

| App | Platform | Notes |
|---|---|---|
| **Web** | Vercel | Auto-deploy from main branch |
| **Native (iOS)** | EAS Build → App Store | `eas build --platform ios` |
| **Native (Android)** | EAS Build → Play Store | `eas build --platform android` |

---

## 16. Build Log / Changelog

> This section is updated as features are built. Each entry documents what was built, key decisions made, and any issues encountered.

### 2026-06-28 — Project Initialization

- **What**: Scaffolded Turborepo monorepo with React Native (Expo) + Next.js
- **Stack decided**: Zod, Zustand, Upstash Redis, Drizzle + Neon, Vercel Blob, NextAuth v5 (custom auth), Gemini Flash, Tesseract.js, tRPC
- **Architecture**: Two-stage AI pipeline (classify → route → extract) designed
- **Key decision**: Custom auth over Clerk (following ChowVest pattern)
- **Key decision**: Drizzle over Prisma (lighter, no codegen) — *pending user confirmation*
- **Status**: Foundation scaffolded, no features implemented yet

### 2026-07-02 — Web Dashboard Upload & Next.js 15 Fixes

- **What**: Built out the file upload zone on the web dashboard and fixed several backend Next.js API route issues.
- **UI UX**: Implemented a dynamic, sleek progress bar for the upload and AI processing states in the dashboard (`upload-zone.tsx`) to improve user feedback.
- **Next.js 15 Compatibility**: Updated dynamic API routes (like `/api/documents/[id]/route.ts`) to use asynchronous `params` Promises, fixing Next.js 15 route handler typing errors.
- **Vercel Blob Integration**: Upgraded `@vercel/blob` to v2.5.0. Enforced `access: 'public'` for blob uploads to ensure direct preview links in the dashboard work without complex signed URL generation.
- **Tesseract.js Bundling Bug**: Fixed a notorious Turbopack/Next.js bug where `tesseract.js` worker scripts would fail with `MODULE_NOT_FOUND` by adding `serverExternalPackages: ['tesseract.js', 'pdf2pic']` to `next.config.js`.

### 2026-07-04 — Parallel AI Pipeline & UX Streaming

- **What**: Major upgrade to the extraction pipeline, transitioning from sequential OCR to parallel cross-validated (Vision + OCR) extraction.
- **AI Pipeline**: Implemented `cross-validate.ts` to run Tesseract.js and Gemini 2.0 Flash Vision directly on the file simultaneously. This solves the issue of OCR mangling complex layouts (like tables or hierarchical forms) before the LLM sees it. 
- **Dynamic Schemas**: Added a flexible `keyInformation: { key, value }[]` property across all schemas (generic, receipt, invoice, etc.). Prompts were updated to explicitly extract unmapped fields. This allows the system to seamlessly handle random, country-specific fields (e.g. "Origin LGA", "Sponsor Details" on Nigerian forms) without requiring hardcoded schema updates.
- **UX Streaming (SSE)**: Upgraded the `/api/documents/process` route to return a `text/event-stream`. The web UI now displays real-time checklist progress (e.g., "Classifying document...", "Running Vision extraction...") instead of a static loader, drastically improving perceived performance during 10-15s AI waits.
- **Dev Auth**: Increased dev environment access token and cookie expiration from 15 minutes to 7 days. This prevents silent `401 Unauthorized` errors when testing the dashboard for extended periods without a refresh token flow.

---

> **📌 Note**: This document is a living reference. It will be updated as each feature is implemented. Check the [Build Log](#16-build-log--changelog) section for the latest progress.
