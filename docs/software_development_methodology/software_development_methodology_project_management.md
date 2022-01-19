# プロジェクト管理

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. プロジェクト管理

### 管理指標

『開発規模（か）』，『工数（こ）』，『生産性（せ）』の単位間の関係は，『みはじ』と同じである．

#### ・開発規模（か）

  （プログラム本数による開発規模）＝（プログラム本数）

  （プログラム行数による開発規模）＝（ｋステップ行数）

![kステップ行数による開発規模](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kステップ行数による開発規模.png)

#### ・工数（こ）

  （人時による工数）＝（人数・時）＝（人数 × 時間）

  （人時による標準工数）＝（プログラム一本当たりの人数・時）＝（人数・時/本）

| 一期開発  | 外部設計   | 内部設計 | 開発 | 結合テスト | 総合テスト |
| :-------: | ---------- | -------- | ---- | ---------- | ---------- |
|   工数    | 42（時間） | 70       | 140  | 52.5       | 42.0       |
| 配分月数  | 3（ヶ月）  | 3        | 5    | 2          | 3          |
| A社動員数 | 12（人）   | 20       | 0    | 12         | 12         |
| B社動員数 | 2（人）    | 4        | 28   | 15         | 2          |

![project_management](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/project_management.png)

#### ・生産性（せ）

  （プログラム本数の生産性）

  ＝（プログラム本数/人時）

  ＝（プログラム本数による開発規模）÷（工数）

![プログラム本数による生産性](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/プログラム本数による生産性.png)

  （kステップ行数の生産性）

＝（ｋステップ行数/人時）

＝（ｋステップ行数による開発規模）÷（工数）

![kステップ行数による生産性](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kステップ行数による生産性.png)

#### ・進捗率

![進捗率](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/進捗率.png)

<br>

### Arrow ダイアグラム

#### ・プロジェクトに必要な日数

  全体的な工程に必要な日数は，所要日数が最も多い経路に影響される．この経路を，Critical Path という．

![p509](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p509.jpg)

#### ・最早結合点時刻

  全体的な工程の中で，任意の結合点に取り掛かるために必要な最少日数のこと．Critical Path に影響されるので，注意．

![p510-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p510-1.jpg)

#### ・最遅結合点時刻

  全体的な工程の中で，任意の結合点に取り掛かるために必要な最多日数のこと．

![p510-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p510-2.jpg)
