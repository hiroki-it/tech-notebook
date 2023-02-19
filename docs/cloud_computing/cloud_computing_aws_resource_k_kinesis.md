---
title: 【IT技術の知見】Kinesis＠Kで始まるAWSリソース
description: Kinesis＠Kで始まるAWSリソースの知見を記録しています。
---

# Kinesis＠```K```で始まるAWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Kinesis Data Streams

### Kinesis Data Streamsとは

リアルタイムなストリーミングデータ (例：動画データ、音声データ、など) を継続的に収集し、保管する。



> ↪️ 参考：https://docs.aws.amazon.com/streams/latest/dev/amazon-kinesis-streams.html

<br>

## 02. Kinesis Data Firehose (Kinesis Delivery Stream) 

### Kinesis Data Firehoseとは

リアルタイムなストリーミングデータ (例：動画データ、音声データ、など) を継続的に収集し、保管/可視化/分析/レポート作成/アラートができる外部サービスやAWSリソースに転送する。

転送時にLambda関数を使用することにより、収集したデータを加工できる。

より非マネージにストリーミングしたい場合は、Apache Kafkaを使用する。

Kinesisを使用せずに、リアルタイムなストリーミングデータを直接的に送信してもよいが、通信頻度が瞬間的に増加することなく定常的に送信できる。



> ↪️ 参考：
>
> - https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html
> - https://techtarget.itmedia.co.jp/tt/news/2103/27/news02.html
> - https://www.engineer-memo.net/20200310-5498

<br>

### セットアップ

#### ▼ コンソール画面

| 項目       | 説明                                                                                                                                | 補足                                                                                                                                                                       |
|------------|-------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| レコードの変換  | バッファーに蓄えられたログを、指定された形式で転送する前に、テキストの内容を変換する。                                                                             | Lambdaを使用する。<br>↪️ 参考：https://docs.aws.amazon.com/firehose/latest/dev/data-transformation.html                                                                         |
| 転送先     | 転送先とするS3バケットを設定する。                                                                                                             |                                                                                                                                                                            |
| ディレクトリ名   | S3への転送時に、S3に作成するディレクトリの名前を設定できる。デフォルトで```YYYY/MM/dd/HH```形式でディレクトリが作成され、執筆時点 (2021/11/09) では、UTCのみ設定できる。         | もしJSTにしたい場合はLambdaに変換処理を実装し、Kinesis Data Firehoseと連携する必要がある。<br>↪️ 参考：https://qiita.com/qiita-kurara/items/b697b65772cb0905c0f2#comment-ac3a2eb2f6d30a917549 |
| バッファー      | Kinesis Data Firehoseでは、受信したログを一旦バッファーに蓄え、一定期間あるいは一定サイズが蓄えられた時点で、ログファイルとして転送する。この時、バッファーに蓄える期間や上限サイズを設定できる。 | ↪️ 参考：https://docs.aws.amazon.com/firehose/latest/dev/basic-deliver.html#frequency                                                                                       |
| ファイル形式   | 転送時のファイル形式を設定できる。                                                                                                            | ログファイルの最終到達地点がS3の場合は圧縮形式で問題ないが、S3から加えて他のツール (例：Datadog) に転送する場合はデータ形式を設定しない方が良い。                                                                |
| バックアップ     | 収集したデータを加工する場合、加工前データを保管しておく。                                                                                            |                                                                                                                                                                            |
| 暗号化     |                                                                                                                                     |                                                                                                                                                                            |
| エラーログの収集 | データの転送時にエラーが発生した場合、エラーログをCloudWatchログに送信する。                                                                                |                                                                                                                                                                            |
| IAMロール     | Kinesis Data FirehoseがAWSリソースにデータを転送できるように、認可スコープを設定する。                                                                       | KinesisではIAMロールの細やかな設定が正しく動作しないことがあり、最小認可スコープを諦め、FullAccess権限のロールを付与してしまう方がよい。最低限、CloudWatchログとS3の認可スコープが必要である。                                     |

<br>

## 03. Kinesis Data Analytics

### Kinesis Data Analyticsとは

リアルタイムなストリーミングデータ (例：動画データ、音声データ、など) を継続的に収集し、分析する。



> ↪️ 参考：https://docs.aws.amazon.com/kinesisanalytics/latest/dev/what-is.html

<br>
