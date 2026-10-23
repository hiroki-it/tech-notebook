---
title: 【IT技術の知見】監視ツール＠可観測性
description: 監視ツール＠可観測性の知見を記録しています。
---

# 監視ツール＠可観測性

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. 監視ツールの比較

### メトリクスの場合

#### ▼ 種類

データポイント収集ツールを比較した。

プル型またはプッシュ型でメトリクスの元になるデータポイントを収集するツールに分類できる。

プッシュ型の場合、メトリクスを送信できるエージェントが必要である。

<table>
  <thead>
    <tr>
      <th style="text-align:center"></th>
      <th style="text-align:center">Amazon CloudWatch ベース</th>
      <th style="text-align:center">Datadog ベース</th>
      <th style="text-align:center">Istio ベース<br>連携しない状態</th>
      <th style="text-align:center">Istio ベース<br>ビルトイン Prometheus と連携した状態</th>
      <th style="text-align:center">OpenTelemetry ベース</th>
      <th style="text-align:center">Prometheus ベース</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:center">メトリクスの元になるデータポイントの作成</td>
      <td style="text-align:center">cloudwatch エージェント</td>
      <td style="text-align:center">datadog エージェント</td>
      <td style="text-align:center">Envoy によるリクエスト系メトリクスの作成</td>
      <td style="text-align:center">Envoy によるリクエスト系メトリクスの作成</td>
      <td style="text-align:center">クライアントパッケージ</td>
      <td style="text-align:center">Exporter</td>
    </tr>
    <tr>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td style="text-align:center">メトリクスの元になるデータポイントを収集<br>プル型またはプッシュ型</td>
      <td style="text-align:center">cloudwatch エージェント</td>
      <td style="text-align:center">datadog エージェント</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">prometheus サーバー</td>
      <td style="text-align:center">OpenTelemetry Collector</td>
      <td style="text-align:center">Exporter</td>
    </tr>
    <tr>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td style="text-align:center">監視バックエンドによるビルトインローカルストレージへの保管</td>
      <td style="text-align:center">Amazon CloudWatch Metrics</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">prometheus サーバー</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">prometheus サーバー</td>
    </tr>
    <tr>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td style="text-align:center">監視フロントエンドによる可視化</td>
      <td style="text-align:center">Amazon CloudWatch Metrics</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">Grafana ダッシュボード</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">Grafana ダッシュボード</td>
    </tr>
    <tr>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td style="text-align:center">分析とレポートの作成</td>
      <td style="text-align:center">Amazon CloudWatch Contributor Insights</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
    </tr>
    <tr>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td style="text-align:center">アラートの作成</td>
      <td style="text-align:center">Amazon CloudWatch アラーム</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">prometheus サーバー</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">prometheus サーバー</td>
    </tr>
  </tbody>
</table>

> - [CNCF Landscape](https://landscape.cncf.io/card-mode?category=monitoring&grouping=category&sort=stars)
> - [モニタリング入門 / Monitoring Feat. VictoriaMetrics - Speaker Deck](https://speakerdeck.com/cybozuinsideout/monitoring-feat-victoriametrics?slide=6)
> - [Istioを活用したObservability基盤の構築と運用 / Constructing and operating the observability platform using Istio - Speaker Deck](https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=19)

#### ▼ 組み合わせの例

<table>
  <thead>
    <tr>
      <th></th>
      <th style="text-align:center">Amazon CloudWatch ベース</th>
      <th style="text-align:center">Datadog ベース</th>
      <th style="text-align:center">Istio ベース</th>
      <th style="text-align:center">Prometheus ベース</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>メトリクスの元になるデータポイントの作成</td>
      <td style="text-align:center">Amazon CloudWatch エージェント</td>
      <td style="text-align:center">datadog エージェント</td>
      <td style="text-align:center">Exporter<br>+ <br>Envoy によるリクエスト系メトリクスの作成</td>
      <td style="text-align:center">Exporter</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>メトリクスの元になるデータポイントを収集<br>(プル型またはプッシュ型)</td>
      <td style="text-align:center">Amazon CloudWatch エージェント</td>
      <td style="text-align:center">datadog エージェント</td>
      <td style="text-align:center">prometheus サーバー</td>
      <td style="text-align:center">Exporter</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>監視バックエンドによるビルトインローカルストレージへの保管</td>
      <td style="text-align:center">Amazon CloudWatch Metrics</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">prometheus サーバー</td>
      <td style="text-align:center">prometheus サーバー</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>監視フロントエンドによる可視化</td>
      <td style="text-align:center">Amazon CloudWatch Metrics</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">Grafana ダッシュボード</td>
      <td style="text-align:center">Grafana ダッシュボード</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>分析とレポートの作成</td>
      <td style="text-align:center">Amazon CloudWatch Metrics</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>アラートの作成</td>
      <td style="text-align:center">Amazon CloudWatch アラーム</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">prometheus サーバー</td>
      <td style="text-align:center">prometheus サーバー</td>
    </tr>
  </tbody>
</table>

<br>

### ログの場合

#### ▼ 種類

ログ収集ツールを比較した。

いずれもプッシュ型でログを収集し、ログを監視バックエンドに送信できるエージェントが必要である。

<table>
  <thead>
    <tr>
      <th></th>
      <th style="text-align:center">Amazon CloudWatch ベース</th>
      <th style="text-align:center">Elasticsearch ベース</th>
      <th style="text-align:center">Fluentd／Fluentbit<br>ベース</th>
      <th style="text-align:center">Grafana Loki ベース</th>
      <th style="text-align:center">Istio ベース<br>(連携しない状態)</th>
      <th style="text-align:center">Istio ベース<br>(ビルトイン OpenTelemetry と連携した状態)</th>
      <th style="text-align:center">OpenTelemetry ベース</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>実行ログの作成</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
    </tr>
    <tr>
      <td>アクセスログの作成</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">(Envoy によるアクセスログ作成)</td>
      <td style="text-align:center">(Envoy によるアクセスログ作成)</td>
      <td style="text-align:center">-</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>ログの収集<br>(いずれもプッシュ型による送信方式)</td>
      <td style="text-align:center">(cloudwatch エージェント)</td>
      <td style="text-align:center">(Logstach)</td>
      <td style="text-align:center">Fluentd／Fluentbit</td>
      <td style="text-align:center">(Grafana Alloy)</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">(Envoy から OpenTelemetry Collector への送信)</td>
      <td style="text-align:center">(OpenTelemetry Collector)</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>監視バックエンドによるビルトインローカルストレージへの保管</td>
      <td style="text-align:center">(Amazon CloudWatch Logs)</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">(BoltDB)</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>監視フロントエンドによる可視化</td>
      <td style="text-align:center">(Amazon CloudWatch Logs ダッシュボード)</td>
      <td style="text-align:center">Elasticsearch ダッシュボード</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center"></td>
      <td style="text-align:center"></td>
      <td style="text-align:center"></td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td>分析とレポートの作成</td>
      <td style="text-align:center">(Amazon CloudWatch Contributor Insights)</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>アラートの作成</td>
      <td style="text-align:center">(Amazon CloudWatch アラーム)</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
    </tr>
  </tbody>
</table>

> - [CNCF Landscape](https://landscape.cncf.io/card-mode?category=logging&grouping=category&sort=stars)
> - [ログ収集ツールの比較 #Fluentd - Qiita](https://qiita.com/kazookie/items/eef3071a0667cb4d5136)
> - https://www.reddit.com/r/kubernetes/comments/qv6qqx/comment/hkul7kb/?utm_source=share&utm_medium=web2x&context=3
> - [Istioを活用したObservability基盤の構築と運用 / Constructing and operating the observability platform using Istio - Speaker Deck](https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=19)

#### ▼ 組み合わせの例

<table>
  <thead>
    <tr>
      <th></th>
      <th style="text-align:center">Amazon CloudWatch ベース</th>
      <th style="text-align:center">Datadog ベース</th>
      <th style="text-align:center">Istio ベース</th>
      <th style="text-align:center">Prometheus ベース</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>実行ログの作成</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
    </tr>
    <tr>
      <td>アクセスログの作成</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">Envoy によるアクセスログ作成</td>
      <td style="text-align:center">-</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>ログの収集<br>(いずれもプッシュ型による送信方式)</td>
      <td style="text-align:center">Fluentd<br>Fluentbit</td>
      <td style="text-align:center">Fluentd<br>Fluentbit</td>
      <td style="text-align:center">Fluentd<br>Fluentbit<br>(OpenTelemetry Collector でも可)</td>
      <td style="text-align:center">Grafana Alloy</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>監視バックエンドによるビルトインローカルストレージへの保管</td>
      <td style="text-align:center">Amazon CloudWatch Logs</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">Grafana Loki</td>
      <td style="text-align:center">Grafana Loki</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>監視フロントエンドによる可視化</td>
      <td style="text-align:center">Amazon CloudWatch Logs ダッシュボード</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">Grafana ダッシュボード</td>
      <td style="text-align:center">Grafana ダッシュボード</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td>分析とレポートの作成</td>
      <td style="text-align:center">Amazon CloudWatch Logs インサイト</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">Grafana ダッシュボード</td>
      <td style="text-align:center">Grafana ダッシュボード</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>アラートの作成</td>
      <td style="text-align:center">Amazon CloudWatch アラーム</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">prometheus サーバー</td>
      <td style="text-align:center">prometheus サーバー</td>
    </tr>
  </tbody>
</table>

<br>

### 分散トレースの場合

#### ▼ 種類

分散トレース収集ツールを比較した。

いずれもプッシュ型で分散トレースを収集し、分散トレースを監視バックエンドに送信できるエージェントが必要である。

<table>
  <thead>
    <tr>
      <th></th>
      <th style="text-align:center">AWS X-Ray</th>
      <th style="text-align:center">Datadog</th>
      <th style="text-align:center">Istio<br>連携しない状態</th>
      <th style="text-align:center">Istio<br>ビルトイン Jaeger と連携した状態</th>
      <th style="text-align:center">Jaeger</th>
      <th style="text-align:center">OpenTelemetry</th>
      <th style="text-align:center">Zipkin</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>トレース ID とスパン ID の作成</td>
      <td style="text-align:center">x-ray クライアントパッケージ</td>
      <td style="text-align:center">datadog クライアントパッケージ</td>
      <td style="text-align:center">Envoy による各種 ID の作成</td>
      <td style="text-align:center">Envoy による各種 ID の作成</td>
      <td style="text-align:center">jaeger エージェント</td>
      <td style="text-align:center">otel クライアントパッケージ</td>
      <td style="text-align:center">-</td>
    </tr>
    <tr>
      <td>各種 ID のアプリ間の伝播</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>分散トレースの収集<br>いずれもプッシュ型による送信方式</td>
      <td style="text-align:center">x-ray エージェント</td>
      <td style="text-align:center">datadog エージェント</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">Envoy から Jaeger Collector への送信</td>
      <td style="text-align:center">Jaeger Collector</td>
      <td style="text-align:center">OpenTelemetry Collector</td>
      <td style="text-align:center">zipkin collector</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>監視バックエンドによるビルトインローカルストレージへの保管</td>
      <td style="text-align:center">AWS X-Ray ダッシュボード</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">Jaeger のビルトインの Apache Cassandra、Elasticsearch</td>
      <td style="text-align:center">Apache Cassandra、Elasticsearch</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>監視フロントエンドによる可視化</td>
      <td style="text-align:center">AWS X-Ray ダッシュボード</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">Grafana ダッシュボード</td>
      <td style="text-align:center">✅</td>
      <td style="text-align:center">✅</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">✅</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center"></td>
      <td style="text-align:center"></td>
      <td style="text-align:center"></td>
      <td style="text-align:center"></td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td>分析とレポートの作成</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>アラートの作成</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
    </tr>
  </tbody>
</table>

> - [CNCF Landscape](https://landscape.cncf.io/card-mode?category=tracing&grouping=category&sort=stars)
> - https://docs.openshift.com/container-platform/4.7/distr_tracing/distr_tracing_install/distr-tracing-deploying-otel.html#distr-tracing-config-otel-collector_deploying-distr-tracing-data-collection
> - [マイクロサービスの障害で胃を痛めないための「シン・オブザーバビリティ基盤」をOpenTelemetryで作る：Cloud Nativeチートシート（25） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#022)
> - [Istioを活用したObservability基盤の構築と運用 / Constructing and operating the observability platform using Istio - Speaker Deck](https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=19)

#### ▼ 組み合わせの例

<table>
  <thead>
    <tr>
      <th></th>
      <th style="text-align:center">Datadog ベース</th>
      <th style="text-align:center">Istio ベース</th>
      <th style="text-align:center">OpenTelemetry ベース</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>トレース ID とスパン ID の作成</td>
      <td style="text-align:center">クライアントパッケージ</td>
      <td style="text-align:center">Envoy による各種 ID の作成</td>
      <td style="text-align:center">クライアントパッケージ</td>
    </tr>
    <tr>
      <td>各種 ID のアプリ間の伝播</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>分散トレースの収集<br>(いずれもプッシュ型による送信方式)</td>
      <td style="text-align:center">datadog エージェント</td>
      <td style="text-align:center">Envoy から Jaeger Collector への送信</td>
      <td style="text-align:center">OpenTelemetry Collector への送信</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>監視バックエンドによるビルトインローカルストレージへの保管</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">Jaeger のビルトインの Apache Cassandra、Elasticsearch</td>
      <td style="text-align:center">-</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>監視フロントエンドによる可視化</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">Jaeger</td>
      <td style="text-align:center">Grafana Tempo</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>分析とレポートの作成</td>
      <td style="text-align:center">Datadog ダッシュボード</td>
      <td style="text-align:center">Jaeger</td>
      <td style="text-align:center">Grafana Tempo</td>
    </tr>
    <tr>
      <td>⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
      <td style="text-align:center">⬇️</td>
    </tr>
    <tr>
      <td>アラートの作成</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">-</td>
    </tr>
  </tbody>
</table>

<br>

### テレメトリー間の紐付け

テレメトリー間の紐付けツールを比較した。

トレース ID とスパン ID を付与したログ、スパンメトリクス、分散トレースの間を紐付けられる。

各種ツールで、テレメトリーを保管しておく場所 (データソース) に制限がある。

<table>
  <thead>
    <tr>
      <th>アクション</th>
      <th style="text-align:center">Amazon CloudWatch</th>
      <th style="text-align:center">Datadog</th>
      <th style="text-align:center">Grafana</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ログと分散トレース間の紐付け</td>
      <td style="text-align:center">(ログは Amazon CloudWatch Logs に要保管)</td>
      <td style="text-align:center">(ログは Datadog に要保管)</td>
      <td style="text-align:center">(ログの保管ツールの種類に制限あり)</td>
    </tr>
    <tr>
      <td>メトリクスと分散トレース間の紐付け</td>
      <td style="text-align:center">(一部の言語の x-ray クライアントパッケージのみ対応)</td>
      <td style="text-align:center">(ログは Datadog に要保管)</td>
      <td style="text-align:center">(ログの保管ツールの種類に制限あり)</td>
    </tr>
  </tbody>
</table>

> - [マイクロサービスの障害で胃を痛めないための「シン・オブザーバビリティ基盤」をOpenTelemetryで作る：Cloud Nativeチートシート（25） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#03)
> - [マイクロサービスの障害で胃を痛めないための「シン・オブザーバビリティ基盤」をOpenTelemetryで作る：Cloud Nativeチートシート（25） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#04)
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/deploy_servicelens_CloudWatch_agent_logintegration.html
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/deploy_servicelens_CloudWatch_agent_segments.html

<br>

## 02. テレメトリーを利用したデバッグ

### 前提

マイクロサービスシステムで、RED メトリクスに問題があったとする。

ここでいう RED メトリクスとは、Rate (秒当たりのリクエスト数)、Errors (リクエストの失敗数)、Duration (レイテンシー)のことである。

このとき、可観測性を使用してデバッグしていく。

> - [Kubernetes障害で泣かないための羅針盤、Observabilityを活用したトラブルシューティングフロー大公開：Cloud Nativeチートシート（14） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#01)

<br>

### 原因の場所の切り分け

#### `(1)` メッシュトポロジー

メッシュトポロジー (例：Kiali) を使用して、いずれのマイクロサービス間の通信がボトルネックになっているのかを見つける。

> - [Kubernetes障害で泣かないための羅針盤、Observabilityを活用したトラブルシューティングフロー大公開：Cloud Nativeチートシート（14） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#021)

#### `(2)` メトリクス

メトリクス (例：Prometheus と Grafana) を使用して、いずれのコンポーネント (例：Node、Deployment、Pod、コンテナ) がボトルネックになっているのかを見つける。

コンポーネント単位でフィルタリングできるようなメトリクスダッシュボードがあると、原因を特定しやすい。

> - [Kubernetes障害で泣かないための羅針盤、Observabilityを活用したトラブルシューティングフロー大公開：Cloud Nativeチートシート（14） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#022)

#### `(3)` ログ

ログ (例：Fluentd) を使用して、いずれのマイクロサービスがボトルネックになっているのかを見つける。

ログにレスポンスタイムやエラーメッセージを出力していると、原因を特定しやすい。

> - [Kubernetes障害で泣かないための羅針盤、Observabilityを活用したトラブルシューティングフロー大公開：Cloud Nativeチートシート（14） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#023)

<br>

### 原因の種類の切り分け

#### `(4)` ハードウェアリソース系メトリクス

ハードウェアリソース系のメトリクスから、いずれのコンポーネント (例：Node、Deployment、Pod、コンテナ) がボトルネックになっているのかを見つける。

ハードウェアリソース系のメトリクスを監視できるようなメトリクスダッシュボードがあると、原因を特定しやすい。

> - [Kubernetes障害で泣かないための羅針盤、Observabilityを活用したトラブルシューティングフロー大公開：Cloud Nativeチートシート（14） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#042)

#### `(5)` 状態系メトリクス

ステータス系のメトリクスから、いずれのコンポーネント (例：Node、Deployment、Pod、コンテナ) がボトルネックになっているのかを見つける。

> - [Kubernetes障害で泣かないための羅針盤、Observabilityを活用したトラブルシューティングフロー大公開：Cloud Nativeチートシート（14） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#043)

#### `(6)` ネットワーク系メトリクス

ネットワーク系のメトリクスから、いずれのコンポーネント (例：Node、Deployment、Pod、コンテナ) がボトルネックになっているのかを見つける。

<br>

### 原因の特定

#### `(7)` Pod のハードウェアリソース不足

> - [Kubernetes障害で泣かないための羅針盤、Observabilityを活用したトラブルシューティングフロー大公開：Cloud Nativeチートシート（14） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#061)

#### `(8)` Node のハードウェアリソース不足

> - [Kubernetes障害で泣かないための羅針盤、Observabilityを活用したトラブルシューティングフロー大公開：Cloud Nativeチートシート（14） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#062)

#### `(9)` ミドルウェア/アプリケーションのロジックの問題

> - [Kubernetes障害で泣かないための羅針盤、Observabilityを活用したトラブルシューティングフロー大公開：Cloud Nativeチートシート（14） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#063)

#### `(10)` Node の障害

> - [Kubernetes障害で泣かないための羅針盤、Observabilityを活用したトラブルシューティングフロー大公開：Cloud Nativeチートシート（14） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#064)

#### `(11)` Resource Quota の問題

> - [Kubernetes障害で泣かないための羅針盤、Observabilityを活用したトラブルシューティングフロー大公開：Cloud Nativeチートシート（14） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#065)

#### `(12)` Eviction の発生 (Pod の予期せぬ退避)

> - [Kubernetes障害で泣かないための羅針盤、Observabilityを活用したトラブルシューティングフロー大公開：Cloud Nativeチートシート（14） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#066)

#### `(13)` コンテナイメージの Pull エラー

> - [Kubernetes障害で泣かないための羅針盤、Observabilityを活用したトラブルシューティングフロー大公開：Cloud Nativeチートシート（14） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#067)

#### `(14)` Liveness Probe の失敗

> - [Kubernetes障害で泣かないための羅針盤、Observabilityを活用したトラブルシューティングフロー大公開：Cloud Nativeチートシート（14） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#068)

#### `(15)` ミドルウェア/アプリケーションに関するその他の問題

> - [Kubernetes障害で泣かないための羅針盤、Observabilityを活用したトラブルシューティングフロー大公開：Cloud Nativeチートシート（14） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#069)

<br>
