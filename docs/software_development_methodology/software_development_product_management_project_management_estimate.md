---
title: 【IT技術の知見】見積もり＠プロジェクトマネジメント
description: 見積もり＠プロジェクトマネジメントの知見を記録しています。
---

# 見積もり＠プロジェクトマネジメント

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. 見積もり指標

<table>
  <thead>
    <tr>
      <th>指標名</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>開発規模</td>
      <td>開発の作業サイズの程度を表す。</td>
    </tr>
    <tr>
      <td>要員数</td>
      <td>開発を完了するために必要な『人数』を表す。</td>
    </tr>
    <tr>
      <td>工期</td>
      <td>開発を完了するために必要な『期間』を表す。</td>
    </tr>
    <tr>
      <td>工数</td>
      <td>1 人が 1 ヶ月働いたときの作業サイズを <code>1</code> と定義した場合、開発を完了するために必要な『作業サイズ』を表す。</td>
    </tr>
  </tbody>
</table>

> - https://www.ipa.go.jp/files/000003910.pdf#page12

<br>

## 02. 見積もり手法

### LOC 法 (プログラムステップ法) ：Lines Of Code

#### ▼ LOC 法とは

プログラムステップ法ともいう。

プログラム本数やコードの行数 (論理 LOC、ステップ数) に基づいて、見積もりに関する指標を定量化する。

このとき、『開発規模 (か) 』『工数 (こ) 』『生産性 (せ) 』の単位間の関係は、『みはじ』と同じになる。

> - [規模見積もりの王様「LOC見積もり」 〜見積もりの基本技法 その2〜：山浦恒央の“くみこみ”な話（35） - MONOist](https://monoist.itmedia.co.jp/mn/articles/1109/14/news011.html)
> - [ステップ数（論理LOC / 論理コード行数）とは - IT用語辞典 e-Words](https://e-words.jp/w/%E3%82%B9%E3%83%86%E3%83%83%E3%83%97%E6%95%B0.html)

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

<table>
  <thead>
    <tr>
      <th style="text-align:center">一期開発</th>
      <th>外部設計</th>
      <th>内部設計</th>
      <th>開発</th>
      <th>結合テスト</th>
      <th>システムテスト</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:center">工数</td>
      <td>42 (時間)</td>
      <td>70</td>
      <td>140</td>
      <td>52.5</td>
      <td>42.0</td>
    </tr>
    <tr>
      <td style="text-align:center">配分月数</td>
      <td>3 (ヶ月)</td>
      <td>3</td>
      <td>5</td>
      <td>2</td>
      <td>3</td>
    </tr>
    <tr>
      <td style="text-align:center">A 社動員数</td>
      <td>12 (人)</td>
      <td>20</td>
      <td>0</td>
      <td>12</td>
      <td>12</td>
    </tr>
    <tr>
      <td style="text-align:center">B 社動員数</td>
      <td>2 (人)</td>
      <td>4</td>
      <td>28</td>
      <td>15</td>
      <td>2</td>
    </tr>
  </tbody>
</table>

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

全体的な工程に必要な日数は、所要日数がもっとも多い経路に影響される。

この経路を、クリティカルパスという。

![p509](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p509.jpg)

> - https://www.amazon.co.jp/dp/4297124513

#### ▼ もはや結合点時刻

全体的な工程のなかで、任意の結合点へ取り掛かるために必要な最少日数のこと。

クリティカルパスに影響されるので注意。

![p510-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p510-1.jpg)

> - https://www.amazon.co.jp/dp/4297124513

#### ▼ 最遅結合点時刻

全体的な工程のなかで、任意の結合点へ取り掛かるために必要な最多日数のこと。

![p510-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p510-2.jpg)

> - https://www.amazon.co.jp/dp/4297124513

<br>

### プランニングポーカー

チーム内で各タスクを相対的に見積もる方法のこと。

> - https://www.mof-mof.co.jp/blog/column/agile-estimation-planning-poker

<br>
