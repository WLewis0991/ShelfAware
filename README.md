<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=next.js&logoColor=white">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=next.js&logoColor=white">
</picture>
![React 19](https://img.shields.io/badge/React%2019-222222?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%20v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel Blob](https://img.shields.io/badge/Vercel%20Blob-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

# Shelf Aware

**Turn any PDF into an interactive AI voice conversation.**

Shelf Aware is a full-stack web application that lets users upload books or PDFs and have an intelligent, spoken conversation with AI about the content. Choose from multiple ElevenLabs voices, search your book's text in real time, and get a personalized book discussion experience — all powered by Vapi.ai voice AI.

Built with Next.js 16, React 19, MongoDB, Clerk authentication with subscription billing, and deployed on Vercel.

---

## Features

- **PDF Upload** — Drag-and-drop PDF upload with automatic text extraction and cover image generation using `pdfjs-dist`
- **AI Voice Conversations** — Natural, spoken dialogue with an AI assistant using Vapi.ai and ElevenLabs text-to-speech voices
- **Multiple Voices** — Choose from 4 ElevenLabs voices across male/female categories with customizable tone settings
- **Full-Text Search** — Search within any uploaded book's text using MongoDB text indexes, accessible both in-app and via the AI assistant tool
- **Subscription Billing** — Three-tier plan system (Free, Standard, Pro) enforced server-side with Clerk plan entitlements
- **Dark Mode** — Full grayscale dark theme with persistent preference via `next-themes`
- **Searchable Library** — Filter your book collection by title or author with URL-based search params
- **Responsive Design** — Warm, literary-themed UI built with Tailwind CSS v4 and shadcn/ui components

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (strict mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + CSS custom properties |
| **Components** | [shadcn/ui](https://ui.shadcn.com/) (Radix primitives) |
| **Database** | [MongoDB](https://www.mongodb.com/) via [Mongoose 9](https://mongoosejs.com/) |
| **Authentication** | [Clerk](https://clerk.com/) (with subscription plans) |
| **Voice AI** | [Vapi.ai](https://vapi.ai/) Web SDK + [ElevenLabs](https://elevenlabs.io/) TTS |
| **File Storage** | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |
| **PDF Parsing** | [pdfjs-dist](https://mozilla.github.io/pdf.js/) |
| **Forms** | [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Testing** | [Vitest](https://vitest.dev/) + [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server) |
| **Linting** | [ESLint](https://eslint.org/) v9 (flat config) |

---

## Architecture

### Data Flow

```
┌──────────────┐      ┌───────────────────┐      ┌─────────────────┐
│  Upload PDF  │ ───> │  Client-Side      │ ───> │  Vercel Blob    │
│  (UploadForm)│      │  PDF Parsing      │      │  (File Storage) │
└──────────────┘      │  (pdfjs-dist)     │      └─────────────────┘
                      └───────────────────┘             │
                              │                         │
                              ▼                         ▼
                      ┌───────────────────┐      ┌─────────────────┐
                      │  Server Action    │      │  Book Cover     │
                      │  (createBook)     │      │  Image Upload   │
                      └───────────────────┘      └─────────────────┘
                              │
                              ▼
                      ┌───────────────────┐
                      │  MongoDB           │
                      │  (Book + Segment)  │
                      └───────────────────┘

┌──────────────┐      ┌───────────────────┐      ┌─────────────────┐
│  Voice Chat  │ ───> │  Vapi.ai SDK      │ ───> │  ElevenLabs     │
│  (VapiContr.)│      │  (WebRTC)         │      │  (Text-to-Speech│
└──────────────┘      └───────────────────┘      └─────────────────┘
       │                      │
       ▼                      ▼
┌──────────────┐      ┌───────────────────┐
│  Server      │      │  MongoDB Text     │
│  Actions     │      │  Search           │
│  (sessions)  │      │  (API Route)      │
└──────────────┘      └───────────────────┘
```

### Key Design Decisions

- **Server Actions for mutations** — All database writes go through `"use server"` functions with Clerk auth verification and subscription plan enforcement
- **URL-based search params** — Library search is shareable and server-rendered via `searchParams`, not client state
- **CSS custom properties for theming** — Dark mode inverts ~40 design tokens via `.dark` class overrides, keeping components theme-agnostic
- **Ref-based stale closure prevention** — The Vapi hook uses `useLatestRef` patterns to avoid stale closures in async voice callbacks
- **Calendar-month billing periods** — Session counts reset at the start of each month, tracked via `billingPeriodStart` timestamps on each session document

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB instance (Atlas or local)
- Clerk account with configured subscription plans (`standard`, `pro`)
- Vapi.ai account with an assistant configured
- Vercel Blob storage bucket (or local alternative)

### Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_***
CLERK_SECRET_KEY=sk_test_***

# Database
MONGODB_URI=mongodb+srv://***/***

# Vercel Blob Storage
BLOB_STORE_ID=***
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_***

# Vapi Voice AI
NEXT_PUBLIC_ASSISTANT_ID=***
NEXT_PUBLIC_VAPI_API_KEY=***
```

### Installation

```bash
git clone https://github.com/yourusername/shelf-aware.git
cd shelf-aware
npm install
cp .env.local.example .env.local   # Fill in your credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest test suite |
| `npm run test:watch` | Run tests in watch mode |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with ThemeProvider + ClerkProvider
│   ├── globals.css             # Full design system (~800 lines)
│   ├── (root)/
│   │   ├── page.tsx            # Library home (search, book grid)
│   │   ├── SearchInput.tsx     # Client-side search bar
│   │   ├── books/
│   │   │   ├── [slug]/page.tsx # Book detail + voice chat
│   │   │   └── new/page.tsx    # Upload new book
│   │   └── subscriptions/      # Pricing table page
│   ├── api/
│   │   ├── upload/route.ts     # Vercel Blob upload
│   │   └── vapi/search-book/   # AI tool-calling endpoint
│   ├── sign-in/                # Clerk sign-in
│   └── sign-up/                # Clerk sign-up
│
├── components/
│   ├── Navbar.tsx              # Navigation + dark mode toggle
│   ├── HeroSection.tsx         # Homepage hero
│   ├── BookCard.tsx            # Library book card
│   ├── UploadForm.tsx          # PDF upload form (~425 lines)
│   ├── VapiControls.tsx        # Voice session controls
│   ├── Transcript.tsx          # Conversation transcript
│   ├── ThemeToggle.tsx         # Dark/light mode button
│   └── ui/                     # shadcn/ui primitives
│
├── hooks/
│   └── useVapi.ts              # Vapi.ai Web SDK hook (~250 lines)
│
├── lib/
│   ├── actions/
│   │   ├── book.actions.ts     # Book CRUD server actions
│   │   └── session.actions.ts  # Voice session actions
│   ├── constants.ts            # App constants
│   ├── plans.ts                # Subscription plan checking
│   ├── subscription-constants.ts # Plan definitions & limits
│   └── utils.ts                # Utilities (slug, PDF parsing, etc.)
│
├── database/
│   ├── mongoose.ts             # MongoDB connection singleton
│   └── models/
│       ├── book.model.ts       # Book schema
│       ├── bookSegment.model.ts # Text segment schema (searchable)
│       └── voiceSession.model.ts # Voice session schema (billing)
│
├── types.d.ts                  # Global TypeScript interfaces
└── proxy.ts                    # Clerk middleware
```

---

## Design System

The UI uses a "Warm Literary" design language with cream backgrounds, dark navy text, and warm brown accents — inspired by reading rooms and physical bookshelves. Dark mode shifts to a full grayscale palette.

| Token | Light | Dark |
|-------|-------|------|
| Background | `#f8f4e9` (warm cream) | `#1a1a1a` |
| Card | `#ffffff` | `#2a2a2a` |
| Text Primary | `#212a3b` (dark navy) | `#e5e5e5` |
| Brand | `#663820` (warm brown) | `#a3a3a3` |
| Accent Light | `#fff6e5` | `#333333` |

Typography uses IBM Plex Serif for headings and Mona Sans for body text.

---

## Subscription Plans

| Tier | Books | Sessions/Month | Session Duration | History |
|------|-------|---------------|-----------------|---------|
| Free | 2 | 5 | 5 min | — |
| Standard | 10 | 100 | 15 min | ✓ |
| Pro | 100 | Unlimited | 60 min | ✓ |

Plans are managed through Clerk Dashboard and enforced server-side in all mutation actions. The `<PricingTable />` component renders the Clerk-hosted checkout experience.

---

## Testing

```bash
npm test
```

The test suite uses Vitest with `mongodb-memory-server` for isolated integration tests against book creation, existence checking, and segment saving. Clerk is mocked via `vi.mock()` in the setup file.

---

## Deployment

Deploy to Vercel with zero configuration:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Ensure all environment variables are configured in your Vercel project settings, and set up Clerk webhooks if using user/org synchronization.

---

## License

[MIT](LICENSE) — Copyright (c) 2026
