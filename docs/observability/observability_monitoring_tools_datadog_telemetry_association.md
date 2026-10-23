---
title: 【IT技術の知見】テレメトリー間の紐付け＠Datadog
description: テレメトリー間の紐付け＠Datadog
---

# テレメトリー間の紐付け＠Datadog

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. タグ

### タグの種類

<table>
  <thead>
    <tr>
      <th>タグ名</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>host</code></td>
      <td>メトリクス、ログ、分散トレースの送信元のホスト名を示す。テレメトリーが作成元とは別の場所から受信した場合に役立つ。</td>
    </tr>
    <tr>
      <td><code>device</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>source</code></td>
      <td>ログの作成元のベンダー名を示す。</td>
    </tr>
    <tr>
      <td><code>service</code></td>
      <td>メトリクス、ログ、分散トレースの作成元のアプリケーション名を示す。</td>
    </tr>
    <tr>
      <td><code>env</code></td>
      <td>メトリクス、ログ、分散トレースの作成元の実行環境名 (dev、stg、prd) を示す。</td>
    </tr>
    <tr>
      <td><code>version</code></td>
      <td>メトリクス、ログ、分散トレースの作成元のリリースバージョンを示す。</td>
    </tr>
  </tbody>
</table>

> - https://docs.datadoghq.com/getting_started/tagging/
> - [Datadog でシステムにタグを付けるためのベストプラクティス \| Datadog](https://www.datadoghq.com/ja/blog/tagging-best-practices/)

<br>

### 統合タグ付け

統合タグ (`service`、`env`、`version`) に同じ値を割り当てると、テレメトリー間を紐付けられる。

> - https://docs.datadoghq.com/getting_started/tagging/unified_service_tagging/?tab=kubernetes

<br>

### 各コンソール画面での使い方

記入中...

> - https://docs.datadoghq.com/getting_started/tagging/using_tags/

<br>

## 01-02. 命名規則例

### 分散トレースのタグ

#### ▼ セットアップ

分散トレースのクライアントパッケージを導入したコンテナの環境変数で値を設定する。

```yaml
{
  "environment":
    [
      {"name": "DD_ENV", "value": "prd"},
      {"name": "DD_SERVICE_NAME", "value": "order"},
      {"name": "DD_SERVICE_MAPPING", "value": "pdo:order-eloquent"},
      {"name": "DD_VERSION", "value": "1.0.0"},
    ],
  ...,
}
```

#### ▼ service

スパンの作成元のアプリケーション名を表す。

<table>
  <thead>
    <tr>
      <th>規則</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>&lt;マイクロサービス名&gt;-&lt;フレームワーク名/パッケージ名&gt;</code></td>
      <td>・<code>order-pdo</code><br>・<code>order-phpredis</code><br>・<code>order-eloquent</code><br>・<code>order-doctrine</code></td>
    </tr>
  </tbody>
</table>

ただし、フレームワークのインテグレーション名は接尾辞を付けずに、単に『`<マイクロサービス名>`』とする。

なぜ接尾辞を付けないかというと、分散トレースと他のテレメトリーを紐付けるときに、同じマイクロサービス名をタグに使用しなければならないためである。

〇：`laravel` ➡️ `order`、`order-service`
✕：`laravel` ➡️ `order-laravel`、`order-service-laravel`

フレームワーク以外のパッケージなどの分散トレースは、紐付けられないことを許容している。

APM の service 名と Amazon ECS タスク/ログの service タグは、名前の付け方が異なることに注意する。

service 名はインテグレーション名が自動的に割り当てられるが、パッケージに環境変数を渡して変更もできる。

フレームワークのインテグレーション名は `DD_SERVICE_NAME` から設定する一方で、それ以外のタグ名は `DD_SERVICE_MAPPING` から設定する。

> - https://docs.datadoghq.com/tracing/setup/php/#%E3%82%A4%E3%83%B3%E3%83%86%E3%82%B0%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E5%90%8D

#### ▼ env

スパンの作成元の実行環境名を表す。

env タグは、datadog コンテナの環境変数を使用してタグ付けする。

<table>
  <thead>
    <tr>
      <th>規則</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>&lt;実行環境名&gt;	</code></td>
      <td>・<code>prd</code><br>・<code>stg</code><br>・<code>tes</code><br>・<code>dev</code></td>
    </tr>
  </tbody>
</table>

#### ▼ version

リリース時のタグのバージョンを表す。

ただし、リリースのたびに変更することが面倒なため、`1.0.0` で固定する。

<table>
  <thead>
    <tr>
      <th>規則</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>&lt;リリースタグのバージョン&gt;</code></td>
      <td><code>1.0.0</code></td>
    </tr>
  </tbody>
</table>

<br>

### Amazon ECS コンテナのタグ

#### ▼ セットアップ

Docker ラベルからタグ付けする。

#### ▼ env

AWS の実行環境名を表す。

<table>
  <thead>
    <tr>
      <th>規則</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>&lt;実行環境名&gt;	</code></td>
      <td>・<code>prd</code><br>・<code>stg</code><br>・<code>tes</code><br>・<code>dev</code></td>
    </tr>
  </tbody>
</table>

#### ▼ service

コンテナのアプリケーション名を表す。

<table>
  <thead>
    <tr>
      <th>規則</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>&lt;マイクロサービス名&gt;</code></td>
      <td>・<code>order-service</code><br>・<code>account-service</code></td>
    </tr>
  </tbody>
</table>

#### ▼ version

リリース時のタグのバージョンを表す。

ただし、リリースのたびに変更することが面倒なため、`1.0.0` で固定する。

<table>
  <thead>
    <tr>
      <th>規則</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>&lt;リリースタグのバージョン&gt;</code></td>
      <td><code>1.0.0</code></td>
    </tr>
  </tbody>
</table>

<br>

### ログのタグ

#### ▼ セットアップ

FluentBit の設定ファイルからタグ付けする。

#### ▼ env

ログの作成元の実行環境名 (dev、stg、prd) を表す。

<table>
  <thead>
    <tr>
      <th>規則</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>&lt;実行環境名&gt;	</code></td>
      <td>・<code>prd</code><br>・<code>stg</code><br>・<code>tes</code><br>・<code>dev</code></td>
    </tr>
  </tbody>
</table>

#### ▼ service

ログの作成元のアプリケーション名を表す。

<table>
  <thead>
    <tr>
      <th>規則</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>&lt;マイクロサービス名&gt;</code></td>
      <td>・<code>order</code><br>・<code>order-service</code><br>・<code>account</code><br>・<code>account-service</code></td>
    </tr>
  </tbody>
</table>

#### ▼ source

ログの作成元のベンダー名を表す。

<table>
  <thead>
    <tr>
      <th>規則</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>&lt;ソース名&gt;</code></td>
      <td>・<code>laravel</code><br>・<code>nginx</code><br>・<code>apigateway</code></td>
    </tr>
  </tbody>
</table>

<br>

### タグの候補

#### ▼ role

もし、`web` や `app` といった役割名をタグとして付与したい場合は、`role` タグを新たに作成するとよいかも。

<br>

## 02. 構造化ログと他テレメトリー間の紐付け

### 分散トレース全体との紐付け

スパンと構造化ログの統合タグ (`service`、`env`、`version`) に同じ値を割り当てると、分散トレース全体と構造化ログ間を紐付けられる。

> - https://docs.datadoghq.com/tracing/connect_logs_and_traces/

<br>

### スパンとの紐付け

スパンと構造化ログに、同じトレース ID とスパン ID を割り当てると、スパンと構造化ログ間を紐付けられる。

これにより、その構造化ログが、いずれのマイクロサービスで、またどのタイミングで発生したものかを確認できる。

![datadog_trace-viewer](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/datadog_trace-viewer.png)

> - https://docs.datadoghq.com/tracing/visualization/trace/?tab=logs

<br>

## 03. メトリクスと他テレメトリー間の紐付け

### 仮想環境のメトリクスとの紐付け

スパンとコンテナの Docker ラベルの統合タグ (`service`、`env`、`version`) に、同じ値を割り当てると、分散トレースと仮想環境の OS に関するメトリクスを紐付けられる。

<br>
