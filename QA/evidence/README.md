# QA evidence index

## Jest coverage

## Local snapshot

`jest-coverage-2026-10-29.zip` is a local-run snapshot from `server/coverage/`, generated with:

```text
cd server
npm.cmd test -- --coverage
```

The recorded local result was 1 Jest suite and 14 tests passed. At source revision `b282639`, the whole-file `requestController.js` report showed 33.64% statements, 31.81% branches, 33.33% functions, and 35% lines. The archive contains the readable HTML report, `lcov.info`, `coverage-final.json`, and `clover.xml`.

This ZIP is local evidence, not a GitHub Actions artifact.

## GitHub Actions artifact

GitHub Actions run [#2](https://github.com/jayasahan/LabReserveQA/actions/runs/40759976311) completed successfully for the Jest coverage workflow and uploaded `jest-coverage-2`. The uploaded artifact is separate from the local ZIP and is available from the linked run until its listed expiry date, 2026-11-11. It has not been copied into this directory.

## Supplemental files on the feature branch

`README_jest-coverage_zip.md` and `jest-coverage-1.zip` were reviewed and committed on `ci/jest-coverage-workflow` in commit `6d98494`. They are not part of the current `main` evidence set. Their short README describes a Jest coverage archive but does not establish that it came from GitHub Actions, so they are not labeled as CI evidence here.

## SonarQube

The first local SonarQube Community Build scan for project `LabReserveQA` completed successfully (scan metadata supplied by the maintainer). The available project measures and coverage-import details are recorded in [`QA/sonarqube/scan-report.md`](../sonarqube/scan-report.md); representative findings and review actions are in [`QA/sonarqube/findings.md`](../sonarqube/findings.md). The scan report identifies API access limitations and does not claim to include a saved screenshot or scan export. This is an initial scan, not a post-fix scan.
