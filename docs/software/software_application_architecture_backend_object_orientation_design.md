---
title: 【IT技術の知見】オブジェクト指向設計＠アーキテクチャ
description: オブジェクト指向設計＠アーキテクチャの知見を記録しています。
---

# オブジェクト指向設計＠アーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. オブジェクト指向設計

### 構造の視点

クラス図、ER図、などがある。

<br>

### 振舞の視点

シーケンス図などがある。

<br>

### 構造とビジネスルール/制約の視点

ドメインモデル図がある。

> - https://hiroki-it.github.io/tech-notebook/software/software_application_architecture_backend_domain_driven_design.html

<br>

## 02. クラス図

### クラス図とは

クラス間の関係性を基に、ソフトウェアの『静的構造』を表す。

オブジェクト図のインスタンス間の関係性を参考にして、クラス間の関係性の種類を判断する。

<br>

### 記法の種類

#### ▼ has-one、has-many (データとして保持する関係性)

![データとして保持する関係性](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/データとして保持する関係性.png)

『has-one』『has-many』な関係と表現され、より具体的に説明すると、とデータとして保持する関係性である。

Association (関連) 、Aggregation (集約) 、Composition (合成) が使用される。

『Association ＞ Aggregation ＞ Composition』の順で、依存性が低くなる。実装例は以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/language/language_php_class_based.html

#### ▼ is-a-kind-of (グループとメンバーの関係性)

![グループとメンバーの関係性](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/グループとメンバーの関係性.png)

『is-a-kind-of』な関係と表現され、より具体的に説明すると、とグループとメンバーの関係性である。

Generalization (汎化) 、Realization (実現) が使用される。実装例は以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/language/language_php_class_based.html

#### ▼ use (引数型/返却値型として使用する関係性)

![引数型または返却値型として使用する関係性](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/引数型または返却値型として使用する関係性.png)

『use』な関係と表現され、より具体的に説明すると、と引数型/返却値型として使用する関係性である。

Dependency (依存) が使用される。

実装例は以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/language/language_php_class_based.html

<br>

### データとして保持する関係性の多重度

#### ▼ multiplicity (多重度) とは

クラス間がデータとして保持する関係性にある時に、保持される側クラスが何個のクラスに保持されるか、また反対に保持する側クラスが保持される側クラスを何個保持するか、を表す。

このように`2`個の見方があることが混乱するので注意する。

オブジェクト図のインスタンス間のリンク記号数を参考にして定義する。

> - https://atmarkit.itmedia.co.jp/ait/articles/0105/02/news002.html

#### ▼ 記法

| 保持する/保持されるクラスの個数 |  記法  |
| :------------------------------ | :----: |
| 1                               |  `1`   |
| 0以上1以下 (つまり、0または1)   | `0..1` |
| 0以上n以下                      | `0..n` |
| m以上n以下                      | `m..n` |
| 0以上無限大以下 (つまり、0以上) |  `*`   |
| 0以上無限大以下 (つまり、0以上) | `0..*` |

**＊例＊**

社員は`1`個の会社にしか所属できないとする。

『社員クラス』から見た時に、`1`個の『会社クラス』にしか保持されない。

よって、会社クラスに『`1`』を付記する。

一方で『会社クラス』から見た時に、0以上の『社員クラス』を保持する。

よって、会社クラスに『`0..*`』を付記する。

![多重度](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/多重度.png)

<br>

## 03. ER図：Entity Relation Diagram

### ER図とは

DBテーブルのカラム間の関係性を基に、DBの構造を表す。

『IE記法』と『IDEF1X記法』が一般的に使用される。

<br>

### IE記法

#### ▼ IE記法とは

![er-diagram_ie](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/er-diagram_ie.png)

#### ▼ エンティティ、属性

テーブルに相当するエンティティと、カラムに相当する属性がある。

![エンティティとアトリビュート](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/エンティティとアトリビュート.png)

#### ▼ リレーション、カーディナリティ

リレーションとカーディナリティを組み合わせて、エンティティ間の関係性の強さを表す。

`(カラム数/レコード数)`で導かれ、カーディナリティが高いほど、より効率的なDBインデックスを作成できる。

![リレーションとカーディナリティ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/リレーションとカーディナリティ.png)

> - https://qiita.com/soyanchu/items/034be19a2e3cb87b2efb>

<br>

### 関係性の種類

#### ▼ 1：1

![1対1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/1対1.png)

#### ▼ 1：多 (リレーションが曖昧な状態)

オブジェクト指向分析が進むにつれ、『1：0 以上の関係』『1：1 以上の関係』のように具体化しく。

![1対1以上](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/1対1以上.png)

#### ▼ 1：1 以上

![1対1以上](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/1対1以上.png)

<br>

## 04. シーケンス図

### シーケンス図とは

オブジェクト間の時系列的な関係性を基に、ソフトウェアの『動的な振舞』を表すダイアグラムのこと。

| 記号名                              | 説明                                                                                                                                 | 補足                                                                                                                                                                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ライフライン                        | オブジェクト (クラス、インスタンス) を表す。                                                                                         | 粒度を大きくして、システムのコンポーネントをライフラインとすることもある。                                                                                                                                                           |
| 実行仕様                            | ライフライン上で実行されている処理を表す。                                                                                           |                                                                                                                                                                                                                                      |
| 停止                                | ライフラインが削除されることを表す。                                                                                                 |                                                                                                                                                                                                                                      |
| 同期メッセージ                      | 既存のライフラインを同期的にコールすることを表す。                                                                                   |                                                                                                                                                                                                                                      |
| 非同期メッセージ                    | 既存のライフラインを非同期的にコールすることを表す。                                                                                 |                                                                                                                                                                                                                                      |
| 生成メッセージ                      | ライフラインを新しく作成することを表す。                                                                                             |                                                                                                                                                                                                                                      |
| 自己メッセージ                      | ライフラインが、自分自身の内部処理をコールして処理を繰り返すこと、を表す。                                                           | ・https://www.lesswrong.com/posts/gQ5eQjRTY87LpjhQv/when-to-use-meta-vs-self-reference-recursive-etc>                                                                                                                                |
| 再帰的メッセージ                    | ライフラインが、自分自身全体をコールして処理を繰り返すこと、を表す。                                                                 | ・https://www.lesswrong.com/posts/gQ5eQjRTY87LpjhQv/when-to-use-meta-vs-self-reference-recursive-etc>                                                                                                                                |
| 入れ子実行仕様                      | 再帰的メッセージによってコールされた別の実行仕様を表す。                                                                             |                                                                                                                                                                                                                                      |
| 返却メッセージ                      | コールの結果を他のライフラインに返却することを表す。                                                                                 |                                                                                                                                                                                                                                      |
| 複合フラグメント (結合フラグメント) | 条件分岐、繰り返し、などによって実行されたコールであること表す。実行仕様とメッセージを四角で囲い、左上隅にオペレーター名を記載する。 | 条件分岐の場合はオペレーター名を`alt` (`alternative`) 、繰り返しの場合は`loop`とする。<br>・https://qiita.com/devopsCoordinator/items/4535c3cce207b114ad6c#%E8%A4%87%E5%90%88%E3%83%95%E3%83%A9%E3%82%B0%E3%83%A1%E3%83%B3%E3%83%88> |

> - https://rainbow-engine.com/sequence-diagram-sample/
> - https://lecture.ecc.u-tokyo.ac.jp/~hideo-t/references/uml/sequence-diagram/sequence-diagram.html

**＊例＊**

`(1)`

: 5つのライフライン (店員オブジェクト、管理画面オブジェクト、検索画面オブジェクト、商品DBオブジェクト、商品詳細画面オブジェクト) を設定する。

`(2)`

: 各ライフラインで実行される実行仕様間の命令内容を、メッセージや複合フラグメントで示す。

![シーケンス図](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/シーケンス図.png)

**＊例＊**

`(1)`

: `3`個のライフラインを設定する。

`(2)`

: 各ライフラインで実行される実行仕様間の命令内容を、メッセージや複合フラグメントで示す。

![シーケンス図_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/シーケンス図_2.png)

<br>

## 05. コンポーネント図

複数のクラスから構成される処理を`1`個の図で表現した図のこと。

| 記号名                 | 説明                       |
| ---------------------- | -------------------------- |
| コンポーネント名       | 処理コンポーネントを表す。 |
| 提供側インターフェース |                            |
| 要求側インターフェース |                            |

> - https://www.itsenka.com/contents/development/uml/component.html
> - https://www.bcm.co.jp/site/2002/uml/uml10.htm

<br>
