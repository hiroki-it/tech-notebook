---
title: 【IT技術の知見】リソース定義＠Argo Rollouts
description: リソース定義＠Argo Rolloutsの知見を記録しています。
---

# リソース定義＠Argo Rollouts

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Rollout

### Rolloutとは

KubernetesのDeploymentに代わって、Podのライフサイクルを管理する。

Deploymentよりも複雑な手法でPodをデプロイできる。

<br>

### .spec.analysis

#### ▼ analysisとは

Progressive Deliveryを使用する場合、詳細を設定する。

> - https://github.com/argoproj/argo-cd/blob/v2.6.0/docs/operator-manual/application.yaml

#### ▼ successfulRunHistoryLimit

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  namespace: argocd
  name: foo-rollout
spec:
  analysis:
    successfulRunHistoryLimit: 10
```

#### ▼ unsuccessfulRunHistoryLimit

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  namespace: argocd
  name: foo-rollout
spec:
  analysis:
    unsuccessfulRunHistoryLimit: 10
```

<br>

### .spec.strategy

#### ▼ strategyとは

デプロイ手法を設定する。

大前提として、そもそもArgoCDは`kubectl apply`コマンドでリソースを作成しているだけなため、デプロイ手法は、Deploymentの`.spec.strategy`キーや、DaemonSetとStatefulSetの`.spec.updateStrategy`キーの設定値に依存する。

ArgoCDの`strategy`オプションを使用することにより、これらのKubernetesリソース自体を冗長化し、より安全にapplyを行える。

#### ▼ blueGreen

![argocd_blue-green-deployment](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_blue-green-deployment.png)

ブルー/グリーンデプロイメントを使用して、新しいPodをデプロイする。

| 設定項目                | 説明                                                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeService`         | 現環境へのルーティングに使用するServiceを設定する。                                                                                                      |
| `autoPromotionEnabled`  | 現環境から新環境への自動切り替えを有効化するか否かを設定する。もし無効化した場合、`autoPromotionSeconds`の秒数だけ切り替えを待機する。                   |
| `autoPromotionSeconds`  | 現環境から新環境への切り替えを手動で実行する場合、切り替えを待機する最大秒数を設定する。最大秒数が経過すると、自動的に切り替わってしまうことに注意する。 |
| `previewReplicaCount`   | 新環境のPod数を設定する。                                                                                                                                |
| `previewService`        | 新環境へのルーティングに使用するServiceを設定する。                                                                                                      |
| `scaleDownDelaySeconds` |                                                                                                                                                          |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  namespace: argocd
  name: foo-blue-green-rollout
spec:
  strategy:
    # ブルー/グリーンデプロイメイト
    blueGreen:
      activeService: foo-active-service
      previewService: foo-preview-service
      previewReplicaCount: 1
      autoPromotionEnabled: "true"
      scaleDownDelaySeconds: 30
```

> - https://argoproj.github.io/argo-rollouts/features/bluegreen/
> - https://argoproj.github.io/argo-rollouts/concepts/#blue-green
> - https://korattablog.com/2020/06/19/argocd%E3%81%AB%E3%82%88%E3%82%8Bbluegreen%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4%E3%82%92%E8%A9%A6%E3%81%99/

#### ▼ canary

![argocd_canary-release](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_canary-release.png)

カナリアリリースを使用して、新しいPodをデプロイする。

| キー   | 説明                                                                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `step` | カナリアリリースの手順を設定する。<br>・`setWeight`：新しいPodへの重み付けを設定する。<br>・`pause`：次の手順に移行せずに待機する。待機秒数を設定できる。 |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  namespace: argocd
  name: foo-canary-rollout
spec:
  strategy:
    # カナリアリリース
    canary:
      steps:
        - setWeight: 25
        - pause:
            duration: 10
```

> - https://argoproj.github.io/argo-rollouts/features/canary/
> - https://argoproj.github.io/argo-rollouts/concepts/#canary
> - https://korattablog.com/2020/06/19/argocd%E3%81%AEcanary-deployment%E3%82%92%E8%A9%A6%E3%81%99/

サービスメッシュツールでは手動カナリアリリースを実装できるが、これと連携し、サービスメッシュツールで自動カナリアリリースを実現できる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  namespace: argocd
  name: foo-canary-rollout
spec:
  strategy:
    # カナリアリリース
    canary:
      steps:
        canaryService: canary-virtual-service
        stableService: stable-virtual-service
```

> - https://argo-rollouts.readthedocs.io/en/latest/features/traffic-management/istio/

<br>

### .spec.template

Deploymentの`spec.template`キーと同じである。

Rolloutで管理したいPodを定義する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  namespace: argocd
  name: foo-canary-rollout
spec:
  template: ...
```

<br>
