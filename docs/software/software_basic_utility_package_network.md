---
title: 【IT技術の知見】ネットワーク系＠パッケージ
description: ネットワーク系＠パッケージの知見を記録しています。
---

# ネットワーク系＠パッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. dig

### digとは

正引きの名前解決を実行する

> ↪️：
>
> - https://qiita.com/hypermkt/items/610b5042d290348a9dfa#%E3%83%98%E3%83%83%E3%83%80%E3%83%BC
> - https://dev.classmethod.jp/articles/dig-route53-begginer/

```bash
$ dig yahoo.co.jp

# Header
# 各セクションのステータスやフラグが表示される。
; <<>> DiG 9.10.6 <<>> yahoo.co.jp
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 23877 # 『NOERROR』は、正引きが成功したことを表す。
;; flags: qr rd ra; QUERY: 1, ANSWER: 8, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 512

# Questionセクション
;; QUESTION SECTION:
;yahoo.co.jp.                   IN      A # Aレコードを問い合わせたことを表す。

# Answerセクション
# DNSレコード
;; ANSWER SECTION:
yahoo.co.jp.            35      IN      A       182.22.28.252 # 正引きで返却されたIPアドレスを表す。
yahoo.co.jp.            35      IN      A       182.22.16.251
yahoo.co.jp.            35      IN      A       183.79.217.124
yahoo.co.jp.            35      IN      A       183.79.219.252
yahoo.co.jp.            35      IN      A       183.79.250.123
yahoo.co.jp.            35      IN      A       182.22.25.124
yahoo.co.jp.            35      IN      A       183.79.250.251
yahoo.co.jp.            35      IN      A       182.22.25.252

# 正引きにかかった時間を表す。
;; Query time: 7 msec
# 正引きに利用したDNSサーバーを表す。
# digコマンドのパラメーターでDNSサーバーを指定しない場合、digコマンドの実行元によって、異なるDNSサーバーが利用される。
;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: Mon May 30 22:33:44 JST 2022
;; MSG SIZE  rcvd: 168

```

<br>

### -x

逆引きの名前解決を実行する。

> - https://atmarkit.itmedia.co.jp/ait/articles/1409/25/news001.html

```bash
$ dig -x 182.22.28.252

; <<>> DiG 9.10.6 <<>> -x 182.22.28.252
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 9847
;; flags: qr rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 512
;; QUESTION SECTION:
;252.28.22.182.in-addr.arpa.    IN      PTR

# AUTHORITYセクション
# 権威DNSサーバーを表す。ドメイン名がわかる。
;; AUTHORITY SECTION:
28.22.182.in-addr.arpa. 663     IN      SOA     yahoo.co.jp. postmaster.yahoo.co.jp. 2202070000 1800 900 1209600 900

;; Query time: 7 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: Mon May 30 22:47:07 JST 2022
;; MSG SIZE  rcvd: 113
```

<br>

## 02. dnsutils/bind-utils

### インストール

#### ▼ aptリポジトリから

```bash
$ apt install dnsutils
```

```bash
$ apt-get install dnsutils
```

#### ▼ yumリポジトリから

```bash
$ yum install -y bind-utils
```

<br>

### nslookup

#### ▼ nslookupとは

正引き/逆引きによる名前解決を行う。

もしドメイン名に複数のIPアドレスが割り当てられている場合、正引きを行うと、全てのIPアドレスが返却される。

#### ▼ オプション無し

> - https://qiita.com/toshihirock/items/1ff01a51570bf6ca4f59

**＊例＊**

```bash
# 正引き
$ nslookup google.co.jp

# 非権威DNSサーバー (キャッシュDNSサーバー) からの返信
Non-authoritative answer:
Server:  UnKnown
Address:  2400:2650:7e1:5a00:1111:1111:1111:1111

Name:  google.co.jp
Addresses:  2404:6800:4004:80f::2003 # IPv6アドレス
            172.217.175.3            # IPv4アドレス
```

```bash
# 逆引き
$ nslookup 172.217.175.3

Server:  UnKnown
Address:  2400:2650:7e1:5a00:1111:1111:1111:1111

Name:  nrt20s18-in-f3.1e100.net # IPv4アドレスにマッピングされたドメイン名
Address:  172.217.175.3 # IPv4アドレス
```

権威DNSサーバーを使用して名前解決する場合、引数なしで`nslookup`コマンドを実行する。

> ↪️：
>
> - http://linux.kororo.jp/cont/server/nslookup_dns.php
> - https://qiita.com/toshihirock/items/1ff01a51570bf6ca4f59

```bash
$ nslookup

# 入力を求められるため、権威DNSサーバーを指定する。
>  server ns1.google.com
Default server: ns1.google.com
Address: 216.239.32.10#53
Default server: ns1.google.com
Address: 2001:4860:4802:32::a#53

# 入力を求められるため、権威DNSサーバーにドメインを問い合わせる。
> google.co.jp
Server:         ns1.google.com
Address:        216.239.32.10#53

Name:   google.co.jp
Address: 142.251.42.131
```

#### ▼ -type

正引き/逆引きによる名前解決を行い、この時に指定したDNSレコードタイプのレコード値を返却させる。

**＊例＊**

名前解決を行い、NSレコード値を返却させる。

```bash
$ nslookup -type=NS google.co.jp

Non-authoritative answer:
Server:  UnKnown
Address:  2400:2650:7e1:5a00:1111:1111:1111:1111

google.co.jp    nameserver = ns3.google.com
google.co.jp    nameserver = ns4.google.com
google.co.jp    nameserver = ns2.google.com
google.co.jp    nameserver = ns1.google.com

ns1.google.com  AAAA IPv6 address = 2001:4860:4802:32::a
ns2.google.com  AAAA IPv6 address = 2001:4860:4802:34::a
ns3.google.com  AAAA IPv6 address = 2001:4860:4802:36::a
ns4.google.com  AAAA IPv6 address = 2001:4860:4802:38::a
ns1.google.com  internet address = 216.239.32.10
ns2.google.com  internet address = 216.239.34.10
ns3.google.com  internet address = 216.239.36.10
ns4.google.com  internet address = 216.239.38.10
(root)  ??? unknown type 41 ???
```

<br>

## 03. net-tools

### インストール

#### ▼ aptリポジトリから

```bash
$ apt install net-tools
```

```bash
$ apt-get install net-tools
```

#### ▼ yumリポジトリから

```bash
$ yum install -y net-tools
```

<br>

### 接続状態の一覧

> - https://atmarkit.itmedia.co.jp/ait/articles/0207/20/news003.html

<br>

### netstat

#### ▼ -plunt

オプション (`-p`、`-l`、`-u`、`-n`、`-t`) の組み合わせ。各プロセスが開放しているポート番号、ポート番号で受信するプロトコル、接続状態、などの一覧を取得する。

> - https://askubuntu.com/questions/721306/how-many-ports-opened-by-a-single-application

```bash
$ netstat -plunt

Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:15090           0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:15090           0.0.0.0:*               LISTEN      -
tcp        0      0 127.0.0.1:15000         0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:15001           0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:15001           0.0.0.0:*               LISTEN      -
tcp        0      0 127.0.0.1:15004         0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:15006           0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:15006           0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:15021           0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:15021           0.0.0.0:*               LISTEN      -
tcp6       0      0 :::9000                 :::*                    LISTEN      1/php-fpm: master p
tcp6       0      0 :::15020                :::*                    LISTEN      -
```

<br>

## 04. speedtest-cli

### インストール

#### ▼ aptリポジトリから

```bash
$ apt install speedtest-cli
```

#### ▼ brewリポジトリから

```bash
$ brew install speedtest-cli
```

<br>

### speedtest-cliとは

SPEEDTESTのAPIを使用して、ダウンロード (下り) とアップロード (上り) の通信速度を解析する。

```bash
$ speedtest-cli

Testing download
Download: 168.61 Mbit/s # ダウンロード速度

Testing upload
Upload: 182.00 Mbit/s # アップロード速度
```

> - https://www.speedtest.net/ja

<br>

## 05. tcpdump

### インストール

#### ▼ aptリポジトリから

```bash
$ apt install tcpdump
```

```bash
$ apt-get install tcpdump
```

#### ▼ yumリポジトリから

```bash
$ yum install -y tcpdump
```

<br>

### tcpdumpとは

今現在処理されているパケット (インバウンド通信とアウトバウンド通信) の情報を取得する。

パケットの送信元と宛先から、送信元からの通信 (`ping`、`nc`、`curl`、など) が届いているかを確認する。

最初の`3`行はスリーウェイハンドシェイクを表す。

```bash
$ tcpdump

[時間] IP [送信元IPアドレス].[シーケンス番号] > [宛先サーバー].[ポート番号]: [パケットの説明]
```

> ↪️：
>
> - http://blog.livedoor.jp/sonots/archives/18239717.html
> - https://please-sleep.cou929.nu/tcpdump-study-pt1.html
> - https://www.ecoop.net/memo/archives/detect_ping_with_tcpdump.html

インバウンド通信のみ、あるいはアウトバウンド通信のみのパケットを取得するのはやや面倒である。

> - https://stackoverflow.com/questions/10300656/capture-incoming-traffic-in-tcpdump

**＊例＊**

スリーウェイハンドシェイクのパケットの例。

> - https://please-sleep.cou929.nu/tcpdump-study-pt1.html

```bash
# クライアントからサーバーへのSYNCリクエスト
09:36:20.760358 IP 10.0.1.23.65428 > 93.184.216.119.http: Flags [S], seq 2250708012, win 65535, options [mss 1460,nop,wscale 4,nop,nop,TS val 938288017 ecr 0,sackOK,eol], length 0

# サーバーからクライアントへのACKリクエストとSYNリクエスト
09:36:20.885412 IP 93.184.216.119.http > 10.0.1.23.65428: Flags [S.], seq 1676582138, ack 2250708013, win 14600, options [mss 1400,nop,nop,sackOK,nop,wscale 6], length 0

# クライアントからサーバーへのACKリクエスト
09:36:20.885482 IP 10.0.1.23.65428 > 93.184.216.119.http: Flags [.], ack 1, win 16384, length 0
```

<br>

`awk`コマンドや`grep`コマンドと組み合わせると、特定のIPアドレスを送信元/宛先としたパケットがあるか否かを検出できる。

```bash
$ tcpdump <コマンド/オプション> \
    | awk -F ' ' '{print $3}' \
    | grep <特定のIPアドレス>
```

**＊例＊**

`ping`コマンドの宛先で、通信を受信できていることを確認する。

> - https://protocol.nekono.tokyo/2017/03/15/tcp-dump%E3%81%A7ping%E3%81%AE%E5%8F%97%E4%BF%A1%E3%82%92%E7%A2%BA%E8%AA%8D/

```bash
# デフォルトでは、eth0のパケットを確認する。。
$ tcpdump icmp -i eth0
```

<br>

### -i <ネットワークインターフェース名>

指定したネットワークインターフェースにて、パケットの内容を取得する。`-i`オプションを使用しない場合、全てのネットワークインターフェースが扱うパケットを取得することになる。

```bash
$ tcpdump -i eth0
```

> - https://qiita.com/tossh/items/4cd33693965ef231bd2a

<br>

### -nn <プロトコル名>

全てのネットワークインターフェースにて、指定したプロトコルを使用したパケットの内容を取得する。

> - https://go-journey.club/archives/1472

```bash
$ tcpdump -nn ip
```

<br>

### -nn

#### ▼ port

全てのネットワークインターフェースにて、指定したポート番号に対するパケットの内容を取得する。

> - https://go-journey.club/archives/1472

```bash
$ tcpdump -nn port 80
```

<br>

### dst

#### ▼ dst

パケットを宛先情報でフィルタリングし、パケットを取得する。

> - https://orebibou.com/ja/home/201505/20150525_001/

#### ▼ port

指定したポート番号を宛先とするパケットのみを取得する。

```bash
$ tcpdump dst port 80
```

<br>

### src

#### ▼ src

パケットを送信元情報でフィルタリングし、パケットを取得する。

> - https://orebibou.com/ja/home/201505/20150525_001/

#### ▼ port

指定したポート番号を送信元とするパケットのみを取得する。

```bash
$ tcpdump src port 80
```

<br>

## 06. traceroute

### tracerouteとは

宛先にUDPプロトコル/ICMPプロトコル (デフォルトはUDPプロトコル) でパケットを送信し、通信の送信元から宛先までに通過するルーターの送信元IPアドレスを取得する。

![traceroute](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/traceroute.png)

> ↪️：
>
> - https://webkaru.net/linux/traceroute-command/
> - https://faq2.bit-drive.ne.jp/support/traina-faq/result/19-1647?ds=&receptionId=2760&receptionNum=1607536654139&page=1&inquiryWord=&categoryPath=102&selectedDataSourceId=&sort=_score&order=desc&attachedFile=false
> - https://beginners-network.com/tracert_traceroute.html

**＊例＊**

UDPプロトコルを使用して、パケットを送信する。

もし、`traceroute`コマンドが終了すれば、全てのルーターを経由できていることを表す。

```bash
$ traceroute google.com

traceroute to google.com (173.194.38.98), 30 hops max, 60 byte packets # 最大30ホップ数 (ルーター数)
 1  example.com (aaa.bbb.ccc.ddd)  1.016 ms  2.414 ms  2.408 ms # 最初のルーターの送信元IPアドレス

 ...

 8  209.85.251.239 (209.85.251.239)  2.357 ms  2.595 ms  2.475 ms # 最後のルーターの送信元IPアドレス
 9  nrt19s18-in-f2.1e100.net (173.194.38.98)  1.812 ms  1.849 ms  1.955 ms # 宛先のサーバー
```

```bash
$ traceroute 173.194.38.98

traceroute to 173.194.38.98 (173.194.38.98), 30 hops max, 60 byte packets # 最大30ホップ数 (ルーター数)
 1  example.com (aaa.bbb.ccc.ddd)  1.016 ms  2.414 ms  2.408 ms # 最初のルーターの送信元IPアドレス

 ...

 8  209.85.251.239 (209.85.251.239)  2.357 ms  2.595 ms  2.475 ms # 最後のルーターの送信元IPアドレス
 9  nrt19s18-in-f2.1e100.net (173.194.38.98)  1.812 ms  1.849 ms  1.955 ms # 宛先のサーバー
```

アスタリスクは検証が実行中であることを表し、アスタリスクのまま変わらない場合は、それ以降のルーターに通信が届いていない可能性がある。

```bash
$ traceroute google.com

traceroute to google.com (173.194.38.98), 30 hops max, 60 byte packets
 1  example.com (aaa.bbb.ccc.ddd)  1.016 ms  2.414 ms  2.408 ms # 最初のルーターの送信元IPアドレス

...

 4  b-4ea-b13-1-e-0-1-0.interq.or.jp (210.172.131.149)  2.227 ms  2.218 ms  # このルーターまでは届く
 5  *  *  *                                                                 # その後失敗
 6  *  *  *
...
```

> - https://milestone-of-se.nesuke.com/nw-basic/ip/traceroute/

<br>

### -I

ICMPプロトコルを使用して、パケットを送信する。

TCPプロトコルの一種である。

**＊例＊**

```bash
$ traceroute -I -n google.com -p 443

$ traceroute -I -n *.*.*.* -p 443
```

<br>

### -n

IPアドレスの名前解決を実行せずに、ルーターの送信元IPアドレスをそのまま取得する。

ネットワークの境目がわかりやすくなる。

**＊例＊**

```bash
$ traceroute -n google.com

traceroute to google.com (173.194.38.105), 30 hops max, 60 byte packets
 1  157.7.140.2  0.916 ms  1.370 ms  1.663 ms # 最初のルーターの送信元IPアドレス
 2  210.157.9.233  0.633 ms  0.735 ms  0.740 ms # ここで、異なるネットワーク領域に入った可能性
 3  210.157.9.209  0.718 ms  0.722 ms  0.761 ms
 4  210.172.131.149  1.520 ms  1.894 ms  1.892 ms
 5  210.172.131.118  0.652 ms  0.645 ms  0.619 ms
 6  210.171.224.96  1.499 ms  1.705 ms  1.587 ms
 7  209.85.243.58  1.575 ms  1.558 ms  1.557 ms # ここで、異なるネットワーク領域に入った可能性
 8  209.85.251.239  2.383 ms  2.740 ms  2.400 ms
 9  173.194.38.105  2.165 ms  1.719 ms  1.840 ms # 最後のルーター
```

> ↪️：
>
> - https://webkaru.net/linux/traceroute-command/
> - https://faq2.bit-drive.ne.jp/support/traina-faq/result/19-1647?ds=&receptionId=2760&receptionNum=1607536654139&page=1&inquiryWord=&categoryPath=102&selectedDataSourceId=&sort=_score&order=desc&attachedFile=false

<br>

### -p

ポート番号を指定する。

デフォルト値は、`33434`番ポートである。

**＊例＊**

```bash
$ traceroute *.*.*.* -p 9000
```

<br>

### -T

宛先にTCPプロトコル (例：HTTP、HTTPS) でパケットを送信し、通信の送信元から宛先までに通過するルーターの送信元IPアドレスを取得する。

`traceroute`コマンドではUDPプロトコルで送信するため、ネットワークが正常でもそれ以外 (ファイアウォールなど) のところで通信できない場合がある。

**＊例＊**

```bash
$ traceroute google.com -T -p 443

$ traceroute *.*.*.* -T -p 443
```

<br>

## 06-02. tracerouteの代わり

### tracepath

> - https://qiita.com/chellwo/items/d81f35944aec09bd9a84#tracepath

**＊例＊**

```bash
$ tracepath -n google.com

1: [LOCALHOST]                                       pmtu 9001
1:  *.*.*.*                                           0.200ms pmtu 1500
1:  no reply
2:  no reply
3:  no reply
4:  no reply
5:  no reply
```

<br>

### tcptraceroute

#### ▼ tcptracerouteとは

`traceroute`コマンドのバージョンによっては、`-T`オプションがない場合があり、代わりとして`tcptraceroute`コマンドを使用する。

> - https://succzero.hatenablog.com/entry/2013/09/01/181615

**＊例＊**

```bash
$ tcptraceroute google.com 443
```

#### ▼ -s、-p

送信元のIPアドレスやポート番号を指定する。

宛先ではないことに注意する。

```bash
$ tcptraceroute *.*.*.* -p 80
```

<br>
