---
title: 【知見を記録するサイト】マイクロサービスアーキテクチャ＠アーキテクチャ
description: マイクロサービスアーキテクチャ＠アーキテクチャの知見をまとめました．
---

# マイクロサービスアーキテクチャ＠アーキテクチャ

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. イントロダクション

### バックエンドのアーキテクチャの歴史

#### ・マイクロサービスアーキテクチャを取り巻く環境

![architecture_history](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/architecture_history.png)

参考：https://tech-blog.rakus.co.jp/entry/20201218/architecture

| 年代    | アーキテクチャ                     | 説明                                                         |
| ------- | ---------------------------------- | ------------------------------------------------------------ |
| 1999 ～ | モノリシックアーキテクチャ         | 1999年台，バックエンドのアーキテクチャとしてモノリシックアーキテクチャが台頭していた．しかし，モノリシックアーキテクチャは無秩序でつぎはぎだらけのアプリケーションになることが論文（『大きな泥だんご』）で指摘された．<br>参考：https://ja.wikipedia.org/wiki/%E5%A4%A7%E3%81%8D%E3%81%AA%E6%B3%A5%E3%81%A0%E3%82%93%E3%81%94 |
| 2014    | マイクロサービスアーキテクチャ     | 2014年にThoughtWorks社は，マイクロサービス指向アーキテクチャとドメイン駆動設計を統合し，アプリケーションを独立したマイクロサービスの集まりに分割するアーキテクチャを考案した．<br>参考：<br>・https://martinfowler.com/articles/microservices.html<br>・https://atmarkit.itmedia.co.jp/ait/articles/2110/22/news006.html |
| 2017    | ミニマイクロサービスアーキテクチャ | マイクロサービスアーキテクチャのマイクロサービス自体を独立したモノリスなアプリケーションと捉えると，その分だけ開発チーム（マネージャーとエンジニア）が必要になってしまう．2017年にCloud Elements社は，これに対処するためにミニマイクロサービスアーキテクチャを考案した．このアーキテクチャでは，マイクロサービスアーキテクチャとモノリスアーキテクチャの間をとった粒度で，アプリケーションを複数のマイクロサービスに分割する．この粒度を，マイクロサービスに対抗して『ミニマイクロサービス』または『MASA』とよぶ．<br>参考：<br>・https://blog.cloud-elements.com/pragmatic-microservices-architecture<br>・https://atmarkit.itmedia.co.jp/ait/articles/2110/22/news006.html |
| 2018    | モジュラーモノリス                 | ミニマイクロサービスアーキテクチャではマイクロサービスの粒度が大きくなったものの，複数のマイクロサービスが必要になることは変わらず，その分だけ開発チームが必要になる問題は解決されなかった．そこで，Root Insurance社はモジュラモノリスを考案した．モジュラモノリスでは，マイクロサービスの概念を取り入れずに，アプリケーションを細かいモジュールに分割する．<br>参考：https://medium.com/@dan_manges/the-modular-monolith-rails-architecture-fb1023826fc4<br>反対に，最初モジュラーモノリスとして設計し，マイクロサービスアーキテクチャに移行していくという選択肢もある．<br>参考：https://creators-note.chatwork.com/entry/2020/12/02/090000#%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%A9%E3%83%A2%E3%83%8E%E3%83%AA%E3%82%B9%E3%81%A8%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3 |

#### ・モジュール/マイクロサービスの粒度の比較

![architecture_deployment_comparison](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/architecture_deployment_comparison.png)

参考：https://tech-blog.rakus.co.jp/entry/20201218/architecture

| モジュールの大きさ | 粒度名         | 説明                                                         |
| ------------------ | ------------ | ------------------------------------------------------------ |
| 一番大きい         | モノリシック | アプリケーションのモジュールが分割されておらず，アプリケーションをデプロイの単位とする． |
|                    | モジュラー   | アプリケーションがモジュールに分割されており，アプリケーションをデプロイの単位とする．モジュール間のデータのやり取りに通信を使うか否かや，モジュール間でDBを共有するか否かの選択によって，構築パターンがいくつかある．<br>参考：https://scrapbox.io/tsuwatch/%E3%83%A2%E3%83%8E%E3%83%AA%E3%82%B9%E3%81%A8%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AE%E3%81%82%E3%81%84%E3%81%A0 |
|                    | ミニマイクロサービス | アプリケーションがサブドメイン（または境界付けられたコンテキスト）を単位としたマイクロサービスに分割されており，アプリケーションを構成するマイクロサービスのある程度のまとまりをデプロイの単位とする．また，DBを各マイクロサービスで共有する． |
| 一番小さい         | マイクロ     | アプリケーションがサブドメイン（または境界付けられたコンテキスト）を単位としたマイクロサービスまたはルートエンティティに分割されており，アプリケーションを構成するマイクロサービスそれぞれをデプロイの単位とする．また，DBを各マイクロサービスで共有せずに，マイクロサービスごとに設置する． |

<br>

### マイクロサービスアーキテクチャの特徴

#### ・ビジネスのスケーリングに強い

ビジネスがスケーリングする時，マイクロサービスの新規実装または削除を行えば良いため，ドメイン層の激しい変化に強い．

#### ・コンウェイの法則が働く

マイクロサービスアーキテクチャにより，組織構造が小さなチームの集まりに変化することを期待できる．

#### ・高頻度でリリース可能

各マイクロサービスを独立してデプロイできるため，高頻度でリリースできる．

#### ・障害の影響が部分的

いずれかのマイクロサービスに障害が起こったとして，サーキットブレイカーを用いることにより，上流マイクロサービスへの障害の波及を食い止められる．そのため，障害の影響が部分的となり，アプリケーション全体が落ちてしまうことがない．

#### ・複数の開発言語を使用可能

マイクロサービス間で，共通のデータ記述言語を用いてデータ通信を行えば，各マイクロサービスの開発言語が異なっていても問題ない．

<br>

### リポジトリの粒度

#### ・モノリポジトリ

全てのマイクロサービスを1つのリポジトリで管理する．Googleではモノリポジトリによるマイクロサービスアーキテクチャが採用されている．

参考：https://www.fourtheorem.com/blog/monorepo

![monorepo](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/monorepo.png)

#### ・ポリレポジトリ

各マイクロサービスを異なるリポジトリで管理する．

![polyrepo](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/polyrepo.png)

<br>

### マイクロサービスアーキテクチャのフレームワーク

#### ・dapr

参考：

- https://www.publickey1.jp/blog/19/dapr.html
- https://github.com/dapr/dapr

<br>

## 02. 各マイクロサービスの粒度

### マイクロサービス

#### ・マイクロサービスとは

![anti-corruption-layer](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anti-corruption-layer.png)

マイクロサービスアーキテクチャにおける分散システム状のバックエンドのコンポーネントのこと．特定のマイクロサービスが他のマイクロサービスに侵食され，マイクロサービスの凝集度が低くならないようにするために，ACL：Anti Corruption Layer（腐食防止レイヤー）を設ける必要がある．腐食防止レイヤーは，異なるコンテキストから受信したデータを，そのマイクロサービスのコンテキストにあったデータ形式に変換する責務を持つ．CQRSでは，これはプロセスマネージャパターンとして知られている．一方でSagaパターンとも呼ばれるが，分散トランザクションでも同一の用語があるため，混乱を避けるためにプロセスマネージャパターンとする．

参考：

- https://github.com/czeslavo/process-manager
- https://www.oreilly.com/library/view/what-is-domain-driven/9781492057802/ch04.html
- https://docs.microsoft.com/ja-jp/previous-versions/msp-n-p/jj591569(v=pandp.10)?redirectedfrom=MSDN

#### ・各マイクロサービスのアーキテクチャ

各マイクロサービスのアーキテクチャは自由である．この時，ドメイン駆動設計のアーキテクチャを基に実装できる．

**＊例＊**

参考：https://little-hands.hatenablog.com/entry/2017/12/07/bouded-context-implementation

ECサイトがあり，これの商品販売ドメインを販売サブドメインと配送サブドメインに分割できるとする．この時，それぞれのサブドメインの問題を解決する販売コンテキストと配送コンテキストをマイクロサービスの粒度となり，オニオンアーキテクチャのアプリケーション間で同期通信/非同期通信を行う．

![microservices-architecture_onion-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/microservices-architecture_onion-architecture.png)

<br>

### マイクロサービスの分割手法

#### ・マイクロサービスの分割例

| アプリケーション | リンク                                                    | 分割方法           | マイクロサービスの種類                                       |
| ---------------- | --------------------------------------------------------- | ------------------ | ------------------------------------------------------------ |
| Eコマース        | https://github.com/GoogleCloudPlatform/microservices-demo | ルートエンティティ | カート，商品検索とインデックス，通貨の変換，クレジットカード，送料と発送，注文確認メール，注文フロー，レコメンド，広告，合成監視 |
| Eコマース        | https://github.com/DataDog/ecommerce-workshop             | ルートエンティティ | 広告，割引                                                   |

#### ・サブドメイン，境界付けられたコンテキストを単位とした分割

![context-map](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/context-map.png)

サブドメインをマイクロサービスの粒度とする．ここでは，解決領域となる境界付けられたコンテキストがサブドメインの中に1つしか含まれていない場合を指しており，代わりに，境界付けられたコンテキストをマイクロサービスの粒度して考えても良い．サブドメインを粒度とすることを第一段階として，さらに小さな粒度に分割するために，次の段階としてルートエンティティを粒度とすると良い．

参考：

- https://microservices.io/patterns/decomposition/decompose-by-subdomain.html
- https://www.amazon.co.jp/dp/4873119316/ref=cm_sw_em_r_mt_dp_PVDKB4F74K7S07E4CTFF



#### ・ルートエンティティを単位とした分割

![service_route-entity](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service_route-entity.png)

ルートエンティティをマイクロサービスの単位とする．ただし，イベント駆動方式でアプリケーションを連携した場合に限り，従来のリクエスト方式でアプリケーションを連携する場合のルートエンティティを用いることはアンチパターンである．最良な解決策として，マイクロサービスのオブジェクトの状態管理方式として，従来のデータに着目したステートソーシングではなく，振舞に着目したイベントソーシングを用いる必要がある．また，各マイクロサービスを名詞ではなく動詞で命名すると良い．その他，各マイクロサービスでDBを完全に独立させることや，SAGAパターンを用いること，がある．

参考：

- https://github.com/GoogleCloudPlatform/microservices-demo
- https://www.koslib.com/posts/entity-services-anti-pattern/
- https://www.michaelnygard.com/blog/2018/01/services-by-lifecycle/
- https://medium.com/transferwise-engineering/how-to-avoid-entity-services-58bacbe3ee0b

<br>

## 03. マイクロサービス間の連携

### Orchestration（オーケストレーション）

#### ・オーケストレーションとは

![orchestration](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/orchestration.png)

中央集権型システムとも言う．全てのマイクロサービスを制御する責務を持ったオーケストレーションプログラムを設置する設計方法．1つのリクエストが送信された時に，オーケストレーションプログラムは各マイクロサービスをコールしながら処理の結果を繋いでいく．マイクロサービスアーキテクチャだけでなく，マイクロサービス指向アーキテクチャでも用いられる．

参考：

- https://news.mynavi.jp/itsearch/article/devsoft/1598
- https://blogs.itmedia.co.jp/itsolutionjuku/2019/08/post_729.html
- https://www.fiorano.com/jp/blog/integration/integration-architecture/%E3%82%B3%E3%83%AC%E3%82%AA%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A3-vs-%E3%82%AA%E3%83%BC%E3%82%B1%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3/

#### ・リクエストリプライ方式

オーケストレーションでは，個々のマイクロサービス間の連携方式にリクエストリプライ方式を採用する．この方式では，マイクロサービス間でHTTPプロトコルやgRPCプロトコルによる同期通信を実行することになる．

参考：https://qiita.com/yasuabe2613/items/3bff44e662c922083264#%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E3%83%B3%E3%82%B0%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB%E3%81%AE%E5%95%8F%E9%A1%8C%E9%A0%98%E5%9F%9F

![service_request_reply](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service_request_reply.png)

<br>

### Choreography（コレオグラフィ）

#### ・コレオグラフィとは

![choreography](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/choreography.png)

分散型システムとも言う．オーケストレーションとしてのプログラムは存在せず，各マイクロサービスで下流マイクロサービスに連携する責務を持たせる設計方法である．個々のマイクロサービス間の連携方式では，イベント駆動方式を採用する．1つのリクエストが送信された時に，マイクロサービスからマイクロサービスに処理が繋がっていく．マイクロサービスアーキテクチャでは，コレオグラフィによる連携が推奨されている．

参考：

- https://blogs.itmedia.co.jp/itsolutionjuku/2019/08/post_729.html
- https://www.fiorano.com/jp/blog/integration/integration-architecture/%E3%82%B3%E3%83%AC%E3%82%AA%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A3-vs-%E3%82%AA%E3%83%BC%E3%82%B1%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3/

#### ・イベント駆動方式

コレオグラフィでは，上流/下流のマイクロサービス間の連携方式にイベントドリブン方式を採用する．この方式では，マイクロサービス間で非同期通信を行うことになる．

参考：https://qiita.com/yasuabe2613/items/3bff44e662c922083264#%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E3%83%B3%E3%82%B0%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB%E3%81%AE%E5%95%8F%E9%A1%8C%E9%A0%98%E5%9F%9F

![service_event_driven](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service_event_driven.png)

<br>

### マイクロサービス間の同期/非同期通信

#### ・直接送受信

マイクロサービス間で同期通信/非同期通信を直接行う．しかし，以下のような問題が起こるため，非推奨である．

- ソフトウェアのコンポーネント間通信を制御しきれない．
- 障害時に何が起こるか分からない．
- 鍵とSSL証明書を管理しきれない．
- ソフトウェアの全体像が把握できない

#### ・メッセージキュー

マイクロサービス間の非同期通信のために用いる．マイクロサービス間で直接リクエストを送受信するのではなく，メッセージキュー経由で行う．メッセージキューでは受信したメッセージを一方向にしか配信できないため，もしマイクロサービス間双方向に送信したい場合は，上流マイクロサービスからメッセージを受信するメッセージキューと．下流マイクロサービスから受信するメッセージキューを別々に設置する．メッセージキューはPub/Subデザインパターンで実装するか，またはAWS-SQSなどのツールを用いる．

参考：https://www.scaleuptech.com/de/blog/api-gateway-vs-service-mesh-vs-message-queue/

**＊実装例＊**

以下のリポジトリを参考にせよ．

参考：https://github.com/fedeoliv/microservices-transactions

![choreography_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/choreography_example.png)

#### ・サービスメッシュ

![service-mesh](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service-mesh.png)

マイクロサービス間の非同期通信のために用いる．マイクロサービス間で直接リクエストを送受信するのではなく，これをサイドカーパターンで設置したリバースプロキシコンテナ経由で行う．また，各サイドカーコンテナをコントロールプレーンで統括的に管理する．これにより，マイクロサービス間の通信をより簡単に管理できる．

参考：

- https://www.ibm.com/blogs/think/jp-ja/cloud-native-concept-03/#servicemesh
- https://qiita.com/Ladicle/items/4ba57078128d6affadd5
- https://docs.microsoft.com/ja-jp/dotnet/architecture/cloud-native/service-mesh-communication-infrastructure

<br>

### 同期通信のためのプロトコル

#### ・HTTP

従来のHTTPプロトコルを用いる．

#### ・gRPC

HTTPに代わるgRPCプロトコルを用いる．HTTPであると，通信相手のマイクロサービスのエンドポイントをコールした後，エンドポイントに紐づくコントローラーのメソッドが実行される．一方でgRPCであると，通信相手のマイクロサービスのメソッドを直接実行できる．そのため，HTTPよりもマイクロサービスの連携に適している．

参考：https://techdozo.dev/grpc-for-microservices-communication/

<br>

## 04. マイクロサービスの公開

### API Gatewayパターン

#### ・API Gatewayパターンとは

![microservices_api-gateway-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/microservices_api-gateway-pattern.png)

クリーンアーキテクチャでいうインフラストラクチャ層とインターフェース層のような機能を担う．

- 受信したインバウンド通信を適切なマイクロサービスにルーティング
- 認証/認可
- トレースIDの付与
- キャッシュの作成
- リクエスト制限

参考：

- https://banzaicloud.com/blog/backyards-api-gateway/#api-gateway-pattern
- https://www.getambassador.io/resources/challenges-api-gateway-kubernetes/

#### ・実装方法

参考：https://www.moesif.com/blog/technical/api-gateways/How-to-Choose-The-Right-API-Gateway-For-Your-Platform-Comparison-Of-Kong-Tyk-Apigee-And-Alternatives/ 

| 場合                                            | ツール                                                       |
| ----------------------------------------------- | ------------------------------------------------------------ |
| API Gatewayをサービスメッシュ内で管理する場合   | 自前で実装する必要がある．<br>参考：https://techblog.zozo.com/entry/zozotown-phased-istio-service-meshing-strategy |
| API Gatewayをサービスメッシュ内で管理しない場合 | クラウドベンダー（AWS API Gateway）やOSS（Kong，Tyk，Apigee）を用いる．<br>参考：https://aws.amazon.com/jp/blogs/news/api-gateway-as-an-ingress-controller-for-eks/ |

<br>

## 05. データ永続化方式

### ローカルトランザクション

#### ・ローカルトランザクションとは

各マイクロサービスに独立したトランザクション処理が存在しており，各マイクロサービスの独立したトランザクション処理を連続的に実行する方法．推奨である．モノリスではDBが持つトランザクション処理を用いることになるが，ローカルトランザクションではこれを使用できず，アプリケーション側でトランザクションに相当する処理を実装することになる．本ノートでは，ローカルトランザクションを用いたインフラストラクチャ層の連携を説明する．

#### ・Sagaパターン

![saga-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/saga-pattern.png)

ローカルトランザクションを連続的に実行する方法．上流マイクロサービスのローカルトランザクションの完了をイベントとして，下流マイクロサービスのDB処理を連続的にコールしていく．ロールバックの代わりに，補償トランザクションという仕組みを実装する必要がある．補償トランザクションでは，いずれかのローカルトランザクションが失敗した時に，それ以前の各ローカルトランザクションの実行結果を元に戻すような逆順のクエリ処理が実行される．

参考：

- https://thinkit.co.jp/article/14639?page=0%2C1
- https://qiita.com/nk2/items/d9e9a220190549107282

**＊例＊**

受注に関するトランザクションが異なるマイクロサービスにまたがる例．

参考：https://docs.microsoft.com/ja-jp/dotnet/architecture/cloud-native/distributed-data#distributed-transactions

![saga-pattern_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/saga-pattern_example.png)

補償トランザクションでは，各ローカルトランザクションを元に戻す逆順のクエリ処理が実行される．

![saga-pattern_compensating_transaction_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/saga-pattern_compensating-transaction_example.png)

#### ・TCCパターン

<br>

### グローバルトランザクション（分散トランザクション）

#### ・グローバルトランザクションとは

分散トランザクションとも言う．1つのトランザクション処理によって，複数のマイクロサービスのDBを操作する方法．非推奨である．

参考：https://thinkit.co.jp/article/14639?page=0%2C1

<br>

## 06. オブジェクトモデリング方式

### イベントソーシング

#### ・イベントソーシングとは

ビジネスの出来事をモデリングし，データとして永続化する．現在の状態を取得する場合は，初期のデータに全ての出来事を適用する．CQRSと相性が良い．

参考：

- https://qiita.com/suin/items/f559e3dcde7c811ed4e1
- https://martinfowler.com/articles/201701-event-driven.html

<br>

### ステートソーシング

#### ・ステートソーシングとは

ビジネスの現在の状態をモデリングし，データとして永続化する．過去の状態は上書きされる．

参考：http://masuda220.jugem.jp/?eid=435

<br>

## 07. マイクロサービスにおけるテスト

### CDCテスト：Consumer Drive Contract

#### ・CDCテストとは

マイクロサービスのコントローラーがコールされてから，データベースの操作が完了するまでを，テストする．下流マイクロサービスのコールはモック化またはスタブ化する．

<br>

### カオスエンジニアリング

#### ・カオスエンジニアリング

実験的に，本番環境のマイクロサービスに『カオス』を挿入し，高負荷な状態に至らせる．その結果から，マイクロサービスに潜む想定外の問題を表面化させる．カオスエンジニアリングは，今まさに実際のユーザーが用いているソフトウェアに対して実施することになるため，ビジネスサイドの理解が必要になる．本格的なマイクロサービスを採用している日系企業は少なく，国内事例はまだ少ない．

参考：

- https://principlesofchaos.org/
- https://codezine.jp/article/detail/14526

#### ・手順

参考：https://zenn.dev/hodagi/articles/3ce6ccdb00538c

1. 本番環境のマイクロサービスから様々なテレメトリーを収集し，安定している通常状態（定常状態）を定義する．
2. 定常状態を対照群，またカオスエンジニアリングが実施された状態を実験群とする．『実験群では障害が起こる』という仮説の下，これを反証することを目指す．
3. 実験群でカオスエンジニアリングを実施する．
4. 対照群と比較し，『障害は起こる』という仮説を反証する．

<br>

## 08. 運用

### 障害対策

#### ・サーキットブレイカー

マイクロサービス間に設置され，他のマイクロサービスに連鎖する障害を吸収するプログラムのこと．下流マイクロサービスに障害が起こった時に，上流マイクロサービスにエラーを返してしまわないよう，直近の成功時の処理結果を返信する．

![circuit-breaker](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/circuit-breaker.png)

<br>

### 横断的な監視

#### ・分散トレーシング

マイクロサービス間で分散してしまう各ログを，一意なIDで紐付ける方法．

![distributed-tracing](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/distributed-tracing.png)



