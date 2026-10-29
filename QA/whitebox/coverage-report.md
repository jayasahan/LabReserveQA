# Member 3 Coverage Report

## Purpose and Scope

This report records the local Jest coverage measurement for the Member 3 white-box target, `createRequest()` in `server/controllers/requestController.js`. The test suite uses mocked Mongoose models and does not connect to MongoDB. The measured source and test file revision is commit `b282639` (`b2826399c82e7610144a8d5269a343801299071f`).

## Test Command and Results

Command run from the `server` directory:

```text
npm.cmd test -- --coverage
```

Actual local result:

```text
Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
```

Jest coverage generation completed locally. The generated report is preserved as the local snapshot `QA/evidence/jest-coverage-2026-10-29.zip`. It is not GitHub Actions evidence. The current local `server/coverage/` output was inspected without rerunning Jest and reports the same whole-file figures below.

## Whole-File Coverage

| Metric | Result |
|---|---:|
| Statements | 33.64% |
| Branches | 31.81% |
| Functions | 33.33% |
| Lines | 35% |

These percentages describe the complete `requestController.js` file.

The generated coverage data records 36 of 107 statements, 21 of 66 branches, 4 of 12 functions, and 35 of 100 lines covered. Jest's report displays branch coverage as 31.81% (it truncates the repeating decimal); the same branch count rounds to 31.82% under conventional two-decimal rounding. This is a display-rounding difference, not a different test result.

## Whole-File versus Target-Function Coverage

Inspection of the generated coverage map shows 100% statement, branch, function, and line coverage for `createRequest()` when counts are restricted to that function's source range. This is a function-scoped calculation, not the whole-file percentage.

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

The white-box report contains the CFG, complexity calculation, nine independent paths, and their mapping to WB-01 through WB-09. Keep the selected function as the baseline; add controller tests only if the official rubric or a demonstrated correctness gap requires them. GitHub Actions run [#2](https://github.com/jayasahan/LabReserveQA/actions/runs/40759976311) completed successfully and uploaded `jest-coverage-2`; this is separate evidence from the local ZIP. The initial SonarQube scan and available project metrics are recorded in `QA/sonarqube/`; no post-fix scan has been run. Newman CI, concurrency testing, and final integrated evidence remain pending.
