---
title: 【IT技術の知見】チャート＠Helm
description: チャート＠Helmの知見を記録しています。
---

# チャート＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ aptリポジトリから

> - https://helm.sh/docs/intro/install/#from-apt-debianubuntu

```bash
$ curl https://helm.baltorepo.com/organization/signing.asc | sudo apt-key add -
$ sudo apt-get install apt-transport-https --yes
$ echo "deb https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
$ sudo apt-get update
$ sudo apt-get install helm
```

<br>

## 02. `index.yaml`ファイル

### `index.yaml`ファイルとは

チャートリポジトリ内の各チャートアーカイブ (`.tgz`形式ファイル) のメタデータを設定する。

`helm repo index`コマンドによって、`Chart.yaml`ファイルに基づいて自動作成されるため、ユーザーが設定する項目は少ない。

> - https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### apiVersion

#### ▼ apiVersionとは

> - https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### entries

#### ▼ entriesとは

> - https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### generated

#### ▼ generatedとは

コマンドによって`index.yaml`ファイルが作成された日付を設定する。

```yaml
generated: "2022-01-01T12:00:00.197173+09:00"
```

<br>

## 03. `Chart.yaml`ファイル

### apiVersion

#### ▼ apiVersionとは

Helmのバージョンを設定する。

`.apiVersion`キーの`v1`はHelmの`v2`に対応しており、`v2`は`v3`に対応している。

```yaml
apiVersion: v2
```

> - https://helm.sh/docs/topics/charts/#the-apiversion-field
> - https://helm.sh/docs/topics/v2_v3_migration/

<br>

### appVersion

#### ▼ appVersionとは

Kubernetes上で稼働するアプリケーションのHelmリリースバージョンを設定する。

Helmリリースバージョンは、GitHubのHelmリリースタグで管理した方がよく、`appVersion`キーの値は特に変更しなくても良い。

公式チャートでは、チャート内で使用しているコンテナのイメージタグが`appVersion`キーに設定されている。

```yaml
appVersion: <バージョンタグ>
```

> - https://helm.sh/docs/topics/charts/#the-appversion-field
> - https://github.com/argoproj/argo-helm/blob/argo-cd-5.43.0/charts/argo-cd/templates/_common.tpl#L38

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

依存対象のサブチャートを設定する。

設定されたサブチャートは、`charts`ディレクトリにダウンロードされる。

> - https://helm.sh/docs/topics/charts/#chart-dependencies

```yaml
dependencies:
  - name: foo
    version: 1.0.0
    repository: https://foo.com/foo-chart
  - name: bar
    version: 1.0.0
    repository: https://bar.com/bar-chart
```

#### ▼ サブチャート

サブチャートは、`.<チャート名>.enabled`キーと`dependencies[]condition`キーで制御するとよい。

サブチャートには、`values`ファイルで変数を渡せる。

```yaml
# 親チャートのvaluesファイル
foo:
  enabled: "true"
  # fooサブチャートのvaluesファイルにある.replicasキーに値を渡す。
  replicas: 2

bar:
  enabled: "true"
  # barサブチャートのvaluesファイルにある.replicasキーに値を渡す。
  replicas: 2
```

```yaml
dependencies:
  - name: foo
    version: 1.0.0
    repository: https://foo.com/foo-chart
    # valuesファイルで foo.enabled を true にした場合
    condition: foo.enabled
  - name: bar
    version: 1.0.0
    repository: https://bar.com/bar-chart
    # valuesファイルで bar.enabled を true にした場合
    condition: bar.enabled
```

> - https://helm.sh/docs/chart_template_guide/subcharts_and_globals/#overriding-values-from-a-parent-chart

<br>

### kubeVersion

チャート内のマニフェストが最低限対応可能なkube-apiserverのバージョンを設定する。

```yaml
kubeVersion: ">=1.22.0-0"
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

> - https://helm.sh/docs/topics/charts/#the-chartyaml-file

```yaml
name: foo
```

<br>

### type

#### ▼ typeとは

チャートのタイプを設定する。

#### ▼ application

Kubernetesリソースを含むチャートであることを表す。

```yaml
type: application
```

> - https://helm.sh/docs/topics/charts/#chart-types

#### ▼ library

Kubernetesリソースを含まず、関数のみを含むチャートであることを表す。

```yaml
type: library
```

> - https://helm.sh/docs/topics/charts/#chart-types

<br>

### version

#### ▼ versionとは

チャートアーカイブ (`.tgz`形式ファイル) のHelmリリースバージョンを設定する。

`template`ディレクトリ配下のファイルを変更した場合に更新する。

```yaml
version: <バージョンタグ>
```

> - https://helm.sh/docs/topics/charts/#charts-and-versioning

<br>

## 04. `_helpers.tpl`ファイル

### `_helpers.tpl`ファイルとは

あらゆる場所から使用できるテンプレートを設定する。

汎用的なテンプレート (`.metadata.labels`キーなど) の出力で使用する。

> - https://helm.sh/docs/chart_template_guide/builtin_objects/

<br>

### `.metadata.labels`キーの出力

`_helpers.tpl`ファイルで`.metadata.labels`キーのセットをテンプレートとして定義しておく。

マニフェストで、これらをまとめて出力する。

```yaml
{{- define "global.template.labels" }}
# Helmリリース名
app.kubernetes.io/instance: {{ .Release.Name }}
# ツール名 (v2ならTiller、v3ならHelm)
app.kubernetes.io/managed-by: {{ .Release.Service }}
# チャートバージョン
app.kubernetes.io/version: {{ .Chart.AppVersion }}
# チャート名
helm.sh/chart: {{ .Chart.Name }}
{{- end }}
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels: {{include "global.template.labels" . | indent 4}} # まとめて出力する。
```

> - https://codersociety.com/blog/articles/helm-best-practices#3-use-labels-to-find-resources-easily

<br>

## 05. values.yaml

### 共通オプション

#### ▼ 共通オプションとは

多くの外部チャートで共通して用意されている`values`ファイルのデフォルトオプションである。

共通オプションは、外部チャート内の`_help.tpl`ファイルに出力される。

> - https://knowledge.sakura.ad.jp/23603/

#### ▼ affinity

チャート内のDeploymentの`.spec.template.spec.affinity`キーに値を設定する。

```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
        - matchExpressions:
            - key: node.kubernetes.io/nodetype
              operator: In
              values:
                - app
```

#### ▼ crd.install

同じチャート内でCRDとカスタムリソースを含んでいる場合に、CRDの作成はスキップする。

この場合、CRDを`kubectl apply`コマンドで作成することになる。

CRDはCluster内に`1`個あれば十分であるが、Clusterに複数のHelmリリースをインストールする場合、`meta.helm.sh`キーでお互いがコンフリクトを起こしてしまう。

そのため、CRDのみHelmの管理外に置くという必要がある。

```yaml
crds:
  install: "false"
```

#### ▼ fullnameOverride

デフォルトでは、チャートのインストールによって作成されるKubernetesリソース名は、『`＜Helmリリース名＞-＜Chart名＞`』になる。

```yaml
fullnameOverride: foo
```

もし、`fullnameOverride`オプションを設定していた場合、Kubernetesリソース名は『`＜fullnameOverrideオプションの値＞`』になる。

補足としてチャートごとに、Kubernetesリソース名の前後に特定の文字列 (例：コンポーネント名、番号、インスタンスハッシュ値) がつくことがある。

`nameOverride`オプションとは独立している。

そのため、`nameOverride`オプションでチャートをインストールした後に`fullnameOverride`オプションに移行したい場合、`nameOverride`オプションによるチャートを一度アンインストールする必要がある。

しかし、そのまま`fullnameOverride`オプションに移行してしまうと、`nameOverride`オプション時のKubernetesリソースが残骸として残ってしまう可能性がある。

#### ▼ image.pullPolicy

チャート内のDeploymentの`.spec.template.spec.containers[*].imagePullPolicy`キーに値を設定する。

```yaml
image:
  pullPolicy: IfNotPresent
```

#### ▼ image.repository

チャート内のDeploymentの`.spec.template.spec.containers[*].image`キーのリポジトリ名部分に値を設定する。

```yaml
image:
  repository: foo-repository
```

#### ▼ image.tag

チャート内のDeploymentの`.spec.template.spec.containers[*].image`キーのタグ値部分に値を設定する。

```yaml
image:
  tag: v1.0.0
```

チャートのバージョンとコンテナイメージのバージョンには対応関係があり、基本的にはチャートの`values`ファイルで定義されているデフォルトの`image.tag`キー値を使用した方が良い。

ただ、コンテナイメージを自前のイメージリポジトリで管理している場合は、デフォルトの`image.tag`キー値を参照してバージョンを確認し、揃えるようにする。

#### ▼ imagePullSecrets

チャート内のDeploymentの`.spec.template.spec.imagePullSecrets`キーに値を設定する。

```yaml
imagePullSecrets: foo-repository-credentials-secret
```

#### ▼ ingress.annotations

チャート内のIngressの`.metadata.annotations`オプションに値を設定する。

```yaml
ingress:
  annotations: kubernetes.io/ingress.class: foo-ingress-class
```

#### ▼ ingress.enabled

```yaml
ingress:
  annotations: "true"
```

Ingressの作成を有効化する。

#### ▼ ingress.hosts

チャート内のIngressの`.spec.rules`キーに値を設定する。

```yaml
ingress:
  hosts:
    - example.com
```

#### ▼ ingress.tls

チャート内のIngressの`.spec.tls`キーに値を設定する。

```yaml
ingress:
  tls:
    - hosts:
        - example.com
      secretName: foo-certificate-secret
```

#### ▼ nameOverride

```yaml
nameOverride: foo
```

デフォルトでは、チャートによって作成されるKubernetesリソース名は、『`＜Helmリリース名＞-＜Chart名＞`』になる。

もし、`nameOverride`オプションを設定していた場合、Kubernetesリソース名は『`＜Helmリリース名＞-＜nameOverrideオプションの値＞`』になる。

補足としてチャートごとに、Kubernetesリソース名の前後に特定の文字列 (例：コンポーネント名、番号、インスタンスハッシュ値) がつくことがある。

`fullnameOverride`オプションとは独立しており、`fullnameOverride`オプションでチャートをインストールした後に`nameOverride`オプションに移行したい場合、`fullnameOverride`オプションによるチャートを一度アンインストールする必要がある。

しかし、そのまま`nameOverride`オプションに移行してしまうと、`fullnameOverride`オプション時のKubernetesリソースが残骸として残ってしまう可能性がある。

#### ▼ nodeSelector

チャート内のDeploymentの`.spec.template.spec.nodeSelector`キーに値を設定する。

```yaml
nodeSelector:
  node.kubernetes.io/nodetype: foo
```

#### ▼ podSecurityContext

チャート内のDeploymentの`.spec.template.spec.securityContext`キーに値を設定する。

```yaml
securityContext:
  allowPrivilegeEscalation: "false"
```

#### ▼ replicaCount

チャート内のDeploymentの`.spec.replicas`キーに値を設定する。

```yaml
replicaCount: 3
```

#### ▼ resources

チャート内のDeploymentの`.spec.template.spec.containers[*].resources`オプションに値を設定する。

```yaml
resources:
  cpu: 50m
  memory: 400Mi
```

#### ▼ securityContext

チャート内のDeploymentの`.spec.template.spec.containers[*].securityContext`オプションに値を設定する。

```yaml
securityContext:
  runAsUser: 1000
  fsGroup: 2000
```

#### ▼ serviceAccount.create

ServiceAccountの作成を有効化する。

```yaml
serviceAccount:
  create: "true"
```

#### ▼ serviceAccount.annotations

チャート内のServiceAccountの`.metadata.annotations`オプションに値を設定する。

```yaml
serviceAccount:
  annotations:
    eks.amazonaws.com/role-arn: <IAMロールのARN>
```

#### ▼ service.type

チャート内のServiceの`.spec.type`キーに値を設定する。

```yaml
service:
  type: ClusterIP
```

#### ▼ service.port

チャート内のServiceの`.spec.ports.port`キーに値を設定する。

```yaml
service:
  port: 80
```

#### ▼ tolerations

チャート内のDeploymentの`.spec.template.spec.tolerations`キーに値を設定する。

```yaml
tolerations:
  - key: app
    operator: Exists
    effect: NoSchedule
```

<br>

### スキーマ (`values.schema.json`ファイル)

`values.yaml`ファイルの各設定値で要求するデータ型を設定する。

```yaml
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "properties":
    {
      "image":
        {
          "description": "Container Image",
          "properties": {"repo": {"type": "string"}, "tag": {"type": "string"}},
          "type": "object",
        },
      "name": {"description": "Service name", "type": "string"},
      "port": {"description": "Port", "minimum": 0, "type": "integer"},
      "protocol": {"type": "string"},
    },
  "required": ["protocol", "port"],
  "title": "Values",
  "type": "object",
}
```

> - https://helm.sh/docs/topics/charts/#schema-files

<br>
