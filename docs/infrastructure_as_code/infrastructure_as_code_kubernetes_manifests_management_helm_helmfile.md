---
title: 【IT技術の知見】Helmfile＠Helm
description: Helmfile＠Helmの知見を記録しています。
---

# Helmfile＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Helmfileの仕組み

```helm```コマンドを宣言的に実行できる。ただし、ArgoCDのApplicationの```spec.source.helm```キーでも```helm```コマンドを宣言的に実行しつつ、実行を自動化できる。そのため、できるだけArgoCDを使用した方が良い。

<br>

## 02. 設計ポリシー

### ディレクトリ構成ポリシー

#### ▼ マイクロサービス別

マイクロサービスをapplyの単位とみなし、マイクロサービスごとに別にディレクトリを作成する。各マイクロサービスのディレクトリには、```helmfile.d```ディレクトリを置き、ここにリリース単位の```helmfile.d```ファイルを置く。

> ℹ️ 参考：https://speakerdeck.com/j5ik2o/helmfilenituite

```yaml
repository/
├── foo/ # fooサービス
│   ├── helmfile.d/
│   │   └── helmfile.yaml # helmfile.dファイル
│   │
│   ├── chart/ # チャート（外部チャートを使用する場合は不要）
│   └── values/ # 環境別のvaluesファイル
│
├── bar/ # barサービス
└── baz/ # bazサービス
```

リリース単位は、Kubernetesリソースとすると良い。

```yaml
repository/
├── foo/ # fooサービス
│   ├── helmfile.d/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── persistent-volume.yaml
│   │   └── persistent-volume-claim.yaml
│   │
│   ├── chart/ # ローカルのチャート（リモートのチャートをインストールする場合は不要）
│   └── values/ # 環境別のvaluesファイル
│
├── bar/ # barサービス
└── baz/ # bazサービス
```

<br>

## 03. helmfile.dファイル

### environments

環境名のリストとして動作し、```helmfile```コマンド時に```helmfile.d```ファイル内に環境名を渡せる。

> ℹ️ 参考：https://helmfile.readthedocs.io/en/latest/#environment-values

```yaml
environments:
  dev:
  prd:

releases:
  - name: foo
    chart: ./foo-chart
    version: <バージョンタグ>
    values:
      - {{ .Environment.Name }}-values.yaml
```

```bash
# 環境名を渡す。
$ helmfile -e dev apply
```

<br>

### releases

#### ▼ name

リリース名を設定する。

```yaml
releases:
  - name: foo
```

#### ▼ namespace

チャートをインストールするNamespaceを設定する。各マニフェストで定義することもできるが、実装し忘れがよく起こるため、Helmfileでまとめて指定しまうと良い。ただし、マニフェスト側だけしか見ていないと、Namespaceが指定されていないように見えるため、注意が必要である。

```yaml
releases:
  - namespace: foo-namespace
```

#### ▼ createNamespace

リリース時にNamespaceが存在しない場合、これの作成を有効化するか否かを設定する。

```yaml
releases:
  - createNamespace: true
```

#### ▼ chart

リリース対象のチャートへのパスを設定する。

```yaml
releases:
  - chart: ./foo-chart
```

#### ▼ version

リリースのバージョンを設定する。

```yaml
releases:
  - version: <バージョンタグ>
```

#### ▼ values

Helmの実行時に複合化する```values```ファイルを設定する。


```yaml
releases:
  - values:
      - ./foo-values.yaml
```

#### ▼ secrets

Helmの実行時に複合化するSecretのファイルを設定する。

> ℹ️ 参考：https://helmfile.readthedocs.io/en/latest/#secrets

```yaml
secrets:
      - ./foo-secrets.yaml
```

<br>

### repositories

#### ▼ name

チャートリポジトリ名を設定する。

```yaml
repositories:
  - name: foo-repository
```

#### ▼ url

リリース対象のチャートリポジトリのURLを設定する。

```yaml
repositories:
  - url: https://kubernetes.github.io/ingress-nginx
```

<br>

## 04. helmfileコマンド

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

**＊実行例＊**

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

まず```helmfile diff```コマンドを実行し、この時に差分があれば、```helmfile apply```コマンドを実行する。```helmfile sync```コマンドとは異なり、リリース間に差分がないと、リビジョン番号は更新されない。注意点として、Helmの使用と同様にして、カスタムリソースのマニフェストを変更できない。

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

### diff

#### ▼ diffとは

全てのリリースに対して、helm-diffプラグインを実行する。helm-diffプラグインでは、リリース済みの最新バージョンと、```helm upgrade --debug --dry-run```コマンドの差分を取得する。

> ℹ️ 参考：
>
> - https://helmfile.readthedocs.io/en/latest/#diff
> - https://github.com/databus23/helm-diff#helm-diff-plugin

```bash
$ helmfile -e prd diff
```

#### ▼ grepとの組み合わせ

マニフェストの差分が多すぎる場合、先にどのリソースに変更があるのかを把握した方がよい。```grep```を使用して、差分のあるリソースやファイルを確認しておく。

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

全てのリリースに関して、```helm upgrade --install```コマンドを実行する。```helmfile apply```コマンドとは異なり、リリース間に差分がなくとも、リビジョン番号を更新する。注意点として、Helmの使用と同様にして、カスタムリソースのマニフェストを変更できない。

> ℹ️ 参考：https://stackoverflow.com/questions/59703760/helmfile-sync-vs-helmfile-apply

```bash
$ helmfile -e prd sync
```

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

個人的に感動したコマンド。```helmfile```コマンドの実行で使用される```values```ファイルを、ファイルに書き出す。複数の```values```ファイルを使用している場合に、これらに同じキーがあると、後に読み込まれた```values```ファイルが優先されるようになっている。この時に、```helmfile write-values```コマンドを使用すると、優先された値で定義された```values```ファイルを確認できる。

```bash
$ helmfile -e prd -f ./helmfile.yaml write-values

# helmfile.yamlファイルのディレクトリ以下に、ディレクトリとファイルが生成される。
Writing values file foo-77cab19b/foo.yaml
```

<br>
