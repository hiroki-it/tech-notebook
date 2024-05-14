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

指定したKubernetesのバージョンに基づいて、Kubernetesリソースやカスタムリソースのマニフェストの非推奨なバージョン (apiVersion) を検証する。

pluto以外では、ドキュメント、リリースノート、メトリクス (`apiserver_requested_deprecated_apis`) 、監査ログ、で非推奨なAPIを確認できる。

> - https://kubernetes.io/docs/reference/using-api/deprecation-guide/
> - https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.28.md#no-really-you-must-read-this-before-you-upgrade
> - https://kubernetes.io/blog/2020/09/03/warnings/#metrics
> - https://kubernetes.io/blog/2020/09/03/warnings/#audit-annotations

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
$ helm template . -f foo-values.yaml \
    | pluto detect -o wide -t k8s=<Kubernetesのバージョン> -

NAME     NAMESPACE       KIND                      VERSION               REPLACEMENT      DEPRECATED   DEPRECATED IN   REMOVED   REMOVED IN
foo-cj   foo-namespace   CronJob                   batch/v1beta1         batch/v1         true         v1.21.0         false     v1.25.0
```

```bash
$ helm template . -f foo-values.yaml \
    | pluto detect-helm -o wide -t k8s=<Kubernetesのバージョン> -

NAME    NAMESPACE       KIND                      VERSION               REPLACEMENT      DEPRECATED   DEPRECATED IN   REMOVED   REMOVED IN
foo-cj  foo-namespace   CronJob                   batch/v1beta1         batch/v1         true         v1.21.0         false     v1.25.0
```

CI上でこれを実行する場合、リポジトリ内のマニフェストを渡しさえすれば良く、特にGitOpsでCI/CDを分離している場合は、必ずしもkube-apiserverと通信する必要はない。

```bash
$ helm template . -f foo-values.yaml -f foo-secrets.yaml \
    | pluto detect -o wide -t k8s=<Kubernetesのバージョン> -

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
# version: APIグループのバージョン
# kind: カスタムリソース名
# deprecated-in: APIグループの特定のバージョンが非推奨になる場合に、警告が出るようになるKubernetesバージョン
# removed-in: APIグループの特定のバージョンが機能廃止になる場合に、使用できなくなるKubernetesバージョン
# replacement-api: APIグループの特定のバージョンが機能廃止になる場合に、変更後のAPIグループのバージョン
# replacement-available-in: APIグループのバージョンが新規追加される場合に、使用できるようになるKubernetesバージョン
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

Istioの主要カスタムリソースで`v1`がリリース (2024/05/14) されたので、`v1beta1`が非推奨になる日も近い...。

> - https://istio.io/latest/blog/2024/v1-apis/#overview-of-istio-crds

<br>

### -t

#### ▼ -tとは

plutoで検証するターゲットコンポーネントのバージョン (`versions.yaml`ファイルの`target-versions`キー) を指定する。

マイナーバージョン (例：`1.24.0`) まで指定する必要がある。

```bash
$ pluto detect - -o wide -t k8s=<Kubernetesのバージョン>
```

```bash
$ pluto detect - -o wide -t istio=<Istioのバージョン>
```

現在と次のバージョンを指定した処理を自動化で実行すれば、アップグレードに備えられる。

継続的に検出できるように、CI上で自動化すると良い。

```bash
$ pluto detect - -o wide -t k8s=<Kubernetesの現在のバージョン>

$ pluto detect - -o wide -t k8s=<Kubernetesの次のバージョン>
```

```bash
$ pluto detect - -o wide -t istio=<Istioの現在のバージョン>

$ pluto detect - -o wide -t istio=<Istioの次のバージョン>
```

> - https://github.com/FairwindsOps/pluto/blob/master/versions.yaml#L568-L571

<br>

### -o

出力形式を指定する。

```bash
$ pluto detect - -o wide
```

> - https://pluto.docs.fairwinds.com/advanced/#display-options

マークダウン形式が一番見やすい。

```bash
$ pluto detect - -o markdown
```

> - https://pluto.docs.fairwinds.com/advanced/#display-options

<br>

## 03. サブコマンド

### detect

kube-apiserverからの返信、または標準入力で入力されたマニフェストから、リソース名単位で非推奨なAPIを検出する。

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

kube-apiserverからの返信、または標準入力で入力されたマニフェストから、リソース名単位で非推奨なAPIを検出する。

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

ディレクトリ内のファイルを再帰的に検証し、リソース名単位で非推奨なAPIを検出する。

```bash
$ pluto detect-files - -o wide
```

> - https://pluto.docs.fairwinds.com/quickstart/#file-detection-in-a-directory
> - https://qiita.com/wadason/items/c9d5f6a475bf7764fc9d#%E6%A4%9C%E8%A8%BC

<br>

### detect-helm

kube-apiserverからの返信、または標準入力で入力されたマニフェストから、チャート単位で非推奨なAPIを検出する。

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
