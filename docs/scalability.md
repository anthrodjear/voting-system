# Scalability

## Overview

System scalability and throughput calculations.

---

## 1. Performance Targets

| Metric | Target |
|--------|--------|
| Concurrent voters | 100,000 |
| Votes/second | 5,000 |
| API response (p95) | < 500ms |
| Vote submission | < 2s |
| Verification | < 3s |

---

## 2. Throughput Calculation

- 5,000 votes/sec × 60 sec = 300,000/min
- 20M ÷ 300,000 = 67 minutes total

---

## 3. Scaling Strategy

- Horizontal scaling (Kubernetes)
- Database sharding
- Caching (Redis)
- Async processing (RabbitMQ)
