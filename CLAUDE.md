# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 16 storefront built with the App Router for Vendure headless commerce. Uses TypeScript, React 19, Tailwind CSS 4, and gql.tada for type-safe GraphQL operations.

## Development Commands

```bash
# Start development server on port 3001
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check without emitting files
npm run check-types
```

## Environment Setup

Copy `.env.example` to `.env` and configure:
- `VENDURE_SHOP_API_URL` - Vendure GraphQL API endpoint (server-side)
- `VENDURE_CHANNEL_TOKEN` - Channel token (defaults to `__default_channel__`)
- `REVALIDATION_SECRET` - Secret for `/api/revalidate` endpoint
- `NEXT_PUBLIC_SITE_URL` - Site URL for metadata/SEO

Use `NEXT_PUBLIC_` prefix for client-side accessible variables.

## Architecture

### GraphQL Integration

**Type-safe GraphQL with gql.tada:**
- GraphQL schema introspection is configured in `tsconfig.json` pointing to Vendure demo API
- All GraphQL operations defined in `src/lib/vendure/`:
  - `queries.ts` - Data fetching queries
  - `mutations.ts` - Data modification operations
  - `fragments.ts` - Reusable GraphQL fragments
  - `api.ts` - Core `query()` and `mutate()` functions
- `src/graphql.ts` - Exports the type-safe `graphql` template tag
- Auto-generated types in `src/graphql-env.d.ts` (do not edit manually)

**Vendure API communication:**
- Base API wrapper in `src/lib/vendure/api.ts` handles authentication headers, channel tokens, and error responses
- Authentication token stored in cookies (name configurable via `VENDURE_AUTH_TOKEN_COOKIE`)
- Channel token sent via custom header (configurable via `VENDURE_CHANNEL_TOKEN_HEADER`)
- All API calls support optional `tags` for Next.js cache revalidation

### Authentication Flow

- Cookie-based session management via `src/lib/auth.ts`
- Auth token automatically extracted from Vendure API responses and stored
- Protected routes use `getAuthToken()` to retrieve current session
- Server actions in `src/lib/vendure/actions.ts` use `cache()` wrapper for request deduplication
- Auth context provider in `src/contexts/auth-context.tsx` for client-side auth state

### Directory Structure

**App Router (`src/app/`):**
- Route-based file structure following Next.js 16 conventions
- Server Components by default, Client Components marked with `'use client'`
- Key routes: `/product/[slug]`, `/collection/[slug]`, `/checkout`, `/account/*`, `/search`
- API routes in `src/app/api/` (e.g., `/api/revalidate` for cache invalidation)

**Components (`src/components/`):**
- `commerce/` - E-commerce specific components (product cards, facet filters, price display)
- `layout/` - Structural components (navbar, footer)
- `shared/` - Reusable cross-domain components
- `ui/` - shadcn/ui components (Radix UI primitives + Tailwind)
- `providers/` - React context providers

**Lib (`src/lib/`):**
- `vendure/` - All Vendure API integration code
- `auth.ts` - Session token management
- `format.ts` - Formatting utilities (currency, dates)
- `metadata.ts` - SEO/metadata helpers
- `search-helpers.ts` - Search and filtering utilities
- `utils.ts` - General utilities (includes `cn()` from tailwind-merge)

**Hooks (`src/hooks/`):**
- Custom React hooks (e.g., `use-mobile.ts` for responsive breakpoints)

**Contexts (`src/contexts/`):**
- React contexts for global state (authentication, cart, etc.)

### Data Fetching Patterns

**Server-side data fetching:**
```typescript
import { query } from '@/lib/vendure/api';
import { GetProductQuery } from '@/lib/vendure/queries';

const { data } = await query(GetProductQuery, { slug: 'product-slug' });
```

**With authentication:**
```typescript
import { query } from '@/lib/vendure/api';
import { getAuthToken } from '@/lib/auth';

const token = await getAuthToken();
const { data } = await query(SomeQuery, undefined, { token });
```

**Server Actions with caching:**
```typescript
import { cache } from 'react';
import { getActiveCustomer } from '@/lib/vendure/actions';

// Uses React cache() for request deduplication
const customer = await getActiveCustomer();
```

**Mutations:**
```typescript
import { mutate } from '@/lib/vendure/api';
import { LoginMutation } from '@/lib/vendure/mutations';

const { data, token } = await mutate(LoginMutation, { email, password });
// New auth token automatically returned if login successful
```

### Styling

- Tailwind CSS 4 with `@tailwindcss/postcss` plugin
- Component variants via `class-variance-authority`
- shadcn/ui component library (Radix UI + Tailwind)
- Theme customization in `src/app/globals.css`
- Dark mode support via `next-themes`

### Image Handling

Images configured in `next.config.ts` with:
- `dangerouslyAllowLocalIP: true` for local Vendure instances
- Remote patterns for Vendure demo domains and localhost

## Working with GraphQL

When adding new GraphQL operations:

1. Define the operation in appropriate file (`queries.ts` or `mutations.ts`):
```typescript
export const MyQuery = graphql(`
  query MyQuery($input: String!) {
    myField(input: $input) {
      id
      name
    }
  }
`);
```

2. Use the operation with type-safe variables:
```typescript
const { data } = await query(MyQuery, { input: 'value' });
// data is fully typed based on the GraphQL response
```

3. For reusable fragments, add to `fragments.ts` and use `readFragment()`:
```typescript
import { readFragment } from '@/graphql';
import { MyFragment } from '@/lib/vendure/fragments';

const fragmentData = readFragment(MyFragment, rawData);
```

## Key Conventions

- Use Server Components by default; only add `'use client'` when client-side interactivity is required
- Prefer server-side data fetching in page components and Server Actions for mutations
- Store sensitive config in server-side env vars (without `NEXT_PUBLIC_` prefix)
- Use `@/` path alias for imports from `src/` directory
- Follow existing naming patterns: kebab-case for files, PascalCase for components
- GraphQL operations use PascalCase with descriptive suffixes (e.g., `GetProductQuery`, `AddToCartMutation`)
