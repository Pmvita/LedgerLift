# LedgerLift

### A small app on AWS — network, containers, storage, database, IAM, pipeline, alarms

Demo for 1–2 hours, then `terraform destroy`. Near **$0** when torn down. No RDS, no NAT.

![Docker](https://img.shields.io/badge/Containers-Docker-2496ED?logo=docker&logoColor=white)
![ECS](https://img.shields.io/badge/Compute-ECS%20Fargate-FF9900?logo=amazonecs&logoColor=white)
![ALB](https://img.shields.io/badge/Load%20balancer-ALB-8C4FFF?logo=amazon-aws&logoColor=white)
![DynamoDB](https://img.shields.io/badge/Database-DynamoDB-4053D6?logo=amazondynamodb&logoColor=white)
![S3](https://img.shields.io/badge/Storage-S3-569A31?logo=amazons3&logoColor=white)
![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC?logo=terraform&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

**Spec version:** 1.0 — 2026-09-25 (same version as [`TODO.md`](./TODO.md))

**README = design.** [`TODO.md`](./TODO.md) **= build list.** Change a locked decision → bump the version in both files.

**Honest status:** **code complete** (TypeScript API, Docker, Terraform, GitHub Actions, unit tests). **Live AWS** only after a short demo `terraform apply` + `destroy`. Local Docker/API works without AWS.

---

## Overview

LedgerLift is a small TypeScript “expenses / notes” HTTP API. It runs in **Docker** on **ECS Fargate** behind an **ALB**, stores rows in **DynamoDB**, and puts files in **S3**. The whole house is **Terraform**. **GitHub Actions** builds the image, pushes to **ECR**, and rolls the service.

This lab matches the core of Toronto Cloud Engineer job posts: build/run AWS, IaC, lock down access, watch with CloudWatch, ship with CI/CD — without leaving a bill running.

| Lab | Shows | Does not show |
| --- | --- | --- |
| **NimbusFlow** | Serverless SAM pipeline | Containers, ALB, deploy pipeline |
| **CSPM** | Account posture checks | Shipping an app |
| **ShipYard** | Thin CI/CD → ECS path | VPC story + DynamoDB + S3 as first-class pieces |
| **LedgerLift** | Full junior cloud stack on one destroyable app | EKS, RDS, NAT, multi-account |

---

## What this covers (1–5)

| # | Cloud engineer work | In LedgerLift |
| --- | --- | --- |
| 1 | Set up the environment | VPC (public subnets), ALB, ECS Fargate, S3, DynamoDB, IAM |
| 2 | Automate it | Terraform for the stack; GitHub Actions for image + deploy |
| 3 | Security / access | Least-privilege roles, encrypted S3 + DynamoDB, no public DB |
| 4 | Keep it running | CloudWatch logs (7 days), alarms, `/health`, short runbook |
| 5 | Ship safely | Docker → ECR → rolling ECS deploy on `main` |

---

## Locked scope

- App: TypeScript/Node API — `GET /`, `GET /health`, simple CRUD for notes/expenses + optional file metadata in S3
- Image: multi-stage `Dockerfile`, non-root user
- Network: **public subnets only**, public IPs on tasks — **no NAT Gateway**
- Compute: ECS Fargate, desired count **1**, behind ALB
- Data: **DynamoDB** on-demand (not RDS), **S3** bucket (Block Public Access on, SSE)
- Registry: ECR
- IaC: Terraform only after bootstrap
- CI/CD: GitHub Actions — lint/test → build → push → deploy (OIDC preferred)
- Observability: CloudWatch logs + alarms (unhealthy host and/or ALB 5xx) → SNS email
- Cost: **$1** monthly budget + email; **destroy after every demo** (ALB + Fargate bill while up)
- Region: `ca-central-1`
- Out of scope: RDS, Aurora, NAT, EKS, custom domain, Redis, second environment, Control Tower

**Deploy path (locked):** **B** — Terraform for infra once; Actions pushes the image tagged with `github.sha` and force-deploys ECS (registers a new task definition revision with the new image).

---

## Architecture

```
Developer
   │  git push main
   ▼
GitHub Actions
   │  lint + test
   │  docker build → ECR
   │  force new ECS deployment
   ▼
Internet → Application Load Balancer
              │  /health
              ▼
         ECS Fargate (count 1)
              │
              ├──► DynamoDB (notes / expenses)
              └──► S3 (optional attachments / objects)
              │
              ▼
         CloudWatch Logs + alarms → SNS
```

**Design choices**

1. **DynamoDB instead of RDS** — still a real database for JDs; safe to destroy; no instance hours.
2. **No NAT** — public subnets for a portfolio lab. Production would use private tasks + NAT or VPC endpoints.
3. **ALB stays** — matches “load balancer + health checks” in postings; only leave it up for the demo window.
4. **ShipYard vs LedgerLift** — ShipYard proves the pipeline. LedgerLift proves the full house (network + DB + storage + IAM + pipeline + alarms).

---

## API (quick)

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/` | Service JSON |
| `GET` | `/health` | `{ "status": "ok" }` |
| `GET/POST` | `/notes` | List / create |
| `GET/DELETE` | `/notes/:id` | Get / delete |
| `GET/POST` | `/expenses` | List / create (`amountCents`) |
| `GET/DELETE` | `/expenses/:id` | Get / delete |
| `POST` | `/attachments` | Small base64 object → S3 (needs `S3_BUCKET_NAME`) |

Locally (no AWS): in-memory store when `DYNAMODB_TABLE` is unset. DynamoDB PK design: [`docs/data-model.md`](./docs/data-model.md).

---

## Default cost

| While demoing (1–2 hours) | After `terraform destroy` |
| --- | --- |
| ALB + Fargate + light DynamoDB/S3/logs | Near **$0** |

Never leave ALB + Fargate up overnight. Budget alarm at $1.

---

## IAM (target design)

| Principal | Allowed to |
| --- | --- |
| ECS execution role | ECR pull; write to this log group |
| ECS task role | DynamoDB table CRUD; S3 object R/W on this bucket; logs |
| GitHub Actions (OIDC) | Push to this ECR repo; register task def; update this ECS service |

No `*:*` on writes. No long-lived AWS keys in GitHub if OIDC is wired. S3 Block Public Access on. DynamoDB encryption at rest (AWS owned or CMK — default AWS owned is fine for the lab).

`ecr:GetAuthorizationToken` is intentionally `*` — AWS does not allow scoping it (commented in Terraform).

---

## Getting started

```bash
# 0) $1 budget + email in the account first (or let Terraform create it)

# 1) App locally
cd app
npm ci
npm test
npm run dev
# curl localhost:8080/health

# 2) Image (Docker Desktop daemon must be running)
cd ..
docker build -t ledgerlift:local .
docker run --rm -p 8080:8080 ledgerlift:local
curl -s localhost:8080/health

# Optional compose (API only, in-memory)
docker compose up --build

# 3) Infra (demo window only)
cd infra
cp terraform.tfvars.example terraform.tfvars   # set budget_email
terraform init
terraform plan
terraform apply
# Confirm SNS email subscription once
# Push an image (Actions) so ECS tasks become healthy if latest is missing

# 4) Hit ALB URL, then tear down
terraform destroy
# Empty the S3 bucket first if destroy complains
```

### GitHub Actions vars / secrets

| Name | Where | Purpose |
| --- | --- | --- |
| `AWS_DEPLOY_ROLE_ARN` | secret | OIDC role ARN from `terraform output github_actions_role_arn` |
| `AWS_REGION` | var (optional) | default `ca-central-1` |
| `ECR_REPOSITORY` | var (optional) | default `ledgerlift-api` |
| `ECS_CLUSTER` | var (optional) | default `ledgerlift` |
| `ECS_SERVICE` | var (optional) | default `ledgerlift-api` |

PR workflow: lint + test only. `main` / workflow_dispatch: lint/test → build/push → rolling ECS deploy.

**First-apply note:** ECS expects an image at `ECR:latest` (or your `image_tag`). If the repo is empty, push once (Actions after setting the role secret, or `docker push`) then wait for the service to stabilize. If the account already has a GitHub OIDC provider, import it or remove `aws_iam_openid_connect_provider.github` from state and data-source the existing ARN.

---

## Project structure

```text
LedgerLift/
├── README.md
├── TODO.md
├── LICENSE
├── .gitignore
├── app/
│   ├── package.json
│   ├── src/
│   └── test/
├── Dockerfile
├── docker-compose.yml          ← local only (optional)
├── infra/                      ← Terraform
│   ├── versions.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── terraform.tfvars.example
│   ├── vpc.tf / alb.tf / ecs.tf / ecr.tf
│   ├── dynamodb.tf / s3.tf / iam.tf / oidc.tf
│   ├── alarms.tf / budget.tf
├── docs/
│   ├── RUNBOOK.md
│   └── data-model.md
└── .github/workflows/
    ├── ci.yml
    └── deploy.yml
```

---

## Resume line (after demo + destroy)

**LedgerLift — Containerized app on AWS (Terraform + CI/CD)** · 2026  
ECS Fargate, ALB, DynamoDB, S3, VPC, IAM, ECR, GitHub Actions, CloudWatch  

- Defined VPC, ALB, ECS Fargate, DynamoDB, and S3 in Terraform with least-privilege task/execution roles.  
- Shipped multi-stage Docker images through GitHub Actions to ECR and rolled ECS with health checks.  
- Wired CloudWatch logs and alarms; $1 budget; destroy after each demo so idle cost stays near $0.

Add to the **Cloud Engineer** resume when demo + destroy work. Not for the Security Analyst PDF.

---

## License

MIT. See [LICENSE](./LICENSE).
