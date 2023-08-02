---
title: 【IT技術の知見】コマンド＠Istio
description: コマンド＠Istioの知見を記録しています。
---

# コマンド＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## セットアップ

### インストール

#### ▼ バイナリとして

```bash
$ brew install istioctl
```

#### ▼ チャートとして

`(1)`

: インストール先のディレクトリに移動する。

```bash
$ cd /Users/hiroki.hasegawa/projects
```

`(2)`

: `istioctl`コマンドをインストールする。

```bash
$ curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.12.1 - sh
```

`(3)`

: `istioctl`コマンドへのパスを環境変数に登録する。

```bash
$ cd istio-1.12.1
$ export PATH=$PWD/bin:$PATH
```

> - https://istio.io/latest/docs/setup/getting-started/#download

<br>

### プロファイル

#### ▼ プロファイルとは

Istioの機能のセットを提供する。

実際には設定済みのIstioOperatorであり、`istioctl`コマンドのインストール時に`manifests`ディレクトリ以下に配置される。

> - https://istio.io/latest/docs/setup/additional-setup/config-profiles/

#### ▼ プロファイルの種類

| ユースケース         | default  |   demo   |                 empty                 | external |       minimal        | openshift | preview | remote |
| :------------------- | :------: | :------: | :-----------------------------------: | :------: | :------------------: | :-------: | :-----: | :----: |
| 概要                 | 本番環境 | 開発環境 | Istioリソースを全てカスタマイズしたい |   なし   | 最小限の機能が欲しい |    ？     |  なし   |   ？   |
| istio-egressgateway  |   なし   |    ✅    |                 なし                  |   なし   |         なし         |    ？     |  なし   |   ？   |
| istio-ingressgateway |    ✅    |    ✅    |                 なし                  |   なし   |         なし         |    ？     |   ✅    |   ？   |
| istiod               |    ✅    |    ✅    |                 なし                  |   なし   |          ✅          |    ？     |   ✅    |   ？   |

> - https://github.com/istio/istio/tree/master/manifests/profiles
> - https://atmarkit.itmedia.co.jp/ait/articles/2111/05/news005.html
> - https://betterprogramming.pub/getting-started-with-istio-on-kubernetes-e582800121ea

<br>

## analyze

### analyzeとは

Istioが正しく動作しているか否かを検証する。

> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-analyze

成功した場合を以下に示す。

```bash
$ istioctl analyze

✅ No validation issues found when analyzing namespace: default.
```

失敗した場合を以下に示す。

```bash
$ istioctl analyze

Info [IST0118] (Service default/foo-service) Port name (port: 80, targetPort: 80) doesn't follow the naming convention of Istio port.
```

<br>

### -n

Namespaceを指定しつつ、`analyze`コマンドを実行する。

```bash
$ istioctl analyze -n <Namespace名>
```

<br>

## uninstall

### オプション

#### ▼ --purge

Istioリソースを全てdestroyする。

```bash
$ istioctl x uninstall --purge
```

<br>

## install

### installとは

プロファイルをインストールし、加えて設定値を変更する。

> - https://istio.io/latest/docs/setup/install/istioctl/

<br>

### -f

IstioOperatorのマニフェストを送信し、Kubernetesリソースを作成する。

```bash
$ istioctl install -y -f ./istio-operator.yaml
```

> - https://istio.io/latest/docs/setup/install/istioctl/#install-istio-using-the-default-profile

<br>

### --set

#### ▼ --setとは

インストールするもの、または変更する項目を指定する。

#### ▼ `meshConfig.accessLogFile`

IstioOperatorを使用して、アクセスログの出力先を標準出力に変更する。

```bash
$ istioctl install -y --set meshConfig.accessLogFile=/dev/stdout
```

#### ▼ `profile`

指定したプロファイルをインストールする。

```bash
$ istioctl install -y --set profile=demo
```

> - https://istio.io/latest/docs/setup/additional-setup/config-profiles/

#### ▼ `revision` (基本的に必須)

インストールされるKubernetesリソース名や、`.metadata.labels.istio.io/rev`キーにリビジョン番号をつけて、Istioをインストールする。

バージョンは、ケバブケースで設定する必要がある。

```bash
$ istioctl install -y --set revision=1-10-0
```

カナリアアップグレード時に使用するが、このオプションを使用しないとKubernetesリソース名にリビジョン番号がつかないため、インストール時にも使用した方が良い。

```bash
# revisionオプションを使用しない場合
$ istioctl install -y

# Kubernetesリソース名にリビジョン番号がつかない
$ kubectl get mutatingwebhookconfiguration

NAME                              WEBHOOKS   AGE
istio-revision-tag-default        4          15s
istio-sidecar-injector            4          23s
```

インストールするIstioは`istioctl`コマンドのバージョンで決まるため、`revision`キーのリビジョン番号と実際にインストールするIstioのバージョンは無関係である。

執筆時点 (2023/02/23) で、`istioctl`コマンドを使用してエイリアスを設定する方法はなく、自動的に`default`になってしまう。

```bash
$ kubectl get mutatingwebhookconfiguration
NAME                              WEBHOOKS   AGE
istio-revision-tag-default        4          9m52s
istio-sidecar-injector-1-10-0     2          9m58s

$ kubectl get mutatingwebhookconfiguration istio-revision-tag-default -o yaml \
    | grep -e rev: -e tag:

istio.io/rev: 1-10-0
istio.io/tag: default

$ kubectl get mutatingwebhookconfiguration istio-sidecar-injector-1-10-0 -o yaml \
    | grep -e rev:

istio.io/rev: 1-10-0
```

```bash
kubectl get all -n istio-system
NAME                                        READY   STATUS    RESTARTS   AGE
pod/istio-ingressgateway-*****              1/1     Running   0          35m
pod/istiod-1-10-0-*****                     1/1     Running   0          35m


NAME                           TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)                                      AGE
service/istio-ingressgateway   LoadBalancer   10.101.23.65    <pending>     15021:30540/TCP,80:30543/TCP,443:31929/TCP   35m
service/istiod-1-10-0          ClusterIP      10.105.88.224   <none>        15010/TCP,15012/TCP,443/TCP,15014/TCP        35m


NAME                                   READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/istio-ingressgateway   1/1     1            1           35m
deployment.apps/istiod-1-10-0          1/1     1            1           35m


NAME                                              DESIRED   CURRENT   READY   AGE
replicaset.apps/istio-ingressgateway-*****        1         1         1       35m
replicaset.apps/istiod-1-10-0-*****               1         1         1       35m


NAME                                                       REFERENCE                         TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
horizontalpodautoscaler.autoscaling/istio-ingressgateway   Deployment/istio-ingressgateway   <unknown>/80%   1         5         1          35m
horizontalpodautoscaler.autoscaling/istiod-1-10-0          Deployment/istiod-1-10-0          <unknown>/80%   1         5         1          35m
```

- https://istio.io/latest/docs/setup/upgrade/canary/#control-plane

<br>

## kube-inject

### kube-injectとは

`istio-proxy`コンテナを手動でインジェクションする。

代わりに、`enabled`値が割り当てられた`.metadata.labels,istio-injection`キーをNamespaceに付与しても良い。

> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-kube-inject
> - https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#manual-sidecar-injection

<br>

### -f

指定したマニフェストのPodに`istio-proxy`コンテナをインジェクションする。

```bash
$ istioctl kube-inject -f pod.yaml
```

<br>

## manifest diff

### diffとは

ymlファイルの差分を取得する。

> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-manifest-diff

```bash
$ istioctl manifest diff <変更前マニフェストへのパス> <変更後マニフェストへのパス>
```

<br>

## operator

### init

IstioOperatorを`istio-system`に作成する。

```bash
$ istioctl operator init

Installing operator controller in namespace: istio-operator using image: docker.io/istio/operator:<リビジョン番号>
Operator controller will watch namespaces: istio-system
✅ Istio operator installed
✅ Installation complete
```

<br>

## profile

### profileとは

Istioのプロファイルを操作する。

> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-profile

<br>

### list

#### ▼ listとは

利用できるプロファイルを取得する。

```bash
$ istioctl profile list

Istio configuration profiles:
    default
    demo
    empty
    external
    minimal
    openshift
    preview
    remote
```

<br>

## proxy-config

### proxy-configとは

Istio上で管理されるEnvoyの構成情報を取得する。

```bash
$ istioctl proxy-config <設定項目> <Pod名> -n <Namespace名>
```

> - https://istio.io/latest/docs/ops/diagnostic-tools/proxy-cmd/#deep-dive-into-envoy-configuration
> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-proxy-config
> - https://sreake.com/blog/istio/

<br>

### グローバルオプション

#### ▼ -o

出力形式を指定する。

`jq`コマンドや`yq`コマンドと組み合わせた方が良い。

```bash
# 返信されたYAMLから、1番目の項目だけ取得する。
$ istioctl proxy-config <設定項目> <Pod名> -n <Namespace名> -o yaml | yq
```

<br>

### all

#### ▼ allとは

Envoyの処理コンポーネントの設定を全て取得する

```bash
$ istioctl proxy-config all foo-pod \
    -n foo-namespace \
    -o yaml \
    | yq '.configs[] | keys' | sort -f
```

```yaml
- "@type"
- "@type"
- "@type"
- "@type"
- "@type"
- "@type"
- bootstrap
- dynamic_active_clusters
- dynamic_active_secrets
- dynamic_listeners
- dynamic_route_configs
- last_updated
- static_clusters
- static_listeners
- static_route_configs
- version_info
- version_info
```

<br>

### bootstrap

#### ▼ bootstrapとは

Envoyで、起動時に読み込まれる設定を取得する。

```bash
$ istioctl proxy-config bootstrap foo-pod \
    -n foo-namespace \
    -o yaml \
    | yq
```

```yaml
bootstrap:
  admin:
    accessLogPath: /dev/null
    address:
      socketAddress:
        address: 127.0.0.1
        portValue: 15000
    profilePath: /var/lib/istio/data/envoy.prof
  dynamicResources:
    adsConfig:
      apiType: GRPC
      grpcServices:
        - envoyGrpc:
            clusterName: xds-grpc
      setNodeOnFirstMessageOnly: true
      transportApiVersion: V3
    cdsConfig:
      # ADS-APIから取得した宛先情報のうち、クラスター値を設定する。
      ads: {}
      initialFetchTimeout: 0s
      resourceApiVersion: V3
    ldsConfig:
      # ADS-APIから取得した宛先情報のうち、リスナー値を設定する。
      ads: {}
      initialFetchTimeout: 0s
      resourceApiVersion: V3
  layeredRuntime: ...

  node: ...

  staticResources: ...

  statsConfig: ...

  tracing: ...

lastUpdated: "2022-11-16T08:12:07.162Z"
```

<br>

### cluster

#### ▼ clusterとは

Envoyのクラスターの静的/動的な設定値を取得する。

```bash
$ istioctl proxy-config routes <Pod名> -n <PodのNamespace名>
```

```bash
$ istioctl proxy-config cluster foo-pod -n foo-namespace

SERVICE FQDN                                  PORT                         SUBSET        DIRECTION   TYPE                DESTINATION RULE
<Serviceの完全修飾ドメイン名>                     <Serviceが待ち受けるポート番号>  <サブセット名>  <通信の方向>  <ディスカバリータイプ>  <DestinationRule名>.<Namespace名>

foo-service.foo-namespace.svc.cluster.local   50001                        v1            outbound     EDS                 foo-destination-rule.foo-namespace
bar-service.bar-namespace.svc.cluster.local   50002                        v1            outbound     EDS                 bar-destination-rule.bar-namespace
baz-service.bar-namespace.svc.cluster.local   50003                        v1            outbound     EDS                 baz-destination-rule.baz-namespace
...
```

> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-proxy-config-cluster
> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/service_discovery#supported-service-discovery-types

`yaml`形式で取得すれば、より詳細な設定値を確認できる。

```bash
$ istioctl proxy-config cluster foo-pod \
    -n foo-namespace \
    -o yaml \
    --fqdn bar-service.bar-namespace.svc.cluster.local \
    | yq
```

```yaml
# クラスター名
- name: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local
  type: EDS
  edsClusterConfig:
    edsConfig:
      # ADS-APIを使用して取得することを指定する。
      ads: {}
      initialFetchTimeout: 0s
      resourceApiVersion: V3
    # serviceNameをクラスター値として使用する。
    # エンドポイント値はクラスター値と紐づいており、ADS-APIから取得したエンドポイント値をフィルタリングする。
    # エンドポイント値にはいくつかのインスタンスが紐づいており、1個を選んでルーティングする。
    serviceName: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local
```

> - https://istio.io/latest/docs/ops/diagnostic-tools/proxy-cmd/#deep-dive-into-envoy-configuration
> - https://www.amazon.co.jp/Istio-Action-Christian-Posta/dp/1617295825

#### ▼ --fqdn

クラスターが待ち受ける完全修飾ドメイン名でフィルタリングし、クラスターを取得する。

```bash
$ istioctl proxy-config cluster foo-pod \
    -n foo-namespace \
    -o yaml \
    --fqdn foo-service.foo-namespace.svc.cluster.local \
    | yq '.[0]'
```

#### ▼ --port

クラスターが待ち受けるポート番号でフィルタリングし、クラスターを取得する。

```bash
$ istioctl proxy-config routes foo-pod \
    -n foo-namespace \
    --port 50001
```

<br>

### endpoints

#### ▼ endpointsとは

Envoyのエンドポイントの静的/動的な設定値を取得する。

```bash
$ istioctl proxy-config endpoints <Pod名> -n <PodのNamespace名>
```

```bash
$ istioctl proxy-config endpoints foo-pod -n foo-namespace

ENDPOINT                                              STATUS      OUTLIER CHECK     CLUSTER
<PodのIPアドレス>:<Pod内のコンテナが待ち受けているポート番号>  HEALTHY     OK                <紐づいているクラスター名>
10.0.0.1:80                                           HEALTHY     OK                outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local
10.0.0.2:80                                           HEALTHY     OK                outbound|50002|v1|foo-service.foo-namespace.svc.cluster.local
10.0.0.3:80                                           HEALTHY     OK                outbound|50003|v1|foo-service.foo-namespace.svc.cluster.local

...

127.0.0.1:15000                                      HEALTHY     OK                prometheus_stats
127.0.0.1:15020                                      HEALTHY     OK                agent

# Unixドメインソケットでソケットファイルを指定している。
unix://./etc/istio/proxy/SDS                         HEALTHY     OK                sds-grpc
unix://./etc/istio/proxy/XDS                         HEALTHY     OK                xds-grpc
```

> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-proxy-config-endpoint

`yaml`形式で取得すれば、より詳細な設定値を確認できる。

```bash
$ istioctl proxy-config endpoints foo-pod \
    -n foo-namespace \
    --cluster "outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local" \
    -o yaml \
    | yq
```

```yaml
# クラスター名
- name: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local
  addedViaApi: true
  observabilityName: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local
  hostStatuses:
    - address:
        socketAddress:
          # 冗長化されたbar-podのインスタンスのIPアドレス
          address: 10.0.0.1
          # bar-pod内のコンテナが待ち受けているポート番号
          portValue: 80
      locality:
        region: ap-northeast-1
        zone: ap-northeast-1a

      ...

    - address:
        socketAddress:
          # 冗長化されたbar-podのインスタンスのIPアドレス
          address: 10.0.0.2
          # bar-pod内のコンテナが待ち受けているポート番号
          portValue: 80
      locality:
        region: ap-northeast-1
        zone: ap-northeast-1c

        ...

    - address:
        socketAddress:
          # bar-podのインスタンスのIPアドレス
          address: 10.0.0.3
          # bar-pod内のコンテナが待ち受けているポート番号
          portValue: 80
      locality:
        region: ap-northeast-1
        zone: ap-northeast-1d

      ...

...
```

> - https://istio.io/latest/docs/ops/diagnostic-tools/proxy-cmd/#deep-dive-into-envoy-configuration

#### ▼ --cluster

エンドポイントに紐づくクラスター名でフィルタリングし、エンドポイントを取得する。

```bash
$ istioctl proxy-config endpoints foo-pod \
    -n foo-namespace \
    --cluster "outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local"
```

<br>

### listeners

#### ▼ listenersとは

Envoyのリスナーの静的/動的な設定値を取得する。

```bash
$ istioctl proxy-config listeners <Pod名> -n <PodのNamespace名>
```

```bash
$ istioctl proxy-config listeners foo-pod -n foo-namespace

ADDRESS               PORT                          MATCH                                 DESTINATION
<ServiceのClusterIP>  <Serviceが待ち受けるポート番号>   Trans: raw_buffer; App: http/1.1,h2c  Route: <紐づいているルート名>
<ServiceのClusterIP>  <Serviceが待ち受けるポート番号>   ALL                                   Cluster: <紐づいているクラスター名>

172.16.0.1            50001                         Trans: raw_buffer; App: http/1.1,h2c  Route: 50001
172.16.0.1            50001                         ALL                                   Cluster: outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local
172.16.0.2            50002                         Trans: raw_buffer; App: http/1.1,h2c  Route: 50002
172.16.0.2            50002                         ALL                                   Cluster: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local
172.16.0.3            50003                         Trans: raw_buffer; App: http/1.1,h2c  Route: 50003
172.16.0.3            50003                         ALL                                   Cluster: outbound|50003|v1|baz-service.baz-namespace.svc.cluster.local
```

> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-proxy-config-listener

<br>

### routes

#### ▼ routesとは

Envoyのルーティングの静的/動的な設定値を取得する。

```bash
$ istioctl proxy-config routes <Pod名> -n <PodのNamespace名>
```

```bash
$ istioctl proxy-config routes foo-pod -n foo-namespace

NAME                         DOMAINS                                     MATCH    VIRTUAL SERVICE
<Serviceで待ち受けるポート番号>  <Serviceの完全修飾ドメイン名>                   <パス>    <VirtualService名>.<Namespace名>

50001                        foo-service.foo-namespace.svc.cluster.local  /*      foo-virtual-service.foo-namespace
50002                        bar-service.bar-namespace.svc.cluster.local  /*      bar-virtual-service.bar-namespace
50003                        baz-service.baz-namespace.svc.cluster.local  /*      baz-virtual-service.baz-namespace

...

9000                         qux-service.qux-namespace.svc.cluster.local  /*      qux-virtual-service.qux-namespace

...

*                            /stats/prometheus*
*                            /healthz/ready*
...
```

> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-proxy-config-route

`yaml`形式で取得すれば、より詳細な設定値を確認できる。

```bash
$ istioctl proxy-config routes foo-pod \
    -n foo-namespace \
    --name 50001 \
    -o yaml \
    | yq
```

```yaml
# ルート名
- name: '50001'
  # Envoyで仮想ホストを実行し、Envoyの稼働するコンテナが複数のドメインを仮想的に持てるようにしている。
  virtualHosts:
    # Node外からfoo-podにインバウンド通信を送信する時に選ばれる。
    - name: foo-service.foo-namespace.svc.cluster.local:50001
      # Hostヘッダーの値を指定する。合致した場合に、この仮想ホストが選ばれる。
      # 網羅的に検知できるように、色々なパターンを指定する。
      domains:
        - foo-service.foo-namespace.svc.cluster.local
        - foo-service.foo-namespace.svc.cluster.local:50001
        - foo-service
        - foo-service:50001
        - foo-service.foo-namespace.svc
        - foo-service.foo-namespace.svc:50001
        - foo-service.foo-namespace
        - foo-service.foo-namespace:50001
        - 172.16.0.1
        - 172.16.0.1:50001
      routes:
        - match:
            prefix: /
          route:
            # foo-podのルートと紐づくクラスターを指定する。
            cluster: outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local

            ...

          maxGrpcTimeout: 10800s

          ...

      includeRequestAttemptCount: true
    # foo-podからbar-podにリクエストを送信する時に選ばれる。
    - name: bar-service.bar-namespace.svc.cluster.local:50002
      domains:
        - bar-service.bar-namespace.svc.cluster.local
        - bar-service.bar-namespace.svc.cluster.local:50002
        - bar-service
        - bar-service:50002
        - bar-service.bar-namespace.svc
        - bar-service.bar-namespace.svc:50002
        - bar-service.bar-namespace
        - bar-service.bar-namespace:50002
        - 172.16.0.2
        - 172.16.0.2:50002
      routes:
        - match:
            prefix: /
          route:
            # bar-podのルートと紐づくクラスターを指定する。
            cluster: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local

            ...

          maxGrpcTimeout: 10800s

          ...

      includeRequestAttemptCount: true
    # foo-podからbaz-podにリクエストを送信する時に選ばれる。
    - name: baz-service.baz-namespace.svc.cluster.local:50003
      domains:
        - baz-service.baz-namespace.svc.cluster.local
        - baz-service.baz-namespace.svc.cluster.local:50003
        - baz-service
        - baz-service:50003
        - baz-service.baz-namespace.svc
        - baz-service.baz-namespace.svc:50003
        - baz-service.baz-namespace
        - baz-service.baz-namespace:50003
        - 172.16.0.3
        - 172.16.0.3:50003
      routes:
        - match:
            prefix: /
          route:
            # baz-podのルートと紐づくクラスターを指定する。
            cluster: outbound|50003|v1|baz-service.baz-namespace.svc.cluster.local

            ...

          maxGrpcTimeout: 10800s
      includeRequestAttemptCount: true

    ...

    # 条件に合致しない任意のリクエストを送信する時に選ばれる。
    - name: allow_any
      domains:
        - '*'
      routes:
        - name: allow_any
          match:
            prefix: /
          route:
            cluster: PassthroughCluster
            timeout: 0s
            maxGrpcTimeout: 0s
      includeRequestAttemptCount: true
  validateClusters: false

...
```

> - https://istio.io/latest/docs/ops/diagnostic-tools/proxy-cmd/#deep-dive-into-envoy-configuration

#### ▼ --name

ルート名でフィルタリグし、取得する。

```bash
$ istioctl proxy-config routes <Pod名> -n <PodのNamespace名> --name 50001
```

```bash
$ istioctl proxy-config routes foo-pod -n foo-namespace

NAME     DOMAINS                                      MATCH               VIRTUAL SERVICE
50001    foo-service.foo-namespace.svc.cluster.local  /*                  foo-virtual-service.foo-namespace
```

<br>

## precheck

### precheckとは

Istioをインストールまたはアップグレードできる準備が整っているかを検証する。

```bash
$ istioctl x precheck

✅ No issues found when checking the cluster. Istio is safe to install or upgrade!
  To get started, check out https://istio.io/latest/docs/setup/getting-started/
```

> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-experimental-precheck

## tag

### tagとは

Namespaceの`.metadata.labels.istio.io/rev`キーの値を書き換えずにアップグレードできるように、`.metadata.labels.istio.io/rev`キーにエイリアスタグを設定する。

エイリアスは、`default`や`stable`をよく使用するが、実際はなんでよい。

具体的には、MutatingWebhookConfigurationの`.metadata.labels`キーにあるエイリアス (`istio.io/tag`キーの値) と、エイリアスの実体 (`.metadata.labels.istio.io/rev`キーの値) を操作する。

> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-tag
> - https://istio.io/latest/blog/2021/direct-upgrade/#upgrade-from-18-to-110
> - https://fabianlee.org/2021/09/20/istio-canary-upgrade-of-operator-between-istio-1-7-and-1-8/

<br>

### generate

#### ▼ generateとは

MutatingWebhookConfigurationの`.metadata.labels`キーに、エイリアス (`istio.io/tag`キーの値) と、エイリアスの実体 (`.metadata.labels.istio.io/rev`キーの値) を作成する。

```bash
$ istioctl tag generate <エイリアス> --revision <エイリアスの実体>
```

**＊例＊**

`default`というエイリアス (`istio.io/tag`キーの値) を作成し、エイリアスの実体 (`.metadata.labels.istio.io/rev`キーの値) として`1-10-0`を設定する。

```bash
$ istioctl tag generate default --revision 1-10-0
```

`default`というエイリアス (`istio.io/tag`キーの値) を作成し、エイリアスの実体 (`.metadata.labels.istio.io/rev`キーの値) として`1-0-1`を設定する。

```bash
$ istioctl tag generate default --revision 1-0-1
```

> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-tag-generate

<br>

### list

#### ▼ listとは

MutatingWebhookConfigurationの`.metadata.labels`キーにあるエイリアス (`istio.io/tag`キーの値) と、エイリアスの実体 (`.metadata.labels.istio.io/rev`キーの値) を取得する。

カナリアアップグレード前に、現在のバージョンのエイリアスとリビジョン番号 (現在のIstioのバージョンタグ) を確認するために使用する。

```bash
# アップグレード前に、istioctlコマンドで確認してみる。
$ istioctl tag list

TAG       REVISION   NAMESPACES
default    1-10-0      app


# アップグレード前に、マニフェストを確認してみる。
$ kubectl get mutatingwebhookconfiguration istio-revision-tag-<エイリアス> -o yaml \
    | grep -e istio.io/rev: -e istio.io/tag:

istio.io/rev: 1-10-0
istio.io/tag: default
```

> - https://istio.io/v1.13/blog/2021/revision-tags/#stable-revision-tags-in-action

<br>

### set

#### ▼ setとは

MutatingWebhookConfigurationの`.metadata.labels`キーにある既存のエイリアス (`istio.io/tag`キーの値) に実体 (`.metadata.labels.istio.io/rev`キーの値) を設定する。

カナリアアップグレード用のMutatingWebhookConfigurationを新しく作成するためや、既存のMutatingWebhookConfigurationにある現在のバージョンのエイリアスの実体を変更するために使用する。

```bash
# カナリアアップグレード用のMutatingWebhookConfigurationがなければ新しく作成する。
# もしあれば、MutatingWebhookConfigurationのエイリアスの実体を変更する。
$ istioctl tag set <エイリアス> --revision <エイリアスの実体> --overwrite
```

**＊例＊**

`(1)`

: 現在のバージョンのエイリアス (`istio.io/tag`キーの値) が`default`、またバージョン (`.metadata.labels.istio.io/rev`キーの値) が`v1.10.0`とする。

```bash
$ istioctl tag list

TAG      REVISION   NAMESPACES
default   1-10-0      app
```

`(2)`

: `default`タグを持つMutatingWebhookConfigurationを確認する。

```bash
# MutatingWebhookConfiguration
$ kubectl get mutatingwebhookconfigurations

NAME                               WEBHOOKS   AGE
istio-sidecar-injector-1.10.0       1          7m56s # 1.10.0
istio-revision-tag-default          1          7m56s # 現在のリビジョン番号 (1.10.0) 定義するdefaultタグを持つ
```

`(3)`

: もし、ここでIstioをアップグレードしたとする。

```bash
$ istioctl install --set revision=1-11-0
```

`(4)`

: すると、既存のMutatingWebhookConfigurationを残して、新しいMutatingWebhookConfigurationが作成される。

     その他、新しいIstiodコントロールプレーンも作成される。

```bash
# Deployment
NAME                 READY   STATUS    RESTARTS   AGE
istiod-1-10-0        1/1     Running   0          1m  # 1-10-0
istiod-1-11-0        1/1     Running   0          1m  # 1-11-0 (今回のアップグレード先)


# Service
NAME             TYPE         CLUSTER-IP    EXTERNAL-IP   PORT(S)                                                AGE
istiod-1-10-0    ClusterIP    10.32.6.58    <none>        15010/TCP,15012/TCP,443/TCP,15014/TCP,53/UDP,853/TCP   12m
istiod-1-11-0    ClusterIP    10.32.6.58    <none>        15010/TCP,15012/TCP,443/TCP,15014/TCP,53/UDP,853/TCP   12m # 新しい方

# MutatingWebhookConfiguration
$ kubectl get mutatingwebhookconfigurations

NAME                                WEBHOOKS   AGE
istio-sidecar-injector-1.10.0       1          7m56s # 1.10.0
istio-sidecar-injector-1.11.0       1          7m56s # 1.11.0 (今回のアップグレード先)
istio-revision-tag-default          1          7m56s # 現在のリビジョン番号 (1.10.0) 定義するdefaultタグを持つ
```

`(3)`

: エイリアス (`istio.io/tag`キーの値) を指定して、リビジョン番号を書き換える。

     これにより、`istio-revision-tag-default`の`default`タグの値が変更される。

```bash
$ istioctl tag set default --revision 1-11-0 --overwrite

# MutatingWebhookConfiguration
$ kubectl get mutatingwebhookconfigurations

NAME                                WEBHOOKS   AGE
istio-sidecar-injector-1.10.0       1          7m56s # 1.10.0
istio-sidecar-injector-1.11.0       1          7m56s # 1.11.0 (今回のアップグレード先)
istio-revision-tag-default          1          7m56s # 現在のリビジョン番号 (1.11.0) 定義するdefaultタグを持つ
```

`(4)`

: また、`istioctl tag list`コマンドでも、リビジョン番号が`v1.10.0`になったことを確認できる。

```bash
$ istioctl tag list

TAG       REVISION  NAMESPACES
default   1-11-0     app

$ kubectl get mutatingwebhookconfiguration istio-revision-tag-default -o yaml \
    | grep -e istio.io/rev: -e istio.io/tag:

istio.io/rev: 1-11-0
istio.io/tag: default
```

> - https://istio.io/v1.13/blog/2021/revision-tags/#stable-revision-tags-in-action

<br>

## proxy-status

### proxy-statusとは

IngressGateway、EgressGateway、`istio-proxy`コンテナのステータスを取得する。

```bash
$ istioctl proxy-status

NAME                                      CDS        LDS        EDS        RDS          ISTIOD           VERSION
istio-egressgateway-*****.istio-system    SYNCED     SYNCED     SYNCED     NOT SENT     istiod-*****     1.12.1
istio-ingressgateway-*****.istio-system   SYNCED     SYNCED     SYNCED     NOT SENT     istiod-*****     1.12.1
foo-pod.default                           SYNCED     SYNCED     SYNCED     SYNCED       istiod-*****     1.12.1
bar-pod.default                           SYNCED     SYNCED     SYNCED     SYNCED       istiod-*****     1.12.1
baz-pod.default                           SYNCED     SYNCED     SYNCED     SYNCED       istiod-*****     1.12.1
```

> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-proxy-status

<br>

## upgrade

### upgradeとは

Istioのインプレースデプロイメントを実行する。

```bash
$ istioctl upgrade

This will install the Istio <バージョンタグ> default profile with ["Istio core" "Istiod" "Ingress gateways"] components into the cluster. Proceed? (y/N) y

✅ Istio core installed
✅ Istiod installed
✅ Ingress gateways installed
✅ Installation complete                                                                                                                                                                                      Making this installation the default for injection and validation.
```

> - https://istio.io/latest/docs/setup/upgrade/in-place/

<br>

## verify-install

### verify-installとは

Istioリソースが正しく作成されたかを検証する。

```bash
$ istioctl verify-install

1 Istio control planes detected, checking --revision "default" only
✅ ClusterRole: istiod-istio-system.istio-system checked successfully
✅ ClusterRole: istio-reader-istio-system.istio-system checked successfully

...

✅ Service: istio-egressgateway.istio-system checked successfully
✅ ServiceAccount: istio-egressgateway-service-account.istio-system checked successfully
Checked 14 custom resource definitions
Checked 3 Istio Deployments
✅ Istio is installed and verified successfully
```

> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-verify-install

<br>

## version

### versionとは

Istiodコントロールプレーンのバージョンを取得する。

```bash
$ istioctl version

client version: 1.12.1
pilot version: 1.12.1
pilot version: 1.7.2
data plane version: 1.12.1 (5 proxies)
```

<br>
