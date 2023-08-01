---
title: 【IT技術の知見】 trivy＠脆弱性テスト
description: trivy＠脆弱性テストの知見を記録しています。
---

# trivy＠脆弱性テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. trivyの仕組み

### 検出項目

IaC (Kubernetes、Terraform、Dockerfile) や イメージ (コンテナイメージ、マシンイメージ) で報告されたCVEに基づいて、ファイルの実装方法に起因する脆弱性を検証する。

Regoでカスタムポリシーを実装できる。

<br>

## 02. セットアップ

### インストール

```bash
$ brew install trivy
```

```bash
$ docker run aquasec/trivy
```

> - https://aquasecurity.github.io/trivy/v0.42/

<br>

## 03. オプション

### config

#### ▼ configとは

> - https://aquasecurity.github.io/trivy/v0.42/docs/references/configuration/cli/trivy_config/

#### ▼ --debug

デバッグモードを有効化する。

```bash
$ trivy config --debug <ファイル>
```

> - https://aquasecurity.github.io/trivy/v0.17.2/usage/

#### ▼ --exit-code

脆弱性が検出された時の終了コードを設定する。

```bash
$ trivy config --exit-code 1 <ファイル>
```

マニフェスト管理ツール (Helm、Kustomize) の作成したマニフェストファイルを渡しても良い。

```bash
$ helm template foo-chart. --set secret.PASSWORD=test -f foo-values.yaml > foo.yaml
    && trivy config --exit-code 1 foo.yaml
```

#### ▼ --quiet

処理中のプログレスバーを非表示にする。

```bash
$ trivy config --quiet <ファイル>
```

> - https://aquasecurity.github.io/trivy/v0.17.2/usage/

#### ▼ --severity

検出する最低の重要度レベルを設定する。

```bash
$ trivy config --severity CRITICAL,HIGH <ファイル>
```

> - https://aquasecurity.github.io/trivy/v0.19.2/vulnerability/examples/filter/#by-severity
> - https://csblog.casareal.co.jp/archives/382

<br>
