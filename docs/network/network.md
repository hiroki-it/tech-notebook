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

## 02. インターネット

### インターネットとは

あらゆるLAN間のハブになるパブリックネットワークのこと。

WANと比較して、通信の利用者が限定されていないため、サイバー攻撃の脆弱性が高い。

一方で金銭的負担が小さく、帯域幅を考慮しなくてもよい。

<br>

## 03. 通信の方向/位置

### インバウンド/アウトバウンド

サーバーを中心とした方向で通信を見た時、サーバーに流入する方向をインバウンドという。

反対に、サーバーから流出する方向をアウトバウンドという。

![inbound_outbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/inbound_outbound.png)

> - https://www.amazon.co.jp/dp/B0043D2EKO/
> - https://www.oreilly.com/library/view/http-the-definitive/1565925092/ch03s01.html

<br>

### アップストリーム/ダウンストリーム

レスポンスを中心とした方向で通信を見た時に、レスポンスの送信元をアップストリーム、レスポンスの宛先をダウンストリームという。

反対に、通信が受信される後半の位置を相対的にダウンストリームという。

![upstream_downstream](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/upstream_downstream.png)

> - https://www.amazon.co.jp/dp/B0043D2EKO/
> - https://www.oreilly.com/library/view/http-the-definitive/1565925092/ch03s01.html
> - https://stackoverflow.com/a/32365658

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

<br>

### Bandwidth (帯域幅)

単位時間当たりの送信できる最大ペイロードサイズの理論値のこと。

帯域幅の実測値は、すなわち『スループット』である。

インターネットやWANの帯域幅が狭いと、ダウンロード (例：インストール、コンテナイメージのプル) やアップロード (例：POSTリクエスト、コンテナイメージのプッシュ) に時間がかかる。

> - https://techtarget.itmedia.co.jp/tt/news/2211/07/news04.html
> - https://aws.amazon.com/jp/compare/the-difference-between-throughput-and-latency/#seo-faq-pairs#relationship-between-bandwidth-latency-and-throughput

<br>

### スループット (伝送速度)

#### ▼ スループットとは

単位時間当たりの送信できる最大ペイロードサイズの実測値こと。

スループットの理論値は、すなわち『帯域幅』である。

ただし、スループットは、『プロバイダ』『光回線』『自宅の有線/無線』の`3`個に影響されるため、スループットで期待されるペイロードサイズを満たせないことが多い。

他からの影響を受けたスループットを、特に『実効スループット』という。

![伝送速度](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/伝送速度.png)

> - https://techtarget.itmedia.co.jp/tt/news/2211/07/news04.html
> - https://aws.amazon.com/jp/compare/the-difference-between-throughput-and-latency/#seo-faq-pairs#relationship-between-bandwidth-latency-and-throughput

#### ▼ 伝送

サーバーからクライアントPCにパケットを送信すること。

相互の送信は、通信 (パケット送受信) と呼ぶ。

#### ▼ 伝送秒数の求め方

```mathematica
(伝送秒数)
= ペイロードサイズ(bit) ÷ スループット(bit/s) × 伝送効率
```

#### ▼ トラフィックとは

とあるネットワーク地点でのスループットのこと。

![トラフィック](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/トラフィック.png)

> - https://xtech.nikkei.com/it/article/Keyword/20070222/262872/

総務省のペイロードで、日本のブロードバンド大手5社の総トラフィックを年次でグラフ化したものがある。

![トラフィックのグラフ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/トラフィックのグラフ.png)

> - https://xtech.nikkei.com/atcl/nxt/column/18/00525/112900001/

<br>

## 05. 回復性

### タイムアウト

#### ▼ タイムアウトとは

使用中のハードウェアリソースを解放するために、処理 (例：通信、時間のかかる計算処理など) に制限時間を設ける必要がある。

> - https://zenn.dev/yktakaha4/articles/learn_about_web_application_timeouts#%E3%82%BF%E3%82%A4%E3%83%A0%E3%82%A2%E3%82%A6%E3%83%88%E3%82%92%E8%A8%AD%E5%AE%9A%E3%81%97%E3%81%AA%E3%81%84%E3%81%93%E3%81%A8%E3%81%AF%E5%8D%B1%E9%99%BA%E3%81%A7%E3%81%82%E3%82%8B

#### ▼ 接続タイムアウト (Connection timeout)

『オープンタイムアウト (Open timeout) 』ともいう

処理の中でも、特にリクエストの到達を待機する最大時間である。

TCP接続の確立中、メモリ上で送信データが保持されており、占有されてしまっている。

これを解放する必要がある。

> - https://zenn.dev/yktakaha4/articles/learn_about_web_application_timeouts#%E6%8E%A5%E7%B6%9A%E3%82%BF%E3%82%A4%E3%83%A0%E3%82%A2%E3%82%A6%E3%83%88
> - https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q14128960434

#### ▼ 読み取りタイムアウト (Read timeout)

処理の中でも、リクエストが到達した後に特にレスポンスの返信を待機する最大時間である。

これの場合、サーバーにリクエストを送信できており、サーバーがレスポンスを返信できない状態にある。

HTTPプロトコルのステータスコードでは、Gateway Timeout (`504`) が相当する。

> - https://zenn.dev/yktakaha4/articles/learn_about_web_application_timeouts#%E3%83%AA%E3%83%BC%E3%83%89%E3%82%BF%E3%82%A4%E3%83%A0%E3%82%A2%E3%82%A6%E3%83%88

#### ▼ セッションタイムアウト (Session timeout)

記入中...

> - https://zenn.dev/yktakaha4/articles/learn_about_web_application_timeouts#%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%BF%E3%82%A4%E3%83%A0%E3%82%A2%E3%82%A6%E3%83%88

#### ▼ アイドルタイムアウト (Idle timeout)

TCP接続中の無通信状態 (パケットの送受信がない状態) を許可する時間である。

#### ▼ 処理タイムアウト

記入中...

> - https://zenn.dev/yktakaha4/articles/learn_about_web_application_timeouts#%E5%87%A6%E7%90%86%E3%82%BF%E3%82%A4%E3%83%A0%E3%82%A2%E3%82%A6%E3%83%88

<br>

### リトライ

#### ▼ リトライとは

記入中...

<br>
