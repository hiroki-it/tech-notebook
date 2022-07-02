---
title: 【IT技術の知見】AWS：Amazon Web Service
description: AWS：Amazon Web Serviceの知見を記録しています。

---

# AWS：Amazon Web Service（V〜Z）

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. VPC：Virtual Private Cloud

### VPCとは

クラウドプライベートネットワークとして働く。プライベートIPアドレスが割り当てられた、VPCと呼ばれるプライベートネットワークを仮想的に作成できる。異なるAZに渡ってEC2を立ち上げることによって、クラウドサーバーをデュアル化できる。VPCのパケット通信の仕組みについては、以下のリンクを参考にせよ。

参考：https://pages.awscloud.com/rs/112-TZM-766/images/AWS-08_AWS_Summit_Online_2020_NET01.pdf

![VPCが提供できるネットワークの範囲](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCが提供できるネットワークの範囲.png)

<br>

### VPC内のIPアドレス

#### ▼ IPアドレスの種類

参考：

- https://awsjp.com/AWS/hikaku/Elastic-IP_Public-IP-hikaku.html
- https://qiita.com/masato930/items/ba242f0171a76ce0994f

| IPアドレスの種類       | 手動/自動 | グローバル/プライベート | 特徴           | 説明                                                         |
| ---------------------- | --------- | ----------------------- | -------------- | ------------------------------------------------------------ |
| パブリックIPアドレス   | 自動      | グローバル              | 動的IPアドレス | 動的なIPアドレスのため、インスタンスを再作成すると変化する。 |
| プライベートIPアドレス | 自動/手動 | プライベート            | 動的IPアドレス | 動的なIPアドレスのため、インスタンスを再作成すると変化する。 |
| Elastic IP             | 手動      | グローバル              | 静的IPアドレス | 静的なIPアドレスのため、インスタンスを再作成しても保持される。 |

#### ▼ DNS名の割り当て

VPC内で作成されたインスタンスにはパブリックIPアドレスが自動的に割り当てられるが、IPアドレスにマッピングされたDNS名を持たない。```enableDnsHostnames```オプションと```enableDnsSupport```オプションと有効化すると、インスタンスにDNS名が割り当てられるようになる。
参考：

- https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-support
- https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-updating

#### ▼ 紐付け

| 紐付け名      | 補足                                                         |
| ------------- | ------------------------------------------------------------ |
| EC2との紐付け | 非推奨の方法である。<br>参考：https://docs.aws.amazon.com/vpc/latest/userguide/vpc-eips.html#vpc-eip-overview |
| ENIとの紐付け | 推奨される方法である。<br>参考：https://docs.aws.amazon.com/vpc/latest/userguide/vpc-eips.html#vpc-eip-overview |

<br>

### CIDRブロックの設計

#### ▼ 推奨されるCIDRブロック

1つのVPC内には複数のサブネットが入る。そのため、サブネットのCIDRブロックは、サブネットの個数だけ含めなければならない。また、VPCが持つCIDRブロックから、VPC内の各AWSリソースにIPアドレスを割り当てていかなければならず、VPC内でIPアドレスが枯渇しないようにする。RFC1918では、以下のCIDRブロックが推奨されている。

参考：

- https://note.com/takashi_sakurada/n/n502fb0299938
- https://atmarkit.itmedia.co.jp/aig/06network/privateip.html

| RFC1918推奨のCIDRブロック | IPアドレス                                | 個数           |
| ------------------------- | ----------------------------------------- | -------------- |
| ```10.0.0.0/8```          | ```10.0.0.0``` ～ ```10.255.255.255```    | ```16777216``` |
| ```172.16.0.0/12```       | ```172.16.0.0``` ~ ```172.31.255.255```   | ```1048576```  |
| ```192.168.0.0/16```      | ```192.168.0.0``` ~ ```192.168.255.255``` | ```65536```    |

#### ▼ VPC全体のCIDRブロック

あらかじめ、会社内の全てのアプリケーションのCIDRブロックをスプレッドシートなどで一括で管理しておく。各アプリケーション間でTransit Gatewayやピアリング接続を実行する可能性がある場合は。拡張性を考慮して、アプリケーション間のCIDRブロックは重ならないようにしておく必要がある。例えば、以前に開発したアプリケーションが```10.200.47.0```までを使用していた場合、```10.200.48.0```から使用を始める。また、VPCで許可されるIPアドレスの個数は最多65536個（```/16```）で最少16個（```/28```）であり、実際は512個（```/23```）ほどあれば問題ないため、```10.200.48.0/23```を設定する。

参考：https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Subnets.html#SubnetRouting

#### ▼ 各サブネットのCIDRブロック

（１）VPCのIPアドレスの最初から、パブリックサブネットとプライベートサブネットを割り当てる。この時、VPC内の各AWSリソースの特徴に合わせて、CIDRブロックを割り当てる。例えば、VPCの最初のIPアドレスを```10.0.0.0```とした場合は、1つ目のパブリックサブネットのサブネットマスクは、```10.0.0.0```から始める。パブリックサブネットとプライベートサブネットを冗長化する場合は、VPCのIPアドレス数をサブネット数で割って各サブネットのIPアドレス数を算出し、CIDRブロックを設定する。例えば、VPCのサブネットマスクを```/16``` としている場合は、各サブネットのサブネットマスクは```/24```とする。一方で、VPCを```/23```としている場合は、各サブネットは```/27```とする。また、各サブネットのCIDRブロックを同じにする必要はなく、アプリケーションが稼働するサブネットにIPアドレス数がやや多くなるようにし、その代わりに、DBの稼働するサブネットのIPアドレスを少なくするような設計でも良い。

参考：

- https://d0.awsstatic.com/events/jp/2017/summit/slide/D2T3-5.pdf
- https://dev.classmethod.jp/articles/amazon-vpc-5-tips/

| AWSリソース        | 最低限のIPアドレス数                      |
| ------------------ |----------------------------------|
| ALB                | ALB1つ当たり、```8```個                |
| オートスケーリング | 水平スケーリング時のEC2最大数と同じ個数            |
| VPCエンドポイント  | VPCエンドポイント1つ当たり、IPアドレス1つ         |
| ECS、EKS           | Elastic Network Interface 数と同じ個数 |
| Lambda             | Elastic Network Interface 数と同じ個数 |

<br>

## 01-02. ENI：Elastic Network Interface

### ENIとは

クラウドネットワークインターフェースとして働く。物理ネットワークにおけるNICについては以下のリンクを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network_model_tcp.html

<br>

### 紐付けられるリソース

| リソースの種類       | 役割                                                                             | 補足                                                         |
| -------------------- |--------------------------------------------------------------------------------| ------------------------------------------------------------ |
| ALB                  | ENIに紐付けられたパブリックIPアドレスをALBに割り当てられる。                                             |                                                              |
| EC2                  | ENIに紐付けられたパブリックIPアドレスがEC2に割り当てられる。                                             | 参考：https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html#eni-basics |
| Fargate環境のEC2     | 明言されていないため推測ではあるが、ENIに紐付けられたlocalインターフェースが、FargateとしてのEC2インスタンスに紐付けられる。        | Fargate環境のホストがEC2とは明言されていない。<br>参考：https://aws.amazon.com/jp/blogs/news/under-the-hood-fargate-data-plane/ |
| Elastic IP           | ENIにElastic IPアドレスが紐付けられる。このENIを他のAWSリソースに紐付けることにより、ENIを介して、Elastic IPを紐付けられる。 | 参考：https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html#managing-network-interface-ip-addresses |
| GlobalAccelerator    |                                                                                |                                                              |
| NAT Gateway          | ENIに紐付けられたパブリックIPアドレスがNAT Gatewayに割り当てられる。                                     |                                                              |
| RDS                  |                                                                                |                                                              |
| セキュリティグループ | ENIにセキュリティグループが紐付けれる。このENIを他のAWSリソースに紐付けることにより、ENIを介して、セキュリティグループを紐付けられる。      |                                                              |
| VPCエンドポイント    | Interface型のVPCエンドポイントとして機能する。                                                  |                                                              |

<br>

## 01-03. VPCサブネット

### VPCサブネットとは

クラウドプライベートネットワークにおけるセグメントとして働く。

<br>

### サブネットの種類

#### ▼ 分割方法

LAN内の分割方法を参考にし、パブリックサブネットとプライベートサブネットを作成する。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network.html

#### ▼ パブリックサブネットとは

サブネット外からのインバンド通信を受け付けるために、ALBのルーティング先にサブネットを設定すれば、そのサブネットはパブリックサブネットとして機能する。

#### ▼ プライベートサブネットとは

内部サブネットに相当する。サブネット外からのインバンド通信を受け付けないようするために、ALBのルーティング先にサブネットを設定しないようにすれば、そのサブネットはプライベートサブネットとして機能する。ただし、サブネット内からサブネット外へのアウトバウンド通信は許可しても問題なく、その場合はルートテーブルにNAT Gatewayを設定する必要がある。

![public-subnet_private-subnet](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/public-subnet_private-subnet.png)

#### ▼ 作成例

サブネットの役割ごとに作成する方法がある。

| 名前                            | 役割                                    |
| ------------------------------- | --------------------------------------- |
| Public subnet (Frontend Subnet) | NAT Gatewayを配置する。                 |
| Private app subnet              | アプリケーション、Nginxなどを配置する。 |
| Private datastore subnet        | RDS、Redisなどを配置する                |

![subnet-types](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/subnet-types.png)

<br>

## 01-04. Network ACL：Network Access  Control List

### Network ACLとは

サブネットのクラウドパケットフィルタリング型ファイアウォールとして働く。ルートテーブルとサブネットの間に設置され、ルートテーブルよりも先に評価される。双方向のインバウンドルールとアウトバウンドルールを決定する。

![network-acl](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network-acl.png)

<br>

### ACLルール

ルールは上から順に適用される。例えば、インバウンドルールが以下だった場合、ルール100が最初に適用され、サブネットに対する、全IPアドレス（```0.0.0.0/0```）からのインバウンド通信を許可していることになる。

| ルール # | タイプ                | プロトコル | ポート範囲 / ICMP タイプ | ソース    | 許可 / 拒否 |
| -------- | --------------------- | ---------- | ------------------------ | --------- | ----------- |
| 100      | すべての トラフィック | すべて     | すべて                   | 0.0.0.0/0 | ALLOW       |
| *        | すべての トラフィック | すべて     | すべて                   | 0.0.0.0/0 | DENY        |

<br>

## 01-05. ルートテーブル

### ルートテーブルとは

クラウドルーターのマッピングテーブルとして働く。サブネットに紐付けることで、サブネット内からサブネット外に出るアウトバウンド通信のルーティングを制御する。注意点として、Network ACLよりも後に評価される。

参考：https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html#RouteTables

| Destination（送信先のIPの範囲） |                Target                 |
| :-----------------------------: | :-----------------------------------: |
|        ```xx.x.x.x/xx```        | Destinationの範囲内だった場合の送信先 |

<br>

### ルートテーブルの種類

#### ▼ メインルートテーブル

VPCの作成時に自動で作成される。どのルートテーブルにも紐付けられていないサブネットのルーティングを設定する。

#### ▼ カスタムルートテーブル

特定のサブネットのルーティングを設定する。

<br>

### テーブルルール例

![route-table](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/route-table.png)

#### ▼ プライベートサブネットのアウトバウンド通信をパブリックネットワークに公開する場合

上の図中で、サブネット3にはルートテーブル2が紐付けられている。サブネット3内の送信先のプライベートIPアドレスが、```10.0.0.0/16```の範囲内にあれば、インバウンド通信と見なし、local（VPC内の他サブネット）を送信先に選択する。一方で、```0.0.0.0/0```（local以外の全IPアドレス）の範囲内にあれば、アウトバウンド通信と見なし、Internet Gatewayを送信先に選択する。

| Destination（プライベートCIDRブロック） |      Target      |
| :-------------------------------------: | :--------------: |
| ```10.0.0.0/16```（VPCのCIDRブロック）  |      local       |
|             ```0.0.0.0/0```             | Internet Gateway |

#### ▼ プライベートサブネットのアウトバウンド通信をVPC内に閉じる場合

上の図中で、サブネット2にはルートテーブル1が紐付けられている。サブネット2内の送信先のプライベートIPアドレスが、```10.0.0.0/16```の範囲内にあれば、インバウンド通信と見なし、local（VPC内の他サブネット）を送信先に選択する。一方で、範囲外にあれば通信を破棄する。

| Destination（プライベートCIDRブロック） | Target |
| :-------------------------------------: | :----: |
| ```10.0.0.0/16```（VPCのCIDRブロック）  | local  |

#### ▼ プライベートサブネットのアウトバウンド通信を同一サブネット内に閉じる場合

プライベートサブネットでネットワークを完全に閉じる場合、ルートテーブルにサブネットのCIDRブロックを設定する。

参考：https://koejima.com/archives/1950/

|    Destination（プライベートCIDRブロック）     | Target |
| :--------------------------------------------: | :----: |
| ```10.0.0.0/24```（サブネット1のCIDRブロック） | local  |

<br>

## 01-06. VPCエンドポイント

### VPCエンドポイントとは

VPCのプライベートサブネット内のリソースが、VPC外のリソースに対して、アウトバウンド通信を実行できるようにする。Gateway型とInterface型がある。VPCエンドポイントを使用しない場合、プライベートサブネット内からのアウトバウンド通信には、Internet GatewayとNAT Gatewayを使用する必要がある。

**＊例＊**

Fargateをプライベートサブネットに置いた場合、FargateからVPC外にあるAWSリソースに対するアウトバウンド通信のために必要である（例：CloudWatchログ、ECR、S3、Systems Manager）。

![VPCエンドポイント](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCエンドポイント.png)

<br>

### VPCエンドポイントとNAT Gatewayの料金比較

NAT Gatewayの代わりに、VPCエンドポイントを使用すると、料金が少しだけ安くなり、また、VPC外のリソースとの通信がより安全になる。

<br>

### エンドポイントタイプ

#### ▼ Interface型

プライベートリンクともいう。プライベートIPアドレスを持つENIとして機能し、AWSリソースからアウトバウンド通信を受信する。もし、このプライベートIPアドレスにプライベートDNSを紐づける場合は、VPCの```enableDnsHostnames```オプションと```enableDnsSupport```オプションを有効化する必要がある。

参考：https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-support

**＊リソース例＊**

S3、DynamoDB以外の全てのリソース

#### ▼ Gateway型

ルートテーブルにおける定義に従う。VPCエンドポイントとして機能し、AWSリソースからアウトバウンド通信を受信する。

**＊リソース例＊**

S3、DynamoDBのみ

<br>

## 01-07. Internet Gateway、NAT Gateway

### Internet Gateway

#### ▼ Internet Gatewayとは

DNATの機能を持ち、グローバルIPアドレス（VPC外のIPアドレス）をプライベートIPアドレス（VPC内のIPアドレス）に変換する。1つのパブリックIPに対して、1つのプライベートIPを紐付けられる。つまり、VPC内の複数のインスタンスからのアウトバウンド通信を、複数のパブリックIPアドレスで送信する。

参考：

- https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html
- https://milestone-of-se.nesuke.com/sv-advanced/aws/internet-nat-gateway/

DNATについては、以下のリンクを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network_model_tcp.html

![InternetGatewayとNATGateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/InternetGatewayとNATGateway.png)

<br>

### NAT Gateway

#### ▼ NAT Gatewayとは

SNATの機能を持ち、プライベートIPアドレス（VPC内のIPアドレス）をグローバルIPアドレス（VPC外のIPアドレス）に変換する。1つのパブリックIPに対して、複数のプライベートIPを紐付けられる。つまり、VPC内の複数のインスタンスからのアウトバウンド通信を、1つのパブリックIPアドレスで送信する。この時のパブリックIPとして、Elastic IPをNAT Gatewayに割り当てる必要がある。

参考：

- https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html#nat-gateway-basics
- https://milestone-of-se.nesuke.com/sv-advanced/aws/internet-nat-gateway/

SNATについては、以下のリンクを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network_model_tcp.html

![InternetGatewayとNATGateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/InternetGatewayとNATGateway.png)

<br>

## 01-08. VPC間、VPC-オンプレ間の通信

### VPCピアリング接続

![VPCピアリング接続](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCピアリング接続.png)

#### ▼ VPCピアリング接続とは

『一対一』の関係で、『異なるVPC間』の双方向通信を可能にする。

#### ▼ VPCピアリング接続の可否

| アカウント  | VPCのあるリージョン | VPC内のCIDRブロック   | 接続の可否 |
| ----------- | ------------------- | --------------------- | ---------- |
| 同じ/異なる | 同じ/異なる         | 全て異なる            | **〇**     |
|             |                     | 同じものが1つでもある | ✕          |

VPC に複数の IPv4 CIDRブロック ブロックがあり、1つでも 同じCIDRブロック ブロックがある場合は、VPC ピアリング接続はできない。

![VPCピアリング接続不可の場合-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCピアリング接続不可の場合-1.png)

たとえ、IPv6が異なっていても、同様である。

![VPCピアリング接続不可の場合-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCピアリング接続不可の場合-2.png)

<br>

### VPCエンドポイントサービス

#### ▼ VPCエンドポイントサービスとは

VPCエンドポイントとは異なる機能なので注意。Interface型のVPCエンドポイント（プライベートリンク）をNLBに紐付けることにより、『一対多』の関係で、『異なるVPC間』の双方向通信を可能にする。エンドポイントのサービス名は、『``` com.amazonaws.vpce.ap-northeast-1.vpce-svc-*****```』になる。API GatewayのVPCリンクは、VPCエンドポイントサービスに相当する。

![vpc-endpoint-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/vpc-endpoint-service.png)

<br>

### Transit Gateway

#### ▼ Transit Gatewayとは

『多対多』の関係で、『異なるVPC間』や『オンプレ-VPC間』の双方向通信を可能にする。クラウドルーターとして働く。

![transit-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/transit-gateway.png)

<br>

### 各サービスとの比較

| 機能                                          | VPCピアリング接続 | VPCエンドポイントサービス           | Transit gateway        |
| --------------------------------------------- | ----------------- | ----------------------------------- | ---------------------- |
| 通信できるVPC数                               | 一対一            | 一対一、一対多                      | 一対一、一対多、多対多 |
| 通信できるIPアドレスの種類                    | IPv4、IPv6        | IPv4                                | IPv4、IPv6             |
| 接続できるリソース                            | 制限なし          | NLBでルーティングできるリソースのみ | 制限なし               |
| CIDRブロックがVPC間で被ることによる通信の可否 | ✖︎                 | ⭕                                   | ✖︎                      |
| クロスアカウント                              | ⭕                 | ⭕                                   | ⭕                      |
| クロスリージョン                              | ⭕                 | ✖︎                                   | ⭕                      |
| VPC間                                         | ⭕                 | ⭕                                   | ⭕                      |
| VPC-オンプレ間                                | ✖︎                 | ✖︎                                   | ⭕                      |

<br>

## 02. WAF：Web Application Firewall

### セットアップ

定義できるルール数や文字数に制限がある。以下のリンクを参考にせよ。

参考：https://docs.aws.amazon.com/waf/latest/developerguide/limits.html

| 設定項目                          | 説明                                                         | 補足                                                         |
| --------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Web ACLs：Web Access Control List | 各トリガーと許可/拒否アクションの紐付けを『ルール』とし、これをセットで設定する。 | アタッチするAWSリソースに合わせて、リージョンが異なる。      |
| IP sets                           | アクション実行のトリガーとなるIPアドレス                     | ・許可するIPアドレスは、意味合いに沿って異なるセットとして作成するべき。例えば、社内IPアドレスセット、協力会社IPアドレスセット、など<br>・拒否するIPアドレスはひとまとめにしても良い。 |
| Regex pattern sets                | アクション実行のトリガーとなるURLパスの文字列                | ・許可/拒否する文字列は、意味合いに沿って異なる文字列セットとして作成するべき。例えば、ユーザーエージェントセット、リクエストパスセット、など |
| Rule groups                       |                                                              |                                                              |
| AWS Markets                       |                                                              |                                                              |

<br>

### AWSリソース vs. サイバー攻撃

| サイバー攻撃の種類 | 対抗するAWSリソースの種類                                    |
| ------------------ | ------------------------------------------------------------ |
| マルウェア         | なし                                                         |
| 傍受、盗聴         | VPC内の特にプライベートサブネット間のピアリング接続。VPC外を介さずにデータを送受信できる。 |
| ポートスキャン     | セキュリティグループ                                         |
| DDoS               | Shield                                                       |
| ゼロディ           | WAF                                                          |
| インジェクション   | WAF                                                          |
| XSS                | WAF                                                          |
| データ漏洩         | KMS、CloudHSM                                                |
| 組織内部での裏切り | IAM                                                          |

<br>

### セットアップ

| 設定項目           | 説明                                              | 補足                                                         |
| ------------------ | ------------------------------------------------- | ------------------------------------------------------------ |
| Web ACLs           | アクセス許可と拒否のルールを定義する。            |                                                              |
| Bot Control        | Botに関するアクセス許可と拒否のルールを定義する。 |                                                              |
| IP Sets            | IPアドレスの共通部品を管理する。                  | アクセスを許可したいIPアドレスセットを作成する時、全てのIPアドレスを1つのセットで管理してしまうと、何のIPアドレスかわらなあくなってしまう。そこで、許可するIPアドレスのセットを種類（自社、外部のA社/B社、など）で分割すると良い。 |
| Regex pattern sets | 正規表現パターンの共通部品を管理する。            |                                                              |
| Rule groups        | ルールの共通部品を管理する。                      | 各WAFに同じルールを設定する場合、ルールグループを使用するべきである。ただし、ルールグループを使用すると、これらのルールを共通のメトリクスで監視しなければならなくなる。そのため、もしメトリクスを分けるのであれば、ルールグループを使用しないようにする。 |

### Web ACLs

| 設定項目                 | 説明                                                         | 補足                                                         |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Overview                 | WAFによって許可/拒否されたリクエストのアクセスログを確認できる。 |                                                              |
| Rules                    | 順番にルールを判定し、一致するルールがあればアクションを実行する。この時、一致するルールの後にあるルールは。判定されない。 | AWSマネージドルールについては、以下のリンクを参考にせよ。<br>参考：https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-list.html |
| Associated AWS resources | WAFをアタッチするAWSリソースを設定する。                     | CloudFront、ALBなどにアタッチできる。                        |
| Logging and metrics      | アクセスログをKinesis Data Firehoseに出力するように設定する。 |                                                              |

### OverviewにおけるSampled requestsの見方

『全てのルール』または『個別のルール』におけるアクセス許可/拒否の履歴を確認できる。ALBやCloudFrontのアクセスログよりも解りやすく、様々なデバッグに役立つ。ただし、３時間分しか残らない。一例として、CloudFrontにアタッチしたWAFで取得できるログを以下に示す。

```http
GET /foo/
# ホスト
Host: example.jp
Upgrade-Insecure-Requests: 1
# ユーザーエージェント
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
# CORSであるか否か
Sec-Fetch-Site: same-origin
Accept-Encoding: gzip, deflate, br
Accept-Language: ja,en;q=0.9
# Cookieヘッダー
Cookie: sessionid=<セッションID>; _gid=<GoogleAnalytics値>; __ulfpc=<GoogleAnalytics値>; _ga=<GoogleAnalytics値>
```

<br>

### ルール

#### ▼ ルールの種類

参考：https://docs.aws.amazon.com/waf/latest/developerguide/classic-web-acl-rules-creating.html

| ルール名     | 説明                                                         |
| ------------ | ------------------------------------------------------------ |
| レートベース | 同じ送信元IPアドレスからの５分間当たりのリクエスト数制限をルールに付与する。 |
| レギュラー   | リクエスト数は制限しない。                                   |

#### ▼ ルールの粒度のコツ

わかりやすさの観点から、できる限り設定するステートメントを少なくし、1つのルールに1つの意味合いだけを持たせるように命名する。

#### ▼ Count（検知）モード

ルールに該当するリクエスト数を数え、許可/拒否せずに次のルールを検証する。計測結果に応じて、Countモードを無効化し、拒否できるようにする。

参考：https://oji-cloud.net/2020/09/18/post-5501/

#### ▼ ルールグループアクションの上書き

ルールのCountモードが有効になっている場合、Countアクションに続けて、そのルールの元のアクションを実行する。そのため、Countアクションしつつ、Blockアクションを実行できる（仕様がややこしすぎるので、なんとかしてほしい）。

参考：https://docs.aws.amazon.com/waf/latest/developerguide/web-acl-rule-group-override-options.html

| マネージドルールの元のアクション | Countモード | 上書きオプション | 結果                                                         |
| -------------------------------- | ----------- | ---------------- | ------------------------------------------------------------ |
| Block                            | ON          | ON               | Countし、その後Blockが実行する。そのため、その後のルールは検証せずに終了する。 |
| Block                            | ON          | OFF              | Countのみが実行される。そのため、その後のルールも検証する。  |
| Block                            | OFF         | ON               | そもそもCountモードが無効なため、上書きオプションは機能せずに、Blockが実行される。 |
| Block                            | OFF         | OFF              | そもそもCountモードが無効なため、マネージドルールのBlockが実行される（と思っていたが、結果としてCountとして機能する模様）。 |

#### ▼ セキュリティグループとの関係

WAFを紐付けられるリソースにセキュリティグループも紐づけている場合、セキュリティグループのルールが先に検証される。例えば、WAFをALBに紐づけ、かつALBのセキュリティグループにHTTPSプロトコルのルールを設定した場合、後者が先に検証される。両方にルールが定義されてると混乱を生むため、HTTPプロトコルやHTTPSプロトコルに関するルールはWAFに定義し、それ以外のプロトコルに関するルールはセキュリティグループで定義するようにしておく。

参考：https://dev.classmethod.jp/articles/waf-alb_evaluation-sequence/

<br>

### マネージドルールを使用するかどうかの判断基準

#### ▼ マネージドルールの動作確認の必要性

マネージドルールを導入する時は、事前にルールのカウント機能を使用することが推奨されている。カウントで検知されたリクエストのほとんどが悪意のないものであれば、設定したマネージドルールの使用をやめる必要がある。

#### ▼ ブラウザを送信元とした場合

ブラウザを送信元とした場合、リクエストのヘッダーやボディはブラウザによって生成されるため、これに基づいた判断が必要である。

- ブラウザからのリクエスト自体が悪意判定されているかどうか
- サイトのURLの記法によって、悪意判定されているかどうか
- 送信元の国名が『日本』であるのにも関わらず、悪意判定されているかどうか
- サイトに送信された全リクエストのうち、カウントで検知されたリクエスト数が多すぎないかどうか

#### ▼ 連携するアプリケーションを送信元とした場合

アプリケーションを送信元とした場合、リクエストのヘッダーやボディは連携するアプリケーションによって生成されるため、これに基づいた判断が必要である。

<br>

### ルールの例

#### ▼ ユーザーエージェント拒否

**＊例＊**

悪意のあるユーザーエージェントを拒否する。

ルール：```block-user-agents```

| Statementの順番 | If a request  | Inspect        | Match type                                   | Regex pattern set | Then  | 挙動                                                         |
| --------------- | ------------- | -------------- | -------------------------------------------- | ----------------- | ----- | ------------------------------------------------------------ |
| ```0```         | ```matches``` | ```URI path``` | ```Matches pattern from regex pattern set``` | 文字列セット      | Block | 指定した文字列を含むユーザーエージェントの場合、アクセスすることを拒否する。 |

| Default Action | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| Allow          | 指定したユーザーエージェントでない場合、全てのパスにアクセスすることを許可する。 |

#### ▼ CI/CDツールのアクセスを許可

**＊例＊**

社内の送信元IPアドレスのみ許可した状態で、CircleCIなどのサービスが社内サービスにアクセスできるようにする。

ルール：```allow-request-including-access-token```

| Statementの順番 | If a request  | Inspect      | Header field name   | Match type                    | String to match                                     | Then  | 挙動                                                         |
| --------------- | ------------- | ------------ | ------------------- | ----------------------------- | --------------------------------------------------- | ----- | ------------------------------------------------------------ |
| ```0```         | ```matches``` | ```Header``` | ```authorization``` | ```Exactly matched  string``` | 『```Bearer <トークン文字列>```』で文字列を設定する | Allow | authorizationヘッダーに指定した文字列を含むリクエストの場合、アクセスすることを拒否する。 |

| Default Action | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| Block          | 正しいトークンを持たないアクセスの場合、全てのパスにアクセスすることを拒否する。 |

#### ▼ 特定のパスを社内アクセスに限定

**＊例＊**

アプリケーションでは、特定のURLパスにアクセスできる送信元IPアドレスを社内だけに制限する。2つのルールを作成する必要がある。

ルール：```allow-access--to-url-path```

| Statementの順番 | If a request        | Inspect                                | IP set       | Match type                                   | Regex pattern set | Then  | 挙動                                                         |
| --------------- | ------------------- | -------------------------------------- | ------------ | -------------------------------------------- | ----------------- | ----- | ------------------------------------------------------------ |
| ```0```         | ```matches (AND)``` | ```Originates from an IP address in``` | 社内IPセット | -                                            | -                 | -     | 社内の送信元IPアドレスの場合、指定したパスにアクセスすることを許可する。 |
| ```1```         | ```matches```       | ```URI path```                         | -            | ```Matches pattern from regex pattern set``` | 文字列セット      | Allow | 0番目かつ、指定した文字列を含むURLパスアクセスの場合、アクセスすることを許可する。 |

ルール：```block-access-to-url-path```

| Statementの順番 | If a request  | Inspect        | Match type                                   | Regex pattern set | Then  | 挙動                                                         |
| --------------- | ------------- | -------------- | -------------------------------------------- | ----------------- | ----- | ------------------------------------------------------------ |
| ```0```         | ```matches``` | ```URI path``` | ```Matches pattern from regex pattern set``` | 文字列セット      | Block | 指定した文字列を含むURLパスアクセスの場合、アクセスすることを拒否する。 |

| Default Action | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| Allow          | 指定したURLパス以外のアクセスの場合、そのパスにアクセスすることを許可する。 |

#### ▼ 社内アクセスに限定

**＊例＊**

アプリケーション全体にアクセスできる送信元IPアドレスを、特定のIPアドレスだけに制限する。

ルール：```allow-global-ip-addresses```

| Statementの順番 | If a request        | Inspect                                | IP set           | Originating address | Then  | 挙動                                                         |
| --------------- | ------------------- | -------------------------------------- | ---------------- | ------------------- | ----- | ------------------------------------------------------------ |
| ```0```         | ```matches  (OR)``` | ```Originates from an IP address in``` | 社内IPセット     | Source IP address   | -     | 社内の送信元IPアドレスの場合、全てのパスにアクセスすることを許可する。 |
| ```1```         | ```matches```       | ```Originates from an IP address in``` | 協力会社IPセット | Source IP address   | Allow | 0番目あるいは、協力会社の送信元IPアドレスの場合、全てのパスにアクセスすることを許可する。 |

| Default Action | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| Block          | 指定した送信元IPアドレス以外の場合、全てのパスにアクセスすることを拒否する。 |

#### ▼ ALBを直接的に指定することを防ぐ

**＊例＊**

Route53のドメイン経由ではなく、ALBの直接的に指定して、リクエストとを送信することを防ぐ。ALBのIPアドレスは定期的に変化するため、任意のIPアドレスを指定できる正規表現を定義する必要がある。

```
^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$
```

ルール：```block-direct-access-to-lb```

| Statementの順番 | If a request  | Inspect      | Match type                                   | Regex pattern set | Then  | 挙動                                                         |
| --------------- | ------------- | ------------ | -------------------------------------------- | ----------------- | ----- | ------------------------------------------------------------ |
| ```0```         | ```matches``` | ```Header``` | ```Matches pattern from regex pattern set``` | 文字列セット      | Block | 指定した```Host```ヘッダーに対するアクセスの場合、アクセスすることを拒否する。 |

| Default Action | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| Allow          | 指定した```Host```ヘッダー以外に対するアクセスの場合、アクセスすることを許可する。 |

<br>

### ログ

#### ▼ マネージドルールのログ

WAFマネージドルールを使用している場合、マネージドルールが```ruleGroupList```キーに配列として格納されている。もし、Countアクションが実行されていれば、```excludedRules```キーにその旨とルールIDが格納される。

```yaml
{

  # ～ 中略 ～

  "ruleGroupList": [
    {
      "ruleGroupId": "AWS#AWSManagedRulesCommonRuleSet#Version_1.2",
      "terminatingRule": null,
      "nonTerminatingMatchingRules": [],
      "excludedRules": [
        {
          "exclusionType": "EXCLUDED_AS_COUNT",
          "ruleId": "NoUserAgent_HEADER"
        }
      ]
    },
    {
      "ruleGroupId": "AWS#AWSManagedRulesSQLiRuleSet#Version_1.1",
      "terminatingRule": null,
      "nonTerminatingMatchingRules": [],
      "excludedRules": null
    },
    {
      "ruleGroupId": "AWS#AWSManagedRulesPHPRuleSet#Version_1.1",
      "terminatingRule": null,
      "nonTerminatingMatchingRules": [],
      "excludedRules": null
    },
    {
      "ruleGroupId": "AWS#AWSManagedRulesKnownBadInputsRuleSet#Version_1.1",
      "terminatingRule": null,
      "nonTerminatingMatchingRules": [],
      "excludedRules": null
    }
  ],

  # ～ 中略 ～

}
```

<br>

## 02. WorkMail

### WorkMailとは

Gmail、サンダーバード、Yahooメールなどと同類のメール管理アプリケーション。

<br>

### セットアップ

| 設定項目             | 説明                                                       | 補足                                                         |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| Users                | WorkMailで管理するユーザーを設定する。                     |                                                              |
| Domains              | ユーザーに割り当てるメールアドレスのドメイン名を設定する。 | ```@{組織名}.awsapps.com```をドメイン名としてもらえる。ドメイン名の検証が完了した独自ドメイン名を設定もできる。 |
| Access Control rules | 受信するメール、受信を遮断するメール、の条件を設定する。   |                                                              |

<br>

## 03. ロードテスト

### Distributed Load Testing（分散ロードテスト）

#### ▼ 分散ロードテストとは

ロードテストを実行できる。CloudFormationで作成でき、ECS Fargateを使用して、ユーザーからのリクエストを擬似的に再現できる。

参考：https://d1.awsstatic.com/Solutions/ja_JP/distributed-load-testing-on-aws.pdf

#### ▼ インフラ構成

![distributed_load_testing](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/distributed_load_testing.png)

<br>

## 04. タグ

### タグ付け戦略

#### ▼ よくあるタグ

| タグ名      | 用途                                                         |
| ----------- | ------------------------------------------------------------ |
| Name        | リソース自体に名前を付けられない場合、代わりにタグで名付けるため。 |
| Environment | 同じAWS環境内に異なる実行環境が存在している場合、それらを区別するため。 |
| User        | 同じAWS環境内にリソース別に所有者が存在している場合、それらを区別するため。 |

#### ▼ タグ付けによる検索

AWSの各リソースには、タグをつけられる。例えば、AWSコストエクスプローラーにて、このタグで検索することにより、任意のタグが付いたリソースの請求合計額を確認できる。

<br>
