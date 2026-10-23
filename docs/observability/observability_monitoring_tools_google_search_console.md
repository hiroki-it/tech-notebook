---
title: 【IT技術の知見】Googleサーチコンソール＠監視ツール
description: Googleサーチコンソール＠監視ツールの知見を記録しています。
---

# Google サーチコンソール＠監視ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Google サーチコンソール用語

### クローラー

#### ▼ クローラーとは

インターネット上を巡回し、サイトの情報を収集する。

検索エンジンシステムは、収集したデータのインデックスを DB に作成する。

ユーザーが検索エンジンを使用するときは、この DB インデックスを基に検索結果が表示される。

> - [検索エンジンの仕組みを理解する。クローラー、インデックス、アルゴリズムとは？ \| スマコマ](https://smakoma.com/understand-search-engine.html)

#### ▼ クローラーの種類

クローラーには以下の種類がいる。

<table>
  <thead>
    <tr>
      <th style="text-align:left">クローラーの種類</th>
      <th style="text-align:left">検索エンジン</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left">Googlebot</td>
      <td style="text-align:left">Google</td>
    </tr>
    <tr>
      <td style="text-align:left">Bingbot</td>
      <td style="text-align:left">Bing 検索</td>
    </tr>
    <tr>
      <td style="text-align:left">YandexBot</td>
      <td style="text-align:left">YANDEX</td>
    </tr>
    <tr>
      <td style="text-align:left">Baiduspider</td>
      <td style="text-align:left">Baidu</td>
    </tr>
    <tr>
      <td style="text-align:left">Mail.RU_Bot</td>
      <td style="text-align:left"><a href="http://Mail.ru">Mail.ru</a></td>
    </tr>
  </tbody>
</table>

> - [クローラーとは？意味や種類、巡回の仕組みについて解説 \| テクニカルSEO BLOG](https://technical-seo.jp/crawler/)

**例**

例えば、Googlebot であれば、ユーザーエージェントは以下のようになっている。

PC の場合は、以下となる。

```yaml
GET https://example.com

Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)
```

SP の場合は、以下となる。

```yaml
GET https://example.com

Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.92 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)
```

#### ▼ 巡回方法

- サイト外部のリンクから、サイトに訪問してくる。
- 検索エンジンにリクエストを送信し、サイトに訪問してくる。
- Google サーチコンソールに登録された `sitemap.xml` ファイルを基に、サイトに訪問してくる。

> - [XMLサイトマップの作り方・更新・分割運用までを押さえる実践ガイド - アレグロマーケティング](https://www.allegro-inc.com/seo/xml-sitemap/)

<br>

### サイトマップ

#### ▼ サイトマップとは

サイトを構成する URL の一覧を示したファイルのこと。

Google サーチコンソールに登録でき、検索クローラーがサイトの情報を収集するのを助ける。

> - [XMLサイトマップの作り方・更新・分割運用までを押さえる実践ガイド - アレグロマーケティング](https://www.allegro-inc.com/seo/xml-sitemap/)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
         <!-- サイトを構成するURL -->
         <loc>https://example.com/index.html</loc>
         <!-- 最終更新日 -->
         <lastmod>2022-01-0</lastmod>
         <!-- 更新頻度 -->
         <changefreq>daily</changefreq>
    </url>
    <url>
         <loc>https://example.com/foo.html</loc>
         <lastmod>2022-01-01</lastmod>
         <changefreq>daily</changefreq>
    </url>
    <url>
         <loc>https://example.com/bar.html</loc>
         <lastmod>2022-01-01</lastmod>
         <changefreq>daily</changefreq>
    </url>
</urlset>
```

<br>

### インデックスカバレッジ

#### ▼ インデックスカバレッジとは

Web サイトの全ページのうち、どのくらいが検索エンジンの DB インデックスの登録されたかを表す指標のこと。

> - https://www.sakurasaku-labo.jp/blogs/index-coverage-report

#### ▼ ステータスの種類

各ステータスごとに、DB インデックスに登録されたかどうかが異なる。

<table>
  <thead>
    <tr>
      <th>ステータス名</th>
      <th>DB インデックスへの登録の有無</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>有効</td>
      <td>登録された</td>
    </tr>
    <tr>
      <td>警告</td>
      <td>登録された</td>
    </tr>
    <tr>
      <td>エラー</td>
      <td>登録されなかった</td>
    </tr>
    <tr>
      <td>除外</td>
      <td>登録されなかった</td>
    </tr>
  </tbody>
</table>

> - [Page indexing report - Search Console Help](https://support.google.com/webmasters/answer/7440203#status_type)

<br>

### 構造化データ

#### ▼ 構造化データとは

記入中...

<br>
