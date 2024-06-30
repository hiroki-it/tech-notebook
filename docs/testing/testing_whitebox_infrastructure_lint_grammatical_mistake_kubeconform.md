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

### 検出項目

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

#### ▼ CRDのマニフェストのインストール

CRDのマニフェストをインストールする。

```bash
# リポジトリからCRDを取得する
$ wget https://github.com/hiroki-hasegawa/foo-repository/crds.yaml
```

あるいは、JSON形式のスキーマを直接インストールしてもよい。

この場合、後述のスキーマの作成は不要になる。

#### ▼ スキーマの作成

`openapi2jsonschema`を使い、CRDのマニフェストから各カスタムリソースのスキーマをJSON形式で作成する。

```bash
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

CI上でこれを実行する場合、リポジトリ内のマニフェストを渡しさえすれば良く、特にGitOpsでCI/CDを分離している場合は、必ずしもkube-apiserverと通信する必要はない。

```bash
$ helm template . -f foo-values.yaml -f foo-secrets.yaml \
    | kubeconform -kubernetes-version <Kubernetesのバージョン> -
```

<br>

### -kubernetes-version

#### ▼ -kubernetes-versionとは

Kubernetesのバージョンを指定する。

マイナーバージョン (例：`1.24.0`) まで指定する必要がある。

```bash
$ kubeconform \
    -kubernetes-version <Kubernetesのバージョン> \
    -strict \
    -summary \
    -output text \
    manifest.yaml
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
    manifest.yaml

$ kubeconform \
    -kubernetes-version <Kubernetesの次のバージョン> \
    -strict \
    -summary \
    -output text \
    manifest.yaml
```

<br>

### -schema-location

#### ▼ -schema-locationとは

JSON形式のスキーマの場所を明示的に設定する。

Goテンプレートのように、マニフェスト内の値をスキーマのパスに出力できる。

```bash
$ kubeconform \
    -schema-location default \
    -schema-location 'https://raw.githubusercontent.com/datreeio/CRDs-catalog/main/{{ .Group }}/{{ .ResourceKind }}_{{ .ResourceAPIVersion }}.json' \
    manifest.yaml
```

Kubernetesリソースのスキーマは、`default`エイリアス (`https://raw.githubusercontent.com/yannh/kubernetes-json-schema/master/{{.NormalizedKubernetesVersion}}-standalone{{.StrictSuffix}}/{{.ResourceKind}}{{.KindSuffix}}.json`) にある。

`kubeconform`コマンドは、` -kubernetes-version`オプションで渡したKubernetesのバージョンを`{{.NormalizedKubernetesVersion}} `に出力する。

CRDのスキーマは、`https://raw.githubusercontent.com/datreeio/CRDs-catalog/main/{{.Group}}/{{.ResourceKind}}_{{.ResourceAPIVersion}}.json` にある。

> - https://github.com/yannh/kubeconform#overriding-schemas-location
> - https://github.com/yannh/kubeconform/blob/v0.6.3/pkg/registry/registry.go#L85-L101

<br>
