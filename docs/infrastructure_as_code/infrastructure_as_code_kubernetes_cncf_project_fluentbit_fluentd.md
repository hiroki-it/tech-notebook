---
title: 【IT技術の知見】FluentBit/Fluentd＠CNCF
description: FluentBit/Fluentd＠CNCFの知見を記録しています。
---

# FluentBit/Fluentd＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. FluentBit/Fluentdの仕組み

### アーキテクチャ

![fluent-bit_fluentd_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_fluentd_architecture.png)

FluentBit/Fluentdは、インプットフェーズ、バッファーフェーズ、アウトプットレイヤー、から構成される。

アプリケーションからログを収集し、これをフィルタリングした後、複数の宛先にルーティングする。

プッシュ型で収集されたログはまずインプットされる。

メモリやファイルをバッファーとして使用でき、ログはチャンクとしてステージに蓄えられる。

ステージに一定サイズのチャンクが蓄えられるか、または一定時間が経過すると、チャンクはキューに格納される。

キューは、指定された宛先にログを順番にルーティングする。

プロセスが再起動されると、特にメモリのバッファー上に蓄えられたログは破棄されるため、ログ損失が起こってしまう。

補足として、AWS Kinesis Data Firehoseも似たようなバッファリングとルーティングの仕組みを持っている。

> - https://atmarkit.itmedia.co.jp/ait/articles/1402/06/news007.html
> - https://zenn.dev/taisho6339/articles/eff38b47cbdbcb#(2)-%E3%83%90%E3%83%83%E3%83%95%E3%82%A1%E3%81%95%E3%82%8C%E3%81%9F%E6%9C%AA%E9%80%81%E4%BF%A1%E3%81%AE%E3%83%AD%E3%82%B0%E3%81%AE%E6%90%8D%E5%A4%B1%E3%82%92%E9%98%B2%E3%81%90
> - https://docs.fluentbit.io/manual/about/fluentd-and-fluent-bit

<br>

### バッファーの構造

バッファーは、ステージ、キュー、といったコンポーネントから構成される。ログは、『`*-*.*.flb`』という名前のチャンクとして扱われ、メモリやファイル上に保存される。

![fluent-bit_fluentd_architecture_buffer](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_fluentd_architecture_buffer.png)

> - https://www.alpha.co.jp/blog/202103_01

<br>

### 複数のログパイプラインの集約

複数のFluentBitを稼働させる場合、アウトプット先がそれぞれのログパイプラインを受信しても良いが、前段にメッセージキューを配置しても良い。

メッセージキューを配置することにより、ログパイプラインが乱雑せずに集約できるようになる。

またメッセージキューによって、アウトプット先のレートリミットを超過しないように、一定の間隔でログを送信できる。

![fluent-bit_fluentd_message-queue](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_fluentd_message-queue.png)

> - https://www.forcia.com/blog/001316.html

<br>

### 機能比較

|                  | FluentBit                                  | Fluentd                                      |
| ---------------- | ------------------------------------------ | -------------------------------------------- |
| スコープ         | 組み込みLinux/仮想環境                     | 仮想環境                                     |
| 言語             | NS                                         | C & Ruby                                     |
| メモリ最大サイズ | `650`KB                                    | `40`MB                                       |
| 依存関係         | 標準プラグインではパッケージに依存しない。 | 標準プラグインで一定数のRuby gemに依存する。 |
| 性能             | 高                                         | 高                                           |
| プラグイン数     | `70`個                                     | `1000`個以上                                 |

<br>

## 02. デザインパターンの種類

### フォワーダーアグリゲーターパターン

#### ▼ フォワーダーアグリゲーターパターンとは

フォワーダーアグリゲーターパターンは、フォワーダー、アグリゲーター、といったコンポーネントから構成される。

フォワーダーのFluentBit/Fluentdは送信元で稼働し、アグリゲーターとしての別のFluentBit/Fluentdにログを送信する。

アグリゲーターは、ログの監視バックエンドにログを送信する。

![fluent-bit_fluentd_forwarder-aggregator-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_fluentd_forwarder-aggregator-pattern.png)

> - https://fluentbit.io/blog/2020/12/03/common-architecture-patterns-with-fluentd-and-fluent-bit/
> - https://cloud.google.com/anthos/clusters/docs/attached/how-to/logging-and-monitoring#how_it_works

<br>

### エージェントパターン

#### ▼ エージェントパターンとは

エージェントパターンは、FluentBit/Fluentdのエージェントをログの送信元に常駐させ、宛先にログを直接的に送信する。

![fluent-bit_fluentd_agent-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_fluentd_agent-pattern.png)

> - https://fluentbit.io/blog/2020/12/03/common-architecture-patterns-with-fluentd-and-fluent-bit/

#### ▼ エージェントパターンの例

- KubernetesのDaemonSet配下のPodとして常駐させる。
- KubernetesのPod内のサイドカーとして配置する。
- FluentBit/Fluentdプロセスをサーバーで、プロセスとして直接的に常駐させる。

> - https://www.reddit.com/r/kubernetes/comments/ixebxw/can_someone_explain_me_about_pros_and_cons_of/

#### ▼ DaemonSetパターンとPod内サイドカーパターンの比較

| 項目                                     | Pod内サイドカーパターン | DaemonSetパターン |
| ---------------------------------------- | :---------------------: | :---------------: |
| Nodeのハードウェアリソース消費量が少ない |            ×            |        ⭕️         |
| Nodeのストレージ使用量が少ない           |           ⭕️            |         △         |
| FluentBit/Fluentdの冗長性が高い          |           ⭕️️           |         △         |
| アプリごとの設定カスタマイズ度が高い     |           ⭕️            |         △         |
| 単純性が高い                             |            ×            |        ⭕️         |

> - https://codersociety.com/blog/articles/kubernetes-logging
> - https://www.alibabacloud.com/blog/comprehensive-analysis-of-kubernetes-log-collection-principles_599411
> - https://www.reddit.com/r/kubernetes/comments/ixebxw/can_someone_explain_me_about_pros_and_cons_of/

<br>
