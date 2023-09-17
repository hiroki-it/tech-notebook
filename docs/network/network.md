---
title: 【IT技術の知見】ネットワーク
description: ネットワークの知見を記録しています。
---

# ネットワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ネットワークの全体像

ネットワークには、『インターネット』『WAN』『LAN』がある。

自宅内LAN、学内LAN、企業内LAN、企業WANなど、さまざまなネットワークがあり、インターネットは、それぞれのネットワークを互いに接続しているネットワークである。

![network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network.png)

<br>

## 03. インターネット

### インターネットとは

あらゆるLAN間のハブになるパブリックネットワークのこと。

WANと比較して、通信の利用者が限定されていないため、サイバー攻撃の脆弱性が高い。

一方で金銭的負担が小さく、帯域幅を考慮しなくてもよい。

<br>

## 05. 通信の方向/位置

### インバウンド/アウトバウンド

サーバーを中心とした方向で通信を見た時、サーバーに流入する方向をインバウンドという。

反対に、サーバーから流出する方向をアウトバウンドという。

![inbound_outbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/inbound_outbound.png)

> - https://www.amazon.co.jp/dp/B0043D2EKO/
> - https://www.oreilly.com/library/view/http-the-definitive/1565925092/ch03s01.html

<br>

### アップストリーム/ダウンストリーム

通信の送受信全体の中の位置で通信を見た時、通信が送信された前半の位置を相対的にアップストリームという。

反対に、通信が受信される後半の位置を相対的にダウンストリームという。

![upstream_downstream](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/upstream_downstream.png)

> - https://www.amazon.co.jp/dp/B0043D2EKO/
> - https://www.oreilly.com/library/view/http-the-definitive/1565925092/ch03s01.html

<br>

## 04. ネットワークの性能指標

### レスポンスタイム (≒レイテンシー)

リクエストを送信してから、サーバーが処理を実行し、レスポンスが返信されるまでに要する時間のこと。

ただし、レイテンシーと区別しない場合がある。

> - https://ec-orange.jp/ec-media/?p=24447

<br>

### レイテンシー (≒レスポンスタイム)

リクエストを送信してから、レスポンスが返信されるまで要する時間のこと。

サーバーの処理時間は含まない。

ただし、レスポンスタイムと区別しない場合がある。

> - https://ec-orange.jp/ec-media/?p=24447

<br>

### Connection Time (接続時間)

リクエストを送信する前に、サーバーとのTCP接続の確立に要する時間のこと。

補足として、リクエストとレスポンスの送受信の前後に行われるTCP接続の確立を『スリーウェイハンドシェイク』という。

<br>

### Bandwidth (帯域幅)

一度に送受信できるデータの最大サイズのこと。

インターネットやWANの帯域幅が狭いと、ダウンロード (例：インストール、コンテナイメージのプル) やアップロード (例：POST送信、コンテナイメージのプッシュ) に時間がかかる。

<br>

### スループット (伝送速度)

#### ▼ スループットとは

単位時間当たりの送信できる最大のデータサイズのこと。

実際には、スループットは、『プロバイダ』、『光回線』、『自宅の有線/無線』の`3`個に影響されるため、スループットで期待されるデータサイズを満たせないことが多い。

他からの影響を受けた実際のスループットを『実効スループット』という。

![伝送速度](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/伝送速度.png)

#### ▼ 伝送

サーバーからクライアントPCにパケットを送信すること。

相互の送信は、通信 (パケット送受信) と呼ぶ。

#### ▼ 伝送秒数の求め方

```mathematica
(伝送秒数)
= データサイズ(bit) ÷ スループット(bit/s) × 伝送効率
```

#### ▼ トラフィックとは

とあるネットワーク地点でのスループットのこと。

![トラフィック](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/トラフィック.png)

> - https://xtech.nikkei.com/it/article/Keyword/20070222/262872/

総務省のデータで、日本のブロードバンド大手5社の総トラフィックを年次でグラフ化したものがある。

![トラフィックのグラフ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/トラフィックのグラフ.png)

> - https://xtech.nikkei.com/atcl/nxt/column/18/00525/112900001/

<br>
