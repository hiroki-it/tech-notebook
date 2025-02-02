---
title: 【IT技術の知見】メタデータ＠Istio
description: メタデータ＠Istioの知見を記録しています。
---

# メタデータ＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Namespaceの`.metadata.labels`キー

### istio-injection

指定したNamespaceに所属するPod内に`istio-proxy`コンテナを自動的にインジェクションするか否かを設定する。

`.metadata.labels.istio.io/rev`キーとはコンフリクトを発生させるため、どちらかしか使えない (`.metadata.labels.istio-injection`キーの値が`disabled`の場合は共存できる) 。

`.metadata.labels.istio-injection`キーを使用する場合、Istioのアップグレードがインプレース方式になる。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app
  labels:
    istio-injection: enabled
```

アプリケーション以外のNamespaceでは`disabled`値を設定することが多い。

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: observability
  labels:
    istio-injection: disabled # disabledであれば、istio.io/revキーと共存できる。
---
apiVersion: v1
kind: Namespace
metadata:
  name: chaos-mesh
  labels:
    istio-injection: disabled # disabledであれば、istio.io/revキーと共存できる。
```

> - https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#controlling-the-injection-policy

<br>

### istio.io/rev

指定したNamespaceに所属するPod内に`istio-proxy`コンテナを自動的にインジェクションするか否かを設定する。

IstoOperatorの`.spec.revision`キーと同じである。

`.metadata.labels.istio-injection`キーとはコンフリクトを発生させるため、どちらかしか使えない (`.metadata.labels.istio-injection`キーの値が`disabled`の場合は共存できる) 。

`.metadata.labels.istio.io/rev`キーを使用する場合、Istioのアップグレードがカナリア方式になる。

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
    istio-injection: disabled # disabledであれば、istio.io/revキーと共存できる。
---
apiVersion: v1
kind: Namespace
metadata:
  name: chaos-mesh
  labels:
    istio-injection: disabled # disabledであれば、istio.io/revキーと共存できる。
```

> - https://istio.io/latest/blog/2021/direct-upgrade/#upgrade-from-18-to-110

<br>

### istio.io/use-waypoint

アンビエントモードの場合に、設定したNamespaceでサービスメッシュの管理を有効化する。

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
  labels:
    istio.io/dataplane-mode: ambient
---
apiVersion: v1
kind: Namespace
metadata:
  name: istio-ingress
  labels:
    istio.io/dataplane-mode: ambient
```

<br>

### istio.io/use-waypoint

アンビエントモードの場合に、設定したNamespaceでWaypointを有効化する。

Waypointと紐づくGateway名 (Gateway API) を指定する。

このラベルがついているNamespaceのみで、`L7`がWaypointにリダイレクトされる。

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app
  labels:
    istio.io/use-waypoint: istio-waypoint-ingress
---
apiVersion: v1
kind: Namespace
metadata:
  name: istio-egress
  labels:
    istio.io/use-waypoint: istio-waypoint-egress
---
apiVersion: v1
kind: Namespace
metadata:
  name: istio-ingress
  labels:
    istio.io/use-waypoint: istio-waypoint-ingress
```

<br>

## 02. Podの`.metadata.annotations`キー

### annotationsとは

Deploymentの`.spec.template`キーや、Podの`.metadata.`キーにて、`istio-proxy`コンテナごとのオプション値を設定する。Deploymentの`.metadata.`キーで定義しないように注意する。

> - https://istio.io/latest/docs/reference/config/annotations/

<br>

### istio.io/rev

IstoOperatorの`.spec.revision`キーと同じ。

特定のPodで、Istioとこれのカナリアリリースを有効化するか否かを設定する。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
  template:
    metadata:
      annotations:
        istio.io/rev: 1-10-0
```

<br>

### proxy.istio.io

#### ▼ proxy.istio.ioとは

`istio-proxy`コンテナの`envoy`プロセスの設定値を上書きし、ユーザー定義の値を設定する。

#### ▼ configPath

デフォルトでは、`./etc/istio/proxy`ディレクトリ配下に最終的な設定値ファイルを作成する。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
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
          configPath: ./etc/istio/proxy
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig

#### ▼ parentShutdownDuration

`istio-proxy`コンテナ上のEnvoyの親プロセスを終了するまでに待機する時間を設定する。

`istio-proxy`コンテナ自体の終了タイミングを決める`terminationDrainDuration`キーよりも、最低`5`秒以上長くすると良い。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
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

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig
> - https://www.envoyproxy.io/docs/envoy/latest/operations/cli#cmdoption-parent-shutdown-time-s
> - https://christina04.hatenablog.com/entry/k8s-graceful-stop-with-istio-proxy

#### ▼ terminationDrainDuration

SIGKILLシグナルを`istio-proxy`コンテナに送信するまでに待機する時間を設定する。

この待機時間を経た後に、SIGKILLシグナルを`istio-proxy`コンテナに送信する。

時間が長すぎると、`istio-proxy`コンテナの終了に必要な時間が長くなり、Deploymentのローリングアップデートに必要以上に時間がかかってしまう。

時間が短すぎると、Envoyが終了するのを待たずに`istio-proxy`コンテナが終了してしまうため、Envoyがエラーになってしまう。

**＊実装例＊**

`istio-proxy`コンテナを`75`秒後に終了し始める。

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
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
          terminationDrainDuration: "75s"
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig
> - https://www.envoyproxy.io/docs/envoy/latest/operations/cli#cmdoption-drain-time-s
> - https://christina04.hatenablog.com/entry/k8s-graceful-stop-with-istio-proxy

<br>

### sidecar.istio.io/inject

特定のPod (例：DB) にサイドカーを注入するか否かを設定する。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
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

> - https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#controlling-the-injection-policy

<br>

### sidecar.istio.io/proxyCPU

`istio-proxy`コンテナで使用するCPUサイズを設定する。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
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

> - https://istio.io/latest/docs/reference/config/annotations/

<br>

### sidecar.istio.io/proxyImage

`istio-proxy`コンテナの作成に使用するコンテナイメージを設定する。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
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

> - https://istio.io/latest/docs/reference/config/annotations/

<br>

### sidecar.istio.io/proxyMemory

`istio-proxy`コンテナで使用するメモリサイズを設定する。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
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

> - https://istio.io/latest/docs/reference/config/annotations/

<br>
