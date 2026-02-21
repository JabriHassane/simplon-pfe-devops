# DevOps Project - PPP (Projet de Fin d'Études)

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Stack Technique](#stack-technique)
4. [Prérequis](#prérequis)
5. [Installation et Déploiement](#installation-et-déploiement)
6. [Structure du Projet](#structure-du-projet)
7. [Documentation Technique](#documentation-technique)
8. [CI/CD](#cicd)
9. [Monitoring](#monitoring)
10. [Sécurité](#sécurité)

## 🎯 Vue d'ensemble

Ce projet est une application complète de gestion (Frontend + Backend) déployée sur AWS avec une architecture DevOps complète. Il sert de support technique pour l'application des pratiques DevOps et Cloud AWS.

### Objectifs du Projet

- ✅ Architecture Cloud AWS complète (VPC, EKS, RDS, SQS)
- ✅ Conteneurisation avec Docker (multi-stage builds)
- ✅ Orchestration avec Kubernetes (Amazon EKS)
- ✅ Infrastructure as Code avec Terraform
- ✅ Pipeline CI/CD automatisé (GitHub Actions)
- ✅ Traitement asynchrone avec AWS SQS
- ✅ Monitoring et observabilité avec CloudWatch
- ✅ Bonnes pratiques de sécurité Cloud

## 🏗️ Architecture

### Architecture AWS

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Load Balancer                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐            ┌───────────────┐
│   Frontend    │            │    Backend     │
│   (React)     │            │   (Node.js)    │
│   EKS Pods    │            │   EKS Pods     │
└───────────────┘            └───────┬────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌───────────┐   ┌───────────┐   ┌───────────┐
            │   MySQL   │   │   Queue   │   │   Logs    │
```

### Architecture Réseau (VPC)

```
VPC (10.0.0.0/16)
├── Public Subnets (10.0.1.0/24, 10.0.2.0/24)
│   ├── Internet Gateway
│   ├── NAT Gateways
│   └── Load Balancer
│
└── Private Subnets (10.0.101.0/24, 10.0.102.0/24)
    ├── EKS Cluster Nodes
    ├── RDS Instance
    └── SQS Workers
```

### Architecture Kubernetes

```
Namespace: devops-ppp
├── Frontend Deployment (2+ replicas)
│   ├── Service (LoadBalancer)
│   └── HPA (2-8 replicas)
│
├── Backend Deployment (2+ replicas)
│   ├── Service (ClusterIP)
│   └── HPA (2-10 replicas)
│
├── SQS Worker Deployment (1+ replicas)
│   └── HPA (1-5 replicas)
│
├── ConfigMap (app-config)
├── Secrets (app-secrets)
└── Ingress (NGINX)
```

### Pipeline CI/CD

```
┌─────────────┐
│   Git Push  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  GitHub Actions │
└──────┬──────────┘
       │
       ├──► Build & Test
       │    ├── Install dependencies
       │    ├── Lint code
       │    └── Run tests
       │
       ├──► Build Docker Images
       │    ├── Build backend image
       │    └── Build frontend image
       │
       ├──► Push to ECR
       │    └── Tag and push images
       │
       └──► Deploy to EKS
            ├── Update kubeconfig
            ├── Apply manifests
            └── Verify deployment
```

## 🛠️ Stack Technique

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: TanStack Query
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL 8.0

### Infrastructure
- **Cloud Provider**: AWS
- **Container Orchestration**: Kubernetes (Amazon EKS)
- **IaC**: Terraform
- **CI/CD**: GitHub Actions
- **Container Registry**: Amazon ECR
- **Message Queue**: AWS SQS
- **Monitoring**: CloudWatch

### DevOps Tools
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Service Mesh**: (Optional)
- **Monitoring**: CloudWatch Logs & Metrics
- **Secrets Management**: Kubernetes Secrets + AWS Secrets Manager

## 📦 Prérequis

### Local Development
- Node.js 18+
- MySQL (or use Docker)
- kubectl
- Terraform 1.5+

### AWS Account
- AWS Account with appropriate permissions
- IAM user with EKS, ECR, RDS, SQS, CloudWatch access
- Domain name (optional, for production)

## 🚀 Installation et Déploiement

### 1. Configuration Locale

```bash
# Clone the repository
git clone <repository-url>
cd DevOps-Project-PPP

# Install dependencies
cd server && npm install
cd ../client && npm install
cd ../shared && npm install
```

### 2. Configuration des Variables d'Environnement

#### Backend (.env.production)
```env
NODE_ENV=production
DATABASE_URL=mysql://admin:password@rds-endpoint:3306/dbname
CLIENT_URL=http://frontend-url
SQS_QUEUE_URL=https://sqs.region.amazonaws.com/account/queue-name
AWS_REGION=us-east-1
CLOUDWATCH_LOG_GROUP=/aws/devops-ppp/production/backend
LOG_LEVEL=info
```

#### Frontend (.env.production)
```env
VITE_API_URL=http://backend-url
```

### 3. Déploiement de l'Infrastructure avec Terraform

```bash
cd terraform

# Initialize Terraform
terraform init

# Review the plan
terraform plan -var-file=terraform.tfvars

# Apply infrastructure
terraform apply -var-file=terraform.tfvars
```

**Note**: Créez `terraform.tfvars` à partir de `terraform.tfvars.example` et configurez vos variables.

### 4. Configuration du Cluster EKS

```bash
# Update kubeconfig
aws eks update-kubeconfig --name devops-ppp-production-cluster --region us-east-1

# Verify connection
kubectl get nodes
```

### 5. Déploiement de l'Application sur Kubernetes

```bash
# Update image URLs in k8s manifests (replace ACCOUNT_ID and REGION)
# Then apply manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml

  --from-literal=DATABASE_URL="mysql://admin:password@rds-endpoint:3306/dbname" \
  --from-literal=SQS_QUEUE_URL="..." \
  --from-literal=AWS_REGION="us-east-1" \
  -n devops-ppp

# Apply deployments
kubectl apply -f k8s/
```

### 6. Vérification du Déploiement

```bash
# Check pods
kubectl get pods -n devops-ppp

# Check services
kubectl get services -n devops-ppp

# Check HPA
kubectl get hpa -n devops-ppp

# View logs
kubectl logs -f deployment/backend -n devops-ppp
```

## 📁 Structure du Projet

```
DevOps-Project-PPP/
├── client/                 # Frontend React application
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   └── sqs.service.ts
│   │   ├── workers/
│   │   │   └── sqs-worker.ts
│   │   └── utils/
│   │       └── logger.ts
│   ├── prisma/
│   ├── Dockerfile
│   └── package.json
│
├── shared/                 # Shared DTOs and constants
│   └── dtos/
│
├── terraform/              # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── modules/
│       ├── vpc/
│       ├── eks/
│       ├── rds/
│       ├── sqs/
│       ├── ecr/
│       ├── iam/
│       └── cloudwatch/
│
├── k8s/                    # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── sqs-worker-deployment.yaml
│   ├── hpa.yaml
│   └── ingress.yaml
│
├── .github/
│   └── workflows/
│       ├── ci-cd.yml
│       └── terraform.yml
│
├── docker-compose.yml      # Local development
└── README.md
```

## 📚 Documentation Technique

### Partie 1: Application Support
- Application simple Frontend (React) + Backend (Node.js)
- Configuration par variables d'environnement
- Génération de logs applicatifs avec Winston

### Partie 2: Conteneurisation Docker
- Dockerfiles optimisés avec multi-stage builds
- Séparation Frontend/Backend
- Images publiées sur Amazon ECR

### Partie 3: Cloud AWS & Réseau
- VPC avec subnets publics et privés
- Security Groups configurés
- IAM roles avec principe du moindre privilège

### Partie 4: Kubernetes avec EKS
- Cluster EKS configuré
- Deployments et Services
- ConfigMaps et Secrets
- HPA (Horizontal Pod Autoscaler)
- Rolling Updates

### Partie 5: Infrastructure as Code (Terraform)
- Infrastructure complète provisionnée
- Modules réutilisables
- State management (S3 backend recommandé)

### Partie 6: CI/CD
- Pipeline GitHub Actions
- Build, test, et push d'images
- Déploiement automatique sur EKS
- Gestion des rollbacks

### Partie 7: Traitement Asynchrone (SQS)
- File SQS avec DLQ
- Envoi de messages depuis le Backend
- Worker pour traitement des messages

### Partie 8: Monitoring & Observabilité
- CloudWatch Logs pour logs applicatifs
- Métriques CPU, mémoire, requêtes
- Dashboards CloudWatch
- Alertes configurées

### Partie 9: Sécurité & Bonnes Pratiques
- Principe du moindre privilège (IAM)
- Secrets gérés via Kubernetes Secrets
- Chiffrement des données (RDS, EBS)
- Optimisation des coûts AWS

## 🔄 CI/CD

Le pipeline CI/CD est configuré dans `.github/workflows/ci-cd.yml`:

1. **Build & Test**: Installation, lint, tests
2. **Build Images**: Construction des images Docker
3. **Push to ECR**: Publication sur Amazon ECR
4. **Deploy to EKS**: Déploiement automatique
5. **Rollback**: En cas d'échec

### Secrets GitHub Requis

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCOUNT_ID`
- `VITE_API_URL`
- `DB_PASSWORD`

## 📊 Monitoring

### CloudWatch Logs
- Logs applicatifs centralisés
- Logs système Kubernetes
- Rétention configurable (30 jours)

### Métriques
- CPU et mémoire des pods
- Nombre de requêtes
- Latence des réponses
- Messages SQS

### Alertes
- CPU > 80%
- Mémoire > 80%
- Erreurs applicatives

## 🔒 Sécurité

### IAM
- Rôles IAM avec moindre privilège
- IRSA (IAM Roles for Service Accounts) pour pods EKS
- Pas de credentials en dur

### Secrets
- Kubernetes Secrets pour configuration
- AWS Secrets Manager (optionnel)
- Chiffrement des données au repos

### Réseau
- Security Groups restrictifs
- Subnets privés pour ressources sensibles
- Pas d'exposition directe de la base de données

### Conteneurs
- Images scannées (ECR)
- Non-root user dans les conteneurs
- Health checks configurés

## 🧪 Tests Locaux

```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev

# Docker Compose
docker-compose up
```

## 📝 Notes Importantes

1. **Coûts AWS**: Surveillez les coûts, surtout pour EKS et RDS
2. **Secrets**: Ne commitez jamais de secrets dans le repo
3. **State Terraform**: Utilisez un backend S3 pour le state
4. **Backup RDS**: Configurez les backups automatiques
5. **Monitoring**: Configurez les alertes de budget AWS

## 🎓 Présentation

Pour la soutenance, préparez:
- Schémas d'architecture (VPC, K8s, CI/CD)
- Démonstration du déploiement
- Justification des choix techniques
- Métriques et monitoring
- Optimisation des coûts

## 📞 Support

Pour toute question ou problème, consultez la documentation ou ouvrez une issue.

---

**Auteur**: [Votre Nom]  
**Date**: 2024  
**Projet de Fin d'Études - DevOps & Cloud AWS**
