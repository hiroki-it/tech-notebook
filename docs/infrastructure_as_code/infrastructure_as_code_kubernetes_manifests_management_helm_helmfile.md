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

ただし、ArgoCDのApplicationの```.spec.source.helm```キーでも```helm```コマンドを宣言的に実行しつつ、実行を自動化できる。

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

#### ▼ environments

環境名のリストとして動作し、```helmfile```コマンド時に```helmfile.d```ファイル内に環境名を渡せる。


> ℹ️ 参考：https://helmfile.readthedocs.io/en/latest/#environment-values

#### ▼ 実行環境名を渡したいだけの場合

実行環境名を渡したいだけの場合、```environments```キー配下のキー自体を```{{ .Environment.Name }}```のように変数化する。

```yaml
environments:
  {{ .Environment.Name }}:
    values:
      - values-{{ .Environment.Name }}.yaml
    secrets:
      - secrets-{{ .Environment.Name }}.yaml

repositories:
  - name: foo-repository
    url: https://github.com/hiroki.hasegawa/foo-repository

releases:
  - name: foo
    chart: foo-repository/foo-chart
    version: <バージョンタグ>
```

```bash
# 環境名を渡す。
$ helmfile -e dev apply
```

> ℹ️ 参考：https://speakerdeck.com/j5ik2o/helmfilenituite?slide=22

#### ▼ 実行環境名を渡す以外こともやりたい場合

実行環境名を渡す以外こともやりたい場合、```environments```キー配下のキー自体に実行環境名を設定する。

あまりユースケースがないかもしれない。

```yaml
environments:
  dev:
    values:
      - values-foo.yaml
    secrets:
      - secrets-foo.yaml
  prd:
    values:
      - values-bar.yaml
    secrets:
      - secrets-bar.yaml

repositories:
  - name: foo-repository
    url: https://github.com/hiroki.hasegawa/foo-repository

releases:
  - name: foo
    chart: foo-repository/foo-chart
    version: <バージョンタグ>
```

```bash
# 環境名を渡す。
$ helmfile -e dev apply
```

<br>

### helmfiles

```helmfile```コマンド時に```-f```オプションを省略できるように、```helmfile```ファイルを宣言的に指定する。

```yaml
helmfiles:
  - path: ./helmfile.d/foo.yaml
  - path: ./helmfile.d/bar.yaml
  - path: ./helmfile.d/baz.yaml
```

> ℹ️ 参考：https://helmfile.readthedocs.io/en/latest/#selectors

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

ただし、Namespaceので出どころがわからなくなるため、Helmfileの```createNamespace```オプションは無効化し、Namespaceのマニフェストを定義しておく方が良い。

```yaml
releases:
  - createNamespace: false
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

もし```{{ .Environment.Name }}```を使用したい場合は、```environments```キーの方でvaluesファイルを読み込ませるようにする。

```yaml
environments:
  {{ .Environment.Name }}:
    values:
      - values-{{ .Environment.Name }}/yaml

releases:
  ...
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

## 04. values.gotmplファイル

### values.gotmplファイルとは

Helmでは```values```ファイルをテンプレート化できないが、Helmfileではこれが可能である。

```values```ファイルに、Helmfileの変数や他の```values```ファイルの値を出力する。

特に、公式チャートに実行環境別の```values```ファイルを渡したい場合に役立つ。

注意点として、```values.yaml.gotmpl```ファイルに値を渡すための```values```ファイルは、Helmfileの```environments```キー配下で読み込まなければならない。

```yaml
repositories:
  - name: foo-repository
    url: https://github.com/hiroki.hasegawa/foo-repository

releases:
  - name: foo
    chart: foo-repository/foo-chart
    version: <バージョンタグ>
    values:
      - values.yaml.gotmpl # 実行環境間で共有するvaluesファイル

environments:
  {{ .Environment.Name }}:
    values:
      - values-{{ .Environment.Name }}.yaml # values.yaml.gotmplファイルに値を渡すvaluesファイル
```

> ℹ️ 参考：
> 
> - https://helmfile.readthedocs.io/en/latest/#environment-values
> - https://speakerdeck.com/j5ik2o/helmfilenituite?slide=22
> - https://zenn.dev/johnmanjiro13/articles/3f12eeda0762b9#%E7%8B%AC%E8%87%AA%E3%81%AEhelm-chart%E3%82%92%E4%BD%9C%E6%88%90%E3%81%97%E3%81%A6helmfile%E3%81%A7%E7%AE%A1%E7%90%86%E3%81%99%E3%82%8B

<br>
