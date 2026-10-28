# LabReserve API Test Report

## 1. Project and report overview

LabReserve is a small Express, Mongoose, and MongoDB laboratory equipment request application. This report consolidates the supplied historical observations for API-01 through API-30.

The results in this document are historical evidence supplied for the QA assignment. They are not a new execution by this report and are not presented as freshly passed tests.

## 2. Scope and testing approach

The scope covers authentication, equipment listing and retrieval, equipment administration, authorization, input validation, and duplicate equipment data checks.

The audit used the existing Postman YAML request files, the exported `QA.postman_collection.json`, the current smoke collection, the backend route/controller behavior, and the historical results supplied with the task. No requests were sent while preparing this report.

The classifications below describe the evidence available:

- **Historical result available**: a historical HTTP result was supplied.
- **Historical result incomplete**: some historical observations were supplied, but they vary or do not establish one repeatable result.
- **No historical result supplied**: no historical HTTP result was supplied.

These classifications do not replace a fresh pass/fail execution outcome.

## 3. API-01 through API-30 consolidated history

| Test ID | Test name | Expected result | Historical HTTP status/result | Historical outcome classification | Evidence available | Notes and risks |
|---|---|---|---|---|---|---|
| API-01 | Admin Login | `200`; authenticated user has `ADMIN` role and a token is returned | `200`; ADMIN role and token reported | Historical result available | Supplied status and role/token observation | Requires a seeded admin and valid local credentials. |
| API-02 | List Equipment | `200`; equipment list is returned | `200` | Historical result available | Supplied HTTP status | Read-only; requires an authenticated admin or student token. |
| API-03 | Student Login | `200`; authenticated user has `STUDENT` role and a token is returned | `200` | Historical result available | Supplied HTTP status | Requires an existing student account. |
| API-04 | Get Equipment by ID | `200` for an existing equipment ID | `200` | Historical result available | Supplied HTTP status | Read-only; uses a hard-coded equipment ID, which may not exist in a fresh database. |
| API-05 | Create Equipment | `201`; equipment is created with asset code `QA-TEST-001` | `201`; `QA-TEST-001` was created | Historical result available | Supplied status and created asset code | State-changing. Repeating can produce `409` if the asset code already exists. |
| API-06 | Verify Created Equipment | `200`; the created equipment can be retrieved | `200` | Historical result available | Supplied HTTP status | Depends on API-05 and the created equipment ID. |
| API-07 | Update Equipment | `200`; editable equipment fields are updated | `200` | Historical result available | Supplied HTTP status | State-changing; uses a hard-coded ID and is not consistently linked to API-05. |
| API-08 | Verify Updated Equipment | `200`; updated values are visible | `200` | Historical result available | Supplied HTTP status | Depends on API-07 and its target record. |
| API-09 | Delete Test Equipment | `200`; equipment is deleted | `200` | Historical result available | Supplied HTTP status | Destructive state change. Must not target shared or valuable equipment. |
| API-10 | Get Deleted Equipment | `404`; deleted equipment cannot be found | `404` | Historical result available | Supplied HTTP status | Depends on API-09 deleting the same record. |
| API-11 | List Equipment Without Authentication | `401` | `401` | Historical result available | Supplied HTTP status | Read-only authorization check. |
| API-12 | Student Attempts Admin Equipment Creation | `403`; admin access is required | `403` | Historical result available | Supplied HTTP status | Middleware should reject the request before equipment creation. |
| API-13 | Student Attempts Equipment Deletion | `403` | `403` | Historical result available | Supplied HTTP status | Middleware should reject the request before deletion; hard-coded ID is used. |
| API-14 | Student Attempts Equipment Update | `403` | `403` | Historical result available | Supplied HTTP status | Middleware should reject the request before update; hard-coded ID is used. |
| API-15 | Invalid Admin Password | `401`; safe invalid-login message | `401` | Historical result available | Supplied HTTP status | Authentication only; no database mutation expected. |
| API-16 | Login Missing Password | `400` | `400` | Historical result available | Supplied HTTP status | Backend requires both email and password. |
| API-17 | Login Missing Email | `400` | `400` | Historical result available | Supplied HTTP status | Backend requires both email and password. |
| API-18 | Invalid Email Format with Wrong Password | Current implementation returns `401` for an unsuccessful lookup | `401` | Historical result available | Supplied HTTP status and test description | Login checks missing fields but does not enforce email-format validation before lookup. |
| API-19 | Student List Equipment | `200`; equipment list is returned | `200` | Historical result available | Supplied HTTP status | Read-only; requires the student token. |
| API-20 | Student Get Equipment by ID | `200` for an existing equipment ID | `200` | Historical result available | Supplied HTTP status | Read-only; uses a hard-coded equipment ID. |
| API-21 | Malformed Equipment ID | `400`; invalid equipment ID is rejected | `400` | Historical result available | Supplied HTTP status | Read-only validation case. |
| API-22 | Create Equipment with Missing Fields | `400`; validation rejects incomplete data | `400` | Historical result available | Supplied HTTP status | POST request, but expected validation failure should prevent creation. |
| API-23 | Duplicate Asset Code | Existing asset code should return `409`; a first run may create the fixture if it did not exist | First attempt `201`; later attempt `409` | Historical result incomplete | Supplied two historical status observations | Result depends on database state. The first `201` changed state; later `409` is consistent with the duplicate constraint. |
| API-24 | Verify Duplicate Asset Codes | `200`; equipment list is returned, then uniqueness must be inspected | No historical result supplied | No historical result supplied | Request definition only; no result or uniqueness assertion supplied | The request lists equipment but has no automated assertion that `QA-TEST-001` appears once. |
| API-25 | Create Equipment Missing Asset Code | `400` | `400` | Historical result available | Supplied HTTP status | Expected validation failure; no creation should occur. |
| API-26 | Create Equipment with Empty Name | `400` | `400` | Historical result available | Supplied HTTP status | Expected Mongoose validation failure; no creation should occur. |
| API-27 | Invalid Category | The current model accepts category strings, so `201` is possible | `201`; a record was created | Historical result available; investigation required | Supplied status and state observation | Categories are not a fixed enum. This is behavior to investigate, not automatically a defect. The created record requires controlled cleanup. |
| API-28 | Whitespace-only Name | `400` | `400` | Historical result available | Supplied HTTP status | Trimmed validation rejects the empty name. |
| API-29 | List Equipment Without Token | `401` | `401` | Historical result available | Supplied HTTP status | Duplicate-style authorization coverage with API-11. |
| API-30 | Student Login with Wrong Password | `401` | `401` | Historical result available | Supplied HTTP status | Authentication only; no database mutation expected. API-30 exists in the exported collection but has no matching numbered YAML request file. |

## 4. Summary of historical results

Twenty-nine of the 30 test IDs have at least one supplied historical HTTP observation. API-23 has two observations with different results because its result depends on whether `QA-TEST-001` already exists. API-24 has no supplied historical result.

The supplied history includes successful responses, expected authorization failures, expected validation failures, and state-dependent results. It does not provide enough execution metadata to calculate a reliable fresh pass count. No new pass/fail count is claimed here.

API-27 deserves follow-up because an item with an unsupported category string was created with `201`. The repository model defines `category` as a required string rather than a fixed enum, so this may be intentional current behavior or a validation requirement that has not been implemented. The historical result alone does not decide which interpretation is correct.

## 5. Known limitations and possible defects to investigate

- The historical records do not include complete response bodies, timestamps, assertion output, or screenshots.
- API-24 does not automatically check uniqueness; its purpose is currently a manual inspection after listing equipment.
- API-30 is present in the exported JSON collection but lacks a matching numbered YAML workspace request.
- Several requests use hard-coded equipment IDs. Those IDs may be missing or refer to different records in another database.
- API-09 deletes equipment and is unsafe to repeat against shared development data.
- API-05, API-23, and API-27 can change database state and can affect later results.
- API-23 is state-dependent: `201` and `409` can both be valid observations at different points in the test data lifecycle.
- API-27 creates a persistent record under the current model behavior and needs an agreed cleanup method.
- API-11 and API-29 cover similar unauthenticated listing behavior.

## 6. Historical evidence versus new automated evidence

The statuses in Section 3 are historical observations supplied for this report. They are not evidence that the requests have been rerun against the current database or current code.

New automated evidence should be recorded only after a real Newman or Postman execution. It should include the execution date, collection/environment identity, HTTP status, assertion results, and report file location. A future result should be labeled separately from the historical observation so that a changed database state does not overwrite the earlier record.

API-24 remains **No historical result supplied** until a request is executed and its listing has been inspected for duplicate asset codes.

## 7. Current JUnit report scope

The existing `postman/reports/QA-Smoke-results.xml` covers only the five smoke requests:

- API Health
- Admin Login
- Student Login
- Admin List Equipment
- Student List Equipment

The report contains 12 assertions across those five requests. It is not a report for API-01 through API-30 and must not be used as evidence that the full 30-case suite was executed.

## 8. Safe plan for a fresh full regression run

1. Create or select an isolated MongoDB test database. Do not use shared development data.
2. Supply local admin and student credentials through uncommitted runtime variables or a protected local environment.
3. Seed the admin and dedicated student accounts, then run the authentication requests first.
4. Create dedicated equipment fixtures with known asset codes and capture their returned IDs into variables.
5. Run read-only and authentication cases before state-changing cases.
6. Run API-05 before API-06, API-07 before API-08, and API-09 before API-10.
7. Run API-23 only with a defined fixture state, and record whether the expected result is fixture creation (`201`) or duplicate rejection (`409`).
8. Run API-24 and manually or programmatically verify the duplicate count; its current request does not perform that assertion.
9. Run API-27 only in the isolated database and record the category behavior for investigation.
10. Keep API-09 last among tests that use its target, then discard or reset the isolated database.
11. Export the automated execution as JUnit XML and create a Markdown or HTML table populated from that execution. Preserve the historical observations as a separate evidence column.

## 9. Remaining work before execution

The report is complete, but a safe fresh 30-case execution still requires an isolated database, controlled fixture setup, reconciliation of API-30 between the YAML workspace and exported collection, and a defined uniqueness assertion or manual inspection for API-24. The existing five-request smoke JUnit report should remain separate from the eventual full-suite report.
