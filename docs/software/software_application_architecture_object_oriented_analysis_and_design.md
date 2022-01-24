---
title: 【知見を記録するサイト】オブジェクト指向分析設計
---

# オブジェクト指向分析設計

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01 オブジェクト指向

### オブジェクト指向を取り巻く歴史

参考：https://umtp-japan.org/event-seminar/4233

![プログラミング言語と設計手法の歴史](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/プログラミング言語と設計手法の歴史.png)

<br>

### オブジェクト指向とは

互いに密接に関連するデータと手続き（処理手順）を，オブジェクトと呼ばれる1つのまとまりとして捉えること．

<br>

## 01-02. オブジェクト指向分析設計の手順例

### オブジェクト指向分析の手順例

#### 1. ユースケース図の作成

要件定義に基づいて，ユースケース図を作成する．これにより，ソフトウェアの具体的な機能を明確化させる．

#### 2. オブジェクト図の作成

要件定義とユースケース図に基づいて，オブジェクト図を作成する．ユースケース図に含まれる名詞に着目し，オブジェクトを抽出する．これにより，ソフトウェアの具体的な静的構造を明確化させる．

参考：https://ja.wikipedia.org/wiki/%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E6%8C%87%E5%90%91%E5%88%86%E6%9E%90%E8%A8%AD%E8%A8%88#%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E6%8C%87%E5%90%91%E5%88%86%E6%9E%90

<br>

### オブジェクト指向設計の手順例

#### 1. クラス図の作成，多重度の付記

オブジェクト図のインスタンス間の関係性を参考にして，クラス図を作成する．また，クラス間がデータとして保持する関係性にある時に，インスタンス間のリンク記号数を参考にして，多重度を付記する．これにより，ソフトウェアの抽象的な静的構造を明確化させる．クラス図ではソフトウェアの『振舞』を設計できないため，これはシーケンス図に託す．

#### 2. シーケンス図の作成

オブジェクト図を参考にしつつ，これに時系列を取り入れ，シーケンス図を作成する．シーケンス図ではソフトウェアの『構造』を設計できないため，これはクラス図に託す．システムシーケンス図とシーケンス図の違いについて，以下のリンク先を参考にせよ．

参考：

- https://stackoverflow.com/questions/16889028/difference-between-sequence-diagram-sd-and-a-system-sequence-diagram-ssd
- https://en.wikipedia.org/wiki/Sequence_diagram

#### 3. 設計のレビュー

ソフトウェアの静的構造を設計するクラス図と，動的な振舞を設計するシーケンス図の間の整合性から，設計を妥当性をレビューする．

参考：https://www.sparxsystems.jp/bin/docs/ClassAndSeq.pdf

#### 4. デザインパターンの導入

クラス図に，デザインパターンを基にしたクラスを導入する．

#### 5. フレームワークのコンポーネントの導入

クラス図に，フレームワークのコンポーネントを導入する．

<br>

## 01-03. ダイアグラム

### ダイアグラムとは

オブジェクト指向分析設計で，ソフトウェアをモデリングしやすくするための図のこと．

<br>

### ダイアグラムの種類

UML，概念データモデリング，構造化分析，リアルタイム分析，がある．

参考：https://home.jeita.or.jp/page_file/20151221161211_Pkr0lJhRIV.pd

![diagrams](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/diagrams.png)
<br>

### 視点による分類

#### ・機能の視点

ユーザーの要求に対するソフトウェアの機能に注目するダイアグラムが属する．

#### ・振舞の視点

ソフトウェアの時系列的な振舞に注目するダイアグラムが属する．シーケンス図には，分析に用いるシステムシーケンス図と，設計に用いるシーケンス図があることに注意する．

#### ・構造の視点

ソフトウェアの構成要素とそれぞれの関係に注目するダイアグラムが属する．クラス図は設計のために用いることに注意する．

<br>

## 02. オブジェクト指向分析

### 機能の視点

DFD，ユースケース図，アクティビティ図，などがある．

<br>

### 振舞の視点

システムシーケンス図，状態遷移図，などがある．

<br>

## 02-02. DFD：Data Flow Diagram（データフロー図）

### DFDとは

![データフロー図](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/データフロー図.jpg)

<br>

## 02-03. ユースケース図

### ユースケース図とは

アクターとユースケースと関係性に基づいて，アクターの要求に対するソフトウェアの具体的な『機能』を表現する．ユースケース図はソフトウェアの構造を表現できないため，設計の前段階としてはあまり役立たない．そのため，ユースケース図は，オブジェクト図の前段階としてオブジェクトの具体例を抽出することにとどめる．オブジェクト図の方が，設計の前段階の参考資料として適している．ユースケース名は，『ソフトウェアは，ユーザーが〇〇を△△する機能を提供する．』と考え，〇〇（名詞）をオブジェクト図に反映させる．

<br>

### 記法

参考：

- https://it-koala.com/usecasediagrams-1832
- https://www.itsenka.com/contents/development/uml/usecase.html

![usecase-diagram](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/usecase-diagram.png)

| 記号名                                                       | 説明                                                         | 補足                             |
| ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------- |
| アクター：<br>![usecase-diagram_actor](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/usecase-diagram_actor.png) | ソフトウェアを利用するユーザーや，連携する他のソフトウェアを表現する． |                                  |
| ユースケース：<br>![usecase-diagram_usecase-name](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/usecase-diagram_usecase-name.png) | ソフトウェアの具体的な機能を表現する．                       |                                  |
| サブジェクト：<br>![usecase-diagram_subject](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/usecase-diagram_subject.png) | アクターとソフトウェアの境界線を表現する．                   |                                  |
| パッケージ：<br>![usecase-diagram_package](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/usecase-diagram_package.png) | アクターによって提供する機能に違いがある場合，これの境界線を表現する． |                                  |
| 関連：<br>![usecase-diagram_association](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/usecase-diagram_association.png) | アクターと機能を結ぶことで，機能がアクターに提供されることを表現する． |                                  |
| 汎化：<br>![usecase-diagram_genelization](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/usecase-diagram_genelization.png) | アクター間またはユースケース間に，is-a-kind-ofな関係（グループとメンバーの関係性）があることを表現する． |                                  |
| 包含：<br>![usecase-diagram_include](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/usecase-diagram_include.png) | 矢印元の機能を細分化すると，矢印先の機能も含まれることを表現する． | ```<< invoke >>```も同じである． |
| 先行：<br>```<< precedes >>```                               | 矢印元の機能が必ず先に使用されてから，矢印先の機能が用いられることを表現する． |                                  |
| 拡張：<br>![usecase-diagram_extend](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/usecase-diagram_extend.png) | 矢印元の機能は矢印先の機能の追加機能であり，場合によってはこれが用いられることを表現する． |                                  |
| ノート：<br>![usecase-diagram_note](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/usecase-diagram_note.png) | 機能の前提事項や考慮事項を記載する．認証/認可は全てのユースケースに関係するため，ノートに記載する．<br>参考：https://stackoverflow.com/questions/49530596/suggested-way-of-creating-use-case-diagram-where-some-use-cases-requires-authent |                                  |

**＊例＊**

とある映画チケット料金を題材に，ハッシュタグチケット料金モデリングとして，色々な方がユースケース図とクラス図を作成されている．いずれの方も非常に参考になる

参考：https://github.com/tooppoo/ticket-modeling

（１）映画チケット購入者の受注管理ソフトウェアを開発する例を考える．

（２）要件定義が終えた想定で，ユースケース図を作成する．オブジェクト図は省略する．

![ticket-modeling_tooppoo_usecase-diagram_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ticket-modeling_tooppoo_usecase-diagram_example.png)

（３）クラス図を作成する．ユースケースから以下のオブジェクトを抽出する．

| ユースケース     | 抽出されたオブジェクト                                       |
| ---------------- | ------------------------------------------------------------ |
| 映画を選択する       | 映画オブジェクト                                             |
| タイトルを選択する   | タイトルオブジェクト                                         |
| 映画の形式を選択する | 映画形式オブジェクト，上映形態オブジェクト                   |
| 上映回を選択する     | 上映回オブジェクト，上映日オブジェクト，上映開始時刻オブジェクト |

![ticket-modeling_tooppoo_domain-model-diagram_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ticket-modeling_tooppoo_domain-model-diagram_example.png)

<br>

## 02-04. アクティビティ図

### アクティビティ図とは

ビジネスロジックや業務フローを手続き的に表記する方法．

**＊例＊**

![アクティビティ図](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/アクティビティ図.png)

## 02-05. システムシーケンス図

### システムシーケンス図とは

![system-sequence-diagram](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/system-sequence-diagram.png)

アクターとソフトウェアの出入力に基づいて，ユーザーの要求に対するソフトウェアの『動的な振舞』を表現する．オブジェクト間の関係性に基づくシーケンス図とは異なり，図式化の目的としてはユースケース図と似ている．

参考：

- https://stackoverflow.com/questions/16889028/difference-between-sequence-diagram-sd-and-a-system-sequence-diagram-ssd
- https://digitalgyan.org/difference-between-sequence-diagram-and-a-system-sequence-diagram/
- https://katzn.hatenablog.com/entry/2013/05/08/235531

<br>

## 02-06. 状態遷移図

### 状態遷移図とは

状態（丸）と⁠遷移（矢印）の関係性に基づいて，ソフトウェアの『動的な振舞』を表現する．矢印の横の説明は，遷移のきっかけとなる『イベント（入力）⁠/アクション（出力）⁠』を表現する．

![状態遷移図](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ストップウォッチ状態遷移図.jpg)

<br>

### 状態遷移表とは

状態遷移図から作成した表．状態遷移表を作成してみると，状態遷移図では，9つあるセルのうち4つのセルしか表現できておらず，残り5つのセルは表現されていないことに気づくことができる．

![状態遷移表](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ストップウォッチ状態遷移表.jpg)

**＊例題＊**

12.2 という状態

1. 初期の状態を『a』として，最初が数字なので，a行の『b』へ移動．
2. 現在の状態『b』から，次は数字なので，b行の『b』へ移動．
3. 現在の状態『b』から，次は小数点なので，b行の『d』へ移動．
4. 現在の状態『d』から，次は数字なので，b行の『e』へ移動．

![状態遷移表](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/状態遷移表.png)

<br>

## 02-07. オブジェクト図（インスタンス図）

### オブジェクト図とは

『インスタンス図』ともいう．特定のデータを保持する具体的なオブジェクト間の関係性に基づいて，ソフトウェアの『静的構造』を表現する．

<br>

### 記法

| 記号名           | 説明                                                         |
| ---------------- | ------------------------------------------------------------ |
| インスタンス指定 | 特定の状態にあるオブジェクト（インスタンス）の具体例を表現する．『<u>```<具体的なインスタンス名>:<クラス名>```</u>』のように下線付きで表記する． |
| スロット         | インスタンスが保持する具体的なデータを表現する．『```<属性名>:<データ型> = <値>```』で表記する． |
| リンク           | インスタンス間の関係性を表現する．何かしらの関係性があれば，全てリンクとして定義する． |

参考：

- https://thinkit.co.jp/article/40/3/3.html
- https://www.itsenka.com/contents/development/uml/object.html

![object-diagram](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/object-diagram.png)

<br>

## 03. オブジェクト指向設計

### 構造の視点

クラス図，ER図，などがある．

<br>

### 振舞の視点

シーケンス図などがある．

<br>

### 構造とビジネスルール/制約の視点

ドメインモデル図がある．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_architecture_backend_domain_driven_design.html

<br>

## 03-02. クラス図

### クラス図とは

クラス間の関係性に基づいて，ソフトウェアの『静的構造』を表現する．オブジェクト図のインスタンス間の関係性を参考にして，クラス間の関係性の種類を判断する．

<br>

### 記法の種類

#### ・has-one，has-many（データとして保持する関係性）

![データとして保持する関係性](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/データとして保持する関係性.png)

『has-one』『has-many』な関係と表現され，より具体的に説明すると，とデータとして保持する関係性である．Association（関連），Aggregation（集約），Composition（合成）が用いられる．『Association ＞ Aggregation ＞ Composition』の順で，依存性が低くなる．実装例は以下のリンク先を参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_object_oriented_language_php_class_based.html

#### ・is-a-kind-of（グループとメンバーの関係性）

![グループとメンバーの関係性](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/グループとメンバーの関係性.png)

『is-a-kind-of』な関係と表現され，より具体的に説明すると，とグループとメンバーの関係性である．Generalization（汎化），Realization（実現）が用いられる．実装例は以下のリンク先を参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_object_oriented_language_php_class_based.html

#### ・use（引数型/返却値型として用いる関係性）

![引数型または返却値型として用いる関係性](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/引数型または返却値型として用いる関係性.png)

『use』な関係と表現され，より具体的に説明すると，と引数型/返却値型として用いる関係性である．Dependency（依存）が用いられる．実装例は以下のリンク先を参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_object_oriented_language_php_class_based.html

<br>

### データとして保持する関係性の多重度

#### ・multiplicity（多重度）とは

クラス間がデータとして保持する関係性にある時に，保持される側クラスが何個のクラスに保持されるか，また反対に保持する側クラスが保持される側クラスを何個保持するか，を表現する．このように2つの見方があることが混乱するので注意する．オブジェクト図のインスタンス間のリンク記号数を参考にして定義する．

参考：https://atmarkit.itmedia.co.jp/ait/articles/0105/02/news002.html

#### ・記法

| 保持する/保持されるクラスの個数 |    記法    |
| :------------------------------- | :--------: |
| 1                                |  ```1```   |
| 0以上1以下（つまり，0または1）   | ```0..1``` |
| 0以上n以下                       | ```0..n``` |
| m以上n以下                       | ```m..n``` |
| 0以上無限大以下（つまり，0以上） |  ```*```   |
| 0以上無限大以下（つまり，0以上） | ```0..*``` |

**＊例＊**

社員は1つの会社にしか所属できないとする．『社員クラス』から見たときに，1つの『会社クラス』にしか保持されない．よって，会社クラスに『```1```』を付記する．一方で『会社クラス』から見たときに，0以上の『社員クラス』を保持する．よって，会社クラスに『```0..*```』を付記する．

![多重度](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/多重度.png)

<br>

## 03-03. ER図：Entity Relation Diagram

### ER図とは

DBテーブルのカラム間の関係性に基づいて，DBの構造を表現する．『IE 記法』と『IDEF1X 記法』が一般的に用いられる．

<br>

### IE記法

![ER図（IE記法）](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ER図（IE記法）.png)

#### ・エンティティ，属性

![エンティティとアトリビュート](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/エンティティとアトリビュート.png)

#### ・リレーション，カーディナリティ

  エンティティ間の関係を表現する．

![リレーションとカーディナリティ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/リレーションとカーディナリティ.png)

#### ・1：1

![1対1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/1対1.png)

#### ・1：多（リレーションが曖昧な状態）

オブジェクト指向分析が進むにつれ，『1：0 以上の関係』『1：1 以上の関係』のように具体化しく．

![1対1以上](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/1対1以上.png)

#### ・1：1 以上

![1対1以上](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/1対1以上.png)

<br>

## 03-04. シーケンス図

### シーケンス図とは

オブジェクト間の時系列的な関係性に基づいて，ソフトウェアの『動的な振舞』を表現するダイアグラムのこと．

**＊例＊**

1. 5つのライフライン（店員オブジェクト，管理画面オブジェクト，検索画面オブジェクト，商品DBオブジェクト，商品詳細画面オブジェクト）を設定する．
2. 各ライフラインで実行される実行仕様間の命令内容を，メッセージや複合フラグメントで示す．

![シーケンス図](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/シーケンス図.png)

**＊例＊**

1. 3つのライフラインを設定する．
2. 各ライフラインで実行される実行仕様間の命令内容を，メッセージや複合フラグメントで示す．

![シーケンス図_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/シーケンス図_2.png)

