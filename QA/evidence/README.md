# Jest coverage evidence

`jest-coverage-2026-10-29.zip` is a local-run snapshot created from the generated `server/coverage/` directory after running:

```text
cd server
npm.cmd test -- --coverage
```

The recorded local result was:

```text
1 test suite passed
14 tests passed
```

The Jest terminal summary reported 33.64% statements, 31.81% branches, 33.33% functions, and 35% lines for `requestController.js`. The archive contains the readable `lcov-report/index.html`, `lcov.info`, `coverage-final.json`, and `clover.xml`.

This is local evidence. It is not proof of a successful GitHub Actions run. The CI workflow uploads its own artifact separately, and a successful Actions run has not been confirmed in this audit.
