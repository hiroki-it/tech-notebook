---
title: 【IT技術の知見】Amazon Route 53＠AWSリソース
description: Amazon Route 53＠AWSリソース
---

# Amazon Route 53＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Amazon Route 53 とは

クラウド DNS サーバーとして働く。

リクエストされたドメイン名と EC2 のグローバル IP アドレスをマッピングしている。

名前の由来は、名前解決時に `53` 番ポートを使用するためである。

> - [【AWS】 Amazon Route 53について解説 – AWSインフラ研究所](https://go-journey.club/archives/2665)

<br>

## 02. セットアップ

### コンソール画面の場合

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ホストゾーン</td>
      <td>DNS ゾーン情報として、ドメイン名を設定する。</td>
    </tr>
    <tr>
      <td>DNS レコードセット</td>
      <td>名前解決時のルーティング方法を設定する。DNS ゾーンとしてのホストゾーン配下に、サブドメイン名を設定することもできる。</td>
    </tr>
  </tbody>
</table>

<br>

### DNS レコード

#### ▼ DNS レコードとは

各ホストゾーンにドメインの名前解決方法を定義した DNS レコードを設定する。

> - [How internet traffic is routed to your website or web application - Amazon Route 53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/welcome-dns-service.html#welcome-dns-service-how-to-configure)

#### ▼ DNS レコードタイプの種類

<table>
  <thead>
    <tr>
      <th>DNS レコードタイプ</th>
      <th>説明</th>
      <th>名前解決の仕組み</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>A</td>
      <td>リクエストをフォワーディングしたい AWS リソースの、IPv4 アドレスまたは DNS 名を設定する。</td>
      <td>IPv4 アドレスが返却される。</td>
      <td></td>
    </tr>
    <tr>
      <td>AAAA</td>
      <td>リクエストをフォワーディングしたい AWS リソースの、IPv6 アドレスまたは DNS 名を設定する。</td>
      <td>IPv6 アドレスが返却される。</td>
      <td></td>
    </tr>
    <tr>
      <td>CNAME</td>
      <td>リクエストをフォワーディングしたい任意のサーバーのドメイン名を設定する。</td>
      <td>ドメイン名にリダイレクトする。</td>
      <td>設定するドメイン名は AWS リソースでなくともよい。</td>
    </tr>
    <tr>
      <td>NS</td>
      <td>IP アドレスの問い合わせに応えられる DNS サーバーの名前が定義されている。</td>
      <td>DNS サーバーの名前が返却される。</td>
      <td></td>
    </tr>
    <tr>
      <td>MX</td>
      <td>リクエストをフォワーディングしたいメールサーバーのドメイン名を設定する。</td>
      <td>メールサーバーのドメイン名が返却される。</td>
      <td></td>
    </tr>
    <tr>
      <td>TXT</td>
      <td>リクエストをフォワーディングしたいサーバーのドメイン名に紐付けられた文字列を設定する。</td>
      <td>ドメイン名に紐付けられた文字列が返却される。</td>
      <td></td>
    </tr>
  </tbody>
</table>

#### ▼ AWS リソースの DNS 名、ドメイン名、エンドポイント名

![URLと電子メールの構造](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/URLと電子メールの構造.png)

<table>
  <thead>
    <tr>
      <th>種別</th>
      <th>AWS リソース</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">DNS 名</td>
      <td>AWS ALB</td>
      <td><code>&lt;ALB名&gt;-&lt;ランダムな文字列&gt;.ap-northeast-1.elb.amazonaws.com</code></td>
    </tr>
    <tr>
      <td>Amazon EC2</td>
      <td><code>ec2-&lt;パブリックIPをハイフン区切りにしたもの&gt;.ap-northeast-1.compute.amazonaws.com</code></td>
    </tr>
    <tr>
      <td>ドメイン名</td>
      <td>Amazon CloudFront</td>
      <td><code>&lt;発行されたランダム文字列&gt;.cloudfront.net</code></td>
    </tr>
    <tr>
      <td rowspan="3">エンドポイント名</td>
      <td>Amazon Aurora</td>
      <td><code>&lt;DBクラスター名&gt;&lt;ランダムな文字列&gt;.ap-northeast-1.rds.amazonaws.com.</code></td>
    </tr>
    <tr>
      <td>Amazon RDS</td>
      <td><code>&lt;DBインスタンス名&gt;&lt;ランダムな文字列&gt;.ap-northeast-1.rds.amazonaws.com.</code></td>
    </tr>
    <tr>
      <td>Amazon S3</td>
      <td><code>&lt;バケット名&gt;.ap-northeast-1.amazonaws.com</code></td>
    </tr>
  </tbody>
</table>

#### ▼ AWS 以外でドメインを購入した場合

ドメインを購入したドメインレジストラが、ドメイン名を名前解決する。

そのため、AWS 以外 (例：お名前ドットコム) でドメインを購入した場合、Amazon Route 53 の NS レコード値を、ドメインを実際に購入したサービスのドメインレジストラに登録する必要がある。

これにより、ドメインレジストラに対して IP アドレスの問い合わせがあった場合、Amazon Route 53 の NS レコード値が DNS サーバーへレスポンスされるようになる。

DNS サーバーが Amazon Route 53 に問い合わせると、Amazon Route 53 は DNS サーバーとして動作し、アプリケーションの IP アドレスをレスポンスする。

一方で逆も同様で、AWS 以外のシステムのドメインを Amazon Route 53 で購入した場合、そのシステムの NS レコードを Amazon Route 53 へ登録することになる。

#### ▼ DNS キャッシュ

ルートサーバーは世界に 13 機しか存在しておらず、現実的には、世界中から届く名前解決リクエストをすべて処理できない。

そこで、IP アドレスとドメイン名の関係をキャッシュするプロキシサーバー (キャッシュ DNS サーバー) が使用されている。

基本的には、プロキシサーバーと DNS サーバーは区別されるが、Amazon Route 53 はプロキシサーバーと DNS サーバーの能力を両立している。

<br>

### リゾルバー

#### ▼ リゾルバーとは

記入中...

<br>

### ルーティングポリシー

#### ▼ ルーティングポリシーとは

ドメイン名の名前解決ルールを設定する。

> - [Choosing a routing policy - Amazon Route 53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html)
> - [Amazon Route 53のルーティングがすごすぎる件](https://zenn.dev/seyama/articles/02118b0914183e)

#### ▼ シンプル

ドメイン名に単一の IP アドレスを紐付けられる。

ドメインの名前解決では、単一の IP アドレスが返却される。

#### ▼ 複数値回答

ドメイン名に複数の IP アドレスを紐付けられる。

ドメインの名前解決では、正常な IP アドレスを均等に返却する。

ヘルスチェック機能を持つラウンドロビン方式と言い換えてもよい。

#### ▼ 加重

ドメイン名に複数の IP アドレスを紐付けられる。

ドメインの名前解決では、IP アドレスを指定した割合で返却する。

同じ名前で複数のレコードを作成し、各レコードのルーティングポリシーを加重とする。

これらの重み付けの合計を `100` にする。

現環境から新環境にできるだけ素早く切り替えられるように、DNS キャッシュである TTL (秒) はあらかじめ短く設定しておく。

<table>
  <thead>
    <tr>
      <th>レコード名</th>
      <th>ルーティングポリシー</th>
      <th>TTL (秒)</th>
      <th>重み付け</th>
      <th>ルーティング先</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>example.com</code></td>
      <td>加重</td>
      <td><code>60</code></td>
      <td><code>30</code></td>
      <td>ブルー環境の ALB (現環境)</td>
    </tr>
    <tr>
      <td><code>example.com</code></td>
      <td>加重</td>
      <td><code>60</code></td>
      <td><code>70</code></td>
      <td>グリーン環境の ALB (新環境)</td>
    </tr>
  </tbody>
</table>

![aws_route53_routing-policy_weighted-routing](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_route53_routing-policy_weighted-routing.png)

> - [AWS Route53の加重ルーティング機能で本番インフラを無停止・段階的にECS環境に移行する - 弥生開発者ブログ](https://tech-blog.yayoi-kk.co.jp/entry/2021/12/06/000000)

<br>

## 03 Amazon Route 53 + DNS サーバーによる名前解決の仕組み

![Amazon Route 53を含む名前解決の仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Route53を含む名前解決の仕組み.png)

`(1)`

: クライアント PC は、`www.example.com` にマッピングされる IP アドレスのキャッシュを検索する。キャッシュが無ければ、クライアント PC はドメイン名をキャッシュ DNS サーバーに問い合わせる。

`(2)`

: キャッシュ DNS サーバーは、IP アドレスのキャッシュを検索する。キャッシュが無ければ、キャッシュ DNS サーバーはドメイン名を DNS サーバーに問い合わせる。

`(3)`

: Amazon Route 53 は、IP アドレスのキャッシュを検索する。キャッシュが無ければ、Amazon Route 53 は IP アドレスを検索する。また、キャッシュ DNS サーバーにこれを返却する。

<table>
  <thead>
    <tr>
      <th style="text-align:center">ドメイン名</th>
      <th style="text-align:center">Amazon Route 53 による変換</th>
      <th style="text-align:center">IP アドレス</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:center"><code>http://www.example.com</code></td>
      <td style="text-align:center">⇄</td>
      <td style="text-align:center"><code>203.142.205.139</code></td>
    </tr>
  </tbody>
</table>

`(4)`

: キャッシュ DNS サーバーは、IP アドレスを NAT に返却する。このとき、IP アドレスのネットワーク間変換が起こる。

`(5)`

: NAT は、IP アドレスをクライアント PC に返却する。

`(6)`

: クライアント PC は、返却された IP アドレスに基づいて Web ページにリクエストを送信する。

<br>
