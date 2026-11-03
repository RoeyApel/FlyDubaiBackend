import 'reflect-metadata';

// Deterministic environment for every test run, so results never depend on
// whatever a developer's shell or local .env happens to define.
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.DB_HOST = 'localhost';
process.env.DB_USERNAME = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-chars';
