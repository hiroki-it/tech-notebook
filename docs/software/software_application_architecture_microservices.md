---
title: 【IT技術の知見】マイクロサービスアーキテクチャ＠アーキテクチャ
description: マイクロサービスアーキテクチャ＠アーキテクチャの知見を記録しています。
---

# マイクロサービスアーキテクチャ＠アーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. アーキテクチャ概要

### アーキテクチャの歴史

![architecture_history](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/architecture_history.png)

| 年代         | アーキテクチャ                     | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 補足                                                                                                                                                                                                                   |
| ------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1999         | モノリシックアーキテクチャ         | 1999年台、バックエンドのアーキテクチャとしてモノリシックアーキテクチャが台頭していた。しかし、モノリシックアーキテクチャは無秩序でつぎはぎだらけのアプリケーションになることが論文 (『大きな泥だんご』) で指摘された。                                                                                                                                                                                                                                                                                             | ・https://en.wikipedia.org/wiki/Big_ball_of_mud                                                                                                                                                                        |
| 2000 〜 2004 | サービス指向アーキテクチャ         | 1999後半〜2000前半に、Thomas Erlらがアプリケーションを機能の粒度で分割するアーキテクチャを提唱した。ただ『機能』という粒度が抽象的で、概念としては提唱されていても、実装方法の確立にまでは至らなかった。                                                                                                                                                                                                                                                                                                           | ・https://en.wikipedia.org/wiki/Service-oriented_architecture <br>・https://www.serviceorientation.org/p0.html <br>・https://www.amazon.com/dp/0470141115                                                              |
| 2014         | マイクロサービスアーキテクチャ     | 2014年にThoughtWorks社は、サービス指向アーキテクチャとドメイン駆動設計を統合し、アプリケーションを独立したマイクロサービスの集まりに分割するアーキテクチャを提唱した。サービス指向アーキテクチャにドメイン駆動設計の高凝集/低結合の考え方を取り入れることで、実装可能な理論に昇華させた。                                                                                                                                                                                                                          | ・https://martinfowler.com/articles/microservices.html <br>・https://atmarkit.itmedia.co.jp/ait/articles/2110/22/news006.html                                                                                          |
| 2017         | ミニマイクロサービスアーキテクチャ | マイクロサービスアーキテクチャのマイクロサービス自体を独立したモノリスなアプリケーションと捉えると、その分だけ開発チーム (マネージャーとエンジニア) が必要になってしまう。2017年にCloud Elements社は、これに対処するためにミニマイクロサービスアーキテクチャを提唱した。このアーキテクチャでは、マイクロサービスアーキテクチャとモノリスアーキテクチャの間をとった粒度で、アプリケーションを複数のマイクロサービスに分割する。この粒度を、マイクロサービスに対抗して『ミニマイクロサービス』または『MASA』とよぶ。 | ・https://blog.cloud-elements.com/pragmatic-microservices-architecture <br>・https://atmarkit.itmedia.co.jp/ait/articles/2110/22/news006.html                                                                          |
| 2018         | モジュラーモノリスアーキテクチャ   | ミニマイクロサービスアーキテクチャではマイクロサービスの粒度が大きくなったものの、複数のマイクロサービスが必要になることは変わらず、その分だけ開発チームが必要になる問題は解決されなかった。そこで、Root Insurance社はモジュラーモノリスを提唱した。モジュラモノリスでは、マイクロサービスアーキテクチャとモノリスアーキテクチャの間をとった粒度で、アプリケーションを細かいモジュールに分割する。最初、モジュラーモノリスとして設計し、マイクロサービスアーキテクチャに移行していくという選択肢もある。           | ・https://medium.com/@dan_manges/the-modular-monolith-rails-architecture-fb1023826fc4 <br>・https://creators-note.chatwork.com/entry/2020/12/02/090000 <br>・https://eh-career.com/engineerhub/entry/2022/07/25/093000 |

> - https://medium.com/@techworldwithmilan/most-common-software-architecture-styles-86881d779683
> - https://tech-blog.rakus.co.jp/entry/20201218/architecture

<br>

### 各アーキテクチャの粒度の比較

![architecture_deployment_comparison](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/architecture_deployment_comparison.png)

| モジュールの大きさ | 粒度名               | 説明                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 一番大きい         | モノリシック         | アプリケーションのモジュールが分割されておらず、アプリケーションをデプロイの単位とする。                                                                                                                                                                                                                                                                                                                               |
|                    | モジュラー           | アプリケーションがモジュールに分割されており、アプリケーションをデプロイの単位とする。モジュール間のデータのやり取りに通信を使用するか否かや、モジュール間でDBを共有するか否かの選択によって、作成パターンがいくつかある。<br>・https://scrapbox.io/tsuwatch/%E3%83%A2%E3%83%8E%E3%83%AA%E3%82%B9%E3%81%A8%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AE%E3%81%82%E3%81%84%E3%81%A0 |
|                    | ミニマイクロサービス | アプリケーションがサブドメイン (または境界づけられたコンテキスト) を単位としたマイクロサービスに分割されており、アプリケーションを構成するマイクロサービスのある程度のまとまりをデプロイの単位とする。また、DBを各マイクロサービスで共有する。                                                                                                                                                                         |
| 一番小さい         | マイクロ             | アプリケーションがサブドメイン (または境界づけられたコンテキスト) を単位としたマイクロサービスまたはルートエンティティに分割されており、アプリケーションを構成するマイクロサービスそれぞれをデプロイの単位とする。また、DBを各マイクロサービスで共有せずに、マイクロサービスごとに配置する。                                                                                                                           |

> - https://tech-blog.rakus.co.jp/entry/20201218/architecture

<br>

### プレゼンテーションドメイン分離

モノリシックの段階では、フロントエンド領域とバックエンド領域が1つのアプリケーションで密結合になっている。

フロントエンド領域とバックエンド領域を分離した段階では、フロントエンド領域とバックエンド領域が異なるアプリケーションとして分離される。

マイクロサービスでの段階では、さらにバックエンドが複数のアプリケーションとAPIアグリゲーション層に分離される。

![presentation_domain_separation](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/presentation_domain_separation.png)

> - https://cloud.google.com/architecture/devops/devops-tech-architecture
> - https://docs.microsoft.com/ja-jp/azure/architecture/microservices/migrate-monolith
> - https://bliki-ja.github.io/PresentationDomainSeparation/
> - https://tech.mti.co.jp/entry/2021/04/12/112833

<br>

### 関連パターン

#### ▼ 関連パターンとは

マイクロサービスアーキテクチャでは固有の問題が起こる。

これを解決するための関連パターンがたくさんある。

![microservices_related-patterns](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_related-patterns.jpg)

> - https://microservices.io/patterns/

**＊実装例＊**

`microservices.io`サイトで紹介しきれていない実装方法は、`softwarepatternslexicon`サイトで確認できる。

> - https://softwarepatternslexicon.com/microservices/

#### ▼ マイクロサービスアーキテクチャとクラウドネイティブ

優れたクラウドネイティブアプリケーションを作成するには、マイクロサービスアーキテクチャとクラウドネイティブ技術が必要である。

![microservices_cloud-native](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_cloud-native.png)

マイクロサービスアーキテクチャの関連パターンは、クラウドネイティブ技術で代替できる。

| マイクロサービスの関連パターン | クラウドネイティブ技術                  |
| ------------------------------ | --------------------------------------- |
| Externalized configuration     | Kubernetes ConfigMap、Kubernetes Secret |
| サービス検出                   | Kubernetes Service                      |
| 負荷分散                       | Kubernetes Service                      |
| APIゲートウェイ                | Kubernetes Ingress                      |
| 集中ロギング                   | Fluentd                                 |
| 集中メトリクス                 | Prometheus、Grafana                     |
| 分散トレース                   | OpenTelemetry、Grafana Tempo            |
| 回復力                         | Kubernetes Probe、Istio                 |
| 自己回復                       | Kubernetes Deployment                   |
| ...                            | ...                                     |

> - https://en.wikipedia.org/wiki/Microservices#A_comparison_of_platforms
> - https://developers.redhat.com/articles/2023/04/05/kubernetes-patterns-path-cloud-native

<br>

## 02. マイクロサービスアーキテクチャの特徴

### 特徴

#### ▼ ビジネスのスケーリングに強い

ビジネスがスケーリングする時、マイクロサービスの新規実装または削除を行えば良いため、ドメイン層の激しい変化に強い。

#### ▼ コンウェイの法則が働く

マイクロサービスアーキテクチャにより、組織構造が小さなチームの集まりに変化することを期待できる。

#### ▼ 高頻度でリリース可能

各マイクロサービスを独立してデプロイできるため、高頻度でリリースできる。

#### ▼ 障害の影響が部分的

いずれかのマイクロサービスに障害が発生したとして、サーキットブレイカーを使用することにより、送信元マイクロサービスへの障害の波及を食い止められる。

そのため、障害の影響が部分的となり、アプリケーション全体が落ちてしまうことがない。

#### ▼ 複数の開発言語を使用可能

マイクロサービス間で、共通のデータ記述言語を使用してデータ通信を行えば、各マイクロサービスの開発言語が異なっていても問題ない。

<br>

### アーキテクチャ例

#### ▼ Eコマース (Googleのサンプル)

`src`ディレクトリに各マイクロサービスのディレクトリを配置する。

- カート
- 商品検索とインデックス
- 通貨の変換
- クレジットカード
- 送料と発送
- 注文確認メール
- 注文フロー
- レコメンド
- 広告
- 合成監視

![service_google](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service_google.png)

> - https://github.com/GoogleCloudPlatform/microservices-demo

#### ▼ Eコマース (メルカリのサンプル)

`services`ディレクトリに各マイクロサービスのディレクトリを配置する。

- 認証
- カタログ
- 顧客
- 商品

![service_mercari](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service_mercari.png)

> - https://github.com/mercari/mercari-microservices-example

#### ▼ Eコマース (Datadogのサンプル)

- 広告
- 割引

> - https://github.com/DataDog/ecommerce-workshop

#### ▼ Eコマース (Amazon)

![service_twitter](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service_amazon.png)

> - https://www.codekarle.com/system-design/Amazon-system-design.html

#### ▼ SNS (Twitter)

![service_twitter](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service_twitter.png)

> - https://www.codekarle.com/system-design/Twitter-system-design.html

#### ▼ 地図 (Google Map)

![service_google-map](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service_google-map.png)

> - https://www.codekarle.com/system-design/Google_Maps-system-design.html

<br>

### フレームワーク

マイクロサービスアーキテクチャのフレームワークとして、Dapr、Axon、Eventuate、MicroProfile LRAなどがある。

> - https://speakerdeck.com/polar3130/portable-microservices-with-dapr-and-kubernetes?slide=24
> - https://www.publickey1.jp/blog/19/dapr.html
> - https://github.com/dapr/dapr

<br>

## 03. マイクロサービスアーキテクチャの構成領域

### 関連アーキテクチャの構成領域の比較

サンプルアプリケーションはマイクロサービスアーキテクチャのため、ここでマイクロサービスアーキテクチャの構成領域を解説します。

モノリスアーキテクチャ、プレゼンテーションドメイン分離、マイクロサービスアーキテクチャを簡単に比較する。

![microservices_comparison](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_comparison.png)

いずれのアーキテクチャも、アプリケーションと各種ストレージ（ブロックストレージ、キーバリューストレージ、オブジェクトストレージ、ファイルストレージ）で構成されています。

データベースとしてのRDBはブロックストレージに属しています。モノリスアーキテクチャ、プレゼンテーションドメイン分離、マイクロサービスアーキテクチャの比較を次の表のとおりに整理しました。

表01-02. 関連アーキテクチャの構成領域の比較

|                                | モノリスアーキテクチャ                     | プレゼンテーションドメイン分離                                                         | マイクロサービスアーキテクチャ                                                                          |
| ------------------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **プロセスの単位**             | ・アプリケーション全体<br>・各種ストレージ | ・フロントエンドアプリケーション<br>・バックエンドアプリケーション<br>・各種ストレージ | ・フロントエンドアプリケーション<br>・APIゲートウェイ（任意）<br>・マイクロサービス<br>・各種ストレージ |
| **機能ロジックリリースの単位** | アプリケーション全体                       | バックエンドアプリケーション                                                           | 各マイクロサービス                                                                                      |
| **各種ストレージの単位**       | アプリケーション全体に１つずつ             | アプリケーション全体に１つずつ                                                         | 各マイクロサービスに１つずつ、またはアプリケーション全体に１つずつ                                      |

### モノリスアーキテクチャ

モノリスアーキテクチャでは、アプリケーションはフロントエンド領域とバックエンド領域で構成されています。

フロントエンド領域とバックエンド領域の領域は密結合になっており、両方は同じプロセスで稼働します。

そのため、モノリスアーキテクチャのアプリケーションのバックエンド領域の一部に機能ロジックを変更する場合、アプリケーション全体をリリースする必要があります。

### プレゼンテーションドメイン分離

次にプレゼンテーションドメイン分離では、アプリケーションはフロントエンドアプリケーションとバックエンドアプリケーションで構成されています。

モノリスアーキテクチャと比較して、アプリケーションがフロントエンドアプリケーションとバックエンドアプリケーションに分割されており、両方は異なるプロセスで稼働します。

担当者は、これらを独立してリリースできます。ただし、プレゼンテーションドメイン分離のアプリケーションに機能ロジックを変更する場合、担当者はバックエンドアプリケーション全体をリリースする必要があります。

### マイクロサービスアーキテクチャ

最後にマイクロサービスアーキテクチャでは、アプリケーションはフロントエンドアプリケーション、APIゲートウェイ（任意）、マイクロサービスで構成されています。

プレゼンテーションドメイン分離と比較して、　バックエンドがマイクロサービスに分割されており、バックエンドからAPIゲートウェイを切り離す場合があるかもしれません。

そして、これらはすべては異なるプロセスで稼働します。

マイクロサービスの粒度には、ドメイン駆動設計の高凝集と低結合な粒度（例：集約、境界づけられたコンテキスト）を取り入れることが適切です。

機能ロジックを変更する場合、マイクロサービス担当者はその機能ロジックをもつマイクロサービスだけをリリースします。
