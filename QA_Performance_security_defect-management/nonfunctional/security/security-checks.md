# Manual Security Checks

## Scope

Manual checks focus on OWASP-style authentication and broken access control risks in the LabReserve API.

API base URL: `http://localhost:5000`

## Security Test Matrix

| Test ID | OWASP Area | Identity | Target Action | Endpoint | Expected Result | Initial Result | Status | Final Retest Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| SEC-AUTH-001 | OWASP A07 Identification and Authentication Failures | Anonymous | Load equipment without token | `GET /api/equipment` | 401 Authentication required | 401 Authentication required | Pass | Pass | `qa/nonfunctional/security/SEC-AUTH-001-missing-token.png` |
| SEC-AUTH-002 | OWASP A07 Identification and Authentication Failures | Invalid token | Load equipment with invalid token | `GET /api/equipment` | 401 Invalid or expired token | 401 Invalid or expired token | Pass | Pass | `qa/nonfunctional/security/SEC-AUTH-002-invalid-token.png` |
| SEC-AUTH-003 | OWASP A07 Identification and Authentication Failures | Anonymous | Register with 1-character password (`"1"`) | `POST /api/auth/register` | 400 Password must be at least 6 characters | 201 Created (token issued) | Fail (DEF-001) | **Pass** (Fixed in `e18fa87`) | `qa/nonfunctional/security/SEC-AUTH-003 Password Boundary Validation.png` |
| SEC-AUTH-004 | API Contract & Schema Error Handling | Anonymous | Register with invalid schema (`name: "A"`, invalid email) | `POST /api/auth/register` | 400 Bad Request with validation message | 500 Internal Server Error | Fail (DEF-002) | **Pass** (Fixed in `4aea226`) | `qa/defects/evidence/DEF-002 Registration Validation Error Returns HTTP 500 Instead of HTTP 400.png` |
| SEC-BAC-001 | OWASP A01 Broken Access Control | Student | Create equipment | `POST /api/equipment` | 403 Admin access required | 403 Admin access required | Pass | Pass | `qa/nonfunctional/security/SEC-BAC-001-student-admin-action.png` |
| SEC-BAC-002 | OWASP A01 Broken Access Control | Student B | Cancel Student A request | `PATCH /api/requests/:id/cancel` | 403 You can only cancel your own requests | 403 You can only cancel your own requests | Pass | Pass | `qa/nonfunctional/security/SEC-BAC-002-cross-student-cancel.png` |

## Summary

Out of six manual security and boundary checks, four passed initially and two uncovered significant defects:
- **Passed**: LabReserve correctly rejected unauthenticated requests (SEC-AUTH-001), invalid-token requests (SEC-AUTH-002), student access to admin equipment creation (SEC-BAC-001), and cross-student cancellation of another student's request (SEC-BAC-002).
- **Initial Failures**:
  - **SEC-AUTH-003 (`DEF-001`)**: Submitting a registration request with a single-character password (`"1"`) returned HTTP 201 with an authentication token, bypassing the 6-character password policy due to pre-validation hashing.
  - **SEC-AUTH-004 (`DEF-002`)**: Submitting invalid schema parameters (`name: "A"`, malformed email) triggered an unhandled Mongoose `ValidationError`, returning HTTP 500 instead of HTTP 400.
- **Post-Fix Retest**:
  - Both defects were triaged, assigned to developer Jayasahan on GitHub Issues (#1 and #2), and resolved via PR #4 (`e18fa87`) and PR #5 (`4aea226`).
  - Independent retesting confirmed both endpoints return HTTP 400 Bad Request with explicit validation messages. All six checks are now **PASS** in the final build (100% resolution rate).

## Report Note

Manual security testing focused on OWASP A01 Broken Access Control and OWASP A07 Identification and Authentication Failures because LabReserve relies on JWT authentication, role-based authorization, and request ownership checks. Testing also applied Boundary Value Analysis (BVA) on credential fields to confirm whether password length constraints defined in domain schemas are genuinely enforced at the API boundary.

## Evidence Details for SEC-AUTH-003 (Defect DEF-001)

- **Test ID**: `SEC-AUTH-003`
- **Related Defect**: `DEF-001` (GitHub Issue #1, PR #4)
- **Method & Endpoint**: `POST http://localhost:5000/api/auth/register`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "security.student.d",
    "email": "security.student.d@example.com",
    "password": "1"
  }
  ```
- **Initial Response Status**: `201 Created`
- **Initial Response Body**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "670d5e1...",
      "name": "security.student.d",
      "email": "security.student.d@example.com",
      "role": "STUDENT"
    }
  }
  ```
- **Expected Outcome**: HTTP `400 Bad Request` with message `Password must be at least 6 characters`.
- **Initial Outcome**: HTTP `201 Created` with valid JWT token; user registered into database with 1-character password.
- **Initial Evidence Screenshot**: [`qa/nonfunctional/security/SEC-AUTH-003 Password Boundary Validation.png`](SEC-AUTH-003%20Password%20Boundary%20Validation.png)
- **Retest on Commit `e18fa87`**: HTTP `400 Bad Request` with `{"message": "Password must be at least 6 characters"}`.
- **Retest Evidence Screenshot**: [`qa/defects/evidence/DEF-001-stage-4-retest.png`](../../defects/evidence/DEF-001-stage-4-retest.png)
- **Status**: **VERIFIED & CLOSED**

## Evidence Details for SEC-AUTH-004 (Defect DEF-002)

- **Test ID**: `SEC-AUTH-004`
- **Related Defect**: `DEF-002` (GitHub Issue #2, PR #5)
- **Method & Endpoint**: `POST http://localhost:5000/api/auth/register`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "A",
    "email": "not-a-valid-email",
    "password": "validPassword123"
  }
  ```
- **Initial Response Status**: `500 Internal Server Error`
- **Initial Response Body**:
  ```json
  {
    "message": "Unable to register at this time"
  }
  ```
- **Expected Outcome**: HTTP `400 Bad Request` with message `Name must be at least 2 characters`.
- **Initial Outcome**: HTTP `500 Internal Server Error` due to unhandled Mongoose `ValidationError`.
- **Initial Evidence Screenshot**: [`qa/defects/evidence/DEF-002 Registration Validation Error Returns HTTP 500 Instead of HTTP 400.png`](../../defects/evidence/DEF-002%20Registration%20Validation%20Error%20Returns%20HTTP%20500%20Instead%20of%20HTTP%20400.png)
- **Retest on Commit `4aea226`**: HTTP `400 Bad Request` with `{"message": "Name must be at least 2 characters"}`.
- **Retest Evidence Screenshot**: [`qa/defects/evidence/DEF-002-stage-4-retest.png`](../../defects/evidence/DEF-002-stage-4-retest.png)
- **Status**: **VERIFIED & CLOSED**



