---
title: 【IT技術の知見】自己完結アーキテクチャ＠アーキテクチャ
description: 自己完結アーキテクチャ＠アーキテクチャの知見を記録しています。
---

# 自己完結アーキテクチャ＠アーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 自己完結アーキテクチャ

複数の自己完結システム（フロントエンド、バックエンド、データベースのセット）からなるアーキテクチャのこと。

自己完結システム内のバックエンドを複数のマイクロサービスの分割することで、部分的なマイクロサービスアーキテクチャとすることもできる。

UIはマイクロフロントエンドとしてUIレンダリングする。

![self-contained-systems](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/self-contained-systems.png)

> - [Self-contained service](https://microservices.io/patterns/decomposition/self-contained-service.html)
> - [Self Contained Systems (SCS): Microservices Done Right - InfoQ](https://www.infoq.com/articles/scs-microservices-done-right/)
> - [Self-contained Systems (SCS) vs. Microservices](https://scs-architecture.org/vs-ms.html)

<br>
