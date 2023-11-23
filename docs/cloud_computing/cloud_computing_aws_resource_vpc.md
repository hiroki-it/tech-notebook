---
title: 【IT技術の知見】VPC＠AWSリソース
description: VPC＠AWSリソースの知見を記録しています。
---

# VPC＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. VPCとは：Virtual Private Cloud

クラウドプライベートネットワークとして働く。

プライベートIPアドレスが割り当てられた、VPCと呼ばれるプライベートネットワークを仮想的に作成できる。

異なるAZに渡ってEC2を立ち上げることによって、クラウドサーバーをデュアル化できる。

VPCのパケット通信の仕組みについては、以下のリンクを参考にせよ。

![VPCが提供できるネットワークの範囲](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/VPCが提供できるネットワークの範囲.png)

> - https://pages.awscloud.com/rs/112-TZM-766/images/AWS-08_AWS_Summit_Online_2020_NET01.pdf

<br>

### VPC内のIPアドレス

#### ▼ IPアドレスの種類

| IPアドレスの種類       | 手動/自動 | グローバル/プライベート | 特徴           | 説明                                                           |
| ---------------------- | --------- | ----------------------- | -------------- | -------------------------------------------------------------- |
| パブリックIPアドレス   | 自動      | グローバル              | 動的IPアドレス | 動的なIPアドレスのため、インスタンスを再作成すると変化する。   |
| プライベートIPアドレス | 自動/手動 | プライベート            | 動的IPアドレス | 動的なIPアドレスのため、インスタンスを再作成すると変化する。   |
| Elastic IP             | 手動      | グローバル              | 静的IPアドレス | 静的なIPアドレスのため、インスタンスを再作成しても保持される。 |

> - https://awsjp.com/AWS/hikaku/Elastic-IP_Public-IP-hikaku.html
> - https://qiita.com/masato930/items/ba242f0171a76ce0994f

#### ▼ DNS名の割り当て

VPC内で作成されたインスタンスにはパブリックIPアドレスが自動的に割り当てられるが、IPアドレスにマッピングされたDNS名を持たない。

`enableDnsHostnames`オプションと`enableDnsSupport`オプションと有効化すると、インスタンスにDNS名が割り当てられるようになる。

> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-support
> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-updating

#### ▼ 紐付け

| 紐付け名      | 補足                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| EC2との紐付け | 非推奨の方法である。<br>- https://docs.aws.amazon.com/vpc/latest/userguide/vpc-eips.html#vpc-eip-overview   |
| ENIとの紐付け | 推奨される方法である。<br>- https://docs.aws.amazon.com/vpc/latest/userguide/vpc-eips.html#vpc-eip-overview |

<br>

## 02. VPCサブネット

### VPCサブネットとは

クラウドプライベートネットワークにおけるセグメントとして働く。

<br>

### サブネットの種類

#### ▼ パブリックサブネットとは

LAN内の非武装地帯に相当する。

#### ▼ プライベートサブネットとは

LAN内の内部ネットワークに相当する。

サブネット外からのインバンド通信を受け付けないようするために、ALBのルーティング先にサブネットを設定しないようにすれば、そのサブネットはプライベートサブネットとして動作する。

ただし、サブネット内からサブネット外へのアウトバウンド通信は許可しても問題なく、その場合はルートテーブルにNAT Gatewayを設定する必要がある。

![public-subnet_private-subnet](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/public-subnet_private-subnet.png)

<br>

## 03. Network ACL：Network Access Control List

### Network ACLとは

サブネットのクラウドパケットフィルタリング型ファイアウォールとして働く。

ルートテーブルとサブネットの間に配置され、ルートテーブルよりも先に評価される。

双方向のインバウンドルールとアウトバウンドルールを決める。

![network-acl](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network-acl.png)

<br>

### ACLルール

ルールは上から順に適用される。

例えば、インバウンドルールが以下だった場合、ルール100が最初に適用され、サブネットに対する、全IPアドレス (`0.0.0.0/0`) からのインバウンド通信を許可していることになる。

| ルール # | タイプ                | プロトコル | ポート範囲 / ICMP タイプ | ソース    | 許可 / 拒否 |
| -------- | --------------------- | ---------- | ------------------------ | --------- | ----------- |
| 100      | すべての トラフィック | すべて     | すべて                   | 0.0.0.0/0 | ALLOW       |
| \*       | すべての トラフィック | すべて     | すべて                   | 0.0.0.0/0 | DENY        |

<br>

## 04. ルートテーブル

### ルートテーブルとは

クラウドルーターのマッピングテーブルとして働く。

サブネットに紐付けることにより、サブネット内からサブネット外に出るアウトバウンド通信のルーティングを制御する。

注意点として、Network ACLよりも後に評価される。

> - https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html#RouteTables

| Destination (宛先のIPの範囲) |               Target                |
| :--------------------------: | :---------------------------------: |
|         `*.*.*.*/*`          | Destinationの範囲内だった場合の宛先 |

<br>

### ルートテーブルの種類

#### ▼ メインルートテーブル

VPCの作成時に自動的に作成される。

どのルートテーブルにも紐付けられていないサブネットのルーティングを設定する。

#### ▼ カスタムルートテーブル

特定のサブネットのルーティングを設定する。

<br>

## 05. VPCエンドポイント

### VPCエンドポイントとは

VPCのプライベートサブネット内のリソースが、VPC外のリソースに対して、アウトバウンド通信を実行できるようにする。

Gateway型とInterface型がある。

VPCエンドポイントを使用しない場合、プライベートサブネット内からのアウトバウンド通信には、Internet GatewayとNAT Gatewayを使用する必要がある。

**＊例＊**

Fargateをプライベートサブネットに置いた場合、FargateからVPC外にあるAWSリソースに対するアウトバウンド通信のために必要である (例：CloudWatchログ、ECR、S3、Systems Manager) 。

![VPCエンドポイント](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/VPCエンドポイント.png)

<br>

### VPCエンドポイントとNAT Gatewayの料金比較

NAT Gatewayの代わりに、VPCエンドポイントを使用すると、料金が少しだけ安くなり、また、VPC外のリソースとの通信がより安全になる。

<br>

### エンドポイントタイプ

#### ▼ Interface型

プライベートリンクともいう。

プライベートIPアドレスを持つENIとして動作し、AWSリソースからアウトバウンド通信を受信する。

もし、このプライベートIPアドレスにプライベートDNSを紐付ける場合は、VPCの`enableDnsHostnames`オプションと`enableDnsSupport`オプションを有効化する必要がある。

> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-support

**＊リソース例＊**

S3、DynamoDB以外の全てのリソース

#### ▼ Gateway型

ルートテーブルにおける定義に従う。

VPCエンドポイントとして動作し、AWSリソースからアウトバウンド通信を受信する。

**＊リソース例＊**

S3、DynamoDBのみ

> - https://docs.aws.amazon.com/vpc/latest/privatelink/vpce-gateway.html
> - https://yassanabc.com/2022/02/17/%E3%80%90vpc%E3%82%A8%E3%83%B3%E3%83%89%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%80%91gateway%E5%9E%8B%E3%81%A8interface%E5%9E%8B%E3%81%AE%E9%81%95%E3%81%84%E3%80%90s3%E3%80%91/

<br>

## 06. Internet Gateway、NAT Gateway

### Internet Gateway

#### ▼ Internet Gatewayとは

DNAT処理を実行し、グローバルIPアドレス (VPC外のIPアドレス) をプライベートIPアドレス (VPC内のIPアドレス) に変換する。

`1`個のパブリックIPに対して、`1`個のプライベートIPを紐付けられる。

つまり、VPC内の複数のインスタンスからのアウトバウンド通信を、複数のパブリックIPアドレスで送信する。

![InternetGatewayとNATGateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/InternetGatewayとNATGateway.png)

> - https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html
> - https://milestone-of-se.nesuke.com/sv-advanced/aws/internet-nat-gateway/

<br>

### NAT Gateway

#### ▼ NAT Gatewayとは

SNAT処理を実行し、プライベートIPアドレス (VPC内のIPアドレス) をグローバルIPアドレス (VPC外のIPアドレス) に変換する。

`1`個のパブリックIPに対して、複数のプライベートIPを紐付けられる。

つまり、VPC内の複数のインスタンスからのアウトバウンド通信を、`1`個のパブリックIPアドレスで送信する。

そのため、送信元はこのパブリックIPアドレスになる。

この時のパブリックIPとして、Elastic IPをNAT Gatewayに割り当てる必要がある。

![InternetGatewayとNATGateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/InternetGatewayとNATGateway.png)

> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html#nat-gateway-basics
> - https://milestone-of-se.nesuke.com/sv-advanced/aws/internet-nat-gateway/

<br>

## 07. VPC間、VPC-オンプレミス間の通信

### VPCピアリング接続

異なるVPCのネットワークを接続する。

![VPCピアリング接続](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/VPCピアリング接続.png)

#### ▼ VPCピアリング接続とは

『一対一』の関係で、『異なるVPC間』の双方向通信を可能にする。

#### ▼ VPCピアリング接続の可否

VPCに複数の IPv4 CIDRブロック ブロックがあり、1つでも 同じCIDRブロック ブロックがある場合は、VPC ピアリング接続はできない。

| アカウント  | VPCのあるリージョン | VPC内のCIDRブロック   | 接続の可否 |
| ----------- | ------------------- | --------------------- | ---------- |
| 同じ/異なる | 同じ/異なる         | 全て異なる            | **〇**     |
|             |                     | 同じものが1つでもある | ✕          |

![VPCピアリング接続不可の場合-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/VPCピアリング接続不可の場合-1.png)

たとえ、IPv6が異なっていても、同様である。

![VPCピアリング接続不可の場合-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/VPCピアリング接続不可の場合-2.png)

<br>

### VPCエンドポイントサービス

#### ▼ VPCエンドポイントサービスとは

VPCエンドポイントとは異なる能力なので注意する。

Interface型のVPCエンドポイント (プライベートリンク) をNLBに紐付けることにより、『一対多』の関係で、『異なるVPC間』の双方向通信を可能にする。

エンドポイントのサービス名は、『`com.amazonaws.vpce.ap-northeast-1.vpce-svc-*****`』になる。

API GatewayのVPCリンクは、VPCエンドポイントサービスに相当する。

![vpc-endpoint-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vpc-endpoint-service.png)

<br>

### Transit Gateway

#### ▼ Transit Gatewayとは

『多対多』の関係で、『異なるVPC間』や『オンプレミス-VPC間』の双方向通信を可能にする。クラウドルーターとして働く。

![transit-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/transit-gateway.png)

> - https://docs.aws.amazon.com/ja_jp/vpc/latest/tgw/tgw-best-design-practices.html

<br>

### VPC Lattice

異なるVPCのネットワークをVPC Latticeサービスネットワークを介して接続する。

![vpc-lattice.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vpc-lattice.png)

> - https://yuj1osm.hatenablog.com/entry/2023/04/16/170124
> - https://qiita.com/k-sasaki-hisys-biz/items/28ba5762aa9544694021
> - https://qiita.com/minorun365/items/7f73aa1fe1ef2ca0c2c7#%E3%82%BF%E3%83%BC%E3%82%B2%E3%83%83%E3%83%88%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97

<br>

### 各サービスの比較

| 能力                                          | VPCピアリング接続 |         VPCエンドポイントサービス          |      Transit gateway       |                                                  VPC Lattice                                                   |
| --------------------------------------------- | :---------------: | :----------------------------------------: | :------------------------: | :------------------------------------------------------------------------------------------------------------: |
| 通信できるVPC数                               |      一対一       |              一対一<br>一対多              | 一対一<br>一対多<br>多対多 |                                           一対一<br>一対多<br>多対多                                           |
| 通信できるIPアドレスの種類                    |    IPv4、IPv6     |                    IPv4                    |         IPv4、IPv6         |                                                   IPv4、IPv6                                                   |
| 通信できるリソース                            |     制限なし      | NLBで`L4`ルーティングできるAWSリソースのみ |          制限なし          | ALBで`L7`ルーティングできるAWSリソースのみ<br>(例：EC2インスタンス、IPアドレス、Lambda、KubernetesのPod、など) |
| CIDRブロックがVPC間で被ることによる通信の可否 |        ×︎         |                     ⭕                     |             ×︎             |                                                       ⭕                                                       |
| クロスアカウント                              |        ⭕         |                     ⭕                     |             ⭕             |                                                       ⭕                                                       |
| クロスリージョン                              |        ⭕         |                     ×︎                     |             ⭕             |                                                       ⭕                                                       |
| VPC間                                         |        ⭕         |                     ⭕                     |             ⭕             |                                                       ⭕                                                       |
| VPC-オンプレミス間                            |        ×︎         |                     ×︎                     |             ⭕             |                                                       ×︎                                                       |

<br>

## 08. VPCフローログ

VPC内のENIを通過するパケットをキャプチャできる。

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

アプリケーションのクラウドパケットフィルタリング型ファイアウォールとして働く。

インバウンド通信 (プライベートネットワーク向き通信) では、プロトコルや受信元IPアドレスを設定でき、アウトバウンド通信 (パブリックネットワーク向き通信) では、プロトコルや宛先プロトコルを設定できる。

<br>

## 09-02. セットアップ

### コンソール画面の場合

インバウンド通信を許可するルールとアウトバウンドルールを設定できる。

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
