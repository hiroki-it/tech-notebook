---
title: 【IT技術の知見】メモリ＠ハードウェア
description: メモリ＠ハードウェアの知見を記録しています。
---

# メモリ＠ハードウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. メインメモリ (主記憶装置)

### DRAM：Dynamic RAM

#### ▼ DRAMとは

メインメモリとして使用される。

データを保管できる揮発的な記憶装置のこと。

![Dynamic RAM](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Dynamic_RAM.jpg)

<br>

### Mask ROM

#### ▼ Mask ROMとは

![p164-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p164-1.png)

> - https://www.amazon.co.jp/dp/4297124513

<br>

### Programmable ROM

#### ▼ Programmable ROMとは

![p164-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p164-2.png)

> - https://www.amazon.co.jp/dp/4297124513

<br>

### ガベージコレクション

#### ▼ ガベージコレクションとは

プログラムが確保したメモリ領域のうち、不要になった領域を自動的に解放する機能。

#### ▼ Javaの場合

Javaでは、JVM：Java Virtual Machine (Java仮想マシン) が、メモリ領域をオブジェクトに自動的に割り当て、また一方で、不要になったメモリ領域の解放を行う。

一方で自動的に行う。

<br>

## 02. キャッシュメモリ

### キャッシュとは

データや静的コンテンツ (HTML、JavaScript、CSS、画像) をデータを保存しておき、再利用することによって、処理速度を高める仕組みのこと。

<br>

### キャッシュメモリとは

#### ▼ 一次キャッシュメモリと二次キャッシュメモリ

CPUとメインメモリの間に、キャッシュメモリを何段階か配置し、CPUとメインメモリの間の読み出しと書き込みの処理速度の差を緩和させる。

![メモリキャッシュ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/メモリキャッシュ.gif)

実際に、タスクマネージャのパフォーマンスタブで、`n`次キャッシュメモリがどのくらい使われているのかを確認できる。

![キャッシュメモリの実例](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/キャッシュメモリの実例.png)

<br>

### キャッシュメモリの仕組み

#### ▼ 一度目

ユーザー ➔ メインメモリ ➔ 二次キャッシュメモリ ➔ 一次キャッシュメモリの順で、データがやり取りされる。

`(1)`

: ユーザーが、パソコンに対して命令を与える。

`(2)`

: CPUは、命令をメインメモリに書き込む。

`(3)`

: CPUは、メインメモリから命令を読み出す。

`(4)`

: CPUは、二次キャッシュメモリに書き込む。

`(5)`

: CPUは、一次キャッシュメモリに書き込む。

`(6)`

: CPUは、命令を実行する。

![メモリとキャッシュメモリ_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/メモリとキャッシュメモリ_1.jpg)

#### ▼ 二度目

![メモリとキャッシュメモリ_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/メモリとキャッシュメモリ_2.jpg)

<br>

### キャッシュメモリへの書き込み方式の種類

#### ▼ Write-throught方式

CPUは、命令をメインメモリとキャッシュメモリの両方に書き込む。

常にメインメモリとキャッシュメモリの内容が一致している状態を確保できるが、メモリへの書き込みが頻繁に行われるので遅い。

![Write-through方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Write-through方式.jpg)

#### ▼ Write-back方式

CPUは、キャッシュメモリのみに書き込む。

次に、キャッシュメモリがメインメモリに書き込む。

メインメモリとキャッシュメモリの内容が一致している状態を必ずしも確保できないが、メインメモリへの書き込み回数が少ないため速い

![Write-back方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Write-back方式.jpg)

<br>

### 実効アクセス時間

![p171-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p171-1.png)

> - https://www.amazon.co.jp/dp/4297124513

<br>

### SRAM：Static RAM

#### ▼ SRAMとは

キャッシュメモリとして使用される。

![Static RAM](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Static_RAM.jpg)

<br>

## 02-02. キャッシュの保存場所の種類

### 全体像

![what_and_where_to_cache.jpeg](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/what_and_where_to_cache.jpeg)

> - https://twitter.com/pvergadia/status/1633216210308595712/photo/1

<br>

### クライアントサイドキャッシュ

クライアントのブラウザの使用するメモリ上で、レスポンスされた静的コンテンツのキャッシュが作成される。

Chromeの場合は、CacheStorageに保持される。

![client_side_cache](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/client_side_cache.png)

> - https://developer.chrome.com/docs/devtools/storage/cache/

<br>

### サーバーサイドキャッシュ

#### ▼ CDNキャッシュ

記入中...

#### ▼ API Gatewayキャッシュ

記入中...

#### ▼ ロードバランサーキャッシュ

記入中...

#### ▼ webサーバーキャッシュ

リバースプロキシサーバーの使用するメモリ上で、レスポンスされた静的コンテンツのキャッシュが作成される。

AWSでは、CloudFrontにおけるキャッシュがこれに相当する。

#### ▼ アプリケーションサーバーキャッシュ

オブジェクトのプロパティの使用するメモリ上で、メソッド処理結果のキャッシュが作成される。

必要な場合、これを取り出して再利用する。

Laravelのキャッシュ機能については、以下のリンクを参考にせよ。

> - https://readouble.com/laravel/8.x/ja/cache.html

#### ▼ DBキャッシュ

記入中...

<br>

### キャッシュすべきでないデータ

#### ▼ サーバーサイド側の場合

セキュリティ上などの理由で、サーバー側でキャッシュすべきでないデータがある。

| データ                                      | 理由                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| Form認証ページ                              | 無関係のユーザーに認証済みのWebページが返信されてしまう。                |
| 緯度経度/フリーワードに基づく検索結果ページ | パターン数が多く、キャッシュで全てのページを網羅することが現実的でない。 |

<br>

## 02-03. クライアントサイドキャッシュの仕組み

### クライアントサイドキャッシュ使用/不使用の検証

#### ▼ ETag値による検証

ブラウザは、Etag値を使用してキャッシュの実現する。

![EtagとIf-NoneMach](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ETagとIf-None-Match.png)

#### `(1)` キャッシュの有効時間が切れるまで

`(1)`

: クライアントのブラウザは、リクエストをサーバーに送信する。

`(2)`

: サーバーは、特定のアルゴリズムを使用してハッシュ値を作成し、これをコンテンツのETag値とする。

`(3)`

: サーバーは、`ETag`ヘッダーにETag値を設定し、コンテンツとともにレスポンスをクライアントに送信する。

`(4)`

: クライアントのブラウザは、コンテンツとETag値をキャッシュする。

`(5)`

: キャッシュの有効時間が切れるまで、クライアントサイドキャッシュを使用し続ける。

#### `(2)` キャッシュの有効時間が切れた後

`(1)`

: キャッシュの有効時間が切れる。

`(2)`

: クライアントのブラウザは、リクエストをサーバーに送信する。

     この時、If-None-MatchヘッダーにキャッシュしておいたETag値を設定する。

`(3)`

: サーバーは、送信されたETag値とコンテンツのETag値を比較検証する。

#### `(3)` 検証により、クライアントサイドキャッシュを使用

`(1)`

: ETag値の比較検証の結果、一致する。

`(2)`

: サーバーは、両方の値が一致する場合、`304`ステータスでレスポンスをクライアントに送信する。

`(3)`

: クライアントのブラウザは、キャッシュを使用する。

#### `(4)` 検証により、クライアントサイドキャッシュを使用せず

`(1)`

: ETag値の比較検証の結果、一致しない。

`(2)`

: サーバーは、両方の値が一致しない場合、ETag値を作成し、これをコンテンツの新しいETag値とする。

`(3)`

: サーバーは、`ETag`ヘッダーにETag値を設定し、コンテンツとともにレスポンスをクライアントに送信する。

`(4)`

: クライアントのブラウザは、コンテンツとETag値をキャッシュする。

<br>

### クライアントサイドキャッシュ時間の定義

#### ▼ クライアントサイドキャッシュなし

レスポンスヘッダーにて、`Cache-Control`ヘッダーに`no-store`を設定する。

この場合、ETag値が無効になり、クライアントサイドキャッシュを使用しなくなる。

```yaml
HTTP/1.1 200
---

---
Cache-Control: no-store
---
# ボディ
ここにサイトのHTMLのコード
```

#### ▼ クライアントサイドキャッシュあり (有効時間あり)

レスポンスヘッダーにて、`Cache-Control`ヘッダーに`max-age=31536000`を設定する。

Expireヘッダーに有効時間を設定しても良いが、`Cache-Control`ヘッダーの有効時間が優先される。

この場合、有効時間を過ぎると、ETag値を比較検証するようになる。

```yaml
HTTP/1.1 200
---

---
Cache-Control: max-age=31536000
---
# ボディ
ここにサイトのHTMLのコード
```

#### ▼ クライアントサイドキャッシュあり (有効時間なし)

レスポンスヘッダーにて、`Cache-Control`ヘッダーに`max-age=0`を設定する。

また、Expireヘッダーに期限切れの日時を設定する。この場合、毎回のリクエスト時にETag値を比較検証するようになる。

```yaml
HTTP/1.1 200
---

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

## 04. GPUとVRAM

GPUとVRAMのサイズによって、扱うことのできる解像度と色数が決まる。

![VRAM](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/VRAM.jpg)

富士通PCのGPUとVRAMのサイズは、以下の通り。

![本パソコンのVRAMスペック](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/本パソコンのVRAMスペック.jpg)

色数によって、`1`ドット当たり何ビットを要するが異なる。

> - https://www.amazon.co.jp/dp/4297124513

![p204](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p204.jpg)

<br>
