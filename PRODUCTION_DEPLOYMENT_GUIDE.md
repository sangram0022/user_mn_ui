# Production Deployment Guide

## 🚀 Complete Production Deployment Guide for React 19 User Management Application

This comprehensive guide covers everything needed to deploy the React 19 User Management application to production with 100% production readiness.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Infrastructure Deployment](#infrastructure-deployment)
5. [Application Deployment](#application-deployment)
6. [Monitoring & Observability](#monitoring--observability)
7. [Security Configuration](#security-configuration)
8. [Performance Optimization](#performance-optimization)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance & Updates](#maintenance--updates)

## Prerequisites

### Required Tools
- **Node.js 20.x**: `node --version`
- **Docker 24.x**: `docker --version`
- **AWS CLI**: `aws --version`
- **Terraform 1.6+**: `terraform --version`
- **GitLab CLI**: `glab --version`

### AWS Setup
```bash
# Configure AWS credentials
aws configure

# Verify access
aws sts get-caller-identity
```

### Environment Variables
```bash
# Required for deployment
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_DEFAULT_REGION=us-east-1
export DOCKER_REGISTRY=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com
```

## Environment Setup

### 1. Clone and Setup Repository
```bash
git clone <repository-url>
cd usermn1
npm ci
```

### 2. Environment Configuration
```bash
# Copy and configure environment files
cp .env.example .env.production

# Edit production environment variables
nano .env.production
```

**Required Environment Variables:**
- `VITE_API_BASE_URL`: Production API endpoint
- `AWS_ACCOUNT_ID`: AWS account ID
- `DOMAIN`: Production domain name
- `SSL_CERTIFICATE_ARN`: SSL certificate ARN
- `ALERT_EMAIL`: Email for production alerts

### 3. Pre-deployment Validation
```bash
# Run all quality checks
make test-all
make security-audit
make lint-check
make type-check
```

## CI/CD Pipeline

### GitLab CI/CD Configuration

The pipeline consists of two phases:

#### Phase 1: Quality Gates (Automatic)
- **Validation**: Code quality, security, dependencies
- **Build**: Production build with optimizations
- **Test**: Unit, integration, e2e, performance tests
- **Security**: SAST, dependency scan, container scan
- **Package**: Docker image build and push to ECR

#### Phase 2: Deployment (Manual Approval)
- **Infrastructure**: Terraform apply for AWS resources
- **Application**: ECS service deployment
- **Post-deploy**: Health checks, smoke tests, monitoring setup

### Pipeline Commands
```bash
# Trigger pipeline manually
git push origin main

# Check pipeline status
glab ci status

# View pipeline logs
glab ci trace
```

## Infrastructure Deployment

### 1. Terraform Backend Setup
```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://your-terraform-state-bucket-${AWS_ACCOUNT_ID}

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### 2. Initialize Terraform
```bash
cd terraform

# Initialize with backend configuration
terraform init \
  -backend-config="bucket=your-terraform-state-bucket-${AWS_ACCOUNT_ID}" \
  -backend-config="key=react-app/terraform.tfstate" \
  -backend-config="region=${AWS_DEFAULT_REGION}" \
  -backend-config="dynamodb_table=terraform-state-lock"
```

### 3. Deploy Infrastructure
```bash
# Plan infrastructure changes
make terraform-plan

# Apply infrastructure (production approval required)
make terraform-apply
```

### Infrastructure Components Created:
- **VPC**: Multi-AZ network with public/private subnets
- **ECS Fargate**: Container orchestration
- **ALB**: Load balancer with SSL termination
- **ECR**: Container registry
- **WAF**: Web application firewall
- **CloudWatch**: Logging and monitoring
- **IAM**: Security roles and policies

## Application Deployment

### 1. Build and Push Docker Image
```bash
# Build production Docker image
make docker-build-production

# Login to ECR
make docker-login

# Push to registry
make docker-push
```

### 2. Deploy to ECS
```bash
# Deploy ECS service
make deploy-ecs

# Check deployment status
aws ecs describe-services \
  --cluster your-cluster-name \
  --services your-service-name
```

### 3. Verify Deployment
```bash
# Health check
curl https://your-domain.com/health

# Application check
curl https://your-domain.com/

# Load balancer status
aws elbv2 describe-target-health \
  --target-group-arn your-target-group-arn
```

## Monitoring & Observability

### CloudWatch Dashboards
- **Application Metrics**: Response time, error rate, throughput
- **Infrastructure Metrics**: CPU, memory, network usage
- **Business Metrics**: User registrations, logins, feature usage

### Alerts Configuration
```bash
# CPU utilization alert
aws cloudwatch put-metric-alarm \
  --alarm-name "ECS-CPU-High" \
  --alarm-description "ECS CPU utilization high" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Log Analysis
```bash
# View application logs
aws logs tail /ecs/your-app-name --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /ecs/your-app-name \
  --filter-pattern "ERROR"
```

## Security Configuration

### SSL/TLS Certificate
```bash
# Request ACM certificate
aws acm request-certificate \
  --domain-name your-domain.com \
  --subject-alternative-names *.your-domain.com \
  --validation-method DNS
```

### WAF Rules
- **Rate limiting**: 100 requests per 5 minutes per IP
- **Geographic blocking**: Configurable country restrictions
- **SQL injection protection**: OWASP Core Rule Set
- **XSS protection**: Cross-site scripting prevention

### Security Headers (Nginx)
- `Strict-Transport-Security`: Force HTTPS
- `Content-Security-Policy`: Prevent XSS attacks
- `X-Frame-Options`: Prevent clickjacking
- `X-Content-Type-Options`: Prevent MIME sniffing

## Performance Optimization

### Build Optimizations
- **Code splitting**: Automatic route-based splitting
- **Tree shaking**: Remove unused code
- **Asset compression**: Gzip and Brotli compression
- **Image optimization**: WebP format, lazy loading

### Runtime Optimizations
- **Service Worker**: Offline support and caching
- **Virtual Scrolling**: Handle large data sets
- **Request Deduplication**: Prevent duplicate API calls
- **Performance Monitoring**: Web Vitals tracking

### Performance Budgets
- **Bundle size**: < 500KB (JavaScript)
- **First Contentful Paint**: < 2 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1

## Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check ECS task logs
aws ecs describe-tasks --cluster your-cluster --tasks task-id

# Check container logs
aws logs get-log-events \
  --log-group-name /ecs/your-app \
  --log-stream-name container-stream
```

#### 2. High Response Times
```bash
# Check ALB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

#### 3. Database Connection Issues
```bash
# Check RDS connectivity
aws rds describe-db-instances --db-instance-identifier your-db

# Test network connectivity
telnet your-db-endpoint 5432
```

### Emergency Procedures

#### Rollback Deployment
```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster your-cluster \
  --service your-service \
  --task-definition your-app:previous-revision
```

#### Scale Resources
```bash
# Scale ECS service
aws ecs update-service \
  --cluster your-cluster \
  --service your-service \
  --desired-count 10
```

## Maintenance & Updates

### Regular Maintenance Tasks

#### Weekly
- Review CloudWatch logs for errors
- Check security vulnerability scans
- Validate backup integrity
- Review performance metrics

#### Monthly
- Update dependencies (`npm audit`)
- Review and rotate secrets
- Capacity planning review
- Cost optimization analysis

#### Quarterly
- Security audit and penetration testing
- Disaster recovery testing
- Performance benchmark comparison
- Infrastructure cost review

### Update Procedures

#### Application Updates
```bash
# 1. Create feature branch
git checkout -b feature/update

# 2. Update code and test locally
npm run test:all

# 3. Create merge request
glab mr create

# 4. Deploy to staging
git push origin feature/update

# 5. Production deployment (after approval)
git checkout main
git merge feature/update
git push origin main
```

#### Infrastructure Updates
```bash
# 1. Update Terraform configurations
# 2. Plan changes
terraform plan -out=plan.out

# 3. Apply changes (with approval)
terraform apply plan.out
```

### Backup and Recovery

#### Database Backups
- **Automated**: Daily RDS snapshots (7-day retention)
- **Manual**: Pre-deployment snapshots
- **Cross-region**: Weekly cross-region backup replication

#### Application State
- **Configuration**: Backed up in GitLab repository
- **User uploads**: S3 with versioning enabled
- **Secrets**: AWS Secrets Manager with rotation

### Disaster Recovery

#### Recovery Time Objectives (RTO)
- **Application**: 15 minutes
- **Database**: 30 minutes
- **Full system**: 1 hour

#### Recovery Point Objectives (RPO)
- **Application data**: 5 minutes
- **User data**: 1 hour
- **Configuration**: Real-time (GitLab)

## Support and Documentation

### Team Contacts
- **DevOps Team**: devops@yourcompany.com
- **Security Team**: security@yourcompany.com
- **On-call Engineer**: +1-XXX-XXX-XXXX

### Additional Resources
- **Architecture Documentation**: `docs/architecture.md`
- **API Documentation**: `docs/api.md`
- **Runbooks**: `docs/runbooks/`
- **Incident Response**: `docs/incident-response.md`

---

## 🔒 Security Checklist

- [ ] SSL certificate configured and valid
- [ ] WAF rules enabled and tested
- [ ] Security headers configured
- [ ] Secrets rotated and secured
- [ ] IAM roles follow least privilege
- [ ] VPC security groups configured
- [ ] Database encryption enabled
- [ ] Backup encryption enabled
- [ ] Log retention policies set
- [ ] Incident response plan ready

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Infrastructure deployed successfully
- [ ] Application deployed and healthy
- [ ] Load balancer health checks passing
- [ ] Monitoring dashboards configured
- [ ] Alerts configured and tested
- [ ] Backup systems verified
- [ ] Performance metrics baseline established
- [ ] Security scan completed
- [ ] Documentation updated

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Maintained By**: DevOps Team