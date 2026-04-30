const axios = require('axios');
const chalk = require('chalk');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const TOKEN = process.env.AUTH_TOKEN;
const CONCURRENCY = parseInt(process.env.CONCURRENCY) || 50;
const TOTAL_REQUESTS = parseInt(process.env.TOTAL_REQUESTS) || 500;

if (!TOKEN) {
  console.error(chalk.red('ERROR: AUTH_TOKEN environment variable is required.'));
  console.log(chalk.yellow('Usage: $env:AUTH_TOKEN="your_token"; node backend/scripts/stress-test.js'));
  process.exit(1);
}

async function runTest() {
  console.log(chalk.cyan('🚀 INITIALIZING API STRESS TEST'));
  console.log(chalk.gray(`Target: ${BASE_URL}`));
  console.log(chalk.gray(`Concurrency: ${CONCURRENCY}`));
  console.log(chalk.gray(`Total Requests: ${TOTAL_REQUESTS}\n`));

  const stats = {
    success: 0,
    failure: 0,
    durations: [],
  };

  const startTime = Date.now();
  let completed = 0;

  async function executeRequest() {
    const start = Date.now();
    try {
      // Alternating between /stats and /devices
      const endpoint = Math.random() > 0.5 ? '/stats' : '/devices?limit=50';
      await axios.get(`${BASE_URL}${endpoint}`, {
        headers: { 'x-auth-token': TOKEN }
      });
      stats.success++;
    } catch (error) {
      stats.failure++;
    } finally {
      stats.durations.push(Date.now() - start);
      completed++;
      if (completed % 50 === 0) {
        console.log(chalk.gray(`Progress: ${completed}/${TOTAL_REQUESTS} requests completed...`));
      }
    }
  }

  const pool = [];
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    if (pool.length >= CONCURRENCY) {
      await Promise.race(pool);
    }
    const p = executeRequest().then(() => {
      pool.splice(pool.indexOf(p), 1);
    });
    pool.push(p);
  }
  await Promise.all(pool);

  const totalTime = (Date.now() - startTime) / 1000;
  const avgDuration = stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length;
  const p95 = stats.durations.sort((a, b) => a - b)[Math.floor(stats.durations.length * 0.95)];

  console.log('\n' + chalk.green('📊 STRESS TEST RESULTS'));
  console.log(chalk.white('----------------------------------------'));
  console.log(`${chalk.bold('Total Time:')} ${totalTime.toFixed(2)}s`);
  console.log(`${chalk.bold('Success Rate:')} ${((stats.success / TOTAL_REQUESTS) * 100).toFixed(1)}% (${stats.success}/${TOTAL_REQUESTS})`);
  console.log(`${chalk.bold('Failure Rate:')} ${((stats.failure / TOTAL_REQUESTS) * 100).toFixed(1)}% (${stats.failure}/${TOTAL_REQUESTS})`);
  console.log(`${chalk.bold('Avg Latency:')} ${avgDuration.toFixed(2)}ms`);
  console.log(`${chalk.bold('95th Percentile:')} ${p95.toFixed(2)}ms`);
  console.log(`${chalk.bold('Requests/sec:')} ${(TOTAL_REQUESTS / totalTime).toFixed(2)}`);
  console.log(chalk.white('----------------------------------------'));

  if (stats.failure > 0) {
    console.log(chalk.red('⚠️ WARNING: Failures detected. Check server logs for details.'));
  } else if (p95 > 500) {
    console.log(chalk.yellow('⚠️ NOTICE: High P95 latency detected. Consider further optimization.'));
  } else {
    console.log(chalk.green('✅ PERFORMANCE CRITERIA MET. System stable under load.'));
  }
}

runTest();
