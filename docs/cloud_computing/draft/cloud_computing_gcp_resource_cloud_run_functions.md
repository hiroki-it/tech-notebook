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

  // Cloud Run Functionsには世代数 (v1、v2) があり、本モジュールではv1になる
  source     = "terraform-google-modules/event-function/google"

  version    = "<バージョン>"

  region     = data.google_client_config.current.region

  project_id = data.google_client_config.current.project

  name                = "foo-function"

  description         = "this is function that do foo"

  runtime             = "<バージョン値>"

  available_memory_mb = 128

  timeout_s           = 120

  // FooFunction関数をCloud Run Functionsのエントリーポイントとする
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

  // Cloud　Pub/SubがトリガーとなってCloud Run Functionsを実行する
  event_trigger = {
    event_type = "providers/cloud.pubsub/eventTypes/topic.publish"
    resource   = google_pubsub_topic.foo_function.id
  }

  bucket_force_destroy = true
  create_bucket        = true
}

resource "google_pubsub_topic" "foo_function" {
  name = "foo-topic"
}

data "google_client_config" "current" {}
```

> - https://github.com/terraform-google-modules/terraform-google-event-function

#### ▼ 世代数v2

```terraform
module "foo_function" {

  // Google Cloud Run Functionsには世代数 (v1、v2) があり、本モジュールではv1になる
  source = "GoogleCloudPlatform/cloud-functions/google"

  version = "<バージョン>"

  function_location = data.google_client_config.current.region

  project_id = data.google_client_config.current.project

  function_name = "foo-function"

  description = "this is function that do foo"

  runtime = "<バージョン値>"

  service_config = {
    available_memory   = 128
    max_instance_count = 3000
    runtime_env_variables = {
      FOO = "FOO"
    }
    runtime_secret_env_variables = {
      key_name   = "BAR"
      project_id = "x-project"
      secret     = "x-secret"
      version    = 1
    }
    service_account_email         = google_service_account.foo_function.email
    timeout_seconds               = 120
    vpc_connector                 = google_vpc_access_connector.foo_function.id
    vpc_connector_egress_settings = "ALL_TRAFFIC"
  }

  // FooFunction関数をGoogle Cloud Run Functionsのエントリーポイントとする
  entrypoint = "FooFunction"

  storage_source = {
    bucket = google_storage_bucket.foo_function.name
    object = google_storage_bucket_object.foo_function.source
  }

  // Google Cloud Pub/SubがトリガーとなってGoogle Cloud Run Functionsを実行する
  event_trigger = {
    event_type            = "providers/cloud.pubsub/eventTypes/topic.publish"
    resource              = google_pubsub_topic.foo_function.id
    service_account_email = null
    retry_policy          = "RETRY_POLICY_RETRY"
  }
}

// 関数ソースコードを保管するバケット
// v1ではモジュール内に定義されていたが、v2になり無くなってしまったので、自前で定義する必要がある
resource "google_storage_bucket" "foo_function" {
  name                        = "foo-bucket"
  location                    = data.google_client_config.current.region
  project                     = data.google_client_config.current.project
  storage_class               = "REGIONAL"
  uniform_bucket_level_access = true
  force_destroy               = true
}

// バケットへのzipフォルダの保管
// v1ではモジュール内に定義されていたが、v2になり無くなってしまったので、自前で定義する必要がある
resource "google_storage_bucket_object" "foo_function" {
  bucket              = google_storage_bucket.foo_function.name
  # 元のzipファイル
  source              = data.archive_file.foo_function.output_path
  # 保管先での名前
  name                = "${data.archive_file.foo_function.output_md5}-${basename(data.archive_file.foo_function.output_path)}
  content_disposition = "attachment"
  content_type        = "application/zip"
}

// 圧縮ファイルをバージョン管理する
// v1ではモジュール内に定義されていたが、v2になり無くなってしまったので、自前で定義する必要がある
data "archive_file" "foo_function" {
  type        = "zip"
  output_path = "${path.module}/foo-function-src.zip"
  source_dir  = "${path.module}/foo-function-src"
}

resource "google_pubsub_topic" "foo_function" {
  name = "foo-topic"
}

data "google_client_config" "current" {}
```

> - https://github.com/GoogleCloudPlatform/terraform-google-cloud-functions

<br>
