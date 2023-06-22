---
title: 【IT技術の知見】コマンド＠Kustomize
description: コマンド＠Kustomizeの知見を記録しています。
---

# コマンド＠Kustomize

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `kustomize`コマンド

### build

#### ▼ buildとは

Kustomizeの設定ファイルに基づいて、マニフェストを作成する。

```bash
$ kustomize build
```

`kusomize build`コマンドの結果をデプロイする場合、パイプで`kubectl apply`コマンドに渡す。

```bash
$ kustomize build kubectl apply -f -
```

もしくは、`kubectl`コマンドの`-k`オプションでも`kustomization.yaml`ファイル指定してもデプロイできる。

```bash
$ kubectl apply -k kustomization.yaml
```

> ↪️：https://qiita.com/os1ma/items/076a57b25e74e54476ba#%E7%B5%B1%E5%90%88%E5%89%8D%E3%81%AE-kustomize-%E3%82%92%E5%AE%9F%E8%A1%8C%E3%81%99%E3%82%8B

#### ▼ --enable-alpha-plugins

プラグインを使用して、`kustomize build`コマンドを実行する。

```bash
$ kustomize build --enable-alpha-plugins ./kustomize/overlay
```

#### ▼ --enable-helm

Kustomizeを使用して、Helmを実行できるようにする。

```bash
$ kustomize build --enable-helm ./chart
```

#### ▼ --output

作成したマニフェストをファイルとして出力する。

```bash
$ kustomize build --output ./tmp ./kustomize/overlay
```

<br>

## 02. `kubectl`コマンドを使用したKustomizeの適用

### diff/apply -k

`kustomize.yaml`ファイルを使用して、`kubectl`コマンドを実行する。

ローカルマシンにある`kustomize.yaml`ファイルを使用する場合、`kustomize.yaml`ファイルのあるパスを指定する。

```bash
$ kubectl diff -k ./ > kustomize.diff

$ kubectl apply -k ./
```

> ↪️：https://github.com/kubernetes-sigs/kustomize#1-make-a-kustomization-file

リモートにある`kustomize.yaml`ファイルを使用する場合も、同じく`kustomize.yaml`ファイルのあるディレクトリのURLを指定する。

```bash
$ kubectl diff -k "<リポジトリのURL>/<kustomize.yamlファイルのあるディレクトリ>?ref=<タグ>" > kustomize.diff

$ kubectl apply -k "<リポジトリのURL>/<kustomize.yamlファイルのあるディレクトリ>?ref=<タグ>"
```

> ↪️：https://github.com/kubernetes-sigs/kustomize/blob/master/examples/remoteBuild.md#examples

**＊実行例＊**

例えば、argocd-cdチャートの`5.28.0`を使用する場合、これはArgoCDの`2.6.7`に対応しているため、以下の値で作成/変更する。

```bash
$ kubectl diff -k "https://github.com/argoproj/argo-cd/manifests/crds?ref=v2.6.7"

$ kubectl apply -k "https://github.com/argoproj/argo-cd/manifests/crds?ref=v2.6.7"
```

例えば、aws-load-balancer-controllerチャートの`1.5.2`を使用する場合、これはaws-load-balancer-controllerの`2.5.1`に対応しているため、以下の値で作成/変更する。

```bash
$ kubectl diff -k "https://github.com/kubernetes-sigs/aws-load-balancer-controller/helm/aws-load-balancer-controller/crds?ref=v2.5.1"

$ kubectl apply -k "https://github.com/kubernetes-sigs/aws-load-balancer-controller/helm/aws-load-balancer-controller/crds?ref=v2.5.1"
```

<br>

### kustomize

`kustomize.yaml`ファイルを使用して、テンプレートからマニフェストを作成する。

```bash
$ kubectl kustomize ./
```

> ↪️：https://note.com/shift_tech/n/nd7f17e51d592

<br>
