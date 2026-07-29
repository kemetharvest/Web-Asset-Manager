# Egypt Results Portal

A production-ready web portal for Egyptian High School (Thanaweya Amma) exam results. Students and families search by seat number or name to instantly retrieve results from a dataset of ~919,000 students.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/egypt-results run dev` — run the Next.js frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- **Frontend: Next.js 15 (App Router) + React 19 + Tailwind CSS v4 + Framer Motion + shadcn/ui + IBM Plex Sans Arabic**
- Backend: Express 5 + in-memory student store (Map for O(1) seat-number lookup)
- Data: xlsx package reads `.xlsx`/`.xls` Excel files
- File upload: multer (memory storage, 200MB limit)

## Where things live

- `artifacts/egypt-results/` — React + Vite frontend
- `artifacts/api-server/` — Express API server
- `artifacts/api-server/src/lib/store.ts` — in-memory student data store
- `artifacts/api-server/src/lib/auth.ts` — token-based admin auth
- `artifacts/api-server/src/lib/preload.ts` — pre-loads Excel from attached_assets on startup
- `artifacts/api-server/src/routes/results.ts` — student search endpoints
- `artifacts/api-server/src/routes/admin.ts` — admin upload/stats/delete endpoints
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `attached_assets/يرو500_1785289189627.xlsx` — pre-loaded student data (919,396 rows)

## Architecture decisions

- **In-memory store**: All student data lives in a `Map<seatNumber, Student>` for O(1) lookup and a flat array for name search. With 919k rows it uses ~200-300MB RAM. Data persists until server restart.
- **Pre-load on startup**: The server reads the uploaded Excel file from `attached_assets/` at startup, so the portal is ready immediately without admin action.
- **No database**: This app intentionally avoids PostgreSQL — the data is read-only from Excel and re-loaded per deploy/restart. The `lib/db` package is unused here.
- **Admin auth**: Simple UUID token stored in a server-side Set. Password defaults to `admin123` if `ADMIN_PASSWORD` env var is not set.
- **File upload**: Multipart form handled by multer; frontend uses raw `fetch` with `FormData` since Orval-generated hooks don't support multipart.

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
