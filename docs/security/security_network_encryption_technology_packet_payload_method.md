---
title: 【IT技術の知見】暗号方式＠アプリケーションデータの暗号化技術
description: 暗号方式＠アプリケーションデータの暗号化技術の知見を記録しています。
---

# 暗号方式＠アプリケーションデータの暗号化技術

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 暗号アルゴリズム

### 暗号アルゴリズムとは

アプリケーションデータの暗号化技術のほとんどは、『共通鍵暗号方式』や『公開鍵暗号方式』によって実現される。

それらの方式は、暗号アルゴリズムによって実装される。

<br>

### 共通鍵暗号アルゴリズム

#### ▼ 共通鍵暗号アルゴリズムとは

共通鍵暗号方式を実装するためのアルゴリズムのこと。

#### ▼ DES暗号：Data Encryption Standard

記入中...

#### ▼ AES暗号：Advanced Encryption Standard

記入中...

<br>

### 公開鍵暗号アルゴリズム

#### ▼ 公開鍵暗号アルゴリズムとは

公開鍵暗号方式を実装するためのアルゴリズムのこと。

#### ▼ RSA暗号：Rivest-Shamir-Adleman cryptosystem

記入中...

<br>

## 02. 暗号アルゴリズムに基づく暗号方式

### 暗号方式の種類一覧

|                    |      共通鍵暗号方式       |     公開鍵暗号方式     |
| ------------------ | :-----------------------: | :--------------------: |
| 暗号アルゴリズム   |  共通鍵暗号アルゴリズム   | 公開鍵暗号アルゴリズム |
| アルゴリズムの種類 |    RC4、DES、3DES、AES    |      RSA、ElGamal      |
| 暗号化に要する時間 |         より短い          |        より長い        |
| 作成される暗号鍵   |          共通鍵           |     秘密鍵、公開鍵     |
| 鍵の配布方法       | メール (盗聴に気を付ける) |      メール、PKI       |
| 鍵の再利用         |    再利用は不要である     |    再利用しても良い    |

<br>

### 共通鍵暗号方式

#### ▼ 共通鍵暗号方式とは

サーバーから受信者 (クライアント) にあらかじめ秘密鍵を渡しておく。

鍵の受け渡しを工夫しないと、共通鍵が盗聴される可能性がある (**鍵配送問題**) 。

**＊例＊**

エクセルのファイルロック

**長所**：処理が速い

**短所**：鍵の配布が大変

![p437](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p437.png)

#### ▼ 共通鍵の再利用の可否

各受信者 (クライアント) は、サーバーから、受信者ごとに作成された共通鍵をもらう。

鍵の再利用をする必要はない。

![共通鍵の再利用](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/共通鍵の再利用.png)

<br>

### 公開鍵暗号方式

#### ▼ 公開鍵暗号方式とは

![公開鍵暗号方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/公開鍵暗号方式.png)

公開鍵暗号方式でも記載の通り、共通鍵暗号方式の鍵配送問題を解決すべく開発された。

『RSA暗号』などによって実装される。

受信者 (クライアント) の公開鍵で暗号化した場合、受信者の秘密鍵のみで復号可能。

すなわち、第三者に復号 (解読) されることはないと判断可能。

**＊サーバーが実行すること＊**

`(1)`

: サーバーは、受信者 (クライアント) から公開鍵をもらう。

`(2)`

: 公開鍵を使用して、情報を暗号化する。

**＊受信者 (クライアント) が実行すること＊**

`(1)`

: 受信者 (クライアント) は、秘密鍵で情報を復号する。

#### ▼ 公開鍵の再利用の可否

各受信者 (クライアント) は、サーバーから、異なるサーバーで再利用される公開鍵をもらう。

ただし、サーバーごとに異なる秘密鍵と公開鍵を使用しても良い。

![公開鍵の再利用](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/公開鍵の再利用.png)

<br>

### ハイブリッド暗号方式

共通鍵暗号方式と公開鍵暗号方式を組み合わせた暗号方式。

両方の方式の長所と短所を補う。

![ハイブリッド暗号](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ハイブリッド暗号.png)

<br>

## 03. ハッシュ関数

### ハッシュ関数とは

何かのアプリケーションデータを入力すると、規則性のない一定の桁数の値を出力する演算手法。

![ハッシュ関数](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ハッシュ関数.png)

<br>

### SHA256

<br>

### SHA384

<br>

## 04. 暗号スイート

### 暗号スイートとは

『`TLS` + 鍵交換方式 + 認証方式 + `WITH` + 暗号アルゴリズム + ハッシュ関数』で表される暗号化技術の組み合わせのこと。

> - https://xtech.nikkei.com/atcl/nxt/column/18/02306/121900003/
> - https://active.nikkeibp.co.jp/atclact/active/17/032000256/032000005/

<br>

### 暗号スイートの種類

- TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256
- TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
- TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305
- TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
- TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305
- TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
- TLS_RSA_WITH_AES_256_GCM_SHA384
- TLS_RSA_WITH_AES_128_GCM_SHA256

> - https://xtech.nikkei.com/atcl/nxt/column/18/02306/121900003/
> - https://active.nikkeibp.co.jp/atclact/active/17/032000256/032000005/

<br>
