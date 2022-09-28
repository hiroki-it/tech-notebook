---
title: 【IT技術の知見】AWS：Amazon Web Service
description: AWS：Amazon Web Serviceの知見を記録しています。
---

# AWS：Amazon Web Service（V〜Z）

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. VPC：Virtual Private Cloud

### VPCとは

クラウドプライベートネットワークとして働く。プライベートIPアドレスが割り当てられた、VPCと呼ばれるプライベートネットワークを仮想的に作成できる。異なるAZに渡ってEC2を立ち上げることによって、クラウドサーバーをデュアル化できる。VPCのパケット通信の仕組みについては、以下のリンクを参考にせよ。

> ℹ️ 参考：https://pages.awscloud.com/rs/112-TZM-766/images/AWS-08_AWS_Summit_Online_2020_NET01.pdf

![VPCが提供できるネットワークの範囲](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCが提供できるネットワークの範囲.png)

<br>

### VPC内のIPアドレス

#### ▼ IPアドレスの種類

> ℹ️ 参考：
>
> - https://awsjp.com/AWS/hikaku/Elastic-IP_Public-IP-hikaku.html
> - https://qiita.com/masato930/items/ba242f0171a76ce0994f

| IPアドレスの種類       | 手動/自動 | グローバル/プライベート | 特徴           | 説明                                                         |
| ---------------------- | --------- | ----------------------- | -------------- | ------------------------------------------------------------ |
| パブリックIPアドレス   | 自動      | グローバル              | 動的IPアドレス | 動的なIPアドレスのため、インスタンスを再作成すると変化する。 |
| プライベートIPアドレス | 自動/手動 | プライベート            | 動的IPアドレス | 動的なIPアドレスのため、インスタンスを再作成すると変化する。 |
| Elastic IP             | 手動      | グローバル              | 静的IPアドレス | 静的なIPアドレスのため、インスタンスを再作成しても保持される。 |

#### ▼ DNS名の割り当て

VPC内で作成されたインスタンスにはパブリックIPアドレスが自動的に割り当てられるが、IPアドレスにマッピングされたDNS名を持たない。```enableDnsHostnames```オプションと```enableDnsSupport```オプションと有効化すると、インスタンスにDNS名が割り当てられるようになる。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-support
> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-updating

#### ▼ 紐付け

| 紐付け名      | 補足                                                         |
| ------------- | ------------------------------------------------------------ |
| EC2との紐付け | 非推奨の方法である。<br>ℹ️ 参考：https://docs.aws.amazon.com/vpc/latest/userguide/vpc-eips.html#vpc-eip-overview |
| ENIとの紐付け | 推奨される方法である。<br>ℹ️ 参考：https://docs.aws.amazon.com/vpc/latest/userguide/vpc-eips.html#vpc-eip-overview |

<br>

## 01-02. ENI：Elastic Network Interface

### ENIとは

クラウドネットワークインターフェースとして働く。対象のAWSリソースに、自身に紐づけられたIPアドレスを割り当てる。物理ネットワークにおけるNICについては以下のリンクを参考にせよ。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network_model_tcp.html

<br>

### セットアップ

#### ▼ 割り当てられるIPアドレス数

| IPアドレス（IPv4）の種類   | 説明                                                                                                                      |
|-------------|-------------------------------------------------------------------------------------------------------------------------|
| パブリック | ENIには、パブリックIPアドレスを割り当てられる。これらが割り当てられたENIをAWSリソースに紐づければ、そのAWSリソースに```1```個のパブリックIPアドレスを追加できる。                            |
| プライベート      | ENIには、プライマリープライベートIPアドレスとセカンダリープライベートIPアドレスを割り当てられる。これらが割り当てられたENIをAWSリソースに紐づければ、そのAWSリソースに```2```個のプライベートIPアドレスを追加できる。 |

#### ▼ 紐付けられるリソース

| リソースの種類       | 役割                                                                             | 補足                                                                                                               |
| -------------------- |--------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| ALB                  | ENIに紐付けられたIPアドレスを、ALBに割り当てる。                                                   |                                              |
| EC2                  | ENIに紐付けられたIPアドレスを、EC2に割り当てる。                                                   | ℹ️ 参考：https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html#eni-basics                              |
| Fargate環境のEC2     | 明言されていないため推測ではあるが、ENIに紐付けられたlocalインターフェースが、FargateとしてのEC2インスタンスに紐付けられる。        | Fargate環境のホストがEC2とは明言されていない。<br>ℹ️ 参考：https://aws.amazon.com/jp/blogs/news/under-the-hood-fargate-data-plane/    |
| Elastic IP           | ENIにElastic IPアドレスが紐付けられる。このENIを他のAWSリソースに紐付けることにより、ENIを介して、Elastic IPを紐付けられる。 | ℹ️ 参考：https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html#managing-network-interface-ip-addresses |
| GlobalAccelerator    |                                                                                |                                                                                                                  |
| NAT Gateway          | ENIに紐付けられたパブリックIPアドレスを、NAT Gatewayに割り当てる。                                      |                                                                                                                  |
| RDS                  |                                                                                |                                                                                                                  |
| セキュリティグループ | ENIにセキュリティグループが紐付けれる。このENIを他のAWSリソースに紐付けることにより、ENIを介して、セキュリティグループを紐付けられる。      |                                                                                                                  |
| VPCエンドポイント    | Interface型のVPCエンドポイントとして動作する。                                                  |                                                                                                                  |

<br>

### VPCトラフィックミラーリング

![vpc_traffic-mirroring](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/vpc_traffic-mirroring.png)

ENIを介して、同じVPC内のインスタンスなどに、パケットのコピーを送信する。VPCエンドポイントを経由すれば異なるVPCに送信することもできる。

> ℹ️ 参考：
>
> - https://dev.classmethod.jp/articles/how-to-capture-packets-outside-ec2-with-vpc-traffic-mirroring/
> - https://dev.classmethod.jp/articles/amazon-vpc-traffic-mirroring-supports-sending-mirrored-traffic-gateway-load-balancer/

<br>

## 01-03. VPCサブネット

### VPCサブネットとは

クラウドプライベートネットワークにおけるセグメントとして働く。

<br>

### サブネットの種類

#### ▼ パブリックサブネットとは

LAN内の非武装地帯に相当する。

#### ▼ プライベートサブネットとは

LAN内の内部ネットワークに相当する。サブネット外からのインバンド通信を受け付けないようするために、ALBのルーティング先にサブネットを設定しないようにすれば、そのサブネットはプライベートサブネットとして動作する。ただし、サブネット内からサブネット外へのアウトバウンド通信は許可しても問題なく、その場合はルートテーブルにNAT Gatewayを設定する必要がある。

![public-subnet_private-subnet](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/public-subnet_private-subnet.png)

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

クラウドルーターのマッピングテーブルとして働く。サブネットに紐付けることにより、サブネット内からサブネット外に出るアウトバウンド通信のルーティングを制御する。注意点として、Network ACLよりも後に評価される。

> ℹ️ 参考：https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html#RouteTables

| Destination（宛先のIPの範囲） |                Target                 |
|:----------------------:| :-----------------------------------: |
|    ```*.*.*.*/*```     | Destinationの範囲内だった場合の宛先 |

<br>

### ルートテーブルの種類

#### ▼ メインルートテーブル

VPCの作成時に自動的に作成される。どのルートテーブルにも紐付けられていないサブネットのルーティングを設定する。

#### ▼ カスタムルートテーブル

特定のサブネットのルーティングを設定する。

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

プライベートリンクともいう。プライベートIPアドレスを持つENIとして動作し、AWSリソースからアウトバウンド通信を受信する。もし、このプライベートIPアドレスにプライベートDNSを紐づける場合は、VPCの```enableDnsHostnames```オプションと```enableDnsSupport```オプションを有効化する必要がある。

> ℹ️ 参考：https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html#vpc-dns-support

**＊リソース例＊**

S3、DynamoDB以外の全てのリソース

#### ▼ Gateway型

ルートテーブルにおける定義に従う。VPCエンドポイントとして動作し、AWSリソースからアウトバウンド通信を受信する。

**＊リソース例＊**

S3、DynamoDBのみ

<br>

## 01-07. Internet Gateway、NAT Gateway

### Internet Gateway

#### ▼ Internet Gatewayとは

DNATの能力を持ち、グローバルIPアドレス（VPC外のIPアドレス）をプライベートIPアドレス（VPC内のIPアドレス）に変換する。```1```個のパブリックIPに対して、```1```個のプライベートIPを紐付けられる。つまり、VPC内の複数のインスタンスからのアウトバウンド通信を、複数のパブリックIPアドレスで送信する。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html
> - https://milestone-of-se.nesuke.com/sv-advanced/aws/internet-nat-gateway/

DNATについては、以下のリンクを参考にせよ。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network_model_tcp.html

![InternetGatewayとNATGateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/InternetGatewayとNATGateway.png)

<br>

### NAT Gateway

#### ▼ NAT Gatewayとは

SNATの能力を持ち、プライベートIPアドレス（VPC内のIPアドレス）をグローバルIPアドレス（VPC外のIPアドレス）に変換する。```1```個のパブリックIPに対して、複数のプライベートIPを紐付けられる。つまり、VPC内の複数のインスタンスからのアウトバウンド通信を、```1```個のパブリックIPアドレスで送信する。この時のパブリックIPとして、Elastic IPをNAT Gatewayに割り当てる必要がある。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html#nat-gateway-basics
> - https://milestone-of-se.nesuke.com/sv-advanced/aws/internet-nat-gateway/

SNATについては、以下のリンクを参考にせよ。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network_model_tcp.html

![InternetGatewayとNATGateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/InternetGatewayとNATGateway.png)

<br>

## 01-08. VPC間、VPC-オンプレミス間の通信

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

VPCエンドポイントとは異なる能力なので注意。Interface型のVPCエンドポイント（プライベートリンク）をNLBに紐付けることにより、『一対多』の関係で、『異なるVPC間』の双方向通信を可能にする。エンドポイントのサービス名は、『```com.amazonaws.vpce.ap-northeast-1.vpce-svc-*****```』になる。API GatewayのVPCリンクは、VPCエンドポイントサービスに相当する。

![vpc-endpoint-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/vpc-endpoint-service.png)

<br>

### Transit Gateway

#### ▼ Transit Gatewayとは

『多対多』の関係で、『異なるVPC間』や『オンプレミス-VPC間』の双方向通信を可能にする。クラウドルーターとして働く。

![transit-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/transit-gateway.png)

<br>

### 各サービスの比較

| 能力                         | VPCピアリング接続 | VPCエンドポイントサービス           | Transit gateway        |
|----------------------------| :-----------------: | :-----------------------------------: | :----------------------: |
| 通信できるVPC数                  | 一対一            | 一対一、一対多                      | 一対一、一対多、多対多 |
| 通信できるIPアドレスの種類             | IPv4、IPv6        | IPv4                                | IPv4、IPv6             |
| 通信できるリソース                  | 制限なし          | NLBでルーティングできるリソースのみ | 制限なし               |
| CIDRブロックがVPC間で被ることによる通信の可否 | ×︎                 | ⭕                                   | ×︎                      |
| クロスアカウント                   | ⭕                 | ⭕                                   | ⭕                      |
| クロスリージョン                   | ⭕                 | ×︎                                   | ⭕                      |
| VPC間                       | ⭕                 | ⭕                                   | ⭕                      |
| VPC-オンプレミス間                | ×︎                 | ×︎                                   | ⭕                      |

<br>

## 02. WAF：Web Application Firewall

### セットアップ

定義できるルール数や文字数に制限がある。以下のリンクを参考にせよ。

> ℹ️ 参考：https://docs.aws.amazon.com/waf/latest/developerguide/limits.html

| 設定項目                          | 説明                                                         | 補足                                                         |
| --------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Web ACLs：Web Access Control List | 各トリガーと許可/拒否アクションの紐付けを『ルール』とし、これをセットで設定する。 | 紐付けるAWSリソースに合わせて、リージョンが異なる。      |
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
| IP Sets            | IPアドレスの共通部品を管理する。                  | アクセスを許可したいIPアドレスセットを作成する時、全てのIPアドレスを```1```個のセットで管理してしまうと、何のIPアドレスかわらなあくなってしまう。そこで、許可するIPアドレスのセットを種類（例：自社、外部のA社/B社、など）で分割すると良い。 |
| Regex pattern sets | 正規表現パターンの共通部品を管理する。            |                                                              |
| Rule groups        | ルールの共通部品を管理する。                      | 各WAFに同じルールを設定する場合、ルールグループを使用するべきである。ただし、ルールグループを使用すると、これらのルールを共通のメトリクスで監視しなければならなくなる。そのため、もしメトリクスを分けるのであれば、ルールグループを使用しないようにする。 |

<br>

### Web ACLs

| 設定項目                 | 説明                                                         | 補足                                                         |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Overview                 | WAFによって許可/拒否されたリクエストのアクセスログを確認できる。 |                                                              |
| Rules                    | 順番にルールを判定し、一致するルールがあればアクションを実行する。この時、一致するルールの後にあるルールは。判定されない。 | AWSマネージドルールについては、以下のリンクを参考にせよ。<br>ℹ️ 参考：https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-list.html |
| Associated AWS resources | WAFを紐付けるAWSリソースを設定する。                     | CloudFront、ALBなどに紐付けできる。                        |
| Logging and metrics      | アクセスログをKinesis Data Firehoseに出力するように設定する。 |                                                              |

### OverviewにおけるSampled requestsの見方

『全てのルール』または『個別のルール』におけるアクセス許可/拒否の履歴を確認できる。ALBやCloudFrontのアクセスログよりも解りやすく、様々なデバッグに役立つ。ただし、３時間分しか残らない。一例として、CloudFrontに紐付けしたWAFで取得できるログを以下に示す。

```yaml
GET /foo/
---
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

> ℹ️ 参考：https://docs.aws.amazon.com/waf/latest/developerguide/classic-web-acl-rules-creating.html

| ルール名     | 説明                                                         |
| ------------ | ------------------------------------------------------------ |
| レートベース | 同じ送信元IPアドレスからの５分間当たりのリクエスト数制限をルールに付与する。 |
| レギュラー   | リクエスト数は制限しない。                                   |

#### ▼ ルールの粒度のコツ

わかりやすさの観点から、できる限り設定するステートメントを少なくし、```1```個のルールに```1```個の意味合いだけを持たせるように命名する。

#### ▼ Count（検知）モード

ルールに該当するリクエスト数を数え、許可/拒否せずに次のルールを検証する。計測結果に応じて、Countモードを無効化し、拒否できるようにする。

> ℹ️ 参考：https://oji-cloud.net/2020/09/18/post-5501/

#### ▼ ルールグループアクションの上書き

ルールのCountモードが有効になっている場合、Countアクションに続けて、そのルールの元のアクションを実行する。そのため、Countアクションしつつ、Blockアクションを実行できる（仕様がややこしすぎるので、なんとかしてほしい）。

> ℹ️ 参考：https://docs.aws.amazon.com/waf/latest/developerguide/web-acl-rule-group-override-options.html

| マネージドルールの元のアクション | Countモード | 上書きオプション | 結果                                                                    |
| -------------------------------- | ----------- | ---------------- |-----------------------------------------------------------------------|
| Block                            | ON          | ON               | Countし、その後Blockが実行する。そのため、その後のルールは検証せずに完了する。                          |
| Block                            | ON          | OFF              | Countのみが実行される。そのため、その後のルールも検証する。                                      |
| Block                            | OFF         | ON               | そもそもCountモードが無効なため、上書きオプションは能力せずに、Blockが実行される。                        |
| Block                            | OFF         | OFF              | そもそもCountモードが無効なため、マネージドルールのBlockが実行される（と思っていたが、結果としてCountとして動作する模様）。 |

#### ▼ セキュリティグループとの関係

WAFを紐付けられるリソースにセキュリティグループも紐づけている場合、セキュリティグループのルールが先に検証される。例えば、WAFをALBに紐づけ、かつALBのセキュリティグループにHTTPSプロトコルのルールを設定した場合、後者が先に検証される。両方にルールが定義されてると混乱を生むため、HTTPプロトコルやHTTPSプロトコルに関するルールはWAFに定義し、それ以外のプロトコルに関するルールはセキュリティグループで定義するようにしておく。

> ℹ️ 参考：https://dev.classmethod.jp/articles/waf-alb_evaluation-sequence/

<br>

### ログ

#### ▼ マネージドルールのログ

WAFマネージドルールを採用している場合、マネージドルールが```ruleGroupList```キーに配列として格納されている。もし、Countアクションが実行されていれば、```excludedRules```キーにその旨とルールIDが格納される。

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

ロードテストを実施できる。CloudFormationで作成でき、ECS Fargateを使用して、ユーザーからのリクエストを擬似的に再現できる。

> ℹ️ 参考：https://d1.awsstatic.com/Solutions/ja_JP/distributed-load-testing-on-aws.pdf

#### ▼ インフラ構成

![distributed_load_testing](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/distributed_load_testing.png)

<br>

## 04. タグ

### タグ付け戦略

#### ▼ よくあるタグ

| タグ名      | 用途                                                         | 例                             |
| ----------- | ------------------------------------------------------------ | ------------------------------ |
| Environment | 同じAWSアカウント内に異なる実行環境が存在している場合、それらを区別するために、実行環境名を設定する。 | ```prd```                      |
| Name        | リソース自体に名前を付けられない場合、代わりにタグによる名前を設定する。 | ```prd-foo-instance```         |
| ManagedBy   | クラウドプロビジョニングツールを使用してAWSリソースを作成している場合、そのツール名を設定する。 | ```terraform```                |
| Repository  | クラウドプロビジョニングツールを使用してAWSリソースを作成している場合、ツールの実装を管理しているリポジトリのURLを設定する。 | ```https://github.com/*****``` |
| Service     | 同じAWSアカウント内に複数のプロダクトが存在している場合、そのプロダクト名を設定する。 | ```foo```                      |
| User        | 同じAWSアカウント内に複数のリソース使用者が存在している場合、それらを区別できるように、使用者名を設定する。 | ```hiroki-hasegawa```          |

#### ▼ タグ付けによる検索

AWSの各リソースには、タグをつけられる。例えば、AWSコストエクスプローラーにて、このタグで検索することにより、任意のタグが付いたリソースの請求合計額を確認できる。

<br>
