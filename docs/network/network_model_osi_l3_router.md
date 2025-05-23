---
title: 【IT技術の知見】ルーター＠L3
description: ルーター＠L3の知見を記録しています。
---

# ルーター＠L3

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ルーター

### ルーターとは

異なるネットワーク間 (LANとLAN、LANとWANなど) で通信できるようにし、加えて同時に複数の宛先に通信をルーティングする。

<br>

### ルーティング

#### ▼ ルーティングとは

受信した通信を適切な宛先にフォワーディングすること。

通信の宛先を制御することを表す場合、単に『フォワーディングする』よりも『ルーティングする』と表現した方が良い。

> - https://www.infraexpert.com/study/routing.html

#### ▼ パスベースルーティング

URLを基点としたパスに応じて、通信のルーティング先を決める。

ホストベースルーティングと組み合わせることもできる。

#### ▼ ホストベースルーティング

`Host`ヘッダー値に応じて、通信のルーティング先を決める。

パスベースルーティングと組み合わせることもできる。

#### ▼ 割合ベースルーティング

設定した振り分け率に応じて、通信のルーティング先を決める。

カナリアリリース、ブルー/グリーンデプロイメントなどに使用する。

<br>

### 配置場所

ルーターは、パブリックネットワーク、各プライベートネットワークの入り口、各プライベートネットワーク間の共有の境界地点、に配置する。

プライベートネットワークの入り口に配置する場合、例えば、自宅内に配置するルーターがある。

インターネットサービスプロバイダーから貸出されるモデムでアナログ信号をデジタル信号に変換した後、これにルーターを接続し、自宅内/外のネットワークを繋ぐ。

![router](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/router.png)

> - https://xtech.nikkei.com/atcl/nxt/column/18/01842/032200010/
> - https://michisugara.jp/modem_router

<br>

### ルーターの種類

| ルーター名                           | 配置場所                                           | 役割                                                                                                                |
| ------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| コアルーター                         | インターネットサービスプロバイダー内のネットワーク | 同じプロバイダーや異なるプロバイダーのネットワーク間を繋ぐ。                                                        |
| センタールーター                     | 一般企業内の拠点間WANネットワーク                  | 本社と支社のネットワーク間を繋ぐ。                                                                                  |
| エッジルーター (エッジゲートウェイ)  | 一般企業内の拠点間WANネットワーク                  | 異なる支社や営業所のネットワーク間を繋ぐ。                                                                          |
| ブロードバンドルーター、Wifiルーター | 自宅内のネットワーク                               | 自宅内/外のネットワーク間を繋ぐ。ブロードバンドルーターであれば有線、Wifiルーターであれば無線で接続することになる。 |

> - https://xtech.nikkei.com/atcl/nxt/column/18/00780/052700006/
> - https://book.mynavi.jp/support/pc/5081/pdf/154.pdf

<br>

### ホップ

#### ▼ ホップ数

クライアント側からサーバー側までの間に経由するルーター数のこと。

ホップ数は、`traceroute`コマンドで確認できる。

> - https://www.wdic.org/w/WDIC/%E3%83%9B%E3%83%83%E3%83%97%E6%95%B0

#### ▼ ホップバイホップルーティング

ネットワーク内でルーターがルーターに通信をルーティングする時、各ルーターが最適なルーティング先を選択すること。

![router_hop-by-hop-routing](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/router_hop-by-hop-routing.jpeg)

> - https://ascii.jp/elem/000/000/444/444681/3/

<br>

## 02. NATルーター

### NATルーターとは

NAT処理を実行できるルーターのこと。

<br>

### NAT (静的NAT) 処理：Network Address Translation

#### ▼ NAT処理とは

| 配置場所                                                 | 処理                                                                                                                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| パブリックネットワークとプライベートネットワークの境目   | NATルーターがグローバルIPアドレスを持ち、パブリックネットワークとプライベートネットワークの双方向に対する通信時、プライベートIPアドレスに相互変換する。     |
| プライベートネットワークとプライベートネットワークの境目 | NATルーターがプライベートIPアドレスを持ち、プライベートネットワークとプライベートネットワークの双方向に対する通信時、プライベートIPアドレスに相互変換する。 |

種類の異なるネットワーク間で、IPアドレスを相互変換する。

`1`個のIPアドレスに対して、`1`個の内部IPアドレスを紐付けられる。

図で言う上側のアウトバウンド通信時の送信元IPアドレスの変換を『SNAT処理』といい、下側のインバウンド通信時の宛先IPアドレスの変換を『DNAT処理』という。

`1`個の通信で両方が必要である。

![nat-router](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/nat-router.png)

> - https://www.vtv.co.jp/intro/mcu/about_mcu9-3.html
> - https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q1282815592

#### ▼ DNAT処理：Destination NAT

NAT処理のうち、宛先IPアドレスを変換すること (`グローバルIPアドレス` ➡️ `プライベートIPアドレス`、`プライベートIPアドレス` ➡️ `プライベートIPアドレス`) 。

NATルーター自体を複数のプライベートネットワークで共有することがある。

![グローバルからプライベートへのnat変換](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/グローバルからプライベートへのnat変換.png)

> - https://rainbow-engine.com/dnat-snat-difference/

**＊例＊**

NATルーターは、プライベートネットワークに入る時、パケットのヘッダー情報における『宛先』のグローバルIPアドレスをプライベートIPアドレスに変換する。

#### ▼ SNAT処理：Source NAT

![プライベートからグローバルへのnat変換](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/プライベートからグローバルへのnat変換.png)

NAT処理のうち送信元IPアドレスを変換すること (`プライベートIPアドレス` ➡️ `グローバルIPアドレス`、`プライベートIPアドレス` ➡️ `プライベートIPアドレス`) 。

NATルーター自体を複数のプライベートネットワークで共有することがある。

**＊例＊**

`(1)`

: NATルーターは、プライベートネットワークから出る時、パケットのヘッダー情報における『送信元』のプライベートIPアドレスをグローバルIPアドレスに変換する。

     例えば、GoogleでWebページを見ながら、Gmailアプリケーションを稼働している場合、リクエストにおけるパケット情報として…

| 送信元プライベートIPアドレス | SNAT処理による変換 | 送信元グローバルIPアドレス |
| :--------------------------: | :----------------: | :------------------------: |
|        `192.168.1.1`         |       　⇄　        |        `200.1.1.1`         |

`(2)`

: 『送信元プライベートIPアドレス』『宛先グローバルIPアドレス』『メールサーバーでPOP3プロトコルを受信する`110`番ポート』を指定して、メールサーバーにリクエストを送信する。

```yaml
GET https://example.com:110
```

`(3)`

: 『送信元プライベートIPアドレス』『宛先グローバルIPアドレス』『WebサーバーでHTTPリクエストを受信する`80`番ポート』を指定して、Webサーバーにリクエストを送信する。

     ただし、`80`番ポートは省略可能。

```yaml
GET https://example.com:80
```

`(4)`

: 『送信元プライベートIPアドレス』『宛先グローバルIPアドレス』『DNSサーバーでTCPスリーウェイハンドシェイクを受信する`53`番ポート』を指定して、DNSサーバーにリクエストを送信する。

```yaml
GET https://example.com:53
```

`(5)`

: これらの『送信元プライベートIPアドレス』が、NATルーターで、グローバルIPアドレスに変換される。

> - https://rainbow-engine.com/dnat-snat-difference/

#### ▼ 外部IPアドレス、内部IPアドレス、ターゲットIPアドレス

かなり重要。

NATルーターの文脈で、外部IPアドレス、内部IPアドレス、ターゲットIPアドレスという用語が使用されることがある。

これは、DNAT処理とSNAT処理で意味合いが異なることに注意する。

| DNAT/SNAT処理  | 外部IPアドレス                                                                                                                                                 | 内部IPアドレス                                                                                                                                | ターゲットIPアドレス                                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| DNAT処理の場合 | 外部IPアドレスをネットワークに公開し、外部IPアドレスを宛先IPアドレスとしたパケットを受信した場合に、宛先IPアドレスを内部IPアドレスに変換してルーティングする。 | NATルーターを通過した後、パケットの宛先IPアドレスを内部IPアドレスに変換する。                                                                 | 無し                                                                                                                                        |
| SNAT処理の場合 | NATルーターを通過した後、パケットの送信元IPアドレスを外部IPアドレスに変換する。NATルーターのIPアドレスを指定してパケットを送信する必要はない。                 | NATルーターが受信したパケットのうちで、指定した『送信元IPアドレス』を持つパケットのみルールを適用し、そうでないパケットはそのまま通過させる。 | NATルーターが受信したパケットのうちで、指定した『宛先IPアドレス』を持つパケットのみルールを適用し、そうでないパケットはそのまま通過させる。 |

<br>

## 03. NAPTルーター

### NAPTルーターとは

NAPTの処理を持つルーターのこと。

<br>

### NAPT (動的NAT、IPマスカレード) 処理：Network Address Port Translation

#### ▼ NAPT処理

| 配置場所                                                 | 処理                                                                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| パブリックネットワークとプライベートネットワークの境目   | NAPTルーターがグローバルIPアドレスを持ち、パブリックネットワークとプライベートネットワークの双方向に対する通信時、プライベートIPアドレスに相互変換する。     |
| プライベートネットワークとプライベートネットワークの境目 | NAPTルーターがプライベートIPアドレスを持ち、プライベートネットワークとプライベートネットワークの双方向に対する通信時、プライベートIPアドレスに相互変換する。 |

『IPマスカレード』ともいう。

種類の異なるネットワーク間で、IPアドレスとポート番号を変換すること。

`1`個のIPアドレスに対して、複数の内部IPアドレスを紐付けられる。

AWSやGCPなどで使用されているようなNATルーターはこちらであり、IPアドレスとポート番号の両方を指定することにより、VPC内のプライベートIPアドレスに単一のパブリックIPアドレスを割り当てるようになっている。

![napt-router](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/napt-router.png)

> - https://www.vtv.co.jp/intro/mcu/about_mcu9-3.html
> - https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q1282815592

#### ▼ DNAT処理の場合

プライベートネットワークから出る時、パケットのヘッダー情報における『送信元』のプライベートIPアドレスをグローバルIPアドレスに変換する。

ただし、異なるプライベートIPアドレスが同じグローバルIPに変換されてしまうため、これを識別するために、ポート番号を複数の異なるポート番号に変換し、グローバルIPアドレスに付け加える。

**＊例＊**

| 送信元プライベートIPアドレス | 変換前ポート番号 | DNAT処理による変換 | 送信元グローバルIPアドレス | 変換後ポート番号 |
| :--------------------------: | :--------------: | :----------------: | :------------------------: | :--------------: |
|        `192.168.2.1`         |     `50011`      |       　`⇄`        |     `130.X.X.X:50011`      |     `50011`      |
|        `192.168.3.1`         |     `50011`      |      　`⇄`　       |     `130.X.X.X:50012`      |     `50012`      |

![napt変換](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/napt変換.png)

#### ▼ SNAT処理の場合

プライベートネットワークに入る時、付け加えられたポート番号を元に、パケットのヘッダー情報における『宛先』のグローバルIPアドレスを、異なるプライベートIPアドレスに変換し分ける。

![napt変換_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/napt変換_2.png)

<br>

### 標準的NAPTルーター

#### ▼ iptables (Linux/Ubuntu) による標準的NAPTルーター

Linux/Ubuntuでのiptablesは、標準的なNAPTルーターかつパケットフィルタリング型ファイアウォールである。

特に、NATルーターは`/etc/sysconfig/iptables`ファイルの`nat`テーブルで設定する。

`iptables-save`コマンドでこのファイルを作成できる。

`nat`テーブルで使用できるチェイン配下の通りである。

`INPUT`と`FORWARD`は使用できない。

| `nat`テーブルで使用できるチェイン名 | 説明                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| OUTPUT                              | 送信を許可/拒否する対象のパケットを定義する。                                          |
| PREROUTING                          | 宛先IPアドレスとポートを変換する対象のパケットを定義する。ルーティング前に実行する。   |
| POSTROUTING                         | 送信元IPアドレスとポートを変換する対象のパケットを定義する。ルーティング後に実行する。 |

> - https://christina04.hatenablog.com/entry/iptables-outline

**＊例＊**

```bash
$ cat /etc/sysconfig/iptables

...

*nat
# iptableで受信したパケットに関して、宛先IPアドレスを『10.0.1.2』に、ポート番号を『80』に変換する。
-A PREROUTING -p tcp -m tcp --dport 10080 -j DNAT --to-destination 10.0.1.2:80
# iptablesから送信するパケットに関して、送信元IPアドレスを『10.0.1.3』に変換する。
-A POSTROUTING -d 10.0.1.2/32 -p tcp -m tcp --dport 80 -j SNAT --to-source 10.0.1.3
COMMIT

...
```

> - https://qiita.com/ponsuke0531/items/6b6255c0402e6ea4a950#%E8%A8%AD%E5%AE%9A%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%92%E6%9B%B8%E3%81%8F

<br>
