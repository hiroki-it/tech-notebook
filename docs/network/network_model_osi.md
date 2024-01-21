---
title: 【IT技術の知見】OSI参照モデル＠ネットワーク＠ネットワーク
description: OSI参照モデル＠ネットワークの知見を記録しています。
---

# OSI参照モデル＠ネットワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. OSI参照モデル

### OSI参照モデルとは

ネットワークで使用されているプロトコルを`7`階層に分類したモデルこと。

<br>

### 種類

OSI参照モデルは、物理層 (`L1`) 、データリンク層 (`L2`) 、ネットワーク層 (`L3`) 、トランスポート層 (`L4`) 、セッション層 (`L5`) 、プレゼンテーション層 (`L6`) 、アプリケーション層 (`L7`) 、から構成される。

![OSI参照モデル](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/OSI参照モデル.png)

> - https://www.infraexpert.com/study/networking3.html

<br>

## 02. OSIの各層の責務

### 処理するプロトコル

各層で異なるプロトコルを処理する。

プロトコルとしての暗号化技術である『暗号化プロトコル』は、赤色で示してある。

層名からとって、プロトコルを『アプリケーションプロトコル』『トランスポートプロトコル』『インターネットプロトコル』『ネットワークインターフェースプロトコル』ともいう。

![encryption_protocol](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/encryption_protocol.png)

> - https://www.techwalla.com/articles/host-based-networks-vs-client-server-networks

<br>

### 通信機器との対応関係

![OSI参照モデルと通信機器.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/OSI参照モデルと通信機器.jpg)

OSI参照モデルの各層と通信機器の間の対応関係は以下の通りである。

`(1)`

: プライベートネットワークにクライアントPCがある。

`(2)`

: クライアントPCにて、Webブラウザのアプリケーションのプロセスが、OSIアプリケーション層、OSIプレゼンテーション層、OSIセッション層で稼働している。ここで、パケットが作成される。

`(3)`

: パケットは、クライアントPCのOSIトランスポート層、OSIネットワーク層、OSIデータリンク層、OSI物理層、を経る。各層で、パケットにヘッダー情報が追加される。

`(4)`

: PCからルーターにパケットを送信する。

`(5)`

: ルーターはOSIネットワーク層に属するため、より上層に一度戻ることになる。

`(6)`

: パブリックネットワークを経て、宛先のプライベートネットワークのルーターに到達する。

`(7)`

: ルーターからサーバーにパケットを送信する。

`(8)`

: パケットは、OSIデータリンク層、OSI物理層 (NIC：Network Interface Card (例：LANアダプタ、LANボード、LANカード) ) 、リピータ、LANケーブル、OSIネットワーク層、OSIトランスポート層、を経る。

`(9)`

: サーバーにて、アプリケーションのプロセスが特定のポート番で受信している。アプリケーションによってパケットが処理される。

> - https://atmarkit.itmedia.co.jp/ait/articles/0007/19/news001_2.html

<br>

## 03. パケット

### パケットとは

パケットは、ペイロード (アプリケーションデータ) 、ヘッダー情報、から構成される。

![パケットの構造](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/パケットの構造.jpg)

> - https://www.network-engineer.info/network_beginner/%E3%81%9D%E3%82%82%E3%81%9D%E3%82%82ip%E3%83%91%E3%82%B1%E3%83%83%E3%83%88%E3%81%A8%E3%81%AF%E3%81%AA%E3%81%AB%E3%81%8B%EF%BC%9F/
> - https://www.sophia-it.com/content/%E3%83%9A%E3%82%A4%E3%83%AD%E3%83%BC%E3%83%89

<br>

### アプリケーションへの操作がパケットになるまで

ここでは、OSI参照モデルを使用する。

まず、アプリケーション層で、アプリケーションがパケットのペイロード (アプリケーションデータ) を作成する。

ペイロードは、OSIの層を経るたびにヘッダーを追加していく。

パケット自体が暗号化されているため、実際の中身を確認することは難しい。

![osi-reference-model_packet](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/osi-reference-model_packet.png)

`(1)`

: アプリケーション層 (`L7`) にて、アプリケーションの入力に応じてパケットのペイロードを作成し、`L7`ヘッダーを追加する。

     プロトコルに応じてペイロードや`L7`ヘッダーの持つ情報は異なる。

     例えば、HTTPであればペイロードはHTMLやリクエストメッセージである。

     また、`L7`ヘッダーはリクエストヘッダーである。

`(2)`

: プレゼンテーション層 (`L6`) にて、ペイロードの文字コード変換や暗号化/復号化を実施し、`L6`ヘッダーを追加する。

`(3)`

: セッション層 (`L5`) にて、セッションを開始し、`L5`ヘッダーを追加する。

`(4)`

: トランスポート層 (`L4`) にて、`L4`ヘッダーを追加する。

     ペイロードはTCP/UDPパケットを持つ。

     `L4`ヘッダーはIPアドレスを持つ。

`(5)`

: ネットワーク層 (`L3`) にて、`L3`ヘッダーを追加する。

     ペイロードはIPパケットを持つ。

     `L3`ヘッダーはMACアドレスを持つ。

`(6)`

: データリンク層 (`L2`) にて、`L2`ヘッダーを追加する。

`(7)`

: 物理層にて (`L1`) にて、`L1`ヘッダーが追加される。

`(8)`

: パケットをHTTPリクエストとして送信する。

> - https://www.infraexpert.com/study/networking3.html
> - https://www.infraexpert.com/study/networking4.html
> - https://www.n-study.com/network-architecture/osi-communication-flow/
> - https://ox0xo.github.io/networking/wireshark

<br>
