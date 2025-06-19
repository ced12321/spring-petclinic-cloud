import { check, sleep } from 'k6';
import http from 'k6/http';

// Define test options (duration, virtual users)
export let options = {
    vus: 10,       // Number of Virtual Users (simulated concurrent users)
    duration: '15s', // How long the test should run
    thresholds: {
        http_req_failed: ['rate<0.01'], // http errors should be less than 1%
        http_req_duration: ['p(95)<500'], // 95% of requests should complete within 200ms
    },
};

// The main function that each Virtual User will execute
export default function () {
    // Send a GET request to API Gateway
    const res = http.get('http://localhost:8080'); // Or http://localhost:32082 if not using port-forward

    // Check if the response status is 200 (OK)
    check(res, {
        'status is 200': (r) => r.status === 200,
    });

    // Simulate a "think time" between requests (e.g., 1 second)
    sleep(0.5);
}