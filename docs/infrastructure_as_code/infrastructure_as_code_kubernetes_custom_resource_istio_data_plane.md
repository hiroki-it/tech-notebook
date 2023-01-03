---
title: 【IT技術の知見】データプレーン＠Istio
description: データプレーン＠Istioの知見を記録しています。
---
# データプレーン＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. データプレーンとは

### サイドカープロキシメッシュの場合

サイドカープロキシメッシュのデータプレーンは、istio-iptables、 ```istio-init```コンテナ、```istio-proxy```コンテナ、から構成される。

> ℹ️ 参考：https://www.tigera.io/blog/running-istio-on-kubernetes-in-production-part-i/

<br>

### アンビエンドメッシュの場合

<br>

## 02. データプレーンの要素

### ```istio-init```コンテナ

#### ▼ ```istio-init```コンテナとは

コンテナの起動時に、```istio-iptables```コマンドを実行し、istio-iptablesをPodに適用する。

> ℹ️ 参考：https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process

![istio_istio-init](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_istio-init.png)

<br>

### istio-iptables

#### ▼ istio-iptablesとは

istio-iptablesは、```istio-proxy```コンテナを持つPod内のネットワークの経路を制御する。

サービスディスカバリーとしてPodのIPアドレスを持つのは```istio-proxy```コンテナであり、istio-iptablesではないことに注意する。

> ℹ️ 参考：https://zenn.dev/tayusa/articles/aa54bbff3d0d2d#iptables%E3%81%8C%E6%9B%B4%E6%96%B0%E3%81%95%E3%82%8C%E3%82%8B%E3%82%BF%E3%82%A4%E3%83%9F%E3%83%B3%E3%82%B0

```bash
# istio-initコンテナの起動時に実行する。
$ istio-iptables \
    -p 15001 \
    -z 15006 \
    -u 1337 \
    -m REDIRECT \
    -i * \
    -x \
    -b * \
    -d 15090,15021,15020
```


#### ▼ ルール

（１）```ps```コマンドを使用して、```istio-proxy```コンテナのプロセスのID（PID）を取得する。

```bash
# PIDが出力結果の2行目である。そのため、awkコマンドを使用して、2行目のみを取得している。
$ ps aux | grep envoy | awk '{print $2}'

1234567
2345678
3456789
```

（２）```nsenter```コマンドを使用して、コンテナの稼働するユーザー空間を介し、コンテナに```iptables```コマンドを送信する。Istioによって管理されているChainのルールを取得できる。

```bash
$ nsenter -t <istio-proxyコンテナのPID> -n iptables -L -n -t nat --line-number


Chain PREROUTING (policy ACCEPT)
...


Chain INPUT (policy ACCEPT)
...


Chain OUTPUT (policy ACCEPT)
...


Chain POSTROUTING (policy ACCEPT)
...


# istio-proxyコンテナへのインバウンド通信時に、NAPT処理を実行する。
Chain ISTIO_INBOUND (1 references)
num  target             prot  opt  source     destination
1    RETURN             tcp   --   0.0.0.0/0  0.0.0.0/0    tcp dpt:15008
2    RETURN             tcp   --   0.0.0.0/0  0.0.0.0/0    tcp dpt:15090 # メトリクス収集ツールからのリクエストを待ち受ける。
3    RETURN             tcp   --   0.0.0.0/0  0.0.0.0/0    tcp dpt:15021 # kubeletからの準備済みチェックを待ち受ける。
4    RETURN             tcp   --   0.0.0.0/0  0.0.0.0/0    tcp dpt:15020 # データプレーンのデバッグエンドポイントに対するリクエストを待ち受ける。
5    ISTIO_IN_REDIRECT  tcp   --   0.0.0.0/0  0.0.0.0/0


Chain ISTIO_IN_REDIRECT (3 references)
num  target    prot  opt  source     destination
1    REDIRECT  tcp   --   0.0.0.0/0  0.0.0.0/0    redir ports 15006 #


# istio-proxyコンテナからのアウトバウンド通信時に、NAPT処理を実行する。
Chain ISTIO_OUTPUT (1 references)
num  target             prot  opt  source     destination
1    RETURN             all   --   127.0.0.6  0.0.0.0/0
2    ISTIO_IN_REDIRECT  all   --   0.0.0.0/0  !127.0.0.1   owner UID match 1337
3    RETURN             all   --   0.0.0.0/0  0.0.0.0/0    ! owner UID match 1337
4    RETURN             all   --   0.0.0.0/0  0.0.0.0/0    owner UID match 1337
5    ISTIO_IN_REDIRECT  all   --   0.0.0.0/0  !127.0.0.1   owner GID match 1337
6    RETURN             all   --   0.0.0.0/0  0.0.0.0/0    ! owner GID match 1337
7    RETURN             all   --   0.0.0.0/0  0.0.0.0/0    owner GID match 1337
8    RETURN             all   --   0.0.0.0/0  127.0.0.1
9    ISTIO_REDIRECT     all   --   0.0.0.0/0  0.0.0.0/0


Chain ISTIO_REDIRECT (1 references)
num  target     prot  opt  source     destination
1    REDIRECT   tcp   --   0.0.0.0/0  0.0.0.0/0    redir ports 15001
```

> ℹ️ 参考：
>
> - https://jimmysong.io/en/blog/sidecar-injection-iptables-and-traffic-routing/
> - https://www.mapion.co.jp/news/column/cobs2366068-1-all/
> - https://zenn.dev/tayusa/articles/aa54bbff3d0d2d

#### ▼ Pod外からのインバウンド通信の場合

Pod外からアプリケーションコンテナへのインバウンド通信は、istio-iptablesにより、```istio-proxy```コンテナの```15006```番ポートにリダイレクトされる。

```istio-proxy```コンテナはこれを受信し、ローカルホスト（```http://localhost:<アプリケーションコンテナのポート番号>```）のアプリケーションコンテナにルーティングする。

![istio_iptables_inbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_iptables_inbound.png)

> ℹ️ 参考：
>
> - https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process
> - https://jimmysong.io/en/blog/istio-sidecar-traffic-types/#type-1-remote-pod---local-pod

#### ▼ Pod外へのアウトバウンド通信の場合

アプリケーションコンテナからPod外へのアウトバウンド通信は、istio-iptablesにより、```istio-proxy```コンテナの```15001```番ポートにリダイレクトされる。

サービスディスカバリーによってPod等の宛先情報が、```istio-proxy```コンテナ内のEnvoyに登録されており、```istio-proxy```コンテナはアウトバウンド通信をPodに向けてルーティングする。

> ℹ️ 参考：
>
> - https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process
> - https://jimmysong.io/en/blog/istio-sidecar-traffic-types/#type-2-local-pod---remote-pod

![istio_iptables_outbound_other](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_iptables_outbound_other.png)

#### ▼ ローカスホスト通信の場合

アプリケーションコンテナからローカルホスト（```http://localhost:<ポート番号>```）へのアウトバウンド通信は、istio-iptablesにより、```istio-proxy```コンテナの```15001```番ポートにリダイレクトされる。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-sidecar-traffic-types/#type-4-local-pod---local-pod

![istio_iptables_outbound_self](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_iptables_outbound_self.png)

<br>

### ```istio-proxy```コンテナ

![istio_istio-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_istio-proxy.png)

リバースプロキシの能力を持つサイドカーコンテナである。

Dockerfileとしては、Envoyのバイナリファイルをインストールした後にpilot-agentを実行している。

そのため、pilot-agent、Envoy、が稼働している。

```dockerfile

...

# Install Envoy.
ARG TARGETARCH
COPY ${TARGETARCH:-amd64}/${SIDECAR} /usr/local/bin/${SIDECAR}

...

# The pilot-agent will bootstrap Envoy.
ENTRYPOINT ["/usr/local/bin/pilot-agent"]
```

```istio-proxy```コンテナは、アプリケーションコンテナのあるPodのみでなく、IngressGatewayのPod内にも存在している。Istioのサービスメッシュ外のネットワークからのインバウンド通信では、IngressGateway内の```istio-proxy```コンテナにて、Pod等の宛先情報に基づいて、ルーティングを実行している。一方で、アプリケーションコンテナを持つPod間の通信では、Pod内の```istio-proxy```コンテナに登録されたものに基づいて、Pod間で直接的に通信している。 仕様上、NginxやApacheを必須とする言語（例：PHP）では、Pod内にリバースプロキシが```2```個ある構成になってしまうことに注意する。

> ℹ️ 参考：
>
> - https://github.com/istio/istio/blob/master/pilot/docker/Dockerfile.proxyv2
> - https://www.amazon.co.jp/dp/1617295825
> - https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process
> - https://jimmysong.io/en/blog/istio-sidecar-traffic-types/

<br>

### istio-cniアドオンによる```istio-validation```コンテナ

#### ▼ istio-cniアドオンとは

![istio_istio-cni](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_istio-cni.png)

各Node上で、```istio-cni-node```という名前のDaemonSetとして稼働する。

```istio-init```コンテナはistio-iptablesをPodに適用する権限を持っている。

しかし、Linuxのiptablesを操作するためにはroot権限が必要になるため、脆弱性が指摘されている（同様にして、ユーザーが```iptables```コマンドを実行する時も```sudo```権限が必要である）。

```istio-init```コンテナの代替案として、istio-cniアドオンが提供されている。

もしistio-cniアドオンを使用する場合は、```istio-init```コンテナが不要になる代わりとして、```istio-validation```コンテナが必要になる。

> ℹ️ 参考：
>
> - https://tanzu.vmware.com/developer/guides/service-routing-istio-refarch/
> - https://www.redhat.com/architect/istio-CNI-plugin
> - https://en.wikipedia.org/wiki/Iptables

#### ▼ ```istio-validation```コンテナ

istio-cniを採用している場合にのみそう挿入されるコンテナ。

istio-cniのDaemonSetがistio-iptablesを適用し終わることを待機するために、これが完了したかどうかを検証する。

> ℹ️ 参考：https://istio.io/latest/docs/setup/additional-setup/cni/#race-condition-mitigation

<br>

## 02-02. ```istio-proxy```コンテナ

### pilot-agent（旧istio-agent）

#### ▼ pilot-agentとは

元々は、istio-agentといわれていた。

実体は、GitHubの```pilot-agent```ディレクトリ配下の```main.go```ファイルで実行されるGoのバイナリファイルである。

ADS-APIとの間で双方向ストリーミングRPCを確立し、EnvoyからのADS-APIへのリクエストと反対にADS-APIからのリクエストを仲介する。

> ℹ️ 参考：
>
> - https://rocdu.gitbook.io/deep-understanding-of-istio/6/5
> - https://www.jianshu.com/p/60e45bc9c4ac
> - https://www.zhaohuabing.com/post/2019-10-21-pilot-discovery-code-analysis/
> - https://www.oreilly.com/library/view/the-enterprise-path/9781492041795/ch04.html

#### ▼ ADSクライアントの実装

```go
package adsc

import (

...

discovery "github.com/envoyproxy/go-control-plane/envoy/service/discovery/v3"

...
)
...

func (a *ADSC) Run() error {
	var err error

	// 双方向ストリーミングRPCの接続を確立する。
	a.client = discovery.NewAggregatedDiscoveryServiceClient(a.conn)

	// Envoyのgo-control-planeパッケージから提供されている。
	// https://github.com/envoyproxy/go-control-plane/blob/main/envoy/service/discovery/v3/ads.pb.go#L213-L220
	// また。.protoファイルで双方向ストリーミングRPCとして定義されている。
	// https://github.com/envoyproxy/envoy/blob/main/api/envoy/service/discovery/v3/ads.proto#L32-L33
	a.stream, err = a.client.StreamAggregatedResources(context.Background())

	if err != nil {
		return err
	}

	a.sendNodeMeta = true

	a.InitialLoad = 0

	for _, r := range a.cfg.InitialDiscoveryRequests {
		if r.TypeUrl == v3.ClusterType {
			a.watchTime = time.Now()
		}
		// istio-proxyコンテナの起動時に、Istiodコントロールプレーンにリクエストを送信する。
		_ = a.Send(r)
	}


	a.RecvWg.Add(1)

	// ADS-APIからリクエストを受信し、Envoyの各処理コンポーネント別に整理する。
	go a.handleRecv()

	return nil
}
```

> ℹ️ 参考：
>
> - https://github.com/istio/istio/blob/master/pkg/adsc/adsc.go#L420-L446
> - https://github.com/istio/istio/blob/

```handleRecv```メソッド内で、Envoyの各処理コンポーネントを整理し、最後に```XDSUpdates```チャンネルに値を送信している。



> ℹ️ 参考：https://github.com/istio/istio/blob/master/pkg/adsc/adsc.go#L544-L587

```go
func (a *ADSC) handleRecv() {
	
    for{
		
		...

        a.VersionInfo[msg.TypeUrl] = msg.VersionInfo
        switch msg.TypeUrl {

        // 受信した宛先Podのリスナー値を処理する。
        case v3.ListenerType:
	    	listeners := make([]*listener.Listener, 0, len(msg.Resources))
	    	for _, rsc := range msg.Resources {
                ...
            }
            a.handleLDS(listeners)

        // 受信した宛先Podのクラスター値を処理する。
        case v3.ClusterType:
            clusters := make([]*cluster.Cluster, 0, len(msg.Resources))
            for _, rsc := range msg.Resources {
                ...
            }
            a.handleCDS(clusters)

        // 受信した宛先Podのエンドポイント値を処理する。
        case v3.EndpointType:
            eds := make([]*endpoint.ClusterLoadAssignment, 0, len(msg.Resources))
            for _, rsc := range msg.Resources {
                ...
            }
            a.handleEDS(eds)

        // 受信した宛先Podのルート値を処理する。
        case v3.RouteType:
            routes := make([]*route.RouteConfiguration, 0, len(msg.Resources))
            for _, rsc := range msg.Resources {
                ...
            }
            a.handleRDS(routes)
		
        default:
            if isMCP {
	    		a.handleMCP(gvk, msg.Resources)
            }
	    }

        ...

        select {
        // XDSUpdatesチャンネルに値を送信する。
        // 最終的に、Envoyに設定する。
        case a.XDSUpdates <- msg:
        default:
        }
    }
}
```

#### ▼ ADSクライアントとしての```istioctl```コマンドの実装

```Run```メソッドによるXDS-APIとの通信は、```istioctl```コマンドでも使用されている。

> ℹ️ 参考：https://github.com/istio/istio/blob/master/istioctl/pkg/xds/client.go#L44-L73

```go
func GetXdsResponse(dr *discovery.DiscoveryRequest, ns string, serviceAccount string, opts clioptions.CentralControlPlaneOptions, grpcOpts []grpc.DialOption,) (*discovery.DiscoveryResponse, error) {

	...
	
	err = adscConn.Run()
	if err != nil {
		return nil, fmt.Errorf("ADSC: failed running %v", err)
	}

	err = adscConn.Send(dr)
	if err != nil {
		return nil, err
	}
	
	response, err := adscConn.WaitVersion(opts.Timeout, dr.TypeUrl, "")
	return response, err
}
```

<br>

### Envoy

#### ▼ Envoyとは

```istio-proxy```コンテナにて、リバースプロキシとして動作する。Envoyは、pilot-agentを介して、ADS-APIにリモートプロシージャーコールを実行する。また反対に、XDS-APIからのリモートプロシージャーコールをpilot-agentを介して受信する。

> ℹ️ 参考：
>
> - https://www.zhaohuabing.com/post/2019-10-21-pilot-discovery-code-analysis/
> - https://www.programmersought.com/article/5797698845/
> - https://blog.51cto.com/wangguishe/5800533

<br>

## 02-03. 待ち受けるポート番号

### ```15000```番

```istio-proxy```コンテナの```15000```番ポートでは、Envoyのダッシュボードに対するリクエストを待ち受ける。

```bash
# istio-proxyコンテナ内でローカルホストにリクエストを送信する。
istio-proxy@<Pod名>: $ curl http://localhost:15000/config_dump
```

> ℹ️ 参考：
>
> - https://www.envoyproxy.io/docs/envoy/latest/operations/admin#get--config_dump
> - https://jimmysong.io/en/blog/istio-components-and-ports/#15000
> - https://www.envoyproxy.io/docs/envoy/latest/operations/admin

<br>

### ```15001```番

```istio-proxy```コンテナの```15001```番ポートでは、アプリケーションコンテナからのアウトバウンド通信を待ち受ける。

アプリケーションコンテナからのアウトバウンド通信は、一度、```istio-proxy```コンテナの```15001```番ポートにリダイレクトされる。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

<br>

### ```15004```番

```istio-proxy```コンテナの```15004```番ポートでは、コントロールプレーンのコンテナの```8080```番ポートと一緒に使用される。

用途がわからず調査中...

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#15004

<br>

### ```15006```番

```istio-proxy```コンテナの```15006```番ポートでは、アプリケーションコンテナへのインバウンド通信を待ち受ける。

アプリケーションコンテナへのインバウンド通信は、一度、```istio-proxy```コンテナの```15006```番ポートにリダイレクトされる。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

<br>

### ```15020```番

```istio-proxy```コンテナの```15020```番ポートでは、データプレーンのデバッグエンドポイントに対するリクエストを待ち受ける。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#15020

<br>

### ```15021```番

```istio-proxy```コンテナの```15021```番ポートでは、kubeletからの準備済みチェックを待ち受ける。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

<br>

### ```15053```番

調査中...

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

<br>

### ```15090```番

```istio-proxy```コンテナの```15090```番ポートでは、```istio-proxy```コンテナのメトリクス収集ツールからのリクエストを待ち受け、Envoyに渡される。

リクエストの内容に応じて、データポイントを含むレスポンスを返信する。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

<br>
