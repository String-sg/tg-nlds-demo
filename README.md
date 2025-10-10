## moe-tg-vx Starter

Production-ready Next.js 15 starter configured with Tailwind CSS v4, shadcn/ui, and theming helpers. Built with TypeScript, ESLint, Prettier, and sensible defaults for accessibility and DX.

### Tech stack

- Next.js App Router with React 19 support and Turbopack dev server
- Tailwind CSS v4 using the new `@theme` and `@layer` directives
- shadcn/ui components sourced locally with `next-themes`
- Inset sidebar layout and empty-state homepage scaffold
- TypeScript strict mode, ESLint Flat config, Prettier, and import aliases

### Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to view the app. Edit `src/app/page.tsx` to customize the landing page or add new routes under `src/app`.

### Project scripts

- `npm run dev` — start Next.js in development with Turbopack
- `npm run build` — create an optimized production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint across the repo
- `npm run type-check` — verify TypeScript types without emitting files
- `npm run format` — check formatting with Prettier
- `npm run format:fix` — format files with Prettier

### Tailwind & shadcn/ui

Component source lives under `src/components/ui`. Use the shadcn CLI to add new components:

```bash
npx shadcn@latest add accordion avatar button
```

Global styles and design tokens are defined in `src/app/globals.css` using CSS variables generated during `shadcn init`.

### Database (Supabase)

This project uses Supabase for database and authentication. Full implementation with 19 tables, TypeScript types, and RLS policies.

**Quick Start:**
1. Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) (~15 minutes)
2. Or read the full guide: [VERCEL_SUPABASE_DEPLOYMENT.md](./VERCEL_SUPABASE_DEPLOYMENT.md)

**Documentation:**
- 📘 [SUPABASE_IMPLEMENTATION.md](./SUPABASE_IMPLEMENTATION.md) - Complete implementation details
- 🔄 [DEPLOYMENT_FLOW.md](./DEPLOYMENT_FLOW.md) - Visual deployment flow
- 📖 [supabase/SETUP.md](./supabase/SETUP.md) - Database setup guide

**Database Schema:**
- 19 tables: teachers, students, guardians, classes, attendance, cases, reports
- Row-level security (RLS) for multi-tenant access
- TypeScript types auto-generated from schema
- Helper query functions in `src/lib/supabase/queries.ts`

### Deployment

**Vercel + Supabase (Current Setup):**

The app is deployed on Vercel with Supabase as the database. Follow these steps:

1. **Deploy Database:**
   - Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
   - Or [VERCEL_SUPABASE_DEPLOYMENT.md](./VERCEL_SUPABASE_DEPLOYMENT.md) for detailed guide

2. **Configure Environment Variables:**
   - Vercel Dashboard → Settings → Environment Variables
   - Or use Vercel + Supabase Integration (automatic)

3. **Redeploy:**
   ```bash
   git push  # Auto-deploys to Vercel
   ```

**Local Development:**
```bash
# Copy environment template
cp .env.local.example .env.local

# Add your Supabase credentials to .env.local
# Then start dev server
npm run dev
```
