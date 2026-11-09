output "alb_dns_name" {
  description = "Public ALB DNS — hit http://<this>/health during the demo window."
  value       = aws_lb.api.dns_name
}

output "ecr_repository_url" {
  value = aws_ecr_repository.api.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.api.name
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.items.name
}

output "s3_bucket_name" {
  value = aws_s3_bucket.attachments.bucket
}

output "github_actions_role_arn" {
  description = "Set as GitHub Actions secret AWS_DEPLOY_ROLE_ARN (OIDC)."
  value       = aws_iam_role.github_actions.arn
}

output "log_group_name" {
  value = aws_cloudwatch_log_group.api.name
}

output "sns_topic_arn" {
  description = "Confirm the email subscription once after apply."
  value       = aws_sns_topic.alerts.arn
}
