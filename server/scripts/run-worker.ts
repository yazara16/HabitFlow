#!/usr/bin/env tsx
import { computeAndRunWorker } from '../routes/worker';

(async () => {
  try {
    console.log('Running worker...');
    const report = await computeAndRunWorker();
    console.log('Worker finished:');
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('Worker failed:', e);
    process.exit(1);
  }
})();
