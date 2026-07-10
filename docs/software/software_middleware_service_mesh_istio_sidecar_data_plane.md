---
title: 【IT技術の知見】データプレーン＠Istioサイドカー
description: データプレーン＠Istioサイドカーの知見を記録しています。
---

# データプレーン＠Istioサイドカー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. サイドカーモードのデータプレーンの仕組み

![istio_sidecar-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_sidecar-mesh_architecture.png)

サイドカーモードのデータプレーンは、istio-iptables、 `istio-init` コンテナ、istio-proxy、といったコンポーネントから構成される。

サイドカープロキシを使用して、サービスメッシュを実装する。

サイドカーは、`L4` (トランスポート層) のプロトコル (例：TCP、UDP など) と `L7` (アプリケーション層) のプロトコル (例：HTTP、HTTPS など) を処理できる。

> - https://istio.io/latest/docs/ops/deployment/architecture/
> - https://techblog.zozo.com/entry/zozotown-istio-production-ready
> - https://www.amazon.co.jp/dp/1617295825

<br>

## 02. データプレーンの要素

### `istio-init` コンテナ

#### ▼ `istio-init` コンテナとは

コンテナの起動時、`istio-iptables` コマンドを実行することにより、istio-iptables を Pod に適用する。

![istio_istio-init](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_istio-init.png)

> - https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process

<br>

### istio-iptables

#### ▼ istio-iptablesとは

istio-iptables は、istio-proxy を持つ Pod 内のネットワークの経路を制御する。

サービス検出として Pod の IP アドレスを持つのは istio-proxy であり、istio-iptables ではないことに注意する。

```bash
# istio-initコンテナの起動時に実行する。
$ pilot-agent istio-iptables \
    -p 15001 \
    -z 15006 \
    -u 1337 \
    -m REDIRECT \
    -i * \
    -x \
    -b * \
    -d 15090,15020
```

> - https://zenn.dev/tayusa/articles/aa54bbff3d0d2d#iptables%E3%81%8C%E6%9B%B4%E6%96%B0%E3%81%95%E3%82%8C%E3%82%8B%E3%82%BF%E3%82%A4%E3%83%9F%E3%83%B3%E3%82%B0

#### ▼ ルール

`(1)`

: `ps` コマンドを使用して、istio-proxy の `envoy` プロセスの ID (PID) を取得する。

```bash
# PIDが出力結果の2行目である。そのため、awkコマンドを使用して、2行目のみを取得している。
$ ps aux | grep envoy | awk '{print $2}'

1234567
2345678
3456789
```

`(2)`

: `nsenter` コマンドを使用して、コンテナの稼働するユーザー空間を介し、コンテナに `iptables` コマンドを送信する。Istio によって管理されている Chain のルールを取得できる。

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


# istio-proxyコンテナへのインバウンド通信時、NAPT処理を実行する。
Chain ISTIO_INBOUND (1 references)
num  target             prot  opt  source     destination
1    RETURN             tcp   --   0.0.0.0/0  0.0.0.0/0    tcp dpt:15008
2    RETURN             tcp   --   0.0.0.0/0  0.0.0.0/0    tcp dpt:15090 # データポイント収集ツールからのリクエストを待ち受ける。
3    RETURN             tcp   --   0.0.0.0/0  0.0.0.0/0    tcp dpt:15021 # kubeletからのReadinessProbeヘルスチェックを待ち受ける。
4    RETURN             tcp   --   0.0.0.0/0  0.0.0.0/0    tcp dpt:15020 # データプレーンのデバッグエンドポイントに対するリクエストを待ち受ける。
5    ISTIO_IN_REDIRECT  tcp   --   0.0.0.0/0  0.0.0.0/0


Chain ISTIO_IN_REDIRECT (3 references)
num  target    prot  opt  source     destination
1    REDIRECT  tcp   --   0.0.0.0/0  0.0.0.0/0    redir ports 15006 #


# istio-proxyコンテナからのアウトバウンド通信時、NAPT処理を実行する。
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

> - https://jimmysong.io/en/blog/sidecar-injection-iptables-and-traffic-routing/
> - https://www.mapion.co.jp/news/column/cobs2366068-1-all/
> - https://zenn.dev/tayusa/articles/aa54bbff3d0d2d

#### ▼ ローカルホストは `127.0.0.1` ではない

istio-proxy がインバウンドをマイクロサービスに送信するとき、`127.0.0.6` にリクエストを送信する。

`127.0.0.1` にすると iptables 上で処理がループしてしまう。

Istio`v1.9` までは `127.0.0.1` で、`v1.10` から `127.0.0.6` になった。

> - https://docs.google.com/document/d/1j-5_XpeMTnT9mV_8dbSOeU7rfH-5YNtN_JJFZ2mmQ_w
> - https://github.com/istio/istio/issues/29603
> - https://jimmysong.io/en/blog/sidecar-injection-iptables-and-traffic-routing/
> - https://engineering.mercari.com/blog/entry/20211021-istio1-10-inbound-fowarding/

#### ▼ Pod外からのインバウンド通信の場合

Pod 外からマイクロサービスへのインバウンド通信は、istio-iptables により、istio-proxy の `15006` 番ポートにリダイレクトされる。

istio-proxy はこれを受信し、ローカルホスト (`http://127.0.0.6:<マイクロサービスのポート番号>`) のマイクロサービスにルーティングする。

![istio_iptables_inbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_iptables_inbound.png)

> - https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process
> - https://jimmysong.io/en/blog/istio-sidecar-traffic-types/#type-1-remote-pod---local-pod

#### ▼ Pod外へのアウトバウンド通信の場合

マイクロサービスから Pod 外へのアウトバウンド通信は、istio-iptables により、istio-proxy の `15001` 番ポートにリダイレクトされる。

サービス検出によって Pod 等の宛先情報が、istio-proxy 内の Envoy に登録されており、istio-proxy はアウトバウンド通信を Pod に向けてルーティングする。

![istio_iptables_outbound_other](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_iptables_outbound_other.png)

> - https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process
> - https://jimmysong.io/en/blog/istio-sidecar-traffic-types/#type-2-local-pod---remote-pod

#### ▼ ローカルホスト通信の場合

マイクロサービスからローカルホスト (`http://127.0.0.6:<ポート番号>`) へのアウトバウンド通信は、istio-iptables により、istio-proxy の `15001` 番ポートにリダイレクトされる。

![istio_iptables_outbound_self](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_iptables_outbound_self.png)

> - https://jimmysong.io/en/blog/istio-sidecar-traffic-types/#type-4-local-pod---local-pod

<br>

### istio-proxy

#### ▼ istio-proxyとは

![istio_istio-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_istio-proxy.png)

リバースプロキシの能力を持つサイドカーコンテナである。

Dockerfile としては、Envoy のバイナリファイルをインストールした後に pilot-agent を実行している。

そのため、pilot-agent、Envoy が稼働している。

```dockerfile

...

# Install Envoy.
ARG TARGETARCH
COPY ${TARGETARCH:-amd64}/${SIDECAR} /usr/local/bin/${SIDECAR}

...

# The pilot-agent will bootstrap Envoy.
ENTRYPOINT ["/usr/local/bin/pilot-agent"]
```

istio-proxy は、マイクロサービスのある Pod のみでなく、Istio Ingress Gateway の Pod 内にも存在している。

Istio のサービスメッシュ外のネットワークからのインバウンド通信では、Istio Ingress Gateway 内の istio-proxy にて、Pod 等の宛先情報に基づいて、ルーティングを実行している。

一方で、マイクロサービスを持つ Pod 間通信では、Pod 内の istio-proxy へ登録されたものに基づき、Pod 間で直接通信している。

仕様上、Nginx や Apache を必須とする言語 (例：PHP) では、Pod 内にリバースプロキシが `2` 個ある構成になってしまうことに注意する。

> - https://github.com/istio/istio/blob/1.14.3/pilot/docker/Dockerfile.proxyv2
> - https://www.amazon.co.jp/dp/1617295825
> - https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process
> - https://jimmysong.io/en/blog/istio-sidecar-traffic-types/

#### ▼ 起動／終了の順番の制御

マイクロサービスと istio-proxy の間で、起動／終了の順番を制御する必要がある。

`.spec.containers[*].lifecycle.postStart.exec.command` キーや `.spec.containers[*].lifecycle.preStop.exec.command` キーに自前のコマンドを定義して istio-proxy の起動／終了の順番を制御する必要がある。

ただし、以下のいずれかで不要になる。

- 通常の istio-proxy の場合
  - `holdApplicationUntilProxyStarts` キーを `true` にする (`.spec.containers[*].lifecycle.postStart.exec.command` キーへ対応)
  - `EXIT_ON_ZERO_ACTIVE_CONNECTIONS` 変数を `true` に設定する (`.spec.containers[*].lifecycle.preStop.exec.command` キーへ対応)
- InitContainer による istio-proxy を使用する場合 (両方に対応)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
  template:
    spec:
      containers:
        - name: app
          image: app
        # istio-proxyコンテナの設定を変更する。
        - name: istio-proxy
          lifecycle:
            # istio-proxyコンテナ開始直後の処理
            postStart:
              exec:
                # istio-proxyコンテナが、必ずマイクロサービスよりも先に起動する。
                # pilot-agentの起動完了を待機する。
                command:
                  - |
                    pilot-agent wait
            # istio-proxyコンテナ終了直前の処理
            preStop:
              exec:
                # istio-proxyコンテナが、必ずマイクロサービスよりも後に終了する。
                # envoyプロセスとpilot-agentプロセスの終了を待機する。
                command:
                  - "/bin/bash"
                  - "-c"
                  - |
                    sleep 5
                    while [ $(netstat -plnt | grep tcp | egrep -v 'envoy|pilot-agent' | wc -l) -ne 0 ]; do sleep 1; done
      # マイクロサービスとistio-proxyコンテナの両方が終了するのを待つ
      terminationGracePeriodSeconds: 45
```

> - https://sreake.com/blog/istio-proxy-stop-behavior/
> - https://umi0410.github.io/en/blog/devops/istio-exit-on-zero-active-connections/

#### ▼ InitContainerとして

Kubernetes の `v1.28` では、InitContainer でサイドカーを作成できるようになった。

`pilot-agent` コマンドの実行時に `ENABLE_NATIVE_SIDECARS` 変数を渡せばよい。

Istio でもこれをサポートしている。

istio-proxy のインジェクションの仕組みはそのままで、Pod のマニフェストの Patch 処理の内容を InitContainer のインジェクションに変更している。

これにより、Pod の作成時に InitContainer をインジェクションできるようになる。

今まで、`.spec.containers[*].lifecycle.preStop.exec.command` キーや `.spec.containers[*].lifecycle.postStart.exec.command` キーに自前のコマンドを定義して istio-proxy の起動／終了の順番を制御する必要があった。

しかし、InitContainer では Kubernetes が起動／終了の順番を制御してくれるため、設定が不要になる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
      volumeMounts:
        - name: app-volume
          mountPath: /go/src
  initContainers:
    - name: istio-proxy
      image: istio/proxyv2:latest
      restartPolicy: Always
```

> - https://github.com/istio/istio/blob/1.19.0-beta.0/pkg/kube/inject/inject.go#L426-L436
> - https://github.com/kubernetes/enhancements/tree/master/keps/sig-node/753-sidecar-containers#proposal

<br>

### istio-cniによる `istio-validation` コンテナ

#### ▼ istio-iniとの関係性

![istio_istio-cni](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_istio-cni.png)

`istio-init` コンテナは、Pod のネットワーク名前空間内で `istio-iptables` を実行し、iptables ルールを設定する。

しかし、iptables の操作には特権 (例：`CAP_NET_ADMIN`) が必要になりやすく、Pod ごとに特権 initContainer を持ち込む構成は攻撃面を広げるため、避けたいケースがある。

`istio-init` コンテナの代替案として、istio-cni が提供されている。

istio-cni を使用する場合、iptables の設定はノード上の istio-cni (DaemonSet) が実施するため、通常は `istio-init` コンテナが不要になる。

その代わり、iptables の設定完了を待つために `istio-validation` (initContainer) が挿入されることがある (race condition 対策) 。

> - https://tanzu.vmware.com/developer/guides/service-routing-istio-refarch/
> - https://www.redhat.com/architect/istio-CNI-plugin
> - https://istio.io/latest/docs/setup/additional-setup/cni/#race-condition-mitigation
> - https://en.wikipedia.org/wiki/Iptables

#### ▼ istio-cniとは

各 Node 上で、istio-cni は `istio-cni-node` という名前の DaemonSet として稼働する。

istio-cni は、CNI プラグインのバイナリと設定を Node 上のファイルシステムに配置する。

Kubernetes の Pod 作成時に、CNI の仕組みを介して Pod のネットワーク名前空間に対して iptables 設定する。

> - https://www.solo.io/blog/traffic-ambient-mesh-istio-cni-node-configuration
> - https://istio.io/latest/docs/setup/additional-setup/cni/

#### ▼ `istio-validation` コンテナ

istio-cni を採用している場合にのみ挿入されるコンテナ。

istio-cni の DaemonSet が istio-iptables を適用し終了することを待機するために、これが完了したかどうかを検証する。

> - https://istio.io/latest/docs/setup/additional-setup/cni/#race-condition-mitigation

<br>

## 02-02. istio-proxy

### pilot-agent (新istio-agent)

#### ▼ pilot-agentとは

もともとは、istio-agent といわれていた。

実体は、GitHub の `pilot-agent` ディレクトリ配下の `main.go` ファイルで実行される Go のバイナリファイルである。

ADS-API との間で双方向ストリーミング RPC を確立し、Envoy からの ADS-API へのリクエストと反対に ADS-API からのリクエストを中継する。

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
	// https://github.com/envoyproxy/go-control-plane/blob/v0.11.0/envoy/service/discovery/v3/ads.pb.go#L213-L220
	// また。.protoファイルで双方向ストリーミングRPCとして定義されている。
	// https://github.com/envoyproxy/envoy/blob/v1.25.0/api/envoy/service/discovery/v3/ads.proto#L32-L33
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
		// istio-proxyコンテナの起動時、Istiodコントロールプレーンにリクエストを送信する。
		_ = a.Send(r)
	}


	a.RecvWg.Add(1)

	// ADS-APIからリクエストを受信し、Envoyの各処理コンポーネント別に整理する。
	go a.handleRecv()

	return nil
}
```

> - https://github.com/istio/istio/blob/1.14.3/pkg/adsc/adsc.go#L420-L446

`handleRecv()` 関数内で、Envoy の各処理コンポーネントを整理し、最後に `XDSUpdates` チャネルへ値を送信している。

```go
func (a *ADSC) handleRecv() {

    for{

		...

        a.VersionInfo[msg.TypeUrl] = msg.VersionInfo
        switch msg.TypeUrl {

        // 受信した宛先Podのリスナーを処理する。
        case v3.ListenerType:
	    	listeners := make([]*listener.Listener, 0, len(msg.Resources))
	    	for _, rsc := range msg.Resources {
                ...
            }
            a.handleLDS(listeners)

        // 受信した宛先Podのクラスターを処理する。
        case v3.ClusterType:
            clusters := make([]*cluster.Cluster, 0, len(msg.Resources))
            for _, rsc := range msg.Resources {
                ...
            }
            a.handleCDS(clusters)

        // 受信した宛先Podのエンドポイントを処理する。
        case v3.EndpointType:
            eds := make([]*endpoint.ClusterLoadAssignment, 0, len(msg.Resources))
            for _, rsc := range msg.Resources {
                ...
            }
            a.handleEDS(eds)

        // 受信した宛先Podのルートを処理する。
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
        // XDSUpdatesチャネルに値を送信する。
        // 最終的に、Envoyに設定する。
        case a.XDSUpdates <- msg:
        default:
        }
    }
}
```

> - https://github.com/istio/istio/blob/1.14.3/pkg/adsc/adsc.go#L544-L587

#### ▼ ADSクライアントとしての `istioctl` コマンドの実装

`Run()` 関数による XDS-API との通信は、`istioctl` コマンドでも使用されている。

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

> - https://github.com/istio/istio/blob/1.14.3/istioctl/pkg/xds/client.go#L44-L73

<br>

### Envoy

#### ▼ Envoyとは

istio-proxy にて、リバースプロキシとして動作する。Envoy は、pilot-agent を介して、ADS-API にリモートプロシージャーコールを実行する。また反対に、XDS-API からのリモートプロシージャーコールを pilot-agent を介して受信する。

> - https://www.zhaohuabing.com/post/2019-10-21-pilot-discovery-code-analysis/
> - https://www.programmersought.com/article/5797698845/
> - https://blog.51cto.com/wangguishe/5800533

<br>

### ヘルスチェック

#### ▼ 自身のstartProbe

istio-proxy は、`10` 分以上起動が完了しないと、Pod が終了する。

> - https://istio.io/latest/news/releases/1.20.x/announcing-1.20/upgrade-notes/#startupprobe-added-to-sidecar-by-default

#### ▼ マイクロサービスのHTTPヘルスチェック

Istio のパケット暗号化で相互 TLS を導入している場合、istio-proxy がリクエストを受信するために、クライアント証明書が必要である。

しかし、Istio は kubelet にクライアント証明書を組み込めないため、このままだと istio-proxy は kubelet からのヘルスチェックを拒否してしまう。

そのため、Istio で相互 TLS 認証を有効化していると、kubelet が HTTP ヘルスチェックを istio-proxy に実施した場合、証明書のないエラーで HTTP ヘルスチェックは失敗してしまう。

これの対策として、以下の仕組みで HTTP ヘルスチェックを成功させる。

1. Istio は、サイドカーインジェクション時、マイクロサービスの LivenessProbe ヘルスチェックと ReadinessProbe ヘルスチェックのパスを `/app-health/<コンテナ名>/livez` と `/app-health/<コンテナ名>/readyz` に書き換え、元のパスを `ISTIO_KUBE_APP_PROBERS` に保存する。
2. kubelet は Pod に HTTP ヘルスチェックを送信する。
3. istio-proxy は kubelet の HTTP ヘルスチェックを受信する。`ISTIO_KUBE_APP_PROBERS` から元のパスを取得し、マイクロサービスに HTTP ヘルスチェックをリダイレクトする。続けて、istio-proxy はマイクロサービスからレスポンスを受信する。最後に、kubelet に HTTP ヘルスチェックを返信する。

なお、Pod の `.metadata.annotations` に `sidecar.istio.io/rewriteAppHTTPProbers: "false"` を設定しておくと、これを無効化できる。

> - https://istio.io/latest/docs/ops/configuration/mesh/app-health-check/
> - https://ieevee.com/tech/2022/06/27/10-health-check.html#%E5%81%A5%E5%BA%B7%E7%9B%91%E6%B5%8B

#### ▼ マイクロサービスのTCPヘルスチェック

kubelet は、対象のポート番号でプロセスがリクエストを待ち受けているかのみを検証する。

そのため、マイクロサービスが異常であっても istio-proxy が正常である限り、kubelet の TCP ヘルスチェックが成功してしまう。

これの対策として、istio-proxy は、kubelet から受信した TCP ヘルスチェックをマイクロサービスに送信する。

これにより、kueblet がマイクロサービスに TCP ヘルスチェックを実施できるようになる。

> - https://istio.io/latest/docs/ops/configuration/mesh/app-health-check/
> - https://ieevee.com/tech/2022/06/27/10-health-check.html#%E5%81%A5%E5%BA%B7%E7%9B%91%E6%B5%8B

<br>

### istio-proxyが終了するまでの仕組み

![pod_terminating_process_istio-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pod_terminating_process_istio-proxy.png)

istio-proxy は、Envoy プロセスを安全に停止する。

`(1)`

: istio-proxy は Graceful Drain モード待機時間を開始する。

`(2)`

: Envoy は、接続のドレイン処理を実施する。

    Podの`.metadata.annotations.proxy.istio.io/config.terminationDrainDuration`値 (デフォルト`5`秒) の待機時間だけ、リクエストを受信しながら移行していく。

`(3)`

: Envoy は、プロセスの Graceful Drain モードを終了する。

`(4)`

: istio-proxy に SIGKILL シグナルを送信する。

> - https://sreake.com/blog/istio-proxy-stop-behavior/
> - https://christina04.hatenablog.com/entry/k8s-graceful-stop-with-istio-proxy
> - https://speakerdeck.com/nagapad/abema-niokeru-gke-scale-zhan-lue-to-anthos-service-mesh-huo-yong-shi-li-deep-dive?slide=80

<br>

## 02-03. 待ち受けるポート番号

### `15000` 番

istio-proxy の `15000` 番ポートでは、Envoy のダッシュボードに対するリクエストを待ち受ける。

```bash
# istio-proxyコンテナ内でローカルホストにリクエストを送信する。
istio-proxy@<Pod名>: $ curl http://127.0.0.1:15000/config_dump
```

> - https://www.envoyproxy.io/docs/envoy/latest/operations/admin#get--config_dump
> - https://jimmysong.io/en/blog/istio-components-and-ports/#15000
> - https://www.envoyproxy.io/docs/envoy/latest/operations/admin

<br>

### `15001` 番

istio-proxy の `15001` 番ポートでは、マイクロサービスからのアウトバウンド通信を待ち受ける。

マイクロサービスからのアウトバウンド通信は、一度、istio-proxy の `15001` 番ポートにリダイレクトされる。

> - https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

<br>

### `15004` 番

istio-proxy の `15004` 番ポートでは、コントロールプレーンのコンテナの `8080` 番ポートと一緒に使用される。

用途がわからず記入中...

> - https://jimmysong.io/en/blog/istio-components-and-ports/#15004

<br>

### `15006` 番

istio-proxy の `15006` 番ポートでは、マイクロサービスへのインバウンド通信を待ち受ける。

マイクロサービスへのインバウンド通信は、一度、istio-proxy の `15006` 番ポートにリダイレクトされる。

> - https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

<br>

### `15020` 番

istio-proxy の `15020` 番ポートでは、データプレーンのデバッグエンドポイントに対するリクエストを待ち受ける。

> - https://jimmysong.io/en/blog/istio-components-and-ports/#15020

<br>

### `15021` 番

istio-proxy の `15021` 番ポートでは、kubelet からの ReadinessProbe ヘルスチェックを待ち受ける。

istio-proxy 内の Envoy が、`/healthz/ready` エンドポイントで ReadinessProbe ヘルスチェックを待ち受けており、もし Envoy が停止してれば `503` レスポンスを返却する。

> - https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar
> - https://sreake.com/blog/istio-proxy-stop-behavior/

<br>

### `15053` 番

記入中...

> - https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

<br>

### `15090` 番

istio-proxy の `15090` 番ポートでは、istio-proxy のデータポイント収集ツール (例：Prometheus) からのリクエストを待ち受ける。

istio-proxy 内の Envoy が、`/stats/prometheus` エンドポイントでリクエストを待ち受けており、データポイントを含むレスポンスを返信する。

ただ、`discovery` コンテナにも `/stats/prometheus` エンドポイントがあり、データポイント収集ツールはこれを指定することが多い。

```bash
$ kubectl exec \
    -it foo-pod \
    -n foo-namespace \
    -c istio-proxy \
    -- bash -c "curl http://127.0.0.1:15090/stats/prometheus"

istio_build{component="proxy",tag="<リビジョン>"} 1

...

istio_request_bytes_count{...}
istio_request_messages_total{...}

...
```

> - https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

<br>

## 03. pilot-agentコマンド

### 実行オプションの渡し方

istio-proxy の起動時に引数として渡す。

Pod であれば、`.spec.containers[*].args` オプションを使用する。

<br>

### proxy

#### ▼ router

istio-proxy をメッシュゲートウェイ (Istio Ingress GAteway、Istio Egress Gateway) として実行する。

```bash
$ pilot-agent proxy router
```

#### ▼ sidecar

istio-proxy をサイドカーとして実行する。

```bash
$ pilot-agent proxy sidecar
```

### wait

istio-proxy のプロセスが起動完了するまで待機する。

```bash
$ pilot-agent wait
```

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#pilot-agent-wait

<br>

## 04. pilot-agentコマンドの環境変数

### `SECRET_TTL	`

istio-proxy の証明書の有効期限を設定する。

> - https://istio.io/latest/docs/reference/commands/pilot-agent/

<br>
