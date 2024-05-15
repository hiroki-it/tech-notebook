---
title: 【IT技術の知見】OSSコントリビュート＠開発手法
description: OSSコントリビュート＠開発手法の知見を記録しています。
---

# OSSコントリビュート＠開発手法

### はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Issueの見つけ方

OSSによっては、`help wanted`や`good first issue`といったラベルづけをしてくれている。

OSSコントリビュートに入門しやすくなっている。

> - https://clotributor.dev/
> - https://www.kubernetes.dev/docs/guide/help-wanted/

<br>

## 02. Kubernetes

### ツール

正しいロギング処理を実装できているかを静的解析する。

`(1)`

: インストールする。

```bash
$ go install sigs.k8s.io/logtools/logcheck@latest
```

`(2)`

: 実行する。

```bash
$ $GOPATH/bin/logcheck -check-structured ./...

kubernetes/staging/src/k8s.io/cluster-bootstrap/util/secrets/secrets.go:66:3: unstructured logging function "Infof" should not be used
kubernetes/staging/src/k8s.io/cluster-bootstrap/util/secrets/secrets.go:73:3: unstructured logging function "Infof" should not be used
```

> - https://github.com/kubernetes-sigs/logtools/tree/main/logcheck

<br>
