---
title: 【IT技術の知見】AWS EKSアドオン＠クラウドプロバイダーアドオン
description: AWS EKSアドオン＠クラウドプロバイダーアドオンの知見を記録しています。
---

# AWS EKSアドオン＠クラウドプロバイダーアドオン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS EKSアドオン

### AWS EKSアドオンとは

EKSのコントロールプレーンとデータプレーン上でKubernetesを稼働させるために必要なアドオン。

マネージドタイプとセルフマネージドタイプがあり、マネージドタイプではアドオンの設定値をAWSが管理し、ユーザーの設定を強制的に上書きする。

一方で、セルフマネージドタイプではユーザーがアドオンの設定値を定義できる。

> - https://docs.aws.amazon.com/eks/latest/userguide/add-ons-configuration.html
> - https://qiita.com/masahata/items/ba88d0f9c26b1c2bf6f9

<br>

### セットアップ

#### ▼ コンソール画面から

| 設定項目               | 説明                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------- |
| バージョン             | AWS EKSアドオンのバージョンを設定する。                                             |
| オプション             | AWS EKSアドオンのパラメーターを設定する。                                           |
| 継承                   | AWS EKSのNodeのIAMロールをEKSアドオンにも適用するか否かを設定する。                 |
| コンフリクトの解決方法 | 既存のAWS EKSアドオンが存在している場合に、上書きするかそのままとするかを設定する。 |

#### ▼ Terraformの場合

Terraformを使用する。

```terraform
# aws-eks-corednsアドオン
resource "aws_eks_addon" "coredns" {
  cluster_name                = aws_eks_cluster.foo.name
  addon_version               = "<バージョン>"
  addon_name                  = "coredns"
  # Terraformで設定を上書きできるようにする
  resolve_conflicts_on_update = "OVERWRITE"
  # スケジューリングさせるNodeを設定する
  configuration_values = jsonencode(
    {
      nodeSelector = {
        "node.kubernetes.io/nodegroup" = "system"
      }
    }
  )
}


# aws-kube-proxyアドオン
resource "aws_eks_addon" "kube_proxy" {
  cluster_name                = aws_eks_cluster.foo.name
  addon_version               = "<バージョン>"
  addon_name                  = "kube-proxy"
  # Terraformで設定を上書きできるようにする
  resolve_conflicts_on_update = "OVERWRITE"
}


# aws-vpc-cniアドオン
resource "aws_eks_addon" "vpc_cni" {
  cluster_name                = aws_eks_cluster.foo.name
  addon_version               = "<バージョン>"
  addon_name                  = "vpc-cni"
  # Terraformで設定を上書きできるようにする
  resolve_conflicts_on_update = "OVERWRITE"
  # 環境変数を設定する
  configuration_values = jsonencode(
    {
      env = {
        # Podの上限数を変更する
        MINIMUM_IP_TARGET = "10"
        WARM_IP_TARGET    = "5"
      }
    }
  )
}
```

#### ▼ Helmの場合

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://aws.github.io/eks-charts


# aws-eks-corednsアドオン
# 執筆時点 (2023/03/02) 時点でチャートなし


# aws-kube-proxyアドオン
# 執筆時点 (2023/03/02) 時点でチャートなし


# aws-vpc-cniアドオン
$ helm install <Helmリリース名> <チャートリポジトリ名>/aws-vpc-cni -n kube-system --version <バージョンタグ>
```

> - https://github.com/aws/eks-charts/tree/master/stable

<br>

## 02. aws-eks-codednsアドオン

### aws-eks-codednsアドオンとは

EKSの各Node上で、`kube-dns`という名前のDeploymentとして稼働する。

同じCluster内の全てのPodの名前解決を行う。

aws-eks-corednsアドオンがAWS EKS Cluster内に無い場合、外部サービス (例：SSOのIDプロバイダーなど) の名前解決を実行できなくなるため、必須である。

> - https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html

<br>

### 設定

#### ▼ バージョン

Kubernetesのバージョンに応じて、異なるアドオンのバージョンを使用する必要がある。

> - https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/managing-coredns.html

<br>

## 03. aws-eks-distro-for-opentelemetry

テレメトリーの収集をマネージドにする。

メトリクスの場合、ストレージとアラートをマネージドにしたManaged Prometheusと組み合わせると、データの収集 (プル型のみ) から保管までをマネージドにできる。

> - https://speakerdeck.com/k6s4i53rx/opentelemetrywoyong-itaobservabilityji-pan-noshi-zhuang-with-aws-distro-for-opentelemetry?slide=13

<br>

## 04. aws-eks-kube-proxy

### aws-eks-kube-proxyアドオンとは

EKSの各Node上で、`kube-proxy`という名前のDaemonSetとして稼働する。

EKSのコントロールプレーン上のkube-apiserverが、Node外からPodにインバウンド通信をルーティングできるようにする。

aws-eks-kube-proxyアドオンがAWS EKS Cluster内に無い場合、Pod内のコンテナのライフサイクルを何も管理できなくなるため、必須である。

> - https://docs.aws.amazon.com/eks/latest/userguide/managing-kube-proxy.html

<br>

### 設定

#### ▼ バージョン

Kubernetesのバージョンに応じて、異なるアドオンのバージョンを使用する必要がある。

> - https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/managing-kube-proxy.html

<br>

## 05. aws-eks-vpc-cniアドオン

### aws-eks-vpc-cniアドオンとは

EKSのNode上で、`aws-node`という名前のDaemonSetとして稼働する。

aws-eks-vpc-cniアドオンがAWS EKS Cluster内に無い場合、EC2ワーカーNodeにアタッチされるはずのAWS ENIを作成できない。

そのため、何も通信ができなくなるため、PodやServiceにIPアドレスが自動的に割り当てられないため、必須である。

![aws_eks-vpc-cni](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_eks-vpc-cni.png)

> - https://aws.github.io/aws-eks-best-practices/networking/vpc-cni/
> - https://docs.aws.amazon.com/eks/latest/userguide/pod-networking.html
> - https://medium.com/engineered-publicis-sapient/container-network-interface-cni-for-eks-4b1cbfff0f4e

<br>

## 05-02. aws-eks-vpc-cniアドオンの仕組み

### アーキテクチャ

aws-eks-vpc-cniアドオンは、L-IPAMデーモン (ipamd) 、CNIプラグイン、といったコンポーネントから構成されている。

AWS EKS Cluster内にネットワークを作成する。

> - https://aws.github.io/aws-eks-best-practices/networking/vpc-cni/

<br>

### マニフェスト

```yaml
kind: DaemonSet
apiVersion: apps/v1
metadata:
  name: aws-node
  namespace: kube-system
  labels:
    app.kubernetes.io/name: aws-node
    app.kubernetes.io/instance: aws-vpc-cni
    k8s-app: aws-node
    app.kubernetes.io/version: "v1.15.3"
spec:
  updateStrategy:
    rollingUpdate:
      maxUnavailable: 10%
    type: RollingUpdate
  selector:
    matchLabels:
      k8s-app: aws-node
  template:
    metadata:
      labels:
        app.kubernetes.io/name: aws-node
        app.kubernetes.io/instance: aws-vpc-cni
        k8s-app: aws-node
    spec:
      priorityClassName: "system-node-critical"
      serviceAccountName: aws-node
      hostNetwork: true
      initContainers:
        - name: aws-vpc-cni-init
          image: 602401143452.dkr.ecr.us-west-2.amazonaws.com/amazon-k8s-cni-init:v1.15.3
          env:
            - name: DISABLE_TCP_EARLY_DEMUX
              value: "false"
            - name: ENABLE_IPv6
              value: "false"
          securityContext:
            privileged: true
          resources:
            requests:
              cpu: 25m
          volumeMounts:
            - mountPath: /host/opt/cni/bin
              name: cni-bin-dir
      terminationGracePeriodSeconds: 10
      tolerations:
        - operator: Exists
      securityContext: {}
      containers:
        # aws-eks-vpc-cniの実体
        - name: aws-node
          image: 602401143452.dkr.ecr.us-west-2.amazonaws.com/amazon-k8s-cni:v1.15.3
          ports:
            - containerPort: 61678
              name: metrics
          livenessProbe:
            exec:
              command:
                - /app/grpc-health-probe
                - -addr=:50051
                - -connect-timeout=5s
                - -rpc-timeout=5s
            initialDelaySeconds: 60
            timeoutSeconds: 10
          readinessProbe:
            exec:
              command:
                - /app/grpc-health-probe
                - -addr=:50051
                - -connect-timeout=5s
                - -rpc-timeout=5s
            initialDelaySeconds: 1
            timeoutSeconds: 10
          env:
            - name: ADDITIONAL_ENI_TAGS
              value: "{}"
            - name: AWS_VPC_CNI_NODE_PORT_SUPPORT
              value: "true"
            - name: AWS_VPC_ENI_MTU
              value: "9001"
            - name: AWS_VPC_K8S_CNI_CUSTOM_NETWORK_CFG
              value: "false"
            - name: AWS_VPC_K8S_CNI_EXTERNALSNAT
              value: "false"
            - name: AWS_VPC_K8S_CNI_LOGLEVEL
              value: "DEBUG"
            - name: AWS_VPC_K8S_CNI_LOG_FILE
              value: "/host/var/log/aws-routed-eni/ipamd.log"
            - name: AWS_VPC_K8S_CNI_RANDOMIZESNAT
              value: "prng"
            - name: AWS_VPC_K8S_CNI_VETHPREFIX
              value: "eni"
            - name: AWS_VPC_K8S_PLUGIN_LOG_FILE
              value: "/var/log/aws-routed-eni/plugin.log"
            - name: AWS_VPC_K8S_PLUGIN_LOG_LEVEL
              value: "DEBUG"
            - name: DISABLE_INTROSPECTION
              value: "false"
            - name: DISABLE_METRICS
              value: "false"
            - name: DISABLE_NETWORK_RESOURCE_PROVISIONING
              value: "false"
            - name: ENABLE_IPv4
              value: "true"
            - name: ENABLE_IPv6
              value: "false"
            - name: ENABLE_POD_ENI
              value: "false"
            - name: ENABLE_PREFIX_DELEGATION
              value: "false"
            - name: VPC_CNI_VERSION
              value: "v1.15.3"
            - name: WARM_ENI_TARGET
              value: "1"
            - name: WARM_PREFIX_TARGET
              value: "1"
            - name: MY_NODE_NAME
              valueFrom:
                fieldRef:
                  apiVersion: v1
                  fieldPath: spec.nodeName
            - name: MY_POD_NAME
              valueFrom:
                fieldRef:
                  apiVersion: v1
                  fieldPath: metadata.name
          resources:
            requests:
              cpu: 25m
          securityContext:
            capabilities:
              add:
                - NET_ADMIN
                - NET_RAW
          volumeMounts:
            - mountPath: /host/opt/cni/bin
              name: cni-bin-dir
            - mountPath: /host/etc/cni/net.d
              name: cni-net-dir
            - mountPath: /host/var/log/aws-routed-eni
              name: log-dir
            - mountPath: /var/run/aws-node
              name: run-dir
            - mountPath: /run/xtables.lock
              name: xtables-lock
        # Node Agent (aws-network-policy-agent)
        # NetworkPolicyをCluster全体に適用する
        - name: aws-eks-nodeagent
          image: 602401143452.dkr.ecr.us-west-2.amazonaws.com/amazon/aws-network-policy-agent:v1.0.5
          env:
            - name: MY_NODE_NAME
              valueFrom:
                fieldRef:
                  apiVersion: v1
                  fieldPath: spec.nodeName
          args:
            - --enable-ipv6=false
            - --enable-network-policy=false
            - --enable-cloudwatch-logs=false
            - --enable-policy-event-logs=false
            - --metrics-bind-addr=:8162
            - --health-probe-bind-addr=:8163
          resources:
            requests:
              cpu: 25m
          securityContext:
            capabilities:
              add:
                - NET_ADMIN
            privileged: true
          volumeMounts:
            - mountPath: /host/opt/cni/bin
              name: cni-bin-dir
            - mountPath: /sys/fs/bpf
              name: bpf-pin-path
            - mountPath: /var/log/aws-routed-eni
              name: log-dir
            - mountPath: /var/run/aws-node
              name: run-dir
      volumes:
        - name: bpf-pin-path
          hostPath:
            path: /sys/fs/bpf
        - name: cni-bin-dir
          hostPath:
            path: /opt/cni/bin
        - name: cni-net-dir
          hostPath:
            path: /etc/cni/net.d
        - name: log-dir
          hostPath:
            path: /var/log/aws-routed-eni
            type: DirectoryOrCreate
        - name: run-dir
          hostPath:
            path: /var/run/aws-node
            type: DirectoryOrCreate
        - name: xtables-lock
          hostPath:
            path: /run/xtables.lock
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                  - key: kubernetes.io/os
                    operator: In
                    values:
                      - linux
                  - key: kubernetes.io/arch
                    operator: In
                    values:
                      - amd64
                      - arm64
                  - key: eks.amazonaws.com/compute-type
                    operator: NotIn
                    values:
                      - fargate
```

> - https://github.com/aws/amazon-vpc-cni-k8s/blob/v1.15.3/config/master/aws-k8s-cni.yaml#L351-L567
> - https://aws.amazon.com/jp/blogs/news/amazon-vpc-cni-now-supports-kubernetes-network-policies/
> - https://github.com/aws/aws-network-policy-agent

<br>

### L-IPAMデーモン：Local IP Address Manager Daemon

#### ▼ L-IPAMデーモンとは

NodeやPodにIPアドレスを割り当てる。

`aws-node`のDaemonSet配下のPod上で、デーモンとして稼働している。

他のCNIアドオンにない独自モードを持つ。

<br>

### 設定

#### ▼ バージョン

Kubernetesのバージョンに応じて、異なるアドオンのバージョンを使用する必要がある。

> - https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/managing-vpc-cni.html#vpc-add-on-update

#### ▼ 環境変数

| 環境変数名                              | 説明                                                                                                                                                                                                                                                                                 | 設定例                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `ADDITIONAL_ENI_TAGS`                   |                                                                                                                                                                                                                                                                                      | `{}`                                                                             |
| `ANNOTATE_POD_IP`                       |                                                                                                                                                                                                                                                                                      | `true`                                                                           |
| `AWS_VPC_CNI_NODE_PORT_SUPPORT`         |                                                                                                                                                                                                                                                                                      | `true`                                                                           |
| `AWS_VPC_ENI_MTU`                       |                                                                                                                                                                                                                                                                                      | `9001`                                                                           |
| `AWS_VPC_K8S_CNI_CONFIGURE_RPFILTER`    |                                                                                                                                                                                                                                                                                      | `false`                                                                          |
| `AWS_VPC_K8S_CNI_CUSTOM_NETWORK_CFG`    |                                                                                                                                                                                                                                                                                      | `false`                                                                          |
| `AWS_VPC_K8S_CNI_EXTERNALSNAT`          |                                                                                                                                                                                                                                                                                      | `false`                                                                          |
| `AWS_VPC_K8S_CNI_LOGLEVEL`              | aws-eks-vpcアドオンのログレベルを設定する。                                                                                                                                                                                                                                          | `DEBUG`                                                                          |
| `AWS_VPC_K8S_CNI_LOG_FILE`              | aws-eks-vpcアドオンのログファイルの保管先を設定する。                                                                                                                                                                                                                                | `/host/var/log/aws-routed-eni/ipamd.log`                                         |
| `AWS_VPC_K8S_CNI_RANDOMIZESNAT`         |                                                                                                                                                                                                                                                                                      | `prng`                                                                           |
| `AWS_VPC_K8S_CNI_VETHPREFIX`            |                                                                                                                                                                                                                                                                                      | `eni`                                                                            |
| `AWS_VPC_K8S_PLUGIN_LOG_FILE`           | aws-eks-vpcアドオンのプラグインのログファイルの保管先を設定する。                                                                                                                                                                                                                    | `/var/log/aws-routed-eni/plugin.log`                                             |
| `AWS_VPC_K8S_PLUGIN_LOG_LEVEL`          | aws-eks-vpcアドオンのプラグインのログレベルを設定する。                                                                                                                                                                                                                              | `DEBUG`                                                                          |
| `CLUSTER_ENDPOINT`                      | AWS EKS ClusterのエンドポイントのURLを設定する。                                                                                                                                                                                                                                     | `https://*****.sk1.ap-northeast-1.eks.amazonaws.com`                             |
| `CLUSTER_NAME`                          | AWS EKS Clusterの名前を設定する。                                                                                                                                                                                                                                                    | `foo-cluster`                                                                    |
| `DISABLE_INTROSPECTION`                 |                                                                                                                                                                                                                                                                                      | `false`                                                                          |
| `DISABLE_METRICS`                       |                                                                                                                                                                                                                                                                                      | `false`                                                                          |
| `DISABLE_NETWORK_RESOURCE_PROVISIONING` |                                                                                                                                                                                                                                                                                      | `false`                                                                          |
| `ENABLE_IPv4`                           |                                                                                                                                                                                                                                                                                      | `true`                                                                           |
| `ENABLE_IPv6`                           |                                                                                                                                                                                                                                                                                      | `false`                                                                          |
| `ENABLE_POD_ENI`                        | Podにセキュリティグループを紐づける機能 (Security groups for Pods) を有効化するかどうかを設定する。                                                                                                                                                                                  | `false`                                                                          |
| `ENABLE_PREFIX_DELEGATION`              | Prefix delegationモードを有効化するかを設定する。                                                                                                                                                                                                                                    | `false`                                                                          |
| `MAX_ENI`                               | AWS EC2/FargateワーカーNode当たりで最大で紐づけるENI数を設定する。                                                                                                                                                                                                                   | `20`                                                                             |
| `MINIMUM_IP_TARGET`                     | `WARM_ENI_TARGET`と競合するため、デフォルトでは設定されていない。AWS EC2/FargateワーカーNode当たりで最低限確保するセカンダリープライベートIPアドレス数を設定する。                                                                                                                   | `20`                                                                             |
| `MY_NODE_NAME`                          | ワーカーNode名が設定されているマニフェストのキーを設定する。                                                                                                                                                                                                                         | `"fieldRef": {"apiVersion": "v1","fieldPath": "spec.nodeName"}}`                 |
| `MY_POD_NAME`                           | Pod名が設定されているマニフェストのキーを設定する。                                                                                                                                                                                                                                  | `"fieldRef": {"apiVersion": "v1","fieldPath": "metadata.name"}}`                 |
| `POD_SECURITY_GROUP_ENFORCING_MODE`     | Podのセキュリティグループの適用方法を設定する。注意点として、Podの送信元IPアドレスにも影響を与える。                                                                                                                                                                                 | `standard` (`standard`の場合は、プライマリーENIのセキュリティグループを適用する) |
| `VPC_ID`                                | AWS VPCのIDを設定する。                                                                                                                                                                                                                                                              | `vpc-*****`                                                                      |
| `WARM_ENI_TARGET`                       | AWS EC2/FargateワーカーNode当たりで最低限確保するAWS ENI数を設定する。                                                                                                                                                                                                               | `1`                                                                              |
| `WARM_PREFIX_TARGET`                    |                                                                                                                                                                                                                                                                                      | `1`                                                                              |
| `WARM_IP_TARGET`                        | `WARM_ENI_TARGET`と競合するため、デフォルトでは設定されていない。AWS EC2/FargateワーカーNode当たりでウォーム状態にしておくセカンダリープライベートIPアドレス数を設定する。`WARM_ENI_TARGET`の値が小さすぎると、EC2-APIのコール回数が増え、リクエスト数制限にひっかかる可能性がある。 | `2`                                                                              |

> - https://github.com/aws/amazon-vpc-cni-k8s#cni-configuration-variables
> - https://aws.github.io/aws-eks-best-practices/networking/vpc-cni/#configure-ip-and-eni-target-values-in-address-constrained-environments
> - https://repost.aws/ja/knowledge-center/eks-configure-cni-plugin-use-ip-address
> - https://dunkshoot.hatenablog.com/entry/eks_reduce_number_of_ipaddress
> - https://zenn.dev/nshmura/articles/fbb53aaf6fed8c
> - https://www.grugrut.net/posts/202107250958/

#### ▼ 確認方法

aws-eks-vpc-cniアドオンは、`aws-node`というDaemonSetとして稼働している。

これのコンテナの環境変数で、アドオンの設定が管理されている。

```bash
$ kubectl get daemonset aws-node \
    -n kube-system -o \
    jsonpath='{.spec.template.spec.containers[*].env}' \
    | jq .
```

<br>

### セカンダリーIPアドレス割り当てモード

#### ▼ セカンダリーIPアドレス割り当てモードとは

AWSのENIには、セカンダリーIPアドレス割り当てという機能がある。

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/MultipleIP.html#ManageMultipleIP

L-IPAMデーモンは、元からあるこの機能を利用し、NodeのAWS ENIに紐づけられたセカンダリープライベートIPアドレスをPodに割り当てる。

この時、Nodeのインスタンスタイプごとに紐付けられるセカンダリープライベートIPアドレス数に制限があるため、Node上でスケジューリングさせるPod数がインスタンスタイプに依存する。

執筆時点 (2022/09/24) のFargateでは、インスタンスタイプに限らずNode当たり`1`個しかPodをスケジューリングさせられない。

![aws-eks-vpc-cni-addon_standard-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws-eks-vpc-cni-addon_standard-mode.png)

> - https://aws.github.io/aws-eks-best-practices/networking/vpc-cni/
> - https://itnext.io/kubernetes-is-hard-why-eks-makes-it-easier-for-network-and-security-architects-ea6d8b2ca965
> - https://medium.com/elotl-blog/kubernetes-networking-on-aws-part-ii-47906de2921d
> - https://github.com/awslabs/amazon-eks-ami/blob/master/files/eni-max-pods.txt

#### ▼ IPアドレス割り当ての仕組み

`(1)`

: L-IPAMデーモンは、ENIとセカンダリープライベートIPアドレスの情報を、CNIプラグインにプールする。

     プールのENIとセカンダリープライベートIPアドレスの数は、`MINIMUM_IP_TARGET`と`WARM_IP_TARGET` (または`WARM_ENI_TARGET`) の合計数で決まる。

`(2)`

: kubeletは、ENIに関する`ADD`/`DEL`の命令をCNIプラグインに送信する。

`(3)`

: L-IPAMデーモンはCNIプラグインを参照する。

     また、CNIプラグイン上の情報に応じてEC2-APIをコールする。 ENIをNodeに割り当てる。

     反対に、NodeのENIを解放し、ENIのプールに戻す。

![aws-eks-vpc-cni-addon_standard-mode_architecture_1.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws-eks-vpc-cni-addon_standard-mode_architecture_1.png)

`(3)`

: kubeletは、セカンダリープライベートIPアドレスに関する`ADD`/`DEL`の命令を、CNIプラグインに送信する。

`(4)`

: CNIプラグインは、L-IPAMデーモンのプールからIPアドレスを取得し、Podを割り当てる。

     反対に、PodからIPアドレスを解放し、L-IPAMデーモンのプールに戻す。

![aws-eks-vpc-cni-addon_standard-mode_architecture_2.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws-eks-vpc-cni-addon_standard-mode_architecture_2.png)

> - https://aws.github.io/aws-eks-best-practices/networking/vpc-cni/
> - https://qiita.com/hichihara/items/54ff9aeff476bf463509#cni-%E3%82%AA%E3%83%9A%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3

<br>

### Prefix delegationモード (プレフィクス委任モード)

#### ▼ Prefix delegationモードとは

AWSのENIには、Prefix delegation (プレフィクス委任) という機能がある。

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/work-with-prefixes.html#view-prefix

L-IPAMデーモンは、元からあるこの機能を利用し、NodeのENIにCIDR (`/28`) を割り当て、これから取得したIPアドレスをPodに割り当てる。

ENIの個数を増やすごとに、`16`個分のIPアドレス (`/28`) を確保できる。

Prefix delegationモードを使用する場合、Nodeを置くAWSサブネットのCIDRを`/28`よりも大きくしておく必要がある。

![aws-eks-vpc-cni_prefix-delegation-mode.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws-eks-vpc-cni_prefix-delegation-mode.png)

> - https://aws.github.io/aws-eks-best-practices/networking/prefix-mode/
> - https://aws.amazon.com/jp/blogs/news/amazon-vpc-cni-increases-pods-per-node-limits/

#### ▼ セットアップ

Prefix delegationモードを採用可能なインスタンスタイプを選ぶ。

> - https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/instance-types.html#ec2-nitro-instances

aws-eks-cの環境変数の`ENABLE_PREFIX_DELEGATION`に`true`を設定する。

```terraform
resource "aws_eks_addon" "vpc_cni" {
  cluster_name                = aws_eks_cluster.foo.name
  addon_version               = "<バージョン>"
  addon_name                  = "vpc-cni"
  resolve_conflicts_on_update = "OVERWRITE"

  # 環境変数を設定する
  configuration_values = jsonencode(
    {
      env = {
        ENABLE_PREFIX_DELEGATION = "true"
      }
    }
  )
}
```

AWSのセルフマネージドNodeグループで任意のAMIを使用していたり、またはマネージドNodeグループで起動テンプレートでNodeを作成している場合に、以降の手順が必要になる。

一方で、AMIを指定していなかったり、起動テンプレートを使用していない場合には、以降の手順は不要である (`v1.9`以上のaws-eks-vpc-cniアドオン)。

`max-pods-calculator.sh`ファイルを使用して、事前にPodの最大数を計算しておく。

なお、vCPUが`30`未満のインスタンスタイプの場合に最大数は`110`個になり、それ以外の場合は`250`個になる。

```bash
# ファイルをダウンロードする
$ curl -O https://raw.githubusercontent.com/awslabs/amazon-eks-ami/master/files/max-pods-calculator.sh

# 権限を変更する
$ chmod +x max-pods-calculator.sh

# --cni-prefix-delegation-enabledオプションを有効化した上でPod最大数を計算する
$ ./max-pods-calculator.sh \
    --instance-type <インスタンスタイプ> \
    --cni-version <aws-eks-vpc-cniのバージョン> \
    --cni-prefix-delegation-enabled
```

`bootstrap.sh`ファイルに必要なパラメーターを渡す。

```bash
#!/bin/bash

# ユーザーデータファイル

/etc/eks/bootstrap.sh foo-eks-cluster \
  --b64-cluster-ca $B64_CLUSTER_CA \
  --apiserver-endpoint $APISERVER_ENDPOINT \
  --container-runtime containerd \
  --use-max-pods false \
  --kubelet-extra-args "--max-pods=<max-pods-calculator.shファイルから取得したPodの最大数>"
```

> - https://docs.aws.amazon.com/eks/latest/userguide/cni-increase-ip-addresses.html
> - https://aws.amazon.com/jp/blogs/news/amazon-vpc-cni-increases-pods-per-node-limits/

<br>

#### ▼ セカンダリーIPアドレス割り当てモードとの比較

AWSドキュメントでEC2 Nodeに割り当てられるIPアドレスを増やす調べると、従来のセカンダリーIPアドレス割り当てモードではなく、Prefix delegationモードの方が記載が充実している。

AWSとしては、Prefix delegationモードの方を使って欲しいのかもしれない。

実際、セカンダリーIPアドレス割り当てモードでは、割り当てられるIPアドレスが劇的に増えないため、Prefix delegationモードの方が良い。

> - https://docs.aws.amazon.com/eks/latest/userguide/cni-increase-ip-addresses.html

<br>

## 05-03. Podの上限数を上げる

### Podの上限数

#### ▼ 上限数の決まり方

Nodeのインスタンスタイプごとに紐付けられるセカンダリーIPアドレス数に制限がある。

そのため、Node上でスケジューリングさせるPod数がインスタンスタイプに依存する。

|            | t3.nano | t3.micro | t3.small | t3.medium | t3.large | t3.xlarge | t3.2xlarge |
| ---------- | ------- | -------- | -------- | --------- | -------- | --------- | ---------- |
| Node `1`個 | 4       | 4        | 11       | 17        | 35       | 58        | 58         |
| `2`個      | 8       | 8        | 22       | 34        | 70       | 116       | 116        |
| `3`個      | 12      | 12       | 33       | 51        | 105      | 174       | 174        |
| `4`個      | 16      | 16       | 44       | 68        | 140      | 232       | 232        |

#### ▼ 現在の上限数

`kubectl describe`コマンドの`Capacity`項目で、現在のPodの上限数を確認できる。

```bash
$ kubectl describe node <Node名>

...

Capacity:
  cpu:                2
  ephemeral-storage:  20959212Ki
  hugepages-1Gi:      0
  hugepages-2Mi:      0
  memory:             8022992Ki
  pods:               35 # Podの上限数

 ...

```

> - https://qiita.com/okubot55/items/2c25d75bd72bac629829

<br>

### セカンダリーIP割り当てモードの場合

#### ▼ 設定方法

`MINIMUM_IP_TARGET` (Node当たり最低限のセカンダリープライベートIPアドレス数) または`WARM_IP_TARGET` (Node当たりのウォーム状態のセカンダリープライベートIPアドレス数) で、Node当たりのPod数を設定する。

他にも設定可能な変数があるが、ここではこの2つを使用する。

`MINIMUM_IP_TARGET`には、Podの冗長化数も加味して予想されるPod数分プラスアルファを設定する。

また、`WARM_IP_TARGET`には、ウォーム状態のセカンダリープライベートIPアドレスを設定する。

Podの上限数を上げる場合、AWS EKSが属するAWS VPCサブネットで確保するセカンダリープライベートIPアドレス数も考慮すること。

#### ▼ シナリオ

例えば、Node当たりにスケジューリングされるPod数の最大数が、Podの冗長化の数も考慮して、`10`個だとする。

`(1)`

: Nodeで小さめのインスタンスサイズを選びつつ、`MINIMUM_IP_TARGET=10+2`と`WARM_IP_TARGET=2`を設定する。

`(2)`

: Node当たり`12`個のセカンダリープライベートIPアドレスを確保する。

     さらに追加で、常に`2`個のセカンダリープライベートIPアドレスをウォーム状態にしておくようになる。

     結果、最初`12`個のPodをスケジューリングできる。

`(3)`

: Podが`12`個を超えた段階で、合計のセカンダリープライベートIPアドレス数は`2`個のウォーム状態数を維持しながら増えていく。

> - https://github.com/aws/amazon-vpc-cni-k8s/blob/master/docs/eni-and-ip-target.md
> - https://github.com/awslabs/amazon-eks-ami/blob/master/files/eni-max-pods.txt
> - https://dunkshoot.hatenablog.com/entry/eks_reduce_number_of_ipaddress
> - https://qiita.com/hkame/items/1378f9176a26e39d93c7#%E3%83%8E%E3%83%BC%E3%83%89%E3%81%AE%E7%A2%BA%E4%BF%9Dip%E3%82%A2%E3%83%89%E3%83%AC%E3%82%B9%E3%82%92%E6%B8%9B%E3%82%89%E3%81%99
> - https://zenn.dev/nshmura/articles/fbb53aaf6fed8c#minimum_ip_target-%E3%81%A8-warm_ip_target%E3%81%AB%E3%82%88%E3%82%8Bip%E7%A2%BA%E4%BF%9D%E3%81%AE%E4%BE%8B

<br>

### Prefix delegationモードの場合

#### ▼ 設定方法

`MINIMUM_IP_TARGET` (Node当たりの`/28`を持つENIの個数) または`WARM_IP_TARGET` (Node当たりのウォーム状態のセカンダリープライベートIPアドレス数) で、Node当たりのPod数を設定する。

他にも設定可能な変数があるが、ここではこの2つを使用する。

#### ▼ シナリオ

> - https://github.com/aws/amazon-vpc-cni-k8s/blob/master/docs/prefix-and-ip-target.md

<br>
