---
title: 【IT技術の知見】 Kubeconform＠文法の誤りテスト
description: Kubeconform＠文法の誤りテストの知見を記録しています。
---

# Kubeconform＠文法の誤りテスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Kubeconformの仕組み

Kubernetesリソースのスキーマ (カスタムリソースであればCRD) に基づいて、マニフェストの文法の誤りを検出する。

カスタムリソースの場合、あらかじめKubeconformと対象範囲内にJSON形式のCRDを配置 (あるいは動的に取得) しておく必要がある。

<br>

## 02. セットアップ

### インストール

```bash
$ brew install kubeconform
```

> - https://github.com/yannh/kubeconform#installation

<br>

### カスタムリソースのスキーマの用意

カスタムリソースの静的解析を実行する場合、JSON形式のCRDが必要である。

`openapi2jsonschema`を使うと、YAML形式からJSON形式に変換できる。

```bash
# リポジトリからCRDを取得する。
$ wget https://github.com/hiroki-hasegawa/foo-repository/foo-crds.yaml

# 変換後のJSONスキーマのファイル形式
$ export FILENAME_FORMAT='{kind}-{version}'

# CRDのYAMLファイルをJSONスキーマに変換する。
$ ./openapi2jsonschema.py foo-crds.yaml

JSON schema written to foo-v1.json
JSON schema written to foo-v1alpha2.json
JSON schema written to foo-v1alpha3.json
JSON schema written to foo-v1beta1.json
```

> - https://mixi-developers.mixi.co.jp/kubeconform-2bb477371e06#21e5
> - https://zenn.dev/tayusa/articles/1aa96e6ceb838a#%E3%82%B9%E3%82%AD%E3%83%BC%E3%83%9E%E3%81%AE%E7%94%9F%E6%88%90

<br>

## オプション

### 標準入力

標準入力からマニフェストを渡す。

CI上でこれを実行する場合、リポジトリ内のマニフェストを渡しさえすれば良いので、必ずしもkube-apiserverと通信する必要はない。

```bash
$ helm template foo . --set secret.PASSWPRD=test \
  | kubeconform -kubernetes-version <Kubernetesのバージョン> -
```

<br>

### -kubernetes-version

#### ▼ -kubernetes-versionとは

Kubernetesのバージョンを指定する。

```bash
$ kubeconform \
    -kubernetes-version <Kubernetesのバージョン> \
    -strict \
    -summary \
    -output text \
    <ファイル>
```

#### ▼ 現在のバージョンと次のバージョンを指定

現在と次のKubernetesバージョンを指定した処理を自動化すれば、アップグレードに備えられる。

継続的に検出できるように、CI上で自動化すると良い。

```bash
$ kubeconform \
    -kubernetes-version <Kubernetesの現在のバージョン> \
    -strict \
    -summary \
    -output text \
    <ファイル>

$ kubeconform \
    -kubernetes-version <Kubernetesの次のバージョン> \
    -strict \
    -summary \
    -output text \
    <ファイル>
```

<br>
