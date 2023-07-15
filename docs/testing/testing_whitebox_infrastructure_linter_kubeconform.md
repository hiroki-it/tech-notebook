---
title: 【IT技術の知見】 kubeconform＠文法の誤りテスト
description: kubeconform＠文法の誤りテストの知見を記録しています。
---

# kubeconform＠文法の誤りテスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. kubeconformの仕組み

Kubernetesリソースのスキーマ (カスタムリソースであればCRD) に基づいて、マニフェストの文法の誤りを検出する。

<br>

## 02. セットアップ

### インストール

```bash
$ brew install kubeconform
```

> - https://github.com/yannh/kubeconform#installation

<br>

### カスタムリソースのスキーマの用意

カスタムリソースの静的解析を実行する場合、そのスキーマをCRDから作成する必要がある。

まずは、CRDをインストールする。

その後、`openapi2jsonschema`を使い、CRDから各カスタムリソースのスキーマをJSON形式で作成する。

```bash
# リポジトリからCRDを取得する
$ wget https://github.com/hiroki-hasegawa/foo-repository/crds.yaml

# 各カスタムリソースのJSONスキーマのファイル形式を設定する
$ export FILENAME_FORMAT='{kind}-{version}'

# 各カスタムリソースのスキーマをJSON形式で作成する
$ ./openapi2jsonschema.py crds.yaml

# ファイル形式は {kind}-{version} になっている
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
