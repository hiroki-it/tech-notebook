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
module "foo-function" {

  // Google Cloud Run Functionsには世代数 (v1、v2) があり、本モジュールではv1になる
  source     = "terraform-google-modules/event-function/google"

  version    = "<バージョン>"

  region     = data.google_client_config.current.region

  project_id = data.google_client_config.current.project

  name                = "foo-function"

  description         = "this is function that do foo"

  runtime             = "<バージョン値>"

  available_memory_mb = 128

  timeout_s           = 120

  // FooFunction関数をGoogle Cloud Run Functionsのエントリーポイントとする
  entry_point         = "FooFunction"

  source_directory    = "${path.module}/foo_function_src"

  environment_variables = {
    FOO = "foo"
    BAR = "bar"
  }

  secret_environment_variables = {
    BAZ = "baz"
    QUX = "qux"
  }

  service_account_email        = "foo-cloudfunction@*****.iam.gserviceaccount.com"

  // Google Cloud Pub/SubがトリガーとなってGoogle Cloud Run Functionsを実行する
  event_trigger = {
    event_type = "providers/cloud.pubsub/eventTypes/topic.publish"
    resource   = google_pubsub_topic.foo.id
  }

  bucket_force_destroy = true
  create_bucket        = true
}

resource "google_pubsub_topic" "foo" {
  name = "foo-topic"
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
