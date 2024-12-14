---
title: 【IT技術の知見】Google Cloud Run Functions＠Google Cloudリソース
description: Google Cloud Run Functions＠Google Cloudリソースの知見を記録しています。
---

# Google Cloud Run Functions＠Google Cloud

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## セットアップ

### コンソール画面の場合

| 項目               | 説明                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| トリガー           | Google Cloud Run Functionsを発火させる方法を設定する。               |
| ランタイム         | CloudFunctionで実行するアプリのランタイムを設定する。                |
| エントリーポイント | Google Cloud Run Functionsのエントリーポイントとする関数を設定する。 |

<br>

### Terraformの場合

#### ▼ 世代数v1

```terraform
module "foo_function" {

  // Google Cloud Run Functionsには世代数 (v1、v2) があり、本モジュールではv1になる
  source            = "GoogleCloudPlatform/cloud-functions/google"

  version    = "<バージョン>"

  function_location     = data.google_client_config.current.region

  project_id = data.google_client_config.current.project

  function_name                = "foo-function"

  description         = "this is function that do foo"

  runtime             = "<バージョン値>"

  service_config = {
    available_memory              = 128
    max_instance_count            = 3000
    runtime_env_variables         = {
      FOO = "FOO"
    }
    runtime_secret_env_variables  = {
      key_name = "BAR"
      project_id = "x-project"
      secret = "x-secret"
      version = 1
    }
    service_account_email         = google_service_account.foo_function.email
    timeout_seconds               = 120
    vpc_connector                 = google_vpc_access_connector.foo_function.id
    vpc_connector_egress_settings = "ALL_TRAFFIC"
  }

  // FooFunction関数をGoogle Cloud Run Functionsのエントリーポイントとする
  entrypoint         = "FooFunction"

  storage_source = {
    bucket = google_storage_bucket.function.name
    object = google_storage_bucket_object.function.source
  }

  // Google Cloud Pub/SubがトリガーとなってGoogle Cloud Run Functionsを実行する
  event_trigger = {
    event_type = "providers/cloud.pubsub/eventTypes/topic.publish"
    resource   = google_pubsub_topic.foo_function.id
    service_account_email = null
    retry_policy          = "RETRY_POLICY_RETRY"
  }
}

resource "google_pubsub_topic" "foo_function" {
  name = "foo-topic"
}

// 関数ソースコードを保管するバケット
resource "google_storage_bucket" "foo_function" {
  name                        = "foo-bucket"
  location                    = data.google_client_config.current.region
  project                     = data.google_client_config.current.project
  storage_class               = "REGIONAL"
  uniform_bucket_level_access = true
  force_destroy               = true
}

// バケットでの関数ソースコードの保管方法
resource "google_storage_bucket_object" "foo_function" {
  name                = "${data.archive_file.function.output_md5}-${basename(data.archive_file.function.output_path)}
  bucket              = google_storage_bucket.foo_function.name
  source              = data.archive_file.foo_function.output_path
  content_disposition = "attachment"
  content_type        = "application/zip"
}

// 圧縮ファイルをバージョン管理する
data "archive_file" "foo_function" {
  type        = "zip"
  output_path = "${path.module}/foo-function-src.zip"
  source_dir  = "${path.module}/foo-function-src"
}

data "google_client_config" "current" {}
```

> - https://github.com/terraform-google-modules/terraform-google-event-function

#### ▼ 世代数v2

```terraform
module "foo-function" {

  // Google Cloud Run Functionsには世代数 (v1、v2) があり、本モジュールではv2になる
  source  = "GoogleCloudPlatform/cloud-functions/google"

  version = "~> 0.4"

  # Required variables

  function_name  = "<FUNCTION_NAME>"

  project_id     = "<PROJECT_ID>"

  location       = "<LOCATION>"

  runtime        = "<RUNTIME>"

  entrypoint     = "<ENTRYPOINT>"

  storage_source = {
    bucket      = "<BUCKET_NAME>"
    object      = "<ARCHIVE_PATH>"
    generation  = "<GCS_GENERATION>"
  }
}
```

> - https://github.com/GoogleCloudPlatform/terraform-google-cloud-functions

<br>
