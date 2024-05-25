---
titlIe: 【IT技術の知見】プラクティス集＠RDBMS
description: プラクティス集＠RDBMSの知見を記録しています。
---

# プラクティス集＠RDBMS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. テーブル設計

### テーブルの種類

#### ▼ masterテーブル

初期開発時に作成して以降、めったに変更処理を実行せず、読み出し処理を主とするテーブル。

ドメインのうちで、ID、識別コード、名前などに関するデータを管理する。

> - https://innoscale.de/en/difference-master-data-and-transaction-data/
> - https://products.sint.co.jp/topsic/blog/database-basic-knowledge

#### ▼ transactionテーブル

初期開発時に作成して以降、頻繁に変更処理を実行するテーブル。

ドメインのうちで、履歴、数量、日付などに関するデータを管理する。

> - https://innoscale.de/en/difference-master-data-and-transaction-data/
> - https://products.sint.co.jp/topsic/blog/database-basic-knowledge

<br>

### 命名規則

#### ▼ masterテーブルとtransactionテーブルがわかるようにすること

masterテーブルとtransactionテーブルがわかるようにする命名する。

例えば、`mstr_foos`、`trx_bars`とする。

#### ▼ テーブル名は複数形にすること

テーブル名は複数形にして命名する。

例えば、`foos`とする。

#### ▼ カラム名には単数系接頭辞をつけること

カラム名には単数系接頭辞をつけて命名する。

例えば、`foo_id`、`foo_name`、`foo_type`とする。

ただし、子テーブルの外部キーと紐付くカラムがある場合、そのカラムの接頭辞は、子テーブル名の単数形とする。

例えば、`bar_id`とする。

例外として、ActiveRecordパターンのフレームワーク (例：Laravelなど) では使用しない方がよいかもしれない。

これらのフレームワークでは、単数形テーブル名の接頭辞がないカラム名を想定して機能が備わっていることがある。

この場合、DBとの連携で毎回カラム名を明示する必要があったり、デフォルトではないカラム名を使用することによる不具合が発生したり、不便なことが多かったりするため、おすすめしない。

| foo_id | bar_id | foo_name | foo_type |
| ------ | ------ | -------- | -------- |
| `1`    | `1`    | `foo`    | `2`      |

<br>

### 正規化

#### ▼ 正規化とは

繰り返し要素のある表を『正規形』、その逆を『非正規形』という。

非正規形の表から、他と連動するカラムを独立させ、正規形の表に変更することを『正規化』という。

正規化によって、テーブルの冗長性を排除できる (マスターテーブルとトランザクションテーブルの分離を含む) 。

#### ▼ 方法

**＊例＊**

まず、主キーが受注Noと商品IDの2つであることを確認。

これらの主キーは、複合主キーではないとする。

`(1)`

: エクセルで表を作成する。 エクセルで作られた以下の表があると仮定する。

![非正規形](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/非正規形.png)

`(2)`

: 第一正規化 (繰り返し要素の排除) を実施する。レコードを1つずつに分割する。

![第一正規形](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/第一正規形.png)

`(3)`

: 第二正規化 (主キーの関数従属性を排除) を実施する。主キーと特定のカラムが連動する (関数従属性がある) 場合、カラムを左表として独立させる。今回、主キーが2つあるため、まず受注Noから関数従属性を排除していく。受注Noと他3カラムが連動しており、左表として独立させる。主キーと連動していたカラムを除いたものを右表とする。また、主キーが重複するローを削除する。

![第二正規形-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/第二正規形-1.png)

`(4)`

: 商品IDの関数従属性を排除していく。商品IDと他2カラムに関数従属性があり、左表として独立させる。主キーと連動していたカラムを除いたものを右表とする。また、主キーが重複するローを削除する。これで、主キーの関数従属性の排除は終了。

![第二正規形-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/第二正規形-2.png)

![第二正規形-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/第二正規形-3.png)

`(5)`

: 第三正規化 (主キー以外のカラムの関数従属性を排除) を実施する。 主キー以外のカラムの関係従属性を排除していく。上記で独立させた`3`個の表のうち、一番左の表で、顧客IDと顧客名に関数従属性があるため、顧客IDを新しい主キーに設定し、左表として独立させる。主キーと連動していたカラムを除いたものを右表とする。

![第三正規形](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/第三正規形-1.png)

![第三正規形-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/第三正規形-2.png)

`(6)`

: 主キーの関係従属性の排除によって、受注表、商品表、数量表に分割できた。また、主キー以外の関係従属性の排除によって、顧客IDを新しい主キーとした顧客表に分割できた。

![正規化後にどんな表ができるのか](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/正規化後にどんな表ができるのか.png)

**＊例＊**

`(1)`

: エクセルで表を作成する。以下のような表の場合、行を分割し、異なる表と見なす。

![非正規形-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/非正規形-2.png)

`(2)`

: 第一正規化 (繰り返し要素の排除) を実施する。

![第一正規形-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/第一正規形-2.png)

<br>

### データの追加/削除

データを追加するあるいは削除する場合、カラムではなく、レコードの増減を行う。

カラムの増減の処理には時間がかかる。

一方で、レコードの増減の処理には時間がかからない。

![カラムの増減は✖_レコードの増減は〇](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/カラムの増減は✖_レコードの増減は〇-1.png)

**＊例＊**

賞与を年1回から、2回・3回と変える場合、主キーを繰り返し、新しく賞与区分と金額区分を作る。

![カラムの増減は✖_レコードの増減は〇-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/カラムの増減は✖_レコードの増減は〇-2.png)

<br>

## 02. 性能設計

### DBインデックスの作成

#### ▼ DBインデックスとは

テーブルから特定のカラムのみを抜き出し、検索しやすいように並び替え、名前を付けて保管しておいたもの。

DBインデックスとして保管されたカラムから特定のレコードを直接的に取得できる。

そのため、SQLの実行時間がカラム数に依存しなくなる。

DBインデックスを使用しない場合、SQLの実行時に全てカラムを取得するため、実行時間がテーブルのカラム数に依存してしまう。

> - https://qiita.com/towtow/items/4089dad004b7c25985e3

#### ▼ クラスターDBインデックス

プライマリーキーあるいはユニークキーのカラムを基準にして、テーブルのカラムを並び替えたDBインデックスのこと。

```sql
CREATE INDEX foo_index
    ON foo_table (id)
```

#### ▼ セカンダリDBインデックス

プライマリーキーあるいはユニークキーではないカラムを基準にして、テーブルのカラムを並び替えたDBインデックスのこと。

```sql
CREATE INDEX foo_index
    ON foo_table (foo_column)
```

#### ▼ 複合DBインデックス

複数のカラムを基準にして、テーブルを並び替えたDBインデックスのこと。

対象としたカラムごとに異なる値のレコード数が計測され、この数が少ない (一意の値の多い) カラムが検出される。

そして、カラムのレコードの昇順で並び替えられ、DBインデックスとして保管される。

> - https://qiita.com/towtow/items/4089dad004b7c25985e3

```sql
CREATE INDEX foo_index
    ON foo_table (foo_column, bar_column, ...)
```

**＊例＊**

以下のような`foo`テーブルがあり、`name`カラムと`address`カラムを基準に並び替えた`foo_index`という複合DBインデックス名を作成する。

```sql
CREATE INDEX foo_index
    ON foo_table (name, address)
```

| id  | name      | address | old |
| --- | --------- | ------- | --- |
| 1   | Suzuki    | Tokyo   | 24  |
| 2   | Yamada    | Osaka   | 18  |
| 3   | Takahashi | Nagoya  | 18  |
| 4   | Honda     | Tokyo   | 16  |
| 5   | Endou     | Tokyo   | 24  |

各カラムで値の異なるレコード数が計測され、`name`カラムは`address`カラムよりも一意のレコードが多いため、`name`カラムの昇順 (アルファベット順) に並び替えられ、DBインデックスとして保管される。

| id  | name      | address | old |
| --- | --------- | ------- | --- |
| 5   | Endou     | Tokyo   | 24  |
| 4   | Honda     | Tokyo   | 18  |
| 1   | Suzuki    | Tokyo   | 24  |
| 3   | Takahashi | Nagoya  | 18  |
| 2   | Yamada    | Osaka   | 18  |

<br>

## 03. アルゴリズム設計

### 突き合わせ処理

#### ▼ 突き合わせ処理とは

ビジネスの基盤となるマスタデータ (例：商品データ、取引先データなど) と、日々更新されるトランザクションデータ (例：販売履歴、入金履歴など) を突き合わせ、新しいデータを作成する処理のこと。

![マッチング処理_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/マッチング処理_1.PNG)

#### ▼ アルゴリズム

![マッチング処理_4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/マッチング処理_4.png)

#### ▼ 具体例

とある生命保険会社では、顧客の保険契約データを契約マスタテーブルで、またそれとは別に、保険契約データの変更点 (異動事由) を異動トランザクションテーブルで、管理している。

毎日、契約マスタテーブルと異動トランザクションテーブルにおける前日レコードを突き合わせ、各契約の異動事由に応じて、変更後契約データとして、新契約マスタテーブルに挿入する。

![マッチング処理_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/マッチング処理_2.PNG)

前処理として、契約マスタデータと異動トランザクションデータに共通する識別子が同じ順番で並んでいる必要がある。

`(1)`

: 契約マスタデータの1行目と、異動トランザクションデータの1行目の識別子を突き合わせる。『`契約マスタデータ = 異動トランザクションデータ`』の時、異動トランザクションデータを基に契約マスタデータを更新し、それを新しいデータとして変更後契約マスタデータに挿入する。

`(2)`

: 契約マスタデータの2行目と、異動トランザクションデータの2行目の識別子を突き合わせる。『`マスタデータ < トランザクションデータ`』の場合、マスタデータをそのまま変更後マスタテーブルに挿入する。

`(3)`

: マスタデータの3行目と、固定したままのトランザクションデータの2行目の識別子を突き合わせる。『`マスタデータ = トランザクションデータ`』の時、トランザクションデータを基にマスタデータを更新し、それを変更後データとして変更後マスタテーブルに挿入する。

`(4)`

: 『`契約マスタデータ < 異動トランザクションデータ`』になるまで、データを突き合わせる。

`(5)`

: 最終的に、変更後マスタテーブルは以下の通りになる。

![マッチング処理_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/マッチング処理_3.png)

<br>
