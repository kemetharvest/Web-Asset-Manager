# Egypt Results Portal

A production-ready web portal for Egyptian High School (Thanaweya Amma) exam results. Students and families search by seat number or name to instantly retrieve results from a dataset of ~919,000 students.

## Run & Operate

- `pnpm --filter @workspace/egypt-results run dev` — run the Next.js app (includes all API routes)
- `pnpm --filter @workspace/egypt-results run build` — production build (Vercel-compatible)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- **Single Next.js 15 app (App Router) + React 19 + Tailwind CSS v4 + Framer Motion + shadcn/ui + IBM Plex Sans Arabic**
- API: Next.js API Routes under `app/api/` — no separate server
- Data: xlsx package reads `.xlsx`/`.xls` Excel files into an in-memory store
- File upload: native Web API `FormData` / `File` — no multer needed

## Where things live

- `artifacts/egypt-results/` — Next.js app (frontend + API routes)
- `artifacts/egypt-results/src/lib/store.ts` — in-memory student data store (global singleton)
- `artifacts/egypt-results/src/lib/auth.ts` — token-based admin auth (global singleton)
- `artifacts/egypt-results/src/lib/preload.ts` — lazy Excel preload + `parseExcelBuffer`
- `artifacts/egypt-results/src/app/api/results/` — seat-number lookup + name search routes
- `artifacts/egypt-results/src/app/api/admin/` — login / upload / stats / delete / status routes
- `artifacts/egypt-results/data/students.xlsx` — pre-loaded student data (919,396 rows, bundled for Vercel)
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `attached_assets/يرو500_1785289189627.xlsx` — original source Excel file

## Architecture decisions

- **In-memory store**: All student data lives in a `Map<seatNumber, Student>` for O(1) lookup and a flat array for name search. With 919k rows it uses ~200-300MB RAM. Data persists until server restart.
- **Lazy preload**: The store is loaded on the first API request that needs it, searching `data/students.xlsx` (Vercel) then `attached_assets/` (Replit). A shared Promise deduplicates concurrent cold-start calls.
- **Global singletons**: Store and auth tokens use `global.__studentStore` / `global.__authTokens` so state survives Next.js hot-reloads in dev and persists across requests within the same serverless instance.
- **No database**: This app intentionally avoids PostgreSQL — the data is read-only from Excel and re-loaded per deploy/restart. The `lib/db` package is unused here.
- **Admin auth**: Simple UUID token stored in a server-side Set. Password defaults to `admin123` if `ADMIN_PASSWORD` env var is not set.
- **Vercel deployment**: Single `artifacts/egypt-results/` directory deploys directly to Vercel. `vercel.json` installs from the monorepo root (`cd ../.. && pnpm install`) and builds with `next build`. The bundled `data/students.xlsx` is included via `outputFileTracingIncludes`.
- **File upload on Vercel**: The native `request.formData()` handles multipart uploads. Note: Vercel Hobby plan caps request bodies at 4.5 MB; the admin upload of large Excel files requires Vercel Pro (60 s `maxDuration` is already set on the upload route).

## Admin panel

Visit `/admin` in the app. Default password: `admin123` (set `ADMIN_PASSWORD` env var to change it).

Features: Excel upload (replace data), statistics dashboard, delete data with confirmation.

## Excel format

Expected columns (intelligent fuzzy mapping):
- `seating_no` → seat number
- `arabic_name` → student name  
- `total_degree` → total score (out of 410)
- `student_case_desc` → result status (e.g. "ناجح دور أول")

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Data is lost on server restart unless the Excel file is in `attached_assets/` (auto pre-loaded) or admin re-uploads.
- Name search is a linear scan — fast enough for 919k rows in Node.js (~50ms) but not suitable for much larger datasets.
- The `lib/db` package is referenced in `artifacts/api-server/tsconfig.json` references but not imported — this is fine; it was part of the original scaffold.
