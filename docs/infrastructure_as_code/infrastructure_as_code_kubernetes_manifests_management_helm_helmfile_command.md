---
title: 【IT技術の知見】コマンド＠Helmfile
description: コマンド＠Helmfileの知見を記録しています。
---

# コマンド＠Helmfile

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. helmfileコマンド

### globalオプション

#### ▼ オプション無し

使用する`helmfile.d`ディレクトリ下にある`helm.yaml`ファイルを再帰的に使用する。

```bash
# helmfile.dディレクトリ配下を再帰的に読み込む。
$ helmfile <サブコマンド>
```

> - https://helmfile.readthedocs.io/en/latest/#cli-reference

#### ▼ -e

Helmリリース対象の実行環境名 (dev、stg、prd) を設定する。

```bash
$ helmfile -e dev <コマンド>
```

> - https://helmfile.readthedocs.io/en/latest/#cli-reference

**＊例＊**

```bash
$ helmfile -e dev diff
```

```bash
$ helmfile -e dev apply
```

#### ▼ -f

使用する`helmfile.yaml`ファイルを指定する。

```bash
$ helmfile -e dev -f ./helmfile.yaml <コマンド>
```

> - https://helmfile.readthedocs.io/en/latest/#cli-reference

#### ▼ --interactive

コマンドの実行前の確認を要求する。

```bash
$ helmfile -e dev --interactive destroy

...

Do you really want to delete?
  Helmfile will delete all your releases, as shown above.

 [y/n]:
```

<br>

### apply

#### ▼ apply

まず`helmfile diff`コマンドを実行することにより、この時に差分があれば、`helmfile sync`コマンドを実行する。

`helmfile sync`コマンドとは異なり、Helmリリース間に差分がないと、リビジョン番号は更新されない。

注意点として、Helmの使用と同様にして、CRDのマニフェストは作成はできるが変更はできない。

```bash
$ helmfile -e dev apply

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

> - https://helmfile.readthedocs.io/en/latest/#apply
> - https://stackoverflow.com/questions/59703760/helmfile-sync-vs-helmfile-apply

#### ▼ --skip-crds

CRDの作成をスキップする。

`kubectl apply`コマンドでCRDを作成した場合に役立つ。

注意点として、CRDの更新はHelmがサポートしていないため、あくまで作成をスキップする。

```bash
$ helmfile -e dev apply --skip-crds
```

#### ▼ --skip-diff-on-install

`helmfile apply`コマンド時に`helmfile diff`コマンドを実行しない。

```bash
$ helmfile -e dev apply --skip-diff-on-install
```

> - https://github.com/roboll/helmfile/issues/1840

<br>

### destroy

#### ▼ destroyとは

インストール済みの全てのチャートをアンインストールする。

CRDも削除する。

```bash
$ helmfile -e dev destroy
```

> - https://helmfile.readthedocs.io/en/latest/#destroy

#### ▼ 特定のHelmリリースのみ`destroy`したい

`helmfile`コマンドで複数のHelmリリースを一緒に管理している場合、特定のHelmリリースのみ`destroy`できない。

代わりに、`helm uninstall`コマンドで特定のHelmリリースを削除する。

```bash
$ helm uninstall <Helmリリース名>

# 削除したHelmリリースのみが差分として出力される
$ helmfile -e dev diff
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

全てのHelmリリースに対して、helm-diffプラグインを実行する。

helm-diffプラグインでは、前回のHelmリリースと、今回の`helm upgrade --dry-run`コマンドの差分を取得する。

```bash
$ helmfile -e dev diff
```

> - https://helmfile.readthedocs.io/en/latest/#diff
> - https://github.com/databus23/helm-diff#helm-diff-plugin

#### ▼ --debug

オプションの無い`helmfile diff`では、以下の出力になってしまう。

- Secretに出力された値がエンコードされてしまっている。
- `helm upgrade --dry-run`コマンドのどの段階でエラーになったかがわからない。

`--debug`オプションであれば、これらを確認できる。

```bash
$ helmfile -e dev --debug diff
```

#### ▼ 色付け

`helmfile diff`コマンドでは、差分を色付けできる。

ただ、バージョンによって機能しないことがあるため、その場合は明示的に`HELM_DIFF_COLOR`変数を有効化する。

```bash
$ HELM_DIFF_COLOR=true helmfile -e dev diff
```

> - https://github.com/roboll/helmfile/issues/2043#issuecomment-1081665414

#### ▼ grepとの組み合わせ

マニフェストの差分が多すぎる場合、先にどのリソースに変更があるのかを把握した方がよい。

`grep`コマンドを使用して、差分のあるリソースやファイルを確認しておく。

```bash
$ helmfile -e dev diff | grep kind

# 差分のあるマニフェストのkindキーのみを取得する。
kind: Service
kind: Deployment
kind: PersistentVolume
```

```bash
$ helmfile -e dev diff | grep Source

# 差分のあるマニフェストのkindキーのみを取得する。
Source: project/manifests/service.yaml
Source: project/manifests/deployment.yaml
Source: project/manifests/persistent-volume.yaml
```

<br>

### sync

#### ▼ syncとは

全てのHelmリリースに関して、`helm upgrade --install`コマンドを実行する。

`helmfile apply`コマンドとは異なり、Helmリリース間に差分がなくとも、リビジョン番号を更新する。

注意点として、Helmの使用と同様にして、CRDのマニフェストは作成はできるが変更はできない。

```bash
$ helmfile -e dev sync
```

> - https://helmfile.readthedocs.io/en/latest/#diff
> - https://stackoverflow.com/questions/59703760/helmfile-sync-vs-helmfile-apply

<br>

### template

#### ▼ templateとは

全てのHelmリリースに関して、`helm template`コマンドを実行する。

```bash
$ helmfile -e dev template
```

#### ▼ --include-crds

CRDも含めて、`helm template`コマンドを実行する。

```bash
$ helmfile -e dev template --include-crds
```

<br>

### write-values

#### ▼ write-valuesとは

個人的に感動したコマンド。`helmfile`コマンドの実行で使用される`values`ファイルを、ファイルに書き出す。

複数の`values`ファイルを使用している場合に、これらに同じキーがあると、後に読み込まれた`values`ファイルが優先されるようになっている。

この時に、`helmfile write-values`コマンドを使用すると、優先された値で定義された`values`ファイルを確認できる。

```bash
$ helmfile -e dev -f ./helmfile.yaml write-values

# helmfile.yamlファイルのディレクトリ以下に、ディレクトリとファイルが生成される。
Writing values file foo-77cab19b/foo.yaml
```

<br>
