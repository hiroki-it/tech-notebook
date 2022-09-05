---
title: 【IT技術の知見】ブラックボックステスト
description: ブラックボックステストの知見を記録しています。
---

# ブラックボックステスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ブラックボックステスト

### ブラックボックステストとは

ホワイトボックステストと組み合わせて単体テストを構成する。実装内容は気にせず、入力に対して、適切な出力が行われているかを検証する。単体テストとホワイト/ブラックボックステストの関係性については、以下の書籍を参考にせよ。

> ℹ️ 参考：https://service.shiftinc.jp/column/4801/

![testing_black-box-test](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/testing_black-box-test.png)

<br>

### ブラックボックステストの種類

ホワイトボックステストと同じ名前のテストがあるが、実装内容を気にするか否かという点で、テスト内容は異なる。

> ℹ️ 参考：https://service.shiftinc.jp/column/4801/

- 単体テスト
- 結合テスト
- 回帰テスト
- 総合テスト

<br>

### ブラックボックスの環境

> ℹ️ 参考：
>
> - https://www-creators.com/archives/780
> - https://www.quora.com/What-is-difference-between-testing-environment-and-staging

| 実行環境名                       | 略称        | 説明                                                         |
| -------------------------------- |-----------| ------------------------------------------------------------ |
| 開発環境                         | dev       | ローカルマシンの環境であり、開発者が動作を確認するため使用する。 |
| テスト環境（サンドボックス環境） | tes（sbox） | 共有の環境であり、開発環境で作成した機能をデプロイし、開発者が動作を確認するために使用する。企業によっては、サンドボックス環境と呼ぶことがある。 |
| ステージング環境（ユーザー受け入れ環境）      | stg（ua）   | 共有の環境であり、システムの依頼者が社内にいる場合に、その依頼者が動作を確認するために使用する。システムの依頼者が社外にいる場合、ユーザー受け入れ環境と呼ぶことがある。 |
| 本番環境                         | prd       | インターネットに公開された環境であり、Testing in productionを採用する場合は、一般のユーザーに動作を確認してもらう。 |

<br>

## 02. 単体テスト（ユニットテスト）

### 単体テストとは

機能追加/変更を含むコンポーネントのみが単体で正しく機能するかを検証する。

> ℹ️ 参考：https://pm-rasinban.com/ut-it-st

![testing_blackbox-test_unit_integration_system](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/testing_blackbox-test_unit_integration_system.png)

<br>

### 単体テストの種類

#### ▼ 機能テスト

| テストの種類 | 検証内容                                                 |
| ------------ | -------------------------------------------------------- |
| 正常系       | 特定のシステムコンポーネントの処理を正しく操作できるか。 |

> ℹ️ 参考：
>
> - https://webrage.jp/techblog/non_functional_testing
> - https://qiita.com/gevanni/items/ff9a27936a1a6df28b9a#-%E6%A9%9F%E8%83%BD%E8%A6%81%E4%BB%B6

#### ▼ 非機能テスト

| テストの種類 | 検証内容                                                     |
| ------------ | ------------------------------------------------------------ |
| 正常系       | 特定のシステムコンポーネントのヘルスチェックが正常になっているか。 |

> ℹ️ 参考：
>
> - https://webrage.jp/techblog/non_functional_testing
> - https://qiita.com/gevanni/items/ff9a27936a1a6df28b9a#-%E9%9D%9E%E6%A9%9F%E8%83%BD%E8%A6%81%E4%BB%B6

<br>

## 03. 結合テスト（インテグレーションテスト）

### 結合テストとは

機能追加/変更を含む複数のコンポーネントを組み合わせ、複数のコンポーネント間の連携が正しく機能しているかを検証する。

> ℹ️ 参考：https://pm-rasinban.com/ut-it-st

![testing_blackbox-test_unit_integration_system](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/testing_blackbox-test_unit_integration_system.png)

<br>

### 結合テストの種類

#### ▼ 機能テスト

| テストの種類 | 検証内容                                           |
| ------------ | -------------------------------------------------- |
| 正常系       | システムコンポーネント間の処理を正しく操作できるか |

> ℹ️ 参考：
>
> - https://webrage.jp/techblog/non_functional_testing
> - https://qiita.com/gevanni/items/ff9a27936a1a6df28b9a#-%E6%A9%9F%E8%83%BD%E8%A6%81%E4%BB%B6

#### ▼ 非機能テスト

| テストの種類 | 検証内容                                         |
| ------------ | ------------------------------------------------ |
| 正常系       | システムコンポーネント間で正しく連携できているか |

> ℹ️ 参考：
>
> - https://webrage.jp/techblog/non_functional_testing
> - https://qiita.com/gevanni/items/ff9a27936a1a6df28b9a#-%E9%9D%9E%E6%A9%9F%E8%83%BD%E8%A6%81%E4%BB%B6

<br>

### 結合テストの方向

#### ▼ トップダウンテスト

上層のコンポーネントから下層のコンポーネントに向かって、結合テストを実施する。下層にはテストダブルのスタブを作成する。

![トップダウンテスト](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/トップダウンテスト.jpg)

<br>

#### ▼ ボトムアップテスト

下層のコンポーネントから上層のコンポーネントに向かって、結合テストを実施する。上層にはテストダブルのドライバーを作成する。

![ボトムアップテスト](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ボトムアップテスト.jpg)

<br>

### シナリオテスト

実際の業務フローを参考にし、ユーザーが操作する順にテストを実施する。

<br>

## 04. 回帰テスト

### 回帰テストとは

既存コンポーネントの機能テストと非機能テストを改めて実施し、機能追加/変更を含むコンポーネントが既存のコンポーネントに影響を与えていないか（既存の機能がデグレーションしていないか）を検証する。

> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

![p496](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p496.jpg)

<br>

### 回帰テスト例

#### ▼ 背景

KubernetesのワーカーNode上で、Kubernetesリソースとアプリケーションが稼働するシステムを運用しており、kube-prometheus-stackチャートを使用してPrometheusをインストールしている。今回、kube-prometheus-stackチャートをアップグレードすることになった。回帰テストを実施し、アップグレードによる機能追加/変更が、既存のコンポーネントに影響を与えていないかを検証する。

#### ▼ テストケース例

| コンポーネント     | テスト種別（UT：単体テスト、IT：結合テスト） | 組み合わせ（ITの場合のみ）     | テストケース                                                 | 補足                                               |
| ------------------ | -------------------------------------------- | ------------------------------ | ------------------------------------------------------------ |--------------------------------------------------|
| prometheus         | UT                                           |                                | Podが正常である。                                            | 『PodがRunningフェーズかつReadyコンディションであること』をPodの正常とみなす。 |
|                    | UT                                           |                                | ・Podで収集したメトリクスがローカルストレージに永続化されている。<br>・PodのローカルストレージがワーカーNodeにマウントされており、Podが削除されてもローカルストレージを再マウントできる。 |                                                  |
|                    | IT                                           | Prometheus + EKS                | Cluster内のKubernetesリソースのメトリクスの異常値から、アラートを発火できる。 |                                                  |
|                    | IT                                           | Prometheus + kube-state-metrics | ダッシュボードでPromQLを入力し、kube-state-metrics経由で収集しているメトリクスを確認できる。 |                                                  |
|                    | IT                                           | Prometheus + node-exporter      | ダッシュボードでPromQLを入力し、node-exporter経由で収集しているメトリクスを確認できる。 |                                                  |
|                    | IT                                           | Prometheus + VictoriaMetrics    | Prometheusからメトリクスが送信されてきており、ダッシュボードでメトリクスを確認できる。 |                                                  |
| Alertmanager       | UT                                           |                                | Podが正常である。                                            |                                                  |
|                    | UT                                           |                                | ダッシュボード上から新しく作成したSilenceが、正常に機能している。 |                                                  |
|                    | UT                                           |                                | 条件を満たすアラートルールがあった場合に、アラートを通知できる。 |                                                  |
|                    | IT                                           | Alertmanager + Prometheus       | Prometheusから送信されたアラートを受信できる。               |                                                  |
| Grafana            | UT                                           |                                | Podが正常である。                                            |                                                  |
|                    | UT                                           |                                | 既存のダッシュボードを正しく読み込めるか。                   |                                                  |
|                    | IT                                           | Grafana + Prometheus            | ダッシュボードでPromQLを入力し、Prometheusのメトリクスを確認できる。 |                                                  |
|                    | IT                                           | Grafana + Prometheus            | 任意のダッシュボードでPrometheusのメトリクスのリアルタイムデータを確認できる。 |                                                  |
|                    | IT                                           | Grafana + Prometheus            | ダッシュボード上で、datasource、namespace、type、resolusion、の条件を変更し、リアルタイムデータを確認できる。 |                                                  |
| PrometheusOperator | UT                                           |                                | PodMonitorの既存の設定が正常に機能しており、異常を検知するとアラートを発火できる。 |                                                  |
|                    | UT                                           |                                | Probeの既存の設定が正常に機能しており、異常を検知するとアラートを発火できる。 |                                                  |
|                    | UT                                           |                                | PrometheusRuleの既存の設定が正常に機能しており、異常を検知すると発火できる。 |                                                  |
|                    | UT                                           |                                | ServiceMonitorの既存の設定が正常に機能しており、異常を検知するとアラートを発火できる。 |                                                  |
|                    | UT                                           |                                | PrometheusOperatorのアラートが発火されていない。             |                                                  |
| kube-state-metrics | UT                                           |                                | Podが正常である。                                            |                                                  |
| node-exporter      | UT                                           |                                | Podが正常である。                                            |                                                  |
| その他             |                                              |                                | Namespace=prometheusにて、不要なPodが稼働していないか。      |                                                  |

<br>

## 05. 総合テスト（システムテスト）

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/testing/testing_blackbox_system_test.html

<br>

