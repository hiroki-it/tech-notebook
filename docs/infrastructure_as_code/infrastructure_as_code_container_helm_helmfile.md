# Helmfile＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Helmfileの仕組み

helmコマンドを宣言的に実行できる。ただし、ArgoCDでも同様のことを設定できるため、もしhelmコマンドの実行を自動化したい場合は、ArgoCDを使用すると良い。

<br>

## 02. 設計ポリシー

### ディレクトリ構成

#### ▼ マイクロサービス別

マイクロサービスをデプロイの単位とみなし、マイクロサービスごとに別にディレクトリを作成する。各マイクロサービスのディレクトリには、```helmfile.d```ディレクトリを置き、ここにリリース単位の```helmfile.yaml```ファイルを置く。

参考：https://speakerdeck.com/j5ik2o/helmfilenituite

```yaml
├── foo/ # fooサービス
│   ├── helmfile.d/
│   │   └── helmfile.yaml
│   │
│   └── values.yaml
│
├── bar/ # barサービス
│   ├── helmfile.d/
│   │   └── helmfile.yaml
│   │
│   └── values.yaml
│
└── baz/ # bazサービス
    ├── helmfile.d/
    │   └── helmfile.yaml
    │
    └── values.yaml
```

リリース単位は、Kubernetesリソースとするとよい。

```bash
├── foo/ # fooサービス
│   ├── helmfile.d/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── persistent-volume.yaml
│   │   └── persistent-volume-claim.yaml
│   │
│   └── values.yaml
│
├── bar/ # barサービス
│   ├── helmfile.d/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── persistent-volume.yaml
│   │   └── persistent-volume-claim.yaml
│   │
│   └── values.yaml
│
└── baz/ # bazサービス
    ├── helmfile.d/
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   ├── persistent-volume.yaml
    │   └── persistent-volume-claim.yaml
    │
    └── values.yaml
```

<br>

## 03. helmfile.yaml

### environments

もし、```releases.values```キーに```values.yaml.gotmpl```ファイルを設定している場合、これの変数として値を渡す。

参考：https://helmfile.readthedocs.io/en/latest/#environment-values

```yaml
environments:
  - prd:
    - values: prd-values.yaml
  - dev:
    - values: dev-values.yaml

releases:
  - values:
    - values.yaml.gotmpl
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

チャートをリリースする名前空間を設定する。

```yaml
releases:
  - namespace: foo-namespace
```

#### ▼ createNamespace

リリース時に名前空間が存在しない場合に、これの作成を有効化する。

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
  - version: n.n.n
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

参考：https://helmfile.readthedocs.io/en/latest/#secrets

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

参考：https://github.com/helmfile/helmfile#cli-reference

```bash
$ helmfile <コマンド>
```

#### ▼ -e

リリース対象の実行環境名を設定する。

参考：https://github.com/helmfile/helmfile#cli-reference

```bash
$ helmfile -e prd <コマンド>
```

#### ▼ -f

使用する```helmfile.yaml```ファイルを指定する。

参考：https://github.com/helmfile/helmfile#cli-reference

```bash
$ helmfile -f helmfile.yaml <コマンド>
```

<br>

### apply

#### ▼ apply

まず```helmfile diff```コマンドを実行し、この時に差分があれば、```helmfile apply```コマンドを実行する。

参考：https://github.com/helmfile/helmfile#apply

```bash
$ helmfile apply
```

<br>

### destroy

#### ▼ destroyとは

全てのリリースをアンインストールする。

参考：https://github.com/helmfile/helmfile#destroy

```bash
$ helmfile destroy
```

<br>

### diff

#### ▼ diffとは

全てのリリースに対して、helm-diffプラグインを実行する。helm-diffプラグインでは、リリース済みの最新バージョンと、```helm upgrade --debug --dry-run```コマンドの差分を表示する。

参考：

- https://github.com/helmfile/helmfile#diff
- https://github.com/databus23/helm-diff#helm-diff-plugin

```bash
$ helmfile diff
```

<br>

### sync

#### ▼ syncとは

全てのリリースに関して、```helm upgrade --install```コマンドを実行する。

参考：helmfile/helmfile#sync

```bash
$ helmfile sync
```

