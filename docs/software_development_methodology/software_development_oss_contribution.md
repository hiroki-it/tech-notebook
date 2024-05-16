---
title: 【IT技術の知見】OSSコントリビューション＠開発手法
description: OSSコントリビューション＠開発手法の知見を記録しています。
---

# OSSコントリビューション＠開発手法

### はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Issueの見つけ方

OSSによっては、`help wanted`や`good first issue`といったラベルづけをしてくれている。

OSSコントリビューションに入門しやすくなっている。

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

### 開発フロー

#### 開発フローとは

> - https://www.kubernetes.dev/docs/guide/github-workflow/

#### 1. Kubernetesリポジトリ公式からフォークを作る

Kubernetesリポジトリ公式のフォークを作る。

#### 2. 開発環境にフォークをクローンする

開発環境にフォークリポジトリをクローンする。

```bash
$ git clone https://github.com/hiroki-it/kubernetes/kubernetes.git
```

#### 3. 公式から差分を取り込む

Kubernetesリポジトリ公式からフォークリポジトリに差分を取り込む必要がある。

まず、リモートリポジトリをKubernetesリポジトリ公式に設定する。

```bash
$ git remote add upstream https://github.com/kubernetes/kubernetes.git

# Kubernetesリポジトリ公式にはプッシュしないようにする
$ git remote set-url --push upstream no_push
```

作業ブランチが基点ブランチのコミットを取り込む。

この時、マージコミットを作らないようにするに、`git rebase`コマンドを使用する。

```bash
$ git fetch upstream

$ git checkout master

$ git rebase upstream/master
```

#### 4. 変更をコミットする

ブランチを作成し、変更をコミットする。

ブランチ名やコミットメッセージは、リポジトリやプロジェクトのルールに合わせて決める。

```bash
$ git checkout -b feature/add_foo

$ git commit
```

#### 5. フォークにコミットをプッシュする

自身のフォークにコミットをプッシュする。

```bash
$ git push https://github.com/hiroki-it/kubernetes/kubernetes.git feature/add_foo
```

#### 6. プルリクエストを作る

フォークリポジトリ上の作業ブランチからKubernetesリポジトリ公式に対してプルリクエストを作る。

<br>
