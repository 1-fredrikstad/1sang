# Digital songbook

This is a digital songbook Progressive Web App (PWA) for browsing and viewing scout songs.

## Tech Stack

- **Next.js** -React framework used for routing, server-side rendering and overall app structure.
- **React** - Library used to build reusable UI components.
- **TypeScript** – Adds static typing to JavaScript for better reliability and maintainability.
- **Tailwind CSS** – Utility-first CSS framework used for styling the application.
- **Supabase** - Backend and database.
- **IndexedDB + Dexie** - Offline storage and caching of songs.
- **Vercel** - Hosting platform used to deploy and run the application.

## How to run the project

First, clone the repository.

### 1. Install dependencies

```bash
pnpm install
```

### 2. Run development server

Go to the `frontend` folder:

```bash
cd frontend
```

And run:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 3. Build for production

Go to the `frontend` folder:

```bash
cd frontend
```

And run:

```bash
pnpm build
pnpm start
```

### Environment variables

This project requires Supabase environment variables to run.

Create a `.env.local` file inside the `frontend` folder and add:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

You can find these values in your Supabase Dashboard under:
Project Settings → API.

Do not commit your .env.local file to GitHub.

## Naming conventions

All UI elements are implemented as React components using TypeScript (TSX).

- **React components**: PascalCase
- **Files**: PascalCase for components and pages, lowercase for route files
- **Variables and functions**: camelCase
- **Types and interfaces**: PascalCase

## Component structure
