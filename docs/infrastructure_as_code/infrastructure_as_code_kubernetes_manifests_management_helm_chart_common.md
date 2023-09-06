---
title: 【IT技術の知見】共通項目＠Helm
description: 共通項目＠Helmの知見を記録しています。
---

# 共通項目＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Helmの`metadata.labels`キーとは

### Helmの`metadata.labels`キーとは

Helmを使用している場合に、Helmの情報を設定する。

Helmが設定してくれるため、開発者が設定する必要はない。

<br>

### 種類

| キー                     | 値の例                           | 説明                                               |
| ------------------------ | -------------------------------- | -------------------------------------------------- |
| `chart`、`helm.sh/chart` | `foo-chart`                      | 使用しているチャート名を設定する。                 |
| `release`                | `foo-release`、`foo-application` | Helmリリース名、ArogoCDのApplication名を設定する。 |
| `heritage`               | `Helm`、`Tiller`                 | `v3`の場合は`Helm`、`v2`の場合は`Tiller`になる。   |

<br>

## 02. Helmのmetadata.annotation

### `meta.helm.sh`キー

#### ▼ `meta.helm.sh`キーとは

Helmの`helm install`コマンドを使用して作成したKubernetesリソースに付与される。

Helmの各リリースに紐づいており、別のリリースであれば、Kubernetesリソースを再作成することになる。

そのため、一部のKubernetesリソースを別のチャートでリリースし直したい場合、Kubernetesリソース、カスタムリソース、スタムリソース定義の`meta.helm.sh`キーを手動で書き換える必要がある。

```bash
# CRDの場合
$ kubectl annotate --overwrite crd <CRD名> meta.helm.sh/release-namespace="<新しいNamespace>"
$ kubectl annotate --overwrite crd <CRD名> meta.helm.sh/release-name="<新しいリリース名>"
```

また反対に、特定のKubernetesリソース (例：CRD) をHelmの管理外としたい場合、このキーを削除する必要がある。

```bash
$ kubectl annotate --overwrite crd <CRD名> meta.helm.sh/release-namespace-
$ kubectl annotate --overwrite crd <CRD名> meta.helm.sh/release-name-
```

補足として、ArgoCDを介してHelmを使用する場合、内部的には`kubectl apply`コマンドと同様の処理を実行しているため、この`meta.helm.sh`キーはない。

#### ▼ 種類

| キー                             | 値の例          | 説明                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta.helm.sh/release-name`      | `foo-release`   | Helmのリリース名を設定する。これを削除すると、helm-diffで削除判定になっても、実際には削除されない。                                                                                                                                                                                                                                                                                                                 |
| `meta.helm.sh/release-namespace` | `foo-namespace` | `helm install`コマンド時のNamespaceを設定する。これを削除すると、helm-diffで削除判定になっても、実際には削除されない。                                                                                                                                                                                                                                                                                              |
| `meta.helm.sh/resource-policy`   | `keep`          | Kubernetesリソース定義やCRDに付与することにより、 `helm install`コマンド時や`helm uninstall`コマンド時に、それの再作成処理や削除処理をスキップする。これは、特にCRDに付与した方がよい。公式チャートのアップグレード時に、特定のチャート内のKubernetesリソースを別チャートに移行したい場合に役立つ。他に、Helmリリースのアンインストール時に特定のKubernetesリソース (例：PersistentVolume) を残したい場合に役立つ。 |

CRDに`meta.helm.sh/resource-policy`キーを付与しておくと、`helm destroy`コマンド時に削除をスキップできる。

```bash
$ helm destroy <Helmリリース名>

...

Deleting argocd
These resources were kept due to the resource policy:
[CustomResourceDefinition] foo.io

...

$ kubectl get crd foo.io

foo.io    2023-01-22T06:08:21Z
```

> - https://helm.sh/docs/howto/charts_tips_and_tricks/#tell-helm-not-to-uninstall-a-resource
> - https://codersociety.com/blog/articles/helm-best-practices#9-opt-out-of-resource-deletion-with-resource-policies

<br>
