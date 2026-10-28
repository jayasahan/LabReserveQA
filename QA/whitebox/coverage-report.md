# Member 3 Coverage Report

## Purpose and Scope

This report records the initial Jest coverage measurement for the Member 3 white-box target, `createRequest()` in `server/controllers/requestController.js`. The test suite uses mocked Mongoose models and does not require MongoDB.

## Test Command and Results

Command run from the `server` directory:

```text
npm.cmd test -- --coverage
```

Actual result:

```text
Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
```

## Whole-File Coverage

| Metric | Result |
|---|---:|
| Statements | 33.64% |
| Branches | 31.81% |
| Functions | 33.33% |
| Lines | 35% |

These percentages describe the complete `requestController.js` file.

## Whole-File versus Target-Function Coverage

Codex's inspection of Jest's generated coverage map reported 100% statement, branch, function, and line coverage for `createRequest()`.

This does not conflict with the lower whole-file percentages. The current tests execute `createRequest()` and its directly used helpers, but most of the other controller functions are not called by this suite.

## Uncovered Controller Areas

The existing report identified these uncovered or largely uncovered areas:

- `populateRequest()`
- `getMyRequests()`
- `cancelRequest()`
- `getAllRequests()`
- `approveRequest()` and `rejectRequest()`
- `changePendingRequest()`
- `returnRequest()`

## Interpretation and Limitations

The nine documented independent paths provide a basis set for the verified `createRequest()` CFG with `V(G) = 9`. They do not cover every function in the controller file, and they do not guarantee every possible combination of compound conditions. Coverage shows execution, not correctness; assertions, business-rule review, and later integration testing are still required.

## Recommended Next Step

Keep the `createRequest()` suite as the verified white-box baseline, then plan additional controller tests for the uncovered request-management functions if whole-file coverage is required. CI and SonarQube integration should remain later stages.
