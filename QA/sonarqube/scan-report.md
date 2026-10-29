# LabReserveQA SonarQube Scan Report

## Scan record

| Item | Recorded value |
|---|---|
| SonarQube | Community Build 26.10.0.133078 |
| SonarScanner CLI | 8.1.0.6389 |
| Project key / name | `LabReserveQA` / LabReserve QA |
| Dashboard | `http://localhost:9000/dashboard?id=LabReserveQA` |
| Outcome | Execution succeeded (provided scan result) |
| Analyzed revision | `e6b63b9e00d25d2ec05bb255d58d0deb75f956c3` (provided scan metadata) |
| Coverage input | `server/coverage/lcov.info`; detected and analyzed (provided scan metadata) |
| Results retrieved | 2026-10-30 from the local SonarQube measures and issues APIs |
| Analysis timestamp | Not available: the analysis-history API denied this account, and no scanner task metadata was present locally |

The successful scan outcome, scanner version, revision, and LCOV detection were provided as scan metadata. Metrics below were retrieved from the authenticated local project APIs. No scan was rerun for this report.

## Project measures

| Measure | Value | Meaning / limitation |
|---|---:|---|
| Quality gate | `OK` | SonarQube returned OK; it returned no individual conditions |
| Bugs | 3 | Open issues in the project snapshot |
| Vulnerabilities | 2 | Open issues in the project snapshot |
| Security hotspots | 0 | Project measure; hotspot review status could not be retrieved |
| Code smells | 2 | Open issues in the project snapshot |
| Lines of code (`ncloc`) | 778 | Non-comment source lines |
| Lines | 930 | SonarQube line count |
| Coverage | 13.2% | Overall coverage measure |
| Line coverage | 9.7% | Lines-to-cover metric |
| Lines to cover | 359 | Coverage denominator for lines |
| Uncovered lines | 324 | Lines not covered by imported coverage data |
| Branch coverage | 31.8% | Conditions/branches covered |
| Conditions to cover | 66 | Branch coverage denominator |
| Uncovered conditions | 45 | Conditions not covered |
| Duplicated lines | 83 | Duplicated source lines |
| Duplicated lines density | 8.9% | Project duplication percentage |
| Reliability rating | 3.0 | SonarQube's numeric rating value |
| Security rating | 3.0 | SonarQube's numeric rating value |
| Maintainability rating | 1.0 | SonarQube's numeric rating value |
| Remediation effort (`sqale_index`) | 40 minutes | Total estimated effort returned by the project measure |
| Quality model status | `compliant` | SonarQube returned CAYC status compliant |

The API reported seven open issues: three bugs, two vulnerabilities, and two code smells. The ratings are kept in SonarQube's numeric form; no letter-grade interpretation is added here. New-code measures were not retrieved.

## Configuration and coverage

The scan used the root [`sonar-project.properties`](../../sonar-project.properties). It analyzes backend source in `server`, classifies `server/tests` as test code, excludes dependencies and generated output, and points coverage import to:

```text
server/coverage/lcov.info
```

SonarQube reported project coverage of 13.2%, line coverage of 9.7%, and branch coverage of 31.8%. This is whole-project SonarQube coverage and should not be confused with Jest's separate whole-file `requestController.js` result (33.64% statements, 31.81% branches, 33.33% functions, and 35% lines) or the 100% function-scoped `createRequest()` figure.

## Evidence gaps

- The project analysis history and compute-engine task APIs returned insufficient privileges, so the exact scan timestamp and server-recorded revision were not independently retrieved.
- The hotspot listing API also returned insufficient privileges. The project measure is zero hotspots, but individual hotspot review details are unavailable.
- No screenshot, downloadable report, or scanner log was saved as part of this evidence update.
- The scan is the initial analysis, not a post-fix scan. No application code was changed to address findings.

To verify the exact analysis time and revision, open the local dashboard, select **Project Information** or the project analysis/history view, and inspect the latest analysis. To review security hotspots, open **Security Hotspots** and check their review state. Save a screenshot only if the assignment requires it.
