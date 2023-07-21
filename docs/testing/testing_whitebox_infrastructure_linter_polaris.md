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

> - https://polaris.docs.fairwinds.com/checks/security/
> - https://polaris.docs.fairwinds.com/checks/efficiency/
> - https://polaris.docs.fairwinds.com/checks/reliability/

<br>

## `config.yaml`ファイル

### checks

検査項目ごとに、検出する最低の重要度レベルを設定する。

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
    # コントローラー名
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
