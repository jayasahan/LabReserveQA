# `createRequest()` White-Box Test Cases

## Scope

These are controller-level white-box tests for `server/controllers/requestController.js`. The first version has been implemented and executed with Jest.

## Recommended Framework

Jest is used because it supports CommonJS modules, asynchronous controller tests, mocks for the Mongoose models, and clear assertions. It is configured as the server test script and is the only test dependency added for this stage.

## Test Cases

| Test ID | Purpose | Setup / mocks or test data | Action | Expected HTTP result | Expected state changes | Status |
|---|---|---|---|---|---|---|
| WB-01 | Verify a student can create a request with valid loan days. | `req.user.role = 'STUDENT'`; valid student ID and equipment ID; mock `findOneAndUpdate()` to return available equipment; mock `Request.create()` and population query to succeed. | Call `createRequest(req, res)` with `loanDays: 5`. | 201 | Equipment changes from `AVAILABLE` to `REQUESTED`; a `PENDING` request is created with `loanDays: 5`. | Implemented |
| WB-02 | Verify non-students cannot create requests. | `req.user.role = 'ADMIN'`; valid request body. | Call `createRequest(req, res)`. | 403 | No equipment or request model method should be changed or called. | Implemented |
| WB-03 | Verify missing or malformed equipment IDs are rejected. | Student request; run separately with no `equipmentId` and with an invalid ID such as `'not-an-object-id'`. | Call `createRequest(req, res)` for each input. | 400 | No equipment claim and no request creation. | Implemented |
| WB-04 | Verify omitted loan days use the default. | Student request with a valid equipment ID and no `loanDays`; claim and request mocks succeed. | Call `createRequest(req, res)`. | 201 | Created request data contains `loanDays: 7`; equipment becomes `REQUESTED`. | Implemented |
| WB-05 | Verify invalid loan days are rejected. | Student request with a valid equipment ID; run with a non-integer, `0`, and `15`. | Call `createRequest(req, res)` for each input. | 400 | No equipment claim and no request creation. | Implemented |
| WB-06 | Verify a valid but nonexistent equipment ID returns not found. | Student request; atomic claim mock returns `null`; `Equipment.exists()` returns false. | Call `createRequest(req, res)`. | 404 | No request is created; no rollback is required because no equipment was claimed. | Implemented |
| WB-07 | Verify an equipment item that cannot be claimed returns a conflict. | Student request; atomic claim mock returns `null`; `Equipment.exists()` returns true. | Call `createRequest(req, res)`. | 409 | No request is created; equipment remains in its existing unavailable state. | Implemented |
| WB-08 | Verify a Mongoose validation error triggers rollback. | Student request; claim returns equipment; `Request.create()` rejects with an error whose `name` is `ValidationError`; rollback `updateOne()` succeeds. | Call `createRequest(req, res)`. | 400 | Equipment rollback is attempted from `REQUESTED` to `AVAILABLE`; no successful request is returned. | Implemented |
| WB-09 | Verify an unexpected error triggers rollback and a safe server response. | Student request; claim returns equipment; `Request.create()` rejects with a normal `Error`; rollback `updateOne()` succeeds. | Call `createRequest(req, res)`. | 500 | Equipment rollback is attempted; no successful request is returned. | Implemented |

## Additional Focused Cases

These are small extensions to the required cases, not separate framework features:

- **WB-03a:** Keep the missing-ID case separate from the malformed-ID case to check the `!equipmentId || ...` short-circuit behaviour.
- **WB-05a:** Include one non-integer value, one value below 1, and one value above 14 so the loan-days boundary validation is represented.
- **WB-08a:** Verify the rollback update uses the claimed equipment ID and the condition `status: 'REQUESTED'`.
- **WB-09a:** Make the rollback update itself reject and document the observed controller behaviour. This is an optional robustness case because the current controller still returns the outer 500 response; it should not be added unless the assignment requires rollback-failure analysis.

## Safe Test Setup

Use a plain mock `req` and a response object whose `status()` and `json()` methods can be asserted. Mock `Equipment` and `Request` model methods rather than connecting to MongoDB. The tests should verify both response values and calls made to the claim, create, populate, and rollback operations. A real database and application server are not required for these controller-level tests.

The tests should not modify production logic, depend on frontend behaviour, or claim concurrency coverage. A separate API/concurrency test can be planned later.

## Test Execution and Coverage Results

Command executed from the `server` directory:

```text
npm.cmd test -- --coverage
```

Verified execution result:

```text
Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
```

Jest reported the following coverage for the entire `server/controllers/requestController.js` file:

| Metric | Whole-file result |
|---|---:|
| Statements | 33.64% |
| Branches | 31.81% |
| Functions | 33.33% |
| Lines | 35% |

Codex's inspection of Jest's generated coverage map reported 100% statement, branch, function, and line coverage for `createRequest()` itself. This is function-scoped coverage, not whole-file coverage.

The execution results are verified by the command output. Coverage alone does not prove that the implementation is correct, that all business rules are adequately asserted, or that uncovered functions are defective.
