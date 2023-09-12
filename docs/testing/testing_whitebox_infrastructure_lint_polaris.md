---
title: 【IT技術の知見】 polaris＠ベストプラクティス違反
description: polaris＠ベストプラクティス違反の知見を記録しています。
---

# polaris＠ベストプラクティス違反

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. polarisの仕組み

### 検出項目

一般に知られているベストプラクティス項目に基づいて、マニフェストのベストプラクティス違反 (例：脆弱性、効率性、信頼性、など) を検証する。

Helmチャートのまま検査できず、一度マニフェストとして渡す必要がある。

> - https://polaris.docs.fairwinds.com/checks/security/
> - https://polaris.docs.fairwinds.com/checks/efficiency/
> - https://polaris.docs.fairwinds.com/checks/reliability/

<br>

### セットアップ

#### ▼ GUI

```bash
$ helm repo add <チャートリポジトリ名> https://charts.fairwinds.com/stable

$ kubectl create namespace polaris

$ helm install <Helmリリース名> <チャートリポジトリ名>/polaris --namespace polaris

# ダッシュボードにアクセスする
$ kubectl port-forward --namespace polaris svc/polaris-dashboard 8080:80
```

> - https://polaris.docs.fairwinds.com/dashboard/#installation

#### ▼ CLI

```bash
$ brew tap FairwindsOps/tap

$ brew install FairwindsOps/tap/polaris
```

> - https://polaris.docs.fairwinds.com/infrastructure-as-code/

#### ▼ Admission Controller

Admission Controllerとして、実際にデプロイされたマニフェストに対して静的解析を実行する。

```bash
$ helm repo add <チャートリポジトリ名> https://charts.fairwinds.com/stable

$ helm install <Helmリリース名> <チャートリポジトリ名>/polaris --namespace polaris --set webhook.enable=true --set dashboard.enable=false
```

> - https://polaris.docs.fairwinds.com/admission-controller/#installation

<br>

## 02. `config.yaml`ファイル

### checks

#### ▼ checksとは

検査項目ごとに重要度レベル (ignore、warning、danger) を設定する。

```yaml
checks:

  # 信頼性
  deploymentMissingReplicas: ignore
  priorityClassNotSet: warning
  tagNotSpecified: danger

  ...

  # ハードウェアリソース効率性
  cpuRequestsMissing: ignore
  cpuLimitsMissing: warning
  memoryRequestsMissing: danger

  ...

  # 安全性
  automountServiceAccountToken: ignore
  hostIPCSet: warning
  hostPIDSet: danger

  ...
```

> - https://polaris.docs.fairwinds.com/customization/checks/
> - https://github.com/FairwindsOps/polaris/tree/master/checks

#### ▼ 重要度レベルの変更

polarisの実行時に、重要度が`danger`以上のルールを検証するようにしたとする。

重要度がデフォルトで`warning`のルールは検証しなくなるため、検証したいルールは`danger`に格上げする

```yaml
checks:
  # Podのcpuの設定し忘れ
  cpuLimitsMissing: danger
  cpuRequestsMissing: danger

  # Deploymentのreplicasが1個である
  deploymentMissingReplicas: danger

  # PodのlivenessProbeの設定し忘れ
  livenessProbeMissing: danger

  # Podのメモリの設定し忘れ
  memoryLimitsMissing: danger
  memoryRequestsMissing: danger

  # PodDisruptionBudgetの作成し忘れ
  missingPodDisruptionBudget: danger

  # PodのpriorityClassの設定し忘れ
  priorityClassNotSet: danger

  # PodのreadinessProbeの設定し忘れ
  readinessProbeMissing: danger
```

> - https://polaris.docs.fairwinds.com/customization/checks/

<br>

### customChecks

#### ▼ customChecksとは

カスタムルールを定義する。

> - https://polaris.docs.fairwinds.com/customization/custom-checks/

#### ▼ 設定し忘れの検証

DaemonSet配下のPodでは、`.spec.priorityClassName`キーや`.spec.affinity`キーを設定しておく方が良いが、これを設定し忘れてしまう可能性がある。

こういった場合に、カスタムルールが役立つ。

```yaml
checks:
  # 重要度を設定する
  daemonSetPriorityClassMissing: danger
  daemonSetAffinityMissing: danger

customChecks:
  # DaemonSetのpriorityClassの設定し忘れを検証する
  # ビルトインのpriorityClassNotSetルールではWorkload全体を検証してしまうため、DaemonSet限定のルールを定義した
  daemonSetPriorityClassMissing:
    successMessage: In DaemonSet, priority class is set
    failureMessage: In DaemonSet, priority class should be set
    category: Reliability
    target: apps/DaemonSet
    schema:
      "$schema": http://json-schema.org/draft-07/schema
      type: object
      required:
        - spec
      properties:
        spec:
          type: object
          required:
            - priorityClassName
          properties:
            priorityClassName:
              type: string
              not:
                const: ""

  # Deploymentのaffinityの設定し忘れを検証する
  deploymentAffinityMissing:
    successMessage: In Deployment, affinity is set
    failureMessage: In Deployment, affinity should be set
    category: Reliability
    target: apps/Deployment
    schema:
      "$schema": http://json-schema.org/draft-07/schema
      type: object
      required:
        - spec
      properties:
        spec:
          type: object
          required:
            - template
          properties:
            template:
              type: object
              required:
                - spec
              properties:
                template:
                  type: object
                  required:
                    - affinity
                  properties:
                    affinity:
                      type: object
                      not:
                        const: ""
```

> - https://polaris.docs.fairwinds.com/customization/custom-checks/#basic-example

#### ▼ 作成し忘れ

HorizontalPodAutoscalerは、Deploymentと合わせて作る必要があるが、作成し忘れてしまう可能性がある。

こういった場合に、カスタムルールが役立つ。

```yaml
checks:
  # 重要度を設定する
  missingHorizontalPodAutoscalerWithDeployment: danger

customChecks:
  # Deploymentを作成している場合に、HorizontalPodAutoscalerも作成していることを検証する
  missingHorizontalPodAutoscalerWithDeployment:
    successMessage: HorizontalPodAutoscaler exists
    failureMessage: HorizontalPodAutoscaler is missing
    category: Reliability
    target: apps/Deployment
    schema: {}
    # Deploymentがある場合に合わせて必要なKubernetesリソースを定義する
    additionalSchemas:
      autoscaling/HorizontalPodAutoscaler: {}
```

> - https://polaris.docs.fairwinds.com/customization/custom-checks/#resource-presence

<br>

### mutations

記入中...

```yaml
mutations:
  - pullPolicyNotAlways
```

> - https://www.fairwinds.com/blog/how-polaris-kubernetes-mutations-work

<br>

### exemptions

脆弱性検出の項目から除外するKubernetesリソースを設定する。

一部のKubernetesリソース (例：kube-system) を`root`ユーザーで実行しなければならないため、除外設定が必要である。

```yaml
exemptions:
  # Namespace名
  - namespace: kube-system
    # Controller名 (Workload名)
    controllerNames:
      - dns-controller
      - ebs-csi-controller
      - ebs-csi-node
      - kindnet
      - kops-controller
      - kube-dns
      - kube-flannel-ds
      - kube-proxy
      - kube-scheduler
      - vpa-recommender
    # 脆弱性検出の項目名
    rules:
      - automountServiceAccountToken
      - linuxHardening
      - missingNetworkPolicy

  ...
```

> - https://polaris.docs.fairwinds.com/customization/checks/
> - https://github.com/FairwindsOps/polaris/blob/master/examples/config.yaml

<br>

## 03. コマンド

### audit

#### ▼ --format

結果の形式を指定する。

```bash
# 結果を読みやすく出力する。
$ polaris audit --audit-path manifest.yaml --format pretty
```

> - https://polaris.docs.fairwinds.com/infrastructure-as-code/#pretty-print-results

#### ▼ --only-show-failed-tests

失敗した結果のみを出力する。

```bash
$ polaris audit --audit-path manifest.yaml --only-show-failed-tests true
```

> - https://polaris.docs.fairwinds.com/infrastructure-as-code/#output-only-showing-failed-tests

#### ▼ --helm-chart、--helm-values

Helmチャートを指定する。

```bash
$ polaris audit --helm-chart ./chart --helm-values ./chart/values.yaml
```

> - https://polaris.docs.fairwinds.com/infrastructure-as-code/#audit-helm-charts

#### ▼ --set-exit-code-on-danger

dangerラベルが検出された場合の終了コードを設定する。

デフォルトは`0`である。

```bash
$ polaris audit --audit-path manifest.yaml --severity danger --set-exit-code-on-danger 1
```

#### ▼ --severity

検出する下限の重要度レベル (warning、danger) を設定する。

```bash
$ polaris audit --audit-path manifest.yaml --severity danger
```

<br>
