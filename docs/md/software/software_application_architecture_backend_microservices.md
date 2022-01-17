# マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. イントロダクション

### バックエンドのアーキテクチャの歴史

#### ・マイクロサービスアーキテクチャを取り巻く環境

![architecture_history](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/architecture_history.png)

参考：https://tech-blog.rakus.co.jp/entry/20201218/architecture

| 年代    | アーキテクチャ                 | 説明                                                         |
| ------- | ------------------------------ | ------------------------------------------------------------ |
| 1999 ～ | モノリシックアーキテクチャ     | 1999年台、バックエンドのアーキテクチャとしてモノリシックアーキテクチャが台頭していた。しかし、モノリシックアーキテクチャは無秩序でつぎはぎだらけのアプリケーションになることが論文（『大きな泥だんご』）で指摘された。<br>参考：https://ja.wikipedia.org/wiki/%E5%A4%A7%E3%81%8D%E3%81%AA%E6%B3%A5%E3%81%A0%E3%82%93%E3%81%94 |
| 2014    | マイクロサービスアーキテクチャ | 2014年にThoughtWorks社は、サービス指向アーキテクチャとドメイン駆動設計を統合し、アプリケーションを独立したサービスの集まりに分割するアーキテクチャを考案した。<br>参考：<br>・https://martinfowler.com/articles/microservices.html<br>・https://atmarkit.itmedia.co.jp/ait/articles/2110/22/news006.html |
| 2017    | ミニサービスアーキテクチャ     | マイクロサービスアーキテクチャのサービス自体を独立したモノリスなアプリケーションと捉えると、その分だけ開発チーム（マネージャーとエンジニア）が必要になってしまう。2017年にCloud Elements社は、これに対処するためにミニサービスアーキテクチャを考案した。このアーキテクチャでは、マイクロサービスアーキテクチャとモノリスアーキテクチャの間をとった粒度で、アプリケーションを複数のサービスに分割する。この粒度を、マイクロサービスに対抗して『ミニサービス』または『MASA』とよぶ。<br>参考：<br>・https://blog.cloud-elements.com/pragmatic-microservices-architecture<br>・https://atmarkit.itmedia.co.jp/ait/articles/2110/22/news006.html |
| 2018    | モジュラーモノリス             | ミニサービスアーキテクチャではサービスの粒度が大きくなったものの、複数のサービスが必要になることは変わらず、その分だけ開発チームが必要になる問題は解決されなかった。そこで、Root Insurance社はモジュラモノリスを考案した。モジュラモノリスでは、サービスの概念を取り入れずに、アプリケーションを細かいモジュールに分割する。<br>参考：https://medium.com/@dan_manges/the-modular-monolith-rails-architecture-fb1023826fc4 |

#### ・モジュール/サービスの粒度の比較

![architecture_deployment_comparison](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/architecture_deployment_comparison.png)

参考：https://tech-blog.rakus.co.jp/entry/20201218/architecture

| モジュールの大きさ | 粒度名         | 説明                                                         |
| ------------------ | ------------ | ------------------------------------------------------------ |
| 一番大きい         | モノリシック | アプリケーションのモジュールが分割されておらず、アプリケーションをデプロイの単位とする。 |
|                    | モジュラー   | アプリケーションがモジュールに分割されており、アプリケーションをデプロイの単位とする。 |
|                    | ミニサービス | アプリケーションがサブドメイン（または境界付けられたコンテキスト）を単位としたサービスに分割されており、アプリケーションを構成するサービスのある程度のまとまりをデプロイの単位とする。また、DBを各サービスで共有する。 |
| 一番小さい         | マイクロ     | アプリケーションがサブドメイン（または境界付けられたコンテキスト）を単位としたサービスまたはルートエンティティに分割されており、アプリケーションを構成するサービスそれぞれをデプロイの単位とする。また、DBを各サービスで共有せずに、サービスごとに設置する。 |

<br>

### マイクロサービスアーキテクチャの特徴

#### ・ビジネスのスケーリングに強い

ビジネスがスケーリングする時、サービスの新規実装または削除を行えば良いため、ドメイン層の激しい変化に強い。

#### ・コンウェイの法則が働く

マイクロサービスアーキテクチャにより、組織構造が小さなチームの集まりに変化することを期待できる。

#### ・高頻度でリリース可能

各サービスを独立してデプロイできるため、高頻度でリリースできる。

#### ・障害の影響が部分的

いずれかのサービスに障害が起こったとして、サーキットブレイカーを用いることにより、上流サービスへの障害の波及を食い止められる。そのため、障害の影響が部分的となり、アプリケーション全体が落ちてしまうことがない。

#### ・複数の開発言語を使用可能

サービス間で、共通のデータ記述言語を用いてデータ通信を行えば、各サービスの開発言語が異なっていても問題ない。

<br>

### リポジトリの粒度

#### ・モノリポジトリ

全てのサービスを1つのリポジトリで管理する。Googleではモノリポジトリによるマイクロサービスアーキテクチャが採用されている。

参考：https://www.fourtheorem.com/blog/monorepo

![monorepo](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/monorepo.png)

#### ・ポリレポジトリ

各サービスを異なるリポジトリで管理する。

![polyrepo](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/polyrepo.png)

<br>

### マイクロサービスアーキテクチャのフレームワーク

#### ・dapr

参考：

- https://www.publickey1.jp/blog/19/dapr.html
- https://github.com/dapr/dapr

<br>

## 02. 各分散システムの粒度

### サービス

#### ・サービスとは

![anti-corruption-layer](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anti-corruption-layer.png)

マイクロサービスアーキテクチャにおけるバックエンドの分散システムのコンポーネントのこと。特定のサービスが他のサービスに侵食され、サービスの凝集度が低くならないようにするために、ACL：Anti Corruption Layer（腐食防止レイヤー）を設ける必要がある。腐食防止レイヤーは、異なるコンテキストから受信したデータを、そのサービスのコンテキストにあったデータ形式に変換する責務を持つ。CQRSでは、これはプロセスマネージャパターンとして知られている。一方でSagaパターンとも呼ばれるが、分散トランザクションでも同一の用語があるため、混乱を避けるためにプロセスマネージャパターンとする。

参考：

- https://github.com/czeslavo/process-manager
- https://www.oreilly.com/library/view/what-is-domain-driven/9781492057802/ch04.html
- https://docs.microsoft.com/ja-jp/previous-versions/msp-n-p/jj591569(v=pandp.10)?redirectedfrom=MSDN

#### ・各サービスのアーキテクチャ

各サービスのアーキテクチャは自由である。この時、ドメイン駆動設計のアーキテクチャに基づいて実装できる。

**＊例＊**

参考：https://little-hands.hatenablog.com/entry/2017/12/07/bouded-context-implementation

ECサイトがあり、これの商品販売ドメインを販売サブドメインと配送サブドメインに分割できるとする。この時、それぞれのサブドメインの問題を解決する販売コンテキストと配送コンテキストをサービスの粒度となり、オニオンアーキテクチャのアプリケーション間で同期通信/非同期通信を行う。

![microservices-architecture_onion-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/microservices-architecture_onion-architecture.png)

<br>

### サービスの分割手法

#### ・サービスの分割例

| アプリケーション | リンク                                                    | 分割方法           | サービスの種類                                               |
| ---------------- | --------------------------------------------------------- | ------------------ | ------------------------------------------------------------ |
| Eコマース        | https://github.com/GoogleCloudPlatform/microservices-demo | ルートエンティティ | カート、商品検索とインデックス、通貨の変換、クレジットカード、送料と発送、注文確認メール、注文フロー、レコメンド、広告、合成監視 |
| Eコマース        | https://github.com/DataDog/ecommerce-workshop             | ルートエンティティ | 広告、割引                                                   |

<br>

#### ・サブドメイン、境界付けられたコンテキストを単位とした分割

![context-map](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/context-map.png)

サブドメインをサービスの粒度とする。ここでは、解決領域となる境界付けられたコンテキストがサブドメインの中に1つしか含まれていない場合を指しており、代わりに、境界付けられたコンテキストをサービスの粒度して考えても良い。サブドメインを粒度とすることを第一段階として、さらに小さな粒度に分割するために、次の段階としてルートエンティティを粒度とするとよい。

参考：

- https://microservices.io/patterns/decomposition/decompose-by-subdomain.html
- https://www.amazon.co.jp/dp/4873119316/ref=cm_sw_em_r_mt_dp_PVDKB4F74K7S07E4CTFF



#### ・ルートエンティティを単位とした分割

![service_route-entity](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service_route-entity.png)

ルートエンティティをサービスの単位とする。ただし、イベント駆動方式でアプリケーションを連携した場合に限り、従来のリクエスト方式でアプリケーションを連携する場合のルートエンティティを用いることはアンチパターンである。最良な解決策として、サービスのオブジェクトの状態管理方式として、従来のデータに着目したステートソーシングではなく、振舞に着目したイベントソーシングを用いる必要がある。また、各サービスを名詞ではなく動詞で命名するとよい。その他、各サービスでDBを完全に独立させることや、SAGAパターンを用いること、がある。

参考：

- https://github.com/GoogleCloudPlatform/microservices-demo
- https://www.koslib.com/posts/entity-services-anti-pattern/
- https://www.michaelnygard.com/blog/2018/01/services-by-lifecycle/
- https://medium.com/transferwise-engineering/how-to-avoid-entity-services-58bacbe3ee0b

<br>

## 03. 分散システム間の連携

### Orchestration（オーケストレーション）

#### ・オーケストレーションとは

![orchestration](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/orchestration.png)

中央集権型システムとも言う。全てのサービスを制御する責務を持ったオーケストレーションプログラムを設置する設計方法。1つのリクエストが送信された時に、オーケストレーションプログラムは各サービスをコールしながら処理の結果を繋いでいく。マイクロサービスアーキテクチャだけでなく、サービス指向アーキテクチャでも用いられる。

参考：

- https://news.mynavi.jp/itsearch/article/devsoft/1598
- https://blogs.itmedia.co.jp/itsolutionjuku/2019/08/post_729.html
- https://www.fiorano.com/jp/blog/integration/integration-architecture/%E3%82%B3%E3%83%AC%E3%82%AA%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A3-vs-%E3%82%AA%E3%83%BC%E3%82%B1%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3/

#### ・リクエストリプライ方式

オーケストレーションでは、個々のサービス間の連携方式にリクエストリプライ方式を採用する。この方式では、サービス間でRESTfulAPIを用いた同期通信を実行する。

![service_request_reply](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service_request_reply.png)

<br>

### Choreography（コレオグラフィ）

#### ・コレオグラフィとは

![choreography](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/choreography.png)

分散型システムとも言う。オーケストレーションとしてのプログラムは存在せず、各サービスで下流サービスに連携する責務を持たせる設計方法である。個々のサービス間の連携方式では、イベント駆動方式を採用する。1つのリクエストが送信された時に、サービスからサービスに処理が繋がっていく。マイクロサービスアーキテクチャでは、コレオグラフィによる連携が推奨されている。

参考：

- https://blogs.itmedia.co.jp/itsolutionjuku/2019/08/post_729.html
- https://www.fiorano.com/jp/blog/integration/integration-architecture/%E3%82%B3%E3%83%AC%E3%82%AA%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A3-vs-%E3%82%AA%E3%83%BC%E3%82%B1%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3/

#### ・イベント駆動方式

コレオグラフィでは、上流/下流のサービス間の連携方式にイベントドリブン方式を採用する。この方式では、サービス間でメッセージキューを用いた非同期通信を行う。メッセージキューでは受信したメッセージを一方向にしか配信できないため、もしサービス間双方向に送信したい場合は、上流サービスからメッセージを受信するメッセージキューと。下流サービスから受信するメッセージキューを別々に設置する。メッセージキューはPub/Subデザインパターンで実装するか、またはAWS-SQSなどのツールを用いる。

![service_event_driven](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service_event_driven.png)

#### ・実装例

以下のリポジトリを参考にせよ。

参考：https://github.com/fedeoliv/microservices-transactions

![choreography_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/choreography_example.png)

<br>

### 連携のためのプロトコル

#### ・HTTP

従来のHTTPプロトコルを用いる。

#### ・gRPC

HTTPに代わるgRPCプロトコルを用いる。HTTPであると、通信相手のサービスのエンドポイントをコールした後、エンドポイントに紐づくコントローラーのメソッドが実行される。一方でgRPCであると、通信相手のサービスのメソッドを直接実行できる。そのため、HTTPよりも分散システムの連携に適している。

参考：https://techdozo.dev/grpc-for-microservices-communication/

<br>

## 04. 分散システムのプロキシ

### 分散システム全体のプロキシ

#### ・API Gatewayパターン

![microservices_api-gateway-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/microservices_api-gateway-pattern.png)

受信したインバウンド通信を適切なマイクロサービスにルーティングする他、認証認可など、クリーンアーキテクチャでいうインフラストラクチャ層とインターフェース層のような機能を担う。

参考：

- https://banzaicloud.com/blog/backyards-api-gateway/#api-gateway-pattern
- https://www.getambassador.io/resources/challenges-api-gateway-kubernetes/

#### ・ツール

参考：https://www.moesif.com/blog/technical/api-gateways/How-to-Choose-The-Right-API-Gateway-For-Your-Platform-Comparison-Of-Kong-Tyk-Apigee-And-Alternatives/ 

- gatewayサービスを自前で実装する。
- AWS API Gateway
- Kong
- Tyk
- Apigee

<br>

### 各分散システムのプロキシ

#### ・プロキシコンテナ

マイクロサービスへのインバウンド通信をマイクロサービスにルーティングする。単なるプロキシではなく、サービスメッシュの仕組みを取り入れる必要がある。

#### ・サービスメッシュ

![service-mesh](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service-mesh.png)

従来のマイクロサービスアーキテクチャでは、マイクロサービス間で直接リクエストを送受信していた。しかし、以下のような問題が起こる。

- ソフトウェアのコンポーネント間通信を制御しきれない。
- 障害時に何が起こるか分からない。
- 鍵とSSL証明書を管理しきれない。
- ソフトウェアの全体像が把握できない

そこで、マイクロサービス間で直接リクエストを送受信するのではなく、これをプロキシ機能を持つサイドカーコンテナ経由で行う。また、各サイドカーコンテナをコントロールプレーンで統括的に管理する。

参考：

- https://www.ibm.com/blogs/think/jp-ja/cloud-native-concept-03/#servicemesh
- https://qiita.com/Ladicle/items/4ba57078128d6affadd5

<br>

## 05. データ永続化方式

### ローカルトランザクション

#### ・ローカルトランザクションとは

各サービスに独立したトランザクション処理が存在しており、1つのトランザクション処理によって、特定のサービスのデータベースのみを操作する設計方法。推奨である。このノートでは、ローカルトランザクションを用いたインフラストラクチャ層の連携を説明する。

#### ・Sagaパターンとは

![saga-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/saga-pattern.png)

ローカルトランザクションを連続的に実行する方法。上流サービスのローカルトランザクションの完了をイベントとして、下流サービスのDB処理を連続的にコールしていく。ロールバックの代わりに、補償トランザクションという仕組みを実装する必要がある。補償トランザクションでは、いずれかのローカルトランザクションが失敗した時に、それ以前の各ローカルトランザクションの実行結果を元に戻すような逆順のクエリ処理が実行される。

参考：

- https://thinkit.co.jp/article/14639?page=0%2C1
- https://qiita.com/nk2/items/d9e9a220190549107282

**＊例＊**

受注に関するトランザクションが異なるサービスにまたがる例。

参考：https://docs.microsoft.com/ja-jp/dotnet/architecture/cloud-native/distributed-data#distributed-transactions

![saga-pattern_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/saga-pattern_example.png)

補償トランザクションでは、各ローカルトランザクションを元に戻す逆順のクエリ処理が実行される。

![saga-pattern_compensating_transaction_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/saga-pattern_compensating-transaction_example.png)

<br>

### グローバルトランザクション（分散トランザクション）

#### ・グローバルトランザクションとは

分散トランザクションとも言う。1つのトランザクション処理が各サービスに分散しており、1つのトランザクション処理によて、各サービスのデータベースを連続的に操作する設計方法。非推奨である。

<br>

## 06. オブジェクトモデリング方式

### イベントソーシング

#### ・イベントソーシングとは

ビジネスの出来事をモデリングし、データとして永続化する。現在の状態を取得する場合は、初期のデータに全ての出来事を適用する。CQRSと相性が良い。

参考：

- https://qiita.com/suin/items/f559e3dcde7c811ed4e1
- https://martinfowler.com/articles/201701-event-driven.html

<br>

### ステートソーシング

#### ・ステートソーシングとは

ビジネスの現在の状態をモデリングし、データとして永続化する。過去の状態は上書きされる。

参考：http://masuda220.jugem.jp/?eid=435

<br>

## 07. 分散システムにおけるテスト

### CDCテスト：Consumer Drive Contract

#### ・CDCテストとは

サービスのコントローラーがコールされてから、データベースの操作が完了するまでを、テストする。下流サービスのコールはモック化またはスタブ化する。

<br>

### カオスエンジニアリング

#### ・カオスエンジニアリング

実験的に、本番環境の分散システムに『カオス』を挿入し、高負荷な状態に至らせる。その結果から、分散システムに潜む想定外の問題を表面化させる。カオスエンジニアリングは、今まさに実際のユーザーが用いているソフトウェアに対して実施することになるため、ビジネスサイドの理解が必要になる。本格的な分散システムを採用している日系企業は少なく、国内事例はまだ少ない。

参考：

- https://principlesofchaos.org/
- https://codezine.jp/article/detail/14526

#### ・手順

参考：https://zenn.dev/hodagi/articles/3ce6ccdb00538c

1. 本番環境の分散システムから様々なテレメトリーを収集し、安定している通常状態（定常状態）を定義する。
2. 定常状態を対照群、またカオスエンジニアリングが実施された状態を実験群とする。『実験群では障害が起こる』という仮説の下、これを反証することを目指す。
3. 実験群でカオスエンジニアリングを実施する。
4. 対照群と比較し、『障害は起こる』という仮説を反証する。



<br>

## 08. 運用

### 障害対策

#### ・サーキットブレイカーとは

サービス間に設置され、他のサービスに連鎖する障害を吸収するプログラムのこと。下流サービスに障害が起こった時に、上流サービスにエラーを返してしまわないよう、直近の成功時の処理結果を返信する。

![circuit-breaker](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/circuit-breaker.png)

<br>

### 横断的な監視

#### ・分散トレーシングとは

サービス間で分散してしまう各ログを、一意なIDで紐付ける方法。

![distributed-tracing](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/distributed-tracing.png)

#### ・モニタリングサービス

Datadogによる分散トレースの監視については、以下のリンク先を参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/observability_monitering/observability_datadog_distributed_trace.html

<br>



