---
title: 【IT技術の知見】データプレーン＠Istioアンビエント
description: データプレーン＠Istioアンビエントの知見を記録しています。
---

# データプレーン＠Istioアンビエント

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. アンビエントモードのデータプレーンの仕組み

![istio_ambient-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_architecture.png)

アンビエントモードは、データプレーン、コントロールプレーンNode、といったコンポーネントから構成される。Node内の単一プロキシを使用して、サービスメッシュを実装する。

マイクロサービスアーキテクチャ固有のインフラ領域の問題 (例：サービス検出の必要性、パケットのアプリケーションデータの暗号化、テレメトリー作成など) を解決する責務を持つ。

Node外からのインバウンド通信、またNode外へのアウトバウンド通信は、ztunnel Podを経由して、一度waypoint-proxy Podにリダイレクトされる。

サイドカーモードを将来的に廃止するということはなく、好きな方を選べるようにするらしい。

ztunnel Podを経由した段階でHTTPSプロトコルになる。

ハードウェアリソースの消費量の少ない`L4`プロトコルと、消費量の多い`L7`プロトコルのプロコトルの処理の責務が分離されているため、サイドカーモードと比較して、`L4`プロトコルのみを処理する場合、Nodeのハードウェアリソース消費量を節約できる。

サービスメッシュ内へのリクエストの経路は以下の通りである。

```yaml
パブリックネットワーク
⬇⬆️︎
リダイレクト
⬇⬆️︎
# L4ロードバランサー
ztunnel Pod (L4) # DaemonSet配下のPodなので、Nodeごとにいる
⬇⬆️︎
⬇⬆️︎ # HBONE
⬇⬆️︎
# L7ロードバランサー
waypoint-proxy Pod (L7) # Deployment配下のPodなので、任意のNodeにいる
⬇⬆️︎
マイクロサービスのPod
```

サービスメッシュ内のリクエストの経路は以下の通りである。

```yaml
マイクロサービスのPod # 送信元
⬇⬆️︎
# L4ロードバランサー
ztunnel Pod (L4) # DaemonSet配下のPodなので、Nodeごとにいる
⬇⬆️︎
⬇⬆️︎ # HBONE
⬇⬆️︎
# L7ロードバランサー
waypoint-proxy Pod (L7) # Deployment配下のPodなので、任意のNodeにいる
⬇⬆️︎
⬇⬆️︎ # HBONE
⬇⬆️︎
# L4ロードバランサー
ztunnel Pod (L4) # DaemonSet配下のPodなので、Nodeごとにいる
⬇⬆️︎
マイクロサービスのPod # 宛先
```

サービスメッシュ外へのリクエストの経路は以下の通りである。

```yaml
パブリックネットワーク
⬆️⬇
# L7ロードバランサー
waypoint-proxy Pod (L7) # Deployment配下なので、任意のNodeにいる
⬆️⬇
⬆️⬇ # HBONE
⬆️⬇
# L4ロードバランサー
ztunnel Pod (L4) # DaemonSet配下なので、Nodeごとにいる
⬆️⬇
リダイレクト
⬆️⬇
マイクロサービスのPod
```

> - https://istio.io/latest/blog/2022/introducing-ambient-mesh/
> - https://istio.io/latest/blog/2022/get-started-ambient/#install-istio-with-ambient-mode
> - https://github.com/istio/istio/blob/experimental-ambient/manifests/charts/istio-control/istio-discovery/files/waypoint.yaml
> - https://www.sobyte.net/post/2022-09/istio-ambient/
> - https://www.zhaohuabing.com/post/2022-09-08-introducing-ambient-mesh/
> - https://blog.howardjohn.info/posts/ambient-not-node-proxy/

<br>

## 02. データプレーンの要素

### istio-cni

#### ▼ istio-cniとは

実体は、DaemonSetとして稼働する。

`kube-system`のNamespaceにおき、PriorityClassを`system-node-critical`とすることが推奨である。

istio-cniは、`/var/run/ztunnel/ztunnel.sock`ファイル経由でztunnelから接続される。

そのため、istio-cniはztunnelと同じNode上に作成する必要がある (Namespaceは違っていても良い) 。

#### ▼ 仕組み

以下を設定し、`L4`インバウンド通信とアウトバウンド通信をztunnel Podへリダイレクトできるようにする。

- Nodeのiptables
- ztunnel Podのiptables
- geneve tunnel

また、ztunnelが受信ポートを公開するように、通知する。

注意点として、Ciliumはiptableの代わりにeBPFを使用する。

> - https://sreake.com/blog/istio-ambient-mesh-inpod-redirection/#inpod_redirection_%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3
> - https://www.solo.io/blog/traffic-ambient-mesh-istio-cni-node-configuration
> - https://www.rfc-editor.org/rfc/rfc8926.html
> - https://www.reddit.com/r/kubernetes/comments/1cygujm/comment/l59qh64/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

#### ▼ Google Cloud Meshに関して

Google Cloud Meshでは、istio-cniのロジックがGKEに統合されており、istio-cniが存在しない。

代わりに、NEGなどを使用する。

> - https://cloud.google.com/blog/products/containers-kubernetes/container-native-load-balancing-on-gke-now-generally-available?hl=en

<br>

### ztunnel

#### ▼ ztunnelとは

サービスメッシュ内の`L4`トラフィックを管理する。

実体はDaemonSet配下のPodであり、Nodeごとにスケジューリングされている。

ztunnel Podは、`/var/run/ztunnel/ztunnel.sock`ファイル経由でistio-cniに接続する。

そのため、ztunnel Podはistio-cniと同じNode上に作成する必要がある (Namespaceは違っていても良い) 。

> - https://github.com/istio/istio/wiki/Troubleshooting-Istio-Ambient#scenario-pod-fails-to-run-with-failed-to-create-pod-sandbox

#### ▼ 新しい仕組み (inpod redirection)

ztunnelへのリダイレクトの仕組みは一度リプレイスされている。

新しい仕組みでは、サイドカーパターンでマイクロサービスからの通信がistio-proxyにリダイレクトされるのと同じような仕組みになっている。

![istio_ambient-mesh_ztunnel_inpod-redirection_l4_overview](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_ztunnel_inpod-redirection_l4_overview.png)

アウトバウンド通信の仕組みは以下の通りである。

1. Pod内マイクロサービスが`L4`アウトバウンド通信を送信する。
2. Pod内iptablesが通信をztunnel Podにリダイレクトする。
3. ztunnel Podは通信を宛先に送信する。

一方で、インバウンド通信の仕組みは以下の通りである。

1. Podが`L4`インバウンド通信を受信する。
2. Pod内iptablesが通信をztunnel Podにリダイレクトする。
3. Pod内マイクロサービスが`L4`アウトバウンド通信を受信する。

![istio_ambient-mesh_ztunnel_inpod-redirection_l4_detail](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_ztunnel_inpod-redirection_l4_detail.png)

> - https://www.solo.io/blog/istio-ambient-mesh-any-cni
> - https://medium.com/@Nick_Chekushkin/implementation-and-benefits-of-istio-ambient-mesh-optimizing-resources-and-improving-security-in-189ce4bad313
> - https://imesh.ai/blog/istio-ambient-install-eks/

#### ▼ 古い仕組み

ztunnelへのリダイレクトの仕組みは一度リプレイスされている。

新しい仕組みは『inpod redirection』と呼ばれている。

> - https://www.solo.io/blog/istio-ambient-mesh-any-cni
> - https://www.solo.io/blog/traffic-ambient-mesh-redirection-iptables-geneve-tunnels
> - https://www.solo.io/blog/traffic-ambient-mesh-ztunnel-ebpf-waypoint

<br>

### waypoint-proxy

#### ▼ waypoint-proxyとは

サービスメッシュ内の`L7`トラフィックを管理する。

実体は、Gateway-APIで作成されたistio-proxyを含むPodである。

```yaml
$ istioctl experimental waypoint generate
---
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: foo
spec:
  gatewayClassName: istio-waypoint
  listeners:
    - name: mesh
      port: 15008
      protocol: HBONE
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    istio.io/waypoint-for: service
  name: istio-waypoint
  namespace: app
spec:
  containers:
    - args:
        - proxy
        - waypoint
        - --domain
        - $(POD_NAMESPACE).svc.cluster.local
        - --serviceCluster
        - istio-waypoint.$(POD_NAMESPACE)
        - --proxyLogLevel
        - warning
        - --proxyComponentLogLevel
        - misc:error
        - --log_output_level
        - default:info
      env:
        - name: ISTIO_META_SERVICE_ACCOUNT
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: spec.serviceAccountName
        - name: ISTIO_META_NODE_NAME
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: spec.nodeName
        - name: PILOT_CERT_PROVIDER
          value: istiod
        - name: CA_ADDR
          value: istiod-1-24-2.istio-system.svc:15012
        - name: POD_NAME
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: metadata.namespace
        - name: INSTANCE_IP
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: status.podIP
        - name: SERVICE_ACCOUNT
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: spec.serviceAccountName
        - name: HOST_IP
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: status.hostIP
        - name: ISTIO_CPU_LIMIT
          valueFrom:
            resourceFieldRef:
              divisor: "0"
              resource: limits.cpu
        - name: PROXY_CONFIG
          value: |
            {"discoveryAddress":"istiod-1-24-2.istio-system.svc:15012","holdApplicationUntilProxyStarts":true}
        - name: GOMEMLIMIT
          valueFrom:
            resourceFieldRef:
              divisor: "0"
              resource: limits.memory
        - name: GOMAXPROCS
          valueFrom:
            resourceFieldRef:
              divisor: "0"
              resource: limits.cpu
        - name: ISTIO_META_CLUSTER_ID
          value: Kubernetes
        - name: ISTIO_META_INTERCEPTION_MODE
          value: REDIRECT
        - name: ISTIO_META_WORKLOAD_NAME
          value: istio-waypoint
        - name: ISTIO_META_OWNER
          value: kubernetes://apis/apps/v1/namespaces/app/deployments/istio-waypoint
        - name: ISTIO_META_MESH_ID
          value: cluster.local
      image: docker.io/istio/proxyv2:1.24.2
      imagePullPolicy: IfNotPresent
      # istio-proxy
      name: istio-proxy
      ports:
        - containerPort: 15020
          name: metrics
          protocol: TCP
        - containerPort: 15021
          name: status-port
          protocol: TCP
        - containerPort: 15090
          name: http-envoy-prom
          protocol: TCP
      readinessProbe:
        failureThreshold: 4
        httpGet:
          path: /healthz/ready
          port: 15021
          scheme: HTTP
        periodSeconds: 15
        successThreshold: 1
        timeoutSeconds: 1
      resources:
        limits:
          cpu: "2"
          memory: 1Gi
        requests:
          cpu: 100m
          memory: 128Mi
      securityContext:
        allowPrivilegeEscalation: false
        capabilities:
          drop:
            - ALL
        privileged: false
        readOnlyRootFilesystem: true
        runAsGroup: 1337
        runAsNonRoot: true
        runAsUser: 1337
      startupProbe:
        failureThreshold: 30
        httpGet:
          path: /healthz/ready
          port: 15021
          scheme: HTTP
        initialDelaySeconds: 1
        periodSeconds: 1
        successThreshold: 1
        timeoutSeconds: 1
      terminationMessagePath: /dev/termination-log
      terminationMessagePolicy: File
      volumeMounts:
        - mountPath: /var/run/secrets/workload-spiffe-uds
          name: workload-socket
        - mountPath: /var/run/secrets/istio
          name: istiod-ca-cert
        - mountPath: /var/lib/istio/data
          name: istio-data
        - mountPath: /etc/istio/proxy
          name: istio-envoy
        - mountPath: /var/run/secrets/tokens
          name: istio-token
        - mountPath: /etc/istio/pod
          name: istio-podinfo
        - mountPath: /var/run/secrets/kubernetes.io/serviceaccount
          name: kube-api-access-rttpm
          readOnly: true
  dnsPolicy: ClusterFirst
  enableServiceLinks: true
  nodeName: foo-m06
  preemptionPolicy: PreemptLowerPriority
  priority: 0
  restartPolicy: Always
  schedulerName: default-scheduler
  securityContext: {}
  serviceAccount: istio-waypoint
  serviceAccountName: istio-waypoint
  terminationGracePeriodSeconds: 2
  tolerations:
    - effect: NoExecute
      key: node.kubernetes.io/not-ready
      operator: Exists
      tolerationSeconds: 300
    - effect: NoExecute
      key: node.kubernetes.io/unreachable
      operator: Exists
      tolerationSeconds: 300
  volumes:
    - emptyDir: {}
      name: workload-socket
    - emptyDir:
        medium: Memory
      name: istio-envoy
    - emptyDir:
        medium: Memory
      name: go-proxy-envoy
    - emptyDir: {}
      name: istio-data
    - emptyDir: {}
      name: go-proxy-data
    - downwardAPI:
        defaultMode: 420
        items:
          - fieldRef:
              apiVersion: v1
              fieldPath: metadata.labels
            path: labels
          - fieldRef:
              apiVersion: v1
              fieldPath: metadata.annotations
            path: annotations
      name: istio-podinfo
    - name: istio-token
      projected:
        defaultMode: 420
        sources:
          - serviceAccountToken:
              audience: istio-ca
              expirationSeconds: 43200
              path: istio-token
    - configMap:
        defaultMode: 420
        name: istio-ca-root-cert
      name: istiod-ca-cert
    - name: kube-api-access-rttpm
      projected:
        defaultMode: 420
        sources:
          - serviceAccountToken:
              expirationSeconds: 3607
              path: token
          - configMap:
              items:
                - key: ca.crt
                  path: ca.crt
              name: kube-root-ca.crt
          - downwardAPI:
              items:
                - fieldRef:
                    apiVersion: v1
                    fieldPath: metadata.namespace
                  path: namespace
```

#### ▼ 仕組み

Namespace外からの`L7`インバウンド通信をHBORNを経由して受信し、Namespace内の宛先Podに送信する。

waypoint-proxyは、サービス検出により宛先情報を取得し、また証明書を管理する。

![istio_ambient-mesh_waypoint-proxy_inpod-redirection_l7_overview](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_waypoint-proxy_inpod-redirection_l7_overview.png)

> - https://www.anyflow.net/sw-engineer/istio-ambient-mode

#### ▼ NamespaceかつNodeのリバースプロキシとして

waypoint-proxyは、NamespaceかつNodeのリバースプロキシである。

アウトバウンド通信には関与せず、宛先リバースプロキシとしてのみ機能する。

マイクロサービスPodがいるNamespace単位でwaypoint-proxyを作成すると良い。

また、マイクロサービスPodが乗りうるNode（またはNodeグループ）に最低一個ずつスケジューリングするよう、waypoint-proxy Podを冗長化しつつAffinityを設定するとよい

![istio_ambient-mesh_waypoint-proxy_reverse-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_waypoint-proxy_reverse-proxy.png)

> - https://www.solo.io/blog/traffic-ambient-mesh-ztunnel-ebpf-waypoint

<br>

## 03. 各機能の仕組み

### 分散トレース

アンビエントメッシュでは、waypoint-proxy Podがスパンを作成する。

送信元からリクエストを受信したwaypoint-proxy Podは、宛先へのリクエスト送信からレスポンス受信までの処理時間を計測する。

waypoint-proxy Pod上で記録したタイムスタンプを集計し、A-C（トレースに相当）、A-B（スパンに相当）、B-C（スパンに相当）の処理時間を計測する。

サイドカーモードとアンビエントモードでも、マイクロサービスから最初のプロキシまでの通信時間を計測できない問題はある。

ただし、サイドカーモードの「送信元マイクロサービスコンテナ ⇄ 送信元istio-proxy」とアンビエントモードの「送信元マイクロサービスのPod ⇄ waypoint-proxy Pod」を比較して、サイドカーモードの方が通信時間の欠損が無視できるほど短く、より適していると言えそう。

```yaml
マイクロサービスAのPod
⬇⬆︎
ztunnel (L4)
⬇⬆︎
⬇⬆︎ # HBONE
⬇⬆︎
waypoint-proxy Pod (L7) # タイムスタンプ
⬇⬆︎
⬇⬆︎ # HBONE
⬇⬆︎
ztunnel (L4)
⬇⬆︎
マイクロサービスBのPod
⬇⬆︎
ztunnel (L4)
⬇⬆︎
⬇⬆︎ # HBONE
⬇⬆︎
waypoint-proxy (L7) # タイムスタンプ
⬇⬆︎
⬇⬆︎ # HBONE
⬇⬆︎
ztunnel (L4)
⬇⬆︎
マイクロサービスCのPod
```

> - https://ambientmesh.io/docs/observability/tracing/

<br>
