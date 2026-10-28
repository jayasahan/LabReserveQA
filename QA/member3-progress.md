# Member 3 QA Progress

## Responsibility

Member 3 is responsible for white-box testing, test automation, coverage measurement, CI/CD, SonarQube integration, and technical integration of QA work.

## Current Phase

White-box testing, local coverage evidence, and initial CI workflow preparation.

## Completed

- [x] Selected `createRequest()` as the white-box analysis target.
- [x] Drafted the control flow graph and independent-path plan.
- [x] Verified the CFG and cyclomatic complexity analysis.
- [x] Completed the white-box test-case design.
- [x] Implemented and executed the first Jest white-box test suite.
- [x] Measured and interpreted initial statement and branch coverage.
- [x] Added a GitHub Actions workflow to run Jest with coverage and upload a coverage artifact.
- [x] Executed the local Jest suite with coverage: 1 test suite and 14 tests passed.
- [x] Created Postman smoke, read-only, and full-regression collection definitions.

## In Progress

- [ ] Plan additional controller tests to improve whole-file coverage.
- [ ] Review uncovered controller branches and functions.

## Not Started

- [ ] Improve whole-file coverage.
- [ ] Execute the Postman smoke and read-only collections against a controlled local setup.
- [ ] Add a concurrency test.
- [ ] Confirm a successful GitHub Actions workflow run and download its coverage artifact.
- [ ] Configure SonarQube.
- [ ] Complete technical integration of QA outputs.

## Evidence / Artifacts

- `QA/whitebox/createRequest-analysis.md`
- `QA/whitebox/createRequest-test-cases.md`
- `QA/whitebox/coverage-report.md`
- `server/tests/requestController.createRequest.test.js`
- `postman/exports/QA-Smoke.postman_collection.json`
- `postman/exports/QA-ReadOnly-Regression.postman_collection.json`
- `postman/exports/QA-Full-Regression.postman_collection.json`
- `postman/reports/QA-API-Test-Report.md`
- `QA/evidence/jest-coverage-2026-10-29.zip`

## Next Immediate Task

1. Review the uncovered controller functions.
2. Decide which additional controller tests are required for whole-file coverage.
3. Confirm the GitHub Actions result and retain its artifact separately from the local snapshot.
4. Keep Newman CI, SonarQube, concurrency testing, and full state-changing API execution pending until their prerequisites are available.

## Learning Notes

- A CFG makes the branches and execution paths of a function easier to identify.
- Cyclomatic complexity helps estimate the number of independent paths to test.
- Database and library internals can be treated as high-level outcomes in this analysis.
