---
title: 【IT技術の知見】メタデータ＠Istio
description: メタデータ＠Istioの知見を記録しています。
---

# メタデータ＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Namespace の `.metadata.labels` キー

### istio-injection

指定した Namespace に所属する Pod 内へ、istio-proxy を自動的にインジェクションするか否かを設定する。

`.metadata.labels.istio.io/rev` キーとはコンフリクトを発生させるため、どちらかしか使えない (`.metadata.labels.istio-injection` キーの値が `disabled` の場合は共存できる) 。

`.metadata.labels.istio-injection` キーを使用する場合、Istio のアップグレードがインプレース方式になる。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app
  labels:
    istio-injection: enabled
```

アプリケーション以外の Namespace では `disabled` 値を設定することが多い。

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: observability
  labels:
    istio-injection: disabled # disabled であれば、istio.io/rev キーと共存できる。
---
apiVersion: v1
kind: Namespace
metadata:
  name: chaos-mesh
  labels:
    istio-injection: disabled # disabled であれば、istio.io/rev キーと共存できる。
```

> - [Istio / Installing the Sidecar](https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#controlling-the-injection-policy)

<br>

### istio.io/rev

#### ▼ サイドカーモードの場合

指定した Namespace に所属する Pod 内へ、istio-proxy を自動的にインジェクションするか否かを設定する。

また、サイドカーモードのカナリアアップグレードにも使用できる。

IstoOperator の `.spec.revision` キーと同じである。

`.metadata.labels.istio-injection` キーとはコンフリクトを発生させるため、どちらかしか使えない (`.metadata.labels.istio-injection` キーの値が `disabled` の場合は共存できる) 。

`.metadata.labels.istio.io/rev` キーを使用する場合、Istio のアップグレードがカナリア方式になる。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app
  labels:
    istio.io/rev: default
---
apiVersion: v1
kind: Namespace
metadata:
  name: observability
  labels:
    istio-injection: disabled # disabled であれば、istio.io/rev キーと共存できる。
---
apiVersion: v1
kind: Namespace
metadata:
  name: chaos-mesh
  labels:
    istio-injection: disabled # disabled であれば、istio.io/rev キーと共存できる。
```

> - [Istio / Announcing Support for 1.8 to 1.10 Direct Upgrades](https://istio.io/latest/blog/2021/direct-upgrade/#upgrade-from-18-to-110)

#### ▼ アンビエントモードの場合

waypoint-proxy に関する Gateway のラベルで、適用対象の Istio リビジョンまたはリビジョンタグを指定する。

アンビエントモードの Namespace には、istio-proxy のインジェクション用の `istio.io/rev` ラベルを設定しない。

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app
  labels:
    istio.io/dataplane-mode: ambient
    istio.io/use-waypoint: istio-waypoint
```

> - [Istio / Upgrade with Helm](https://istio.io/latest/docs/ambient/upgrade/helm/)

<br>

### istio.io/dataplane-mode

#### ▼ istio.io/dataplane-mode とは

アンビエントモードの場合、設定した Namespace に所属する Pod をアンビエントモードのサービスメッシュに登録する。

このラベルを設定した Namespace の Pod は、ztunnel へのリダイレクトによってアンビエントモードのサービスメッシュに登録される。ztunnel は `L4` の非機能ロジックを実装し、`L4` と `L7` のトラフィックを中継できる。

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app
  labels:
    istio.io/dataplane-mode: ambient
---
apiVersion: v1
kind: Namespace
metadata:
  name: istio-egress
  # istio-engress にはラベルは不要である
---
apiVersion: v1
kind: Namespace
metadata:
  name: istio-ingress
  # istio-engress にはラベルは不要である
```

> - [Istio / Resource Labels](https://istio.io/latest/docs/reference/config/labels/#IoIstioDataplaneMode)
> - [Istio / Ambient data plane](https://istio.io/latest/docs/ambient/architecture/data-plane/)
> - [Istio / Add workloads to the mesh](https://istio.io/latest/docs/ambient/usage/add-workloads/#ambient-labels)

<br>

### istio.io/use-waypoint

#### ▼ istio.io/use-waypoint とは

アンビエントモードの場合、設定した Namespace で waypoint-proxy を有効化する。

waypoint-proxy と紐づく Gateway 名 (Gateway API) を指定する。

このラベルを設定した Namespace では、指定した waypoint-proxy に通信を中継させ、`L7` の非機能ロジックを適用できる。

もし、`istio.io/use-waypoint` を設定した Namespace に waypoint-proxy (Gateway API の Namespace によって決まる) が一緒にいない場合は、`istio.io/use-waypoint-namespace` で waypoint-proxy にいる Namespace を指定する必要がある。

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app
  labels:
    # Gateway の名前
    istio.io/use-waypoint: istio-waypoint
```

> - [Istio / Resource Labels](https://istio.io/latest/docs/reference/config/labels/#IoIstioUseWaypoint)
> - [Istio / Ambient data plane](https://istio.io/latest/docs/ambient/architecture/data-plane/)
> - [Istio / Configure waypoint proxies](https://istio.io/latest/docs/ambient/usage/waypoint/#configure-resources-to-use-a-cross-namespace-waypoint-proxy)

<br>

### istio.io/use-waypoint-namespace

#### ▼ istio.io/use-waypoint-namespace とは

`istio.io/use-waypoint` を設定した Namespace に waypoint-proxy (Gateway API の Namespace によって決まる) が一緒にいない場合は、`istio.io/use-waypoint-namespace` で waypoint-proxy にいる Namespace を指定する必要がある。

例えば、`app` で Gateway と istio-waypoint を作成している場合、waypoint-proxy を使用するほかの Namespace では、`istio.io/use-waypoint-namespace: app` とする。

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app
  labels:
    # Gateway の名前
    istio.io/use-waypoint: istio-waypoint
---
apiVersion: v1
kind: Namespace
metadata:
  name: istio-egress
  labels:
    # Gateway の名前
    istio.io/use-waypoint: istio-waypoint
    # app に waypoint-proxy がある
    istio.io/use-waypoint-namespace: app
---
apiVersion: v1
kind: Namespace
metadata:
  name: istio-ingress
  labels:
    # Gateway の名前
    istio.io/use-waypoint: istio-waypoint
    # app に waypoint-proxy がある
    istio.io/use-waypoint-namespace: app
```

> - [Istio Ambient Mode: Deploying Flexible Waypoint Proxies for Optimized Service Mesh \| Solo.io](https://www.solo.io/blog/istio-ambient-waypoint-proxy-deployment-model-explained)
> - [Istio / Configure waypoint proxies](https://istio.io/latest/docs/ambient/usage/waypoint/#configure-resources-to-use-a-cross-namespace-waypoint-proxy)

<br>

### istio.io/waypoint-for

#### ▼ istio.io/waypoint-for とは

waypoint-proxy の宛先とする Kubernetes リソースを設定する。

- `service` (Service)
- `workload` (Pod、Virtual Machine)
- `all` (Service、Pod、Virtual Machine)
- `none` (無効にする)

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  labels:
    istio.io/waypoint-for: service
  name: istio-waypoint
spec:
  gatewayClassName: istio-waypoint
  listeners:
    - name: tcp-ztunnel
      port: 15008
      protocol: HBONE
      allowedRoutes:
        namespaces:
          from: All
```

<br>

## 02. Pod の `.metadata.annotations` キー

### annotations とは

Deployment の `.spec.template` キーや、Pod の `.metadata.` キーにて、istio-proxy ごとのオプション値を設定する。Deployment の `.metadata.` キーで定義しないように注意する。

> - [Istio / Resource Annotations](https://istio.io/latest/docs/reference/config/annotations/)

<br>

### istio.io/rev

Pod にインジェクションされた Istio のリビジョンを表す。

このアノテーションは Istio が自動的に設定するため、ユーザーが設定する必要はない。リビジョンを選択する場合は、Namespace または Pod の `.metadata.labels.istio.io/rev` キーを使用する。

<br>

### proxy.istio.io/config

#### ▼ proxy.istio.io/config とは

istio-proxy の `envoy` プロセスの設定値を上書きし、ユーザー定義の値を設定する。

これを使用するよりは、Istiod コントロールプレーンの `.meshConfig.defaultConfig` キーや ProxyConfig の `.spec.environmentVariables` キーを使用したほうがいいかもしれない。

ProxyConfig が最優先であり、これらの設定はマージされる。

`.meshConfig.defaultConfig` キーにデフォルト値を設定しておき、ProxyConfig で Namespace やマイクロサービス Pod ごとに上書きするのがよい。

#### ▼ configPath

デフォルトでは、`/etc/istio/proxy` ディレクトリ配下に最終的な設定値ファイルを作成する。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment # もしくは Pod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
  template:
    metadata:
      annotations:
        proxy.istio.io/config: |
          configPath: /etc/istio/proxy
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig)

#### ▼ drainDuration

![pod_terminating_process_istio-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pod_terminating_process_istio-proxy.png)

デフォルト値は `45s` (45 秒) である。

istio-proxy 内の Envoy プロセスは、リスナーやフィルターチェーンの変更時にドレイン処理を実施する。

既存通信を変更前の構成、新規通信を変更後の構成で処理し、既存通信の完了を待機する時間を設定する。

Envoy の `--drain-time-s` オプションに相当する。

設定した時間が短過ぎると、処理中の接続を終了することなく、強制的に切断してしまう。

`MINIMUM_DRAIN_DURATION` は Envoy プロセスの終了時の最小待機時間であり、リスナーやフィルターチェーンの変更時の待機時間とは異なる。

似た設定の `terminationDrainDuration` は、istio-proxy の終了時のドレイン処理時間である。

```yaml
apiVersion: apps/v1
kind: Deployment # もしくは Pod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
  template:
    metadata:
      annotations:
        proxy.istio.io/config: |
          drainDuration: "10s"
```

> - [ABEMA における GKE スケール戦略と Anthos Service Mesh 活用事例 Deep Dive - Speaker Deck](https://speakerdeck.com/nagapad/abema-niokeru-gke-scale-zhan-lue-to-anthos-service-mesh-huo-yong-shi-li-deep-dive?slide=80)
> - [terminate envoy when number of active connections is zero by ramaraochavali · Pull Request #35059 · istio/istio · GitHub](https://github.com/istio/istio/pull/35059#discussion_r711500175)

#### ▼ parentShutdownDuration

執筆時点 (2023/10/31) ですでに廃止されている。

istio-proxy 上の Envoy の親プロセスを終了するまでに待機する時間を設定する。

Pod の `.metadata.annotations.proxy.istio.io/config.terminationDrainDuration` キーよりも、最低 `5` 秒以上長くするとよい。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment # もしくは Pod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
  template:
    metadata:
      annotations:
        proxy.istio.io/config: |
          parentShutdownDuration: "80s"
```

> - [IstioのparentShutdownDurationが削除されていた話](https://zenn.dev/yatoum/articles/d927c58d74ff05)
> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig)
> - [Command line options — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/operations/cli#cmdoption-parent-shutdown-time-s)
> - [KubernetesのPodを安全に終了する（istio-proxy編） - Carpe Diem](https://christina04.hatenablog.com/entry/k8s-graceful-stop-with-istio-proxy)

#### ▼ terminationDrainDuration

デフォルト値は `5s` (5 秒) である (ConfigMap の `mesh.defaultConfig.proxyMetadata.MINIMUM_DRAIN_DURATION` キーと同じ) 。

`EXIT_ON_ZERO_ACTIVE_CONNECTIONS` 変数が `false` な場合にのみ設定できる。

`true` の場合は、代わりに ConfigMap の `mesh.defaultConfig.proxyMetadata` で `MINIMUM_DRAIN_DURATION` 変数と `EXIT_ON_ZERO_ACTIVE_CONNECTIONS` 変数を設定する。

istio-proxy 内の Envoy プロセスは、終了時に接続のドレイン処理を実施する。

この接続のドレイン処理時間を設定する。

似た設定の `drainDuration` は、Envoy のリスナーやフィルターチェーンを変更した際に、ドレイン処理が終わるまで待機する時間である。

**＊実装例＊**

Envoy プロセスの接続のドレイン処理 `5` 秒間に実施する。

```yaml
apiVersion: apps/v1
kind: Deployment # もしくは Pod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
  template:
    metadata:
      annotations:
        proxy.istio.io/config: |
          terminationDrainDuration: "5s"
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig)
> - [Command line options — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/operations/cli#cmdoption-drain-time-s)
> - [KubernetesのPodを安全に終了する（istio-proxy編） - Carpe Diem](https://christina04.hatenablog.com/entry/k8s-graceful-stop-with-istio-proxy)

<br>

### traffic.sidecar.istio.io/excludeInboundPorts、traffic.sidecar.istio.io/excludeOutboundPorts

特定のポート番号に対するインバウンド通信／アウトバウンド通信を、istio-iptables が istio-proxy へリダイレクトしないようにする。

例えば、Pod 間でレプリケーション通信をする場合 (例：Keycloak クラスター、Redis クラスターなど) 、istio-proxy を経由する必要はない。

```yaml
apiVersion: apps/v1
kind: Deployment # もしくは Pod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
  template:
    metadata:
      annotations:
        traffic.sidecar.istio.io/excludeInboundPorts: "7800"
        traffic.sidecar.istio.io/excludeOutboundPorts: "7800"
```

<br>

### sidecar.istio.io/inject

特定の Pod (例：DB) にサイドカーを注入するか否かを設定する。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment # もしくは Pod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
  template:
    metadata:
      annotations:
        sidecar.istio.io/inject: "false"
```

> - [Istio / Installing the Sidecar](https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#controlling-the-injection-policy)

<br>

### sidecar.istio.io/proxyCPU

istio-proxy で使用する CPU サイズを設定する。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment # もしくは Pod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
  template:
    metadata:
      annotations:
        sidecar.istio.io/proxyCPU: 2
```

> - [Istio / Resource Annotations](https://istio.io/latest/docs/reference/config/annotations/)

<br>

### sidecar.istio.io/proxyImage

istio-proxy の作成に使用するコンテナイメージを設定する。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment # もしくは Pod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
  template:
    metadata:
      annotations:
        sidecar.istio.io/proxyImage: foo-envoy
```

> - [Istio / Resource Annotations](https://istio.io/latest/docs/reference/config/annotations/)

<br>

### sidecar.istio.io/proxyMemory

istio-proxy で使用するメモリサイズを設定する。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment # もしくは Pod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
  template:
    metadata:
      annotations:
        sidecar.istio.io/proxyMemory: 4
```

> - [Istio / Resource Annotations](https://istio.io/latest/docs/reference/config/annotations/)

<br>
