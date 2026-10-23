---
title: 【IT技術の知見】ブラックボックステスト
description: ブラックボックステストの知見を記録しています。
---

# ブラックボックステスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. ブラックボックステスト

### ブラックボックステストとは

実装内容は気にせず、入力に対して、適切な出力が行われているかを検証する。

ユニットテストとホワイト/ブラックボックステストの関係性については、以下の書籍を参考にせよ。

![testing_black-box-test](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/testing_black-box-test.png)

> - [ホワイトボックステストとは？ブラックボックステストとの違いやその手順、よく使われる手法を解説｜ソフトウェアテストのSHIFT](https://service.shiftinc.jp/column/4801/)

<br>

### ブラックボックステストの種類

ホワイトボックステストと同じ名前のテストがあるが、実装内容を気にするか否かという点で、テスト内容は異なる。

- ユニットテスト
- 結合テスト
- 回帰テスト
- システムテスト

> - [ホワイトボックステストとは？ブラックボックステストとの違いやその手順、よく使われる手法を解説｜ソフトウェアテストのSHIFT](https://service.shiftinc.jp/column/4801/)

<br>

### ブラックボックスの環境

![environments](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/environments.png)

<table>
  <thead>
    <tr>
      <th>実行環境名</th>
      <th>略称</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>開発環境 (ローカル環境)</td>
      <td><code>dev</code></td>
      <td>『ローカル環境』ともいう。ローカルマシンの環境であり、開発者が動作を確認するため使用する。</td>
    </tr>
    <tr>
      <td>テスト環境 (サンドボックス環境、検証環境)</td>
      <td><code>tes</code> (<code>sbox</code>)</td>
      <td>企業によっては、『サンドボックス環境』『検証環境』ともいう。共有の環境であり、開発環境で作成した機能をデプロイし、開発者が動作を確認するために使用する。</td>
    </tr>
    <tr>
      <td>ステージング環境 (ユーザー受け入れ環境)</td>
      <td><code>stg</code> (<code>ua</code>)</td>
      <td>システムの依頼者が社外にいる場合に『ユーザー受け入れ (UA) 環境』ともいう。共有の環境であり、システムの依頼者が社内にいる場合に、その依頼者が動作を確認するために使用する。</td>
    </tr>
    <tr>
      <td>本番環境</td>
      <td><code>prd</code></td>
      <td>インターネットに公開された環境であり、Testing in production を採用する場合は、一般のユーザーに動作を確認してもらう。</td>
    </tr>
  </tbody>
</table>

> - [開発環境、テスト環境、ステージング環境、本番環境について｜gun](https://note.com/gunj/n/nf139710d0e4a)
> - [ステージング環境とは？開発環境、検証環境との違いと役割 \| WWWクリエイターズ](https://www-creators.com/archives/780)
> - https://www.quora.com/What-is-difference-between-testing-environment-and-staging

<br>

## 02. ユニットテスト (単体テスト)

### ユニットテストとは

『単体テスト』ともいう。

機能追加/変更を含むコンポーネントのみが単体で正常に動作するかを検証する。

ホワイトボックステストのユニットテストとは意味合いが異なることに注意する。

![testing_blackbox-test_unit_integration_system](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/testing_blackbox-test_unit_integration_system.png)

> - [単体テスト・結合テスト・総合テストの違い、観点や注意点を簡単に説明する \| 若手エンジニアの羅針盤](https://pm-rasinban.com/ut-it-st)

<br>

### ユニットテストの種類

#### ▼ 機能テスト

<table>
  <thead>
    <tr>
      <th>テストの種類</th>
      <th>検証内容</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>正常系</td>
      <td>特定のシステムコンポーネントの処理を正しく操作できるか。</td>
    </tr>
  </tbody>
</table>

> - [非機能テストについて - ソフトウェアテスト・第三者検証ならデロイト トーマツ ウェブレッジ](https://webrage.jp/techblog/non_functional_testing)
> - [誤解されることが多い「テスト自動化」の範囲について #Selenium - Qiita](https://qiita.com/gevanni/items/ff9a27936a1a6df28b9a#-%E6%A9%9F%E8%83%BD%E8%A6%81%E4%BB%B6)

#### ▼ 非機能テスト

<table>
  <thead>
    <tr>
      <th>テストの種類</th>
      <th>検証内容</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>正常系</td>
      <td>特定のシステムコンポーネントのヘルスチェックが正常になっているか。</td>
    </tr>
  </tbody>
</table>

> - [非機能テストについて - ソフトウェアテスト・第三者検証ならデロイト トーマツ ウェブレッジ](https://webrage.jp/techblog/non_functional_testing)
> - [誤解されることが多い「テスト自動化」の範囲について #Selenium - Qiita](https://qiita.com/gevanni/items/ff9a27936a1a6df28b9a#-%E9%9D%9E%E6%A9%9F%E8%83%BD%E8%A6%81%E4%BB%B6)

<br>

## 03. 結合テスト (統合テスト)

### 結合テストとは

『統合テスト』ともいう。

機能追加/変更を含む特定のコンポーネントを組み合わせ、特定のコンポーネント間の連携が正しく動作しているかを検証する。

注意点として、特定の機能に関するすべてのコンポーネント間の連携をテストする『E2E テスト』とは異なる。

![testing_blackbox-test_unit_integration_system](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/testing_blackbox-test_unit_integration_system.png)

> - [単体テスト・結合テスト・総合テストの違い、観点や注意点を簡単に説明する \| 若手エンジニアの羅針盤](https://pm-rasinban.com/ut-it-st)

<br>

### 結合テストの種類

#### ▼ 機能テスト

<table>
  <thead>
    <tr>
      <th>テストの種類</th>
      <th>検証内容</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>正常系</td>
      <td>システムコンポーネント間の処理を正しく操作できるか</td>
    </tr>
  </tbody>
</table>

> - [非機能テストについて - ソフトウェアテスト・第三者検証ならデロイト トーマツ ウェブレッジ](https://webrage.jp/techblog/non_functional_testing)
> - [誤解されることが多い「テスト自動化」の範囲について #Selenium - Qiita](https://qiita.com/gevanni/items/ff9a27936a1a6df28b9a#-%E6%A9%9F%E8%83%BD%E8%A6%81%E4%BB%B6)

#### ▼ 非機能テスト

<table>
  <thead>
    <tr>
      <th>テストの種類</th>
      <th>検証内容</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>正常系</td>
      <td>システムコンポーネント間でまさしく連携できているか</td>
    </tr>
  </tbody>
</table>

> - [非機能テストについて - ソフトウェアテスト・第三者検証ならデロイト トーマツ ウェブレッジ](https://webrage.jp/techblog/non_functional_testing)
> - [誤解されることが多い「テスト自動化」の範囲について #Selenium - Qiita](https://qiita.com/gevanni/items/ff9a27936a1a6df28b9a#-%E9%9D%9E%E6%A9%9F%E8%83%BD%E8%A6%81%E4%BB%B6)

<br>

### 結合テストの方向

#### ▼ トップダウンテスト

上層のコンポーネントから下層のコンポーネントに向かって、結合テストを実施する。

下層にはテストダブルのスタブを作成する。

![トップダウンテスト](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/トップダウンテスト.jpg)

#### ▼ ボトムアップテスト

下層のコンポーネントから上層のコンポーネントに向かって、結合テストを実施する。

上層にはテストダブルのドライバーを作成する。

![ボトムアップテスト](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ボトムアップテスト.jpg)

<br>

### シナリオテスト

実際の業務フローを参考にし、ユーザーが操作する順にテストを実施する。

<br>

## 04. 回帰テスト

### 回帰テストとは

既存コンポーネントの機能テストと非機能テストをあらためて実施する。

機能追加/変更を含むコンポーネントが既存のコンポーネントに影響を与えていないか (既存の機能でデグレーションが起こっていないか) を検証する。

![p496](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p496.jpg)

> - [キタミ式イラストIT塾 基本情報技術者 令和04年 \| きたみ りゅうじ \|本 \| 通販 \| Amazon](https://www.amazon.co.jp/dp/4297124513)

<br>

### 回帰テストのテストケース

#### ▼ 背景

Kubernetes の Node 上で、Kubernetes リソースとアプリケーションが稼働するシステムを運用している。

今回、Kubernetes リソースをアップグレードすることになった。

回帰テストを実施し、アップグレードによる機能追加/変更が、既存のコンポーネントに影響を与えていないかを検証する。

#### ▼ Istio の場合

Istio のテストケースを示す。

<table>
  <thead>
    <tr>
      <th>テスト種別<br>(UT：ユニットテスト、IT：結合テスト)</th>
      <th>組み合わせ (IT の場合のみ)</th>
      <th>確認方法</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>コントロールプレーンの Pod (<code>istio-deployment</code> という Deployment 配下の Pod) が正常である。『Pod が <code>Running</code> フェーズかつ <code>Ready</code> コンディションであること』を Pod の正常とみなす。例えば、<code>kubectl get</code> コマンドを実行することで、正常か否かを確認する。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>Istio + <br>Kubernetes</td>
      <td><a href="http://istio.io/rev">istio.io/rev</a> キーのある Namespace の Pod に、istio-proxy が挿入されている。例えば、<code>kubectl get</code> コマンドで <code>-o jsonpath</code> オプションを有効化し、確認する。</td>
    </tr>
  </tbody>
</table>

#### ▼ Prometheus の場合

Prometheus のテストケースを示す。

<table>
  <thead>
    <tr>
      <th>テスト種別<br>(UT：ユニットテスト、IT：結合テスト)</th>
      <th>組み合わせ (IT の場合のみ)</th>
      <th>確認方法</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>Pod が正常である。『Pod が <code>Running</code> フェーズかつ <code>Ready</code> コンディションであること』を Pod の正常とみなす。例えば、<code>kubectl get</code> コマンドを実行することで、正常か否かを確認する。</td>
    </tr>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>・Pod で収集したデータポイントがローカルストレージに永続化されている。<br>・Pod のローカルストレージが Node にマウントされており、Pod が削除されてもローカルストレージを再マウントできる。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>Prometheus + <br>VictoriaMetrics + <br>Kubernetes</td>
      <td>Prometheus からメトリクスが送信されてきており、ダッシュボードでメトリクスを確認できる。例えば、メトリクスの <code>cluster</code> ラベルから、実行環境名 (dev、stg、prd) を確認する。</td>
    </tr>
  </tbody>
</table>

#### ▼ Alertmanager の場合

Alertmanager のテストケースを示す。

<table>
  <thead>
    <tr>
      <th>テスト種別<br>(UT：ユニットテスト、IT：結合テスト)</th>
      <th>組み合わせ (IT の場合のみ)</th>
      <th>確認方法</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>Pod が正常である。『Pod が <code>Running</code> フェーズかつ <code>Ready</code> コンディションであること』を Pod の正常とみなす。例えば、<code>kubectl get</code> コマンドを実行することで、正常か否かを確認する。</td>
    </tr>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>ダッシュボード上から新しく作成した Silence が、正常に動作している。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>Alertmanager + <br>Prometheus + <br>Kubernetes</td>
      <td>ビルトインの PrometheusRule (<code>.metadata.annotations</code> キーに kubernetes-mixin への URL を持つ) のアラートルールが発火した場合に、アラートを通知できる。必ずアラートが発火するような閾値 (例：ゼロ) に変更し、アラートが発火するかを検証する。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>Alertmanager + <br>Prometheus + <br>Kubernetes</td>
      <td>ユーザ定義の PrometheusRule のアラートルールが発火した場合に、アラートを通知できる。必ずアラートが発火するような閾値 (例：ゼロ) に変更し、アラートが発火するかを検証する。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>Alertmanager + <br>Prometheus + <br>Kubernetes</td>
      <td>ダッシュボード上でアラートを捕捉しており、Prometheus から送信されたアラートを受信していることを確認できる。</td>
    </tr>
  </tbody>
</table>

#### ▼ Grafana の場合

Grafana のテストケースを示す。

<table>
  <thead>
    <tr>
      <th>テスト種別<br>(UT：ユニットテスト、IT：結合テスト)</th>
      <th>組み合わせ (IT の場合のみ)</th>
      <th>確認方法</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>Pod が正常である。『Pod が <code>Running</code> フェーズかつ <code>Ready</code> コンディションであること』を Pod の正常とみなす。例えば、<code>kubectl get</code> コマンドを実行することで、正常か否かを確認する。</td>
    </tr>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>ビルトインのダッシュボード (<code>mixin</code> タグを持つ) を正しく読み込めるか。</td>
    </tr>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>ユーザ定義のダッシュボードを正しく読み込めるか。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>Grafana + <br>Prometheus + <br>Kubernetes</td>
      <td>ビルトインのダッシュボード (<code>mixin</code> タグを持つ) で PromQL を入力し、Prometheus のメトリクスを確認できる。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>Grafana + <br>Prometheus + <br>Kubernetes</td>
      <td>ユーザ定義のダッシュボードで PromQL を入力し、Prometheus のメトリクスを確認できる。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>Grafana + <br>Prometheus + <br>Kubernetes</td>
      <td>ビルトインのダッシュボード (<code>mixin</code> タグを持つ) で Prometheus のメトリクスのリアルタイムデータを確認できる。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>Grafana + <br>Prometheus + <br>Kubernetes</td>
      <td>ユーザ定義のダッシュボードで Prometheus のメトリクスのリアルタイムデータを確認できる。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>Grafana + <br>Prometheus + <br>Kubernetes</td>
      <td>ビルトインのダッシュボード (<code>mixin</code> タグを持つ) で、datasource、namespace、type、resolusion の条件を変更し、リアルタイムデータを確認できる。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>Grafana + <br>Prometheus + <br>Kubernetes</td>
      <td>ユーザ定義のダッシュボードで、datasource、namespace、type、resolusion の条件を変更し、リアルタイムデータを確認できる。</td>
    </tr>
  </tbody>
</table>

#### ▼ PrometheusOperator の場合

PrometheusOperator のテストケースを示す。

<table>
  <thead>
    <tr>
      <th>テスト種別<br>(UT：ユニットテスト、IT：結合テスト)</th>
      <th>組み合わせ (IT の場合のみ)</th>
      <th>確認方法</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>PodMonitor の既存の設定が正常に動作しており、異常を検知するとアラートを発火できる。『Pod が <code>Running</code> フェーズかつ <code>Ready</code> コンディションであること』を Pod の正常とみなす。例えば、<code>kubectl get</code> コマンドを実行することで、正常か否かを確認する。</td>
    </tr>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>Probe の既存の設定が正常に動作しており、異常を検知するとアラートを発火できる。</td>
    </tr>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>PrometheusRule の既存の設定が正常に動作しており、異常を検知すると発火できる。</td>
    </tr>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>ServiceMonitor の既存の設定が正常に動作しており、異常を検知するとアラートを発火できる。</td>
    </tr>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>PrometheusOperator のアラートが発火されていない。</td>
    </tr>
  </tbody>
</table>

#### ▼ 各種 Exporter の場合

各種 Exporter のテストケースを示す。

<table>
  <thead>
    <tr>
      <th>Exporter 名</th>
      <th>テスト種別<br>(UT：ユニットテスト、IT：結合テスト)</th>
      <th>組み合わせ (IT の場合のみ)</th>
      <th>確認方法</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">kube-state-metrics</td>
      <td>UT</td>
      <td>-</td>
      <td>Pod が正常である。『Pod が <code>Running</code> フェーズかつ <code>Ready</code> コンディションであること』を Pod の正常とみなす。例えば、<code>kubectl get</code> コマンドを実行することで、正常か否かを確認する。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>kube-state-metrics + <br>Prometheus + <br>Kubernetes</td>
      <td>ダッシュボードで PromQL を入力し、Process Exporter 経由で収集しているメトリクスを確認できる。例えば、<code>kube_pod_info</code> メトリクスや <code>kube_node_info</code> メトリクスを確認する。</td>
    </tr>
    <tr>
      <td rowspan="2">Node Exporter</td>
      <td>UT</td>
      <td>-</td>
      <td>Pod が正常である。『Pod が <code>Running</code> フェーズかつ <code>Ready</code> コンディションであること』を Pod の正常とみなす。例えば、<code>kubectl get</code> コマンドを実行することで、正常か否かを確認する。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>Node Exporter + <br>Prometheus + <br>Kubernetes</td>
      <td>ダッシュボードで PromQL を入力し、Node Exporter 経由で収集しているメトリクスを確認できる。例えば、<code>node_cpu_seconds_total</code> メトリクスを確認する。</td>
    </tr>
    <tr>
      <td rowspan="2">Process Exporter</td>
      <td>UT</td>
      <td>-</td>
      <td>Pod が正常である。『Pod が <code>Running</code> フェーズかつ <code>Ready</code> コンディションであること』を Pod の正常とみなす。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>Process Exporter + <br>Prometheus + <br>Kubernetes</td>
      <td>ダッシュボードで PromQL を入力し、Process Exporter 経由で収集しているメトリクスを確認できる。例えば、<code>namedprocess_namegroup_cpu_seconds_total </code> メトリクスを確認する。</td>
    </tr>
  </tbody>
</table>

#### ▼ Fluentd の場合

Fluentd のテストケースを示す。

<table>
  <thead>
    <tr>
      <th>テスト種別<br>(UT：ユニットテスト、IT：結合テスト)</th>
      <th>組み合わせ (IT の場合のみ)</th>
      <th>確認方法</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>Pod が正常である。『Pod が <code>Running</code> フェーズかつ <code>Ready</code> コンディションであること』を Pod の正常とみなす。例えば、<code>kubectl get</code> コマンドを実行することで、正常か否かを確認する。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>Fluentd + <br>監視バックエンド + <br>監視フロントエンド + <br>Kubernetes</td>
      <td>Node 内の任意の Pod のログを正しい形式で監視バックエンドに送信し、監視フロントエンドで可視化できている。例えば、Containerd には、ログメッセージ部分がテキスト形式 (例：metrics-server など)　の場合と <code>json</code> 形式 (例：alertmanager、istio-proxy など) の場合がある。<br>監視バックエンド (例：Grafana Loki) これらの両方の形式のログを正しく解析し、監視フロントエンド (例：Grafana、Kibana) がそれを可視化できていることを確認する。</td>
    </tr>
  </tbody>
</table>

#### ▼ Kiali の場合

Kiali のテストケースを示す。

<table>
  <thead>
    <tr>
      <th>テスト種別<br>(UT：ユニットテスト、IT：結合テスト)</th>
      <th>組み合わせ (IT の場合のみ)</th>
      <th>確認方法</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>Pod が正常である。『Pod が <code>Running</code> フェーズかつ <code>Ready</code> コンディションであること』を Pod の正常とみなす。例えば、<code>kubectl get</code> コマンドを実行することで、正常か否かを確認する。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>Kiali + <br>Prometheus + <br>Istio</td>
      <td>Prometheus が Istio Ingress/Egress Gateway や istio-proxy のデータポイントを収集し、Kiali が Prometheus から Istio メトリクスや Envoy メトリクスを取得できているかを確認する。例えば、サービストポロジーが表示されることを確認する。<br>Kiali が Prometheus からメトリクスを取得できない場合、トポロジーを表示できない。</td>
    </tr>
  </tbody>
</table>

#### ▼ metrics-server の場合

metrics-server のテストケースを示す。

<table>
  <thead>
    <tr>
      <th>テスト種別<br>(UT：ユニットテスト、IT：結合テスト)</th>
      <th>組み合わせ (IT の場合のみ)</th>
      <th>確認方法</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>UT</td>
      <td>-</td>
      <td>Pod が正常である。『Pod が <code>Running</code> フェーズかつ <code>Ready</code> コンディションであること』を Pod の正常とみなす。例えば、<code>kubectl get</code> コマンドを実行することで、正常か否かを確認する。</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>metrics-server + <br>Pod、Node</td>
      <td>Pod、Node、からメトリクスを取得できるかを確認する。例えば、<code>kubectl top pod -A</code> コマンドや <code>kubectl top node</code> コマンドで、Pod や Node の CPU 使用率とメモリ使用率を取得できるかを確認する。また、</td>
    </tr>
    <tr>
      <td>IT</td>
      <td>metrics-server + <br>HorizontalPodAutoscaler</td>
      <td>HorizontalPodAutoscaler からメトリクスを取得できるかを確認する。例えば、事前に <code>.spec.containers[*].resources</code> キーが設定された Deployment を確認しておく。<code>kubectl get hpa -A</code> コマンドで、Target 列が <code>&lt;unknown&gt;</code> になっていないことを確認する。</td>
    </tr>
  </tbody>
</table>

#### ▼ その他

その他のテストケースを示す。

<table>
  <thead>
    <tr>
      <th>コンポーネント</th>
      <th>テスト種別<br>(UT：ユニットテスト、IT：結合テスト)</th>
      <th>組み合わせ (IT の場合のみ)</th>
      <th>確認方法</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>その他</td>
      <td>-</td>
      <td>-</td>
      <td>Name にて、不要な Pod が稼働していないか。</td>
    </tr>
  </tbody>
</table>

<br>

## 05. システムテスト (システムテスト)

> - [【IT技術の知見】システムテスト＠ブラックボックステスト - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/testing/testing_blackbox_system_test.html)

<br>
