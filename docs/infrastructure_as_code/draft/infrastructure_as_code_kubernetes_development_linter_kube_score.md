---
title: 【IT技術の知見】 kube-score＠非推奨apiVersionテスト
description: kube-score＠非推奨apiVersionテストの知見を記録しています。
---

# kube-score＠非推奨apiVersionテスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

### kube-score

#### ▼ セットアップ

```bash
$ brew install kube-score
```

#### ▼ score

```bash
$ helm template foo-chart -f values-prd.yaml | kube-score score -
```

<br>
