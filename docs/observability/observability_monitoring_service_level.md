---
title: 【IT技術の知見】サービスレベル＠監視
description: サービスレベル＠監視の知見を記録しています。
---

# サービスレベル＠監視

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. SLI：Service Level Indicator (サービスレベル指標)

### SLI とは

サービスレベルの指標とするメトリクスのこと。

> - https://newrelic.com/jp/topics/what-are-slos-slis-slas#toc-sli-

<br>

### SLI の決め方

#### ▼ ユーザージャーニー (カスタマージャーニー)

『カスタマージャーニー』とも言う。

ユーザーが問題を解決するために辿る一連の行動のこと。

> - https://quaffmedia.com/what-is-critical-user-journey/

#### ▼ クリティカルユーザージャーニーと SLI

ユーザージャーニーのなかでも、特にビジネスの収益への影響が大きいもののこと。

クリティカルジャーニーで実行されるアプリケーション機能に関するページのメトリクス (例：ステータスコード、レイテンシー) を SLI とする。

> - https://quaffmedia.com/what-is-critical-user-journey/

**＊例＊**

EC サイトであれば、以下の一連の行動がクリティカルユーザージャーニーとなる。

`(1)`

: 商品を検索する。

`(2)`

: 該当の商品を閲覧する。

`(3)`

: 商品をカートに追加する。

`(4)`

: 商品を購入する。

> - [Learn how to set SLOs -- SRE tips \| Google Cloud Blog](https://cloud.google.com/blog/products/management-tools/practical-guide-to-setting-slos)
> - [より意味のある監視を目指して、外形監視の有効活用 - Speaker Deck](https://speakerdeck.com/dogggggo/yoriyi-wei-falsearujian-shi-womu-zhi-site-wai-xing-jian-shi-falseyou-xiao-huo-yong?slide=19)

<br>

### SLI の例

#### ▼ メトリクスの例 (Google)

クリティカルユーザージャーニーの満足度に影響を与えるメトリクス (リクエストとレスポンスの可用性/遅延/品質、データ処理のカバレッジ/正確性/鮮度/スループット、ストレージのスループット/遅延など) を SLI とするとよい。

> - [\[レポート\] SRE の基本と組織への導入 〜サービスレベル目標やエラー予算などサービスの信頼性に対する考え方〜 #GoogleCloudDay \| DevelopersIO](https://dev.classmethod.jp/articles/202105-report-gcd21-d3-infra-01/)
> - https://medium.com/google-cloud-jp/sre-slo-d7c6aee1fb0e

#### ▼ メトリクスの例 (Microsoft)

MTtx メトリクスを SLI とし、そのダッシュボードを作成するとよい。

その他、可用性や QoS：Quality of Service に関するメトリクスを SLI に選択するとよい。

具体的には、可用性は稼働時間を基に定量化できる。

> - https://www.amazon.co.jp/dp/4873119618
> - [AWSの高可用性と耐障害性をまとめてみる #AWS - Qiita](https://qiita.com/hz1_d/items/ca24e1d131bf475e23b1)
> - [High Availability vs. Fault Tolerance](https://www.linkedin.com/pulse/high-availability-vs-fault-tolerance-jon-bonso)

#### ▼ RED メトリクス

RED メトリクスを SLI として使用する。

> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/#common-observability-strategies

<br>

## 02. SLO：Service Level Objective (サービスレベル目標)

### SLO とは

SLA に基づく指標の目標値のこと。

ユーザーの視点で策定する必要があるが、ブラウザやユーザー起因の問題を加味したメトリクスを使用することは大変なため、基本的には自身のシステムのみを対象としたメトリクスを使用することが多い。

SLO は一定期間での `99.9`%の成功率を目標とすることが多い。

その一方で、SLO 達成の業務のせいで機能変更業務が全くできず、リリースを完全に止めざるを得ない場合がある。

これは SLO が厳しすぎる状況であるため、下方修正してもよい。

SLO だけがユーザーの満足度を決めるわけではなく、新機能のリリースがユーザーの満足度を高めることがあるため、問題ない。

また、サイトの一部の機能が社内部署向け (例：マーケティング部) の場合は、社内向けの SLO となる。

![slo_user-happiness](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/slo_user-happiness.png)

> - [Shrinking the impact of production incidents using SRE principles—CRE Life Lessons \| Google Cloud Blog](https://cloud.google.com/blog/products/devops-sre/shrinking-the-impact-of-production-incidents-using-sre-principles-cre-life-lessons?hl=en)

<br>

### エラーバジェット

#### ▼ エラーバジェットとは

年月当たりで SLO 違反 (エラー、ダウンタイムなど) の累計許容割合こと。

エラーやダウンタイムの発生によって、システムの信頼性に影響を与える可能性があった場合、その累計をエラーバジェットとする。

年月当たりでエラーバジェットが許容範囲内であれば、技術を優先する。

ビジネスより技術を優先する場合に素早く意思決定できる。

```mathematica
(エラーバジェット) < 100% - SLO%
```

**例**

稼働時間を SLI とし、1 ヶ月間 (`720` 時間) の稼働時間の SLO を `99`%とした場合、エラーバジェットは `1`% (`7.2` 時間) になる。

累計 `7.2` 時間の SLO 違反は許容できる。

> - [SRE への第一歩 PagerDuty × DataDog を使用した品質管理 - Speaker Deck](https://speakerdeck.com/yukaneko/sre-hefalsedi-bu-pagerduty-x-datadog-woshi-yong-sitapin-zhi-guan-li?slide=6)

#### ▼ バーンレート

エラーバジェットの消費速度を表すメトリクスのこと。

バーンレートを使用すれば、エラーバジェットの消費速度をエラーイベントとして通知できる。

バーンレートはどんなに大きくても、`1` ヶ月分の SLO を `1` ヶ月で消費する大きさ出なければならない。

もし、バーンレートが `2` 倍の大きさになれば、半月で SLO を消費してしまうことになる。

![burn-rate](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/burn-rate.png)

> - [Google SRE - Prometheus Alerting: Turn SLOs into Alerts](https://sre.google/workbook/alerting-on-slos/)
> - [お客さま影響に基づく実践的なアラート方法 \| メルカリエンジニアリング](https://engineering.mercari.com/blog/entry/20211215-practical_alerting_methods_based_on_customer_impact/)

<br>

### SLO の決め方

#### ▼ 前提

SLA (顧客との合意) に基づいて、SLO を決める。

KPI (組織内での合意) に基づいた性能目標値とは区別したい。

#### ▼ 目標値の例 (自社プロダクト)

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>100%</th>
      <th>目標値</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>計画停止</td>
      <td></td>
      <td>計画停止は、<code>1</code> ヶ月当たり <code>1</code> 回まで、<code>1</code> 回当たり <code>3</code> 時間まで、とする。</td>
    </tr>
    <tr>
      <td>サーバー稼働率</td>
      <td>サーバーが <code>24</code> 時間稼働する。</td>
      <td><code>0.01</code>% (<code>0.24</code> 時間) 以内の時間にダウンタイムを抑えること。</td>
    </tr>
    <tr>
      <td>レスポンス速度</td>
      <td>全リクエストの平均レスポンス速度が <code>3000</code>ms (<code>3</code> 秒) である。</td>
      <td>リクエストの <code>50</code>%が <code>3000</code>ms より早くレスポンスできること。</td>
    </tr>
    <tr>
      <td>秒当たりの平均トランザクション数</td>
      <td></td>
      <td>登録 (<code>100</code>TPS) 、参照 (<code>100</code>TPS) 、変更 (<code>100</code>TPS) 、削除 (<code>100</code>TPS) とする。</td>
    </tr>
    <tr>
      <td>障害対応</td>
      <td></td>
      <td>検知時間 (<code>10</code> 分以内) 、ビジネス側への発生報告 (<code>20</code> 分以内) 、障害一次対処 ( <code>1</code> 時間以内) とする。</td>
    </tr>
    <tr>
      <td>RPO</td>
      <td></td>
      <td><code>2</code> 時間前以内とする。</td>
    </tr>
    <tr>
      <td>RTO</td>
      <td></td>
      <td><code>2</code> 時間以内とする。</td>
    </tr>
    <tr>
      <td>バックアップ保管期間</td>
      <td></td>
      <td><code>12</code> ヶ月とする。</td>
    </tr>
    <tr>
      <td>復元時点</td>
      <td></td>
      <td><code>1</code> 日前までとする。</td>
    </tr>
    <tr>
      <td>ログ保管期間</td>
      <td></td>
      <td><code>3</code> ヶ月とする。</td>
    </tr>
    <tr>
      <td>パケットのアプリケーションデータの暗号化強度</td>
      <td></td>
      <td>SSL/TLS による暗号化とする。</td>
    </tr>
    <tr>
      <td>問い合わせ</td>
      <td></td>
      <td>国の定める祝日を除く月から金までの <code>9:00 ~ 17:00</code> とする。</td>
    </tr>
  </tbody>
</table>

#### ▼ 目標値の例 (Datadog)

SLO を期間のパーセントで定めることにより、状況によらず、一定の基準を設けることができる。

目標値は、予測値を使用するとよい。

Datadog では、平常時のメトリクスのデータから予測値を算出してくれる。

<table>
  <thead>
    <tr>
      <th>指標</th>
      <th>100%</th>
      <th>目標値</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>サーバー稼働率</td>
      <td>サーバーが <code>24</code> 時間稼働する。</td>
      <td><code>0.01</code>% (<code>0.24</code> 時間) 以内の時間にダウンタイムを抑えること。</td>
    </tr>
    <tr>
      <td>DB 稼働率</td>
      <td>DB が <code>24</code> 時間稼働する。</td>
      <td><code>0.01</code>% (<code>0.24</code> 時間) 以内の時間にダウンタイムを抑えること。</td>
    </tr>
    <tr>
      <td>レスポンス速度</td>
      <td>全リクエストの平均レスポンス速度が <code>300</code>ms である。</td>
      <td>リクエストの <code>50</code>%が <code>300</code>ms より早くレスポンスできること。</td>
    </tr>
    <tr>
      <td>レスポンスのステータスコード率</td>
      <td><code>24</code> 時間当たりの全リクエストが <code>200</code> ステータスである</td>
      <td><code>50</code>% 以上のリクエストが <code>200</code> ステータスになること。</td>
    </tr>
    <tr>
      <td>スループット</td>
      <td><code>24</code> 時間で、スループットが <code>50</code> 件/秒</td>
      <td><code>24</code> 時間で、<code>0.1</code>% 以下の時間にスループット低下を抑えること。</td>
    </tr>
  </tbody>
</table>

> - https://docs.datadoghq.com/monitors/create/types/forecasts/?tabs=linear

#### ▼ 目標値の例 (Google)

> - [優れた SLO を策定するには : CRE が現場で学んだこと \| Google Cloud 公式ブログ](https://cloud.google.com/blog/ja/products/gcp/building-good-slos-cre-life-lessons)

<br>

### SLO の事後評価

#### ▼ 評価方法の例 (Circonus)

SLO を達成したか否かを判断する場合、ヒストグラムが有効である。

以下の図では、横軸に各リクエストのレイテンシー (ミリ秒) と縦軸にリクエスト数 (個) を表している。

また、分位ボックス (`q(n)`) により全データのうち何パーセントの集合かを表す。例えば、`q(0.99)` は、`99%` が 5`ms` 未満であることを示す。

LT (ロングテール) の先にある見えない最大値は `120`ms である。

単なる最小値/最大値/中央値/平均値であると表面的な結果しか得られない。

しかし、このようなヒストグラムを使用すれば、各リクエストがどの程度のレイテンシー (≒レスポンスタイム) に、どのくらい分布しているかを正確に把握できる。

例えば、SLO を『`5`ms 未満のレイテンシー (≒レスポンスタイム) 』に設定したとして、ヒストグラムから `99.4597`%がこれを満たしていると結論付けられる。

![slo_histogram](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/slo_histogram.png)

<br>

## 03. SLA：Service Level Agreement (サービスレベル合意)

### SLA とは

インターネットサービスに最低限のサービスのレベルを保証し、これを下回った場合には返金する、といった契約のこと。

SLA として、例えば以下がある。

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>説明</th>
      <th>レベル例</th>
      <th>返金率</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>サーバー稼働率</td>
      <td>サーバーの時間当たりの稼働率</td>
      <td><code>99.9</code>%以上</td>
      <td><code>10</code>%</td>
    </tr>
    <tr>
      <td>障害回復時間</td>
      <td>障害が起こってから回復するまでの時間</td>
      <td><code>2</code> 時間以内</td>
      <td><code>10</code>%</td>
    </tr>
    <tr>
      <td>障害お問い合わせ</td>
      <td>障害発生時のお問い合わせ可能時間帯</td>
      <td><code>24</code> 時間 <code>365</code> 日</td>
      <td><code>10</code>%</td>
    </tr>
  </tbody>
</table>

<br>

### SLA の決め方

#### ▼ 前提

KPI (組織内の合意) とは区別したい

#### ▼ SLA 導入前準備の例 (経産省)

経産省が SLA のガイドラインを策定している。

> - https://www.meti.go.jp/policy/netsecurity/secdoc/contents/downloadfils/080121saasgl.pdf#page=27

#### ▼ 返金率の例 (AWS)

AWS ではサービスレベルの項目として、サーバー稼働率を採用している。

これに対して、ほとんどの AWS リソースで、以下の SLA が設定されている。

各リソースに SLA が定義されている。

> - [AWS サービスレベルアグリーメント](https://aws.amazon.com/jp/legal/service-level-agreements/)

**＊例＊**

Amazon EC2、AWS EBS、Amazon ECS、Amazon EKS の例を示す。

<table>
  <thead>
    <tr>
      <th>毎月の稼働率</th>
      <th>発生したダウンタイム</th>
      <th>返金率</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>99.0</code>%以上、<code>99.99</code>%未満</td>
      <td><code>87.6</code>～<code>0.876</code> 時間</td>
      <td><code>10</code>%</td>
    </tr>
    <tr>
      <td><code>95.0</code>%以上、<code>99.0</code>%未満</td>
      <td><code>438</code>～<code>87.6</code> 時間</td>
      <td><code>30</code>%</td>
    </tr>
    <tr>
      <td><code>95.0</code>%未満</td>
      <td><code>438</code> 時間以上</td>
      <td><code>100</code>%</td>
    </tr>
  </tbody>
</table>

#### ▼ 対応開始時間の例 (PureCloud)

記入中...

> - https://jp-help.mypurecloud.com/articles/service-level-agreements/

#### ▼ 保証期間の例 (Google)

SLA は、サイト提供会社と利用者の合意で決める目標値である。

違反の規約が無ければ、SLA でなく SLO である。

SLA の補償期間は一日単位で設定するとよい。

SLA 違反の場合には、返金を補償とする場合があるが、これ以外の補償方法でもよい。

> - https://www.amazon.co.jp/dp/4873119618

<br>
