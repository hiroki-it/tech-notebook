---
title: 【IT技術の知見】Kinesis＠AWSリソース
description: Kinesis＠AWSリソースの知見を記録しています。
---

# Kinesis＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Kinesis Data Streams

### Kinesis Data Streams とは

リアルタイム処理のストリーミングデータ (例：動画データ、音声データなど) を継続的に収集し、保管する。

> - https://docs.aws.amazon.com/streams/latest/dev/amazon-kinesis-streams.html

<br>

## 02. Kinesis Data Firehose (Kinesis Delivery Stream)

### Kinesis Data Firehose とは

リアルタイム処理のストリーミングデータ (例：動画データ、音声データなど) を継続的に収集し、保管/可視化/分析/レポート作成/アラートができる外部サービスや AWS リソースにフォワーディングする。

フォワーディング時に AWS Lambda 関数を使用することにより、収集したデータを加工できる。

より非マネージにストリーミングしたい場合は、ストリーミングツール (例：Apache Kafka) を使用する。

Kinesis を使用せずに、リアルタイム処理のストリーミングデータを直接送信してもよい。ただ、通信頻度が瞬間的に増加することなく、定常的に送信できる。

> - https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html
> - https://techtarget.itmedia.co.jp/tt/news/2103/27/news02.html
> - https://www.engineer-memo.net/20200310-5498

<br>

## 02-02. セットアップ

### コンソール画面の場合

#### ▼ 設定項目と説明

| 項目               | 説明                                                                                                                                                                                                                 | 補足                                                                                                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DNS レコードの変換 | バッファーに蓄えられたログを、指定された形式でフォワーディングする前に、テキストの内容を変換する。                                                                                                                   | AWS Lambda を使用する。<br>- https://docs.aws.amazon.com/firehose/latest/dev/data-transformation.html                                                                                                           |
| フォワーディング先 | フォワーディング先とする S3 バケットを設定する。                                                                                                                                                                     |                                                                                                                                                                                                                 |
| ディレクトリ名     | S3 へのフォワーディング時に、S3 に作成するディレクトリの名前を設定できる。デフォルトで `YYYY/MM/dd/HH` 形式でディレクトリが作成され、執筆時点 (2021/11/09) では、UTC のみ設定できる。                                | もし JST にしたい場合は AWS Lambda に変換処理を実装し、Kinesis Data Firehose と連携する必要がある。<br>- https://qiita.com/qiita-kurara/items/b697b65772cb0905c0f2#comment-ac3a2eb2f6d30a917549                 |
| バッファー         | Kinesis Data Firehose では、受信したログをいったんバッファーに蓄え、一定期間あるいは一定サイズが蓄えられた時点で、ログファイルとしてフォワーディングする。このとき、バッファーに蓄える期間や上限サイズを設定できる。 | ・https://docs.aws.amazon.com/firehose/latest/dev/basic-deliver.html#frequency                                                                                                                                  |
| ファイル形式       | フォワーディング時のファイル形式を設定できる。                                                                                                                                                                       | ログファイルの最終到達地点が S3 の場合は圧縮形式で問題ないが、S3 から加えて他のツール (例：Datadog) にフォワーディングする場合はデータ形式を設定しないほうがよい。                                              |
| バックアップ       | 収集したデータを加工する場合、加工前データを保管しておく。                                                                                                                                                           |                                                                                                                                                                                                                 |
| 暗号化             |                                                                                                                                                                                                                      |                                                                                                                                                                                                                 |
| エラーログの収集   | データのフォワーディング時にエラーが発生した場合、エラーログを Amazon CloudWatch Logs に送信する。                                                                                                                   |                                                                                                                                                                                                                 |
| IAM ロール         | Kinesis Data Firehose が AWS リソースにデータをフォワーディングできるように、認可スコープを設定する。                                                                                                                | Kinesis では IAM ロールの細やかな設定が正しく動作しないことがあり、最小認可スコープを諦め、FullAccess 権限のロールを付与してしまうほうがよい。最低限、Amazon CloudWatch Logs と S3 の認可スコープが必要である。 |
| メトリクス         | 受信サイズ、リモート書き込みサイズなどを収集する。                                                                                                                                                                   |                                                                                                                                                                                                                 |

<br>

## 03. Kinesis Data Analytics

### Kinesis Data Analytics とは

リアルタイム処理のストリーミングデータ (例：動画データ、音声データなど) を継続的に収集し、分析する。

> - https://docs.aws.amazon.com/kinesisanalytics/latest/dev/what-is.html

<br>
