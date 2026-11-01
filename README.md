# FlyDubaiBackend

NestJS + TypeScript backend template (ESM, pnpm, Vitest + SWC, ESLint + Prettier, pino logging).

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm dev
```

- Health: `GET /api/v1/health`

## Scripts

| Script                        | Purpose                       |
| ----------------------------- | ----------------------------- |
| `pnpm dev`                    | Run with watch mode           |
| `pnpm build` / `pnpm start`   | Compile and run `dist/`       |
| `pnpm typecheck`              | Type-check without emitting   |
| `pnpm lint` / `pnpm format`   | ESLint + Prettier check / fix |
| `pnpm test` / `pnpm test:e2e` | Unit / e2e tests              |

## Layout

```
src/
  main.ts            bootstrap
  app.module.ts      root module
  app.setup.ts       global prefix, validation
  config/            env validation (class-validator)
  common/            logging, shared utilities
  health/            health endpoint
test/                e2e tests and test setup
```

Add new features as modules under `src/<feature>/` (module, controller, service, DTOs) and import them in `AppModule`.
