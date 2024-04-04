---
title: 【IT技術の知見】 nova＠ベストプラクティス違反
description: nova＠ベストプラクティス違反の知見を記録しています。
---

# nova＠ベストプラクティス違反

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. novaの仕組み

Helmのチャートリポジトリ上のチャートバージョンと、Cluster上の実際のバージョンを比較して、非推奨なHelmチャートのバージョンを検出できる。

実際のClusterに接続しないと解析できない。

また、ArgoCDを使っていると、Helmでインストールした履歴が残らないので、novaを使えない。

> - https://github.com/FairwindsOps/nova/issues/45

<br>

## `nova.yaml`ファイル

### desired-versions

Helmチャートの推奨バージョンをユーザー定義で指定したい場合に、チャートメイトバージョンを設定する。

```yaml
desired-versions:
  foo-chart: 1.0.0
```

> - https://nova.docs.fairwinds.com/desired-versions/#using-a-config-file

<br>

## 03. グローバルオプション

### --config

使用する`nova.yaml`ファイルを指定する。

```bash
$ nova find --config nova.yaml
```

<br>

## 03. コマンド

### find

#### ▼ findとは

非推奨なバージョンのHelmチャートを検証する。

注意点として、古いバージョンだからといって、非推奨とは限らない。

```bash
$ nova find --wide

Release Name      Installed    Latest    Old     Deprecated
============      =========    ======    ===     ==========
foo-chart         1.0.0        2.0.0     true    false
```

> - https://nova.docs.fairwinds.com/usage/

#### ▼ --containers

非推奨なバージョンのコンテナを検証する。

```bash
$ nova find --containers

Container Name    Current Version    Old     Latest     Latest Minor     Latest Patch
==============    ===============    ===     ======     =============    =============
k8s.gcr.io/foo    v1.0.0             true    v2.0.0     v2.0.0           v2.0.0
```

<br>
