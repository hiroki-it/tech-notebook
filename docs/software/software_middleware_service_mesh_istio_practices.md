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

クラウドプロバイダーで Istio を稼働させる場合、各 AZ や各リージョンにコントロールプレーンを `1` 個だけセットアップし、できるだけ多くのマイクロサービスのサービスメッシュとなるようにする。

> - https://istio.io/latest/docs/ops/best-practices/deployment/#deploy-fewer-clusters

<br>

### 冗長化

コントロールプレーンの可用性を高めるために、コントロールプレーンを異なる AZ に冗長化させる。

> - https://istio.io/latest/docs/ops/best-practices/deployment/#deploy-across-multiple-availability-zones

<br>

### サービスメッシュに登録しないPodの選定 (サイドカーモードの場合)

#### ▼ 監視系のPod

サイドカーモードに登録する Pod が増えると、その分 istio-proxy が増える。

そのため、Pod 当たりのハードウェアリソースの消費量が増えてしまう。

テレメトリーを収集する必要のない Pod (例：監視を責務に持つ Pod) は、サイドカーモードへ登録しないようにする。

#### ▼ Job配下のPod

Job 配下の Pod に istio-proxy を挿入した場合、Pod 内のコンテナが終了しても istio-proxy が終了せず、Pod 自体が削除されない問題もある。

Job 配下の Pod は、サイドカーモードへ登録しないようにする。

どうしてもサービスメッシュに登録したい場合は、Pod 内のコンテナで、istio-proxy の『`localhost:15020/quitquitquit`』をコールするようなシェルスクリプトを実行する。

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

### Istio Ingress Gatewayに関して

#### ▼ Istiodコントロールプレーンとは異なるNamespaceにおく

セキュリティ上の理由から、Istio Ingress Gateway と Istiod コントロールプレーンは異なる Namespace におくほうがよい。

> - https://istio.io/latest/docs/setup/additional-setup/gateway/#deploying-a-gateway

#### ▼ NodePort Serviceを選ぶ

Istio Ingress Gateway では、内部的に作成される Service のタイプ (NodePort Service、ClusterIP Service、LoadBalancer Service) を選べる。

NodePort Service を選ぶ場合、Node の送信元に開発者がロードバランサーを作成し、NodePort Service にインバウンド通信をルーティングできるようにする。

```yaml
パブリックネットワーク
⬇⬆️︎
Amazon Route 53
⬇⬆️︎
# L7ロードバランサー (単一のL7ロードバランサーを作成し、異なるポートを開放する複数のL4ロードバランサーの振り分ける)
AWS ALB
⬇⬆️︎
# L4ロードバランサー
NodePort Service (Istio Ingress Gateway)
⬇⬆️︎
Gateway
⬇⬆️︎
VirtualService
⬇⬆️︎
# L4ロードバランサー
ClusterIP Service
⬇⬆️︎
Pod
```

一方で、LoadBalancer Service を選ぶ場合、クラウドプロバイダーのロードバランサーが自動的に作成される。

そのため、このロードバランサーから LoadBalancer Service へルーティングできるようにする。

LoadBalancer Service では、クラウドプロバイダーのリソースと Kubernetes リソースの責務の境界が曖昧になってしまうため、NodePort Service を選ぶようにする。

補足として、デフォルトでは Istio Ingress Gateway の内部では LoadBalancer Service を作成されてしまう。

NodePort Service を選ぶためには、Istio Ingress Gateway ではなく、IstioOperator や istio チャート上で Service のタイプを設定し、Istio Ingress Gateway を作成する必要がある。

> - https://github.com/istio/istio/issues/28310#issuecomment-733079966
> - https://github.com/istio/istio/blob/1.14.3/manifests/charts/gateway/values.yaml#L39

#### ▼ ClusterIP Serviceを選ぶ (AWS Load Balancer Controllerを使用する場合のみ)

AWS Load Balancer Controller を使用する場合、Istio Ingress Gateway で ClusterIP Service を使用できる。

Ingress にて、`alb.ingress.kubernetes.io/target-type` キー値を `ip` とすると、AWS Load Balancer Controller は Pod にリクエストを直接的に L7 ロードバランシングする。

```yaml
パブリックネットワーク
⬇⬆️︎
Amazon Route 53
⬇⬆️︎
# L7ロードバランサー (単一のL7ロードバランサーを作成し、異なるポートを開放する複数のL4ロードバランサーの振り分ける)
AWS Load Balancer ControllerによるAWS ALB
⬇⬆️︎
# L4ロードバランサー
ClusterIP Service (Istio Ingress Gateway)
⬇⬆️︎
Gateway
⬇⬆️︎
VirtualService
⬇⬆️︎
# L4ロードバランサー
ClusterIP Service
⬇⬆️︎
Pod
```

> - https://lab.mo-t.com/blog/k8s-update-load-balancer

#### ▼ マイクロサービスごとに作成する

単一障害点になることを防ぐために、`1` 個の Istio Ingress Gateway ですべてのマイクロサービスにルーティングするのではなく、マイクロサービスことに用意する。

<br>

### サブセット名を `1` 個にする

Istio リソースで設定するサブセット名は `1` 個だけにする。

これにより、Istio Ingress Gateway で受信した通信を、特定のバージョンの Pod にルーティングできる。

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  hosts:
    # 特定のマイクロサービスへのリクエストのみを扱うため、ホスト名もそれのみを許可する
    # ただし、gatewaysオプションがあるVirtualServiceではワイルドカードする
    - foo
  http:
    - route:
        - destination:
            host: foo
            subset: v1
```

> - https://istio.io/latest/docs/ops/best-practices/traffic-management/#set-default-routes-for-services

<br>

### Istioリソースのリクエスト可能な範囲を限定する

Istio リソースの `.spec.exportTo` キーでは『`.` (ドット) 』を設定する。

これにより、同じ Namespace からしかリクエストを受信できないようにする。

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  exportTo:
    - "."
  # 特定のマイクロサービスへのリクエストのみを扱うため、ホスト名もそれのみを許可する
  # ただし、gatewaysオプションがあるVirtualServiceではワイルドカードする
  hosts:
    - foo
  http:
    - route:
        - destination:
            host: foo
```

> - https://istio.io/latest/docs/ops/best-practices/traffic-management/#cross-namespace-configuration

<br>

### DestinationRuleを最初に更新する

新しいサブセットを追加する場合、DestinationRule を最初に更新する。

これにより、ダウンタイムなしでサブセットを追加できる。

DestinationRule を更新する前に新しいサブセットを持つ VirtualService を更新してしまうと、VirtualService は新しいサブセットを持つ DestinationRule を見つけられず、`503` レスポンスを返信してしまう。

DestinationRule を最初に更新し、正常に完了することを待機した後に、VirtualService を更新する。

> - https://istio.io/latest/docs/ops/best-practices/traffic-management/#avoid-503-errors-while-reconfiguring-service-routes

<br>

## 02-02. 通信ルーティングのパターン

### LoadBalancer Serviceの場合

LoadBalancer Service を使用する場合、以下のようなネットワーク経路がある。

**＊例＊**

```yaml
パブリックネットワーク
⬇⬆️︎
Amazon Route 53
⬇⬆️︎
# L4ロードバランサー
LoadBalancer Service (Istio Ingress Gateway) によるAWS NLB
⬇⬆️︎
Gateway
⬇⬆️︎
VirtualService
⬇⬆️︎
# L4ロードバランサー
ClusterIP Service
⬇⬆️︎
Pod
```

<br>

### NodePort Serviceの場合

#### ▼ `L7` ロードバランサーがない場合

Node の NIC の宛先情報は、Node 外から宛先 IP アドレスとして指定できるため、インバウンド通信に Ingress を必要としない。

**＊例＊**

```yaml
パブリックネットワーク
⬇⬆️︎
# L4ロードバランサー
NodePort Service (Istio Ingress Gateway)
⬇⬆️︎
Gateway
⬇⬆️︎
VirtualService
⬇⬆️︎
# L4ロードバランサー
ClusterIP Service
⬇⬆️︎
Pod
```

#### ▼ `L7` ロードバランサーがある場合

パブリックプロバイダーのロードバランサー (例：AWS ALB) を別に配置する。

単一の L7 ロードバランサーを作成し、複数の L4 ロードバランサーに振り分けるとよい。

**＊例＊**

```yaml
パブリックネットワーク
⬇⬆️︎
Amazon Route 53
⬇⬆️︎
# L7ロードバランサー (単一のL7ロードバランサーを作成し、異なるポートを開放する複数のL4ロードバランサーの振り分ける)
AWS ALB
⬇⬆️︎
# L4ロードバランサー
NodePort Service (Istio Ingress Gateway)
⬇⬆️︎
Gateway
⬇⬆️︎
VirtualService
⬇⬆️︎
# L4ロードバランサー
ClusterIP Service
⬇⬆️︎
Pod
```

<br>

### ClusterIP Serviceの場合

AWS Load Balancer Controller を使用する場合、Istio Ingress Gateway で ClusterIP Service を使用できる。

Ingress にて、`alb.ingress.kubernetes.io/target-type` キー値を `ip` とすると、AWS Load Balancer Controller は Pod にリクエストを直接的に L7 ロードバランシングする。

```yaml
パブリックネットワーク
⬇⬆️︎
Amazon Route 53
⬇⬆️︎
# L7ロードバランサー (単一のL7ロードバランサーを作成し、異なるポートを開放する複数のL4ロードバランサーの振り分ける)
AWS Load Balancer ControllerによるAWS ALB
⬇⬆️︎
# L4ロードバランサー
ClusterIP Service (Istio Ingress Gateway)
⬇⬆️︎
Gateway
⬇⬆️︎
VirtualService
⬇⬆️︎
# L4ロードバランサー
ClusterIP Service
⬇⬆️︎
Pod
```

> - https://lab.mo-t.com/blog/k8s-update-load-balancer

<br>

## 03. アップグレード

### 設計規約

#### ▼ サポート期間

Istio では、マイナーバージョンごとのアップグレードを推奨しており、またマイナーバージョンのサポートが半年ごとに終了する。

実質的に半年ごとにアップグレード工数が発生する。

> - https://istio.io/latest/docs/releases/supported-releases/#support-status-of-istio-releases

#### ▼ マイナーバージョン単位でアップグレード

Istio の開発プロジェクトでは、マイナーバージョンを `1` 個ずつ新しくするアップグレードしか検証していない。

そのため、マイナーバージョンを `2` 個以上跨いだアップグレードを推奨していない。

> - https://istio.io/latest/docs/setup/upgrade/
> - https://thenewstack.io/upgrading-istio-without-downtime/

#### ▼ Istiodコントロールプレーンでダウンタイムを発生させない

Istiod コントロールプレーンでダウンタイムが発生すると、istio-proxy 内の pilot-agent が最新の宛先情報を取得できなくなる。

そのため、古いバージョンのマイクロサービスの宛先情報を使用してしまう。

Istiod コントロールプレーンをカナリアアップグレードを採用する。

> - https://thenewstack.io/upgrading-istio-without-downtime/

#### ▼ Istio Ingress Gatewayでダウンタイムを発生させない

Istio Ingress Gateway でダウンタイムが発生すると、アプリへのインバウンド通信が遮断されてしまう。

> - https://thenewstack.io/upgrading-istio-without-downtime/

<br>

### インプレース方式

#### ▼ インプレース方式とは

既存の Istiod コントロールプレーンと Istio Ingress Gateway の両方をインプレース方式でアップグレードする。

#### ▼ 手順

`(1)`

: CRD を更新する。

     必要なCRDのマニフェストは、リポジトリで確認する必要がある。

```bash
$ git clone https://github.com/istio/istio.git

$ kubectl apply -f manifests/charts/base/crds
```

`(2)`

: Istiod コントロールプレーンと Istio Ingress Gateway の両方をインプレース方式でアップグレードする。

```bash
$ istioctl install
```

`(3)`

: データプレーンの istio-proxy を再インジェクションする。

```bash
$ kubectl rollout restart deployment app-deployment -n app
```

> - https://istio.io/latest/docs/setup/upgrade/in-place/

<br>

### カナリア方式

#### ▼ カナリア方式とは

> - https://hiroki-hasegawa.hatenablog.jp/entry/2023/02/26/202548

#### ▼ `istioctl` コマンドの場合

> - https://hiroki-hasegawa.hatenablog.jp/entry/2023/02/26/202548

#### ▼ `helm` コマンドの場合

`(1)`

: Helm では CRD を管理しないようにし、`kubectl` コマンドでこれを作成する。

```bash
$ kubectl diff -f https://raw.githubusercontent.com/istio/istio/1.15.3/manifests/charts/base/crds/crd-all.gen.yaml
```

`(2)`

: istiod チャートを使用して、古いバージョンの MutatingWebhookConfiguration のみを削除する。

    この時、既存のリリースは古いリリースとして扱う。

```bash
$ helm upgrade <古いバージョンのリリース名> <チャートリポジトリ名>/istiod -n istio-system --version <古いバージョン> --set revisionTags=null
```

`(3)`

: istiod チャートを使用して、新しいバージョンの MutatingWebhookConfiguration を作成しつつ、Istiod コントロールプレーンに関する Kubernetes リソースを変更する。

     この時、リリースを新しく命名する。

```bash
$ helm upgrade <新しいバージョンのリリース名> <チャートリポジトリ名>/istiod -n istio-system --version <新しいバージョン>
```

`(4)`

: 特定の Namespace をアップグレードする。

`(5)`

: 動作確認し、問題なければ、残りの Namespace もアップグレードする。

`(6)`

: istiod チャートを使用して、古いリリースで作成した Istiod コントロールプレーンに関する Kubernetes リソースを削除する。

```bash
$ helm upgrade <古いバージョンのリリース名> <チャートリポジトリ名>/istiod -n istio-system --version <古いバージョン> --set revisionTags=null
```

`(7)`

: istio-base を使用して、Istio に関する CRD を変更する。

     この時、リリースを新しく命名する。

```bash
$ helm upgrade <新しいバージョンのリリース名> <チャートリポジトリ名>/base -n istio-system --version <新しいバージョン>
```

`(8)`

: gateway チャートを使用して、Istio Ingress Gateway に関する Kubernetes リソースを変更する。

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

#### ▼ `.gitlab-ci.yml` ファイル

CI 上で Cluster を作成し、Istio をデプロイする。

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
        ENV: "stg"
    # MRにて、任意の方法でパイプラインを実行した場合
    - if: $CI_PIPELINE_SOURCE == 'merge_request_event'
      variables:
        ENV: "tes"
    # 上記以外で、webから手動でパイプラインを実行した場合
    - if: $CI_PIPELINE_SOURCE == 'web'
      variables:
        ENV: "tes"

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
  - build
  - test

# K3Dの設定ファイルをセットアップする
setup_k3d_config:
  stage: build
  image: amazon/aws-cli
  script:
    - AWS_ECR="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
    - |
      cat <<EOF > k3d-config.yaml
      apiVersion: k3d.io/v1alpha5
      kind: Simple
      registries:
        config: |
          mirrors:
            <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com:
              endpoint:
                - "http://<AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com"
          configs:
            ${AWS_ECR}:
              auth:
                username: AWS
                password: $(aws ecr get-login-password --region ${AWS_DEFAULT_REGION})
      EOF

# 指定したバージョンのIstioを検証する
test_istio:
  stage: test
  image:
    name: docker
  variables:
    # K3Dを使用することで Docker in Docker となるため、そのための環境変数を設定する
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
    # registries.yamlファイルをvolumeで配置する
    # もし該当のバージョンのイメージがなければ、rc版を使用する
    - |
      k3d cluster create --config k3d-config.yaml "${CI_PIPELINE_ID}" --image rancher/k3s:v"${K8S_NEXT_VERSION}"-k3s1 --agents 2 || \
        k3d cluster create --config k3d-config.yaml "${CI_PIPELINE_ID}" --image rancher/k3s:v"${K8S_NEXT_VERSION}"-rc1-k3s1 --agents 2
    # Nodeにラベル付けする
    - |
      kubectl label node k3d-"${CI_PIPELINE_ID}"-agent-0 node.kubernetes.io/nodetype=ingress --overwrite
      kubectl label node k3d-"${CI_PIPELINE_ID}"-agent-1 node.kubernetes.io/nodetype=system --overwrite
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
    # ブルー/グリーンデプロイ時に新旧Istiodを並行稼働させるために、helmfile.yamlにリビジョンをつける
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

#### ▼ `setup-asdf.sh` ファイル

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
