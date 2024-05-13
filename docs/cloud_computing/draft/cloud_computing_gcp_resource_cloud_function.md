---
title: 【IT技術の知見】Cloud Function＠Google Cloudリソース
description: Cloud Function＠Google Cloudリソースの知見を記録しています。
---

# Cloud Function＠Google Cloud

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

https://hiroki-it.github.io/tech-notebook/

<br>

## セットアップ

### コンソール画面の場合

| 項目               | 説明                                                     |
| ------------------ | -------------------------------------------------------- |
| トリガー           | Cloud Functionを発火させる方法を設定する。               |
| ランタイム         |                                                          |
| エントリーポイント | Cloud Functionのエントリーポイントとする関数を設定する。 |

<br>

### Terraformの場合

```terraform
module "function" {

  source     = "terraform-google-modules/event-function/google"

  version    = "<バージョン>"

  region     = data.google_client_config.current.region

  project_id = data.google_client_config.current.project

  name                = "foo-function"

  description         = "this is function that do foo"

  runtime             = "<バージョン値>"

  available_memory_mb = 128

  timeout_s           = 120

  // FooFunction関数をCloud Functionのエントリーポイントとする
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

  // Cloud　Pub/SubがトリガーとなってCloud Functionを実行する
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

<br>
