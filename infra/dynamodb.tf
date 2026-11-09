# Single-table design:
#   pk = "NOTE" | "EXPENSE"
#   sk = uuid
# See docs/data-model.md

resource "aws_dynamodb_table" "items" {
  name         = "${var.project_name}-items"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  # AWS owned encryption at rest (default) is fine for the lab.
  server_side_encryption {
    enabled = true
  }

  tags = { Name = "${var.project_name}-items" }
}
