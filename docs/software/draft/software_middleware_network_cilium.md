---
title: 【IT技術の知見】Cilium@ネットワーク系ミドルウェア
description: Cilium@ネットワーク系ミドルウェアの知見を記録しています。
---

# Cilium@ネットワーク系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Ciliumの仕組み

コンテナ上のプロセスは、コンテナのカーネルに対してシステムコールを実行する。

システムコールのイベントが発生した時に、eBPFを使用して、Ciliumの処理をフックする。

これにより、Ciliumはシステムコールのテレメトリーを収集できる。

> - https://www.publickey1.jp/blog/22/grafanaciliumebpfciliumgrafana.html
> - https://gihyo.jp/admin/column/newyear/2022/cloudnative-prospect

<br>
