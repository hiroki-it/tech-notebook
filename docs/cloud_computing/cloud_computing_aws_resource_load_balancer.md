---
title: 【IT技術の知見】LB＠AWSリソース
description: LB＠AWSリソースの知見を記録しています。
---

# LB＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. LB

ロードバランシングしたいプロトコルに合わせて、使用するロードバランサーを選択する。

| LB名                           | OSI階層モデルのレイヤー      | リスナーが処理できるプロトコル | ターゲット                              | リクエストヘッダー (`L7`) | パケットヘッダーのフィールド (`L4`)        | セキュリティグループ |
| ------------------------------ | ---------------------------- | ------------------------------ | --------------------------------------- | ------------------------- | ------------------------------------------ | -------------------- |
| ALB：Application Load Balancer | `L7` (アプリケーション層)    | HTTP、HTTPS、gRPC              | IPアドレス、AWS EC2インスタンス、Lambda | URL、HTTPヘッダー         | ポート番号フィールド                       | 可                   |
| NLB：Network Load Balancer     | `L4` (トランスポート層)      | TCP、UDP、TLS                  | IPアドレス、AWS EC2インスタンス、ALB    | 不可                      | IPアドレスフィールド、ポート番号フィールド | 不可                 |
| GLB：Gateway Load Balancer     | `L3` (ネットワーク層) 、`L4` | IP                             | IPアドレス、AWS EC2インスタンス         | 不可                      | IPアドレスフィールド、ポート番号フィールド | 不可                 |
| CLB：Classic Load Balancer     | `L4`、`L7`                   | HTTP、HTTPS、TCP、SSL/TLS      | なし                                    | URL、HTTPヘッダー         | IPアドレスフィールド、ポート番号フィールド | 可                   |

> - https://aws.amazon.com/jp/elasticloadbalancing/features/
> - https://faq.support.nifcloud.com/faq/show/420?site_domain=default
> - https://www.infraexpert.com/study/tcpip8.html
> - https://aws.amazon.com/jp/elasticloadbalancing/faqs/

<br>

## 02. ALB：Application Load Balancing

### ALBとは

クラウドリバースプロキシサーバー、かつクラウド`L7`ロードバランサーとして働く。

AWS EC2へのリクエストをバランスよく分配することによって、サーバーへの負荷を緩和する。

![aws_alb](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_alb.png)

> - https://www.slideshare.net/AmazonWebServicesJapan/application-load-balancer#24

<br>

## 02-02. セットアップ

### コンソール画面の場合

#### ▼ 設定項目と説明

| 設定項目             | 説明                                                                                                                                                            | 補足                                                                                                                                                                                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| リスナー             | ALBに割り振るポート番号と受信するプロトコルを設定する。リバースプロキシサーバーかつロードバランサ－として、これらの通信をターゲットグループにルーティングする。 |                                                                                                                                                                                                                                                                          |
| スキマー             | パブリックネットワークからのリクエストを待ち受けるか、あるいはプライベートネットワークからのリクエストを待ち受けるかを設定する。                                |                                                                                                                                                                                                                                                                          |
| セキュリティポリシー | リクエストの送信者が使用するSSL/TLSプロトコルや暗号化方式のバージョンに合わせて、ALBが受信できるこれらのバージョンを設定する。                                  | ・リクエストの送信者には、ブラウザ、APIにリクエストを送信する外部サービス、フォワーディング元のAWSリソース (例：CloudFrontなど) などを含む。<br>・- https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html#describe-ssl-policies |
| ルール               | リクエストのルーティングのロジックを設定する。                                                                                                                  |                                                                                                                                                                                                                                                                          |
| ターゲットグループ   | ルーティング時に使用するプロトコルと、宛先とするポート番号を設定する。                                                                                          | ターゲットグループ内のターゲットのうち、トラフィックはヘルスチェックがOKになっているターゲットにルーティングされる。                                                                                                                                                     |
| ヘルスチェック       | ターゲットグループに所属するプロトコルとアプリケーションのポート番号を指定して、定期的にリクエストを送信する。                                                  |                                                                                                                                                                                                                                                                          |

#### ▼ ターゲットグループ

| ターゲットの指定方法 | 補足                                                     |
| -------------------- | -------------------------------------------------------- |
| AWS EC2インスタンス  | ターゲットはAWS EC2である必要がある。                    |
| IPアドレス           | ターゲットのパブリックIPアドレスは静的である必要がある。 |
| Lambda               | ターゲットはLambdaである必要がある。                     |

<br>

### ルールの設定例

| ユースケース                                                                          | ポート | IF                                             | THEN                                                                                   |
| ------------------------------------------------------------------------------------- | ------ | ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| リクエストが`80`番ポートを指定した時に、`443`番ポートにリダイレクトしたい。           | `80`   | それ以外の場合はルーティングされないリクエスト | ルーティング先：`https://#{host}:443/#{path}?#{query}`<br>ステータスコード：`HTTP_301` |
| リクエストが`443`番ポートを指定した時に、ターゲットグループにフォワーディングしたい。 | `443`  | それ以外の場合はルーティングされないリクエスト | 特定のターゲットグループ                                                               |

<br>

### ALBインスタンス

#### ▼ ALBインスタンスとは

ALBの実体で、各ALBインスタンスが異なるグローバルIPアドレスを持つ。

複数のAZにルーティングするようにALBを設定した場合、各AZにALBインスタンスが1つずつ配置される。

![alb-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/alb-instance.png)

> - https://blog.takuros.net/entry/2019/08/27/075726

#### ▼ 割り当てられるIPアドレス

ALBに割り当てられるIPアドレスには、AWS VPCのものが適用される。

そのため、AWS EC2のセキュリティグループでは、AWS VPCのCIDRブロックを許可するように設定する必要がある。

#### ▼ オートスケーリング

単一障害点にならないように、負荷が高まるとALBインスタンスが増えるように自動スケールアウトする仕組みを持つ。

#### ▼ `500`系ステータスの原因

> - https://aws.amazon.com/jp/premiumsupport/knowledge-center/troubleshoot-http-5xx/

#### ▼ ALBのセキュリティグループ

AWS Route53からルーティングされるパブリックIPアドレスを受信できるようにしておく必要がある。

パブリックネットワークに公開するサイトであれば、IPアドレスは全ての範囲 (`0.0.0.0/0`と` ::/0`) にする。

社内向けのサイトであれば、社内のプライベートIPアドレスのみ (`*.*.*.*/32`) を許可する。

<br>

### 常時SSLのアプリケーションへのルーティング

#### ▼ 問題

アプリケーションが常時SSLになっているアプリケーション (例：WordPress) の場合、ALBからアプリケーションにHTTPプロトコルでルーティングすると、HTTPSプロトコルへのリダイレクトループが発生してしまう。

常時SSLがデフォルトになっていないアプリケーションであれば、これは起こらない。

> - https://cloudpack.media/525

#### ▼ Webサーバーにおける対処方法

ALBを経由したリクエストには、リクエストヘッダーに`X-Forwarded-Proto`ヘッダーが付与される。

これには、ALBに対するリクエストのプロトコルの種類が文字列で代入されている。

これが『HTTPS』だった場合、Webサーバーに対するリクエストをHTTPSプロトコルであるとみなすように対処する。

これにより、アプリケーションに対するリクエストのプロトコルがHTTPSプロトコルとなる (こちらを行った場合は、アプリケーション側の対応不要) 。

**＊実装例＊**

```apacheconf
SetEnvIf X-Forwarded-Proto https HTTPS=on
```

> - https://www.d-wood.com/blog/2017/11/29_9354.html

#### ▼ アプリケーションにおける対処方法

![ALBからEC2に対するリクエストのプロトコルをHTTPSプロトコルと見なす](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ALBからEC2に対するリクエストのプロトコルをHTTPSと見なす.png)

ALBを経由したリクエストには、リクエストヘッダーに`HTTP_X_FORWARDED_PROTO`ヘッダーが付与される。

これには、ALBに対するリクエストのプロトコルの種類が文字列で代入されている。

そのため、もしALBに対するリクエストがHTTPSプロトコルだった場合は、ALBからアプリケーションに対するリクエストもHTTPSプロトコルであるとみなすように、`index.php`に追加実装を実行する (こちらを行った場合は、Webサーバー側の対応不要) 。

**＊実装例＊**

```php
<?php

// index.php
if (isset($_SERVER["HTTP_X_FORWARDED_PROTO"])
    && $_SERVER["HTTP_X_FORWARDED_PROTO"] == "https") {
    $_SERVER["HTTPS"] = "on";
}
```

> - https://www.d-wood.com/blog/2017/11/29_9354.html

<br>

### 負荷分散方式

#### ▼ 負荷分散方式とは

ターゲットに対するリクエストフォワーディング時の負荷分散方式を設定する。

> - https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html#application-load-balancer-overview

#### ▼ ラウンドロビン方式

受信したリクエストを、ターゲットに均等にルーティングする。

#### ▼ 最小未処理リクエスト方式 (ファステスト)

受信したリクエストを、未処理のリクエスト数が最も少ないターゲットにルーティングする。

> - https://www.infraexpert.com/study/loadbalancer4.html

#### ▼ スロースタート方式

受信したリクエストをルーティングする時に、スロースタート方式 (通過させるリクエストの数を少しずつ増加させる) で負荷分散を実施する。

リクエスト数の非常に多い高トラフィックなシステムで、起動直後のパフォーマンスが悪いアプリケーション (例：キャッシュに依存、接続プールの作成が必要、ウォームアップが必要なJVM言語製アプリケーション) にいきなり高負荷をかけないようにできる。

> - https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/edit-target-group-attributes.html#slow-start-mode
> - https://aws.amazon.com/jp/about-aws/whats-new/2018/05/application-load-balancer-announces-slow-start-support/

<br>

### アクセスログ

#### ▼ HTTPSリクエストの場合

HTTPSリクエストのアクセスログのフォーマットは以下の通りである。

```yaml
https 2018-07-02T22:23:00.186641Z app/my-loadbalancer/50dc6c495c0c9188 192.168.131.39:2817 10.0.0.1:80 0.086 0.048 0.037 200 200 0 57 "GET https://www.example.com:443/ HTTP/1.1" "curl/7.46.0" ECDHE-RSA-AES128-GCM-SHA256 TLSv1.2 arn:aws:elasticloadbalancing:us-east-2:123456789012:targetgroup/my-targets/73e2d6bc24d8a067 "Root=1-58337281-1d84f3d73c47ec4e58577259" "www.example.com" "arn:aws:acm:us-east-2:123456789012:certificate/12345678-1234-1234-1234-123456789012" 1 2018-07-02T22:22:48.364000Z "authenticate,forward" "-" "-" "10.0.0.1:80" "200" "-" "-" TID_123456
```

```yaml
https # リクエストタイプ
2018-07-02T22:23:00.186641Z
app/my-loadbalancer/50dc6c495c0c9188 # ロードバランサー名
192.168.131.39:2817 # クライアント側の情報
10.0.0.1:80  # ターゲット側の情報 (AWS EC2、AWS ECS、AWS EC2 NodeのIPアドレスとポート番号)
0.086
0.048
0.037
200 # ロードバランサーのレスポンスのステータスコード
200
0
57
"GET https://www.example.com:443/ HTTP/1.1"
"curl/7.46.0" # ユーザーエージェント
ECDHE-RSA-AES128-GCM-SHA256 TLSv1.2
arn:aws:elasticloadbalancing:us-east-2:123456789012:targetgroup/my-targets/73e2d6bc24d8a067
"Root=1-58337281-1d84f3d73c47ec4e58577259"
"www.example.com"
"arn:aws:acm:us-east-2:123456789012:certificate/12345678-1234-1234-1234-123456789012"
1
2018-07-02T22:22:48.364000Z
"waf,authenticate,forward" # AWS WAFを通過している場合はここに記録される
"-"
"-"
"10.0.0.1:80"
"200" # サーバー側のレスポンスのステータスコード
"-"
"-"
TID_123456
```

> - https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html#access-log-entry-examples
> - https://dev.classmethod.jp/articles/alb-log-to-s3/#toc-1

<br>

## 03. CLB: Classic Load Balancer

キューを持ち、クラウド`L4`/`L7`ロードバランサーとして働く。

ALB、NLB、では元々実装されていたキューを廃止した経緯がある。

> - https://repost.aws/ja/knowledge-center/elb-capacity-troubleshooting
> - https://stackoverflow.com/a/49421971

<br>

## 04. NLB：Network Load Balancer

クラウド`L4`ロードバランサーとして働く。

<br>
