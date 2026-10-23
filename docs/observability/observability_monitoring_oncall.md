---
title: 【IT技術の知見】オンコール＠監視
description: オンコール＠監視の知見を記録しています。
---

# オンコール＠監視

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. オンコール

### オンコールとは

アラートが通知されたときに、エラー修正の担当者に連絡できる状態 (メールアドレス、電話番号、SMS など) にあること。

> - [Being On-Call - PagerDuty Incident Response Documentation](https://response.pagerduty.com/oncall/being_oncall/)

<br>

### オンコール対応時間

#### ▼ グローバル企業の場合

グローバル企業の場合、世界各地にオンコールセンターを配置している。

各オンコールセンターには時差があるため、特定の時間に、どこかの国でオンコールセンターが必ず営業している。

アラートのタイミングで営業しているオンコールセンターに通知を送信するため、『24 時間 365 日対応可能』といったサービスを提供できる。

<br>

## 02. アラートの設定

### アラート発火の事前検証

#### ▼ システムの実際値の変更

アラートが発火するように、システムの実際値を調節 (例：負荷を高める) し、アラートが発火するかを検証する。

#### ▼ 閾値の変更

必ずアラートが発火するような閾値 (例：ゼロ) に変更し、アラートが発火するかを検証する。

<br>

### アラートの付加情報

#### ▼ イベントの内容

- タイムスタンプ
- ログステータス
- ログメッセージ

#### ▼ ラベル

- 実行環境名
- リージョン名
- Cluster 名
- Node 名
- Namespace 名
- Pod 名
- マイクロサービス名
- コンテナ名

<br>

## 03. エラーイベント重要度 (severity) レベル

### エラーイベント重要度レベルとは

すべての事象をエラーイベントとして見なしてしまうと、アラート疲れしてしまう。

そのため、どのようなイベントをエラーイベントと見なし、アラートを通知するかどうかを決めておく必要がある。

また、レベルに応じてアラート先のチャンネルを区別するとよい。

<table>
  <thead>
    <tr>
      <th>メトリクスの単位</th>
      <th>エラーイベントと見なす閾値例</th>
      <th>閾値とするメトリクス例</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>パーセント</td>
      <td><code>60</code>%</td>
      <td>CPU 使用率、メモリ使用率など</td>
      <td>平常時は <code>30</code>%である仮定し、エラーイベントと見なす閾値を <code>60</code>%に設定することが多い。</td>
    </tr>
    <tr>
      <td>カウント</td>
      <td><code>1</code>〜<code>3</code> 個</td>
      <td>ログステータス、ステータスコードなど</td>
      <td>どのログステータスやステータスコードをカウントするかを決める必要がある。</td>
    </tr>
    <tr>
      <td>バイト数</td>
      <td>メトリクスによる</td>
      <td>メモリの空きサイズ、ストレージのスワップ領域の使用サイズなど</td>
      <td>メトリクスによって、エラーイベントと見なせるバイト数が異なる。</td>
    </tr>
  </tbody>
</table>

<br>

### カウントする必要があるステータスの判断

#### ▼ ステータスの重要度レベルへの変換

ステータスは、重要度を判断しやすいように、重要度レベルに変換して考える。

該当の重要度レベルに当てはまるステータスのみを、エラーイベントとしてカウントする。

<table>
  <thead>
    <tr>
      <th>重要度レベルの例</th>
      <th>エラーイベントと見なし、アラートを通知するか否かの判断例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>critical</td>
      <td>する</td>
    </tr>
    <tr>
      <td>warning</td>
      <td>しない</td>
    </tr>
    <tr>
      <td>information</td>
      <td>しない</td>
    </tr>
  </tbody>
</table>

#### ▼ ログステータスの場合

エラーイベントと見なすログステータスの目安は以下の通りである。

> - [ログレベルちゃんと使い分けてますか？ - OTOBANK Engineering Blog](https://engineering.otobank.co.jp/entry/2016/09/20/181756)

<table>
  <thead>
    <tr>
      <th>ログステータス</th>
      <th>説明</th>
      <th>重要度レベルへの変換例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>emergency</td>
      <td>システムが使用できない状態にある緊急事態</td>
      <td>critical</td>
    </tr>
    <tr>
      <td>alert</td>
      <td>早急に対応すべき事態</td>
      <td>critical</td>
    </tr>
    <tr>
      <td>critical</td>
      <td>対処すべき重要な問題</td>
      <td>critical</td>
    </tr>
    <tr>
      <td>fatal</td>
      <td>対処すべき重要な問題</td>
      <td>critical</td>
    </tr>
    <tr>
      <td>error</td>
      <td>何かが失敗している</td>
      <td>critical または warning</td>
    </tr>
    <tr>
      <td>warn</td>
      <td>普通ではないことが発生したが、心配する必要はない</td>
      <td>critical または warning</td>
    </tr>
    <tr>
      <td>notice</td>
      <td>いたって普通だが、注意すべきことが起こっている</td>
      <td>information</td>
    </tr>
    <tr>
      <td>info</td>
      <td>知っておくといいかもしれない情報</td>
      <td>information</td>
    </tr>
    <tr>
      <td>debug</td>
      <td>問題が起こっている場所を知るのに有効な情報</td>
      <td>information</td>
    </tr>
  </tbody>
</table>

#### ▼ ステータスコードの場合

エラーイベントと見なすステータスコードの目安は以下の通りである。

各ステータスコードをバラバラに扱うことは大変なため、系ごとにまとめて扱えるように、レベルを割り当てる。

<table>
  <thead>
    <tr>
      <th>ステータスコード</th>
      <th>本番環境のアラートの目安</th>
      <th>重要度レベルへの変換例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>500</code> 系</td>
      <td>する</td>
      <td>critical</td>
    </tr>
    <tr>
      <td><code>400</code> 系</td>
      <td>どちらでも</td>
      <td>warning</td>
    </tr>
    <tr>
      <td><code>300</code> 系</td>
      <td>しない</td>
      <td>information</td>
    </tr>
    <tr>
      <td><code>200</code> 系</td>
      <td>しない</td>
      <td>information</td>
    </tr>
  </tbody>
</table>

<br>
