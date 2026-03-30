# Monitoring

## Overview

This document describes the monitoring, logging, and alerting infrastructure for the Blockchain Voting System. The monitoring stack provides real-time visibility into system health, performance, and security, enabling rapid detection and response to issues.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Monitoring Stack                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
│  │   Grafana    │◄───│  Prometheus  │◄───│  Applications │             │
│  │  (Dashboards)│    │   (Metrics)  │    │  (Exporters) │             │
│  └──────────────┘    └──────────────┘    └──────────────┘             │
│         │                                       │                        │
│         │              ┌──────────────┐         │                        │
│         └─────────────►│  PagerDuty   │◄────────┘                        │
│                        │   (Alerts)    │                                  │
│                        └──────────────┘                                  │
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
│  │    Kibana    │◄───│  Logstash    │◄───│   Filebeat    │             │
│  │  (Visualize) │    │   (Process)  │    │   (Collect)   │             │
│  └──────────────┘    └──────────────┘    └──────────────┘             │
│                                            │                              │
│                                    ┌───────▼───────┐                     │
│                                    │  Application  │                     │
│                                    │    Logs        │                     │
│                                    └───────────────┘                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tools

- **Prometheus** - Metrics collection and time-series database
- **Grafana** - Visualization and dashboarding
- **ELK Stack** (Elasticsearch, Logstash, Kibana) - Log aggregation and analysis
- **PagerDuty** - Incident management and alerting
- **Node Exporter** - System-level metrics
- **Blackbox Exporter** - HTTP/TCP/DNS monitoring

---

## 1. Health Check Endpoints

The backend exposes comprehensive health check endpoints for monitoring service availability and dependency status.

### Backend Health Endpoint

**URL**: `GET /api/health`

Returns overall system health including all dependencies.

```json
{
  "status": "healthy",
  "timestamp": "2026-03-30T10:00:00Z",
  "version": "1.0.0",
  "uptime": "24h 30m 15s",
  "checks": {
    "database": {
      "status": "healthy",
      "response_time_ms": 12
    },
    "redis": {
      "status": "healthy",
      "response_time_ms": 2
    },
    "rabbitmq": {
      "status": "healthy",
      "response_time_ms": 5
    },
    "blockchain": {
      "status": "healthy",
      "connected_nodes": 5,
      "latest_block": 12345
    }
  }
}
```

### Individual Dependency Health Checks

#### Database Health

**URL**: `GET /api/health/database`

```json
{
  "status": "healthy",
  "database": "voting_system",
  "connection_pool": {
    "active": 5,
    "idle": 10,
    "max": 20
  },
  "query_time_ms": 8,
  "replication_lag_ms": 0
}
```

#### Redis Health

**URL**: `GET /api/health/redis`

```json
{
  "status": "healthy",
  "memory_used_mb": 45,
  "connected_clients": 12,
  "keyspace_hits": 15000,
  "keyspace_misses": 230,
  "hit_rate": "98.5%"
}
```

#### RabbitMQ Health

**URL**: `GET /api/health/rabbitmq`

```json
{
  "status": "healthy",
  "cluster_name": "voting-rabbitmq",
  "queue_stats": {
    "vote_submissions": {
      "messages": 150,
      "consumers": 3
    },
    "notification_queue": {
      "messages": 25,
      "consumers": 2
    }
  },
  "connection_status": "connected"
}
```

### Health Check Implementation

```javascript
// backend/src/middleware/healthCheck.js
const redis = require('../config/redis');
const { pool } = require('../config/database');
const rabbitmq = require('../config/rabbitmq');

async function checkDatabase() {
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    return {
      status: 'healthy',
      response_time_ms: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

async function checkRedis() {
  const start = Date.now();
  try {
    const result = await redis.ping();
    return {
      status: 'healthy',
      response_time_ms: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

async function checkRabbitMQ() {
  const start = Date.now();
  try {
    await rabbitmq.checkConnection();
    return {
      status: 'healthy',
      response_time_ms: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

router.get('/api/health', async (req, res) => {
  const [db, redis, rabbitmq] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkRabbitMQ()
  ]);

  const allHealthy = [db, redis, rabbitmq]
    .every(check => check.status === 'healthy');

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks: { database: db, redis, rabbitmq }
  });
});
```

---

## 2. Prometheus Metrics

Custom metrics provide deep visibility into voting system operations and performance.

### Metric Types

| Category | Metric Name | Type | Description |
|----------|-------------|------|-------------|
| Voting | `votes_submitted_total` | Counter | Total votes submitted |
| Voting | `votes_valid_total` | Counter | Valid votes processed |
| Voting | `votes_invalid_total` | Counter | Invalid votes rejected |
| Voting | `active_voters` | Gauge | Currently active voters |
| Voting | `vote_verification_duration_seconds` | Histogram | Vote verification time |
| API | `api_requests_total` | Counter | Total API requests |
| API | `api_response_time_seconds` | Histogram | API response latency |
| API | `api_errors_total` | Counter | Total API errors |
| Blockchain | `blockchain_blocks_total` | Gauge | Current blockchain height |
| Blockchain | `blockchain_transactions_total` | Counter | Total blockchain transactions |
| Blockchain | `blockchain_confirmation_time_seconds` | Histogram | Time to confirm transaction |
| Auth | `authentication_attempts_total` | Counter | Login attempts |
| Auth | `authentication_failures_total` | Counter | Failed login attempts |
| Security | `security_events_total` | Counter | Security-related events |

### Custom Metrics Implementation

```javascript
// backend/src/monitoring/metrics.js
const promClient = require('prom-client');

// Create a Registry
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom counters
const votesSubmittedTotal = new promClient.Counter({
  name: 'votes_submitted_total',
  help: 'Total number of votes submitted',
  labelNames: ['election_id', 'region'],
  registers: [register]
});

const votesValidTotal = new promClient.Counter({
  name: 'votes_valid_total',
  help: 'Total number of valid votes processed',
  labelNames: ['election_id'],
  registers: [register]
});

const votesInvalidTotal = new promClient.Counter({
  name: 'votes_invalid_total',
  help: 'Total number of invalid votes rejected',
  labelNames: ['election_id', 'reason'],
  registers: [register]
});

const activeVoters = new promClient.Gauge({
  name: 'active_voters',
  help: 'Number of currently active voters',
  labelNames: ['election_id'],
  registers: [register]
});

// API metrics
const apiRequestsTotal = new promClient.Counter({
  name: 'api_requests_total',
  help: 'Total number of API requests',
  labelNames: ['method', 'endpoint', 'status_code'],
  registers: [register]
});

const apiResponseTime = new promClient.Histogram({
  name: 'api_response_time_seconds',
  help: 'API response time in seconds',
  labelNames: ['method', 'endpoint'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register]
});

// Blockchain metrics
const blockchainBlocks = new promClient.Gauge({
  name: 'blockchain_blocks_total',
  help: 'Current blockchain height',
  registers: [register]
});

const blockchainTransactions = new promClient.Counter({
  name: 'blockchain_transactions_total',
  help: 'Total blockchain transactions',
  labelNames: ['type', 'status'],
  registers: [register]
});

const blockchainConfirmationTime = new promClient.Histogram({
  name: 'blockchain_confirmation_time_seconds',
  help: 'Time to confirm a transaction on blockchain',
  buckets: [1, 2, 5, 10, 30, 60, 120],
  registers: [register]
});

// Middleware to track API metrics
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    apiRequestsTotal.inc({
      method: req.method,
      endpoint: req.route?.path || req.path,
      status_code: res.statusCode
    });
    
    apiResponseTime.observe({
      method: req.method,
      endpoint: req.route?.path || req.path
    }, duration);
  });
  
  next();
}

// Metrics endpoint
router.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

module.exports = {
  register,
  votesSubmittedTotal,
  votesValidTotal,
  votesInvalidTotal,
  activeVoters,
  apiRequestsTotal,
  apiResponseTime,
  blockchainBlocks,
  blockchainTransactions,
  blockchainConfirmationTime,
  metricsMiddleware
};
```

### Prometheus Configuration

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rule_files:
  - "alerts/*.yml"

scrape_configs:
  - job_name: 'voting-backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'rabbitmq-exporter'
    static_configs:
      - targets: ['rabbitmq-exporter:9419']

  - job_name: 'blackbox'
    metrics_path: '/probe'
    params:
      module: [http_2xx]
    static_configs:
      - targets:
        - https://voting.example.com
        - https://api.voting.example.com
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115
```

---

## 3. Grafana Dashboards

### Dashboard 1: System Overview

Provides a high-level view of overall system health and key metrics.

```json
{
  "title": "Voting System - Overview",
  "panels": [
    {
      "title": "System Status",
      "type": "stat",
      "gridPos": {"x": 0, "y": 0, "w": 4, "h": 4},
      "targets": [
        {
          "expr": "up{job='voting-backend'}",
          "legendFormat": "Backend"
        },
        {
          "expr": "up{job='node-exporter'}",
          "legendFormat": "Node"
        }
      ]
    },
    {
      "title": "Votes Submitted (Last 24h)",
      "type": "graph",
      "gridPos": {"x": 4, "y": 0, "w": 10, "h": 8},
      "targets": [
        {
          "expr": "rate(votes_submitted_total[5m])",
          "legendFormat": "Votes/min"
        }
      ]
    },
    {
      "title": "Active Voters",
      "type": "stat",
      "gridPos": {"x": 14, "y": 0, "w": 4, "h": 4},
      "targets": [
        {
          "expr": "sum(active_voters)",
          "legendFormat": "Active"
        }
      ]
    },
    {
      "title": "API Response Time (p95)",
      "type": "graph",
      "gridPos": {"x": 0, "y": 8, "w": 12, "h": 8},
      "targets": [
        {
          "expr": "histogram_quantile(0.95, rate(api_response_time_seconds_bucket[5m]))",
          "legendFormat": "p95"
        },
        {
          "expr": "histogram_quantile(0.99, rate(api_response_time_seconds_bucket[5m]))",
          "legendFormat": "p99"
        }
      ]
    },
    {
      "title": "Error Rate",
      "type": "graph",
      "gridPos": {"x": 12, "y": 8, "w": 12, "h": 8},
      "targets": [
        {
          "expr": "rate(api_errors_total[5m]) / rate(api_requests_total[5m]) * 100",
          "legendFormat": "Error %"
        }
      ]
    }
  ]
}
```

### Dashboard 2: API Performance

Detailed API performance metrics broken down by endpoint.

```json
{
  "title": "Voting System - API Performance",
  "panels": [
    {
      "title": "Requests by Endpoint",
      "type": "table",
      "targets": [
        {
          "expr": "topk(10, sum by (endpoint) (rate(api_requests_total[5m])))",
          "format": "table"
        }
      ]
    },
    {
      "title": "Response Time by Endpoint",
      "type": "heatmap",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, rate(api_response_time_seconds_bucket[5m]))",
          "legendFormat": "{{endpoint}}"
        }
      ]
    },
    {
      "title": "Error Rate by Status Code",
      "type": "graph",
      "targets": [
        {
          "expr": "sum by (status_code) (rate(api_requests_total{status_code=~'5..'}[5m]))",
          "legendFormat": "5xx - {{status_code}}"
        },
        {
          "expr": "sum by (status_code) (rate(api_requests_total{status_code=~'4..'}[5m]))",
          "legendFormat": "4xx - {{status_code}}"
        }
      ]
    }
  ]
}
```

### Dashboard 3: Database Metrics

PostgreSQL performance and connection monitoring.

```json
{
  "title": "Voting System - Database",
  "panels": [
    {
      "title": "Connection Pool",
      "type": "gauge",
      "targets": [
        {
          "expr": "pg_stat_activity_count",
          "legendFormat": "Active"
        },
        {
          "expr": "pg_pool_available_connections",
          "legendFormat": "Available"
        }
      ]
    },
    {
      "title": "Query Duration",
      "type": "heatmap",
      "targets": [
        {
          "expr": "rate(pg_stat_statements_mean_exec_time[5m])",
          "legendFormat": "Mean"
        }
      ]
    },
    {
      "title": "Slow Queries (>1s)",
      "type": "table",
      "targets": [
        {
          "expr": "topk(10, pg_stat_statements_mean_exec_time > 1000)",
          "legendFormat": "{{query}}"
        }
      ]
    },
    {
      "title": "Database Size",
      "type": "stat",
      "targets": [
        {
          "expr": "pg_database_size_bytes",
          "legendFormat": "Size"
        }
      ]
    }
  ]
}
```

### Dashboard 4: Blockchain Metrics

Blockchain network and transaction monitoring.

```json
{
  "title": "Voting System - Blockchain",
  "panels": [
    {
      "title": "Blockchain Height",
      "type": "stat",
      "targets": [
        {
          "expr": "blockchain_blocks_total",
          "legendFormat": "Block Height"
        }
      ]
    },
    {
      "title": "Transactions Confirmed",
      "type": "graph",
      "targets": [
        {
          "expr": "rate(blockchain_transactions_total{status='confirmed'}[5m])",
          "legendFormat": "Confirmed/min"
        }
      ]
    },
    {
      "title": "Confirmation Time",
      "type": "graph",
      "targets": [
        {
          "expr": "histogram_quantile(0.50, rate(blockchain_confirmation_time_seconds_bucket[5m]))",
          "legendFormat": "p50"
        },
        {
          "expr": "histogram_quantile(0.95, rate(blockchain_confirmation_time_seconds_bucket[5m]))",
          "legendFormat": "p95"
        }
      ]
    },
    {
      "title": "Pending Transactions",
      "type": "stat",
      "targets": [
        {
          "expr": "blockchain_transactions_total{status='pending'}",
          "legendFormat": "Pending"
        }
      ]
    }
  ]
}
```

---

## 4. Alert Configuration

### Alert Rules

```yaml
# prometheus/alerts/voting-system.yml
groups:
  - name: voting-system-alerts
    rules:
      # High Error Rate
      - alert: HighErrorRate
        expr: |
          (
            sum(rate(api_requests_total{status_code=~"5.."}[5m])) /
            sum(rate(api_requests_total[5m]))
          ) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} (threshold: 5%)"

      # Service Down
      - alert: ServiceDown
        expr: up{job="voting-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Backend service is down"
          description: "Voting backend has been down for 5 minutes"

      # High Response Time
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95, rate(api_response_time_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API response time"
          description: "p95 response time is {{ $value | humanizeDuration }} (threshold: 2s)"

      # Database Connection Issues
      - alert: DatabaseConnectionIssues
        expr: |
          pg_stat_activity_count / pg_pool_max_connections > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Database connection pool near capacity"
          description: "Connection pool utilization is {{ $value | humanizePercentage }}"

      # Redis Memory High
      - alert: RedisMemoryHigh
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis memory usage high"
          description: "Redis memory is {{ $value | humanizePercentage }} of max"

      # Disk Space Low
      - alert: DiskSpaceLow
        expr: |
          (
            node_filesystem_avail_bytes{mountpoint="/"} /
            node_filesystem_size_bytes{mountpoint="/"}
          ) < 0.15
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Disk space low"
          description: "Disk space is {{ $value | humanizePercentage }} available"

      # RabbitMQ Queue Backlog
      - alert: RabbitMQQueueBacklog
        expr: rabbitmq_queue_messages > 1000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "RabbitMQ queue backlog growing"
          description: "Queue {{ $labels.queue }} has {{ $value }} messages"

      # Blockchain Confirmation Delayed
      - alert: BlockchainConfirmationDelayed
        expr: |
          histogram_quantile(0.95, rate(blockchain_confirmation_time_seconds_bucket[10m])) > 60
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Blockchain confirmations delayed"
          description: "p95 confirmation time is {{ $value | humanizeDuration }} (threshold: 60s)"

      # Invalid Votes Spike
      - alert: InvalidVotesSpike
        expr: |
          rate(votes_invalid_total[5m]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High number of invalid votes"
          description: "Invalid vote rate is {{ $value }}/min - possible attack or system issue"

      # Authentication Failures
      - alert: AuthenticationFailures
        expr: |
          rate(authentication_failures_total[5m]) > 20
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High authentication failure rate"
          description: "Failed login attempts at {{ $value }}/min - possible brute force attack"
```

### Alert Manager Configuration

```yaml
# alertmanager/alertmanager.yml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'pagerduty'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      continue: true
    - match:
        severity: warning
      receiver: 'slack-warnings'

receivers:
  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_SERVICE_KEY'
        severity: '{{ .GroupLabels.severity }}'
        custom_details:
          - {{ range .Alerts }}
            {{ .Annotations.summary }}: {{ .Annotations.description }}
            {{ end }}

  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_CRITICAL_KEY'
        severity: critical

  - name: 'slack-warnings'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#voting-alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: |
          {{ range .Alerts }}
          *{{ .Annotations.summary }}*
          {{ .Annotations.description }}
          {{ end }}
        color: '{{ if eq .GroupLabels.severity "critical" }}danger{{ else }}warning{{ end }}'
```

---

## 5. Log Aggregation (ELK Stack)

### Filebeat Configuration

```yaml
# filebeat/filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/voting-system/*.log
    fields:
      service: voting-system
      environment: production
    multiline:
      pattern: '^[[:space:]]+(at|Exception|Error)'
      negate: false
      match: after

  - type: log
    enabled: true
    paths:
      - /var/log/nginx/access.log
    fields:
      service: nginx
      environment: production

  - type: log
    enabled: true
    paths:
      - /var/log/voting-system/blockchain/*.log
    fields:
      service: blockchain
      environment: production

processors:
  - add_host_metadata:
      when.not.contains.tags: forwarded
  - add_docker_metadata: ~
  - add_fields:
      target: ''
      fields:
        cluster.name: voting-production

output.logstash:
  hosts: ["logstash:5044"]
  ssl.enabled: false

logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  rotateeverybytes: 10485760
  keepfiles: 7
```

### Logstash Pipeline Configuration

```conf
# logstash/pipeline/voting-system.conf
input {
  beats {
    port => 5044
  }
}

filter {
  # Parse JSON logs
  json {
    source => "message"
    target => "parsed"
  }

  # Add timestamp
  date {
    match => ["timestamp", "ISO8601", "yyyy-MM-dd HH:mm:ss"]
    target => "@timestamp"
  }

  # Parse application logs
  grok {
    match => {
      "message" => "%{TIMESTAMP_ISO8601:log_timestamp} %{LOGLEVEL:log_level} %{DATA:logger} - %{GREEDYDATA:log_message}"
    }
    overwrite => ["message"]
  }

  # Add service-specific fields
  if [service] == "voting-system" {
    # Extract request information
    if [parsed][request] {
      mutate {
        add_field => {
          "method" => "%{parsed[request][method]}"
          "path" => "%{parsed[request][path]}"
          "status" => "%{parsed[response][status]}"
        }
      }
    }

    # Extract vote information
    if [parsed][vote] {
      mutate {
        add_field => {
          "election_id" => "%{parsed[vote][election_id]}"
          "voter_id" => "%{parsed[vote][voter_id]}"
        }
      }
    }
  }

  # Security event tagging
  if [logger] =~ /security|auth/i {
    mutate {
      add_tag => ["security"]
    }
  }

  # Error handling
  if [log_level] in ["ERROR", "FATAL"] {
    mutate {
      add_tag => ["error"]
    }
  }

  # Remove internal fields
  mutate {
    remove_field => ["host"]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "voting-system-%{+YYYY.MM.dd}"
  }
}
```

### Kibana Dashboard

```json
{
  "title": "Voting System Logs",
  "hits": 0,
  "columns": [
    "@timestamp",
    "service",
    "log_level",
    "message"
  ],
  "sort": [
    "@timestamp",
    "desc"
  ],
  "version": 1,
  "kibanaSavedObjectMeta": {
    "searchSourceJSON": {
      "index": "voting-system-*",
      "query": {
        "query": "",
        "language": "kuery"
      },
      "filter": []
    }
  }
}
```

### Useful Kibana Searches

| Search | Description |
|--------|-------------|
| `service: voting-system AND log_level: ERROR` | All application errors |
| `service: voting-system AND message: "vote_submitted"` | Vote submission events |
| `tags: security` | Security-related events |
| `service: nginx AND status: 5*` | Nginx 5xx errors |
| `response_time_ms > 1000` | Slow requests |

---

## 6. Health Check Script

Comprehensive system verification script for manual health checks and automated monitoring.

```bash
#!/bin/bash

#===============================================================================
# Blockchain Voting System - Health Check Script
# Version: 1.0.0
# Description: Comprehensive system health verification
#===============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/../config/healthcheck.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API endpoints
BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
API_BASE="${BACKEND_URL}/api"

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

#-------------------------------------------------------------------------------
# Helper Functions
#-------------------------------------------------------------------------------

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

check_pass() {
    ((TOTAL_CHECKS++))
    ((PASSED_CHECKS++))
    log_success "$1"
}

check_fail() {
    ((TOTAL_CHECKS++))
    ((FAILED_CHECKS++))
    log_error "$1"
}

check_warn() {
    ((TOTAL_CHECKS++))
    ((WARNINGS++))
    log_warning "$1"
}

http_check() {
    local url="$1"
    local description="$2"
    local expected_status="${3:-200}"
    local timeout="${4:-10}"
    
    local response
    response=$(curl -s -w "\n%{http_code}" --max-time "$timeout" "$url" 2>/dev/null || echo -e "\n000")
    
    local status_code
    status_code=$(echo "$response" | tail -n1)
    local body
    body=$(echo "$response" | sed '$d')
    
    if [[ "$status_code" == "$expected_status" ]]; then
        check_pass "$description (HTTP $status_code)"
        return 0
    else
        check_fail "$description - Expected $expected_status, got $status_code"
        return 1
    fi
}

json_value() {
    local json="$1"
    local key="$2"
    echo "$json" | grep -o "\"$key\":[^,}]*" | cut -d'"' -f4- | tr -d ' '
}

#-------------------------------------------------------------------------------
# Header
#-------------------------------------------------------------------------------

print_header() {
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "     Blockchain Voting System - Health Check"
    echo "     $(date '+%Y-%m-%d %H:%M:%S')"
    echo "════════════════════════════════════════════════════════════"
    echo ""
}

#-------------------------------------------------------------------------------
# 1. Backend Health Check
#-------------------------------------------------------------------------------

check_backend_health() {
    log_info "────────────────────────────────────────"
    log_info "Checking Backend Health"
    log_info "────────────────────────────────────────"
    
    local response
    response=$(curl -s --max-time 10 "$API_BASE/health" 2>/dev/null || echo '{}')
    
    local status
    status=$(json_value "$response" "status")
    
    if [[ "$status" == "healthy" ]]; then
        check_pass "Backend health check"
        
        # Check individual components
        local db_status
        db_status=$(json_value "$response" "database")
        if [[ "$db_status" == "healthy" ]]; then
            check_pass "Database connection"
        else
            check_fail "Database connection: $db_status"
        fi
        
        local redis_status
        redis_status=$(json_value "$response" "redis")
        if [[ "$redis_status" == "healthy" ]]; then
            check_pass "Redis connection"
        else
            check_fail "Redis connection: $redis_status"
        fi
        
        local rabbitmq_status
        rabbitmq_status=$(json_value "$response" "rabbitmq")
        if [[ "$rabbitmq_status" == "healthy" ]]; then
            check_pass "RabbitMQ connection"
        else
            check_fail "RabbitMQ connection: $rabbitmq_status"
        fi
    else
        check_fail "Backend health check failed"
    fi
    
    # Check metrics endpoint
    http_check "$API_BASE/metrics" "Prometheus metrics endpoint" 200 10
}

#-------------------------------------------------------------------------------
# 2. API Endpoints Check
#-------------------------------------------------------------------------------

check_api_endpoints() {
    log_info "────────────────────────────────────────"
    log_info "Checking API Endpoints"
    log_info "────────────────────────────────────────"
    
    # Public endpoints
    http_check "$API_BASE/elections" "GET /api/elections" 200 10
    http_check "$API_BASE/health" "GET /api/health" 200 5
    
    # Test with authentication (if token provided)
    if [[ -n "${TEST_AUTH_TOKEN:-}" ]]; then
        local auth_response
        auth_response=$(curl -s -H "Authorization: Bearer $TEST_AUTH_TOKEN" \
            --max-time 10 "$API_BASE/voters/me" 2>/dev/null || echo '{}')
        
        if echo "$auth_response" | grep -q "error"; then
            check_fail "Authenticated endpoint test"
        else
            check_pass "Authenticated endpoint test"
        fi
    fi
}

#-------------------------------------------------------------------------------
# 3. Database Check
#-------------------------------------------------------------------------------

check_database() {
    log_info "────────────────────────────────────────"
    log_info "Checking Database"
    log_info "────────────────────────────────────────"
    
    # Check database health endpoint
    local db_response
    db_response=$(curl -s --max-time 10 "$API_BASE/health/database" 2>/dev/null || echo '{}')
    
    local db_status
    db_status=$(json_value "$response" "status")
    
    if [[ "$db_status" == "healthy" ]]; then
        check_pass "Database is healthy"
        
        # Check connection pool
        local active_conns
        active_conns=$(json_value "$db_response" "active")
        local max_conns
        max_conns=$(json_value "$db_response" "max")
        
        if [[ -n "$active_conns" && -n "$max_conns" ]]; then
            local utilization=$((active_conns * 100 / max_conns))
            if [[ "$utilization" -lt 80 ]]; then
                check_pass "Database connection pool (${utilization}% used)"
            elif [[ "$utilization" -lt 90 ]]; then
                check_warn "Database connection pool high (${utilization}% used)"
            else
                check_fail "Database connection pool critical (${utilization}% used)"
            fi
        fi
    else
        check_fail "Database health check failed"
    fi
    
    # Check for recent elections
    local elections_response
    elections_response=$(curl -s --max-time 10 "$API_BASE/elections" 2>/dev/null || echo '[]')
    if echo "$elections_response" | grep -q "id"; then
        check_pass "Database queries working"
    else
        check_fail "Database queries not returning data"
    fi
}

#-------------------------------------------------------------------------------
# 4. Redis Check
#-------------------------------------------------------------------------------

check_redis() {
    log_info "────────────────────────────────────────"
    log_info "Checking Redis"
    log_info "────────────────────────────────────────"
    
    local redis_response
    redis_response=$(curl -s --max-time 10 "$API_BASE/health/redis" 2>/dev/null || echo '{}')
    
    local redis_status
    redis_status=$(json_value "$redis_response" "status")
    
    if [[ "$redis_status" == "healthy" ]]; then
        check_pass "Redis is healthy"
        
        # Check memory usage
        local memory_used
        memory_used=$(json_value "$redis_response" "memory_used_mb")
        if [[ -n "$memory_used" && "$memory_used" -lt 512 ]]; then
            check_pass "Redis memory usage (${memory_used}MB)"
        else
            check_warn "Redis memory usage high (${memory_used}MB)"
        fi
        
        # Check hit rate
        local hit_rate
        hit_rate=$(json_value "$redis_response" "hit_rate" | tr -d '%')
        if [[ -n "$hit_rate" && "${hit_rate%.*}" -gt 80 ]]; then
            check_pass "Redis hit rate (${hit_rate}%)"
        else
            check_warn "Redis hit rate low (${hit_rate}%)"
        fi
    else
        check_fail "Redis health check failed"
    fi
}

#-------------------------------------------------------------------------------
# 5. RabbitMQ Check
#-------------------------------------------------------------------------------

check_rabbitmq() {
    log_info "────────────────────────────────────────"
    log_info "Checking RabbitMQ"
    log_info "────────────────────────────────────────"
    
    local mq_response
    mq_response=$(curl -s --max-time 10 "$API_BASE/health/rabbitmq" 2>/dev/null || echo '{}')
    
    local mq_status
    mq_status=$(json_value "$mq_response" "status")
    
    if [[ "$mq_status" == "healthy" ]]; then
        check_pass "RabbitMQ is healthy"
    else
        check_fail "RabbitMQ health check failed"
    fi
}

#-------------------------------------------------------------------------------
# 6. Blockchain Check
#-------------------------------------------------------------------------------

check_blockchain() {
    log_info "────────────────────────────────────────"
    log_info "Checking Blockchain"
    log_info "────────────────────────────────────────"
    
    local bc_response
    bc_response=$(curl -s --max-time 15 "$API_BASE/blockchain/status" 2>/dev/null || echo '{}')
    
    local bc_status
    bc_status=$(json_value "$bc_response" "status")
    
    if [[ "$bc_status" == "healthy" ]]; then
        check_pass "Blockchain connection healthy"
        
        # Check connected nodes
        local nodes
        nodes=$(json_value "$bc_response" "connected_nodes")
        if [[ -n "$nodes" && "$nodes" -ge 3 ]]; then
            check_pass "Connected nodes ($nodes)"
        else
            check_warn "Low connected nodes ($nodes)"
        fi
        
        # Check latest block
        local latest_block
        latest_block=$(json_value "$bc_response" "latest_block")
        if [[ -n "$latest_block" && "$latest_block" -gt 0 ]]; then
            check_pass "Blockchain syncing (block $latest_block)"
        else
            check_warn "Blockchain may not be syncing"
        fi
    else
        check_fail "Blockchain connection failed"
    fi
}

#-------------------------------------------------------------------------------
# 7. System Resources Check
#-------------------------------------------------------------------------------

check_system_resources() {
    log_info "────────────────────────────────────────"
    log_info "Checking System Resources"
    log_info "────────────────────────────────────────"
    
    # Check disk space
    local disk_usage
    disk_usage=$(df -h . | awk 'NR==2 {print $5}' | tr -d '%')
    if [[ "$disk_usage" -lt 80 ]]; then
        check_pass "Disk space (${disk_usage}% used)"
    elif [[ "$disk_usage" -lt 90 ]]; then
        check_warn "Disk space (${disk_usage}% used)"
    else
        check_fail "Disk space critical (${disk_usage}% used)"
    fi
    
    # Check memory
    if command -v free &> /dev/null; then
        local mem_usage
        mem_usage=$(free | awk '/Mem:/ {printf "%.0f", $3/$2 * 100}')
        if [[ "$mem_usage" -lt 80 ]]; then
            check_pass "Memory usage (${mem_usage}%)"
        elif [[ "$mem_usage" -lt 90 ]]; then
            check_warn "Memory usage high (${mem_usage}%)"
        else
            check_fail "Memory usage critical (${mem_usage}%)"
        fi
    fi
    
    # Check CPU load
    if command -v uptime &> /dev/null; then
        local load
        load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
        check_pass "System load average ($load)"
    fi
}

#-------------------------------------------------------------------------------
# 8. Security Checks
#-------------------------------------------------------------------------------

check_security() {
    log_info "────────────────────────────────────────"
    log_info "Checking Security"
    log_info "────────────────────────────────────────"
    
    # Check for recent security events
    local security_logs
    security_logs=$(curl -s --max-time 10 \
        "$API_BASE/logs?level=security&since=1h" 2>/dev/null | grep -c "event" || echo "0")
    
    if [[ "$security_logs" -lt 10 ]]; then
        check_pass "No recent security issues"
    else
        check_warn "Recent security events: $security_logs"
    fi
    
    # Check SSL certificate (if URL is HTTPS)
    if [[ "$BACKEND_URL" =~ ^https:// ]]; then
        local expiry_date
        expiry_date=$(echo | openssl s_client -connect "${BACKEND_URL#https://}" -servername server 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
        
        if [[ -n "$expiry_date" ]]; then
            local days_until
            days_until=$((($(date -d "$expiry_date" +%s) - $(date +%s)) / 86400))
            
            if [[ "$days_until" -gt 30 ]]; then
                check_pass "SSL certificate valid ($days_until days)"
            elif [[ "$days_until" -gt 7 ]]; then
                check_warn "SSL certificate expiring soon ($days_until days)"
            else
                check_fail "SSL certificate expiring in $days_until days"
            fi
        fi
    fi
}

#-------------------------------------------------------------------------------
# 9. Recent Election Check
#-------------------------------------------------------------------------------

check_elections() {
    log_info "────────────────────────────────────────"
    log_info "Checking Active Elections"
    log_info "────────────────────────────────────────"
    
    local elections_response
    elections_response=$(curl -s --max-time 10 "$API_BASE/elections?status=active" 2>/dev/null || echo '[]')
    
    local election_count
    election_count=$(echo "$elections_response" | grep -o "\"id\"" | wc -l)
    
    if [[ "$election_count" -gt 0 ]]; then
        check_pass "Active elections found ($election_count)"
    else
        check_warn "No active elections"
    fi
}

#-------------------------------------------------------------------------------
# Summary
#-------------------------------------------------------------------------------

print_summary() {
    log_info "────────────────────────────────────────"
    log_info "Summary"
    log_info "────────────────────────────────────────"
    echo ""
    echo "  Total Checks:  $TOTAL_CHECKS"
    echo -e "  ${GREEN}Passed:         $PASSED_CHECKS${NC}"
    
    if [[ "$WARNINGS" -gt 0 ]]; then
        echo -e "  ${YELLOW}Warnings:       $WARNINGS${NC}"
    fi
    
    if [[ "$FAILED_CHECKS" -gt 0 ]]; then
        echo -e "  ${RED}Failed:         $FAILED_CHECKS${NC}"
    fi
    
    echo ""
    
    if [[ "$FAILED_CHECKS" -gt 0 ]]; then
        echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
        echo -e "${RED}  HEALTH CHECK FAILED${NC}"
        echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
        exit 1
    elif [[ "$WARNINGS" -gt 0 ]]; then
        echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}  HEALTH CHECK PASSED WITH WARNINGS${NC}"
        echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
        exit 0
    else
        echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}  HEALTH CHECK PASSED${NC}"
        echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
        exit 0
    fi
}

#-------------------------------------------------------------------------------
# Main Execution
#-------------------------------------------------------------------------------

main() {
    print_header
    
    check_backend_health
    check_api_endpoints
    check_database
    check_redis
    check_rabbitmq
    check_blockchain
    check_system_resources
    check_security
    check_elections
    
    print_summary
}

# Run main function
main "$@"
```

### Running the Health Check Script

```bash
# Basic usage
./healthcheck.sh

# With custom backend URL
BACKEND_URL=https://voting.example.com ./healthcheck.sh

# With authentication token
TEST_AUTH_TOKEN=your-jwt-token ./healthcheck.sh

# Output to file
./healthcheck.sh >> healthcheck-results.txt

# Cron job (run every 5 minutes)
*/5 * * * * /path/to/scripts/healthcheck.sh >> /var/log/healthcheck.log 2>&1
```

### Health Check Exit Codes

| Code | Description |
|------|-------------|
| 0 | All checks passed (or only warnings) |
| 1 | One or more checks failed |

---

## Quick Reference

### Service Ports

| Service | Port | Endpoint |
|---------|------|----------|
| Backend API | 3000 | /api/health |
| Prometheus | 9090 | /metrics |
| Grafana | 3001 | / |
| Elasticsearch | 9200 | / |
| Kibana | 5601 | / |
| Node Exporter | 9100 | /metrics |

### Key Commands

```bash
# Check backend health
curl http://localhost:3000/api/health

# View Prometheus metrics
curl http://localhost:3000/metrics

# Access Grafana
open http://localhost:3001

# View Kibana
open http://localhost:5601

# Run health check script
./scripts/healthcheck.sh

# Check Prometheus alerts
curl http://localhost:9090/api/v1/alerts | jq

# View recent logs in Kibana
# Navigate to Discover > voting-system-*
```

---

## Maintenance

### Log Retention

| Index | Retention | Size Limit |
|-------|-----------|------------|
| voting-system-* | 30 days | 50GB |
| nginx-* | 7 days | 10GB |
| system-* | 90 days | 20GB |

### Dashboard Refresh Rates

| Dashboard | Auto-refresh |
|-----------|--------------|
| System Overview | 10 seconds |
| API Performance | 30 seconds |
| Database | 30 seconds |
| Blockchain | 1 minute |

---

## Support

For issues with monitoring:
- Check Grafana dashboards for anomalies
- Review Kibana logs for errors
- Run health check script for detailed diagnostics
- Contact the DevOps team via PagerDuty
