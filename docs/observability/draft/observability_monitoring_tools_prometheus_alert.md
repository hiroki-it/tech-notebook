---
title: 【IT技術の知見】アラート＠Prometheus
description: アラート＠Prometheusの知見を記録しています。
---

# アラート＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## Kubernetes で便利なアラート

### `KubeAPIDown`

kube-apiserver から `15` 分以上レスポンスがない場合に発火する。

Kubernetes Cluster のアップグレード時に発火する可能性がある。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeapidown/

<br>

### `KubeDeploymentReplicasMismatch`

Deployment で指定したレプリカ数の Pod がない場合に発火する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubedeploymentreplicasmismatch/

<br>

### `KubeVersionMismatch`

コントロールプレーン Node 側の kube-apiserver とワーカーNode 側の kubelet のバージョンが一致していない場合に発火する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeversionmismatch/

<br>

### `KubeControllerManagerDown`

kube-controller-manager からレスポンスがない場合に発火する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubecontrollermanagerdown/

<br>

### `KubeSchedulerDown`

kube-scheduler からレスポンスがない場合に発火する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubecontrollermanagerdown/

<br>

## Amazon EKS上で無効化しても問題がないアラート

### 判断基準

EKSでは、コントロールプレーンなどAWSの責任範囲に含まれるコンポーネントをAWSが運用し、障害時もAWSが復旧する。

利用者による対応が不要な事象を通知しても、利用者側では直接対処できず、運用上のノイズになる。

そのため、AWSが管理し、利用者側で個別に対応する必要がない対象のアラートを無効化しても、運用上の支障はない。

<br>

### `KubeControllerManagerDown`

AWSが管理するコントロールプレーン内のkube-controller-managerからレスポンスがなくなると発火する。

Amazon EKSでは利用者がkube-controller-managerへ直接対処しないため、無効化してもよい。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubecontrollermanagerdown/

<br>

### `KubeSchedulerDown`

AWSが管理するコントロールプレーン内のkube-schedulerからレスポンスがなくなると発火する。

Amazon EKSでは利用者がkube-schedulerへ直接対処しないため、無効化してもよい。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeschedulerdown/

<br>

### etcdに関するアラート

次のアラートは、AWSが管理するコントロールプレーン内のetcdで、それぞれの異常を検知すると発火する。

Amazon EKSでは利用者がetcdへ直接対処しないため、無効化してもよい。

- `etcdBackendQuotaLowSpace`
- `etcdGRPCRequestsSlow`
- `etcdHighFsyncDurations`
- `etcdHighNumberOfFailedGRPCRequests`
- `etcdInsufficientMembers`
- `etcdMembersDown`
- `etcdNoLeader`

> - https://runbooks.prometheus-operator.dev/runbooks/etcd/

<br>

### `KubeletServerCertificateExpiration`

EC2 Node内のkubeletがHTTPS通信で使用するSSLサーバー証明書の有効期限が7日未満になると発火する。

EKS内部の仕組みがこの証明書を自動更新する。

そのため、利用者が証明書を手動で更新する必要がなく、このアラートを通知する必要性は低い。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeletservercertificateexpiration/

<br>

### `KubeletClientCertificateExpiration`

kubeletがKubernetes API Serverとの通信に使用するクライアント証明書の有効期限が7日未満になると発火する。

kubeletの証明書ローテーション機能がこの証明書も自動更新する。

そのため、EKS上では利用者が手動で更新する必要がなく、このアラートを通知する必要性は低い。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeletclientcertificateexpiration/
> - https://kubernetes.io/docs/tasks/tls/certificate-rotation/

<br>

### 現場の判断に応じて無効化するアラート

#### ▼ `KubeletServerCertificateRenewalErrors`

サーバー証明書の自動更新に失敗すると発火する。

利用者側で更新失敗を検知する必要性を踏まえて、無効化を判断する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeletservercertificaterenewalerrors/

#### ▼ `KubeletClientCertificateRenewalErrors`

クライアント証明書の自動更新に失敗すると発火する。

利用者側で更新失敗を検知する必要性を踏まえて、無効化を判断する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeletclientcertificaterenewalerrors/

#### ▼ `KubeClientCertificateExpiration`

Kubernetes API Serverへ接続したクライアント証明書の有効期限が近づくと発火する。

EKS内部の証明書だけでなく、利用者が作成したクライアント証明書も対象になる可能性があるため、クライアント証明書による認証を使用しているかを踏まえて無効化を判断する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeclientcertificateexpiration/

#### ▼ `KubeAPIDown`

Kubernetes API Serverからレスポンスがなくなると発火する。

利用者影響の検知やAWSへの問い合わせに使うかを踏まえて、無効化を判断する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeapidown/

#### ▼ `KubeAPIErrorBudgetBurn`

Kubernetes API Serverのエラー率またはレイテンシーによってエラーバジェットを急速に消費すると発火する。

利用者影響の早期検知やAWSへの問い合わせに使うかを踏まえて、無効化を判断する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeapierrorbudgetburn/

#### ▼ `KubeAPITerminatedRequests`

Kubernetes API Serverがリクエストを終了すると発火する。

API操作への影響を監視するかを踏まえて、無効化を判断する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeapiterminatedrequests/

#### ▼ `KubeAggregatedAPIDown`

拡張APIからレスポンスがなくなると発火する。

対象の拡張APIを使用しているかを踏まえて、無効化を判断する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeaggregatedapidown/

#### ▼ `KubeAggregatedAPIErrors`

拡張APIのエラー率が高くなると発火する。

対象の拡張APIを使用しているかを踏まえて、無効化を判断する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeaggregatedapierrors/

> - https://docs.aws.amazon.com/eks/latest/userguide/eks-architecture.html

<br>
