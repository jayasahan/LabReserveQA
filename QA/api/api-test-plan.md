# LabReserve API Automation Test Plan

## Scope

This is the Postman/API automation plan for the Member 3 assignment. It covers authentication, equipment management, authorization, request workflow, and a later concurrency test. Postman collection definitions, actual API execution, and CI automation are separate deliverables and are tracked separately below.

The current collection artifacts are:

- `postman/exports/QA-Smoke.postman_collection.json`: five-request smoke suite with local Newman/JUnit reporting.
- `postman/exports/QA-ReadOnly-Regression.postman_collection.json`: ten-request read-only and authentication suite; `equipmentId` must be supplied at runtime.
- `postman/exports/QA-Full-Regression.postman_collection.json`: API-01 through API-30 plus API Health, including controlled state-changing requests.
- `postman/reports/QA-API-Test-Report.md`: historical API observations, not a new execution result.

## Current Execution Evidence and Safety

- **Smoke:** The existing `postman/reports/QA-Smoke-results.xml` records five request suites, 12 assertions, and zero failures from a local run. It covers only API Health and the four smoke requests; it is not evidence for API-01 through API-30 as a whole.
- **Read-only/authentication subset:** `QA-ReadOnly-Regression.postman_collection.json` contains ten requests and 20 assertions: health, admin/student login, equipment list/get, unauthenticated listing, and invalid login. Login uses POST but the inspected controller only reads the user record and creates a JWT; it does not register users or mutate equipment. The recorded local JUnit result contains 10 request suites, 20 assertions, 0 failures, and 0 errors; see `postman/reports/QA-ReadOnly-Regression-results.xml` and `QA/api/api-regression-results.md`.
- The exported Postman environment does not currently supply `baseUrl` or `equipmentId`. Provide those at runtime, along with admin/student credentials. API-04 and API-20 require a known existing equipment ID; do not substitute a guessed ID.
- **Full regression:** The 30 numbered requests plus API Health are defined but have no new execution evidence. API-05 creates a disposable fixture, API-07 updates it, API-09 deletes it, and API-27 creates a separate record that persists unless the test database is discarded or that record is cleaned up. Other mutation-method negative/invalid requests assert rejection and should not change records if the API behaves as expected. Treat the suite as state-changing until safely run against isolated fixtures.
- The Jest tests mock the `Equipment` and `Request` models and do not connect to MongoDB. The API server calls `mongoose.connect()` with `MONGODB_URI` before it listens, so any live API execution requires a configured database. No isolated API test database has been confirmed, and no database was connected during this audit.
- GitHub Actions Jest workflow run [#2](https://github.com/jayasahan/LabReserveQA/actions/runs/40759976311) is verified successful and uploaded `jest-coverage-2`. The workflow runs Jest only; it does not run Newman. The initial local SonarQube scan and available measures are documented in `QA/sonarqube/`; Newman CI, concurrency testing, and final integrated API evidence remain pending. The official rubric's exact scope and evidence format still need confirmation.

The official course rubric was not found as a separate file in this repository. Confirm which listed assignment items are graded requirements with the supplied assignment sheet or lecturer; do not treat an explicit requirement as optional, and do not add industry extras just to increase scope.

## 1. Discovered API Routes

All routes below were verified in `server/routes` and mounted by `server/server.js`.

| Area | HTTP Method | Endpoint | Auth/Role | Purpose | Expected result |
|---|---|---|---|---|---|
| Authentication | POST | `/api/auth/register` | None; creates STUDENT | Register a student account | `201`; token and student user are returned |
| Authentication | POST | `/api/auth/login` | None | Log in an existing user | `200`; token and user are returned |
| Authentication | GET | `/api/auth/me` | Bearer token | Verify the authenticated user | `200`; current user is returned |
| Equipment | GET | `/api/equipment` | Bearer token | List equipment, optionally using `search` or `category` query parameters | `200`; `equipment` array is returned |
| Equipment | GET | `/api/equipment/:id` | Bearer token | Retrieve one equipment item | `200` with equipment, or `404` if absent |
| Equipment | POST | `/api/equipment` | ADMIN | Create equipment | `201`; created equipment has `AVAILABLE` status |
| Equipment | PUT | `/api/equipment/:id` | ADMIN | Update editable equipment fields | `200`; updated equipment is returned |
| Equipment | DELETE | `/api/equipment/:id` | ADMIN | Delete safe equipment | `200`; deletion message is returned |
| Requests | POST | `/api/requests` | STUDENT | Request available equipment | `201`; pending request is returned and equipment becomes `REQUESTED` |
| Requests | GET | `/api/requests/my` | STUDENT | List the logged-in student's requests | `200`; student's request list is returned |
| Requests | GET | `/api/requests` | ADMIN | List all requests | `200`; all requests are returned |
| Requests | PATCH | `/api/requests/:id/approve` | ADMIN | Approve a pending request | `200`; request becomes `APPROVED` and equipment becomes `BORROWED` |
| Requests | PATCH | `/api/requests/:id/reject` | ADMIN | Reject a pending request | `200`; request becomes `REJECTED` and equipment becomes `AVAILABLE` |
| Requests | PATCH | `/api/requests/:id/return` | ADMIN | Complete the approved borrowing | `200`; request becomes `RETURNED` and equipment becomes `AVAILABLE` |
| Requests | PATCH | `/api/requests/:id/cancel` | STUDENT, owner | Cancel the student's pending request | `200`; request becomes `CANCELLED` and equipment becomes `AVAILABLE` |

For a student attempting an equipment mutation, use the actual admin-only routes above, such as `POST /api/equipment`. The admin middleware returns `403` with `Admin access required` before the controller runs.

## 2. Required Test Data and Setup

### Users and roles

| Data | Status and requirement |
|---|---|
| Admin user | The repository provides `server/scripts/seedAdmin.js`. The admin must be created from `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` environment values. Current database presence was not verified. |
| Student 1 | Must be created with `POST /api/auth/register` or already exist. Registration always assigns `STUDENT`; the client cannot choose `ADMIN`. |
| Student 2 | Must be created separately for the later concurrency test. It must have a different email from Student 1. |

### Equipment

The repository provides `server/scripts/seedEquipment.js`, which defines twelve equipment records with unique asset codes and `AVAILABLE` status. The script skips records whose asset codes already exist. Current database presence was not verified.

For repeatable API tests, use one dedicated equipment item, for example an item created by the admin with:

```json
{
  "name": "API Test Oscilloscope",
  "category": "Electronics",
  "assetCode": "API-OSC-001",
  "description": "Equipment reserved for API automation tests."
}
```

The API sets its status to `AVAILABLE`; status is not accepted as an editable admin field.

### Request states

The lifecycle test needs one request to move through:

```text
PENDING -> APPROVED -> RETURNED
```

The corresponding equipment states are:

```text
AVAILABLE -> REQUESTED -> BORROWED -> AVAILABLE
```

A separate rejection test can verify `PENDING -> REJECTED` and `REQUESTED -> AVAILABLE`. A cancellation test can verify `PENDING -> CANCELLED` and `REQUESTED -> AVAILABLE`.

### Reset and database requirements

- MongoDB is required because the Express server connects through `MONGODB_URI`.
- `JWT_SECRET` is required for login tokens and protected routes.
- `PORT` is optional; the server defaults to `5000`.
- Admin seeding additionally requires the three `ADMIN_*` values.
- There is no reset endpoint. Use dedicated test records and reset them through the normal lifecycle, or clean the test database/records before a repeat run.
- Do not reuse equipment that is `REQUESTED` or `BORROWED` for a test that expects `AVAILABLE`.

### Authentication and variables

Save the `token` returned by each login response as a Postman environment variable, for example `adminToken`, `studentToken`, and `student2Token`. Protected requests send:

```text
Authorization: Bearer {{token}}
```

Save created IDs such as `equipmentId` and `requestId` from response bodies for later requests. Credentials and database secrets must remain local and must not be committed.

## 3. Preliminary Postman Test Cases

The IDs in this early design table are provisional draft IDs and do not match the stable API-01 through API-30 identifiers in the current exported collection. Use the request names in the current collections and the historical API report for canonical IDs.

| Draft ID | Endpoint | Method | Preconditions | Request data | Expected status | Important response assertions | State assertion |
|---|---|---|---|---|---:|---|---|
| API-01 Login/setup | `/api/auth/register`, `/api/auth/login`, `/api/auth/me` | POST, POST, GET | Database and JWT secret available; admin seeded; dedicated student credentials prepared | Register/login JSON with name, email, password; then Bearer token for `/me` | `201`, `200`, `200` | Registration/login returns `token` and correct `role`; `/me` returns the same user | Student is `STUDENT`; admin login returns `ADMIN` |
| API-02 Equipment listing | `/api/equipment` | GET | Valid student or admin token; equipment exists | Optional `search` or `category` query | `200` | Response contains an `equipment` array and expected fields such as `name`, `assetCode`, `category`, and `status` | Listed status matches the stored workflow state |
| API-03 Admin creates equipment | `/api/equipment` | POST | Admin token | Dedicated equipment JSON without `status` | `201` | Response contains an equipment ID, supplied fields, and `status: AVAILABLE` | Equipment can be retrieved by its returned ID |
| API-04 Admin updates equipment | `/api/equipment/:id` | PUT | Admin token; equipment is safe to edit | Change one or more editable fields, such as `description` | `200` | Response contains the changed field and same equipment ID | Follow-up GET confirms the update; status remains workflow-managed |
| API-05 Admin deletes equipment | `/api/equipment/:id` | DELETE | Admin token; equipment is `AVAILABLE` and has no active request | No body | `200` | Response message is `Equipment deleted` | Follow-up GET returns `404` |
| API-06 Student forbidden equipment mutation | `/api/equipment` | POST | Student token; valid-looking equipment body | Same create-equipment JSON as API-03 | `403` | Message is `Admin access required` | No equipment is created; listing or duplicate check confirms no new asset |
| API-07 Student creates request | `/api/requests` | POST | Student token; dedicated equipment is `AVAILABLE` | `{ "equipmentId": "{{equipmentId}}", "loanDays": 5 }` | `201` | Response contains a request with the equipment, `PENDING` status, and `loanDays: 5` | Equipment changes to `REQUESTED`; `/api/requests/my` contains the request |
| API-08 Request lifecycle | `/api/requests/:id/approve`, `/api/requests/:id/reject`, `/api/requests/:id/return` | PATCH, PATCH, PATCH | Admin token; API-07 request is `PENDING` | No body | `200` for each valid transition | Approval returns `APPROVED`; return returns `RETURNED`; an alternate pending request can be rejected | Approval path: equipment changes `REQUESTED -> BORROWED -> AVAILABLE`; rejection path: request becomes `REJECTED` and equipment returns to `AVAILABLE` |
| API-09 Negative/error case | `/api/requests` or `/api/equipment/:id` | POST or DELETE | Valid token; use invalid ID, unavailable equipment, or student admin-only access | Invalid equipment ID, or request for already requested equipment | `400`, `409`, or `403` as applicable | Safe error `message` is returned | No unintended request/equipment mutation occurs |

API-09 should be split into separate Postman requests when implemented so each expected status is unambiguous. Do not combine invalid-ID, conflict, and forbidden cases into one assertion.

## 4. Later Concurrency Test Plan

The later concurrency test will use two different students and one dedicated `AVAILABLE` equipment item:

1. Obtain valid Bearer tokens for Student 1 and Student 2.
2. Confirm the same equipment is `AVAILABLE`.
3. Send two `POST /api/requests` calls as close together as the test tool permits, with the same `equipmentId`.
4. Assert that exactly one request succeeds with `201`.
5. Assert that the losing request receives the conflict response expected from the controller, currently `409` when the equipment exists but is no longer available.
6. Query the equipment and requests afterwards.

The source uses an atomic equipment update matching `_id` and `status: 'AVAILABLE'`, so the intended contract is exactly one successful claim, one active request, and equipment left in a consistent `REQUESTED` state. This must be confirmed by the later real API test; it has not been run yet.

## 5. Uncertainties for Team Confirmation

- The current database contents and whether the seeded admin/equipment records already exist were not verified.
- Before API execution, verify the target database and runtime credentials are safe. State-changing full-regression requests require an isolated test database and disposable fixtures; a read-only/authentication run still requires checking that its target is safe.
- The exact Postman runner or execution environment for sending two near-simultaneous requests still needs to be selected.
- Cleanup ownership should be agreed so API runs do not affect shared development data.
