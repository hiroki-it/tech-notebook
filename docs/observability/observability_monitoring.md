---
title: 【IT技術の知見】監視＠可観測性
description: 監視＠可観測性の知見を記録しています。
---

# 監視＠可観測性

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 監視の要素

### 監視とは

既知のメトリクスとログを基に、システムにおける想定内の不具合の発生を未然に防ぐこと。想定内という点で、可観測性と区別できる。

> ℹ️ 参考：
>
> - https://en.wikipedia.org/wiki/Website_monitoring
> - https://blog.thundra.io/observability-driven-development-for-serverless

<br>

### 監視を構成するアクション

監視は、以下の要素からなる。

> ℹ️ 参考：https://www.amazon.co.jp/dp/4873118646

| アクション           | 説明                                                         |
| -------------------- | ------------------------------------------------------------ |
| データの収集         | 監視対象からデータを収集する。データとしては、メトリクスのデータポイント、アプリケーションログ、ブラウザログ、ユーザートラフィック、ユーザーエンゲージメント、検索クローラーのサイト評価などがある。プル型またはプッシュ型の収集方法があり、ログは全てプッシュ型になる。<br>ℹ️ 参考：https://www.alibabacloud.com/blog/pull-or-push-how-to-select-monitoring-systems_599007<br>![monitoring_collecting_pull_push](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/monitoring_collecting_pull_push.png) |
| ↓                    |                                                              |
| データの保管         | 収集したデータをストレージに保管する。データサイズを抑える方法として、データポイント数の抑制や、ダウンサンプリングがある。ダウンサンプリングでは、旧いデータポイントを時間単位で集約することにより、ストレージの空きサイズが増え、長期間のデータポイントを保管できるようになる。<br>ℹ️ 参考：https://www.timescale.com/blog/a-different-and-often-better-way-to-downsample-your-prometheus-metrics/ |
| データの分析         | 保管したデータをクエリで抽出し、集計する。                   |
| データの可視化       | 分析したデータを監視ダッシュボードに表示し、目視できるようにする。 |
| レポートの作成       | 算出値をグラフ化として、レポートを作成する。                 |
| ↓                    |                                                              |
| アラートの発火と通知 | 分析による集計値に異常がある場合、これをエラーイベントとして一次オンコール担当の開発者にアラートを通知する。全ての異常値をアラートする必要はなく、異常値とみなすための重要度レベルを決めておく。 |

<br>

### アラートの通知後のアクション

| アクション       | 説明                                                                                                  |
|-------------|-----------------------------------------------------------------------------------------------------|
| オンコール       | アラートを通知された一次オンコール担当は、エラーイベントがインシデントか否かを判断する。                                                        |
| インシデント管理    | 一次オンコール担当は、エラーを解決するためのタスクを作成し、完了させる。エラーがインシデントの場合、担当者はこれを迅速に解決する必要がある。また、二次担当者にアラートの通知をエスカレーションさせる。 |
| サービスレベルとの照合 | インシデントによって、サービス利用者に提供できたサービスがサービスレベルに満たなかった場合、サービス利用者に利用料を返金する。                                     |

<br>

## 02. 監視の種類

### フロントエンド監視

#### ▼ フロントエンド監視とは

ブラウザに関するトラフィックを監視する。

#### ▼ リアルユーザー監視（RUM）

Webページのローディング時に、Navigation-timing-APIに対してリクエストを送信すると、Webページパフォーマンスに関するメトリクスのデータポイントを収集できる。JavaScriptにNavigation-timing-APIにリクエストを送信する処理を組み込み、ページパフォーマンスに関するメトリクスのデータポイントを収集した後、これを監視する。

> ℹ️ 参考：https://developer.mozilla.org/ja/docs/Web/API/Navigation_timing_API

ページローディング時間は特に重要である。Amazonの自社調査では、ローディング時間が100ms短くなるごとに、売り上げが```1```%増加することが明らかになった。```4```秒以下を目指すと良い。

> ℹ️ 参考：https://bit.ly/2y494hq

#### ▼ Googleアナリティクスによる監視

サイト訪問後のユーザーエンゲージメントをデータとして監視する。リアルユーザー監視の一種ともみなせるが、パフォーマンスの監視が主目的ではなく、リアルユーザー監視と補完し合う監視方法である。

> ℹ️ 参考：
>
> - https://blog.uptrends.com/web-performance/rum-and-google-analytics-understanding-the-difference/
> - https://developer.akamai.com/blog/2017/03/29/RUM-data-google-analytics
> - https://www.amazon.co.jp/dp/4873118646

#### ▼ Googleサーチコンソールによる監視

検索エンジン上（サイト訪問前）のユーザーエンゲージメントをデータとして監視する。

> ℹ️ 参考：
>
> - https://support.google.com/webmasters/answer/9128668?hl=en
> - https://semlabo.com/seo/blog/difference-between-ga-and-gsc/

#### ▼ 合成監視（外部監視、外形監視）

『外部監視、外形監視』ともいう。実際のユーザーの一連の操作を模したリクエストをアプリケーションに送信し、レスポンスに関するメトリクスのデータポイントを収集した後、これを監視する。ユーザーを模したリクエストを作成するという意味合いで、『合成』という。ユーザー視点で監視できる。特に、クリティカルユーザージャーニーの一連の操作を監視すると良い。

> ℹ️ 参考：
>
> - https://takehora.hatenadiary.jp/entry/2019/07/05/012036
> - https://www.manageengine.jp/products/Applications_Manager/solution_synthetic-monitoring.html
> - https://speakerdeck.com/arisgi/yoriyi-wei-falsearujian-shi-womu-zhi-site-wai-xing-jian-shi-falseyou-xiao-huo-yong?slide=19

<br>

### アプリケーション監視（APM）

#### ▼ アプリケーション監視とは

『APM（アプリケーションパフォーマンス監視）』ともいう。アプリケーション内に常駐させたSaaSエージェントを使用して、稼働中のアプリケーションのメトリクスやアプリケーションログを収集した後、これらを監視する。メトリクスの例は以下に示す。

- SQLにかかる時間  
- ビルドまたはデプロイの開始/完了時間  
- 外部APIコールにかかる時間  
- リクエストの受信数  
- ログイン数  

#### ▼ StatsDを使用したメトリクスの作成

サーバー内にStatsDを常駐させ、アプリケーションでStatsDパッケージを使用すると、メトリクスのデータポイントを収集できる。

> ℹ️ 参考：https://github.com/statsd/statsd/wiki

CloudWatchでは、StatsDからのメトリクスの送信をサポートしている。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-custom-metrics-statsd.html
> - https://qiita.com/murata-tomohide/items/9bd1320865b2eba47538

<br>

### サーバー/コンテナ監視

#### ▼ サーバー/コンテナ監視とは

サーバー/コンテナのOSに関するメトリクスのデータポイントを収集した後、これを監視する。メトリクスの例は以下に示す。

- CPU
- メモリ
- ロードアベレージ
- ネットワーク
- ストレージ

<br>

### ネットワーク監視

<br>

### セキュリティ監視

#### ▼ セキュリティ監視とは

ログ、メトリクス、分散トレースを収集した後、これを解析し、脆弱的であるか否かを監視する。

<br>

### ヘルスチェック

#### ▼ アクティブ型

ロードバランサーからターゲットに専用のリクエストを送信し、ターゲットが正しく動作しているか否かを確認する。OSI参照モデルのいずれのレイヤーまでの動作を確認するかによって、ヘルスチェックに種類がある。

> ℹ️ 参考：
>
> - https://www.f5.com/ja_jp/services/resources/glossary/health-check
> - https://a-film-production-technique-seminar.com/fppat/materials/fpts_frp_sugeno_intro_lb01/index.html
> - https://www.fujitsu.com/jp/products/network/security-bandwidth-control-load-balancer/ipcom/material/data/1/7.html

| ヘルスチェック名 | ヘルスチェック対象のOSI層 | ターゲット             | 方法                                                         |
| ---------------- |----------------| ---------------------- | ------------------------------------------------------------ |
| ```L3```チェック       | ```L3```       | ネットワーク層まで     | サーバー/コンテナのIPアドレスにPINGリクエスト（ICMP echo）を送信し、レスポンスを検証する。正しいPINGレスポンスが返信されれば、サーバー/コンテナまでのネットワークが正しく動作していると判断できる。<br>ℹ️ 参考：https://milestone-of-se.nesuke.com/nw-basic/ip/icmp/ |
| ```L4```チェック       | ```L4```       | トランスポート層まで   | サーバー/コンテナのポートにTCPリクエストを送信し、TCPレスポンスを検証する。TCPコネクションが確立されれば、サーバー/コンテナの開放ポートまでのネットワークが正しく動作していると判断できる。 |
| ```L7```チェック       | ```L7```       | アプリケーション層まで | サーバー/コンテナ上のアプリケーションのエンドポイントにHTTPリクエストを送信し、HTTPレスポンスを検証する。正しいHTTPレスポンスが返信されれば、アプリケーション自体とその開放ポートが正しく動作していると判断できる。 |

#### ▼ パッシブ型

実際のユーザーのリクエストを借りて、ターゲットが正しく動作しているか否かを確認する。アクティブ型とは異なり、ユーザーを犠牲することになるため、Webサイトの信頼性が低下する可能性がある。

> ℹ️ 参考：https://neinvalli.hatenablog.com/entry/2017/10/31/002839

<br>

### ジョブ監視

#### ▼ ジョブ監視

ジョブ（定期的に実行するように設定されたバッチ処理）の正常実行を監視する。ジョブの実装方法としては、例えばUNIXのCronがある。

#### ▼ リクエスト型

ジョブの最後にリクエストを実行する。ジョブの開始から最後のリクエストまでが、一定の時間内に完了するか否かを確認する。

> ℹ️ 参考：https://healthchecks.io/docs/monitoring_cron_jobs/

```bash
# ジョブをCronを使用して実装する場合
# 最後にHealthchechs.ioのエンドポイントをコールする。
  8 6 * * * /foo-cron.sh && curl -fsS --retry 5 -o /dev/null https://hc-ping.com/*****
```

<br>

