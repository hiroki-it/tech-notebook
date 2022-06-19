---
title: 【知見を記録するサイト】コスト管理＠AWS
description: コスト管理＠AWSの知見をまとめました。
---

# コスト管理＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. コスト管理の観点

スペック、時間単価、数量、月額料金

<br>

## 02. Service Quotas

### Service Quotastとは

各種AWSリソースの設定の上限値を上げられる。

参考：https://docs.aws.amazon.com/servicequotas/latest/userguide/intro.html

<br>

### 各種AWSリソースの上限値

参考：https://docs.aws.amazon.com/general/latest/gr/aws-service-information.html

<br>

### 方法

参考：https://docs.aws.amazon.com/servicequotas/latest/userguide/request-quota-increase.html

<br>

## 03. リソース別コスト

### CloudFront

#### ▼ 転送

オリジンに転送する前にキャッシュを使用してレスポンスを返信できるため、オリジンでかかる料金を抑えられる。

<br>

### EBS

#### ▼ 合計のボリュームサイズ

ボリュームの使用率に関わらず、構築されたボリュームの合計サイズを基に、料金が発生する。そのため、安易に```500GiB```を選択してはいけない。

<br>

### EC2

#### ▼ 料金体系の種類

使い方に応じた料金体系を選択できる。レスポンスの返信時に料金が発生する。

参考：https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html#ec2-pricing

| 使い方名                     | 説明                                                         | 補足                                                   |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------ |
| オンデマンドインスタンス |                                                              | 参考：https://aws.amazon.com/jp/ec2/pricing/on-demand/ |
| Savings Plans            |                                                              |                                                        |
| リザーブドインスタンス   | EC2インスタンスの一定期間分の使用料金を前払いし、その代わりに安く利用できるようになる。 |                                                        |
| スポットインスタンス     |                                                              |                                                        |

#### ▼ 実行時間

インスタンスのライフサイクルの状態に応じて、料金が発生する。EC2インスタンスを実行している時間分だけ料金がかかる。インスタンスを使用せずに設置しているだけであれば、料金はかからない。

参考：https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html

| インスタンスの状態 | 料金発生の有無 | 補足                                                       |
| ------------------ | -------------- | ---------------------------------------------------------- |
| pending            | なし           |                                                            |
| running            | あり           |                                                            |
| stopping           | 条件付きでなし | 停止準備中の間は料金が発生し、休止準備中の間は発生しない。 |
| stopped            | なし           |                                                            |
| shutting-down      | なし           |                                                            |
| terminated         | なし           |                                                            |

<br>

### ECR

#### ▼ 合計量

ECRに保存されたイメージの合計量が```500MB```を超えると、請求が発生するため、古いイメージを定期的に削除する必要がある。

<br>

### EKS on Fargate

#### ▼ リソースの使用量

EKS on Fargateでは、Fargate Node内でPodが使用したリソース量によって、料金が決定する。そのため、冗長化するPod数を減らすことで、料金を抑えられる。

参考：https://aws.amazon.com/jp/fargate/pricing/

**＊例＊**

バージニア北部のFargate Node内で、Podが```10```個を毎日```1```時間稼働させ、Podが```0.25```vCPUと```1```GBメモリを使用したとする。この場合、１ヶ月の請求額は以下のようになる。

```
CPU の月額料金
合計 vCPU 料金 = (ポッド数) × (vCPU 数) × (CPU 秒あたりの料金) × (秒単位の 1 日あたりの CPU 使用時間) × (日数)
合計 vCPU 料金 = 10 × 0.25 × 0.000011244 × 3600 × 30 = 3.04 USD

メモリの月額料金
合計メモリ料金 = (ポッド数) × (メモリ (GB)) × (1 GB あたりの料金) × (秒単位の 1 日あたりのメモリ使用時間) × (日数)
合計メモリ料金 = 10 × 1 × 0.000001235 × 3600 × 30 = 1.33 USD

Fargate のコンピューティングの月額料金
Fargate のコンピューティングの月額料金 = (CPU 月額料金) + (メモリの月額料金)
Fargate のコンピューティングの月額料金 = 3.04 USD + 1.33 USD = 4.37 USD
```

<br>

### Lambda

#### ▼ 実行時間

関数を実行している時間分だけ料金がかかる。関数を使用せずに設置しているだけであれば、料金はかからない。

<br>

### RDS

#### ▼ 料金体系の種類

以下のリンクを参考にせよ。

参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/User_DBInstanceBilling.html

| 使い方名                     | 説明                                                         |
| :----------------------- | ------------------------------------------------------------ |
| オンデマンドインスタンス | 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_OnDemandDBInstances.html |
| リザーブドインスタンス   | RDSインスタンスの一定期間分の使用料金を前払いし、その代わりに安く利用できるようになる。<br>参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithReservedDBInstances.html |

<br>

### SES

#### ▼ 送受信数

送受信数分だけ料金がかかる。受信は```1000件/月```まで、送信は```62000/月```まで無料である。

<br>
