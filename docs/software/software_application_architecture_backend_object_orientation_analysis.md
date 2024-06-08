---
title: 【IT技術の知見】オブジェクト指向分析＠アーキテクチャ
description: オブジェクト指向分析＠アーキテクチャの知見を記録しています。
---

# オブジェクト指向分析＠アーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. オブジェクト指向分析

### 機能の視点

DFD、ユースケース図、アクティビティ図、などがある。

<br>

### 振舞の視点

システムシーケンス図、ステートマシン図、などがある。

<br>

## 02. DFD：Data Flow Diagram (データフロー図)

### DFDとは

![データフロー図](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/データフロー図.jpg)

<br>

## 03. ユースケース図

### ユースケース図とは

アクターとユースケースと関係性を基に、アクターの要求に対するソフトウェアの具体的な『機能』を表す。

ユースケース図はソフトウェアの構造を表現できないため、設計の前段階としては適さない。

そのため、ユースケース図は、オブジェクト図の前段階としてオブジェクトの具体例を抽出することにとどめる。

オブジェクト図の方が、設計の前段階の参考資料として適している。

ユースケース名は、『ソフトウェアは、ユーザーが〇〇を△△する機能を提供する。

』と考え、〇〇 (名詞) をオブジェクト図に反映させる。

<br>

### 記法

![usecase-diagram](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/usecase-diagram.png)

| 記号名                                                                                                                                                             | 説明                                                                                                                                                                                                                                    | 補足                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| アクター：<br>![usecase-diagram_actor](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/usecase-diagram_actor.png)                   | ソフトウェアを利用するユーザーや、連携する他のソフトウェアを表す。                                                                                                                                                                      |                              |
| ユースケース：<br>![usecase-diagram_usecase-name](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/usecase-diagram_usecase-name.png) | ソフトウェアの具体的な機能を表す。                                                                                                                                                                                                      |                              |
| サブジェクト：<br>![usecase-diagram_subject](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/usecase-diagram_subject.png)           | アクターとソフトウェアの境界線を表す。                                                                                                                                                                                                  |                              |
| パッケージ：<br>![usecase-diagram_package](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/usecase-diagram_package.png)             | アクターによって提供する機能に違いがある場合、これの境界線を表す。                                                                                                                                                                      |                              |
| 関連：<br>![usecase-diagram_association](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/usecase-diagram_association.png)           | アクターと機能を結ぶことにより、機能がアクターに提供されることを表す。                                                                                                                                                                  |                              |
| 汎化：<br>![usecase-diagram_genelization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/usecase-diagram_genelization.png)         | アクター間またはユースケース間に、is-a-kind-ofな関係 (グループとメンバーの関係性) があることを表す。                                                                                                                                    |                              |
| 包含：<br>![usecase-diagram_include](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/usecase-diagram_include.png)                   | 矢印元の機能を細分化すると、矢印先の機能も含まれることを表す。                                                                                                                                                                          | `<< invoke >>`も同じである。 |
| 先行：<br>`<< precedes >>`                                                                                                                                         | 矢印元の機能が必ず先に使用されてから、矢印先の機能が使用されることを表す。                                                                                                                                                              |                              |
| 拡張：<br>![usecase-diagram_extend](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/usecase-diagram_extend.png)                     | 矢印元の機能は矢印先の機能の追加機能であり、場合によってはこれが使用されることを表す。                                                                                                                                                  |                              |
| ノート：<br>![usecase-diagram_note](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/usecase-diagram_note.png)                       | 機能の前提事項や考慮事項を記載する。認証/認可は全てのユースケースに関係するため、ノートに記載する。<br>- https://stackoverflow.com/questions/49530596/suggested-way-of-creating-use-case-diagram-where-some-use-cases-requires-authent> |                              |

> - https://it-koala.com/usecasediagrams-1832>
> - https://www.itsenka.com/contents/development/uml/usecase.html>

**＊例＊**

とある映画チケット料金を題材に、ハッシュタグチケット料金モデリングとして、色々な方がユースケース図とクラス図を作成されている。

いずれの方も非常に参考になる

> - https://github.com/tooppoo/ticket-modeling>

`(1)`

: 映画チケット購入者の受注管理ソフトウェアを開発する例を考える。

`(2)`

: 要件定義が終えた想定で、ユースケース図を作成する。オブジェクト図は省略する。

![ticket-modeling_tooppoo_usecase-diagram_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_tooppoo_usecase-diagram_example.png)

`(3)`

: クラス図を作成する。ユースケースから以下のオブジェクトを抽出する。

| ユースケース         | 抽出されたオブジェクト                                           |
| -------------------- | ---------------------------------------------------------------- |
| 映画を選択する       | 映画オブジェクト                                                 |
| タイトルを選択する   | タイトルオブジェクト                                             |
| 映画の形式を選択する | 映画形式オブジェクト、上映形態オブジェクト                       |
| 上映回を選択する     | 上映回オブジェクト、上映日オブジェクト、上映開始時刻オブジェクト |

![ticket-modeling_tooppoo_domain-model-diagram_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ticket-modeling_tooppoo_domain-model-diagram_example.png)

<br>

## 04. アクティビティ図

### アクティビティ図とは

ビジネスロジックや業務フローを手続き的に表記する。

**＊例＊**

![アクティビティ図](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/アクティビティ図.png)

## 05. システムシーケンス図

### システムシーケンス図とは

アクターとソフトウェアの出入力を基に、ユーザーの要求に対するソフトウェアの『動的な振舞』を表す。

オブジェクト間の関係性に基づくシーケンス図とは異なり、図式化の目的としてはユースケース図と似ている。

![system-sequence-diagram](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/system-sequence-diagram.png)

> - https://stackoverflow.com/questions/16889028/difference-between-sequence-diagram-sd-and-a-system-sequence-diagram-ssd>
> - https://digitalgyan.org/difference-between-sequence-diagram-and-a-system-sequence-diagram/
> - https://katzn.hatenablog.com/entry/2013/05/08/235531

<br>

## 06. ステートマシン図

### ステートマシン図とは

ステート、遷移 (矢印) 、遷移のきっかけの説明 (アクティビティ) を記載する。

Stateパターンで実装する。

> - https://cacoo.com/ja/blog/what-is-state-machine-diagram/

<br>

### ステートマシン表とは

ストップウォッチのステートマシン図がある。

![ストップウォッチのステートマシン図](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ストップウォッチのステートマシン図.jpg)

ステートマシン表を作成してみると、ステートマシン図では、9つあるセルのうち`4`個のセルしか表現できておらず、残り5つのセルは表現されていないことに気づける。

![ストップウォッチのステートマシン表](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ストップウォッチのステートマシン表.jpg)

**＊例題＊**

`12.2`という状態

`(1)`

: 初期の状態を『a』として、最初が数字なため、a行の『b』へ移動。

`(2)`

: 現在の状態『b』から、次は数字なため、b行の『b』へ移動。

`(3)`

: 現在の状態『b』から、次は小数点なため、b行の『d』へ移動。

`(4)`

: 現在の状態『d』から、次は数字なため、b行の『e』へ移動。

<br>

## 07. オブジェクト図 (インスタンス図)

### オブジェクト図とは

『インスタンス図』ともいう。

特定のデータを保持する具体的なオブジェクト間の関係性を基に、ソフトウェアの『静的構造』を表す。

<br>

### 記法

![object-diagram](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/object-diagram.png)

| 記号名           | 説明                                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| インスタンス指定 | 特定の状態にあるオブジェクト (インスタンス) の具体例を表す。『<u>`<具体的なインスタンス名>:<クラス名>`</u>』のように下線付きで表記する。 |
| スロット         | インスタンスが保持する具体的なデータを表す。『`<属性名>:<データ型> = <値>`』で表記する。                                                 |
| リンク           | インスタンス間の関係性を表す。何かしらの関係性があれば、全てリンクとして定義する。                                                       |

> - https://thinkit.co.jp/article/40/3/3.html>
> - https://www.itsenka.com/contents/development/uml/object.html>

<br>
