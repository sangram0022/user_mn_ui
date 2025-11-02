# Network Module Outputs
# Provides network information for other modules and CI/CD integration

# VPC Information
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "vpc_arn" {
  description = "ARN of the VPC"
  value       = aws_vpc.main.arn
}

# Internet Gateway
output "internet_gateway_id" {
  description = "ID of the Internet Gateway"
  value       = aws_internet_gateway.main.id
}

# Public Subnets
output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "public_subnet_cidrs" {
  description = "CIDR blocks of the public subnets"
  value       = aws_subnet.public[*].cidr_block
}

output "public_subnet_arns" {
  description = "ARNs of the public subnets"
  value       = aws_subnet.public[*].arn
}

output "public_subnet_azs" {
  description = "Availability zones of the public subnets"
  value       = aws_subnet.public[*].availability_zone
}

# Private Subnets
output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "private_subnet_cidrs" {
  description = "CIDR blocks of the private subnets"
  value       = aws_subnet.private[*].cidr_block
}

output "private_subnet_arns" {
  description = "ARNs of the private subnets"
  value       = aws_subnet.private[*].arn
}

output "private_subnet_azs" {
  description = "Availability zones of the private subnets"
  value       = aws_subnet.private[*].availability_zone
}

# NAT Gateways
output "nat_gateway_ids" {
  description = "IDs of the NAT Gateways"
  value       = var.enable_nat_gateway ? aws_nat_gateway.main[*].id : []
}

output "nat_gateway_public_ips" {
  description = "Public IPs of the NAT Gateways"
  value       = var.enable_nat_gateway ? aws_eip.nat[*].public_ip : []
}

# Route Tables
output "public_route_table_id" {
  description = "ID of the public route table"
  value       = aws_route_table.public.id
}

output "private_route_table_ids" {
  description = "IDs of the private route tables"
  value       = aws_route_table.private[*].id
}

# Security Groups for VPC Endpoints
output "vpc_endpoint_security_group_id" {
  description = "Security group ID for VPC endpoints"
  value       = var.enable_vpc_endpoints ? aws_security_group.vpc_endpoint[0].id : null
}

# VPC Endpoints
output "vpc_endpoints" {
  description = "VPC endpoint information"
  value = {
    s3_endpoint_id      = var.enable_vpc_endpoints ? aws_vpc_endpoint.s3[0].id : null
    ecr_dkr_endpoint_id = var.enable_vpc_endpoints ? aws_vpc_endpoint.ecr_dkr[0].id : null
    ecr_api_endpoint_id = var.enable_vpc_endpoints ? aws_vpc_endpoint.ecr_api[0].id : null
  }
}

# Network ACL
output "network_acl_id" {
  description = "ID of the network ACL"
  value       = aws_network_acl.main.id
}

# Flow Logs
output "vpc_flow_log_id" {
  description = "ID of the VPC Flow Log"
  value       = var.enable_vpc_flow_logs ? aws_flow_log.vpc[0].id : null
}

output "vpc_flow_log_group_name" {
  description = "Name of the VPC Flow Log CloudWatch group"
  value       = var.enable_vpc_flow_logs ? aws_cloudwatch_log_group.vpc_flow_log[0].name : null
}

output "vpc_flow_log_group_arn" {
  description = "ARN of the VPC Flow Log CloudWatch group"
  value       = var.enable_vpc_flow_logs ? aws_cloudwatch_log_group.vpc_flow_log[0].arn : null
}

# Availability Zones
output "availability_zones" {
  description = "List of availability zones used"
  value       = data.aws_availability_zones.available.names
}

# Network Configuration Summary
output "network_summary" {
  description = "Summary of network configuration"
  value = {
    vpc_id                = aws_vpc.main.id
    vpc_cidr              = aws_vpc.main.cidr_block
    public_subnets_count  = length(aws_subnet.public)
    private_subnets_count = length(aws_subnet.private)
    nat_gateways_count    = var.enable_nat_gateway ? length(aws_nat_gateway.main) : 0
    availability_zones    = data.aws_availability_zones.available.names
    vpc_endpoints_enabled = var.enable_vpc_endpoints
    flow_logs_enabled     = var.enable_vpc_flow_logs
  }
}

# Cost Information
output "estimated_monthly_costs" {
  description = "Estimated monthly costs for network resources"
  value = {
    nat_gateway_cost = var.enable_nat_gateway ? length(aws_nat_gateway.main) * 45.60 : 0 # $45.60 per NAT Gateway
    vpc_endpoint_cost = var.enable_vpc_endpoints ? 22.50 : 0 # Approximate cost for interface endpoints
    total_estimated = (var.enable_nat_gateway ? length(aws_nat_gateway.main) * 45.60 : 0) + (var.enable_vpc_endpoints ? 22.50 : 0)
  }
}

# Health Check Endpoints
output "health_check_urls" {
  description = "URLs for network health checks"
  value = {
    vpc_reachbility_test = "https://vpc-reachability-test.${var.environment}.${var.project_name}.local"
    nat_gateway_test     = var.enable_nat_gateway ? "NAT Gateway connectivity from private subnets" : "No NAT Gateway configured"
  }
}

# GitLab CI/CD Integration
output "gitlab_variables" {
  description = "Variables for GitLab CI/CD integration"
  value = {
    VPC_ID                = aws_vpc.main.id
    PUBLIC_SUBNET_IDS     = join(",", aws_subnet.public[*].id)
    PRIVATE_SUBNET_IDS    = join(",", aws_subnet.private[*].id)
    AVAILABILITY_ZONES    = join(",", data.aws_availability_zones.available.names)
    VPC_CIDR              = aws_vpc.main.cidr_block
    INTERNET_GATEWAY_ID   = aws_internet_gateway.main.id
    NAT_GATEWAY_IDS       = var.enable_nat_gateway ? join(",", aws_nat_gateway.main[*].id) : ""
    VPC_ENDPOINTS_ENABLED = var.enable_vpc_endpoints
    FLOW_LOGS_ENABLED     = var.enable_vpc_flow_logs
  }
}

# Security Information
output "security_info" {
  description = "Security-related network information"
  value = {
    vpc_flow_logs_enabled        = var.enable_vpc_flow_logs
    network_acl_id              = aws_network_acl.main.id
    vpc_endpoints_security_group = var.enable_vpc_endpoints ? aws_security_group.vpc_endpoint[0].id : null
    private_subnets_isolated    = !var.enable_nat_gateway
  }
}