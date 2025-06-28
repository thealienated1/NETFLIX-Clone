# Jenkins Pipeline Setup for Netflix Clone

## Prerequisites

### 1. Jenkins Server Setup
- Jenkins 2.387+ with the following plugins:
  - Pipeline
  - Docker Pipeline
  - Kubernetes CLI
  - Credentials Binding
  - HTML Publisher
  - Git

### 2. Required Tools on Jenkins Server
- Docker
- kubectl
- Node.js 16+
- Git

### 3. External Services
- Docker Registry (Docker Hub, AWS ECR, GCR, etc.)
- Kubernetes Cluster
- GitHub Repository

## Jenkins Credentials Setup

### 1. Docker Registry Credentials
**Type:** Username with password
**ID:** `registry-credentials`
**Description:** Docker registry login credentials
**Username:** Your registry username
**Password:** Your registry password/token

### 2. Kubernetes Configuration
**Type:** Secret file
**ID:** `kubeconfig-credentials`
**Description:** Kubernetes cluster configuration
**File:** Your kubeconfig file

### 3. TMDB API Key
**Type:** Secret text
**ID:** `tmdb-api-key`
**Description:** The Movie Database API key
**Secret:** Your TMDB API key

## Pipeline Configuration

### 1. Create New Pipeline Job
1. Go to Jenkins Dashboard
2. Click "New Item"
3. Enter job name: `netflix-clone-pipeline`
4. Select "Pipeline"
5. Click "OK"

### 2. Configure Pipeline
1. **General Settings:**
   - Check "Discard old builds"
   - Set "Days to keep builds": 30
   - Set "Max # of builds to keep": 10

2. **Build Triggers:**
   - **GitHub hook trigger for GITScm polling** (if using webhooks)
   - **Poll SCM** (alternative: `H/5 * * * *` for every 5 minutes)

3. **Pipeline Definition:**
   - Select "Pipeline script from SCM"
   - **SCM:** Git
   - **Repository URL:** `https://github.com/your-username/netflix-clone.git`
   - **Credentials:** Add your GitHub credentials if private repo
   - **Branch Specifier:** `*/main` (or your default branch)
   - **Script Path:** `Jenkinsfile`

### 3. Environment Variables
Update the following variables in the Jenkinsfile:

```groovy
// Change these values in Jenkinsfile
REGISTRY_URL = 'docker.io/yourusername'  // Your Docker registry
GITHUB_REPO = 'your-username/netflix-clone'  // Your GitHub repo
```

## Kubernetes Setup

### 1. Apply Kubernetes Resources
```bash
# Apply all resources
kubectl apply -f k8s/

# Or apply individually
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### 2. Update Secret with Real API Key
```bash
# Replace 'your-actual-tmdb-api-key' with your real API key
kubectl create secret generic netflix-clone-secrets \
  --from-literal=VITE_APP_TMDB_V3_API_KEY=your-actual-tmdb-api-key \
  -n netflix-clone \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 3. Configure Ingress
Update `k8s/ingress.yaml` with your domain:
```yaml
spec:
  rules:
  - host: your-domain.com  # Change this
```

## Pipeline Stages Overview

### 1. Checkout
- Clones code from GitHub
- Extracts git information

### 2. Setup Environment
- Creates `.env` file with TMDB API key
- Sets up build environment

### 3. Install Dependencies
- Installs Node.js dependencies
- Uses npm ci for reproducible builds

### 4. Run Tests
- Executes Jest tests
- Publishes test coverage reports
- Continues on test failure (configurable)

### 5. Build Application
- Builds React app with Vite
- Archives build artifacts

### 6. Build Docker Image
- Builds Docker image with TMDB API key
- Tags with build number and latest

### 7. Push to Registry
- Logs into Docker registry
- Pushes images to registry

### 8. Deploy to Kubernetes
- Applies Kubernetes resources
- Updates deployment with new image
- Waits for rollout completion

### 9. Health Check
- Verifies deployment status
- Tests application health
- Reports service status

### 10. Cleanup
- Removes local Docker images
- Cleans workspace

## Monitoring and Troubleshooting

### 1. Pipeline Logs
- Check Jenkins build logs for detailed information
- Each stage has clear logging with emojis

### 2. Kubernetes Status
```bash
# Check deployment status
kubectl get pods -n netflix-clone

# Check service status
kubectl get svc -n netflix-clone

# Check ingress status
kubectl get ingress -n netflix-clone

# View pod logs
kubectl logs -f deployment/netflix-clone -n netflix-clone
```

### 3. Common Issues

#### Docker Build Fails
- Check if Docker is running on Jenkins server
- Verify Docker registry credentials
- Check Dockerfile syntax

#### Kubernetes Deployment Fails
- Verify kubeconfig credentials
- Check if namespace exists
- Verify resource limits and requests

#### Tests Fail
- Check if all dependencies are installed
- Verify Jest configuration
- Check for TypeScript compilation errors

## Security Considerations

### 1. Secrets Management
- Never commit API keys to Git
- Use Jenkins credentials for sensitive data
- Rotate API keys regularly

### 2. Network Security
- Use private Docker registries when possible
- Configure network policies in Kubernetes
- Use HTTPS for all external communications

### 3. Access Control
- Limit Jenkins access to authorized users
- Use role-based access control (RBAC) in Kubernetes
- Audit pipeline executions regularly

## Scaling Considerations

### 1. Horizontal Pod Autoscaling
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: netflix-clone-hpa
  namespace: netflix-clone
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: netflix-clone
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 2. Resource Optimization
- Monitor resource usage
- Adjust CPU and memory limits
- Use node selectors for specific hardware requirements

## Backup and Recovery

### 1. Pipeline Configuration
- Store Jenkinsfile in Git
- Use Jenkins Configuration as Code (JCasC)
- Backup Jenkins configuration regularly

### 2. Application Data
- Backup Kubernetes resources
- Store Docker images in multiple registries
- Document deployment procedures

## Support and Maintenance

### 1. Regular Updates
- Keep Jenkins and plugins updated
- Update base Docker images regularly
- Monitor for security vulnerabilities

### 2. Performance Monitoring
- Monitor pipeline execution times
- Track resource usage
- Optimize build and deployment processes 