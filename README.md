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

- API docs (Swagger): `http://localhost:3000/docs`
- Health: `GET /health`

If port 5432 is taken (e.g. by a local PostgreSQL), set `DB_PORT` in `.env` to a free port such as `5434` and run `pnpm db` again.

## Running (development)

After the one-time setup above, a normal run only needs the database and the server:

```bash
pnpm db    # start PostgreSQL (no-op if it is already running)
pnpm dev   # start the API on http://localhost:3000, restarting on file changes
```

Stop the server with `Ctrl+C`. The database keeps running in Docker and keeps its data; stop it with `docker compose stop` (or `docker compose down -v` to also delete the data). Run `pnpm seed` again whenever you want fresh rides, since they only cover the 14 days after the last seed.

To run the compiled build once, without watch mode:

```bash
pnpm build
pnpm start
```

## API

Routes have no global prefix (e.g. `POST /auth/login`). `register`, `login` and `health` are public; every other route needs `Authorization: Bearer <accessToken>` (JWT, valid for 7 days) and returns `401` otherwise.

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
  auth/              register/login
  decorators/        @Public(), @CurrentUserId(), @IsLuhnNumber()
  guards/            route guards (global JWT AuthGuard)
  users/ cities/ rides/ bookings/ payments/ buses/
                     feature modules (module, controller, service)
  mappers/           entity-to-response mappers, one file per entity
test/
  unit/              unit tests, one file per feature (auth, bookings, rides, ...)
  e2e/               end-to-end tests
  fixtures/          entity builders and DTO validation helper
```

Add new features as modules under `src/<feature>/`, put their DTOs, response types and constants in `src/types/<feature>/types.ts`, and import the module in `AppModule`. Tests go in `test/unit/<feature>.spec.ts`, never next to the source.

## Database

PostgreSQL via TypeORM with `synchronize: true`: the schema is created and updated automatically from the entities on startup. Entities live in `src/entities/` and are registered by their feature module with `TypeOrmModule.forFeature([...])`.
