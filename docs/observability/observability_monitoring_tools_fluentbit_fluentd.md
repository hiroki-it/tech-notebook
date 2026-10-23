---
title: 【IT技術の知見】FluentBit/Fluentd＠監視ツール
description: FluentBit/Fluentd＠監視ツールの知見を記録しています。
---

# FluentBit/Fluentd＠監視ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. FluentBit/Fluentd の仕組み

### アーキテクチャ

![fluent-bit_fluentd_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_fluentd_architecture.png)

FluentBit/Fluentd は、インプットフェーズ、バッファーフェーズ、アウトプットレイヤーから構成される。

アプリケーションからログを収集し、これをフィルタリングした後、複数の宛先にルーティングする。

プッシュ型で収集したログはまずインプットされる。

メモリやファイルをバッファーとして使用でき、ログはチャンクとしてステージに蓄えられる。

ステージに一定サイズのチャンクが蓄えられるか、または一定時間が経過すると、チャンクはキューに格納される。

キューは、指定された宛先にログを順番にルーティングする。

プロセスが再起動されると、特にメモリのバッファー上に蓄えられたログは破棄されるため、ログ損失が起こってしまう。

補足として、AWS Kinesis Data Firehose も似たようなバッファリングとルーティングの仕組みを持っている。

> - [増えるログ、多様化するログをどう効率的に運用するか：今さら聞けないfluentd〜クラウド時代のログ管理入門（1）（1/2 ページ） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/1402/06/news007.html)
> - [KubernetesでFluentdの信頼性を担保するための3つの観点](<https://zenn.dev/taisho6339/articles/eff38b47cbdbcb#(2)-%E3%83%90%E3%83%83%E3%83%95%E3%82%A1%E3%81%95%E3%82%8C%E3%81%9F%E6%9C%AA%E9%80%81%E4%BF%A1%E3%81%AE%E3%83%AD%E3%82%B0%E3%81%AE%E6%90%8D%E5%A4%B1%E3%82%92%E9%98%B2%E3%81%90>)
> - [Fluentd and Fluent Bit \| Fluent Bit: Official Manual](https://docs.fluentbit.io/manual/about/fluentd-and-fluent-bit)

<br>

### バッファーの構造

バッファーは、ステージ、キュー、といったコンポーネントから構成される。ログは、『`*-*.*.flb`』という名前のチャンクとして扱われ、メモリやファイル上に保管される。

![fluent-bit_fluentd_architecture_buffer](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_fluentd_architecture_buffer.png)

> - [クラウドにログを保管する仕組みから、敢えてKinesis Data Firehoseを外す - アルファテックブログ](https://www.alpha.co.jp/blog/202103_01)

<br>

### 複数のログパイプラインの集約

複数の FluentBit を稼働させる場合、アウトプット先がそれぞれのログパイプラインを受信してもよいが、送信元にメッセージキューを配置してもよい。

メッセージキューを配置すると、ログパイプラインを乱雑にせず、集約できるようになる。

またメッセージキューによって、アウトプット先のレートリミットを超過しないように、一定の間隔でログを送信できる。

![fluent-bit_fluentd_message-queue](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_fluentd_message-queue.png)

> - [フォルシアのログ分析基盤チームがアーキテクチャを振り返る│FORCIA CUBE│フォルシア株式会社](https://www.forcia.com/blog/001316.html)

<br>

### 機能比較

<table>
  <thead>
    <tr>
      <th></th>
      <th>FluentBit</th>
      <th>Fluentd</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>スコープ</td>
      <td>組み込み Linux/仮想環境</td>
      <td>仮想環境</td>
    </tr>
    <tr>
      <td>言語</td>
      <td>NS</td>
      <td>C &amp; Ruby</td>
    </tr>
    <tr>
      <td>メモリ最大サイズ</td>
      <td><code>650</code>KB</td>
      <td><code>40</code>MB</td>
    </tr>
    <tr>
      <td>依存関係</td>
      <td>標準プラグインではパッケージに依存しない。</td>
      <td>標準プラグインで一定数の Ruby gem に依存する。</td>
    </tr>
    <tr>
      <td>性能</td>
      <td>高</td>
      <td>高</td>
    </tr>
    <tr>
      <td>プラグイン数</td>
      <td><code>70</code> 個</td>
      <td><code>1000</code> 個以上</td>
    </tr>
  </tbody>
</table>

<br>

## 02. デザインパターンの種類

### エージェントパターン

#### ▼ エージェントパターンとは

エージェントパターンは、エージェントコンポーネントから構成される。

ログの送信元では、エージェント(FluentBit/Fluentd) が常駐し、ログを収集する。

さらに、エージェントはログを監視バックエンドに送信する。

![fluent-bit_fluentd_agent-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_fluentd_agent-pattern.png)

> - [Common Architecture Patterns with Fluentd and Fluent Bit](https://fluentbit.io/blog/2020/12/03/common-architecture-patterns-with-fluentd-and-fluent-bit/)

#### ▼ エージェントパターンの実装例

エージェントは、デーモンプロセス、サイドカー、DaemonSet などで実装する。

- FluentBit/Fluentd プロセスをサーバーで、プロセスとして直接的に常駐させる。
- Kubernetes の Pod 内のサイドカーとして配置する。
- Kubernetes の DaemonSet 配下の Pod として常駐させる。

> - https://www.reddit.com/r/kubernetes/comments/ixebxw/can_someone_explain_me_about_pros_and_cons_of/

#### ▼ DaemonSet パターンと Pod 内サイドカーパターンの比較

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th style="text-align:center">Pod 内サイドカーパターン</th>
      <th style="text-align:center">DaemonSet パターン</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Node のハードウェアリソース消費量が少ない</td>
      <td style="text-align:center">×</td>
      <td style="text-align:center">⭕️</td>
    </tr>
    <tr>
      <td>Node のストレージ使用量が少ない</td>
      <td style="text-align:center">⭕️</td>
      <td style="text-align:center">△</td>
    </tr>
    <tr>
      <td>FluentBit/Fluentd の冗長性が高い</td>
      <td style="text-align:center">⭕️️</td>
      <td style="text-align:center">△</td>
    </tr>
    <tr>
      <td>アプリごとの設定カスタマイズ度が高い</td>
      <td style="text-align:center">⭕️</td>
      <td style="text-align:center">△</td>
    </tr>
    <tr>
      <td>単純性が高い</td>
      <td style="text-align:center">×</td>
      <td style="text-align:center">⭕️</td>
    </tr>
  </tbody>
</table>

> - [Kubernetes Logging in Production — Coder Society](https://codersociety.com/blog/articles/kubernetes-logging)
> - [Comprehensive Analysis of Kubernetes Log Collection Principles - Alibaba Cloud Community](https://www.alibabacloud.com/blog/comprehensive-analysis-of-kubernetes-log-collection-principles_599411)
> - https://www.reddit.com/r/kubernetes/comments/ixebxw/can_someone_explain_me_about_pros_and_cons_of/

<br>

### フォワーダーアグリゲーターパターン

#### ▼ フォワーダーアグリゲーターパターンとは

フォワーダーアグリゲーターパターンは、フォワーダー、アグリゲーター、といったコンポーネントから構成される。

ログの送信元では、フォワーダー (FluentBit/Fluentd) は `L7` ロードバランサーを介してログを収集する。

さらに、フォワーダーは別の FluentBit/Fluentd (アグリゲーター) にログを送信する。

アグリゲーターはログを集約し、監視バックエンドにログを送信する。

![fluent-bit_fluentd_forwarder-aggregator-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_fluentd_forwarder-aggregator-pattern.png)

> - [Common Architecture Patterns with Fluentd and Fluent Bit](https://fluentbit.io/blog/2020/12/03/common-architecture-patterns-with-fluentd-and-fluent-bit/)
> - https://cloud.google.com/anthos/clusters/docs/attached/how-to/logging-and-monitoring#how_it_works

#### ▼ フォワーダーアグリゲーターパターンの実装例

`L7` ロードバランサーは Ingress Controller、アグリゲーターは Deployment などで実装できる。

FluentBit/Fluentd 以外で言うと、Nginx で実装された Grafana Loki Gateway は `L7` ロードバランサーである。

Grafana Loki Gateway は、Cluster 内の Grafana Alloy からログを受信し、Grafana Loki に送信する。

<br>
