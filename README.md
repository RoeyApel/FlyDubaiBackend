# FlyDubaiBackend

Bus-booking API for the FlyDubai Android app. NestJS + TypeScript (ESM, pnpm, Vitest + SWC, ESLint + Prettier, pino logging, PostgreSQL + TypeORM).

## Getting started

```bash
pnpm install
cp .env.example .env   # then set JWT_SECRET (see the comment in the file)
pnpm db                # local PostgreSQL
pnpm seed              # wipe and fill cities, buses and rides for the next 14 days
pnpm dev
```

- API docs (Swagger): `http://localhost:3000/api/docs`
- Health: `GET /api/v1/health`

## API

All routes are under `/api/v1`. `register`, `login` and `health` are public; every other route needs `Authorization: Bearer <accessToken>` (JWT, valid for 7 days) and returns `401` otherwise.

| Route                                            | Purpose                                                   |
| ------------------------------------------------ | --------------------------------------------------------- |
| `POST /auth/register`                            | Create an account, returns a token (`409` if email taken) |
| `POST /auth/login`                               | Returns a token (`401` for wrong email or password)       |
| `GET /users/me`                                  | Current user                                              |
| `GET /cities`                                    | All cities, sorted by name                                |
| `GET /rides?originCityId&destinationCityId&date` | Rides of that UTC day that have not departed yet          |
| `GET /rides/:id`                                 | One ride                                                  |
| `GET /rides/:id/seats`                           | Bus layout and taken seats (`isMine` for your own)        |
| `POST /bookings`                                 | Buy a seat with a (mock) card payment                     |
| `GET /bookings/me`                               | Your bookings, newest first                               |

Payments are mocked: the card is validated (Luhn, expiry, CVV format) but never charged, and only its last 4 digits are stored.

## Scripts

| Script                        | Purpose                                           |
| ----------------------------- | ------------------------------------------------- |
| `pnpm db`                     | Start local PostgreSQL (Docker)                   |
| `pnpm seed`                   | Wipe the database and seed it (not in production) |
| `pnpm dev`                    | Run with watch mode                               |
| `pnpm build` / `pnpm start`   | Compile and run `dist/`                           |
| `pnpm typecheck`              | Type-check without emitting                       |
| `pnpm lint` / `pnpm format`   | ESLint + Prettier check / fix                     |
| `pnpm test` / `pnpm test:e2e` | Unit / e2e tests                                  |

## Layout

```
src/
  main.ts            bootstrap
  app.module.ts      root module
  app.setup.ts       global prefix, validation, Swagger
  config/            env validation (class-validator)
  common/            logging, validation transforms, database helpers
  database/          TypeORM connection and seed script
  entities/          TypeORM entities
  types/<feature>/   types.ts (DTOs, response shapes, constants) and enums.ts
  auth/              register/login, JWT guard, @Public() and @CurrentUserId()
  users/ cities/ rides/ bookings/ payments/ buses/
                     feature modules (module, controller, service, mapper)
test/                e2e tests, test setup and shared fixtures
```

Add new features as modules under `src/<feature>/`, put their DTOs, response types and constants in `src/types/<feature>/types.ts`, and import the module in `AppModule`.

## Database

PostgreSQL via TypeORM with `synchronize: true`: the schema is created and updated automatically from the entities on startup. Entities live in `src/entities/` and are registered by their feature module with `TypeOrmModule.forFeature([...])`.
