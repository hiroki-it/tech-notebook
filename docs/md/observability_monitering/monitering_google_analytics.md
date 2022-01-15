# Googleアナリティクス

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. セットアップ

### グローバルサイトタグ

#### ・グローバルサイトタグとは

Webページのローディング時に、非同期通信を用いてGoogleのCollection-APIにメトリクスを送信する。送信されたデータは、Googleアナリティクスコンソールから確認できる。

参考：

- https://developers.google.com/analytics/devguides/collection/gtagjs
- https://developers.google.com/analytics/devguides/collection/protocol/v1/reference

#### ・グローバルサイトタグの組み込み

Googleアナリティクスでメトリクスを収集するためには、アプリケーションの```head```タグに、トラッキングコードが設定されたグローバルサイトタグを組み込む必要がある

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

ブラウザのdeveloperツールで、グローバルサイトタグが非同期通信を実行しているかを確認する。Chromeであれば、networkタブにて、『```www.google-analytics.com/collect```』に対するリクエストを探す。これが200系ステータスになっていれば、正しく動作していると見なせる。

参考：https://developers.google.com/analytics/devguides/collection/protocol/v1/reference#endpoint

```http
POST https://www.google-analytics.com/g/collect
```

<br>

## 02. アカウント

<br>

## 03. プロパティ

<br>

## 04. ビュー

