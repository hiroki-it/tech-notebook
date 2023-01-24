---
title: 【IT技術の知見】コマンド＠Helmfile
description: コマンド＠Helmfileの知見を記録しています。
---

# コマンド＠Helmfile

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. helmfileコマンド

### globalオプション

#### ▼ オプション無し

使用する```helmfile.d```ディレクトリ下にある```helm.yaml```ファイルを再帰的に使用する。



> ℹ️ 参考：https://helmfile.readthedocs.io/en/latest/#cli-reference

```bash
# helmfile.dディレクトリ配下を再帰的に読み込む。
$ helmfile <サブコマンド>
```

#### ▼ -e

リリース対象の実行環境名を設定する。



> ℹ️ 参考：https://helmfile.readthedocs.io/en/latest/#cli-reference

```bash
$ helmfile -e prd <コマンド>
```

**＊例＊**

```bash
$ helmfile -e prd diff
```

```bash
$ helmfile -e prd apply
```

#### ▼ -f

使用する```helmfile.yaml```ファイルを指定する。



> ℹ️ 参考：https://helmfile.readthedocs.io/en/latest/#cli-reference

```bash
$ helmfile -e prd -f ./helmfile.yaml <コマンド>
```

<br>

### apply

#### ▼ apply

まず```helmfile diff```コマンドを実行し、この時に差分があれば、```helmfile apply```コマンドを実行する。

```helmfile sync```コマンドとは異なり、リリース間に差分がないと、リビジョン番号は更新されない。

注意点として、Helmの使用と同様にして、カスタムリソース定義のマニフェストを変更できない。



> ℹ️ 参考：
>
> - https://helmfile.readthedocs.io/en/latest/#apply
> - https://stackoverflow.com/questions/59703760/helmfile-sync-vs-helmfile-apply

```bash
$ helmfile -e prd apply

Upgrading release=foo-release, chart=./charts/foo
Release "foo-release" has been upgraded. Happy Helming!
NAME: foo-release
LAST DEPLOYED: Wed Jun  1 13:53:57 2022
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None

Listing releases matching ^foo-release$
foo-release 2022-06-01 13:53:57.271186378 +0900 JST deployed foo-release-0.0.1 0.0.1      

UPDATED RELEASES:
NAME                CHART                VERSION
foo-release         ./charts/foo         0.0.1
```

<br>

### destroy

#### ▼ destroyとは

インストール済みの全てのチャートをアンインストールする。



> ℹ️ 参考：https://helmfile.readthedocs.io/en/latest/#destroy

```bash
$ helmfile -e prd destroy
```

<br>

### list

#### ▼ list

Helmfileでインストールしたチャートの一覧を取得する。



```bash
$ helmfile list

NAME          NAMESPACE      ENABLED   LABELS   CHART              VERSION
foo-chart     foo-namespace  true               charts/foo-chart   1.0.0
bar-chart     bar-namespace  true               charts/bar-chart   1.0.0
baz-chart     baz-namespace  true               charts/baz-chart   1.0.0
```

<br>

### diff

#### ▼ diffとは

全てのリリースに対して、helm-diffプラグインを実行する。

helm-diffプラグインでは、リリース済みの最新バージョンと、```helm upgrade --debug --dry-run```コマンドの差分を取得する。

```bash
$ helmfile -e prd diff
```


> ℹ️ 参考：
>
> - https://helmfile.readthedocs.io/en/latest/#diff
> - https://github.com/databus23/helm-diff#helm-diff-plugin


#### ▼ 色付け

```helmfile diff```コマンドでは、差分を色付けできる。

ただ、バージョンによって機能しないことがあるため、その場合は明示的に```HELM_DIFF_COLOR```変数を有効化する。

```bash
$ HELM_DIFF_COLOR=true helmfile -e prd diff
```

> ℹ️ 参考：https://github.com/roboll/helmfile/issues/2043#issuecomment-1081665414

#### ▼ grepとの組み合わせ

マニフェストの差分が多すぎる場合、先にどのリソースに変更があるのかを把握した方がよい。

```grep```コマンドを使用して、差分のあるリソースやファイルを確認しておく。



```bash
$ helmfile -e prd diff | grep kind

# 差分のあるマニフェストのkindキーのみを取得する。
kind: Service
kind: Deployment
kind: PersistentVolume
```

```bash
$ helmfile -e prd diff | grep Source

# 差分のあるマニフェストのkindキーのみを取得する。
Source: project/manifests/service.yaml
Source: project/manifests/deployment.yaml
Source: project/manifests/persistent-volume.yaml
```

<br>

### sync

#### ▼ syncとは

全てのリリースに関して、```helm upgrade --install```コマンドを実行する。

```helmfile apply```コマンドとは異なり、リリース間に差分がなくとも、リビジョン番号を更新する。

注意点として、Helmの使用と同様にして、カスタムリソース定義のマニフェストを変更できない。


```bash
$ helmfile -e prd sync
```

> ℹ️ 参考：https://stackoverflow.com/questions/59703760/helmfile-sync-vs-helmfile-apply


<br>

### template

#### ▼ templateとは

全てのリリースに関して、```helm template```コマンドを実行する。



```bash
$ helmfile -e prd template
```

<br>

### write-values

#### ▼ write-valuesとは

個人的に感動したコマンド。```helmfile```コマンドの実行で使用される```values```ファイルを、ファイルに書き出す。

複数の```values```ファイルを使用している場合に、これらに同じキーがあると、後に読み込まれた```values```ファイルが優先されるようになっている。

この時に、```helmfile write-values```コマンドを使用すると、優先された値で定義された```values```ファイルを確認できる。

```bash
$ helmfile -e prd -f ./helmfile.yaml write-values

# helmfile.yamlファイルのディレクトリ以下に、ディレクトリとファイルが生成される。
Writing values file foo-77cab19b/foo.yaml
```

<br>
