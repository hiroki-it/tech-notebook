---
title: 【IT技術の知見】タスク管理＠プロジェクト管理
description: タスク管理＠プロジェクト管理の知見を記録しています。
---

# タスク管理＠プロジェクト管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. タスク管理の方法

### 手順

1. タスクを洗い出す
2. タスクに優先順位をつける
3. タスクを依頼する
4. 全体を振り返る

<br>

### カンバンボード

積み課題、タスク、エピック、のボードを作成すると良い。

| カンバンボード名 | 積み課題                                                                                       | タスク                                                              | エピック                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 役割             | 機能窓口や監視アラート由来の新しい課題を置く。対応が決まった場合はタスクかエピックに移動する。 | 1ヶ月以内で完了する課題を置く。                                     | 3-6ヶ月以内で完了する課題を置く。                                    |
| ラベル           | <プロダクト名>、"積み"                                                                         | <プロダクト名>、"タスク"                                            | <プロダクト名>、"エピック"                                           |
| 入力項目         | 担当者、期日、説明（課題背景、対応方針、GitHubリンク、補足情報など)                            | 担当者、期日、説明（課題背景、対応方針、GitHubリンク、補足情報など) | 担当者、期日、説明 （課題背景、対応方針、GitHubリンク、補足情報など) |

<br>
amazon-ebs: TASK [ssm-agent : install SSM Agent] *******************************************

### 週次ミーティング

週次ミーティングでタスクの状態を定期的に管理する。

- タスクの進捗を確認 (特に優先度 高)
  - タスクボード：<ボードのURL>
- 新しい課題を積み課題ボードに追加
  - 積み課題ボード：<ボードのURL>
  - 『積みラベル』をつけてボードに追加する
- 積み課題のタスク化と担当者アサイン (特に優先度 高)
  - 積み課題ボード：<ボードのURL>
  - 積み課題に 『担当者』『タスクラベル』を設定する → タスクボードに自動振り分け
- 監視チャンネルを巡回し、必要に応じて積み課題ボードに追加
  - devチャンネル：<監視チャンネルのURL>
  - prdチャンネル：<監視チャンネルのURL>
- その他共有事項あれば
-

<br>

## 02. タスクを洗い出す

### タスクの洗い出しとは

issueやEpic issueを1つのタスクとみなし、大きく洗い出す。

この段階では、タスクは大きくて問題ない。

以下のような表を作成すると良い。

| タスク   | 優先度   | 見積もり |
| -------- | -------- | -------- |
| 〇〇する | 高/中/低 | `n`      |

<br>

## 03. タスクに優先順位をつける

### タスクの優先度づけとは

機能として欲しい期待度のこと。

ガントチャートとタスク表を組み合わせると、スケジュールを管理しやすい。

![gantt-chart_table](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/gantt-chart_table.png)

<br>

クリティカルパスでタスク間の関係を可視化すると、優先順位を見つけやすくなる

![critical-path](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/critical-path.png)

> - https://www.amazon.co.jp/dp/4798177415

<br>

### 優先度の種類

高、中、低の3段階でを決める。

ビジネス側と議論しながら決めると良い。

- 高：必ず実装する必要がある。
- 中：できる限り実装したい。ただし、後回しにできる。
- 低：なくてもよい。一番最後に後回しできる。

<br>

## 04. タスクを依頼する

### タスクの依頼とは

タスクをメンバーに依頼し、タスク全体を細分化してもらう (メンバーのスキル次第では一緒にやる) 。

工数を定量化しやくする。

見積コストが大きい場合 (目安は`13`以上) はEpicとしてタスクを分割すると良い。

実装以外のタスク (調査、設計、ドキュメンテーションなど) もタスクとする。

ユニットテストは、タスクの見積りに含めるようにする。

<br>

## 05. 全体を振り返る

KPTなどで、プロジェクトを振り返る。

<br>
