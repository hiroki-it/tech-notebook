---
title: 【IT技術の知見】システムテスト＠ブラックボックステスト
description: システムテスト＠ブラックボックステストの知見を記録しています。
---

# システムテスト＠ブラックボックステスト

## 01. システムテスト (総合テスト)

### システムテストとは

『総合テスト』ともいう。

既存機能/追加/変更を含むすべてのコンポーネントを組み合わせ、すべてのコンポーネント間の連携が正しく動作しているかを検証する。

![testing_blackbox-test_unit_integration_system](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/testing_blackbox-test_unit_integration_system.png)

> - [単体テスト・結合テスト・総合テストの違い、観点や注意点を簡単に説明する \| 若手エンジニアの羅針盤](https://pm-rasinban.com/ut-it-st)

<br>

### システムテストの種類

#### ▼ 機能テスト

システムが機能的な品質を満たしているかを検証する。

<table>
  <thead>
    <tr>
      <th>テストの種類</th>
      <th>検証内容</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>正常系 (成功で終わる操作)</td>
      <td>操作の種類 (登録、参照、更新、削除) 、画面遷移、ステートマシン、セキュリティなど</td>
    </tr>
    <tr>
      <td>異常系 (エラーで終わる操作)</td>
      <td>操作の種類 (登録、参照、更新、削除) など</td>
    </tr>
    <tr>
      <td>組み合わせ</td>
      <td>同時操作、割り込み操作、排他制御に関わる操作など</td>
    </tr>
    <tr>
      <td>業務シナリオ</td>
      <td>シナリオに沿ったユーザーによる一連の操作</td>
    </tr>
    <tr>
      <td>開発者シナリオ</td>
      <td>シナリオに沿った開発者による一連の操作 (例：手動コマンドなど)</td>
    </tr>
    <tr>
      <td>外部ソフトウェア連携</td>
      <td>外部の API との連携処理に関わる操作</td>
    </tr>
  </tbody>
</table>

#### ▼ 非機能テスト

システムが非機能的な品質を満たしているかを検証する。

<table>
  <thead>
    <tr>
      <th>テストの種類</th>
      <th>各非機能的な品質との対応関係</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ストレステスト</td>
      <td>耐久性</td>
    </tr>
    <tr>
      <td>ロードテスト</td>
      <td>耐久性</td>
    </tr>
    <tr>
      <td>可用性テスト</td>
      <td>可用性</td>
    </tr>
    <tr>
      <td>耐障害性テスト</td>
      <td>耐障害性</td>
    </tr>
    <tr>
      <td>Testing in production</td>
      <td>耐久性</td>
    </tr>
    <tr>
      <td>ペネトレーションテスト</td>
      <td>安全性</td>
    </tr>
  </tbody>
</table>

> - https://www.qbook.jp/column/20180806_667.html
> - [非機能要件の定義 \| 令和時代のシステム開発では、どのような設計書を書くべきか \| Think IT（シンクイット）](https://thinkit.co.jp/article/17647)

<br>

### テスト結果の可視化

#### ▼ テストレポート

ツールによっては、テスト結果からテストレポートを作成してくれる。

#### ▼ バグ管理図

プロジェクトのとき、残存テスト数と不良摘出数 (バグ発見数) を縦軸にとり、時間を横軸にとることにより、バグ管理図を作成する。

それぞれの曲線の状態から、プロジェクトの進捗状況を読み取られる。

![品質管理図](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/品質管理図.jpg)

不良摘出実績線 (信頼度成長曲線) は、プログラムの品質の状態を表し、S 字型でないものはプログラムの品質がよくないことを表す。

![信頼度成長曲線の悪い例](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/信頼度成長曲線の悪い例.jpg)

<br>

## 02. 機能テスト

### 機能テストとは

機能的な品質を満たせているかを検証する。

ホワイトボックスでの機能テストとは意味合いが異なるので注意する。

> - https://eh-career.com/engineerhub/entry/action/2019/10/03/103000/#%E5%A2%83%E7%95%8C%E5%80%A4%E3%83%86%E3%82%B9%E3%83%88

### テストケース

ユーザー操作の前提や検証内容をまとめたドキュメントのこと。

<table>
  <thead>
    <tr>
      <th>前提条件</th>
      <th>操作の種類</th>
      <th>検証方法</th>
      <th>期待値</th>
      <th>OK/NG</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>...</td>
      <td>参照</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <td>...</td>
      <td>作成</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <td>...</td>
      <td>更新</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <td>...</td>
      <td>削除</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
  </tbody>
</table>

> - https://blog.aiqveone.co.jp/testcase/

<br>

## 03. 性能テスト

### 性能テストとは

![performance-test](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/performance-test.png)

一定時間内に、ユーザーが一連のリクエスト (例：ログイン、参照、登録、ログアウト) を行ったとき、あらかじめ定めた指標にどのような変化があるかを検証する。

具体的にはテスト時、アクセス数を段階的に増加させて、テストレポートとしてグラフ化する。

テストレポートを元に、想定されるリクエスト数が現在の性能にどの程度の負荷をかけるのかを確認し、加えて最大負荷の場合でも性能目標を満たしているかを確認する。

これらを運用時の監視の参考値にする。

> - [性能テストについて纏めてみた – uniface.hub](https://hub.uni-face.co.jp/performance-test/)
> - [第8回 性能テスト \| gihyo.jp](https://gihyo.jp/dev/serial/01/tech_station/0008)

<br>

### 性能テストの種類

- ストレステスト
- ロードテスト
- 耐久テスト
- スパイクテスト
- 拡張性テスト

> - [性能テストのススメ #1 性能テストの目的と種類 \| Sqripts](https://sqripts.com/2022/08/30/20385/)
> - [性能テストについて纏めてみた – uniface.hub](https://hub.uni-face.co.jp/performance-test/)

<br>

### 性能指標

- 平均スループット
- 平均レスポンスタイム
- 平均ハードウェア使用率
- 時間当たり平均トランザクション数 (TPS：Transaction Per Second)

> - [性能テストについて纏めてみた – uniface.hub](https://hub.uni-face.co.jp/performance-test/)
> - [第8回 性能テスト \| gihyo.jp](https://gihyo.jp/dev/serial/01/tech_station/0008)

<br>

### 機能別の性能目標値

KPI (組織内の合意) に基づいて、各機能ごとに性能指標の目標値を決める。

SLA (顧客との合意) に基づいた SLO とは区別したい。

例えば、`1` 秒間に `50` 人のユーザーからリクエスト (`50` 個/秒のリクエスト) があり、このときのとある機能でレスポンスタイム目標値は `3` 秒以内であるとする。

この場合、平均スループットの目標値は `50` (個/秒) 、平均レスポンスタイムの目標値は `3` 秒以内、となる。

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>平均スループット目標値 (件/秒以上)</th>
      <th>平均レスポンス目標値 (秒以内)</th>
      <th>ハードウェア使用率目標値 (最大率)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>機能 A</td>
      <td><code>50</code></td>
      <td><code>3</code></td>
      <td><code>60</code>%</td>
    </tr>
    <tr>
      <td>機能 B</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <td>機能 C</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
  </tbody>
</table>

> - [第8回 性能テスト \| gihyo.jp](https://gihyo.jp/dev/serial/01/tech_station/0008)
> - [オンライン性能テスト概論 第1版 #チューニング - Qiita](https://qiita.com/s9910553/items/ca3dae561489844da646)
> - [1ヶ月で負荷テストの基礎から学んで実際にやってみた知見 \| BLOG - DeNA Engineering](https://engineering.dena.com/blog/2021/10/healthcare-load-testing/#%E8%B2%A0%E8%8D%B7%E3%83%86%E3%82%B9%E3%83%88%E3%81%AE%E7%9B%AE%E6%A8%99%E5%80%A4%E8%A8%AD%E5%AE%9A)
> - [第2回 「応答一律3秒」という性能要件はやめよう \| 日経クロステック（xTECH）](https://xtech.nikkei.com/it/article/COLUMN/20101101/353654/)

<br>

### ユースケース

オートスケーリングがある場合とない場合で、ネットワークの性能指標 (スループット、レスポンスタイムなど) にどの程度の違いがあるかを確認する。

> - [負荷試験、Gatlingを使ってやってみた - スタディサプリ Product Team Blog](https://blog.studysapuri.jp/entry/school-communication-with-gatling)

<br>

### 外部 API のモックサーバー

システムが外部 API と接続する場合、外部 API に影響を与えないようにモックサーバーを用意する。

ブラックボックステスト時は、外部 API へのドメインをモックサーバーのドメインに切り替える。

マイクロサービスアーキテクチャの場合、モックマイクロサービスを用意する。

![microservices_blackbox-test_external-api-mock](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_blackbox-test_external-api-mock.png)

> - [How to Test Microservices](https://semaphore.io/blog/test-microservices)

<br>

## 03-02. ロードテスト (負荷テスト)

### ロードテストとは

実地を再現した (許容の限界値を含む) 負荷をシステムに与えたとき、どのように動作するかを確認する。

許容以上の負荷を与えるストレステストとは区別すること。

> - [性能テストについて纏めてみた – uniface.hub](https://hub.uni-face.co.jp/performance-test/)
> - https://stackify.com/what-is-load-testing/
> - [非機能テストについて - ソフトウェアテスト・第三者検証ならデロイト トーマツ ウェブレッジ](https://webrage.jp/techblog/non_functional_testing/)

<br>

### ユースケース

#### ▼ 例

実際の負荷状況で、オートスケーリングが品質を満たしているか (有効に機能するか) を確認する。

> - [負荷試験、Gatlingを使ってやってみた - スタディサプリ Product Team Blog](https://blog.studysapuri.jp/entry/school-communication-with-gatling)

#### ▼ 例

性能の限界値に達するほどのリクエスト数が送信されたとき、障害回避処理 (例：アクセスが込み合っている旨のページを表示) が実行されるかを検証する。

具体的にはテスト時、障害回避処理以外の動作 (エラー、間違った処理、障害回復後にも回復できない、システムダウン) が起こらないか否かを確認する。

> - [1ヶ月で負荷テストの基礎から学んで実際にやってみた知見 \| BLOG - DeNA Engineering](https://engineering.dena.com/blog/2021/10/healthcare-load-testing/)

<br>

### 設計規約

#### ▼ ロードテストツール

- Jenkins
- Grafana k6 (JavaScript でシナリオ定義できる)
- Gatling (Scala でシナリオ定義できる)
- Taurus (他のロードテストツールのラッパー)

> - [負荷試験＃ツール選択 \| 外道父の匠](http://blog.father.gedow.net/2021/08/17/stress-tools/)

#### ▼ 事前作業

- トラフィックピークに相当するリクエスト数を見積もる
  - 土日
  - お盆
  - ゴールデンウィーク
  - 年末年始
- ロードテスト前にアラートを無効化して
- 実行環境を占有させてもらうことになるため、関係者と実施日を調整する。

#### ▼ 実行環境

ロードテストの実行環境の性能が低いと、リクエストの送信速度が落ちてしまう。

そのため、ローカル PC などではなく、専用のサーバーなどで実行したほうがよい。

#### ▼ シナリオの種類

- 一定数のリクエストを数分間送信し続ける。
- 送信するリクエスト数を増加 (直線的、指数関数的など) させていく。
- 最初は一定数のリクエストを送信し、途中からリクエスト数を増加させていく。

#### ▼ テストレポートによる評価

該当機能のエンドポイントで、レスポンスの `95`%が SLO の目標値を満たすことを確認する。

<table>
  <thead>
    <tr>
      <th>機能のエンドポイント</th>
      <th>区分</th>
      <th>トランザクション回数／秒間</th>
      <th>SLO の目標値</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>/api/v1/foo</code></td>
      <td>平常時 (トラフィックピークでない)</td>
      <td><code>10</code> tps</td>
      <td><code>10</code> tps の負荷時に、<code>99</code> パーセンタイルが <code>1</code> 秒以内に完了する</td>
    </tr>
    <tr>
      <td><code>/api/v1/bar</code></td>
      <td>平常時 (トラフィックピークでない)</td>
      <td><code>20</code> tps</td>
      <td><code>20</code> tps の負荷時時に、<code>99</code> パーセンタイルが <code>1</code> 秒以内に完了する</td>
    </tr>
    <tr>
      <td><code>/api/v1/baz</code></td>
      <td>平常時 (トラフィックピークでない)</td>
      <td><code>15</code> tps</td>
      <td><code>15</code> tps の負荷時時に、<code>99</code> パーセンタイルが <code>1</code> 秒以内に完了する</td>
    </tr>
    <tr>
      <td><code>/api/v1/qux</code></td>
      <td>性能上限相当の負荷</td>
      <td><code>20</code> tps</td>
      <td><code>20</code> tps の負荷時時に、<code>99</code> パーセンタイルが <code>1</code> 秒以内に完了する</td>
    </tr>
  </tbody>
</table>

<br>

### ロードテストのテストケース

#### ▼ 背景

アプリで、開始からピークまでに次のようにリクエスト数が増し、障害が発生した。

今回、障害に耐えられるようにスペックを向上させた。

障害時のデータに基づいてロードテストを実施し、障害時と同じ負荷に十分耐えられるかどうかを検証する。

<table>
  <thead>
    <tr>
      <th>障害発生期間</th>
      <th>合計閲覧ページ数<br><code>(PV数/min)</code></th>
      <th>平均ユーザー数<br><code>(UA数/min)</code></th>
      <th>ユーザー当たり閲覧ページ数<br><code>(PV数/UA数)</code></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>13:00 ~</code><br><code>13:05</code> (開始)</td>
      <td><code>300</code></td>
      <td><code>100</code></td>
      <td><code>3</code></td>
    </tr>
    <tr>
      <td><code>13:05 ~</code><br><code>13:10</code></td>
      <td><code>600</code></td>
      <td><code>200</code></td>
      <td><code>3</code></td>
    </tr>
    <tr>
      <td><code>13:10 ~</code><br><code>13:15</code> (ピーク)</td>
      <td><code>900</code></td>
      <td><code>300</code></td>
      <td><code>3</code></td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th>ランキング</th>
      <th>URL</th>
      <th>割合</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td><code>/aaa/bbb/*</code></td>
      <td>40<code>%</code></td>
    </tr>
    <tr>
      <td>2</td>
      <td><code>/ccc/ddd/*</code></td>
      <td>30<code>%</code></td>
    </tr>
    <tr>
      <td>3</td>
      <td><code>/eee/fff/*</code></td>
      <td>20<code>%</code></td>
    </tr>
    <tr>
      <td>4</td>
      <td><code>/ggg/hhh/*</code></td>
      <td>10<code>%</code></td>
    </tr>
  </tbody>
</table>

#### ▼ テストケース

ユーザー当たりの閲覧ページ数はループ数に置き換わるため、ループ数は『`3` 回』になる。

障害発生期間の閲覧ページ数はスレッド数に置き換わるため、スレッド数は『`1800` 個 (`300 + 600 + 900`) 』になる。

障害発生期間は、ランプアップに置き換わるため、ランプアップ期間は『`900` 秒 (`15` 分間) 』になる。

<table>
  <thead>
    <tr>
      <th>スレッド数 (個)</th>
      <th>ループ数 (回)</th>
      <th>ランプアップ期間 (秒)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>1800</code></td>
      <td><code>3</code></td>
      <td><code>900</code></td>
    </tr>
  </tbody>
</table>

<br>

## 03-03. ストレステスト (限界テスト)

### ストレステスト

許容以上の負荷をシステムに与えたとき、どのように動作するかを確認する。

また、テストレポートから次の範囲を導く必要がある。

- 安全範囲 (青信号)
- 危険範囲 (黄色信号)
- 限界値 (赤信号)

これらは、運用時の監視で参考にする。

実地を再現した (許容の限界値を含む) 負荷を与えるロードテストとは区別すること。

> - [性能テストについて纏めてみた – uniface.hub](https://hub.uni-face.co.jp/performance-test/)
> - https://stackify.com/what-is-load-testing/
> - [1ヶ月で負荷テストの基礎から学んで実際にやってみた知見 \| BLOG - DeNA Engineering](https://engineering.dena.com/blog/2021/10/healthcare-load-testing/)

<br>

### 設計規約

#### ▼ ストレステストツール

- Jenkins
- Grafana k6 (JavaScript でシナリオ定義できる)
- Gatling (Scala でシナリオ定義できる)
- Taurus (他のロードテストツールのラッパー)

> - [負荷試験＃ツール選択 \| 外道父の匠](http://blog.father.gedow.net/2021/08/17/stress-tools/)

#### ▼ 事前作業

- ストレステスト前にアラートを無効化しておく。
- 実行環境を占有させてもらうことになるため、関係者と実施日を調整する。

#### ▼ シナリオの種類

- 一定数のリクエストを送信し続ける。
- 送信するリクエスト数を増加 (直線的、指数関数的など) させていく。
- 最初は一定数のリクエストを送信し、途中からリクエスト数を増加させていく。

#### ▼ テストレポートによる評価

- `%` を判断基準に使用する。レスポンスの `95`%が、ネットワークの性能指標 (スループット、レスポンスタイムなど) で一定水準以下の値であることを確認する。

<br>

## 03-03. 耐久テスト

### 耐久テストとは

長時間の大量リクエストが送信されたとき、短時間では検出できないどのような問題が存在するかを検証する。

具体的にはテスト時、長時間の大量リクエストを処理させ、問題 (例：メモリリークによってメモリを圧迫、セッションデータが蓄積してメモリやストレージを圧迫、ログが蓄積してストレージを圧迫、ヒープやトランザクションログが CPU や I/O 処理を圧迫) を発生させる。

これにより、どんな問題が起こるか否かを確認する。

> - [性能テストについて纏めてみた – uniface.hub](https://hub.uni-face.co.jp/performance-test/)
> - [1ヶ月で負荷テストの基礎から学んで実際にやってみた知見 \| BLOG - DeNA Engineering](https://engineering.dena.com/blog/2021/10/healthcare-load-testing/)

<br>

## 04. 可用性テスト

### 可用性テストとは

システムで意図的に障害を起こし、そのときに可用性の仕組みが正しく発動し、非機能的な品質を満たしているかを検証する。

<br>

### 目標値の指標

#### ▼ RPO (目標回復時点)

障害が発生したとき、どの時点まで遡ってデータを回復させるかの目標値のこと。

もし RPO が `5` 分間だとすると、`5` 分間のデータ欠損は回復できず、これを許容することになる。

> - [RPO（目標復旧時点 / 回復ポイント目標）とは - IT用語辞典 e-Words](https://e-words.jp/w/RPO.html)

#### ▼ RTO (目標回復時間)

障害が発生したとき、障害後どの時間以内にデータを回復させるかの目標値のこと。

言い換えると、ダウンタイムの最大許容時間である。

もし RTO が `1` 時間だとすると、`1` 時間は障害が起こったまま (ダウンタイム) になり、これを許容することになる。

> - [RTO（目標復旧時間 / システム再開目標）とは - IT用語辞典 e-Words](https://e-words.jp/w/RTO.html)

<br>

### 可用性テストのテストケース

#### ▼ 背景

今回、Kubernetes の Node 上で、Kubernetes リソースとアプリケーションが稼働するシステムを開発した。

可用性テストを実施し、障害が起こっても利用可能な時間を確保できるかどうかを検証する。

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>技術</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>仮想サーバー</td>
      <td>Amazon EC2 (オートスケーリングあり)</td>
    </tr>
    <tr>
      <td>アプリ</td>
      <td>Go</td>
    </tr>
    <tr>
      <td>リバースプロキシ</td>
      <td>Nginx</td>
    </tr>
    <tr>
      <td>コンテナオーケストレーション</td>
      <td>Kubernetes</td>
    </tr>
    <tr>
      <td>サービスメッシュ</td>
      <td>Istio</td>
    </tr>
    <tr>
      <td>メトリクスの監視バックエンド</td>
      <td>Prometheus</td>
    </tr>
    <tr>
      <td>ログの収集</td>
      <td>Fluentd</td>
    </tr>
    <tr>
      <td>分散トレースの監視フロントエンド</td>
      <td>Jaeger</td>
    </tr>
    <tr>
      <td>メッシュトポロジーの監視フロントエンド</td>
      <td>Kiali</td>
    </tr>
  </tbody>
</table>

#### ▼ テストケース

各テストケースで、カオスエンジニアリングやフォールトインジェクションを実施する。

障害発生時にシステムが高い可用性を発揮できるかを確認する。

<table>
  <thead>
    <tr>
      <th>障害名</th>
      <th>フォールトインジェクション</th>
      <th>検証方法</th>
      <th>検証方法のコマンド</th>
      <th>期待動作</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Node の停止障害</td>
      <td>Amazon EC2 を停止させる。</td>
      <td>Node 内で root 権限でカーネルパニックを意図的に起こし、その状態でもシステム全体として稼働し続けられるか否かを確認する。</td>
      <td>・<code>aws ec2 stop-instances --instance-ids &lt;インスタンスID&gt;</code><br>・<code>echo 1 &gt; /proc/sys/kernel/sysrq &amp;&amp; echo c &gt; /proc/sysrq-trigger</code></td>
      <td>・冗長化された稼働中の Node 上で、レプリカ数を維持できるだけの Pod が起動する。<br>・オートスケーリングによって、停止した Node に代わり新しい Node が起動する。<br>・Node のヘルスチェックが正常である。</td>
    </tr>
    <tr>
      <td rowspan="10">Pod の停止障害</td>
      <td>Go の Pod を停止させる。</td>
      <td rowspan="9"><code>kubectl</code> コマンドで Pod を強制的に終了し、その状態でもシステム全体として稼働し続けられるか否かを確認する。</td>
      <td rowspan="9">・<code>kubectl delete pod &lt;Pod名&gt; --grace-period=0 --force</code></td>
      <td>・オートスケーリングによって、停止した Pod に代わり新しい Pod が起動する。<br>・アプリケーションが正しく動作している。</td>
    </tr>
    <tr>
      <td>Nginx の Pod を停止させる。</td>
      <td>・オートスケーリングによって、停止した Pod に代わり新しい Pod が起動する。<br>・アプリケーションが正しく動作している。</td>
    </tr>
    <tr>
      <td>kube-state-metrics の Pod を停止させる。</td>
      <td>・オートスケーリングによって、停止した Pod に代わり新しい Pod が起動する。<br>・データをすべて収集できている。</td>
    </tr>
    <tr>
      <td>Prometheus の Pod を停止させる。</td>
      <td>・オートスケーリングによって、停止した Pod に代わり新しい Pod が起動する。<br>・データをすべて収集できている。</td>
    </tr>
    <tr>
      <td>Fluentd の Pod を停止させる。</td>
      <td>・オートスケーリングによって、停止した Pod に代わり新しい Pod が起動する。<br>・ログをまさしくルーティングできている。</td>
    </tr>
    <tr>
      <td>Grafana の Pod を停止させる。</td>
      <td>・オートスケーリングによって、停止した Pod に代わり新しい Pod が起動する。<br>・ダッシュボードにログインできる。<br>・データをまさしく可視化できている。</td>
    </tr>
    <tr>
      <td>Alertmanager の Pod を停止させる。</td>
      <td>・オートスケーリングによって、停止した Pod に代わり新しい Pod が起動する。<br>・ダッシュボードにログインできる。<br>・アラートをまさしくルーティングできている。</td>
    </tr>
    <tr>
      <td>Kiali の Pod を停止させる。</td>
      <td>・オートスケーリングによって、停止した Pod に代わり新しい Pod が起動する。<br>・ダッシュボードにログインできる。<br>・アラートをまさしくルーティングできている。</td>
    </tr>
    <tr>
      <td>Jaeger の Pod を停止させる。</td>
      <td>・オートスケーリングによって、停止した Pod に代わり新しい Pod が起動する。<br>・ダッシュボードにログインできる。<br>・アラートをまさしくルーティングできている。</td>
    </tr>
    <tr>
      <td>Istio でフォールトインジェクションを実施する。</td>
      <td>Istio の機能を使用する。</td>
      <td>可用性テストのときだけ、マニフェストにフォールトインジェクションの設定を追加する。</td>
      <td>・オートスケーリングによって、停止した Pod に代わり新しい Pod が起動する。<br>・ダッシュボードにログインできる。<br>・アラートをまさしくルーティングできている。</td>
    </tr>
  </tbody>
</table>

> - [Chaos Engineering Toolの比較](https://zenn.dev/kentaro36/articles/f8c3d9f961d81e#chaos-engineering-tool-%E6%AF%94%E8%BC%83)

<br>

## 05. 耐障害性テスト

### Fault tolerance (耐障害性)

### 耐障害性テストとは

システムで意図的に障害を起こし、そのときの耐障害性が非機能的な品質を満たしているかを検証する。

> - [分散システムの耐障害性テストの取り組み - Cybozu Inside Out \| サイボウズエンジニアのブログ](https://blog.cybozu.io/entry/2018/09/06/080000)

<br>

## 06. Testing in production

### Testing in production とは

本番環境にて実際のユーザーの手を借り、非機能的な品質を実地的に検証する (例：該当のエラーメトリクスが基準値を満たすか) 。

- カナリアリリース中のテスト
- カオスエンジニアリング

> - [Testing in production](https://www.optimizely.com/optimization-glossary/testing-in-production/)

<br>

### カオスエンジニアリング

#### ▼ カオスエンジニアリングとは

実験的に、本番環境のマイクロサービスアーキテクチャなシステムにランダムな『カオス』を意図的に注入し、高負荷な状態に至らせる。

そのテストレポートから、システムに潜む想定外の問題を表面化させる。

カオスエンジニアリングは、実環境でのテストであり (例：該当のエラーメトリクスが基準値を満たすか) 、今まさに実際のユーザーが使用しているソフトウェアに対して実施することになるため、ビジネスサイドの理解が必要になる。

ただし、必ずしも本番環境でしか使用できるわけではない。

テスト環境で実施し、起こりうる障害を洗い出すように使用してもよい。

対象となるシステムは、マイクロサービスアーキテクチャであっても、モノリシックアーキテクチャであっても、問題ない。

本格的なカオスエンジニアリングを採用している日系企業は少なく、国内事例はまだ少ない。

障害の発生対象に合わせて、ツールを選ぶ必要がある。

<table>
  <thead>
    <tr>
      <th>ツール</th>
      <th>発生先</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Chaos Mesh</td>
      <td>AWS、Google Cloud、Kubernetes</td>
    </tr>
    <tr>
      <td>Chaos Monkey</td>
      <td>AWS</td>
    </tr>
  </tbody>
</table>

> - [PRINCIPLES OF CHAOS ENGINEERING - Principles of chaos engineering](https://principlesofchaos.org/)
> - https://codezine.jp/article/detail/14526
> - [【レポート】Chaos Engineering が合うもの/合わないもの – ChaosConf2019 recap – \| DevelopersIO](https://dev.classmethod.jp/articles/what-is-suitable-for-chaos-engineering-chaosconf2019-recap/#toc-6)
> - [Chaos Mesh によるカオスエンジニアリング \| sreake.com \| 株式会社スリーシェイク](https://sreake.com/blog/chaosmesh/)

#### ▼ フォールトインジェクション

カオスエンジニアリングの一種である。

マイクロサービスアーキテクチャなシステムの一部分にランダムな障害を意図的に注入し、高負荷な状態に至らせる。

障害の発生対象に合わせて、ツールを選ぶ必要がある。

<table>
  <thead>
    <tr>
      <th>ツール</th>
      <th>発生先</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Istio</td>
      <td>Kubernetes</td>
    </tr>
    <tr>
      <td>AWS Fault Injection Simulator</td>
      <td>AWS</td>
    </tr>
  </tbody>
</table>

> - [Fault Injection \| Linkerd](https://linkerd.io/2-edge/features/fault-injection/)
> - [Chaos Engineering Toolの比較](https://zenn.dev/kentaro36/articles/f8c3d9f961d81e#chaos-engineering-tool-%E6%AF%94%E8%BC%83)

#### ▼ 手順

`(1)`

: 本番環境のシステムからさまざまなテレメトリーを収集し、安定している通常状態 (定常状態) を定義する。

`(2)`

: 定常状態を対照群、またカオスエンジニアリングが実施された状態を実験群とする。『実験群では障害が起こる』という仮説の下、これを反証することを目指す。

`(3)`

: 実験群でカオスエンジニアリングを実施する。

`(4)`

: 対照群と比較し、『障害は起こる』という仮説を反証する。

> - [カオスエンジニアリングの過去と今(前編)](https://zenn.dev/hodagi/articles/3ce6ccdb00538c)

<br>

## 07. ペネトレーションテスト

既知のサイバー攻撃を意図的に行い、システムの脆弱性を確認するテストのこと。

**＊例＊**

株式会社 LAC によるペネトレーションテストサービス

![ペネトレーションテスト](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ペネトレーションテスト.png)

<br>

## 08. ポートミラーリング (ミラーリング、トラフィクミラーリング、トラフィックシャドーイング)

『ミラーリング』『トラフィックミラーリング』『トラフィックシャドーイング』ともいう。

特定のポートで送受信されるパケットをコピーし、別のポートに送信する。

本番環境に対するリクエストのコピーをテスト環境にミラーリングし、テスト環境を検証できる。

テスト環境からのレスポンスは破棄されるので、ユーザーに影響がない。

![test_traffic-mirroring](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/test_traffic-mirroring.png)

> - [Mirror production traffic to test environment with VPC Traffic Mirroring \| Networking & Content Delivery](https://aws.amazon.com/blogs/networking-and-content-delivery/mirror-production-traffic-to-test-environment-with-vpc-traffic-mirroring/)
> - [ポートミラーリング（ミラーポート）とは - IT用語辞典 e-Words](https://e-words.jp/w/%E3%83%9D%E3%83%BC%E3%83%88%E3%83%9F%E3%83%A9%E3%83%BC%E3%83%AA%E3%83%B3%E3%82%B0.html)

<br>
