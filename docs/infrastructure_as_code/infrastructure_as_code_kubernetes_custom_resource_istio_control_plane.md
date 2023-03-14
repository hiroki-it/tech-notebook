---
title: 【IT技術の知見】コントロールプレーン＠Istio
description: コントロールプレーン＠Istioの知見を記録しています。
---

# コントロールプレーン＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. コントロールプレーン (Istiodコントロールプレーン) とは

### サイドカープロキシメッシュの場合

サイドカープロキシメッシュのIstiodコントロールプレーンは、istiod-serviceを介して、各種ポート番号で`istio-proxy`コンテナからのリモートプロシージャーコールを待ち受ける。

語尾の『`d`』は、デーモンの意味であるが、Istiodコントロールプレーンの実体は、Deploymentである。

![istio_control-plane_ports](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_control-plane_ports.png)

> ↪️ 参考：
>
> - https://www.amazon.co.jp/dp/1617295825
> - https://istio.io/latest/docs/ops/deployment/requirements/#ports-used-by-istio
> - https://istio.io/latest/docs/ops/integrations/prometheus/#configuration

<br>

### アンビエンドメッシュの場合

記入中...

<br>

## 02. コントロールプレーンの要素

### コントロールプレーンの要素

Istiodは、Deployment、Service、MutatingWebhookConfiguration、などから構成される。

<br>

### Deployment

#### ▼ Deploymentとは

コントロールプレーンのPodの可用性を高めるため、これを冗長化する。

#### ▼ Pod

Deployment配下のPodは、Istiodコントロールプレーンの実体である。

Pod内では`discovery`コンテナが稼働している。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: istiod
    istio.io/rev: <リビジョン番号>
    release: istiod
  name: istiod-<リビジョン番号>
  namespace: istio-system
spec:
  replicas: 2
  selector:
    matchLabels:
      app: istiod
      istio.io/rev: <リビジョン番号>
  strategy:
    rollingUpdate:
      maxSurge: 100%
      maxUnavailable: 25%
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: istiod
        istio.io/rev: <リビジョン番号>
    spec:
      containers:
        - args:
            - discovery
            # 15014番ポートの開放
            - --monitoringAddr=:15014
            - --log_output_level=default:info
            - --domain
            - cluster.local
            - --keepaliveMaxServerConnectionAge
            - 30m
          # pilotイメージ
          image: docker.io/istio/pilot:<リビジョン番号>
          imagePullPolicy: IfNotPresent
          # discoveryコンテナ
          name: discovery
          # 待ち受けるポート番号の仕様
          ports:
            # 8080番ポートの開放
            - containerPort: 8080
              protocol: TCP
            # 15010番ポートの開放
            - containerPort: 15010
              protocol: TCP
            # 15017番ポートの開放
            - containerPort: 15017
              protocol: TCP
          env:
            # 15012番ポートの開放
            - name: ISTIOD_ADDR
              value: istiod-<リビジョン番号>.istio-system.svc:15012 # 15012番ポートの開放

          ...

# 重要なところ以外を省略しているので、全体像はその都度確認すること。
```

> ↪️ 参考：https://github.com/istio/istio/blob/master/pilot/pkg/bootstrap/server.go#L412-L476

Dockerfileとしては、最後に`pilot-discovery`プロセスを実行している。

> ↪️ 参考：
>
> - https://github.com/istio/istio/blob/master/pilot/docker/Dockerfile.pilot
> - https://zenn.dev/link/comments/e8a978a00c6325

```dockerfile
ENTRYPOINT ["/usr/local/bin/pilot-discovery"]
```

そのため、`pilot-discovery`プロセスの実体は、GitHubの`pilot-discovery`ディレクトリ配下の`main.go`ファイルで実行されるGoのバイナリファイルである。

> ↪️ 参考：https://github.com/istio/istio/blob/master/pilot/cmd/pilot-discovery/main.go

#### ▼ HorizontalPodAutoscaler

Deployment配下のPodには、HorizontalPodAutoscalerが設定されている。

コントロールプレーンの可用性を高められる。

```yaml
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: istiod-<リビジョン番号>
  namespace: istio-system
  labels:
    app: istiod
    istio.io/rev: <リビジョン番号>
    release: istiod
spec:
  maxReplicas: 5
  minReplicas: 2
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: istiod-<リビジョン番号>
  targetCPUUtilizationPercentage: 80
```

<br>

### Service

`istio-proxy`コンテナからのリクエストを、Istiodコントロールプレーン (Deployment配下のPod) にポートフォワーディングする。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: istiod-<リビジョン番号>
  namespace: istio-system
  labels:
    app: istiod
    istio: pilot
    istio.io/rev: <リビジョン番号>
    release: istiod
spec:
  ports:
    # webhookサーバーに対するリクエストを待ち受ける。
    - name: https-webhook
      port: 443
      protocol: TCP
      targetPort: 15017
    # xDSサーバーに対するリクエストを待ち受ける。
    - name: grpc-xds
      port: 15010
      protocol: TCP
      targetPort: 15010
    # SSL証明書に関するリクエストを待ち受ける。
    - name: https-dns
      port: 15012
      protocol: TCP
      targetPort: 15012
    # メトリクス収集に関するリクエストを待ち受ける。
    - name: http-monitoring
      port: 15014
      protocol: TCP
      targetPort: 15014
  selector:
    # ルーティング先のistiodコントールプレーン (Deployment配下のPod)
    app: istiod
    istio.io/rev: <リビジョン番号>
```

<br>

### MutatingWebhookConfiguration

Podの作成/更新時にwebhookサーバーにリクエストを送信できるように、MutatingWebhookConfigurationでMutatingAdmissionWebhookプラグインを設定する。

`.webhooks.failurePolicy`キーで設定している通り、webhookサーバーのコールに失敗した場合は、Podの作成のためのkube-apiserverのコール自体がエラーとなる。

そのため、Istioが起動に失敗し続けると、サイドカーコンテナのインジェクションを有効しているPodがいつまでも作成されないことになる。

```yaml
apiVersion: admissionregistration.k8s.io/v1beta1
kind: MutatingWebhookConfiguration
metadata:
  name: istio-revision-tag-default
  labels:
    app: sidecar-injector
    istio.io/rev: <リビジョン番号>
    istio.io/tag: <エイリアス>
webhooks:
  - name: rev.namespace.sidecar-injector.istio.io
    # mutating-admissionステップ発火条件を登録する。
    rules:
      - apiGroups: [""]
        apiVersions: ["v1"]
        operations: ["CREATE", "UPDATE"]
        resources: ["pods"]
        scope: "*"
    # Webhookの前段にあるServiceの情報を登録する。
    clientConfig:
      service:
        name: istiod-<リビジョン番号>
        namespace: istio-system
        # エンドポイント
        path: "/inject"
        port: 443
      caBundle: Ci0tLS0tQk...
    # webhookサーバーのコールに失敗した場合の処理を設定する。
    failurePolicy: Fail
    matchPolicy: Equivalent
    # 適用するNamespaceを設定する。
    namespaceSelector:
      matchExpressions:
        - key: istio.io/rev
          operator: In
          values:
            - <エイリアス>
```

<br>

## 02-02. `discovery`コンテナ

### XDS-API

#### ▼ XDS-APIとは

pilot-agentを介して、Envoyとの間で定期的にリモートプロシージャーコールを双方向で実行し、宛先情報を送信する。

> ↪️ 参考：
>
> - https://cloudnative.to/blog/istio-pilot-3/
> - https://www.zhaohuabing.com/post/2019-10-21-pilot-discovery-code-analysis/
> - https://rocdu.gitbook.io/deep-understanding-of-istio/10/1#streamaggregatedresources
> - https://www.cnblogs.com/luozhiyun/p/14088989.html

#### ▼ XDS-APIの実装

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

> ↪️ 参考：
>
> - https://github.com/istio/istio/blob/master/pilot/pkg/xds/ads.go#L236-L238
> - https://github.com/istio/istio/blob/master/pilot/pkg/xds/ads.go#L307-L348
> - https://github.com/istio/istio/blob/master/pilot/pkg/xds/ads.go#L190-L233

実装が移行途中のため、xds-proxyにも、Envoyからのリモートプロシージャーコールを処理する同名のメソッドがある。

> ↪️ 参考：https://github.com/istio/istio/blob/master/pkg/istio-agent/xds_proxy.go#L299-L306

<br>

### インメモリストレージ

<br>

## 02-03. 待ち受けるポート番号

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

### `8080`番

`discovery`コンテナの`8080`番ポートでは、コントロールプレーンのデバッグエンドポイントに対するリクエストを待ち受ける。

`discovery`コンテナの`15014`番ポートにポートフォワーディングしながら、別に` go tool pprof`コマンドを実行することにより、Istioを実装するパッケージのリソース使用量を可視化できる。

> ↪️ 参考：https://www.zhaohuabing.com/istio-guide/docs/debug-istio/istio-debug/#%E6%9F%A5%E7%9C%8B-istiod-%E5%86%85%E5%AD%98%E5%8D%A0%E7%94%A8

```bash
# ポートフォワーディングを実行する。
$ kubectl port-forward svc/istiod-<リビジョン番号> 15014 -n istio-system

$ go tool pprof -http=:8080 localhost:15014/debug/pprof/heap

Fetching profile over HTTP from http://localhost:15014/debug/pprof/heap
Saved profile in /Users/hiroki-hasegawa/pprof/pprof.pilot-discovery.alloc_objects.alloc_space.inuse_objects.inuse_space.002.pb.gz
Serving web UI on http://localhost:8080

# どのパッケージでどのくらいハードウェアリソースを消費しているか
$ curl http://127.0.0.1:8080/ui/flamegraph?si=alloc_objects
```

<br>

### `9876`番

`discovery`コンテナの`9876`番ポートでは、ControlZダッシュボードに対するリクエストを待ち受ける。

ControlZダッシュボードでは、istiodコントロールプレーンの設定値を変更できる。

> ↪️ 参考：
>
> - https://istio.io/latest/docs/ops/diagnostic-tools/controlz/
> - https://jimmysong.io/en/blog/istio-components-and-ports/

<br>

### `15010`番

![istio_control-plane_service-discovery](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_control-plane_service-discovery.png)

`discovery`コンテナの`15010`番ポートでは、`istio-proxy`コンテナからのxDSサーバーに対するリモートプロシージャーコールを待ち受け、`discovery`コンテナ内のプロセスに渡す。

コールの内容に応じて、他のサービス (Pod、Node)の宛先情報を含むレスポンスを返信する。

`istio-proxy`コンテナはこれを受信し、pilot-agentがEnvoyの宛先情報設定を動的に変更する (サービスディスカバリー) 。

> ↪️ 参考：https://www.zhaohuabing.com/post/2020-06-12-third-party-registry-english/

![istio_service-registry](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_service-registry.png)

Istiodコントロールプレーンは、サービスレジストリ (例：etcd、ZooKeeper、consul catalog、nocos、cloud foundry) に登録された情報や、コンフィグストレージに永続化されたマニフェストの宣言 (ServiceEntry、WorkloadEntry) から、他のサービス (Pod、Node) の宛先情報を取得する。

`discovery`コンテナは、取得した宛先情報を自身に保管する。

> ↪️ 参考：
>
> - https://juejin.cn/post/7028572651421433892
> - https://www.zhaohuabing.com/post/2019-02-18-pilot-service-registry-code-analysis/
> - https://github.com/istio/istio/blob/693d97627e70f1e4eadeaede8bb5a18136c8feed/pilot/pkg/serviceregistry/provider/providers.go#L20-L27
> - https://www.kubernetes.org.cn/4208.html
> - https://etcd.io/docs/v3.3/learning/why/#comparison-chart

<br>

### `15012`番

`discovery`コンテナの`15012`番ポートでは、アプリコンテナ間で相互TLSによるHTTPSプロトコルを使用する場合に、`istio-proxy`コンテナからのSSL証明書に関するリクエストを待ち受け、`discovery`コンテナ内のプロセスに渡す。

リクエストの内容に応じて、SSL証明書と秘密鍵を含むレスポンスを返信する。

`istio-proxy`コンテナはこれを受信し、pilot-agentはEnvoyにこれらを紐づける。

また、SSL証明書の期限が切れれば、`istio-proxy`コンテナからのリクエストに応じて、新しいSSL証明書と秘密鍵を作成する。

![istio_control-plane_certificate](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_control-plane_certificate.png)

> ↪️ 参考：https://istio.io/latest/docs/concepts/security/#pki

<br>

### `15014`番

コンテナの`15014`番ポートでは、Istiodコントロールプレーンのメトリクスを監視するツールからのリクエストを待ち受け、`discovery`コンテナ内のプロセスに渡す。

リクエストの内容に応じて、データポイントを含むレスポンスを返信する。

```bash
# ポートフォワーディングを実行する。
$ kubectl port-forward svc/istiod-<リビジョン番号> 15014 -n istio-system

# デバッグダッシュボードにアクセスする。
$ curl http://127.0.0.1:15014/debug
```

> ↪️ 参考：
>
> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#metrics
> - https://www.zhaohuabing.com/istio-guide/docs/debug-istio/istio-debug/#istio-%E8%B0%83%E8%AF%95%E6%8E%A5%E5%8F%A3

<br>

### `15017`番

`discovery`コンテナの`15017`番ポートでは、Istioの`istiod-<リビジョン番号>`というServiceからのポートフォワーディングを待ち受け、`discovery`コンテナ内のプロセスに渡す。AdmissionReviewを含むレスポンスを返信する。

<br>
