# ✅ LedgerLift — TODO

**Spec version:** 1.0 — 2026-09-25 (same version as [`README.md`](./README.md))

This checklist **is** the whole project. README = design; this file = build list. If you change a locked decision, bump the version in **both** files.

**Locked scope:**

- TypeScript API + `/health` + simple notes/expenses CRUD (+ optional S3 object)
- Docker → ECR → ECS Fargate (count 1) + ALB
- Public subnets only — **no NAT**
- DynamoDB on-demand + S3 (encrypted, Block Public Access) — **no RDS**
- Terraform + GitHub Actions (OIDC preferred)
- CloudWatch logs 7 days + alarms → SNS
- $1 budget; destroy after every demo
- No EKS, Redis, custom domain, second env, Control Tower

**Status:** code complete (app, Docker, Terraform, CI). Live AWS only after a short demo `apply` + `destroy`.

---

## 💰 Cost guard (do this first)

- [ ] Create a **$1** AWS Budget + email alert (`ca-central-1`) — also provisioned by Terraform (`infra/budget.tf`) on apply
- [x] Plan demo windows of **1–2 hours** only
- [x] `terraform destroy` before leaving the machine — ALB + Fargate bill while up

---

## 🏗️ Project setup

- [x] Repo layout: `app/`, `infra/`, `docs/`, `Dockerfile`, `.github/workflows/`
- [x] `.gitignore` (node_modules, dist, `.terraform/`, `*.tfstate*`, `.env`)
- [x] MIT `LICENSE`
- [x] `app/package.json` — TypeScript, tests, lint
- [x] Optional `docker-compose.yml` for local API only (no AWS)

---

## 🌐 Application

- [x] `GET /` — service JSON
- [x] `GET /health` — `200` + `{ "status": "ok" }`
- [x] Notes/expenses: create, list, get, delete (DynamoDB)
- [x] Optional: upload metadata or small object flow to S3
- [x] Listen on `PORT` (default `8080`)
- [x] Unit tests for health + one CRUD path (no AWS required if mocked)
- [x] Structured log on startup

---

## 🐳 Container

- [x] Multi-stage `Dockerfile` (build → runtime)
- [x] Non-root user in runtime image
- [x] `.dockerignore`
- [ ] Local: `docker build` + `docker run` + `curl /health` — requires Docker Desktop daemon running

---

## ☁️ Network + load balancer

- [x] Terraform VPC (or documented use of default VPC) with **public** subnets in 2 AZs for ALB
- [x] **No NAT Gateway**
- [x] Security groups: ALB 80 from internet; tasks only from ALB SG
- [x] ALB + target group, health check path `/health`
- [x] ECS tasks in public subnets with public IPs (so they can pull ECR without NAT)

---

## 📦 Data

- [x] DynamoDB table on-demand (PK design documented in README or `docs/`)
- [x] Encryption at rest (AWS owned OK)
- [x] S3 bucket: Block Public Access all four settings, SSE, no public ACL
- [x] Lifecycle or abort incomplete uploads if you enable multipart (optional)

---

## 🚢 Compute + registry

- [x] ECR repository + lifecycle (keep last N images)
- [x] ECS cluster + Fargate service, desired count **1**
- [x] Task definition: small CPU/memory, `awslogs` driver
- [x] Rolling deploy on new image tag; health check failure behavior documented

---

## 🔑 IAM

- [x] Execution role: ECR pull + this log group
- [x] Task role: this DynamoDB table + this S3 bucket + logs only
- [x] GitHub Actions OIDC role: this ECR + this Terraform stack
- [x] No write wildcards unless AWS forces it — comment why

---

## 🔬 Observability + runbook

- [x] Log group, **7-day** retention
- [x] Alarm: unhealthy hosts > 0 and/or ALB 5xx → SNS email
- [ ] Confirm SNS subscription once — after first apply
- [x] `docs/RUNBOOK.md` — alarm fired → checks (ALB targets, task status, recent logs)

---

## 🔄 CI/CD

- [x] PR: lint + test only (no apply)
- [x] `main`: build/push image tagged with `github.sha`
- [x] `main`: deploy (Terraform apply with image tag **or** force new ECS deployment — pick one and lock it)
- [x] Document required GitHub vars (role ARN, region)

**Deploy path lock (check one):**

- [ ] A) Terraform apply on every main push (image tag variable)
- [x] B) Terraform for infra once; Actions only pushes image + forces ECS deployment

---

## 🧪 Manual demo script

- [ ] Apply → hit ALB `/` and `/health` → create/list a note
- [ ] Push a trivial change → Actions → new task healthy
- [ ] (Optional) break `/health` on a branch — note what happens at count=1
- [ ] `terraform destroy` → confirm ALB/ECS/table/bucket gone (empty S3 first if required)
- [ ] Confirm budget did not silently climb

---

## 📄 Documentation

- [x] README — design
- [x] TODO — this file
- [x] Fill Getting started after first successful apply (local path ready; AWS after demo apply)
- [x] Cross-link from Cloud Engineering + AWS README + Labs.md
- [ ] Resume bullets only after demo + destroy works

---

## Out of scope (do not start)

- RDS / Aurora
- NAT Gateway
- EKS / Helm / ArgoCD
- Custom domain / ACM (unless destroy same day)
- Multi-account / Control Tower

---

*Last updated: 2026-11-08*
