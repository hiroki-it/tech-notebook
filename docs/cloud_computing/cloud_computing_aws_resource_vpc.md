---
title: 【IT技術の知見】AWS VPC＠AWSリソース
description: AWS VPC＠AWSリソースの知見を記録しています。
---

# AWS VPC＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS VPCとは：Virtual Private Cloud

クラウドプライベートネットワークとして働く。

プライベートIPアドレスが割り当てられた、AWS VPCと呼ばれるプライベートネットワーク (`L3`) を仮想的に作成できる。

異なるAZに渡ってEC2を立ち上げることによって、クラウドサーバーをデュアル化できる。

EKSの場合、AWS VPC (`L3`) 上にAWS VPC CNIを配置することにより、クラスターネットワークを作成できる。

![AWS VPCが提供できるネットワークの範囲](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/VPCが提供できるネットワークの範囲.png)

> - https://pages.awscloud.com/rs/112-TZM-766/images/AWS-08_AWS_Summit_Online_2020_NET01.pdf
> - https://d1.awsstatic.com/webinars/jp/pdf/services/20180515_AWS-BlackBelt_Networking-for-RFP.pdf#page=51

<br>

### AWS VPC内のIPアドレス

#### ▼ IPアドレスの種類

| IPアドレスの種類       | 手動/自動 | グローバル/プライベート | 特徴           | 説明                                                           |
| ---------------------- | --------- | ----------------------- | -------------- | -------------------------------------------------------------- |
| パブリックIPアドレス   | 自動      | グローバル              | 動的IPアドレス | 動的なIPアドレスのため、インスタンスを再作成すると変化する。   |
| プライベートIPアドレス | 手動/自動 | プライベート            | 動的IPアドレス | 動的なIPアドレスのため、インスタンスを再作成すると変化する。   |
| Elastic IP             | 手動      | グローバル              | 静的IPアドレス | 静的なIPアドレスのため、インスタンスを再作成しても保持される。 |

> - https://awsjp.com/AWS/hikaku/Elastic-IP_Public-IP-hikaku.html
> - https://qiita.com/masato930/items/ba242f0171a76ce0994f

#### ▼ DNS名の割り当て

AWS VPC内で作成されたインスタンスにはパブリックIPアドレスが自動的に割り当てられるが、IPアドレスにマッピングされたDNS名を持たない。

`enableDnsHostnames`オプションと`enableDnsSupport`オプションと有効化すると、インスタンスにDNS名が割り当てられるようになる。

> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-support
> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-updating

#### ▼ 紐付け

| 紐付け名      | 補足                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| EC2との紐付け | 非推奨の方法である。<br>- https://docs.aws.amazon.com/vpc/latest/userguide/vpc-eips.html#vpc-eip-overview   |
| ENIとの紐付け | 推奨される方法である。<br>- https://docs.aws.amazon.com/vpc/latest/userguide/vpc-eips.html#vpc-eip-overview |

<br>

## 02. AWS VPCサブネット

### AWS VPCサブネットとは

クラウドプライベートネットワークにおけるセグメントとして働く。

<br>

### サブネットの種類

#### ▼ パブリックサブネットとは

LAN内の非武装地帯に相当する。

#### ▼ プライベートサブネットとは

LAN内の内部ネットワークに相当する。

サブネット外からのインバンド通信を受け付けないようするために、ALBのルーティング先にサブネットを設定しないようにすれば、そのサブネットはプライベートサブネットとして動作する。

ただし、サブネット内からサブネット外へのリクエストは許可しても問題なく、その場合はルートテーブルにAWS NAT Gatewayを設定する必要がある。

![public-subnet_private-subnet](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/public-subnet_private-subnet.png)

<br>

## 03. Network ACL：Network Access Control List

### Network ACLとは

サブネットのクラウドパケットフィルタリング型ファイアウォール (`L2`～`L4`を防御) として働く。

ルートテーブルとサブネットの間に配置され、ルートテーブルよりも先に評価される。

双方向のインバウンドルールとアウトバウンドルールを決める。

![network-acl](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network-acl.png)

<br>

### ACLルール

ルールは上から順に適用される。

例えば、ルールが以下だったとする。

ルール`100`が最初に適用され、サブネットへの全送信元IPアドレス (`0.0.0.0/0`) を許可していることになる。

| インバウンドルール番号 | タイプ               | プロトコル | ポート範囲 | 送信元      | 許可 / 拒否 |
| ---------------------- | -------------------- | ---------- | ---------- | ----------- | ----------- |
| `100`                  | すべてのトラフィック | すべて     | すべて     | `0.0.0.0/0` | ALLOW       |
| `*`                    | すべてのトラフィック | すべて     | すべて     | `0.0.0.0/0` | DENY        |

| アウトバウンドルール番号 | タイプ               | プロトコル | ポート範囲 | 宛先        | 許可 / 拒否 |
| ------------------------ | -------------------- | ---------- | ---------- | ----------- | ----------- |
| `100`                    | すべてのトラフィック | すべて     | すべて     | `0.0.0.0/0` | ALLOW       |
| `*`                      | すべてのトラフィック | すべて     | すべて     | `0.0.0.0/0` | DENY        |

<br>

## 04. ルートテーブル

### ルートテーブルとは

クラウドルーターのマッピングテーブルとして働く。

サブネットに紐付けることにより、サブネット内からサブネット外に出るリクエストのルーティングを制御する。

注意点として、Network ACLよりも後に評価される。

> - https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html#RouteTables

| Destination (宛先のIPの範囲) |               Target                |
| :--------------------------: | :---------------------------------: |
|         `*.*.*.*/*`          | Destinationの範囲内だった場合の宛先 |

<br>

### ルートテーブルの種類

#### ▼ メインルートテーブル

AWS VPCの作成時に自動的に作成される。

どのルートテーブルにも紐付けられていないサブネットのルーティングを設定する。

#### ▼ カスタムルートテーブル

特定のサブネットのルーティングを設定する。

<br>

## 05. AWS VPCエンドポイント

### AWS VPCエンドポイントとは

AWS VPCのプライベートサブネット内のリソースが、AWS VPC外 (例：AWS VPC外AWSリソース、他のAWS VPC、AWSマーケットプレイスの外部サービス) に対して、リクエストを実行できるようにする。

Gateway型とInterface型がある。

AWS VPCエンドポイントを使用しない場合、プライベートサブネット内からのリクエストには、Internet GatewayとAWS NAT Gatewayを使用する必要がある。

![AWS VPCエンドポイント](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/VPCエンドポイント.png)

<br>

### AWS VPCエンドポイントとAWS NAT Gatewayの料金比較

AWS NAT Gatewayの代わりに、AWS VPCエンドポイントを使用すると、料金が少しだけ安くなり、また、AWS VPC外AWSリソースとの通信がより安全になる。

<br>

### エンドポイントタイプ

#### ▼ Interface型

サービス名としては、『プライベートリンク』ともいう。

実体はプライベートIPアドレスを持つENIであり、ENIがAWSリソースからリクエストを受信する。

もし、このプライベートIPアドレスにプライベートDNSを紐付ける場合は、AWS VPCの`enableDnsHostnames`オプションと`enableDnsSupport`オプションを有効化する必要がある。

> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-support
> - https://zenn.dev/momota/articles/b571b763575120

**＊リソース例＊**

AWS S3、DynamoDB以外の全てのリソース

#### ▼ Gateway型

ルートテーブルにおける定義に従う。

実体はAWS VPCエンドポイントであり、AWS VPCエンドポイントがAWSリソースからリクエストを受信する。

**＊リソース例＊**

AWS S3、DynamoDBのみ

> - https://docs.aws.amazon.com/vpc/latest/privatelink/vpce-gateway.html
> - https://yassanabc.com/2022/02/17/%E3%80%90vpc%E3%82%A8%E3%83%B3%E3%83%89%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%80%91gateway%E5%9E%8B%E3%81%A8interface%E5%9E%8B%E3%81%AE%E9%81%95%E3%81%84%E3%80%90s3%E3%80%91/

<br>

## 06. Internet Gateway

### Internet Gatewayとは

NAT処理 (DNAT、SNAT) を実行し、パブリックIPアドレス (AWS VPC外のIPアドレス) とプライベートIPアドレス (AWS VPC内のIPアドレス) を相互変換する。

`1`個のパブリックIPに対して、`1`個のプライベートIPを紐付けられる。

つまり、AWS VPC内の複数のインスタンスからのリクエストを、複数のパブリックIPアドレスで送信する。

![internet-gateway_nat-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/internet-gateway_nat-gateway.png)

> - https://aws.amazon.com/blogs/networking-and-content-delivery/attach-multiple-ips-to-a-nat-gateway-to-scale-your-egress-traffic-pattern/
> - https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html
> - https://milestone-of-se.nesuke.com/sv-advanced/aws/internet-nat-gateway/

<br>

### DNAT処理

Internet GatewayのDNAT処理では、AWS VPC外からリクエストを受信し、これの送信元IPアドレスをプライベートIPアドレスに変換する。

AWS NAT Gatewayからのリクエストであれば、送信元IPアドレスをAWS NAT GatewayのElastic IPアドレスに変換する。

一方で、宛先IPアドレスや宛先ポート番号は変換しない。

> - https://milestone-of-se.nesuke.com/sv-advanced/aws/internet-nat-gateway/

<br>

### SNAT処理

Internet GatewayのSNAT処理では、AWS VPC内からリクエストを受信し、これの送信元IPアドレスをパブリックIPアドレスに変換する。

一方で、宛先IPアドレスや宛先ポート番号は変換しない。

![internet-gateway_nat-gateway_snat](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/internet-gateway_nat-gateway_snat.png)

> - https://aws.amazon.com/blogs/networking-and-content-delivery/attach-multiple-ips-to-a-nat-gateway-to-scale-your-egress-traffic-pattern/

<br>

## 06-02. AWS NAT Gateway

### AWS NAT Gatewayとは

SNAT処理 (SNAT処理のみで、DNAT処理は持たない) を実行し、受信したリクエストの送信元IPアドレスをプライベートIPアドレス (AWS VPC内のIPアドレス) に変換する。

また、Internet Gatewayを使用して、このプライベートIPアドレスをパブリックIPアドレスに変換する。

`1`個のパブリックIPに対して、複数のプライベートIPを紐付けられる。

この時のパブリックIPは、Elastic IPである。

つまり、AWS VPC内の複数のインスタンスからのリクエストを、`1`個のパブリックIPアドレスで送信する。

そのため、送信元はこのパブリックIPアドレスになる。

![internet-gateway_nat-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/internet-gateway_nat-gateway.png)

> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html#nat-gateway-basics
> - https://aws.amazon.com/blogs/networking-and-content-delivery/attach-multiple-ips-to-a-nat-gateway-to-scale-your-egress-traffic-pattern/
> - https://milestone-of-se.nesuke.com/sv-advanced/aws/internet-nat-gateway/

<br>

### SNAT処理

AWS NAT GatewayのSNAT処理では、プライベートサブネットからリクエストを受信し、これの送信元IPアドレスをプライベートIPアドレスに変換する。

また、Internet Gatewayを使用して、このプライベートIPアドレスをパブリックIPアドレスに変換する。

一方で、宛先IPアドレスや宛先ポート番号は変換しない。

![internet-gateway_nat-gateway_snat](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/internet-gateway_nat-gateway_snat.png)

> - https://aws.amazon.com/blogs/networking-and-content-delivery/attach-multiple-ips-to-a-nat-gateway-to-scale-your-egress-traffic-pattern/

<br>

## 06-03. NAT EC2インスタンス

### NAT EC2インスタンスとは

専用のAMIから作成したEC2で、NAT処理 (SNAT処理のみで、DNAT処理は持たない) をもつ。

> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-comparison.html
> - https://zenn.dev/yoshinori_satoh/articles/aws-nat-pattern#nat%E3%82%A4%E3%83%B3%E3%82%B9%E3%82%BF%E3%83%B3%E3%82%B9(ec2)

<br>

## 07. AWS VPC間、AWS VPC-オンプレミス間の通信

### AWS VPCピアリング接続

異なるAWS VPCのネットワークを接続する。

![AWS VPCピアリング接続](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/VPCピアリング接続.png)

#### ▼ AWS VPCピアリング接続とは

『一対一』の関係で、『異なるAWS VPC間』の双方向通信を可能にする。

#### ▼ AWS VPCピアリング接続の可否

AWS VPCに複数の IPv4 CIDRブロック ブロックがあり、1つでも 同じCIDRブロック ブロックがある場合は、AWS VPC ピアリング接続はできない。

| アカウント  | AWS VPCのあるリージョン | AWS VPC内のCIDRブロック | 接続の可否 |
| ----------- | ----------------------- | ----------------------- | ---------- |
| 同じ/異なる | 同じ/異なる             | 全て異なる              | ⭕️         |
|             |                         | 同じものが1つでもある   | ✕          |

![AWS VPCピアリング接続不可の場合-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/VPCピアリング接続不可の場合-1.png)

たとえ、IPv6が異なっていても、同様である。

![AWS VPCピアリング接続不可の場合-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/VPCピアリング接続不可の場合-2.png)

<br>

### AWS VPCエンドポイントサービス

#### ▼ AWS VPCエンドポイントサービスとは

AWS VPCエンドポイントとは異なる能力なので注意する。

Interface型のAWS VPCエンドポイント (プライベートリンク) をNLBに紐付けることにより、『一対多』の関係で、『異なるAWS VPC間』の双方向通信を可能にする。

エンドポイントのサービス名は、『`com.amazonaws.vpce.ap-northeast-1.vpce-svc-*****`』になる。

AWS API GatewayのAWS VPCリンクは、AWS VPCエンドポイントサービスに相当する。

![vpc-endpoint-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vpc-endpoint-service.png)

<br>

### Transit Gateway

#### ▼ Transit Gatewayとは

『多対多』の関係で、『異なるAWS VPC間』や『AWS VPCとDirect Connect間』の双方向通信を可能にする。

クラウドルーターとして働く。

Direct Connectがオンプレミスとの通信機能を持つため、Transit GatewayとDirect Connectを組み合わせれば、AWS VPCとオンプレミスを接続することもできる。

![transit-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/transit-gateway.png)

> - https://docs.aws.amazon.com/vpc/latest/tgw/tgw-best-design-practices.html
> - https://www.ashisuto.co.jp/db_blog/article/aws-transitgateway.html

#### ▼ AWS間

AWS間の通信の場合、アプリケーションデータを自動的に暗号化する。

> - https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html

<br>

### AWS VPC Lattice

異なるAWS VPCのネットワークをAWS VPC Latticeサービスネットワークを経由して接続する。

![vpc-lattice](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vpc-lattice.png)

> - https://yuj1osm.hatenablog.com/entry/2023/04/16/170124
> - https://qiita.com/k-sasaki-hisys-biz/items/28ba5762aa9544694021
> - https://qiita.com/minorun365/items/7f73aa1fe1ef2ca0c2c7#%E3%82%BF%E3%83%BC%E3%82%B2%E3%83%83%E3%83%88%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97

<br>

### 各サービスの比較

| 能力                                              | AWS VPCピアリング接続 |       AWS VPCエンドポイントサービス        |      Transit gateway       |                                           AWS VPC Lattice                                            |
| ------------------------------------------------- | :-------------------: | :----------------------------------------: | :------------------------: | :--------------------------------------------------------------------------------------------------: |
| 通信できるAWS VPC数                               |        一対一         |              一対一<br>一対多              | 一対一<br>一対多<br>多対多 |                                      一対一<br>一対多<br>多対多                                      |
| 通信できるIPアドレスの種類                        |      IPv4、IPv6       |                    IPv4                    |         IPv4、IPv6         |                                              IPv4、IPv6                                              |
| 通信できるリソース                                |       制限なし        | NLBで`L4`ルーティングできるAWSリソースのみ |          制限なし          | ALBで`L7`ルーティングできるAWSリソースのみ<br>(例：EC2、IPアドレス、AWS Lambda、KubernetesのPodなど) |
| CIDRブロックがAWS VPC間で被ることによる通信の可否 |          ×︎           |                     ⭕                     |             ×︎             |                                                  ⭕                                                  |
| クロスアカウント                                  |          ⭕           |                     ⭕                     |             ⭕             |                                                  ⭕                                                  |
| クロスリージョン                                  |          ⭕           |                     ×︎                     |             ⭕             |                                                  ⭕                                                  |
| AWS VPC間                                         |          ⭕           |                     ⭕                     |             ⭕             |                                                  ⭕                                                  |
| AWS VPC-オンプレミス間                            |          ×︎           |                     ×︎                     |             ⭕             |                                                  ×︎                                                  |

<br>

## 08. AWS VPCフローログ

AWS VPC内のENIを通過するパケットをキャプチャできる。

```bash
version account-id       interface-id  srcaddr           dstaddr         srcport         dstport        protocol   packets    bytes     start            end               action log-status
2       <AWSアカウントID>  eni-<ENIのID>  <送信元IPアドレス>  <宛先IPアドレス> <送信元ポート番号> <宛先ポート番号> <プロトコル> <パケット数> <バイト数> <開始タイムスタンプ> <終了タイムスタンプ> ACCEPT OK
...
```

> - https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html
> - https://kikuchitk7.hatenablog.com/entry/2022/03/28/152414

<br>

## 09. セキュリティグループ

### セキュリティグループとは

アプリケーションのクラウドパケットフィルタリング型ファイアウォール (`L2`～`L4`を防御) として働く。

リクエスト (プライベートネットワーク向き通信) では、プロトコルや受信元IPアドレスを設定できる。

また、リクエスト (パブリックネットワーク向き通信) では、プロトコルや宛先プロトコルを設定できる。

<br>

## 09-02. セットアップ

### コンソール画面の場合

リクエストを許可するルールとアウトバウンドルールを設定できる。

特定のセキュリティグループに紐付けられているAWSリソースを見つけたい場合は、ENIでセキュリティグループのIDを検索する。

インスタンスIDや説明文から、いずれのAWSリソースが紐づいているか否かを確認する。

<br>

### 送信元IPアドレスの指定

#### ▼ セキュリティグループIDの紐付け

許可する送信元IPアドレスにセキュリティグループIDを設定した場合、そのセキュリティグループが紐付けられているENIと、このENIに紐付けられたリソースからのトラフィックを許可できる。

リソースのIPアドレスが動的に変化する場合、有効な方法である。

> - https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html#DefaultSecurityGroup

#### ▼ 自己参照

許可する送信元IPアドレスに、自分自身のセキュリティグループIDを設定した場合、同じセキュリティグループが紐付けられている同士で通信できるようになる。

> - https://stackoverflow.com/questions/51565372/self-referencing-aws-security-groups

<br>
