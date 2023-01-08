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

```helm```コマンドを宣言的に実行できる。

ただし、ArgoCDのApplicationの```spec.source.helm```キーでも```helm```コマンドを宣言的に実行しつつ、実行を自動化できる。

そのため、できるだけArgoCDを使用した方が良い。



<br>

## 02. 設計ポリシー

### ディレクトリ構成ポリシー

#### ▼ マイクロサービス別

マイクロサービスをapplyの単位とみなし、マイクロサービスごとに別にディレクトリを作成する。

各マイクロサービスのディレクトリには、```helmfile.d```ディレクトリを置き、ここにリリース単位の```helmfile.d```ファイルを置く。



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

### ```helmfile.d```ファイルとは

```helm```コマンドを宣言的に定義する。

チャートをインストールする時、ほとんどのチャートで以下のコマンドを実行することになる。

```bash
$ helm repo add <チャートリポジトリ名> <URL>

$ helm repo update

$ kubectl create namespace <Namespace名>

$ helm install <リリース名> <チャートリポジトリ名>/<チャート名> -n <Namespace名> --version <バージョンタグ>
```

これを```helmfile.d```ファイルで定義すると、以下のようになる。

```yaml
repositories:
  - name: <チャートリポジトリ名>
    url: <URL>

releases:
  - name: <リリース名>
    namespace: <Namespace名>
    chart: <チャートリポジトリ名>/<チャート名>
    version: <バージョンタグ>
```

<br>

### environments

環境名のリストとして動作し、```helmfile```コマンド時に```helmfile.d```ファイル内に環境名を渡せる。


> ℹ️ 参考：https://helmfile.readthedocs.io/en/latest/#environment-values

```yaml
environments:
  dev:
  prd:

repositories:
  - name: foo-repository
    url: https://github.com/hiroki.hasegawa/foo-repository

releases:
  - name: foo
    chart: foo-repository/foo-chart
    version: <バージョンタグ>
    values:
      - values-{{ .Environment.Name }}.yaml
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

チャートをインストールするNamespaceを設定する。

各マニフェストで定義することもできるが、実装し忘れがよく起こるため、Helmfileでまとめて指定しまうと良い。

ただし、マニフェスト側だけしか見ていないと、Namespaceが指定されていないように見えるため、注意が必要である。



```yaml
releases:
  - namespace: foo-namespace
```

#### ▼ createNamespace

リリース時にNamespaceが存在しない場合、これの作成を有効化するか否かを設定する。

デフォルトで```true```になっており、リリース前にNamespaceを自動的に作成するようになっている。

ただし、Namespaceので出どころがわからなくなるため、Helmfileの機能に頼らずにNamespaceのマニフェストを定義しておく方が良い。

```yaml
releases:
  - createNamespace: true
```

#### ▼ chart

リリース対象のチャートへのパスを設定する。


```yaml
releases:
  - chart: <チャートリポジトリ名>/foo-chart
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

チャートリポジトリ名を設定する。ここで設定したリポジトリ名は、```releases[].chart```キーでも使用する。



```yaml
repositories:
  - name: foo-repository

releases:
  - name: foo
    chart: <チャートリポジトリ名>/foo-chart
    version: <バージョンタグ>
    values:
      - values.yaml
```

#### ▼ url

リリース対象のチャートリポジトリのURLを設定する。



```yaml
repositories:
  - url: https://kubernetes.github.io/ingress-nginx

releases:
  - name: foo
    chart: ingress-nginx/foo-chart
    version: <バージョンタグ>
    values:
      - values.yaml
```

<br>
