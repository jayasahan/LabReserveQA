# LabReserve QA Evidence Index

This index links the QA work and distinguishes local execution from GitHub Actions evidence.

## White-box testing, Jest, and coverage

- [createRequest() analysis](whitebox/createRequest-analysis.md) — CFG, complexity, independent paths, and current status.
- [White-box test cases](whitebox/createRequest-test-cases.md) — WB-01 through WB-09.
- [Coverage report](whitebox/coverage-report.md) — local coverage scope and figures.
- [Local Jest coverage ZIP](evidence/jest-coverage-2026-10-29.zip) — local snapshot, not a CI artifact.
- [Coverage evidence notes](evidence/README.md) — distinguishes the local ZIP from the verified GitHub Actions artifact.

## API and Postman testing

- [API test plan](api/api-test-plan.md) — route coverage, setup, and safety.
- [Read-only API results](api/api-regression-results.md) — recorded local run of ten requests and 20 assertions.
- [Read-only collection instructions](docs/testing/QA-ReadOnly-Regression-Documentation.md) — local Newman instructions and limitations.
- [Historical API-01–API-30 report](../postman/reports/QA-API-Test-Report.md) — historical observations, not a fresh execution.
- Postman definitions: `postman/exports/QA-Smoke.postman_collection.json`, `QA-ReadOnly-Regression.postman_collection.json`, and `QA-Full-Regression.postman_collection.json`.
- The smoke JUnit XML covers only five smoke requests. The full API-01–API-30 collection has not been freshly executed.

## Concurrency integration testing

- [Concurrency design and execution record](concurrency/request-concurrency-test.md) — two successful local runs against a dedicated MongoDB test database.
- [Standalone concurrency report](concurrency/concurrency-testing-report.md) — objective, approach, results, database verification, and limitations.

## SonarQube

- [Initial local scan report](sonarqube/scan-report.md) — imported coverage, available measures, and evidence gaps.
- [Findings and suggested review actions](sonarqube/findings.md) — representative findings; no post-fix scan is recorded.

## Progress and remaining work

- [Member 3 progress and roadmap](member3-progress.md)
- Pending: fresh controlled execution of API-01–API-30; Newman CI if required by the assignment; final evidence review against the official rubric. The rubric is not present in this repository.
- The local concurrency scenario is complete for its stated two-student case. It has not run in GitHub Actions and is not a load test.
