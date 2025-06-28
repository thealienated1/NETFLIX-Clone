# Quick Jenkins Pipeline Setup

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites
- Jenkins server with Docker and kubectl installed
- GitHub repository with your Netflix clone code
- Docker registry account (Docker Hub, etc.)
- Kubernetes cluster access

### 2. Jenkins Credentials (Required)
Add these credentials in Jenkins → Manage Jenkins → Credentials → System → Global credentials:

| ID | Type | Description |
|---|---|---|
| `registry-credentials` | Username with password | Docker registry login |
| `kubeconfig-credentials` | Secret file | Kubernetes config file |
| `tmdb-api-key` | Secret text | Your TMDB API key |

### 3. Create Pipeline Job
1. **New Item** → **Pipeline** → Name: `netflix-clone`
2. **Pipeline** → **Pipeline script from SCM**
3. **SCM** → **Git** → Repository: `https://github.com/YOUR_USERNAME/netflix-clone.git`
4. **Script Path**: `Jenkinsfile`

### 4. Update Configuration
Edit the `Jenkinsfile` and change these lines:
```groovy
REGISTRY_URL = 'docker.io/YOUR_USERNAME'  // Your Docker registry
GITHUB_REPO = 'YOUR_USERNAME/netflix-clone'  // Your GitHub repo
```

### 5. Deploy to Kubernetes
```bash
# Apply Kubernetes resources
kubectl apply -f k8s/

# Update with your TMDB API key
kubectl create secret generic netflix-clone-secrets \
  --from-literal=VITE_APP_TMDB_V3_API_KEY=YOUR_ACTUAL_API_KEY \
  -n netflix-clone \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 6. Run Pipeline
Click **Build Now** in Jenkins!

## 📋 What the Pipeline Does

1. **🔍 Checkout** - Gets code from GitHub
2. **⚙️ Setup** - Creates environment file
3. **📦 Install** - Installs Node.js dependencies
4. **🧪 Test** - Runs Jest tests
5. **🔨 Build** - Builds React app
6. **🐳 Docker** - Builds Docker image
7. **📤 Push** - Pushes to registry
8. **🚀 Deploy** - Deploys to Kubernetes
9. **🏥 Health Check** - Verifies deployment
10. **🧹 Cleanup** - Cleans up resources

## 🔧 Troubleshooting

### Common Issues:
- **Docker not found**: Install Docker on Jenkins server
- **kubectl not found**: Install kubectl on Jenkins server
- **Credentials error**: Check credential IDs match Jenkinsfile
- **Registry push fails**: Verify registry credentials

### Quick Commands:
```bash
# Check Jenkins logs
tail -f /var/log/jenkins/jenkins.log

# Check Kubernetes status
kubectl get pods -n netflix-clone

# Check Docker images
docker images | grep netflix-clone
```

## 🎯 Next Steps

1. **Customize domain** in `k8s/ingress.yaml`
2. **Add monitoring** with Prometheus/Grafana
3. **Set up webhooks** for automatic builds
4. **Configure notifications** (Slack, email, etc.)
5. **Add security scanning** (Trivy, Snyk)

## 📞 Support

- Check Jenkins build logs for detailed errors
- Verify all credentials are correctly configured
- Ensure Kubernetes cluster is accessible
- Test Docker registry login manually first 