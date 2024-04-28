---
title: 【IT技術の知見】Platform Engineering＠DevOps
description: Platform Engineering＠DevOpsの知見を記録しています。
---

# Platform Engineering＠DevOps

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Platform Engineering

### Platform Engineeringとは

DevOpsというインターフェースを実装したエンジニアリング手法である。

SREingとは異なり、開発者体験の向上からDevOpsを実現する。

出典は要記入...

<br>

### 要素

#### ▼ 提供先

アプリ/インフラチームに対して、サービスとして提供する。

> - https://techblog.ap-com.co.jp/entry/2023/01/18/170829
> - https://techblog.ap-com.co.jp/entry/2023/03/09/120721

#### ▼ 目的

アプリ/インフラチームの体験と生産性向上を高めるためである。

> - https://techblog.ap-com.co.jp/entry/2023/01/18/170829
> - https://techblog.ap-com.co.jp/entry/2023/03/09/120721

#### ▼ 体制

プラットフォームエンジニアリングチームは他のチームから独立している。

このチームでは、アプリ/インフラチームに提供する技術の領域を限定しない。

> - https://techblog.ap-com.co.jp/entry/2023/01/18/170829
> - https://techblog.ap-com.co.jp/entry/2023/03/09/120721

#### ▼ サービス形態

アプリ/インフラチームにPaaS風のセルフサービスを提供する。

> - https://techblog.ap-com.co.jp/entry/2023/01/18/170829
> - https://techblog.ap-com.co.jp/entry/2023/03/09/120721

<br>

## 02. 成功させる条件

### Internal developer portals (Web portal)

アプリケーションのテンプレートや共通パッケージを利用できるポータルサイトを提供する。

また、これらのツールの利用状況も可視化できる。

アプリ/インフラチームがアプリケーションを素早く作成できるようになる。

> - https://tag-app-delivery.cncf.io/wgs/platforms/whitepaper/#capabilities-of-platforms

**＊例＊**

- Port
- Backstage

> - https://github.com/backstage/backstage

<br>

### API

> - https://tag-app-delivery.cncf.io/wgs/platforms/whitepaper/#capabilities-of-platforms

<br>

### ゴールデンパス

> - https://tag-app-delivery.cncf.io/wgs/platforms/whitepaper/#capabilities-of-platforms

<br>

### 構築の自動化

> - https://tag-app-delivery.cncf.io/wgs/platforms/whitepaper/#capabilities-of-platforms

<br>

### リリースの自動化

> - https://tag-app-delivery.cncf.io/wgs/platforms/whitepaper/#capabilities-of-platforms

<br>

### 開発環境

> - https://tag-app-delivery.cncf.io/wgs/platforms/whitepaper/#capabilities-of-platforms

<br>

### 可観測性

> - https://tag-app-delivery.cncf.io/wgs/platforms/whitepaper/#capabilities-of-platforms

<br>

### 他にもいっぱい...

> - https://tag-app-delivery.cncf.io/wgs/platforms/whitepaper/#capabilities-of-platforms

<br>

## 03. 計測

### ユーザーの満足度や生産性

生産性は、SPACEフレームワークなどで定義づけする。

> - https://tag-app-delivery.cncf.io/wgs/platforms/whitepaper/#how-to-measure-the-success-of-platforms
> - https://dl.acm.org/doi/10.1145/3454122.3454124

<br>

### 組織の効率性

> - https://tag-app-delivery.cncf.io/wgs/platforms/whitepaper/#how-to-measure-the-success-of-platforms

<br>

### リリースによるプロダクトの成長

> - https://tag-app-delivery.cncf.io/wgs/platforms/whitepaper/#how-to-measure-the-success-of-platforms

<br>

## 04. 組織モデルの種類

### Centralized Provisioning (中央集権型)

記入中...

> - https://aws.amazon.com/jp/blogs/news/how-organizations-are-modernizing-for-cloud-operations/

<br>

### Platform-enabled Golden Path (プラットフォーム型)

記入中...

> - https://aws.amazon.com/jp/blogs/news/how-organizations-are-modernizing-for-cloud-operations/

<br>

### Embedded DevOps (組み込み型)

記入中...

> - https://aws.amazon.com/jp/blogs/news/how-organizations-are-modernizing-for-cloud-operations/

<br>

### Decentralized Provisioning (分散型)

記入中...

> - https://aws.amazon.com/jp/blogs/news/how-organizations-are-modernizing-for-cloud-operations/

<br>
