# Digital songbook

This is a digital songbook Progressive Web App (PWA) for browsing and viewing scout songs.

## Tech Stack

- **Next.js** -React framework used for routing, server-side rendering and overall app structure.
- **React** - Library used to build reusable UI components.
- **TypeScript** – Adds static typing to JavaScript for better reliability and maintainability.
- **Tailwind CSS** – Utility-first CSS framework used for styling the application.
- **Supabase** - Backend and database.
- **IndexedDB + Dexie** - Offline storage and caching og songs.
- **Vercel** - Hosting platform used to deploy and run the application.

## How to run the project

First, clone the repository.

### 1. Install dependencies

```bash
pnpm install
```

### 2. Run development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 3. Build for production

```bash
pnpm run build
pnpm start
```

TODO: Fjern det vi ikke skal ha av dette og skriv om det vi skal ha med (av backend, .env osv):

Mention environment variables (`.env.local`)

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Naming conventions

All UI elements are implemented as React components using TypeScript (TSX).

- React components: PascalCase
- Files: PascalCase for components and pages, lowercase for route files
- Variables and functions: camelCase
- Types and interfaces: PascalCase

## Component structure
