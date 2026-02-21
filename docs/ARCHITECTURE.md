# Documentation d'Architecture

## 1. Schéma d'Architecture AWS

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet                                │
└────────────────────────────┬──────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Application Load Balancer (ALB)                      │
│              (via Ingress Controller)                            │
└────────────────────────────┬──────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                             │
        ▼                                             ▼
┌──────────────────┐                        ┌──────────────────┐
│   Frontend Pods  │                        │   Backend Pods   │
│   (React/Nginx)  │                        │   (Node.js)      │
│   EKS Cluster    │                        │   EKS Cluster    │
└──────────────────┘                        └────────┬─────────┘
                                                     │
                        ┌───────────────────────────┼───────────────────────────┐
                        │                           │                           │
                        ▼                           ▼                           ▼
                ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
                │  RDS Instance │          │  SQS Queue   │          │ CloudWatch   │
                │    MySQL      │          │  + DLQ       │          │  Logs/Metrics│
                │  (Private)    │          │              │          │              │
                └──────────────┘          └──────┬───────┘          └──────────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │  SQS Worker Pods │
                                          │  (EKS Cluster)   │
                                          └──────────────────┘
```

### Composants Principaux

1. **VPC (Virtual Private Cloud)**
   - CIDR: 10.0.0.0/16
   - 2 Availability Zones
   - Subnets publics et privés

2. **EKS Cluster**
   - Kubernetes 1.28
   - Node Group: t3.medium instances
   - Auto-scaling: 1-4 nodes

3. **RDS MySQL**
   - Instance: db.t3.micro
   - Multi-AZ: Non (pour économiser les coûts)
   - Backup: 7 jours de rétention

4. **SQS Queue**
   - Standard Queue
   - Dead Letter Queue (DLQ)
   - Visibility Timeout: 5 minutes

5. **ECR (Elastic Container Registry)**
   - Repositories: backend, frontend
   - Lifecycle policy: Garde les 10 dernières images

6. **CloudWatch**
   - Log Groups pour application, backend, frontend
   - Métriques EKS
   - Alertes CPU/Memory

## 2. Schéma du Pipeline CI/CD

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                         │
└────────────────────────────┬───────────────────────────────────┘
                              │
                              │ Push / PR
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                      │
└────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Build & Test │    │ Build Images  │    │ Terraform    │
│              │    │              │    │ Plan/Apply   │
│ - Install    │    │ - Backend     │    │              │
│ - Lint       │    │ - Frontend    │    │ - Validate   │
│ - Test       │    │              │    │ - Plan       │
│ - Build      │    │              │    │ - Apply      │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       │                   ▼                   │
       │            ┌──────────────┐           │
       │            │  Push to ECR  │           │
       │            │              │           │
       │            │ - Tag images │           │
       │            │ - Push       │           │
       │            └──────┬───────┘           │
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Deploy to EKS    │
                  │                 │
                  │ - Update config │
                  │ - Apply k8s     │
                  │ - Verify        │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Rollback (if    │
                  │    failure)      │
                  └─────────────────┘
```

### Étapes du Pipeline

1. **Trigger**: Push sur `main` ou `develop`
2. **Build & Test**: Validation du code
3. **Build Images**: Construction Docker multi-stage
4. **Push to ECR**: Publication des images
5. **Deploy**: Application des manifests Kubernetes
6. **Verify**: Vérification du déploiement
7. **Rollback**: En cas d'échec

## 3. Schéma Kubernetes (Pods, Services)

```
Namespace: devops-ppp
│
├── ConfigMap (app-config)
│   └── Configuration non-sensible
│
├── Secret (app-secrets)
│   └── DATABASE_URL, JWT_SECRET, SQS_QUEUE_URL
│
├── ServiceAccount (sqs-consumer)
│   └── Annotation: IAM Role ARN (IRSA)
│
├── Deployment: frontend
│   ├── Replicas: 2 (min) - 8 (max via HPA)
│   ├── Image: ECR/frontend:latest
│   ├── Resources: 128Mi-256Mi RAM, 100m-200m CPU
│   ├── Liveness/Readiness Probes
│   └── Service: frontend-service (LoadBalancer)
│
├── Deployment: backend
│   ├── Replicas: 2 (min) - 10 (max via HPA)
│   ├── Image: ECR/backend:latest
│   ├── Resources: 256Mi-512Mi RAM, 250m-500m CPU
│   ├── Env: DATABASE_URL, JWT_SECRET, SQS_QUEUE_URL
│   ├── Liveness/Readiness Probes
│   └── Service: backend-service (ClusterIP)
│
├── Deployment: sqs-worker
│   ├── Replicas: 1 (min) - 5 (max via HPA)
│   ├── Image: ECR/backend:latest (same image, different command)
│   ├── Command: node dist/server/src/workers/sqs-worker.js
│   ├── ServiceAccount: sqs-consumer (IRSA)
│   ├── Env: SQS_QUEUE_URL, AWS_REGION
│   └── Resources: 256Mi-512Mi RAM, 250m-500m CPU
│
├── HorizontalPodAutoscaler (HPA)
│   ├── backend-hpa: CPU 70%, Memory 80%
│   ├── frontend-hpa: CPU 70%, Memory 80%
│   └── sqs-worker-hpa: CPU 70%, Memory 80%
│
└── Ingress
    └── NGINX Ingress Controller
        ├── Route / → frontend-service
        └── Route /api → backend-service
```

### Stratégies de Déploiement

- **Rolling Update**: Mise à jour progressive sans interruption
- **Max Surge**: 1 pod supplémentaire pendant le déploiement
- **Max Unavailable**: 0 (disponibilité maximale)

## 4. Schéma Réseau (VPC, Subnets, Sécurité)

```
┌─────────────────────────────────────────────────────────────┐
│                    VPC: 10.0.0.0/16                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Availability Zone: us-east-1a                │  │
│  │                                                       │  │
│  │  ┌──────────────────┐    ┌──────────────────┐      │  │
│  │  │ Public Subnet    │    │ Private Subnet   │      │  │
│  │  │ 10.0.1.0/24      │    │ 10.0.101.0/24    │      │  │
│  │  │                  │    │                  │      │  │
│  │  │ - NAT Gateway    │    │ - EKS Nodes      │      │  │
│  │  │ - Load Balancer  │    │ - RDS (Primary)   │      │  │
│  │  └──────────────────┘    └──────────────────┘      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Availability Zone: us-east-1b                │  │
│  │                                                       │  │
│  │  ┌──────────────────┐    ┌──────────────────┐      │  │
│  │  │ Public Subnet    │    │ Private Subnet   │      │  │
│  │  │ 10.0.2.0/24      │    │ 10.0.102.0/24    │      │  │
│  │  │                  │    │                  │      │  │
│  │  │ - NAT Gateway    │    │ - EKS Nodes      │      │  │
│  │  │                  │    │ - RDS (Standby)  │      │  │
│  │  └──────────────────┘    └──────────────────┘      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Internet Gateway                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Security Groups

1. **EKS Cluster SG**
   - Ingress: Port 443 depuis Internet (API)
   - Egress: All traffic

2. **EKS Node SG**
   - Ingress: Port 1025-65535 depuis Cluster SG
   - Egress: All traffic

3. **RDS SG**
   - Ingress: Port 5432 depuis EKS Node SG
   - Egress: None

4. **ALB SG**
   - Ingress: Port 80, 443 depuis Internet
   - Egress: All traffic

### Routes

- **Public Subnets**: Route vers Internet Gateway
- **Private Subnets**: Route vers NAT Gateway

## 5. Flux de Traitement SQS

```
┌──────────────────┐
│  Backend API     │
│  (Order Created) │
└────────┬─────────┘
         │
         │ Send Message
         ▼
┌──────────────────┐
│   SQS Queue      │
│                  │
│  - Message Body  │
│  - Attributes    │
└────────┬─────────┘
         │
         │ Receive Message
         ▼
┌──────────────────┐
│  SQS Worker      │
│                  │
│  1. Receive      │
│  2. Process      │
│  3. Delete       │
└────────┬─────────┘
         │
         │ (On Failure)
         ▼
┌──────────────────┐
│  Dead Letter     │
│  Queue (DLQ)     │
│                  │
│  - Failed msgs   │
│  - Manual review │
└──────────────────┘
```

### Types de Messages

- `ORDER_CREATED`: Commande créée
- `TRANSACTION_PROCESSED`: Transaction traitée
- `CONTACT_UPDATED`: Contact mis à jour

## 6. Monitoring et Observabilité

```
┌─────────────────────────────────────────────────────────────┐
│                    CloudWatch                                │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Log Groups     │  │  Metrics          │                │
│  │                 │  │                   │                │
│  │ - /aws/.../app  │  │ - CPU Utilization │                │
│  │ - /aws/.../     │  │ - Memory Usage    │                │
│  │   backend       │  │ - Request Count   │                │
│  │ - /aws/.../     │  │ - Error Rate      │                │
│  │   frontend      │  │ - SQS Queue Depth │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Dashboards     │  │  Alarms           │                │
│  │                 │  │                   │                │
│  │ - Application   │  │ - High CPU        │                │
│  │ - Infrastructure│  │ - High Memory     │                │
│  │ - SQS Metrics   │  │ - Error Rate      │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## 7. Sécurité

### IAM Roles

1. **EKS Cluster Role**
   - `AmazonEKSClusterPolicy`

2. **EKS Node Role**
   - `AmazonEKSWorkerNodePolicy`
   - `AmazonEKS_CNI_Policy`
   - `AmazonEC2ContainerRegistryReadOnly`

3. **SQS Consumer Role (IRSA)**
   - `sqs:ReceiveMessage`
   - `sqs:DeleteMessage`
   - `sqs:GetQueueAttributes`
   - `sqs:SendMessage`

### Secrets Management

- **Kubernetes Secrets**: Pour configuration runtime
- **AWS Secrets Manager**: (Optionnel) Pour secrets sensibles
- **Encryption**: Chiffrement au repos (RDS, EBS)

### Best Practices

- ✅ Principe du moindre privilège
- ✅ Pas de credentials en dur
- ✅ Chiffrement des données
- ✅ Security Groups restrictifs
- ✅ Subnets privés pour ressources sensibles
- ✅ Images scannées (ECR)
- ✅ Non-root user dans conteneurs

## 8. Optimisation des Coûts

### Stratégies

1. **Instances**: Utilisation de t3.medium (burstable)
2. **RDS**: db.t3.micro, pas de Multi-AZ en dev
3. **EKS**: Auto-scaling pour ajuster la capacité
4. **ECR**: Lifecycle policy (garde 10 images)
5. **CloudWatch**: Rétention de logs limitée (30 jours)
6. **SQS**: Standard queue (pas de FIFO)

### Estimation Mensuelle (Approximative)

- EKS Cluster: ~$73/mois
- EKS Nodes (2x t3.medium): ~$60/mois
- RDS (db.t3.micro): ~$15/mois
- NAT Gateways (2x): ~$65/mois
- ECR: ~$1/mois
- SQS: ~$0.40/mois
- CloudWatch: ~$5/mois
- **Total**: ~$220/mois

---

**Note**: Les coûts varient selon l'utilisation réelle. Surveillez avec AWS Cost Explorer.
