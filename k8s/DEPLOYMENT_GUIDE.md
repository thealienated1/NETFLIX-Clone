# Kubernetes Deployment Guide

## Prerequisites

1. **Kubernetes cluster** (minikube, kind, or cloud provider)
2. **kubectl** configured to access your cluster
3. **Container registry** (Docker Hub, GCR, ECR, etc.)
4. **TMDB API key** from [The Movie Database](https://www.themoviedb.org/settings/api)

## Pre-deployment Steps

### 1. Build and Push Docker Image

```bash
# Build the image
docker build -t your-registry-url/netflix-clone:latest .

# Push to registry
docker push your-registry-url/netflix-clone:latest
```

### 2. Update Configuration Files

#### Update `k8s/deployment.yaml`:
Replace `your-registry-url/netflix-clone:latest` with your actual image URL.

#### Update `k8s/secret.yaml`:
```bash
# Encode your TMDB API key
echo -n "your-actual-tmdb-api-key" | base64

# Update the secret.yaml file with the encoded value
```

### 3. Create Container Registry Secret

```bash
kubectl create secret docker-registry registry-secret \
  --docker-server=<your-registry-server> \
  --docker-username=<your-username> \
  --docker-password=<your-password> \
  --namespace=netflix-clone
```

## Deployment

### Option 1: Using Kustomize (Recommended)

```bash
# Apply all resources
kubectl apply -k k8s/

# Check deployment status
kubectl get all -n netflix-clone
```

### Option 2: Individual Files

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply configuration
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deploy application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

## Verification

```bash
# Check all resources
kubectl get all -n netflix-clone

# Check pods
kubectl get pods -n netflix-clone

# Check logs
kubectl logs -f deployment/netflix-clone -n netflix-clone

# Check service
kubectl get svc -n netflix-clone

# Check ingress
kubectl get ingress -n netflix-clone
```

## Access the Application

### Local Development (minikube/kind):
```bash
# Enable ingress addon (if using minikube)
minikube addons enable ingress

# Get the IP
kubectl get ingress -n netflix-clone

# Add to /etc/hosts (if needed)
echo "$(minikube ip) netflix-clone.local" | sudo tee -a /etc/hosts
```

### Production:
Update the host in `k8s/ingress.yaml` with your actual domain.

## Troubleshooting

### Common Issues:

1. **Image pull errors**: Check registry secret and image URL
2. **Pod crashes**: Check logs with `kubectl logs`
3. **Ingress not working**: Verify ingress controller is installed
4. **API key issues**: Verify secret is properly encoded

### Useful Commands:

```bash
# Describe resources for debugging
kubectl describe pod <pod-name> -n netflix-clone
kubectl describe ingress netflix-clone-ingress -n netflix-clone

# Port forward for testing
kubectl port-forward svc/netflix-clone-service 8080:80 -n netflix-clone

# Delete and recreate
kubectl delete -k k8s/
kubectl apply -k k8s/
```

## Scaling

```bash
# Scale deployment
kubectl scale deployment netflix-clone --replicas=5 -n netflix-clone

# Auto-scaling (requires HPA)
kubectl autoscale deployment netflix-clone --cpu-percent=80 --min=2 --max=10 -n netflix-clone
``` 