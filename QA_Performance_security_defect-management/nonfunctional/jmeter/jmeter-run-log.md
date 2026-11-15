# JMeter Performance Test Run Log

## Test Target

- Application: LabReserve
- API base URL: `http://localhost:5000`
- Endpoint under test: `GET /api/equipment`
- Authentication required: Yes
- Tested build/commit: `99dcd09`
- Dataset description: 6 default laboratory equipment items seeded in MongoDB Atlas (e.g., Digital Oscilloscope, Function Generator, DC Power Supply, Multimeter, Soldering Station, Spectrum Analyzer)
- Machine/OS: Windows 10/11 x64
- Node/MongoDB versions: Node.js v24.11.1 / Express.js v5.2.1 / MongoDB Atlas (Cloud Cluster M0)
- JMeter version: Apache JMeter 5.6.3

## Performance Target

Provisional team target:

- Error rate: less than 1%
- p95 latency: less than 1 second for the selected load

This is a team-defined test target for the assignment, not a production service-level agreement.

## Planned Load Profiles

| Run ID | Users | Ramp-Up | Steady Duration | Think Time | Purpose |
|---|---:|---:|---:|---:|---|
| PERF-PILOT-001 | 1 | 10 sec | 30 sec | 1-3 sec | Pilot validation |
| PERF-FINAL-001 | 1 | 30 sec | 2 min | 1-3 sec | Baseline |
| PERF-FINAL-010 | 10 | 30 sec | 2 min | 1-3 sec | Moderate load |
| PERF-FINAL-025 | 25 | 30 sec | 2 min | 1-3 sec | Higher local load |

## Results Summary

| Run ID | Date | Users | Samples | Avg Latency | p95 Latency | Throughput | Error % | Result | Raw Evidence |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
| PERF-PILOT-001 | 2026-10-07 | 1 | 10 equipment samples, 20 total samples | 206 ms for `GET /api/equipment`; 207 ms total | 204 ms for `GET /api/equipment`; 461 ms total | 0.08140/sec for `GET /api/equipment`; 0.16110/sec total | 0.000% | Pass | `qa/nonfunctional/jmeter/pilot/summary.csv`, `qa/nonfunctional/jmeter/pilot/aggregate.csv`, `qa/nonfunctional/jmeter/pilot/Test Plan.jmx`, screenshots in `qa/nonfunctional/jmeter/pilot/` |
| PERF-FINAL-001 | 2026-10-07 | 1 | 63 equipment samples, 126 total samples | 189 ms for `GET /api/equipment`; 181 ms total | 273 ms for `GET /api/equipment`; 240 ms total | 0.04185/sec for `GET /api/equipment`; 0.08362/sec total | 0.000% | Pass | `qa/nonfunctional/jmeter/final/01-user/summary.csv`, `qa/nonfunctional/jmeter/final/01-user/aggregate.csv`, `qa/nonfunctional/jmeter/final/01-user/Test Plan-01-user.jmx`, screenshots in `qa/nonfunctional/jmeter/final/01-user/` |
| PERF-FINAL-010 | 2026-10-07 | 10 | 497 equipment samples, 1002 total samples | 207 ms for `GET /api/equipment`; 189 ms total | 304 ms for `GET /api/equipment`; 280 ms total | 0.27032/sec for `GET /api/equipment`; 0.54455/sec total | 0.000% | Pass | `qa/nonfunctional/jmeter/final/10-users/summary.csv`, `qa/nonfunctional/jmeter/final/10-users/aggregate.csv`, `qa/nonfunctional/jmeter/final/10-users/Test Plan 10-users.jmx`, screenshots in `qa/nonfunctional/jmeter/final/10-users/` |
| PERF-FINAL-025 | 2026-10-07 | 25 | 1478 equipment samples, 2975 total samples | 319 ms for `GET /api/equipment`; 298 ms total | 641 ms for `GET /api/equipment`; 634 ms total | 0.70657/sec for `GET /api/equipment`; 1.42134/sec total | 0.000% | Pass | `qa/nonfunctional/jmeter/final/25-users/summary.csv`, `qa/nonfunctional/jmeter/final/25-users/aggregate.csv`, `qa/nonfunctional/jmeter/final/25-users/Test Plan-25-users.jmx`, screenshots in `qa/nonfunctional/jmeter/final/25-users/` |

## Notes and Limitations

- Local-machine results are useful for controlled comparison, not production capacity claims.
- Record any background processes, database limitations, or network conditions that may affect results.

