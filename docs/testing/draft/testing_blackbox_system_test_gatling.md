---
title: 【IT技術の知見】Gatling＠総合テスト
description: Gatling＠総合テストの知見を記録しています。
---

# Gatling＠総合テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### yumリポジトリから

```bash
$ apt-get install gatling
```

> - https://www.swtestacademy.com/gatling-installation-configuration/

<br>

## 02. ロードテスト

### 実行

`(1)`

: gatlingのバイナリを実行する。

```bash
$ bin/gatling.sh

GATLING_HOME is set to /Users/hoguchi/gatling-charts-highcharts-bundle-3.3.1

Choose a simulation number:
     [0] computerdatabase.BasicSimulation
     [1] computerdatabase.advanced.AdvancedSimulationStep01
     [2] computerdatabase.advanced.AdvancedSimulationStep02
     [3] computerdatabase.advanced.AdvancedSimulationStep03
     [4] computerdatabase.advanced.AdvancedSimulationStep04
     [5] computerdatabase.advanced.AdvancedSimulationStep05
```

> - https://qiita.com/hogucc/items/e213a93f5b3a3cd3c96f

<br>

### 結果の評価

```bash
...

Generating reports...

================================================================================
---- Global Information --------------------------------------------------------
# リクエスト数
> request count                                         13 (OK=13     KO=0     )

# 最小レスポンスタイム
> min response time                                    248 (OK=248    KO=-     )

# 最大レスポンスタイム
> max response time                                   1204 (OK=1204   KO=-     )

# 平均レスポンスタイム
> mean response time                                   450 (OK=450    KO=-     )

# 標準偏差
> std deviation                                        254 (OK=254    KO=-     )

# レスポンスタイムを小さい順に並べた時に、全体の何%にいくついるか
# レスポンスタイムの分布を示すだけで、実際の時間を表しているわけではない
> response time 50th percentile                        354 (OK=354    KO=-     )
> response time 75th percentile                        454 (OK=454    KO=-     )
> response time 95th percentile                        910 (OK=910    KO=-     )
> response time 99th percentile                       1145 (OK=1145   KO=-     )

# 1秒間当たりに処理したリクエスト数
> mean requests/sec                                  0.464 (OK=0.464  KO=-     )

# レスポンスタイムを小さい順に並べた時に、各ミリ秒の間に何割いるか
# レスポンスタイムの実際の時間を表す
---- Response Time Distribution ------------------------------------------------
# 92%が800ミリ秒未満である
> t < 800 ms                                            12 ( 92%)
> 800 ms < t < 1200 ms                                   0 (  0%)
> t > 1200 ms                                            1 (  8%)
> failed                                                 0 (  0%)
================================================================================

Reports generated in 0s.

...
```

> - https://gatling.io/docs/gatling/reference/current/stats/reports/
> - https://developer.mamezou-tech.com/blogs/2023/04/29/load-test-with-gatling/
> - https://qiita.com/hogucc/items/e213a93f5b3a3cd3c96f
> - https://blog.studysapuri.jp/entry/school-communication-with-gatling

<br>

## 03. 性能テスト

> - https://blog.studysapuri.jp/entry/school-communication-with-gatling

<br>

## 04. ロードテスト

> - https://blog.studysapuri.jp/entry/school-communication-with-gatling

<br>
