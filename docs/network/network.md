---
title: 【IT技術の知見】ネットワーク
description: ネットワークの知見を記録しています。
---

# ネットワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ネットワークの全体像

ネットワークには、『インターネット』『WAN』『LAN』がある。自宅内LAN、学内LAN、企業内LAN、企業WANなど、さまざまなネットワークがあり、インターネットは、それぞれのネットワークを互いに接続しているネットワークである。

![network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network.png)

<br>

## 02. LAN：Local Area Network

### LANとは

限定された領域だけで通信できるネットワークのこと。LAN内では、各機器はプライベートIPアドレスで識別されている。LAN内に設置されたNATルーターが、WAN内のグローバルIPアドレスとLAN内のプライベートIPアドレスを相互変換する。

> ℹ️ 参考：http://qa.elecom.co.jp/faq_detail.html?id=4159&category=152

![network_lan](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network_lan.jpeg)

<br>

### LANの構成

#### ▼ サブネット

LANは、バリアセグメント、パブリックサブネット（非武装地帯）、プライベートサブネット（内部ネットワーク）、に分割できる。AWSやGCPでも、VPCを同様のサブネットに分割すると良い。

> ℹ️ 参考：
>
> - https://www.techtarget.com/searchsecurity/definition/DMZ
> - https://www.ntt.com/business/services/network/internet-connect/ocn-business/bocn/knowledge/archive_09.html

![internal_dmz_external](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/internal_dmz_external.png)

#### ▼ パブリックサブネット内のサーバー

攻撃の影響がプライベートサブネットに広がる可能性を防ぐために、外部から直接的にリクエストを受ける。そのため、『DNSサーバー』『プロキシサーバー』『webサーバー』『メールサーバー』は、パブリックサブネットに設置すると良い。

#### ▼ プライベートサブネット内のサーバー

外部から直接的にリクエストを受けない。そのため、『dbサーバー』は、プライベートサブネットに設置すると良い。

<br>

## 02-02. ルーター

### ルーター

#### ▼ ルーターとは

異なるネットワーク間（LANとLAN、LANとWAN、など）で通信できるようにし、加えて同時に複数の宛先に通信をルーティングする。

#### ▼ 設置場所

ルーターは、パブリックネットワーク、各プライベートネットワークの入り口、各プライベートネットワーク間の共有の境界地点、に設置する。プライベートネットワークの入り口に設置する場合、例えば、自宅内に設置するルーターがある。インターネットサービスプロバイダーから貸出されるモデムでアナログ信号をデジタル信号に変換した後、これにルーターを接続し、自宅内/外のネットワークを繋ぐ。

> ℹ️ 参考：
>
> - https://xtech.nikkei.com/atcl/nxt/column/18/01842/032200010/
> - https://michisugara.jp/modem_router

![router](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/router.png)

#### ▼ ルーターの種類

> ℹ️ 参考：
>
> - https://xtech.nikkei.com/atcl/nxt/column/18/00780/052700006/
> - https://book.mynavi.jp/support/pc/5081/pdf/154.pdf

| ルーター名                           | 設置場所                                           | 役割                                                         |
| ------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------ |
| コアルーター                         | インターネットサービスプロバイダー内のネットワーク | 同じプロバイダーや異なるプロバイダーのネットワーク間を繋ぐ。 |
| センタールーター                     | 一般企業内の拠点間WANネットワーク                  | 本社と支社のネットワーク間を繋ぐ。                           |
| エッジルーター（エッジゲートウェイ） | 一般企業内の拠点間WANネットワーク                  | 異なる支社や営業所のネットワーク間を繋ぐ。                   |
| ブロードバンドルーター、Wifiルーター | 自宅内のネットワーク                               | 自宅内/外のネットワーク間を繋ぐ。ブロードバンドルーターであれば有線、Wifiルーターであれば無線で接続することになる。 |

#### ▼ ルーティング

受信した通信を適切な宛先に転送すること。通信の宛先を制御することを表す場合、単に『転送する』よりも『ルーティングする』と表現した方が良い。

> ℹ️ 参考：https://www.infraexpert.com/study/routing.html

#### ▼ ホップ数

リクエストの送信元から宛先までの間に、経由するルーター数のこと。ホップ数は、```traceroute```コマンドで確認できる。

> ℹ️ 参考：https://www.wdic.org/w/WDIC/%E3%83%9B%E3%83%83%E3%83%97%E6%95%B0

#### ▼ ホップバイホップルーティング

![router_hop-by-hop-routing](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/router_hop-by-hop-routing.jpeg)

ネットワーク内でルーターがルーターに通信をルーティングする時、各ルーターが最適なルーティング先を選択すること。

> ℹ️ 参考：https://ascii.jp/elem/000/000/444/444681/3/

<br>

### NATルーター

#### ▼ NATルーターとは

NATの能力を持つルーターのこと。

#### ▼ NAT（静的NAT）：Network Address Translation

![nat-router](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/nat-router.png)

| 設置場所                                                 | 能力                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| パブリックネットワークとプライベートネットワークの境目   | NATルーターがグローバルIPアドレスを持ち、パブリックネットワークとプライベートネットワークの双方向に対する通信時に、プライベートIPアドレスに相互変換する。 |
| プライベートネットワークとプライベートネットワークの境目 | NATルーターがプライベートIPアドレスを持ち、プライベートネットワークとプライベートネットワークの双方向に対する通信時に、プライベートIPアドレスに相互変換する。 |

種類の異なるネットワーク間で、IPアドレスを相互変換する。```1```個のIPアドレスに対して、```1```個の内部IPアドレスを紐付けられる。図で言う上側のアウトバウンド通信時の送信元IPアドレスの変換を『SNAT』といい、下側のインバウンド通信時の宛先IPアドレスの変換を『SNAT』という。```1```個の通信で両方が必要である。

> ℹ️ 参考：
>
> - https://www.vtv.co.jp/intro/mcu/about_mcu9-3.html
> - https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q1282815592

#### ▼ 外部IPアドレス、内部IPアドレス、ターゲットIPアドレス

かなり重要。NATルーターの文脈で、外部IPアドレス、内部IPアドレス、ターゲットIPアドレスという用語が使用されることがある。これは、DNATとSNATで意味合いが異なることに注意する。

| DNAT/SNAT | 外部IPアドレス                                                                             | 内部IPアドレス                                              | ターゲットIPアドレス                                                               |
|-----------|--------------------------------------------------------------------------------------|-------------------------------------------------------|---------------------------------------------------------------------------|
| DNATの場合   | 外部IPアドレスをネットワークに公開し、外部IPアドレスを宛先IPアドレスとしたパケットを受信した場合に、宛先IPアドレスを内部IPアドレスに変換してルーティングする。 | NATルーターを通過した後、パケットの宛先IPアドレスを内部IPアドレスに変換する。          | 無し                                                                        |
| SNATの場合   | NATルーターを通過した後、パケットの送信元IPアドレスを外部IPアドレスに変換する。NATルーターのIPアドレスを指定して通信する必要はない。             | NATルーターが受信したパケットのうちで、指定した『送信元IPアドレス』を持つパケットのみルールを適用し、そうでないパケットはそのまま通過させる。 | NATルーターが受信したパケットのうちで、指定した『宛先IPアドレス』を持つパケットのみルールを適用し、そうでないパケットはそのまま通過させる。 |

#### ▼ DNAT：Destination NAT

![グローバルからプライベートへのnat変換](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/グローバルからプライベートへのnat変換.png)

NATルーターの能力のうち、宛先IPアドレスを変換すること（```グローバルIPアドレス``` → ```プライベートIPアドレス```、```プライベートIPアドレス``` → ```プライベートIPアドレス```）。NATルーター自体を複数のプライベートネットワークで共有することがある。

> ℹ️ 参考：https://rainbow-engine.com/dnat-snat-difference/

**＊例＊**

NATルーターは、プライベートネットワークに入る時に、パケットのヘッダ情報における『宛先』のグローバルIPアドレスをプライベートIPアドレスに変換する。

#### ▼ SNAT：Source NAT

![プライベートからグローバルへのnat変換](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/プライベートからグローバルへのnat変換.png)

NATルーターの能力のうち送信元IPアドレスを変換すること（```プライベートIPアドレス``` → ```グローバルIPアドレス```、```プライベートIPアドレス``` → ```プライベートIPアドレス```）。NATルーター自体を複数のプライベートネットワークで共有することがある。

> ℹ️ 参考：https://rainbow-engine.com/dnat-snat-difference/

**＊例＊**

（１）NATルーターは、プライベートネットワークから出る時に、パケットのヘッダ情報における『送信元』のプライベートIPアドレスをグローバルIPアドレスに変換する。例えば、GoogleでWebページを見ながら、Gmailアプリケーションを起動している場合、リクエストにおけるパケット情報として…

| 送信元プライベートIPアドレス |   ⇄   | 送信元グローバルIPアドレス |
| :--------------------------: |:-----:| :------------------------: |
|      ```192.168.1.1```       |       |      ```200.1.1.1```       |

（２）『送信元プライベートIPアドレス』『宛先グローバルIPアドレス』『メールサーバーでPOP3プロトコルを受信する```110```番ポート』を指定して、メールサーバーにリクエストを送信する。

```yaml
GET https://example.com:110
```

（３）『送信元プライベートIPアドレス』『宛先グローバルIPアドレス』『webサーバーでHTTPプロトコルを受信する```80```番ポート』を指定して、webサーバーにリクエストを送信する。ただし。```80```番ポートは、省略可能。

```yaml
GET https://example.com:80
```

（４）『送信元プライベートIPアドレス』『宛先グローバルIPアドレス』『DNSサーバーでTCPプロトコルを受信する```53```番ポート』を指定して、DNSサーバーにリクエストを送信する。

```yaml
GET https://example.com:53
```

（５）これらの『送信元プライベートIPアドレス』が、NATルーターで、グローバルIPアドレスに変換される。

<br>

### NAPTルーター

#### ▼ NAPTルーターとは

NAPTの能力を持つルーターのこと。

#### ▼ NAPT（動的NAT、IPマスカレード）：Network Address Port Translation

![napt-router](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/napt-router.png)

| 設置場所                                                 | 能力                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| パブリックネットワークとプライベートネットワークの境目   | NAPTルーターがグローバルIPアドレスを持ち、パブリックネットワークとプライベートネットワークの双方向に対する通信時に、プライベートIPアドレスに相互変換する。 |
| プライベートネットワークとプライベートネットワークの境目 | NAPTルーターがプライベートIPアドレスを持ち、プライベートネットワークとプライベートネットワークの双方向に対する通信時に、プライベートIPアドレスに相互変換する。 |

『IPマスカレード』ともいう。種類の異なるネットワーク間で、IPアドレスとポート番号を変換すること。```1```個のIPアドレスに対して、複数の内部IPアドレスを紐付けられる。AWSやGCPなどで使用されているようなNATルーターはこちらであり、IPアドレスとポート番号の両方を指定することにより、VPC内のプライベートIPアドレスに単一のパブリックIPアドレスを割り当てるようになっている。

> ℹ️ 参考：
>
> - https://www.vtv.co.jp/intro/mcu/about_mcu9-3.html
> - https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q1282815592

#### ▼ DNAT時の変換

プライベートネットワークから出る時に、パケットのヘッダ情報における『送信元』のプライベートIPアドレスをグローバルIPアドレスに変換する。ただし、異なるプライベートIPアドレスが同じグローバルIPに変換されてしまうため、これを識別するために、ポート番号を複数の異なるポート番号に変換し、グローバルIPアドレスに付け加える。

**＊例＊**

| 送信元プライベートIPアドレス | 変換前ポート番号 |   ⇄   | 送信元グローバルIPアドレス | 変換後ポート番号 |
| :--------------------------: | :--------------: |:-----:| :------------------------: | :--------------: |
|      ```192.168.2.1```       |   ```50011```    |       |   ```130.X.X.X:50011```    |   ```50011```    |
|      ```192.168.3.1```       |   ```50011```    |       |   ```130.X.X.X:50012```    |   ```50012```    |

![napt変換](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/napt変換.png)

#### ▼ SNAT時の変換

プライベートネットワークに入る時に、付け加えられたポート番号を元に、パケットのヘッダ情報における『宛先』のグローバルIPアドレスを、異なるプライベートIPアドレスに変換し分ける。

![napt変換_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/napt変換_2.png)

<br>

## 02-03. フォワード/リバースプロキシサーバー

### 能力

#### ▼ 代理ルーティング

![フォワードプロキシサーバーとリバースプロキシサーバー](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/フォワードプロキシサーバーとリバースプロキシサーバー.png)

> ℹ️ 参考：https://qiita.com/att55/items/162950627dc593c72f23

| サーバー名                 | 能力                                                                  |
| -------------------------- |---------------------------------------------------------------------|
| フォワードプロキシサーバー | 特定のクライアントのアウトバウンド通信を、不特定多数のサーバーに代理でルーティングする。                        |
| リバースプロキシサーバー   | 不特定のクライアントからのインバウンド通信を、特定のサーバーに代理でルーティングする。また、ロードバランサーのように負荷分散もできる。 |

#### ▼ キャッシュ

![プロキシサーバーのキャッシュ能力](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/プロキシサーバーのキャッシュ能力.png)

> ℹ️ 参考：https://software.fujitsu.com/jp/manual/manualfiles/M100003/B1WN9491/07Z201/ihs02/ihs00016.htm

| サーバー名                 | 能力                                                         |
| -------------------------- | ------------------------------------------------------------ |
| フォワードプロキシサーバー | クライアント側にて、代理ルーティングのレスポンスのキャッシュを作成する。 |
| リバースプロキシサーバー   | サーバー側にて、代理ルーティングのレスポンスのキャッシュを作成する。 |

<br>

### 設置場所

#### ▼ 物理サーバーの場合

フォワードプロキシサーバーはプロバイダの会社に、リバースプロキシサーバーはリクエスト先の社内ネットワークに設置されている。

![proxy-server](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/proxy-server.png)

#### ▼ クラウド上の場合

クラウドの場合も、仮想環境が作成されるだけで、設置場所は同じである。

<br>

## 03. WAN：Wide Area Network

### WANとは

![network_wan](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network_wan.png)

異なるLAN間のハブになるネットワークのこと。インターネットサービスプロバイダーがサービスとして提供している。WAN内では、各LANはグローバルIPアドレスで識別されている。各LANがWANに接続するためには、DTE（例：ブロードバンドルーター、Wifiルーター）、DCE（例：モデム）、電柱にあるアクセス回線、が必要になる。

> ℹ️ 参考：
>
> - https://qiita.com/hymnofpeace/items/7f09a7a10e843552a8cb
> - https://xtech.nikkei.com/it/article/COLUMN/20080715/310872/

<br>

### WANの歴史

![network_wan_history](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network_wan_history.png)

<br>

### WANの種類

#### ▼ 専用線方式

データの送信元と宛先が決まっており、特定のユーザーがアクセス回線を専有する。他のLANから閉じられた専用のアクセス回線であり、特定のLAN間でのみデータ通信を行う。

> ℹ️ 参考：http://makiyamashinji.web.fc2.com/emprus/design/wan.html

#### ▼ 回線交換方式

データの送信元と宛先が決まっておらず、複数のユーザーでWAFを共有する。ただし、特定のユーザーのデータがアクセス回線を通過している間、他のユーザーはアクセス回線を使用できない。少数対少数でデータ通信を行うため、送信時に、送信者と受信者の宛先情報は不要である。

> ℹ️ 参考：
>
> - https://www.itpassportsiken.com/kakomon/28_haru/q71.html
> - https://www.infraexpert.com/study/wan3.html

![waf_circuit-switching-system](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/waf_circuit-switching-system.png)

#### ▼ パケット交換方式

パケット化されたデータの送信元と宛先が決まっておらず、複数のユーザーでWAFを共有する。複数のユーザーでアクセス回線を同時に使用できる。対多数でデータ通信を行うため、送信時に、送信者と受信者の宛先情報が必要になる。

> ℹ️ 参考：
>
> - https://www.itpassportsiken.com/kakomon/28_haru/q71.html
> - https://www.infraexpert.com/study/wan3.html

![waf_packet-switching-system](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/waf_packet-switching-system.png)

<br>


## 04. 通信の方向/位置

### インバウンド/アウトバウンド

![inbound_outbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/inbound_outbound.png)

サーバーを中心とした方向で通信を見た時、サーバーに流入する方向をインバウンドという。反対に、サーバーから流出する方向をアウトバウンドという。

> ℹ️ 参考：
>
> - https://www.amazon.co.jp/dp/B0043D2EKO/
> - https://www.oreilly.com/library/view/http-the-definitive/1565925092/ch03s01.html

<br>

### アップストリーム/ダウンストリーム

![upstream_downstream](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/upstream_downstream.png)

通信の送受信全体の中の位置で通信を見た時、通信が送信された前半の位置を相対的にアップストリームという。反対に、通信が受信される後半の位置を相対的にダウンストリームという。

> ℹ️ 参考：
>
> - https://www.amazon.co.jp/dp/B0043D2EKO/
> - https://www.oreilly.com/library/view/http-the-definitive/1565925092/ch03s01.html

<br>

## 05. ネットワーク速度の指標

### 指標の種類

| 指標名                      | 説明                                                         | 補足                                                  |
| --------------------------- | ------------------------------------------------------------ |-----------------------------------------------------|
| レスポンスタイム            | リクエストを送信してから、サーバーが処理を実行し、レスポンスが返信されるまでに要する時間のこと。 |                                                     |
| レイテンシー                | リクエストを送信してから、レスポンスが返信されるまで要する時間のこと。サーバーの処理時間は含まない。 |                                                     |
| Connection Time（接続時間） | リクエストを送信する前に、サーバーとのTCP接続の確立に要する時間のこと。 | リクエストとレスポンスの送受信の前後に行われるTCP接続の確立を『スリーウェイハンドシェイク』という。 |
| Bandwidth（帯域幅）         | 一度に送受信できるデータの最大サイズのこと。                   | 帯域幅が狭いと、ダウンロードやアップロードに時間がかかる。                       |
| スループット（伝送速度）    | 単位時間当たりの送信できる最大のデータサイズのこと。           | 他からの影響を受けた実際のスループットを『実効スループット』という。                  |

<br>

### スループット（伝送速度）

#### ▼ 伝送とは

サーバーからクライアントPCにデータを送信すること。相互の送信は、通信と呼ぶ。

#### ▼ スループットとは

単位時間当たりの送信できる最大のデータサイズのこと。実際には、スループットは、『プロバイダ』、『光回線』、『自宅の有線/無線』の```3```個に影響されるため、スループットで期待されるデータサイズを満たせないことが多い。実際のスループットを『実効スループット』という。

![伝送速度](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/伝送速度.png)

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
