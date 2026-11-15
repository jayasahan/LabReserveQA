# Section 5: Non-Functional Testing and Defect Management

**Lead Author:** Member 4  
**Contributing Author (Usability):** Member 2  
**Module:** EC4206 – Software Testing and Quality Assurance  
**Department:** Department of Electrical and Information Engineering, University of Ruhuna  
**Software Under Test:** LabReserve – Laboratory Equipment Management System  
**Baseline Commit:** `99dcd09`  

---

## 5.1 Performance Testing (Apache JMeter)

### 5.1.1 Objective and Scope
The primary objective of performance testing was to evaluate the responsiveness, stability, and throughput of the LabReserve backend under concurrent user loads. In accordance with assignment section 3.7 (LO-2, LO-4), load testing was executed on a core authenticated business endpoint:
- **Target Endpoint:** `GET /api/equipment`
- **Target Service:** Equipment catalog listing and availability retrieval
- **Protocol:** HTTP/1.1 REST JSON API
- **Authentication Method:** JWT Bearer Token (dynamically acquired via `POST /api/auth/login`)

### 5.1.2 Test Environment and Configuration
- **Operating System:** Windows 10/11 x64
- **Runtime Environment:** Node.js v24.11.1 / Express.js v5.2.1
- **Database Engine:** MongoDB Atlas (Cloud Cluster M0)
- **Load Testing Tool:** Apache JMeter 5.6.3
- **Test Plan Artifact:** [`qa/nonfunctional/jmeter/labreserve-equipment-load-test.jmx`](../nonfunctional/jmeter/labreserve-equipment-load-test.jmx)

### 5.1.3 Workload Design and Load Profiles
To simulate realistic human interaction and prevent instantaneous connection floods from skewing connection establishment metrics, each virtual thread was configured with:
1. **Authentication Pre-step:** Call `POST /api/auth/login` with valid student credentials (`amal@gmail.com` / `amal123`).
2. **JSON Extractor:** Extract signed JWT token from response path `$.token`.
3. **HTTP Header Manager:** Dynamically attach `Authorization: Bearer ${authToken}` and `Content-Type: application/json`.
4. **Think Time:** Gaussian Random Timer configured with a 1,000 ms – 3,000 ms delay between iterations.
5. **Assertions:** Response Code Assertion (`200 OK`) and JSON Response Body Assertion verifying `$.equipment` array presence.

The testing evaluated three distinct progressive load profiles following a pilot verification run:

| Profile ID | Target Endpoint | Virtual Users (Threads) | Ramp-Up Period | Steady-State Duration | Iterations | Purpose |
|---|---|---:|---:|---:|---|---|
| **PERF-PILOT-001** | `GET /api/equipment` | 1 | 10 sec | 30 sec | 10 samples | Smoke validation of script, token extraction, assertions |
| **PERF-FINAL-001** | `GET /api/equipment` | 1 | 30 sec | 120 sec | Continuous | Single-user baseline measurement |
| **PERF-FINAL-010** | `GET /api/equipment` | 10 | 30 sec | 120 sec | Continuous | Moderate concurrency simulating normal lab browsing |
| **PERF-FINAL-025** | `GET /api/equipment` | 25 | 30 sec | 120 sec | Continuous | Peak laboratory registration rush / stress load |

### 5.1.4 Performance Evaluation Criteria
The QA team established provisional internal performance benchmarks prior to test execution:
- **Error Rate Target:** $< 1.00\%$ HTTP errors under all tested loads.
- **Latency Target:** 95th Percentile ($p95$) latency $< 1,000\text{ ms}$ for normal and peak concurrency.

### 5.1.5 Execution Results and Metric Comparison

| Run ID | Users | Total Samples | Equipment Samples | Avg Latency | Median Latency | 90% Line | 95% Line ($p95$) | Max Latency | Throughput | Error % | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|:---:|
| **PERF-FINAL-001** | 1 | 126 | 63 | 189 ms | 178 ms | 239 ms | **273 ms** | 461 ms | 0.04185/s | **0.00%** | **PASS** |
| **PERF-FINAL-010** | 10 | 1,002 | 497 | 207 ms | 191 ms | 262 ms | **304 ms** | 1,033 ms | 0.27032/s | **0.00%** | **PASS** |
| **PERF-FINAL-025** | 25 | 2,975 | 1,478 | 319 ms | 244 ms | 487 ms | **641 ms** | 1,397 ms | 0.70657/s | **0.00%** | **PASS** |

*Raw data and aggregate logs: [`qa/nonfunctional/jmeter/final/`](../nonfunctional/jmeter/final/)*

### 5.1.6 Performance Analysis and Observations
1. **Error Tolerance:** Across 4,103 total HTTP sampler transactions (including login handshakes and catalog queries), **0 errors were recorded (0.000% error rate)**.
2. **Latency Scaling:** As concurrent threads scaled from 1 to 25 users, average latency increased modestly from $189\text{ ms}$ to $319\text{ ms}$ ($+68.7\%$), while $p95$ latency grew from $273\text{ ms}$ to $641\text{ ms}$ ($+134.8\%$). Both figures remained comfortably beneath the team's $1,000\text{ ms}$ performance threshold.
3. **Throughput Scaling:** Equipment request throughput scaled linearly from $0.04185\text{ req/s}$ (single user with think time) to $0.70657\text{ req/s}$ at 25 concurrent users, demonstrating that the single-threaded Node.js event loop did not become bottlenecked by database I/O under this workload.
4. **Tail Latency:** The single maximum response time recorded was $1,397\text{ ms}$ during the 25-user stress run. This spike is attributed to TLS handshake negotiation with MongoDB Atlas under sudden thread burst rather than server CPU exhaustion.

### 5.1.7 Non-Functional Testing Limitations
- **Local Client vs. Distributed Architecture:** Tests were executed from a local machine targeting a local Express instance communicating with cloud MongoDB. Network latency, SSL termination proxies, and browser rendering engines were excluded from this JMeter scope.
- **Single Endpoint Focus:** The workload prioritized `GET /api/equipment`. State-mutating routes (`POST /api/requests`) require serialized database transactions and will exhibit lower concurrency saturation limits.

---

## 5.2 Security Testing (OWASP Top 10 API)

### 5.2.1 Scope and Objective
In accordance with assignment section 3.7, security testing evaluated the LabReserve API against critical vulnerabilities defined in the **OWASP Top 10 API Security Risks**, focusing specifically on:
1. **OWASP A07 / API2:2023 – Identification and Authentication Failures:** Verifying token validation, session expiration handling, and credential constraints.
2. **OWASP A01 / API1:2023 – Broken Access Control:** Verifying that role hierarchies (Student vs. Admin) and object-level ownership (cross-student data isolation) are strictly enforced by backend routes.

### 5.2.2 Security Test Case Matrix

| Test ID | Vulnerability Focus | Test Account / Role | Target Action | HTTP Method & Route | Expected Result | Actual Result | Status | Evidence Artifact |
|---|---|---|---|---|---|---|:---:|---|
| **SEC-AUTH-001** | OWASP A07: Missing Auth Token | Unauthenticated (Anonymous) | Fetch equipment without token | `GET /api/equipment` | `401 Unauthorized` | `401 Unauthorized` | **PASS** | [`SEC-AUTH-001-missing-token.png`](../nonfunctional/security/SEC-AUTH-001-missing-token.png) |
| **SEC-AUTH-002** | OWASP A07: Tampered / Invalid Token | Forged Token | Fetch equipment with invalid signature | `GET /api/equipment` | `401 Unauthorized` | `401 Unauthorized` | **PASS** | [`SEC-AUTH-002-invalid-token.png`](../nonfunctional/security/SEC-AUTH-002-invalid-token.png) |
| **SEC-AUTH-003** | OWASP A07: Password Boundary Bypass | Unauthenticated | Register with 1-character password (`"1"`) | `POST /api/auth/register` | `400 Bad Request` | `201 Created` (Token issued) | **FAIL (DEF-001)** | [`SEC-AUTH-003 Password Boundary Validation.png`](../nonfunctional/security/SEC-AUTH-003%20Password%20Boundary%20Validation.png) |
| **SEC-AUTH-004** | API Contract / Schema Boundary | Unauthenticated | Register with invalid schema (`name: "A"`, malformed email) | `POST /api/auth/register` | `400 Bad Request` | `500 Internal Server Error` | **FAIL (DEF-002)** | [`DEF-002 Registration Validation Error Returns HTTP 500 Instead of HTTP 400.png`](../defects/evidence/DEF-002%20Registration%20Validation%20Error%20Returns%20HTTP%20500%20Instead%20of%20HTTP%20400.png) |
| **SEC-BAC-001** | OWASP A01: Broken Access Control (RBAC) | Authenticated Student | Student attempts to create equipment | `POST /api/equipment` | `403 Forbidden` | `403 Forbidden` | **PASS** | [`SEC-BAC-001-student-admin-action.png`](../nonfunctional/security/SEC-BAC-001-student-admin-action.png) |
| **SEC-BAC-002** | OWASP A01: Broken Object Level Auth (BOLA) | Authenticated Student B | Student B attempts to cancel Student A's request | `PATCH /api/requests/:id/cancel` | `403 Forbidden` | `403 Forbidden` | **PASS** | [`SEC-BAC-002-cross-student-cancel.png`](../nonfunctional/security/SEC-BAC-002-cross-student-cancel.png) |

### 5.2.3 Security Findings Analysis
1. **Access Control Enforcement:** LabReserve demonstrates robust defense against privilege escalation. Role-based checks (`requireAdmin` middleware) successfully prevent students from invoking administrative mutations (`POST /api/equipment`). Crucially, object-level access control (`request.student.toString() !== req.user._id.toString()`) blocks cross-tenant tampering, ensuring students cannot cancel or hijack peers' reservations.
2. **Authentication Boundary Vulnerabilities:** Manual negative testing uncovered two notable defects on the public registration boundary:
   - **`DEF-001`:** Passwords shorter than 6 characters are accepted by the server because password hashing executes prior to Mongoose model validation.
   - **`DEF-002`:** Schema validation failures generate unhandled exceptions that return HTTP 500 rather than informative HTTP 400 client errors.

---

## 5.3 Usability Evaluation Summary

*Coordinated in partnership with Member 2 (Usability Lead).*

### 5.3.1 Scope and Approach
Usability evaluation applied heuristic evaluation and task-based cognitive walkthroughs on the desktop and mobile layouts:
- **Task 1:** Browse catalog, filter by category (`Electronics`, `Networking`), and inspect item availability.
- **Task 2:** Submit an equipment reservation and verify immediate feedback.
- **Task 3:** Track active reservations under "My Requests" and cancel a pending item.

### 5.3.2 Positive Observations
- **Visual Status Hierarchy:** Color-coded status badges (`AVAILABLE` in green, `REQUESTED` in yellow, `BORROWED` in blue) provide immediate affordance regarding whether an item can be claimed.
- **Atomic Concurrency Feedback:** When an item is claimed by another user, the frontend transitions dynamically to display `"Equipment is no longer available."` without requiring a manual page refresh.
- **Responsive Navigation:** The dedicated mobile navigation bar provides thumb-friendly switching between catalog and personal requests on small viewports.

### 5.3.3 Usability Defects and Limitations Noted
- **Admin Sign-In Link Loop:** On the public login page (`/`), clicking `"Admin sign in"` navigates to `/admin`. Because the user is unauthenticated, the route guard immediately redirects back to `/` with no prompt or message, confusing administrators into thinking the button is broken.
- **No Confirmation Dialog on Deletion:** In the Admin equipment table, clicking `"Delete"` immediately triggers permanent deletion without a confirmation modal.

---

## 5.4 Defect Tracking and Defect Management

### 5.4.1 Defect Tracking Workflow
In accordance with assignment section 3.8 and Scrum QA best practices, all discovered bugs were tracked through a formalized 5-stage lifecycle using **GitHub Issues** (`jayasahan/LabReserveQA`) and mirrored in the project Defect Register:

$$\textbf{New} \xrightarrow{\quad\text{Triaged \& Assigned}\quad} \textbf{Assigned} \xrightarrow{\quad\text{Code Fix Pushed}\quad} \textbf{Fixed} \xrightarrow{\quad\text{Independent Retest}\quad} \textbf{Verified} \xrightarrow{\quad\text{QA Acceptance}\quad} \textbf{Closed}$$

### 5.4.2 Severity and Priority Matrix

| Level | Severity (Technical & Business Impact) | Priority (Resolution Urgency) |
|---|---|---|
| **High** | Critical security policy violation, privilege bypass, or application crash. | Immediate fix required prior to sprint exit or demonstration. |
| **Medium** | Functional error or API contract violation with identifiable workaround. | Schedule fix within current sprint. |
| **Low** | Minor cosmetic, wording, or non-blocking navigation defect. | Document as known limitation if time constrained. |

### 5.4.3 Defect Register Summary

| Defect ID | Issue Key | Title | Severity | Priority | Status | Assignee | Discovered | Resolution |
|---|---|---|:---:|:---:|:---:|---|:---:|---|
| **DEF-001** | [GH #1](https://github.com/jayasahan/LabReserveQA/issues/1) | Password minimum length requirement (6 chars) bypassed during student registration | High | High | **Closed** | Jayasahan (Dev) | 2026-10-14 | Fixed in `e18fa87` (PR #4) |
| **DEF-002** | [GH #2](https://github.com/jayasahan/LabReserveQA/issues/2) | Registration schema validation failure returns HTTP 500 instead of HTTP 400 | Medium | Medium | **Closed** | Jayasahan (Dev) | 2026-10-15 | Fixed in `4aea226` (PR #5) |

### 5.4.4 Defect Density Metric (Handoff to Member 1)
To support Member 1's Quality Metrics analysis in Section 3.9:
- **Tested Codebase Scope:** Non-generated JavaScript/React source files.
- **Server Code:** 15 files, 882 lines of code.
- **Client Code:** 25 files, 1,923 lines of code.
- **Total KLOC ($K$):** $2,805\text{ lines} = 2.805\text{ KLOC}$.
- **Confirmed Unique Defects ($D$):** 2 defects (`DEF-001`, `DEF-002`).
- **Defect Density:**
  $$\text{Defect Density} = \frac{D}{K} = \frac{2}{2.805\text{ KLOC}} \approx \mathbf{0.713\text{ defects / KLOC}}$$
- **Resolution Rate:** 100% (2 / 2 defects fixed, independently verified, and closed).

---

## 5.5 Full Defect Lifecycle Case Studies

### 5.5.1 Case Study 1: DEF-001 (Password Length Bypass)
- **Defect Identifier:** `DEF-001` / GitHub Issue #1
- **Severity / Priority:** High / High
- **Originating Test Case:** `SEC-AUTH-003`

#### Lifecycle Progression:
1. **Stage 1 – New (2026-10-14 23:01):**  
   Member 4 identified that submitting payload `{"name":"security.student.d","email":"security.student.d@example.com","password":"1"}` to `POST /api/auth/register` returned `201 Created` with a valid JWT token. Logged to GitHub Issues with reproduction steps and screenshot:
   - *Evidence:* [`qa/defects/evidence/DEF-001-stage-1-new.png`](../defects/evidence/DEF-001-stage-1-new.png)
2. **Stage 2 – Assigned (2026-10-14 23:39):**  
   Triaged by QA and assigned to backend developer Jayasahan. Root cause documented: password hashed with bcrypt before Mongoose validation occurs.
   - *Evidence:* [`qa/defects/evidence/DEF-001-stage-2-assigned.png`](../defects/evidence/DEF-001-stage-2-assigned.png)
3. **Stage 3 – Fixed (2026-10-26 19:50):**  
   Developer Jayasahan added pre-hashing validation `if (typeof password !== 'string' || password.length < 6)` in `server/controllers/authController.js` and opened PR #4 ("Fix registration password length validation #4"), merged into `main` (commit `e18fa87`).
   - *Evidence:* [`qa/defects/evidence/DEF-001-stage-3-fix.png`](../defects/evidence/DEF-001-stage-3-fix.png)
4. **Stage 4 – Verified (2026-11-15 10:25):**  
   Independent retest by Member 4 in Postman with boundary value `"1"`. The API cleanly returned HTTP `400 Bad Request` with `{"message": "Password must be at least 6 characters"}`. Retest PASSED.
   - *Evidence:* [`qa/defects/evidence/DEF-001-stage-4-retest.png`](../defects/evidence/DEF-001-stage-4-retest.png)
5. **Stage 5 – Closed (2026-11-15 10:46):**  
   Formal verification complete; GitHub Issue #1 confirmed and transitioned to Closed.
   - *Evidence:* [`qa/defects/evidence/DEF-001-stage-5-closed.png`](../defects/evidence/DEF-001-stage-5-closed.png)

---

### 5.5.2 Case Study 2: DEF-002 (HTTP 500 on Schema Validation)
- **Defect Identifier:** `DEF-002` / GitHub Issue #2
- **Severity / Priority:** Medium / Medium
- **Originating Test Case:** `SEC-AUTH-004`

#### Lifecycle Progression:
1. **Stage 1 – New (2026-10-15 00:10):**  
   Member 4 tested boundary payload `{"name":"A","email":"not-a-valid-email","password":"validPassword123"}`. The API responded with `500 Internal Server Error` instead of `400 Bad Request`.
   - *Evidence:* [`qa/defects/evidence/DEF-002-stage-1-new.png`](../defects/evidence/DEF-002-stage-1-new.png)
2. **Stage 2 – Assigned (2026-10-15 00:25):**  
   Issue created on GitHub and assigned to developer Jayasahan. Root cause: unhandled Mongoose `ValidationError` in `authController.js` catch block.
   - *Evidence:* [`qa/defects/evidence/DEF-002-stage-2-assigned.png`](../defects/evidence/DEF-002-stage-2-assigned.png)
3. **Stage 3 – Fixed (2026-10-26 20:21):**  
   Developer Jayasahan added `if (error.name === 'ValidationError')` block in `server/controllers/authController.js` returning HTTP 400 with the first validation message. Merged via PR #5 (commit `4aea226`).
   - *Evidence:* [`qa/defects/evidence/DEF-002-stage-3-fix.png`](../defects/evidence/DEF-002-stage-3-fix.png)
4. **Stage 4 – Verified (2026-11-15 10:25):**  
   Independent retest by Member 4 in Postman with invalid payload (`name: "A"`). The API returned HTTP `400 Bad Request` with `{"message": "Name must be at least 2 characters"}`. Retest PASSED.
   - *Evidence:* [`qa/defects/evidence/DEF-002-stage-4-retest.png`](../defects/evidence/DEF-002-stage-4-retest.png)
5. **Stage 5 – Closed (2026-11-15 10:46):**  
   Formal verification complete; GitHub Issue #2 confirmed and transitioned to Closed.
   - *Evidence:* [`qa/defects/evidence/DEF-002-stage-5-closed.png`](../defects/evidence/DEF-002-stage-5-closed.png)

---

## 5.6 Root Cause Analyses (RCA)

### 5.6.1 RCA-001: Pre-Validation Credential Hashing
- **Defect Associated:** `DEF-001`
- **Component:** `server/controllers/authController.js` (lines 36–37)

```
[Raw Password: "1"] ──► [bcrypt.hash("1", 10)] ──► [60-Char Hash: "$2a$10$..."] ──► [User.create()] ──► [Mongoose minlength: 6 (PASSES)]
```

- **Observed Impact:** Trivial passwords permitted, defeating account security and violating OWASP A07.
- **Root Cause:** In JavaScript Mongoose architectures, schema-level validation executes when `Model.create()` or `document.save()` is called. In `authController.js`, `password` was hashed before model instantiation:
  ```javascript
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, password: hashedPassword, role: 'STUDENT' })
  ```
  Because a bcrypt hash is unconditionally 60 characters long, Mongoose evaluated $60 \ge 6$, which always evaluates to true.
- **Why It Escaped:** The React frontend form implemented client-side `minLength="6"`, masking the backend deficiency during standard UI manual walkthroughs.
- **Corrective Fix:** Enforce raw string length validation before hashing:
  ```javascript
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }
  ```
- **Architectural Prevention:** Establish input validation middleware (e.g. Joi or express-validator) executed prior to controller business logic.

---

### 5.6.2 RCA-002: Missing Domain Error Mapping in Controller Catch Block
- **Defect Associated:** `DEF-002`
- **Component:** `server/controllers/authController.js` (lines 41–47)
- **Observed Impact:** Normal client data entry errors crash the endpoint with HTTP 500, obscuring field-level correction feedback.
- **Root Cause:** Unlike `equipmentController.js` and `requestController.js`, which both inspect `if (error.name === 'ValidationError')`, `authController.js` only trapped MongoDB code `11000` (duplicate key). All other rejections cascaded into the generic 500 error handler.
- **Why It Escaped:** Early tests prioritized happy paths and duplicate email conflicts (`409 Conflict`), omitting malformed negative payloads.
- **Corrective Fix:**
  ```javascript
  if (error.name === 'ValidationError') {
    const firstMessage = Object.values(error.errors)[0]?.message || 'Please provide valid registration details'
    return res.status(400).json({ message: firstMessage })
  }
  ```
- **Architectural Prevention:** Centralize Express error handling into an application-wide middleware to ensure consistent error-to-status mapping across all route modules.

---

## 5.7 Member 4 Agile / DevOps Reflection

Testing non-functional aspects and managing defects within an iterative Scrum framework yielded several concrete takeaways for modern software delivery:

1. **The Fallacy of Client-Side Validation as a Security Control:**  
   The discovery of `DEF-001` underscored that frontend validation (e.g. HTML `minLength="6"`) only enhances user experience—it provides zero security guarantees. Independent API testing using Postman proved essential for validating the true boundary of the system.
2. **Shift-Left Defect Triage:**  
   Identifying and logging defects (`DEF-001`, `DEF-002`) during Sprint 1 with complete reproduction steps, exact payloads, and root cause hints enabled the development team to schedule fixes immediately without delaying final integration.
3. **Reproducible Load Testing Over Speculation:**  
   Establishing a parameterized JMeter plan with dynamic token extraction proved that the system easily accommodates 25 concurrent student reservations ($p95 < 650\text{ ms}$). This replaced subjective performance guesses with empirical, reproducible evidence.
4. **Traceability as a Quality Driver:**  
   Connecting test cases (`SEC-AUTH-003`) directly to GitHub issues (`#1`) and commit hashes ensured transparent accountability across the entire QA lifecycle.
