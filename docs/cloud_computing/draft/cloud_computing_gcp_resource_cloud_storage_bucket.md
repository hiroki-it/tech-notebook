---
title: 【IT技術の知見】Google Cloud Storage Bucket＠Google Cloudリソース
description: Google Cloud Storage Bucket＠Google Cloudリソースの知見を記録しています。
---

# Google Cloud Storage Bucket＠Google Cloud

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## セットアップ (コンソールの場合)

記入中...

<br>

## セットアップ (Terraformの場合)

```terraform
// ファイルを保管するバケット
resource "google_storage_bucket" "foo" {
  name                        = "foo-bucket"
  location                    = data.google_client_config.current.region
  project                     = data.google_client_config.current.project
  storage_class               = "REGIONAL"
  uniform_bucket_level_access = true
  force_destroy               = true
}

// バケットへのファイルの保管
resource "google_storage_bucket_object" "foo" {
  bucket              = google_storage_bucket.foo.name
  # 元のファイル
  source              = "/images/foo.jpg"
  # 保管先での名前
  name                = "/images/foo.jpg"
  content_disposition = "attachment"
}
```

> - https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/storage_bucket
> - https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/storage_bucket_object

<br>
