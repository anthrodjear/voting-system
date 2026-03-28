# Deployment

## Overview

Deployment instructions and environment setup.

---

## Prerequisites

- Node.js 20+
- Docker
- Kubernetes
- Cloud provider access

---

## Environments

- Development
- Staging
- Production

---

## Deployment Steps

```bash
# Build
npm run build

# Deploy to Kubernetes
kubectl apply -f k8s/
```
