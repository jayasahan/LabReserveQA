# Root Cause Analysis Template

## Defect Summary

- RCA ID: RCA-001
- Defect ID: DEF-001
- Title: Password minimum length requirement (6 chars) bypassed due to pre-validation password hashing
- Severity: High
- Priority: High
- Affected feature: Authentication / Student Registration (`POST /api/auth/register`)
- Build/commit found: `99dcd09`
- Build/commit fixed: `e18fa87` (merged via PR #4: `9e16dd3`)

## Observed Impact

The LabReserve backend accepted registration requests with passwords as short as a single character (e.g. `"1"`). A signed JWT token was issued and the user document was persisted to MongoDB Atlas. This directly violates the application's credential policy (passwords must be at least 6 characters) and OWASP A07 (Identification and Authentication Failures), allowing students to create trivial, easily brute-forced accounts.

## Reproduction

1. Open Postman or curl.
2. Send `POST http://localhost:5000/api/auth/register` with headers:
   `Content-Type: application/json`
3. Provide the following JSON payload:
   ```json
   {
     "name": "security.student.d",
     "email": "security.student.d@example.com",
     "password": "1"
   }
   ```
4. Observe the response: HTTP `201 Created` with a valid JWT token and user record.
5. Evidence: `qa/nonfunctional/security/SEC-AUTH-003 Password Boundary Validation.png`.

## Root Cause

In `server/controllers/authController.js` (lines 36-37):
```javascript
const hashedPassword = await bcrypt.hash(password, 10)
const user = await User.create({ name, email, password: hashedPassword, role: 'STUDENT' })
```

The controller only checked for the presence of the field (`if (!name || !email || !password)`), omitting any length check on the raw plain-text password. 

While `server/models/User.js` defines:
```javascript
password: {
  type: String,
  required: [true, 'Password is required'],
  minlength: [6, 'Password must be at least 6 characters']
}
```
Mongoose validation runs on the value passed to `User.create()`, which was `hashedPassword`. Because `bcrypt.hash()` always returns a 60-character string (e.g. `$2a$10$e8w...`), Mongoose evaluated $60 \ge 6$, which always evaluates to true. As a result, the model's `minlength: 6` validator was rendered completely ineffective.

## Why It Escaped Earlier Testing

1. **Frontend-Only Illusion**: The React frontend (`RegisterPage.jsx`) specified `minLength="6"` on the HTML password input, blocking simple UI testing from submitting short passwords and giving developers false confidence.
2. **Happy Path Bias**: Earlier development tests and seed scripts utilized valid realistic passwords (e.g. `amal123`, `password123`), leaving negative boundary cases unexecuted against the raw API.
3. **No Automated API Boundary Suite**: The test suite lacked automated negative tests targeting boundary values ($N=1, N=5$) for the registration API endpoint.

## Fix

Add explicit raw password validation in `server/controllers/authController.js` before calling `bcrypt.hash()`:
```javascript
if (typeof password !== 'string' || password.length < 6) {
  return res.status(400).json({ message: 'Password must be at least 6 characters' })
}
```

## Retest Evidence

Fix verified on 2026-11-15 following developer merge of PR #4 (commit `e18fa87`):
- **Retest Method:** Postman `POST http://localhost:5000/api/auth/register` with `password: "1"`.
- **Response Received:** HTTP `400 Bad Request` with body:
  ```json
  {
    "message": "Password must be at least 6 characters"
  }
  ```
- **Retest Status:** **PASS**. Confirmed password boundary enforcement at API layer.
- **Evidence Artifacts:**
  - Fix Commit: [`qa/defects/evidence/DEF-001-stage-3-fix.png`](../evidence/DEF-001-stage-3-fix.png)
  - Retest Passing Screenshot: [`qa/defects/evidence/DEF-001-stage-4-retest.png`](../evidence/DEF-001-stage-4-retest.png)
  - GitHub Issue Closed: [`qa/defects/evidence/DEF-001-stage-5-closed.png`](../evidence/DEF-001-stage-5-closed.png)

## Prevention

1. **Never Rely on Model Validation for Pre-Hashed Data**: Validate raw credential constraints (length, complexity, whitespace) at the controller/request validation layer before applying irreversible transformations like hashing.
2. **Backend is the Real Security Boundary**: Never assume client-side HTML validation (`minLength`, `required`) protects the backend API.
3. **Boundary Value Testing**: Always execute boundary tests ($N-1, N, N+1$) during API testing for every validated field.

---

# Root Cause Analysis 002 (RCA-002)

## Defect Summary

- RCA ID: RCA-002
- Defect ID: DEF-002
- Title: Registration schema validation failure triggers unhandled HTTP 500 Internal Server Error
- Severity: Medium
- Priority: Medium
- Affected feature: Authentication / Student Registration (`POST /api/auth/register`)
- Build/commit found: `99dcd09`
- Build/commit fixed: `4aea226` (merged via PR #5: `8235ed9`)
## Observed Impact

When a client sends malformed or invalid registration data (such as a 1-character name or an invalid email format), the API crashes with HTTP `500 Internal Server Error` and returns `{"message": "Unable to register at this time"}`. This violates standard REST API status code conventions, masks specific field validation guidance from clients, and triggers false-positive alerts in server monitoring.

## Reproduction

1. Open Postman.
2. Send `POST http://localhost:5000/api/auth/register` with headers `Content-Type: application/json`.
3. Provide the following JSON payload:
   ```json
   {
     "name": "A",
     "email": "not-a-valid-email",
     "password": "validPassword123"
   }
   ```
4. Observe the response: HTTP `500 Internal Server Error` with body:
   ```json
   {
     "message": "Unable to register at this time"
   }
   ```
5. Evidence: `qa/defects/evidence/DEF-002 Registration Validation Error Returns HTTP 500 Instead of HTTP 400.png`.

## Root Cause

In `server/controllers/authController.js` (lines 41-47):
```javascript
} catch (error) {
  if (error.code === 11000) {
    return res.status(409).json({ message: 'An account with that email already exists' })
  }

  return res.status(500).json({ message: 'Unable to register at this time' })
}
```

Unlike `equipmentController.js` (which inspects `error.name === 'ValidationError'`), `authController.js` only checks for the MongoDB duplicate key code `11000`. When Mongoose rejects invalid fields (such as `name` failing `minlength: 2` or `email` failing the regex pattern `/^\S+@\S+\.\S+$/`), it throws a `ValidationError`. Because this error type is unhandled, execution falls through to the generic 500 internal server error handler.

## Why It Escaped Earlier Testing

1. **Happy Path Bias**: Earlier development tests only verified successful registrations or duplicate email errors (`409 Conflict`).
2. **Missing Negative Schema Tests**: Negative test cases for malformed field inputs were not executed against the registration API before sprint integration.

## Fix

Add explicit Mongoose `ValidationError` handling in `server/controllers/authController.js`:
```javascript
if (error.name === 'ValidationError') {
  const firstMessage = Object.values(error.errors)[0]?.message || 'Please provide valid registration details'
  return res.status(400).json({ message: firstMessage })
}
```

## Retest Evidence

Fix verified on 2026-11-15 following developer merge of PR #5 (commit `4aea226`):
- **Retest Method:** Postman `POST http://localhost:5000/api/auth/register` with `name: "A"` and invalid email.
- **Response Received:** HTTP `400 Bad Request` with body:
  ```json
  {
    "message": "Name must be at least 2 characters"
  }
  ```
- **Retest Status:** **PASS**. Confirmed domain validation errors cleanly return HTTP 400.
- **Evidence Artifacts:**
  - Fix Commit: [`qa/defects/evidence/DEF-002-stage-3-fix.png`](../evidence/DEF-002-stage-3-fix.png)
  - Retest Passing Screenshot: [`qa/defects/evidence/DEF-002-stage-4-retest.png`](../evidence/DEF-002-stage-4-retest.png)
  - GitHub Issue Closed: [`qa/defects/evidence/DEF-002-stage-5-closed.png`](../evidence/DEF-002-stage-5-closed.png)

## Prevention

1. **Standardize API Error Handlers**: Consistently catch and map domain/ORM validation errors to HTTP 400 across all Express controllers.
2. **Negative Schema Regression Testing**: Ensure automated test collections include invalid schema payloads for all mutation routes.



