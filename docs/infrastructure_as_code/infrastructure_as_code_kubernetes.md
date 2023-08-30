---
title: 【IT技術の知見】Kubernetes＠IaC
description: Kubernetes＠IaCの知見を記録しています。
---

# Kubernetes＠IaC

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Kubernetesの仕組み

### アーキテクチャ

Kubernetesは、コントロールコンポーネント、Nodeコンポーネント、から構成される。

![kubernetes_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_architecture.png)

> - https://kubernetes.io/docs/concepts/overview/components/

<br>

## 02. 証明書

### デフォルトのルート認証局

Kubernetesのルート認証局のルート証明書は、`kube-root-ca.crt`というConfigMapで定義されている。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kube-root-ca.crt
  namespace: foo
data:
  ca.crt: |
    -----BEGIN CERTIFICATE-----
    *****
    -----END CERTIFICATE-----
```

> - https://qiita.com/uesyn/items/f46b066772781317653d#introducing-rootcaconfigmap

<br>

### デフォルトのSSL証明書

![kubernetes_certificates](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_certificates.png)

コンポーネント間でHTTPSプロトコルを使用するためにはクライアント証明書やSSL証明書が必須である。

一方で必須ではないが、通信をさらに安全にするためにクライアント証明書が使用されているところがある。

クライアント証明書の場合、これを使用するクライアント側には、クライアント証明書と秘密鍵の両方を配置することになる。

| 送信元                                                                    | 宛先           | 種類               | Node上の証明書のマウント先 (kubeadmの場合)                                                   | 説明                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------- | -------------- | ------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| kube-apiserver                                                            | kubelet        | クライアント証明書 | `/etc/kubernetes/kubelet.conf `ファイル (証明書の中身は`/var/lib/kubelet/pki/*.pem`ファイル) | kube-apiserverが、kubeletにHTTPSリクエストを送信するための証明書。                                                                                                                                                                                                                                                                                                     |
| kube-apiserver                                                            | etcd           | クライアント証明書 | 記入中...                                                                                    | kube-apiserverが、etcdにHTTPSリクエストを送信するための証明書。                                                                                                                                                                                                                                                                                                        |
| クライアント (`kubectl`クライアント、Kubernetesリソース) のローカルマシン | kube-apiserver | クライアント証明書 | `/etc/kubernetes/admin.conf`ファイル                                                         | クライアントが、kube-apiserverにHTTPSリクエストを送信するための証明書。証明書の値は、`kubeconfig`ファイルの`client-certificate-data`キーに設定されている。証明書に不一致があると、クライアントからのリクエストで、『`x509: certificate has expired or is not yet valid`』や『`error: You must be logged in to the server (Unauthorized)`』というエラーになってしまう。 |
| kube-controller-manager                                                   | kube-apiserver | クライアント証明書 | `/etc/kubernetes/controller-manager.conf `ファイル                                           | kube-controller-managerがkube-apiserverにHTTPSリクエストを送信するための証明書。証明書とは別に、`kubeconfig`ファイルも必要になる。                                                                                                                                                                                                                                     |
| kube-scheduler                                                            | kube-apiserver | クライアント証明書 | `/etc/kubernetes/scheduler.conf `ファイル                                                    | kube-schedulerがkube-apiserverにHTTPSリクエストを送信するための証明書。証明書とは別に、`kubeconfig`ファイルも必要になる。                                                                                                                                                                                                                                              |
| その他のコンポーネント                                                    | kube-apiserver | SSL証明書          | 記入中...                                                                                    | kube-apiserverが各コンポーネントからHTTPSリクエストを受信するための証明書。                                                                                                                                                                                                                                                                                            |
| kube-apiserver                                                            | kubelet        | SSL証明書          | 記入中                                                                                       | kubeletが、kube-apiserverからのHTTPSリクエストを受信するための証明書。                                                                                                                                                                                                                                                                                                 |
| kube-apiserver                                                            | front-proxy    | SSL証明書          | 記入中...                                                                                    | front-proxyが、kube-apiserverからのHTTPSリクエストを受信するための証明書。                                                                                                                                                                                                                                                                                             |

> - https://kubernetes.io/docs/setup/best-practices/certificates/#how-certificates-are-used-by-your-cluster
> - https://milestone-of-se.nesuke.com/sv-advanced/digicert/client-cert/

<br>

### SSL証明書の期限

#### ▼ 期限の確認方法

各SSL証明書の有効期限は`1`年間である。

証明書は、KubernetesリソースのConfigの`client-certificate-data`キー配下に設定されている。

`openssl`コマンドの標準入力にこれを渡すと、証明書の期限を確認できる。

Kubernetesでは非常に多くの証明書があるため、期限切れの証明書を特定することは大変である。

```bash
$ cat <証明書が設定されたConfigのマニフェストへのパス> \
    | grep client-certificate-data \
    | cut -f2 -d : \
    | tr -d ' ' \
    | base64 -d \
    | openssl x509 -noout -dates


notBefore=Dec  9 09:31:55 2020 GMT # 開始日
notAfter=Jan 10 09:31:55 2022 GMT  # 終了日
```

Configによっては、証明書のパスが設定されている場合がある。

その場合は、`openssl`コマンドで直接的にこれを指定する。

```bash
$ openssl x509 -noout -dates -in <証明書へのパス>
```

> - https://github.com/prometheus-operator/kube-prometheus/issues/881#issuecomment-452356415

#### ▼ 更新方法

`kubelet`プロセスの実行時に、`--rotate-certificates`オプションを有効化すると、証明書の更新処理を自動化できる。

> - https://kubernetes.io/docs/tasks/tls/certificate-rotation/#enabling-client-certificate-rotation

<br>

## 03. マルチテナント

### マルチテナントとは

各Kubernetesリソースの処理範囲を制限するために、Kubernetesリソースをグルーピングする。

> - https://kubernetes.io/docs/concepts/security/multi-tenancy/

<br>

### ハード vs ソフト

#### ▼ ハードマルチテナンシー

信頼できる開発者のみがClusterにアクセスする場合に、ヒューマンエラーを防ぐ目的でマルチテナント化する。

例えば、Cluster内にアクセスする開発者が、プロダクトの開発チーム (フロントエンドチーム、バックエンドチーム、インフラチーム) の場合である。

> - https://www.amazon.co.jp/dp/B072TS9ZQZ
> - https://kubernetes.io/docs/concepts/security/multi-tenancy/#isolation
> - https://aws.github.io/aws-eks-best-practices/security/docs/multitenancy/#soft-multi-tenancy

#### ▼ ソフトマルチテナンシー

信頼できない開発者もClusterにアクセスする場合 (例：複数の協力会社がいる、Kubernetesをサービスとして公開している) に、悪意ある操作を防ぐ目的でマルチテナント化する。

> - https://www.amazon.co.jp/dp/B072TS9ZQZ
> - https://kubernetes.io/docs/concepts/security/multi-tenancy/#isolation
> - https://aws.github.io/aws-eks-best-practices/security/docs/multitenancy/#hard-multi-tenancy

<br>

### X as-a-Service

後述する。

> - https://kubernetes.io/blog/2021/04/15/three-tenancy-models-for-kubernetes/
> - https://www.cognixia.com/blog/what-are-the-three-tenancy-models-for-kubernetes/
> - https://medium.com/eureka-engineering/pairs-eureka-%E3%81%AEeks-production%E7%92%B0%E5%A2%83%E3%81%AE%E8%A8%AD%E8%A8%88%E3%81%A8%E9%81%8B%E7%94%A8%E3%81%AE%E3%81%8A%E8%A9%B1-74608ff640df
> - https://tag-app-delivery.cncf.io/blog/clusters-for-all-cloud-tenants/

<br>

## 03-02. Clusters as-a-Service

### Clusters as-a-Serviceとは

テナントごとにClusterを作成する。

<br>

### 実Cluster分割の場合

#### ▼ 実Cluster単位のテナントとは

テナントごとに、独立したClusterを提供する。

一番簡単である。

#### ▼ 複数のClusterを一元管理

以下のツールを使用して、複数のClusterを一元管理できる。

- Rancher Multi-cluster Apps
- Gardener

> - https://ranchermanager.docs.rancher.com/v2.5/how-to-guides/new-user-guides/deploy-apps-across-clusters/multi-cluster-apps
> - https://github.com/gardener/gardener

<br>

## 03-03. Control-planes as-a-Service

### Control-planes as-a-Serviceとは

テナントごとに、独立したコントロールプレーンを提供する。

<br>

### 仮想Clusterの場合

#### ▼ 仮想Cluster単位のテナントとは

ホストCluster上にテナントごとに仮想Clusterを作成する。

各仮想Clusterがコントロールプレーンを持ち、これらが独立したコントロールプレーンのコンポーネントを持つ。

仮想Cluster間でコントロールプレーンは分離されている。

> - https://www.cncf.io/blog/2022/11/09/multi-tenancy-in-kubernetes-implementation-and-optimization/
> - https://www.linkedin.com/pulse/kubernetes-virtual-clusters-enabling-hard-cost-gokul-chandra/
> - https://loft.sh/blog/kubernetes-multi-tenancy-why-virtual-clusters-are-the-best-solution/

#### ▼ 仮想Clusterプロビジョニングツール

アルファベット順

- kcp
- tensile-kube
- vcluster
- virtual cluster

> - https://github.com/kubernetes-retired/multi-tenancy/tree/master/incubator/virtualcluster
> - https://www.vcluster.com/docs/what-are-virtual-clusters#why-use-virtual-kubernetes-clusters
> - https://github.com/kcp-dev/kcp
> - https://github.com/virtual-kubelet/tensile-kube

<br>

### カスタムリソーステナントの場合

#### ▼ カスタムリソーステナントとは

記入中...

<br>

## 03-03. Namespaces as-a-Service

### Namespaces as-a-Serviceとは

テナントごとに、独立したNamespaceを提供する。

<br>

### 階層Namespaceの場合

#### ▼ 階層Namespace単位のテナントとは

Namespaceに親子関係を定義し、各Namespaceをテナントとする。

> - https://www.cncf.io/blog/2022/11/09/multi-tenancy-in-kubernetes-implementation-and-optimization/

<br>

### Namespaceの場合

#### ▼ Namespace単位のテナントとは

単一のCluster上に、テナントごとにNamespaceを作成する。

#### ▼ 実行環境別

実行環境別にNamespaceを分割する。

ただそもそも、Namespaceだけでは実行間環境間の分割が足りず、安全性が低い。

そのため、Cluster自体を分割した方がよい。

> - https://wangwei1237.github.io/Kubernetes-in-Action-Second-Edition/docs/Organizing_objects_into_Namespaces.html
> - https://aptakube.com/blog/namespaces-best-practices
> - https://www.appvia.io/blog/best-practices-for-kubernetes-namespaces/
> - https://cloud.redhat.com/blog/kubernetes-namespaces-demystified-how-to-make-the-most-of-them

#### ▼ チーム別

チーム別にNamespaceを分割する。

著名な書籍に一番多いテナントである。

![namespace_teams.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/namespace_teams.png)

> - https://www.amazon.co.jp/dp/1617293725
> - https://cloud.google.com/blog/products/containers-kubernetes/kubernetes-best-practices-organizing-with-namespaces?hl=en
> - https://blog.mosuke.tech/entry/2020/04/09/kubernetes-namespace/
> - https://wangwei1237.github.io/Kubernetes-in-Action-Second-Edition/docs/Organizing_objects_into_Namespaces.html

#### ▼ 機密性の高さ別

機密性の高さに応じて、Namespaceを分割する。

NamespaceにNetworkPolicyを設定し、Namespace間でKubernetesリソースの通信を制限できる。

> - https://blog.mosuke.tech/entry/2020/04/09/kubernetes-namespace/
> - https://techstep.hatenablog.com/entry/2020/09/06/160435

#### ▼ ハードウェアリソースの要求量別

コンテナのハードウェアリソースの要求量に応じて、Namespaceを分割する。

NamespaceにResourceQuotaやLimitRangeを設定し、一方のNamespaceでハードウェアリソースの要求量が増えても、他方のNamespaceには影響しないようにできる。

> - https://techstep.hatenablog.com/entry/2020/09/06/160435

#### ▼ プロダクト別

プロダクト別にNamespaceを分割する。

これは、単一のCluster内で共通基盤のツール (例：ArgoCD、Flux) を動かすような場合に役立つ。

#### ▼ プロダクトのサブコンポーネント別

プロダクトのサブコンポーネント別にNamespaceを分割する。

Namespaceを分割するとシステムを理解しやすくなるため、それだけで分ける意義がある。

> - https://blog.mosuke.tech/entry/2020/04/09/kubernetes-namespace/

<br>

### Nodeグループの場合

#### ▼ Nodeグループ単位のテナントとは

単一のClusterをNodeグループで分割する。

> - https://kubernetes.io/docs/concepts/security/multi-tenancy/#node-isolation

#### ▼ ハードウェアリソースの要求量別

コンテナのハードウェアリソースの要求量に応じて、Nodeグループを分割する。

<br>

## 03-04. カスタムリソーステナントの場合

### カスタムリソーステナントとは

テナントカスタムリソースを使用して、ツール固有のマルチテナントを実現する。

アルファベット順

- capsule
- kiosk
- kubeplus
- kubezoo

> - https://github.com/clastix/capsule
> - https://github.com/loft-sh/kiosk
> - https://github.com/kubewharf/kubezoo
> - https://github.com/cloud-ark/kubeplus

<br>

### capsule

#### ▼ capsuleとは

capsuleでは、Tenantというカスタムリソースを作成し、テナントを実装する。

Tenantには、複数のNamespaceが所属できる。

![capsule_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/capsule_architecture.png)

> - https://capsule.clastix.io/docs/

#### ▼ テナントの実装

**＊実装例＊**

fooチームが使用するfooテナント (`foo-tenant`) を作成する。

```yaml
apiVersion: capsule.clastix.io/v1beta2
kind: Tenant
metadata:
  name: foo-tenant
spec:
  owners:
    - name: foo-team
      kind: Group
```

`capsule.clastix.io/tenant`キーを使用して、fooチームが操作するNamespaceをfooテナントに所属させる。

```yaml
kind: Namespace
apiVersion: v1
metadata:
  name: foo-1
  labels:
    capsule.clastix.io/tenant: foo-tenant
---
kind: Namespace
apiVersion: v1
metadata:
  name: foo-2
  labels:
    capsule.clastix.io/tenant: foo-tenant
```

> - https://capsule.clastix.io/docs/general/tutorial/#assign-multiple-tenants

<br>

### kiosk

#### ▼ kioskとは

kioskでは、Accountというカスタムリソースを作成し、テナントを実装する。

SpaceはNamespaceと紐づいている。

Accountは、Spaceを介して、複数のNamespaceを管理する。

> - https://github.com/loft-sh/kiosk#workflow--interactions
> - https://github.com/loft-sh/kiosk#3-working-with-spaces

#### ▼ テナントの実装

**＊実装例＊**

fooチームが使用するfooテナント (`foo-account`) を作成する。

```yaml
apiVersion: tenancy.kiosk.sh/v1alpha1
kind: Account
metadata:
  name: foo-account
spec:
  subjects:
    - kind: Group
      name: foo-team
      apiGroup: rbac.authorization.k8s.io
  space:
    templateInstances:
      - spec:
          template: space-template
```

Space (foo-space) を作成し、Account (`foo-account`) に所属させる。

```yaml
apiVersion: tenancy.kiosk.sh/v1alpha1
kind: Space
metadata:
  name: foo-space
spec:
  account: foo-account
```

またTemplateを使用して、Namespace内の制限に関するKubernetesリソース (例：NetworkPolicy、LimitRange、など) を一括して設定する。

```yaml
apiVersion: config.kiosk.sh/v1alpha1
kind: Template
metadata:
  name: space-template
resources:
  manifests:
    - kind: NetworkPolicy
      apiVersion: networking.k8s.io/v1
      metadata:
        name: deny-cross-ns-traffic
      spec:
        podSelector:
          matchLabels:
        ingress:
          - from:
              - podSelector: {}
    - apiVersion: v1
      kind: LimitRange
      metadata:
        name: space-limit-range
      spec:
        limits:
          - default:
              cpu: 1
            defaultRequest:
              cpu: 0.5
            type: Container
```

実装方法がなかなか複雑で、移行の実装方法は記入中...

> - https://aws.amazon.com/jp/blogs/news/set-up-soft-multi-tenancy-with-kiosk-on-amazon-elastic-kubernetes-service/
> - https://github.com/loft-sh/kiosk#51-manifest-templates

<br>

### KubeZoo

#### ▼ KubeZooとは

KubeZooでは、Tenantというカスタムリソースを作成し、テナントを実装する。

SpaceはNamespaceと紐づいている。

Accountは、Spaceを介して、複数のNamespaceを管理する。

> - https://github.com/kubewharf/kubezoo/blob/main/docs/design.md

<br>
