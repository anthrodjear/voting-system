# Deployment Guide

Comprehensive deployment documentation for the IEBC Voting System.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Cloud Provider Instructions](#cloud-provider-instructions)
6. [Deployment Steps](#deployment-steps)
7. [Health Verification](#health-verification)
8. [Troubleshooting](#troubleshooting)
9. [Monitoring](#monitoring)
10. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | Running the application locally |
| Docker | 24+ | Containerizing the application |
| Docker Compose | 2.24+ | Orchestrating multi-container deployments |
| Kubernetes | 1.24+ | Container orchestration |
| kubectl | 1.24+ | Kubernetes CLI |
| Git | 2.40+ | Version control |

### Cloud Provider CLIs (Choose One)

| Provider | CLI Tool | Purpose |
|----------|----------|---------|
| AWS | `aws` CLI + `eksctl` | EKS cluster management |
| GCP | `gcloud` CLI + `gke-gcloud-auth-plugin` | GKE cluster management |
| Azure | `az` CLI + `kubelogin` | AKS cluster management |

### Infrastructure Requirements

- **Development**: 4 vCPU, 8GB RAM
- **Staging**: 8 vCPU, 16GB RAM
- **Production**: 16 vCPU, 32GB RAM

### Additional Requirements

- Container registry access (Docker Hub, ECR, GCR, ACR)
- Domain name with DNS configuration access
- TLS certificates (or cert-manager for automatic provisioning)

---

## Environment Setup

### 1. Clone and Navigate to Project

```bash
git clone <repository-url>
cd voting-system
```

### 2. Environment Variables

Copy the example environment file and configure your values:

```bash
cp .env.example .env
```

### 3. Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `APP_NAME` | Application name | IEBC Voting System | Yes |
| `NODE_ENV` | Environment | development | Yes |
| `BACKEND_PORT` | Backend server port | 3001 | No |
| `FRONTEND_PORT` | Frontend server port | 3000 | No |
| `DB_HOST` | PostgreSQL host | localhost | Yes |
| `DB_PORT` | PostgreSQL port | 5432 | Yes |
| `DB_USERNAME` | PostgreSQL username | postgres | Yes |
| `DB_PASSWORD` | PostgreSQL password | - | Yes |
| `DB_DATABASE` | PostgreSQL database name | voting_system | Yes |
| `REDIS_HOST` | Redis host | localhost | Yes |
| `REDIS_PORT` | Redis port | 6379 | Yes |
| `RABBITMQ_HOST` | RabbitMQ host | localhost | Yes |
| `RABBITMQ_PORT` | RabbitMQ port | 5672 | Yes |
| `RABBITMQ_MANAGEMENT_PORT` | RabbitMQ management port | 15672 | No |
| `RABBITMQ_USER` | RabbitMQ username | guest | Yes |
| `RABBITMQ_PASSWORD` | RabbitMQ password | - | Yes |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | - | Yes |
| `JWT_EXPIRATION` | JWT token expiration | 1d | No |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 | Yes |
| `CORS_ORIGIN` | CORS allowed origins | http://localhost:3000 | Yes |
| `THROTTLE_TTL` | Rate limit TTL (ms) | 60000 | No |
| `THROTTLE_LIMIT` | Rate limit requests | 1000 | No |
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:3001 | Yes |
| `LOG_LEVEL` | Logging level | debug | No |

### 4. Production Environment Notes

For production deployments:

1. **Generate a secure JWT secret**:
   ```bash
   # Generate a secure random string
   openssl rand -base64 32
   ```

2. **Use strong database passwords**:
   ```bash
   # Generate secure passwords
   openssl rand -base64 16
   ```

3. **Store secrets securely**:
   - Use Kubernetes Secrets (recommended)
   - Use cloud provider secret managers (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault)
   - Never commit secrets to version control

---

## Docker Deployment

### Development Deployment

#### 1. Build and Start All Services

```bash
# Start all services in detached mode
docker-compose up -d
```

#### 2. View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f rabbitmq
```

#### 3. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (data will be lost)
docker-compose down -v
```

### Production Deployment

#### 1. Create Production Docker Compose File

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: voting-postgres-prod
    restart: always
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_DATABASE}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - voting-network-prod
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME} -d ${DB_DATABASE}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: voting-redis-prod
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - voting-network-prod
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G

  # RabbitMQ Message Queue
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: voting-rabbitmq-prod
    restart: always
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - voting-network-prod
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "check_running"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G

  # Backend API
  backend:
    image: your-registry/voting-backend:latest
    container_name: voting-backend-prod
    restart: always
    environment:
      NODE_ENV: production
      PORT: 3001
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_DATABASE: ${DB_DATABASE}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      RABBITMQ_HOST: rabbitmq
      RABBITMQ_PORT: 5672
      RABBITMQ_USER: ${RABBITMQ_USER}
      RABBITMQ_PASSWORD: ${RABBITMQ_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION: ${JWT_EXPIRATION}
      CORS_ORIGIN: ${FRONTEND_URL}
    volumes:
      - /app/dist
    networks:
      - voting-network-prod
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  # Frontend
  frontend:
    image: your-registry/voting-frontend:latest
    container_name: voting-frontend-prod
    restart: always
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      APP_NAME: ${APP_NAME}
    volumes:
      - /app/.next
    networks:
      - voting-network-prod
    depends_on:
      - backend
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G

networks:
  voting-network-prod:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
```

#### 2. Build Production Images

```bash
# Build backend
docker build -t your-registry/voting-backend:latest ./backend

# Build frontend
docker build -t your-registry/voting-frontend:latest ./frontend

# Tag for registry
docker tag voting-backend:latest your-registry/voting-backend:latest
docker tag voting-frontend:latest your-registry/voting-frontend:latest

# Push to registry
docker push your-registry/voting-backend:latest
docker push your-registry/voting-frontend:latest
```

#### 3. Deploy Production Stack

```bash
# Create production environment file
cp .env.example .env.prod

# Edit .env.prod with production values

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Verify services are running
docker-compose -f docker-compose.prod.yml ps
```

---

## Kubernetes Deployment

### Prerequisites

1. **Kubernetes Cluster**: v1.24 or higher
2. **kubectl** configured with cluster access
3. **NGINX Ingress Controller** installed
4. **cert-manager** for TLS (optional but recommended)
5. **PersistentVolume provisioner**

### 1. Cluster Setup

#### AWS EKS

```bash
# Install eksctl
brew install eksctl

# Create cluster
eksctl create cluster \
  --name voting-system \
  --version 1.28 \
  --region us-east-1 \
  --nodegroup-name voting-nodes \
  --node-type t3.large \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 10

# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/cloud/deploy.yaml

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
```

#### GCP GKE

```bash
# Create cluster
gcloud container clusters create voting-system \
  --machine-type e2-standard-4 \
  --num-nodes 3 \
  --region us-central1

# Get credentials
gcloud container clusters get-credentials voting-system --region us-central1

# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/cloud/deploy.yaml

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
```

#### Azure AKS

```bash
# Create resource group
az group create --name voting-system-rg --location eastus

# Create cluster
az aks create \
  --resource-group voting-system-rg \
  --name voting-system \
  --node-vm-size Standard_D4s_v3 \
  --node-count 3

# Get credentials
az aks get-credentials --resource-group voting-system-rg --name voting-system

# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/cloud/deploy.yaml

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
```

### 2. Configure Secrets

Before deploying, update the secrets with secure values:

```bash
# Edit database secrets
kubectl apply -f k8s/secrets.yaml

# Or edit interactively
kubectl edit secret database-secrets -n voting-system
kubectl edit secret backend-secrets -n voting-system
kubectl edit secret rabbitmq-secrets -n voting-system
```

### 3. Update ConfigMaps

Edit `k8s/configmaps.yaml` and `k8s/backend/configmap.yaml` with your production values:

- Update `CORS_ORIGIN` to your domain
- Update `NEXT_PUBLIC_API_URL` to your API domain

### 4. Update Ingress

Edit `k8s/ingress.yaml` with your domain:

```yaml
spec:
  tls:
    - hosts:
        - voting.yourdomain.com
        - api.voting.yourdomain.com
      secretName: voting-system-tls
  rules:
    - host: voting.yourdomain.com
    - host: api.voting.yourdomain.com
```

### 5. Deploy to Kubernetes

#### Option A: Using Kustomize (Recommended)

```bash
# Deploy all resources
kubectl apply -k k8s/

# Verify deployment
kubectl get all -n voting-system
```

#### Option B: Using kubectl directly

```bash
# Apply manifests in order
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmaps.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/database/postgres.yaml
kubectl apply -f k8s/database/redis.yaml
kubectl apply -f k8s/rabbitmq/rabbitmq.yaml
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/hpa.yaml
kubectl apply -f k8s/frontend/deployment.yaml
```

### 6. Verify Deployment

```bash
# Check pods
kubectl get pods -n voting-system

# Check services
kubectl get svc -n voting-system

# Check deployments
kubectl get deployments -n voting-system

# Check ingress
kubectl get ingress -n voting-system

# Check HPA
kubectl get hpa -n voting-system
```

---

## Cloud Provider Instructions

### AWS

#### ECR Registry Setup

```bash
# Create ECR repository
aws ecr create-repository --repository-name voting-backend
aws ecr create-repository --repository-name voting-frontend

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag images
docker tag voting-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/voting-backend:latest
docker tag voting-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/voting-frontend:latest

# Push images
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/voting-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/voting-frontend:latest
```

#### Update Kubernetes Deployment

Edit `k8s/backend/deployment.yaml` and update the image:

```yaml
spec:
  template:
    spec:
      containers:
      - name: backend
        image: <account-id>.dkr.ecr.us-east-1.amazonaws.com/voting-backend:latest
```

#### RDS PostgreSQL (Optional)

Instead of running PostgreSQL in Kubernetes, use AWS RDS:

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier voting-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --allocated-storage 100 \
  --master-username postgres \
  --master-user-password <password>
```

#### ElastiCache Redis (Optional)

```bash
# Create Redis cluster
aws elasticache create-replication-group \
  --replication-group-id voting-redis \
  --replication-group-description "Voting System Redis" \
  --cache-node-type cache.t3.medium \
  --engine redis \
  --num-node-groups 1 \
  --replicas-per-node-group 1
```

### GCP

#### GCR Registry Setup

```bash
# Configure Docker
gcloud auth configure-docker

# Tag images
docker tag voting-backend:latest gcr.io/<project-id>/voting-backend:latest
docker tag voting-frontend:latest gcr.io/<project-id>/voting-frontend:latest

# Push images
docker push gcr.io/<project-id>/voting-backend:latest
docker push gcr.io/<project-id>/voting-frontend:latest
```

#### Cloud SQL PostgreSQL

```bash
# Create Cloud SQL instance
gcloud sql instances create voting-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create voting_system --instance=voting-db

# Create user
gcloud sql users set-password postgres \
  --instance=voting-db \
  --password=<password>
```

#### Cloud Memorystore Redis

```bash
# Create Redis instance
gcloud redis instances create voting-redis \
  --size=2 \
  --region=us-central1 \
  --tier=standard
```

### Azure

#### ACR Registry Setup

```bash
# Create Azure Container Registry
az acr create --resource-group voting-system-rg --name votingregistry --sku Standard

# Login to ACR
az acr login --name votingregistry

# Tag images
docker tag voting-backend:latest votingregistry.azurecr.io/voting-backend:latest
docker tag voting-frontend:latest votingregistry.azurecr.io/voting-frontend:latest

# Push images
docker push votingregistry.azurecr.io/voting-backend:latest
docker push votingregistry.azurecr.io/voting-frontend:latest
```

#### Azure Database for PostgreSQL

```bash
# Create PostgreSQL flexible server
az postgres flexible-server create \
  --resource-group voting-system-rg \
  --name voting-db \
  --sku-name Standard_B1ms \
  --storage-size 5120

# Create database
az postgres flexible-server db create \
  --resource-group voting-system-rg \
  --server-name voting-db \
  --database-name voting_system
```

#### Azure Cache for Redis

```bash
# Create Redis cache
az redis create \
  --name voting-redis \
  --resource-group voting-system-rg \
  --sku Standard \
  --vm-size c0
```

---

## Deployment Steps

### Complete Deployment Sequence

#### Step 1: Prepare Environment

```bash
# Clone repository
git clone <repository-url>
cd voting-system

# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Copy environment file
cp .env.example .env
# Edit .env with your configuration
```

#### Step 2: Build Application

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm run build

# Return to root
cd ..
```

#### Step 3: Option A - Docker Compose Deployment

```bash
# Start all services
docker-compose up -d

# Wait for services to be healthy
docker-compose ps

# View logs
docker-compose logs -f
```

#### Step 3: Option B - Kubernetes Deployment

```bash
# Ensure kubectl context is correct
kubectl config current-context

# Deploy to Kubernetes
kubectl apply -k k8s/

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app=voting-system -n voting-system --timeout=300s

# Check status
kubectl get pods -n voting-system
```

#### Step 4: Verify Deployment

```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend
curl http://localhost:3000

# Check services
kubectl get svc -n voting-system

# Get ingress IP
kubectl get ingress -n voting-system
```

---

## Health Verification

### Backend Health Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Basic health check |
| `/health/ready` | GET | Readiness probe |
| `/health/live` | GET | Liveness probe |
| `/metrics` | GET | Prometheus metrics |

### Verify Health

```bash
# Local Docker deployment
curl http://localhost:3001/health

# Kubernetes deployment
kubectl exec -it <backend-pod> -n voting-system -- curl localhost:3001/health

# Check all services
kubectl get pods -n voting-system -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.phase}{"\t"}{.status.conditions[?(@.type=="Ready")].status}{"\n"}{end}'
```

### Database Connectivity

```bash
# Test PostgreSQL connection
kubectl exec -it <postgres-pod> -n voting-system -- psql -U postgres -d voting_system -c "SELECT 1;"

# Test Redis connection
kubectl exec -it <redis-pod> -n voting-system -- redis-cli ping

# Test RabbitMQ connection
kubectl exec -it <rabbitmq-pod> -n voting-system -- rabbitmq-diagnostics check_running
```

---

## Troubleshooting

### Common Issues

#### 1. Pods Not Starting

**Symptom**: Pods remain in `Pending` or `ContainerCreating` state

**Solutions**:
```bash
# Check pod events
kubectl describe pod <pod-name> -n voting-system

# Check if PVC is bound
kubectl get pvc -n voting-system

# Check storage class
kubectl get storageclass
```

#### 2. ImagePullBackOff

**Symptom**: Pods cannot pull container image

**Solutions**:
```bash
# Check image name
kubectl get pod <pod-name> -n voting-system -o jsonpath='{.spec.containers[0].image}'

# Check if image exists in registry
# Verify registry credentials in deployment
```

#### 3. CrashLoopBackOff

**Symptom**: Container repeatedly crashes

**Solutions**:
```bash
# Check logs
kubectl logs <pod-name> -n voting-system --previous

# Check environment variables
kubectl exec <pod-name> -n voting-system -- env

# Verify secrets are correctly mounted
kubectl describe pod <pod-name> -n voting-system
```

#### 4. Database Connection Failed

**Symptom**: Backend cannot connect to PostgreSQL

**Solutions**:
```bash
# Verify PostgreSQL is running
kubectl get pods -n voting-system -l app=postgres

# Check database secrets
kubectl get secret database-secrets -n voting-system -o yaml

# Test connection from backend pod
kubectl exec -it <backend-pod> -n voting-system -- nc -zv postgres-service 5432
```

#### 5. Redis Connection Failed

**Symptom**: Backend cannot connect to Redis

**Solutions**:
```bash
# Verify Redis is running
kubectl get pods -n voting-system -l app=redis

# Check Redis password
kubectl get secret redis-secrets -n voting-system -o yaml

# Test connection
kubectl exec -it <backend-pod> -n voting-system -- nc -zv redis-service 6379
```

#### 6. Ingress Not Working

**Symptom**: Cannot access application through ingress

**Solutions**:
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress resources
kubectl describe ingress -n voting-system

# Check TLS certificate
kubectl get secret voting-system-tls -n voting-system

# Check DNS
nslookup voting.yourdomain.com
```

#### 7. Out of Memory

**Symptom**: Pods killed due to OOM

**Solutions**:
```bash
# Check resource limits
kubectl get pod <pod-name> -n voting-system -o jsonpath='{.spec.containers[0].resources}'

# Check memory usage
kubectl top pods -n voting-system

# Increase memory limits in deployment
kubectl edit deployment <deployment-name> -n voting-system
```

### Diagnostic Commands

```bash
# Get all resources status
kubectl get all -n voting-system

# Get resource usage
kubectl top pods -n voting-system

# View pod logs
kubectl logs -n voting-system -l app=voting-system --tail=100

# Describe resources
kubectl describe <resource-type> <resource-name> -n voting-system

# Execute into container
kubectl exec -it <pod-name> -n voting-system -- /bin/sh

# Check events
kubectl get events -n voting-system --sort-by='.lastTimestamp'

# Port forward for debugging
kubectl port-forward -n voting-system svc/backend-service 3001:3001
kubectl port-forward -n voting-system svc/frontend-service 3000:3000
```

---

## Monitoring

### Health Check Endpoints

| Service | Endpoint | Response |
|---------|----------|----------|
| Backend | `http://<host>:3001/health` | `{ "status": "ok" }` |
| Backend | `http://<host>:3001/health/ready` | `{ "ready": true }` |
| Backend | `http://<host>:3001/health/live` | `{ "alive": true }` |
| Backend | `http://<host>:3001/metrics` | Prometheus metrics |
| Frontend | `http://<host>:3000` | HTML page |
| PostgreSQL | Internal | Port 5432 |
| Redis | Internal | Port 6379 |
| RabbitMQ | `http://<host>:15672` | Management UI |

### Log Access

#### Docker Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last N lines
docker-compose logs --tail=100 backend
```

#### Kubernetes Logs

```bash
# Pod logs
kubectl logs -n voting-system deployment/backend-deployment

# All pods in deployment
kubectl logs -n voting-system -l app=backend

# Previous container logs (for crashes)
kubectl logs -n voting-system <pod-name> --previous

# Export logs to file
kubectl logs -n voting-system -l app=voting-system > voting-system-logs.txt
```

### Monitoring Tools Integration

#### Prometheus + Grafana

If using Prometheus operator:

```bash
# Install Prometheus operator
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.70.0/bundle.yaml

# Create ServiceMonitor
kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: voting-system
  namespace: voting-system
spec:
  selector:
    matchLabels:
      app: voting-system
  endpoints:
  - port: http
    path: /metrics
EOF
```

#### Cloud Monitoring

**AWS CloudWatch**:
```bash
# Install CloudWatch agent
kubectl apply -f https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Container-Insights-EKS-quickstart.html
```

**GCP Cloud Monitoring**:
- Automatically enabled with GKE
- View in Cloud Console under Monitoring

**Azure Monitor**:
```bash
# Enable Azure Monitor for containers
az aks enable-addons -a monitoring -g voting-system-rg -n voting-system
```

---

## Rollback Procedures

### Docker Rollback

```bash
# List previous images
docker images | grep voting-

# Rollback to previous version
docker-compose down
docker-compose up -d voting-backend:<previous-tag>
docker-compose up -d voting-frontend:<previous-tag>
```

### Kubernetes Rollback

#### Rollback Deployment

```bash
# List rollout history
kubectl rollout history deployment/backend-deployment -n voting-system
kubectl rollout history deployment/frontend-deployment -n voting-system

# Rollback to previous revision
kubectl rollout undo deployment/backend-deployment -n voting-system
kubectl rollout undo deployment/frontend-deployment -n voting-system

# Rollback to specific revision
kubectl rollout undo deployment/backend-deployment -n voting-system --to-revision=2
```

#### Rollback Secrets

```bash
# If using GitOps, revert the commit
# Otherwise, manually update secrets
kubectl apply -f k8s/secrets.yaml
```

#### Complete Rollback Sequence

```bash
# 1. Rollback deployments
kubectl rollout undo deployment/backend-deployment -n voting-system
kubectl rollout undo deployment/frontend-deployment -n voting-system

# 2. Verify rollback
kubectl rollout status deployment/backend-deployment -n voting-system
kubectl rollout status deployment/frontend-deployment -n voting-system

# 3. Check pods are running
kubectl get pods -n voting-system

# 4. Verify health
curl http://<backend-url>/health
```

### Emergency Rollback Script

```bash
#!/bin/bash
# emergency-rollback.sh

NAMESPACE="voting-system"
BACKEND_DEPLOY="backend-deployment"
FRONTEND_DEPLOY="frontend-deployment"

echo "Starting emergency rollback..."

# Rollback deployments
echo "Rolling back backend..."
kubectl rollout undo deployment/$BACKEND_DEPLOY -n $NAMESPACE

echo "Rolling back frontend..."
kubectl rollout undo deployment/$FRONTEND_DEPLOY -n $NAMESPACE

# Wait for rollout to complete
echo "Waiting for backend rollout..."
kubectl rollout status deployment/$BACKEND_DEPLOY -n $NAMESPACE --timeout=300s

echo "Waiting for frontend rollout..."
kubectl rollout status deployment/$FRONTEND_DEPLOY -n $NAMESPACE --timeout=300s

# Verify
echo "Verifying rollback..."
kubectl get pods -n $NAMESPACE

echo "Emergency rollback complete!"
```

---

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [GCP GKE Documentation](https://cloud.google.com/kubernetes-engine/docs)
- [Azure AKS Documentation](https://docs.microsoft.com/azure/aks/)

---

## Support

For deployment issues:
1. Check the troubleshooting section
2. Review pod logs
3. Verify environment configuration
4. Contact the development team
