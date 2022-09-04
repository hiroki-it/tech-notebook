---
title: 【IT技術の知見】FluentBit vs. Fluentd＠カスタムリソース
description: FluentBit vs. Fluentd＠カスタムリソースの知見を記録しています。
---

# FluentBit vs. Fluentd＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. FluentBit/Fluentdとは

### 概要

アプリケーションからログを収集し、これをフィルタリングした後、複数の宛先にルーティングする。

> ℹ️ 参考：https://docs.fluentbit.io/manual/about/fluentd-and-fluent-bit

<br>

### 機能比較

|                  | FluentBit                                 | Fluentd                                      |
| ---------------- | ----------------------------------------- | -------------------------------------------- |
| スコープ         | 組み込みLinux/仮想環境                     | 仮想環境                                     |
| 言語             | NS                                        | C & Ruby                                     |
| メモリ最大サイズ | ```650```KB                                     | ```40```MB                                         |
| 依存関係         | 標準プラグインではパッケージに依存しない。 | 標準プラグインで一定数のRuby gemに依存する。 |
| パフォーマンス   | 高                                         | 高                                           |
| プラグイン数     | ```70```個                                       | ```1000```個以上                                   |
