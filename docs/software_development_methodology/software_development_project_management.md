---
title: 【IT技術の知見】プロジェクト管理＠開発手法
description: プロジェクト管理＠開発手法の知見を記録しています。
---

# プロジェクト管理＠開発手法

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 見積もりに関する指標

| 指標名   | 説明                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------- |
| 開発規模 | 開発の作業サイズの程度を表す。                                                                      |
| 要員数   | 開発を完了するために必要な『人数』を表す。                                                          |
| 工期     | 開発を完了するために必要な『期間』を表す。                                                          |
| 工数     | 1人が1ヶ月働いた時の作業サイズを`1`と定義した場合、開発を完了するために必要な『作業サイズ』を表す。 |

> - https://www.ipa.go.jp/files/000003910.pdf#page12

<br>

## 02. 見積もり手法

### LOC法 (プログラムステップ法) ：Lines Of Code

#### ▼ LOC法とは

プログラムステップ法ともいう。

プログラム本数やコードの行数 (論理LOC、ステップ数) に基づいて、見積もりに関する指標を定量化する。

この時、『開発規模 (か) 』『工数 (こ) 』『生産性 (せ) 』の単位間の関係は、『みはじ』と同じになる。

> ↪️：
>
> - https://monoist.itmedia.co.jp/mn/articles/1109/14/news011.html
> - https://e-words.jp/w/%E3%82%B9%E3%83%86%E3%83%83%E3%83%97%E6%95%B0.html

#### ▼ 開発規模の定量化

プログラム本数やコードの行数のこと。

```mathematica
(プログラム本数による開発規模)
= (プログラム本数)
```

```mathematica
(プログラム行数による開発規模)
= (ｋステップ行数)
```

![kステップ行数による開発規模](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kステップ行数による開発規模.png)

#### ▼ 工数の定量化

```mathematica
(人時による工数)
= (人数・時) = (人数 × 時間)
```

```mathematica
(人時による標準工数)
= (プログラム一本当たりの人数・時) = (人数・時/本)
```

| 一期開発  | 外部設計  | 内部設計 | 開発 | 結合テスト | 総合テスト |
| :-------: | --------- | -------- | ---- | ---------- | ---------- |
|   工数    | 42 (時間) | 70       | 140  | 52.5       | 42.0       |
| 配分月数  | 3 (ヶ月)  | 3        | 5    | 2          | 3          |
| A社動員数 | 12 (人)   | 20       | 0    | 12         | 12         |
| B社動員数 | 2 (人)    | 4        | 28   | 15         | 2          |

![project_management](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/project_management.png)

#### ▼ 生産性の定量化

```mathematica
(プログラム本数の生産性)
= (プログラム本数/人時)
= (プログラム本数による開発規模) ÷ (工数)
```

![プログラム本数による生産性](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/プログラム本数による生産性.png)

```mathematica
(kステップ行数の生産性)
= (ｋステップ行数/人時)
= (ｋステップ行数による開発規模) ÷ (工数)
```

![kステップ行数による生産性](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kステップ行数による生産性.png)

#### ▼ 進捗率の定量化

![進捗率](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/進捗率.png)

<br>

### アローダイアグラム

#### ▼ プロジェクトに必要な日数

全体的な工程に必要な日数は、所要日数が最も多い経路に影響される。

この経路を、クリティカルパスという。

![p509](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p509.jpg)

> - https://www.amazon.co.jp/dp/4297124513

#### ▼ 最早結合点時刻

全体的な工程の中で、任意の結合点に取り掛かるために必要な最少日数のこと。

クリティカルパスに影響されるので注意。

![p510-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p510-1.jpg)

> - https://www.amazon.co.jp/dp/4297124513

#### ▼ 最遅結合点時刻

全体的な工程の中で、任意の結合点に取り掛かるために必要な最多日数のこと。

![p510-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p510-2.jpg)

> - https://www.amazon.co.jp/dp/4297124513

<br>

### プランニングポーカー

チーム内で各タスクを相対的に見積もる方法のこと。

> - https://www.mof-mof.co.jp/blog/column/agile-estimation-planning-poker

<br>

## 03. 作業の細分化

### 作業表

以下のような表を作成すると良い。

| タスク   | 優先度   | 見積もり |
| -------- | -------- | -------- |
| 〇〇する | 高/中/低 | `n`      |

<br>

### タスク

#### ▼ タスク

作業全体を細分化し、工数を定量化しやくする。

issueやEpic issueを1つのタスクとみなす。

#### ▼ タスクの分割

見積コストが大きい場合 (目安は`13`以上) はEpicとしてタスクを分割すると良い。

実装以外のタスク (調査、設計、ドキュメンテーションなど) もタスクとする。

単体テストは、タスクの見積りに含めるようにする。

<br>

### 優先度

#### ▼ 優先度とは

機能として欲しい期待度のこと。

#### ▼ 優先度の決め方

高、中、低の3段階でを決める。

ビジネス側と議論しながら決めると良い。

- 高：必ず実装する必要がある。
- 中：できる限り実装したい。ただし、後回しにできる。
- 低：なくてもよい。一番最後に後回しできる。

<br>
