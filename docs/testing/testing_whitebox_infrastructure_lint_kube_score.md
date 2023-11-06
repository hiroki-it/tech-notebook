---
title: 【IT技術の知見】 kube-score＠ベストプラクティス違反
description: kube-score＠ベストプラクティス違反の知見を記録しています。
---

# kube-score＠ベストプラクティス違反

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. kube-scoreの仕組み

### 検出項目

一般に知られているベストプラクティス項目に基づいて、マニフェストのベストプラクティス違反 (例：設定漏れ、推奨値、脆弱性、など) を検証する。

> - https://github.com/zegl/kube-score/blob/master/README_CHECKS.md
> - https://github.com/zegl/kube-score/blob/master/README_PROBES.md
> - https://github.com/zegl/kube-score/blob/master/README_SECURITYCONTEXT.md

<br>

## 02. セットアップ

### インストール

```bash
$ brew install kube-score
```

> - https://github.com/zegl/kube-score/tree/master#installation

<br>

## 03. グローバルオプション

記入中...

<br>

## 04. オプション

### score

マニフェストを検査する。

```bash
$ helm template . -f foo-values.yaml \
    | kube-score score -
```

```bash
$ kustomize build . \
    | kube-score score -
```

> - https://github.com/zegl/kube-score/tree/master#usage-in-ci

<br>
