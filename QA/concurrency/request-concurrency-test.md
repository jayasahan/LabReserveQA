# Equipment Request Concurrency Test

## Purpose

This integration test checks the first-come-first-served rule through the real Express HTTP route and a real MongoDB database. It sends two authenticated student requests at once for the same available equipment item.

## Implementation

- `server/tests/requestConcurrency.integration.test.js` creates two `STUDENT` users and one disposable `AVAILABLE` equipment fixture with unique values for each run.
- Each student receives a JWT signed with a random secret generated for that Jest process. The secret is not read from or saved to an environment file.
- The test sends both `POST /api/requests` requests using `Promise.all`.
- A test-only barrier is installed immediately before the real atomic `findOneAndUpdate` claim. Both authenticated requests must arrive before either continues; the barrier releases both only after two arrivals and fails with a bounded timeout otherwise. It is unset by default and is available only while Jest is running in test mode.
- It checks for exactly one `201` response and one `409` response, verifies the losing response, and verifies that the single stored request belongs to the student whose response was `201`.
- It queries all request documents for the fixture equipment and requires exactly one total document, with status `PENDING` and a student ID belonging to one of the two test students. It also checks that the equipment is `REQUESTED`.
- Cleanup deletes only requests associated with the exact fixture equipment ID, that equipment by its ID and unique asset code, and the two users by their created IDs and `STUDENT` role. The database is not dropped or cleared.

`server/server.js` now exports the Express app and starts the server only when invoked directly. Therefore `node server.js` retains the existing production startup path, while Jest can listen on a temporary loopback port and connect separately to its test database.

## Database guard and local setup

The test requires `TEST_MONGODB_URI`; it never substitutes `MONGODB_URI`. It accepts only a plain `mongodb://` URI using `localhost`, `127.0.0.1`, or `::1` and the exact database name `labreserve_concurrency_test`. Credentials and URI options are rejected. It also rejects a configured application URI that names the same database, then checks the database name after connecting.

The verified test used the official `mongo:8.0` image in the dedicated `labreserve-mongodb-test` container, published only on `127.0.0.1:27018`. The project locks Mongoose `9.10.0` and MongoDB Node driver `7.6.0`; the driver's compatibility table lists MongoDB Server 8.0 as supported. The first Jest connection exposed the driver's documented Jest runtime-adapter issue; the test-only connection now passes Node's built-in `os` module as `runtimeAdapters.os`. No package was added and production database configuration was not changed. [MongoDB driver compatibility table](https://www.mongodb.com/docs/drivers/compatibility/), [MongoDB driver issue NODE-7832](https://jira.mongodb.org/browse/NODE-7832).

PowerShell setup from the repository root:

```powershell
docker start labreserve-mongodb-test

$env:TEST_MONGODB_URI = 'mongodb://127.0.0.1:27018/labreserve_concurrency_test'
try {
    Push-Location server
    npm.cmd run test:concurrency
}
finally {
    Pop-Location
    Remove-Item Env:TEST_MONGODB_URI -ErrorAction SilentlyContinue
}

docker stop labreserve-mongodb-test
```

The MongoDB container is separate from the application server; the test binds Express to an ephemeral port on loopback. Do not point `TEST_MONGODB_URI` at Atlas, a shared database, or any database other than the guarded test database.

## Execution evidence

On 2026-10-30, `npm.cmd run test:concurrency` completed successfully twice against the dedicated local MongoDB 8.0 instance in `labreserve-mongodb-test`. Both runs reported:

```text
Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

The passing test's assertions establish that both requests reached the barrier, one `201` and one `409` response were returned, exactly one request document remained for the fixture equipment, that request was `PENDING` and owned by the winning student, and the equipment status was `REQUESTED`. A read-only count after the first run confirmed zero users, equipment, and requests remained in the test database; the second run also passed after that cleanup. The first attempt failed during the driver handshake before fixture creation; the test-only runtime-adapter option resolved it.

The normal Jest unit suite was also executed successfully once during the 2026-10-31 documentation review: 1 suite passed and all 14 tests passed.

The request-claim `findOneAndUpdate()` call now uses Mongoose's supported `returnDocument: 'after'` option, which preserves the previous behavior while removing the warning for this path. Other existing `findOneAndUpdate()` calls in the application still use the older option and may produce the warning when those paths are exercised.

## Scope and limitations

This verifies the single concurrent request-claim scenario against MongoDB and the HTTP middleware/controller path. It does not run the full API-01 through API-30 suite, test higher concurrency/load, or add this database-backed test to GitHub Actions.
