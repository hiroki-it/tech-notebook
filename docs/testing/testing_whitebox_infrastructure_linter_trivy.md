---
title: 【IT技術の知見】 Trivy＠脆弱性テスト
description: Trivy＠脆弱性テストの知見を記録しています。
---

# Trivy＠脆弱性テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

```bash
$ brew install trivy
```

```bash
$ docker run aquasec/trivy
```

> ↪️：https://aquasecurity.github.io/trivy/v0.42/

<br>

## 02. オプション

### config

> ↪️：https://aquasecurity.github.io/trivy/v0.42/docs/references/configuration/cli/trivy_config/

#### ▼ --exit-code

脆弱性が検出された時の終了コードを設定する。

```bash
$ trivy config --exit-code 1 <マニフェストファイル>
```

<br>
