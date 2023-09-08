---
title: 【IT技術の知見】 pluto＠バージョンテスト
description: pluto＠バージョンテストの知見を記録しています。
---

# pluto＠バージョンテスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. plutoの仕組み

### 検出項目

指定したKubernetesのバージョンに基づいて、マニフェストのバージョン (apiVersion) を検証する。

<br>

### 対応するKubernetesリソース

標準のKubernetesリソースだけでなく、CRDや一部のカスタムリソース (Istioも含む) も対応している。

ただ、全てのカスタムリソースに対応しているわけではない。

```yaml
deprecated-versions:

  # Deployment
  - version: extensions/v1beta1
    kind: Deployment
    deprecated-in: v1.9.0
    removed-in: v1.16.0
    replacement-api: apps/v1
    replacement-available-in: v1.9.0
    component: k8s

  ...

  # CRD
  - version: apiextensions.k8s.io/v1beta1
    kind: CustomResourceDefinition
    deprecated-in: v1.16.0
    removed-in: v1.22.0
    replacement-api: apiextensions.k8s.io/v1
    replacement-available-in: v1.16.0
    component: k8s

  ...

  # Istioのカスタムリソース
  - version: rbac.istio.io
    kind: AuthorizationPolicies
    deprecated-in: v1.4.0
    removed-in: v1.4.0
    replacement-api: security.istio.io/v1beta1
    component: istio

  ...

```

> - https://github.com/FairwindsOps/pluto/blob/master/versions.yaml
> - https://pluto.docs.fairwinds.com/advanced/#adding-custom-version-checks
> - https://github.com/FairwindsOps/pluto/blob/master/docs/contributing/guide.md#versions-updates

<br>

## 02. セットアップ

### インストール

#### ▼ バイナリとして

```bash
$ brew install pluto
```

> - https://pluto.docs.fairwinds.com/installation/

<br>

## 03. グローバルオプション

### 標準入力

標準入力からマニフェストを渡す。

```bash
$ helm template foo-chart -f foo-values.yaml \
    | pluto detect -t k8s=<Kubernetesのバージョン> - -o wide

NAME     NAMESPACE       KIND                      VERSION               REPLACEMENT      DEPRECATED   DEPRECATED IN   REMOVED   REMOVED IN
foo-cj   foo-namespace   CronJob                   batch/v1beta1         batch/v1         true         v1.21.0         false     v1.25.0
```

```bash
$ helm template foo-chart -f foo-values.yaml \
    | pluto detect-helm -t k8s=<Kubernetesのバージョン> - -o wide

NAME    NAMESPACE       KIND                      VERSION               REPLACEMENT      DEPRECATED   DEPRECATED IN   REMOVED   REMOVED IN
foo-cj  foo-namespace   CronJob                   batch/v1beta1         batch/v1         true         v1.21.0         false     v1.25.0
```

CI上でこれを実行する場合、リポジトリ内のマニフェストを渡しさえすれば良く、特にGitOpsでCI/CDを分離している場合は、必ずしもkube-apiserverと通信する必要はない。

```bash
$ helm template foo-chart . --set secret.GCP_CREDENTIALS=test -f foo-values.yaml \
    | pluto detect -t k8s=<Kubernetesのバージョン> - -o wide

NAME    NAMESPACE       KIND                      VERSION               REPLACEMENT      DEPRECATED   DEPRECATED IN   REMOVED   REMOVED IN
foo-cj  foo-namespace   CronJob                   batch/v1beta1         batch/v1         true         v1.21.0         false     v1.25.0
```

<br>

### -f (--additional-versions)

#### ▼ -fとは

plutoが検証可能なAPIグループを追加する。

plutoはデフォルトで全てのKubernetesリソースを検証できるが、一方でカスタムリソースは一部にしか検証していない。

```bash
$ pluto list-versions -f additional-versions.yaml
```

> - https://pluto.docs.fairwinds.com/advanced/#adding-custom-version-checks
> - https://github.com/FairwindsOps/pluto/blob/master/versions.yaml

#### ▼ `additional-versions.yaml`ファイル

追加で検証するAPIグループのルールを設定する。

```yaml
# version: APIグループ名
# kind: カスタムリソース名
# deprecated-in: APIグループが非推奨になるKubernetesバージョン
# removed-in: APIグループが機能廃止になるKubernetesバージョン
# replacement-api: APIグループ名を変更する必要がある場合に、変更後のAPIグループ名
# replacement-available-in: APIグループ名を変更する必要がある場合に、変更できるようになるKubernetesバージョン
# component: APIグループを使用しているツール名

deprecated-versions:
  - version: networking.istio.io/v1beta1
    kind: DestinationRule
    deprecated-in: ""
    removed-in: ""
    replacement-api: ""
    replacement-available-in: ""
    component: istio
  - version: networking.istio.io/v1alpha3
    kind: Gateway
    deprecated-in: ""
    removed-in: ""
    replacement-api: ""
    replacement-available-in: ""
    component: istio
  - version: networking.istio.io/v1beta1
    kind: VirtualService
    deprecated-in: ""
    removed-in: ""
    replacement-api: ""
    replacement-available-in: ""
    component: istio
```

このファイルを`-f`オプションで渡すと、追加したAPIグループのルールを検証できるようになる。

```bash
$ pluto list-versions -f additional-versions.yaml

...

DestinationRule                  networking.istio.io/v1beta1            n/a             n/a          n/a                                    n/a             istio
Gateway                          networking.istio.io/v1alpha3           n/a             n/a          n/a                                    n/a             istio
VirtualService                   networking.istio.io/v1beta1            n/a             n/a          n/a                                    n/a             istio
```

<br>

### -t

plutoで検証する非推奨項目のKubernetesバージョンを指定する。

マイナーバージョン (例：`1.24.0`) まで指定する必要がある。

```bash
$ pluto detect - -o wide -t k8s=<Kubernetesのバージョン>
```

現在と次のKubernetesバージョンを指定した処理を自動化で実行すれば、アップグレードに備えられる。

継続的に検出できるように、CI上で自動化すると良い。

```bash
$ pluto detect - -o wide -t k8s=<Kubernetesの現在のバージョン>

$ pluto detect - -o wide -t k8s=<Kubernetesの次のバージョン>
```

<br>

### -o

出力形式を指定する。

```bash
$ pluto detect - -o wide
```

> - https://pluto.docs.fairwinds.com/advanced/#display-options

```bash
$ pluto detect - -o markdown
```

> - https://pluto.docs.fairwinds.com/advanced/#display-options

<br>

## 03. サブコマンド

### detect

kube-apiserverからの返信、または標準入力で入力されたマニフェストから、リソース名単位で非推奨のapiVersionを検出する。

`pluto detect-api-resources`コマンドとの違いは記入中...

```bash
$ pluto detect - -o wide

NAME     NAMESPACE       KIND                      VERSION               REPLACEMENT      DEPRECATED   DEPRECATED IN   REMOVED   REMOVED IN
foo-cj   foo-namespace   CronJob                   batch/v1beta1         batch/v1         true         v1.21.0         false     v1.25.0
bar-pdb  bar-namespace   PodDisruptionBudget       policy/v1beta1        policy/v1        true         v1.21.0         false     v1.25.0
baz-hpa  baz-namespace   HorizontalPodAutoscaler   autoscaling/v2beta1   autoscaling/v2   true         v1.22.0         false     v1.25.0
...
```

> - https://kakakakakku.hatenablog.com/entry/2022/07/20/091424

<br>

### detect-api-resources

kube-apiserverからの返信、または標準入力で入力されたマニフェストから、リソース名単位で非推奨のapiVersionを検出する。

`pluto detect`コマンドとの違いは記入中...

```bash
$ pluto detect-api-resources - -o wide

NAME     NAMESPACE       KIND                      VERSION               REPLACEMENT      DEPRECATED   DEPRECATED IN   REMOVED   REMOVED IN
foo-cj   foo-namespace   CronJob                   batch/v1beta1         batch/v1         true         v1.21.0         false     v1.25.0
bar-pdb  bar-namespace   PodDisruptionBudget       policy/v1beta1        policy/v1        true         v1.21.0         false     v1.25.0
baz-hpa  baz-namespace   HorizontalPodAutoscaler   autoscaling/v2beta1   autoscaling/v2   true         v1.22.0         false     v1.25.0
...
```

> - https://pluto.docs.fairwinds.com/quickstart/#api-resources-in-cluster

<br>

### detect-files

ディレクトリ内のファイルを再帰的に検証し、リソース名単位で非推奨のapiVersionを検出する。

```bash
$ pluto detect-files - -o wide
```

> - https://pluto.docs.fairwinds.com/quickstart/#file-detection-in-a-directory
> - https://qiita.com/wadason/items/c9d5f6a475bf7764fc9d#%E6%A4%9C%E8%A8%BC

<br>

### detect-helm

kube-apiserverからの返信、または標準入力で入力されたマニフェストから、チャート単位で非推奨のapiVersionを検出する。

```bash
$ pluto detect-helm - -o wide

NAME       NAMESPACE       KIND                      VERSION               REPLACEMENT      DEPRECATED   DEPRECATED IN   REMOVED   REMOVED IN
foo-chart  foo-namespace   CronJob                   batch/v1beta1         batch/v1         true         v1.21.0         false     v1.25.0
bar-chart  bar-namespace   PodDisruptionBudget       policy/v1beta1        policy/v1        true         v1.21.0         false     v1.25.0
baz-chart  baz-namespace   HorizontalPodAutoscaler   autoscaling/v2beta1   autoscaling/v2   true         v1.22.0         false     v1.25.0
...
```

> - https://pluto.docs.fairwinds.com/quickstart/#file-detection-in-a-directory

<br>

### list-versions

plutoで検証できるAPIグループの一覧を取得する。

```bash
$ pluto list-versions

KIND                             NAME                                   DEPRECATED IN   REMOVED IN   REPLACEMENT                            COMPONENT
Deployment                       extensions/v1beta1                     v1.9.0          v1.16.0      apps/v1                                k8s
Deployment                       apps/v1beta2                           v1.9.0          v1.16.0      apps/v1                                k8s
Deployment                       apps/v1beta1                           v1.9.0          v1.16.0      apps/v1                                k8s
StatefulSet                      apps/v1beta1                           v1.9.0          v1.16.0      apps/v1                                k8s
StatefulSet                      apps/v1beta2                           v1.9.0          v1.16.0      apps/v1                                k8s
NetworkPolicy                    extensions/v1beta1                     v1.9.0          v1.16.0      networking.k8s.io/v1                   k8s
Ingress                          extensions/v1beta1                     v1.14.0         v1.22.0      networking.k8s.io/v1                   k8s
Ingress                          networking.k8s.io/v1beta1              v1.19.0         v1.22.0      networking.k8s.io/v1                   k8s
IngressClass                     networking.k8s.io/v1beta1              v1.19.0         v1.22.0      networking.k8s.io/v1                   k8s
DaemonSet                        apps/v1beta2                           v1.9.0          v1.16.0      apps/v1                                k8s
DaemonSet                        extensions/v1beta1                     v1.9.0          v1.16.0      apps/v1                                k8s
PodSecurityPolicy                extensions/v1beta1                     v1.10.0         v1.16.0      policy/v1beta1                         k8s
PodSecurityPolicy                policy/v1beta1                         v1.21.0         v1.25.0      n/a                                    k8s
...
```

<br>
