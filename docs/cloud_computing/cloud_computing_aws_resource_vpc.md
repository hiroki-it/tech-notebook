---
title: 【IT技術の知見】Amazon VPC＠AWSリソース
description: Amazon VPC＠AWSリソースの知見を記録しています。
---

# Amazon VPC＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Amazon VPCとは：Virtual Private Cloud

クラウドプライベートネットワークとして働く。

プライベート IP アドレスが割り当てられた、Amazon VPC と呼ばれるプライベートネットワーク (`L3`) を仮想的に作成できる。

異なる AZ に渡って EC2 を立ちあげることによって、クラウドサーバーをデュアル化できる。

EKS の場合、Amazon VPC (`L3`) 上に Amazon VPC CNI を配置することにより、クラスターネットワークを作成できる。

![Amazon VPC が提供できるネットワークの範囲](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Amazon VPC が提供できるネットワークの範囲.png)

> - https://pages.awscloud.com/rs/112-TZM-766/images/AWS-08_AWS_Summit_Online_2020_NET01.pdf
> - https://d1.awsstatic.com/webinars/jp/pdf/services/20180515_AWS-BlackBelt_Networking-for-RFP.pdf#page=51

<br>

### Amazon VPC内のIPアドレス

#### ▼ IPアドレスの種類

| IPアドレスの種類       | 手動/自動 | グローバル/プライベート | 特徴           | 説明                                                           |
| ---------------------- | --------- | ----------------------- | -------------- | -------------------------------------------------------------- |
| パブリックIPアドレス   | 自動      | グローバル              | 動的IPアドレス | 動的なIPアドレスのため、インスタンスを再作成すると変化する。   |
| プライベートIPアドレス | 手動/自動 | プライベート            | 動的IPアドレス | 動的なIPアドレスのため、インスタンスを再作成すると変化する。   |
| Elastic IP             | 手動      | グローバル              | 静的IPアドレス | 静的なIPアドレスのため、インスタンスを再作成しても保持される。 |

> - https://awsjp.com/AWS/hikaku/Elastic-IP_Public-IP-hikaku.html
> - https://qiita.com/masato930/items/ba242f0171a76ce0994f

#### ▼ DNS名の割り当て

Amazon VPC 内で作成されたインスタンスにはパブリック IP アドレスが自動的に割り当てられるが、IP アドレスにマッピングされた DNS 名を持たない。

`enableDnsHostnames` オプションと `enableDnsSupport` オプションと有効化すると、インスタンスに DNS 名が割り当てられるようになる。

> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-support
> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-updating

#### ▼ 紐付け

| 紐付け名      | 補足                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| EC2との紐付け | 非推奨の方法である。<br>- https://docs.aws.amazon.com/vpc/latest/userguide/vpc-eips.html#vpc-eip-overview   |
| ENIとの紐付け | 推奨される方法である。<br>- https://docs.aws.amazon.com/vpc/latest/userguide/vpc-eips.html#vpc-eip-overview |

<br>

## 02. Amazon VPCサブネット

### Amazon VPCサブネットとは

クラウドプライベートネットワークにおけるセグメントとして働く。

<br>

### サブネットの種類

#### ▼ パブリックサブネットとは

LAN 内の非武装地帯に相当する。

#### ▼ プライベートサブネットとは

LAN 内の内部ネットワークに相当する。

サブネット外からのインバンド通信を受け付けないようするために、ALB のルーティング先にサブネットを設定しないようにすれば、そのサブネットはプライベートサブネットとして動作する。

ただし、サブネット内からサブネット外へのリクエストは許可しても問題なく、その場合はルートテーブルに AWS NAT Gateway を設定する必要がある。

![public-subnet_private-subnet](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/public-subnet_private-subnet.png)

<br>

## 03. Network ACL：Network Access Control List

### Network ACLとは

サブネットのクラウドパケットフィルタリング型ファイアウォール (`L2`～`L4` を防御) として働く。

ルートテーブルとサブネットの間に配置され、ルートテーブルよりも先に評価される。

双方向のインバウンドルールとアウトバウンドルールを決める。

![network-acl](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network-acl.png)

<br>

### ACLルール

ルールは上から順に適用される。

例えば、ルールが以下だったとする。

ルール `100` が最初に適用され、サブネットへの全送信元 IP アドレス (`0.0.0.0/0`) を許可していることになる。

| インバウンドルール番号 | タイプ               | プロトコル | ポート範囲 | 送信元      | 許可／拒否 |
| ---------------------- | -------------------- | ---------- | ---------- | ----------- | ---------- |
| `100`                  | すべてのトラフィック | すべて     | すべて     | `0.0.0.0/0` | ALLOW      |
| `*`                    | すべてのトラフィック | すべて     | すべて     | `0.0.0.0/0` | DENY       |

| アウトバウンドルール番号 | タイプ               | プロトコル | ポート範囲 | 宛先        | 許可／拒否 |
| ------------------------ | -------------------- | ---------- | ---------- | ----------- | ---------- |
| `100`                    | すべてのトラフィック | すべて     | すべて     | `0.0.0.0/0` | ALLOW      |
| `*`                      | すべてのトラフィック | すべて     | すべて     | `0.0.0.0/0` | DENY       |

<br>

## 04. ルートテーブル

### ルートテーブルとは

クラウドルーターのマッピングテーブルとして働く。

サブネットに紐付けることにより、サブネット内からサブネット外に出るリクエストのルーティングを制御する。

注意点として、Network ACL よりも後に評価される。

> - https://docs.aws.amazon.com/vpc/latest/userguide/Amazon VPC_Route_Tables.html#RouteTables

| Destination (宛先のIPの範囲) |               Target                |
| :--------------------------: | :---------------------------------: |
|         `*.*.*.*/*`          | Destinationの範囲内だった場合の宛先 |

<br>

### ルートテーブルの種類

#### ▼ メインルートテーブル

Amazon VPC の作成時に自動的に作成される。

どのルートテーブルにも紐付けられていないサブネットのルーティングを設定する。

#### ▼ カスタムルートテーブル

特定のサブネットのルーティングを設定する。

<br>

## 05. Amazon VPCエンドポイント

### Amazon VPCエンドポイントとは

Amazon VPC のプライベートサブネット内のリソースが、Amazon VPC 外 (例：Amazon VPC 外 AWS リソース、他の Amazon VPC、AWS マーケットプレイスの外部サービス) に対して、リクエストを実行できるようにする。

Gateway 型と Interface 型がある。

Amazon VPC エンドポイントを使用しない場合、プライベートサブネット内からのリクエストには、Internet Gateway と AWS NAT Gateway を使用する必要がある。

![Amazon VPC エンドポイント](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Amazon VPC エンドポイント.png)

<br>

### Amazon VPCエンドポイントとAWS NAT Gatewayの料金比較

AWS NAT Gateway の代わりに Amazon VPC エンドポイントを使用すると、料金が少しだけ安くなる。また、Amazon VPC 外 AWS リソースとの通信がより安全になる。

<br>

### エンドポイントタイプ

#### ▼ Interface型

サービス名としては、『プライベートリンク』ともいう。

実体はプライベート IP アドレスを持つ ENI であり、ENI が AWS リソースからリクエストを受信する。

もし、このプライベート IP アドレスにプライベート DNS を紐付ける場合は、Amazon VPC の `enableDnsHostnames` オプションと `enableDnsSupport` オプションを有効化する必要がある。

> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-support
> - https://zenn.dev/momota/articles/b571b763575120

**＊リソース例＊**

Amazon S3、DynamoDB 以外のすべてのリソース

#### ▼ Gateway型

ルートテーブルにおける定義に従う。

実体は Amazon VPC エンドポイントであり、Amazon VPC エンドポイントが AWS リソースからリクエストを受信する。

**＊リソース例＊**

Amazon S3、DynamoDB のみ

> - https://docs.aws.amazon.com/vpc/latest/privatelink/vpce-gateway.html
> - https://yassanabc.com/2022/02/17/%E3%80%90vpc%E3%82%A8%E3%83%B3%E3%83%89%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%80%91gateway%E5%9E%8B%E3%81%A8interface%E5%9E%8B%E3%81%AE%E9%81%95%E3%81%84%E3%80%90s3%E3%80%91/

<br>

## 06. Internet Gateway

### Internet Gatewayとは

NAT 処理 (DNAT、SNAT) を実行し、パブリック IP アドレス (Amazon VPC 外の IP アドレス) とプライベート IP アドレス (Amazon VPC 内の IP アドレス) を相互変換する。

`1` 個のパブリック IP に対して、`1` 個のプライベート IP を紐付けられる。

つまり、Amazon VPC 内の複数のインスタンスからのリクエストを、複数のパブリック IP アドレスで送信する。

![internet-gateway_nat-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/internet-gateway_nat-gateway.png)

> - https://aws.amazon.com/blogs/networking-and-content-delivery/attach-multiple-ips-to-a-nat-gateway-to-scale-your-egress-traffic-pattern/
> - https://docs.aws.amazon.com/vpc/latest/userguide/Amazon VPC_Internet_Gateway.html
> - https://milestone-of-se.nesuke.com/sv-advanced/aws/internet-nat-gateway/

<br>

### DNAT処理

Internet Gateway の DNAT 処理では、Amazon VPC 外からリクエストを受信し、これの送信元 IP アドレスをプライベート IP アドレスに変換する。

AWS NAT Gateway からのリクエストであれば、送信元 IP アドレスを AWS NAT Gateway の Elastic IP アドレスに変換する。

一方で、宛先 IP アドレスや宛先ポート番号は変換しない。

> - https://milestone-of-se.nesuke.com/sv-advanced/aws/internet-nat-gateway/

<br>

### SNAT処理

Internet Gateway の SNAT 処理では、Amazon VPC 内からリクエストを受信し、これの送信元 IP アドレスをパブリック IP アドレスに変換する。

一方で、宛先 IP アドレスや宛先ポート番号は変換しない。

![internet-gateway_nat-gateway_snat](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/internet-gateway_nat-gateway_snat.png)

> - https://aws.amazon.com/blogs/networking-and-content-delivery/attach-multiple-ips-to-a-nat-gateway-to-scale-your-egress-traffic-pattern/

<br>

## 06-02. AWS NAT Gateway

### AWS NAT Gatewayとは

SNAT 処理 (SNAT 処理のみで、DNAT 処理は持たない) を実行し、受信したリクエストの送信元 IP アドレスをプライベート IP アドレス (Amazon VPC 内の IP アドレス) に変換する。

また、Internet Gateway を使用して、このプライベート IP アドレスをパブリック IP アドレスに変換する。

`1` 個のパブリック IP に対して、複数のプライベート IP を紐付けられる。

このときのパブリック IP は、Elastic IP である。

つまり、Amazon VPC 内の複数のインスタンスからのリクエストを、`1` 個のパブリック IP アドレスで送信する。

そのため、送信元はこのパブリック IP アドレスになる。

![internet-gateway_nat-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/internet-gateway_nat-gateway.png)

> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html#nat-gateway-basics
> - https://aws.amazon.com/blogs/networking-and-content-delivery/attach-multiple-ips-to-a-nat-gateway-to-scale-your-egress-traffic-pattern/
> - https://milestone-of-se.nesuke.com/sv-advanced/aws/internet-nat-gateway/

<br>

### SNAT処理

AWS NAT Gateway の SNAT 処理では、プライベートサブネットからリクエストを受信し、これの送信元 IP アドレスをプライベート IP アドレスに変換する。

また、Internet Gateway を使用して、このプライベート IP アドレスをパブリック IP アドレスに変換する。

一方で、宛先 IP アドレスや宛先ポート番号は変換しない。

![internet-gateway_nat-gateway_snat](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/internet-gateway_nat-gateway_snat.png)

> - https://aws.amazon.com/blogs/networking-and-content-delivery/attach-multiple-ips-to-a-nat-gateway-to-scale-your-egress-traffic-pattern/

<br>

## 06-03. NAT Amazon EC2インスタンス

### NAT Amazon EC2インスタンスとは

専用の AMI から作成した EC2 で、NAT 処理 (SNAT 処理のみで、DNAT 処理は持たない) を持つ。

> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-comparison.html
> - https://zenn.dev/yoshinori_satoh/articles/aws-nat-pattern#nat%E3%82%A4%E3%83%B3%E3%82%B9%E3%82%BF%E3%83%B3%E3%82%B9(ec2)

<br>

## 07. Amazon VPC間、Amazon VPC-オンプレミス間の通信

### Amazon VPCピアリング接続

異なる Amazon VPC のネットワークを接続する。

![Amazon VPC ピアリング接続](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Amazon VPC ピアリング接続.png)

#### ▼ Amazon VPCピアリング接続とは

『一対一』の関係で、『異なる Amazon VPC 間』の双方向通信を可能にする。

#### ▼ Amazon VPCピアリング接続の可否

Amazon VPC に複数の IPv4 CIDR ブロック ブロックがあり、1 つでも 同じ CIDR ブロック ブロックがある場合は、Amazon VPC ピアリング接続はできない。

| アカウント  | Amazon VPCのあるリージョン | Amazon VPC内のCIDRブロック | 接続の可否 |
| ----------- | -------------------------- | -------------------------- | ---------- |
| 同じ/異なる | 同じ/異なる                | すべて異なる               | ⭕️         |
|             |                            | 同じものが1つでもある      | ✕          |

![Amazon VPC ピアリング接続不可の場合-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Amazon VPC ピアリング接続不可の場合-1.png)

たとえ、IPv6 が異なっていても、同様である。

![Amazon VPC ピアリング接続不可の場合-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Amazon VPC ピアリング接続不可の場合-2.png)

<br>

### Amazon VPCエンドポイントサービス

#### ▼ Amazon VPCエンドポイントサービスとは

Amazon VPC エンドポイントとは異なる能力なので注意する。

Interface 型の Amazon VPC エンドポイント (プライベートリンク) を NLB に紐付けることにより、『一対多』の関係で、『異なる Amazon VPC 間』の双方向通信を可能にする。

エンドポイントのサービス名は、『`com.amazonaws.vpce.ap-northeast-1.vpce-svc-*****`』になる。

Amazon API Gateway の Amazon VPC リンクは、Amazon VPC エンドポイントサービスに相当する。

![vpc-endpoint-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vpc-endpoint-service.png)

<br>

### Transit Gateway

#### ▼ Transit Gatewayとは

『多対多』の関係で、『異なる Amazon VPC 間』や『Amazon VPC と Direct Connect 間』の双方向通信を可能にする。

クラウドルーターとして働く。

Direct Connect がオンプレミスとの通信機能を持つため、Transit Gateway と Direct Connect を組み合わせれば、Amazon VPC とオンプレミスを接続できる。

![transit-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/transit-gateway.png)

> - https://docs.aws.amazon.com/vpc/latest/tgw/tgw-best-design-practices.html
> - https://www.ashisuto.co.jp/db_blog/article/aws-transitgateway.html

#### ▼ AWS間

AWS 間の通信の場合、アプリケーションデータを自動的に暗号化する。

> - https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html

<br>

### Amazon VPC Lattice

Amazon EC2、Amazon ECS、Amazon EKS、AWS Lambda 間を接続する。

![vpc-lattice](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vpc-lattice.png)

> - https://yuj1osm.hatenablog.com/entry/2023/04/16/170124
> - https://qiita.com/k-sasaki-hisys-biz/items/28ba5762aa9544694021
> - https://qiita.com/minorun365/items/7f73aa1fe1ef2ca0c2c7#%E3%82%BF%E3%83%BC%E3%82%B2%E3%83%83%E3%83%88%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97

<br>

### 各サービスの比較

| 能力                                                 | Amazon VPCピアリング接続 |       Amazon VPCエンドポイントサービス       |      Transit gateway       |                                           Amazon VPC Lattice                                           |
| ---------------------------------------------------- | :----------------------: | :------------------------------------------: | :------------------------: | :----------------------------------------------------------------------------------------------------: |
| 通信できるAmazon VPC数                               |          一対一          |               一対一<br>一対多               | 一対一<br>一対多<br>多対多 |                                       一対一<br>一対多<br>多対多                                       |
| 通信できるIPアドレスの種類                           |        IPv4、IPv6        |                     IPv4                     |         IPv4、IPv6         |                                               IPv4、IPv6                                               |
| 通信できるリソース                                   |         制限なし         | NLBで `L4` ルーティングできるAWSリソースのみ |          制限なし          | ALBで `L7` ルーティングできるAWSリソースのみ<br>(例：EC2、IPアドレス、AWS Lambda、KubernetesのPodなど) |
| CIDRブロックがAmazon VPC間で被ることによる通信の可否 |            ×︎             |                      ⭕                      |             ×︎              |                                                   ⭕                                                   |
| クロスアカウント                                     |            ⭕            |                      ⭕                      |             ⭕             |                                                   ⭕                                                   |
| クロスリージョン                                     |            ⭕            |                      ×︎                       |             ⭕             |                                                   ⭕                                                   |
| Amazon VPC間                                         |            ⭕            |                      ⭕                      |             ⭕             |                                                   ⭕                                                   |
| Amazon VPC-オンプレミス間                            |            ×︎             |                      ×︎                       |             ⭕             |                                                   ×︎                                                    |

<br>

## 08. Amazon VPCフローログ

Amazon VPC 内の ENI を通過するパケットをキャプチャできる。

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

アプリケーションのクラウドパケットフィルタリング型ファイアウォール (`L2`～`L4` を防御) として働く。

リクエスト (プライベートネットワーク向き通信) では、プロトコルや受信元 IP アドレスを設定できる。

また、リクエスト (パブリックネットワーク向き通信) では、プロトコルや宛先プロトコルを設定できる。

<br>

## 09-02. セットアップ

### コンソール画面の場合

リクエストを許可するルールとアウトバウンドルールを設定できる。

特定のセキュリティグループに紐付けられている AWS リソースを見つけたい場合は、ENI でセキュリティグループの ID を検索する。

インスタンス ID や説明文から、いずれの AWS リソースが紐づいているか否かを確認する。

<br>

### 送信元IPアドレスの指定

#### ▼ セキュリティグループIDの紐付け

許可する送信元 IP アドレスにセキュリティグループ ID を設定した場合、そのセキュリティグループが紐付けられている ENI と、この ENI に紐付けられたリソースからのトラフィックを許可できる。

リソースの IP アドレスが動的に変化する場合、有効な方法である。

> - https://docs.aws.amazon.com/vpc/latest/userguide/Amazon VPC_SecurityGroups.html#DefaultSecurityGroup

#### ▼ 自己参照

許可する送信元 IP アドレスに、自分自身のセキュリティグループ ID を設定した場合、同じセキュリティグループが紐付けられている同士で通信できるようになる。

> - https://stackoverflow.com/questions/51565372/self-referencing-aws-security-groups

<br>
