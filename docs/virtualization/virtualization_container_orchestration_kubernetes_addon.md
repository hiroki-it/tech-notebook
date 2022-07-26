---
title: 【IT技術の知見】kubernetesアドオン＠仮想化
description: kubernetesアドオン＠仮想化の知見を記録しています。
---

# kubernetesアドオン＠仮想化

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. admission-controllersアドオン

### admission-controllersアドオンとは

![kubernetes_admission-controllers](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers.png)

kube-apiserverのリクエストの処理時には認証認可プロセスがある。admission-controllersアドオンを導入すると、この後に、作成リクエストや変更リクエストのパラメーターを条件に応じて書き換える処理や、パラメーターのバリデーションを実行する処理を定義できる。

参考：

- https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/
- https://knowledge.sakura.ad.jp/21129/
- https://blog.mosuke.tech/entry/2022/05/15/admission-webhook-1/

<br>

### admission-controllersアドオンの仕組み

#### ▼ admission-controllersアドオンの構成

![kubernetes_admission-controllers_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers_architecture.png)

admission-controllersアドオンは、2つのステップから構成されている。各ステップで実行する具体的な処理は、admission-controllersアドオンで定義する以外に、Webhookアドオンで独自処理をコールするように定義することもできる。

参考：

- https://kubernetes.io/blog/2019/03/21/a-guide-to-kubernetes-admission-controllers/
- https://gashirar.hatenablog.com/entry/2020/10/31/141357

| ステップ             | 説明                                                         |
| -------------------- | ------------------------------------------------------------ |
| mutating-admission   | 作成リクエストや変更リクエストのパラメーターを条件に応じて書き換える処理を定義する。 |
| validating-admission | パラメーターのバリデーションを実行する独自処理を定義する。   |

#### ▼ 使用アドオンの確認

有効化されているadmission-controllersアドオンの機能は、コントロールプレーンのログから確認できる。

参考：https://sotoiwa.hatenablog.com/entry/2020/12/28/115826

```bash
$ aws logs get-log-events \
    --log-group-name /aws/eks/mycluster/cluster \
    --log-stream-name kube-apiserver-1d24dba23787aec360e79bd7464607f7 \
    | jq -r '.events[].message' \
    | grep FLAG
  
# 〜 中略 〜
  
I1228 00:21:20.695026 1 flags.go:33] FLAG: --enable-admission-plugins="[NamespaceLifecycle,LimitRanger,ServiceAccount,DefaultStorageClass,ResourceQuota,DefaultTolerationSeconds,NodeRestriction,PodSecurityPolicy]"

# 〜 中略 〜

```

<br>

### Webhookで送受信されるデータ

#### ▼ 構成

参考：

- https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/
- https://zenn.dev/kanatakita/articles/6d6e5391336c1c5669c2

```yaml
# mutating-admission、validating-admission、でのkube-apiserverへのリクエスト
{
  "apiVersion": "admission.k8s.io/v1beta1",
  "kind": "AdmissionReview",
  # kube-apiserverへのリクエストのパラメーター
  "request": {
    "uid": "705ab4f5-6393-11e8-b7cc-42010a800002",
    "kind": {"group":"autoscaling","version":"v1","kind":"Scale"},
    "resource": {"group":"apps","version":"v1","resource":"deployments"},
    "subResource": "scale",
    "requestKind": {"group":"autoscaling","version":"v1","kind":"Scale"},
    "requestResource": {"group":"apps","version":"v1","resource":"deployments"},
    "requestSubResource": "scale",
    "name": "my-deployment",
    "namespace": "my-namespace",
    "operation": "UPDATE",
    "userInfo": {
      "username": "admin",
      "uid": "014fbff9a07c",
      "groups": ["system:authenticated","my-admin-group"],
      "extra": {
        "some-key":["some-value1", "some-value2"]
      }
    },
    # 作成/更新されるKubernetesリソース
    "object": {"apiVersion":"autoscaling/v1","kind":"Scale",...},
    "oldObject": {"apiVersion":"autoscaling/v1","kind":"Scale",...},
    "options": {"apiVersion":"meta.k8s.io/v1","kind":"UpdateOptions",...},
    "dryRun": false
  }
}
```

```yaml
# mutating-admissionの場合のkube-apiserverからのレスポンス
{
  "apiVersion": "admission.k8s.io/v1",
  "kind": "AdmissionReview",
  "response": {
    "uid": "<value from request.uid>",
    # 宛先のkube-apiserverでバリデーションに成功したか否か
    "allowed": true,
    "patchType": "JSONPatch",
    # PatchされるKubernetesリソース
    "patch": "W3sib3AiOiAiYWRkIiwgInBhdGgiOiAiL3NwZWMvcmVwbGljYXMiLCAidmFsdWUiOiAzfV0="
  }
}
```

```yaml
# validating-admissionの場合のkube-apiserverからのレスポンス
{
  "apiVersion": "admission.k8s.io/v1",
  "kind": "AdmissionReview",
  "response": {
    "uid": "<value from request.uid>",
    # 宛先のkube-apiserverでバリデーションに成功したか否か
    "allowed": true,
    "status": {
      "code": 403,
      "message": "You cannot do this because it is Tuesday and your name starts with A"
    }
  }
}
```

<br>

## 02. cniアドオン

### cniアドオンとは

![kubernetes_cni-plugin](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cni-plugin.png)

Clusterネットワーク内のIPアドレスをPodに割り当て、Clusterネットワーク内にある通信がPodに接続できるようにする。kubeletによって実行される。Clusterネットワークの種類に応じたcniアドオンが用意されている。

参考：

- https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=27
- https://kubernetes.io/docs/concepts/cluster-administration/networking/

<br>

## 03. core-dnsアドオン（旧kube-dns）

### core-dnsアドオンとは

ワーカーNode内の権威DNSサーバーとして、Kubernetesリソースの名前解決を行う。

参考：https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=29

![kubernetes_coredns](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_coredns.png)

<br>

### CoreDNS Service/Pod

CoreDNSはワーカーNode内にPodとして稼働しており、これはCoreDNS Serviceによって管理されている。

参考：https://amateur-engineer-blog.com/kubernetes-dns/#toc6

```bash
# CoreDNS Service
$ kubectl get service -n kube-system

NAME       TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                  AGE
kube-dns   ClusterIP   10.96.0.10   <none>        53/UDP,53/TCP,9153/TCP   1m0s

# CoreDNS Pod
$ kubectl get pods -n kube-system

NAME                                     READY   STATUS    RESTARTS   AGE
coredns-558bd4d5db-hg75t                 1/1     Running   0          1m0s
coredns-558bd4d5db-ltbxt                 1/1     Running   0          1m0s
```

<br>
