---
title: 【IT技術の知見】 Trivy＠脆弱性テスト
description: Trivy＠脆弱性テストの知見を記録しています。
---

# Trivy＠脆弱性テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Trivyの仕組み

報告されているIaC (例、Terraform、Kubernetes) の脆弱性レポートに基づいて、ファイルの実装方法に起因する脆弱性を検証する。

<br>

## 02. セットアップ

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

#### ▼ --exit-code

脆弱性が検出された時の終了コードを設定する。

```bash
$ trivy config --exit-code 1 <ファイル>
```

マニフェスト管理ツール (Helm、Kustomize) の作成したマニフェストファイルを渡しても良い。

```bash
$ helm template foo . --set secret.PASSWORD=test > manifest.yaml
  && trivy config --exit-code 1 --debug manifest.yaml
```

### ▼ --severity

検出する最低の重要度レベルを設定する。

```bash
$ trivy config --severity CRITICAL,HIGH <ファイル>
```

> - https://csblog.casareal.co.jp/archives/382

<br>
