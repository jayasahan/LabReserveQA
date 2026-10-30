# LabReserve QA — Read-Only API Regression Suite

## 1. Purpose

The **QA Read-Only Regression** collection is a small, repeatable automated suite for checking the most important API behavior in LabReserve without intentionally creating, updating, or deleting equipment records.

It is intended to provide a quick confidence check after backend changes and to become the first automated suite run by CI (GitHub Actions).
**Latest recorded run:** 10 requests executed, 20 assertions passed, 0 failures, approximately 3.3 seconds.
**Important:** This result records one successful run against the local backend connected to the configured database. It is not proof that every API endpoint is correct or that the suite has been tested in CI.

## 2. Why we ran this subset

The full Postman collection includes state-changing scenarios such as creating, updating, and deleting equipment. The recorded read-only run used the backend's configured database; its isolation was not established by that run. A separate local database now exists for the concurrency integration test, but it is not configured as a safe target for the full Postman collection.

Running the full suite against a shared development database could leave test records behind or change existing data. For that reason, the first automated suite deliberately focuses on essential health, authentication, authorization, and equipment-read behavior.

This is a risk-based first step:
- It checks key API behavior quickly and repeatedly.
- It avoids intentional equipment mutations.
- It is suitable as a starting point for CI.
- It leaves state-changing regression tests for a controlled test environment.

## 3. Test coverage

The collection is located at:

`postman/exports/QA-ReadOnly-Regression.postman_collection.json`

| Request | Behavior checked | Expected result |
|---|---|---|
| API Health | API health endpoint responds and identifies the API | HTTP 200 and expected health data |
| API-01 Admin Login | Admin credentials authenticate successfully | HTTP 200, ADMIN role, token returned |
| API-02 List Equipment | Authenticated admin can list equipment | HTTP 200 and an equipment array |
| API-03 Student Login | Student credentials authenticate successfully | HTTP 200, STUDENT role, token returned |
| API-04 Get Equipment by ID | Existing equipment can be retrieved by ID | HTTP 200 and returned ID matches the supplied ID |
| API-11 List Equipment Without Authentication | Equipment listing rejects an unauthenticated request | HTTP 401 and safe error response |
| API-15 Invalid Login Credentials | Invalid login credentials are rejected | HTTP 401 and normal login error |
| API-19 Student List Equipment | Authenticated student can list equipment | HTTP 200 and an equipment array |
| API-20 Student Get Equipment by ID | Student can retrieve the selected equipment record | HTTP 200 and returned ID matches the supplied ID |
| API-29 List Equipment Without Token | Equipment listing rejects a request without a token | HTTP 401 and expected authentication message |

### Summary of the recorded run

- Requests executed: **10**
- Assertions passed: **20**
- Failed assertions: **0**
- Iterations: **1**
- Approximate total duration: **3.3 seconds**
- Average response time reported by Newman: **255 ms**

The two unauthenticated-access cases overlap in purpose, but both are retained because they represent separate existing test cases in the collection.

## 4. Test data and runtime configuration

The collection uses runtime variables rather than embedding real credentials or a fixed equipment ID:

- `baseUrl` — local API base URL, currently `http://localhost:5000`
- `adminEmail` and `adminPassword` — admin test account
- `studentEmail` and `studentPassword` — student test account
- `equipmentId` — ID of an existing equipment record used by API-04 and API-20
- `adminToken` and `studentToken` — populated by the successful login request scripts

The selected equipment record must exist in the database used by the running backend. If it is removed or the backend points to another database, the equipment lookup tests may fail.

**Credential safety:** Do not commit real passwords, access tokens, or database connection strings to Git. Use local runtime variables for manual runs and GitHub Actions Secrets for CI.

## 5. How to run the suite locally

Start the backend in a separate PowerShell terminal:

```powershell
cd "C:\Users\jayas\Desktop\MY PROJECTS\LabreserveQA\server"
npm start
```

From the project root, run Newman. Replace the placeholders locally; do not paste real credentials into project documentation:

```powershell
.\server\node_modules\.bin\newman.cmd run ".\postman\exports\QA-ReadOnly-Regression.postman_collection.json" -e ".\postman\exports\LabReserve Newman.environment.json" --env-var "baseUrl=http://localhost:5000" --env-var "adminEmail=YOUR_ADMIN_EMAIL" --env-var "adminPassword=YOUR_ADMIN_PASSWORD" --env-var "studentEmail=YOUR_STUDENT_EMAIL" --env-var "studentPassword=YOUR_STUDENT_PASSWORD" --env-var "equipmentId=YOUR_EXISTING_EQUIPMENT_ID"
```

To generate a JUnit XML report as well as the normal CLI output:

```powershell
.\server\node_modules\.bin\newman.cmd run ".\postman\exports\QA-ReadOnly-Regression.postman_collection.json" -e ".\postman\exports\LabReserve Newman.environment.json" --env-var "baseUrl=http://localhost:5000" --env-var "adminEmail=YOUR_ADMIN_EMAIL" --env-var "adminPassword=YOUR_ADMIN_PASSWORD" --env-var "studentEmail=YOUR_STUDENT_EMAIL" --env-var "studentPassword=YOUR_STUDENT_PASSWORD" --env-var "equipmentId=YOUR_EXISTING_EQUIPMENT_ID" --reporters cli,junit --reporter-junit-export ".\postman\reports\QA-ReadOnly-Regression-results.xml"
```

The report is expected at:

`postman/reports/QA-ReadOnly-Regression-results.xml`

A successful run should report 10 requests, 20 assertions, and zero failures. Review the actual Newman output and report each time; do not assume a run passed just because a report file exists.

## 6. Limitations and risks

This is a **read-only equipment regression suite**, not a completely side-effect-free or comprehensive test suite.

1. **Authentication may have side effects.** Login requests may produce server-side logs, update activity metadata, or trigger other authentication-related effects.
2. **Only selected endpoints are covered.** The suite does not validate every API route, input-validation case, business rule, or error condition in the full collection.
3. **No equipment mutations are tested here.** Create, update, and delete workflows need a separate controlled suite.
4. **The selected equipment ID is an external prerequisite.** The suite requires a valid existing record supplied at runtime.
5. **Database isolation was not established for the recorded run.** The suite avoids intentional equipment writes, but that alone is not a guarantee of zero database side effects. The separate concurrency test database does not establish isolation for Postman runs.
6. **CI has not yet been validated.** A successful local run does not prove that GitHub Actions can start the backend, connect to a suitable database, or access the required secrets.
7. **Performance results are indicative only.** One short run is not a load, stress, or performance test.
8. **A passing test is only as strong as its assertions.** These assertions check selected response codes, fields, and identity/role behavior; they do not prove all response data is correct or secure.
9. **The Node.js deprecation warning is non-fatal in the recorded run.** Newman still completed successfully. Investigate dependency updates separately rather than treating this warning as a test failure.

## 7. Why the full regression suite is not being run automatically yet

`postman/exports/QA-Full-Regression.postman_collection.json` contains state-changing tests, including equipment creation, update, and deletion. At least one scenario also creates a record using an unsupported category value and may leave it behind.

Do not run this collection against a shared development database until one of the following is in place:

- a dedicated test database with suitable test credentials; or
- a reviewed fixture and cleanup strategy that reliably removes only records created by the test run.

The full suite should be run only after its data lifecycle and cleanup behavior have been reviewed.

## 8. Next steps

1. Add the read-only suite to GitHub Actions.
2. Store credentials in GitHub repository or environment Secrets; never place them in workflow YAML.
3. Decide how CI will start the backend and connect to a safe test database.
4. Publish the JUnit XML report as a CI artifact.
5. Add the state-changing regression suite only after test database isolation and cleanup are addressed.
6. Over time, add assertions for response schemas, authorization boundaries, and important business rules.

## 9. Related files

- Collection: `postman/exports/QA-ReadOnly-Regression.postman_collection.json`
- Newman environment template: `postman/exports/LabReserve Newman.environment.json`
- JUnit report from the recorded run: `postman/reports/QA-ReadOnly-Regression-results.xml`
- Full suite (not approved for execution against the shared development database): `postman/exports/QA-Full-Regression.postman_collection.json`

---

**Document status:** Initial test documentation. Update the recorded results whenever a new run is performed, and distinguish local results from CI results.
