---
title: 【IT技術の知見】戦術的設計＠ドメイン駆動設計
description: 戦術的設計＠ドメイン駆動設計の知見を記録しています。
---

# 戦術的設計＠ドメイン駆動設計

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. MVC からレイヤードアーキテクチャへの変遷

### MVC と問題点

ドメイン駆動設計が提唱される以前、MVC の考え方が主流であった。

しかし、特に Model の役割が抽象的過ぎたため、開発規模が大きくなるにつれて、Model に役割を集中させ過ぎてしまうことがあった。

![MVCモデル](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/MVCモデル.png)

### MVC からレイヤードアーキテクチャへの移行

ドメイン駆動設計が登場したことによって、MVC は発展し、M・V・C それぞれの役割がより具体的で精密になった。

Model の肥大化は、Model が持つビジネスロジックをドメイン層、また CRUD 処理をインフラストラクチャ層として分割することによって、対処された。

![ドメイン駆動設計](https://user-images.githubusercontent.com/42175286/58724663-2ec11c80-8418-11e9-96e9-bfc6848e9374.png)

<br>

## 02. ドメインモデル

### ドメインモデルとは

現実の業務を抽象化した概念のこと。

> - https://codezine.jp/article/detail/11968
> - https://www.amazon.co.jp/dp/B082WXZVPC
> - [ドメイン駆動設計 サンプルコード&FAQ - little-hands - BOOTH](https://booth.pm/ja/items/3363104)

### ドメインモデル図

ドメインモデルの図のこと。

基本的にオブジェクト指向分析設計では、分析のためにユースケース図やオブジェクト図を作成し、その後に設計のためにクラス図やシーケンス図を作成する。

一方でドメイン駆動設計の分析では、オブジェクトの具体化のためにユースケース図やオブジェクト図でオブジェクトを作成し、抽象化のためにドメインモデル図も作成する。

この『具体例から抽象を導く』という作業により、オブジェクト指向分析よりも現実に沿ったモデリングが可能になる。

> - [ドメイン駆動設計 サンプルコード&FAQ - little-hands - BOOTH](https://booth.pm/ja/items/3363104)

### ドメインオブジェクト図

ドメインモデルを具体的に実装した図のこと。

> - https://codezine.jp/article/detail/11968
> - https://www.amazon.co.jp/dp/B082WXZVPC
> - [ドメイン駆動設計 サンプルコード&FAQ - little-hands - BOOTH](https://booth.pm/ja/items/3363104)

### コアドメイン/サブドメインのモデリング

ドメインモデル図を基に、コアドメイン/サブドメインのモデリングを実行する。

![core-domain_sub-domain_bounded-context_modeling](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/core-domain_sub-domain_bounded-context_modeling.png)

> - [DDDのドメイン・サブドメイン・ユビキタス言語・境界づけられたコンテキストを整理する #ドメイン駆動設計 - Qiita](https://qiita.com/crossroad0201/items/875c5f76ed3794ed56c4)

### 記法

クラス図と同様にして、オブジェクト図のインスタンス間の関係性を参考にして、ドメインモデル間の関係性を設定する。

オブジェクト間が ID のみを使用する関係であれば『点線矢印』とし、加えてオブジェクト全体を使用する関係であれば『白塗りの菱形』とする (記号の表記方法は個人差がある) 。

このとき、点線矢印の関係性であれば異なる集約に所属し、加えて白塗りの菱形であれば同じ集約に所属しているため、これらから集約の境界を設定する。

インスタンス間のリンク記号数を参考にして、多重度を付記する。

ドメインルールを吹き出しに書き込むことにより、ソフトウェアの構造のみでなくドメインルールも表す。

> - [ドメイン駆動設計 サンプルコード&FAQ - little-hands - BOOTH](https://booth.pm/ja/items/3363104)
> - [PlantUMLを通じてドメインモデル図の書き方を学ぶ - EurekaMoments](https://www.eureka-moments-blog.com/entry/2018/12/29/145802)
> - [PlantUML/DomainModelDiagram/DomainModelDiagram.pdf at master · ShisatoYano/PlantUML · GitHub](https://github.com/ShisatoYano/PlantUML/blob/master/DomainModelDiagram/DomainModelDiagram.pdf)

1. 業務内容をヒアリングし、ユースケース図を作成する
2. ヒアリング内容からユビキタス言語を抽出し、ドメインモデル図を作成する
3. ドメインモデル図からエンティティと値オブジェクトを含むルートエンティティを作成する

> - [DDD ドメインモデリングサンプル #設計 - Qiita](https://qiita.com/little_hand_s/items/dfa4b156f533ba1a1491)

とある映画チケット料金を題材に、ハッシュタグチケット料金モデリングとして、いろいろなほうがユースケース図とドメインモデル図を作成されている。

いずれのほうも非常に参考になる (モデリングは難しい) 。

> - [チケット : チケット料金 \| シネマシティ](https://cinemacity.co.jp/ticket/)
> - [松岡@AI/DDD/アジャイル على X: "コードの話が主な文脈かもとは思いつつ、モデリングと書いてあるので普段やっているように「ユースケース図→ドメインモデル図→コード」という流れを踏んでみる。 まずはユースケース図。この段階で前提を削ぎ落としておかないとモデリング対象が膨らんでいくので重要。 #チケット料金モデリング" / X](https://twitter.com/little_hand_s/status/1150763962062913536?lang=ar)
> - [ddd-modeling-impplementation-guilde/ticket-modeling/eichisanden at master · bookreadking/ddd-modeling-impplementation-guilde · GitHub](https://github.com/bookreadking/ddd-modeling-impplementation-guilde/tree/master/ticket-modeling/eichisanden)

1. 映画チケット購入者の受注管理システムを開発する例を考える。

2. ドメインエキスパートへの要件定義を終えた想定で、ユースケース図を作成する。
    オブジェクト図は省略する。

    ![ticket-modeling_little-hands_usecase-diagram_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_little-hands_usecase-diagram_example.jpg)

3. 暫定的なドメインモデル図を作成する。
`little_hands_s` さんは、ID のみを使用する関係であれば『実線矢印』とし、加えてオブジェクト全体を使用する関係であれば『黒塗りの菱形』としている。
ユースケースから以下のオブジェクトを抽出する。
このとき、実装パターンをおおまかに予想しておく。
また、矢印と菱形の関係性から、集約の境界を設定する。

<table>
  <thead>
    <tr>
      <th>ユースケース</th>
      <th style="text-align:left">抽出されたオブジェクト例</th>
      <th>実装パターン</th>
      <th>抽出された集約</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>映画、上映日時、枚数を選択する</td>
      <td style="text-align:left">上映時間帯オブジェクト、上映オブジェクト、映画オブジェクト</td>
      <td>エンティティ、値オブジェクト</td>
      <td>上映集約、映画集約</td>
    </tr>
  </tbody>
</table>

![ticket-modeling_little-hands_domain-model-diagram_example-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_little-hands_domain-model-diagram_example-1.jpg)

3. ドメインモデル図を更新する。

    <table>
      <thead>
        <tr>
          <th>ユースケース</th>
          <th>抽出されたオブジェクト例</th>
          <th>実装パターン</th>
          <th>抽出された集約</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td rowspan="2">映画、上映日時、枚数を選択する</td>
          <td>上映時間帯オブジェクト、上映オブジェクト、映画オブジェクト</td>
          <td>エンティティ、値オブジェクト</td>
          <td>上映集約、映画集約</td>
        </tr>
        <tr>
          <td>予約オブジェクト</td>
          <td>エンティティ</td>
          <td>予約集約</td>
        </tr>
        <tr>
          <td>割引を選択する</td>
          <td>適用割引オブジェクト</td>
          <td>値オブジェクト</td>
          <td>予約集約</td>
        </tr>
        <tr>
          <td>支払い金額を確認する</td>
          <td>支払料金オブジェクト</td>
          <td>値オブジェクト</td>
          <td>支払い料金集約</td>
        </tr>
      </tbody>
    </table>

    ![ticket-modeling_little-hands_domain-model-diagram_example-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_little-hands_domain-model-diagram_example-2.jpg)

4. ドメインモデル図を更新する。

    <table>
      <thead>
        <tr>
          <th>ユースケース</th>
          <th>抽出されたオブジェクト例</th>
          <th>実装パターン</th>
          <th>抽出された集約</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td rowspan="2">映画、上映日時、枚数を選択する</td>
          <td>上映時間帯オブジェクト、上映オブジェクト、映画オブジェクト</td>
          <td>エンティティ、値オブジェクト</td>
          <td>上映集約、映画集約</td>
        </tr>
        <tr>
          <td>予約オブジェクト</td>
          <td>エンティティ</td>
          <td>予約集約</td>
        </tr>
        <tr>
          <td>割引を選択する</td>
          <td>適用割引オブジェクト</td>
          <td>値オブジェクト</td>
          <td>予約集約</td>
        </tr>
        <tr>
          <td rowspan="2">支払い金額を確認する</td>
          <td>支払料金オブジェクト</td>
          <td>値オブジェクト</td>
          <td>支払い料金集約</td>
        </tr>
        <tr>
          <td>料金区分オブジェクト</td>
          <td>区分オブジェクト (Enum)</td>
          <td>料金設定集約</td>
        </tr>
      </tbody>
    </table>

    ![ticket-modeling_little-hands_domain-model-diagram_example-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_little-hands_domain-model-diagram_example-3.jpg)

    実装フェーズに入ってからの話になるが、料金区分オブジェクトは enum 型として実装することになり、以下のようになる。

    ![ticket-modeling_little-hands_enum_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_little-hands_enum_example.jpg)

5. ドメインモデル図を更新する。

    <table>
      <thead>
        <tr>
          <th>ユースケース</th>
          <th>抽出されたオブジェクト例</th>
          <th>実装パターン</th>
          <th>抽出された集約</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td rowspan="2">映画、上映日時、枚数を選択する</td>
          <td>上映時間帯オブジェクト、上映オブジェクト、映画オブジェクト</td>
          <td>エンティティ、値オブジェクト</td>
          <td>上映集約、映画集約</td>
        </tr>
        <tr>
          <td>予約オブジェクト</td>
          <td>エンティティ</td>
          <td>予約集約</td>
        </tr>
        <tr>
          <td>割引を選択する</td>
          <td>適用割引オブジェクト</td>
          <td>値オブジェクト</td>
          <td>予約集約</td>
        </tr>
        <tr>
          <td rowspan="3">支払い金額を確認する</td>
          <td>支払料金オブジェクト</td>
          <td>値オブジェクト</td>
          <td>支払い料金集約</td>
        </tr>
        <tr>
          <td>料金区分オブジェクト</td>
          <td>区分オブジェクト (Enum)</td>
          <td>料金設定集約</td>
        </tr>
        <tr>
          <td>料金区分計算オブジェクト</td>
          <td>値オブジェクト</td>
          <td>料金区分計算集約</td>
        </tr>
      </tbody>
    </table>

    ![ticket-modeling_little-hands_domain-model-diagram_example-4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_little-hands_domain-model-diagram_example-4.jpg)

6. 集約間の関係性のみに着目すると、オブジェクト間の関係性は複雑であるが、集約間は単純であることがわかる。

    ![ticket-modeling_little-hands_domain-model-diagram_example-4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_little-hands_domain-model-diagram_example-5.png)

<br>

## 03. ドメインモデリング手法の種類

### ステートソーシングパターン

#### ▼ ステートソーシングパターンとは

ドメインモデル（ミュータブルモデル）の最新の状態を永続化する。

過去の状態は上書きしてしまう。

通信方式がリクエスト／レスポンス方式の場合に適する。

#### ▼ モデリングフレームワーク

- SUDO モデリング (システム関連図、ユースケース図、ドメインモデル図、オブジェクト図)
- RDRA
- ICONIX (ユースケース駆動)
- イベントストーミング (これはイベントソーシングでも使える)

> - [ドメインエキスパート/エンジニアと語るDDD実践例 \[CTO meetup イベントレポート\] - FLEXY（フレキシー）](https://flxy.jp/media/article/23938)
> - [イベントストーミングを咀嚼する](https://zenn.dev/team_soda/articles/9c7e818df81152#%E3%83%89%E3%83%A1%E3%82%A4%E3%83%B3%E3%83%A2%E3%83%87%E3%83%AA%E3%83%B3%E3%82%B0%E3%81%AE%E6%89%8B%E6%B3%95)
> - [state ソーシング、 event ソーシング 【スタイルの選択肢】 \| システム設計日記](http://masuda220.jugem.jp/?eid=435)

#### ▼ テーブル構造

<table>
  <thead>
    <tr>
      <th><code>id</code></th>
      <th><code>order_name</code></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>foo</td>
    </tr>
    <tr>
      <td>2</td>
      <td>bar</td>
    </tr>
    <tr>
      <td>3</td>
      <td>baz</td>
    </tr>
    <tr>
      <td>4</td>
      <td>qux</td>
    </tr>
    <tr>
      <td>5</td>
      <td>quux</td>
    </tr>
  </tbody>
</table>

#### ▼ イベント仲介システム

ステートソーシングパターンの場合、ドメインオブジェクトを状態に着目してモデリングしている。

ステートソーシングパターンでは、必要な箇所でイベント仲介システムを任意に使用できる。

通知処理をステートソーシングパターンでモデリングし、イベント仲介システムにメールを送信する。

<br>

### イベントソーシングパターン

#### ▼ イベントソーシングパターンとは

ドメインモデル（イミュータブルモデル）の状態の履歴を永続化する。

通信方式がパブリッシュ／サブスクライブ方式の場合に適する。

CQRS と相性がよい。

> - [DDD: ImmutableなEntityの実装方法〜ステートソーシングなEntityとイベントソーシングなEntity〜 #Scala - Qiita](https://qiita.com/suin/items/f559e3dcde7c811ed4e1)
> - [What do you mean by “Event-Driven”?](https://martinfowler.com/articles/201701-event-driven.html)
> - [Event Sourcing 完全に理解した](https://zenn.dev/shmi593/articles/56c890962bb807)
> - [イベントストーミングを咀嚼する](https://zenn.dev/team_soda/articles/9c7e818df81152#%E3%83%89%E3%83%A1%E3%82%A4%E3%83%B3%E3%83%A2%E3%83%87%E3%83%AA%E3%83%B3%E3%82%B0%E3%81%AE%E6%89%8B%E6%B3%95)

#### ▼ モデリングフレームワーク

業務フローやそのなかでドメインイベントを見つけるための方法として、イベントストーミングがある。

ただ、イベントソーシングパターンだけでなく、ステートソーシングパターンでも使える。

#### ▼ テーブル構造

イベントソーシングは、ステートソーシング (CRUD) とは異なり、データの参照/作成しかない。

`event_entity_id` カラムを使えば、特定のドメインモデル (`event_entity` カラム) の状態の履歴を追跡できる。

そのため、ステートソーシングではドメインモデル（ミュータブルモデル）の最新の状態しか永続化できない一方で、イベントソーシングパターンはドメインモデル（ミュータブルモデル）の状態の履歴が残る。

Git のようにして過去の状態を参照できる。

テーブル構造は以下のとおりになり、イベントデータが参照/作成されるだけである。

<table>
  <thead>
    <tr>
      <th><code>id</code></th>
      <th><code>event_name</code></th>
      <th><code>event_entity_name</code></th>
      <th><code>event_entity_id</code></th>
      <th><code>event_data</code></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>OrderCreated</td>
      <td>Order</td>
      <td>1</td>
      <td>OrderCreated オブジェクトを JSON に変換したもの</td>
    </tr>
    <tr>
      <td>2</td>
      <td>OrderUpdated</td>
      <td>Order</td>
      <td>1</td>
      <td>OrderUpdated オブジェクトを JSON に変換したもの</td>
    </tr>
    <tr>
      <td>3</td>
      <td>OrderCreated</td>
      <td>Order</td>
      <td>2</td>
      <td>OrderCreated オブジェクトを JSON に変換したもの</td>
    </tr>
    <tr>
      <td>4</td>
      <td>OrderCanceled</td>
      <td>Order</td>
      <td>1</td>
      <td>OrderCanceled オブジェクトを JSON に変換したもの</td>
    </tr>
    <tr>
      <td>5</td>
      <td>OrderCreated</td>
      <td>Order</td>
      <td>3</td>
      <td>OrderCreated オブジェクトを JSON に変換したもの</td>
    </tr>
    <tr>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
  </tbody>
</table>

> - https://youtu.be/Jtcp9ry8ZcE?t=1066
> - [SQLでもイベントソーシングはできるという話 #設計 - Qiita](https://qiita.com/uzawa-sorich/items/261021c1d265b20117ab#%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E3%82%BD%E3%83%BC%E3%82%B7%E3%83%B3%E3%82%B0es%E3%81%A3%E3%81%A6%E4%BD%95)

#### ▼ イベント仲介システム

イベントソーシングパターンの場合、ドメインオブジェクトをイベントに着目してモデリングしている。

そのため、イベント仲介システムを使用する必要がある。

通知処理をイベントソーシングパターンでモデリングし、イベント仲介システムにメールを送信する。

<br>

## 04. アーキテクチャの種類

### レイヤードアーキテクチャ

#### ▼ ４層の場合

最初に提唱された実現方法。

![layered-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/layered-architecture.png)

レイヤードアーキテクチャのインフラストラクチャ層に対して、依存性逆転を組み込むかどうかには言及していない。

- インターフェース層 (コントローラー、認証)
- ユースケース層 (ユースケース)
- ドメイン層 (ドメインモデル、認可)
- インフラストラクチャ層 (永続化)

MVC との関係は次のとおりである。

<table>
  <thead>
    <tr>
      <th>MVC アーキテクチャ</th>
      <th>レイヤードアーキテクチャ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Model</td>
      <td>ドメイン層、インフラストラクチャ層</td>
    </tr>
    <tr>
      <td>Controller</td>
      <td>インターフェース層</td>
    </tr>
    <tr>
      <td>View</td>
      <td>インターフェース層</td>
    </tr>
    <tr>
      <td>-</td>
      <td>ユースケース層 (新しく実装する)</td>
    </tr>
  </tbody>
</table>

> - https://www.amazon.co.jp/dp/4798121967
> - [ドメイン駆動設計で保守性をあげたリニューアル事例 〜 ショッピングクーポンの設計紹介 - Yahoo! JAPAN Tech Blog](https://techblog.yahoo.co.jp/entry/2021011230061115/)
> - [DDDにおける認証の実装場所](https://zenn.dev/praha/articles/5c05ab671fb7ab#%E6%AE%8B%E3%81%A3%E3%81%9F%E3%81%AE%E3%81%AF%E4%B8%80%E7%95%AA%E5%A4%96%E5%81%B4%E3%81%AEui%2Finfrastructure%E3%81%AE%E3%81%A9%E3%81%A1%E3%82%89%E3%81%8B)

#### ▼ ３層の場合

４層のときにあったユースケース層とドメイン層をビジネスロジック層として統合する。

- インターフェース層 (コントローラー、認証)
- ビジネスロジック層 (ユースケース、ドメインモデル、認可)
- インフラストラクチャ層 (永続化)

> - [旬なアーキテクチャって何だろう？｜ＳＯＭＰＯシステムズ(株)【公式note】](https://note.sompo-sys.com/n/n62fdd17a7dc4)

<br>

### レイヤードアーキテクチャに依存性逆転を組み込む

レイヤードアーキテクチャのインフラストラクチャ層に対して、依存性逆転を組み込んだもの。

ドメイン層のオブジェクトは、ドメイン層のほかのオブジェクトに依存する以外、他のオブジェクトや外部パッケージに依存しない。

逆に考えれば、これらに依存するものはドメイン層に配置する必要はないと判断できる。

<br>

### ヘキサゴナルアーキテクチャ

別名『ポートアンドアダプターアーキテクチャ』という。

レイヤードアーキテクチャ

本質的には、他の『オニオンアーキテクチャ』『クリーンアーキテクチャ』に同じである。

> - https://www.amazon.co.jp/dp/B00UX9VJGW/ref=cm_sw_r_tw_dp_S20HJ24MHWTSED7T0ZCP

<br>

### オニオンアーキテクチャ

本質的には、他の『ヘキサゴナルアーキテクチャ』『クリーンアーキテクチャ』に同じである。

![onion-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/onion-architecture.png)

> - [The Onion Architecture : part 1 \| Programming with Palermo](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/)
> - [ドメイン駆動 + オニオンアーキテクチャ概略\[DDD\] - little hands' lab](https://little-hands.hatenablog.com/entry/2017/10/11/075634)

<br>

### クリーンアーキテクチャ

本質的には、他の『ヘキサゴナルアーキテクチャ』『オニオンアーキテクチャ』に同じである。

![clean-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/clean-architecture.jpeg)

> - [Clean Coder Blog](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

<br>
