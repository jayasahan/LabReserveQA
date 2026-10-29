# SonarQube Findings and Review Actions

The initial scan reported seven open issues. The examples below are three genuine findings from the SonarQube issue API. They are review items, not confirmed exploitable defects; review the code context before changing application behavior. No fixes have been applied.

| Rule / severity | Location | Finding | Proportionate improvement action |
|---|---|---|---|
| `javascript:S5122` / MAJOR; vulnerability | `server/server.js:14` | SonarQube warns that the current CORS setup may be too permissive. | Confirm which frontend origins must call the API, then configure an explicit allowlist if cross-origin access is required. Re-run relevant browser/API checks after any change. |
| `javascript:S5689` / MINOR; vulnerability | `server/server.js:10` | Express may disclose its framework/version through the default `X-Powered-By` response header. | Consider disabling that header with Express's supported setting, then verify the response headers. |
| `javascript:S8786` / MAJOR; code smell | `server/config/db.js:6` and `server/models/User.js:17` | The database-error sanitization and email-validation regular expressions are flagged for possible super-linear backtracking. | Review the patterns and replace them with simpler expressions or bounded validation where equivalent. Add focused tests before changing validation behavior. |

The remaining four issues are three `javascript:S9383` bug findings concerning promises that are not explicitly awaited or marked as intentionally ignored: `server/scripts/seedAdmin.js:48`, `server/scripts/seedEquipment.js:125`, and `server/server.js:50`. Inspect each call site's existing error handling before selecting a fix.

Counts from the retrieved project snapshot: 3 bugs, 2 vulnerabilities, and 2 code smells. These finding totals agree with the seven open issues returned by the issue-search API. Findings have not been marked resolved, and no post-fix scan has been run.
