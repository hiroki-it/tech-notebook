---
title: 【知見を記録するサイト】コマンド＠Istio
description: コマンド＠Istioの知見をまとめました．
---

# コマンド＠Istio

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### インストール

#### ・brew経由

```bash
$ brew install istioctl
```

#### ・curl経由

参考：https://istio.io/latest/docs/setup/getting-started/#download

（１）インストール先のディレクトリに移動する．

```bash
$ cd /Users/hiroki.hasegawa/projects/hiroki-it
```

（２）インストールする．

```bash
$ curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.12.1 - sh
```

（３）istioctlへのパスを環境変数に登録する．

```bash
$ cd istio-1.12.1
$ export PATH=$PWD/bin:$PATH
```

<br>

### プロファイル

#### ・プロファイルとは

Istioの機能のセットを提供する．

参考：https://istio.io/latest/docs/setup/additional-setup/config-profiles/

#### ・プロファイルの種類

参考：

- https://atmarkit.itmedia.co.jp/ait/articles/2111/05/news005.html
- https://betterprogramming.pub/getting-started-with-istio-on-kubernetes-e582800121ea

| ユースケース         | default  | demo     | empty                         | external | minimal              | openshift | preview | remote |
| :------------------- | :------- | :------- | :---------------------------- | -------- | :------------------- | --------- | ------- | ------ |
| 概要                 | 本番環境 | 開発環境 | Istioを全てカスタマイズしたい | -        | 最小限の機能が欲しい | ？        | -       | ？     |
| istio-egressgateway  | -        | ○        | -                             | -        | -                    | ？        | -       | ？     |
| istio-ingressgateway | ○        | ○        | -                             | -        | -                    | ？        | ○       | ？     |
| istiod               | ○        | ○        | -                             | -        | ○                    | ？        | ○       | ？     |

<br>

### KubernetesにおけるIstioの有効化

KubernetesでIstioを使用できるように，```istio-injection```ラベルの値に```enabled```を設定する．Envoyコンテナをサイドカーコンテナとして自動的にデプロイできるようになる．```default```以外の名前空間名をつける場合は，コマンドではなく，マニフェストファイル上でこれを設定できる．

**＊実行例＊**

```bash
$ kubectl label namespace default istio-injection=enabled
```

<br>

## 02. istioctlコマンド

### analyze

#### ・analyzeとは

Istioが正しく機能しているかどうかを検証する．

参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-analyze

**＊実行例＊**

成功した場合を以下に示す．

```bash
$ istioctl analyze

✔ No validation issues found when analyzing namespace: default.
```

失敗した場合を以下に示す．

```bash
$ istioctl analyze

Info [IST0118] (Service default/foo-service) Port name  (port: 80, targetPort: 80) doesn't follow the naming convention of Istio port.
```

#### ・-n

名前空間を指定しつつ，```analyze```コマンドを実行する．

**＊実行例＊**

```bash
$ istioctl analyze -n <名前空間名>
```

<br>

### manifest diff

#### ・diffとは

ymlファイルの差分を表示する．

参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-manifest-diff

```bash
$ istioctl manifest diff <変更前マニフェストファイル名>.yml <変更後>.yml
```

<br>

### install

#### ・installとは

プロファイルをインストールし，また設定値を変更する．

参考：https://istio.io/latest/docs/setup/install/istioctl/

#### ・-f

マニフェストファイルを用いて，プロファイルをインストールする．

```bash
$ istioctl install -f ./istio-manifests/<ファイル名>.yml -y
```

#### ・--set

インストールするもの，または変更する項目を指定する．

**＊実行例＊**

指定したプロファイルをインストールする．

参考：https://istio.io/latest/docs/setup/additional-setup/config-profiles/

```bash
$ istioctl install --set profile=<プロファイル名> -y
```

アクセスログの出力先を標準出力に変更する．

```bash
$ istioctl install --set meshConfig.accessLogFile=/dev/stdout
```

<br>

### kube-inject

#### ・kube-injectとは

Envoyコンテナをサイドカーコンテナとして構築する．代わりに，```enabled```値が割り当てられた```istio-injection```タグを名前空間に付与しても良い．

参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-kube-inject

```bash
$ istioctl kube-inject
```

<br>

### profile

#### ・profileとは

Istioのプロファイルを操作する．

参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-profile

#### ・list

利用可能なプロファイルを表示する．

**＊実行例＊**

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

### proxy-config

#### ・proxy-config

Istio上で管理されるEnvoyの構成情報を表示する．

参考：

- https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-proxy-config
- https://sreake.com/blog/istio/

```bash
$ istioctl proxy-config <項目> <ポッド名> -n <名前空間名>
```

**＊実行例＊**

Envoyのエンドポイント情報を表示する．

```bash
$ istioctl proxy-config endpoints <IngressGateway名> -n istio-system

ENDPOINT                         STATUS      OUTLIER CHECK     CLUSTER
127.0.0.1:15000                  HEALTHY     OK                prometheus_stats
127.0.0.1:15020                  HEALTHY     OK                agent

# 〜 中略 〜

172.17.0.11:9090                 HEALTHY     OK                outbound|80||kubernetes-dashboard.kubernetes-dashboard.svc.cluster.local
172.17.0.13:80                   HEALTHY     OK                outbound|80||foo-service.microservices-with-kubernetes.svc.cluster.local

# 〜 中略 〜

192.168.64.14:8443               HEALTHY     OK                outbound|443||kubernetes.default.svc.cluster.local
unix://./etc/istio/proxy/SDS     HEALTHY     OK                sds-grpc
unix://./etc/istio/proxy/XDS     HEALTHY     OK                xds-grpc
```

Envoyのリスナー情報を表示する．

```bash
$ istioctl proxy-config listeners <IngressGateway名> -n istio-system

ADDRESS PORT  MATCH DESTINATION
0.0.0.0 8080  ALL   Route: http.8080
0.0.0.0 15021 ALL   Inline Route: /healthz/ready*
0.0.0.0 15090 ALL   Inline Route: /stats/prometheus*
```

のルーティング情報を表示する．

```bash
$ istioctl proxy-config routes <IngressGateway名> -n istio-system

NAME          DOMAINS     MATCH                  VIRTUAL SERVICE
http.8080     *           /*                     foo-virtual-service.istio-system
              *           /stats/prometheus*     
              *           /healthz/ready*  
```

<br>

### proxy-status

#### ・proxy-statusとは

IngressGateway，EgressGateway，Envoyコンテナのステータスを表示する．

参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-proxy-status

**＊実行例＊**

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

### verify-install

#### ・verify-installとは

Istioのインストールが正しく実行されたかを検証する．

参考：https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-verify-install

**＊実行例＊**

```bash
$ istioctl verify-install

1 Istio control planes detected, checking --revision "default" only
✔ ClusterRole: istiod-istio-system.istio-system checked successfully
✔ ClusterRole: istio-reader-istio-system.istio-system checked successfully

# 〜 中略 〜

✔ Service: istio-egressgateway.istio-system checked successfully
✔ ServiceAccount: istio-egressgateway-service-account.istio-system checked successfully
Checked 14 custom resource definitions
Checked 3 Istio Deployments
✔ Istio is installed and verified successfully
```

<br>

### version

#### ・versionとは

Istiodのバージョンを表示する．

```bash
$ istioctl version

client version: 1.12.1
pilot version: 1.12.1
pilot version: 1.7.2
data plane version: 1.12.1 (5 proxies)
```

