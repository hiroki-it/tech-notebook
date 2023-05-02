---
title: 【IT技術の知見】Googleサーチコンソール＠テレメトリー収集ツール
description: Googleサーチコンソール＠テレメトリー収集ツールの知見を記録しています。
---

# Googleサーチコンソール＠テレメトリー収集ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Googleサーチコンソール用語

### クローラー

#### ▼ クローラーとは

インターネット上を巡回し、サイトの情報を収集する。

検索エンジンシステムは、収集されたデータのインデックスをDBに作成する。

ユーザーが検索エンジンを使用する時は、このDBインデックスを基に検索結果が表示される。

> ↪️：https://smakoma.com/understand-search-engine.html

#### ▼ クローラーの種類

クローラーには以下の種類がいる。

| クローラー名 | 検索エンジン |
| :----------- | :----------- |
| Googlebot    | Google       |
| Bingbot      | Bing検索     |
| YandexBot    | YANDEX       |
| Baiduspider  | Baidu        |
| Mail.RU_Bot  | Mail.ru      |

> ↪️：https://technical-seo.jp/crawler/

**例**

例えば、Googlebotであれば、ユーザーエージェントは以下の様になっている。

PCの場合は、以下となる。

```yaml
GET https://example.com

Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)
```

SPの場合は、以下となる。

```yaml
GET https://example.com

Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.92 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)
```

#### ▼ 巡回方法

- サイト外部のリンクから、サイトに訪問してくる。
- 検索エンジンにリクエストを送信し、サイトに訪問してくる。
- Googleサーチコンソールに登録された`sitemap.xml`ファイルを基に、サイトに訪問してくる。

> ↪️：https://www.allegro-inc.com/seo/xml-sitemap/

<br>

### サイトマップ

#### ▼ サイトマップとは

サイトを構成するURLの一覧を示したファイルのこと。

Googleサーチコンソールに登録でき、検索クローラーがサイトの情報を収集するのを助ける。

> ↪️：https://www.allegro-inc.com/seo/xml-sitemap/

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

Webサイトの全ページのうち、どのくらいが検索エンジンのDBインデックスの登録されたかを表す指標のこと。

> ↪️：https://www.sakurasaku-labo.jp/blogs/index-coverage-report

#### ▼ ステータスの種類

各ステータスごとに、DBインデックスに登録されたかどうかが異なる。

| ステータス名 | DBインデックスへの登録の有無 |
| ------------ | ---------------------------- |
| 有効         | 登録された                   |
| 警告         | 登録された                   |
| エラー       | 登録されなかった             |
| 除外         | 登録されなかった             |

> ↪️：https://support.google.com/webmasters/answer/7440203#status_type

<br>

### 構造化データ

#### ▼ 構造化データとは

記入中...

<br>
