---
title: 【IT技術の知見】マイクロサービスアーキテクチャ＠アーキテクチャ
description: マイクロサービスアーキテクチャ＠アーキテクチャの知見を記録しています。
---

# マイクロサービスアーキテクチャ＠アーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. イントロダクション

### バックエンドのアーキテクチャの歴史

#### ▼ マイクロサービスアーキテクチャを取り巻く環境

![architecture_history](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/architecture_history.png)

| 年代         | アーキテクチャ                     | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 補足                                                                                                                                                                                                                   |
| ------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1999         | モノリシックアーキテクチャ         | 1999年台、バックエンドのアーキテクチャとしてモノリシックアーキテクチャが台頭していた。しかし、モノリシックアーキテクチャは無秩序でつぎはぎだらけのアプリケーションになることが論文 (『大きな泥だんご』) で指摘された。                                                                                                                                                                                                                                                                                             | ・https://en.wikipedia.org/wiki/Big_ball_of_mud                                                                                                                                                                        |
| 2000 〜 2004 | サービス指向アーキテクチャ         | モノリシックアーキテクチャの批判を受け、〇〇 (提唱者が見つからず) がアプリケーションを機能の粒度で分割するアーキテクチャを提唱した。ただ『機能』という粒度が抽象的で、概念としては提唱されていても、実装方法の確立にまでは至らなかった。                                                                                                                                                                                                                                                                           | ・https://en.wikipedia.org/wiki/Service-oriented_architecture                                                                                                                                                          |
| 2014         | マイクロサービスアーキテクチャ     | 2014年にThoughtWorks社は、サービス指向アーキテクチャとドメイン駆動設計を統合し、アプリケーションを独立したマイクロサービスの集まりに分割するアーキテクチャを提唱した。サービス指向アーキテクチャにドメイン駆動設計の高凝集/低結合の考え方を取り入れることで、実装可能な理論に昇華させた。                                                                                                                                                                                                                          | ・https://martinfowler.com/articles/microservices.html <br>・https://atmarkit.itmedia.co.jp/ait/articles/2110/22/news006.html                                                                                          |
| 2017         | ミニマイクロサービスアーキテクチャ | マイクロサービスアーキテクチャのマイクロサービス自体を独立したモノリスなアプリケーションと捉えると、その分だけ開発チーム (マネージャーとエンジニア) が必要になってしまう。2017年にCloud Elements社は、これに対処するためにミニマイクロサービスアーキテクチャを提唱した。このアーキテクチャでは、マイクロサービスアーキテクチャとモノリスアーキテクチャの間をとった粒度で、アプリケーションを複数のマイクロサービスに分割する。この粒度を、マイクロサービスに対抗して『ミニマイクロサービス』または『MASA』とよぶ。 | ・https://blog.cloud-elements.com/pragmatic-microservices-architecture <br>・https://atmarkit.itmedia.co.jp/ait/articles/2110/22/news006.html                                                                          |
| 2018         | モジュラーモノリス                 | ミニマイクロサービスアーキテクチャではマイクロサービスの粒度が大きくなったものの、複数のマイクロサービスが必要になることは変わらず、その分だけ開発チームが必要になる問題は解決されなかった。そこで、Root Insurance社はモジュラモノリスを提唱した。モジュラモノリスでは、マイクロサービスの概念を取り入れずに、アプリケーションを細かいモジュールに分割する。反対に、最初モジュラーモノリスとして設計し、マイクロサービスアーキテクチャに移行していくという選択肢もある。                                           | ・https://medium.com/@dan_manges/the-modular-monolith-rails-architecture-fb1023826fc4 <br>・https://creators-note.chatwork.com/entry/2020/12/02/090000 <br>・https://eh-career.com/engineerhub/entry/2022/07/25/093000 |

> - https://tech-blog.rakus.co.jp/entry/20201218/architecture

#### ▼ モジュール/マイクロサービスの粒度の比較

![architecture_deployment_comparison](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/architecture_deployment_comparison.png)

| モジュールの大きさ | 粒度名               | 説明                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 一番大きい         | モノリシック         | アプリケーションのモジュールが分割されておらず、アプリケーションをデプロイの単位とする。                                                                                                                                                                                                                                                                                                                               |
|                    | モジュラー           | アプリケーションがモジュールに分割されており、アプリケーションをデプロイの単位とする。モジュール間のデータのやり取りに通信を使用するか否かや、モジュール間でDBを共有するか否かの選択によって、作成パターンがいくつかある。<br>・https://scrapbox.io/tsuwatch/%E3%83%A2%E3%83%8E%E3%83%AA%E3%82%B9%E3%81%A8%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AE%E3%81%82%E3%81%84%E3%81%A0 |
|                    | ミニマイクロサービス | アプリケーションがサブドメイン (または境界付けられたコンテキスト) を単位としたマイクロサービスに分割されており、アプリケーションを構成するマイクロサービスのある程度のまとまりをデプロイの単位とする。また、DBを各マイクロサービスで共有する。                                                                                                                                                                         |
| 一番小さい         | マイクロ             | アプリケーションがサブドメイン (または境界付けられたコンテキスト) を単位としたマイクロサービスまたはルートエンティティに分割されており、アプリケーションを構成するマイクロサービスそれぞれをデプロイの単位とする。また、DBを各マイクロサービスで共有せずに、マイクロサービスごとに配置する。                                                                                                                           |

> - https://tech-blog.rakus.co.jp/entry/20201218/architecture

<br>

### マイクロサービスアーキテクチャの特徴

#### ▼ ビジネスのスケーリングに強い

ビジネスがスケーリングする時、マイクロサービスの新規実装または削除を行えば良いため、ドメイン層の激しい変化に強い。

#### ▼ コンウェイの法則が働く

マイクロサービスアーキテクチャにより、組織構造が小さなチームの集まりに変化することを期待できる。

#### ▼ 高頻度でリリース可能

各マイクロサービスを独立してデプロイできるため、高頻度でリリースできる。

#### ▼ 障害の影響が部分的

いずれかのマイクロサービスに障害が発生したとして、サーキットブレイカーを使用することにより、ダウンストリーム側マイクロサービスへの障害の波及を食い止められる。

そのため、障害の影響が部分的となり、アプリケーション全体が落ちてしまうことがない。

#### ▼ 複数の開発言語を使用可能

マイクロサービス間で、共通のデータ記述言語を使用してデータ通信を行えば、各マイクロサービスの開発言語が異なっていても問題ない。

<br>

### マイクロサービスアーキテクチャのフレームワーク

#### ▼ dapr

> - https://www.publickey1.jp/blog/19/dapr.html
> - https://github.com/dapr/dapr

<br>

## 02. リポジトリや開発プロジェクトの粒度

### リポジトリの分割

#### ▼ リポジトリ分割のメリット

リポジトリを分割することにより、以下のメリットがある。

- 認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。

ただし、バージョン管理システム (例：GitHub) によっては、リポジトリのディレクトリ単位で認可スコープを設定できるものがある。

> - https://docs.github.com/ja/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
> - https://qiita.com/FumiyaShibusawa/items/c7a3ff4d0793ca2d281f

#### ▼ モノリポジトリ

バックエンドのマイクロサービス、バックエンドから分離されたフロントエンドアプリケーション、IaCツール (例：Kubernetes、Terraformなど) 、を`1`個のリポジトリでディレクトリで分割して管理する。

ただし、バックエンド/フロントエンド/IaCツールは異なるモノリポジトリとしても良い。

Googleではモノリポジトリによるマイクロサービスアーキテクチャが採用されており、独自のバージョン管理システム (Piper/CitC) を使用している。

その他にも、アメリカのIT大企業 (例：Facebook、Microsoft、Uber、Airbnb、Twitter、など) でもモノリポを採用している。

![monorepo](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/monorepo.png)

> - https://en.wikipedia.org/w/index.php?title=Monorepo
> - https://www.fourtheorem.com/blog/monorepo
> - https://www.school.ctc-g.co.jp/columns/nakai2/nakai220.html

#### ▼ ポリリポジトリ

バックエンドのマイクロサービス、バックエンドから分離されたフロントエンドアプリケーション、IaCツール (例：Kubernetes、Terraformなど) 、をそれぞれ異なるリポジトリで管理する。

![polyrepo](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/polyrepo.png)

> - https://www.fourtheorem.com/blog/monorepo

<br>

### アプリケーションリポジトリ

#### ▼ 開発環境

アプリエンジニアとインフラエンジニアの責務を完全に分離する場合、アプリエンジニアはIaCツールの存在を知る必要がない。

ただし便宜上、アプリエンジニアはDocker compose使用して開発すると良い。

各マイクロサービスに`docker-compose.yml`ファイルを置き、基本的には他のマイクロサービスには依存せずに開発可能にする必要があり、これはモノリポジトリでもポリリポジトリでも同じである。

ただし、マイクロサービス間のネットワークを繋げないと、マイクロサービス間でパケットを送受信できない。そのため、Docker composeの`external`オプションを使用して、マイクロサービス間のネットワークを接続する。

この時に、開発環境でサービスメッシュを使用している場合、マイクロサービス間の通信で名前解決しやすい。

一方で、これを使用していない場合、開発環境のみでコンテナのホスト名を指定する。

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
│
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
│
```

#### ▼ エディタ

多くのエディタでは、専用の設定ファイルがプロジェクトのルートディレクトリに置かれる。

基本的には、他のマイクロサービスには依存せずに開発可能にする必要があり、これはモノリポジトリでもポリリポジトリでも同じである。

そこで、各マイクロサービスにエディタの設定ファイルを置くようにする。

```yaml
# バックエンドモノリポジトリの場合
# JetBrains製品をエディタとする場合
backend_mono_repository/
├── src/
│   ├── foo/
│   │   ├── .idea/
│   │   ...
│   │
│   ├── bar/
│   └── baz/
│
```

```yaml
# フロントエンドモノリポジトリの場合
# JetBrains製品をエディタとする場合
frontend_mono_repository/
├── src/
│   ├── qux/
│   │   ├── .idea/
│   │   ...
│   │
│   ├── quux/
│   └── corge/
│
```

<br>

### コンテナIaCツールリポジトリ

#### ▼ 開発環境

IaCツールにKubernetesを使用した場合を示す。

開発環境でKubernetesを稼働させる場合、Skaffoldなどのコンテナイメージビルドツールを使用すると良い。

この時、コンテナイメージのビルドのために、アプリケーションリポジトリにあるDockerfileを指定する必要がある。

開発環境では同じ階層にリポジトリを置いておき、ビルドツールで相対パスを指定することにより、同階層のアプリケーションリポジトリを参照可能にする。

```yaml
project/
├── backend_mono_repository
├── frontend_mono_repository
└── manifests_repository # コンテナのIaCツールを管理するリポジトリ
    ├── skaffold.yaml # 相対パスを設定し、mono_repositoryを参照可能にする。
    ├── argocd/
    ├── kubernetes/
    ├── istio/
    ...
```

<br>

### クラウドインフラIaCツールリポジトリ

IaCツールにTerraformを使用した場合を示す。

```yaml
# クラウドインフラのIaCツールを管理するリポジトリ
infrastructure_repository/
├── modules/
├── prd/
├── stg/
│
```

<br>

## 03. 各マイクロサービスの粒度

### マイクロサービス

#### ▼ マイクロサービスとは

![anti-corruption-layer](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anti-corruption-layer.png)

マイクロサービスアーキテクチャにおける分散システム状のバックエンドのコンポーネントのこと。

特定のマイクロサービスが他のマイクロサービスに侵食され、マイクロサービスの凝集度が低くならないようにするために、ACL：Anti Corruption Layer (腐食防止レイヤー) を設ける必要がある。

腐食防止レイヤーは、異なるコンテキストから受信したデータを、そのマイクロサービスのコンテキストにあったデータ形式に変換する責務を持つ。

CQRSでは、これはプロセスマネージャパターンとして知られている。

一方でSagaパターンとも呼ばれるが、分散トランザクションでも同じ用語があるため、混乱を避けるためにプロセスマネージャパターンとする。

> - https://github.com/czeslavo/process-manager
> - https://www.oreilly.com/library/view/what-is-domain-driven/9781492057802/ch04.html
> - https://docs.microsoft.com/ja-jp/previous-versions/msp-n-p/jj591569(v=pandp.10)?redirectedfrom=MSDN

#### ▼ 各マイクロサービスのアーキテクチャ

各マイクロサービスのアーキテクチャは自由である。

この時、ドメイン駆動設計のアーキテクチャを基に実装できる。

**＊例＊**

ECサイトがあり、これの商品販売ドメインを販売サブドメインと配送サブドメインに分割できるとする。

この時、それぞれのサブドメインの問題を解決する販売コンテキストと配送コンテキストをマイクロサービスの粒度となり、オニオンアーキテクチャのアプリケーション間で同期通信/非同期通信を実行する。

![microservices-architecture_onion-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices-architecture_onion-architecture.png)

> - https://little-hands.hatenablog.com/entry/2017/12/07/bouded-context-implementation

<br>

### マイクロサービスの分割手法

#### ▼ サブドメイン、境界付けられたコンテキストを単位とした分割

サブドメインまたは境界付けられたコンテキストをマイクロサービスの粒度とする。

| 現状のモノリスの分割段階                                                 | 境界付けられたコンテキスト | サブドメイン | 機能単位  |
| ------------------------------------------------------------------------ | :------------------------: | :----------: | :-------: |
| すでにサブドメインに分割されている                                       |            不可            |     不可     | 記入中... |
| すでに複数のサブドメインを含む境界付けられたコンテキストに分割されている |            不可            |      可      | 記入中... |
| すでに単一のサブドメインを含む境界付けられたコンテキストに分割されている |             可             |      可      | 記入中... |

> - https://qiita.com/crossroad0201/items/32673d3e52e006205c48#ddd%E3%81%A8%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AE%E3%83%91%E3%82%BF%E3%83%BC%E3%83%B3%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6%E3%81%AE%E8%80%83%E5%AF%9F

解決領域となる境界付けられたコンテキストがサブドメインの中に`1`個しか含まれていない場合は、境界付けられたコンテキストをマイクロサービスの粒度して考えることになる。

図にて、境界付けられたコンテキスト間で、『利用者』という単語に対する定義づけ/意味合いが異なっていることに留意する。

ドメイン駆動設計では境界付けられたコンテキストが`1`個のアプリケーションに相当するため、境界付けられたコンテキストで分割した場合、マイクロサービスアーキテクチャは複数のアプリケーションから構成されるアーキテクチャと捉えられる。

加えて小さな粒度に分割する方法として、ルートエンティティを粒度ともできる。

![service_bounded-context](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service_bounded-context.png)

> - https://docs.microsoft.com/ja-jp/dotnet/architecture/microservices/architect-microservice-container-applications/identify-microservice-domain-model-boundaries
> - https://microservices.io/patterns/decomposition/decompose-by-subdomain.html
> - https://www.amazon.co.jp/dp/4873119316/
> - https://booth.pm/ja/items/1835632

#### ▼ ルートエンティティを単位とした分割

ドメイン層のルートエンティティをマイクロサービスの単位とする。

この場合、境界付けられたコンテキストよりもマイクロサービスの粒度が小さいため、複数のマイクロサービスで1つの境界付けられたコンテキストを構成することになり、異なるマイクロサービスが同じ種類のデータを持つオブジェクトを処理する。

ドメイン層にはマイクロサービス (例：〇〇ドメインサービス) があり、ドメイン層以外のレイヤー (インターフェース層、ユースケース層、リポジトリ層) はマイクロサービスではない。

ただし、データに着目した従来のステートソーシングのルートエンティティを使用することはアンチパターンである。

最良な解決策として、振舞に着目したイベントソーシングを使用する必要がある。

また、各マイクロサービスを名詞ではなく動詞 (例：〇〇管理サービス、〇〇中継サービス、〇〇通知サービス、〇〇集計サービス) で命名すると良い。

その他、各マイクロサービスでDBを完全に独立させることや、SAGAパターンを使用すること、がある。

> - https://www.koslib.com/posts/entity-services-anti-pattern/
> - https://www.michaelnygard.com/blog/2018/01/services-by-lifecycle/
> - https://medium.com/transferwise-engineering/how-to-avoid-entity-services-58bacbe3ee0b

#### ▼ 詳細機能を単位とした分割

全てのレイヤー (インターフェース層、ユースケース層、ドメイン層、リポジトリ層) で詳細機能をマイクロサービスの単位とする。

この場合、境界付けられたコンテキストよりもマイクロサービスの粒度が小さいため、複数のマイクロサービスで1つの境界付けられたコンテキストを構成することになり、異なるマイクロサービスが同じ種類のデータを持つオブジェクトを処理する。

各レイヤーにマイクロサービスがいる (例：〇〇インターフェースサービス、〇〇ユースケースサービス、〇〇ドメインサービス、〇〇リポジトリサービス) ため、数が非常に多くなってしまうデメリットがある。

また、各レイヤーのマイクロサービス自体もレイヤーを持つ (〇〇リポジトリサービスが、インターフェース層からリポジトリ層までを持つ) 。

各マイクロサービスを名詞ではなく動詞 (例：〇〇管理サービス、〇〇中継サービス、〇〇通知サービス、〇〇集計サービス) で命名すると良い。

<br>

### 分割例

| ユースケース     | 分割方法                   | マイクロサービスの種類                                                                                                                                                 | ディレクトリ構成規約                                                 | リンク                                                                                                                                                                                             |
| ---------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eコマース        | 境界付けられたコンテキスト | ・カート<br>・商品検索とインデックス<br>・通貨の変換<br>・クレジットカード<br>・送料と発送<br>・注文確認メール<br>・注文フロー<br>・レコメンド<br>・広告<br>・合成監視 | `src`ディレクトリに各マイクロサービスのディレクトリを配置する。      | ![service_google](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service_google.png)<br>https://github.com/GoogleCloudPlatform/microservices-demo                  |
| Eコマース        | 境界付けられたコンテキスト | ・認証<br>・カタログ<br>・顧客<br>・商品                                                                                                                               | `services`ディレクトリに各マイクロサービスのディレクトリを配置する。 | ![service_mercari](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service_mercari.png)<br>https://github.com/mercari/mercari-microservices-example                 |
| Eコマース        | 境界付けられたコンテキスト | ・広告<br>・割引                                                                                                                                                       | ルートに各マイクロサービスのディレクトリを配置する。                 | ・https://github.com/DataDog/ecommerce-workshop                                                                                                                                                    |
| SNS (Twitter)    | 境界付けられたコンテキスト | いっぱい                                                                                                                                                               | 実装方法は不明                                                       | ![service_twitter](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service_twitter.png)<br>https://www.codekarle.com/system-design/Twitter-system-design.html       |
| 地図 (GoogleMap) | 境界付けられたコンテキスト | いっぱい                                                                                                                                                               | 実装方法は不明                                                       | ![service_google-map](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service_google-map.png)<br>https://www.codekarle.com/system-design/Twitter-system-design.html |

<br>

### 粒度のアンチパターン

#### ▼ 分散モノリス

複数のマイクロサービスをセットでデプロイしなければならず、マイクロサービス間のデプロイが独立していないような粒度のパターン。

例えば、マイクロサービス間で重複するロギングライブラリをマイクロサービスとして分離した結果、複数のマイクロサービスがこのロギングマイクロサービスに依存してしまうような場合がある。

分散モノリスにならないように、マイクロサービス間で使用するライブラリが重複することを許容する必要がある。

> - https://www.infoq.com/jp/news/2016/03/services-distributed-monolith/
> - https://r-kaga.com/blog/what-is-distributed-monolith

<br>

## 04. プレゼンテーションドメイン分離

### プレゼンテーションドメイン分離とは

![presentation_domain_separation](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/presentation_domain_separation.png)

アプリケーションには3つの段階がある。

モノリスの段階では、フロントエンドとバックエンドが1つのアプリケーションで密結合になっている。

フロントエンドとバックエンドを分離した段階では、フロントエンドとバックエンドが異なるアプリケーションとして分離される。

マイクロサービスでの段階では、さらにバックエンドが複数のアプリケーションに分離される。

> - https://cloud.google.com/architecture/devops/devops-tech-architecture
> - https://docs.microsoft.com/ja-jp/azure/architecture/microservices/migrate-monolith
> - https://bliki-ja.github.io/PresentationDomainSeparation/
> - https://tech.mti.co.jp/entry/2021/04/12/112833

<br>

### API Gateway

#### ▼ API Gatewayとは

![microservices_api-gateway-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_api-gateway-pattern.png)

クリーンアーキテクチャでいうインフラストラクチャ層とインターフェース層のような機能を担う。

- 受信した通信を適切なマイクロサービスのAPIにルーティング
- 認証
- トレースIDの付与
- キャッシュの作成
- リクエスト制限

> - https://banzaicloud.com/blog/backyards-api-gateway/#api-gateway-pattern
> - https://www.getambassador.io/resources/challenges-api-gateway-kubernetes/

<br>

### 設計パターン

#### ▼ RESTful-API

> - https://hiroki-it.github.io/tech-notebook/software/software_application_collaboration_api_restful.html

#### ▼ GraphQL-API

> - https://hiroki-it.github.io/tech-notebook/software/software_application_collaboration_api_graphql_api_graphql.html

<br>

### 実装パターン

#### ▼ 自前で実装

API Gatewayを自前 (例：フルスクラッチ、Nginx、など) で実装する。

Kubernetes内で管理できるメリットがある。

> - https://techblog.zozo.com/entry/zozotown-phased-istio-service-meshing-strategy

#### ▼ OSSを使用

API GatewayのOSS (Kong、Tyk、Apigee、Kuma、Nginx、Envoy、など) を使用する。

Kubernetes内で管理できるメリットがある。

> - https://www.moesif.com/blog/technical/api-gateways/How-to-Choose-The-Right-API-Gateway-For-Your-Platform-Comparison-Of-Kong-Tyk-Apigee-And-Alternatives/

#### ▼ クラウドプロバイダーのマネージドサービスを使用

クラウドプロバイダー (例：AWS、Google Cloud) が提供するAPI Gatewayを使用する。

クラウドプロバイダーの対応状況によっては、Kubernetes内で管理できない可能性がある。

その場合、フロントエンドアプリケーションがAPI Gatewayに通信できるように、フロントエンドアプリケーションとバックエンドアプリケーションを異なるKubernetesで動かす必要がある。

> - https://aws.amazon.com/jp/blogs/news/api-gateway-as-an-ingress-controller-for-eks/

<br>

### 配置パターン

#### ▼ Public API

マイクロサービスにリクエストを送信するアプリケーションの種類に関係なく、API Gatewayを`1`個だけ作成する。

![apigateway_public-api-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/apigateway_public-api-pattern.png)

> - https://www.mobilelive.ca/blog/why-backend-for-frontend-application-architecture/

#### ▼ BFF：Backends For Frontends

マイクロサービスにリクエストを送信するアプリケーションの種類 (Webアプリケーション、Mobileアプリケーション、他社向けアプリケーション、など) に応じたAPI Gateway (Web API Gateway、Mobile API Gateway、他社向けAPI Gateway、など) を作成する。

ただし、複数のクライアントをWebアプリとして開発することもできる。

そのため、同じWebからのリクエストであっても、異なるAPI Gatewayを作成する場合がある。

![apigateway_bff-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/apigateway_bff-pattern.png)

> - https://www.mobilelive.ca/blog/why-backend-for-frontend-application-architecture/
> - https://codezine.jp/article/detail/11305?p=4

#### ▼ Federated Gateway

BFFではアプリケーションの種類ごとにAPI　Gatewayを作成したが、Federated Gatewayでは各API Gatewayのエンドポイントを統合する。

> - https://www.ey-office.com/blog_archive/2021/12/23/i-checked-graphql-federation/
> - https://tech.smartshopping.co.jp/backend-development-with-graphql
> - https://speakerdeck.com/sonatard/purotokoru-intahuesutositenographql?slide=32

<br>

## 05. マイクロサービスのアーキテクチャ特性を高める方法

### 可用性の場合

#### ▼ サーキットブレイカー

マイクロサービス間に配置され、他のマイクロサービスに連鎖的に起こる障害 (カスケード障害) を吸収する仕組みのこと。

blast-radiusを最小限にできる。

アップストリーム側マイクロサービスに障害が発生した時に、ダウンストリーム側マイクロサービスにエラーを返してしまわないよう、一旦マイクロサービスへのルーティングを停止し、直近の成功時の処理結果を返信する。

![circuit-breaker](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/circuit-breaker.png)

> - https://digitalvarys.com/what-is-circuit-breaker-design-pattern/

<br>
