---
title: 【IT技術の知見】Helm＠マニフェスト管理
description: Helm＠マニフェスト管理の知見を記録しています。
---

# Helm＠マニフェスト管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Helmの仕組み

### アーキテクチャ

![helm_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/helm_architecture.png)

Helmは、helmクライアント、チャートレジストリ、複数のチャートリポジトリ、チャート、から構成される。

> ℹ️ 参考：
>
> - https://cloudacademy.com/course/introduction-to-helm-1034/helm-architecture/
> - https://helm.sh/ja/docs/glossary/
> - https://deeeet.com/writing/2018/01/10/kubernetes-yaml/

<br>

### helmクライアント

#### ▼ helmクライアントとは

helmクライアントは、リポジトリからインストールしたチャートアーカイブ（```.tgz```形式ファイル）に基づいて、現在のコンテキストで指定されているClusterのkube-apiserverにリクエストを送信する。これにより、Kubernetes上にKubernetesリソースが作成される。

<br>

### チャートレジストリ

#### ▼ チャートレジストリとは

チャートレジストリとして使用できるものの一覧を示す。チャートレジストリ内にリポジトリを配置する。

| レジストリ               | 補足                                                   |
|---------------------| ------------------------------------------------------ |
| ArtifactHub（Helm公式） | ℹ️ 参考：https://helm.sh/docs/topics/chart_repository/    |
| GitHub、GitHub Pages | ℹ️ 参考：https://zenn.dev/mikutas/articles/2ab146fa1ea35b |
| AWSリソース（ECR、S3）     |                                                        |
| GCPリソース             |                                                        |


<br>

### チャートリポジトリ

#### ▼ チャートリポジトリとは

チャートをリモートに置いて、インストールできるようになる。チャートのプッシュやプル時に、チャートレジストリ内のリポジトリを指定する場合は、HTTPSプロトコルを使用する。リポジトリにリモートからインストールできないチャートが配置されている場合、そのリポジトリはチャートリポジトリではなく、マニフェストリポジトリである。

> ℹ️ 参考：https://helm.sh/docs/topics/chart_repository/#create-a-chart-repository

|     | URL    |
|-----|-----|
| 形式    | ```https://<チャートレジストリのドメイン名>/<チャートリポジトリ名>```    |  
| 例    |  ```https://example.com/foo-chart```   | 

#### ▼ OCIリポジトリ

チャートリポジトリのように、リモートにあるチャートをインストールできるようになる。チャートのプッシュやプル時に、OCIレジストリ内のリポジトリを指定する場合は、OCIプロトコルを使用する。

|     | URL    |
|-----|-----|
| 形式    | ```oci://<チャートレジストリ名>/<チャートリポジトリ名>```    |  
| 例    |  ```oci://foo-registry/foo-repository```   | 

#### ▼ リポジトリをチャートリポジトリとして扱う場合

リポジトリをチャートリポジトリとして扱う場合、チャートリポジトリのルートディレクトリ配下に、```index.yaml```ファイル、各バージョンのチャートアーカイブ（```.tgz```形式ファイル）、を配置する。これらにより、リモートからチャートリポジトリのURLを指定し、チャートをインストールできるようになる。ArtifactHubや、GitHubリポジトリにて```gh-pages```ブランチ上で複数のバージョンのチャートを管理するような使い方は、このチャートリポジトリに相当する。

> ℹ️ 参考：
>
> - https://helm.sh/docs/topics/chart_repository/#the-chart-repository-structure
> - https://zenn.dev/mikutas/articles/2ab146fa1ea35b

```yaml
repository/ # チャートリポジトリ
├── index.yaml
├── foo-chart-1.0.0.tgz # fooチャートアーカイブ
├── foo-chart-2.0.0.tgz 
├── bar-chart-1.0.0.tgz # barチャートアーカイブ
├── bar-chart-2.0.0.tgz
├── baz-chart-1.0.0.tgz # bazチャートアーカイブ
├── baz-chart-2.0.0.tgz
...
```

#### ▼ リポジトリをマニフェストリポジトリとしてのまま扱う場合

リポジトリをチャートリポジトリとして扱わず、ローカルのチャートとして操作する場合、```index.yaml```ファイルとチャートアーカイブ（```.tgz```形式ファイル）が不要になる。リモートからは、チャートをインストールできない。

> ℹ️ 参考：https://codefresh.io/docs/docs/new-helm/helm-best-practices/#helm-repositories-are-optional

```yaml
repository/ # マニフェストリポジトリ
├── foo-chart # fooチャート
├── bar-chart # barチャート
├── baz-chart # bazチャート
...
```

<br>

### チャート

#### ▼ チャートとは

必要なKubernetesリソースを作成するためのマニフェストのセットをパッケージ化し、管理しやすくしたもの。ルートディレクトリに```Chart.yaml```ファイルと```template```ディレクトリを置く必要がある。また、チャートのコントリビュート要件も参考にすること。

```yaml
repository/
├── foo-chart/ # fooチャート
│   ├── charts/ # 依存する他のチャートを配置する。
│   ├── templates/ # ユーザー定義のチャートを配置する。ディレクトリ構造は自由である。
│   │   ├── tests/
│   │   ├── _helpers.tpl # ヘルパー関数のみを設定する。
│   │   └── template.yaml # チャートの共通ロジックを設定する。
│   │
│   ├── .helmignore # チャートアーカイブの作成時に無視するファイルを設定する。
│   ├── Chart.yaml # チャートの概要を設定する。頭文字は大文字である必要がある。
│   └── values.yaml # テンプレートの変数に出力する値を設定する。
│
├── bar-chart/ # barチャート
...
```


> ℹ️ 参考：
>
> - https://helm.sh/docs/topics/charts/#the-chart-file-structure
> - https://github.com/helm/charts/blob/master/CONTRIBUTING.md#technical-requirements
> - https://helm.sh/docs/helm/helm_package/
> - https://helm.sh/docs/chart_best_practices/conventions/#usage-of-the-words-helm-and-chart


#### ▼ チャートアーカイブ

```.tgz```形式で圧縮されたチャートのパッケージ。

#### ▼ リリース

実際にインストールされたチャートのインスタンスのこと。

> ℹ️ 参考：https://helm.sh/docs/intro/using_helm/#three-big-concepts

<br>

## 02. セットアップ

### インストール

#### ▼ aptリポジトリから

> ℹ️ 参考：https://helm.sh/docs/intro/install/#from-apt-debianubuntu

```bash
$ curl https://helm.baltorepo.com/organization/signing.asc | sudo apt-key add -
$ sudo apt-get install apt-transport-https --yes
$ echo "deb https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
$ sudo apt-get update
$ sudo apt-get install helm
```

<br>

## 03. index.yamlファイル

### index.yamlファイルとは

チャートリポジトリ内の各チャートアーカイブ（```.tgz```形式ファイル）のメタデータを設定する。```helm repo index```コマンドによって、```Chart.yaml```ファイルに基づいて自動作成されるため、ユーザーが設定する項目は少ない。

> ℹ️ 参考：https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### apiVersion

#### ▼ apiVersionとは

> ℹ️ 参考：https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### entries

#### ▼ entriesとは

> ℹ️ 参考：https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### generated

#### ▼ generatedとは

コマンドによって```index.yaml```ファイルが作成された日付を設定する。

```yaml
generated: "2022-01-01T12:00:00.197173+09:00"
```

<br>

## 04. Chart.yamlファイル

### apiVersion

#### ▼ apiVersionとは

Helm-APIのバージョンを設定する。```apiVersion```キーの```v1```はHelmの```v2```に対応しており、```v2```は```v3```に対応している。

```yaml
apiVersion: v2
```

> ℹ️ 参考：
>
> - https://helm.sh/docs/topics/charts/#the-apiversion-field
> - https://helm.sh/docs/topics/v2_v3_migration/

<br>

### appVersion

#### ▼ appVersionとは

Kubernetes上で稼働するアプリケーションのリリースバージョンを設定する。リリースバージョンは、GitHubのリリースタグで管理した方がよく、```appVersion```キーの値は特に変更しなくても良い。

> ℹ️ 参考：https://helm.sh/docs/topics/charts/#the-appversion-field

```yaml
appVersion: <バージョンタグ>
```

<br>

### description

#### ▼ descriptionとは

チャートの説明を設定する。

```yaml
description: The chart of foo
```

<br>

### dependencies

#### ▼ dependenciesとは

依存対象のチャートを設定する。設定されたチャートは、```charts```ディレクトリにダウンロードされる。

> ℹ️ 参考：https://helm.sh/docs/topics/charts/#chart-dependencies

```yaml
dependencies:
  - name: foo
    version: 1.2.3
    repository: https://foo.example.com/foo-chart
  - name: bar
    version: 3.2.1
    repository: https://bar.example.com/bar-chart
```

<br>

### maintainers

#### ▼ maintainersとは

チャートの管理者を設定する。

```yaml
maintainers:
  - name: hiroki hasegawa
    email: example@gmail.com
    url: https://example.com
```

<br>

### name

#### ▼ nameとは

Helmで作成されるKubernetesリソースの接頭辞を設定する。

> ℹ️ 参考：https://helm.sh/docs/topics/charts/#the-chartyaml-file

```yaml
name: foo
```

<br>

### type

#### ▼ typeとは

チャートのタイプを設定する。

> ℹ️ 参考：https://helm.sh/docs/topics/charts/#chart-types

```yaml
type: application
```

<br>

### version

#### ▼ versionとは

チャートアーカイブ（```.tgz```形式ファイル）のリリースバージョンを設定する。```template```ディレクトリ配下のファイルを変更した場合に更新する。

> ℹ️ 参考：https://helm.sh/docs/topics/charts/#charts-and-versioning

```yaml
version: <バージョンタグ>
```

<br>



## 05. values.yaml

### 共通オプション

#### ▼ 共通オプションとは

多くの外部チャートで共通して用意されている```values```ファイルのデフォルトオプションである。共通オプションは、外部チャート内の```_help.tpl```ファイルに出力される。

> ℹ️ 参考：https://knowledge.sakura.ad.jp/23603/

#### ▼ affinity

チャート内のDeploymentの```spec.template.spec.affinity```キーに値を設定する。

#### ▼ fullnameOverride

デフォルトでは、チャートのインストールによって作成されるKubernetesリソース名は、『```＜リリース名＞-＜Chart名＞```』になる。もし、```fullnameOverride```オプションを設定していた場合、Kubernetesリソースの名前は『```＜fullnameOverrideオプションの値＞```』になる。なおチャートごとに、Kubernetesリソース名の前後に特定の文字列（例：コンポーネント名、番号、インスタンスハッシュ値）がつくことがある。```nameOverride```オプションとは独立しており、```nameOverride```オプションでチャートをインストールした後に```fullnameOverride```オプションに移行したい場合、```nameOverride```オプションによるチャートを一度アンインストールする必要がある。しかし、そのまま```fullnameOverride```オプションに移行してしまうと、```nameOverride```オプション時のKubernetesリソースが残骸として残ってしまう可能性がある。

#### ▼ image.pullPolicy

チャート内のDeploymentの```spec.template.spec.containers.imagePullPolicy```キーに値を設定する。

#### ▼ imagePullSecrets

チャート内のDeploymentの```spec.template.spec.imagePullSecrets```キーに値を設定する。

#### ▼ image.repository

チャート内のDeploymentの```spec.template.spec.containers.image```キーに値を設定する。

#### ▼ image.tag

チャート内のオプションに値を設定する。

#### ▼ ingress.annotations

チャート内のIngressの```metadata.annotations```オプションに値を設定する。

#### ▼ ingress.enabled

Ingressの作成を有効化する。

#### ▼ ingress.hosts

チャート内のIngressの```spec.rules```キーに値を設定する。

#### ▼ ingress.tls

チャート内のIngressの```spec.tls```キーに値を設定する。

#### ▼ nameOverride

デフォルトでは、チャートによって作成されるKubernetesリソース名は、『```＜リリース名＞-＜Chart名＞```』になる。もし、```nameOverride```オプションを設定していた場合、Kubernetesリソース名は『```＜リリース名＞-＜nameOverrideオプションの値＞```』になる。なおチャートごとに、Kubernetesリソース名の前後に特定の文字列（例：コンポーネント名、番号、インスタンスハッシュ値）がつくことがある。```fullnameOverride```オプションとは独立しており、```fullnameOverride```オプションでチャートをインストールした後に```nameOverride```オプションに移行したい場合、```fullnameOverride```オプションによるチャートを一度アンインストールする必要がある。しかし、そのまま```nameOverride```オプションに移行してしまうと、```fullnameOverride```オプション時のKubernetesリソースが残骸として残ってしまう可能性がある。

#### ▼ nodeSelector

チャート内のDeploymentの```spec.template.spec.nodeSelector```キーに値を設定する。

#### ▼ podSecurityContext

チャート内のDeploymentの```spec.template.spec.securityContext```キーに値を設定する。

#### ▼ replicaCount

チャート内のDeploymentの```spec.replicas```キーに値を設定する。

#### ▼ resources

チャート内のDeploymentの```spec.template.spec.containers.resources```オプションに値を設定する。

#### ▼ securityContext

チャート内のDeploymentの```spec.template.spec.containers.securityContext```オプションに値を設定する。

#### ▼ serviceAccount.create

ServiceAccountの作成を有効化する。

#### ▼ serviceAccount.annotations

チャート内のServiceAccountの```metadata.annotations```オプションに値を設定する。

#### ▼ service.type

チャート内のServiceの```spec.type```キーに値を設定する。

#### ▼ service.port

チャート内のServiceの```spec.ports.port```キーに値を設定する。

#### ▼ tolerations

チャート内のDeploymentの```spec.template.spec.tolerations```キーに値を設定する。

<br>

## 06. アクション

### アクションとは

テンプレートからマニフェストを作成するために必要な機能を提供する。

> ℹ️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/

<br>

### include

#### ▼ includeとは

```define```関数で定義した文字列を加工して出力する。加工内容はパラメーターで設定できる。

> ℹ️ 参考：
>
> - https://helm.sh/docs/chart_template_guide/named_templates/#the-include-function
> - https://helm.sh/docs/howto/charts_tips_and_tricks/#using-the-include-function

<br>

### range

#### ▼ rangeとは

同じ階層にある他の```.yaml```ファイルのキーとその値を格納し、foreachのように出力する。ただし、```values```ファイルからキーと値の両方を出力する場合は、```range```関数を使用するとロジックが増えて可読性が低くなるため、使用しない方が良い。

> ℹ️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/

```yaml
# values.yamlファイル
general:
  env: prd
  appName: foo
```

```yaml
apiVersion: apps/v1
kind: Deployment
# キーと値の両方を取得すると、ロジックが増えて可読性が低くなる。
{{- range $general := .Values.general }}
metadata:
  name: {{ $general.env }}-{{ $general.appName }}-pod
  labels:
    app.kubernetes.io/app: {{ $general.appName }}
    
    ...
    
{{- end }}
```

一方で、値のみを出力する場合は、可読性が高くなる。

> ℹ️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/

```yaml
# values.yamlファイル
ipAddresses:
  - 192.168.1.1/32
  - 192.168.1.2/32
  - 192.168.1.3/32
```

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: blocked-ip-iddresses-config-map
data:
  ip-addresses: |-
    {{- range $.Values.ipAddresses }}
      - {{ . }}
    {{- end }} 
```

<br>

### required

> ℹ️ 参考：https://helm.sh/docs/howto/charts_tips_and_tricks/#using-the-required-function

<br>

### template

```define```関数で定義した文字列をそのまま出力する。```template```関数では出力内容を変数に格納できないため、これが可能な```include```関数が推奨されている。

> ℹ️ 参考：
> 
> - https://helm.sh/docs/chart_template_guide/named_templates/#the-include-function
> - https://itnext.io/use-named-templates-like-functions-in-helm-charts-641fbcec38da

<br>

### Values

#### ▼ Valuesとは

チャートのルートパスにある```values.yaml```ファイル、または```helm```コマンドで指定した任意の```values```ファイルの値を出力する。特定の条件下で、```values```ファイルを２階層以上に設定できなくなる現象の理由がわかっていない...。

> ℹ️ 参考：https://github.com/helm/helm/issues/8026

```yaml
# values.yamlファイル
general:
  env: prd
  appName: foo
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.general.env }}-{{ .Values.general.appName }}-pod
  labels:
    app.kubernetes.io/app: {{ .Values.general.appName }}
```

#### ▼ metadataキーで使用する場合の注意点

マニフェストの```metadata```キーの値には文字列しか設定できない。```values```ファイルから出力した値が数字の場合、Helmは勝手にint型に変換しようとする。そのため、metadataキーの値にint型を出力しようとしてエラーになる。int型にならないように、```values```ファイルの出力先をダブルクオーテーションで囲うと良い。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/#required-fields

```yaml
# values.yamlファイル
metadata:
  labels:
    # マニフェストで、int型で出力しようとする。
    id: "1"
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo
  labels:
    # int型にならないように、ダブルクオーテーションで囲う。
    id: "{{ .Values.metadata.labels.id }}"
```

<br>

### 展開形式

#### ▼ ドット

何も加工せずに、内容を出力する。

```yaml
{* tplファイル *}

{{- define "foo-template" }}

- foo: FOO
  bar: BAR

{{- end }}
```

```yaml
baz:
{{- include "foo-template" . }}
```

```yaml
# 結果
baz:
- foo: FOO
  bar: BAR
```

#### ▼ nindent

改行せずにそのままスペースを挿入した上で、内容を出力する。

> ℹ️ 参考：https://www.skyarch.net/blog/?p=16660#28

```yaml
{* tplファイル *}

{{- define "foo-template" }}

- foo: FOO
  bar: BAR

{{- end }}
```

```yaml
# 2つ分のスペースを挿入した上で、出力する。
baz:
{{- include "foo-template" . | nindent 2 }}
```

```yaml
# 結果
baz:
  - foo: FOO
    bar: BAR
```

#### ▼ nindent

改行しつつ、スペースを挿入した上で、内容を出力する。

> ℹ️ 参考：https://www.skyarch.net/blog/?p=16660#29

```yaml
{* tplファイル *}

{{- define "foo-template" }}

- foo: FOO
  bar: BAR

{{- end }}
```

```yaml
# 改行しつつ、2つ分のスペースを挿入した上で、出力する。
baz:
{{- include "foo-template" . | nindent 2 }}
```

```yaml
# 結果
baz:
# ここで改行が入る
  - foo: FOO
    bar: BAR
```


<br>

## 07. 変換

### b64enc

#### ▼ b64encとは

```base64```方式でエンコードし、出力する。Secretの```data```キーでは、他のKubernetesリソースへの出力時に自動的に```base64```方式でデコードするようになっており、相性が良い。

```yaml
# values.yamlファイル
username: root
password: 12345
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
data:
  username: {{ .Values.username | b64enc }}
  password: {{ .Values.password | b64enc }}
```

<br>
