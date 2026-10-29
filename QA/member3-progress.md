# Member 3 QA Progress

## Responsibility and Scope

Member 3's QA work covers white-box analysis, test automation, coverage measurement, CI, SonarQube, and integration of QA evidence. Prioritize the assignment requirements over optional improvements. The official course rubric was not found as a separate file in the repository, so confirm grading details with the supplied assignment sheet or lecturer.

## Current Phase

The initial SonarQube scan and its available evidence are documented. The next stage is the database-backed concurrency test, which remains blocked until an isolated test database and fixture cleanup are confirmed.

## Completed

- [x] Selected `createRequest()` as the core white-box target and documented its control-flow graph, node/edge model, cyclomatic complexity (`V(G) = 9`), and nine independent paths.
- [x] Mapped paths P1–P9 to WB-01–WB-09 and implemented Jest controller tests with mocked models.
- [x] Recorded the local Jest result: 1 suite and 14 tests passed. Coverage generation completed locally for source revision `b282639`.
- [x] Preserved the dated local coverage snapshot at `QA/evidence/jest-coverage-2026-10-29.zip`.
- [x] Added the Jest coverage workflow in PR [#6](https://github.com/jayasahan/LabReserveQA/pull/6), merged as `093c7c6`.
- [x] Verified GitHub Actions run [#2](https://github.com/jayasahan/LabReserveQA/actions/runs/40759976311) completed successfully and uploaded artifact `jest-coverage-2`. This is separate from the local ZIP.
- [x] Merged PR [#7](https://github.com/jayasahan/LabReserveQA/pull/7), including documentation and the finalized coding-agent policy; commit `069d01a` records that update.
- [x] Kept root `AGENTS.md` as the canonical policy and `.github/copilot-instructions.md` as its concise reference.
- [x] Created the Postman smoke, read-only regression, and full-regression collection definitions.
- [x] The existing local smoke JUnit XML records 5 requests, 12 assertions, and 0 failures. This evidence applies only to the smoke collection.
- [x] Executed the read-only regression collection locally: 10 request suites, 20 assertions, 0 failures, and 0 errors; evidence is `postman/reports/QA-ReadOnly-Regression-results.xml`.
- [x] Completed the first local SonarQube Community Build analysis for project `LabReserveQA`; documented the retrieved project metrics and representative findings under `QA/sonarqube/`.

## Current Findings

- The latest local whole-file coverage for `requestController.js` is 33.64% statements, 31.81% branches, 33.33% functions, and 35% lines. `createRequest()` has 100% coverage within its function scope; that does not mean the full controller has 100% coverage.
- The ten-request read-only/authentication collection has a recorded successful local execution. Its `baseUrl`, credentials, and `equipmentId` were runtime prerequisites; the exported environment remains a template and does not contain those values.
- The 30-test full-regression collection is a definition, not evidence of execution. It includes fixture-dependent state changes, and API-27 creates an additional record.
- `QA/member 3.docx` is the intentional screenshot document and remains part of the repository.
- The older supplemental files `QA/evidence/README_jest-coverage_zip.md` and `QA/evidence/jest-coverage-1.zip` are committed on `ci/jest-coverage-workflow` at `6d98494`; they are not included in the current `main` evidence set.

## Project Roadmap

### Phase 1 — White-box testing

**Status: Complete for now.**

The selected `createRequest()` analysis includes the CFG, cyclomatic complexity, independent paths, Jest tests, scoped coverage interpretation, and local evidence. Reopen this phase only if the official rubric reveals a missing item or a concrete analysis defect. Do not add tests to every controller function merely to increase whole-file coverage.

### Phase 2 — API regression and safe test data

**Status: In progress; next phase.**

1. **Complete:** Inspect the current Postman suites and classify their effects. The smoke and read-only/authentication subset do not create, update, or delete equipment. The full suite includes state-changing API-05, API-07, API-09, and persistent-record API-27; concurrency also needs controlled database fixtures.
2. **Complete:** The read-only collection was run with runtime `baseUrl`, credentials, and a known equipment ID. The JUnit report records 10 request suites, 20 assertions, 0 failures, and 0 errors. A future run still requires a safe target and fresh runtime variables.
3. **Blocked:** Configure isolated test data/database access for mutation and concurrency cases; no isolated API test database has been confirmed. Agree on cleanup, including API-27's extra record.
4. **Blocked:** Run required API cases after the safe database and runtime variables are ready; record actual pass/fail or blocked outcomes separately from historical observations and collection definitions.
5. Keep execution simple; add no framework or database infrastructure unless the current project requires it.

### Phase 3 — SonarQube

**Status: Initial scan and available evidence complete; findings have not been fixed and no post-fix scan has been run.**

1. **Complete:** Scanned the `LabReserveQA` backend project with SonarQube Community Build and imported the Jest LCOV report.
2. **Complete:** Recorded the available measures and three representative findings. SonarQube reported seven open issues total and a quality gate status of `OK`.
3. **Pending:** Review the findings and agree on any proportionate code improvements; no application code was changed during evidence preparation.
4. **Pending:** Retrieve the exact analysis timestamp/revision and hotspot review details in the dashboard if the assignment requires them; the current account could not access those API details.
5. **Pending:** Run a post-fix scan only after any finding is changed.

### Phase 4 — Minimal CI integration

**Status: Existing Jest workflow verified; Newman CI remains pending. SonarQube was run locally and is not part of CI.**

- **Complete:** Keep the existing Jest workflow; run #2 succeeded and uploaded `jest-coverage-2`.
- **Pending:** Add Newman API tests to CI only if required by the rubric and after repeatable execution is safe. Any state-changing tests must use isolated data.

### Phase 5 — Concurrency and final QA evidence

**Status: Blocked pending an isolated database and controlled fixtures from Phase 2.**

1. **Blocked:** Run the required concurrency scenario with isolated fixtures and a database-backed path; no isolated API database is confirmed.
2. **Blocked:** Record reproducible results after that scenario is actually run.
3. **Blocked:** Consolidate the final white-box, API, CI, and SonarQube package after the pending API and concurrency evidence is available.
4. **Blocked:** Check each explicit deliverable against the official course rubric; the rubric is not present in this repository.
5. **Blocked:** Mark the project complete only when required evidence is present and verified.

## Scope Control and Sign-off

- The supplied Member 3 task list names Newman/CI, SonarQube, concurrency, and final evidence. Initial SonarQube scanning and available evidence are complete; Newman CI, concurrency, and final evidence remain pending. The official course rubric was not found in the repository, so confirm exact grading scope and evidence format before final sign-off. Do not mark an explicit task-list deliverable optional without that confirmation.
- Assignment requirements take priority over optional industry enhancements.
- Do not target 100% whole-controller coverage unless the rubric explicitly requires it.
- Mocked unit tests and coverage generation do not need a separate database; isolate database-backed mutation and concurrency tests.
- Avoid unnecessary Docker, orchestration, extra CI jobs, frameworks, or infrastructure.

## Evidence and Artifacts

- White-box analysis: `QA/whitebox/createRequest-analysis.md`
- Test cases: `QA/whitebox/createRequest-test-cases.md`
- Coverage report: `QA/whitebox/coverage-report.md`
- Jest tests: `server/tests/requestController.createRequest.test.js`
- Local coverage snapshot: `QA/evidence/jest-coverage-2026-10-29.zip`
- Workflow and evidence notes: `QA/evidence/README.md`
- Postman collections: `postman/exports/QA-Smoke.postman_collection.json`, `QA-ReadOnly-Regression.postman_collection.json`, and `QA-Full-Regression.postman_collection.json`
- Historical API report: `postman/reports/QA-API-Test-Report.md`
- Read-only execution report: `QA/api/api-regression-results.md` and `postman/reports/QA-ReadOnly-Regression-results.xml`
- SonarQube scan measures and limitations: `QA/sonarqube/scan-report.md`
- SonarQube findings and suggested review actions: `QA/sonarqube/findings.md`

## Learning Notes

- A control-flow graph makes a function's decisions and execution paths explicit.
- Cyclomatic complexity estimates the number of independent paths in the chosen graph model.
- Mocked controller tests can check business logic without connecting to the database; live API and concurrency tests need a separate safety plan.
