# LabReserve Concurrency Testing Report

## Objective and concurrency problem

The test checks LabReserve's first-come-first-served rule: when two students request the same available equipment item at nearly the same time, only one should claim it. A sequential test would let the first request change the equipment state before the second starts, so it would not verify that both requests compete at the claim point.

## Implementation

The production controller claims the equipment with this conditional atomic database update, copied from `server/controllers/requestController.js`:

```js
const claimedEquipment = await Equipment.findOneAndUpdate(
  { _id: equipmentId, status: 'AVAILABLE' },
  { $set: { status: 'REQUESTED' } },
  { returnDocument: 'after' },
)
```

The database evaluates the ID and `AVAILABLE` condition as part of one update. Once one request changes the status to `REQUESTED`, the competing update no longer matches and the controller returns a conflict. The test-only barrier is separate from this production claim: it pauses both HTTP handlers immediately before the real update and releases them only after both have arrived. The barrier has a five-second timeout, is unset by default, and its setter is restricted to Jest test mode.

The integration test creates two students, signs a runtime-only JWT for each, and sends two authenticated `POST /api/requests` calls through Express. It verifies both barrier arrivals, the HTTP results, and the persisted state.

## Environment and execution

- Node.js, Express, Jest, Mongoose `9.10.0`, MongoDB Node driver `7.6.0`, and MongoDB Server 8.0.
- Dedicated local Docker container: `labreserve-mongodb-test`, published on `127.0.0.1:27018`.
- Dedicated database: `labreserve_concurrency_test`, selected only through runtime `TEST_MONGODB_URI`.
- The test generates `JWT_SECRET` before loading dotenv. Dotenv preserves an already-set process value, and importing the Express app does not start the server or invoke the production database connection. The integration test connects only through the validated `TEST_MONGODB_URI`.
- The test rejects remote hosts, URI credentials/options, unexpected database names, and a database-name collision with `MONGODB_URI`; it also checks the connected database name.
- The JWT secret is generated at runtime and is not recorded here.

The recorded PowerShell procedure from the repository root:

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

## Expected and observed results

Two successful local executions were recorded on 2026-10-30. Each reported one passing suite and one passing test.

| Check | Expected | Observed |
|---|---|---|
| First successful claim | HTTP 201 | HTTP 201 |
| Competing claim | HTTP 409 | HTTP 409 |
| Persisted request count for fixture equipment | 1 | 1 |
| Persisted request status | `PENDING` | `PENDING` |
| Equipment status | `REQUESTED` | `REQUESTED` |

The stored request's student is checked against the two test students and against the student whose response was `201`. A read-only check after the first run found zero fixture users, equipment, and requests remaining. The normal Jest suite separately passed once: one suite and 14 of 14 tests.

## Isolation and cleanup

Each run creates unique user emails, asset code, and equipment ID. Cleanup deletes requests only for that equipment ID, deletes the equipment using its ID and asset code, and deletes only the two created student IDs with role `STUDENT`. It does not drop or clear the database. The documented runs used the dedicated local database, not the normal application database.

## Limitations and conclusion

This evidence covers the implemented two-student claim scenario against local MongoDB. It does not cover every possible schedule, more than two simultaneous students, load/performance, GitHub Actions execution, or the separate API-01–API-30 suite. The local concurrency scenario is complete for its stated acceptance criteria; full API regression and CI integration remain pending.
