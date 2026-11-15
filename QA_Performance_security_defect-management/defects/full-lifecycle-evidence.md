# Full Defect Lifecycle Evidence

Use this file to document at least one genuine defect from discovery to closure.

## Selected Defect

- Defect ID: DEF-001
- Issue Tracker: GitHub Issue #1 (https://github.com/jayasahan/LabReserveQA/issues/1)
- Title: Password minimum length requirement (6 chars) bypassed during student registration
- Related test case: SEC-AUTH-003 (OWASP A07 & Boundary Value Analysis)
- Severity: High
- Priority: High
- Environment: Local Node.js Express API (`http://localhost:5000`) + MongoDB Atlas + Postman

## Lifecycle Timeline

| State | Date/Time | Actor | Evidence | Notes |
|---|---|---|---|---|
| **New** | 2026-10-14 23:01 | Member 4 | `qa/defects/evidence/DEF-001-stage-1-new.png`<br>`qa/nonfunctional/security/SEC-AUTH-003 Password Boundary Validation.png` | Defect logged on GitHub Issue #1 via Postman test with payload `{"name":"security.student.d","email":"security.student.d@example.com","password":"1"}`. API returned `201 Created` with signed token instead of `400 Bad Request`. |
| **Assigned** | 2026-10-14 23:39 | Jayasahan (Developer) | `qa/defects/evidence/DEF-001-stage-2-assigned.png` | Assigned to backend developer (Jayasahan). Root cause identified: password hashed with bcrypt before Mongoose validation occurs; controller lacks explicit raw password length check. |
| **Fixed** | 2026-10-26 19:50 | Jayasahan (Developer) | `qa/defects/evidence/DEF-001-stage-3-fix.png` | Developer added validation `if (typeof password !== 'string' || password.length < 6)` in `server/controllers/authController.js` before hashing. Fix merged via PR #4 (commit `e18fa87`). |
| **Verified** | 2026-11-15 10:25 | Member 4 | `qa/defects/evidence/DEF-001-stage-4-retest.png` | Independent retest by Member 4 in Postman with boundary value `"1"`. API returned `400 Bad Request` with `{"message": "Password must be at least 6 characters"}`. Retest PASSED. |
| **Closed** | 2026-11-15 10:46 | Member 4 / Jayasahan | `qa/defects/evidence/DEF-001-stage-5-closed.png` | Verified database state and confirmed fix resolution; GitHub Issue #1 transitioned to Closed. |

## Defect Summary and Discovery

During manual OWASP Top 10 testing and boundary validation of authentication endpoints, Member 4 executed `POST /api/auth/register` with boundary inputs below the minimum length threshold ($N=1$, password `"1"`). 

Although the Mongoose `User` schema specifies `minlength: [6, 'Password must be at least 6 characters']`, the controller executed `bcrypt.hash(password, 10)` prior to passing the data to `User.create()`. Since a bcrypt hash is always 60 characters long, Mongoose evaluated the 60-character hash string rather than the raw password, resulting in validation being bypassed completely.

## Retest Plan and Verification Outcome

- **Test Execution**: Sent `POST /api/auth/register` with `password: "1"`.
- **Expected Result**: `400 Bad Request` with `Password must be at least 6 characters`.
- **Actual Result**: `400 Bad Request` with `{"message": "Password must be at least 6 characters"}`.
- **Outcome**: Verified and confirmed resolved on commit `e18fa87`. Evidence: `qa/defects/evidence/DEF-001-stage-4-retest.png`.

---

## Defect 002 Lifecycle Evidence (DEF-002)

### Defect Details

- Defect ID: DEF-002
- Issue Tracker: GitHub Issue #2 (https://github.com/jayasahan/LabReserveQA/issues/2)
- Title: Registration schema validation failure returns HTTP 500 instead of HTTP 400
- Related test case: SEC-AUTH-004 (API Error Handling & Schema Boundary Validation)
- Severity: Medium
- Priority: Medium
- Environment: Local Node.js Express API (`http://localhost:5000`) + MongoDB Atlas + Postman

### Lifecycle Timeline

| State | Date/Time | Actor | Evidence | Notes |
|---|---|---|---|---|
| **New** | 2026-10-15 00:10 | Member 4 | `qa/defects/evidence/DEF-002 Registration Validation Error Returns HTTP 500 Instead of HTTP 400.png`<br>`qa/defects/evidence/DEF-002-stage-1-new.png` | Defect logged on GitHub Issue #2 via Postman test with payload `{"name":"A","email":"not-a-valid-email","password":"validPassword123"}`. API returned `500 Internal Server Error` with `{"message":"Unable to register at this time"}`. |
| **Assigned** | 2026-10-15 00:25 | Jayasahan (Developer) | `qa/defects/evidence/DEF-002-stage-2-assigned.png` | Assigned to backend developer (Jayasahan). Root cause: `authController.js` catch block lacks `ValidationError` handler, dumping Mongoose schema rejections into generic 500 handler. |
| **Fixed** | 2026-10-26 20:21 | Jayasahan (Developer) | `qa/defects/evidence/DEF-002-stage-3-fix.png` | Developer added `if (error.name === 'ValidationError')` block in `server/controllers/authController.js` returning HTTP 400 with first validation message. Fix merged via PR #5 (commit `4aea226`). |
| **Verified** | 2026-11-15 10:25 | Member 4 | `qa/defects/evidence/DEF-002-stage-4-retest.png` | Independent retest by Member 4 in Postman with invalid payload (`name: "A"`). API returned `400 Bad Request` with `{"message": "Name must be at least 2 characters"}`. Retest PASSED. |
| **Closed** | 2026-11-15 10:46 | Member 4 / Jayasahan | `qa/defects/evidence/DEF-002-stage-5-closed.png` | Verified API error response and confirmed fix resolution; GitHub Issue #2 transitioned to Closed. |

### Retest Plan and Verification Outcome

- **Test Execution**: Sent `POST /api/auth/register` with schema-invalid payload (`name: "A"`).
- **Expected Result**: `400 Bad Request` with `Name must be at least 2 characters`.
- **Actual Result**: `400 Bad Request` with `{"message": "Name must be at least 2 characters"}`.
- **Outcome**: Verified and confirmed resolved on commit `4aea226`. Evidence: `qa/defects/evidence/DEF-002-stage-4-retest.png`.



