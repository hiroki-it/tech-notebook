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

### コントリビューションの流れ

#### 1. 公式リポジトリからフォークリポジトリを作る

公式リポジトリのフォークリポジトリを作る。

> - https://www.kubernetes.dev/docs/guide/github-workflow/

#### 2. 開発環境にフォークリポジトリをクローンする

開発環境にフォークリポジトリをクローンする。

```bash
$ git clone https://github.com/hiroki-it/kubernetes/kubernetes.git
```

> - https://www.kubernetes.dev/docs/guide/github-workflow/

#### 3. 公式リポジトリをアップストリームリポジトリとして登録する

リモートリポジトリとしてのフォークリポジトリとは別に、公式リポジトリをアップストリームに登録する。

```bash
$ git remote add upstream https://github.com/kubernetes/kubernetes.git

$ git config --local --list

remote.upstream.url=https://github.com/kubernetes/kubernetes.git
remote.upstream.fetch=+refs/heads/*:refs/remotes/upstream/*

# 公式リポジトリにはプッシュしないようにする
$ git remote set-url --push upstream no_push
```

#### 4. 公式リポジトリから差分を取り込む

公式リポジトリ基点ブランチからフォークリポジトリに差分を取り込む。

この時、マージコミットを作らないようにするに、`git rebase`コマンドを使用する。

```bash
$ git fetch upstream

$ git checkout master

$ git rebase upstream/master
```

> - https://www.kubernetes.dev/docs/guide/github-workflow/
> - https://qiita.com/xtetsuji/items/555a1ef19ed21ee42873

#### 5. 変更をコミットする

ブランチを作成し、変更をコミットする。

ブランチ名やコミットメッセージは、リポジトリやプロジェクトのルールに合わせて決める。

```bash
$ git checkout -b feature/add_foo

$ git commit
```

> - https://www.kubernetes.dev/docs/guide/github-workflow/

#### 6. フォークリポジトリにコミットをプッシュする

自身のフォークリポジトリにコミットをプッシュする。

```bash
$ git push https://github.com/hiroki-it/kubernetes/kubernetes.git feature/add_foo
```

> - https://www.kubernetes.dev/docs/guide/github-workflow/

#### 7. プルリクエストを作る

フォークリポジトリ上の作業ブランチから公式リポジトリに対してプルリクエストを作る。

> - https://www.kubernetes.dev/docs/guide/github-workflow/

<br>

### CLA

プルリクエストをレビューしてもらうにあたり、コミッターとリポジトリの間でライセンス契約が必要である。

ライセンス契約後、プルリクエストで`/easycla`というコメントを送信する。

> - https://www.kubernetes.dev/docs/guide/pull-requests/#the-pull-request-submit-process
> - https://github.com/kubernetes/community/blob/master/CLA.md

<br>

### 動作確認

開発環境で動作確認のために`make`コマンドを実行する。

```bash
$ make verify

$ make test

$ make test-integration
```

> - https://www.kubernetes.dev/docs/guide/pull-requests/#run-local-verifications

<br>
