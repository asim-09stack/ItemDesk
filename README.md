# Item Manager Portal

A small React single-page application to manage a catalog of items. You can list
items, view an item's details, create new items, edit existing ones, and delete
items with a confirmation prompt.

Built with **React 18 + TypeScript (hooks + functional components)**, **React
Router v6**, **Vite**, and plain CSS. State is shared across pages with the
**Context API** and a custom `useItems()` hook — no Redux or other global state
library.

## Features

- **List view** (`/items`) — responsive card grid showing name, category, price and
  stock, with per-card **Edit** and **Delete** actions, plus live **search** and
  **category filter**.
- **Detail view** (`/items/:id`) — displays all available fields for an item and a
  **Back** link to the list.
- **Create / Edit form** (`/items/new`, `/items/:id/edit`) — one reusable component
  with controlled inputs and client-side validation (required fields, numeric
  price/stock, valid URL).
- **Delete** — confirmation modal (with Escape-to-close and scroll lock) before an
  item is removed from the UI.
- **Loading & error states** — a spinner is shown while the seed data "loads", and a
  retryable error message is shown if the load fails.
- **Responsive** — cards stack and the layout collapses gracefully on small screens.

## Getting started

Requirements: **Node.js 18+** and npm.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (opens http://localhost:3000)
npm start

# 3. Type-check and create a production build in ./dist
npm run build

# 4. Preview the production build locally
npm run preview

# Optional: run the TypeScript type-checker on its own
npm run typecheck
```

> `npm start` and `npm run dev` are equivalent — both start the Vite dev server.
> `npm run build` runs `tsc --noEmit` first, so the build fails on any type error.

## Routes

| Route              | View                          |
| ------------------ | ----------------------------- |
| `/items`           | List of all items             |
| `/items/:id`       | Detail view for a single item |
| `/items/new`       | Create form                   |
| `/items/:id/edit`  | Edit form (reuses create form)|

`/` redirects to `/items`, and any unknown route renders a 404 page.

## Project structure

```
src/
├── main.tsx                  # App entry: Router + ItemsProvider
├── App.tsx                   # Route definitions + layout
├── index.css                 # All styling (design tokens + components)
├── types.ts                  # Item + ItemInput type definitions
├── data/
│   └── products.json         # Seed data (loaded into context once)
├── context/
│   └── ItemsContext.tsx      # Typed state + CRUD actions + useItems() hook
├── components/
│   ├── Navbar.tsx
│   ├── ItemCard.tsx
│   ├── ConfirmModal.tsx
│   ├── Loader.tsx
│   └── ErrorState.tsx
└── pages/
    ├── ItemsListPage.tsx
    ├── ItemDetailPage.tsx
    ├── ItemFormPage.tsx      # Shared create + edit form
    └── NotFoundPage.tsx
```

## Architectural decisions & trade-offs

- **Context + custom hook instead of Redux.** The app has a single, simple domain
  (items), so a Context provider exposing the items array plus `addItem`,
  `updateItem`, `deleteItem`, and `getItemById` is enough. Every page reads state
  through `useItems()`, which avoids prop-drilling entirely.
- **Seed once from `products.json`.** `ItemsContext` loads `products.json` a single
  time on mount via a `fetchItems()` promise that resolves after a short delay. This
  keeps the JSON untouched while still exercising real loading/error UI.
- **In-memory state (no persistence).** Edits, creates and deletes live in memory and
  reset on refresh — persistence beyond a refresh was explicitly out of scope. Swapping
  the in-memory store for a REST API would only require changing `ItemsContext`.
- **One form for create and edit.** `ItemFormPage` branches on the presence of an
  `:id` route param. When editing it pre-fills from context; on submit it calls
  `updateItem` or `addItem` and navigates back to `/items`.
- **Validation kept in a pure `validate()` function.** It runs live for inline
  feedback and again on submit, keeping the rules in one place and easy to test.
- **Plain CSS with design tokens.** A single stylesheet with CSS custom properties
  keeps the bundle tiny and dependency-free while staying consistent and responsive.
- **TypeScript with a single source of truth for the model.** The `Item` type (and
  the `ItemInput` type for editable fields) lives in `src/types.ts` and flows through
  the context, components and form, so the item shape is enforced end-to-end. The
  build type-checks with `tsc` before bundling.

## Simulating the error state

To see the error UI, run this in the browser console and reload:

```js
localStorage.setItem('simulateFetchError', 'true'); // remove the key to restore
```

## What I'd add with more time

- Persistence via `localStorage` or a real REST/GraphQL back-end.
- Toast notifications on create/update/delete for clearer feedback.
- Sorting and pagination on the list view.
- Image upload/preview instead of a plain image URL field.
- Unit tests (Vitest + React Testing Library) for the context and the form
  validation, plus an end-to-end smoke test.
- Optimistic updates and undo for deletes.
```
# Manager-Portal
# ItemDesk
