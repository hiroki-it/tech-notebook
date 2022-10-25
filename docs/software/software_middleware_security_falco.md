---
title: 【IT技術の知見】Falco＠セキュリティ系ミドルウェア
description: Falco＠セキュリティ系ミドルウェアの知見を記録しています。
---

# Falco＠セキュリティ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/index.html

<br>

## 01. Falcoの仕組み

### アーキテクチャ

ワーカーNodeとコンテナの間のシステムコールを収集し、異常なシステムコールを検知すれば、これを通知する。


> ℹ️ 参考：
>
> - https://www.designet.co.jp/ossinfo/kubernetes/falco/
> - https://sysdig.jp/blog/sysdig-contributes-falco-kernel-ebpf-cncf-2/

![falco_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/falco_architecture.png)

<br>

## 02. ユースケース

<br>
