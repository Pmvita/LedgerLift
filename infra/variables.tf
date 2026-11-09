variable "aws_region" {
  type        = string
  description = "AWS region for the lab stack."
  default     = "ca-central-1"
}

variable "project_name" {
  type        = string
  description = "Name prefix for resources."
  default     = "ledgerlift"
}

variable "budget_email" {
  type        = string
  description = "Email for the $1 AWS Budget and SNS alarm subscription."
}

variable "monthly_budget_usd" {
  type        = string
  description = "Monthly cost budget in USD."
  default     = "1"
}

variable "container_port" {
  type    = number
  default = 8080
}

variable "desired_count" {
  type        = number
  description = "ECS Fargate desired count. Locked to 1 for the lab."
  default     = 1
}

variable "image_tag" {
  type        = string
  description = "ECR image tag for the initial task definition. CI force-deploys newer sha tags via rolling update of the service (path B)."
  default     = "latest"
}

variable "github_org" {
  type        = string
  description = "GitHub org/user for OIDC trust."
  default     = "Pmvita"
}

variable "github_repo" {
  type        = string
  description = "GitHub repo name for OIDC trust."
  default     = "LedgerLift"
}

variable "create_github_oidc_provider" {
  type        = bool
  description = "Create the account-level GitHub OIDC provider. Set false if it already exists."
  default     = true
}

variable "github_oidc_provider_arn" {
  type        = string
  description = "Existing GitHub OIDC provider ARN when create_github_oidc_provider is false."
  default     = ""
}
