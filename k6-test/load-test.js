import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js'; // For unique room names
import { check, group, sleep } from 'k6';
import http from 'k6/http';

// Define test options (duration, virtual users)
export let options = {
    vus: 10,        // Number of Virtual Users (simulated concurrent users)
    duration: '60s', // Increased duration to allow more operations
    thresholds: {
        //http_req_failed: ['rate<0.01'], // http errors should be less than 1% (excluding expected failures)
        http_req_duration: ['p(95)<750'], // Increased duration for more complex operations
    },
};

// Base URLs for different parts of the API
const LOCAL_BASE_URL = 'http://localhost:8080';
const ROOM_API_BASE_URL = `${LOCAL_BASE_URL}/api/room`; // All room operations go through this

// Headers for JSON requests
const JSON_HEADERS = {
    'Content-Type': 'application/json',
};

// The main function that each Virtual User will execute
export default function () {
    // --- Phase 1: Homepage and Core Endpoints (using LOCAL_BASE_URL) ---
    group('Homepage and Core Endpoints', function () {
        // Access the homepage
        const homepageRes = http.get(LOCAL_BASE_URL);
        check(homepageRes, { 'status of / is 200': (r) => r.status === 200 });
        sleep(0.1);

        // Access the general rooms endpoint (from the original test)
        const roomsListRes = http.get(`${LOCAL_BASE_URL}/api/room/rooms`);
        check(roomsListRes, { 'status of /api/room/rooms (general) is 200': (r) => r.status === 200 });
        sleep(0.1);

        // Access customer owners
        const ownersRes = http.get(`${LOCAL_BASE_URL}/api/customer/owners`);
        check(ownersRes, { 'status of /api/customer/owners is 200': (r) => r.status === 200 });
        sleep(0.1);

        // Access vets
        const vetsRes = http.get(`${LOCAL_BASE_URL}/api/vet/vets`);
        check(vetsRes, { 'status of /api/vet/vets is 200': (r) => r.status === 200 });
        sleep(0.1);
    });

    sleep(1); // Think time before starting detailed room operations

    // --- Phase 2: Detailed Room Read Operations (using ROOM_API_BASE_URL) ---
    group('Room Read Operations', function () {
        // 1. Get all rooms (from the specific room API perspective)
        const allRoomsRes = http.get(`${ROOM_API_BASE_URL}/rooms`);
        check(allRoomsRes, { 'GET /api/room/rooms (detailed) status is 200': (r) => r.status === 200 });
        sleep(0.5);

        // 3. Get room by invalid id (not found)
        const invalidRoomRes = http.get(`${ROOM_API_BASE_URL}/rooms/9999`);
        check(invalidRoomRes, { 'GET /api/room/rooms/9999 status is 404': (r) => r.status === 404 });
        sleep(0.5);
    });

    sleep(1); // Think time

    // --- Phase 3: Room Create Operations (using ROOM_API_BASE_URL) ---
    group('Room Create Operations', function () {
        // Generate unique room names for each create operation to avoid conflicts
        const uniqueRoomName1 = `Room ${uuidv4().substring(0, 8)}`;
        const uniqueRoomName2 = `Room ${uuidv4().substring(0, 8)}`;
        const uniqueRoomName3 = `Room ${uuidv4().substring(0, 8)}`;
        const uniqueRoomName4 = `Room ${uuidv4().substring(0, 8)}`;
        const uniqueRoomName5 = `Room ${uuidv4().substring(0, 8)}`;
        const uniqueRoomName6 = `Room ${uuidv4().substring(0, 8)}`;

        // 5. Create room - valid
        const createValidRoomPayload = {
            "name": uniqueRoomName1,
            "roomType": "NORMAL",
            "lastUsed": "2024-06-01T10:00:00Z",
            "occupied": true
        };
        const createValidRoomRes = http.post(`${ROOM_API_BASE_URL}/rooms`, JSON.stringify(createValidRoomPayload), { headers: JSON_HEADERS });
        check(createValidRoomRes, { 'POST /api/room/rooms (valid) status is 201': (r) => r.status === 201 });
        sleep(0.5);

        // 6. Create room - missing name (expecting 400 Bad Request)
        const createMissingNamePayload = {
            "roomType": "NORMAL",
            "lastUsed": "2024-06-01T10:00:00Z",
            "occupied": false
        };
        const createMissingNameRes = http.post(`${ROOM_API_BASE_URL}/rooms`, JSON.stringify(createMissingNamePayload), { headers: JSON_HEADERS });
        check(createMissingNameRes, { 'POST /api/room/rooms (missing name) status is 400': (r) => r.status === 400 });
        sleep(0.5);

        // 7. Create room - missing roomType (expecting 400 Bad Request)
        const createMissingTypePayload = {
            "name": uniqueRoomName2,
            "lastUsed": "2024-06-01T10:00:00Z",
            "occupied": true
        };
        const createMissingTypeRes = http.post(`${ROOM_API_BASE_URL}/rooms`, JSON.stringify(createMissingTypePayload), { headers: JSON_HEADERS });
        check(createMissingTypeRes, { 'POST /api/room/rooms (missing roomType) status is 400': (r) => r.status === 400 });
        sleep(0.5);

        // 8. Create room - invalid enum (expecting 400 Bad Request)
        const createInvalidEnumPayload = {
            "name": uniqueRoomName3,
            "roomType": "INVALID_TYPE",
            "lastUsed": "2024-06-01T10:00:00Z",
            "occupied": true
        };
        const createInvalidEnumRes = http.post(`${ROOM_API_BASE_URL}/rooms`, JSON.stringify(createInvalidEnumPayload), { headers: JSON_HEADERS });
        check(createInvalidEnumRes, { 'POST /api/room/rooms (invalid enum) status is 400': (r) => r.status === 400 });
        sleep(0.5);

        // 9. Create room - blank name (expecting 400 Bad Request if validation rules apply)
        const createBlankNamePayload = {
            "name": "",
            "roomType": "NORMAL",
            "lastUsed": "2024-06-01T10:00:00Z",
            "occupied": false
        };
        const createBlankNameRes = http.post(`${ROOM_API_BASE_URL}/rooms`, JSON.stringify(createBlankNamePayload), { headers: JSON_HEADERS });
        check(createBlankNameRes, { 'POST /api/room/rooms (blank name) status is 400': (r) => r.status === 400 });
        sleep(0.5);

        // 13. Create room - only required fields
        const createRequiredFieldsPayload = {
            "name": uniqueRoomName4,
            "roomType": "SPECIAL1",
            "occupied": false
        };
        const createRequiredFieldsRes = http.post(`${ROOM_API_BASE_URL}/rooms`, JSON.stringify(createRequiredFieldsPayload), { headers: JSON_HEADERS });
        check(createRequiredFieldsRes, { 'POST /api/room/rooms (only required) status is 201': (r) => r.status === 201 });
        sleep(0.5);

        // 14. Create room - occupied true, no lastUsed
        const createOccupiedNoLastUsedPayload = {
            "name": uniqueRoomName5,
            "roomType": "SPECIAL2",
            "occupied": true
        };
        const createOccupiedNoLastUsedRes = http.post(`${ROOM_API_BASE_URL}/rooms`, JSON.stringify(createOccupiedNoLastUsedPayload), { headers: JSON_HEADERS });
        check(createOccupiedNoLastUsedRes, { 'POST /api/room/rooms (occupied true, no lastUsed) status is 201': (r) => r.status === 201 });
        sleep(0.5);

        // 15. Create room - minimal payload
        const createMinimalPayload = {
            "name": uniqueRoomName6,
            "roomType": "NORMAL",
            "occupied": false
        };
        const createMinimalRes = http.post(`${ROOM_API_BASE_URL}/rooms`, JSON.stringify(createMinimalPayload), { headers: JSON_HEADERS });
        check(createMinimalRes, { 'POST /api/room/rooms (minimal payload) status is 201': (r) => r.status === 201 });
        sleep(0.5);
    });

    sleep(1); // Think time

    // --- Phase 4: Room Delete Operations (using ROOM_API_BASE_URL) ---
    group('Room Delete Operations', function () {
        // 10. Delete existing room (assuming ID 1 exists, or was created previously)
        const deleteExistingRes = http.del(`${ROOM_API_BASE_URL}/rooms/1`);
        check(deleteExistingRes, { 'DELETE /api/room/rooms/1 status is 204 or 404': (r) => r.status === 204 || r.status === 404 });
        // 204 No Content is standard for successful deletion. 404 is fine if it was already deleted or never existed.
        sleep(0.5);

        // 11. Delete non-existing room
        const deleteNonExistingRes = http.del(`${ROOM_API_BASE_URL}/rooms/9999`);
        check(deleteNonExistingRes, { 'DELETE /api/room/rooms/9999 status is 404': (r) => r.status === 404 });
        sleep(0.5);

        // 12. Delete with missing id (expecting 405 Method Not Allowed or 404 Not Found, depending on API)
        const deleteMissingIdRes = http.del(`${ROOM_API_BASE_URL}/rooms`);
        check(deleteMissingIdRes, { 'DELETE /api/room/rooms (missing id) status is 405 or 404': (r) => r.status === 405 || r.status === 404 });
        sleep(0.5);
    });

    // Overall sleep for the entire iteration
    sleep(1);
}