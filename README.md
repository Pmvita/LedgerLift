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

---

## Architecture

```
Developer
   │  git push main
   ▼
GitHub Actions
   │  lint + test
   │  docker build → ECR
   │  terraform apply / force new deployment
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
| GitHub Actions (OIDC) | Push to this ECR repo; plan/apply this Terraform stack |

No `*:*` on writes. No long-lived AWS keys in GitHub if OIDC is wired. S3 Block Public Access on. DynamoDB encryption at rest (AWS owned or CMK — default AWS owned is fine for the lab).

---

## Getting started (when TODO is done)

```bash
# 0) $1 budget + email in the account first

# 1) App locally (optional Compose for offline)
cd app
npm ci
npm test
npm run dev

# 2) Image
docker build -t ledgerlift:local .
docker run --rm -p 8080:8080 ledgerlift:local
curl -s localhost:8080/health

# 3) Infra
cd ../infra
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply

# 4) Hit ALB URL, then tear down
terraform destroy
```

---

## Project structure (target)

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
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── terraform.tfvars.example
├── docs/
│   └── RUNBOOK.md              ← alarm fired → what to check
└── .github/workflows/
    └── deploy.yml
```

---

## Resume line (when TODO is green)

**LedgerLift — Containerized app on AWS (Terraform + CI/CD)** · 2026  
ECS Fargate, ALB, DynamoDB, S3, VPC, IAM, ECR, GitHub Actions, CloudWatch  

- Defined VPC, ALB, ECS Fargate, DynamoDB, and S3 in Terraform with least-privilege task/execution roles.  
- Shipped multi-stage Docker images through GitHub Actions to ECR and rolled ECS with health checks.  
- Wired CloudWatch logs and alarms; $1 budget; destroy after each demo so idle cost stays near $0.

Add to the **Cloud Engineer** resume when demo + destroy work. Not for the Security Analyst PDF.

---

## License

MIT. See [LICENSE](./LICENSE).
