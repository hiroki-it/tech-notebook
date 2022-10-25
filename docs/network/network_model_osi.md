---
title: 【IT技術の知見】TCP階層モデル＠ネットワーク＠ネットワーク
description: TCP階層モデル＠ネットワークの知見を記録しています。
---

# OSI参照モデル＠ネットワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/index.html

<br>

## 01. OSI参照モデルの種類

OSI参照モデルは、物理層（```L1```）、データリンク層（```L2```）、ネットワーク層（```L3```）、トランスポート層（```L4```）、セッション層（```L5```）、プレゼンテーション層（```L6```）、アプリケーション層（```L7```）、から構成される。

> ℹ️ 参考：https://www.infraexpert.com/study/networking3.html

![OSI参照モデル](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/OSI参照モデル.png)

<br>

## 02. 各レイヤーの責務

各レイヤーで異なるプロトコルを処理する。プロトコルとしての暗号化技術である『暗号化プロトコル』は、赤色で示してある。レイヤー名からとって、プロトコルを『アプリケーションプロトコル』『トランスポートプロトコル』『インターネットプロトコル』『ネットワークインターフェースプロトコル』ともいう。

> ℹ️ 参考：https://www.techwalla.com/articles/host-based-networks-vs-client-server-networks

![encryption_protocol](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/encryption_protocol.png)

<br>

## 03. パケットの通信経路

### 各概念層のヘッダ情報認識

各概念層と通信機器の間の対応関係は以下の通りである。

> ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/0007/19/news001_2.html

1. プライベートネットワークにクライアントPCがある。
2. クライアントPCにて、Webブラウザのアプリケーションのプロセスが、OSIアプリケーション層、OSIプレゼンテーション層、OSIセッション層で稼働している。ここで、パケットが作成される。
3. パケットは、クライアントPCのOSIトランスポート層、OSIネットワーク層、OSIデータリンク層、OSI物理層、を経る。各層で、パケットにヘッダー情報が追加される。
4. PCからルーターにパケットを送信する。
5. ルーターはOSIネットワーク層に属するため、より上層に一度戻ることになる。
6. パブリックネットワークを経て、宛先のプライベートネットワークのルーターに到達する。
7. ルーターからサーバーにパケットを送信する。
8. パケットは、OSIデータリンク層、OSI物理層（NIC：Network Interface Card（例：LANアダプタ、LANボード、LANカード））、リピータ、LANケーブル、OSIネットワーク層、OSIトランスポート層、を経る。
9. サーバーにて、アプリケーションのプロセスが特定のポート番で受信している。アプリケーションによってパケットが処理される。

![OSI参照モデルと通信機器.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/OSI参照モデルと通信機器.jpg)

<br>
