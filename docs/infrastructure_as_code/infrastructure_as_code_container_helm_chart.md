---
title: 【IT技術の知見】チャート＠Helm
description: チャート＠Helmの知見を記録しています。
---

# チャート＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Helmの仕組み

### アーキテクチャ

![helm_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/helm_architecture.png)

Helmは、パッケージマネージャーとしてのHelmクライアント、パッケージとしてのチャートアーカイブ（```.tgz```形式）、チャートアーカイブの元になるチャート、チャートアーカイブのレジストリとしてのチャートレジストリ、チャートレジストリ内にある複数のチャートリポジトリ、から構成される。Helmクライアントは、リポジトリからインストールしたチャートアーカイブに基づいて、現在のコンテキストで指定されているClusterのkube-apiserverをコールする。これにより、Kubernetes上にKubernetesリソースがapplyされる。

参考：

- https://cloudacademy.com/course/introduction-to-helm-1034/helm-architecture/
- https://helm.sh/ja/docs/glossary/
- https://deeeet.com/writing/2018/01/10/kubernetes-yaml/

<br>

### チャートリポジトリ

#### ▼ 構成

ルートディレクトリ配下に、```index.yaml```ファイル、チャートアーカイブ、を配置する。

参考：

- https://helm.sh/docs/topics/chart_repository/#the-chart-repository-structure
- https://zenn.dev/mikutas/articles/2ab146fa1ea35b

```yaml
charts/
├── index.yaml
├── foo-0.1.2.tgz
├── bar-0.1.2.tgz
...
```

#### ▼ チャートレジストリ

チャートレジストリとして使用できるものの一覧を示す。チャートレジストリ内にリポジトリを配置する。

| レジストリ               | 補足                                                   |
|---------------------| ------------------------------------------------------ |
| ArtifactHub（Helm公式） | 参考：https://helm.sh/docs/topics/chart_repository/    |
| GitHub、GitHub Pages | 参考：https://zenn.dev/mikutas/articles/2ab146fa1ea35b |
| AWSリソース（ECR、S3）     |                                                        |
| GCPリソース             |                                                        |

#### ▼ チャートリポジトリURL

| リポジトリの種類  | 説明                                                       | 形式                                                         | 例                                      |
|-----------|----------------------------------------------------------| ------------------------------------------------------------ | --------------------------------------- |
| チャートリポジトリ | チャートのプッシュやプル時に、チャートレジストリ内のリポジトリを指定する場合は、HTTPSプロトコルを使用する。 | ```https://<チャートレジストリのドメイン名>/<チャートリポジトリ名>``` | ```https://example.com/foo-chart```     |
| OCIリポジトリ  | チャートのプッシュやプル時に、OCIレジストリ内のリポジトリを指定する場合は、OCIプロトコルを使用する。    | ```oci://<チャートレジストリ名>/<チャートリポジトリ名>```    | ```oci://foo-registry/foo-repository``` |

<br>

## 02. セットアップ

### インストール

#### ▼ aptリポジトリから

参考：https://helm.sh/docs/intro/install/#from-apt-debianubuntu

```bash
$ curl https://helm.baltorepo.com/organization/signing.asc | sudo apt-key add -
$ sudo apt-get install apt-transport-https --yes
$ echo "deb https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
$ sudo apt-get update
$ sudo apt-get install helm
```

<br>

## 03. Chart.yamlファイル

### apiVersion

#### ▼ apiVersionとは

Helm-APIのバージョンを設定する。```apiVersion```キーの```v1```はHelmの```v2```に対応しており、```v2```は```v3```に対応している。

参考：

- https://helm.sh/docs/topics/charts/#the-apiversion-field
- https://helm.sh/docs/topics/v2_v3_migration/

```yaml
apiVersion: v2
```

<br>

### appVersion

#### ▼ appVersionとは

Kubernetes上で稼働するアプリケーションのリリースバージョンを設定する。リリースバージョンは、GitHubのリリースタグで管理した方がよく、```appVersion```キーの値は特に変更しなくても良い。

参考：https://helm.sh/docs/topics/charts/#the-appversion-field

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

参考：https://helm.sh/docs/topics/charts/#chart-dependencies

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

参考：https://helm.sh/docs/topics/charts/#the-chartyaml-file

```yaml
name: foo
```

<br>

### type

#### ▼ typeとは

チャートのタイプを設定する。

参考：https://helm.sh/docs/topics/charts/#chart-types

```yaml
type: application
```

<br>

### version

#### ▼ versionとは

チャートアーカイブのリリースバージョンを設定する。```template```ディレクトリ配下のファイルを変更した場合に更新する。

参考：https://helm.sh/docs/topics/charts/#charts-and-versioning

```yaml
version: <バージョンタグ>
```

<br>

## 04. index.yamlファイル

### index.yamlファイルとは

チャートのメタデータを設定する。```helm repo index```コマンドによって、```Chart.yaml```ファイルに基づいて自動生成されるため、ユーザーが設定する項目は少ない。

参考：https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### apiVersion

#### ▼ apiVersionとは

参考：https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### entries

#### ▼ entriesとは

参考：https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### generated

#### ▼ generatedとは

コマンドによって```index.yaml```ファイルが生成された日付を設定する。

```yaml
generated: "2022-01-01T12:00:00.197173+09:00"
```

<br>

## 05. value.yaml

### 共通オプション

#### ▼ 共通オプションとは

多くの外部チャートで共通して用意されている```values```ファイルのデフォルトオプションである。共通オプションは、外部チャート内の```_help.tpl```ファイルに出力される。

参考：https://knowledge.sakura.ad.jp/23603/

#### ▼ affinity

チャート内のDeploymentの```spec.template.spec.affinity```オプションに値を設定する。

#### ▼ fullnameOverride

デフォルトでは、リリースによって作成されるKubernetesリソース名は、『```＜リリース名＞-＜Chart名＞```』になる。もし、```fullnameOverride```オプションを設定していた場合、Kubernetesリソースの名前は『```＜fullnameOverrideオプションの値＞```』になる。なおチャートごとに、Kubernetesリソース名の前後に特定の文字列（例：コンポーネント名、番号、インスタンスハッシュ値）がつくことがある。

#### ▼ image.pullPolicy

チャート内のDeploymentの```spec.template.spec.containers.imagePullPolicy```オプションに値を設定する。

#### ▼ imagePullSecrets

チャート内のDeploymentの```spec.template.spec.imagePullSecrets```オプションに値を設定する。

#### ▼ image.repository

チャート内のDeploymentの```spec.template.spec.containers.image```オプションに値を設定する。

#### ▼ image.tag

チャート内のオプションに値を設定する。

#### ▼ ingress.annotations

チャート内のIngressの```metadata.annotations```オプションに値を設定する。

#### ▼ ingress.enabled

Ingressの作成を有効化する。

#### ▼ ingress.hosts

チャート内のIngressの```spec.rules```オプションに値を設定する。

#### ▼ ingress.tls

チャート内のIngressの```spec.tls```オプションに値を設定する。

#### ▼ nameOverride

デフォルトでは、チャートによって作成されるKubernetesリソース名は、『```＜リリース名＞-＜Chart名＞```』になる。もし、```nameOverride```オプションを設定していた場合、Kubernetesリソース名は『```＜リリース名＞-＜nameOverrideオプションの値＞```』になる。なおチャートごとに、Kubernetesリソース名の前後に特定の文字列（例：コンポーネント名、番号、インスタンスハッシュ値）がつくことがある。

#### ▼ nodeSelector

チャート内のDeploymentの```spec.template.spec.nodeSelector```オプションに値を設定する。

#### ▼ podSecurityContext

チャート内のDeploymentの```spec.template.spec.securityContext```オプションに値を設定する。

#### ▼ replicaCount

チャート内のDeploymentの```spec.replicas```オプションに値を設定する。

#### ▼ resources

チャート内のDeploymentの```spec.template.spec.containers.resources```オプションに値を設定する。

#### ▼ securityContext

チャート内のDeploymentの```spec.template.spec.containers.securityContext```オプションに値を設定する。

#### ▼ serviceAccount.create

ServiceAccountの作成を有効化する。

#### ▼ serviceAccount.annotations

チャート内のServiceAccountの```metadata.annotations```オプションに値を設定する。

#### ▼ service.type

チャート内のServiceの```spec.type```オプションに値を設定する。

#### ▼ service.port

チャート内のServiceの```spec.ports.port```オプションに値を設定する。

#### ▼ tolerations

チャート内のDeploymentの```spec.template.spec.tolerations```オプションに値を設定する。

<br>

## 06. アクション

### アクションとは

テンプレートからマニフェストファイルを作成するために必要な機能を提供する。

参考：https://helm.sh/docs/chart_template_guide/control_structures/

<br>

### include

#### ▼ includeとは

define関数で定義した文字列を加工して出力する。加工内容はパラメータで設定できる。

参考：

- https://helm.sh/docs/chart_template_guide/named_templates/#the-include-function
- https://helm.sh/docs/howto/charts_tips_and_tricks/#using-the-include-function

<br>

### range

#### ▼ rangeとは

同じ階層にある他の```.yaml```ファイルのキーとその値を格納し、foreachのように出力する。ただし、```values```ファイルからキーと値の両方を出力する場合は、```range```関数を使用するとロジックが増えて可読性が低くなるため、使用しない方が良い。

参考：https://helm.sh/docs/chart_template_guide/control_structures/

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
    
    # 〜 中略 〜
    
{{- end }}
```

一方で、値のみを出力する場合は、可読性が高くなる。

参考：https://helm.sh/docs/chart_template_guide/control_structures/

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

参考：https://helm.sh/docs/howto/charts_tips_and_tricks/#using-the-required-function

<br>

### template

define関数で定義した文字列をそのまま出力する。template関数よりもinclude関数が推奨されている。

参考：https://helm.sh/docs/chart_template_guide/named_templates/#the-include-function

<br>

### Values

#### ▼ Valuesとは

チャートのルートパスにある```values.yaml```ファイル、またはhelmコマンドで指定した任意の```values```ファイルの値を出力する。特定の条件下で、```values```ファイルを２階層以上に設定できなくなる現象の理由がわかっていない...。

参考：https://github.com/helm/helm/issues/8026

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

マニフェストファイルの```metadata```キーの値には文字列しか設定できない。```values```ファイルから出力した値が数字の場合、Helmは勝手にint型に変換しようとする。そのため、metadataキーの値にint型を出力しようとしてエラーになる。int型にならないように、```values```ファイルの出力先をダブルクオーテーションで囲うとよい。

参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/#required-fields

```yaml
# values.yamlファイル
metadata:
  labels:
    # マニフェストファイルで、int型で出力しようとする。
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

### ドット

#### ▼ ドットとは

何も加工せずに出力する。

```yaml
{* tplファイル *}

{{- define "foo-template" }}

{* 出力内容 *}

{{- end }}
```

```yaml
# .yamlファイル
{{- include "foo-template" . }}
```

<br>

## 07. 変換

### b64enc

#### ▼ b64encとは

base64方式でエンコードし、出力する。Secretの```data```キーでは、他のKubernetesリソースへの出力時に自動的にデコードするようになっており、相性が良い。

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
