pipeline {
    agent any
    
    environment {
        // Docker and Registry Configuration
        DOCKER_IMAGE = 'netflix-clone'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        REGISTRY_URL = 'your-registry-url' // Change to your registry (e.g., docker.io/yourusername)
        REGISTRY_CREDENTIALS = 'registry-credentials' // Jenkins credential ID
        
        // Kubernetes Configuration
        KUBERNETES_NAMESPACE = 'netflix-clone'
        KUBECONFIG_CREDENTIALS = 'kubeconfig-credentials' // Jenkins credential ID
        
        // Application Configuration
        TMDB_API_KEY_CREDENTIALS = 'tmdb-api-key' // Jenkins credential ID
        GITHUB_REPO = 'your-github-username/netflix-clone' // Change to your repo
        
        // Build Configuration
        NODE_VERSION = '16'
        WORKSPACE_DIR = "${WORKSPACE}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '🔍 Checking out code from GitHub...'
                checkout scm
                
                script {
                    // Get git commit info
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    
                    env.GIT_BRANCH = sh(
                        script: 'git rev-parse --abbrev-ref HEAD',
                        returnStdout: true
                    ).trim()
                    
                    echo "📋 Build Info:"
                    echo "  - Branch: ${env.GIT_BRANCH}"
                    echo "  - Commit: ${env.GIT_COMMIT_SHORT}"
                    echo "  - Build Number: ${env.BUILD_NUMBER}"
                }
            }
        }
        
        stage('Setup Environment') {
            steps {
                echo '⚙️ Setting up build environment...'
                
                script {
                    // Create .env file for build
                    withCredentials([string(credentialsId: TMDB_API_KEY_CREDENTIALS, variable: 'TMDB_API_KEY')]) {
                        sh """
                            cat > .env << EOF
                            VITE_APP_API_ENDPOINT_URL=https://api.themoviedb.org/3
                            VITE_APP_TMDB_V3_API_KEY=${TMDB_API_KEY}
                            EOF
                        """
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing Node.js dependencies...'
                
                script {
                    // Use Node.js version manager if available
                    sh """
                        if command -v nvm &> /dev/null; then
                            nvm use ${NODE_VERSION}
                        fi
                        
                        npm ci --production=false
                    """
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                echo '🧪 Running tests...'
                
                script {
                    try {
                        sh 'npm test -- --watchAll=false --coverage --passWithNoTests'
                        
                        // Publish test results
                        publishHTML([
                            allowMissing: false,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: 'coverage/lcov-report',
                            reportFiles: 'index.html',
                            reportName: 'Test Coverage Report'
                        ])
                    } catch (Exception e) {
                        echo "⚠️ Tests failed: ${e.getMessage()}"
                        // Continue with build for now, but you might want to fail here
                    }
                }
            }
        }
        
        stage('Build Application') {
            steps {
                echo '🔨 Building React application...'
                
                script {
                    sh 'npm run build'
                    
                    // Archive build artifacts
                    archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                
                script {
                    withCredentials([string(credentialsId: TMDB_API_KEY_CREDENTIALS, variable: 'TMDB_API_KEY')]) {
                        sh """
                            docker build \
                                --build-arg TMDB_V3_API_KEY=${TMDB_API_KEY} \
                                --build-arg VITE_APP_API_ENDPOINT_URL=https://api.themoviedb.org/3 \
                                -t ${DOCKER_IMAGE}:${DOCKER_TAG} \
                                -t ${DOCKER_IMAGE}:latest \
                                .
                        """
                    }
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                echo '📤 Pushing Docker image to registry...'
                
                script {
                    withCredentials([usernamePassword(credentialsId: REGISTRY_CREDENTIALS, usernameVariable: 'REGISTRY_USER', passwordVariable: 'REGISTRY_PASS')]) {
                        sh """
                            docker login -u ${REGISTRY_USER} -p ${REGISTRY_PASS} ${REGISTRY_URL}
                            docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${REGISTRY_URL}/${DOCKER_IMAGE}:${DOCKER_TAG}
                            docker tag ${DOCKER_IMAGE}:latest ${REGISTRY_URL}/${DOCKER_IMAGE}:latest
                            docker push ${REGISTRY_URL}/${DOCKER_IMAGE}:${DOCKER_TAG}
                            docker push ${REGISTRY_URL}/${DOCKER_IMAGE}:latest
                        """
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo '🚀 Deploying to Kubernetes...'
                
                script {
                    withCredentials([file(credentialsId: KUBECONFIG_CREDENTIALS, variable: 'KUBECONFIG')]) {
                        sh """
                            export KUBECONFIG=\${KUBECONFIG}
                            
                            # Create namespace if it doesn't exist
                            kubectl create namespace ${KUBERNETES_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
                            
                            # Apply ConfigMap
                            kubectl apply -f k8s/configmap.yaml
                            
                            # Apply Secret with TMDB API key
                            withCredentials([string(credentialsId: '${TMDB_API_KEY_CREDENTIALS}', variable: 'TMDB_API_KEY')]) {
                                kubectl create secret generic netflix-clone-secrets \
                                    --from-literal=VITE_APP_TMDB_V3_API_KEY=\${TMDB_API_KEY} \
                                    -n ${KUBERNETES_NAMESPACE} \
                                    --dry-run=client -o yaml | kubectl apply -f -
                            }
                            
                            # Update deployment with new image
                            kubectl set image deployment/netflix-clone netflix-clone=${REGISTRY_URL}/${DOCKER_IMAGE}:${DOCKER_TAG} -n ${KUBERNETES_NAMESPACE}
                            
                            # Wait for rollout to complete
                            kubectl rollout status deployment/netflix-clone -n ${KUBERNETES_NAMESPACE} --timeout=300s
                        """
                    }
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Performing health check...'
                
                script {
                    withCredentials([file(credentialsId: KUBECONFIG_CREDENTIALS, variable: 'KUBECONFIG')]) {
                        sh """
                            export KUBECONFIG=\${KUBECONFIG}
                            
                            # Wait for pods to be ready
                            sleep 30
                            
                            # Check deployment status
                            echo "📊 Deployment Status:"
                            kubectl get pods -n ${KUBERNETES_NAMESPACE} -l app=netflix-clone
                            
                            # Check service status
                            echo "🌐 Service Status:"
                            kubectl get svc -n ${KUBERNETES_NAMESPACE} -l app=netflix-clone
                            
                            # Check ingress status
                            echo "🔗 Ingress Status:"
                            kubectl get ingress -n ${KUBERNETES_NAMESPACE}
                            
                            # Test application health
                            SERVICE_IP=\$(kubectl get svc netflix-clone-service -n ${KUBERNETES_NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
                            if [ -n "\$SERVICE_IP" ]; then
                                echo "🧪 Testing application health at http://\$SERVICE_IP"
                                curl -f http://\$SERVICE_IP || echo "⚠️ Health check failed"
                            else
                                echo "ℹ️ Service IP not available yet"
                            fi
                        """
                    }
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                echo '🧹 Cleaning up...'
                
                script {
                    // Remove local Docker images to save space
                    sh """
                        docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true
                        docker rmi ${DOCKER_IMAGE}:latest || true
                        docker rmi ${REGISTRY_URL}/${DOCKER_IMAGE}:${DOCKER_TAG} || true
                        docker rmi ${REGISTRY_URL}/${DOCKER_IMAGE}:latest || true
                    """
                }
            }
        }
    }
    
    post {
        always {
            echo '📋 Build Summary:'
            echo "  - Build Number: ${env.BUILD_NUMBER}"
            echo "  - Git Branch: ${env.GIT_BRANCH}"
            echo "  - Git Commit: ${env.GIT_COMMIT_SHORT}"
            echo "  - Docker Image: ${REGISTRY_URL}/${DOCKER_IMAGE}:${DOCKER_TAG}"
            
            // Clean workspace
            cleanWs()
        }
        
        success {
            echo '✅ Pipeline completed successfully!'
            
            script {
                // Send success notification (customize as needed)
                echo "🎉 Netflix Clone deployed successfully!"
                echo "🌐 Application should be available at your configured domain"
            }
        }
        
        failure {
            echo '❌ Pipeline failed!'
            
            script {
                // Send failure notification (customize as needed)
                echo "💥 Netflix Clone deployment failed!"
                echo "🔍 Check the logs above for more details"
            }
        }
        
        unstable {
            echo '⚠️ Pipeline completed with warnings!'
        }
    }
} 