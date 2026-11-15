# Performance Test Summary

## Objective

The objective was to evaluate the LabReserve equipment listing API under controlled local load using JMeter. The test focused on authenticated access to `GET /api/equipment`.

## Test Design

Each virtual user first called `POST /api/auth/login`, extracted the JWT token from `$.token`, then called `GET /api/equipment` with `Authorization: Bearer ${authToken}`.

Final load profiles:

| Run ID | Users | Ramp-Up | Duration | Endpoint Under Test |
|---|---:|---:|---:|---|
| PERF-FINAL-001 | 1 | 30 sec | 2 min | `GET /api/equipment` |
| PERF-FINAL-010 | 10 | 30 sec | 2 min | `GET /api/equipment` |
| PERF-FINAL-025 | 25 | 30 sec | 2 min | `GET /api/equipment` |

## Results

| Run ID | Users | Equipment Samples | Avg Latency | p95 Latency | Max Latency | Throughput | Error % | Result |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| PERF-FINAL-001 | 1 | 63 | 189 ms | 273 ms | 461 ms | 0.04185/sec | 0.000% | Pass |
| PERF-FINAL-010 | 10 | 497 | 207 ms | 304 ms | 1033 ms | 0.27032/sec | 0.000% | Pass |
| PERF-FINAL-025 | 25 | 1478 | 319 ms | 641 ms | 1397 ms | 0.70657/sec | 0.000% | Pass |

## Findings

The equipment listing endpoint completed all final local load profiles with 0.000% errors. The provisional team target was an error rate below 1% and p95 latency below 1 second. The endpoint met both targets for the 1-user, 10-user, and 25-user runs.

Latency increased as concurrent users increased, which is expected. The p95 latency rose from 273 ms at 1 user to 641 ms at 25 users, but remained below the 1-second target. The highest individual equipment-listing response time was 1397 ms during the 25-user run, so the report should mention that occasional slower responses occurred even though the p95 remained acceptable.

## Limitations

These results were collected in a local test environment, so they should not be presented as production capacity results. The test used a limited dataset and one primary endpoint. Browser rendering, frontend behavior, database hosting conditions, and wider network latency were outside the scope of this JMeter run.

