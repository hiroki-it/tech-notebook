---
title: 【IT技術の知見】コントロールプレーン＠Istioサイドカー
description: コントロールプレーン＠Istioサイドカーの知見を記録しています。
---

# コントロールプレーン＠Istio サイドカー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. サイドカーモードのコントロールプレーン

### 仕組み

サイドカーモードの Istiod コントロールプレーンは、istiod-service を介して、各種ポート番号で istio-proxy からのリモートプロシージャーコールを待ち受ける。

語尾の『`d`』は、デーモンの意味であるが、Istiod コントロールプレーンの実体は、Deployment である。

![istio_control-plane_ports](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_control-plane_ports.png)

> - https://www.amazon.co.jp/dp/1617295825
> - https://istio.io/latest/docs/ops/deployment/requirements/#ports-used-by-istio
> - [Istio / Prometheus](https://istio.io/latest/docs/ops/integrations/prometheus/#configuration)

<br>

### Envoy の設定値への変換

記入中...

<br>

## 01-02. マニフェスト

### マニフェストの種類

Istiod コントロールプレーンは、Deployment、Service、MutatingWebhookConfiguration などのマニフェストから構成される。

<br>

### Deployment

#### ▼ istiod

コントロールプレーンの Pod の可用性を高めるため、これを冗長化する。

Deployment 配下の Pod は、Istiod コントロールプレーンの実体である。

Pod 内では `discovery` コンテナが稼働している。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: istiod
    istio.io/rev: <リビジョン>
    release: istiod
  name: istiod-<リビジョン>
  namespace: istio-system
spec:
  replicas: 2
  selector:
    matchLabels:
      app: istiod
      istio.io/rev: <リビジョン>
  strategy:
    rollingUpdate:
      maxSurge: 100%
      maxUnavailable: 25%
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: istiod
        istio.io/rev: <リビジョン>
    spec:
      containers:
        - args:
            - discovery
            # pilot-discovery コマンドのオプション
            # 15014 番ポートの開放
            - --monitoringAddr=:15014
            - --log_output_level=default:info
            - --log_as_json
            - --domain
            - cluster.local
            - --keepaliveMaxServerConnectionAge
            - 30m
          # pilot イメージ
          image: docker.io/istio/pilot:<リビジョン>
          imagePullPolicy: IfNotPresent
          # discovery コンテナ
          name: discovery
          # 待ち受けるポート番号の仕様
          ports:
            # 8080 番ポートの開放
            - containerPort: 8080
              protocol: TCP
            # 15010 番ポートの開放
            - containerPort: 15010
              protocol: TCP
            # 15017 番ポートの開放
            - containerPort: 15017
              protocol: TCP
          env:
            # 15012 番ポートの開放
            - name: ISTIOD_ADDR
              value: istiod-<リビジョン>.istio-system.svc:15012 # 15012 番ポートの開放

          ...

# 重要なところ以外を省略しているので、全体像はその都度確認すること。
```

> - [istio/pilot/pkg/bootstrap/server.go at 1.14.3 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.14.3/pilot/pkg/bootstrap/server.go#L412-L476)

Dockerfile では、最後に `pilot-discovery` コマンドで Istio コントロールプレーンを実行している。

```dockerfile
ENTRYPOINT ["/usr/local/bin/pilot-discovery"]
```

> - [istio/pilot/docker/Dockerfile.pilot at 1.24.2 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.24.2/pilot/docker/Dockerfile.pilot)
> - https://zenn.dev/link/comments/e8a978a00c6325

そのため、Istio コントロールプレーンを起動する `pilot-discovery` コマンドの実体は、GitHub の `pilot-discovery` ディレクトリ配下の `main.go` ファイルで実行される Go のバイナリファイルである。

> - [istio/pilot/cmd/pilot-discovery/main.go at 1.14.3 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.14.3/pilot/cmd/pilot-discovery/main.go)

<br>

### HorizontalPodAutoscaler

Deployment 配下の Pod には、HorizontalPodAutoscaler が設定されている。

コントロールプレーンの可用性を高められる。

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: istiod-<リビジョン>
  namespace: istio-system
  labels:
    app: istiod
    istio.io/rev: <リビジョン>
    release: istiod
spec:
  maxReplicas: 5
  minReplicas: 2
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: istiod-<リビジョン>
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 80
```

<br>

### Service

#### ▼ istiod

istio-proxy からのリクエストを、Istiod コントロールプレーン (Deployment 配下の Pod) にポートフォワーディングする。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: istiod-<リビジョン>
  namespace: istio-system
  labels:
    app: istiod
    istio: pilot
    istio.io/rev: <リビジョン>
    release: istiod
spec:
  ports:
    # webhook サーバーに対するリクエストを待ち受ける。
    - name: https-webhook
      port: 443
      protocol: TCP
      targetPort: 15017
    # xDS サーバーに対するリクエストを待ち受ける。
    - name: grpc-xds
      port: 15010
      protocol: TCP
      targetPort: 15010
    # サーバー証明書に関するリクエストを待ち受ける。
    - name: https-dns
      port: 15012
      protocol: TCP
      targetPort: 15012
    # データポイント収集に関するリクエストを待ち受ける。
    - name: http-monitoring
      port: 15014
      protocol: TCP
      targetPort: 15014
  selector:
    # ルーティング先の istiod コントールプレーン (Deployment 配下の Pod)
    app: istiod
    istio.io/rev: <リビジョン>
```

<br>

### MutatingWebhookConfiguration

#### ▼ istio-revision-tag-default

Pod の作成/更新時、webhook サーバーにリクエストを送信できるように、MutatingWebhookConfiguration で MutatingAdmissionWebhook プラグインを設定する。

`.webhooks.failurePolicy` キーで設定しているとおり、webhook サーバーのコールに失敗した場合は、Pod を作成するための kube-apiserver のコール自体がエラーとなる。

そのため、Istio が起動に失敗し続けると、サイドカーコンテナのインジェクションを有効している Pod がいつまでも作成されないことになる。

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingWebhookConfiguration
metadata:
  name: istio-revision-tag-default
  labels:
    app: sidecar-injector
    istio.io/rev: <リビジョン>
    istio.io/tag: <エイリアス>
webhooks:
  - name: rev.namespace.sidecar-injector.istio.io
    # mutating-admission ステップ発火条件を登録する。
    rules:
      - apiGroups: [""]
        apiVersions: ["v1"]
        operations: ["CREATE", "UPDATE"]
        resources: ["pods"]
        scope: "*"
    # Istiod の Service の宛先情報を登録する。
    clientConfig:
      service:
        name: istiod-<リビジョン>
        namespace: istio-system
        # エンドポイント
        path: "/inject"
        port: 443
      caBundle: Ci0tLS0tQk...
    # webhook サーバーのコールに失敗した場合の処理を設定する。
    failurePolicy: Fail
    matchPolicy: Equivalent
    # 適用する Namespace を設定する。
    namespaceSelector:
      matchExpressions:
        - key: istio.io/rev
          operator: In
          values:
            - <エイリアス>
```

<br>

## 02. `discovery` コンテナ

### `discovery` コンテナの仕組み

Istio (`v1.1`) の `discovery` コンテナは、Config Ingestion レイヤー、Core Data Model レイヤー、Proxy Serving レイヤー、インメモリストレージ、といった要素からなる。

![istio_control-plane_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_control-plane_architecture.png)

> - [Pilot Decomposition - Google Docs](https://docs.google.com/document/d/1S5ygkxR1alNI8cWGG4O4iV8zp8dA6Oc23zQCvFxr83U/edit#heading=h.a1bsj2j5pan1)
> - [istio 庖丁解牛(四) pilot discovery - zhonghua \| 钟华的博客 \| zhongfox](https://zhonghua.io/2019/05/12/istio-analysis-4/)

<br>

### Config Ingestion レイヤー

#### ▼ Config Ingestion レイヤーとは

Cluster で作成された Istio リソースの状態を取得する。

> - [istio/architecture/networking/pilot.md at master · istio/istio · GitHub](https://github.com/istio/istio/blob/master/architecture/networking/pilot.md)

<br>

### Config translation レイヤー

#### ▼ Config translation レイヤーとは

取得したカスタムリソースの状態を Envoy の設定値に変換する。

> - [istio/architecture/networking/pilot.md at 1.20.0 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.20.0/architecture/networking/pilot.md)
> - [istio/pilot/pkg/xds/discovery.go at 1.20.0 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.20.0/pilot/pkg/xds/discovery.go#L529-L565)
> - [istio/pilot/pkg/networking/core/configgen.go at 1.20.0 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.20.0/pilot/pkg/networking/core/configgen.go#L29-L55)

#### ▼ リスナーの場合

Istio リソースを Envoy のリスナーに変換する。

> - [istio/pilot/pkg/xds/lds.go at 1.20.0 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.20.0/pilot/pkg/xds/lds.go#L92-L105)
> - [istio/pilot/pkg/networking/grpcgen/lds.go at 1.20.0 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.20.0/pilot/pkg/networking/grpcgen/lds.go#L61-L71)
> - https://github.com/istio/istio/blob/1.20.0/pilot/pkg/networking/core/v1alpha3/listener.go#L96-L118

#### ▼ ルートの場合

Istio リソースを Envoy のルートに変換する。

> - [istio/pilot/pkg/xds/rds.go at 1.20.0 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.20.0/pilot/pkg/xds/rds.go#L62-L68)
> - [istio/pilot/pkg/networking/grpcgen/rds.go at 1.20.0 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.20.0/pilot/pkg/networking/grpcgen/rds.go#L29-L40)
> - https://github.com/istio/istio/blob/1.20.0/pilot/pkg/networking/core/v1alpha3/httproute.go#L57-L113

#### ▼ クラスターの場合

Istio リソースを Envoy のクラスターに変換する。

> - [istio/pilot/pkg/xds/cds.go at 1.20.0 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.20.0/pilot/pkg/xds/cds.go#L75-L81)
> - [istio/pilot/pkg/networking/grpcgen/cds.go at 1.20.0 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.20.0/pilot/pkg/networking/grpcgen/cds.go#L35-L60)
> - [istio/pilot/pkg/networking/core/v1alpha3/cluster.go at 1.20.0 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.20.0/pilot/pkg/networking/core/v1alpha3/cluster.go#L198-L269)

#### ▼ エンドポイントの場合

Istio リソースを Envoy のエンドポイントに変換する。

> - [istio/pilot/pkg/xds/eds.go at 1.20.0 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.20.0/pilot/pkg/xds/eds.go#L118-L124)
> - [istio/pilot/pkg/xds/eds.go at 1.20.0 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.20.0/pilot/pkg/xds/eds.go#L183-L245)

<br>

### Config serving レイヤー

#### ▼ Config serving レイヤーとは

ADS-API を介して、Envoy の設定値をデータプレーンの istio-proxy に配布する。

> - [Pilot Decomposition - Google Docs](https://docs.google.com/document/d/1S5ygkxR1alNI8cWGG4O4iV8zp8dA6Oc23zQCvFxr83U/edit#heading=h.a1bsj2j5pan1)
> - [istio 庖丁解牛(四) pilot discovery - zhonghua \| 钟华的博客 \| zhongfox](https://zhonghua.io/2019/05/12/istio-analysis-4/)
> - [istio/architecture/networking/pilot.md at master · istio/istio · GitHub](https://github.com/istio/istio/blob/master/architecture/networking/pilot.md)

#### ▼ XDS-API

pilot-agent を介して、Envoy との間でストリーミング方式で双方向通信し、リソースの変更に応じて Envoy の設定値をリアルタイムで配布する。

> - https://cloudnative.to/blog/istio-pilot-3/
> - [Istio Pilot代码深度解析 \| 赵化冰的博客 \| Zhaohuabing Blog](https://www.zhaohuabing.com/post/2019-10-21-pilot-discovery-code-analysis/)
> - [DiscoveryServer \| deep-understanding-of-istio](https://rocdu.gitbook.io/deep-understanding-of-istio/10/1#streamaggregatedresources)
> - [4.深入Istio源码：Pilot的Discovery Server如何执行xDS异步分发 - luozhiyun - 博客园](https://www.cnblogs.com/luozhiyun/p/14088989.html)

#### ▼ XDS-API の実装

```go
package xds

...

// ADS-APIからEnvoyに宛先情報をリモートプロシージャーコールする。
func (s *DiscoveryServer) StreamAggregatedResources(stream DiscoveryStream) error {
	return s.Stream(stream)
}

func (s *DiscoveryServer) Stream(stream DiscoveryStream) error {

	...

	for {

		select {

		// 先に終了したcaseに条件分岐する
		case req, ok := <-con.reqChan:
			if ok {
				// pilot-agentからリクエストを受信する。
                // 受信内容に応じて、送信内容を作成する。
				if err := s.processRequest(req, con); err != nil {
					return err
				}
			} else {
				return <-con.errorChan
			}

		case pushEv := <-con.pushChannel:

            // pilot-agentにリクエストを送信する。
			err := s.pushConnection(con, pushEv)
			pushEv.done()
			if err != nil {
				return err
			}
		case <-con.stop:
			return nil
		}
	}
}
```

> - [istio/pilot/pkg/xds/ads.go at 1.14.3 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.14.3/pilot/pkg/xds/ads.go#L236-L238)
> - [istio/pilot/pkg/xds/ads.go at 1.14.3 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.14.3/pilot/pkg/xds/ads.go#L307-L348)
> - [istio/pilot/pkg/xds/ads.go at 1.14.3 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.14.3/pilot/pkg/xds/ads.go#L190-L233)

実装が移行途中のため、xds-proxy にも、Envoy からのリモートプロシージャーコールを処理する同名の関数がある。

> - [istio/pkg/istio-agent/xds\_proxy.go at 1.14.3 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.14.3/pkg/istio-agent/xds_proxy.go#L299-L306)

<br>

### インメモリストレージ

記入中...

<br>

## 02-02. 待ち受けるポート番号

### ポート番号の確認

```bash
$ kubectl exec foo-istiod -n istio-system -- netstat -tulpn

Active Internet connections (only servers)

Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 127.0.0.1:9876          0.0.0.0:*               LISTEN      1/pilot-discovery
tcp6       0      0 :::15017                :::*                    LISTEN      1/pilot-discovery
tcp6       0      0 :::8080                 :::*                    LISTEN      1/pilot-discovery
tcp6       0      0 :::15010                :::*                    LISTEN      1/pilot-discovery
tcp6       0      0 :::15012                :::*                    LISTEN      1/pilot-discovery
tcp6       0      0 :::15014                :::*                    LISTEN      1/pilot-discovery
```

### `8080` 番

`discovery` コンテナの `8080` 番ポートでは、コントロールプレーンのデバッグエンドポイントに対するリクエストを待ち受ける。

`discovery` コンテナの `15014` 番ポートにポートフォワーディングしながら、別に `go tool pprof` コマンドを実行することで、Istio を実装するパッケージのリソース使用量を可視化できる。

```bash
# ポートフォワーディングを実行する。
$ kubectl port-forward svc/istiod-<リビジョン> 15014 -n istio-system

$ go tool pprof -http=:8080 127.0.0.1:15014/debug/pprof/heap

Fetching profile over HTTP from http://127.0.0.1:15014/debug/pprof/heap
Saved profile in /Users/hiroki-hasegawa/pprof/pprof.pilot-discovery.alloc_objects.alloc_space.inuse_objects.inuse_space.002.pb.gz
Serving web UI on http://127.0.0.1:8080

# どのパッケージでどのくらいハードウェアリソースを消費しているか
$ curl http://127.0.0.1:8080/ui/flamegraph?si=alloc_objects
```

> - [Istio 调试端口 \| Istio 运维实战](https://www.zhaohuabing.com/istio-guide/docs/debug-istio/istio-debug/#%E6%9F%A5%E7%9C%8B-istiod-%E5%86%85%E5%AD%98%E5%8D%A0%E7%94%A8)

<br>

### `9876` 番

`discovery` コンテナの `9876` 番ポートでは、ControlZ ダッシュボードに対するリクエストを待ち受ける。

ControlZ ダッシュボードでは、istiod コントロールプレーンの設定値を変更できる。

> - [Istio / Istiod Introspection](https://istio.io/latest/docs/ops/diagnostic-tools/controlz/)
> - https://jimmysong.io/en/blog/istio-components-and-ports/

<br>

### `15010` 番

![istio_control-plane_service-discovery](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_control-plane_service-discovery.png)

`discovery` コンテナの `15010` 番ポートでは、istio-proxy からの xDS サーバーに対するリモートプロシージャーコールを待ち受け、`discovery` コンテナ内のプロセスに渡す。

コールの内容に応じて、他のサービス (Pod、Node)の宛先情報を含むレスポンスを返信する。

Envoy は pilot-agent を介してこれを受信し、自身の宛先情報設定を動的に変更する (サービス検出) 。

> - [How to Integrate Your Service Registry with Istio? \| 赵化冰的博客 \| Zhaohuabing Blog](https://www.zhaohuabing.com/post/2020-06-12-third-party-registry-english/)

![istio_service-registry](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_service-registry.png)

Istiod コントロールプレーンは、サービスレジストリ (例：etcd、consul catalog、nocos、cloud foundry) に登録された情報や、コンフィグストレージに永続化されたマニフェストの宣言 (ServiceEntry、WorkloadEntry) から、他のサービス (Pod、Node) の宛先情報を取得する。

`discovery` コンテナは、取得した宛先情報を自身に保管する。

> - https://juejin.cn/post/7028572651421433892
> - [Istio 服务注册插件机制代码解析 \| 赵化冰的博客 \| Zhaohuabing Blog](https://www.zhaohuabing.com/post/2019-02-18-pilot-service-registry-code-analysis/)
> - [istio/pilot/pkg/serviceregistry/provider/providers.go at 1.14.3 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.14.3/pilot/pkg/serviceregistry/provider/providers.go#L20-L27)
> - https://www.kubernetes.org.cn/4208.html
> - [etcd versus other key-value stores \| etcd](https://etcd.io/docs/v3.3/learning/why/#comparison-chart)

<br>

### `15012` 番

`discovery` コンテナの `15012` 番ポートでは、マイクロサービス間で相互 TLS 認証による HTTPS プロトコルを使用する場合、istio-proxy からの証明書署名要求を待ち受け、`discovery` コンテナ内のプロセスに渡す。

リクエストの内容に応じて、署名済みのクライアント証明書とサーバー証明書を含むレスポンスを返信する。秘密鍵は istio-proxy 内の pilot-agent プロセスが作成し、Istiod には送信しない。

istio-proxy はこれを受信し、pilot-agent は Envoy にこれらを紐付ける。

また、証明書の有効期限が切れる前に、istio-proxy は秘密鍵から証明書署名要求を再作成して送信し、新しい署名済み証明書を取得する。

![istio_control-plane_certificate](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_control-plane_certificate.png)

> - [Istio / Security](https://istio.io/latest/docs/concepts/security/#pki)

<br>

### `15014` 番

コンテナの `15014` 番ポートでは、Istiod コントロールプレーンのメトリクスを監視するツールからのリクエストを待ち受け、`discovery` コンテナ内のプロセスに渡す。

リクエストの内容に応じて、データポイントを含むレスポンスを返信する。

```bash
# ポートフォワーディングを実行する。
$ kubectl port-forward svc/istiod-<リビジョン> 15014 -n istio-system

# デバッグダッシュボードにリクエストを送信する。
$ curl http://127.0.0.1:15014/debug
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#metrics)
> - [Istio 调试端口 \| Istio 运维实战](https://www.zhaohuabing.com/istio-guide/docs/debug-istio/istio-debug/#istio-%E8%B0%83%E8%AF%95%E6%8E%A5%E5%8F%A3)

<br>

### `15017` 番

`discovery` コンテナの `15017` 番ポートでは、Istio の `istiod-<リビジョン>` という Service からのポートフォワーディングを待ち受け、`discovery` コンテナ内のプロセスに渡す。AdmissionReview を含むレスポンスを返信する。

<br>

## 03. pilot-discovery コマンド

### 実行オプションの渡し方

`discovery` コンテナの起動時に引数として渡す。

Pod であれば、`.spec.containers[*].args` オプションを使用する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: istiod-<リビジョン>
  namespace: istio-system
spec:
  containers:
    - args:
        - discovery
        - --monitoringAddr=:15014
        - --log_output_level=default:info
        - --log_as_json
        - --domain
        - cluster.local
        - --keepaliveMaxServerConnectionAge
        - 30m
```

<br>

### discovery

#### ▼ clusterRegistriesNamespace

Istio の ConfigMap (`istio-mesh-cm`) のある Namespace を設定する。

```bash
$ pilot-discovery discovery --clusterRegistriesNamespace istio-system
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#pilot-discovery-discovery)

#### ▼ keepaliveMaxServerConnectionAge

Istiod と istio-proxy 間の確立済 TCP 接続の維持時間を設定する。

```bash
$ pilot-discovery discovery --keepaliveMaxServerConnectionAge 30m
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#pilot-discovery-discovery)

#### ▼ log_output_level

```bash
$ pilot-discovery discovery --log_output_level none
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#pilot-discovery-discovery)

#### ▼ log_as_json

Istio の各コンポーネントの実行ログを構造化する。

istio-proxy コンテナのアクセスログではない。

```bash
$ pilot-discovery discovery --log_as_json
```

```yaml
{
  "level": "info",
  "time": "2025-04-21T07:07:32.114867Z",
  "scope": "xdsproxy",
  "msg": "connected to delta upstream XDS server: istiod-1-25-0.istio-system.svc:15012",
  "id": 2,
}
```

#### ▼ monitoringAddr

Prometheus によるデータポイント収集のポート番号を設定する。

`:15014` を設定する。

```bash
$ pilot-discovery discovery --monitoringAddr :15014
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#pilot-discovery-discovery)

#### ▼ domain

```bash
$ pilot-discovery discovery --domain cluster.local
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#pilot-discovery-discovery)

<br>
