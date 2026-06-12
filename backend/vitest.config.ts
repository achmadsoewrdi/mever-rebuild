import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Jalankan test secara sequential (satu per satu) agar tidak bentrok di DB
    sequence: {
      concurrent: false,
    },
    // Timeout tiap test 10 detik (karena hit real server)
    testTimeout: 10000,
    // Glob pattern file test
    include: ['tests/**/*.test.ts'],
    // Reporter
    reporter: 'verbose',
  },
});
