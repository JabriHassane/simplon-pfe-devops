# Guide de Déploiement

## Prérequis

1. AWS Account avec permissions appropriées
2. AWS CLI installé et configuré
3. kubectl installé
4. Terraform 1.5+ installé
5. Docker installé
6. Accès GitHub avec Actions activées

## Étape 1: Configuration AWS

### 1.1 Créer un IAM User

```bash
# Créer un utilisateur IAM avec les permissions suivantes:
# - AmazonEKSFullAccess
# - AmazonEC2FullAccess
# - AmazonRDSFullAccess
# - AmazonSQSFullAccess
# - AmazonEC2ContainerRegistryFullAccess
# - CloudWatchFullAccess
# - IAMFullAccess (pour créer des rôles)
```

### 1.2 Configurer AWS CLI

```bash
aws configure
# Entrer Access Key ID, Secret Access Key, Region (us-east-1)
```

## Étape 2: Déploiement de l'Infrastructure avec Terraform

### 2.1 Préparer les Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Éditer terraform.tfvars avec vos valeurs
```

### 2.2 Initialiser Terraform

```bash
terraform init
```

### 2.3 Planifier le Déploiement

```bash
terraform plan -var-file=terraform.tfvars
```

### 2.4 Appliquer l'Infrastructure

```bash
terraform apply -var-file=terraform.tfvars
```

**Note**: Cela prendra 15-20 minutes pour créer le cluster EKS.

### 2.5 Récupérer les Outputs

```bash
# Récupérer les informations importantes
terraform output

# Noter:
# - eks_cluster_name
# - rds_endpoint
# - sqs_queue_url
# - ecr_repository_urls
```

## Étape 3: Configuration du Cluster EKS

### 3.1 Mettre à jour kubeconfig

```bash
aws eks update-kubeconfig \
  --name devops-ppp-production-cluster \
  --region us-east-1
```

### 3.2 Vérifier la Connexion

```bash
kubectl get nodes
```

### 3.3 Installer les Add-ons EKS

```bash
# Installer AWS Load Balancer Controller (optionnel)
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller/crds?ref=master"

# Installer NGINX Ingress Controller (optionnel)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/aws/deploy.yaml
```

## Étape 4: Configuration des Secrets Kubernetes

### 4.1 Créer les Secrets

```bash
kubectl create namespace devops-ppp

kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL="mysql://admin:password@rds-endpoint:3306/dbname" \
  --from-literal=JWT_SECRET="your-jwt-secret-key-min-32-chars" \
  --from-literal=SQS_QUEUE_URL="https://sqs.us-east-1.amazonaws.com/ACCOUNT_ID/devops-ppp-production-queue" \
  --from-literal=AWS_REGION="us-east-1" \
  -n devops-ppp
```

### 4.2 Mettre à jour le ServiceAccount pour IRSA

```bash
# Récupérer l'OIDC Provider ID
aws eks describe-cluster \
  --name devops-ppp-production-cluster \
  --query "cluster.identity.oidc.issuer" \
  --output text

# Mettre à jour k8s/secrets.yaml avec le role ARN
# Puis appliquer
kubectl apply -f k8s/secrets.yaml
```

## Étape 5: Build et Push des Images Docker

### 5.1 Se connecter à ECR

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

### 5.2 Build Backend Image

```bash
docker build -f dockerfile -t devops-ppp-production-backend:latest .
docker tag devops-ppp-production-backend:latest \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/devops-ppp-production-backend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/devops-ppp-production-backend:latest
```

### 5.3 Build Frontend Image

```bash
docker build -f client/Dockerfile -t devops-ppp-production-frontend:latest .
docker tag devops-ppp-production-frontend:latest \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/devops-ppp-production-frontend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/devops-ppp-production-frontend:latest
```

## Étape 6: Mise à jour des Manifests Kubernetes

### 6.1 Remplacer les Placeholders

```bash
# Dans tous les fichiers k8s/*.yaml, remplacer:
# ACCOUNT_ID → votre AWS Account ID
# REGION → us-east-1

sed -i 's/ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/g' k8s/*.yaml
```

### 6.2 Appliquer les Manifests

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/sqs-worker-deployment.yaml
kubectl apply -f k8s/hpa.yaml
```

## Étape 7: Vérification du Déploiement

### 7.1 Vérifier les Pods

```bash
kubectl get pods -n devops-ppp
# Attendre que tous les pods soient en "Running"
```

### 7.2 Vérifier les Services

```bash
kubectl get services -n devops-ppp
# Noter l'EXTERNAL-IP du frontend-service
```

### 7.3 Vérifier les HPA

```bash
kubectl get hpa -n devops-ppp
```

### 7.4 Vérifier les Logs

```bash
# Backend logs
kubectl logs -f deployment/backend -n devops-ppp

# Frontend logs
kubectl logs -f deployment/frontend -n devops-ppp

# SQS Worker logs
kubectl logs -f deployment/sqs-worker -n devops-ppp
```

## Étape 8: Configuration CI/CD (GitHub Actions)

### 8.1 Configurer les Secrets GitHub

Dans GitHub → Settings → Secrets and variables → Actions, ajouter:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCOUNT_ID`
- `VITE_API_URL` (URL du backend)
- `DB_PASSWORD`

### 8.2 Le Pipeline se Déclenche Automatiquement

À chaque push sur `main`, le pipeline:
1. Build et teste le code
2. Build les images Docker
3. Push vers ECR
4. Déploie sur EKS

## Étape 9: Tests Post-Déploiement

### 9.1 Tester l'Application

```bash
# Récupérer l'URL du Load Balancer
kubectl get service frontend-service -n devops-ppp

# Tester l'endpoint de santé
curl http://EXTERNAL-IP/api/health
```

### 9.2 Tester SQS

```bash
# Vérifier les messages dans la queue
aws sqs get-queue-attributes \
  --queue-url <SQS_QUEUE_URL> \
  --attribute-names All
```

### 9.3 Vérifier CloudWatch

```bash
# Voir les logs
aws logs tail /aws/devops-ppp/production/backend --follow
```

## Étape 10: Migration de la Base de Données

### 10.1 Exécuter les Migrations Prisma

```bash
# Se connecter à un pod backend
kubectl exec -it deployment/backend -n devops-ppp -- sh

# Dans le pod
cd /app/server
npx prisma migrate deploy
npx prisma db seed
```

## Dépannage

### Problème: Pods en CrashLoopBackOff

```bash
# Vérifier les logs
kubectl logs deployment/backend -n devops-ppp

# Vérifier les événements
kubectl describe pod <pod-name> -n devops-ppp
```

### Problème: Cannot connect to RDS

- Vérifier les Security Groups
- Vérifier que RDS est dans les subnets privés
- Vérifier DATABASE_URL dans les secrets

### Problème: SQS Worker ne reçoit pas de messages

- Vérifier les permissions IAM (IRSA)
- Vérifier SQS_QUEUE_URL dans les secrets
- Vérifier les logs du worker

### Problème: Images ne se mettent pas à jour

```bash
# Forcer le redéploiement
kubectl rollout restart deployment/backend -n devops-ppp
kubectl rollout restart deployment/frontend -n devops-ppp
```

## Rollback

### Rollback d'un Déploiement

```bash
# Voir l'historique
kubectl rollout history deployment/backend -n devops-ppp

# Rollback vers la version précédente
kubectl rollout undo deployment/backend -n devops-ppp
```

### Destruction de l'Infrastructure

```bash
cd terraform
terraform destroy -var-file=terraform.tfvars
```

**Attention**: Cela supprimera toutes les ressources AWS créées!

---

Pour plus d'informations, consultez la [documentation principale](../README.md).
