---
title: 【知見を記録するサイト】ネットワーク
description: ネットワークの知見をまとめました．
---

# ネットワーク

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ネットワークの全体像

### インターネット，WAN，LAN

ネットワークには，『インターネット』『WAN』『LAN』がある．家庭内LAN，学内LAN，企業内LAN，企業WANなど，さまざまなネットワークがあり，インターネットは，それぞれのネットワークを互いに接続しているネットワークである．

![インターネットとWANとLAN](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/インターネットとWANとLAN.png)

<br>

### WAN，LANの例

例えば，LANとしてEthernet，WANとしてデジタル専用線を用いる．

![WAN，wan_lan](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/wan_lan.png)

<br>

### WANの種類と歴史

![WANの歴史](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/WANの種類と歴史.png)

<br>

### グローバルネットワークとプライベートネットワーク

ルータを境に，プライベートネットワークとグローバルネットワークに分けられる．ややこしいが，ルータにはグローバルIPアドレスが割り当てられている．

![グローバルネットワークとプライベートネットワーク](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/グローバルネットワークとプライベートネットワーク.PNG)

<br>

## 02. プライベートネットワークへのデータ送信

### データ通信方法の種類

#### ・回線交換方式

  少数対少数でデータ通信を行うため，送信時に，送信者と受信者の宛先情報は必要ない．

![回線交換方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/回線交換方式.png)

#### ・パケット交換方式

  通信するデータをパケット化する．多数対多数でデータ通信を行うため，送信時に，送信者と受信者の宛先情報が必要になる．

![パケット交換方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/パケット交換方式.png)

<br>

### 通信の方向/位置

#### ・インバウンド/アウトバウンド

![inbound_outbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/inbound_outbound.png)

サーバーを中心とした方向で通信を見た時，サーバーに流入する方向をインバウンドという．反対に，サーバーから流出する方向をアウトバウンドという．

参考：

- https://www.amazon.co.jp/dp/B0043D2EKO/
- https://www.oreilly.com/library/view/http-the-definitive/1565925092/ch03s01.html

#### ・アップストリーム/ダウンストリーム

![upstream_downstream](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/upstream_downstream.png)

通信の送受信全体の中の位置で通信を見た時，通信が送信された前半の位置を相対的にアップストリームという．反対に，通信が受信される後半の位置を相対的にダウンストリームという．

参考：

- https://www.amazon.co.jp/dp/B0043D2EKO/
- https://www.oreilly.com/library/view/http-the-definitive/1565925092/ch03s01.html

<br>

### URLとメールアドレス

#### ・構造

URLとメールアドレスは完全修飾ドメイン名を持つ．

![URLと電子メールの構造](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/URLと電子メールの構造.png)

また，完全修飾ドメイン名は，ドメイン名の子関係にあるサブドメイン名を持てる．ホスト名（以下では省略されている）と，ドメイン名の間につける．

![サブドメイン](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/サブドメイン.png)

#### ・完全修飾ドメイン名によるサーバー指定

完全修飾ドメイン名は，所属ネットワークを指すドメイン名と，そのネットワークにおける具体的なサーバーを指すホスト名からなる．ただし，サーバーのホスト名が『www』である場合，クライアントはURLの指定時にホスト名を省略できる．例えば，『```www.example.com```』という完全修飾ドメイン名をURLで指定する場合，『```example.com```』としても良い．

![domain_namespace](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/domain_namespace.png)

<br>

### セグメント

#### ・セグメントの種類

プライベートネットワークは，外部公開用ネットワーク，非武装地帯，内部ネットワークに分類される．

![internal_dmz_external](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/internal_dmz_external.png)

#### ・非武装地帯のサーバーの種類

攻撃の影響が内部ネットワークに広がる可能性を防ぐために，外部から直接リクエストを受ける．そのため，『DNSサーバー』『プロキシサーバー』『Webサーバー』『メールサーバー』は，非武装地帯に設置される．

#### ・内部ネットワークのサーバーの種類

外部から直接リクエストを受けない．そのため，『DBサーバー』は，内部ネットワークに設置される．

<br>

## 03. 名前解決

### 名前解決とは

例えば，外部WebサーバーのグローバルIPアドレスが『203.142.205.139』であると知っている場合，URLのプロトコル部分以下を『```203.142.205.139```』としてリクエストすれば，外部Webサーバーが提供するサイトにアクセスできる．しかし，グローバルIPアドレスは数字の羅列であるため，人間には覚えにくい．そこで，グローバルIPアドレスの代わりに，完全修飾ドメイン名をURLの一部として用いる．

![IPアドレスと完全修飾ドメイン名のマッピング1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/IPアドレスと完全修飾ドメイン名のマッピング4.png)

<br>

### 名前解決の要素

#### ・```/etc/hosts```ファイル

ドメイン名とIPアドレスのマッピングを管理する．名前解決でDNSサーバに問い合わせる前に参照される．もし```/etc/hosts```ファイルで名前解決が行われた場合は，DNSサーバば使用されない．WebサーバーのIPアドレスがDNSサーバーに登録されていない時，またはDNSサーバーが不具合の時に，DNSサーバーの代わりとして用いる．

参考：https://www.looklinux.com/etchosts-vs-etcresolv-conf-in-linux/

**＊例＊**

```bash
127.0.0.1 localhost
255.255.255.255	broadcasthost
::1             localhost
n.n.n.n example.com
<IPアドレス> <ドメイン名>
```

#### ・```/etc/resolv.conf```ファイル

名前解決に用いるDNSサーバーのIPアドレスや，問い合わせで用いるドメイン名の後に付与する文字列を定義する．名前解決では，まず最初に，```/etc/resolv.conf```ファイルに定義されたDNSサーバに問い合わせる．

参考：https://linuc.org/study/knowledge/507/

**＊例＊**

もし，```example```というドメイン名で問い合わせを行った場合，実際には```example.foo```が使用される．また，この問い合わせに失敗した場合は，```search```値が左から順に使用される．

```bash
nameserver  n.n.n.n
domain      foo # ドメイン名の後に付与する文字列
search      bar   baz # domain値で問い合わせに失敗した場合に用いる文字列
```

```bash
$ nslookup example # 実際には，example.fooとなる
```

#### ・DNSサーバー（ネームサーバー，権威DNSサーバー）

『ネームサーバー』『権威DNSサーバー』ともいう．ドメイン名とIPアドレスのマッピングを管理する．ドメイン名を基にIPアドレスを返却させるような問い合わせを『正引き』，反対にIPアドレスを基にドメイン名を返却させるような問い合わせを『逆引き』という．

参考：https://www.quora.com/What-is-the-difference-if-any-between-DNS-server-and-name-server

#### ・キャッシュDNSサーバー

ルートサーバーは世界に13機しか存在しておらず，世界中の名前解決のリクエストを全て処理することは現実的に不可能である．そこで，IPアドレスとドメイン名の関係をキャッシュするキャッシュDNSサーバーが使用されている．基本的には，キャッシュDNSサーバーとDNSサーバーは区別される．ただし，Amazon Route53のように，キャッシュDNSサーバーとDNSサーバーの機能を両立しているものもある．

<br>

### 名前解決の仕組み

![名前解決の仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/名前解決の仕組み.png)

（１）クライアントPCは，```www.example.com```にマッピングされるIPアドレスのキャッシュを検索する．キャッシュが無ければ，クライアントPCはドメイン名をキャッシュDNSサーバーに問い合わせる．

（２）キャッシュDNSサーバーは，IPアドレスのキャッシュを検索する．キャッシュが無ければ，キャッシュDNSサーバーはドメイン名をDNSサーバーに問い合わせる．

（３）DNSサーバーは，IPアドレスを検索する．また，キャッシュDNSサーバーにこれを返却する．

|      完全修飾ドメイン名      | DNSサーバー |     IPアドレス      |
| :--------------------------: | :-------------: | :-------------------: |
| ```http://www.example.com``` |        ⇄        | ```203.142.205.139``` |

（４）キャッシュDNSサーバーは，IPアドレスをNATに返却する．この時，IPv4アドレスのネットワーク間変換が起こる．

（５）NATは，IPアドレスをクライアントPCに返却する．

（６）クライアントPCは，返却されたIPアドレスを基にWebページにリクエストを送信する．

<br>

## 04. ネットワーク速度の指標

### 指標の種類

| 指標名                      | 説明                                                         | 補足                                                         |
| --------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| レスポンスタイム            | リクエストを送信してから，サーバーが処理を実行し，レスポンスが返信されるまでに要する時間のこと． |                                                              |
| レイテンシー                | リクエストを送信してから，レスポンスが返信されるまで要する時間のこと．サーバーの処理時間は含まない． |                                                              |
| Connection Time（接続時間） | リクエストを送信する前に，サーバーとのTCP接続の確立に要する時間のこと． | リクエストとレスポンスの送受信の前後に行われるTCP接続の確立を『スリーウェイハンドシェイク』という． |
| Bandwidth（帯域幅）         | 一度に送受信できるデータの最大容量のこと．                   |                                                              |
| スループット（伝送速度）    | 単位時間当たりの送信できる最大のデータ容量のこと．           | 他からの影響を受けた実際のスループットを『実効スループット』という． |

<br>

###  スループット（伝送速度）

#### ・伝送とは

サーバーからクライアントPCにデータを送信すること．相互の送信は，通信と呼ぶ．

#### ・スループットとは

単位時間当たりの送信できる最大のデータ容量のこと．実際には，スループットは，『プロバイダ』，『光回線』，『自宅の有線/無線』の三つに影響されるため，スループットで期待されるデータ容量を満たせないことが多い．実際のスループットを『実効スループット』という．

![伝送速度](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/伝送速度.png)

#### ・伝送秒数の求め方

```
(伝送秒数)
= データ容量(bit) ÷ スループット(bit/s) × 伝送効率
```

#### ・トラフィックとは

とあるネットワーク地点でのスループットのこと．

参考：https://xtech.nikkei.com/it/article/Keyword/20070222/262872/

![トラフィック](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/トラフィック.png)

総務省のデータで，日本のブロードバンド大手5社の総トラフィックを年次でグラフ化したものがある．

参考：https://xtech.nikkei.com/atcl/nxt/column/18/00525/112900001/

![トラフィックのグラフ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/トラフィックのグラフ.png)
