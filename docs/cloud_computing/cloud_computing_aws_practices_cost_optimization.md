---
title: 【IT技術の知見】金銭的コスト最適化＠AWS
description: 金銭的コスト最適化＠AWSの知見を記録しています。
---

# 金銭的コスト最適化＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 金銭的コスト最適化戦略

### インプット情報

料金を見積もる時、以下をインプットとして使用する。

- 顧客の年間の予算額
- SLO (サーバー稼働率、レスポンス速度、秒当たり平均トランザクション数、バックアップ保管期間など)
- 現在の運用料金
- アプリエンジニアの開発生産性
- Webアプリのリソース要求の特徴 (恒常的な要求、瞬間的な要求)
- ビジネスドメインの性質による夜間や土日のトラフィックの増減 (例えば、Chatworkのようなビジネスチャットツールでは、夜間や土日のトラフィックが減る)

> - https://speakerdeck.com/taishin/jaws-ug-sre-coverage?slide=8

<br>

### 金銭的コスト最適化の項目

金銭的コストで最適化できる項目は以下を対象とする。

- スペック
- 時間単価
- 数量
- 月額料金

<br>

### 改善活動

コスト最適化に関する週次ミーティングを設け、コスト可視化ツール (例：Cost Explore、Evidence) のレポートを使用して、現在のコストを確認する。

この時に必要以上にコストになっているAWSリソースを見つければ、次週のミーティングまでに改善する。

<br>

### 効果の大きいAWSリソース

以下のAWSリソースは使用料金が高く、削減効果が大きい。

- AWS EC2、AWS EC2ベースのAWSリソース (例：AWS Fargate)
- AWS RDS、AWS RDSベースのAWSリソース (例：AWS Aurora)
- AWS ALB

<br>

## 02. Service Quotas

### Service Quotastとは

各種AWSリソースの設定の上限値を上げられる。

> - https://docs.aws.amazon.com/servicequotas/latest/userguide/intro.html

<br>

### 各種AWSリソースの上限値

> - https://docs.aws.amazon.com/general/latest/gr/aws-service-information.html

<br>

### 方法

> - https://docs.aws.amazon.com/servicequotas/latest/userguide/request-quota-increase.html

<br>

## 03. リソース別の金銭的コスト

### CloudFront

#### ▼ 転送

オリジンに転送する前にキャッシュを使用してレスポンスを返信できる。

そのため、オリジンでかかる料金を抑えられる。

<br>

### AWS EBS

#### ▼ 料金体系

AWS EBSボリュームは、ボリュームの使用率に関わらず、最大サイズに基づいて料金が発生する。

また、複数のAWS EBSボリュームをAWS EC2に紐付けている場合は、その合計サイズで料金が発生する。

そのため、必要最低限のサイズを選択するように、過剰なサイズを選択してはいけない。

その他、ボリュームタイプによっては、IOPSやスループットの設定値が課金対象になっている。

汎用SSD (gp2タイプ) であれば、AWS EBSボリュームの最大サイズのみを考慮すれば良い。

また、注意点として、リージョンごとに料金体系が異なる。

> - https://aws.amazon.com/jp/premiumsupport/knowledge-center/ebs-volume-charges/
> - https://aws.amazon.com/jp/ebs/pricing/

<br>

### AWS EC2

#### ▼ 料金体系

使い方に応じた料金体系を選択できる。

レスポンスの返信時に料金が発生する。

| 使い方名                 | 説明                                                                                                                                                                                            | 補足                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| オンデマンドインスタンス | AWS EC2の使用期間に応じて使用料金を支払う。                                                                                                                                                     | ・https://aws.amazon.com/jp/ec2/pricing/on-demand/                                 |
| Savings Plans            |                                                                                                                                                                                                 |                                                                                    |
| リザーブドインスタンス   | AWS EC2の一定期間分の使用料金を前払いし、その代わりに安く利用できるようになる。                                                                                                                 |                                                                                    |
| スポットインスタンス     | 休止しているAWS EC2を使用する。格安で使用できる。ただし、スポットインスタンスの絶対数が減少したり、スポットインスタンスの希望ユーザーが増えた場合に、利用を強制的に中断されてしまうことがある。 | ・https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/how-spot-instances-work.html |

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html#ec2-pricing
> - https://tech.nri-net.com/entry/2021/04/21/094600

#### ▼ 実行時間

インスタンスのライフサイクルのフェーズに応じて、料金が発生する。

AWS EC2を実行している時間分だけ料金がかかる。

インスタンスを使用せずに配置しているのみであれば、料金はかからない。

| フェーズ名    | 料金発生の有無 | 補足                                                       |
| ------------- | -------------- | ---------------------------------------------------------- |
| pending       | なし           |                                                            |
| running       | あり           |                                                            |
| stopping      | 条件付きでなし | 停止準備中の間は料金が発生し、休止準備中の間は発生しない。 |
| stopped       | なし           |                                                            |
| shutting-down | なし           |                                                            |
| terminated    | なし           |                                                            |

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html

<br>

### AWS ECR

#### ▼ 合計サイズ

AWS ECRに保管されたイメージの合計サイズが`500MB`を超えると、請求が発生するため、古いイメージを定期的に削除する必要がある。

<br>

### Fargate

#### ▼ リソースサイズ

Fargateでは、FargateワーカーNode内でPodが使用したリソースサイズによって、料金が決まる。

そのため、冗長化するPod数を減らすことにより、料金を抑えられる。

> - https://aws.amazon.com/jp/fargate/pricing/

**＊例＊**

バージニア北部のFargateワーカーNode内で、Podが`10`個を毎日`1`時間稼働させ、Podが`0.25`vCPUと`1`GiBメモリを使用したとする。

この場合、１ヶ月の請求額は以下のようになる。

```
CPU の月額料金
合計 vCPU 料金 = (ポッド数) × (vCPU 数) × (CPU 秒当たりの料金) × (秒単位の 1 日当たりの CPU 使用時間) × (日数)
合計 vCPU 料金 = 10 × 0.25 × 0.000011244 × 3600 × 30 = 3.04 USD

メモリの月額料金
合計メモリ料金 = (ポッド数) × (メモリGB) × (1 GB 当たりの料金) × (秒単位の 1 日当たりのメモリ使用時間) × (日数)
合計メモリ料金 = 10 × 1 × 0.000001235 × 3600 × 30 = 1.33 USD

Fargate のコンピューティングの月額料金
Fargate のコンピューティングの月額料金 = (CPU 月額料金) + (メモリの月額料金)
Fargate のコンピューティングの月額料金 = 3.04 USD + 1.33 USD = 4.37 USD
```

<br>

### AWS Lambda

#### ▼ 実行時間

関数を実行している時間分だけ料金がかかる。

関数を使用せずに配置しているのみであれば、料金はかからない。

<br>

### RDS

#### ▼ 料金体系の種類

| 使い方名                 | 説明                                                                                                                                                                                         |
| :----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| オンデマンドインスタンス | ・https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_OnDemandDBInstances.html                                                                                                       |
| リザーブドインスタンス   | RDSインスタンスの一定期間分の使用料金を前払いし、その代わりに安く利用できるようになる。<br>・https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithReservedDBInstances.html |

> - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/User_DBInstanceBilling.html

<br>

### SES

#### ▼ 送受信数

送受信数分だけ料金がかかる。

受信は`1000件/月`まで、送信は`62000/月`まで無料である。

<br>
