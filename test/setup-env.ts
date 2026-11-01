import 'reflect-metadata';

// Deterministic environment for every test run, so results never depend on
// whatever a developer's shell or local .env happens to define.
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
