# Comprehensive Makefile for React 19 Application
# Provides all build, test, security, and deployment automation

.PHONY: help install-dependencies clean build-development build-production test-unit test-integration test-e2e test-coverage test-performance test-accessibility lint-check type-check format-check security-audit vulnerability-scan docker-build docker-push terraform-validate terraform-plan terraform-apply deploy-ecs sonar-analysis lighthouse-audit

# Default target
.DEFAULT_GOAL := help

# Configuration Variables
APP_NAME := usermn1
NODE_VERSION := 20
REACT_VERSION := 19
DOCKER_REGISTRY := $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_DEFAULT_REGION).amazonaws.com
IMAGE_TAG := $(shell git rev-parse --short HEAD)
ENVIRONMENT := $(if $(filter main,$(CI_COMMIT_REF_NAME)),prod,dev)
TERRAFORM_DIR := terraform
BUILD_DIR := dist
COVERAGE_DIR := coverage
REPORTS_DIR := reports

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# ============================================================================
# HELP TARGET
# ============================================================================

help: ## Show this help message
	@echo "$(BLUE)Available targets:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-30s$(NC) %s\n", $$1, $$2}'

# ============================================================================
# SETUP AND DEPENDENCIES
# ============================================================================

install-dependencies: ## Install project dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	npm ci --prefer-offline --no-audit
	@echo "$(GREEN)Dependencies installed successfully$(NC)"

install-dev-dependencies: ## Install development dependencies
	@echo "$(BLUE)Installing development dependencies...$(NC)"
	npm install --save-dev \
		@types/jest \
		@testing-library/react \
		@testing-library/jest-dom \
		@testing-library/user-event \
		jest \
		jest-environment-jsdom \
		jest-junit \
		playwright \
		@playwright/test \
		lighthouse \
		pa11y \
		eslint \
		@typescript-eslint/eslint-plugin \
		@typescript-eslint/parser \
		prettier \
		sonarjs \
		audit-ci
	@echo "$(GREEN)Development dependencies installed successfully$(NC)"

clean: ## Clean build artifacts and dependencies
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	rm -rf $(BUILD_DIR) $(COVERAGE_DIR) $(REPORTS_DIR) node_modules docker-image.tar
	@echo "$(GREEN)Clean completed$(NC)"

# ============================================================================
# BUILD TARGETS
# ============================================================================

build-development: ## Build application for development
	@echo "$(BLUE)Building application for development...$(NC)"
	mkdir -p $(BUILD_DIR)
	npm run build:dev
	@echo "$(GREEN)Development build completed$(NC)"

build-production: ## Build application for production
	@echo "$(BLUE)Building application for production...$(NC)"
	mkdir -p $(BUILD_DIR)
	NODE_ENV=production npm run build
	npm run optimize-build
	@echo "$(GREEN)Production build completed$(NC)"

build-storybook: ## Build Storybook for component documentation
	@echo "$(BLUE)Building Storybook...$(NC)"
	npm run build-storybook
	@echo "$(GREEN)Storybook build completed$(NC)"

# ============================================================================
# TESTING TARGETS
# ============================================================================

test-unit: ## Run unit tests
	@echo "$(BLUE)Running unit tests...$(NC)"
	mkdir -p $(REPORTS_DIR)
	npm run test:unit -- --coverage --coverageDirectory=$(COVERAGE_DIR) --reporters=default --reporters=jest-junit
	@echo "$(GREEN)Unit tests completed$(NC)"

test-integration: ## Run integration tests
	@echo "$(BLUE)Running integration tests...$(NC)"
	mkdir -p $(REPORTS_DIR)
	npm run test:integration -- --reporter=junit --reporter-options=outputDir=$(REPORTS_DIR),outputFile=integration-junit.xml
	@echo "$(GREEN)Integration tests completed$(NC)"

test-e2e: ## Run end-to-end tests with Playwright
	@echo "$(BLUE)Running E2E tests...$(NC)"
	mkdir -p $(REPORTS_DIR)
	npx playwright install --with-deps
	npx playwright test --reporter=junit
	@echo "$(GREEN)E2E tests completed$(NC)"

test-e2e-ui: ## Run E2E tests with UI mode
	@echo "$(BLUE)Running E2E tests in UI mode...$(NC)"
	npx playwright test --ui

test-coverage: ## Generate and validate test coverage
	@echo "$(BLUE)Generating test coverage report...$(NC)"
	npm run test:coverage
	@echo "$(BLUE)Validating coverage threshold...$(NC)"
	npm run coverage:check
	@echo "$(GREEN)Coverage validation completed$(NC)"

test-performance: ## Run performance tests
	@echo "$(BLUE)Running performance tests...$(NC)"
	mkdir -p $(REPORTS_DIR)
	npm run test:performance
	@echo "$(GREEN)Performance tests completed$(NC)"

test-accessibility: ## Run accessibility tests
	@echo "$(BLUE)Running accessibility tests...$(NC)"
	mkdir -p $(REPORTS_DIR)
	npx pa11y-ci --sitemap http://localhost:3000/sitemap.xml --reporter json > $(REPORTS_DIR)/pa11y-report.json || true
	@echo "$(GREEN)Accessibility tests completed$(NC)"

test-visual: ## Run visual regression tests
	@echo "$(BLUE)Running visual regression tests...$(NC)"
	mkdir -p $(REPORTS_DIR)
	npm run test:visual
	@echo "$(GREEN)Visual regression tests completed$(NC)"

test-all: test-unit test-integration test-e2e test-performance test-accessibility ## Run all tests

# ============================================================================
# CODE QUALITY TARGETS
# ============================================================================

lint-check: ## Check code linting
	@echo "$(BLUE)Running linting checks...$(NC)"
	mkdir -p $(REPORTS_DIR)
	npm run lint -- --format junit --output-file $(REPORTS_DIR)/lint-report.xml
	@echo "$(GREEN)Linting checks completed$(NC)"

lint-fix: ## Fix linting issues
	@echo "$(BLUE)Fixing linting issues...$(NC)"
	npm run lint:fix
	@echo "$(GREEN)Linting fixes applied$(NC)"

type-check: ## Run TypeScript type checking
	@echo "$(BLUE)Running TypeScript type checking...$(NC)"
	npm run type-check
	@echo "$(GREEN)Type checking completed$(NC)"

format-check: ## Check code formatting
	@echo "$(BLUE)Checking code formatting...$(NC)"
	npm run format:check
	@echo "$(GREEN)Format checking completed$(NC)"

format-fix: ## Fix code formatting
	@echo "$(BLUE)Fixing code formatting...$(NC)"
	npm run format
	@echo "$(GREEN)Code formatting fixed$(NC)"

sonar-analysis: ## Run SonarQube analysis
	@echo "$(BLUE)Running SonarQube analysis...$(NC)"
	mkdir -p $(REPORTS_DIR)
	sonar-scanner \
		-Dsonar.projectKey=$(APP_NAME) \
		-Dsonar.sources=src \
		-Dsonar.tests=src \
		-Dsonar.test.inclusions="**/*.test.tsx,**/*.test.ts" \
		-Dsonar.typescript.lcov.reportPaths=$(COVERAGE_DIR)/lcov.info \
		-Dsonar.testExecutionReportPaths=$(REPORTS_DIR)/jest-junit.xml
	@echo "$(GREEN)SonarQube analysis completed$(NC)"

# ============================================================================
# SECURITY TARGETS
# ============================================================================

security-audit: ## Run security audit
	@echo "$(BLUE)Running security audit...$(NC)"
	mkdir -p $(REPORTS_DIR)
	npm audit --audit-level=moderate --json > $(REPORTS_DIR)/npm-audit.json || true
	audit-ci --config audit-ci.json
	@echo "$(GREEN)Security audit completed$(NC)"

vulnerability-scan: ## Scan for vulnerabilities
	@echo "$(BLUE)Scanning for vulnerabilities...$(NC)"
	mkdir -p $(REPORTS_DIR)
	# Snyk security scan
	npx snyk test --json > $(REPORTS_DIR)/snyk-report.json || true
	# OSV scanner
	npx @google/osv-scanner --lockfile package-lock.json --format json --output $(REPORTS_DIR)/osv-report.json || true
	@echo "$(GREEN)Vulnerability scan completed$(NC)"

license-check: ## Check license compliance
	@echo "$(BLUE)Checking license compliance...$(NC)"
	npx license-checker --json --out $(REPORTS_DIR)/licenses.json
	@echo "$(GREEN)License check completed$(NC)"

# ============================================================================
# DOCKER TARGETS
# ============================================================================

build-docker-image: ## Build Docker image locally
	@echo "$(BLUE)Building Docker image...$(NC)"
	docker build -t $(APP_NAME):$(IMAGE_TAG) -f Dockerfile .
	docker tag $(APP_NAME):$(IMAGE_TAG) $(APP_NAME):latest
	@echo "$(GREEN)Docker image built successfully$(NC)"

docker-build-production: ## Build production Docker image with multi-stage
	@echo "$(BLUE)Building production Docker image...$(NC)"
	docker build \
		--target production \
		--build-arg NODE_VERSION=$(NODE_VERSION) \
		--build-arg REACT_VERSION=$(REACT_VERSION) \
		--build-arg BUILD_DATE="$(shell date -u +%Y-%m-%dT%H:%M:%SZ)" \
		--build-arg VCS_REF="$(shell git rev-parse --short HEAD)" \
		--tag $(DOCKER_REGISTRY)/$(APP_NAME):$(IMAGE_TAG) \
		--tag $(DOCKER_REGISTRY)/$(APP_NAME):latest \
		.
	@echo "$(GREEN)Production Docker image built$(NC)"

docker-scan-security: ## Scan Docker image for security vulnerabilities
	@echo "$(BLUE)Scanning Docker image for security vulnerabilities...$(NC)"
	mkdir -p $(REPORTS_DIR)
	# Trivy security scan
	trivy image --format json --output $(REPORTS_DIR)/trivy-report.json $(APP_NAME):$(IMAGE_TAG) || true
	# Docker Scout scan (if available)
	docker scout cves $(APP_NAME):$(IMAGE_TAG) --format json --output $(REPORTS_DIR)/scout-report.json || true
	@echo "$(GREEN)Docker security scan completed$(NC)"

docker-login: ## Login to Docker registry
	@echo "$(BLUE)Logging into Docker registry...$(NC)"
	aws ecr get-login-password --region $(AWS_DEFAULT_REGION) | docker login --username AWS --password-stdin $(DOCKER_REGISTRY)
	@echo "$(GREEN)Docker login successful$(NC)"

docker-push: ## Push Docker image to registry
	@echo "$(BLUE)Pushing Docker image to registry...$(NC)"
	docker push $(DOCKER_REGISTRY)/$(APP_NAME):$(IMAGE_TAG)
	docker push $(DOCKER_REGISTRY)/$(APP_NAME):latest
	@echo "$(GREEN)Docker image pushed successfully$(NC)"

# ============================================================================
# PERFORMANCE TARGETS
# ============================================================================

lighthouse-audit: ## Run Lighthouse performance audit
	@echo "$(BLUE)Running Lighthouse audit...$(NC)"
	mkdir -p $(REPORTS_DIR)
	npm run start:ci &
	sleep 10
	lighthouse \
		http://localhost:3000 \
		--chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" \
		--output json \
		--output-path $(REPORTS_DIR)/lighthouse-report.json \
		--budget-path lighthouse-budget.json
	pkill -f "npm run start:ci" || true
	@echo "$(GREEN)Lighthouse audit completed$(NC)"

bundle-analyzer: ## Analyze bundle size
	@echo "$(BLUE)Analyzing bundle size...$(NC)"
	npm run analyze
	@echo "$(GREEN)Bundle analysis completed$(NC)"

# ============================================================================
# WCAG COMPLIANCE TARGETS
# ============================================================================

wcag-compliance-check: ## Check WCAG compliance
	@echo "$(BLUE)Checking WCAG compliance...$(NC)"
	mkdir -p $(REPORTS_DIR)
	npm run start:ci &
	sleep 10
	npx pa11y \
		--standard WCAG2AA \
		--reporter json \
		http://localhost:3000 > $(REPORTS_DIR)/wcag-report.json
	pkill -f "npm run start:ci" || true
	@echo "$(GREEN)WCAG compliance check completed$(NC)"

# ============================================================================
# TERRAFORM TARGETS
# ============================================================================

terraform-init: ## Initialize Terraform
	@echo "$(BLUE)Initializing Terraform...$(NC)"
	cd $(TERRAFORM_DIR) && terraform init -backend-config="bucket=$(TF_STATE_BUCKET)" -backend-config="key=$(APP_NAME)/terraform.tfstate" -backend-config="region=$(AWS_DEFAULT_REGION)"
	@echo "$(GREEN)Terraform initialization completed$(NC)"

terraform-validate: ## Validate Terraform configuration
	@echo "$(BLUE)Validating Terraform configuration...$(NC)"
	mkdir -p $(REPORTS_DIR)
	cd $(TERRAFORM_DIR) && terraform validate -json > ../$(REPORTS_DIR)/terraform-validate.json
	cd $(TERRAFORM_DIR) && terraform fmt -check -recursive
	@echo "$(GREEN)Terraform validation completed$(NC)"

terraform-plan: ## Create Terraform execution plan
	@echo "$(BLUE)Creating Terraform plan...$(NC)"
	cd $(TERRAFORM_DIR) && terraform plan -var="environment=$(ENVIRONMENT)" -var="image_tag=$(IMAGE_TAG)" -out=plan.out
	@echo "$(GREEN)Terraform plan created$(NC)"

terraform-plan-staging: ## Create Terraform plan for staging
	@echo "$(BLUE)Creating Terraform plan for staging...$(NC)"
	cd $(TERRAFORM_DIR) && terraform plan -var="environment=staging" -var="image_tag=$(IMAGE_TAG)" -var-file="staging.tfvars" -out=staging.tfplan
	@echo "$(GREEN)Staging Terraform plan created$(NC)"

terraform-plan-production: ## Create Terraform plan for production
	@echo "$(BLUE)Creating Terraform plan for production...$(NC)"
	cd $(TERRAFORM_DIR) && terraform plan -var="environment=production" -var="image_tag=$(IMAGE_TAG)" -var-file="production.tfvars" -out=production.tfplan
	@echo "$(GREEN)Production Terraform plan created$(NC)"

terraform-apply: ## Apply Terraform plan
	@echo "$(BLUE)Applying Terraform plan...$(NC)"
	cd $(TERRAFORM_DIR) && terraform apply plan.out
	@echo "$(GREEN)Terraform apply completed$(NC)"

terraform-apply-staging: ## Apply Terraform plan for staging
	@echo "$(BLUE)Applying staging Terraform plan...$(NC)"
	cd $(TERRAFORM_DIR) && terraform apply staging.tfplan
	@echo "$(GREEN)Staging Terraform apply completed$(NC)"

terraform-apply-production: ## Apply Terraform plan for production
	@echo "$(BLUE)Applying production Terraform plan...$(NC)"
	cd $(TERRAFORM_DIR) && terraform apply production.tfplan
	@echo "$(GREEN)Production Terraform apply completed$(NC)"

terraform-destroy: ## Destroy Terraform infrastructure
	@echo "$(RED)Destroying Terraform infrastructure...$(NC)"
	@echo "$(YELLOW)This will destroy all infrastructure. Are you sure? [y/N]$(NC)"
	@read -r response && if [ "$$response" = "y" ] || [ "$$response" = "Y" ]; then \
		cd $(TERRAFORM_DIR) && terraform destroy -var="environment=$(ENVIRONMENT)" -auto-approve; \
	else \
		echo "$(BLUE)Destruction cancelled$(NC)"; \
	fi

# ============================================================================
# DEPLOYMENT TARGETS
# ============================================================================

deploy-ecs-staging: ## Deploy application to ECS staging
	@echo "$(BLUE)Deploying to ECS staging...$(NC)"
	aws ecs update-service \
		--cluster $(APP_NAME)-staging \
		--service $(APP_NAME)-staging \
		--task-definition $(APP_NAME)-staging:LATEST \
		--force-new-deployment
	aws ecs wait services-stable \
		--cluster $(APP_NAME)-staging \
		--services $(APP_NAME)-staging
	@echo "$(GREEN)Staging deployment completed$(NC)"

deploy-ecs-production: ## Deploy application to ECS production
	@echo "$(BLUE)Deploying to ECS production...$(NC)"
	aws ecs update-service \
		--cluster $(APP_NAME)-production \
		--service $(APP_NAME)-production \
		--task-definition $(APP_NAME)-production:LATEST \
		--force-new-deployment
	aws ecs wait services-stable \
		--cluster $(APP_NAME)-production \
		--services $(APP_NAME)-production
	@echo "$(GREEN)Production deployment completed$(NC)"

deploy-blue-green-setup: ## Setup blue/green deployment
	@echo "$(BLUE)Setting up blue/green deployment...$(NC)"
	# Create new task definition revision
	aws ecs register-task-definition --cli-input-json file://task-definition-green.json
	@echo "$(GREEN)Blue/green setup completed$(NC)"

deploy-green-environment: ## Deploy to green environment
	@echo "$(BLUE)Deploying to green environment...$(NC)"
	aws ecs update-service \
		--cluster $(APP_NAME)-production \
		--service $(APP_NAME)-green \
		--task-definition $(APP_NAME)-green:LATEST \
		--desired-count 2
	aws ecs wait services-stable \
		--cluster $(APP_NAME)-production \
		--services $(APP_NAME)-green
	@echo "$(GREEN)Green environment deployment completed$(NC)"

switch-traffic-to-green: ## Switch traffic from blue to green
	@echo "$(BLUE)Switching traffic to green environment...$(NC)"
	# Update ALB target group to point to green service
	aws elbv2 modify-listener \
		--listener-arn $(LISTENER_ARN) \
		--default-actions Type=forward,TargetGroupArn=$(GREEN_TARGET_GROUP_ARN)
	@echo "$(GREEN)Traffic switched to green environment$(NC)"

cleanup-blue-environment: ## Cleanup blue environment after successful green deployment
	@echo "$(BLUE)Cleaning up blue environment...$(NC)"
	aws ecs update-service \
		--cluster $(APP_NAME)-production \
		--service $(APP_NAME)-blue \
		--desired-count 0
	@echo "$(GREEN)Blue environment cleanup completed$(NC)"

# ============================================================================
# TESTING AND VALIDATION TARGETS
# ============================================================================

run-smoke-tests-staging: ## Run smoke tests against staging
	@echo "$(BLUE)Running smoke tests against staging...$(NC)"
	mkdir -p $(REPORTS_DIR)
	npm run test:smoke -- --env=staging --reporter=json --out=$(REPORTS_DIR)/smoke-tests-staging.json
	@echo "$(GREEN)Staging smoke tests completed$(NC)"

run-smoke-tests-production: ## Run smoke tests against production
	@echo "$(BLUE)Running smoke tests against production...$(NC)"
	mkdir -p $(REPORTS_DIR)
	npm run test:smoke -- --env=production --reporter=json --out=$(REPORTS_DIR)/smoke-tests-production.json
	@echo "$(GREEN)Production smoke tests completed$(NC)"

run-smoke-tests-green: ## Run smoke tests against green environment
	@echo "$(BLUE)Running smoke tests against green environment...$(NC)"
	mkdir -p $(REPORTS_DIR)
	npm run test:smoke -- --env=green --reporter=json --out=$(REPORTS_DIR)/smoke-tests-green.json
	@echo "$(GREEN)Green environment smoke tests completed$(NC)"

test-post-deployment: ## Run post-deployment tests
	@echo "$(BLUE)Running post-deployment tests...$(NC)"
	mkdir -p $(REPORTS_DIR)
	npm run test:post-deploy -- --reporter=junit --reporter-options=outputDir=$(REPORTS_DIR),outputFile=post-deploy-tests.xml
	@echo "$(GREEN)Post-deployment tests completed$(NC)"

validate-deployment-health: ## Validate deployment health
	@echo "$(BLUE)Validating deployment health...$(NC)"
	# Check ECS service health
	aws ecs describe-services --cluster $(APP_NAME)-$(ENVIRONMENT) --services $(APP_NAME)-$(ENVIRONMENT) --query 'services[0].runningCount'
	# Check ALB target health
	aws elbv2 describe-target-health --target-group-arn $(TARGET_GROUP_ARN) --query 'TargetHealthDescriptions[?TargetHealth.State==`healthy`]'
	@echo "$(GREEN)Deployment health validation completed$(NC)"

load-test-production: ## Run load tests against production
	@echo "$(BLUE)Running load tests against production...$(NC)"
	mkdir -p $(REPORTS_DIR)
	k6 run --out json=$(REPORTS_DIR)/k6-results.json load-test.js
	@echo "$(GREEN)Load tests completed$(NC)"

# ============================================================================
# MONITORING AND ALERTING TARGETS
# ============================================================================

setup-monitoring-alerts: ## Setup monitoring and alerting
	@echo "$(BLUE)Setting up monitoring and alerting...$(NC)"
	# Create CloudWatch alarms
	aws cloudwatch put-metric-alarm \
		--alarm-name "$(APP_NAME)-HighCPU" \
		--alarm-description "High CPU utilization" \
		--metric-name CPUUtilization \
		--namespace AWS/ECS \
		--statistic Average \
		--period 300 \
		--threshold 80 \
		--comparison-operator GreaterThanThreshold \
		--evaluation-periods 2
	@echo "$(GREEN)Monitoring and alerting setup completed$(NC)"

# ============================================================================
# CLEANUP TARGETS
# ============================================================================

cleanup-staging-environment: ## Cleanup staging environment
	@echo "$(BLUE)Cleaning up staging environment...$(NC)"
	aws ecs update-service \
		--cluster $(APP_NAME)-staging \
		--service $(APP_NAME)-staging \
		--desired-count 0
	@echo "$(GREEN)Staging environment cleanup completed$(NC)"

stop-production-environment: ## Stop production environment (emergency)
	@echo "$(RED)Stopping production environment...$(NC)"
	@echo "$(YELLOW)This will stop the production environment. Are you sure? [y/N]$(NC)"
	@read -r response && if [ "$$response" = "y" ] || [ "$$response" = "Y" ]; then \
		aws ecs update-service \
			--cluster $(APP_NAME)-production \
			--service $(APP_NAME)-production \
			--desired-count 0; \
	else \
		echo "$(BLUE)Stop cancelled$(NC)"; \
	fi

# ============================================================================
# NOTIFICATION TARGETS
# ============================================================================

send-deployment-notification: ## Send deployment notification
	@echo "$(BLUE)Sending deployment notification...$(NC)"
	# Send to Slack
	curl -X POST -H 'Content-type: application/json' \
		--data '{"text":"🚀 $(APP_NAME) deployed successfully to $(ENVIRONMENT)!"}' \
		$(SLACK_WEBHOOK_URL)
	@echo "$(GREEN)Deployment notification sent$(NC)"

update-deployment-status: ## Update deployment status
	@echo "$(BLUE)Updating deployment status...$(NC)"
	# Update GitHub deployment status
	curl -X POST \
		-H "Authorization: token $(GITHUB_TOKEN)" \
		-H "Accept: application/vnd.github.v3+json" \
		https://api.github.com/repos/$(GITHUB_REPOSITORY)/deployments/$(DEPLOYMENT_ID)/statuses \
		-d '{"state":"success","description":"Deployment completed successfully"}'
	@echo "$(GREEN)Deployment status updated$(NC)"

generate-deployment-report: ## Generate deployment report
	@echo "$(BLUE)Generating deployment report...$(NC)"
	mkdir -p $(REPORTS_DIR)
	echo "# Deployment Report for $(APP_NAME)" > deployment-report.html
	echo "## Environment: $(ENVIRONMENT)" >> deployment-report.html
	echo "## Image Tag: $(IMAGE_TAG)" >> deployment-report.html
	echo "## Deployment Time: $(shell date)" >> deployment-report.html
	echo "## Status: SUCCESS" >> deployment-report.html
	@echo "$(GREEN)Deployment report generated$(NC)"

# ============================================================================
# DEVELOPMENT TARGETS
# ============================================================================

dev-setup: install-dependencies install-dev-dependencies ## Setup development environment
	@echo "$(GREEN)Development environment setup completed$(NC)"

dev-start: ## Start development server
	@echo "$(BLUE)Starting development server...$(NC)"
	npm run dev

dev-start-https: ## Start development server with HTTPS
	@echo "$(BLUE)Starting development server with HTTPS...$(NC)"
	npm run dev:https

dev-storybook: ## Start Storybook development server
	@echo "$(BLUE)Starting Storybook...$(NC)"
	npm run storybook

dev-test-watch: ## Run tests in watch mode
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	npm run test:watch

# ============================================================================
# CI/CD PIPELINE TARGETS
# ============================================================================

ci-validate: lint-check type-check format-check terraform-validate ## Run CI validation
	@echo "$(GREEN)CI validation completed$(NC)"

ci-build: build-production build-docker-image ## Run CI build
	@echo "$(GREEN)CI build completed$(NC)"

ci-test: test-unit test-integration test-e2e test-coverage ## Run CI tests
	@echo "$(GREEN)CI tests completed$(NC)"

ci-security: security-audit vulnerability-scan docker-scan-security ## Run CI security checks
	@echo "$(GREEN)CI security checks completed$(NC)"

ci-quality: sonar-analysis lighthouse-audit test-accessibility ## Run CI quality checks
	@echo "$(GREEN)CI quality checks completed$(NC)"

ci-package: docker-build-production docker-push ## Run CI packaging
	@echo "$(GREEN)CI packaging completed$(NC)"

ci-deploy-staging: terraform-apply-staging deploy-ecs-staging run-smoke-tests-staging ## Run CI staging deployment
	@echo "$(GREEN)CI staging deployment completed$(NC)"

ci-deploy-production: terraform-apply-production deploy-ecs-production run-smoke-tests-production ## Run CI production deployment
	@echo "$(GREEN)CI production deployment completed$(NC)"

# Full CI pipeline
ci-full-pipeline: ci-validate ci-build ci-test ci-security ci-quality ci-package ## Run full CI pipeline
	@echo "$(GREEN)Full CI pipeline completed$(NC)"

# ============================================================================
# S3 + CLOUDFRONT DEPLOYMENT TARGETS
# ============================================================================

# Terraform targets for S3+CloudFront infrastructure
terraform-init-s3: ## Initialize Terraform for S3+CloudFront
@echo "$(BLUE)Initializing Terraform...$(NC)"
cd $(TERRAFORM_DIR) && terraform init

terraform-plan-dev: terraform-init-s3 ## Plan Terraform changes for development
@echo "$(BLUE)Planning Terraform changes for development...$(NC)"
cd $(TERRAFORM_DIR) && terraform plan -var-file=dev.tfvars -out=tfplan-dev

terraform-plan-staging: terraform-init-s3 ## Plan Terraform changes for staging
@echo "$(BLUE)Planning Terraform changes for staging...$(NC)"
cd $(TERRAFORM_DIR) && terraform plan -var-file=staging.tfvars -out=tfplan-staging

terraform-plan-production: terraform-init-s3 ## Plan Terraform changes for production
@echo "$(BLUE)Planning Terraform changes for production...$(NC)"
cd $(TERRAFORM_DIR) && terraform plan -var-file=production.tfvars -out=tfplan-production

terraform-apply-dev: terraform-plan-dev ## Apply Terraform changes for development
@echo "$(BLUE)Applying Terraform changes for development...$(NC)"
cd $(TERRAFORM_DIR) && terraform apply tfplan-dev
@echo "$(GREEN)Terraform apply completed for development$(NC)"

terraform-apply-staging: terraform-plan-staging ## Apply Terraform changes for staging
@echo "$(BLUE)Applying Terraform changes for staging...$(NC)"
cd $(TERRAFORM_DIR) && terraform apply tfplan-staging
@echo "$(GREEN)Terraform apply completed for staging$(NC)"

terraform-apply-production: terraform-plan-production ## Apply Terraform changes for production
@echo "$(BLUE)Applying Terraform changes for production...$(NC)"
cd $(TERRAFORM_DIR) && terraform apply tfplan-production
@echo "$(GREEN)Terraform apply completed for production$(NC)"

terraform-destroy-dev: ## Destroy Terraform resources for development
@echo "$(RED)WARNING: This will destroy all resources!$(NC)"
@echo "Press Ctrl+C within 10 seconds to cancel..."
@sleep 10
cd $(TERRAFORM_DIR) && terraform destroy -var-file=dev.tfvars -auto-approve

terraform-show-outputs: ## Show Terraform outputs
@echo "$(BLUE)Terraform Outputs:$(NC)"
cd $(TERRAFORM_DIR) && terraform output -json | jq '.'

# S3 sync targets
deploy-s3-dev: build-production ## Deploy to S3 development bucket
@echo "$(BLUE)Deploying to S3 development bucket...$(NC)"
$(eval S3_BUCKET := $(shell cd $(TERRAFORM_DIR) && terraform output -raw s3_bucket_id))
aws s3 sync $(BUILD_DIR) s3://$(S3_BUCKET) \
--delete \
--cache-control "public, max-age=31536000, immutable" \
--exclude "index.html" \
--exclude "*.map"
aws s3 cp $(BUILD_DIR)/index.html s3://$(S3_BUCKET)/index.html \
--cache-control "public, max-age=0, must-revalidate" \
--content-type "text/html"
@echo "$(GREEN)Deployment to S3 completed$(NC)"

deploy-s3-staging: build-production ## Deploy to S3 staging bucket
@echo "$(BLUE)Deploying to S3 staging bucket...$(NC)"
$(eval S3_BUCKET := $(shell cd $(TERRAFORM_DIR) && terraform output -raw s3_bucket_id))
aws s3 sync $(BUILD_DIR) s3://$(S3_BUCKET) \
--delete \
--cache-control "public, max-age=31536000, immutable" \
--exclude "index.html" \
--exclude "*.map" \
--exclude "health.html"
aws s3 cp $(BUILD_DIR)/index.html s3://$(S3_BUCKET)/index.html \
--cache-control "public, max-age=0, must-revalidate" \
--content-type "text/html"
aws s3 cp $(BUILD_DIR)/health.html s3://$(S3_BUCKET)/health.html \
--cache-control "public, max-age=60" \
--content-type "text/html"
@echo "$(GREEN)Deployment to S3 staging completed$(NC)"

deploy-s3-production: build-production ## Deploy to S3 production bucket (requires confirmation)
@echo "$(RED)WARNING: Deploying to PRODUCTION!$(NC)"
@echo "Press Ctrl+C within 10 seconds to cancel..."
@sleep 10
@echo "$(BLUE)Deploying to S3 production bucket...$(NC)"
$(eval S3_BUCKET := $(shell cd $(TERRAFORM_DIR) && terraform output -raw s3_bucket_id))
aws s3 sync $(BUILD_DIR) s3://$(S3_BUCKET) \
--delete \
--cache-control "public, max-age=31536000, immutable" \
--exclude "index.html" \
--exclude "*.map" \
--exclude "health.html"
aws s3 cp $(BUILD_DIR)/index.html s3://$(S3_BUCKET)/index.html \
--cache-control "public, max-age=0, must-revalidate" \
--content-type "text/html"
aws s3 cp $(BUILD_DIR)/health.html s3://$(S3_BUCKET)/health.html \
--cache-control "public, max-age=60" \
--content-type "text/html"
@echo "$(GREEN)Deployment to S3 production completed$(NC)"

# CloudFront invalidation targets
invalidate-cloudfront-dev: ## Invalidate CloudFront cache for development
@echo "$(BLUE)Invalidating CloudFront cache for development...$(NC)"
$(eval DISTRIBUTION_ID := $(shell cd $(TERRAFORM_DIR) && terraform output -raw cloudfront_distribution_id))
aws cloudfront create-invalidation --distribution-id $(DISTRIBUTION_ID) --paths "/*"
@echo "$(GREEN)CloudFront cache invalidation initiated$(NC)"

invalidate-cloudfront-staging: ## Invalidate CloudFront cache for staging
@echo "$(BLUE)Invalidating CloudFront cache for staging...$(NC)"
$(eval DISTRIBUTION_ID := $(shell cd $(TERRAFORM_DIR) && terraform output -raw cloudfront_distribution_id))
aws cloudfront create-invalidation --distribution-id $(DISTRIBUTION_ID) --paths "/*"
@echo "$(GREEN)CloudFront cache invalidation initiated$(NC)"

invalidate-cloudfront-production: ## Invalidate CloudFront cache for production
@echo "$(BLUE)Invalidating CloudFront cache for production...$(NC)"
$(eval DISTRIBUTION_ID := $(shell cd $(TERRAFORM_DIR) && terraform output -raw cloudfront_distribution_id))
aws cloudfront create-invalidation --distribution-id $(DISTRIBUTION_ID) --paths "/*"
@echo "$(GREEN)CloudFront cache invalidation initiated$(NC)"

invalidate-cloudfront-selective: ## Invalidate specific CloudFront paths (use PATHS variable)
@echo "$(BLUE)Invalidating specific CloudFront paths...$(NC)"
$(eval DISTRIBUTION_ID := $(shell cd $(TERRAFORM_DIR) && terraform output -raw cloudfront_distribution_id))
@if [ -z "$(PATHS)" ]; then \
echo "$(RED)Error: PATHS variable not set. Usage: make invalidate-cloudfront-selective PATHS='/index.html /assets/*'$(NC)"; \
exit 1; \
fi
aws cloudfront create-invalidation --distribution-id $(DISTRIBUTION_ID) --paths $(PATHS)
@echo "$(GREEN)CloudFront selective cache invalidation initiated$(NC)"

# Check CloudFront distribution status
check-cloudfront-status: ## Check CloudFront distribution status
@echo "$(BLUE)Checking CloudFront distribution status...$(NC)"
$(eval DISTRIBUTION_ID := $(shell cd $(TERRAFORM_DIR) && terraform output -raw cloudfront_distribution_id))
aws cloudfront get-distribution --id $(DISTRIBUTION_ID) --query 'Distribution.Status' --output text

# Check invalidation status
check-invalidation-status: ## Check CloudFront invalidation status (use INVALIDATION_ID variable)
@echo "$(BLUE)Checking CloudFront invalidation status...$(NC)"
$(eval DISTRIBUTION_ID := $(shell cd $(TERRAFORM_DIR) && terraform output -raw cloudfront_distribution_id))
@if [ -z "$(INVALIDATION_ID)" ]; then \
echo "$(RED)Error: INVALIDATION_ID variable not set. Usage: make check-invalidation-status INVALIDATION_ID=<id>$(NC)"; \
exit 1; \
fi
aws cloudfront get-invalidation --distribution-id $(DISTRIBUTION_ID) --id $(INVALIDATION_ID)

# Complete deployment workflow targets
deploy-full-dev: terraform-apply-dev deploy-s3-dev invalidate-cloudfront-dev ## Full deployment workflow for development
@echo "$(GREEN)Full development deployment completed!$(NC)"
@echo "$(BLUE)Website URL:$(NC)"
cd $(TERRAFORM_DIR) && terraform output -raw website_url

deploy-full-staging: terraform-apply-staging deploy-s3-staging invalidate-cloudfront-staging ## Full deployment workflow for staging
@echo "$(GREEN)Full staging deployment completed!$(NC)"
@echo "$(BLUE)Website URL:$(NC)"
cd $(TERRAFORM_DIR) && terraform output -raw website_url

deploy-full-production: terraform-apply-production deploy-s3-production invalidate-cloudfront-production ## Full deployment workflow for production
@echo "$(GREEN)Full production deployment completed!$(NC)"
@echo "$(BLUE)Website URL:$(NC)"
cd $(TERRAFORM_DIR) && terraform output -raw website_url

# Rollback targets
rollback-s3-staging: ## Rollback S3 staging deployment to previous version
@echo "$(BLUE)Rolling back S3 staging deployment...$(NC)"
$(eval S3_BUCKET := $(shell cd $(TERRAFORM_DIR) && terraform output -raw s3_bucket_id))
aws s3api list-object-versions --bucket $(S3_BUCKET) --prefix "index.html" --query 'Versions[1].VersionId' --output text | \
xargs -I {} aws s3api copy-object --bucket $(S3_BUCKET) --copy-source $(S3_BUCKET)/index.html?versionId={} --key index.html
@echo "$(GREEN)S3 rollback completed$(NC)"

rollback-s3-production: ## Rollback S3 production deployment to previous version
@echo "$(RED)WARNING: Rolling back PRODUCTION deployment!$(NC)"
@echo "Press Ctrl+C within 10 seconds to cancel..."
@sleep 10
@echo "$(BLUE)Rolling back S3 production deployment...$(NC)"
$(eval S3_BUCKET := $(shell cd $(TERRAFORM_DIR) && terraform output -raw s3_bucket_id))
aws s3api list-object-versions --bucket $(S3_BUCKET) --prefix "index.html" --query 'Versions[1].VersionId' --output text | \
xargs -I {} aws s3api copy-object --bucket $(S3_BUCKET) --copy-source $(S3_BUCKET)/index.html?versionId={} --key index.html
@echo "$(GREEN)S3 rollback completed$(NC)"

# Health check targets
health-check-dev: ## Check health of development deployment
@echo "$(BLUE)Checking health of development deployment...$(NC)"
$(eval WEBSITE_URL := $(shell cd $(TERRAFORM_DIR) && terraform output -raw website_url))
curl -f $(WEBSITE_URL)/health.html || echo "$(RED)Health check failed$(NC)"

health-check-staging: ## Check health of staging deployment
@echo "$(BLUE)Checking health of staging deployment...$(NC)"
$(eval WEBSITE_URL := $(shell cd $(TERRAFORM_DIR) && terraform output -raw website_url))
curl -f $(WEBSITE_URL)/health.html || echo "$(RED)Health check failed$(NC)"

health-check-production: ## Check health of production deployment
@echo "$(BLUE)Checking health of production deployment...$(NC)"
$(eval WEBSITE_URL := $(shell cd $(TERRAFORM_DIR) && terraform output -raw website_url))
curl -f $(WEBSITE_URL)/health.html || echo "$(RED)Health check failed$(NC)"

# Cache warming targets
warm-cache-dev: ## Warm CloudFront cache for development
@echo "$(BLUE)Warming CloudFront cache for development...$(NC)"
$(eval WEBSITE_URL := $(shell cd $(TERRAFORM_DIR) && terraform output -raw website_url))
@for path in / /assets/index.css /assets/index.js; do \
echo "Warming cache: $(WEBSITE_URL)$$path"; \
curl -s -o /dev/null $(WEBSITE_URL)$$path; \
done
@echo "$(GREEN)Cache warming completed$(NC)"

warm-cache-staging: ## Warm CloudFront cache for staging
@echo "$(BLUE)Warming CloudFront cache for staging...$(NC)"
$(eval WEBSITE_URL := $(shell cd $(TERRAFORM_DIR) && terraform output -raw website_url))
@for path in / /assets/index.css /assets/index.js; do \
echo "Warming cache: $(WEBSITE_URL)$$path"; \
curl -s -o /dev/null $(WEBSITE_URL)$$path; \
done
@echo "$(GREEN)Cache warming completed$(NC)"

warm-cache-production: ## Warm CloudFront cache for production
@echo "$(BLUE)Warming CloudFront cache for production...$(NC)"
$(eval WEBSITE_URL := $(shell cd $(TERRAFORM_DIR) && terraform output -raw website_url))
@for path in / /assets/index.css /assets/index.js; do \
echo "Warming cache: $(WEBSITE_URL)$$path"; \
curl -s -o /dev/null $(WEBSITE_URL)$$path; \
done
@echo "$(GREEN)Cache warming completed$(NC)"
