# Project Context: QuickUni

## Overview
**QuickUni** is a full-stack university management web application built with **Next.js 16 (App Router)**. It aims to manage various aspects of university operations including students, employees, courses, grades, and scheduling.

## Tech Stack
- **Framework:** [Next.js](https://nextjs.org/) (React 19, TypeScript)
- **i18n:** [next-intl](https://next-intl-docs.vercel.app/) (Multi-language support)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), `next-themes` (Dark mode)
- **Database:** PostgreSQL (via `pg`)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (v4)
- **Validation:** [Zod](https://zod.dev/)
- **Forms:** `@tanstack/react-form`
- **Animations:** GSAP, Motion (Framer Motion)

## Architecture
The project follows a **Feature-Based Architecture** aligned with the database domains.
- **Server Actions:** Used for data mutations, located in `src/actions/{domain}.ts`.
- **Services:** Business logic and data access (queries), located in `src/services/{domain}.ts`.
- **Components:** UI is split into generic (`ui`, `shared`) and domain-specific (`features/{domain}`).
- **i18n Routing:** Uses localized routes via `src/app/[locale]` segment.

## Directory Structure
- **`src/app`**: Next.js App Router root.
    - **`[locale]`**: Localized route segment.
        - `(auth)`: Public routes.
        - `admin`: Admin-specific routes.
    - `api`: API routes (NextAuth, specific integrations).
- **`messages`**: JSON translation files (e.g., `en.json`, `vi.json`).
- **`src/i18n`**: i18n configuration (`routing.ts`, `request.ts`).
- **`src/actions`**: Server Actions for mutations.
- **`src/components`**: React components.
- **`src/db`**: Database configuration and schemas.
- **`src/lib`**: Utilities and Zod validators.
- **`src/services`**: Business logic and database queries.

## Key Commands
| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the development server on `http://localhost:3000`. |
| `pnpm build` | Builds the application for production (includes linting). |
| `pnpm start` | Starts the production server. |
| `pnpm lint` | Runs ESLint. |
| `pnpm db:seed` | Seeds the database using `src/db/seed.ts`. |

## Database
- Configuration: `drizzle.config.ts`
- Schema Entry: `src/db/schema.ts` (aggregates schemas from `src/db/schemas/`)
- **Environment Variables:**
    - The project expects a `.env.local` file.
    - Database URL is referenced as `DATABASE_URL`

## Development Conventions
- **Naming:** standard TypeScript/React conventions.
- **Middleware:** `src/proxy.ts` (Handles authentication redirects and i18n routing).
- **Data Access:** Prefer Server Actions (`src/actions`) for mutations and Services (`src/services`) for data fetching.
- **Validation:** `src/lib/validators` for Zod schemas.
- **Multi-language (i18n):**
    - Store all UI strings in `messages/{locale}.json`.
    - Use `useTranslations` hook in Client Components.
    - Use `getTranslations` function in Server Components.
    - Avoid hardcoded strings in JSX.
    - Use namespaces (e.g., `t('Admin.Dashboard')`) to keep translations organized.
