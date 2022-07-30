---
title: 【IT技術の知見】TCP階層モデル＠ネットワーク
description: TCP階層モデル＠ネットワークの知見を記録しています。
---

# OSI参照モデル

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. OSI参照モデル

コンピュータのソフトウェアとハードウェアによる通信機能を、7つのレイヤーに分割したもの。

ℹ️ 参考：https://www.infraexpert.com/study/networking3.html

![OSI参照モデル](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/OSI参照モデル.png)

<br>

## 02. 各レイヤーの責務

各レイヤーで異なるプロトコルを扱う。プロトコルとしての暗号化技術である『セキュアプロトコル』は、赤色で示してある。レイヤー名からとって、プロトコルを『アプリケーションプロトコル』『トランスポートプロトコル』『インターネットプロトコル』『ネットワークインターフェースプロトコル』ともいう。

ℹ️ 参考：https://www.techwalla.com/articles/host-based-networks-vs-client-server-networks

![セキュアプロトコル](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/セキュアプロトコル.png)

<br>

## 03. パケットの通信経路

### 各概念層のヘッダ情報認識

各概念層と通信機器の間の対応関係は以下の通りである。

1. プライベートネットワークにクライアントPCがある。
2. クライアントPCにて、Webブラウザのアプリケーションのプロセスが、OSIアプリケーション層、OSIプレゼンテーション層、OSIセッション層で稼働している。ここで、パケットが作成される。
3. パケットは、クライアントPCのOSIトランスポート層、OSIネットワーク層、OSIデータリンク層、OSI物理層、を経る。各層で、パケットにヘッダー情報が追加される。
4. PCからルーターにパケットが送信される。
5. ルーターはOSIネットワーク層に属するため、より上層に一度戻ることになる。
6. パブリックネットワークを経て、送信先のプライベートネットワークのルーターに到達する。
7. ルーターからサーバーにパケットが送信される。
8. パケットは、OSIデータリンク層、OSI物理層（NIC：Network Interface Card（例：LANアダプタ、LANボード、LANカード））、リピータ、LANケーブル、OSIネットワーク層、OSIトランスポート層、を経る。
9. サーバーにて、アプリケーションのプロセスが特定のポート番で受信している。アプリケーションによってパケットが処理される。

![OSI参照モデルと通信機器.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/OSI参照モデルと通信機器.jpg)
