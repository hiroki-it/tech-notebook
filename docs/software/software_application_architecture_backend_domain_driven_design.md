---
title: 【IT技術の知見】ドメイン駆動設計＠アーキテクチャ
description: ドメイン駆動設計＠アーキテクチャの知見を記録しています。
---

# ドメイン駆動設計＠アーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ドメイン駆動設計とは

オブジェクト指向分析設計から派生した分析設計の手法の一種。

オブジェクト指向分析設計のベタープラクティスを集め、より強化するために提唱された。

特に機能要件の多いアプリケーションに有効である。

必ずしもオブジェクト指向設計でドメイン駆動設計に沿う必要はなく、通常のオブジェクト指向分析設計を行っても問題はない。

> - https://www.ogis-ri.co.jp/otc/hiroba/technical/DDDEssence/chap1.html
> - https://ja.wikipedia.org/wiki/%E3%83%89%E3%83%A1%E3%82%A4%E3%83%B3%E9%A7%86%E5%8B%95%E8%A8%AD%E8%A8%88

<br>

## 02. ドメイン駆動設計の手順例

### 戦略的設計の手順例

![ddd_strategic_design_flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ddd_strategic_design_flow.png)

戦略的設計では、ドメイン全体から境界づけられたコンテキストを明確にする。

`(1)`

: ドメインエキスパートと話し合い、ドメイン全体の中からコアドメインとサブドメインを切り分ける。

`(2)`

: ドメインエキスパートの部署や業務フローの立ち位置によっては、同じ『名詞』や『動詞』であっても、意味合い/定義づけが異なる場合がある。この時、それぞれを異なる名前からなるユビキタス言語として定義づける。

`(3)`

: ユビキタス言語を元に、境界づけられたコンテキストを定義づける。

`(4)`

: コンテキストマップを作成し、境界づけられたコンテキスト間の関係を明らかにする。

> - https://qiita.com/crossroad0201/items/875c5f76ed3794ed56c4

<br>

### 戦術的設計の手順例

戦術的設計では、境界づけられたコンテキストをアーキテクチャやデザインパターンに落とし込む。

ここでは、SUDOモデリングを採用するものとする。

`(1)`

: ドメインエキスパートと話し合いにビジネスルールや振る舞いをヒアリングする。

`(2)`

: オブジェクトの具体化のためにユースケース図やオブジェクト図でオブジェクトを作成し、抽象化のためにドメインモデル図も作成する。

`(3)`

: 必要であればドメインエキスパートに再ヒアリングを行い、特にオブジェクト図とドメインモデル図を改善する。

`(4)`

: ドメインモデル図を元に、クラス図を作成する。この時、モデルをエンティティや値オブジェクトを切り分けるようにする。

`(5)`

: アーキテクチャ (レイヤード型、ヘキサゴナル型、オニオン型、クリーンアーキテクチャ) を決め、クラス図を元にドメイン層を実装する。

`(6)`

: 運用後に問題が発生した場合、特にオブジェクト図とドメインモデル図を修正する。場合によっては、デザインパターンに切り分ける。

> - https://booth.pm/ja/items/3363104

<br>

## 03. 戦略的設計

### ドメイン

#### ▼ ドメインとは

ビジネスモデル全体で見た時に、ソフトウェア化の対象となる業務領域のこと。

#### ▼ ドメインの分割方法

業務領域を分割する時の粒度は小さいほど良い。

業務領域を細分化する上で境目を見分ける方法として、会社の組織図から、部署ごとに担当する業務の種類を確認すると良い。

また、ビジネスモデルの一連の業務フローの中で、業務の担当者の属性が変化するタイミングに着目すると良い。

担当者が変われば、コールセンター部 (電話対応業務、顧客管理業務) 、法人営業部 (受注業務) 、マーケティング部 (ユーザー集客業務、広告運用業務) 、管理部 (会計業務、財務業務、採用業務) 、というように業務をより小さな単位で抽出できるはずである。

この時の注意点として、業務領域は、ToBやToCに関わらないことである。

例えば、ToCなドメインとしては、マーケーティング部による業務 (ユーザー集客業務、広告運用業務) がある。

> - https://github.com/little-hands/ddd-q-and-a/issues/191

**＊例＊**

インターネット広告代理店の例。

ビジネスモデルに基づく複数のドメインを以下に示す。

業務フローの担当者の変化として、まず問い合わせで注文を受けて広告アカウントを作成する『営業担当者』、制作した広告をアカウントに入稿する『制作担当者』、入稿された広告を運用して広告効果を高める『マーケティング担当者』、最後に広告の依頼者に料金を請求する『経理担当者』が挙げられる。

これにより、インターネット広告代理店のビジネスモデルは、各担当者に対応するドメインに分割できる。

![internet_advertising_agency_domain](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/internet_advertising_agency_domain.png)

> - https://labs.septeni.co.jp/entry/2021/04/15/130000

**＊例＊**

![hacogym_business_model](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/hacogym_business_model.png)

完全個室ジムを運営するハコジムの例。

ビジネスモデルに基づく複数のドメインを以下に示す。

業務フローの担当者の変化として、まず個室ジムに適する物件を探す『物件担当者』、ジムのトレーナーを採用して会員に紹介する『採用担当者』、個室ジムの利用会員を獲得する『営業担当者』が挙げられる。

これにより、ハコジムのビジネスモデルは、各担当者に対応するドメインに分割できる。

![hacogym_domain](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/hacogym_domain.png)

> - https://hacogym.jp/
> - https://zenn.dev/hsshss/articles/e11efefc7011ab

**＊例＊**

プラットフォームエンジニアリングでは、エンジニアの技術的な業務がドメインになる。

例えば、監視SaaSでは監視業務領域がドメインになる。

適切な監視手法の選択、適切なTCP/IPのプロトコルの選択、アラートの巡回が業務である。

<br>

### コアドメイン、サブドメイン、ドメインエキスパート

#### ▼ コアドメイン、サブドメイン、ドメインエキスパートとは

各ドメインのドメインエキスパートと、エンジニアが話し合いながら、ドメイン内の主要業務をコアドメイン、補助的な業務をサブドメインに分類する。

コアドメインやサブドメインに相当する業務に詳しい人 (アプリケーションの利用者本人、利用者の関心に詳しい人) がドメインエキスパートになることが多い。

プラットフォームエンジニアリングでは、エンジニアの技術的な業務 (監視業務、セキュリティ対策など) がドメインになる。

そのため、プラットフォームSaaSではドメインエキスパートはエンジニアになる。

![core-domain_sub-domain_bounded-context](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/core-domain_sub-domain_bounded-context.png)

> - https://qiita.com/crossroad0201/items/875c5f76ed3794ed56c4
> - https://labs.septeni.co.jp/entry/2021/04/15/130000

#### ▼ サブドメインの委譲

コアドメインのソフトウェアは内製である必要があるが、サブドメインのソフトウェアは外製/内製のいずれでも問題ない。

必要であれば、他の業務系パッケージや業務系SaaS (例：決済代行のベリトランス、経理SaaSのマネーフォワード、総務人事SaaSのサイボウズなど) にドメインロジックを委譲し、これのAPIをコールしてデータを取得するような設計でもよい。

ただ、コアドメインが外部に依存すると、そのSaaSで障害が起こった時にコアドメインのシステムも停止する可能性があるため、注意が必要である。

> - https://medium.com/nick-tune-tech-strategy-blog/core-domain-patterns-941f89446af5
> - https://speakerdeck.com/mploed/aligning-organization-and-architecture-with-strategic-ddd?slide=26

#### ▼ 記法

**＊例＊**

完全個室ジムを運営するハコジムの例。

ドメインのうちで、個室ジムドメインに基づくコアドメインとサブドメインを以下に示す。

コアドメインは予約ドメイン、それ以外はサブドメインとしている。

![hacogym_subdomain](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/hacogym_subdomain.png)

> - https://hacogym.jp/
> - https://zenn.dev/hsshss/articles/e11efefc7011ab

**＊例＊**

ECサイトを運営するアスクルの例。

ドメインのうちで、個人向け販売ドメイン (サイト名はLOHACO) に基づくコアドメインとサブドメインを以下に示す。

配送/注文/商品/ユーザ管理/在庫/受注をそれぞれサブドメインとしている (コアドメインは明言されていない) 。

> - https://speakerdeck.com/askul/ddd-and-clean-architecture-at-lohaco?slide=28

<br>

### ユビキタス言語

#### ▼ ユビキタス言語とは

同じ境界づけられたコンテキスト内で`1`個の意味合い/定義付けを持った『名詞』や『動詞』のこと。

ドメインエキスパート間で、特定の『名詞』や『動詞』の意味合い/定義づけが異なる場合、これを異なる名前からなるユビキタス言語として定義づける。

![domain-model](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain-model.png)

> - https://qiita.com/kmdsbng/items/bf415afbeec239a7fd63

#### ▼ 抽出例

| 単語 | 意味合い | 対応するドメインモデル |
| ---- | -------- | ---------------------- |
| ...  | ...      | ...                    |
| ...  | ...      | ...                    |

> - https://zenn.dev/leaner_dev/articles/20210922-ubiquitous-language?redirected=1

<br>

### 境界づけられたコンテキスト

#### ▼ 境界づけられたコンテキストとは

ドメインエキスパートの業務フローの立ち位置が異なれば、同じ『名詞』や『動詞』であっても、異なる意味合い/定義づけのユビキタス言語が使用される。

異なるユビキタス言語を元にして、境界づけられたコンテキストを設定する。

この時、ユビキタス言語は、他の境界づけられたコンテキストでは通じないものであればあるほど良い。

境界づけられたコンテキストそれぞれのユビキタス言語に合わせて、異なる名前でモデリングしていく。

境界づけられたコンテキストを定義しない場合、異なるユビキタス言語をコアドメインやサブドメイン間で共有することとなり、それぞれの関心に無関係なデータを保持することになってしまう。

#### ▼ 記法

**＊例＊**

本を販売するECサイトの例。

コアドメインとサブドメインに基づいたユビキタス言語と境界づけられたコンテキストを以下に示す。

バイヤー (仕入れ) 部、マーケティング部、在庫管理部のドメインエキスパートは、『本 (商品) 』という名詞に対する意味合い/定義づけが異なる。

そのため、それぞれを『本』『クーポン』『在庫』というユビキタス言語として定義でき、モデル名/データ名はそれぞれのユビキタス言語に合わせた名前になる。

例えば、マーケの境界づけられたコンテキストでは、モデル名はCouponとなり、割引期間データを保持する必要があるが、仕入部や在庫部ではこのデータは不要である。

一方、ISBNは全ての境界づけられたコンテキストのモデルに必要なデータである。

境界づけられたコンテキストを定義しない場合、`1`個の商品モデルが全てのデータを保持することとなり、それぞれのドメインエキスパートが関心を持たないデータも保持することになってしまう。

![book_ec_ubiquitous_language](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/book_ec_ubiquitous_language.png)

> - https://kenta-kosugi.medium.com/%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AE%E4%B8%8A%E6%89%8B%E3%81%AA%E5%88%86%E5%89%B2-ff5bb01d1062

**＊例＊**

完全個室ジムを運営するハコジムの例。

個室ジムドメインのコアドメインとサブドメインに基づく境界づけられたコンテキスト。

認証コンテキスト、予約コンテキスト、顧客管理コンテキスト、銀行支払いコンテキスト、クレジットカード支払いコンテキストがある。

![hacogym_bounded-context](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/hacogym_bounded-context.png)

> - https://hacogym.jp/
> - https://zenn.dev/hsshss/articles/e11efefc7011ab

**＊例＊**

契約請求管理アプリケーションを提供するアルプの例。

コアドメインとサブドメインに基づいたユビキタス言語と境界づけられたコンテキストを以下に示す。

契約管理コンテキスト、商品管理コンテキスト、請求管理コンテキストがある。

アルプでは、ユビキタス言語を定期的に認識合わせするために、週次でユビキタス言語を追加し、また定義を更新している。

![contract_billing_management_ubiquitous_language](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/contract_billing_management_ubiquitous_language.png)

> - https://note.com/alpinc/n/nab47ab9273c6
> - https://thealp.co.jp/

**＊例＊**

会計アプリケーションを提供するfreeeの例。

財務会計コンテキスト、会計ワークフローコンテキスト、従業員管理コンテキストがある。

![freee_bounded-context](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/freee_bounded-context.png)

> - https://speakerdeck.com/him0/4-years-for-carving-out-a-micro-service-from-freee-accounting?slide=22

**＊例＊**

アプリケーションがモデリングしている業務フローを考えるとわかりやすい。

ビジネス全体のどの部分をアプリケーションにしているのかによるが、例えばAmazonで以下の登場人物がいるとする。

1. 受注管理する人は、商品ドメインモデルが持つ注文内容/値段に関する状態に関心がある。
2. 在庫管理する人は、商品ドメインモデルが持つ在庫数に関する状態に関心がある。
3. 発送管理する人は、商品ドメインモデルが持つ発送状況に関する状態に関心がある。
4. 請求管理する人は、商品ドメインモデルが持つ請求状況に関する状態に関心がある。
5. 仕入れ管理する人は、商品ドメインモデルが持つ仕入れ状況に関する状態に関心がある。

商品 (Item) というオブジェクトがあった時に、業務フローの中で商品を扱う人の文脈 (コンテキスト) によって、商品ドメインモデルの持つ状態への関心が変わる。

ここでいう状態とは、具体的に商品ドメインモデルを実装した時にプロパティとしてオブジェクトに持たせている状態である。

上記の1-4は、同じ商品ドメインモデルに対して関心の内容が異なるので、境界づけられたコンテキストが異なるとみなした方が良い。

別々のマイクロサービスとして分割し、それぞれのマイクロサービス上で異なる商品ドメインモデルを定義し、異なる状態を持たせることになる。

反対にモノリスだと、一つの商品ドメインモデルにコンテキスト関係なく全ての種類の状態を持たせて、全てのコンテキストで再利用する。

> - https://next-engine.net/ec-blog/order-flow/

<br>

### ドメインモデルの種類

#### ▼ 隠蔽モデル

特定の境界づけられたコンテキストのみで使用するドメインモデルのこと。

![bounded-context_domain-model_type](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/bounded-context_domain-model_type.png)

#### ▼ 共有モデル

異なる境界づけられたコンテキスト間で、一部の状態を共有ドメインモデルのこと。

図では、在庫品目モデルがそれに相当する。

![bounded-context_domain-model_type](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/bounded-context_domain-model_type.png)

<br>

### コンテキストマップ

#### ▼ コンテキストマップとは

広義のドメイン全体の俯瞰する図のこと。

コアドメイン、サブドメイン、境界づけられたコンテキストを定義した後、これらの関係性を視覚化する。

異なるサブドメインの間で異なるユビキタス言語を使用する場合、境界づけられたコンテキストはサブドメインをまたがない。

一方で、同じユビキタス言語を使用する場合、境界づけられたコンテキストは複数のサブドメインにまたがる。

できる限り、各境界づけられたコンテキストでは異なるユビキタス言語を使用して、境界づけられたコンテキストが複数のサブドメインにまたがないようにした方が良い (これ重要) 。

![context-map](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/context-map.png)

> - https://qiita.com/crossroad0201/items/875c5f76ed3794ed56c4

#### ▼ 記法

**＊例＊**

完全個室ジムを運営するハコジムの例。

個室ジムドメインのそれぞれの境界づけられたコンテキストに基づくモデリング。

コアドメインの予約コンテキストとスマートロックコンテキストは、`1`個のマイクロサービスとして内製化している。

一方で、それ以外の境界づけられたコンテキストは外製化している。

![hacogym_subdomain_modeling](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/hacogym_subdomain_modeling.png)

<br>

## 04. 戦術的設計

### MVCからレイヤードアーキテクチャへの変遷

#### ▼ MVCと問題点

ドメイン駆動設計が提唱される以前、MVCの考え方が主流であった。

しかし、特にModelの役割が抽象的過ぎたため、開発規模が大きくなるにつれて、Modelに役割を集中させ過ぎてしまうことがあった。

![MVCモデル](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/MVCモデル.png)

#### ▼ MVCからレイヤードアーキテクチャへの移行

ドメイン駆動設計が登場したことによって、MVCは発展し、M・V・Cそれぞれの役割がより具体的で精密になった。

Modelの肥大化は、Modelが持つビジネスロジックをドメイン層、またCRUD処理をインフラ層として分割することによって、対処された。

![ドメイン駆動設計](https://user-images.githubusercontent.com/42175286/58724663-2ec11c80-8418-11e9-96e9-bfc6848e9374.png)

<br>

### DDDアーキテクチャの種類

#### ▼ レイヤードアーキテクチャ

最初に提唱された実現方法。

レイヤードアーキテクチャのインフラ層に対して、依存性逆転を組み込むかどうはには言及していない。

- ユーザーインターフェース層またはインターフェース層 (コントローラー、認証)
- アプリケーション層 (ユースケース)
- ドメイン層 (ドメインモデル、認可)
- インフラ層 (永続化)

![layered-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/layered-architecture.png)

> - https://www.amazon.co.jp/dp/4798121967
> - https://techblog.yahoo.co.jp/entry/2021011230061115/
> - https://zenn.dev/praha/articles/5c05ab671fb7ab#%E6%AE%8B%E3%81%A3%E3%81%9F%E3%81%AE%E3%81%AF%E4%B8%80%E7%95%AA%E5%A4%96%E5%81%B4%E3%81%AEui%2Finfrastructure%E3%81%AE%E3%81%A9%E3%81%A1%E3%82%89%E3%81%8B

#### ▼ MVCからレイヤードアーキテクチャに移行

| MVCアーキテクチャ | レイヤードアーキテクチャ            |
| ----------------- | ----------------------------------- |
| Model             | ドメイン層、インフラ層              |
| Controller        | ユーザーインターフェース層          |
| View              | ユーザーインターフェース層          |
| -                 | アプリケーション層 (新しく実装する) |

#### ▼ レイヤードアーキテクチャに依存性逆転を組み込む

レイヤードアーキテクチャのインフラ層に対して、依存性逆転を組み込んだもの。

ドメイン層のオブジェクトは、ドメイン層の他のオブジェクトに依存する以外、何のオブジェクトにも外部パッケージにも依存しない。

逆に考えれば、これらに依存するものはドメイン層に配置する必要はないと判断できる。

#### ▼ ヘキサゴナルアーキテクチャ

別名『ポートアンドアダプターアーキテクチャ』という。

レイヤードアーキテクチャ

本質的には、他の『オニオンアーキテクチャ』『クリーンアーキテクチャ』に同じである。

> - https://www.amazon.co.jp/dp/B00UX9VJGW/ref=cm_sw_r_tw_dp_S20HJ24MHWTSED7T0ZCP

#### ▼ オニオンアーキテクチャ

本質的には、他の『ヘキサゴナルアーキテクチャ』『クリーンアーキテクチャ』に同じである。

![onion-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/onion-architecture.png)

> - https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/
> - https://little-hands.hatenablog.com/entry/2017/10/11/075634

#### ▼ クリーンアーキテクチャ

本質的には、他の『ヘキサゴナルアーキテクチャ』『オニオンアーキテクチャ』に同じである。

![clean-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/clean-architecture.jpeg)

> - https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

<br>

### ドメインモデル

#### ▼ ドメインモデルとは

現実の業務を抽象化した概念のこと。

> - https://codezine.jp/article/detail/11968
> - https://www.amazon.co.jp/dp/B082WXZVPC
> - https://booth.pm/ja/items/3363104

#### ▼ ドメインモデル図

ドメインモデルの図のこと。

基本的にオブジェクト指向分析設計では、分析のためにユースケース図やオブジェクト図を作成し、その後に設計のためにクラス図やシーケンス図を作成する。

一方でドメイン駆動設計の分析では、オブジェクトの具体化のためにユースケース図やオブジェクト図でオブジェクトを作成し、抽象化のためにドメインモデル図も作成する。

この『具体例から抽象を導く』という作業により、オブジェクト思考分析よりも現実に沿ったモデリングが可能になる。

> - https://booth.pm/ja/items/3363104

#### ▼ ドメインオブジェクト図

ドメインモデルを具体的に実装した図のこと。

> - https://codezine.jp/article/detail/11968
> - https://www.amazon.co.jp/dp/B082WXZVPC
> - https://booth.pm/ja/items/3363104

#### ▼ コアドメイン/サブドメインのモデリング

ドメインモデル図を基に、コアドメイン/サブドメインのモデリングを実行する。

![core-domain_sub-domain_bounded-context_modeling](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/core-domain_sub-domain_bounded-context_modeling.png)

> - https://qiita.com/crossroad0201/items/875c5f76ed3794ed56c4

#### ▼ 記法

クラス図と同様にして、オブジェクト図のインスタンス間の関係性を参考にして、ドメインモデル間の関係性を設定する。

オブジェクト間がIDのみを使用する関係であれば『点線矢印』とし、加えてオブジェクト全体を使用する関係であれば『白塗りの菱形』とする (記号の表記方法は個人差がある) 。

この時、点線矢印の関係性であれば異なる集約に所属し、加えて白塗りの菱形であれば同じ集約に所属しているため、これらから集約の境界を設定する。

インスタンス間のリンク記号数を参考にして、多重度を付記する。

ビジネスルールを吹き出しに書き込むことにより、ソフトウェアの構造のみでなくビジネスルールも表す。

> - https://booth.pm/ja/items/3363104
> - https://www.eureka-moments-blog.com/entry/2018/12/29/145802
> - https://github.com/ShisatoYano/PlantUML/blob/master/DomainModelDiagram/DomainModelDiagram.pdf

**＊例＊**

1. 業務内容をヒアリングし、ユースケース図を作成する
2. ヒアリング内容からユビキタス言語を抽出し、ドメインモデル図を作成する
3. ドメインモデル図からエンティティと値オブジェクトを含むルートエンティティを作成する

> - https://qiita.com/little_hand_s/items/dfa4b156f533ba1a1491

**＊例＊**

とある映画チケット料金を題材に、ハッシュタグチケット料金モデリングとして、色々な方がユースケース図とドメインモデル図を作成されている。

いずれの方も非常に参考になる (モデリングは難しい) 。

> - https://cinemacity.co.jp/ticket/
> - https://twitter.com/little_hand_s/status/1150763962062913536?lang=ar
> - https://github.com/bookreadking/ddd-modeling-impplementation-guilde/tree/master/ticket-modeling/eichisanden

`(1)`

: 映画チケット購入者の受注管理システムを開発する例を考える。

`(2)`

: ドメインエキスパートへの要件定義が終えた想定で、ユースケース図を作成する。オブジェクト図は省略する。

![ticket-modeling_little-hands_usecase-diagram_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_little-hands_usecase-diagram_example.jpg)

`(3)`

: 暫定的なドメインモデル図を作成する。`little_hands_s`さんは、IDのみを使用する関係であれば『実線矢印』とし、加えてオブジェクト全体を使用する関係であれば『黒塗りの菱形』としている。ユースケースから以下のオブジェクトを抽出する。この時、実装パターンをおおまかに予想しておく。また、矢印と菱形の関係性から、集約の境界を設定する。

| ユースケース                   | 抽出されたオブジェクト例                                   | 実装パターン                 | 抽出された集約     |
| ------------------------------ | :--------------------------------------------------------- | ---------------------------- | ------------------ |
| 映画、上映日時、枚数を選択する | 上映時間帯オブジェクト、上映オブジェクト、映画オブジェクト | エンティティ、値オブジェクト | 上映集約、映画集約 |

![ticket-modeling_little-hands_domain-model-diagram_example-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_little-hands_domain-model-diagram_example-1.jpg)

`(3)`

: ドメインモデル図を更新する。

| ユースケース                   | 抽出されたオブジェクト例                                   | 実装パターン                 | 抽出された集約     |
| ------------------------------ | ---------------------------------------------------------- | ---------------------------- | ------------------ |
| 映画、上映日時、枚数を選択する | 上映時間帯オブジェクト、上映オブジェクト、映画オブジェクト | エンティティ、値オブジェクト | 上映集約、映画集約 |
| 同上                           | 予約オブジェクト                                           | エンティティ                 | 予約集約           |
| 割引を選択する                 | 適用割引オブジェクト                                       | 値オブジェクト               | 予約集約           |
| 支払い金額を確認する           | 支払料金オブジェクト                                       | 値オブジェクト               | 支払い料金集約     |

![ticket-modeling_little-hands_domain-model-diagram_example-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_little-hands_domain-model-diagram_example-2.jpg)

`(4)`

: ドメインモデル図を更新する。

| ユースケース                   | 抽出されたオブジェクト例                                   | 実装パターン                 | 抽出された集約     |
| ------------------------------ | ---------------------------------------------------------- | ---------------------------- | ------------------ |
| 映画、上映日時、枚数を選択する | 上映時間帯オブジェクト、上映オブジェクト、映画オブジェクト | エンティティ、値オブジェクト | 上映集約、映画集約 |
| 同上                           | 予約オブジェクト                                           | エンティティ                 | 予約集約           |
| 割引を選択する                 | 適用割引オブジェクト                                       | 値オブジェクト               | 予約集約           |
| 支払い金額を確認する           | 支払料金オブジェクト                                       | 値オブジェクト               | 支払い料金集約     |
| 同上                           | 料金区分オブジェクト                                       | 区分オブジェクト (Enum)      | 料金設定集約       |

![ticket-modeling_little-hands_domain-model-diagram_example-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_little-hands_domain-model-diagram_example-3.jpg)

実装フェーズに入ってからの話になるが、料金区分オブジェクトはenum型として実装することになり、以下の様になる。

![ticket-modeling_little-hands_enum_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_little-hands_enum_example.jpg)

`(5)`

: ドメインモデル図を更新する。

| ユースケース                   | 抽出されたオブジェクト例                                   | 実装パターン                 | 抽出された集約     |
| ------------------------------ | ---------------------------------------------------------- | ---------------------------- | ------------------ |
| 映画、上映日時、枚数を選択する | 上映時間帯オブジェクト、上映オブジェクト、映画オブジェクト | エンティティ、値オブジェクト | 上映集約、映画集約 |
| 同上                           | 予約オブジェクト                                           | エンティティ                 | 予約集約           |
| 割引を選択する                 | 適用割引オブジェクト                                       | 値オブジェクト               | 予約集約           |
| 支払い金額を確認する           | 支払料金オブジェクト                                       | 値オブジェクト               | 支払い料金集約     |
| 同上                           | 料金区分オブジェクト                                       | 区分オブジェクト (Enum)      | 料金設定集約       |
| 同上                           | 料金区分計算オブジェクト                                   | 値オブジェクト               | 料金区分計算集約   |

![ticket-modeling_little-hands_domain-model-diagram_example-4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_little-hands_domain-model-diagram_example-4.jpg)

`(6)`

: 集約間の関係性のみに着目する、オブジェクト間の関係性は複雑であるが、集約間は単純であることが分かる。

![ticket-modeling_little-hands_domain-model-diagram_example-4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_little-hands_domain-model-diagram_example-5.png)

<br>

## 04-02. ドメインモデリング手法の種類

### ステートソーシングパターン

#### ▼ ステートソーシングパターンとは

ドメインモデル（ミュータブルモデル）の最新の状態を永続化する。

過去の状態は上書きしてしまう。

通信方式がリクエスト−レスポンスパターンの場合に適する。

#### ▼ モデリングフレームワーク

- SUDOモデリング (システム関連図、ユースケース図、ドメインモデル図、オブジェクト図)
- RDRA
- ICONIX (ユースケース駆動)

> - https://flxy.jp/media/article/23938
> - https://zenn.dev/team_soda/articles/9c7e818df81152#%E3%83%89%E3%83%A1%E3%82%A4%E3%83%B3%E3%83%A2%E3%83%87%E3%83%AA%E3%83%B3%E3%82%B0%E3%81%AE%E6%89%8B%E6%B3%95
> - http://masuda220.jugem.jp/?eid=435

#### ▼ テーブル構造

| `id` | `order_name` |
| ---- | ------------ |
| 1    | foo          |
| 2    | bar          |
| 3    | baz          |
| 4    | qux          |
| 5    | quux         |

<br>

### イベントソーシングパターン

#### ▼ イベントソーシングパターンとは

ドメインモデル（イミュータブルモデル）の状態の履歴を永続化する。

通信方式がパブリッシュ/サブスクライブパターンの場合に適する。

CQRSと相性が良い。

> - https://qiita.com/suin/items/f559e3dcde7c811ed4e1
> - https://martinfowler.com/articles/201701-event-driven.html
> - https://zenn.dev/shmi593/articles/56c890962bb807
> - https://zenn.dev/team_soda/articles/9c7e818df81152#%E3%83%89%E3%83%A1%E3%82%A4%E3%83%B3%E3%83%A2%E3%83%87%E3%83%AA%E3%83%B3%E3%82%B0%E3%81%AE%E6%89%8B%E6%B3%95

#### ▼ モデリングフレームワーク

- イベントストーミング

#### ▼ テーブル構造

イベントソーシングは、ステートソーシング (CRUD) とは異なり、データの参照/作成しかない。

`event_entity_id`カラムを使えば、特定のドメインモデル (`event_entity`カラム) の状態の履歴を追跡できる。

そのため、ステートソーシングではドメインモデル（ミュータブルモデル）の最新の状態しか永続化できない一方で、イベントソーシングパターンはドメインモデル（ミュータブルモデル）の状態の履歴が残る。

そのため、Gitのようにして過去の状態をを参照できる。

テーブル構造は以下のとおりになり、イベントデータが参照/作成されるだけである。

| `id` | `event_name`  | `event_entity_name` | `event_entity_id` | `event_data`                                  |
| ---- | ------------- | ------------------- | ----------------- | --------------------------------------------- |
| 1    | OrderCreated  | Order               | 1                 | OrderCreatedオブジェクトをJSONに変換したもの  |
| 2    | OrderUpdated  | Order               | 1                 | OrderUpdatedオブジェクトをJSONに変換したもの  |
| 3    | OrderCreated  | Order               | 2                 | OrderCreatedオブジェクトをJSONに変換したもの  |
| 4    | OrderCanceled | Order               | 1                 | OrderCanceledオブジェクトをJSONに変換したもの |
| 5    | OrderCreated  | Order               | 3                 | OrderCreatedオブジェクトをJSONに変換したもの  |
| ...  | ...           | ...                 | ...               | ...                                           |

> - https://youtu.be/Jtcp9ry8ZcE?t=1066
> - https://qiita.com/uzawa-sorich/items/261021c1d265b20117ab#%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E3%82%BD%E3%83%BC%E3%82%B7%E3%83%B3%E3%82%B0es%E3%81%A3%E3%81%A6%E4%BD%95

<br>
