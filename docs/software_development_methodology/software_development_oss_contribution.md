---
title: 【IT技術の知見】OSSコントリビューション＠開発手法
description: OSSコントリビューション＠開発手法の知見を記録しています。
---

# OSSコントリビューション＠開発手法

### はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. OSSコントリビューションのコツ

### Issueから見つける

OSSによっては、`help wanted`や`good first issue`といったラベルづけをしてくれている。

OSSコントリビューションに入門しやすくなっている。

> - https://clotributor.dev/
> - https://www.kubernetes.dev/docs/guide/help-wanted/

<br>

### ツール

OSSコントリビューションするためのツールに関するバグを修正する。

> - https://speakerdeck.com/bells17/kubernetes-code-contributionru-men?slide=28

<br>

### Deprecated

エディタでWarningがでる箇所を修正する。

> - https://speakerdeck.com/bells17/kubernetes-code-contributionru-men?slide=22

<br>

## 02. Kubernetes

### ツール

ロギング処理で正しい処理を実装できているかを静的解析する。

`(1)`

: インストールする。

```bash
$ go install sigs.k8s.io/logtools/logcheck@HEAD
```

`(2)`

: 構造化ロギングのチェックを実行する。

```bash
$ $GOPATH/bin/logcheck -check-structured ./...

kubernetes/staging/src/k8s.io/cluster-bootstrap/util/secrets/secrets.go:66:3: unstructured logging function "Infof" should not be used
```

`(3)`

: コンテキストロギングのチェックを実行する。

```bash
$ $GOPATH/bin/logcheck -check-contextual ./...

kubernetes/staging/src/k8s.io/cluster-bootstrap/util/secrets/secrets.go:66:3: function "InfoS" should not be used, convert to contextual logging
kubernetes/staging/src/k8s.io/cluster-bootstrap/util/secrets/secrets.go:66:3: function "V" should not be used, convert to contextual logging
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
$ git clone --depth 1 git@github.com:hiroki-it/kubernetes.git
```

> - https://www.kubernetes.dev/docs/guide/github-workflow/

#### 3. ユーザー名とメールを登録する

```bash
$ git config --local user.name "hiroki-it"

$ git config --local user.email "hasegawafeedshop@gmail.com"

# 確認する
$ git config --local --list
```

#### 4. 公式リポジトリをアップストリームリポジトリとして登録する

リモートリポジトリとしてのフォークリポジトリとは別に、公式リポジトリをアップストリームに登録する。

```bash
$ git remote add upstream https://github.com/kubernetes/kubernetes.git

# 確認する
$ git config --local --list

remote.upstream.url=https://github.com/kubernetes/kubernetes.git
remote.upstream.fetch=+refs/heads/*:refs/remotes/upstream/*

# 公式リポジトリにはプッシュしないようにする
$ git remote set-url --push upstream no_push
```

#### 5. 公式リポジトリから差分を取り込む

公式リポジトリ基点ブランチからフォークリポジトリに差分を取り込む。

この時、マージコミットを作らないようにするに、`git rebase`コマンドを使用する。

```bash
$ git fetch upstream

$ git checkout master

$ git rebase upstream/master
```

あるいは、GitHubの画面操作でSyncを実行し、ローカルの`master`ブランチを強制的に更新しても良い。

```bash
$ git reset --hard origin/master
```

> - https://www.kubernetes.dev/docs/guide/github-workflow/
> - https://qiita.com/xtetsuji/items/555a1ef19ed21ee42873

#### 6. 変更をコミットする

ブランチを作成し、変更をコミットする。

ブランチ名やコミットメッセージは、リポジトリやプロジェクトのルールに合わせて決める。

```bash
$ git checkout -b feature/add_foo

$ git commit
```

> - https://www.kubernetes.dev/docs/guide/github-workflow/

#### 7. フォークリポジトリにコミットをプッシュする

自身のフォークリポジトリにコミットをプッシュする。

```bash
$ git push https://github.com/hiroki-it/kubernetes/kubernetes.git feature/add_foo
```

> - https://www.kubernetes.dev/docs/guide/github-workflow/

#### 8. プルリクエストを作る

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
