# コスト管理

## 01. コスト管理の観点

スペック、時間単価、数量、月額料金

<br>

## 02. Service Quotas

### Service Quotastとは

各種AWSリソースの設定の上限値を上げられる。

参考：https://docs.aws.amazon.com/ja_jp/servicequotas/latest/userguide/intro.html

<br>

### 各種AWSリソースの上限値

参考：https://docs.aws.amazon.com/ja_jp/general/latest/gr/aws-service-information.html

<br>

### 方法

参考：https://docs.aws.amazon.com/ja_jp/servicequotas/latest/userguide/request-quota-increase.html

<br>

## 03. リソース別コスト

### CloudFront

#### ・転送

オリジンに転送する前にキャッシュを用いてレスポンスを返信できるため、オリジンでかかる料金を抑えられる。

<br>

### EBS

#### ・ボリュームサイズ

ボリュームの使用率にかかわらず、構築されたボリュームの合計サイズに基づいて、料金が発生する。そのため、安易に500GiBを選んではいけない。

<br>

### EC2

#### ・料金体系の選択

使い方に応じた料金体系を選べる。レスポンスの返信時に料金が発生する。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/concepts.html#ec2-pricing

| 種類                     | 説明                                                         | 補足                                                   |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------ |
| オンデマンドインスタンス |                                                              | 参考：https://aws.amazon.com/jp/ec2/pricing/on-demand/ |
| Savings Plans            |                                                              |                                                        |
| リザーブドインスタンス   | EC2インスタンスの一定期間分の使用料金を前払いし、その代わりに安く利用できるようになる。 |                                                        |
| スポットインスタンス     |                                                              |                                                        |

#### ・料金発生の条件

インスタンスのライフサイクルの状態に応じて、料金が発生する。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html

| インスタンスの状態 | 料金発生の有無 | 補足                                                       |
| ------------------ | -------------- | ---------------------------------------------------------- |
| pending            | なし           |                                                            |
| running            | あり           |                                                            |
| stopping           | 条件付きでなし | 停止準備中の間は料金が発生し、休止準備中の間は発生しない。 |
| stopped            | なし           |                                                            |
| shutting-down      | なし           |                                                            |
| terminated         | なし           |                                                            |

<br>

### ECS

#### ・ECRの容量

500MBを超えると、請求が発生するため、古いイメージを定期的に削除する必要がある。

<br>

### Lambda

#### ・実行時間の従量課金制

関数を実行している時間分だけ料金がかかる。関数を使用せずに設置しているだけであれば、料金はかからない。

<br>

### RDS

#### ・料金体系

以下のリンク先を参考にせよ。

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/User_DBInstanceBilling.html

| 種類                     | 説明                                                         |
| :----------------------- | ------------------------------------------------------------ |
| オンデマンドインスタンス | 参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/USER_OnDemandDBInstances.html |
| リザーブドインスタンス   | RDSインスタンスの一定期間分の使用料金を前払いし、その代わりに安く利用できるようになる。<br>参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/USER_WorkingWithReservedDBInstances.html |

<br>

### SES

#### ・送受信数

受信は```1000件/月```まで、送信は```62000/月```まで無料である。

<br>
