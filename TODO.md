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

---

## 💰 Cost guard (do this first)

- [ ] Create a **$1** AWS Budget + email alert (`ca-central-1`)
- [ ] Plan demo windows of **1–2 hours** only
- [ ] `terraform destroy` before leaving the machine — ALB + Fargate bill while up

---

## 🏗️ Project setup

- [ ] Repo layout: `app/`, `infra/`, `docs/`, `Dockerfile`, `.github/workflows/`
- [ ] `.gitignore` (node_modules, dist, `.terraform/`, `*.tfstate*`, `.env`)
- [x] MIT `LICENSE`
- [ ] `app/package.json` — TypeScript, tests, lint
- [ ] Optional `docker-compose.yml` for local API only (no AWS)

---

## 🌐 Application

- [ ] `GET /` — service JSON
- [ ] `GET /health` — `200` + `{ "status": "ok" }`
- [ ] Notes/expenses: create, list, get, delete (DynamoDB)
- [ ] Optional: upload metadata or small object flow to S3
- [ ] Listen on `PORT` (default `8080`)
- [ ] Unit tests for health + one CRUD path (no AWS required if mocked)
- [ ] Structured log on startup

---

## 🐳 Container

- [ ] Multi-stage `Dockerfile` (build → runtime)
- [ ] Non-root user in runtime image
- [ ] `.dockerignore`
- [ ] Local: `docker build` + `docker run` + `curl /health`

---

## ☁️ Network + load balancer

- [ ] Terraform VPC (or documented use of default VPC) with **public** subnets in 2 AZs for ALB
- [ ] **No NAT Gateway**
- [ ] Security groups: ALB 80 from internet; tasks only from ALB SG
- [ ] ALB + target group, health check path `/health`
- [ ] ECS tasks in public subnets with public IPs (so they can pull ECR without NAT)

---

## 📦 Data

- [ ] DynamoDB table on-demand (PK design documented in README or `docs/`)
- [ ] Encryption at rest (AWS owned OK)
- [ ] S3 bucket: Block Public Access all four settings, SSE, no public ACL
- [ ] Lifecycle or abort incomplete uploads if you enable multipart (optional)

---

## 🚢 Compute + registry

- [ ] ECR repository + lifecycle (keep last N images)
- [ ] ECS cluster + Fargate service, desired count **1**
- [ ] Task definition: small CPU/memory, `awslogs` driver
- [ ] Rolling deploy on new image tag; health check failure behavior documented

---

## 🔑 IAM

- [ ] Execution role: ECR pull + this log group
- [ ] Task role: this DynamoDB table + this S3 bucket + logs only
- [ ] GitHub Actions OIDC role: this ECR + this Terraform stack
- [ ] No write wildcards unless AWS forces it — comment why

---

## 🔬 Observability + runbook

- [ ] Log group, **7-day** retention
- [ ] Alarm: unhealthy hosts > 0 and/or ALB 5xx → SNS email
- [ ] Confirm SNS subscription once
- [ ] `docs/RUNBOOK.md` — alarm fired → checks (ALB targets, task status, recent logs)

---

## 🔄 CI/CD

- [ ] PR: lint + test only (no apply)
- [ ] `main`: build/push image tagged with `github.sha`
- [ ] `main`: deploy (Terraform apply with image tag **or** force new ECS deployment — pick one and lock it)
- [ ] Document required GitHub vars (role ARN, region)

**Deploy path lock (check one):**

- [ ] A) Terraform apply on every main push (image tag variable)
- [ ] B) Terraform for infra once; Actions only pushes image + forces ECS deployment

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
- [ ] Fill Getting started after first successful apply
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

*Last updated: 2026-09-25*
