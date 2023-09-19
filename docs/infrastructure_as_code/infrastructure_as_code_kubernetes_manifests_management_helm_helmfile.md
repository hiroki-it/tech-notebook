---
title: 【IT技術の知見】Helmfile＠Helm
description: Helmfile＠Helmの知見を記録しています。
---

# Helmfile＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Helmfileの仕組み

`helm`コマンドを宣言的に実行できる。

ただし、ArgoCDのApplicationの`.spec.source.helm`キーでも`helm`コマンドを宣言的に実行しつつ、実行を自動化できる。

そのため、できるだけArgoCDを使用した方が良い。

<br>

## 02. 設計規約

### ディレクトリ構成規約

#### ▼ マイクロサービス別

マイクロサービスをチャートの単位とみなし、マイクロサービスごとに別にディレクトリを作成する。

各マイクロサービスのディレクトリには、`helmfile.d`ディレクトリを置き、ここにHelmリリース単位の`helmfile.d`ファイルを置く。

```yaml
repository/
├── foo/ # fooサービス
│   ├── helmfile.d/
│   │   └── helmfile.yaml # helmfile.dファイル
│   │
│   ├── chart/ # チャート (外部チャートを使用する場合は不要)
│   └── values/ # 環境別のvaluesファイル
│
├── bar/ # barサービス
└── baz/ # bazサービス
```

Helmリリース単位は、Kubernetesリソースとすると良い。

```yaml
repository/
├── foo/ # fooサービス
│   ├── helmfile.d/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── persistent-volume.yaml
│   │   └── persistent-volume-claim.yaml
│   │
│   ├── chart/ # ローカルのチャート (リモートのチャートをインストールする場合は不要)
│   └── values/ # 環境別のvaluesファイル
│
├── bar/ # barサービス
└── baz/ # bazサービス
```

> - https://speakerdeck.com/j5ik2o/helmfilenituite

<br>

## 03. helmfile.dファイル

### `helmfile.d`ファイルとは

`helm`コマンドを宣言的に定義する。

チャートをインストールする時、ほとんどのチャートで以下のコマンドを実行することになる。

```bash
$ helm repo add <チャートリポジトリ名> <URL>

$ helm repo update

$ kubectl create namespace <Namespace名>

$ helm install <Helmリリース名> <チャートリポジトリ名>/<チャート名> -n <Namespace名> --version <バージョンタグ>
```

これを`helmfile.d`ファイルで定義すると、以下のようになる。

```yaml
repositories:
  - name: <チャートリポジトリ名>
    url: <URL>

releases:
  - name: <Helmリリース名>
    namespace: <Namespace名>
    chart: <チャートリポジトリ名>/<チャート名>
    version: <バージョンタグ>
```

補足として、`helmfile.d`ファイル内でもHelmの関数を使用できる。

```yaml
environments:
  {{ .Environment.Name }}:

repositories:
  - name: <チャートリポジトリ名>
    url: <URL>

releases:
  - name: <Helmリリース名>
    namespace: <Namespace名>
    chart: <チャートリポジトリ名>/<チャート名>
    version: <バージョンタグ>
    # 実行環境ごとに、読み込むvalues.yaml.gotmplファイルを切り替える。
    values:
      {{- if or (eq .Environment.Name "dev") (eq .Environment.Name "tes") }}
      - values-nonprd.yaml.gotmpl
      {{- end }}
      {{- if eq .Environment.Name "prd" }}
      - values-prd.yaml.gotmpl
      {{- end }}
```

<br>

### `helmfile.d`ファイルで使える変数

#### ▼ `.Environment.Name`

`helmfile`コマンドの`-e`オプションに渡した値は、`helmfile.d`ファイル内の`.Environment.Name`に出力できる。

```bash
$ helmfile -e prd -f helmfile.yaml
```

```yaml
{{.Environment.Name}}
```

#### ▼ `.Values`

`helmfile`コマンドの`--state-values-set`オプションに渡した値は、`helmfile.d`ファイル内の`.Values`に出力できる。

```bash
$ helmfile -e prd -f helmfile.yaml --state-values-set region=tokyo
```

```yaml
{{.Values.region}}
```

<br>

### environments

#### ▼ environments

`helmfile`コマンド時に`helmfile.d`ファイル内に環境名を渡せる。

> - https://helmfile.readthedocs.io/en/latest/#environment-values

#### ▼ 実行環境名を渡したいだけの場合

実行環境名を渡したいだけの場合、`environments`キー配下のキー自体を`{{ .Environment.Name }}`のように変数化する。

```yaml
environments:
  {{.Environment.Name}}:
    values:
      - values-{{ .Environment.Name }}.yaml
    secrets:
      - secrets-{{ .Environment.Name }}.yaml

repositories:
  - name: foo-repository
    url: https://github.com/hiroki-hasegawa/foo-repository

releases:
  - name: foo
    chart: foo-repository/foo-chart
    version: <バージョンタグ>
```

```bash
# 環境名を渡す。
$ helmfile -e dev apply
```

> - https://speakerdeck.com/j5ik2o/helmfilenituite?slide=22

#### ▼ 実行環境名を渡す以外こともやりたい場合

実行環境名を渡す以外こともやりたい場合、`environments`キー配下のキー自体に実行環境名を設定する。

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
    url: https://github.com/hiroki-hasegawa/foo-repository

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

`helmfile`コマンド時に`-f`オプションを省略できるように、`helmfile`ファイルを宣言的に指定する。

```yaml
helmfiles:
  - path: ./helmfile.d/foo.yaml
  - path: ./helmfile.d/bar.yaml
  - path: ./helmfile.d/baz.yaml
```

> - https://helmfile.readthedocs.io/en/latest/#selectors

<br>

### releases

#### ▼ atomic

`helmfile apply`コマンドが正常に完了しなかった場合に、自動的にロールバックする。

ただし、Helmfileの自動作成機能でNamespaceは削除されずそのまま残る。

```yaml
releases:
  - atomic: true
```

#### ▼ name

Helmリリース名を設定する。

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

`helm install`コマンド時にNamespaceが存在しない場合、これの作成を有効化するか否かを設定する。

デフォルトで`true`になっており、Helmリリース前にNamespaceを自動的に作成するようになっている。

ただし、Namespaceので出どころがわからなくなるため、Helmfileの`createNamespace`オプションは無効化し、Namespaceのマニフェストを定義しておく方が良い。

```yaml
releases:
  - createNamespace: false
```

#### ▼ chart

Helmリリース対象のチャートへのパスを設定する。

```yaml
releases:
  - chart: <チャートリポジトリ名>/foo-chart
```

#### ▼ version

Helmリリースのバージョンを設定する。

```yaml
releases:
  - version: <バージョンタグ>
```

#### ▼ values

Helmの実行時に復号化する`values`ファイルを設定する。

```yaml
releases:
  - values:
      - ./foo-values.yaml
```

もし`{{ .Environment.Name }}`を使用したい場合は、`environments`キーの方でvaluesファイルを読み込ませるようにする。

```yaml
environments:
  {{.Environment.Name}}:
    values:
      - values-{{ .Environment.Name }}.yaml

releases: ...
```

#### ▼ set

Helmの実行時に出力する`values`の値を設定する。

キー名にドットを含む場合、エスケープする必要がある。

```yaml
releases:
  - set:
      - name: foo
        value: FOO
      - name: bar\.enabled
        value: true
```

<br>

### repositories

#### ▼ name

チャートリポジトリ名を設定する。ここで設定したリポジトリ名は、`releases[].chart`キーでも使用する。

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

Helmリリース対象のチャートリポジトリのURLを設定する。

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

### secrets

Helmの実行時に復号化するSecretのファイルを設定する。

```yaml
secrets:
  - ./foo-secrets.yaml
```

> - https://helmfile.readthedocs.io/en/latest/#secrets

<br>

## 04. Helmfile固有の関数

### readFile

#### ▼ readFileとは

テキストファイルを想定パスで読み込み、レンダリングする。

readFile関数の前で改行する、１行目に空行が入ったり、関数処理時に発生した不要な文字 (体験談：`2`) が混入することに注意する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-configmap
data:
  policy.csv: |
    {{ readFile ./policy.csv | nindent 4 }}

# apiVersion: v1
# kind: ConfigMap
# metadata:
#   name: foo-configmap
# data:
#   policy.csv: |
#
#     foo, bar, baz
```

#### ▼ 空行を挿入したくない

空行を挿入したくない場合、`readFile`関数で出力できないようにする。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-configmap
data:
  policy.csv: | {{ readFile ./policy.csv | nindent 4 }}

# apiVersion: v1
# kind: ConfigMap
# metadata:
#   name: foo-configmap
# data:
#   policy.csv: |
#     foo, bar, baz
```

> - https://github.com/roboll/helmfile/issues/731#issuecomment-877718674

#### ▼ JSONファイルを読み込める

Helmには`.Files.Get`関数や`.Files.Glob`関数がある。

これらの関数でJSONファイルを読み込もうとすると、 (なぜか) エラーになる。

Helmfileの`readFile`関数ではエラーが起こらない。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-configmap
data:
  foo.json: | {{ readFile foo.json | nindent 4 }}
```

<br>

## 05. values.gotmplファイル

### values.gotmplファイルとは

Helmでは`values`ファイルをテンプレート化できないが、Helmfileではこれが可能である。

`values`ファイルに、Helmfileの変数や他の`values`ファイルの値を出力する。

特に、公式チャートに実行環境別の`values`ファイルを渡したい場合に役立つ。

注意点として、`environments`キーの後に`releases`キーが読み込まれる。

そのため、`values.yaml.gotmpl`ファイルに値を渡すための`values`ファイルは、Helmfileの`environments`キー配下で読み込まなければならない。

```yaml
environments:
  {{.Environment.Name}}:
    values:
      # values.yaml.gotmplファイルに値を渡すvaluesファイル
      - values-{{ .Environment.Name }}.yaml

repositories:
  - name: foo-repository
    url: https://github.com/hiroki-hasegawa/foo-repository

releases:
  - name: foo
    chart: foo-repository/foo-chart
    version: <バージョンタグ>
    values:
      # 実行環境間で共有するvaluesファイル
      - values.yaml.gotmpl
```

> - https://helmfile.readthedocs.io/en/latest/#environment-values
> - https://speakerdeck.com/j5ik2o/helmfilenituite?slide=22
> - https://zenn.dev/johnmanjiro13/articles/3f12eeda0762b9#%E7%8B%AC%E8%87%AA%E3%81%AEhelm-chart%E3%82%92%E4%BD%9C%E6%88%90%E3%81%97%E3%81%A6helmfile%E3%81%A7%E7%AE%A1%E7%90%86%E3%81%99%E3%82%8B

<br>
