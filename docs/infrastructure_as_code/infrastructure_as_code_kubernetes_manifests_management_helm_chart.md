---
title: 【IT技術の知見】チャート＠Helm
description: チャート＠Helmの知見を記録しています。
---

# チャート＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. セットアップ

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

## 02. index.```.yaml```ファイル

### index.```.yaml```ファイルとは

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

## 03. Chart.```.yaml```ファイル

### apiVersion

#### ▼ apiVersionとは

Helm-APIのバージョンを設定する。

```apiVersion```キーの```v1```はHelmの```v2```に対応しており、```v2```は```v3```に対応している。



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

Kubernetes上で稼働するアプリケーションのリリースバージョンを設定する。

リリースバージョンは、GitHubのリリースタグで管理した方がよく、```appVersion```キーの値は特に変更しなくても良い。



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

依存対象のチャートを設定する。

設定されたチャートは、```charts```ディレクトリにダウンロードされる。



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


## 04. ```_helpers.tpl```ファイル

### ```_helpers.tpl```ファイルとは

あらゆる場所から使用できるテンプレートを設定する。汎用的なテンプレート（```metadata.labels```キーなど）の出力で使用する。

> ℹ️ 参考：https://helm.sh/docs/chart_template_guide/builtin_objects/

<br>

### ```metadata.labels```キーの出力

```_helpers.tpl```ファイルで```metadata.labels```キーのセットをテンプレートとして定義しておく。

マニフェストで、これらをまとめて出力する。



```yaml
{{- define "global.template.labels" }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
helm.sh/chart: {{ .Chart.Name }}
{{- end }}
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    {{ include "global.template.labels" . | indent 4 }} # まとめて出力する。

...
```

<br>


## 05. values.yaml

### 共通オプション

#### ▼ 共通オプションとは

多くの外部チャートで共通して用意されている```values```ファイルのデフォルトオプションである。

共通オプションは、外部チャート内の```_help.tpl```ファイルに出力される。



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
