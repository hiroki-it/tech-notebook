---
title: 【IT技術の知見】インシデント管理＠監視
description: インシデント管理＠監視の知見を記録しています。
---

# インシデント管理＠監視

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. インシデントとは

エラーイベントの内で、サービスの停止を起こし得る想定外のイベントのこと。

全てのエラーイベントがインシデントというわけではない。

> - https://www.atlassian.com/ja/incident-management/devops/incident-vs-problem-management
> - https://response.pagerduty.com/before/what_is_an_incident/

<br>

## 02. インシデント管理とは

![incident_management](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/incident_management.png)

一次オンコール担当は、エラーを解決するためのタスクを作成し、完了させる。

エラーがインシデントの場合、担当者はこれを迅速に解決する必要がある。

その後、二次担当者にオンコールをエスカレーションする。

これらを自動化するためのツールがいくつかある。

> - https://smart-stage.jp/topics/itsm_keyword_relate/p3/

**＊技術ツール例＊**

- PagerDuty
- Grafana OnCall
- AWS Incident Management

<br>

## 03. インシデントの解決

### インシデントの解決フェーズ

#### ▼ 解決フェーズとは

インシデントとして見なされたアラートが、どの程度解決できたのかを可視化する必要がある。

#### ▼ 解決フェーズの種類

| 解決フェーズ | 説明                                                         |
| ------------ | ------------------------------------------------------------ |
| 発火         | アラートがインシデントとして見なされ、タスクが作成された。   |
| 認知         | インシデントのタスクに対応中であるが、まだ解決できていない。 |
| 解決済み     | インシデントのタスクを解決した。                             |

<br>

### インシデント重要度レベル (severityレベル)

#### ▼ インシデント重要度レベルとは

全てのインシデントを同じ優先度で対応すると、重要度の高いインシデントの解決が遅れてしまう。

そのため、インシデントの優先度付けが必要がある。

| エラーイベントの重要度レベル | 優先度                             |
| ---------------------------- | ---------------------------------- |
| high                         | 即時に解決する必要がある。         |
| medium                       | `24`時間以内に解決する必要がある。 |
| low                          | いつかは解決する必要がある。       |
| notification                 | 解決する必要はない。               |

> - https://response.pagerduty.com/oncall/alerting_principles/

<br>

### インシデントの解決フロー

#### ▼ PagerDutyの場合

PagerDutyをインシデント管理ツールとして、PagerDutyに通知されたエラーイベントの内で、特に重要なものをインシデントとして対処する。

また、各ロールの担当者にオンコールを自動的にエスカレーションする。

#### ▼ Grafana OnCallの場合

Grafana OnCallをインシデント管理ツールとして、Grafana OnCallに通知されたエラーイベントの内で、特に重要なものをインシデントとして対処する。

また、各ロールの担当者にオンコールを自動的にエスカレーションする。

#### ▼ Slack (手動、Apps) の場合

Slackをインシデント管理ツールとして、Slackに通知されたエラーイベントの内で、特に重要なものをインシデントとして対処する。

また、各ロールの担当者にオンコールを自動的にエスカレーションする。

ただ、SlackのApps (例：incident.io、echoboomer/incident-botなど) でインシデント管理を自動化しても良い。

注意点として、各ツールはインシデントごとにインシデント対処チャンネルを作るため、対処後にチャンネルの残骸が増えていってしまう。

> - https://note.com/kubopi/n/ne7c60f3c2d94
> - https://qiita.com/kashee337/items/5791a5dfab7a1019a2cb#%E3%82%84%E3%81%A3%E3%81%9F%E3%81%93%E3%81%A8
> - https://incident.io/alternatives/pagerduty

`(1)`

: CloudWactchアラームからSlackのチャンネルに、アラートが通知される。

`(2)`

: 責任者は、Slackに通知されたアラートを確認する。

`(3)`

: アラート名 (例：prd-foo-ecs-container-laravel-log-alarm) から、AWS CloudWatchアラームを探す。

`(4)`

: アラートがどのロググループに紐づいているかを探す。

     執筆時点 (2021/12/09) では、AWSの仕様ではこれがわかりにくくなっている。

     メトリクスフィルターが設定されているロググループは、アラームに紐づいている可能性があり、メトリクスフィルターで作成されているメトリクス名 (例：ErrorCount) がアラームに記載されたものであれば、紐づいているとわかる。

`(5)`

: Log Insightsを使用して、ロググループの直近のエラーログを抽出する。

```sql
-- 小文字と大文字を区別せずに、Errorを含むログを検索する。
fields @timestamp, @message, @logStream
| filter @message like /(?i)(Error)/
| sort @timestamp desc
| limit 100
```

`(6)`

: クエリの結果から、アラートの原因になっているエラーを見つける。

     AWS CloudWatchのタイムスタンプとSlackのアラートの通知時刻には若干のタイムラグがある。

`(7)`

: クエリの結果をコピーし、アラートのThreadに貼り付ける。

```bash
 [2021-12-01 00:00:00] request.ERROR: Uncaught PHP Exception *****
```

`(8)`

: ログイベントが許容できるものあれば、保留として、オンコールをエスカレーションする。

`(9)`

: ログイベントがインシデントであれば、オンコールをエスカレーションする。

     また、タスク化し、迅速に対応する。

`(10)`

: ログイベントがインシデントでないエラーイベントであれば、オンコールをエスカレーションする。

     タスク化し、時間のある時に対応する。

<br>

## 04. インシデント管理の組織化

### インシデントコマンドシステムに基づく役割分離

#### ▼ インシデントコマンドシステムとは

インシデントの発生時に、組織が混乱せずに問題に対処できるようにするためのマネジメント手法のこと。

> - https://fastalert.jp/column/disaster-prevention/incident-command-system

#### ▼ 指揮 (インシデントコマンダー)

インシデントの状況把握を担当する。

また、インシデント担当チームを組織し、各担当者にタスクを割り振る。

> - https://speakerdeck.com/irotoris/wantedly-incident-commander?slide=18

#### ▼ 実行

インシデントの解決を担当する。

#### ▼ 計画

ステークホルダーへの状況報告やドキュメントの作成を担当する。

#### ▼ 後方支援

作業者のサポートを担当する。

作業者間引継ぎの調整、夕食の発注などがある。

<br>

## 05. アラート、インシデントの通知抑制

### アラートの通知抑制

#### ▼ アラートの抑制とは

通知不要なアラートや、実際には重要度の高くないアラートの通知が頻発する場合、アラート疲れしてしまう。

そういった場合は、アラートの通知を抑制する。

#### ▼ エラーイベントの重要度レベルの調節

アラートの重要度レベルを調節し、通知する必要があるアラートを選別する。

#### ▼ アラートの一時無効化

特定の期間に発生したアラートを無視するようにし、アラートが一定期間だけ通知されないようにする。

#### ▼ アラートのグループ化

いくつかのアラートをグループ化するようにし、アラートの通知数を減らす。

> - https://knowledge.sakura.ad.jp/11635/

#### ▼ アラートの条件の調節

アラートの条件となる期間を拡大し、加えてエラーイベントの閾値を緩和するようにし、アラートの通知数を減らす。

<br>

### インシデントの通知抑制

#### ▼ インシデントの抑制とは

全てのインシデントを同じ優先度で対応すると、重要度の高いインシデントの解決が遅れてしまう。

そういった場合は、インシデントの通知を抑制する。

> - https://pagerduty.digitalstacks.net/blog/suppress-your-data/

#### ▼ 特定のシステムを無視

特定のシステムにて、発生したインシデントを全て無視し、インシデントが恒久的に通知されないようにする。

> - https://thinkit.co.jp/article/13558

#### ▼ インシデントの一時無効化

特定のシステムにて、指定した期間に発生したインシデントを無視し、インシデントが一定期間だけ通知されないようにする。

> - https://thinkit.co.jp/article/13558

#### ▼ エラーイベントの重要度レベルの調節

特定のシステムにて、インシデントごとに重要度レベルを調節し、インシデントの優先度付けする。

特定のインシデント以外は通知されないようにする。

> - https://thinkit.co.jp/article/13558

#### ▼ インシデントのグループ化

特定のシステムにて、いくつかのインシデントをグループ化するようにし、インシデントの通知数を減らす。

> - https://knowledge.sakura.ad.jp/11635/

<br>

## 06. インシデント管理の事後評価

### MTxxメトリクス

#### ▼ MTxxメトリクスとは

![mtxx](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/mtxx.png)

| メトリクス名                    |                                                                                                                                                                             | 補足                                                                  |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| MTTF：Mean Time To Failure      | 稼働開始地点から障害開始地点までの平均稼働時間のこと。どのくらいの間、正常稼働していたのかがわかる。                                                                        | ・https://e-words.jp/w/MTTF.html                                      |
| MTBF：Mean Time Between Failure | 特定の障害と次の障害の障害開始地点までの平均稼働時間のこと。正常稼働と異常稼働を合わせた全体の稼働時間がわかる。                                                            | ・https://www.seplus.jp/dokushuzemi/fe/fenavi/easy_calc/availability/ |
| MTTD：Mean Time To Diagnose     | 障害の障害開始地点から修復開始地点までの平均障害時間のこと。異常を検出するまでにどのくらいの時間がかかったのかがわかる。                                                    |                                                                       |
| MTTR：Mean Time To Repair       | 障害の回復開始地点終了から終了地点間までの平均障害時間のこと。どのくらいの間、回復せずに異常稼働していたのかがわかる。可用性テスト時の目標値のRTOとは異なることに注意する。 | ・https://www.seplus.jp/dokushuzemi/fe/fenavi/easy_calc/availability/ |

> - https://www.logicmonitor.jp/blog/whats-the-difference-between-mttr-mttd-mttf-and-mtbf
> - https://www.researchgate.net/figure/A-schematic-diagram-of-MTTF-MTTR-and-MTBF_fig5_334205633

#### ▼ 稼働率

システムの実際の稼働時間割合を表す。

以下の計算式で算出できる。

```mathematica
(稼働率)
= (動作した時間) ÷ (全体の時間)
```

この数式は、以下ように書き換えられる。

```mathematica
(稼働率)
= (MTBF) ÷ (MTBF + MTTR)
```

システムが冗長化されている場合、全てのインスタンスの非稼働率をかけて、全体から引くことにより、稼働率を算出できる。

```mathematica
(稼働率)
= 1 - (1 - 稼働率) × (1 - 稼働率)
```

> - https://www.seplus.jp/dokushuzemi/fe/fenavi/easy_calc/availability/

**＊例＊**

システムが冗長化されている例を示す。

すでに稼働率は算出されているものとする。

全てのインスタンスの非稼働率をかけて、全体から引く。

```mathematica
1 - (1-0.81) × (1-0.64) = 0.9316
```

![稼働率の計算](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/稼働率の計算.jpg)

#### ▼ MTxxメトリクスのインシデント管理への適用

![mttx-metrics](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/mttx-metrics.png)

| メトリクス名 | 説明                                                                                                                |     |
| ------------ | ------------------------------------------------------------------------------------------------------------------- | --- |
| MTTD         | インシデントが起こってから、これがオンコール担当にアラートされるまで。                                              |     |
| MTTE         | インシデントがオンコール担当にアラートされ、オンコール担当本人/アサインされたエンジニアがタスクとして着手するまで。 |     |
| MTTF         | オンコール担当がタスクに着手してから、これを完了するまで。                                                          |     |

> - https://www.amazon.co.jp/dp/4873119618
> - https://medium.com/@yoannutc/setting-objectives-for-incident-response-634fff2d8262

#### ▼ ダッシュボード

MTxxメトリクスをダッシュボード化する。

実際に時間と目標時間を比較すれば、今回のインシデント管理の良し悪しを判断できる。

そのため、インシデント管理自体をソフトウェア開発と同様に反復的に改善しやすくになる。

DRI Hops (インシデントの直接的に責任者) の値を使用して人的コストを可視化することにより、エンジニアリングマネージャがインシデント管理を扱いやすくなる。

![mttx-metrics_dash-board](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/mttx-metrics_dash-board.png)

> - https://www.amazon.co.jp/dp/4873119618

<br>

### ポストモーテム

#### ▼ ポストモーテムとは

アラートで通知されたインシデントがビジネスに大きな影響を与えた場合、振り返りとして、ポストモーテムを作成する。

ポストモーテムは、障害報告書とは異なり、原因特定とシステム改善に重きを置いた報告書である。

障害報告書は、責任の報告の意味合いが強くなってしまう。

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

**※『以後は注意する』ではなく、再発しない仕組み作りになるようにする。 **

## 障害発生から対応までのタイムライン
```

#### ▼ PagerDutyの事例

PagerDuty社が公開しているテンプレートがある。

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
- ...

## 対応結果

- うまくいったこと
- うまくいかなかったこと

## インシデントのタスク

## メッセージ

- 社内への周知内容
- 社外への周知内容
```

> - https://response.pagerduty.com/after/post_mortem_template/

#### ▼ その他の会社事例

| サービス | リンク                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------- |
| AWS      | https://aws.amazon.com/jp/message/5467D2/                                                               |
| Heroku   | https://status.heroku.com/incidents/151                                                                 |
| Twilio   | https://www.twilio.com/blog/2013/07/billing-incident-post-mortem-breakdown-analysis-and-root-cause.html |

> - https://response.pagerduty.com/after/effective_post_mortems/#examples

<br>
