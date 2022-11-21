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

### サイドカープロキシによるサービスメッシュの場合

サイドカープロキシによるサービスメッシュのデータプレーンは、istio-iptables、 ```istio-init```コンテナ、```istio-proxy```コンテナ、から構成される。

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

istio-iptablesは、```istio-proxy```コンテナを持つPod内のネットワークの経路を制御する。サービスディスカバリーとしてPodのIPアドレスを持つのは```istio-proxy```コンテナであり、istio-iptablesではないことに注意する。

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

#### ▼ Pod外からのインバウンド通信の場合

Pod外からアプリケーションコンテナへのインバウンド通信は、istio-iptablesにより、```istio-proxy```コンテナの```15006```番ポートにリダイレクトされる。```istio-proxy```コンテナはこれを受信し、ローカルホスト（```http://localhost:<アプリケーションコンテナのポート番号>```）のアプリケーションコンテナにルーティングする。

![istio_iptables_inbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_iptables_inbound.png)

> ℹ️ 参考：
>
> - https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process
> - https://jimmysong.io/en/blog/istio-sidecar-traffic-types/#type-1-remote-pod---local-pod

#### ▼ Pod外へのアウトバウンド通信の場合

アプリケーションコンテナからPod外へのアウトバウンド通信は、istio-iptablesにより、```istio-proxy```コンテナの```15001```番ポートにリダイレクトされる。サービスディスカバリーによってPodの宛先情報が、```istio-proxy```コンテナ内の```envoy```プロセスに登録されており、```istio-proxy```コンテナはアウトバウンド通信をPodに向けてルーティングする。


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

#### ▼ ```istio-proxy```コンテナとは

![istio_istio-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_istio-proxy.png)

リバースプロキシの能力を持つサイドカーコンテナである。Dockerfileとしては、Envoyのバイナリファイルをインストールした後に```pilot-agent```プロセスを実行している。そのため、```pilot-agent```プロセス、```envoy```プロセス、が稼働している。```istio-proxy```コンテナは、アプリケーションコンテナのあるPodのみでなく、IngressGatewayのPod内にも存在している。Istioのサービスメッシュ外のネットワークからのインバウンド通信では、IngressGateway内の```istio-proxy```コンテナにて、Podの宛先情報に基づいて、ルーティングを実行している。一方で、アプリケーションコンテナを持つPod間の通信では、Pod内の```istio-proxy```コンテナに登録されたものに基づいて、Pod間で直接的に通信している。 仕様上、NginxやApacheを必須とする言語（例：PHP）では、Pod内にリバースプロキシが```2```個ある構成になってしまうことに注意する。

```dockerfile

...

# Install Envoy.
ARG TARGETARCH
COPY ${TARGETARCH:-amd64}/${SIDECAR} /usr/local/bin/${SIDECAR}

...

# The pilot-agent will bootstrap Envoy.
ENTRYPOINT ["/usr/local/bin/pilot-agent"]
```

> ℹ️ 参考：
>
> - https://github.com/istio/istio/blob/master/pilot/docker/Dockerfile.proxyv2
> - https://www.amazon.co.jp/dp/B09XN9RDY1
> - https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process
> - https://jimmysong.io/en/blog/istio-sidecar-traffic-types/

#### ▼ ```pilot-agent```プロセス（旧```istio-agent```）

元々は、```istio-agent```といわれていた。```istio-proxy```コンテナにて、Istiodコントロールプレーンとの間でリモートプロシージャーコール（他Podの宛先情報、SSL証明書、など）を双方向で実行する。実体は、GitHubの```pilot-agent```ディレクトリ配下の```main.go```ファイルで実行されるGoのバイナリファイルである。また、取得したPodの宛先情報を```envoy```プロセスの設定を変更する。

````go
package app

...

func getDNSDomain(podNamespace, domain string) string {
	if len(domain) == 0 {
		domain = podNamespace + ".svc." + constants.DefaultClusterLocalDomain
	}
	return domain
}

...

````

> ℹ️ 参考：
>
> - https://github.com/istio/istio/blob/master/pilot/cmd/pilot-agent/main.go
> - https://github.com/istio/istio/blob/master/pilot/cmd/pilot-agent/app/cmd.go#L245-L250
> - https://github.com/istio/istio/blob/master/pilot/cmd/pilot-agent/app/cmd.go#L270

また、XDS-APIとの間で定期的にリモートプロシージャーコールを実行し、宛先情報を取得する。

> ℹ️ 参考：
> 
> - https://github.com/istio/istio/blob/master/pilot/pkg/xds/ads.go#L236-L238
> - https://github.com/istio/istio/blob/master/pilot/pkg/xds/ads.go#L307
> - https://github.com/istio/istio/blob/master/pilot/pkg/xds/ads.go#L190-L233

```go
package xds

...

func (s *DiscoveryServer) StreamAggregatedResources(stream DiscoveryStream) error {
	return s.Stream(stream)
}

func (s *DiscoveryServer) Stream(stream DiscoveryStream) error {
	
	...
	
	for {
		
		select {
		
		// Envoyからのコールを受信する。
		case req, ok := <-con.reqChan:
			if ok {
				// コール内容に応じて、宛先情報を返信する。
				if err := s.processRequest(req, con); err != nil {
					return err
				}
			} else {
				return <-con.errorChan
			}
			
		// XDSからEnvoyに対してコールを送信する。
		case pushEv := <-con.pushChannel:
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

実装が移行途中のため、xds-proxyにも、Envoyからのリモートプロシージャーコールを処理する同名のメソッドがある。

> ℹ️ 参考：https://github.com/istio/istio/blob/master/pkg/istio-agent/xds_proxy.go#L299-L306

#### ▼ ```envoy```プロセス

```istio-proxy```コンテナにて、リバースプロキシとして動作する。


<br>

### istio-cniアドオンによる```istio-validation```コンテナ

#### ▼ istio-cniアドオンとは

![istio_istio-cni](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_istio-cni.png)

各ワーカーNode上で、```istio-cni-node```という名前のDaemonSetとして稼働する。```istio-init```コンテナはistio-iptablesをPodに適用する権限を持っている。しかし、Linuxのiptablesを操作するためにはroot権限が必要になるため、脆弱性が指摘されている（同様にして、ユーザーが```iptables```コマンドを実行する時も```sudo```権限が必要である）。```istio-init```コンテナの代替案として、istio-cniアドオンが提供されている。もしistio-cniアドオンを使用する場合は、```istio-init```コンテナが不要になる代わりとして、```istio-validation```コンテナが必要になる。

> ℹ️ 参考：
>
> - https://tanzu.vmware.com/developer/guides/service-routing-istio-refarch/
> - https://www.redhat.com/architect/istio-CNI-plugin
> - https://en.wikipedia.org/wiki/Iptables

#### ▼ ```istio-validation```コンテナ

istio-cniを採用している場合にのみそう挿入されるコンテナ。istio-cniのDaemonSetがistio-iptablesを適用し終わることを待機するために、これが完了したかどうかを検証する。

> ℹ️ 参考：https://istio.io/latest/docs/setup/additional-setup/cni/#race-condition-mitigation

<br>

## 02-02. ```istio-proxy```コンテナ

### 待ち受けるポート番号

#### ▼ ```15000```番

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

#### ▼ ```15001```番

```istio-proxy```コンテナの```15001```番ポートでは、アプリケーションコンテナからのアウトバウンド通信を待ち受ける。アプリケーションコンテナからのアウトバウンド通信は、一度、```istio-proxy```コンテナの```15001```番ポートリダイレクトされる。


> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

#### ▼ ```15004```番

```istio-proxy```コンテナの```15004```番ポートでは、コントロールプレーンのコンテナの```8080```番ポートと一緒に使用される。用途がわからず調査中...

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#15004

#### ▼ ```15006```番

```istio-proxy```コンテナの```15006```番ポートでは、アプリケーションコンテナへのインバウンド通信を待ち受ける。アプリケーションコンテナへのインバウンド通信は、一度、```istio-proxy```コンテナの```15006```番ポートにリダイレクトされる。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

#### ▼ ```15020```番

```istio-proxy```コンテナの```15020```番ポートでは、データプレーンのデバッグエンドポイントに対するリクエストを待ち受ける。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#15020

#### ▼ ```15021```番

```istio-proxy```コンテナの```15021```番ポートでは、kubeletからの準備済みチェックを待ち受ける。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

#### ▼ ```15053```番

調査中...

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

#### ▼ ```15090```番

```istio-proxy```コンテナの```15090```番ポートでは、```istio-proxy```コンテナのメトリクス収集ツールからのリクエストを待ち受け、```envoy```プロセスに渡される。リクエストの内容に応じて、データポイントを含むレスポンスを返信する。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

<br>
