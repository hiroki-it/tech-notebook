---
title: 【IT技術の知見】 nova＠バージョンテスト
description: nova＠バージョンテストの知見を記録しています。
---

# nova＠バージョンテスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. novaの仕組み

Helm のチャートリポジトリ上のチャートバージョンと、Cluster 上の実際のバージョンを比較して、非推奨な Helm チャートのバージョン（API バージョンではなく）を検出できる。

実際の Cluster に接続しないと解析できない。

また、ArgoCD を使っていると、Helm でインストールした履歴が残らないので、nova を使えない。

> - https://github.com/FairwindsOps/nova/issues/45

<br>

## 02. `nova.yaml` ファイル

### desired-versions

Helm チャートの推奨バージョンをユーザー定義で指定したい場合に、チャートメイトバージョンを設定する。

```yaml
desired-versions:
  foo-chart: 1.0.0
```

> - https://nova.docs.fairwinds.com/desired-versions/#using-a-config-file

<br>

## 03. グローバルオプション

### --config

使用する `nova.yaml` ファイルを指定する。

```bash
$ nova find --config nova.yaml
```

<br>

## 04. コマンド

### find

#### ▼ findとは

非推奨なバージョンの Helm チャートを検証する。

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
