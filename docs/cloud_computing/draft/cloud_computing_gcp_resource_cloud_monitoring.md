---
title: 【IT技術の知見】Cloud Monitoring＠Google Cloudリソース
description: Cloud Monitoring＠Google Cloudリソースの知見を記録しています。
---

# Cloud Monitoring＠Google Cloud

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Cloud Monitoringとは

![google_cloud_monitoring](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/google_cloud_monitoring.png)

> - https://xebia.com/blog/how-to-manage-cloud-build-notifications/

<br>

## 02. セットアップ

### コンソール画面からのセットアップ

| 項目     | 説明                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| アラート | 任意のメトリクスをポリシーに基づいて再集計し、条件に合致した場合にアラートを作成する。 |

<br>

### アラート

#### ▼ アラートとは

ポリシー (例：閾値、メトリクス再集計、など) 、通知チャンネル、を作成できる。

> - https://cloud.google.com/monitoring/alerts/using-alerting-ui?hl=ja
> - https://cloud.google.com/monitoring/support/notification-options?hl=ja

#### ▼ メトリクスフィルター

フィルターパターンに合致した文字列を持つログをトリガーとして、データポイントを発生させる。

このデータポイントを集計し、このアラートをトリガーするメトリクスとして使用できる。

```bash
# Cloud Functionの正常性をデータポイント化する
resource.type = "cloud_function" AND metric.type = "cloudfunctions.googleapis.com/function/execution_count" AND metric.labels.status != "ok"
```

<br>
