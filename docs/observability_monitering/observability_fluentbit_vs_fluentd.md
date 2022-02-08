---
title: 【知見を記録するサイト】FluentBit vs. Fluentd＠可観測性
description: FluentBit vs. Fluentd＠可観測性の知見をまとめました．
---

# FluentBit vs. Fluentd＠可観測性

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. FluentBit/Fluentdとは

### 概要

アプリケーションからログを収集し，これをフィルタリングした後，複数の宛先にルーティングする．

参考：https://docs.fluentbit.io/manual/about/fluentd-and-fluent-bit

<br>

### 機能比較

|                  | FluentBit                                  | Fluentd                                      |
| ---------------- | ------------------------------------------ | -------------------------------------------- |
| スコープ         | 組み込みLinux/仮想環境                     | 仮想環境                                     |
| 言語             | NS                                         | C & Ruby                                     |
| メモリ最大使用量 | 650KB                                      | 40MB                                         |
| 依存関係         | 標準プラグインではライブラリに依存しない． | 標準プラグインで一定数のRuby gemに依存する． |
| パフォーマンス   | 高                                         | 高                                           |
| プラグイン数     | 70個                                       | 1000個以上                                   |
