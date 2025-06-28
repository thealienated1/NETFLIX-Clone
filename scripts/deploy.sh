#!/bin/bash

# Netflix Clone Kubernetes Deployment Script
set -e

# Configuration
NAMESPACE="netflix-clone"
REGISTRY_URL="your-registry-url"
IMAGE_TAG="${1:-latest}"

echo "🚀 Starting Netflix Clone deployment..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if namespace exists, create if not
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo "📦 Creating namespace: $NAMESPACE"
    kubectl apply -f k8s/namespace.yaml
fi

# Apply ConfigMap
echo "⚙️  Applying ConfigMap..."
kubectl apply -f k8s/configmap.yaml

# Apply Secret (make sure to update with your actual API key)
echo "🔐 Applying Secret..."
kubectl apply -f k8s/secret.yaml

# Update deployment with new image tag
echo "🔄 Updating deployment with image: $REGISTRY_URL/netflix-clone:$IMAGE_TAG"
kubectl set image deployment/netflix-clone netflix-clone=$REGISTRY_URL/netflix-clone:$IMAGE_TAG -n $NAMESPACE

# Apply other resources
echo "📋 Applying Kubernetes resources..."
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Wait for deployment to be ready
echo "⏳ Waiting for deployment to be ready..."
kubectl rollout status deployment/netflix-clone -n $NAMESPACE

# Check deployment status
echo "✅ Deployment completed successfully!"
echo "📊 Deployment status:"
kubectl get pods -n $NAMESPACE -l app=netflix-clone
kubectl get svc -n $NAMESPACE -l app=netflix-clone

echo "🌐 Application should be available at: http://netflix-clone.local"
echo "💡 To access locally, add 'netflix-clone.local' to your /etc/hosts file" 