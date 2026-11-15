# Defect Register

## Workflow

Use this lifecycle:

`New -> Assigned -> Fixed -> Verified -> Closed`

Reopen the defect if retesting fails.

## Severity Guide

| Severity | Meaning |
|---|---|
| Critical | App unusable, data loss, or serious security issue |
| High | Major feature broken or important security/control failure |
| Medium | Important issue with workaround |
| Low | Minor message, UI, or documentation issue |

## Priority Guide

| Priority | Meaning |
|---|---|
| High | Must fix before final submission/demo |
| Medium | Fix if time allows |
| Low | Document as known limitation |

## Register

| Defect ID | Title | Found By | Date | Build/Commit | Related Test Case | Severity | Priority | Status | Evidence | Assigned To | Fix Commit | Retest Result | Verified By | Closure Date |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DEF-001 | Password minimum length requirement (6 chars) bypassed during student registration | Member 4 | 2026-10-14 | 99dcd09 | SEC-AUTH-003 | High | High | Closed | `qa/defects/evidence/DEF-001-stage-1-new.png` .. `DEF-001-stage-5-closed.png` | Jayasahan (Backend Developer) | e18fa87 (PR #4) | Pass (HTTP 400) | Member 4 | 2026-10-26 |
| DEF-002 | Registration schema validation failure returns HTTP 500 instead of HTTP 400 | Member 4 | 2026-10-15 | 99dcd09 | SEC-AUTH-004 | Medium | Medium | Closed | `qa/defects/evidence/DEF-002-stage-1-new.png` .. `DEF-002-stage-5-closed.png` | Jayasahan (Backend Developer) | 4aea226 (PR #5) | Pass (HTTP 400) | Member 4 | 2026-10-26 |

## Defect Details

### DEF-001: Password Minimum Length Requirement Bypassed During Student Registration

```text
Defect ID: DEF-001
Issue Tracker: GitHub Issue #1 (https://github.com/jayasahan/LabReserveQA/issues/1)
Pull Request: GitHub PR #4 (https://github.com/jayasahan/LabReserveQA/pull/4)
Title: Password minimum length requirement (6 chars) bypassed during student registration
Found by: Member 4
Date: 2026-10-14
Build/commit: 99dcd09 (HEAD)
Related test case: SEC-AUTH-003 (OWASP A07 / BVA Password Boundary)
Severity: High (Critical security policy bypass; permits trivial passwords)
Priority: High (Must fix before final release)
Status: Closed
Environment: Local staging / Node.js Express server on http://localhost:5000, MongoDB Atlas, Postman
Steps to reproduce:
  1. Open Postman or API client.
  2. Send a POST request to http://localhost:5000/api/auth/register with header 'Content-Type: application/json'.
  3. Provide request body with a password shorter than 6 characters:
     {
       "name": "security.student.d",
       "email": "security.student.d@example.com",
       "password": "1"
     }
  4. Observe response status code and body.
Expected result:
  HTTP 400 Bad Request with JSON error message: "Password must be at least 6 characters".
  Registration should be rejected and no user document created in database.
Actual result:
  HTTP 201 Created with JSON response containing a signed JWT token and public user object:
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "...",
      "name": "security.student.d",
      "email": "security.student.d@example.com",
      "role": "STUDENT"
    }
  }
  The user is successfully stored in the database with a 1-character password.
Evidence:
  - Discovery: qa/defects/evidence/DEF-001 Password Boundary Validation.png
  - Stage 1 (New): qa/defects/evidence/DEF-001-stage-1-new.png
  - Stage 2 (Assigned): qa/defects/evidence/DEF-001-stage-2-assigned.png
  - Stage 3 (Fixed): qa/defects/evidence/DEF-001-stage-3-fix.png
  - Stage 4 (Verified): qa/defects/evidence/DEF-001-stage-4-retest.png
  - Stage 5 (Closed): qa/defects/evidence/DEF-001-stage-5-closed.png
Assigned to: Jayasahan (Backend Developer)
Fix commit: e18fa87 ("Fix registration password length validation", merged via PR #4: 9e16dd3)
Retest result: Pass (HTTP 400 Bad Request returned: {"message": "Password must be at least 6 characters"})
Verified by: Member 4
Closure date: 2026-10-26
```

### DEF-002: Registration Schema Validation Failure Returns HTTP 500 Instead of HTTP 400

```text
Defect ID: DEF-002
Issue Tracker: GitHub Issue #2 (https://github.com/jayasahan/LabReserveQA/issues/2)
Pull Request: GitHub PR #5 (https://github.com/jayasahan/LabReserveQA/pull/5)
Title: Registration schema validation failure returns HTTP 500 instead of HTTP 400
Found by: Member 4
Date: 2026-10-15
Build/commit: 99dcd09 (HEAD)
Related test case: SEC-AUTH-004 (API Error Handling & Schema Boundary Validation)
Severity: Medium (API contract violation; obscures validation feedback as internal server error)
Priority: Medium (Fix to align with REST error handling standards)
Status: Closed
Environment: Local staging / Node.js Express server on http://localhost:5000, MongoDB Atlas, Postman
Steps to reproduce:
  1. Open Postman or API client.
  2. Send a POST request to http://localhost:5000/api/auth/register with header 'Content-Type: application/json'.
  3. Send an invalid payload violating Mongoose schema rules (name < 2 chars, invalid email format):
     {
       "name": "A",
       "email": "not-a-valid-email",
       "password": "validPassword123"
     }
  4. Observe response status code and response body.
Expected result:
  HTTP 400 Bad Request with descriptive JSON error message (e.g. "Name must be at least 2 characters", "Please provide a valid email").
Actual result:
  HTTP 500 Internal Server Error with generic message:
  {
    "message": "Unable to register at this time"
  }
Evidence:
  - Discovery: qa/defects/evidence/DEF-002 Registration Validation Error Returns HTTP 500 Instead of HTTP 400.png
  - Stage 1 (New): qa/defects/evidence/DEF-002-stage-1-new.png
  - Stage 2 (Assigned): qa/defects/evidence/DEF-002-stage-2-assigned.png
  - Stage 3 (Fixed): qa/defects/evidence/DEF-002-stage-3-fix.png
  - Stage 4 (Verified): qa/defects/evidence/DEF-002-stage-4-retest.png
  - Stage 5 (Closed): qa/defects/evidence/DEF-002-stage-5-closed.png
Assigned to: Jayasahan (Backend Developer)
Fix commit: 4aea226 ("Return bad request for registration validation errors", merged via PR #5: 8235ed9)
Retest result: Pass (HTTP 400 Bad Request returned: {"message": "Name must be at least 2 characters"})
Verified by: Member 4
Closure date: 2026-10-26
```


