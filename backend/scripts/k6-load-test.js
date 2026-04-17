import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up traffic
    { duration: '1m', target: 200 },   // Sustain high traffic
    { duration: '30s', target: 0 },    // Ramp down to zero
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01']    // Less than 1% errors
  }
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api';
// We should pass a valid token via environment CLI variable for this to test authenticated routes.
const TOKEN = __ENV.AUTH_TOKEN || 'placeholder_token';

export default function () {
  // Test reading the highly active metrics/dashboard route (Should be heavily optimized by our new Redis caching)
  const statsRes = http.get(`${BASE_URL}/stats`, {
    headers: { 'x-auth-token': TOKEN },
  });
  
  check(statsRes, { 
    'stats retrieved successfully': (r) => r.status === 200 
  });
  
  sleep(1);

  // Test pulling list of devices which uses the pagination and indexing mechanism
  const devicesRes = http.get(`${BASE_URL}/devices?page=1&limit=50`, {
    headers: { 'x-auth-token': TOKEN },
  });

  check(devicesRes, { 
    'devices retrieved successfully': (r) => r.status === 200 
  });
  
  sleep(1);
}
