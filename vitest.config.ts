import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // esbuild cannot emit decorator metadata, which Nest's DI and
  // class-validator rely on, so specs are compiled with SWC instead.
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    environment: 'node',
    setupFiles: ['./test/setup-env.ts'],
    clearMocks: true,
    projects: [
      {
        extends: true,
        test: { name: 'unit', include: ['src/**/*.spec.ts'] },
      },
      {
        extends: true,
        test: { name: 'e2e', include: ['test/**/*.e2e-spec.ts'] },
      },
    ],
  },
});
