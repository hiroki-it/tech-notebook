---
title: 【IT技術の知見】ネットワーク
description: ネットワークの知見を記録しています。
---

# ネットワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. ネットワークの全体像

ネットワークには、『インターネット』『WAN』『LAN』がある。

自宅内LAN、学内LAN、企業内LAN、企業WANなど、さまざまなネットワークがあり、インターネットは、それぞれのネットワークを互いに接続しているネットワークである。



![network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network.png)

<br>

## 02. LAN：Local Area Network

### LANとは

限定された領域のみで通信できるネットワークのこと。

LAN内では、各機器はプライベートIPアドレスで識別されている。

LAN内に設置されたNATルーターが、WAN内のグローバルIPアドレスとLAN内のプライベートIPアドレスを相互変換する。



> ℹ️ 参考：http://qa.elecom.co.jp/faq_detail.html?id=4159&category=152

![network_lan](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network_lan.jpeg)

<br>

### LANの構成

#### ▼ サブネット

LANは、バリアセグメント、パブリックサブネット（非武装地帯）、プライベートサブネット（内部ネットワーク）、に分割できる。

AWSやGCPでも、VPCを同様のサブネットに分割すると良い。



> ℹ️ 参考：
>
> - https://www.techtarget.com/searchsecurity/definition/DMZ
> - https://www.ntt.com/business/services/network/internet-connect/ocn-business/bocn/knowledge/archive_09.html

![internal_dmz_external](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/internal_dmz_external.png)

#### ▼ パブリックサブネット内のサーバー

攻撃の影響がプライベートサブネットに広がる可能性を防ぐために、外部から直接的にリクエストを受ける。

そのため、『DNSサーバー』『プロキシサーバー』『webサーバー』『メールサーバー』は、パブリックサブネットに設置すると良い。



#### ▼ プライベートサブネット内のサーバー

外部から直接的にリクエストを受けない。

そのため、『dbサーバー』は、プライベートサブネットに設置すると良い。



<br>

## 02-02. ルーター

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network_router.html

<br>

## 02-03. フォワード/リバースプロキシサーバー

### 処理

#### ▼ 代理ルーティング

![フォワードプロキシサーバーとリバースプロキシサーバー](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/フォワードプロキシサーバーとリバースプロキシサーバー.png)

> ℹ️ 参考：https://qiita.com/att55/items/162950627dc593c72f23

| サーバー名        | 処理                                                                             |
|---------------|--------------------------------------------------------------------------------|
| フォワードプロキシサーバー | 特定のクライアントのアウトバウンド通信を、不特定多数のサーバーに代理でルーティングする。                          |
| リバースプロキシサーバー  | 不特定のクライアントからのインバウンド通信を、特定のサーバーに代理でルーティングする。また、ロードバランサーのように負荷分散もできる。 |

#### ▼ キャッシュ

![プロキシサーバーのキャッシュ能力](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/プロキシサーバーのキャッシュ能力.png)

> ℹ️ 参考：https://software.fujitsu.com/jp/manual/manualfiles/M100003/B1WN9491/07Z201/ihs02/ihs00016.htm

| サーバー名        | 処理                                      |
|---------------|-----------------------------------------|
| フォワードプロキシサーバー | クライアント側にて、代理ルーティングのレスポンスのキャッシュを作成する。 |
| リバースプロキシサーバー  | サーバー側にて、代理ルーティングのレスポンスのキャッシュを作成する。   |

<br>

## 02-04. ロードバランサー

### ```L7```ロードバランサー

```L7```のプロトコルの通信をロードバランシングする。



- ```L7```のプロトコル
- ポート番号
- HTTPリクエスト（パス、```Host```ヘッダー）

> ℹ️ 参考：https://www.infraexpert.com/study/tcpip8.html

<br>

### ```L4```ロードバランサー

```L4```のプロトコルの通信をロードバランシングする。



- ```L4```のプロトコル
- IPアドレス
- ポート番号

> ℹ️ 参考：https://www.infraexpert.com/study/tcpip8.html


<br>

### 設置場所

#### ▼ 物理サーバーの場合

フォワードプロキシサーバーはプロバイダの会社に、リバースプロキシサーバーはリクエスト先の社内ネットワークに設置されている。



![proxy-server](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/proxy-server.png)

#### ▼ クラウド上の場合

クラウドの場合も、仮想環境が作成されるのみで、設置場所は同じである。



<br>

## 03. WAN：Wide Area Network

### WANとは

![network_wan](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network_wan.png)

特定のLAN間のハブになるプライベートネットワークのこと。

インターネットサービスプロバイダーがサービスとして提供している。

WAN内では、各LANはグローバルIPアドレスで識別されている。

各LANがWANに接続するためには、DTE（例：ブロードバンドルーター、Wifiルーター）、DCE（例：モデム）、電柱にあるアクセス回線、が必要になる。

インターネットと比べて金銭的負担が大きく、WANで帯域幅を拡大するためにはインターネットサービスプロバイダーの料金がかかる。



> ℹ️ 参考：
>
> - https://qiita.com/hymnofpeace/items/7f09a7a10e843552a8cb
> - https://xtech.nikkei.com/it/article/COLUMN/20080715/310872/

<br>

### WANの種類

#### ▼ 専用線方式

WANを介したプライベートな通信で、データの送信元と宛先が決まっており、特定のユーザーがアクセス回線を専有する。

他のLANから閉じられた専用のアクセス回線であり、特定のLAN間でのみデータ通信を行う。



> ℹ️ 参考：http://makiyamashinji.web.fc2.com/emprus/design/wan.html

#### ▼ 回線交換方式

WANを介したプライベートな通信で、データの送信元と宛先が決まっておらず、複数のユーザーでWAFを共有する。

ただし、特定のユーザーのデータがアクセス回線を通過している間、他のユーザーはアクセス回線を使用できない。

少数対少数でデータ通信を行うため、送信時に、送信者と受信者の宛先情報は不要である。



> ℹ️ 参考：
>
> - https://www.itpassportsiken.com/kakomon/28_haru/q71.html
> - https://www.infraexpert.com/study/wan3.html

![waf_circuit-switching-system](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/waf_circuit-switching-system.png)

#### ▼ パケット交換方式

WANを介したプライベートな通信で、パケット化されたデータの送信元と宛先が決まっておらず、複数のユーザーでWAFを共有する。

複数のユーザーでアクセス回線を同時に使用できる。

対多数でデータ通信を行うため、送信時に、送信者と受信者の宛先情報が必要になる。



> ℹ️ 参考：
>
> - https://www.itpassportsiken.com/kakomon/28_haru/q71.html
> - https://www.infraexpert.com/study/wan3.html

![waf_packet-switching-system](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/waf_packet-switching-system.png)

<br>

### WANの実現方法

WANの実現は、```1980```年代のアナログ専用線から始まった。

現在は、広域イーサネットやVPN（仮想プライベートネットワーク）を使用して、WANを実現するようになった。



![network_wan_history](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network_wan_history.png)

<br>

## 04. インターネット

### インターネットとは

あらゆるLAN間のハブになるパブリックネットワークのこと。



<br>

## 05. 通信の方向/位置

### インバウンド/アウトバウンド

![inbound_outbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/inbound_outbound.png)

サーバーを中心とした方向で通信を見た時、サーバーに流入する方向をインバウンドという。

反対に、サーバーから流出する方向をアウトバウンドという。



> ℹ️ 参考：
>
> - https://www.amazon.co.jp/dp/B0043D2EKO/
> - https://www.oreilly.com/library/view/http-the-definitive/1565925092/ch03s01.html

<br>

### アップストリーム/ダウンストリーム

![upstream_downstream](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/upstream_downstream.png)

通信の送受信全体の中の位置で通信を見た時、通信が送信された前半の位置を相対的にアップストリームという。

反対に、通信が受信される後半の位置を相対的にダウンストリームという。



> ℹ️ 参考：
>
> - https://www.amazon.co.jp/dp/B0043D2EKO/
> - https://www.oreilly.com/library/view/http-the-definitive/1565925092/ch03s01.html

<br>

## 06. ネットワークのパフォーマンス指標

### レスポンスタイム

リクエストを送信してから、サーバーが処理を実行し、レスポンスが返信されるまでに要する時間のこと。



<br>

### レイテンシー

リクエストを送信してから、レスポンスが返信されるまで要する時間のこと。

サーバーの処理時間は含まない。



<br>

### Connection Time（接続時間）

リクエストを送信する前に、サーバーとのTCP接続の確立に要する時間のこと。

なお、リクエストとレスポンスの送受信の前後に行われるTCP接続の確立を『スリーウェイハンドシェイク』という。



<br>


### Bandwidth（帯域幅）

一度に送受信できるデータの最大サイズのこと。

インターネットやWANの帯域幅が狭いと、ダウンロード（例：インストール、コンテナイメージのプル）やアップロード（例：POST送信、コンテナイメージのプッシュ）に時間がかかる。



<br>

### スループット（伝送速度）

#### ▼ スループットとは

単位時間当たりの送信できる最大のデータサイズのこと。

実際には、スループットは、『プロバイダ』、『光回線』、『自宅の有線/無線』の```3```個に影響されるため、スループットで期待されるデータサイズを満たせないことが多い。

他からの影響を受けた実際のスループットを『実効スループット』という。



![伝送速度](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/伝送速度.png)

#### ▼ 伝送

サーバーからクライアントPCにパケットを送信すること。

相互の送信は、通信（パケット送受信）と呼ぶ。



#### ▼ 伝送秒数の求め方

```mathematica
(伝送秒数)
= データサイズ(bit) ÷ スループット(bit/s) × 伝送効率
```

#### ▼ トラフィックとは

とあるネットワーク地点でのスループットのこと。



> ℹ️ 参考：https://xtech.nikkei.com/it/article/Keyword/20070222/262872/

![トラフィック](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/トラフィック.png)

総務省のデータで、日本のブロードバンド大手5社の総トラフィックを年次でグラフ化したものがある。



> ℹ️ 参考：https://xtech.nikkei.com/atcl/nxt/column/18/00525/112900001/

![トラフィックのグラフ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/トラフィックのグラフ.png)

<br>
