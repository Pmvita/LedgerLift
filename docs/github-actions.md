# GitHub Actions variables & secrets

## Deploy path (locked)

**B)** Terraform for infra once per demo; Actions builds/pushes the image and `force-new-deployment` on ECS. Actions does **not** run `terraform apply`.

## Required after first `terraform apply`

| Kind | Name | Value |
| --- | --- | --- |
| Secret | `AWS_DEPLOY_ROLE_ARN` | `terraform output -raw github_actions_role_arn` |
| Variable | `ENABLE_DEPLOY` | `true` (deploy job no-ops until set) |
| Variable | `AWS_REGION` | `ca-central-1` (optional; default in workflow) |
| Variable | `ECS_CLUSTER` | `ledgerlift` |
| Variable | `ECS_SERVICE` | `ledgerlift-api` |
| Variable | `ECR_REPOSITORY` | `ledgerlift-api` |

OIDC only — no long-lived AWS access keys in GitHub.

## Workflows

- `ci.yml` — PR + `main`: lint, typecheck, unit tests
- `deploy.yml` — `main` + dispatch: Docker → ECR (`github.sha` + `latest`) → ECS force deploy (when `ENABLE_DEPLOY=true`)
