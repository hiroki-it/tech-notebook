# Googleアナリティクス

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### グローバルサイトタグ

#### ・グローバルサイトタグとは

WebWebページのローディング時に，非同期通信を用いてGoogleのCollection-APIにメトリクスを送信する．送信されたデータは，Googleアナリティクスコンソールから確認できる．

参考：

- https://developers.google.com/analytics/devguides/collection/gtagjs
- https://developers.google.com/analytics/devguides/collection/protocol/v1/reference

#### ・グローバルサイトタグの組み込み

Googleアナリティクスでメトリクスを収集するためには，アプリケーションの```head```タグに，トラッキングコードが設定されたグローバルサイトタグを組み込む必要がある

参考：https://wacul-ai.com/blog/access-analysis/google-analytics-method/what-is-tracking-code/

```html
<head>

  <!-- 中略 -->
  
  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-*****"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-*****');
  </script>

  <!-- 中略 -->
  
</head>
```

<br>

### 動作確認方法

#### ・ブラウザのdeveloperツール

ブラウザのdeveloperツールで，グローバルサイトタグが非同期通信を実行しているかを確認する．Chromeであれば，networkタブにて，『```www.google-analytics.com/collect```』に対するリクエストを探す．これが200系ステータスになっていれば，正しく動作していると見なせる．

参考：https://developers.google.com/analytics/devguides/collection/protocol/v1/reference#endpoint

```http
POST https://www.google-analytics.com/g/collect
```

<br>

## 02. Googleアナリティクス用語

### 計測値

| 指標名             | 説明                                                         |
| ------------------ | ------------------------------------------------------------ |
| セッション数       | ユーザーがWebサイトに訪問してから離脱するまでを１セッションとした時に，この数のこと．<br>参考：https://support.google.com/analytics/answer/9191807?hl=ja&ref_topic=11151952 |
| 直帰数             | ユーザーがWebサイトに訪問した後に，Webページのどの部分もクリックせずに離脱した場合に，このセッション数のこと．<br>参考：https://support.google.com/analytics/answer/1009409?hl=ja |
| 新規ユーザー数     | 新しく訪問したユーザー数のこと．リクエストのIPアドレスやユーザエージェントの組み合わせに基づいて，新規ユーザーか否かを判定する．セッションの違いに影響されない．<br>参考：https://www.mitsue.co.jp/case/glossary/l_009.html |
| ページビュー数     | Webページの閲覧数のこと．リロードしても```+1```される．<br>参考：<br>・https://support.google.com/analytics/answer/6086080?hl=ja<br>・http://www.designcross.net/google-analytics/pageviews.html |
| 離脱数             | セッションの最後で発生したイベント数のこと．<br>参考：https://support.google.com/analytics/answer/11080047?hl=ja# |
| ランディングページ | ユーザーが最初に訪問したWebページのこと．<br>参考：https://support.google.com/google-ads/answer/14086?hl=ja |
| コンバージョン     | セッションの間で何らかの目標が達成されること．目標達成に至ったセッション数はコンバージョン数というこれを計測するためには，Googleアナリティクスの画面で達成条件の設定が必要である．<br/>参考：<br>・https://support.google.com/analytics/topic/1007030?hl=ja&ref_topic=1631741<br>・https://www.sakurasaku-labo.jp/blogs/analytics-glossary#%E3%82%B3%E3%83%B3%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3 |
| 参照URL            | ユーザーが最初のページに訪問する前に滞在していたURLのこと．  |

<br>

### 計測率

| 指標名                      | 説明                                                         |
| --------------------------- | ------------------------------------------------------------ |
| 直帰率                      | 全セッションのうちで，直帰に至ったセッション数が占める割合のこと．（```直帰数/セッション数```』）<br>参考：https://support.google.com/analytics/answer/1009409?hl=ja |
| コンバージョン率            | 全てのセッション数のうちで，コンバージョンに至ったセッション数の割合のこと．（```コンバージョン数/全てのセッション数```） |
| 離脱率                      | １ページビュー当たりの離脱数のこと．（```離脱数/ページビュー数```）<br>参考：https://support.google.com/analytics/answer/11080047?hl=ja |
| ページ/セッション（回遊率） | １セッション当たりのページビュー数のこと．<br>参考：https://pro-atmedia.jp/media/page-views-per-visit/#toc2 |

<br>

## 03. 調査（UA版にて）

### ```X```当たりの```Y```

```X```を指定するために，Googleアナリティクスに進む．その後，```Y```を指定するために，セカンドディメンションを設定する．

- Webページ当たりであれば，『全てのWebページ』の項目に進む．その後，セカンドディメンションにデバイスタイプを設定する．これにより，Webページ当たりのデバイスタイプを確認できる．
- ランディングページ当たりであれば，『ランディングページ』の項目に進む．その後，セカンドディメンションにデバイスタイプを設定する．これにより，ランディングページ当たりのデバイスタイプを確認できる．

<br>

### ランディングページ当たりのセッション数

Googleアナリティクスでは，一つのドメイン当たりのセッション数が計測される．そのため，一つのドメインが複数のアプリケーションからなる場合は，これらのセッション数が合算されてしまっている．アプリケーション当たりのセッション数は，以下の手順で推定する．ただし，対象のアプリケーションに訪問したことがわかるコンバージョンを設定しておく必要がある．

（１）以下のURLにて，ランディングページ当たりのセッションの割合データを確認する．

参考：https://analytics.google.com/analytics/web/?authuser=1#/report/content-landing-pages

（２）ランディングページの割合データの合計値をアプリケーションのものと見なし，対象のアプリケーション以外に関するURLをフィルタリングする．これにより，対象以外のセッション数の割合がわかる．例えば，対象が```/foo```を持ち，対象以外が```/bar```と```/baz```のURLを持つとする．この時，```/bar```と```/baz```のみがフィルタリングされるように条件を設定する．

（３）『```100 - 対象以外のセッション数の割合(%)```』とすることで，対象をランディングページとするセッション数の割合を導く．例えば，対象以外のセッション数の割合が```40```%であれば，対象は```60%```である．

（４）コンバージョン数（目標の完了数）を確認する．コンバージョン数は目標に至ったセッション数を表すため，これにより，対象以外から対象に訪問した時のセッション数と割合がわかる．

（５）『```対象をランディングページとするセッション数の割合 + コンバージョン数の割合```』とすることで，対象以外からの訪問も含めた，対象の全セッション数を導ける．例えば，対象をランディングページとするセッション数の割合が```60```%であり，コンバージョン数の割合が```5```%であれば，対象以外からの訪問も含めて，全セッションのうちで```65```%（```60 + 5```）が対象のセッション数に相当するとわかる．

<br>

### 値が非表示になる原因

#### ・not set

- 検索エンジン以外からの訪問
- バナー広告からの訪問
- リダイレクトによる訪問
