import { context, build } from 'esbuild';
import { statSync } from 'node:fs';

const OUTFILE = 'dist/app.js';
const SIZE_WARNING_LIMIT_MB = 2.5;
const SIZE_WARNING_LIMIT_BYTES = SIZE_WARNING_LIMIT_MB * 1024 * 1024;
const isWatch = process.argv.includes('--watch');

function printSizeWarning() {
  const size = statSync(OUTFILE).size;
  if (size > SIZE_WARNING_LIMIT_BYTES) {
    const sizeMb = (size / (1024 * 1024)).toFixed(1);
    console.warn(
      `⚠️  ${OUTFILE} is ${sizeMb}mb (configured warning limit: ${SIZE_WARNING_LIMIT_MB}mb)`
    );
  }
}

const options = {
  bundle: true,
  entryPoints: ['src/main.ts'],
  outfile: OUTFILE,
  platform: 'node',
  // Use warning level so esbuild doesn't print its hardcoded 1mb info summary.
  logLevel: 'warning',
};

if (isWatch) {
  const ctx = await context({
    ...options,
    plugins: [
      {
        name: 'custom-size-warning',
        setup(buildApi) {
          buildApi.onEnd((result) => {
            if (result.errors.length === 0) {
              printSizeWarning();
            }
          });
        },
      },
    ],
  });

  await ctx.watch();
  console.log(`Watching... (size warning limit: ${SIZE_WARNING_LIMIT_MB}mb)`);
} else {
  await build(options);
  printSizeWarning();
}
