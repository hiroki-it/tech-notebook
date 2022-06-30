---
title: 【知見を記録するサイト】マイクロサービスアーキテクチャ＠アーキテクチャ
description: マイクロサービスアーキテクチャ＠アーキテクチャの知見をまとめました。
---

# マイクロサービスアーキテクチャ＠アーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. イントロダクション

### バックエンドのアーキテクチャの歴史

#### ▼ マイクロサービスアーキテクチャを取り巻く環境

![architecture_history](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/architecture_history.png)

参考：https://tech-blog.rakus.co.jp/entry/20201218/architecture

| 年代    | アーキテクチャ                     | 説明                                                         |
| ------- | ---------------------------------- | ------------------------------------------------------------ |
| 1999 ～ | モノリシックアーキテクチャ         | 1999年台、バックエンドのアーキテクチャとしてモノリシックアーキテクチャが台頭していた。しかし、モノリシックアーキテクチャは無秩序でつぎはぎだらけのアプリケーションになることが論文（『大きな泥だんご』）で指摘された。<br>参考：https://ja.wikipedia.org/wiki/%E5%A4%A7%E3%81%8D%E3%81%AA%E6%B3%A5%E3%81%A0%E3%82%93%E3%81%94 |
| 2014    | マイクロサービスアーキテクチャ     | 2014年にThoughtWorks社は、マイクロサービス指向アーキテクチャとドメイン駆動設計を統合し、アプリケーションを独立したマイクロサービスの集まりに分割するアーキテクチャを考案した。<br>参考：<br>・https://martinfowler.com/articles/microservices.html<br>・https://atmarkit.itmedia.co.jp/ait/articles/2110/22/news006.html |
| 2017    | ミニマイクロサービスアーキテクチャ | マイクロサービスアーキテクチャのマイクロサービス自体を独立したモノリスなアプリケーションと捉えると、その分だけ開発チーム（マネージャーとエンジニア）が必要になってしまう。2017年にCloud Elements社は、これに対処するためにミニマイクロサービスアーキテクチャを考案した。このアーキテクチャでは、マイクロサービスアーキテクチャとモノリスアーキテクチャの間をとった粒度で、アプリケーションを複数のマイクロサービスに分割する。この粒度を、マイクロサービスに対抗して『ミニマイクロサービス』または『MASA』とよぶ。<br>参考：<br>・https://blog.cloud-elements.com/pragmatic-microservices-architecture<br>・https://atmarkit.itmedia.co.jp/ait/articles/2110/22/news006.html |
| 2018    | モジュラーモノリス                 | ミニマイクロサービスアーキテクチャではマイクロサービスの粒度が大きくなったものの、複数のマイクロサービスが必要になることは変わらず、その分だけ開発チームが必要になる問題は解決されなかった。そこで、Root Insurance社はモジュラモノリスを考案した。モジュラモノリスでは、マイクロサービスの概念を取り入れずに、アプリケーションを細かいモジュールに分割する。<br>参考：https://medium.com/@dan_manges/the-modular-monolith-rails-architecture-fb1023826fc4<br>反対に、最初モジュラーモノリスとして設計し、マイクロサービスアーキテクチャに移行していくという選択肢もある。<br>参考：https://creators-note.chatwork.com/entry/2020/12/02/090000#%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%A9%E3%83%A2%E3%83%8E%E3%83%AA%E3%82%B9%E3%81%A8%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3 |

#### ▼ モジュール/マイクロサービスの粒度の比較

![architecture_deployment_comparison](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/architecture_deployment_comparison.png)

参考：https://tech-blog.rakus.co.jp/entry/20201218/architecture

| モジュールの大きさ | 粒度名         | 説明                                                         |
| ------------------ | ------------ | ------------------------------------------------------------ |
| 一番大きい         | モノリシック | アプリケーションのモジュールが分割されておらず、アプリケーションをデプロイの単位とする。 |
|                    | モジュラー   | アプリケーションがモジュールに分割されており、アプリケーションをデプロイの単位とする。モジュール間のデータのやり取りに通信を使うか否かや、モジュール間でDBを共有するか否かの選択によって、作成パターンがいくつかある。<br>参考：https://scrapbox.io/tsuwatch/%E3%83%A2%E3%83%8E%E3%83%AA%E3%82%B9%E3%81%A8%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AE%E3%81%82%E3%81%84%E3%81%A0 |
|                    | ミニマイクロサービス | アプリケーションがサブドメイン（または境界付けられたコンテキスト）を単位としたマイクロサービスに分割されており、アプリケーションを構成するマイクロサービスのある程度のまとまりをデプロイの単位とする。また、DBを各マイクロサービスで共有する。 |
| 一番小さい         | マイクロ     | アプリケーションがサブドメイン（または境界付けられたコンテキスト）を単位としたマイクロサービスまたはルートエンティティに分割されており、アプリケーションを構成するマイクロサービスそれぞれをデプロイの単位とする。また、DBを各マイクロサービスで共有せずに、マイクロサービスごとに設置する。 |

<br>

### マイクロサービスアーキテクチャの特徴

#### ▼ ビジネスのスケーリングに強い

ビジネスがスケーリングする時、マイクロサービスの新規実装または削除を行えば良いため、ドメイン層の激しい変化に強い。

#### ▼ コンウェイの法則が働く

マイクロサービスアーキテクチャにより、組織構造が小さなチームの集まりに変化することを期待できる。

#### ▼ 高頻度でリリース可能

各マイクロサービスを独立してデプロイできるため、高頻度でリリースできる。

#### ▼ 障害の影響が部分的

いずれかのマイクロサービスに障害が起こったとして、サーキットブレイカーを使用することにより、上流マイクロサービスへの障害の波及を食い止められる。そのため、障害の影響が部分的となり、アプリケーション全体が落ちてしまうことがない。

#### ▼ 複数の開発言語を使用可能

マイクロサービス間で、共通のデータ記述言語を使用してデータ通信を行えば、各マイクロサービスの開発言語が異なっていても問題ない。

<br>

### マイクロサービスアーキテクチャのフレームワーク

#### ▼ dapr

参考：

- https://www.publickey1.jp/blog/19/dapr.html
- https://github.com/dapr/dapr

<br>

## 02. リポジトリや開発プロジェクトの粒度

### リポジトリの分割

#### ▼ モノリポジトリ

バックエンドのマイクロサービス、バックエンドから分離されたフロントエンドアプリケーション、IaCツール（KubernetesやTerraformなど）、を1つのリポジトリでディレクトリで分割して管理する。ただし、バックエンド/フロントエンド/IaCツールは異なるモノリポジトリとしても良い。Googleではモノリポジトリによるマイクロサービスアーキテクチャが採用されている。

参考：https://www.fourtheorem.com/blog/monorepo

![monorepo](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/monorepo.png)

#### ▼ ポリリポジトリ

バックエンドのマイクロサービス、バックエンドから分離されたフロントエンドアプリケーション、IaCツール（KubernetesやTerraformなど）、をそれぞれ異なるリポジトリで管理する。リポジトリを分割することで、認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。


参考：https://www.fourtheorem.com/blog/monorepo

![polyrepo](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/polyrepo.png)

<br>

### アプリケーションリポジトリ

#### ▼ 開発環境

アプリエンジニアとインフラエンジニアの責務を完全に分離する場合、アプリエンジニアはIaCツールの存在を知る必要がない。ただし便宜上、アプリエンジニアはDocker compose使用して開発すると良い。各マイクロサービスに```docker-compose.yml```ファイルを置き、基本的には他のマイクロサービスには依存せずに開発できるようにする必要があり、これはモノリポジトリでもポリリポジトリでも同じである。ただし、マイクロサービス間のネットワークを繋げないと、マイクロサービス間で通信できない。そのため、Docker composeの```external```オプションを使用して、マイクロサービス間のネットワークを接続する。

```yaml
# モノリポジトリの場合
backend_mono_repository/
├── src/
│   ├── foo/
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile
│   │   ...
│   │
│   ├── bar/
│   └── baz/
...
```

```yaml
# モノリポジトリの場合
frontend_mono_repository/
├── src/
│   ├── qux/
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile
│   │   ...
│   │
│   ├── quux/
│   └── corge/
...
```

#### ▼ エディタ

多くのエディタでは、専用の設定ファイルがプロジェクトのルートディレクトリに置かれる。基本的には、他のマイクロサービスには依存せずに開発できるようにする必要があり、これはモノリポジトリでもポリリポジトリでも同じである。そこで、各マイクロサービスにエディタの設定ファイルを置くようにする。

```yaml
# モノリポジトリの場合
# JetBrains製品をエディタとする場合
backend_mono_repository/
├── src/
│   ├── foo/
│   │   ├── .idea/
│   │   ...
│   │
│   ├── bar/
│   └── baz/
...
```

```yaml
# モノリポジトリの場合
# JetBrains製品をエディタとする場合
frontend_mono_repository/
├── src/
│   ├── qux/
│   │   ├── .idea/
│   │   ...
│   │
│   ├── quux/
│   └── corge/
...
```

<br>

### コンテナIaCツールリポジトリ

#### ▼ 開発環境

IaCツールにKubernetesを使用した場合を示す。開発環境でKubernetesを稼働させる場合、Skaffoldなどのコンテナイメージビルドツールを使うとよい。この時、コンテナイメージのビルドのために、アプリケーションリポジトリにあるDockerfileを指定する必要がある。開発環境では同じ階層にリポジトリを置いておき、ビルドツールで相対パスを指定することにより、同階層のアプリケーションリポジトリを参照できるようにする。

```yaml
project/
├── backend_mono_repository
├── frontend_mono_repository 
└── manifests_repository # コンテナのIaCツールを管理するリポジトリ
    ├── skaffold.yaml # 相対パスを設定し、mono_repositoryを参照できるようにする。
    ├── argocd/
    ├── kubernetes/
    ├── istio/
    ...
```

<br>

### クラウドインフラIaCツールリポジトリ

IaCツールにTerraformを使用した場合を示す。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_cloud_terraform_policy.html

```yaml
# クラウドインフラのIaCツールを管理するリポジトリ
infrastructure_repository/
├── modules/
├── prd/
├── stg/
...
```

<br>

## 02. 各マイクロサービスの粒度

### マイクロサービス

#### ▼ マイクロサービスとは

![anti-corruption-layer](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anti-corruption-layer.png)

マイクロサービスアーキテクチャにおける分散システム状のバックエンドのコンポーネントのこと。特定のマイクロサービスが他のマイクロサービスに侵食され、マイクロサービスの凝集度が低くならないようにするために、ACL：Anti Corruption Layer（腐食防止レイヤー）を設ける必要がある。腐食防止レイヤーは、異なるコンテキストから受信したデータを、そのマイクロサービスのコンテキストにあったデータ形式に変換する責務を持つ。CQRSでは、これはプロセスマネージャパターンとして知られている。一方でSagaパターンとも呼ばれるが、分散トランザクションでも同じ用語があるため、混乱を避けるためにプロセスマネージャパターンとする。

参考：

- https://github.com/czeslavo/process-manager
- https://www.oreilly.com/library/view/what-is-domain-driven/9781492057802/ch04.html
- https://docs.microsoft.com/ja-jp/previous-versions/msp-n-p/jj591569(v=pandp.10)?redirectedfrom=MSDN

#### ▼ 各マイクロサービスのアーキテクチャ

各マイクロサービスのアーキテクチャは自由である。この時、ドメイン駆動設計のアーキテクチャを基に実装できる。

**＊例＊**

参考：https://little-hands.hatenablog.com/entry/2017/12/07/bouded-context-implementation

ECサイトがあり、これの商品販売ドメインを販売サブドメインと配送サブドメインに分割できるとする。この時、それぞれのサブドメインの問題を解決する販売コンテキストと配送コンテキストをマイクロサービスの粒度となり、オニオンアーキテクチャのアプリケーション間で同期通信/非同期通信を行う。

![microservices-architecture_onion-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/microservices-architecture_onion-architecture.png)

<br>

### マイクロサービスの分割手法

#### ▼ 分割例

| ユースケース | 分割方法          | マイクロサービスの種類                                                                                           | ディレクトリ構成                                    | リンク                                                                                                                                                                                 |
|--------|---------------|-------------------------------------------------------------------------------------------------------|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Eコマース  | 境界付けられたコンテキスト | ・カート<br>・商品検索とインデックス<br>・通貨の変換<br>・クレジットカード<br>・送料と発送<br>・注文確認メール<br>・注文フロー<br>・レコメンド<br>・広告<br>・合成監視 | ```src```ディレクトリに各マイクロサービスのディレクトリを配置する。      | Google：https://github.com/GoogleCloudPlatform/microservices-demo<br>![service_google](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service_google.png)   |
| Eコマース  | 境界付けられたコンテキスト | ・認証<br>・カタログ<br>・顧客<br>・商品                                                                            | ```services```ディレクトリに各マイクロサービスのディレクトリを配置する。 | Mercari：https://github.com/mercari/mercari-microservices-example<br>![service_mercari](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service_mercari.png) |
| Eコマース  | 境界付けられたコンテキスト | ・広告<br>・割引                                                                                            | ルートに各マイクロサービスのディレクトリを配置する。                  | Datadog：https://github.com/DataDog/ecommerce-workshop                                                                                                                               |

#### ▼ サブドメイン、境界付けられたコンテキストを単位とした分割

![service_bounded-context](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service_bounded-context.png)

サブドメインまたは境界付けられたコンテキストをマイクロサービスの粒度とする。解決領域となる境界付けられたコンテキストがサブドメインの中に1つしか含まれていない場合は、境界付けられたコンテキストをマイクロサービスの粒度して考えることになる。図にて、境界付けられたコンテキスト間で、『利用者』という単語に対する定義づけ/意味合いが異なっていることに留意する。ドメイン駆動設計では境界付けられたコンテキストが1つのアプリケーションに相当するため、境界付けられたコンテキストで分割した場合、マイクロサービスアーキテクチャは複数のアプリケーションから構成されるアーキテクチャと捉えられる。さらに小さな粒度に分割する方法として、ルートエンティティを粒度ともできる。

参考：

- https://docs.microsoft.com/ja-jp/dotnet/architecture/microservices/architect-microservice-container-applications/identify-microservice-domain-model-boundaries
- https://microservices.io/patterns/decomposition/decompose-by-subdomain.html
- https://www.amazon.co.jp/dp/4873119316/
- https://booth.pm/ja/items/1835632

#### ▼ ルートエンティティを単位とした分割

ルートエンティティをマイクロサービスの単位とする。ただし、データに着目した従来のステートソーシングのルートエンティティを使用することはアンチパターンである。最良な解決策として、振舞に着目したイベントソーシングを使用する必要がある。また、各マイクロサービスを名詞ではなく動詞で命名すると良い。その他、各マイクロサービスでDBを完全に独立させることや、SAGAパターンを使用すること、がある。

参考：

- https://www.koslib.com/posts/entity-services-anti-pattern/
- https://www.michaelnygard.com/blog/2018/01/services-by-lifecycle/
- https://medium.com/transferwise-engineering/how-to-avoid-entity-services-58bacbe3ee0b

<br>

### 粒度のアンチパターン

#### ▼ 分散モノリス

複数のマイクロサービスをセットでデプロイしなければならず、マイクロサービス間のデプロイが独立していないような粒度のパターン。例えば、マイクロサービス間で重複するロギングライブラリをマイクロサービスとして分離した結果、複数のマイクロサービスがこのロギングマイクロサービスに依存してしまうような場合がある。分散モノリスにならないように、マイクロサービス間で使用するライブラリが重複することを許容する必要がある。

参考：

- https://www.infoq.com/jp/news/2016/03/services-distributed-monolith/
- https://r-kaga.com/blog/what-is-distributed-monolith

<br>

## 03. マイクロサービス間通信の方式

### リクエストリプライ方式

#### ▼ リクエストリプライ方式とは

![service_request_reply](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service_request_reply.png)

マイクロサービス間で相互通信を行う。送信側と受信側で通信処理が同時に実行されるため、HTTPやgRPCによる同期通信を行うことになる。また、マイクロサービス間で直接的にリクエストを送受信することになる。

参考：https://qiita.com/yasuabe2613/items/3bff44e662c922083264#%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E3%83%B3%E3%82%B0%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB%E3%81%AE%E5%95%8F%E9%A1%8C%E9%A0%98%E5%9F%9F

#### ▼ 直接的な通信

リクエストリプライ方式では、直接的にマイクロサービス間の通信を行う。使用することのできる通信プロトコルは以下の通りである。

| プロコトル     | 説明                                                                                                                                                                                                                                                |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 従来のTCP/IP | 従来のTCP/IPプロトコルを使用する。                                                                                                                                                                                                                               |
| gRPC      | HTTP/1.1に代わるHTTP/2が組み込まれたgRPCプロトコルを使用する。HTTPであると、通信相手のマイクロサービスのエンドポイントをコールした後、エンドポイントに紐づくコントローラーのメソッドが実行される。一方でgRPCであると、通信相手のマイクロサービスのメソッドを直接的に実行できる。そのため、HTTPよりもマイクロサービスの連携に適している。<br>参考：https://techdozo.dev/grpc-for-microservices-communication/ |

<br>

### イベント駆動方式

#### ▼ イベント駆動方式とは

![service_event_driven](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service_event_driven.png)

マイクロサービスからマイクロサービスに一方通行の通信を行う。送信側と受信側で通信処理が独立して実行されるため、メッセージキューを介した非同期通信を行うことになる。

参考：

- https://en.wikipedia.org/wiki/Message_queue
- https://qiita.com/yasuabe2613/items/3bff44e662c922083264#%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E3%83%B3%E3%82%B0%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB%E3%81%AE%E5%95%8F%E9%A1%8C%E9%A0%98%E5%9F%9F

#### ▼ メッセージキューを介した通信

イベント駆動方式では、メッセージキューを介してマイクロサービス間の通信を行う。メッセージキューでは受信したメッセージを一方向にしか配信できないため、もしマイクロサービス間双方向に送信したい場合は、上流マイクロサービスからメッセージを受信するメッセージキューと。下流マイクロサービスから受信するメッセージキューを別々に設置する。メッセージキューはPub/Subデザインパターンで自前で実装するか、または外部サービス（AWS-SQS、Kafka、など）を使用する。

参考：

- https://en.wikipedia.org/wiki/Message_queue
- https://www.scaleuptech.com/de/blog/api-gateway-vs-service-mesh-vs-message-queue/

<br>

## 04. マイクロサービス間通信の管理

### 非メッシュ

#### ▼ 非メッシュとは

マイクロサービス間の通信を管理しない。しかし、以下のような問題が起こるため、非推奨である。

- ソフトウェアのコンポーネント間通信を制御しきれない。
- 障害時に何が起こるか分からない。
- 鍵とSSL証明書を管理しきれない。
- ソフトウェアの全体像が把握できない

<br>

### メッシュ

#### ▼ メッシュ

マイクロサービス間で直接的にリクエストを送受信するのではなく、これをサイドカーパターンで設置したリバースプロキシコンテナ経由で行う。また、各サイドカーコンテナをコントロールプレーンで統括的に管理する。これにより、マイクロサービス間の通信をより簡単に管理できる。

#### ▼ サービスメッシュ

![service-mesh](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service-mesh.png)

マイクロサービス間の通信方式でリクエストリプライ方式を採用した場合に使用するメッシュ。

参考：

- https://www.ibm.com/blogs/think/jp-ja/cloud-native-concept-03/#servicemesh
- https://qiita.com/Ladicle/items/4ba57078128d6affadd5
- https://docs.microsoft.com/ja-jp/dotnet/architecture/cloud-native/service-mesh-communication-infrastructure
- https://qiita.com/yasuabe2613/items/3bff44e662c922083264#service-mesh

#### ▼ イベントメッシュ

マイクロサービス間の通信方式でイベント駆動方式を採用した場合に使用するメッシュ。

参考：https://www.redhat.com/ja/topics/integration/what-is-an-event-mesh

<br>

## 05. プレゼンテーションドメイン分離

### プレゼンテーションドメイン分離とは

![presentation_domain_separation](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/presentation_domain_separation.png)

モノリシックなアプリケーションがドメイン層だけでなくプレゼンテーション層のロジックも持っている場合、ドメイン層をマイクロサービスに分離する前に、プレゼンテーション層をフロントエンドアプリケーションとして分離しておく必要がある。

参考：

- https://docs.microsoft.com/ja-jp/azure/architecture/microservices/migrate-monolith
- https://bliki-ja.github.io/PresentationDomainSeparation/
- https://tech.mti.co.jp/entry/2021/04/12/112833

<br>

### API Gateway

#### ▼ API Gatewayとは

![microservices_api-gateway-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/microservices_api-gateway-pattern.png)

クリーンアーキテクチャでいうインフラストラクチャ層とインターフェース層のような機能を担う。

- 受信したインバウンド通信を適切なマイクロサービスにルーティング
- 認証
- トレースIDの付与
- キャッシュの作成
- リクエスト制限

参考：

- https://banzaicloud.com/blog/backyards-api-gateway/#api-gateway-pattern
- https://www.getambassador.io/resources/challenges-api-gateway-kubernetes/

<br>

### 設計パターン

#### ▼ RESTful-API

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_collaboration_api_restful.html

#### ▼ GraphQL-API

従来のRESTful-APIを使用した場合、バックエンドのエンドポイントが増えるたびに、フロントエンドが指定すべきエンドポイントも増えていく。一方で、GraphQL-APIを使用した場合、単一のエンドポイントをGraphQLで指定すれば、GraphQL-APIが適切な宛先にルーティングしてくれる。

参考：https://www.apollographql.com/blog/graphql/basics/graphql-vs-rest/

![graphql-api](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/graphql-api.png)

<br>

### 実装パターン

#### ▼ 自前で実装

API Gatewayを自前で実装する。Kubernetes内で管理できるメリットがある。

参考：https://techblog.zozo.com/entry/zozotown-phased-istio-service-meshing-strategy

#### ▼ OSSを使用

API GatewayのOSS（Kong、Tyk、Apigee）を使用する。Kubernetes内で管理できるメリットがある。

参考：https://www.moesif.com/blog/technical/api-gateways/How-to-Choose-The-Right-API-Gateway-For-Your-Platform-Comparison-Of-Kong-Tyk-Apigee-And-Alternatives/ 

#### ▼ クラウドプロバイダーのマネージドサービスを使用

クラウドプロバイダー（例：AWS）が提供するAPI Gatewayを使用する。クラウドプロバイダーの対応状況によっては、Kubernetes内で管理できない可能性がある。その場合、フロントエンドアプリケーションがAPI Gatewayに通信を送信できるように、フロントエンドアプリケーションとバックエンドアプリケーションを異なるKubernetesで動かす必要がある。

参考：https://aws.amazon.com/jp/blogs/news/api-gateway-as-an-ingress-controller-for-eks/

<br>

### 設置パターン

#### ▼ Public API

マイクロサービスにリクエストを送信するアプリケーションの種類に関係なく、API Gatewayを1つだけ作成する。

参考：https://www.mobilelive.ca/blog/why-backend-for-frontend-application-architecture/

![apigateway_public-api-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/apigateway_public-api-pattern.png)

#### ▼ BFF：Backends  For Frontends

マイクロサービスにリクエストを送信するアプリケーションの種類（Webアプリケーション、Mobileアプリケーション、他社アプリケーション）に応じたAPI Gatewayを作成する。ただし、複数のクライアントをWebアプリとして開発することもできるため、同じWebからのアクセスであっても、別々のAPI Gatewayを作成する場合がある。

参考：

- https://www.mobilelive.ca/blog/why-backend-for-frontend-application-architecture/
- https://codezine.jp/article/detail/11305?p=4

![apigateway_bff-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/apigateway_bff-pattern.png)

<br>

## 06. データ永続化方式

### ローカルトランザクション

#### ▼ ローカルトランザクションとは

1つのトランザクション処理によって、1つのマイクロサービスのDBを操作する方法。推奨される。マイクロサービスアーキテクチャでローカルトランザクションを使用する場合、これを連続的に行う仕組みが必要になる。デザインパターンとして、Sagaパターン、TCCパターン、などがある。

参考：https://software.fujitsu.com/jp/manual/manualfiles/M090098/B1WS0321/03Z200/B0321-00-03-12-01.html

#### ▼ ローカルトランザクションの種類

参考：https://qiita.com/yasuabe2613/items/b0c92ab8c45d80318420#%E3%83%AD%E3%83%BC%E3%82%AB%E3%83%AB%E3%83%88%E3%83%A9%E3%83%B3%E3%82%B6%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E7%A8%AE%E9%A1%9E

<br>

### グローバルトランザクション（分散トランザクション）

#### ▼ グローバルトランザクションとは

分散トランザクションとも言う。1つのトランザクション処理によって、複数のマイクロサービスのDBを操作する方法。非推奨である。

参考：https://thinkit.co.jp/article/14639?page=0%2C1

<br>

## 06-02. Sagaパターン

### Sagaパターンとは

#### ▼ Sagaパターンの仕組み

![saga-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/saga-pattern.png)

複数のローカルトランザクションを非同期通信で連続的に実行する方法。上流マイクロサービスのローカルトランザクションの完了をイベントとして、下流マイクロサービスのDB処理を連続的にコールしていく。ロールバックの代わりに、補償トランザクションという仕組みを実装する必要がある。補償トランザクションでは、いずれかのローカルトランザクションが失敗した時に、それ以前の各ローカルトランザクションの実行結果を元に戻すような逆順のクエリ処理が実行される。

参考：

- https://thinkit.co.jp/article/14639?page=0%2C1
- https://qiita.com/nk2/items/d9e9a220190549107282
- https://qiita.com/yasuabe2613/items/b0c92ab8c45d80318420

#### ▼ 補償トランザクション

ローカルトランザクションを逆順に実行し、Sagaパターンによるトランザクションの結果を元に戻す仕組みのこと。

**＊例＊**

受注に関するトランザクションが異なるマイクロサービスにまたがる例。

参考：https://docs.microsoft.com/ja-jp/dotnet/architecture/cloud-native/distributed-data#distributed-transactions

![saga-pattern_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/saga-pattern_example.png)

補償トランザクションによって、各ローカルトランザクションを元に戻す逆順のクエリ処理が実行される。

![saga-pattern_compensating_transaction_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/saga-pattern_compensating-transaction_example.png)

<br>

### Orchestration（オーケストレーション）

#### ▼ オーケストレーションとは

![orchestration](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/orchestration.png)

Sagaパターンにて、一連のローカルトランザクションの実行をまとめて制御する責務を持ったコンポーネント（オペレーションサービス）を設置する。1つのリクエストが送信された時に、オーケストレーションプログラムは各マイクロサービスをコールしながら処理の結果を繋いでいく。マイクロサービスアーキテクチャだけでなく、サービス指向アーキテクチャでも使用される。オーケストレーションが推奨である。

参考：

- https://blogs.itmedia.co.jp/itsolutionjuku/2019/08/post_729.html
- https://news.mynavi.jp/itsearch/article/devsoft/1598
- https://medium.com/google-cloud-jp/gcp-saga-microservice-7c03a16a7f9d
- https://www.fiorano.com/jp/blog/integration/integration-architecture/%E3%82%B3%E3%83%AC%E3%82%AA%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A3-vs-%E3%82%AA%E3%83%BC%E3%82%B1%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3/

#### ▼ ローカルトランザクションの連携方式

マイクロサービス間のローカルトランザクションの連携方式として、メッセージキューを使用する。各マイクロサービスがイベントのパブリッシュとサブスクライブを行う。各マイクロサービスは、自身の次に実行されるマイクロサービスを知らない。各マイクロサービスは、処理結果をオーケストレーターに返却する。

参考：

- https://www.12-technology.com/2021/08/dbsaga.html
- https://qiita.com/somen440/items/a6c323695627235128e9
- https://www.12-technology.com/2021/08/dbsaga.html

![orchestration_message-queue](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/orchestration_message-queue.png)

<br>

### Choreography（コレオグラフィ）

#### ▼ コレオグラフィとは

![choreography](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/choreography.png)

Sagaパターンにて、各マイクロサービスで下流マイクロサービスに連携する責務を持たせ、ローカルトランザクションを連続的に実行する。1つのリクエストが送信された時に、マイクロサービスからマイクロサービスに処理が繋がっていく。

参考：

- https://blogs.itmedia.co.jp/itsolutionjuku/2019/08/post_729.html
- https://zenn.dev/yoshii0110/articles/74dfcf4132a805
- https://www.fiorano.com/jp/blog/integration/integration-architecture/%E3%82%B3%E3%83%AC%E3%82%AA%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A3-vs-%E3%82%AA%E3%83%BC%E3%82%B1%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3/

**＊実装例＊**

以下のリポジトリを参考にせよ。

参考：https://github.com/fedeoliv/microservices-transactions

![choreography_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/choreography_example.png)

#### ▼ ローカルトランザクションの連携方式

マイクロサービス間のローカルトランザクションの連携方式として、メッセージキューを使用する。各マイクロサービスがイベントのパブリッシュとサブスクライブを行う。各マイクロサービスは、自身の次に実行されるマイクロサービスを知っている。各マイクロサービスは、次のマイクロサービスにイベントを渡せる別のキューに処理結果を返却する。

参考：https://www.12-technology.com/2021/08/dbsaga.html

![choreography_message-queue](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/choreography_message-queue.png)

<br>

## 07. オブジェクトモデリング方式

### イベントソーシング

#### ▼ イベントソーシングとは

ビジネスの出来事をモデリングし、データとして永続化する。現在の状態を取得する場合は、初期のデータに全ての出来事を適用する。CQRSと相性が良い。

参考：

- https://qiita.com/suin/items/f559e3dcde7c811ed4e1
- https://martinfowler.com/articles/201701-event-driven.html

<br>

### ステートソーシング

#### ▼ ステートソーシングとは

ビジネスの現在の状態をモデリングし、データとして永続化する。過去の状態は上書きされる。

参考：http://masuda220.jugem.jp/?eid=435

<br>

## 08. 認証

### Form認証

#### ▼ 独立型

セッションデータを生成する認証マイクロサービスを1つだけ配置し、セッションベースのForm認証を実現する。各マイクロサービスはセッションデータに基づいてユーザーを認証する。1つのセッション中の認証情報をマイクロサービス間で共有するために、セッションデータを保存できるセッションストレージを各マイクロサービスに配置する。認証マイクロサービスが単一障害点になるというデメリットがある。

参考：

- https://please-sleep.cou929.nu/microservices-auth-design.html
- https://engineer.retty.me/entry/2019/12/21/171549

![micro-auth_type_sso](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/micro-auth_type_sso.png)

#### ▼ 中央集権型

セッションデータを生成する認証マイクロサービスを1つだけ配置し、セッションベースのForm認証を実現する。各マイクロサービスはセッションデータに基づいてユーザーを認証する。1つのセッション中の認証情報をマイクロサービス間で共有するために、セッションデータを保存できるセッションストレージを1つだけ配置する。耐障害性のあるセッションストレージが必要になるというデメリットがある。

参考：

- https://please-sleep.cou929.nu/microservices-auth-design.html
- https://engineer.retty.me/entry/2019/12/21/171549

![micro-auth_type_centralization](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/micro-auth_type_centralization.png)

#### ▼ 分散型

JWTを生成する認証マイクロサービスを1つだけ配置し、CookieベースのForm認証を実現する。各マイクロサービスはJWTに基づいてユーザーを認証する。1つのセッション中の認証情報をマイクロサービス間で共有するために、リクエスト/レスポンスのヘッダーにJWTを埋め込み、クライアント側にJWTを保存させる。クライアント側に保存されたJWTの失効が難しいというデメリットがある。

参考：

- https://please-sleep.cou929.nu/microservices-auth-design.html
- https://engineer.retty.me/entry/2019/12/21/171549

![micro-auth_type_distribution](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/micro-auth_type_distribution.png)

#### ▼ ゲートウェイ分散型

JWTを生成する認証マイクロサービスを1つだけ配置し、CookieベースのForm認証を実現する。各マイクロサービスはJWTに基づいてユーザーを認証する。1つのセッション中の認証情報をマイクロサービス間で共有するために、リクエスト/レスポンスのヘッダーにJWTを埋め込む。ただ分散型の認証とは異なり、クライアント側にはJWTの代わりとなるOpaqueトークンを保存させるようにする。また、API Gatewayやロードバランサーで、OpaqueトークンとJWTの間の相互変換を通信のたびに実行する。

参考：

- https://please-sleep.cou929.nu/microservices-auth-design.html
- https://engineer.retty.me/entry/2019/12/21/171549

![micro-auth_type_gateway-distribution](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/micro-auth_type_gateway-distribution.png)

<br>

## 08-02. 認可

### 分散型

マイクロサービスが個別に認可を担う。各マイクロサービスで認可処理が重複する可能性がある。

参考：https://please-sleep.cou929.nu/microservices-auth-design.html

<br>

### 中央集権型

全てのマイクロサービスの認可処理を担うマイクロサービスを1つだけ配置する。各マイクロサービスの認可処理が密結合になる可能性がある。

参考：https://please-sleep.cou929.nu/microservices-auth-design.html

<br>

## 09. マイクロサービスにおけるテスト

### CDCテスト：Consumer Drive Contract

#### ▼ CDCテストとは

マイクロサービスのコントローラーがコールされてから、DBの操作が完了するまでを、テストする。下流マイクロサービスのコールはモック化またはスタブ化する。

<br>

### カオスエンジニアリング

#### ▼ カオスエンジニアリング

実験的に、本番環境のマイクロサービスに『カオス』を挿入し、高負荷な状態に至らせる。その結果から、マイクロサービスに潜む想定外の問題を表面化させる。カオスエンジニアリングは、今まさに実際のユーザーが使用しているソフトウェアに対して実施することになるため、ビジネスサイドの理解が必要になる。本格的なマイクロサービスを採用している日系企業は少なく、国内事例はまだ少ない。

参考：

- https://principlesofchaos.org/
- https://codezine.jp/article/detail/14526

#### ▼ 手順

参考：https://zenn.dev/hodagi/articles/3ce6ccdb00538c

1. 本番環境のマイクロサービスから様々なテレメトリーを収集し、安定している通常状態（定常状態）を定義する。
2. 定常状態を対照群、またカオスエンジニアリングが実施された状態を実験群とする。『実験群では障害が起こる』という仮説の下、これを反証することを目指す。
3. 実験群でカオスエンジニアリングを実施する。
4. 対照群と比較し、『障害は起こる』という仮説を反証する。

<br>

## 10. 運用

### 障害対策

#### ▼ サーキットブレイカー

マイクロサービス間に設置され、他のマイクロサービスに連鎖する障害を吸収するプログラムのこと。下流マイクロサービスに障害が起こった時に、上流マイクロサービスにエラーを返してしまわないよう、直近の成功時の処理結果を返信する。

![circuit-breaker](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/circuit-breaker.png)

<br>

### 横断的な監視

#### ▼ 分散トレーシング

マイクロサービス間で分散してしまう各ログを、一意なIDで紐付ける方法。

![distributed-tracing](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/distributed-tracing.png)
