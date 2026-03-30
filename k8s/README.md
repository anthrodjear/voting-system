# Kubernetes Deployment Manifests

This directory contains Kubernetes manifests for deploying the Voting System to a Kubernetes cluster.

## Directory Structure

```
k8s/
├── namespace.yaml           # Namespace and RBAC configuration
├── configmaps.yaml         # Global ConfigMaps
├── secrets.yaml            # Secrets (passwords, API keys)
├── ingress.yaml            # NGINX Ingress with TLS
├── postgres-pvc.yaml       # PostgreSQL PersistentVolumeClaim
├── kustomization.yaml      # Kustomize configuration
├── backend/
│   ├── configmap.yaml      # Backend environment variables
│   ├── deployment.yaml     # Backend deployment (3 replicas)
│   └── hpa.yaml           # Horizontal Pod Autoscaler
├── frontend/
│   ├── configmap.yaml      # Frontend environment variables
│   └── deployment.yaml    # Frontend deployment (3 replicas)
├── database/
│   ├── postgres.yaml      # PostgreSQL StatefulSet
│   └── redis.yaml         # Redis Deployment
└── rabbitmq/
    └── rabbitmq.yaml      # RabbitMQ Deployment
```

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- NGINX Ingress Controller installed
- cert-manager for TLS (optional)
- PersistentVolume provisioner

## Quick Start

### 1. Create Namespace and Apply Manifests

```bash
# Apply all manifests using kubectl
kubectl apply -k .

# Or apply individual files
kubectl apply -f namespace.yaml
kubectl apply -f configmaps.yaml
kubectl apply -f secrets.yaml
```

### 2. Update Secrets

Before deploying to production, update the secrets with secure values:

```bash
# Edit secrets
kubectl edit secret database-secrets -n voting-system
kubectl edit secret backend-secrets -n voting-system
kubectl edit secret rabbitmq-secrets -n voting-system
```

### 3. Deploy Images

Build and push Docker images:

```bash
# Build backend
docker build -t voting-backend:latest ./backend

# Build frontend
docker build -t voting-frontend:latest ./frontend

# Tag for registry
docker tag voting-backend:latest your-registry/voting-backend:latest
docker tag voting-frontend:latest your-registry/voting-frontend:latest

# Push to registry
docker push your-registry/voting-backend:latest
docker push your-registry/voting-frontend:latest
```

### 4. Verify Deployment

```bash
# Check pods
kubectl get pods -n voting-system

# Check services
kubectl get svc -n voting-system

# Check deployments
kubectl get deployments -n voting-system

# Check HPA
kubectl get hpa -n voting-system
```

### 5. Access the Application

```bash
# Get ingress IP
kubectl get ingress -n voting-system

# Port forward for local testing
kubectl port-forward -n voting-system svc/frontend-service 3000:3000
kubectl port-forward -n voting-system svc/backend-service 3001:3001
```

## Configuration

### Environment Variables

#### Backend (backend/configmap.yaml)
- `NODE_ENV`: production
- `PORT`: 3001
- `DB_HOST`: postgres-service
- `DB_PORT`: 5432
- `REDIS_HOST`: redis-service
- `REDIS_PORT`: 6379
- `RABBITMQ_HOST`: rabbitmq-service
- `RABBITMQ_PORT`: 5672
- `CORS_ORIGIN`: https://voting.example.com

#### Frontend (frontend/configmap.yaml)
- `NODE_ENV`: production
- `NEXT_PUBLIC_API_URL`: http://backend-service:3001
- `APP_NAME`: IEBC Voting System

### Secrets

Update these secrets before production deployment:
- `database-secrets`: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
- `rabbitmq-secrets`: RABBITMQ_DEFAULT_USER, RABBITMQ_DEFAULT_PASS
- `backend-secrets`: JWT_SECRET, DB_PASSWORD, RABBITMQ_USER, RABBITMQ_PASSWORD

### Horizontal Pod Autoscaling

The backend HPA is configured to:
- Scale between 3 and 10 replicas
- Scale up when CPU > 70%
- Scale up when memory > 80%

### Ingress

The ingress routes:
- `voting.example.com` -> Frontend service (port 3000)
- `api.voting.example.com` -> Backend service (port 3001)

Update the TLS certificate before production:
```bash
# Create TLS secret manually
kubectl create secret tls voting-system-tls \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem \
  -n voting-system
```

## Storage

### PostgreSQL
- 10Gi storage (ReadWriteOnce)
- StatefulSet for persistent data

### Redis
- 5Gi storage (ReadWriteOnce)
- AOF persistence enabled

### RabbitMQ
- 8Gi storage (ReadWriteOnce)
- Management UI exposed on port 15672

## Monitoring

Prometheus metrics are enabled on:
- Backend: `http://backend:3001/metrics`
- RabbitMQ: `http://rabbitmq:15672/metrics`

## Security

- Non-root containers (runAsUser: 999/1001)
- Pod anti-affinity for high availability
- Liveness and readiness probes
- Resource limits and requests
- Network policies (recommended: add in production)

## Troubleshooting

```bash
# View pod logs
kubectl logs -n voting-system deployment/backend-deployment

# Describe pod for events
kubectl describe pod -n voting-system <pod-name>

# View pod resource usage
kubectl top pods -n voting-system

# Check HPA status
kubectl describe hpa backend-hpa -n voting-system

# Exec into container
kubectl exec -it -n voting-system <pod-name> -- /bin/sh
```

## Cleanup

```bash
# Delete all resources
kubectl delete -k .

# Or delete individually
kubectl delete -f ingress.yaml
kubectl delete -f namespace.yaml
```
