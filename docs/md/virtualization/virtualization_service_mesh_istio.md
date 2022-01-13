# Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. セットアップ

### インストール

#### ・istioctl経由

プロファイルを指定し、Istioオブジェクトをインストールする。

参考：https://istio.io/latest/docs/setup/install/istioctl/#install-istio-using-the-default-profile

```bash
$ istioctl install --set profile=demo
```

#### ・IstioOperatorオブジェクト経由

（１）まずは、IstioOperatorオブジェクトをインストールする。IstioOperatorオブジェクトは、デフォルトで```istio-system```にIstioオブジェクトをインストールするようになっている。

参考：https://istio.io/latest/docs/setup/install/operator/

```bash
$ istioctl operator init

Installing operator controller in namespace: istio-operator using image: docker.io/istio/operator:1.12.1
Operator controller will watch namespaces: istio-system
✔ Istio operator installed
✔ Installation complete
```

（２）IstioOperatorオブジェクトが定義されたマニフェストファイルを、```istioctl```コマンドまたは```kubectl```コマンドで操作し、Istioオブジェクトをインストールする。```kubectl```コマンドの実行結果は、インストールされたことがわかりにくいことに注意する。

```bash
# istioctlコマンド
$ istioctl install -y -f ./istio-manifests/operator.yml
✔ Istio core installed
✔ Istiod installed
✔ Ingress gateways installed
✔ Installation complete
Making this installation the default for injection and validation.
```

```bash
# kubectlコマンド
$ kubectl apply -f ./istio-manifests/operator.yml

istiooperator.install.istio.io/istio-operator created
```

参考：

- https://istio.io/latest/docs/setup/install/istioctl/#install-istio-using-the-default-profile
- https://istio.io/latest/docs/setup/install/operator/#install-istio-with-the-operator

<br>

### アンインストール

#### ・istioctl経由

Istioオブジェクトを全てアンインストールする。

```bash
$ istioctl x uninstall --purge
```

<br>

## 02. Istioオブジェクト

### Istioオブジェクトとは

Istioを構成するオブジェクトことで、実体はKubernetesのカスタムリソースである。

<br>

### Istioメッシュ

#### ・Istioメッシュとは

Istioオブジェクトを組み合わせて、サービスメッシュを実装する。マイクロサービス間の通信を透過的にする（通信の存在を感じさせない）ことを思想としている。Istioを必ずしも用いる必要はなく、KubernetesやOpenShiftの機能でこれを実現してもよい。

参考：

- https://istio.io/latest/docs/ops/deployment/architecture/
- https://techblog.zozo.com/entry/zozotown-istio-production-ready

![istio_overview](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_overview.png)

#### ・istio-proxyコンテナ

Istioによって、プロキシ機能を持つistio-proxyコンテナが自動的に構築される。istio-proxyコンテナではEnvoyが稼働しており、VirtualServiceとDestinationRuleの設定値はenvoyの構成情報としてコンテナに適用される。

参考：https://sreake.com/blog/istio/

<br>

## 02-02. インバウンド通信に関するオブジェクト

### IngressGateway

#### ・IngressGatewayとは

![istio_ingress-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_ingress-gateway.png)

Gateway、Service、DestinationRuleの設定に基づいて、クラスター外部から送信されるインバウンド通信をPodにルーティングする。

参考：

- https://istio.io/latest/docs/tasks/traffic-management/ingress/ingress-control/
- https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/
- https://qiita.com/kenyashiro/items/b94197890de434ed9ceb
- https://blog.jayway.com/2018/10/22/understanding-istio-ingress-gateway-in-kubernetes/

<br>

### Gateway

#### ・Gatewayとは

IngressGatewayの機能のうち、クラスター外部から送信されるインバウンド通信をフィルタリングする機能を担う。

参考：https://istio.io/latest/blog/2018/v1alpha3-routing/

<br>

### VirtualService

#### ・VirtualServiceとは

IngressGatewayの機能のうち、IngressGatewayで受信したインバウンド通信をいずれのServiceにルーティングするか、を決定する機能を担う。Service自体の設定は、IstioではなくKubernetesで行うことに注意する。

参考：

- https://tech.uzabase.com/entry/2018/11/26/110407
- https://knowledge.sakura.ad.jp/20489/

#### ・Envoyの設定値として

VirtualServiceの設定値は、Envoyのフロントプロキシの設定値としてIstioオブジェクトに適用される。

参考：

- https://istio.io/latest/docs/concepts/traffic-management/
- http://blog.fujimisakari.com/service_mesh_and_routing_and_lb/
- https://sreake.com/blog/istio/

<br>

### DestinationRule

#### ・DestinationRule

IngressGatewayの機能のうち、Serviceで受信したインバウンド通信をいずれのPodにルーティングするか、を決定する機能を担う。Service自体の設定は、IstioではなくKubernetesで行うことに注意する。

#### ・Envoyの設定値として

DestinationRuleの設定値は、Envoyのプロキシコンテナの設定値としてistio-proxyコンテナに適用される。

参考：

- https://istio.io/latest/docs/concepts/traffic-management/
- http://blog.fujimisakari.com/service_mesh_and_routing_and_lb/
- https://sreake.com/blog/istio/

<br>

## 02-03. アウトバウンド通信に関するオブジェクト

### EgressGateway

#### ・EgressGatewayとは

クラスター内部から送信されるアウトバウンド通信をフィルタリングし、パブリックネットワークにルーティングする。

参考：https://knowledge.sakura.ad.jp/20489/

![istio_gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_gateway.png)

<br>

### ServiceEntry

#### ・ServiceEntryとは

アウトバウンド通信のうち、送信可能なもののみを指定したドメインやEgressGatewayにルーティングする。ServiceEntryを使用しない場合は、全てのアウトバウンド通信がルーティングされる。

参考：https://tech.uzabase.com/entry/2018/11/26/110407

![istio_service-entry](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_service-entry.png)

<br>

## 02-04. Istiod

### Istiodとは

サイドカーコンテナのEnvoyコンテナを統括的に管理する。

参考：

- https://istio.io/latest/docs/ops/deployment/architecture/
- https://speakerdeck.com/kurochan/ru-men-envoy?slide=34

<br>

### Citadal

#### ・Citadalとは

暗号鍵やSSL証明書を管理する。

参考：https://knowledge.sakura.ad.jp/20489/

<br>

### Galley

#### ・Galleyとは

<br>

### sidecar-injector

#### ・sidecar-injectorとは

Envoyコンテナをサイドカーとして稼働させる。

<br>

### Mixer

#### ・Mixerとは

認証やデータ収集を行う。

<br>

### Pilot

#### ・Pilotとは

Serviceディスカバリやトラフィックの管理を行う。

<br>

## 02-05. IstioOperator

### IstioOperatorとは

Istioのインストールや、Istioオブジェクトの操作が可能なオブジェクトのこと。

参考：

- https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/
- https://istio.io/latest/docs/setup/install/operator/#update

<br>

## 03. Injectionテスト

### Fault Injection

#### ・Fault Injectionとは

障害を意図的に注入し、サービスメッシュの動作を検証する。

参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/

#### ・テストの種類

| テスト名         | 内容                                                         |
| ---------------- | ------------------------------------------------------------ |
| Deplay Injection | マイクロサービスに対するインバウンド通信にて、意図的に通信の遅延を引き起こす。<br>参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-delay-fault |
| Abort Injection  | マイクロサービスに対するインバウンド通信にて、意図的に通信の中止を引き起こす。<br>参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-abort-fault |
