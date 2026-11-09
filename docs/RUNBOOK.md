# LedgerLift runbook

Alarm fired (SNS email) → work this list. Demo window only — destroy when done.

## 1. Confirm the signal

- Alarm name in email: `ledgerlift-unhealthy-hosts` or `ledgerlift-alb-5xx`
- Region: `ca-central-1`

## 2. ALB targets

```bash
aws elbv2 describe-target-health \
  --target-group-arn "$(terraform -chdir=infra output -raw alb_dns_name >/dev/null; aws elbv2 describe-target-groups --names ledgerlift-tg --query 'TargetGroups[0].TargetGroupArn' --output text)" \
  --region ca-central-1
```

Or in console: EC2 → Target Groups → `ledgerlift-tg` → Targets.

Healthy = `healthy`. If `unhealthy` / `draining`, go to tasks.

## 3. ECS task status

```bash
aws ecs list-tasks --cluster ledgerlift --service-name ledgerlift-api --region ca-central-1
aws ecs describe-tasks --cluster ledgerlift --tasks <task-arn> --region ca-central-1
```

Check `lastStatus`, `stoppedReason`, and container exit codes. Desired count is **1** — a bad deploy takes the only task offline until replacement is healthy (ALB may 502/503).

## 4. Recent logs

```bash
aws logs tail /ecs/ledgerlift --since 15m --region ca-central-1
```

Look for crash loops, missing env (`DYNAMODB_TABLE`, `S3_BUCKET_NAME`), or IAM denied.

## 5. Common fixes

| Symptom | Likely cause | Action |
| --- | --- | --- |
| Targets unhealthy | App not listening /health | Check image; curl task locally via logs |
| 5xx spike | App exception | Tail logs; roll previous image tag |
| Tasks stop immediately | Bad image / OOM | Check task stoppedReason; 256/512 is tight |
| Dynamo/S3 errors | Task role | Confirm IAM policy on table/bucket |

## 6. Tear down

```bash
# Empty S3 first if destroy complains
aws s3 rm s3://$(terraform -chdir=infra output -raw s3_bucket_name) --recursive --region ca-central-1
cd infra && terraform destroy
```

Never leave ALB + Fargate up overnight.
