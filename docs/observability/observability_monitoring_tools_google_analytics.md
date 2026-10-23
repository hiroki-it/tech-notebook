---
title: 【IT技術の知見】Googleアナリティクス＠監視ツール
description: Googleアナリティクス＠監視ツールの知見を記録しています。
---

# Google アナリティクス＠監視ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. セットアップ

### グローバルサイトタグ

#### ▼ グローバルサイトタグとは

Web ページのローディング時に、非同期通信を使用して Google の Collection-API にメトリクスを送信する。送信されたデータは、Google アナリティクスコンソールから確認できる。

> - https://developers.google.com/analytics/devguides/collection/gtagjs
> - https://developers.google.com/analytics/devguides/collection/protocol/v1/reference

#### ▼ グローバルサイトタグの組み込み

Google アナリティクスで、メトリクスの元になるデータポイントを収集するためには、アプリケーションの `head` タグに、トラッキングコードが設定されたグローバルサイトタグを組み込む必要がある。

```html
<head>
  <!-- ～ 中略 ～ -->

  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script
    async
    src="https://www.googletagmanager.com/gtag/js?id=G-*****"
  ></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", "G-*****");
  </script>

  <!-- ～ 中略 ～ -->
</head>
```

> - [Googleアナリティクスのトラッキングコードとは？確認・発行・設置方法まで徹底解説！ - アクセス解析ツール「AIアナリスト」ブログ](https://wacul-ai.com/blog/access-analysis/google-analytics-method/what-is-tracking-code/)

<br>

### 動作確認方法

#### ▼ ブラウザの developer ツール

ブラウザの developer ツールで、グローバルサイトタグが非同期通信しているかどうかを確認する。

Chrome であれば、network タブにて、`www.google-analytics.com/collect` に対するリクエストを探す。

これが `200` 系ステータスになっていれば、正しく動作していると見なせる。

```yaml
POST https://www.google-analytics.com/g/collect
```

> - https://developers.google.com/analytics/devguides/collection/protocol/v1/reference#endpoint

<br>

## 02. Google アナリティクス用語

### 計測値

<table>
  <thead>
    <tr>
      <th>指標名</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>セッション数</td>
      <td>ユーザーが Web サイトに訪問してから離脱するまでを 1 セッションとしたときに、この数のこと。<br><a href="https://support.google.com/analytics/answer/9191807?hl=ja&amp;ref_topic=11151952">https://support.google.com/analytics/answer/9191807?hl=ja&amp;ref_topic=11151952</a></td>
    </tr>
    <tr>
      <td>直帰数</td>
      <td>ユーザーが Web サイトに訪問した後に、Web ページのどの部分もクリックせずに離脱した場合、このセッション数のこと。<br><a href="https://support.google.com/analytics/answer/1009409?hl=ja">https://support.google.com/analytics/answer/1009409?hl=ja</a></td>
    </tr>
    <tr>
      <td>新規ユーザー数</td>
      <td>新しく訪問したユーザー数のこと。リクエストの IP アドレスやユーザエージェントの組み合わせを基に、新規ユーザーか否かを判定する。セッションの違いに影響されない。<br><a href="https://www.mitsue.co.jp/case/glossary/l_009.html">https://www.mitsue.co.jp/case/glossary/l_009.html</a></td>
    </tr>
    <tr>
      <td>ページビュー数</td>
      <td>Web ページの閲覧数のこと。リロードしても <code>+1</code> される。<br>・<a href="https://support.google.com/analytics/answer/6086080?hl=ja">https://support.google.com/analytics/answer/6086080?hl=ja</a> <br>・<a href="http://www.designcross.net/google-analytics/pageviews.html">http://www.designcross.net/google-analytics/pageviews.html</a></td>
    </tr>
    <tr>
      <td>離脱数</td>
      <td>セッションの最後で発生したイベント数のこと。<br><a href="https://support.google.com/analytics/answer/11080047?hl=ja#">https://support.google.com/analytics/answer/11080047?hl=ja#</a></td>
    </tr>
    <tr>
      <td>ランディングページ</td>
      <td>ユーザーが最初に訪問した Web ページのこと。<br><a href="https://support.google.com/google-ads/answer/14086?hl=ja">https://support.google.com/google-ads/answer/14086?hl=ja</a></td>
    </tr>
    <tr>
      <td>コンバージョン</td>
      <td>セッションの間で、ユーザーが目標達成条件を満たす行動を行ったこと。目標達成に至ったセッション数はコンバージョン数という。これを計測するためには、Google アナリティクスの画面で達成条件の設定が必要である。<br>・<a href="https://support.google.com/analytics/topic/1007030?hl=ja&amp;ref_topic=1631741">https://support.google.com/analytics/topic/1007030?hl=ja&amp;ref_topic=1631741</a><br>・<a href="https://www.sakurasaku-labo.jp/blogs/analytics-glossary#%E3%82%B3%E3%83%B3%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3">https://www.sakurasaku-labo.jp/blogs/analytics-glossary#コンバージョン</a> <br>補足として、『単なる消費者から顧客に転換する』ことから、コンバージョンという単語が使われている。<br><a href="https://e-words.jp/w/%E3%82%B3%E3%83%B3%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3.html">https://e-words.jp/w/コンバージョン.html</a></td>
    </tr>
    <tr>
      <td>参照 URL</td>
      <td>ユーザーが最初のページに訪問する前に滞在していた URL のこと。</td>
    </tr>
    <tr>
      <td>内部リンク</td>
      <td>同じ Web サイト内のほかのページにジャンプするための URL のこと。</td>
    </tr>
  </tbody>
</table>

<br>

### 計測率

<table>
  <thead>
    <tr>
      <th>指標名</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>直帰率</td>
      <td>全セッションのうちで、直帰に至ったセッション数が占める割合のこと (<code>直帰数/セッション数</code>』) 。<br><a href="https://support.google.com/analytics/answer/1009409?hl=ja">https://support.google.com/analytics/answer/1009409?hl=ja</a></td>
    </tr>
    <tr>
      <td>コンバージョン率</td>
      <td>すべてのセッション数のうちで、コンバージョンに至ったセッション数の割合のこと (<code>コンバージョン数/全てのセッション数</code>) 。</td>
    </tr>
    <tr>
      <td>離脱率</td>
      <td>1 ページビュー当たりの離脱数のこと (<code>離脱数/ページビュー数</code>) 。<br><a href="https://support.google.com/analytics/answer/11080047?hl=ja">https://support.google.com/analytics/answer/11080047?hl=ja</a></td>
    </tr>
    <tr>
      <td>ページ/セッション (回遊率)</td>
      <td>1 セッション当たりのページビュー数のこと。<br><a href="https://pro-atmedia.jp/media/page-views-per-visit/#toc2">https://pro-atmedia.jp/media/page-views-per-visit/#toc2</a></td>
    </tr>
  </tbody>
</table>

<br>

## 03. 調査 (UA 版にて)

### `X` 当たりの `Y`

Google アナリティクスに `X` を指定するために、コンソールの項目 (ファーストディメンション) に進む。

その後、`Y` を指定するために、セカンドディメンションを設定する。

- Web ページ当たりであれば、『すべての Web ページ』の項目に進む。その後、セカンドディメンションにデバイスタイプを設定する。これにより、Web ページ当たりのデバイスタイプを確認できる。
- ランディングページ当たりであれば、『ランディングページ』の項目に進む。その後、セカンドディメンションにデバイスタイプを設定する。これにより、ランディングページ当たりのデバイスタイプを確認できる。

<br>

### ランディングページ当たりのセッション数

Google アナリティクスでは、1 つのドメイン当たりのセッション数が計測される。

そのため、1 つのドメインが複数のアプリケーションからなる場合は、これらのセッション数が合算されてしまっている。

アプリケーション当たりのセッション数は、以下の手順で推定する。

ただし、対象のアプリケーションに訪問したことがわかるコンバージョンを設定しておく必要がある。

`(1)`

: [こちら](https://analytics.google.com/analytics/web/?authuser=1#/report/content-landing-pages)にて、ランディングページ当たりのセッションの割合データを確認する。

`(2)`

: ランディングページの割合データの合計値をアプリケーションのものと見なし、対象のアプリケーション以外に関する URL をフィルタリングする。これにより、対象以外のセッション数の割合がわかる。例えば、対象が `/foo` を持ち、対象以外が `/bar` と `/baz` の URL を持つとする。このとき、`/bar` と `/baz` のみがフィルタリングされるように条件を設定する。

`(3)`

: 『`100 - 対象以外のセッション数の割合 (%) `』とすることにより、対象をランディングページとするセッション数の割合を導く。例えば、対象以外のセッション数の割合が `40`%であれば、対象は `60%` である。

`(4)`

: コンバージョン数 (目標の完了数) を確認する。コンバージョン数は目標に至ったセッション数を表すため、これにより、対象以外から対象に訪問したときのセッション数と割合がわかる。

`(5)`

: 『`対象をランディングページとするセッション数の割合 + コンバージョン数の割合`』とすることにより、対象以外からの訪問も含めた対象の全セッション数を導ける。

例えば、対象をランディングページとするセッション数の割合が `60`%であり、コンバージョン数の割合が `5`%であれば、全セッションのうち `65`% (`60 + 5`) が対象のセッション数に相当するとわかる。

<br>

### 増加率

![increase-rate](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/increase-rate.png)

増加率は、増加量が基準量全体の何倍 (何割分) であるかで表す。

そのため、以下で算出できる。

```mathematica
(増加量) = (ある量) - (基準量)

(増加率) = (増加量) ÷ (基準量) × 100
```

> - https://kj01.kgu.mydns.jp/fujimoto/inen/kaisetu_zoka.html

<br>

### 値が非表示になる原因

#### ▼ not set

- 検索エンジン以外からの訪問
- バナー広告からの訪問
- リダイレクトによる訪問
