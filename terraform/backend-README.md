# ============================================================================
# Terraform Backend Configuration
# S3 + DynamoDB for Remote State Management
# ============================================================================

# This file should be configured after initial infrastructure setup
# 
# Setup Steps:
# 1. Create S3 bucket for state storage (manually or via AWS CLI)
# 2. Create DynamoDB table for state locking (manually or via AWS CLI)
# 3. Uncomment the backend configuration below
# 4. Run: terraform init -reconfigure -backend-config=backend.hcl

# ============================================================================
# Create Backend Resources (Run Once)
# ============================================================================

# Create S3 bucket for Terraform state (AWS CLI)
# aws s3api create-bucket \
#   --bucket <your-terraform-state-bucket> \
#   --region us-east-1

# Enable versioning on state bucket
# aws s3api put-bucket-versioning \
#   --bucket <your-terraform-state-bucket> \
#   --versioning-configuration Status=Enabled

# Enable encryption on state bucket
# aws s3api put-bucket-encryption \
#   --bucket <your-terraform-state-bucket> \
#   --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}'

# Block public access on state bucket
# aws s3api put-public-access-block \
#   --bucket <your-terraform-state-bucket> \
#   --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Create DynamoDB table for state locking
# aws dynamodb create-table \
#   --table-name terraform-state-lock \
#   --attribute-definitions AttributeName=LockID,AttributeType=S \
#   --key-schema AttributeName=LockID,KeyType=HASH \
#   --billing-mode PAY_PER_REQUEST \
#   --region us-east-1

# ============================================================================
# Backend Configuration (Uncomment after creating resources)
# ============================================================================

# terraform {
#   backend "s3" {
#     bucket         = "<your-terraform-state-bucket>"
#     key            = "react-app/terraform.tfstate"
#     region         = "us-east-1"
#     encrypt        = true
#     dynamodb_table = "terraform-state-lock"
#     
#     # Optional: Enable versioning for rollback capability
#     versioning     = true
#     
#     # Optional: Add tags
#     tags = {
#       Name        = "Terraform State"
#       Project     = "React App"
#       Environment = "All"
#       ManagedBy   = "Terraform"
#     }
#   }
# }

# ============================================================================
# Backend Configuration File (Alternative Method)
# ============================================================================

# Create backend.hcl file with the following content:
# 
# bucket         = "<your-terraform-state-bucket>"
# key            = "react-app/terraform.tfstate"
# region         = "us-east-1"
# encrypt        = true
# dynamodb_table = "terraform-state-lock"
# 
# Then initialize:
# terraform init -reconfigure -backend-config=backend.hcl

# ============================================================================
# Environment-Specific State Files
# ============================================================================

# For separate state files per environment, use Terraform workspaces:
# 
# terraform workspace new dev
# terraform workspace new staging
# terraform workspace new production
# 
# Or use different backend keys:
# 
# Dev:     key = "react-app/dev/terraform.tfstate"
# Staging: key = "react-app/staging/terraform.tfstate"
# Production: key = "react-app/production/terraform.tfstate"

# ============================================================================
# Security Best Practices
# ============================================================================

# 1. Enable bucket versioning for state rollback
# 2. Enable encryption at rest (AES256 or KMS)
# 3. Block all public access
# 4. Enable access logging
# 5. Use IAM policies to restrict access
# 6. Enable MFA delete for production state
# 7. Regular backups of state files
# 8. Use DynamoDB table for state locking

# ============================================================================
# Migration from Local State
# ============================================================================

# If you have existing local state:
# 
# 1. Backup local state: cp terraform.tfstate terraform.tfstate.backup
# 2. Configure backend above
# 3. Run: terraform init -migrate-state
# 4. Verify: terraform state list
# 5. Test: terraform plan (should show no changes)
# 6. Delete local state: rm terraform.tfstate*

# ============================================================================
# Useful Commands
# ============================================================================

# Initialize with backend
# terraform init

# Reconfigure backend
# terraform init -reconfigure

# Migrate existing state
# terraform init -migrate-state

# View state
# terraform state list

# Pull remote state
# terraform state pull > state.json

# Push local state to remote
# terraform state push terraform.tfstate

# Lock state manually
# terraform force-unlock <lock-id>
