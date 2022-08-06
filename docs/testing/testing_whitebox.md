---
title: 【IT技術の知見】ホワイトボックステスト
description: ホワイトボックステストの知見を記録しています。
---

# ホワイトボックステスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ホワイトボックステスト

### ホワイトボックステストとは

ブラックボックステストと組み合わせて単体テストを構成する。実装内容が適切かを確認しながら、入力に対して、適切な出力が行われているかを検証する。

参考：https://hldc.co.jp/blog/2018/05/25/1387/

![testing_whitebox-test](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/testing_whitebox-test.png)

<br>

### ホワイトボックステストの種類

ℹ️ 参考：https://xtech.nikkei.com/it/article/Watcher/20060809/245528/

- 整形
- 静的解析
- 単体テスト/機能テスト

<br>

## 02. 単体テスト

### 単体テストとは

クラスや構造体のメソッドが、それ単体で仕様通りに処理が動作するかを検証する方法。検証対象以外の処理はスタブとして定義する。理想としては、アーキテクチャの層ごとに単体テストを実施する必要がある。この時、データアクセスに関わる層の単体テストのために、本来のDBとは別に、あらかじめテスト用DBを用意した方が良い。テスト用DBを```docker-compose.yml```ファイルによって用意する方法については、以下のリンクを参考にせよ。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/virtualization/virtualization_container_orchestration.html

<br>

### 設計ポリシー

#### ▼ 単体テストの構成

単体テストはテストスイート（テストの組）から構成され、、テストスイートはテストケース（テスト関数）に分類できる。例えば、Goでは構造体をテストスイートとし、単体テストを定義する。

![test-plan_test-suite_test-case](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/test-plan_test-suite_test-case.jpg)

#### ▼ テストケース名

Roy Osherove氏の命名規則に従って、『テスト対象のメソッド名』『入力値』『期待される返却値』の三要素でテスト関数を命名する。期待される返却値の命名で『正常系テスト』か『異常系テスト』かと識別する。例えば、正常系であれば『```testFoo_Xxx_ReturnXxx```』、また異常系であれば『```testFoo_Xxx_ExceptionThrown```』や『```testFoo_Xxx_ErrorThrown```』とする。Roy Osherove氏の命名規則については、以下のリンクを参考にせよ。

ℹ️ 参考：https://osherove.com/blog/2005/4/3/naming-standards-for-unit-tests.html

#### ▼ アサーションの比較値

単体テストのアサーションメソッドで、期待値と実際値を比較する場合、期待値を定数として管理した方が良い。

ℹ️ 参考：https://osherove.com/blog/2005/4/3/naming-standards-for-unit-tests.html

<br>

## 02-2. テストダブル

### テストダブル

単体テストでは、各コンポーネントの依存対象のコンポーネントをテストダブル（代替品）に置き換える。

ℹ️ 参考：https://en.wikipedia.org/wiki/Test_double

<br>

### テストダブルの種類

#### ▼ モック

上層クラス（上層構造体）が下層クラスを正しくコールできるか否かを検証したい時に、上層クラス以外の部分的処理は不要であり、下層クラスの実体があるかのように見せかける。この時、見せかけの下層クラスとして使用する擬似オブジェクトを『モック』という。スタブとは、使用されるテストが異なるが、どちらも擬似オブジェクトである。モックでは、クラスのメソッドとデータが全てダミー実装に置き換わる。もし下層クラスを正しい回数実行できているかを検証したい場合は、下層クラスのモックを定義し、実体のある上層クラスが下層クラスにパラメーターを渡した時のコール回数と指定回数を比較する。なお、用語の定義はテストフレームワークごとにやや異なることに注意する。PHPUnitにおけるモックについては、以下のリンクを参考にせよ。

ℹ️ 参考：https://phpunit.readthedocs.io/ja/latest/test-doubles.html#test-doubles-mock-objects

| ツール名 | モックのメソッドの返却値                                     | 補足                                                         |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| PHPUnit  | メソッドは、```null```を返却する。                           | 注意点として、```final```、```private```なメソッドはモック化されず、実体をそのまま引き継ぐ。また、```static```なメソッドは```BadMethodCallException```をスローするモックに置き換わる。 |
| JUnit    | メソッドは、元のオブジェクトのメソッドの返却値の型を基に、初期値を返却する<br>（例：boolean型なら```false```） |                                                              |

#### ▼ スタブ

クラスのメソッドの処理を検証したい時に、依存している下層クラスは、実体があるかのように見せかける。この時、見せかけの下層クラスとして使用する擬似オブジェクトを『スタブ』という。モックとは、使用されるテストが異なるが、どちらも擬似オブジェクトである。モックと同様にスタブでも、クラスのメソッドとデータが全てダミー実装に置き換わる。スタブには、正しい処理を実行するように引数と返却値を持つメソッドを定義し、その他の実体のある処理が正しく実行されるかを検証する。これらにより、検証対象の処理のみが実体であっても、一連の処理を実行できる。なお、用語の定義はテストフレームワークごとにやや異なることに注意する。PHPUnitにおけるスタブについては、以下のリンクを参考にせよ。

ℹ️ 参考：https://phpunit.readthedocs.io/ja/latest/test-doubles.html#test-doubles-stubs

<br>

### モックツール、スタブツール

PHPUnit、Phake、Mockery、JUnit

<br>

## 02-02. 網羅率

### 網羅率とは

網羅条件に基づいた単体テストの品質指標である。採用した網羅で考えられる全ての条件のうち、テストで検証できている割合で表す。 網羅率はテストスイートやパッケージを単位として解析され、これは言語別に異なる。Goで命令網羅の網羅率を検出する単体テストについては、以下のリンクを参考にせよ。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_go_command.html

PHPUnitで網羅率を解析する方法については、以下のリンクを参考にせよ。

ℹ️ 参考：https://phpunit.readthedocs.io/ja/latest/code-coverage-analysis.html

<br>

### 網羅条件の種類

#### ▼ C０：Statement Coverage（命令網羅）

![p494-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p494-1.png)

全ての命令が実行されるかを検証する。

ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

**＊例＊**

AとBは、『1』または『0』になり得るとする。

| 条件         | 処理実行の有無                    |
| ------------ | --------------------------------- |
| A = 1、B = 1 | ```return X``` が実行されること。 |

#### ▼ C１：Decision Coverage（判定条件網羅/分岐網羅）

![p494-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p494-2.png)

全ての判定が実行されるかを検証する。

ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

**＊例＊**

AとBは、『1』または『0』になり得るとする。

| 条件         | 処理実行の有無                      |
| ------------ | ----------------------------------- |
| A = 1、B = 1 | ```return X``` が実行されること。   |
| A = 1、B = 0 | ```return X``` が実行されないこと。 |

#### ▼ C２：Condition Coverage（条件網羅）

![p494-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p494-3.png)

各条件が、取り得る全ての値で実行されるかを検証する。

ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

**＊例＊**

AとBは、『1』または『0』になり得るとする。

| 条件         | 処理実行の有無                      |
| ------------ | ----------------------------------- |
| A = 1、B = 0 | ```return X``` が実行されないこと。 |
| A = 0、B = 1 | ```return X``` が実行されないこと。 |

または、次の組み合わせでも良い。

| 条件         | 処理実行の有無                      |
| ------------ | ----------------------------------- |
| A = 1、B = 1 | ```return X``` が実行されること。   |
| A = 0、B = 0 | ```return X``` が実行されないこと。 |

#### ▼ MCC：Multiple Condition Coverage（複数条件網羅）

![p494-4](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p494-4.png)

各条件が、取り得る全ての値で、かつ全ての組み合わせが実行されるかを検証する。一般的に、複数条件網羅を採用すれば、最低限のソフトウェア品質を担保できていると言える。

ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

**＊例＊**

AとBは、『1』または『0』になり得るとする。

| 条件         | 処理実行の有無                      |
| ------------ | ----------------------------------- |
| A = 1、B = 1 | ```return X``` が実行されること。   |
| A = 1、B = 0 | ```return X``` が実行されないこと。 |
| A = 0、B = 1 | ```return X``` が実行されないこと。 |
| A = 0、B = 0 | ```return X``` が実行されないこと。 |

<br>

## 02-03. 循環的複雑度

### 循環的複雑度とは

コードの複雑さの程度のこと。単体テストの品質の指標になる。おおよそ判定条件網羅の経路数の程度である。

<br>

### 循環複雑度の種類

ℹ️ 参考：

- https://jp.mathworks.com/discovery/cyclomatic-complexity.html
- https://szk-takanori.hatenablog.com/entry/20111219/p1

| 循環的複雑度 | 複雑さの状態                 | バグ混入率 |
| ------------ | ---------------------------- | ---------- |
| ```10```以下 | 非常に良い                   | ```25```%  |
| ```30```以上 | 構造的なリスクあり           | ```40```%  |
| ```50```以上 | テストできない               | ```70```%  |
| ```75```以上 | 変更によって誤修正が生じる。 | ```98```%  |

<br>

## 03. 機能テスト

### 機能テストとは

エンドポイントにリクエストを送信し、レスポンスが正しく返信されるか否かを検証する方法。スタブを使用することは少ない。ブラックボックステストの機能テストとは異なることに注意する。

ℹ️ 参考：https://eh-career.com/engineerhub/entry/action/2019/10/03/103000/#%E5%A2%83%E7%95%8C%E5%80%A4%E3%83%86%E3%82%B9%E3%83%88

<br>

## 04. その他のテスト手法

### Componentテスト

マイクロサービス単体をテストする。

ℹ️ 参考：https://www.chalkboard.me/2020/08/%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8B%E3%83%86%E3%82%B9%E3%83%88%E6%96%B9%E6%B3%95%E3%81%AE%E8%AA%BF%E6%9F%BB/

<br>

### CDCテスト：Consumer Drive Contract

マイクロサービスのコントローラーがコールされてから、DBの操作が完了するまでを、テストする。下流マイクロサービスのコールはモック化またはスタブ化する。

ℹ️ 参考：

- https://qiita.com/AHA_oretama/items/e2c7db87cc5264c701ae
- https://www.chalkboard.me/2020/08/%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8B%E3%83%86%E3%82%B9%E3%83%88%E6%96%B9%E6%B3%95%E3%81%AE%E8%AA%BF%E6%9F%BB/

<br>

### End-to-Endテスト

ℹ️ 参考：https://www.chalkboard.me/2020/08/%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8B%E3%83%86%E3%82%B9%E3%83%88%E6%96%B9%E6%B3%95%E3%81%AE%E8%AA%BF%E6%9F%BB/
