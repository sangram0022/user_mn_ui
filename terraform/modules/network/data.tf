# Network Module Data Sources
# Required data sources for network configuration

# Get available availability zones
data "aws_availability_zones" "available" {
  state = "available"

  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

# Get current AWS region
data "aws_region" "current" {}

# Get current AWS caller identity
data "aws_caller_identity" "current" {}

# Get AWS partition (aws, aws-cn, aws-us-gov)
data "aws_partition" "current" {}