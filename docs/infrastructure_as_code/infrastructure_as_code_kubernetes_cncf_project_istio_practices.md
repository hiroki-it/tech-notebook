---
title: 【IT技術の知見】プラクティス集＠Istio
description: プラクティス集＠Istioの知見を記録しています。
---

# プラクティス集＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### 少ないコントロールプレーン

クラウドプロバイダーでIstioを稼働させる場合、各AZや各リージョンにコントロールプレーンを`1`個だけセットアップし、できるだけ多くのアプリコンテナのサービスメッシュとなるようにする。

> - https://istio.io/latest/docs/ops/best-practices/deployment/#deploy-fewer-clusters

<br>

### 冗長化

コントロールプレーンの可用性を高めるために、コントロールプレーンを異なるAZに冗長化させる。

> - https://istio.io/latest/docs/ops/best-practices/deployment/#deploy-across-multiple-availability-zones

<br>

### サービスメッシュに登録しないPodの選定 (サイドカープロキシメッシュの場合)

#### ▼ 監視系のPod

サイドカープロキシメッシュに登録するPodが増えると、その分`istio-proxy`コンテナが増える。

そのため、Pod当たりのハードウェアリソースの消費量が増えてしまう。

テレメトリーを収集する必要のないPod (例：監視を責務に持つPod) は、サイドカープロキシメッシュに登録しないようにする。

#### ▼ Job配下のPod

Job配下のPodに`istio-proxy`コンテナを挿入した場合、Pod内のコンテナが終了しても`istio-proxy`コンテナが終了せず、Pod自体が削除されない問題がある。

Job配下のPodは、サイドカープロキシメッシュに登録しないようにする。

どうしてもサービスメッシュに登録したい場合は、Pod内のコンテナで、`istio-proxy`コンテナの『`localhost:15020/quitquitquit`』をコールするようなシェルスクリプトを実行する。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: foo-job
spec:
  template:
    metadata:
      name: foo-job
    spec:
      containers:
        - name: foo
          command:
            - /bin/bash
            - -c
          args:
            - >
              until curl -fsI http://localhost:15021/healthz/ready; do
                echo "Waiting for Sidecar to be healthy";
                sleep 3;
              done;
              echo "Sidecar available. Running job command..." &&
              <CronJobのコマンド> &&
              x=$(echo $?) &&
              curl -fsI -X POST http://localhost:15020/quitquitquit && 
              exit $x
```

> - https://www.kabegiwablog.com/entry/2020/08/31/224827
> - https://github.com/istio/istio/issues/6324#issuecomment-760156652
> - https://youtu.be/2_Nan81j03o?t=1915

<br>

## 02. トラフィック管理

### Istio IngressGatewayに関して

#### ▼ Istiodコントロールプレーンとは異なるNamespaceにおく

セキュリティ上の理由から、Istio IngressGatewayとIstiodコントロールプレーンは異なるNamespaceにおく方が良い。

> - https://istio.io/latest/docs/setup/additional-setup/gateway/#deploying-a-gateway

#### ▼ NodePort Serviceを選ぶ

Istio IngressGatewayでは、内部的に作成されるServiceのタイプ (NodePort Service、LoadBalancer Service) を選べる。

NodePort Serviceを選ぶ場合、Nodeの前段に開発者がロードバランサーを作成し、NodePort Serviceにインバウンド通信をルーティングできるようにする。

一方で、LoadBalancer Serviceを選ぶ場合、クラウドプロバイダーのロードバランサーが自動的に作成される。

そのため、このロードバランサーからLoadBalancer Serviceにルーティングできるようにする。

LoadBalancer Serviceでは、クラウドプロバイダーのリソースとKubernetesリソースの責務の境界が曖昧になってしまうため、NodePort Serviceを選ぶようにする。

補足として、デフォルトではIstio IngressGatewayの内部ではLoadBalancer Serviceを作成されてしまう。

NodePort Serviceを選ぶためには、Istio IngressGatewayではなく、IstioOperatorやistioチャート上でServiceのタイプを設定し、Istio IngressGatewayを作成する必要がある。

> - https://github.com/istio/istio/issues/28310#issuecomment-733079966
> - https://github.com/istio/istio/blob/1.14.3/manifests/charts/gateway/values.yaml#L39

#### ▼ アプリコンテナごとに作成する

単一障害点になることを防ぐために、`1`個のIstio IngressGatewayで全てのアプリコンテナにルーティングするのではなく、アプリコンテナことに用意する。

<br>

### サブセット名を`1`個にする

Istioリソースで設定するサブセット名は`1`個だけにする。

これにより、Istio IngressGatewayで受信した通信を、特定のバージョンのPodにルーティングできる。

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  hosts:
    - reviews
  http:
    - route:
        - destination:
            host: reviews
            subset: v1
```

> - https://istio.io/latest/docs/ops/best-practices/traffic-management/#set-default-routes-for-services

<br>

### Istioリソースの使用可能範囲を限定する

Istioリソースの`.spec.exportTo`キーでは『`.` (ドット) 』を設定する。

これにより、DestinationRuleを想定外のNamespaceで使用してしまうことを防ぐ。

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  hosts:
    - "*"
  exportTo:
    - "."
  http:
    - route:
        - destination:
            host: myservice
```

> - https://istio.io/latest/docs/ops/best-practices/traffic-management/#cross-namespace-configuration

<br>

### DestinationRuleを最初に更新する

新しいサブセットを追加する場合、DestinationRuleを最初に更新する。

これにより、ダウンタイムなしでサブセットを追加できる。

DestinationRuleを更新する前に新しいサブセットを持つVirtualServiceを更新してしまうと、VirtualServiceは新しいサブセットを持つDestinationRuleを見つけられず、`503`ステータスを返信してしまう。

DestinationRuleを最初に更新し、正常に完了することを待機した後に、VirtualServiceを更新する。

> - https://istio.io/latest/docs/ops/best-practices/traffic-management/#avoid-503-errors-while-reconfiguring-service-routes

<br>

## 02-02. 通信ルーティングのパターン

### LoadBalancer Serviceの場合

LoadBalancer Serviceを使用する場合、以下のようなネットワーク経路がある。

**＊例＊**

```yaml
パブリックネットワーク
⬇⬆︎︎
AWS Route53
⬇⬆︎︎
# L4ロードバランサー
LoadBalancer Service (Istio IngressGateway) によるAWS NLB
⬇⬆︎︎
Gateway
⬇⬆︎︎
VirtualService
⬇⬆︎︎
# L4ロードバランサー
ClusterIP Service
⬇⬆︎︎
Pod
```

<br>

### NodePort Serviceの場合

#### ▼ `L7`ロードバランサーがない場合

NodeのNICの宛先情報は、Node外から宛先IPアドレスとして指定できるため、インバウンド通信にIngressを必要としない。

**＊例＊**

```yaml
パブリックネットワーク
⬇⬆︎︎
# L4ロードバランサー
NodePort Service (Istio IngressGateway)
⬇⬆︎︎
Gateway
⬇⬆︎︎
VirtualService
⬇⬆︎︎
# L4ロードバランサー
ClusterIP Service
⬇⬆︎︎
Pod
```

#### ▼ `L7`ロードバランサーがある場合

パブリックプロバイダーのロードバランサー (例：AWS ALB) を別に置く。

**＊例＊**

```yaml
パブリックネットワーク
⬇⬆︎︎
AWS Route53
⬇⬆︎︎
# L7ロードバランサー
AWS ALB
⬇⬆︎︎
# L4ロードバランサー
NodePort Service (Istio IngressGateway)
⬇⬆︎︎
Gateway
⬇⬆︎︎
VirtualService
⬇⬆︎︎
# L4ロードバランサー
ClusterIP Service
⬇⬆︎︎
Pod
```

<br>

## 03. アップグレード

### 設計規約

#### ▼ サポート期間

Istioでは、マイナーバージョンごとのアップグレードを推奨しており、またマイナーバージョンのサポートが半年ごとに終了する。

実質的に半年ごとにアップグレード工数が発生する。

> - https://istio.io/latest/docs/releases/supported-releases/#support-status-of-istio-releases

#### ▼ マイナーバージョン単位でアップグレード

Istioの開発プロジェクトでは、マイナーバージョンを`1`個ずつ新しくするアップグレードしか検証していない。

そのため、マイナーバージョンを`2`個以上跨いだアップグレードを推奨していない。

> - https://istio.io/latest/docs/setup/upgrade/
> - https://thenewstack.io/upgrading-istio-without-downtime/

#### ▼ Istiodコントロールプレーンでダウンタイムを発生させない

Istiodコントロールプレーンでダウンタイムが発生すると、`istio-proxy`コンテナ内のpilot-agentが最新の宛先情報を取得できなくなる。

そのため、古いバージョンのアプリコンテナの宛先情報を使用してしまう。

Istiodコントロールプレーンをカナリアアップグレードを採用する。

> - https://thenewstack.io/upgrading-istio-without-downtime/

#### ▼ Istio IngressGatewayでダウンタイムを発生させない

Istio IngressGatewayでダウンタイムが発生すると、アプリへのインバウンド通信が遮断されてしまう。

> - https://thenewstack.io/upgrading-istio-without-downtime/

<br>

### インプレース方式

#### ▼ インプレース方式とは

既存のIstiodコントロールプレーンとIstio IngressGatewayの両方をインプレース方式でアップグレードする。

#### ▼ 手順

`(1)`

: CRDを更新する。

     必要なCRDのマニフェストは、リポジトリで確認する必要がある。

```bash
$ git clone https://github.com/istio/istio.git

$ kubectl apply -f manifests/charts/base/crds
```

`(2)`

: IstiodコントロールプレーンとIstio IngressGatewayの両方をインプレース方式でアップグレードする。

```bash
$ istioctl upgrade
```

`(3)`

: データプレーンの`istio-proxy`コンテナを再インジェクションする。

```bash
$ kubectl rollout restart deployment app-deployment -n app
```

> - https://istio.io/latest/docs/setup/upgrade/in-place/

<br>

### カナリア方式

#### ▼ カナリア方式とは

> - https://hiroki-hasegawa.hatenablog.jp/entry/2023/02/26/202548

#### ▼ `istioctl`コマンドの場合

> - https://hiroki-hasegawa.hatenablog.jp/entry/2023/02/26/202548

#### ▼ `helm`コマンドの場合

`(1)`

: HelmではCRDを管理しないようにし、`kubectl`コマンドでこれを作成する。

```bash
$ kubectl diff -f https://raw.githubusercontent.com/istio/istio/1.15.3/manifests/charts/base/crds/crd-all.gen.yaml
```

`(2)`

: istiodチャートを使用して、古いバージョンのMutatingWebhookConfigurationのみを削除する。

    この時、既存のリリースは古いリリースとして扱う。

```bash
$ helm upgrade <古いバージョンのリリース名> <チャートリポジトリ名>/istiod -n istio-system --version <古いバージョン> --set revisionTags=null
```

`(3)`

: istiodチャートを使用して、新しいバージョンのMutatingWebhookConfigurationを作成しつつ、Istiodコントロールプレーンに関するKubernetesリソースを変更する。

     この時、リリースを新しく命名する。

```bash
$ helm upgrade <新しいバージョンのリリース名> <チャートリポジトリ名>/istiod -n istio-system --version <新しいバージョン>
```

`(4)`

: 特定のNamespaceをアップグレードする。

`(5)`

: 動作確認し、問題なければ、残りのNamespaceもアップグレードする。

`(6)`

: istiodチャートを使用して、古いリリースで作成したIstiodコントロールプレーンに関するKubernetesリソースを削除する。

```bash
$ helm upgrade <古いバージョンのリリース名> <チャートリポジトリ名>/istiod -n istio-system --version <古いバージョン> --set revisionTags=null
```

`(7)`

: istio-baseを使用して、Istioに関するCRDを変更する。

     この時、リリースを新しく命名する。

```bash
$ helm upgrade <新しいバージョンのリリース名> <チャートリポジトリ名>/base -n istio-system --version <新しいバージョン>
```

`(8)`

: gatewayチャートを使用して、Istio IngressGatewayに関するKubernetesリソースを変更する。

     この時、リリースを新しく命名する。

```bash
$ helm upgrade <新しいバージョンのリリース名> <チャートリポジトリ名>/gateway -n istio-ingress --version <新しいバージョン>
```

<br>

## 04. アーキテクチャ特性

### 性能

記入中...

> - https://lib.jimmysong.io/blog/performance-and-scalability/

<br>

## 05. CI

### GitLab

#### ▼ `.gitlab-ci.yml`ファイル

CI上でClusterを作成し、Istioをデプロイする。

```yaml
# ブランチ名に応じて、CIで使用する実行環境名を切り替える
workflow:
  rules:
    # masterブランチにて、任意の方法でパイプラインを実行した場合
    - if: $CI_COMMIT_REF_NAME == 'master'
      variables:
        ENV: "prd"
    # developブランチにて、任意の方法でパイプラインを実行した場合
    - if: $CI_COMMIT_REF_NAME == 'develop'
      variables:
        ENV: "tes"
    # MRにて、任意の方法でパイプラインを実行した場合
    - if: $CI_PIPELINE_SOURCE == 'merge_request_event'
      variables:
        ENV: "dev"
    # 上記以外で、webから手動でパイプラインを実行した場合
    - if: $CI_PIPELINE_SOURCE == 'web'
      variables:
        ENV: "dev"

variables:
  # EKSはK8sのマイナーバージョンを公開していないため、".0"と仮定して処理する
  # 現在のEKSのK8sバージョン
  K8S_CURRENT_VERSION: "1.24.0"
  # アップグレード後のEKSのK8sバージョン
  K8S_NEXT_VERSION: "1.26.0"

  # 現在のIstioのバージョン
  ISTIO_CURRENT_VERSION: "1.15.3"
  # アップグレード後のIstioのバージョン
  ISTIO_NEXT_VERSION: "1.17.5"

stages:
  - test

# 指定したバージョンのIstioを検証する
test_istio:
  stage: test
  image:
    name: docker
  variables:
    # K3Dを使うことで Docker in Docker となるため、そのための環境変数を設定する
    # @see https://gitlab.com/gitlab-org/gitlab-runner/-/issues/27300
    DOCKER_DRIVER: "overlay2"
    DOCKER_HOST: "tcp://docker:2375"
    DOCKER_TLS_CERTDIR: ""
  services:
    - name: docker:dind
      command: ["--tls=false"]
  # K3D Clusterは異なるJobに持ち越せないので、事前処理として実行する
  before_script:
    - apk --update add bash curl git
    # スクリプトでasdfをセットアップする
    - source setup-asdf.sh
    # K3Dをインストールする
    - |
      curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | sh
      k3d version
    # kubectlコマンドをインストールする
    - |
      curl -kLO https://dl.k8s.io/release/v"${K8S_NEXT_VERSION}"/bin/linux/amd64/kubectl
      chmod +x ./kubectl
      mv ./kubectl /usr/local/bin/kubectl
      kubectl version
    # Clusterを作成する
    # Clusterを作成する
    # もし該当のバージョンのイメージがなければ、rc版を使用する
    - |
      if [ $? -ne 0 ]; then \
        k3d cluster create "${CI_PIPELINE_ID}" --image rancher/k3s:v"${K8S_NEXT_VERSION}"-k3s1 --agents 2; \
      else \
        k3d cluster create "${CI_PIPELINE_ID}" --image rancher/k3s:v"${K8S_NEXT_VERSION}"-rc1-k3s1 --agents 2; \
      fi
    # Nodeにラベル付けする
    - |
      kubectl label node k3d-"${CI_PIPELINE_ID}"-agent-0 node.kubernetes.io/nodetype=ingress
      kubectl label node k3d-"${CI_PIPELINE_ID}"-agent-1 node.kubernetes.io/nodetype=system
    # 動作を確認する
    - k3d cluster list
    - kubectl get node --show-labels
  # Istioのインストールは、Helmを使ったIstioのアップグレード手順に則る
  # @see https://istio.io/latest/docs/setup/upgrade/helm/
  script:
    # CRDをインストールする
    - kubectl apply -f https://raw.githubusercontent.com/istio/istio/"${ISTIO_NEXT_VERSION}"/manifests/charts/base/crds/crd-all.gen.yaml
    # Namespaceを作成する
    - |
      kubectl create ns istio-ingress
      kubectl label ns istio-ingress istio.io/rev=default
      kubectl create ns istio-system
    # Namespaceのラベルを確認する
    - kubectl get ns -L istio.io/rev
    # istiodチャートをApplyする
    # ブルー/グリーンデプロイ時に新旧Istiodを並行稼働させるために、helmfile.yamlにリビジョン番号をつける
    - helmfile -e "${ENV}" -f helmfile_istiod_"${ISTIO_NEXT_VERSION//\./-}".yaml apply --skip-crds --skip-diff-on-install
    # istio-baseチャートをApplyする
    - helmfile -e "${ENV}" -f helmfile_istio-base.yaml apply --skip-diff-on-install
    # istio-ingressgatewayチャートをApplyする
    - helmfile -e "${ENV}" -f helmfile_istio-ingressgateway.yaml apply --skip-diff-on-install
    # 動作を確認する
    - istioctl version
    - istioctl proxy-status
    - kubectl get all -n istio-ingress
    - kubectl get all -n istio-system
    # Clusterを削除する
    - k3d cluster delete $CI_PIPELINE_ID
```

#### ▼ `.setup-asdf.sh`ファイル

```bash
#!/bin/bash

# asdfをインストールする
git clone --depth 1 https://github.com/asdf-vm/asdf.git ~/.asdf
echo '. "$HOME/.asdf/asdf.sh"' >> ~/.bashrc
export ASDF_DIR=~/.asdf
source ~/.bashrc

# コマンドをインストールする
asdf plugin add helm https://github.com/Antiarchitect/asdf-helm.git
asdf plugin add helmfile https://github.com/feniix/asdf-helmfile.git
asdf plugin add istioctl https://github.com/virtualstaticvoid/asdf-istioctl.git
asdf install
asdf list

# 正しいバージョンをインストールできていることを確認する
helm version
helmfile version
istioctl version
```

<br>
