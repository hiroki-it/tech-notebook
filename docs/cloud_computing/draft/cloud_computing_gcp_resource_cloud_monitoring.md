---
title: 【IT技術の知見】Cloud Monitoring
description: Cloud Monitoringの知見を記録しています。
---

# Cloud Monitoring

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. Cloud Monitoring とは

複数のプロジェクトのメトリクスを監視用のプロジェクトに集約し、アラートポリシーに合致した場合に通知チャンネルを介して外部サービスに通知する。

![google_cloud_monitoring](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/google_cloud_monitoring.png)

> - [How To Manage Cloud Build Alerts \| Xebia](https://xebia.com/blog/how-to-manage-cloud-build-notifications/)

<br>

## 02. セットアップ

### コンソール画面からのセットアップ

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>アラート</td>
      <td>任意のメトリクスをポリシーに基づいて再集約し、条件に合致した場合にアラートを作成する。</td>
    </tr>
  </tbody>
</table>

<br>

### アラート

#### ▼ アラートとは

ポリシー (例：閾値、メトリクス再集約など) 、通知チャンネルを作成できる。

> - [指標しきい値のアラート ポリシーを作成する \| Cloud Monitoring \| Google Cloud Documentation](https://cloud.google.com/monitoring/alerts/using-alerting-ui?hl=ja)
> - [通知チャンネルを作成して管理する \| Cloud Monitoring \| Google Cloud Documentation](https://cloud.google.com/monitoring/support/notification-options?hl=ja)

#### ▼ メトリクスフィルター

フィルターパターンに合致した文字列を持つログをトリガーとして、データポイントを発生させる。

このデータポイントからメトリクスを集約し、このアラートをトリガーするメトリクスとして使用できる。

```bash
# Google Cloud Run Functionsの正常性をデータポイント化する
resource.type = "cloud_run_revision" AND metric.type = "cloudfunctions.googleapis.com/function/execution_count" AND metric.labels.status != "ok"
```

> - [Cloud Run でのログの記録と表示 \| Google Cloud Documentation](https://cloud.google.com/run/docs/logging?hl=ja#viewing-logs-gcloud-read)

<br>
