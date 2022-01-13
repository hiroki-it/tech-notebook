# Fluentd/FluentBit

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Fluentd/FluentBitとは

### 概要

アプリケーションからログを収集し、これをフィルタリングした後、複数の宛先に転送する。

参考：https://docs.fluentbit.io/manual/about/fluentd-and-fluent-bit

<br>

### Fluentd vs. FluentBit

|                  | Fluentd                                      | FluentBit                                  |
| ---------------- | -------------------------------------------- | ------------------------------------------ |
| スコープ         | コンテナ/サーバー                             | 組み込みLinux/コンテナ/サーバー            |
| 言語             | C & Ruby                                     | NS                                         |
| メモリ最大使用量 | 40MB                                         | 650KB                                      |
| 依存関係         | 標準プラグインで一定数のRuby gemに依存する。 | 標準プラグインではライブラリに依存しない。 |
| パフォーマンス   | 高                                           | 高                                         |
| プラグイン数     | 1000個以上                                   | 70個                                       |
