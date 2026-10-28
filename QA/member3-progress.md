# Member 3 QA Progress

## Responsibility

Member 3 is responsible for white-box testing, test automation, coverage measurement, CI/CD, SonarQube integration, and technical integration of QA work.

## Current Phase

White-box testing and initial coverage analysis.

## Completed

- [x] Selected `createRequest()` as the white-box analysis target.
- [x] Drafted the control flow graph and independent-path plan.
- [x] Verified the CFG and cyclomatic complexity analysis.
- [x] Completed the white-box test-case design.
- [x] Implemented and executed the first Jest white-box test suite.
- [x] Measured and interpreted initial statement and branch coverage.

## In Progress

- [ ] Plan additional controller tests to improve whole-file coverage.
- [ ] Review uncovered controller branches and functions.

## Not Started

- [ ] Improve whole-file coverage.
- [ ] Build API automation.
- [ ] Add a concurrency test.
- [ ] Configure GitHub Actions CI/CD.
- [ ] Configure SonarQube.
- [ ] Complete technical integration of QA outputs.

## Evidence / Artifacts

- `QA/whitebox/createRequest-analysis.md`
- `QA/whitebox/createRequest-test-cases.md`
- `QA/whitebox/coverage-report.md`
- `server/tests/requestController.createRequest.test.js`

## Next Immediate Task

1. Review the uncovered controller functions.
2. Decide which additional controller tests are required for whole-file coverage.
3. Keep CI and SonarQube as later stages.

## Learning Notes

- A CFG makes the branches and execution paths of a function easier to identify.
- Cyclomatic complexity helps estimate the number of independent paths to test.
- Database and library internals can be treated as high-level outcomes in this analysis.
