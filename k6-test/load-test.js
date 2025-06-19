import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js'; // For unique room names
import { check, group, sleep } from 'k6';
import http from 'k6/http';

// Define test options (duration, virtual users)
export let options = {
    vus: 10,        // Number of Virtual Users (simulated concurrent users)
    duration: '60s', // Increased duration to allow more operations
    thresholds: {
        //http_req_failed: ['rate<0.01'], // http errors should be less than 1% (excluding expected failures)
        http_req_duration: ['p(95)<1000'], // Increased duration for more complex operations
    },
};

// Base URLs for different parts of the API
const LOCAL_BASE_URL = 'http://localhost:8080';
const ROOM_API_BASE_URL = `${LOCAL_BASE_URL}/api/room`; // All room operations go through this
const CUSTOMER_API_BASE_URL = `${LOCAL_BASE_URL}/api/customer`; // For customer (owner/pet) operations
const GATEWAY_API_BASE_URL = `${LOCAL_BASE_URL}/api/gateway`; // For gateway operations (like owner details)
const VISIT_API_BASE_URL = `${LOCAL_BASE_URL}/api/visit`; // For visit operations

// Headers for JSON requests
const JSON_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
};

// Helper function to get a random pet type (1 to 6)
function getRandomPetType() {
    return Math.floor(Math.random() * 6) + 1;
}

// The main function that each Virtual User will execute
export default function () {
    let ownerId; // Declare ownerId outside the group to be accessible across subsequent groups
    let petId;   // Declare petId outside the group to be accessible across subsequent groups

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

    sleep(1); // Think time before owner operations

    // --- Phase 5.1: Owner Operations ---
    group('Owner Operations', function () {
        // All Owners
        const allOwnersRes = http.get(`${CUSTOMER_API_BASE_URL}/owners`, { headers: JSON_HEADERS });
        check(allOwnersRes, { 'GET /api/customer/owners status is 200': (r) => r.status === 200 });
        sleep(0.3); // Corresponds to Gaussian Random Timer of ~300ms

        // Add Owner
        const addOwnerPayload = {
            "firstName": `Firstname${uuidv4().substring(0, 4)}`, // Unique first name
            "lastName": `Lastname${uuidv4().substring(0, 4)}`,   // Unique last name
            "address": "Address",
            "city": "City",
            "telephone": "0000000000"
        };
        const addOwnerRes = http.post(`${CUSTOMER_API_BASE_URL}/owners`, JSON.stringify(addOwnerPayload), { headers: JSON_HEADERS });
        check(addOwnerRes, { 'POST /api/customer/owners (add owner) status is 201': (r) => r.status === 201 });

        if (addOwnerRes.status === 201) {
            try {
                ownerId = addOwnerRes.json().id; // Extract OWNER_ID
            } catch (e) {
                console.error('Failed to parse owner ID from response:', e, addOwnerRes.body);
            }
        }
        sleep(0.3);

        if (ownerId) {
            // Owner Details (using Gateway API)
            const ownerDetailsRes = http.get(`${GATEWAY_API_BASE_URL}/owners/${ownerId}`, { headers: JSON_HEADERS });
            check(ownerDetailsRes, { 'GET /api/gateway/owners/:id (owner details) status is 200': (r) => r.status === 200 });
            sleep(0.3);

            // Update Owner
            const updateOwnerPayload = {
                "id": ownerId,
                "firstName": "FirstnameUpdated",
                "lastName": `LastnameUpdated${ownerId}`,
                "address": `AddressUpdated${ownerId}`,
                "city": `CityUpdated${ownerId}`,
                "telephone": "1111111111"
            };
            const updateOwnerRes = http.put(`${CUSTOMER_API_BASE_URL}/owners/${ownerId}`, JSON.stringify(updateOwnerPayload), { headers: JSON_HEADERS });
            check(updateOwnerRes, { 'PUT /api/customer/owners/:id (update owner) status is 204': (r) => r.status === 204 });
            sleep(0.3);
        } else {
            console.warn('Skipping subsequent owner/pet/visit operations due to missing ownerId.');
        }
    });

    sleep(1); // Think time before pet operations

    // --- Phase 5.2: Pet Operations ---
    group('Pet Operations', function () {
        if (!ownerId) {
            console.warn('Skipping Pet Operations: ownerId is missing from previous step.');
            sleep(0.1); // Small sleep to avoid busy loop if ownerId is consistently missing
            return;
        }

        // Add Pet
        const petType = getRandomPetType(); // Simulate PET_TYPE random variable
        const addPetPayload = {
            "name": `Pet${uuidv4().substring(0, 4)}`, // Unique pet name
            "birthDate": "2018-12-31T23:00:00.000Z",
            "typeId": petType
        };
        const addPetRes = http.post(`${CUSTOMER_API_BASE_URL}/owners/${ownerId}/pets`, JSON.stringify(addPetPayload), { headers: JSON_HEADERS });
        check(addPetRes, { 'POST /api/customer/owners/:id/pets (add pet) status is 201': (r) => r.status === 201 });

        if (addPetRes.status === 201) {
            try {
                petId = addPetRes.json().id; // Extract PET_ID
            } catch (e) {
                console.error('Failed to parse pet ID from response:', e, addPetRes.body);
            }
        }
        sleep(0.3);

        if (petId) {
            // Add Random Second Pet (simulating JMeter's RandomController)
            // This is a simple 50% chance, adjust as needed.
            if (Math.random() < 0.5) { // Roughly 50% chance as per JMeter's Random Controller
                const secondPetType = getRandomPetType();
                const addSecondPetPayload = {
                    "name": `Pet2-${uuidv4().substring(0,4)}`, // Unique name for second pet
                    "birthDate": "2019-01-01T12:00:00.000Z",
                    "typeId": secondPetType
                };
                const addSecondPetRes = http.post(`${CUSTOMER_API_BASE_URL}/owners/${ownerId}/pets`, JSON.stringify(addSecondPetPayload), { headers: JSON_HEADERS });
                check(addSecondPetRes, { 'POST /api/customer/owners/:id/pets (add second pet) status is 201': (r) => r.status === 201 });
                sleep(0.3);
            }

            // Update Pet
            const updatePetPayload = {
                "id": petId,
                "name": `PetUpdated${ownerId}`, // Updated name for the pet
                "birthDate": "2018-12-31T23:00:00.000Z",
                "typeId": petType
            };
            const updatePetRes = http.put(`${CUSTOMER_API_BASE_URL}/owners/${ownerId}/pets/${petId}`, JSON.stringify(updatePetPayload), { headers: JSON_HEADERS });
            check(updatePetRes, { 'PUT /api/customer/owners/:id/pets/:id (update pet) status is 204': (r) => r.status === 204 });
            sleep(0.3);
        } else {
            console.warn('Skipping Visit Operations: petId is missing from previous step.');
        }
    });

    sleep(1); // Think time before visit operations

    // --- Phase 5.3: Visit Operations ---
    group('Visit Operations', function () {
        if (!ownerId || !petId) {
            console.warn('Skipping Visit Operations: ownerId or petId is missing from previous steps.');
            sleep(0.1); // Small sleep to avoid busy loop if IDs are consistently missing
            return;
        }

        // Add Visit
        const addVisitPayload = {
            "date": "2019-03-15",
            "description": "Visit"
        };
        const addVisitRes = http.post(`${VISIT_API_BASE_URL}/owners/${ownerId}/pets/${petId}/visits`, JSON.stringify(addVisitPayload), { headers: JSON_HEADERS });
        check(addVisitRes, { 'POST /api/visit/owners/:id/pets/:id/visits (add visit) status is 201': (r) => r.status === 201 });
        sleep(0.3);

        // Add Random Second Visit (simulating JMeter's RandomController)
        if (Math.random() < 0.5) { // Roughly 50% chance
            const addSecondVisitPayload = {
                "date": "2019-03-16", // Different date for second visit
                "description": "Second Visit"
            };
            const addSecondVisitRes = http.post(`${VISIT_API_BASE_URL}/owners/${ownerId}/pets/${petId}/visits`, JSON.stringify(addSecondVisitPayload), { headers: JSON_HEADERS });
            check(addSecondVisitRes, { 'POST /api/visit/owners/:id/pets/:id/visits (add second visit) status is 201': (r) => r.status === 201 });
            sleep(0.3);
        }

        // All Vets - (Moved here for logical grouping as it was the last JMeter step)
        const allVetsRes = http.get(`${LOCAL_BASE_URL}/api/vet/vets`, { headers: JSON_HEADERS });
        check(allVetsRes, { 'GET /api/vet/vets status is 200': (r) => r.status === 200 });
        sleep(0.3);
    });


    // Overall sleep for the entire iteration
    sleep(1);
}