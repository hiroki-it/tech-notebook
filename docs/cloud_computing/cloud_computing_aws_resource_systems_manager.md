---
title: 【IT技術の知見】AWS Systems Manager (新SSM) ＠AWSリソース
description: AWS Systems Manager (新SSM) ＠AWSリソースの知見を記録しています。
---

# AWS Systems Manager (新SSM) ＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. チェンジカレンダー

他のAWSリソース (例：SMオートメーション、AWS EventBridgeなど) を定期的に実行するCronとして使用する。

定期的に実行するAWSリソースで、他のAWSリソース (EC2、RDS) の起動処理と停止処理を定義すれば、夜間だけ停止させられる。

```
チェンジカレンダー
⬇⬆️︎
オートメーション、AWS EventBridge (カレンダー取得処理、対象リソースの開始停止処理を定義)
⬇⬆️︎
EC2、RDS
```

![sm-change-calender_scheduling](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/sm-change-calender_scheduling.png)

> - https://www.skyarch.net/blog/?p=22277

<br>

## 02. チェンジマネージャー

### チェンジマネージャーとは

AWSリソースの設定変更に承認フローを設ける。

事前にランブックを作成する必要があり、IaCのように柔軟なプロビジョニングを実行するというより、決まりきったプロビジョニング (例：AWS上で稼働する負荷試験ツールの実行からレポート作成まで) を実行するのに向いている。

`(1)`

: ランブックを作成する。AWSがあらかじめ用意してくれているものを使用もできる。

`(2)`

: テンプレートを作成し、リクエストを作成する。

`(3)`

: 承認フローを通過する。これは、スキップするように設定もできる。

`(4)`

: テンプレートを使用して、変更リクエストを作成する。

`(5)`

: 承認フローを通過する。これは、スキップできない。

`(6)`

: 変更リクエストに基づいて、AWSリソースを変更する処理が自動的に実行される。

     これは、即時実行するこもスケジューリングもできる。

<br>

### ランブック (ドキュメント)

AWSリソースを変更するためには『ランブック (ドキュメント) 』を事前に作成する必要がある。

ランブックでは、AWSリソースの変更箇所を定義する。

ランブックには、AWSがあらかじめ用意してくれるものとユーザー定義のものがある。

| タイプ           | 説明                                                                                                                                                                                                    | 補足                                                                                                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Automationタイプ | サーバー/コンテナ外でコマンドを実行する。内部的には、Python製のAWS Lambdaが使用されている (たぶん) 。<br>- https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-automation.html | EC2を起動し、状態がOKになるまで監視する手順を自動化した例： https://docs.aws.amazon.com/systems-manager/latest/userguide/automation-walk-document-builder.html                                                                                |
| Commandタイプ    | サーバー/コンテナ内でコマンドを実行する。内部的には、Run Commandが使用されている。<br>- https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-ssm-docs.html#what-are-document-types       | ・EC2内で実行するlinuxコマンドを自動化した例： https://dev.classmethod.jp/articles/check-os-setting-ssm-doc-al2/ <br>・EC2内で実行するawscliコマンドを自動化した例： https://dev.classmethod.jp/articles/autoscalling-terminating-log-upload/ |
| Sessionタイプ    |                                                                                                                                                                                                         |                                                                                                                                                                                                                                               |

<br>

### テンプレート

作業内容の鋳型こと。

ランブックを指定し、変更箇所に基づいた作業内容を定義する。

デフォルトではテンプレートの作成自体にも承認が必要になる。

ただし、指定した認可スコープを持つユーザーはテンプレートの承認をスキップするように設定できる。

> - https://docs.aws.amazon.com/systems-manager/latest/userguide/change-templates.html

### 変更リクエスト

鋳型に基づいた実際の作業のこと。

作業のたびにテンプレートを指定し、リクエストを提出する。

承認が必要になる。

> - https://docs.aws.amazon.com/systems-manager/latest/userguide/change-requests.html

<br>

## 03. パラメーターストア

### パラメーターストアとは

変数やファイルをキーバリュー型で永続化する。

永続化されている間は暗号化されており、復号した上で、変数やファイルとして対象のAWSリソースに出力する。

Kubernetesのシークレットの概念が取り入れられている。

パラメーターのタイプは全て『SecureString』とした方が良い。

> - https://medium.com/awesome-cloud/aws-difference-between-secrets-manager-and-parameter-store-systems-manager-f02686604eae

<br>

### 変数の暗号化と復号

AWS KMSの暗号化キーを使用すると、パラメーターストアに永続化される変数を暗号化/復号できる。

パラメーターストア上で変数は暗号化されており、EC2 (AWS ECSやAWS EKSのコンテナのホストを含む) で参照する時に復号される。

セキュリティ上の理由で、本来はできないSecretのバージョン管理が、AWS KMSで暗号化することにより、可能になる。

たとえ同じ文字列を暗号化する場合でも、その時のタイムスタンプなどさまざまな要素で暗号化されるため、毎回異なるハッシュ値に暗号化される。

![parameter-store_kms](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/parameter-store_kms.png)

> - https://docs.aws.amazon.com/kms/latest/developerguide/services-parameter-store.html
> - https://note.com/hamaa_affix_tech/n/n02eb412d0327
> - https://tech.libry.jp/entry/2020/09/17/130042

<br>

### 命名規則

SMパラメーター名は、『`/<リソース名>/<変数名>`』とするとわかりやすい。

<br>

## 04. AWS SSM Session Manager

### AWS SSM Session Managerとは

EC2 (AWS ECSやAWS EKSのコンテナのホストを含む) に通信できるようにする。

SSH公開鍵認証とは異なり、Internet Gateway経由ではなく、ssmmessagesエンドポイント経由でインスタンスにリクエストを送信できる。

接続したいインスタンスにsystems-managerエージェントをインストールする必要がある。

> - https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html#session-manager-features
> - https://blog.denet.co.jp/aws-systems-manager-session-manager/

<br>

### AWSセッション

TLS、Sigv4、AWS KMSを使用して暗号化された接続のこと。

> - https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html#what-is-a-session

<br>

### 同時AWSセッションの上限数

同時AWSセッションの上限数は2つまでである。

以下のようなエラーが出た時は、セッション途中のユーザーが他ににいるか、過去のセッションを完了できていない可能性がある。

AWS SSM Session Managerで既存のセッションを完了できる。

```bash
# AWS ECS Execの場合
An error occurred (ClientException) when calling the ExecuteCommand operation: Unable to start new execute sessions because the maximum session limit of 2 has been reached.
```

<br>
