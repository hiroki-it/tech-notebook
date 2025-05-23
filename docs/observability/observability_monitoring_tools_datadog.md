---
title: 【IT技術の知見】Datadog＠監視ツール
description: Datadog＠監視ツールの知見を記録しています。
---

# Datadog＠監視ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Datadogの仕組み

テレメトリーを統合的に監視する。

<br>

## 02. モニター

### モニターとは

メトリクス/ログを監視し、システムの予測できる不具合の発生を未然に防ぐ。

<br>

### ログモニター

#### ▼ ログクエリの動作確認

ログモニターのクエリは、ログコンソールと同じ仕組みで動作する。

そのため、最初はログコンソールで必要なログを絞り込めるかを確認し、問題なければログモニターのクエリを設定する。

> - https://docs.datadoghq.com/monitors/monitor_types/log/#%E6%A4%9C%E7%B4%A2%E3%82%AF%E3%82%A8%E3%83%AA%E3%82%92%E5%AE%9A%E7%BE%A9%E3%81%99%E3%82%8B

#### ▼ シングルアラート

#### ▼ マルチアラート

ログクエリで`group by`句を定義すると、選択できるようになる。

<br>

## 02-02. アラートの発火

### グループ化

<br>

### 作成条件

#### ▼ Auto resolve

アラートを通知した後に、一定期間同じエラーイベントが発生しなければ、発火したアラートを取り下げる。

> - https://docs.datadoghq.com/monitors/create/configuration/?tab=thresholdalert#auto-resolve

<br>

## 02-03. アラートの通知内容

### 変数

#### ▼ 変数を使用した重要度レベルの共通化

重要度レベルは、アプリケーション間で共通である方が良い。

通知内容に変数を使用することにより、異なるアプリケーションに共通のアラート条件を適用できるようになる。

そのため、アプリケーション間で重要度レベルを共通化できる。

ステータスに応じてアラートするか否かの決め方については、以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring.html

#### ▼ テンプレート変数

記入中...

> - https://docs.datadoghq.com/monitors/notify/variables/?tab=is_alert#template-variables

#### ▼ マルチアラート変数

クエリの`group by`句に割り当てたタグやファセットを変数として出力する。

マルチアラートモニターを使用する場合のみ、使用できる。

#### ▼ タグ変数

構造化ログの属性値またはタグ値を変数として出力する。

`{{ log.attributes.<キー名> }}` または`{{ log.tags.<キー名> }}`として実装する。

> - https://docs.datadoghq.com/monitors/notify/variables/?tab=is_alert#matching-attributetag-variables

#### ▼ コンポジットモニター変数

> - https://docs.datadoghq.com/monitors/notify/variables/?tab=is_alert#composite-monitor-variables

#### ▼ 条件変数

> - https://docs.datadoghq.com/monitors/notify/variables/?tab=is_alert#conditional-variables

<br>

### メッセージの構成

#### ▼ タイトル

通知先にタイトルとして表示するテキストを定義する。

タイトルに変数を出力できる。

```yaml
<!-- タグ変数を出力する -->

【{{ log.attributes.service }}】{{log.attributes.env}}環境でエラーを検知しました。
```

#### ▼ 本文

通知先とテキストを定義する。

マークダウン記法を使用できる。

```html
<!-- Datadogに設定した通知先 -->

<!-- アラート状態の時に表示するテキスト -->

{{ #is_alert }}

<!-- 回復通知をフォワーディングしない場合、is_alert構文の中で定義する必要がある -->

@<本番環境のアラートチャンネル> 実行環境名：{{ log.attributes.env }}
アプリケーション名：{{ log.attributes.service }} ログステータス：{{
log.attributes.log_status }} ソース名：{{ log.tags.source }} リージョン名：{{
log.attributes.region }} {{ /is_alert }}
```

> - https://www.datadoghq.com/ja/blog/tagging-best-practices/#%e3%83%81%e3%83%bc%e3%83%a0%e7%94%a8%e3%81%ae%e8%87%aa%e5%8b%95%e7%9a%84%e3%81%8b%e3%81%a4%e5%8b%95%e7%9a%84%e3%81%aa%e3%82%a2%e3%83%a9%e3%83%bc%e3%83%88%e3%82%92%e4%bd%9c%e6%88%90%e3%81%99%e3%82%8b

<br>

## 03. リアルユーザー監視 (RUM)

### ブラウザエラー

#### ▼ ブラウザエラーとは

Datadogで、ブラウザのエラーは以下に分類される。

| エラーのソース       | エラーの例                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| コード上             | ・ハンドリングされずにコード上に表示された例外<br>・ハンドリングされずにコード上に表示されたPromiseオブジェクトの`reject`メソッドの結果 |
| ブラウザコンソール上 | `console.error`メソッドによって、コンソール上に出力されたテキスト                                                                       |
| カスタム             | `@datadog/browser-rum`パッケージの`addError`メソッドによって、datadog-APIに送信されたテキスト                                           |

> - https://docs.datadoghq.com/real_user_monitoring/browser/collecting_browser_errors/?tab=npm

<br>

## 04. 合成監視

### ブラウザテスト

#### ▼ 送信元IPアドレス

Datadog社の物理サーバーがリクエストを送信する。

物理サーバー自体はAWSやAzureによって管理されており、使用する物理サーバーのリージョンを選択できる。

リージョンごとに数個ずつ物理サーバーが存在しているため、もし合成監視対象のアプリケーションでIP制限が行われている場合は、これらの物理サーバーのIPからのリクエストを許可する必要がある。

> - https://docs.datadoghq.com/synthetics/guide/identify_synthetics_bots/?tab=singleandmultistepapitests

#### ▼ ヘッダー

| ヘッダー                      | 値                                                                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `user-agent`                  | ブラウザテストで設定したブラウザが割り当てられる。                                                                                      |
| `sec-datadog`                 | ブラウザテストのIDが割り当てられる。                                                                                                    |
| `x-datadog-trace-id`          | バックエンドがマイクロサービスアーキテクチャの場合、収集できる分散トレースを紐付けるIDが割り当てられる。                                |
| `x-datadog-parent-id`         | バックエンドがマイクロサービスアーキテクチャの場合、分散トレースのルートスパンとして、`0`が割り当てられる。                             |
| `x-datadog-origin`            | バックエンドがマイクロサービスアーキテクチャの場合、分散トレースがAPMクオータに影響しないように、`synthetics-browser`が割り当てられる。 |
| `x-datadog-sampling-priority` | バックエンドがマイクロサービスアーキテクチャの場合、分散トレースが収集される優先度として、`1`が割り当てれる。                           |

> - https://docs.datadoghq.com/synthetics/guide/identify_synthetics_bots/?tab=singleandmultistepapitests#default-headers
> - https://docs.datadoghq.com/synthetics/apm/#how-are-traces-linked-to-tests

<br>

### APIテスト

記入中...

<br>

### マルチステップAPIテスト

記入中...

<br>

## 05. セキュリティ監視

記入中

<br>

## 06. グラフ

### 図の種類

記入中...

<br>

### スケールの種類

#### ▼ log (対数) スケール

記入中...

#### ▼ linear (線形) スケール

記入中...

#### ▼ ２の累乗スケール

記入中...

#### ▼ sqrt (平方根) スケール

記入中...

<br>

## 07. コスト

記入中...

> - https://docs.datadoghq.com/account_management/billing/usage_details/

<br>
