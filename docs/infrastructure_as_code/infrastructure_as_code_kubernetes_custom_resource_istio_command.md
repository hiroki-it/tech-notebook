---
title: 【IT技術の知見】コマンド＠Istio
description: コマンド＠Istioの知見を記録しています。
---

# コマンド＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## セットアップ

### インストール

#### ▼ brewリポジトリから

```bash
$ brew install istioctl
```

#### ▼ チャートリポジトリから

> ℹ️ 参考：https://istio.io/latest/docs/setup/getting-started/#download

（１）インストール先のディレクトリに移動する。

```bash
$ cd /Users/hiroki.hasegawa/projects
```

（２）チャートリポジトリから、```istioctl```コマンドインストールする。

```bash
$ curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.12.1 - sh
```

（３）```istioctl```コマンドへのパスを環境変数に登録する。

```bash
$ cd istio-1.12.1
$ export PATH=$PWD/bin:$PATH
```

<br>

### プロファイル

#### ▼ プロファイルとは

Istioの機能のセットを提供する。

実際には設定済みのIstioOperatorであり、```istioctl```コマンドのインストール時に```manifests```ディレクトリ以下に配置される。



> ℹ️ 参考：https://istio.io/latest/docs/setup/additional-setup/config-profiles/

#### ▼ プロファイルの種類

> ℹ️ 参考：
>
> - https://github.com/istio/istio/tree/master/manifests/profiles
> - https://atmarkit.itmedia.co.jp/ait/articles/2111/05/news005.html
> - https://betterprogramming.pub/getting-started-with-istio-on-kubernetes-e582800121ea

| ユースケース               | default  |   demo   |         empty          | external |     minimal      | openshift | preview | remote |
|:---------------------|:--------:|:--------:|:----------------------:|:--------:|:----------------:|:---------:|:-------:|:------:|
| 概要                 | 本番環境 | 開発環境 | Istioリソースを全てカスタマイズしたい |    なし    | 最小限の機能が欲しい |     ？     |   なし    |   ？    |
| istio-egressgateway  |    なし    |    ✅     |           なし           |    なし    |        なし        |     ？     |   なし    |   ？    |
| istio-ingressgateway |    ✅     |    ✅     |           なし           |    なし    |        なし        |     ？     |    ✅    |   ？    |
| istiod               |    ✅     |    ✅     |           なし           |    なし    |        ✅         |     ？     |    ✅    |   ？    |


<br>

## analyze

### analyzeとは

Istioが正しく動作しているか否かを検証する。



> ℹ️ 参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-analyze

成功した場合を以下に示す。



```bash
$ istioctl analyze

✔ No validation issues found when analyzing namespace: default.
```

失敗した場合を以下に示す。



```bash
$ istioctl analyze

Info [IST0118] (Service default/foo-service) Port name  (port: 80, targetPort: 80) doesn't follow the naming convention of Istio port.
```

### オプション

#### ▼ -n

Namespaceを指定しつつ、```analyze```コマンドを実行する。



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



> ℹ️ 参考：https://istio.io/latest/docs/setup/install/istioctl/

<br>

### オプション

#### ▼ -f

IstioOperatorのマニフェストをkube-apiserverに送信し、リソースを作成する。

> ℹ️ 参考：https://istio.io/latest/docs/setup/install/istioctl/#install-istio-using-the-default-profile

```bash
$ istioctl install -y -f <IstioOperatorのマニフェストへのパス>
```

#### ▼ --set

インストールするもの、または変更する項目を指定する。



> ℹ️ 参考：https://istio.io/latest/docs/setup/additional-setup/config-profiles/

| オプション例                                    | 説明                                                                                          | 補足                                                                     |
|--------------------------------------------|---------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| ```meshConfig.accessLogFile=/dev/stdout``` | アクセスログの出力先を標準出力に変更する。                                                                |                                                                          |
| ```profile=default```                      | 指定したプロファイルをインストールする。                                                                        |                                                                          |
| ```revision=1-0-0```                       | 既存のIstioのコントロールプレーンを稼働させつつ、指定したバージョンのコントロールプレーンをカナリアリリースする。バージョンは、ケバブケースで設定する必要がある。 | ℹ️ 参考：https://istio.io/latest/docs/setup/upgrade/canary/#control-plane |

<br>

## kube-inject

### kube-injectとは

```istio-proxy```コンテナを手動で注入する。代わりに、```enabled```値が割り当てられた```metadata.labels,istio-injection```キーをNamespaceに付与しても良い。

> ℹ️ 参考：
>
> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-kube-inject
> - https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#manual-sidecar-injection


<br>

### オプション

#### ▼ -f

指定したマニフェストのPodに```istio-proxy```コンテナを注入する。

```bash
$ istioctl kube-inject -f pod.yaml
```

<br>

## manifest diff

### diffとは

ymlファイルの差分を取得する。



> ℹ️ 参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-manifest-diff

```bash
$ istioctl manifest diff <変更前マニフェストへのパス> <変更後マニフェストへのパス>
```

<br>

## operator

### init

IstioOperatorを```istio-system```に作成する。

```bash
$ istioctl operator init

Installing operator controller in namespace: istio-operator using image: docker.io/istio/operator:<リビジョン番号>
Operator controller will watch namespaces: istio-system
✔ Istio operator installed
✔ Installation complete
```

<br>

## profile

### profileとは

Istioのプロファイルを操作する。



> ℹ️ 参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-profile

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



> ℹ️ 参考：
>
> - https://istio.io/latest/docs/ops/diagnostic-tools/proxy-cmd/#deep-dive-into-envoy-configuration
> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-proxy-config
> - https://sreake.com/blog/istio/

```bash
$ istioctl proxy-config <設定項目> <Pod名> -n <Namespace名>
```

<br>

### グローバルオプション

#### ▼ -o

出力形式を指定する。

```jq```コマンドや```yq```コマンドと組み合わせた方が良い。



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


- '@type'
- '@type'
- '@type'
- '@type'
- '@type'
- '@type'
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
  layeredRuntime:
    
    ...
  
  node:
    
    ...
  
  staticResources:
    
    ...
  
  statsConfig:
    
    ...
  
  tracing:
    
    ...

lastUpdated: "2022-11-16T08:12:07.162Z"
```


<br>

### cluster

#### ▼ clusterとは

Envoyのクラスターの静的/動的な設定値を取得する。



> ℹ️ 参考：
> 
> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-proxy-config-cluster
> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/service_discovery#supported-service-discovery-types

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

```.yaml```形式で取得すれば、より詳細な設定値を確認できる。



> ℹ️ 参考：
> 
> - https://istio.io/latest/docs/ops/diagnostic-tools/proxy-cmd/#deep-dive-into-envoy-configuration
> - https://www.amazon.co.jp/Istio-Action-Christian-Posta/dp/1617295825

```bash
$ istioctl proxy-config cluster foo-pod \
    -n foo-namespace \
    -o yaml \
    --fqdn bar-service.bar-namespace.svc.cluster.local \
    | yq

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

...
```

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



> ℹ️ 参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-proxy-config-endpoint

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

```.yaml```形式で取得すれば、より詳細な設定値を確認できる。



> ℹ️ 参考：https://istio.io/latest/docs/ops/diagnostic-tools/proxy-cmd/#deep-dive-into-envoy-configuration

```bash
$ istioctl proxy-config endpoints foo-pod \
    -n foo-namespace \
    --cluster "outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local" \
    -o yaml \
    | yq

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



> ℹ️ 参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-proxy-config-listener

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

<br>


### routes

#### ▼ routesとは

Envoyのルーティングの静的/動的な設定値を取得する。



> ℹ️ 参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-proxy-config-route

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

```.yaml```形式で取得すれば、より詳細な設定値を確認できる。



> ℹ️ 参考：https://istio.io/latest/docs/ops/diagnostic-tools/proxy-cmd/#deep-dive-into-envoy-configuration

```bash
$ istioctl proxy-config routes foo-pod \
    -n foo-namespace \
    --name 50001 \
    -o yaml \
    | yq

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
    # foo-podからbar-podにアウトバウンド通信を送信する時に選ばれる。
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
    # foo-podからbaz-podにアウトバウンド通信を送信する時に選ばれる。
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
    
    # 条件に合致しない任意のアウトバウンド通信を送信する時に選ばれる。
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

## tag

### tagとは

MutatingWebhookConfigurationの```metadata.labels```キーにあるエイリアス（```istio.io/tag```キーの値）と、エイリアスの実体（```istio.io/rev```キーの値）を操作する。



> ℹ️ 参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-tag


<br>



### generate

#### ▼ generateとは

MutatingWebhookConfigurationの```metadata.labels```キーに、エイリアス（```istio.io/tag```キーの値）と、エイリアスの実体（```istio.io/rev```キーの値）を作成する。



> ℹ️ 参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-tag-generate

```bash
$ istioctl tag generate <エイリアス名> --revision <エイリアスの実体>
```

**＊例＊**

```prd-blue```というエイリアス（```istio.io/tag```キーの値）を作成し、エイリアスの実体（```istio.io/rev```キーの値）として```1-0-0```を設定する。

```bash
$ istioctl tag generate prd-blue --revision 1-0-0
```

```tes-green```というエイリアス（```istio.io/tag```キーの値）を作成し、エイリアスの実体（```istio.io/rev```キーの値）として```1-0-1```を設定する。

```bash
$ istioctl tag generate tes-green --revision 1-0-1
```

<br>

### list

#### ▼ listとは

MutatingWebhookConfigurationの```metadata.labels```キーにあるエイリアス（```istio.io/tag```キーの値）と、エイリアスの実体（```istio.io/rev```キーの値）を取得する。



> ℹ️ 参考：https://istio.io/v1.13/blog/2021/revision-tags/#stable-revision-tags-in-action

```bash
$ istioctl tag list
```

**＊例＊**

```bash
$ istioctl tag list

TAG        REVISION   NAMESPACES
prd-blue   1-0-0      istioinaction
tes-green  1-0-1      istioinaction
```

<br>


### set

#### ▼ setとは

MutatingWebhookConfigurationの```metadata.labels```キーにある既存のエイリアス（```istio.io/tag```キーの値）に実体（```istio.io/rev```キーの値）を設定する。



> ℹ️ 参考：https://istio.io/v1.13/blog/2021/revision-tags/#stable-revision-tags-in-action

```bash
$ istioctl tag set <エイリアス> --revision <エイリアスの実体>
```

**＊例＊**

```bash
$ istioctl tag set prd-blue --revision 1-0-0
```

<br>

## proxy-status

### proxy-statusとは

IngressGateway、EgressGateway、```istio-proxy```コンテナのステータスを取得する。

> ℹ️ 参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-proxy-status

```bash
$ istioctl proxy-status  

NAME                                      CDS        LDS        EDS        RDS          ISTIOD           VERSION
istio-egressgateway-*****.istio-system    SYNCED     SYNCED     SYNCED     NOT SENT     istiod-*****     1.12.1
istio-ingressgateway-*****.istio-system   SYNCED     SYNCED     SYNCED     NOT SENT     istiod-*****     1.12.1
foo-pod.default                           SYNCED     SYNCED     SYNCED     SYNCED       istiod-*****     1.12.1
bar-pod.default                           SYNCED     SYNCED     SYNCED     SYNCED       istiod-*****     1.12.1
baz-pod.default                           SYNCED     SYNCED     SYNCED     SYNCED       istiod-*****     1.12.1
```

<br>

## upgrade

### upgradeとは

Istioのインプレースデプロイメントを実行する。



> ℹ️ 参考：https://istio.io/latest/docs/setup/upgrade/in-place/

```bash
$ istioctl upgrade

This will install the Istio <バージョンタグ> default profile with ["Istio core" "Istiod" "Ingress gateways"] components into the cluster. Proceed? (y/N) y

✔ Istio core installed                                                                                                                                                                                       
✔ Istiod installed                                                                                                                                                                                           
✔ Ingress gateways installed                                                                                                                                                                                 
✔ Installation complete                                                                                                                                                                                      Making this installation the default for injection and validation.
```

<br>

## verify-install

### verify-installとは

Istioリソースのapplyが正しく実行されたかを検証する。



> ℹ️ 参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-verify-install

```bash
$ istioctl verify-install

1 Istio control planes detected, checking --revision "default" only
✔ ClusterRole: istiod-istio-system.istio-system checked successfully
✔ ClusterRole: istio-reader-istio-system.istio-system checked successfully

...

✔ Service: istio-egressgateway.istio-system checked successfully
✔ ServiceAccount: istio-egressgateway-service-account.istio-system checked successfully
Checked 14 custom resource definitions
Checked 3 Istio Deployments
✔ Istio is installed and verified successfully
```

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
