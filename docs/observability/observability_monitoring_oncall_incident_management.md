---
title: 【IT技術の知見】インシデント＠監視
description: インシデント＠監視の知見を記録しています。
---

# オンコールとインシデント管理＠監視

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. オンコール

### オンコールとは

エラーイベントが通知された時に、エラー修正の担当者に連絡できる状態（メールアドレス、電話番号、SMS、など）にあること。

参考：https://response.pagerduty.com/oncall/being_oncall/

<br>

### エラーイベントの重要度（severity）レベル

#### ▼ エラーイベント重要度レベルとは

全てのエラーイベントをアラートすると、アラート疲れしてしまう。そのため、エラーイベントのステータスに応じて、アラートするかを確認するか、を決めておく必要がある。また、レベルに応じてアラート先のチャンネルを区別すると良い。

| 重要度レベルの例 | アラートするか否かの判断例 |
| ---------------- | ---------------------------- |
| critical         | する                         |
| warning          | しない                       |
| infomation       | しない                       |

#### ▼ エラーイベントがログステータスの場合

アラートするログステータスの目安は以下の通りである。

参考：https://engineering.otobank.co.jp/entry/2016/09/20/181756

| ログステータス | 説明                                             | 重要度レベルの例      |
| -------------- | ------------------------------------------------ | --------------------- |
| emergency      | システムが使用できない状態にある緊急事態         | critical              |
| alert          | 早急に対応すべき事態                             | critical              |
| critical       | 対処すべき重要な問題                             | critical              |
| fatal          | 対処すべき重要な問題                             | critical              |
| error          | 何かが失敗している                               | criticalまたはwarning |
| warn           | 普通ではないことが発生したが、心配する必要はない | criticalまたはwarning |
| notice         | いたって普通だが、注意すべきことが起こっている   | infomation            |
| info           | 知っておくといいかもしれない情報                 | infomation            |
| debug          | 問題が起こっている場所を知るのに有効な情報       | infomation            |

#### ▼ エラーイベントがステータスコードの場合

アラートするステータスコードとログステータスへの変換の目安は以下の通りである。各ステータスコードをバラバラに扱うことは大変なので、系ごとにまとめて扱えるように、レベルを割り当てる。

| ステータスコード | 本番環境のアラートの目安 | 重要度レベルの例 |
| ---------------- | ------------------------ | ---------------- |
| ```500```系      | する                     | critical         |
| ```400```系      | どちらでも               | warning          |
| ```300```系      | しない                   | infomation       |
| ```200```系      | しない                   | infomation       |

<br>

## 02. インシデント管理

### インシデントとは

サービスの停止を起こし得る想定外のイベントのこと。

参考：

- https://www.atlassian.com/ja/incident-management/devops/incident-vs-problem-management
- https://response.pagerduty.com/before/what_is_an_incident/

<br>

### インシデント管理

![incident_management](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/incident_management.png)

一次オンコール担当は、エラーを解決するためのタスクを作成し、完了させる。エラーがインシデントの場合、担当者はこれを迅速に解決する必要がある。また、二次担当者に通知をエスカレーションさせる。これらを自動化するためのツールがいくつかある。

参考：https://smart-stage.jp/topics/itsm_keyword_relate/p3/

**＊技術ツール例＊**

PagerDuty、Splunk On-call、など

<br>

### インシデントの重要度（severity）レベル

全てのインシデントを同じ優先度で対応すると、重要度の高いインシデントの解決が遅れてしまう。そのため、インシデントの優先度付けが必要がある。

参考：https://response.pagerduty.com/oncall/alerting_principles/

| エラーイベントの重要度レベル | 優先度                                 |
| ---------------------------- | -------------------------------------- |
| high                         | 即時に解決する必要がある。             |
| medium                       | ```24```時間以内に解決する必要がある。 |
| low                          | いつかは解決する必要がある。           |
| notification                 | 解決する必要はない。                   |

<br>

### インシデントの解決フェーズ

#### ▼ 解決フェーズとは

インシデントとして見なされたアラートが、どの程度解決できたのかを可視化する必要がある。

#### ▼ 解決フェーズの種類

参考：

- https://thinkit.co.jp/article/13420

- https://support.pagerduty.com/docs/incidents#incident-statuses

| 解決フェーズ | 説明                                                         |
| ------------ | ------------------------------------------------------------ |
| Triggerd     | アラートがインシデントとして見なされ、タスクが作成された。再現性の低い瞬間的なインシデントであれば、Acknowledgedフェーズを経ずに、そのままResolvedにしてもよい。 |
| Acknowledged | インシデントのタスクに対応中であるが、まだ解決できていない。一定期間、Resolvedフェーズに移行しない場合は、再びTriggerdフェーズに戻る。 |
| Resoleved    | インシデントのタスクを解決した                               |

![pagerduty_incident_phase](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/pagerduty_incident_phase.png)

<br>

### 一次オンコール担当者の作業

#### ▼ CloudWatchアラームの場合

ここでは、Slackに通知されたアラートをオンコール担当者が作業する手順を示す。

（１）Slackに通知されたアラートを確認する。

（２）アラーム名（例：prd-foo-ecs-container-laravel-log-alarm）から、CloudWatchアラームを探す。

（３）アラームがどのロググループに紐づいているかを探す。執筆時点（2021/12/09）では、AWSの仕様ではこれがわかりにくくなっている。メトリクスフィルターが設定されているロググループは、アラームに紐づいている可能性があり、メトリクスフィルターで作成されているメトリクス名（例：ErrorCount）がアラームに記載されたものであれば、紐づいているとわかる。

（４）Log Insightsを使用して、ロググループの直近のエラーログを抽出する。

```sql
# 小文字と大文字を区別せずに、Errorを含むログを検索する。
fields @timestamp, @message, @logStream
| filter @message like /(?i)(Error)/
| sort @timestamp desc
| limit 100
```

（５）クエリの結果から、アラートの原因になっているエラーを見つける。CloudWatchのタイムスタンプとSlackのアラートの通知時刻には若干のタイムラグがある。

（６）クエリの結果をコピーし、アラートのThreadに貼り付ける。

```log
 [2021-12-01 00:00:00] request.ERROR: Uncaught PHP Exception ***** 
```

（７）ログイベントが許容できるものあれば、保留として、その旨を連絡する。

（８）ログイベントがインシデントであれば、その旨を連絡する。また、タスク化し、迅速に対応する。

（９）ログイベントがインシデントでないエラーイベントであれば、その旨を連絡する。タスク化し、時間のある時に対応する。

<br>

## 03. インシデント管理の組織化

### インシデントコマンドシステムに基づく役割分離

#### ▼ インシデントコマンドシステムとは

インシデントの発生時に、組織が混乱せずに問題に対処できるようにするためのマネージメント手法のこと。

参考：https://fastalert.jp/column/disaster-prevention/incident-command-system

#### ▼ 指揮

インシデントの状況把握を担当する。また、インシデント担当チームを組織し、各担当者にタスクを割り振る。

#### ▼ 実行

インシデントの解決を担当する。

#### ▼ 計画

ステークホルダーへの状況報告やドキュメントの作成を担当する。

#### ▼ 後方支援

作業者のサポートを担当する。作業者間引継ぎの調整、夕食の発注、などがある。

<br>

## 04. アラート、インシデントの通知抑制

### アラートの通知抑制

#### ▼ アラートの抑制とは

通知不要なアラートや、実際には重要度の高くないアラートの通知が頻発する場合、アラート疲れしてしまう。そういった場合は、アラートの通知を抑制する。

#### ▼ エラーイベントの重要度レベルの調節

アラートの重要度レベルを調節し、通知するべきアラートを選別する。

#### ▼ アラートの一時無効化

特定の期間に発生したアラートを無視するようにし、アラートが一定期間だけ通知されないようにする。

#### ▼ アラートのグループ化

いくつかのアラートをグループ化するようにし、アラートの通知数を減らす。

参考：https://knowledge.sakura.ad.jp/11635/

#### ▼ アラートの条件の調節

アラートの条件となる期間を拡大し、またはエラーイベントの閾値を緩和するようにし、アラートの通知数を減らす。

<br>

### インシデントの通知抑制

#### ▼ インシデントの抑制とは

全てのインシデントを同じ優先度で対応すると、重要度の高いインシデントの解決が遅れてしまう。そういった場合は、インシデントの通知を抑制する

参考：https://pagerduty.digitalstacks.net/blog/suppress-your-data/

#### ▼ エラーイベントの重要度レベルの調節

インシデントの重要度レベルを調節し、インシデントの優先度付けする。

参考：https://thinkit.co.jp/article/13558

#### ▼ インシデントの一時無効化

特定の期間に発生したインシデントを無視するようにし、インシデントが一定期間だけ通知されないようにする。

参考：https://thinkit.co.jp/article/13558

#### ▼ インシデントのグループ化

いくつかのインシデントをグループ化するようにし、インシデントの通知数を減らす。

参考：https://knowledge.sakura.ad.jp/11635/

<br>

## 05. インシデント管理の事後評価

### MTxxメトリクス

#### ▼ MTxxメトリクスとは

参考：

- https://www.logicmonitor.jp/blog/whats-the-difference-between-mttr-mttd-mttf-and-mtbf
- https://www.researchgate.net/figure/A-schematic-diagram-of-MTTF-MTTR-and-MTBF_fig5_334205633

![mtxx](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/mtxx.png)

| メトリクス名                    |                                                              | 補足                                                         |
| ------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| MTTF：Mean Time To Failure      | 稼働開始地点から故障開始地点の平均稼働時間のこと。どのくらいの間、正常稼働していたのかがわかる。 | 参考：https://e-words.jp/w/MTTF.html                         |
| MTBF：Mean Time Between Failure | 特定の障害と次の障害の故障開始地点間の平均稼働時間のこと。正常稼働と異常稼働を合わせた全体の稼働時間がわかる。 | 参考：https://www.seplus.jp/dokushuzemi/fe/fenavi/easy_calc/availability/ |
| MTTD：Mean Time To Diagnose     | 障害の故障開始地点から修復開始地点間の平均障害時間のこと。異常を検出するまでにどのくらいの時間がかかったのかがわかる。 |                                                              |
| MTTR：Mean Time To Repair       | 障害の復旧開始地点終了と終了地点間の平均障害時間のこと。どのくらいの間、異常稼働していたのかがわかる。可用性テスト時の目標値のRTOとは異なることに注意する。 | 参考：https://www.seplus.jp/dokushuzemi/fe/fenavi/easy_calc/availability/ |

#### ▼ 稼働率

システムの実際の稼働時間割合を表す。以下の計算式で算出できる。

参考：https://www.seplus.jp/dokushuzemi/fe/fenavi/easy_calc/availability/

```mathematica
(稼働率)
= (動作した時間) ÷ (全体の時間)
```

この数式は、以下ように書き換えられる。

```mathematica
(稼働率)
= (MTBF) ÷ (MTBF ＋ MTTR)
```

システムが冗長化されている場合、全てのインスタンスの非稼働率をかけて、全体から引くことで、稼働率を算出できる。

```mathematica
(稼働率)
= 1 - (1 - 稼働率) × (1 - 稼働率)
```

**＊例＊**

システムが冗長化されている例を示す。すでに稼働率は算出されているものとする。全てのインスタンスの非稼働率をかけて、全体から引く。

```mathematica
1 - (1-0.81) × (1-0.64) = 0.9316
```

![稼働率の計算](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/稼働率の計算.jpg)

#### ▼ MTxxメトリクスのインシデント管理への適用

![mttx-metrics](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/mttx-metrics.png)

| メトリクス名 | 説明                                                         |      |
| ------------ | ------------------------------------------------------------ | ---- |
| MTTD         | インシデントが起こってから、これがオンコール担当にアラートされるまで。 |      |
| MTTE         | インシデントがオンコール担当にアラートされ、オンコール担当本人/アサインされたエンジニアがタスクとして着手するまで。 |      |
| MTTF         | オンコール担当がタスクに着手してから、これを完了するまで。   |      |

参考：

- https://www.amazon.co.jp/dp/4873119618
- https://medium.com/@yoannutc/setting-objectives-for-incident-response-634fff2d8262

#### ▼ ダッシュボード

MTxxメトリクスをダッシュボード化する。実際に時間と目標時間を比較すれば、今回のインシデント管理の良し悪しを判断できるため、インシデント管理自体をソフトウェア開発と同様に反復的に改善しやすくになる。DRI Hops（インシデントの直接的に責任者）の値を使用して人的コストを可視化することにより、エンジニアリングマネージャがインシデント管理を扱いやすくなる。

参考：https://www.amazon.co.jp/dp/4873119618

![mttx-metrics_dash-board](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/mttx-metrics_dash-board.png)

<br>

### ポストモーテム

#### ▼ ポストモーテムとは

アラートで通知されたインシデントがビジネスに大きな影響を与えた場合、振り返りとして、ポストモーテムを作成する。ポストモーテムは、障害報告書とは異なり、原因特定とシステム改善に重きを置いた報告書である。障害報告書は、責任の報告の意味合いが強くなってしまう。

#### ▼ 独自テンプレート

```markdown
# ポストモーテム

## タイトル

## 日付

## 担当者

**※担当者を絶対に責めず、障害は誰のせいでもないという意識を強く持つ。**

## 原因と対応

**※原因特定とシステム改善を最優先にすること**

## システム的/収益的な影響範囲

## 幸運だったこと

## 仕組みの改善策

**※『以後は注意する』ではなく、再発しない仕組み作りになるようにする。**

## 障害発生から対応までのタイムライン

```

#### ▼ PagerDutyのテンプレート

参考：https://response.pagerduty.com/after/post_mortem_template/

```markdown
# ポストモーテム

## 全体の要約

## 何が発生したか

## 原因

## 解決方法

## 影響

- 問題の発生期間
- 影響を受けたユーザー数
- 発生した技術サポートのチケット数
- 未解決のエラーイベント数

## 担当者

- 担当者名
- 担当補佐名

## タイムライン

- 原因が発生した時刻
- 

## 対応結果

- うまくいったこと
- うまくいかなかったこと

## インシデントのタスク

## メッセージ

- 社内への周知内容
- 社外への周知内容
```



#### ▼ 他社事例

参考：https://response.pagerduty.com/after/effective_post_mortems/#examples

| サービス | リンク                                                       |
| -------- | ------------------------------------------------------------ |
| AWS      | https://aws.amazon.com/jp/message/5467D2/                    |
| Heroku   | https://status.heroku.com/incidents/151                      |
| Twilio   | https://www.twilio.com/blog/2013/07/billing-incident-post-mortem-breakdown-analysis-and-root-cause.html |

<br>

<br>
