---
title: 【IT技術の知見】APIゲートウェイ領域＠マイクロサービスアーキテクチャ
description: APIゲートウェイ領域＠マイクロサービスアーキテクチャの知見を記録しています。
---

# APIゲートウェイ領域＠マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. APIゲートウェイ

### APIゲートウェイとは

![microservices_api-gateway-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_api-gateway-pattern.png)

クリーンアーキテクチャでいうインフラ層とインターフェース層のような機能を担う。

主要な機能として、受信した通信を適切なマイクロサービスのAPIにルーティング

- ルーティング
- 認証
- トレースIDの付与
- キャッシュの作成
- リクエストのレートリミット
- パケットのアプリケーションデータの暗号化
- ...

なお、APIゲートウェイをサービスメッシュに参加させることで、これらの機能の一部 (認証、トレースIDの付与、パケットのアプリケーションデータの暗号化、リクエスト制限) をサイドカーに委譲できる。

> - https://banzaicloud.com/blog/backyards-api-gateway/#api-gateway-pattern
> - https://www.getambassador.io/resources/challenges-api-gateway-kubernetes/

<br>

### 分割パターン

#### ▼ APIゲートウェイの分割パターンとは

APIゲートウェイの責務をどのように分割するかに応じて、分割パターンがある。

#### ▼ Central Aggregating Gateway

マイクロサービスにリクエストを送信するアプリケーションの種類に関係なく、APIゲートウェイを`1`個だけ作成する。

![apigateway_public-api-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/apigateway_public-api-pattern.png)

> - https://www.mobilelive.ca/blog/why-backend-for-frontend-application-architecture/
> - https://www.linkedin.com/posts/raul-junco_nobody-likes-making-20-calls-to-render-a-activity-7198293633882632192-3QS4/

#### ▼ BFF：Backends For Frontends

マイクロサービスにリクエストを送信するクライアントアプリケーションの種類 (Webアプリケーション、モバイルアプリケーション、他社向けアプリケーションなど) を単位として、APIゲートウェイ (Web APIゲートウェイ、Mobile APIゲートウェイ、他社向けAPIゲートウェイなど) を作成する。

ただし、ドメインによっては同じクライアントアプリケーションの種類であっても、APIゲートウェイを分割することもある。

例えば、送金ドメインであれば、クライアントアプリケーションには銀行ダイレクトアプリや銀行系決済サービスアプリケーションがあり、これらが同じモバイルアプリケーションであっても、APIゲートウェイを分割する。

なお、BFFはRESTful-APIであってもGraphQL-APIであっても、どちらでも問題ない。

![apigateway_bff-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/apigateway_bff-pattern.png)

> - https://www.mobilelive.ca/blog/why-backend-for-frontend-application-architecture/
> - https://codezine.jp/article/detail/11305?p=4
> - https://www.watch.impress.co.jp/docs/news/1339451.html
> - https://stackoverflow.com/a/73598888

#### ▼ Federated Gateway

BFFではアプリケーションの種類ごとにAPI　Gatewayを作成したが、Federated Gatewayでは各APIゲートウェイのエンドポイントを統合する。

> - https://www.ey-office.com/blog_archive/2021/12/23/i-checked-graphql-federation/
> - https://tech.smartshopping.co.jp/backend-development-with-graphql
> - https://speakerdeck.com/sonatard/purotokoru-intahuesutositenographql?slide=32

<br>

### API形式パターン

#### ▼ APIゲートウェイのAPI形式パターンとは

APIゲートウェイのAPI形式に応じて、分割パターンがある。

#### ▼ RESTful-API

記入中...

#### ▼ GraphQL-API

記入中...

#### ▼ RPC-API

記入中...

<br>

### 責務パターン

#### ▼ Gateway Offloadingパターン

APIゲートウェイは、マイクロサービス間で共通する問題 (認証、ロギング、サーバー証明書など) を処理する責務を持ちます。

> - https://learn.microsoft.com/ja-jp/azure/architecture/patterns/gateway-offloading

#### ▼ Gatewayルーティングパターン

APIゲートウェイは、複数のマイクロサービスにリクエストをルーティングする責務を持ちます。

> - https://learn.microsoft.com/ja-jp/azure/architecture/patterns/gateway-routing

#### ▼ Gatewayアグリゲーターパターン

APIゲートウェイにAPI Compositionを適用した方法である。

> - https://stackoverflow.com/a/68074337/12771072
> - https://learn.microsoft.com/ja-jp/azure/architecture/patterns/gateway-aggregation

<br>

### 実装パターン

#### ▼ 自前で実装する場合

APIゲートウェイを自前 (例：フルスクラッチ、GraphQLを使用したフルスクラッチなど) で実装する。

この場合、Kubernetesクラスターの内にAPIゲートウェイを配置することになる。

```yaml
AWS Route53 ---> AWS Load Balancer Controller ---> 自前APIゲートウェイ ---> マイクロサービスPod
```

GraphQLでAPIゲートウェイを実装する場合は、特に注意が必要である。

フロントエンド領域とAPIゲートウェイ領域の両方でGraphQL特有の実装が必要になるので、フロントエンド領域とAPIゲートウェイ領域の開発が分業にしくくなってしまう。

ただ、フロントエンド領域とAPIゲートウェイ領域の開発チームの両方がGraphQLの知識を持ってれば、これは起こらない。

> - https://techblog.zozo.com/entry/zozotown-phased-istio-service-meshing-strategy
> - https://qiita.com/takurUN/items/aace0e60744d0ec92cf6#2-4-api%E3%82%B2%E3%83%BC%E3%83%88%E3%82%A6%E3%82%A7%E3%82%A4%E3%82%92kong%E3%81%A7%E6%A7%8B%E7%AF%89%E3%81%97%E3%81%9F%E7%90%86%E7%94%B1%E3%82%B3%E3%82%B9%E3%83%88%E6%9C%80%E9%81%A9

#### ▼ OSSを使用する場合

APIゲートウェイのOSS (Kong、Tyk、Apigee、Kuma、Nginx、Envoy、Apache APISIXなど) を使用する。

この場合、Kubernetesクラスターの内にAPIゲートウェイを配置することになる。

```yaml
AWS Route53 ---> AWS Load Balancer Controller ---> APIゲートウェイ (例：Nginx) ---> マイクロサービスPod
```

> - https://www.moesif.com/blog/technical/api-gateways/How-to-Choose-The-Right-API-Gateway-For-Your-Platform-Comparison-Of-Kong-Tyk-Apigee-And-Alternatives/
> - https://qiita.com/takurUN/items/aace0e60744d0ec92cf6#2-4-api%E3%82%B2%E3%83%BC%E3%83%88%E3%82%A6%E3%82%A7%E3%82%A4%E3%82%92kong%E3%81%A7%E6%A7%8B%E7%AF%89%E3%81%97%E3%81%9F%E7%90%86%E7%94%B1%E3%82%B3%E3%82%B9%E3%83%88%E6%9C%80%E9%81%A9

#### ▼ クラウドプロバイダーのマネージドサービスを使用する場合

クラウドプロバイダー (例：AWS、Google Cloud) が提供するAPIゲートウェイ (例：AWS API Gateway、Google API Gateway) を使用する。

この場合、Kubernetesクラスターの外にAPIゲートウェイを配置することになる。

```yaml
AWS Route53 ---> AWS API Gateway ---> AWS Load Balancer Controller ---> マイクロサービスPod
```

その場合、フロントエンドアプリケーションがAPIゲートウェイに通信できるように、フロントエンドアプリケーションとバックエンドアプリケーションを異なるKubernetesで動かす必要がある。

> - https://aws.amazon.com/jp/blogs/news/api-gateway-as-an-ingress-controller-for-eks/
> - https://qiita.com/takurUN/items/aace0e60744d0ec92cf6#2-4-api%E3%82%B2%E3%83%BC%E3%83%88%E3%82%A6%E3%82%A7%E3%82%A4%E3%82%92kong%E3%81%A7%E6%A7%8B%E7%AF%89%E3%81%97%E3%81%9F%E7%90%86%E7%94%B1%E3%82%B3%E3%82%B9%E3%83%88%E6%9C%80%E9%81%A9

<br>

## 02. APIアグリゲーション層

### APIアグリゲーション層とは

全てのAPIまたは複数のAPIのセットとして機能する。

<br>
