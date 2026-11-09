# DynamoDB data model

**Table:** `ledgerlift-items` (on-demand)

| Attribute | Type | Role |
| --- | --- | --- |
| `pk` | String | Partition key — `NOTE` or `EXPENSE` |
| `sk` | String | Sort key — item UUID |
| `entityType` | String | Same as `pk` (handy for filters) |
| `id` | String | Same as `sk` |
| `title` | String | Display title |
| `body` | String | Notes only |
| `amountCents` | Number | Expenses only |
| `currency` | String | Expenses only (default `CAD`) |
| `createdAt` / `updatedAt` | String | ISO-8601 |
| `s3Key` | String | Optional attachment key under `attachments/` |

**Access patterns**

1. Create note/expense → `PutItem` with `pk`/`sk`
2. List notes or expenses → `Query` `pk = NOTE|EXPENSE`
3. Get / delete by id → `GetItem` / `DeleteItem` on `pk` + `sk`

No GSIs — the lab only needs type-scoped lists.
