---
title: 【IT技術の知見】ホワイトボックステスト
description: ホワイトボックステストの知見を記録しています。
---

# ホワイトボックステスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ホワイトボックステスト

### ホワイトボックステストとは

実装内容が適切かを確認しながら、入力に対して、適切な出力が行われているかを検証する。

![testing_whitebox-test](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/testing_whitebox-test.png)

> - https://hldc.co.jp/blog/2018/05/25/1387/

<br>

### ホワイトボックステストの種類

ブラックボックステストと同じ名前のテストがあるが、実装内容を気にするか否かという点で、テスト内容は異なる。

- 整形
- 静的解析 (例：文法の誤りテスト 、ベストプラクティス違反テスト 、脆弱性診断など)
- ドライラン
- ユニットテスト
- 機能テスト
- 回帰テスト
- 結合テスト

> - https://xtech.nikkei.com/it/article/Watcher/20060809/245528/

<br>

## 02. 静的解析

### 静的解析とは

#### ▼ 文法の誤りテスト

ソースコードの実行前に、字句解析、構文解析、型解析を行い、ソースコードの文法上の問題を検証する。

ソースコードの機械語翻訳の仕組みの違いのために、コンパイラ方式言語の場合はアプリケーションの実行前に文法の誤りを検出できるが、インタプリタ方式言語は実行時でしか検出できない。

そのため、特にインタプリタ方式言語では実施した方が良い。

> - https://golangtokyo.github.io/codelab/find-gophers/?index=codelab#5
> - https://devblog.thebase.in/entry/2018/12/24/110000

#### ▼ 型検証

変数、引数、返却値で指定された型に対して、渡される値の型が一致しているかを検証する。

静的型付け言語では、アプリケーションの実行前（コンパイル）でこれを実施してくれる。

| 言語         | 型付け | 実行前の型検証 | 実行時の型検証 |
| ------------ | :----: | :------------: | :------------: |
| C            |   静   |       ✅       |       ❌       |
| C++          |   静   |       ✅       |       ❌       |
| Go           |   静   |       ✅       |       ❌       |
| Rust         |   静   |       ✅       |       ❌       |
| Java         |   静   |       ✅       |       ❌       |
| C# (.NET)    |   静   |       ✅       |       ❌       |
| Swift        |   静   |       ✅       |       ❌       |
| Kotlin (JVM) |   静   |       ✅       |       ❌       |
| Scala        |   静   |       ✅       |       ❌       |
| Haskell      |   静   |       ✅       |       ❌       |
| TypeScript   |   静   |       ✅       |       ❌       |
| Python       |   動   |       ❌       |       ✅       |
| Ruby         |   動   |       ❌       |       ✅       |
| JavaScript   |   動   |       ❌       |       ✅       |

#### ▼ ベストプラクティス違反テスト

ソースコードのベストプラクティス違反を検証する。

言語によって、ビルトインのコマンド (例：`go vet`コマンド) で実現できる場合や、外部ツールが必要な場合がある。

#### ▼ 脆弱性診断

ソースコードの実装方法に起因する脆弱性を検証する。

#### ▼ その他

テストされるソースコード (例：Dockerfile、Kubernetesのマニフェスト、Terraform) によって、静的解析には他にも種類がある。

<br>

## 03. ユニットテスト (単体テスト)

### ユニットテストとは

『単体テスト』ともいう。

クラスや構造体の関数が、それ単体で正しく動作するかを検証する。

言語によって、ビルトインのコマンド (例：`go test`コマンド) で実現できる場合や、外部テストツールが必要な場合がある。

検証対象以外の処理はスタブとして定義する。理想としては、アーキテクチャの層ごとにユニットテストを実施する必要がある。

この時、データアクセスに関わる層のユニットテストのために、本来のDBとは別に、あらかじめテスト用DBを用意した方が良い。

テスト用DBを`docker-compose.yml`ファイルによって用意する方法については、以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_docker_compose_yml.html

<br>

### 設計規約

#### ▼ ユニットテストの構成

ユニットテストはテストスイート (テストの組) から構成され、テストスイートはテストケース (テスト関数) に分類できる。

例えば、Goでは構造体をテストスイートとし、ユニットテストを定義する。

![test-plan_test-suite_test-case](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/test-plan_test-suite_test-case.jpg)

#### ▼ テストケース名

Roy Osherove氏の命名規則に従って、『テスト対象の関数名』『入力値』『期待される返却値』の三要素でテスト関数を命名する。

期待される返却値の命名で『正常系テスト』か『異常系テスト』かと識別する。

例えば、正常系であれば『`testFoo_Xxx_ReturnXxx`』、また異常系であれば『`testFoo_Xxx_ExceptionThrown`』や『`testFoo_Xxx_ErrorThrown`』とする。

Roy Osherove氏の命名規則については、以下のリンクを参考にせよ。

> - https://osherove.com/blog/2005/4/3/naming-standards-for-unit-tests.html

#### ▼ アサーションの比較値

ユニットテストのアサーション関数で、期待値と実際値を比較する場合、期待値を定数として管理した方が良い。

> - https://osherove.com/blog/2005/4/3/naming-standards-for-unit-tests.html

<br>

## 03-02. テストダブル

### テストダブル

ユニットテストでは、各コンポーネントの依存対象のコンポーネントをテストダブル (代替品) に置き換える。

> - https://en.wikipedia.org/wiki/Test_double

<br>

### テストダブルの種類

#### ▼ モック

上層クラス (上層構造体) が下層クラスを正しくコールできるか否かを検証したい時に、上層クラス以外の部分的処理は不要であり、下層クラスの実体があるかのように見せかける。

この時、見せかけの下層クラスとして使用する擬似オブジェクトを『モック』という。

スタブと用途が異なるが、モックもスタブも擬似オブジェクトである。

モックでは、クラスの振る舞いと状態が全てダミー実装に置き換わる。

もし下層クラスを正しい回数実行できているかを検証したい場合は、下層クラスのモックを定義し、実体のある上層クラスが下層クラスにパラメーターを渡した時のコール回数と指定回数を比較する。

注意点として、用語の定義はテストフレームワークごとにやや異なることに注意する。

PHPUnitにおけるモックについては、以下のリンクを参考にせよ。

| ツールの種類 | モックの関数の返却値                                                                             | 補足                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PHPUnit      | 関数は、`null`を返却する。                                                                       | 注意点として、`final`、`private`な関数はモック化されず、実体をそのまま引き継ぐ。また、`static`な関数は`BadMethodCallException`をスローするモックに置き換わる。 |
| JUnit        | 関数は、元のオブジェクトの関数の返却値の型を基に、初期値を返却する<br>(例：boolean型なら`false`) |                                                                                                                                                                |

> - https://phpunit.readthedocs.io/ja/latest/test-doubles.html#test-doubles-mock-objects

#### ▼ スタブ

クラスの関数の処理を検証したい時に、クラスが依存している下層クラスは、実体があるかのように見せかける。

この時、見せかけの下層クラスとして使用する擬似オブジェクトを『スタブ』という。

モックと用途が異なるが、モックもスタブも擬似オブジェクトである。

モックと同様にスタブでも、クラスの振る舞いと状態が全てダミー実装に置き換わる。

スタブには、正しい処理を実行するように引数と返却値を持つ関数を定義し、その他の実体のある処理が正しく実行されるかを検証する。

これらにより、検証対象の処理のみが実体であっても、一連の処理を実行できる。

注意点として、用語の定義はテストフレームワークごとにやや異なることに注意する。

PHPUnitにおけるスタブについては、以下のリンクを参考にせよ。

> - https://phpunit.readthedocs.io/ja/latest/test-doubles.html#test-doubles-stubs

<br>

### モックパッケージ、スタブパッケージ

- PHPUnit
- Phake
- Mockery
- JUnit

<br>

### モックサーバー

#### ▼ httpbin

```yaml
services:
  httpbin:
    container_name: httpbin
    hostname: httpbin.local
    image: kennethreitz/httpbin:latest
    ports:
      - "80:80"
```

```bash
# ローカルのhttpbinコンテナにリクエストを送信する
$ curl http://httpbin.local/get
```

<br>

## 03-03. 網羅率

### 網羅率とは

網羅条件に基づいたユニットテストの品質指標である。

採用した網羅で考えられる全ての条件のうち、テストで検証できている割合で表す。

網羅率はテストスイートやパッケージを単位として解析され、これは言語別に異なる。

言語やツールごとに網羅率を解析する方法が異なり、PHPのPHPUnitでは以下のリンクを参考にせよ。

> - https://phpunit.readthedocs.io/ja/latest/code-coverage-analysis.html

<br>

### 網羅条件の種類

#### ▼ C０：Statement Coverage (命令網羅)

![p494-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p494-1.png)

全ての命令が実行されるかを検証する。

**＊例＊**

AとBは、『1』または『0』になり得るとする。

| 条件         | 処理実行の有無               |
| ------------ | ---------------------------- |
| A = 1、B = 1 | `return X`が実行されること。 |

> - https://www.amazon.co.jp/dp/4297124513

#### ▼ C１：Decision Coverage (判定条件網羅/分岐網羅)

![p494-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p494-2.png)

全ての判定が実行されるかを検証する。

**＊例＊**

AとBは、『1』または『0』になり得るとする。

| 条件         | 処理実行の有無                 |
| ------------ | ------------------------------ |
| A = 1、B = 1 | `return X`が実行されること。   |
| A = 1、B = 0 | `return X`が実行されないこと。 |

> - https://www.amazon.co.jp/dp/4297124513

#### ▼ C２：Condition Coverage (条件網羅)

![p494-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p494-3.png)

各条件が、取り得る全ての値で実行されるかを検証する。

**＊例＊**

AとBは、『1』または『0』になり得るとする。

| 条件         | 処理実行の有無                 |
| ------------ | ------------------------------ |
| A = 1、B = 0 | `return X`が実行されないこと。 |
| A = 0、B = 1 | `return X`が実行されないこと。 |

または、次の組み合わせでも良い。

| 条件         | 処理実行の有無                 |
| ------------ | ------------------------------ |
| A = 1、B = 1 | `return X`が実行されること。   |
| A = 0、B = 0 | `return X`が実行されないこと。 |

> - https://www.amazon.co.jp/dp/4297124513

#### ▼ MCC：Multiple Condition Coverage (複数条件網羅)

![p494-4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p494-4.png)

各条件が、取り得る全ての値で、かつ全ての組み合わせが実行されるかを検証する。

一般的に、複数条件網羅を採用すれば、最低限のソフトウェア品質を担保できていると言える。

**＊例＊**

AとBは、『1』または『0』になり得るとする。

| 条件         | 処理実行の有無                 |
| ------------ | ------------------------------ |
| A = 1、B = 1 | `return X`が実行されること。   |
| A = 1、B = 0 | `return X`が実行されないこと。 |
| A = 0、B = 1 | `return X`が実行されないこと。 |
| A = 0、B = 0 | `return X`が実行されないこと。 |

> - https://www.amazon.co.jp/dp/4297124513

<br>

## 03-04. 循環的複雑度

### 循環的複雑度とは

コードの複雑さの程度のこと。

ユニットテストの品質の指標になる。

おおよそ判定条件網羅の経路数の程度である。

<br>

### 循環複雑度の種類

| 循環的複雑度 | 複雑さの状態                 | バグ混入率 |
| ------------ | ---------------------------- | ---------- |
| `10`以下     | 非常に良い                   | `25`%      |
| `30`以上     | 構造的なリスクあり           | `40`%      |
| `50`以上     | テストできない               | `70`%      |
| `75`以上     | 変更によって誤修正が生じる。 | `98`%      |

> - https://jp.mathworks.com/discovery/cyclomatic-complexity.html
> - https://szk-takanori.hatenablog.com/entry/20111219/p1

<br>

## 04. 機能テスト (フィーチャーテスト)

### 機能テストとは

アプリケーションの各エンドポイントを`1`個の機能ととらえる。

アプリ (またはアプリケーションのAPIゲートウェイ) のエンドポイントにリクエストを送信し、外部APIとの連携も含めて、レスポンスが機能要件通りに返信されるか否かを検証する。

スタブを使用することは少ない。

ブラックボックステストの機能テストとは意味合いが異なることに注意する。

> - https://eh-career.com/engineerhub/entry/action/2019/10/03/103000/#%E5%A2%83%E7%95%8C%E5%80%A4%E3%83%86%E3%82%B9%E3%83%88

<br>

## 05. 回帰テスト

### 回帰テストとは

テストの期待値ファイルを作成しておき、何らかの機能追加/変更によって、機能追加/変更を含むコンポーネントが既存のコンポーネントに影響を与えていないか (既存の機能でデグレーションが起こっていないか) を検証する。

特にGoでは、このテストデータをファイルを『ゴールデンファイル』という。

ゴールデン (金) は化学的に安定した物質であることに由来しており、『安定したプロダクト』とかけている。

> - https://softwareengineering.stackexchange.com/a/358792

<br>

## 06. E2Eテスト

### E2Eテストとは

実際のユーザーを模した一連の操作 (フロントエンドへのリクエスト) を実施し、特定の機能に関する全てのコンポーネント間 (フロントエンド、バックエンド、外部APIなど) の連携をテストを実施する。

注意点として、特定のコンポーネント間の連携をテストする『結合テスト』の一種ではない。

> - https://www.testim.io/blog/end-to-end-testing-vs-integration-testing/
> - https://commerce-engineer.rakuten.careers/entry/tech/0031
> - https://www.chalkboard.me/2020/08/%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8B%E3%83%86%E3%82%B9%E3%83%88%E6%96%B9%E6%B3%95%E3%81%AE%E8%AA%BF%E6%9F%BB/
> - https://speakerdeck.com/hgsgtk/real-world-e2e-testing?slide=4

<br>

### E2Eテストツール例

#### ▼ 手動

手動でフロントエンドを操作し、E2Eテストを実施する。

#### ▼ 自前

言語によっては、ビルトインのコマンド (例：`go test`コマンド) でE2Eテストを実装できる。

実際のユーザーを模した一連の操作 (フロントエンドへのリクエスト) を実施する。

> - https://github.com/argoproj/argo-cd/blob/v2.6.0/docs/developer-guide/test-e2e.md
> - https://github.com/argoproj/argo-cd/blob/v2.6.0/hack/test.sh
> - https://github.com/argoproj/argo-cd/blob/v2.6.0/Makefile#L400-L402

#### ▼ フロントエンド系ツール

実際のユーザーを模した一連の操作 (フロントエンドへのリクエスト) を実施する。

- Autify
- Cypress
- Mabl
- Playwright
- Puppeteer
- Selenium
- TestCafe

> - https://qiita.com/os1ma/items/5429cd8e12ac43a6a803#%E5%88%86%E9%A1%9E%E3%81%97%E3%81%A6%E3%81%BF%E3%81%9F
> - https://commerce-engineer.rakuten.careers/entry/tech/0031

#### ▼ バックエンド系ツール

実際のユーザーを模した一連の操作 (APIへのリクエスト) を実施する。

ツールは以下の通り。

- `curl`コマンド
- Postman
- Karate

> - https://qiita.com/os1ma/items/5429cd8e12ac43a6a803#%E5%88%86%E9%A1%9E%E3%81%97%E3%81%A6%E3%81%BF%E3%81%9F

<br>
