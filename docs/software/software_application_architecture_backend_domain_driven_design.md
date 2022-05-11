---
title: 【知見を記録するサイト】ドメイン駆動設計＠アーキテクチャ
description: ドメイン駆動設計＠アーキテクチャの知見をまとめました．
---

# ドメイン駆動設計＠アーキテクチャ

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ドメイン駆動設計とは

オブジェクト指向分析設計から派生した分析設計の手法の一種．オブジェクト指向分析設計をより強化するために考案され，特にバックエンドに有効である．

参考：

- https://www.ogis-ri.co.jp/otc/hiroba/technical/DDDEssence/chap1.html
- https://ja.wikipedia.org/wiki/%E3%83%89%E3%83%A1%E3%82%A4%E3%83%B3%E9%A7%86%E5%8B%95%E8%A8%AD%E8%A8%88

<br>

## 02. ドメイン駆動設計の手順例

### 戦略的設計の手順例

![ddd_strategic_design_flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ddd_strategic_design_flow.png)

戦略的設計では，ドメイン全体から境界付けられたコンテキストを明確にする．

参考：https://qiita.com/crossroad0201/items/875c5f76ed3794ed56c4

1. ドメインエキスパートと話し合い，ドメイン全体の中からコアドメインとサブドメインを切り分ける．
2. ドメインエキスパートの部署や業務フローの立ち位置によっては，同じ『単語』や『動詞』であっても，意味合い/定義づけが異なる場合がある．この時，それぞれを別々の名前からなるユビキタス言語として定義づける．
3. ユビキタス言語を元に，境界付けられたコンテキストを定義づける．
4. コンテキストマップを作成し，境界付けられたコンテキスト間の関係を明らかにする．

<br>

### 戦術的設計の手順例

戦術的設計では，境界付けられたコンテキストをアーキテクチャやデザインパターンに落とし込む．

1. ドメインエキスパートと話し合い，境界付けられたコンテキストに含まれる要件をヒアリングを行う．この時，ビジネスのルール/制約を十分にヒアリングする．
3. オブジェクトの具体化のためにユースケース図やオブジェクト図でオブジェクトを作成し，抽象化のためにドメインモデル図も作成する．
4. 必要であればドメインエキスパートに再ヒアリングを行い，特にオブジェクト図とドメインモデル図を改善する．
5. ドメインモデル図を元に，クラス図を作成する．この時，モデルをエンティティや値オブジェクトを切り分けるようにする．
6. アーキテクチャ（レイヤード型，ヘキサゴナル型，オニオン型，クリーンアーキテクチャ）を決め，クラス図を元にドメイン層を実装する．
7. 運用後に問題が起こった場合，特にオブジェクト図とドメインモデル図を修正する．場合によっては，デザインパターンに切り分ける．

参考：https://booth.pm/ja/items/3363104

<br>

## 03. 戦略的設計

### ドメイン

#### ▼ ドメインとは

ビジネスモデル全体で見た時に，ソフトウェア化の対象となる業務領域のこと．業務領域の細分化は小さいほど良い．業務領域を細分化する上で境目を見分ける方法として，会社の組織図から，部署ごとに担当する業務の種類を確認するとよい．また，ビジネスモデルの一連の業務フローの中で，業務の担当者の属性が変化するタイミングに着目すると良い．担当者が変われば，コールセンター部（電話対応業務，顧客管理業務），法人営業部（受注業務），マーケティング部（ユーザー集客業務，広告運用業務），管理部（会計業務，財務業務，採用業務），というように業務をより小さな単位で抽出できるはずである．この時の注意点として，業務領域は，ToBやToCに関わらないことである．例えば，ToCなドメインとしては，マーケーティング部による業務（ユーザー集客業務，広告運用業務）がある．

参考：https://github.com/little-hands/ddd-q-and-a/issues/191

**＊例＊**

インターネット広告代理店の例．ビジネスモデルに基づく複数のドメインを以下に示す．業務フローの担当者の変化として，まず問い合わせで注文を受けて広告アカウントを作成する『営業担当者』，制作した広告をアカウントに入稿する『制作担当者』，入稿された広告を運用して広告効果を高める『マーケティング担当者』，最後に広告の依頼者に料金を請求する『経理担当者』が挙げられる．これにより，インターネット広告代理店のビジネスモデルは，各担当者に対応するドメインに分割できる．

参考：https://labs.septeni.co.jp/entry/2021/04/15/130000

![internet_advertising_agency_domain](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/internet_advertising_agency_domain.png)

**＊例＊**

![hacogym_business_model](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/hacogym_business_model.png)

完全個室ジムを運営するハコジムの例．ビジネスモデルに基づく複数のドメインを以下に示す．業務フローの担当者の変化として，まず個室ジムに適する物件を探す『物件担当者』，ジムのトレーナーを採用して会員に紹介する『採用担当者』，個室ジムの利用会員を獲得する『営業担当者』が挙げられる．これにより，ハコジムのビジネスモデルは，各担当者に対応するドメインに分割できる．

参考：

- https://hacogym.jp/
- https://zenn.dev/hsshss/articles/e11efefc7011ab

![hacogym_domain](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/hacogym_domain.png)

<br>

### コアドメイン，サブドメイン，ドメインエキスパート

#### ▼ コアドメイン，サブドメイン，ドメインエキスパートとは

各ドメインのドメインエキスパートと，エンジニアが話し合いながら，ドメイン内の主要業務をコアドメイン，補助的な業務をサブドメインに分類する．コアドメインやサブドメインに相当する業務に詳しい人（アプリケーションの利用者本人，利用者の関心に詳しい人）がドメインエキスパートになることが多い．

参考：

- https://qiita.com/crossroad0201/items/875c5f76ed3794ed56c4
- https://labs.septeni.co.jp/entry/2021/04/15/130000

![core-domain_sub-domain_bounded-context](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/core-domain_sub-domain_bounded-context.png)

#### ▼ 記法

**＊例＊**

完全個室ジムを運営するハコジムの例．ドメインのうちで，個室ジムドメインに基づくコアドメインとサブドメインを以下に示す．コアドメインは予約ドメイン，それ以外はサブドメインとしている．

参考：

- https://hacogym.jp/
- https://zenn.dev/hsshss/articles/e11efefc7011ab

![hacogym_subdomain](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/hacogym_subdomain.png)

**＊例＊**

ECサイトを運営するアスクルの例．ドメインのうちで，個人向け販売ドメイン（サイト名はLOHACO）に基づくサブドメインを以下に示す．配送/注文/商品/ユーザ管理/在庫/受注をそれぞれサブドメインとしている（コアドメインは明言されていない）．

参考：https://speakerdeck.com/askul/ddd-and-clean-architecture-at-lohaco?slide=28

<br>

### ユビキタス言語

#### ▼ ユビキタス言語とは

ドメインエキスパート間で，特定の『単語』や『動詞』の意味合い/定義づけが異なる場合，これを別々の名前からなるユビキタス言語として定義づける．

参考：https://qiita.com/kmdsbng/items/bf415afbeec239a7fd63

![domain-model](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/domain-model.png)

<br>

### 境界付けられたコンテキスト

#### ▼ 境界付けられたコンテキストとは

ドメインエキスパートの業務フローの立ち位置が異なれば，同じ『単語』や『動詞』であっても，異なる意味合い/定義づけのユビキタス言語が使用される．異なるユビキタス言語を元にして，境界付けられたコンテキストを設定する．この時，ユビキタス言語は，他の境界付けられたコンテキストでは通じないものであればあるほど良い．境界付けられたコンテキストそれぞれのユビキタス言語に合わせて，異なる名前でモデリングしていく．境界付けられたコンテキストを定義しない場合，異なるユビキタス言語をコアドメインやサブドメイン間で共有することとなり，それぞれの関心に無関係なデータを保持することになってしまう．

#### ▼ 記法

**＊例＊**

本を販売するECサイトの例．コアドメインとサブドメインに基づいたユビキタス言語と境界付けられたコンテキストを以下に示す．バイヤー（仕入れ）部，マーケティング部，在庫管理部のドメインエキスパートは，『本（商品）』という単語に対する意味合い/定義づけが異なる．そのため，それぞれを『本』『クーポン』『在庫』というユビキタス言語として定義でき，モデル名/データ名はそれぞれのユビキタス言語に合わせた名前になる．例えば，マーケの境界付けられたコンテキストでは，モデル名はCouponとなり，割引期間データを保持する必要があるが，仕入部や在庫部ではこのデータは不要である．一方，ISBNは全ての境界付けられたコンテキストのモデルに必要なデータである．境界付けられたコンテキストを定義しない場合，1つの商品モデルが全てのデータを保持することとなり，それぞれのドメインエキスパートが関心を持たないデータも保持することになってしまう．

参考：https://kenta-kosugi.medium.com/%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AE%E4%B8%8A%E6%89%8B%E3%81%AA%E5%88%86%E5%89%B2-ff5bb01d1062

![book_ec_ubiquitous_language](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/book_ec_ubiquitous_language.png)

**＊例＊**

完全個室ジムを運営するハコジムの例．個室ジムドメインのコアドメインとサブドメインに基づく境界付けられたコンテキスト．認証コンテキスト，予約コンテキスト，顧客管理コンテキスト，銀行支払いコンテキスト，クレジットカード支払いコンテキストがある．

参考：

- https://hacogym.jp/
- https://zenn.dev/hsshss/articles/e11efefc7011ab

![hacogym_bounded-context](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/hacogym_bounded-context.png)

**＊例＊**

契約請求管理アプリケーションを提供するアルプの例．コアドメインとサブドメインに基づいたユビキタス言語と境界付けられたコンテキストを以下に示す．契約管理コンテキスト，商品管理コンテキスト，請求管理コンテキスト，がある．取り組みとして，週次でユビキタス言語の更新を行っている．

参考：

- https://note.com/alpinc/n/nab47ab9273c6
- https://thealp.co.jp/

![contract_billing_management_ubiquitous_language](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/contract_billing_management_ubiquitous_language.png)

<br>

### コンテキストマップ

#### ▼ コンテキストマップとは

広義のドメイン全体の俯瞰する図のこと．コアドメイン，サブドメイン，境界付けられたコンテキストを定義した後，これらの関係性を視覚化する．異なるサブドメインの間で異なるユビキタス言語を使用する場合，境界付けられたコンテキストはサブドメインをまたがない．一方で，同じユビキタス言語を使用する場合，境界付けられたコンテキストは複数のサブドメインにまたがる．できる限り，各境界付けられたコンテキストでは異なるユビキタス言語を使用して，境界付けられたコンテキストが複数のサブドメインにまたがないようにした方が良い（これ重要）．コアドメインのソフトウェアは内製である必要があるが，サブドメインのソフトウェアは外製/内製のいずれでも問題ない．必要であれば，他の業務系SaaS（例：マネーフォワード，サイボウズ，など）にドメインロジックを委譲し，これのAPIをコールしてデータを取得するような設計でもよい．

参考：https://qiita.com/crossroad0201/items/875c5f76ed3794ed56c4

![context-map](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/context-map.png)

#### ▼ 記法

**＊例＊**

完全個室ジムを運営するハコジムの例．個室ジムドメインのそれぞれの境界付けられたコンテキストに基づくモデリング．コアドメインの予約コンテキストとスマートロックコンテキストは，1つのマイクロサービスとして内製化している．一方で，それ以外の境界付けられたコンテキストは外製化している．

![hacogym_subdomain_modeling](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/hacogym_subdomain_modeling.png)

<br>

## 04. 戦術的設計

### MVCからレイヤードアーキテクチャへの変遷

#### ▼ MVCと問題点

ドメイン駆動設計が考案される以前，MVCの考え方が主流であった．しかし，特にModelの役割が抽象的過ぎたため，開発規模が大きくなるにつれて，Modelに役割を集中させ過ぎてしまうことがあった．

![MVCモデル](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/MVCモデル.png)

#### ▼ MVCからレイヤードアーキテクチャへの移行

ドメイン駆動設計が登場したことによって，MVCは発展し，M・V・Cそれぞれの役割がより具体的で精密になった．Modelの肥大化は，Modelが持つビジネスロジックをドメイン層，またCRUD処理をインフラストラクチャ層として分割することによって，対処された．

![ドメイン駆動設計](https://user-images.githubusercontent.com/42175286/58724663-2ec11c80-8418-11e9-96e9-bfc6848e9374.png)

<br>

### DDDアーキテクチャ

#### ▼ レイヤードアーキテクチャ

最初に考案された実現方法．

参考：https://www.amazon.co.jp/dp/4798121967

![layered-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/layered-architecture.png)

#### ▼ ヘキサゴナルアーキテクチャ

別名『ポートアンドアダプターアーキテクチャ』という．レイヤードアーキテクチャのインフラストラクチャ層に対して，依存性逆転を組み込んだもの．ドメイン層のオブジェクトは，ドメイン層の他のオブジェクトに依存する以外，何のオブジェクトにも外部パッケージにも依存しない．逆に考えれば，これらに依存するものはドメイン層に配置するべきではないと判断できる．本質的には，他の『オニオンアーキテクチャ』『クリーンアーキテクチャ』に同じである．

参考：https://www.amazon.co.jp/dp/B00UX9VJGW/ref=cm_sw_r_tw_dp_S20HJ24MHWTSED7T0ZCP

#### ▼ オニオンアーキテクチャ

レイヤードアーキテクチャのインフラストラクチャ層に対して，依存性逆転を組み込んだもの．ドメイン層のオブジェクトは，ドメイン層の他のオブジェクトに依存する以外，何のオブジェクトにも外部パッケージにも依存しない．逆に考えれば，これらに依存するものはドメイン層に配置するべきではないと判断できる．本質的には，他の『ヘキサゴナルアーキテクチャ』『クリーンアーキテクチャ』に同じである．

参考：

- https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/
- https://little-hands.hatenablog.com/entry/2017/10/11/075634

![onion-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/onion-architecture.png)

#### ▼ クリーンアーキテクチャ

レイヤードアーキテクチャのインフラストラクチャ層に対して，依存性逆転を組み込んだもの．ドメイン層のオブジェクトは，ドメイン層の他のオブジェクトに依存する以外，何のオブジェクトにも外部パッケージにも依存しない．逆に考えれば，これらに依存するものはドメイン層に配置するべきではないと判断できる．本質的には，他の『ヘキサゴナルアーキテクチャ』『オニオンアーキテクチャ』に同じである．

参考：https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

![clean-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/clean-architecture.jpeg)

<br>

### DDDデザインパターン

#### ▼ DDDデザインパターン集

参考：https://www.ogis-ri.co.jp/otc/hiroba/technical/DDDEssence/chap1.html

<br>

### ドメインモデル図

#### ▼ ドメインモデル図とは

基本的にオブジェクト指向分析設計では，分析のためにユースケース図やオブジェクト図を作成し，その後に設計のためにクラス図やシーケンス図を作成する．一方でドメイン駆動設計の分析では，オブジェクトの具体化のためにユースケース図やオブジェクト図でオブジェクトを作成し，抽象化のためにドメインモデル図も作成する．この具体例から抽象を導くという作業により，より現実に沿ったモデリングが可能になる．

参考：

- https://booth.pm/ja/items/3363104
- https://qiita.com/little_hand_s/items/dfa4b156f533ba1a1491

#### ▼ コアドメイン/サブドメインのモデリング

ドメインモデル図を基に，コアドメイン/サブドメインのモデリングを行う．

参考：https://qiita.com/crossroad0201/items/875c5f76ed3794ed56c4

![core-domain_sub-domain_bounded-context_modeling](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/core-domain_sub-domain_bounded-context_modeling.png)

#### ▼ 記法

クラス図と同様にして，オブジェクト図のインスタンス間の関係性を参考にして，ドメインモデル間の関係性を設定する．オブジェクト間がIDのみを使用する関係であれば『点線矢印』とし，またオブジェクト全体を使用する関係であれば『白塗りの菱形』とする（記号の表記方法は個人差がある）．この時，点線矢印の関係性であれば異なる集約に属し，また白塗りの菱形であれば同じ集約に属しているため，これらから集約の境界を設定する．インスタンス間のリンク記号数を参考にして，多重度を付記する．ビジネスルール/制約を吹き出しに書き込むことにより，ソフトウェアの構造だけでなくビジネスルール/制約も表現する．

参考：

- https://booth.pm/ja/items/3363104
- https://www.eureka-moments-blog.com/entry/2018/12/29/145802
- https://github.com/ShisatoYano/PlantUML/blob/master/DomainModelDiagram/DomainModelDiagram.pdf

**＊例＊**

とある映画チケット料金を題材に，ハッシュタグチケット料金モデリングとして，色々な方がユースケース図とドメインモデル図を作成されている．いずれの方も非常に参考になる（モデリングは難しい）．

参考：

- https://cinemacity.co.jp/ticket/
- https://twitter.com/little_hand_s/status/1150763962062913536?lang=ar
- https://github.com/bookreadking/ddd-modeling-impplementation-guilde/tree/master/ticket-modeling/eichisanden

（１）映画チケット購入者の受注管理システムを開発する例を考える．

（２）ドメインエキスパートへの要件定義が終えた想定で，ユースケース図を作成する．オブジェクト図は省略する．

![ticket-modeling_little-hands_usecase-diagram_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ticket-modeling_little-hands_usecase-diagram_example.jpg)

（３）暫定的なドメインモデル図を作成する．```little_hands_s```さんは，IDのみを使用する関係であれば『実線矢印』とし，またオブジェクト全体を使用する関係であれば『黒塗りの菱形』としている．ユースケースから以下のオブジェクトを抽出する．この時，実装パターンをおおまかに予想しておく．また，矢印と菱形の関係性から，集約の境界を設定する．

| ユースケース                   | 抽出されたオブジェクト例                                   | 実装パターン                 | 抽出された集約     |
| ------------------------------ | :--------------------------------------------------------- | ---------------------------- | ------------------ |
| 映画，上映日時，枚数を選択する | 上映時間帯オブジェクト，上映オブジェクト，映画オブジェクト | エンティティ，値オブジェクト | 上映集約，映画集約 |

![ticket-modeling_little-hands_domain-model-diagram_example-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ticket-modeling_little-hands_domain-model-diagram_example-1.jpg)

（３）ドメインモデル図を更新する．

| ユースケース                   | 抽出されたオブジェクト例                                   | 実装パターン                 | 抽出された集約     |
| ------------------------------ | ---------------------------------------------------------- | ---------------------------- | ------------------ |
| 映画，上映日時，枚数を選択する | 上映時間帯オブジェクト，上映オブジェクト，映画オブジェクト | エンティティ，値オブジェクト | 上映集約，映画集約 |
| 〃                             | 予約オブジェクト                                           | エンティティ                 | 予約集約           |
| 割引を選択する                 | 適用割引オブジェクト                                       | 値オブジェクト               | 予約集約           |
| 支払い金額を確認する           | 支払料金オブジェクト                                       | 値オブジェクト               | 支払い料金集約     |

![ticket-modeling_little-hands_domain-model-diagram_example-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ticket-modeling_little-hands_domain-model-diagram_example-2.jpg)

（４）ドメインモデル図を更新する．

| ユースケース                   | 抽出されたオブジェクト例                                   | 実装パターン                 | 抽出された集約     |
| ------------------------------ | ---------------------------------------------------------- | ---------------------------- | ------------------ |
| 映画，上映日時，枚数を選択する | 上映時間帯オブジェクト，上映オブジェクト，映画オブジェクト | エンティティ，値オブジェクト | 上映集約，映画集約 |
| 〃                             | 予約オブジェクト                                           | エンティティ                 | 予約集約           |
| 割引を選択する                 | 適用割引オブジェクト                                       | 値オブジェクト               | 予約集約           |
| 支払い金額を確認する           | 支払料金オブジェクト                                       | 値オブジェクト               | 支払い料金集約     |
| 〃                             | 料金区分オブジェクト                                       | タイプコード（Enum）         | 料金設定集約       |

![ticket-modeling_little-hands_domain-model-diagram_example-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ticket-modeling_little-hands_domain-model-diagram_example-3.jpg)

実装フェーズに入ってからの話になるが，料金区分オブジェクトはEnumとして実装することになり，以下のようになる．

![ticket-modeling_little-hands_enum_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ticket-modeling_little-hands_enum_example.jpg)

（５）ドメインモデル図を更新する．

| ユースケース                   | 抽出されたオブジェクト例                                   | 実装パターン                 | 抽出された集約     |
| ------------------------------ | ---------------------------------------------------------- | ---------------------------- | ------------------ |
| 映画，上映日時，枚数を選択する | 上映時間帯オブジェクト，上映オブジェクト，映画オブジェクト | エンティティ，値オブジェクト | 上映集約，映画集約 |
| 〃                             | 予約オブジェクト                                           | エンティティ                 | 予約集約           |
| 割引を選択する                 | 適用割引オブジェクト                                       | 値オブジェクト               | 予約集約           |
| 支払い金額を確認する           | 支払料金オブジェクト                                       | 値オブジェクト               | 支払い料金集約     |
| 〃                             | 料金区分オブジェクト                                       | タイプコード（Enum）         | 料金設定集約       |
| 〃                             | 料金区分計算オブジェクト                                   | 値オブジェクト               | 料金区分計算集約   |

![ticket-modeling_little-hands_domain-model-diagram_example-4](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ticket-modeling_little-hands_domain-model-diagram_example-4.jpg)

（６）集約間の関係性のみに着目する，オブジェクト間の関係性は複雑であるが，集約間は単純であることが分かる．

![ticket-modeling_little-hands_domain-model-diagram_example-4](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ticket-modeling_little-hands_domain-model-diagram_example-5.png)

