---
title: 【IT技術の知見】メモリ＠ハードウェア
description: メモリ＠ハードウェアの知見を記録しています。
---

# メモリ＠ハードウェア

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. メインメモリ (主記憶装置)

### DRAM：Dynamic RAM

#### ▼ DRAM とは

メインメモリとして使用される。

データを保管できる揮発的な記憶装置のこと。

![Dynamic RAM](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Dynamic_RAM.jpg)

<br>

### Mask ROM

#### ▼ Mask ROM とは

製造時にデータを書き込み、以降は内容を書き換えられない読み出し専用のメモリのこと。

![p164-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p164-1.png)

> - [キタミ式イラストIT塾 基本情報技術者 令和04年 \| きたみ りゅうじ \|本 \| 通販 \| Amazon](https://www.amazon.co.jp/dp/4297124513)

<br>

### Programmable ROM

#### ▼ Programmable ROM とは

ユーザーが内容を書き換えられる ROM のことで、データの消去方法によって EPROM、EEPROM、フラッシュメモリに分かれる。

![p164-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p164-2.png)

> - [キタミ式イラストIT塾 基本情報技術者 令和04年 \| きたみ りゅうじ \|本 \| 通販 \| Amazon](https://www.amazon.co.jp/dp/4297124513)

<br>

## 02. キャッシュメモリ

### キャッシュとは

データや静的コンテンツ (HTML、JavaScript、CSS、画像) を保管しておき、再利用することで、処理速度を高める仕組みのこと。

<br>

### キャッシュメモリとは

#### ▼ 一次キャッシュメモリと二次キャッシュメモリ

CPU とメインメモリの間に、キャッシュメモリを何段階か配置し、CPU とメインメモリの間の読み出しと書き込みの処理速度の差を緩和させる。

![メモリキャッシュ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/メモリキャッシュ.gif)

実際に、タスクマネージャのパフォーマンスタブで、`n` 次キャッシュメモリがどのくらい使われているのかを確認できる。

![キャッシュメモリの実例](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/キャッシュメモリの実例.png)

<br>

### キャッシュメモリの仕組み

#### ▼ 一度目

ユーザー ➔ メインメモリ ➔ 二次キャッシュメモリ ➔ 一次キャッシュメモリの順で、データがやり取りされる。

`(1)`

: ユーザーが、パソコンに対して命令を与える。

`(2)`

: CPU は、命令をメインメモリに書き込む。

`(3)`

: CPU は、メインメモリから命令を読み出す。

`(4)`

: CPU は、二次キャッシュメモリに書き込む。

`(5)`

: CPU は、一次キャッシュメモリに書き込む。

`(6)`

: CPU は、命令する。

![メモリとキャッシュメモリ_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/メモリとキャッシュメモリ_1.jpg)

#### ▼ 二度目

一次キャッシュメモリ ➔ 二次キャッシュメモリ ➔ メインメモリの順で命令を探すため、一度目よりも速く命令を実行できる。

![メモリとキャッシュメモリ_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/メモリとキャッシュメモリ_2.jpg)

<br>

### キャッシュメモリへの書き込み方式の種類

#### ▼ Write-through 方式

CPU は、命令をメインメモリとキャッシュメモリの両方に書き込む。

常にメインメモリとキャッシュメモリの内容が一致している状態を確保できるが、メモリへの書き込みが頻繁に行われるので遅い。

![Write-through方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Write-through方式.jpg)

#### ▼ Write-back 方式

CPU は、キャッシュメモリのみに書き込む。

次に、キャッシュメモリがメインメモリに書き込む。

メインメモリとキャッシュメモリの内容が一致している状態を必ずしも確保できないが、メインメモリへの書き込み回数が少ないため速い

![Write-back方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Write-back方式.jpg)

<br>

### 実効アクセス時間

キャッシュメモリに目的のデータが存在する確率をヒット率とし、存在せずにメインメモリを読み出しに行く確率を `1 - ヒット率` として、実効アクセス時間を求める。

![p171-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p171-1.png)

> - [キタミ式イラストIT塾 基本情報技術者 令和04年 \| きたみ りゅうじ \|本 \| 通販 \| Amazon](https://www.amazon.co.jp/dp/4297124513)

<br>

### SRAM：Static RAM

#### ▼ SRAM とは

キャッシュメモリとして使用される。

![Static RAM](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Static_RAM.jpg)

<br>

## 02-02. キャッシュの保管場所の種類

### 全体像

キャッシュは、クライアント、CDN、ロードバランサー、API ゲートウェイ、アプリケーション、データベースなど、リクエストの経路上のさまざまな場所に保管できる。

![what_and_where_to_cache](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/what_and_where_to_cache.jpeg)

> - https://twitter.com/pvergadia/status/1633216210308595712/photo/1

<br>

### クライアントサイドキャッシュ

クライアントのブラウザの使用するメモリ上で、レスポンスされた静的コンテンツのキャッシュを作成する。

Chrome の場合は、CacheStorage に保管される。

![client_side_cache](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/client_side_cache.png)

> - [View cache data \| Chrome DevTools \| Chrome for Developers](https://developer.chrome.com/docs/devtools/storage/cache/)

<br>

### サーバーサイドキャッシュ

#### ▼ CDN キャッシュ

CDN のエッジサーバーの使用するメモリ上で、レスポンスされた静的コンテンツのキャッシュを作成する。

#### ▼ API Gateway キャッシュ

API Gateway の使用するメモリ上で、バックエンドからのレスポンスのキャッシュを作成する。

#### ▼ ロードバランサーキャッシュ

ロードバランサーの使用するメモリ上で、レスポンスされたコンテンツのキャッシュを作成する。

#### ▼ Web サーバーキャッシュ

リバースプロキシサーバーの使用するメモリ上で、レスポンスされた静的コンテンツのキャッシュを作成する。

AWS では、Amazon CloudFront におけるキャッシュがこれに相当する。

#### ▼ アプリケーションサーバーキャッシュ

オブジェクトのプロパティの使用するメモリ上で、関数処理結果のキャッシュを作成する。

必要な場合、これを取り出して再利用する。

Laravel のキャッシュ機能については、以下のリンクを参考にせよ。

> - [8.x キャッシュ Laravel](https://readouble.com/laravel/8.x/ja/cache.html)

#### ▼ DB キャッシュ

DB サーバーの使用するメモリ上で、テーブルのデータやインデックスのキャッシュを作成する。

<br>

### キャッシュすべきでないデータ

#### ▼ サーバーサイド側の場合

セキュリティ上などの理由で、サーバー側でキャッシュすべきでないデータがある。

<table>
  <thead>
    <tr>
      <th>データ</th>
      <th>理由</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>フォーム認証ページ</td>
      <td>無関係のユーザーに認証済みの Web ページが返信されてしまう。</td>
    </tr>
    <tr>
      <td>緯度経度/フリーワードに基づく検索結果ページ</td>
      <td>パターン数が多く、キャッシュですべてのページを網羅することが現実的でない。</td>
    </tr>
  </tbody>
</table>

<br>

## 02-03. クライアントサイドキャッシュの仕組み

### クライアントサイドキャッシュ使用/不使用の検証

#### ▼ ETag 値による検証

ブラウザは、Etag 値を使用してキャッシュを実現する。

![EtagとIf-NoneMach](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ETagとIf-None-Match.png)

#### `(1)` キャッシュの有効時間が切れるまで

`(1)`

: クライアントのブラウザは、リクエストをサーバーに送信する。

`(2)`

: サーバーは、特定のアルゴリズムを使用してハッシュ値を作成し、これをコンテンツの ETag 値とする。

`(3)`

: サーバーは、`ETag` ヘッダーに ETag 値を設定し、コンテンツとともにレスポンスをクライアントに送信する。

`(4)`

: クライアントのブラウザは、コンテンツと ETag 値をキャッシュする。

`(5)`

: キャッシュの有効時間が切れるまで、クライアントサイドキャッシュを使用し続ける。

#### `(2)` キャッシュの有効時間が切れた後

`(1)`

: キャッシュの有効時間が切れる。

`(2)`

: クライアントのブラウザは、リクエストをサーバーに送信する。

     この時、If-None-MatchヘッダーにキャッシュしておいたETag値を設定する。

`(3)`

: サーバーは、送信された ETag 値とコンテンツの ETag 値を比較検証する。

#### `(3)` 検証により、クライアントサイドキャッシュを使用

`(1)`

: ETag 値の比較検証の結果、一致する。

`(2)`

: サーバーは、両方の値が一致する場合、`304` ステータスでレスポンスをクライアントに送信する。

`(3)`

: クライアントのブラウザは、キャッシュを使用する。

#### `(4)` 検証により、クライアントサイドキャッシュを使用せず

`(1)`

: ETag 値の比較検証の結果、一致しない。

`(2)`

: サーバーは、両方の値が一致しない場合、ETag 値を作成し、これをコンテンツの新しい ETag 値とする。

`(3)`

: サーバーは、`ETag` ヘッダーに ETag 値を設定し、コンテンツとともにレスポンスをクライアントに送信する。

`(4)`

: クライアントのブラウザは、コンテンツと ETag 値をキャッシュする。

<br>

### クライアントサイドキャッシュ時間の定義

#### ▼ クライアントサイドキャッシュなし

レスポンスヘッダーにて、`Cache-Control` ヘッダーに `no-store` を設定する。

この場合、ETag 値が無効になり、クライアントサイドキャッシュを使用しなくなる。

```yaml
HTTP/1.1 200
---
Cache-Control: no-store
---
# ボディ
ここにサイトのHTMLのコード
```

#### ▼ クライアントサイドキャッシュあり (有効時間あり)

レスポンスヘッダーにて、`Cache-Control` ヘッダーに `max-age=31536000` を設定する。

Expires ヘッダーに有効時間を設定してもよいが、`Cache-Control` ヘッダーの有効時間が優先される。

この場合、有効時間を過ぎると、ETag 値を比較検証するようになる。

```yaml
HTTP/1.1 200
---
Cache-Control: max-age=31536000
---
# ボディ
ここにサイトのHTMLのコード
```

#### ▼ クライアントサイドキャッシュあり (有効時間なし)

レスポンスヘッダーにて、`Cache-Control` ヘッダーに `max-age=0` を設定する。

また、Expires ヘッダーに期限切れの日時を設定する。この場合、毎回のリクエスト時に ETag 値を比較検証するようになる。

```yaml
HTTP/1.1 200
---
Cache-Control: max-age=0
Expires: Sat, 01 Jan 2000 00:00:00 GMT
---
# ボディ
ここにサイトのHTMLのコード
```

<br>

## 03. ディスクメモリ

### ディスクメモリとは

メインメモリとストレージの間に配置される。

読み出しと書き込みの処理速度の差を緩和させる。

![ディスクキャッシュ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ディスクキャッシュ.gif)

<br>

## 04. GPU と VRAM

### GPU

CPU より少ないパラメーターで、より高速に並列処理を実行できる。

画像処理や機械学習処理に適する。

<br>

### VRAM

GPU が画像処理で使用する専用のメモリであり、描画する画像のデータを一時的に保管する。

<br>

### サイズ

GPU と VRAM のサイズによって、扱うことのできる解像度と色数が決まる。

![VRAM](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/VRAM.jpg)

富士通 PC の GPU と VRAM のサイズは、以下の通り。

![本パソコンのVRAMスペック](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/本パソコンのVRAMスペック.jpg)

色数によって、`1` ドット当たりに必要なビット数が異なる。

> - [キタミ式イラストIT塾 基本情報技術者 令和04年 \| きたみ りゅうじ \|本 \| 通販 \| Amazon](https://www.amazon.co.jp/dp/4297124513)

![p204](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p204.jpg)

<br>
