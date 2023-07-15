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

Kubernetesの公式ドキュメントや著名な書籍に基づいて、マニフェストのベストプラクティス違反 (例：設定漏れ、セキュリティ) を検証する。

> - https://github.com/zegl/kube-score/blob/master/README_CHECKS.md
> - https://github.com/zegl/kube-score/blob/master/README_PROBES.md
> - https://github.com/zegl/kube-score/blob/master/README_SECURITYCONTEXT.md

<br>

## 02. セットアップ

```bash
$ brew install kube-score
```

<br>

## 03. グローバルオプション

<br>

## 04. オプション

### score

```bash
$ helm template foo-chart -f values-prd.yaml | kube-score score -
```

> - https://github.com/zegl/kube-score/tree/master#usage-in-ci

<br>
