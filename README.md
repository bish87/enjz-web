# enjz-web

Customer, provider and admin frontend for the **enjz** services platform. Built with React 19, Vite, Tailwind CSS v4 and shadcn/ui.

## Stack

- React 19 + Vite (JavaScript)
- React Router
- TanStack Query + Axios
- shadcn/ui + Radix UI + Tailwind v4
- react-hook-form + Zod
- i18next (English / Arabic with RTL)
- Sonner toasts

## Getting started

```bash
npm install
cp .env.example .env   # adjust VITE_API_URL if needed
npm run dev
```

The app runs at <http://localhost:5173> and talks to the API at
`http://localhost:3000/api/v1` by default.

### API requirements

Start the API first:

```bash
cd ../enjz-api
npm run db:migrate
npm run db:seed
npm run dev
```

CORS on the API allows `http://localhost:5173` and `http://127.0.0.1:5173`
through `CORS_ORIGINS`.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run oxlint |

## Roles

- **Visitor** — browse home, provider search and provider profiles.
- **Customer** — register/login, edit profile.
- **Provider** — dashboard to edit public profile, services & prices, areas, and track verification status.
- **Admin** — manage categories and areas, review and verify providers.

Public provider pages only list providers whose verification status is `VERIFIED`.

## Project structure

```
src/
  components/
    auth/        auth shell + phone input
    common/      shared UI (provider card, badges, empty/error states)
    guards/      auth / role route guards
    layout/      public navbar, footer, dashboard shell
    providers/   provider-specific UI
    ui/          shadcn/ui components
  context/       auth context
  hooks/         React Query data hooks
  i18n/          i18next config + en/ar locales
  lib/           api client, formatting, schemas, utils
  pages/         route pages (public, provider, admin)
```

## i18n / RTL

Toggle the language from the navbar. The selection is persisted in
`localStorage` (`enjz.language`). Arabic switches the document to `dir="rtl"`;
layouts use Tailwind logical properties so both directions share the same markup.

## Design

Uber Eats-inspired palette: black primary CTAs, `#06C167` brand green accents,
white / `#F6F6F6` surfaces, pill buttons and flat bordered cards, with dark mode.

## Known gaps

Bookings and reviews are not exposed by the API yet. Provider profile pages show
the service request CTA as disabled until booking endpoints exist.
