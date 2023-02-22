---
title: 【IT技術の知見】チャート＠Helm
description: チャート＠Helmの知見を記録しています。
---

# チャート＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ aptリポジトリから

> ↪️ 参考：https://helm.sh/docs/intro/install/#from-apt-debianubuntu

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

> ↪️ 参考：https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### .apiVersion

#### ▼ apiVersionとは

> ↪️ 参考：https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### entries

#### ▼ entriesとは

> ↪️ 参考：https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### generated

#### ▼ generatedとは

コマンドによって`index.yaml`ファイルが作成された日付を設定する。

```yaml
generated: "2022-01-01T12:00:00.197173+09:00"
```

<br>

## 03. Chart.`.yaml`ファイル

### .apiVersion

#### ▼ apiVersionとは

Helm-APIのバージョンを設定する。

`apiVersion`キーの`v1`はHelmの`v2`に対応しており、`v2`は`v3`に対応している。

```yaml
apiVersion: v2
```

> ↪️ 参考：
>
> - https://helm.sh/docs/topics/charts/#the-apiversion-field
> - https://helm.sh/docs/topics/v2_v3_migration/

<br>

### appVersion

#### ▼ appVersionとは

Kubernetes上で稼働するアプリケーションのリリースバージョンを設定する。

リリースバージョンは、GitHubのリリースタグで管理した方がよく、`appVersion`キーの値は特に変更しなくても良い。

公式チャートでは、チャート内で使用しているコンテナのイメージタグが`appVersion`キーに設定されている。

```yaml
appVersion: <バージョンタグ>
```

> ↪️ 参考：
>
> - https://helm.sh/docs/topics/charts/#the-appversion-field
> - https://github.com/argoproj/argo-helm/blob/main/charts/argo-cd/templates/_common.tpl#L38

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

設定されたチャートは、`charts`ディレクトリにダウンロードされる。

> ↪️ 参考：https://helm.sh/docs/topics/charts/#chart-dependencies

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

### kubeVersion

チャート内のマニフェストに、新しい`apiVersion`が存在する場合、これに対応できるkube-apiserverのバージョンを設定する。


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

> ↪️ 参考：https://helm.sh/docs/topics/charts/#the-chartyaml-file

```yaml
name: foo
```

<br>

### type

#### ▼ typeとは

チャートのタイプを設定する。

```yaml
type: application
```

> ↪️ 参考：https://helm.sh/docs/topics/charts/#chart-types

<br>

### version

#### ▼ versionとは

チャートアーカイブ (`.tgz`形式ファイル) のリリースバージョンを設定する。

`template`ディレクトリ配下のファイルを変更した場合に更新する。

```yaml
version: <バージョンタグ>
```

> ↪️ 参考：https://helm.sh/docs/topics/charts/#charts-and-versioning

<br>

## 04. `_helpers.tpl`ファイル

### `_helpers.tpl`ファイルとは

あらゆる場所から使用できるテンプレートを設定する。

汎用的なテンプレート (`.metadata.labels`キーなど) の出力で使用する。

> ↪️ 参考：https://helm.sh/docs/chart_template_guide/builtin_objects/

<br>

### `.metadata.labels`キーの出力

`_helpers.tpl`ファイルで`.metadata.labels`キーのセットをテンプレートとして定義しておく。

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
  labels: { { include "global.template.labels" . | indent 4 } } # まとめて出力する。
```

<br>

## 05. values.yaml

### 共通オプション

#### ▼ 共通オプションとは

多くの外部チャートで共通して用意されている`values`ファイルのデフォルトオプションである。

共通オプションは、外部チャート内の`_help.tpl`ファイルに出力される。

> ↪️ 参考：https://knowledge.sakura.ad.jp/23603/

#### ▼ affinity

チャート内のDeploymentの`.spec.template.spec.affinity`キーに値を設定する。

```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
        - matchExpressions:
            - key: node.kubernetes.io/nodegroup
              operator: In
              values:
                - app
```

#### ▼ crd.install

同じチャート内でカスタムリソース定義とカスタムリソースを含んでいる場合に、カスタムリソース定義の作成はスキップする。

この場合、カスタムリソース定義を`kubectl apply`コマンドで作成することになる。

カスタムリソース定義はCluster内に`1`個あれば十分であるが、Clusterに複数のHelmリリースをインストールする場合、`meta.helm.sh`キーでお互いがコンフリクトを起こしてしまう。

そのため、カスタムリソース定義のみHelmの管理外に置くという必要がある。

```yaml
crds:
  install: false
```

#### ▼ fullnameOverride

デフォルトでは、チャートのインストールによって作成されるKubernetesリソース名は、『`＜リリース名＞-＜Chart名＞`』になる。

```yaml
fullnameOverride: foo
```

もし、`fullnameOverride`オプションを設定していた場合、Kubernetesリソースの名前は『`＜fullnameOverrideオプションの値＞`』になる。

補足としてチャートごとに、Kubernetesリソース名の前後に特定の文字列 (例：コンポーネント名、番号、インスタンスハッシュ値) がつくことがある。

`nameOverride`オプションとは独立している。

そのため、`nameOverride`オプションでチャートをインストールした後に`fullnameOverride`オプションに移行したい場合、`nameOverride`オプションによるチャートを一度アンインストールする必要がある。

しかし、そのまま`fullnameOverride`オプションに移行してしまうと、`nameOverride`オプション時のKubernetesリソースが残骸として残ってしまう可能性がある。

#### ▼ image.pullPolicy

チャート内のDeploymentの`.spec.template.spec.containers[].imagePullPolicy`キーに値を設定する。

```yaml
image:
  pullPolicy: IfNotPresent
```

#### ▼ image.repository

チャート内のDeploymentの`.spec.template.spec.containers[].image`キーのリポジトリ名部分に値を設定する。

```yaml
image:
  repository: foo-repository
```

#### ▼ image.tag

チャート内のDeploymentの`.spec.template.spec.containers[].image`キーのタグ値部分に値を設定する。

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
  annotations: true
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

デフォルトでは、チャートによって作成されるKubernetesリソース名は、『`＜リリース名＞-＜Chart名＞`』になる。

もし、`nameOverride`オプションを設定していた場合、Kubernetesリソース名は『`＜リリース名＞-＜nameOverrideオプションの値＞`』になる。

補足としてチャートごとに、Kubernetesリソース名の前後に特定の文字列 (例：コンポーネント名、番号、インスタンスハッシュ値) がつくことがある。

`fullnameOverride`オプションとは独立しており、`fullnameOverride`オプションでチャートをインストールした後に`nameOverride`オプションに移行したい場合、`fullnameOverride`オプションによるチャートを一度アンインストールする必要がある。

しかし、そのまま`nameOverride`オプションに移行してしまうと、`fullnameOverride`オプション時のKubernetesリソースが残骸として残ってしまう可能性がある。

#### ▼ nodeSelector

チャート内のDeploymentの`.spec.template.spec.nodeSelector`キーに値を設定する。

```yaml
nodeSelector:
  node.kubernetes.io/nodegroup: foo-node-group
```

#### ▼ podSecurityContext

チャート内のDeploymentの`.spec.template.spec.securityContext`キーに値を設定する。

```yaml
securityContext:
  allowPrivilegeEscalation: false
```

#### ▼ replicaCount

チャート内のDeploymentの`.spec.replicas`キーに値を設定する。

```yaml
replicaCount: 3
```

#### ▼ resources

チャート内のDeploymentの`.spec.template.spec.containers[].resources`オプションに値を設定する。

```yaml
resources:
  cpu: 50m
  memory: 400Mi
```

#### ▼ securityContext

チャート内のDeploymentの`.spec.template.spec.containers[].securityContext`オプションに値を設定する。

```yaml
securityContext:
  runAsUser: 1000
  fsGroup: 2000
```

#### ▼ serviceAccount.create

ServiceAccountの作成を有効化する。

```yaml
serviceAccount:
  create: true
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
  - key: "app"
    operator: "Exists"
    effect: "NoSchedule"
```

<br>
