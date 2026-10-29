# LabReserve API Regression Results

## Scope and evidence

This report records the available automated evidence for the read-only Postman regression collection:

- Collection: `postman/exports/QA-ReadOnly-Regression.postman_collection.json`
- JUnit evidence: `postman/reports/QA-ReadOnly-Regression-results.xml`
- Supporting run documentation: `QA/docs/testing/QA-ReadOnly-Regression-Documentation.md`
- Execution timestamp recorded in the XML: `2026-10-28T18:10:12.989Z`
- XML summary: 10 request suites, 20 assertions, 0 failures, 0 errors, total reported time `4.038` seconds

This is evidence for the read-only/authentication subset. It is not evidence for the full API-01 through API-30 collection, state-changing tests, concurrency testing, or CI API execution.

## Results

The JUnit report contains two passing assertions for every request: a status-code assertion and a response-field or role/token assertion. The actual status is therefore confirmed by the passing status assertion shown in the XML; response bodies, credentials, tokens, and equipment IDs are not reproduced here.

| Test ID | Request | Method and endpoint | Expected status | Recorded actual status | Assertions | Outcome | Evidence |
|---|---|---|---:|---:|---:|---|---|
| API Health | API Health | `GET /api/health` | 200 | 200; status assertion passed | 2/2 | Passed | `postman/reports/QA-ReadOnly-Regression-results.xml` |
| API-01 | Admin Login | `POST /api/auth/login` | 200 | 200; status assertion passed | 2/2 | Passed | `postman/reports/QA-ReadOnly-Regression-results.xml` |
| API-02 | List Equipment | `GET /api/equipment` | 200 | 200; status assertion passed | 2/2 | Passed | `postman/reports/QA-ReadOnly-Regression-results.xml` |
| API-03 | Student Login | `POST /api/auth/login` | 200 | 200; status assertion passed | 2/2 | Passed | `postman/reports/QA-ReadOnly-Regression-results.xml` |
| API-04 | Get Equipment by ID | `GET /api/equipment/{{equipmentId}}` | 200 | 200; status assertion passed | 2/2 | Passed | `postman/reports/QA-ReadOnly-Regression-results.xml` |
| API-11 | List Equipment Without Authentication | `GET /api/equipment` | 401 | 401; status assertion passed | 2/2 | Passed | `postman/reports/QA-ReadOnly-Regression-results.xml` |
| API-15 | Invalid Login Credentials | `POST /api/auth/login` | 401 | 401; status assertion passed | 2/2 | Passed | `postman/reports/QA-ReadOnly-Regression-results.xml` |
| API-19 | Student List Equipment | `GET /api/equipment` | 200 | 200; status assertion passed | 2/2 | Passed | `postman/reports/QA-ReadOnly-Regression-results.xml` |
| API-20 | Student Get Equipment by ID | `GET /api/equipment/{{equipmentId}}` | 200 | 200; status assertion passed | 2/2 | Passed | `postman/reports/QA-ReadOnly-Regression-results.xml` |
| API-29 | List Equipment Without Token | `GET /api/equipment` | 401 | 401; status assertion passed | 2/2 | Passed | `postman/reports/QA-ReadOnly-Regression-results.xml` |

## Confirmed counts

- Passed request suites: 10
- Failed request suites: 0
- Blocked request suites: 0 in the recorded run
- Inconclusive request suites: 0 in the recorded run
- Assertions passed: 20 of 20
- API-01 through API-30 coverage: partial; only API-01, API-02, API-03, API-04, API-11, API-15, API-19, API-20, and API-29 are covered here, plus API Health

The XML does not contain the actual credentials, JWTs, equipment ID, database URI, or complete response bodies. Those values remain runtime evidence and are intentionally omitted.

## Safety and limitations

The inspected routes and controllers show that this collection does not intentionally create, update, delete, or register records. Login reads the user and creates a token. Equipment list/get operations read data. Unauthenticated and invalid-login requests are negative checks.

The run still depended on a configured backend, valid admin/student accounts, and an existing equipment ID. The XML does not prove database isolation or CI execution. The full regression collection remains blocked for routine automation until state-changing tests have an isolated database and controlled cleanup, especially API-27's persistent invalid-category record and API-09's deletion.

API-11 and API-29 provide overlapping unauthenticated-list coverage but remain separate because they are separate test IDs.

## Remaining work

1. Keep this read-only result separate from historical API observations and the five-request smoke JUnit report.
2. Decide whether the assignment requires Newman execution in CI; no Newman CI workflow is currently configured.
3. Establish an isolated database and fixture lifecycle before running the full state-changing collection.
4. Record a separate full-regression report only after actual execution evidence exists.

The initial local SonarQube scan and the metrics available from the project API are documented in `QA/sonarqube/scan-report.md`; representative findings are in `QA/sonarqube/findings.md`. This does not change the API execution scope above.
