---
title: 【IT技術の知見】ネットワーク系＠パッケージ
description: ネットワーク系＠パッケージの知見を記録しています。
---

# ネットワーク系＠パッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. dnsutils/bind-utils

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

正引き/逆引きによる名前解決を行う。もしドメイン名に複数のIPアドレスが割り当てられている場合、正引きを行うと、全てのIPアドレスが返却される。

#### ▼ オプション無し

> ℹ️ 参考：https://qiita.com/toshihirock/items/1ff01a51570bf6ca4f59

**＊例＊**

```bash
# 正引き
$ nslookup google.co.jp

# 非権威DNSサーバー（キャッシュDNSサーバー）からの返信
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

権威DNSサーバーを使用して名前解決する場合、引数なしで```nslookup```コマンドを実行する。

> ℹ️ 参考：
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

正引き/逆引きによる名前解決を行い、この時に指定したレコードタイプのレコード値を返却させる。

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

## 02. net-tools

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

> ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/0207/20/news003.html

<br>

### netstat

#### ▼ -plunt

オプション（```-p```、```-l```、```-u```、```-n```、```-t```）の組み合わせ。各プロセスが開放しているポート番号、ポート番号で受信するプロトコル、接続状態、などの一覧を取得する。

> ℹ️ 参考：https://askubuntu.com/questions/721306/how-many-ports-opened-by-a-single-application

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

## 03. tcpdump

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

### speedtest-cli

SPEEDTESTのAPIを使用して、ダウンロード（下り）とアップロード（上り）の通信速度を解析する。

> ℹ️ 参考：https://www.speedtest.net/ja

```bash
$ speedtest-cli

Testing download 
Download: 168.61 Mbit/s # ダウンロード速度

Testing upload 
Upload: 182.00 Mbit/s # アップロード速度
```

<br>

### tcpdumpとは

今現在処理されているパケット（インバウンド通信とアウトバウンド通信）の情報を取得する。パケットの送信元と宛先がわかる。最初の３行はスリーウェイハンドシェイクを表す。

> ℹ️ 参考：
>
> - http://blog.livedoor.jp/sonots/archives/18239717.html
> - https://please-sleep.cou929.nu/tcpdump-study-pt1.html

```bash
$ tcpdump

[時間] IP [送信元IPアドレス].[シーケンス番号] > [宛先サーバー].[ポート番号]: [パケットの説明]
```

インバウンド通信のみ、あるいはアウトバウンド通信のみのパケットを取得するのはやや面倒である。

> ℹ️ 参考：https://stackoverflow.com/questions/10300656/capture-incoming-traffic-in-tcpdump

**＊例＊**

スリーウェイハンドシェイクのパケットの例。

> ℹ️ 参考：https://please-sleep.cou929.nu/tcpdump-study-pt1.html

```bash
# クライアントからサーバーへのSYNCリクエスト
09:36:20.760358 IP 10.0.1.23.65428 > 93.184.216.119.http: Flags [S], seq 2250708012, win 65535, options [mss 1460,nop,wscale 4,nop,nop,TS val 938288017 ecr 0,sackOK,eol], length 0

# サーバーからクライアントへのACKリクエストとSYNリクエスト
09:36:20.885412 IP 93.184.216.119.http > 10.0.1.23.65428: Flags [S.], seq 1676582138, ack 2250708013, win 14600, options [mss 1400,nop,nop,sackOK,nop,wscale 6], length 0

# クライアントからサーバーへのACKリクエスト
09:36:20.885482 IP 10.0.1.23.65428 > 93.184.216.119.http: Flags [.], ack 1, win 16384, length 0
```

<br>

```awk```コマンドや```grep```コマンドと組み合わせると、特定のIPアドレスを送信元/宛先としたパケットがあるか否かを検出できる。

```bash
$ tcpdump <コマンド/オプション> \
    | awk -F ' ' '{print $3}' \
    | grep <特定のIPアドレス>
```

<br>

### -i <ネットワークインターフェース名>

指定したネットワークインターフェースにて、パケットの内容を取得する。```-i```オプションを使用しない場合、全てのネットワークインターフェースが扱うパケットを取得することになる。

> ℹ️ 参考：https://qiita.com/tossh/items/4cd33693965ef231bd2a

```bash
$ tcpdump -i eth0
```

<br>

### -nn <プロトコル名>

全てのネットワークインターフェースにて、指定したプロトコルを使用したパケットの内容を取得する。

> ℹ️ 参考：https://go-journey.club/archives/1472

```bash
$ tcpdump -nn ip
```

<br>

### -nn

#### ▼ port

全てのネットワークインターフェースにて、指定したポート番号に対するパケットの内容を取得する。

> ℹ️ 参考：https://go-journey.club/archives/1472

```bash
$ tcpdump -nn port 80
```

<br>

### dst

#### ▼ dst

パケットを宛先情報でフィルタリングし、パケットを取得する。

> ℹ️ 参考：https://orebibou.com/ja/home/201505/20150525_001/

#### ▼ port

指定したポート番号を宛先とするパケットのみを取得する。

```bash
$ tcpdump dst port 80
```

<br>

### src

#### ▼ src

パケットを送信元情報でフィルタリングし、パケットを取得する。

> ℹ️ 参考：https://orebibou.com/ja/home/201505/20150525_001/

#### ▼ port

指定したポート番号を送信元とするパケットのみを取得する。

```bash
$ tcpdump src port 80
```

<br>

## 
