---
title: 【IT技術の知見】AWS Athena＠AWSリソース
description: AWS Athena＠AWSリソースの知見を記録しています。
---

# AWS Athena＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>


## 02. セットアップ

### Terraform

保存されたクエリをTerraformで定義しておく。

```terraform
resource "aws_athena_named_query" "create_table_foo_alb_logs" {
  name      = "${local.name}-create-table-foo-alb-logs"
  workgroup = aws_athena_workgroup.platform_logs.id
  database  = aws_athena_database.elb_logs.name
  query = templatefile("${path.module}/athena_query/create-table-foo-alb-logs.sql.tpl", {
    table_name     = replace("${local.name}-foo-alb-logs", "-", "_")
    s3_bucket_name = module.s3_elb_logs.s3_bucket_id
    alb_name       = "${local.name}-foo-alb"
    account_id     = data.aws_caller_identity.current.account_id
    region         = data.aws_region.current.name
  })
}
```

```sql
-- ALBアクセスログのフィールドに応じたカラムをテーブルで用意する
CREATE EXTERNAL TABLE IF NOT EXISTS `${table_name}` (
  type string,
  time string,
  elb string,
  client_ip string,
  client_port int,
  target_ip string,
  target_port int,
  request_processing_time double,
  target_processing_time double,
  response_processing_time double,
  elb_status_code int,
  target_status_code string,
  received_bytes bigint,
  sent_bytes bigint,
  request_verb string,
  request_url string,
  request_proto string,
  user_agent string,
  ssl_cipher string,
  ssl_protocol string,
  target_group_arn string,
  trace_id string,
  domain_name string,
  chosen_cert_arn string,
  matched_rule_priority string,
  request_creation_time string,
  actions_executed string,
  redirect_url string,
  lambda_error_reason string,
  target_port_list string,
  target_status_code_list string,
  classification string,
  classification_reason string,
  conn_trace_id string
)
PARTITIONED BY (
  `date` string
)
ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.RegexSerDe'
WITH SERDEPROPERTIES (
  'serialization.format' = '1',
  'input.regex' = '([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*):([0-9]*) ([^ ]*)[:-]([0-9]*) ([-.0-9]*) ([-.0-9]*) ([-.0-9]*) (|[-0-9]*) (-|[-0-9]*) ([-0-9]*) ([-0-9]*) \"([^ ]*) (.*) (- |[^ ]*)\" \"([^\"]*)\" ([A-Z0-9-_]+) ([A-Za-z0-9.-]*) ([^ ]*) \"([^\"]*)\" \"([^\"]*)\" \"([^\"]*)\" ([-.0-9]*) ([^ ]*) \"([^\"]*)\" \"([^\"]*)\" \"([^ ]*)\" \"([^\s]+?)\" \"([^\s]+)\" \"([^ ]*)\" \"([^ ]*)\" ?([^ ]*)?( .*)?'
)
LOCATION 's3://${s3_bucket_name}/${alb_name}/AWSLogs/${account_id}/elasticloadbalancing/${region}/'
TBLPROPERTIES (
  'projection.enabled' = 'true',
  'projection.date.type' = 'date',
  'projection.date.range' = 'NOW-1YEARS,NOW',
  'projection.date.format' = 'yyyy/MM/dd',
  'projection.date.interval' = '1',
  'projection.date.interval.unit' = 'DAYS',
  'storage.location.template' = 's3://${s3_bucket_name}/${elb_name}/AWSLogs/${account_id}/elasticloadbalancing/${region}/$${date}'
);
```

1. terraform applyをすると、「保存したクエリ」にCREATE文がでる 
2. CREATE文をコンソール上で実行し、テーブルを作成する 
3. SELECT文を実行し、テーブル列に基づく構造のログをS3から取得する

```sql
SELECT *
FROM alb_logs
WHERE date = date_format(current_date, '%Y/%m/%d')
ORDER BY from_iso8601_timestamp(time) DESC
LIMIT 10;
```

<br>

