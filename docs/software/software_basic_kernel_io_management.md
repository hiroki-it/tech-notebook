---
title: 【IT技術の知見】I/O管理＠基本ソフトウェア
description: I/O管理＠基本ソフトウェアの知見を記録しています。
---

# I/O管理＠基本ソフトウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. I/O（入出力）管理とは

アプリケーションから低速な周辺機器へデータを出力する時、まず、CPUはスプーラにデータを出力する。Spoolerは、全てのデータをまとめて出力するのではなく、一時的にストレージ（Spool）にためておきながら、少しずつ出力する（Spooling）。

![スプーリング](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/スプーリング.jpg)

<br>
