---
title: 【IT技術の知見】リソース定義＠ArgoCD
description: リソース定義＠ArgoCDの知見を記録しています。
---

# リソース定義＠ArgoCD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### ツールバージョン

手動でデプロイすることになるため、使用するツールを管理できるようにする。

```bash
argocd 2.7.2
helm 3.11.2
helmfile 0.152.0
kubectl 1.26
sops 3.7.3
```

<br>

### AWS側

#### ▼ Terraformの公式モジュールの場合

ArgoCD のセットアップのうち、AWS 側で必要なものをまとめる。

ここでは、Terraform の公式モジュールを使用する。

```terraform
module "iam_assumable_role_with_oidc_argocd_repo_server" {

  source = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"

  version = "<バージョン>"

  # ArgoCDのrepo-serverのPodに紐付けるIAMロール
  create_role = true
  role_name   = "foo-argocd-reposerver"

  # Amazon EKS ClusterのOIDCプロバイダーURLからhttpsプロトコルを除いたもの
  # ArgoCDは外部のAmazon EKS Clusterで稼働している
  provider_url = replace(module.eks_argocd.cluster_oidc_issuer_url, "https://", "")

  # AWS IAMロールに紐付けるIAMポリシー
  role_policy_arns = [
    aws_iam_policy.argocd_reposerver_policy.arn
  ]

  # ArgoCDのrepo-serverのPodのServiceAccount名
  # ServiceAccountは、Terraformではなく、マニフェストで定義したほうが良い
  oidc_fully_qualified_subjects = [
    "system:serviceaccount:argocd:foo-argocd-repo-server",
    ...
  ]
}

resource "aws_iam_policy" "argocd_reposerver_policy" {
  name = "foo-argocd-reposerver-policy"
  policy = templatefile(
    "${path.module}/policies/inline_policies/argocd_reposerver_policy.tpl",
    {}
  )
}
```

<br>

### マニフェスト側

#### ▼ 非チャートとして

非チャートとして、argo-cd リポジトリのマニフェストを送信し、リソースを作成する。

```bash
$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

> - https://argo-cd.readthedocs.io/en/stable/getting_started/
> - https://github.com/argoproj/argo-cd/blob/v2.6.0/manifests/install.yaml

#### ▼ チャートとして

CRD を Helm の管理外で作成する。

```bash
$ git clone https://github.com/argoproj/argo-cd

$ kubectl diff -k ./manifests/crds

$ kubectl apply -k ./manifests/crds
```

これは、URL で指定してもよい。

```bash
$ kubectl diff -k "https://github.com/argoproj/argo-cd/manifests/crds?ref=<タグ>"

$ kubectl apply -k "https://github.com/argoproj/argo-cd/manifests/crds?ref=<タグ>"
```

例えば、argocd-cd チャートの `5.26.0` を使用する場合、これは ArgoCD の `2.6.5` をサポートしているため、以下の値で適用する。

```bash
$ kubectl diff -k "https://github.com/argoproj/argo-cd/manifests/crds?ref=v2.6.5"

$ kubectl apply -k "https://github.com/argoproj/argo-cd/manifests/crds?ref=v2.6.5"
```

チャートリポジトリからチャートをインストールし、Kubernetes リソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://argoproj.github.io/argo-helm

$ helm repo update

$ kubectl create namespace argocd

$ helm install <Helmリリース名> <チャートリポジトリ名>/argo-cd -n argocd --version <バージョンタグ>
```

> - https://github.com/argoproj/argo-helm/tree/main/charts/argo-cd#installing-the-chart

#### ▼ Operatorとして

ArgoCDOperator を先にセットアップし、ArgoCD に関するカスタムリソースを作成させる。

執筆時点 (2023/04/21) では OpenShiht のみで使える。

Operator でインストールすることは非推奨である。

```bash
$ curl -sL https://github.com/operator-framework/operator-lifecycle-manager/releases/download/<バージョン>/install.sh | bash -s <バージョン>

$ kubectl create -f https://operatorhub.io/install/argocd-operator.yaml

$ kubectl get csv -n operators
```

> - https://blog.mosuke.tech/entry/2021/04/13/argocd/
> - https://github.com/argoproj-labs/argocd-operator
> - https://argocd-operator.readthedocs.io/en/latest/install/manual/

<br>

## 01-02. ダッシュボード

### ネットワークに公開しない場合

#### ▼ `kubectl` コマンドを使用して

`(1)`

: 既存の Service を LoadBalancer Service に変更する。

```bash
$ kubectl patch service argocd-server \
    -n foo \
    -p '{"spec": {"type": "LoadBalancer"}}'
```

`(2)`

: Kubernetes 上の ArgoCD ダッシュボードのパスワードを取得する。

```bash
$ kubectl get secret argocd-initial-admin-secret \
    -n foo \
    -o jsonpath="{.data.password}" | base64 -d; echo
```

`(3)`

: `443` 番ポートにルーティングできる `L7` ロードバランサーを作成する。

     この時、IngressとIngress Controllerを作成するか、`kubectl port-forward`コマンドなど実行することにより、ダッシュボードにリクエストを送信する。

     `minikube tunnel`コマンドでは、ポート番号を指定できないことに注意する。

```bash
# Serviceの情報を使用してPodを指定し、ダッシュボードにリクエストを送信できるようにする。
$ kubectl port-forward svc/argocd-server -n argocd 8080:443

# ホストポートを介してPodのポートにリクエストを送信する。
$ curl http://127.0.0.1:8080
```

#### ▼ `argocd` コマンドを使用して

`(1)`

: `argocd` コマンドをインストールする。

> - https://argo-cd.readthedocs.io/en/stable/cli_installation/

```bash
$ curl -L -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64

$ chmod +x /usr/local/bin/argocd
```

`(2)`

: ArgoCD にログインする。ユーザー名とパスワードを要求されるため、これらを入力する。

```bash
$ argocd login <ArgoCDのドメイン名> --username admin --password <前の手順で取得した文字列>

'admin:login' logged in successfully
```

<br>

### ネットワークに公開する場合

#### ▼ 共通の手順

![argocd_argocd-server_dashboard](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_argocd-server_dashboard.png)

Node の外から ArgoCD のダッシュボードをネットワークに公開する場合、Node 外から argocd-server にインバウンド通信が届くようにする必要がある。

Ingress を作成する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  namespace: argocd
  name: argocd-ingress
spec:
  ingressClassName: foo-ingress-class
  rules:
    # ドメインを割り当てる場合、Hostヘッダーの合致ルールが必要である。
    - host: foo.argocd.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: argocd-server
                port:
                  number: 80
```

ClusterIP Service を作成する。

```yaml
apiVersion: v1
kind: Service
metadata:
  namespace: argocd
  name: foo-argocd-service
spec:
  clusterIP: *.*.*.*
  clusterIPs:
    - *.*.*.*
  internalTrafficPolicy: Cluster
  ipFamilies:
    - IPv4
  ipFamilyPolicy: SingleStack
  ports:
    - name: http-foo
      nodePort: 31000
      port: 80
      protocol: TCP
    - name: https-foo
      nodePort: 31001
      port: 443
      protocol: TCP
  selector:
    app.kubernetes.io/name: foo-argocd
  sessionAffinity: None
  type: ClusterIP
```

> - https://techstep.hatenablog.com/entry/2020/11/15/121503

#### ▼ 開発環境の場合

IngressClass を作成する。

開発環境では、IngressClass として Nginx を使用する。

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-ingress-class
spec:
  controller: k8s.io/ingress-nginx
```

#### ▼ 本番環境

IngressClass を作成する。

本番環境では、クラウドプロバイダーの IngressClass (AWS ALB、Google Cloud CLB) を使用する。

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-ingress-class
spec:
  controller: ingress.k8s.aws/alb
```

また、IngressClass (AWS ALB、Google Cloud CLB) に接続できるように、ドメインレジラトリ (Route53、CloudDNS) に ArgoCD のドメインを登録する。

<br>

## 01-03. マニフェスト

### マニフェストの種類

ArgoCD は、Deployment (argocd-server、repo-server、redis-server、dex-server)、StatefulSet (application-controller)、といったコンポーネントから構成される。

```bash
$ kubectl get deployment -n argocd

NAME                                         READY    UP-TO-DATE   AVAILABLE   AGE
deployment.apps/argocd-dex-server    1/1     1        1            119d
deployment.apps/argocd-redis         1/1     1        1            119d
deployment.apps/argocd-repo-server   1/1     1        1            119d
deployment.apps/argocd-server        1/1     1        1            119d


$ kubectl get statefulset -n argocd

NAME                                                    READY   AGE
statefulset.apps/argocd-application-controller   1/1     119d
```

<br>

### Deployment配下のPod

#### ▼ argocd-server

記入中...

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-server
  namespace: argocd
spec:
  serviceAccountName: argocd-server
  containers:
    - name: argocd-server
      image: quay.io/argoproj/argocd:latest
      args:
        - /usr/local/bin/argocd-server
        - --port=8080
        - --metrics-port=8083
        # AWS ALBがHTTPリクエストでルーティングするように設定しているため、HTTPリクエストを許可する
        - --insecure
      # クライアント、Prometheus、からのリクエストを受信する
      ports:
        - containerPort: 8080
          name: server
          protocol: TCP
        - containerPort: 8083
          name: metrics
          protocol: TCP
      # 各種ConfigMapを読み込む。
      env:
        - name: *****
          valueFrom:
            configMapKeyRef:
              key: *****
              name: argocd-cmd-params-cm
              optional: "true"
        - name: *****
          valueFrom:
            secretKeyRef:
              key: *****
              name: argocd-redis
              optional: "true"
      # Volumeの各種パスをコンテナにマウントする
      # https://github.com/argoproj/argo-cd/blob/v2.6.0/common/common.go#L60-L77
      volumeMounts:
        # SSH公開鍵認証既知ホストファイルをコンテナにマウントする
        - name: ssh-known-hosts
          mountPath: /app/config/ssh
        # ArgoCD外にHTTPSリクエストを送信するためのサーバー証明書をコンテナにマウントする
        - name: tls-certs
          mountPath: /app/config/tls
        # repo-serverに対してHTTPSリクエストするためのサーバー証明書をコンテナにマウントする
        - mountPath: /app/config/server/tls
          name: argocd-repo-server-tls
        # dex-serverに対してHTTPSリクエストするためのサーバー証明書をコンテナにマウントする
        - name: argocd-dex-server-tls
          mountPath: /app/config/dex/tls
        - name: plugins-home
          mountPath: /home/argocd
        - name: styles
          mountPath: /shared/app/custom
        # リポジトリから取得したクローンを保管するディレクトリをコンテナにマウントする
        - name: tmp
          mountPath: /tmp

      ...

  # 各種ConfigMapやSecretを読み込む
  volumes:
    - name: plugins-home
      emptyDir: { }
    - name: tmp
      emptyDir: { }
    - name: ssh-known-hosts
      configMap:
        defaultMode: 420
        name: argocd-ssh-known-hosts-cm
    # ArgoCD外 (特にリポジトリ) にHTTPSリクエストを送信するために、サーバー証明書を設定する。
    - name: tls-certs
      configMap:
        defaultMode: 420
        name: argocd-tls-certs-cm
    - name: styles
      configMap:
        defaultMode: 420
        name: argocd-styles-cm
        optional: "true"
    # repo-serverにHTTPSリクエストを送信するために、サーバー証明書を設定する
    - name: argocd-repo-server-tls
      secret:
        defaultMode: 420
        items:
          - key: tls.crt
            path: tls.crt
          - key: tls.key
            path: tls.key
          - key: ca.crt
            path: ca.crt
        optional: "true"
        secretName: argocd-repo-server-tls
    # dex-serverにHTTPSリクエストを送信するために、サーバー証明書を設定する
    - name: argocd-dex-server-tls
      secret:
        defaultMode: 420
        items:
          - key: tls.crt
            path: tls.crt
          - key: ca.crt
            path: ca.crt
        optional: "true"
        secretName: argocd-dex-server-tls
```

> - https://github.com/argoproj/argo-cd/blob/v2.6.0/manifests/base/server/argocd-server-deployment.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/tls/#inbound-tls-options-for-argocd-server

#### ▼ repo-server

記入中...

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server
  namespace: argocd
spec:
  containers:
    - name: argocd-repo-server
      image: quay.io/argoproj/argocd:latest
      # コマンドのパラーメーターは、argocd-cmd-params-cmから渡す
      args:
        - /usr/local/bin/argocd-repo-server
        - --port=8081
        - --metrics-port=8084
      # application-controller、Prometheus、からのリクエストを受信する
      ports:
        - containerPort: 8081
          name: repo-server
          protocol: TCP
        - containerPort: 8084
          name: metrics
          protocol: TCP
      # 各種ConfigMapを読み込む。
      env:
        - name: XDG_CONFIG_HOME
          value: /.config
        - name: HELM_PLUGINS
          value: /helm-working-dir/plugins
        - name: *****
          valueFrom:
            configMapKeyRef:
              key: *****
              name: argocd-cm
              optional: "true"
        - name: *****
          valueFrom:
            configMapKeyRef:
              key: *****
              name: argocd-cmd-params-cm
              optional: "true"
        - name: *****
          valueFrom:
            secretKeyRef:
              key: *****
              name: argocd-redis
              optional: "true"
      # Volumeの各種パスをコンテナにマウントする
      # https://github.com/argoproj/argo-cd/blob/v2.6.0/common/common.go#L60-L77
      volumeMounts:
        # InitContainerでインストールしたバイナリファイルをコンテナにマウントする
        - name: custom-tools
          mountPath: /usr/local/bin
        # SSH公開鍵認証既知ホストファイルをコンテナにマウントする
        - name: ssh-known-hosts
          mountPath: /app/config/ssh
        # ArgoCD外にHTTPSリクエストを送信するために、サーバー証明書を設定する。
        - name: tls-certs
          mountPath: /app/config/tls
        - name: gpg-keys
          mountPath: /app/config/gpg/source
        - name: gpg-keyring
          mountPath: /app/config/gpg/keys
        - name: argocd-repo-server-tls
          mountPath: /app/config/reposerver/tls
        # ConfigManagementPluginのhelmコマンドを実行するディレクトリをコンテナにマウントする
        - name: helm-working-dir
          mountPath: /helm-working-dir
        # コンテナ間で通信するためのUnixドメインソケットファイルをコンテナにマウントする
        - name: plugins
          mountPath: /home/argocd/cmp-server/plugins
        # リポジトリから取得したクローンを保管するディレクトリをコンテナにマウントする
        - name: tmp
          mountPath: /tmp


  initContainers:
    # ConfigManagementPlugin用のサイドカーにcmp-serverバイナリをコピーするInitContainer
    - name: copyutil
      image: quay.io/argoproj/argocd:latest
      command:
        - /bin/cp
        - -n
        - /usr/local/bin/argocd
        - /var/run/argocd/argocd-cmp-server
      volumeMounts:
        - mountPath: /var/run/argocd
          name: var-files
    # お好きなツールをインストールするInitContainer
    # Helm
    - name: helm-installer
      image: alpine:3.17.3
      command:
        - /bin/sh
        - -c
      args:
        - |
          # インストール処理
      volumeMounts:
        - name: custom-tools
          mountPath: /custom-tools
    - name: sops-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      args:
        - |
          # インストール処理
      volumeMounts:
        - name: custom-tools
          mountPath: /custom-tools
    - name: ksops-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      args:
        - |
          # インストール処理
      volumeMounts:
        - name: custom-tools
          mountPath: /custom-tools
    - name: helm-secrets-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      args:
        - |
          # インストール処理
      volumeMounts:
        - name: helm-working-dir
          mountPath: /helm-working-dir/plugins

  # 各種Secretを読み込む
  volumes:
    - name: custom-tools
      emptyDir: { }
    - name: helm-working-dir
      emptyDir: { }
    - name: plugins
      emptyDir: { }
    - name: var-files
      emptyDir: { }
    - name: tmp
      emptyDir: { }
    - name: ssh-known-hosts
      configMap:
        defaultMode: 420
        name: argocd-ssh-known-hosts-cm
    # ArgoCD外 (特にリポジトリ) にHTTPSリクエストを送信するためのサーバー証明書をコンテナにマウントする
    - name: tls-certs
      configMap:
        defaultMode: 420
        name: argocd-tls-certs-cm
    - name: gpg-keys
      configMap:
        defaultMode: 420
        name: argocd-gpg-keys-cm
    # 他のコンポーネントからHTTPSリクエストを受信するために、サーバー証明書を設定する
    - name: argocd-repo-server-tls
      secret:
        defaultMode: 420
        items:
          - key: tls.crt
            path: tls.crt
          - key: tls.key
            path: tls.key
          - key: ca.crt
            path: ca.crt
        optional: "true"
        secretName: argocd-repo-server-tls

  ...

```

#### ▼ redis-server

記入中...

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-redis-server
  namespace: argocd
spec:
  containers:
    - name: argocd-redis-server
      image: public.ecr.aws/docker/library/redis:latest-alpine
      args:
        - --save
        - ""
        - --appendonly
        - "no"
      # application-controllerからのリクエストを受信する
      ports:
        - containerPort: 6379
          name: redis
          protocol: TCP

  ...

```

#### ▼ dex-server

記入中...

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-dex-server
  namespace: argocd
spec:
  containers:
    - name: argocd-dex-server
      image: ghcr.io/dexidp/dex:latest
      # コマンドのパラーメーターは、argocd-cmd-params-cmから渡す
      command:
        - /shared/argocd-dex
      args:
        - rundex
      # application-controller、Prometheus、からのリクエストを受信する
      ports:
        - name: http
          containerPort: 5556
          protocol: TCP
        - name: grpc
          containerPort: 5557
          protocol: TCP
        - name: metrics
          containerPort: 5558
          protocol: TCP
      # 各種ConfigMapを読み込む
      env:
        - name: *****
          valueFrom:
            configMapKeyRef:
              key: *****
              name: argocd-cmd-params-cm
              optional: "true"

  ...

  # 各種Secretを読み込む
  volumes:
    # 他のコンポーネントからHTTPSリクエストを受信するために、サーバー証明書を設定する
    - name: argocd-dex-server-tls
      secret:
        defaultMode: 420
        items:
          - key: tls.crt
            path: tls.crt
          - key: tls.key
            path: tls.key
          - key: ca.crt
            path: ca.crt
        optional: "true"
        secretName: argocd-dex-server-tls

  ...

```

> - https://github.com/argoproj/argo-cd/blob/v2.6.0/manifests/base/dex/argocd-dex-server-deployment.yaml

<br>

### StatefulSet

#### ▼ application-controller

記入中...

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-application-controller
  namespace: argocd
spec:
  containers:
    - name: argocd-application-controller
      image: quay.io/argoproj/argocd:latest
      # コマンドのパラーメーターは、argocd-cmd-params-cmから渡す
      args:
        - /usr/local/bin/argocd-application-controller
        - --metrics-port=8082
      # Prometheusからのリクエストを受信する
      ports:
        - containerPort: 8082
          name: metrics
          protocol: TCP
      # 各種ConfigMapを読み込む
      env:
        - name: *****
          valueFrom:
            configMapKeyRef:
              key: *****
              name: argocd-cm
              optional: "true"
        - name: *****
          valueFrom:
            configMapKeyRef:
              key: *****
              name: argocd-cmd-params-cm
              optional: "true"
        - name: *****
          valueFrom:
            secretKeyRef:
              key: ****
              name: argocd-redis
              optional: "true"
      # Volumeの各種パスをコンテナにマウントする
      # https://github.com/argoproj/argo-cd/blob/v2.6.0/common/common.go#L60-L77
      volumeMounts:
        - mountPath: /app/config/controller/tls
          name: argocd-repo-server-tls
        - mountPath: /home/argocd
          name: argocd-home
  # 各種Secretを読み込む
  volumes:
    # repo-serverとHTTPSリクエストを送信するために、サーバー証明書を設定する
    - name: argocd-repo-server-tls
      secret:
        defaultMode: 420
        items:
          - key: tls.crt
            path: tls.crt
          - key: tls.key
            path: tls.key
          - key: ca.crt
            path: ca.crt
        optional: "true"
        secretName: argocd-repo-server-tls

  ...

```

<br>

## 02. Application

### Applicationとは

#### ▼ Kuberneresリソースのポーリング

Kubernetes のカスタムリソースから定義される。

ポーリング対象の Kubernetes リソースやカスタムリソースを設定する。

> - https://github.com/argoproj/argo-cd/blob/v2.6.0/manifests/crds/application-crd.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#multiple-configuration-objects

#### ▼ 自己ポーリング

Application 自体もカスタムリソースなため、Application が Application 自身のソースの変更をポーリングし、Sync できる。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#manage-argo-cd-using-argo-cd
> - https://github.com/argoproj/argo-cd/discussions/7908
> - https://speakerdeck.com/sshota0809/argocd-teshi-xian-suru-kubernetes-niokeruxuan-yan-de-risosuteriharifalseshi-jian?slide=49

#### ▼ 操作の種類

| 操作名       | 説明                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sync         | ポーリング対象リポジトリとのマニフェストの差分を確認し、差分があれば `kubectl apply` コマンドを実行する。                                                                                         |
| Refresh      | ポーリング対象リポジトリとのマニフェストの差分を確認する。差分を確認するのみで、applyは実行しない。                                                                                               |
| Hard Refresh | redis-serverに保管されているキャッシュを削除する。また、ポーリング対象リポジトリとのマニフェストの差分を確認する。差分を確認するのみで、applyは実行しない。                                       |
| Restart      | すでにapply済みのKubernetesリソース内のコンテナを再デプロイする。コンテナを再起動するのみで、Kubernetesリソースを作成することはない。<br>- https://twitter.com/reoring/status/1476046977599406087 |

> - https://argo-cd.readthedocs.io/en/stable/core_concepts/
> - https://github.com/argoproj/argo-cd/discussions/8260

#### ▼ ヘルスステータスの種類

| ステータス名 | 説明                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Healthy      | すべてのKubernetesリソースは正常に稼働している。                                                                                                                         |
| Progressing  | 一部のKubernetesリソースは正常に稼働していないが、リソースの状態が変化中のため、正常になる可能性がある。この状態の場合は、ステータスが他のいずれかになるまで待機する。 |
| Degraded     | 一部のKubernetesリソースは正常に稼働していない。                                                                                                                       |
| Suspended    | 一部のKubernetesリソースは、イベント (例：CronJobなど) が実行されることを待機している。                                                                                |
| Missing      | 記入中...                                                                                                                                                              |
| Unknown      | 記入中...                                                                                                                                                              |

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/health/#way-1-define-a-custom-health-check-in-argocd-cm-configmap

#### ▼ Namespace

Application は、元は ArgocCD の application-controller と同じ Namespace のみに作成できたが、執筆時点 (2024/10/07) では任意の Namespace に作成できる。

これにより、例えば application-controller を `argocd` という Namespace に、Application を自由な Namespace に配置できる。

ただし、ルートの Application は argocd-server と同じ Namespace に配置しないと、UI 上に Application を表示できない。

また、この方法を採用するのであれば、Namespace ごとに application-controller を分けたほうがシンプルでわかりやすい。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/app-any-namespace/
> - https://zenn.dev/cybozu_neco/articles/argocd-sharding#application-controller%E3%81%AE%E3%82%B7%E3%83%A3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0

<br>

### .spec.ignoreDifferences

#### ▼ ignoreDifferencesとは

特定の Application の Sync ステータス (Synced、OutOfSync) の判定時、特定の Kubernetes リソースの特定の設定値の差分を無視し、OutOfSync にならないようする。

Sync 後に Kubernetes リソースが変化するような仕様 (動的な設定値、Job による変更、mutating-admission ステップでの Webhook、マニフェストの自動整形など) の場合に使用する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  ignoreDifferences:
    # KubernetesリソースのAPIグループの名前
    - group: apps
      kind: Deployment
      jsonPointers:
        # .spec.replicasキー (インスタンス数) の設定値の変化を無視する。
        - /spec/replicas
    - group: autoscaling
      kind: HorizontalPodAutoscaler
      jqPathExpressions:
        # .spec.metrics (ターゲット対象のメトリクス) の自動整形を無視する。
        - /spec/metrics
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/#application-level-configuration
> - https://blog.framinal.life/entry/2021/10/04/224722

#### ▼ 合わせて `RespectIgnoreDifferences` キーも使用する

注意点として、Sync ステータスの判定時に無視されるのみで、内部的に Sync は実行されてしまうため、Sync のたびに設定値が元に戻ってしまう。

そこで別途、`.spec.syncPolicy.syncOptions[*].RespectIgnoreDifferences` キーも有効化しておくとよい。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  ignoreDifferences:

  ...

  syncPolicy:
    syncOptions:
      - RespectIgnoreDifferences=true
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#respect-ignore-difference-configs
> - https://mixi-developers.mixi.co.jp/update-argocd-to-v2-3-0-d609bbf16662

<br>

### .spec.project

#### ▼ projectとは

アプリケーションの所属する AppProject 名を設定する。

AppProject 名は『`default`』は必ず作成する必要がある。

`default` 以外の AppProject は、認可スコープと紐付けられるように、チーム別や実行環境別に作成するとよい。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: root-application
spec:
  project: root # アプリケーションコンポーネント。その他、実行環境 (dev、stg、prd) がよい。
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-infra-application
spec:
  project: infra # インフラコンポーネント。その他、実行環境 (dev、stg、prd) がよい。
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-app-application
spec:
  project: app # アプリケーションコンポーネント。その他、実行環境 (dev、stg、prd) がよい。
```

> - https://github.com/argoproj/argo-cd/blob/v2.6.0/docs/operator-manual/application.yaml

<br>

### .spec.source

#### ▼ sourceとは

リポジトリ (マニフェストリポジトリ、チャートリポジトリ、OCI リポジトリ) の変更をポーリングし、これらからプルしたマニフェストで
`kubectl apply` コマンドを実行。

| リポジトリの種類                                                              | 管理方法                                 | マニフェストのapply方法                                                                                                           |
| ----------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| マニフェストリポジトリ (例：GitHub内のリポジトリ)                             | マニフェストそのまま                     | ArgoCDで直接的に `kubectl apply` コマンドを実行する。                                                                             |
| チャートリポジトリ (例：ArtifactHub、GitHub Pages、内のリポジトリ、Amazon S3) | チャートアーカイブ (`.tgz` 形式ファイル) | Helmを使用して、ArgoCDで間接的に `kubectl apply` コマンドを実行する。パラメーターに応じて、内部的に `helm` コマンドが実行される。 |
| OCIリポジトリ (例：ECR内のリポジトリ)                                         | チャートアーカイブ (`.tgz` 形式ファイル) | Helmを使用して、ArgoCDで間接的に `kubectl apply` コマンドを実行する。パラメーターに応じて、内部的に `helm` コマンドが実行される。 |

> - https://github.com/argoproj/argo-cd/blob/v2.6.0/docs/operator-manual/application.yaml

<br>

### .spec.source (マニフェストリポジトリの場合)

#### ▼ directory

ポーリング対象のマニフェストリポジトリのディレクトリ構造に関して設定する。

また、マニフェストリポジトリにチャートを配置している場合でも、チャートリポジトリと同様にチャートを扱える。

| 設定項目  | 説明                                                                                                                                                                               |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `include` | `.spec.source.path` キーで指定したディレクトリ内で、特定のマニフェストのみを指定し、kube-apiserverに送信する                                                                       |
| `exclude` | `.spec.source.path` キーで指定したディレクトリ内で、特定のマニフェストを除外し、kube-apiserverに送信する                                                                           |
| `recurse` | `.spec.source.path` キーで指定したディレクトリにサブディレクトリが存在している場合、すべてのマニフェストを指定できるように、ディレクトリ内の再帰的検出を有効化するか否かを設定する。 |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
    targetRevision: main
    path: ./manifests
    directory:
      recurse: "true"
```

> - https://github.com/argoproj/argo-cd/blob/v2.6.0/docs/operator-manual/application.yaml#L78
> - https://argo-cd.readthedocs.io/en/stable/user-guide/tool_detection/

#### ▼ path

ポーリング対象のマニフェストリポジトリのディレクトリを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
    targetRevision: main
    path: ./manifests
```

マニフェストリポジトリにチャートをおいても、チャートリポジトリと同様にポーリングできる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
    targetRevision: main
    path: ./charts
    helm:
      releaseName: foo
      valueFiles:
        - ./values/foo-values.yaml
```

#### ▼ repoURL

ポーリング対象のマニフェストリポジトリの URL を設定する。

パブリックリポジトリであれば認証が不要であるが、プライベートリポジトリであればこれが必要になる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/#git

#### ▼ targetRevision

ポーリング対象のマニフェストリポジトリのブランチやバージョンタグを設定する。

各実行環境に、実行環境に対応したブランチを指定するマニフェストを定義しておくとよい。

これにより、各実行環境内の Application は特定のブランチのみをポーリングするようになる。

```yaml
# 本番環境のApplication
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
  labels:
    app.kubernetes.io/env: prd
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
    targetRevision: main # 本番環境に対応するブランチ
```

```yaml
# ステージング環境のApplication
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
  labels:
    app.kubernetes.io/env: stg
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
    targetRevision: develop # ステージング環境に対応するブランチ
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/#git

<br>

### .spec.source (チャートレジストリ内リポジトリの場合)

#### ▼ chart

ポーリング対象のチャートレジストリ内のリポジトリにあるチャート名を設定する。

バージョンタグは、`Chart.yaml` ファイルの `name` キーから確認する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-repository.git
    targetRevision: main
    chart: <チャート名>
```

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#applications

#### ▼ helm

`helm` コマンドに渡すオプションを設定する。

helmfile と同じように `helm` コマンドを宣言的に実行しつつ、実行を自動化できる。

| 設定項目      | 説明                                                                                                                                                                                                                                                        | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `releaseName` | Helmリリース名を設定する。多くのチャートではデフォルトでArgoCDの名前をHelmリリース名としており、Helmリリース名はチャート内のKubernetesリソースのプレフィクスになる。予期せぬApplicationの再作成を防ぐにために、`releaseName` を明示的に設定したほうがよい。 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `values`      | `helm` コマンドに渡す `values` ファイルの値をハードコーディングする。                                                                                                                                                                                       | 執筆時点 (2022/10/31) では、`values` ファイルは、同じチャートリポジトリ内にある必要がある。チャートと `values` ファイルが異なるリポジトリにある場合 (例：チャートはOSSを参照し、`values` ファイルは自前で定義する) 、`valueFiles` オプションの代わりに `values` オプションを使用する。<br>・https://github.com/argoproj/argo-cd/issues/2789#issuecomment-624043936 <br>・https://github.com/argoproj/argo-cd/blob/v2.6.0/docs/operator-manual/application.yaml#L48-L62 <br><br>ただし、Applicationに `values` ファイルをハードコーディングした場合、共有 `values` ファイルと差分 `values` ファイルに切り分けて定義できなくなってしまう。そこで、`values` オプションの一部分をHelmのテンプレート機能で動的に出力する。ただし、新機能として複数のリポジトリの `values` ファイルを参照する方法が提案されており、これを使用すれば異なるリポジトリに `values` ファイルがあっても `valueFiles` オプションで指定できるようになる。<br>・https://github.com/argoproj/argo-cd/pull/10432 |
| `valueFiles`  | `helm` コマンドに渡す `values` ファイルを設定する。                                                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `version`     | `helm` コマンドのバージョンを設定する。デフォルトでは、`v3` になる。 ArgoCD自体をHelmでセットアップする場合は、インストールするHelmのバージョンを指定できる。そのため、このオプションを使用する必要はない。                                                 | ・https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#helm-version                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

> - https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#helm-plugins
> - https://github.com/argoproj/argo-cd/blob/v2.6.0/docs/operator-manual/application.yaml#L25
> - https://mixi-developers.mixi.co.jp/argocd-with-helm-fee954d1003c

`helm` コマンドに渡す `values` ファイルの値をハードコーディングする。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-repository.git
    targetRevision: main
    chart: <チャート名>
    helm:
      releaseName: foo
      values: |
        foo: foo
        bar: bar
        baz: baz
```

ポーリング対象のリポジトリにある `values` ファイルを使用する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-repository.git
    targetRevision: main
    chart: <チャート名>
    helm:
      releaseName: foo
      valueFiles:
        - ./prd.yaml
```

デフォルトの `values` ファイルと実行環境別の `values` ファイルの複数を指定できる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-repository.git
    targetRevision: main
    chart: <チャート名>
    helm:
      releaseName: foo
      valueFiles:
        - default.yaml
        - ./prd.yaml
```

暗号化された `values` ファイルを使用できる。

> - https://github.com/camptocamp/argocd-helm-sops-example

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-repository.git
    targetRevision: main
    chart: <チャート名>
    helm:
      releaseName: foo
      valueFiles:
        # helm-secretsを使用して暗号化されたvaluesファイル
        - ./secrets.yaml
```

あらかじめ、SOPS を使用して、`values` ファイルを暗号化し、キーバリュー型ストアに設定しておく。

ポーリング対象のリポジトリに `.sops.yaml` ファイルと `secrets` ファイル (キーバリュー型ストア) を配置しておく必要がある。

```yaml
# secretsファイル

# キーバリュー型ストア
data:
  AWS_ACCESS_KEY: ENC[AES256...
  AWS_SECRET_ACCESS_KEY: ENC[AES256...

sops: ...
```

ArgoCD は暗号化された `values` ファイルを復号し、チャートをインストールする。

補足として ArgoCD 上では、Secret の data キーは `base64` 方式でエンコードされる。

```yaml
# valuesファイルの暗号化された値を出力するテンプレートファイル
apiVersion: v1
kind: Secret
metadata:
  name: foo-aws-credentials
type: Opaque
data:
  AWS_ACCESS_KEY: {{.Values.data.AWS_ACCESS_KEY | b64en}} # base64方式でエンコードされる。
  AWS_SECRET_ACCESS_KEY: {{.Values.data.AWS_SECRET_ACCESS_KEY | b64en}}
```

ArgoCD は Helm の `v2` と `v3` の両方を保持している。

Helm リリースするチャートの `.apiVersion` キーの値が `v1` であれば、ArgoCD は Helm の `v2` を使用して、一方で `.apiVersion` キーの値が
`v2` であれば、Helm の `v3` を使用するようになっている。

> - https://github.com/argoproj/argo-cd/issues/2383#issuecomment-584441681

ArgoCD を介して Helm を実行する場合、内部的には `helm template` コマンドと etcd 上のマニフェストを `kubectl diff` コマンドで比較し、生じた差分を
`kubectl apply` コマンドを使用してデプロイしている。

```bash
$ helm template . --include-crds | kubectl diff -f -

$ helm template . --include-crds | kubectl apply -f -
```

> - https://github.com/helm/helm/issues/6930#issuecomment-555242131
> - https://qiita.com/kyohmizu/items/118bf654d0288da2294e

そのため、Helm を手動でマニフェストを Helm リリースする場合とは異なり、カスタムリソースのマニフェストの設定値を変更できる。

一方で、Helm リリース履歴が存在しない。

Helm リリースの履歴の代わりに、`argocd app history` コマンドで確認できる。

```bash
$ argocd app history <Application名>

ID  DATE                           REVISION
0   2020-04-12 10:22:57 +0900 JST  1.0.0
1   2020-04-12 10:49:14 +0900 JST  <バージョンタグ>
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#random-data
> - https://medium.com/@ch1aki/argocd%E3%81%A7helm%E3%82%92%E4%BD%BF%E3%81%86%E6%96%B9%E6%B3%95%E3%81%A8%E6%97%A2%E5%AD%98%E3%81%AErelease%E3%82%92argocd%E7%AE%A1%E7%90%86%E3%81%B8%E7%A7%BB%E8%A1%8C%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95-9108295887
> - https://github.com/argoproj/argo-cd/issues/4537#issuecomment-707997759

#### ▼ repoURL

ポーリング対象のチャートレジストリ内のリポジトリの URL を設定する。

パブリックリポジトリであれば認証が不要であるが、プライベートリポジトリであればこれが必要になる。

チャートリポジトリとして扱うために、リポジトリのルート直下に `index.yaml` ファイルと
`.tgz` ファイルを配置して、チャートリポジトリとして扱えるようにしておく必要がある。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  source:
    # 例えば、GitHub内のGitHub Pagesをチャートリポジトリとして扱う。
    repoURL: https://github.com/hiroki-hasegawa/foo-repository.git
```

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#applications
> - https://cloud.redhat.com/blog/continuous-delivery-with-helm-and-argo-cd

Amazon S3 をチャートリポジトリとして指定できる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  source:
    # 例えば、Amazon S3をチャートリポジトリとして扱う。
    repoURL: https://foo-bucket.s3.ap-northeast-1.amazonaws.com
```

> - https://medium.com/gitops-and-argo-cd-overview/using-amazon-s3-as-a-helm-chart-repository-with-argo-cd-1b61a5bda798

#### ▼ targetRevision

ポーリング対象のチャートレジストリ内のリポジトリにあるチャートのバージョンタグを設定する。

バージョンタグは、`Chart.yaml` ファイルの `version` キーから確認する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  source:
    targetRevision: <バージョンタグ>
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/#git

<br>

### .spec.source (OCIレジストリ内リポジトリの場合)

#### ▼ chart

チャートレジストリと同じ。

#### ▼ helm

チャートレジストリと同じ。

#### ▼ repoURL

ポーリング対象の OCI レジストリ内のリポジトリの URL を設定する。

パブリックリポジトリであれば認証が不要であるが、プライベートリポジトリであればこれが必要になる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  source:
    # 例えば、ECR内のリポジトリをOCIリポジトリとして扱う。
    repoURL: oci://<AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/<チャート名>
```

> - https://stackoverflow.com/questions/68219458/connecting-an-app-in-argocd-to-use-a-helm-oci-repository

#### ▼ targetRevision

ポーリング対象の OCI レジストリ内のリポジトリのバージョンタグを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  source:
    targetRevision: <バージョンタグ>
```

<br>

### .spec.sources (Multiple sources)

#### ▼ Multiple Sourcesとは

単一の Application から、複数のチャートやマニフェストをデプロイする。

> - https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/

#### ▼ 公式チャート + ユーザー定義チャート

公式チャートに加えて、ユーザー定義のマニフェストを含むチャートをデプロイする使用例である。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  sources:
    - repoURL: https://github.com/hiroki-hasegawa/foo-repository.git
      targetRevision: main
      chart: <チャート名>
      helm:
        releaseName: foo
        values: |
          foo: foo
          bar: bar
          baz: baz
    - repoURL: https://github.com/hiroki-hasegawa/bar-repository.git
      targetRevision: main
      path: foo-extra
      helm:
        releaseName: opentelemetry-collector
```

#### ▼ 公式チャート + ユーザー定義チャート (プラグインを実行)

公式チャートに加えて、ユーザー定義のマニフェストを含むチャートをデプロイする使用例である。

このとき、プラグイン (`helm secrets`) を使用できる。

例えば、公式チャートで資格情報を使用した Secret が必要な場合、`helm secrets` プラグインを使用した追加チャートを定義するとよい。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  sources:
    # 公式チャート
    - repoURL: https://github.com/hiroki-hasegawa/foo-repository.git
      targetRevision: main
      chart: <チャート名>
      helm:
        releaseName: foo
        values: |
          foo: foo
          bar: bar
          baz: baz
    # 自前チャート
    # helm-secretsプラグインを使用して、Secretを復号する。
    - repoURL: https://github.com/hiroki-hasegawa/bar-repository.git
      targetRevision: main
      path: foo-extra
      plugin:
        name: helm-secrets
        env:
          - name: NAME
            value: foo
          - name: VALUES
            value: values.yaml
          - name: SECRETS
            value: secrets.yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  google_cloud_credentials.json: *****
```

<br>

### .spec.destination

#### ▼ destinationとは

apply 先の Kubernetes を設定する。

> - https://github.com/argoproj/argo-cd/blob/v2.6.0/docs/operator-manual/application.yaml

#### ▼ name

apply 先の Kubernetes Cluster 名を設定する。

ArgoCD に登録済みの Cluster を、`server` キーの URL ではなく論理名で指定したい場合（例：EKS をブルー／グリーンアップグレードしたい）に利用する。

論理名は、`argocd cluster add <デプロイ先のClusterのARN> --name <ダッシュボード上でのClusterの表示名>` で登録したものである。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  destination:
    name: in-cluster
    namespace: foo-namespace
```

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#applications

#### ▼ namespace

apply 先の Namespace を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  destination:
    namespace: foo-namespace
```

注意点として、Application がリポジトリで検知した Kubernetes リソースの
`metadata.namespace` キーで、別の Namespace で作成されている場合、そちらが優先される。

> - https://github.com/argoproj/argo-cd/issues/2280#issuecomment-530030455
> - https://github.com/argoproj/argo-cd/issues/6274#issuecomment-844494318

#### ▼ server

kube-apiserver の URL を設定する。

ArgoCD の稼働している Cluster を指定する場合は、in-cluster (`https://kubernetes.default.svc`) を設定する。

一方で、外部の Kubernetes Cluster を指定する場合、これの kube-apiserver のエンドポイントを指定する必要がある。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  destination:
    server: https://kubernetes.default.svc
```

```yaml
# Amazon EKSの場合
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  destination:
    # 外部のAmazon EKS Clusterのkube-apiserverのエンドポイントを指定する。
    server: https://*****.gr7.ap-northeast-1.eks.amazonaws.com
```

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#applications

<br>

### .spec.syncPolicy

#### ▼ syncPolicyとは

Sync のオプションを設定する。

#### ▼ automated

GitOps でのリポジトリ (例：GitHub、Helm など) と Kubernetes の間の自動 Sync を設定する。

ArgoCD はリポジトリを `3` 分間ごとにポーリングしており、このタイミングでリポジトリとの間でマニフェストの状態を同期する。

開発者には参照権限のみの認可スコープを付与し、ArgoCD の自動 Sync を有効化すれば、開発者がデプロイできなくなり、安全性が増す。

また、複数の実行環境やチームがある場合、Sync 漏れを防げる。

一方で、App Of Apps パターンを採用している場合、親の Application の自動 Sync が有効化していると、子 Application の設定値 (例：ターゲットブランチ) を変更できず煩わしい。

| 設定項目     | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 補足                                                                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allowEmpty` | Prune中に、Application配下にリソースを検出できなくなると、Pruneは失敗するようになっている。Applicationが空 (配下にリソースがない) 状態を許可するか否かを設定する。                                                                                                                                                                                                                                                                                                                                                                           | ・https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-pruning-with-allow-empty-v18<br>・https://stackoverflow.com/questions/67597403/argocd-stuck-at-deleting-but-resources-are-already-deleted |
| `prune`      | リソースを作成しつつ、不要になったリソースを自動削除するか否かを設定する。デフォルトでは、GitHubリポジトリでマニフェストが削除されても、ArgoCDはリソースを自動的に削除しない。開発者の気づかないうちに、残骸のKubernetesリソースが溜まる可能性があるため、有効化したほうがよい。`rev:<番号>` という表記があるKubernetesリソースは、`prune` を忘れて新旧バージョンが存在していることを表す。Applicationを削除するときには、Application配下のKubernetesリソースが残骸にならないように、Application配下のKubernetesリソースを先に削除しておく。 | ・https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-pruning                                                                                                                                   |
| `selfHeal`   | ArgoCD以外の方法でCluster内でマニフェストを変更した場合、リポジトリ (例：GitHub、Helm) の状態に自動Syncする。デフォルトでは、ArgoCD以外の方法で変更しても、自動Syncは実行しない。                                                                                                                                                                                                                                                                                                                                                            | ・https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-self-healing                                                                                                                              |

> - https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automated-sync-policy
> - https://github.com/argoproj/argo-cd/blob/v2.6.0/docs/operator-manual/application.yaml#L113

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  syncPolicy:
    automated:
      allowEmpty: "true"
      prune: "true"
      selfHeal: "true"
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automated-sync-policy

#### ▼ syncOptions

GitOps でのマニフェストの Sync 処理の詳細を設定する。

| 設定項目                 | 説明                                                                                                                                                                                   | 補足                                                                                                                                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CreateNamespace`        | Applicationの作成対象のNamespaceを自動的に作成する。                                                                                                                                   | Namespaceので出どころがわからなくなるため、ArgoCDの `createNamespace` オプションは無効化し、Namespaceのマニフェストを定義しておくほうがよい。                                                                     |
| `Validate`               |                                                                                                                                                                                        |                                                                                                                                                                                                                   |
| `PrunePropagationPolicy` | Sync後に不要になったKubernetesリソースの削除方法を設定する。削除方法は、KubernetesでのKubernetesリソースの削除の仕組みと同様に、バックグラウンド、フォアグラウンド、オルファンがある。 | ・https://www.devopsschool.com/blog/sync-options-in-argo-cd/<br>・https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/ |
| `PruneLast`              | 通常のPruneでは、Syncしながら古いリソースを独立的に削除していく。PruneLastでは、一度すべてのKubernetesリソースをSyncしてしまい、正常に稼働した後に古いリソースをまとめて削除していく。   | ・https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#prune-last                                                                                                                                    |
| `ServerSideApply`        | Sync時、`kubectl apply` コマンド `--server-side` オプションを有効化する。                                                                                                              | ・https://argo-cd.readthedocs.io/en/latest/user-guide/sync-options/#server-side-apply                                                                                                                             |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  syncPolicy:
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=background
      - PruneLast=true
      - ServerSideApply=true
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#sync-options
> - https://dev.classmethod.jp/articles/argocd-for-external-cluster/

<br>

## 03. ApplicationSet

### ApplicationSet

ArgoCD の Application は、`1` 個の Cluster にしかマニフェストを送信できない。

そのため、Cluster の数だけ Application を個別に管理しなければならない。

一方で、ApplicationSet であれば、異なる Cluster に対応する Application を一括して管理できる。

なお、Helm を使用している場合は、ApplicationSet の代わりに `range()` 関数を使用できる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: foo-application-set
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - cluster: foo-eks-cluster
            url: https://*****.gr7.ap-northeast-1.eks.amazonaws.com
          - cluster: foo-kubeadm-cluster
            url: https://kubernetes.default.svc
  template:
    metadata:
      # Cluster名を出力する。
      name: "{{cluster}}"
    spec:
      project: default
      source:
        repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
        targetRevision: HEAD
        path: .
      destination:
        # ClusterのURLを出力する。
        server: "{{url}}"
        namespace: foo-namespace
```

> - https://techstep.hatenablog.com/entry/2021/12/02/085034
> - https://blog.argoproj.io/introducing-the-applicationset-controller-for-argo-cd-982e28b62dc5

<br>

## 04. AppProject

### AppProjectとは

単一の Kubernetes Cluster 内で、Application の責務境界のテナントを作成する。

CRD の設定 (`scoped: Namespace`) からもわかるように、AppProject は Namespaced スコープなカスタムリソースである。

Application が選べる AppProject を制限できるように、Application が選べる AppProject は Namespace 単位で分割する。

もしすべての Application と AppProject を同じ Namespace で管理してしまうと、自由に AppProject を変更して、その Project にデプロイできてしまう。

> - https://techstep.hatenablog.com/entry/2021/12/30/233323#Project%E3%81%A8%E3%81%AF
> - https://github.com/argoproj/argo-cd/issues/11058
> - https://blog.cybozu.io/entry/2020/02/04/110000

<br>

### default AppProject

ArgoCD は、もっとも認可スコープの大きい `default` の AppProject を自動的に作成する。

`default` の AppProject では、任意の Namespace で Application を作成できる。

テナントを完全に分離するために、`default` の AppProject には Application を作成せずに、ユーザー定義の AppProject を使用する。

なお同じ AppProject 内では、ArgoCD の Application 名は一意にする必要がある。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: default
  namespace: foo
spec:
  clusterResourceWhitelist:
    - group: "*"
      kind: "*"
  destinations:
    - namespace: "*"
      server: "*"
  sourceRepos:
    - "*"
# 執筆時点 (2023/05/17) では、defaultのAppProjectでsourceNamespacesキーは使用できない
# sourceNamespaces
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/projects/#the-default-project
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#projects

<br>

### spec.sourceNamespaces

#### ▼ sourceNamespacesとは

AppProject に所属可能な Application を制御する。

設定した Namespace 内にある Application のみが、その AppProject に所属できる。

もしすべての Namespace を許可する場合は、`*` (アスタリスク) を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd
  namespace: foo # サービス名など
spec:
  # AppProjectへの所属を許可したいApplicationのNamespaceを設定する
  sourceNamespaces:
    - foo
```

#### ▼ ConfigMap

ArgoCD の Application を作成できる Namespace は、デフォルトであると `argocd` のため、それ以外を許可するためにも必要である。

argocd-server と application-controller の両方で、設定が必要である。

argocd-cmd-params-cm の `.application.namespaces` では、アスタリスク (`*`) としておく。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmd-params-cm
  namespace: foo
data:
  application.namespaces: "*"
```

あるいは、application-controller の起動時にパラメーターとして渡してもよい。

```bash
apiVersion: v1
kind: Pod
metadata:
  name: argocd-application-controller
  namespace: argocd
spec:
  containers:
    - name: argocd-application-controller
      image: quay.io/argoproj/argocd:latest
      args:
        - /usr/local/bin/argocd-application-controller
        # 起動時のパラメーターとして
        - --application-namespaces="*"

  ...
```

```bash
apiVersion: v1
kind: Pod
metadata:
  name: argocd-server
  namespace: argocd
spec:
  containers:
    - name: argocd-server
      image: quay.io/argoproj/argocd:latest
      args:
        - /usr/local/bin/argocd-server
        # 起動時のパラメーターとして
        - --application-namespaces="*"

  ...
```

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/app-any-namespace/#cluster-scoped-argo-cd-installation
> - https://github.com/argoproj/argo-cd/pull/9755
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/app-any-namespace/#implementation-details
> - https://developers.redhat.com/articles/2022/04/13/manage-namespaces-multitenant-clusters-argo-cd-kustomize-and-helm#a_simple_argo_cd_application
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/server-commands/argocd-application-controller/

#### ▼ デフォルトのNamespacedスコープモード

デフォルトの Namespaced スコープモードの ArgoCD では、application-controller と repo-server が自分自身の Namespace のみを見る。

そのため、異なる Namespace 間で同じ親 Application があっても、Namespace を超えて親を共有してしまうことがない。

> - https://github.com/argoproj/argo-cd/pull/9755
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/app-any-namespace/#cluster-scoped-argo-cd-installation

<br>

### sourceRepos

AppProject 内でポーリング可能なリポジトリを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # 実行環境名、運用チーム名など
  namespace: foo # サービス名など
spec:
  sourceRepos:
    - "*"
```

<br>

### description

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # 実行環境名、運用チーム名など
  namespace: foo # サービス名など
spec:
  description: This is application in prd environment
```

<br>

### destinations

AppProject に所属する Application が指定可能な Cluster を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # 実行環境名、運用チーム名など
  namespace: foo # サービス名など
spec:
  destinations:
    - namespace: "*" # 所属するApplicationは、全てのNamespaceにデプロイできる。
      server: https://*****.gr7.ap-northeast-1.eks.amazonaws.com # 所属するApplicationは、指定したURLのClusterのみを指定できる。
```

<br>

### clusterResourceWhitelist

AppProject 内で Application がデプロイできる Cluster スコープ (Namespace のない) なリソースを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # 実行環境名、運用チーム名など
  namespace: foo # サービス名など
spec:
  clusterResourceWhitelist:
    - group: "*"
      kind: "*"
```

### namespaceResourceWhitelist

AppProject 内で Application がデプロイできる Namespaced スコープ (Namespace のある) なリソースを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # 実行環境名、運用チーム名など
  namespace: foo # サービス名など
spec:
  namespaceResourceWhitelist:
    - group: "*"
      kind: "*"
```

<br>

## 05. ArgoCD Notification

### セットアップ

```bash
$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/manifests/install.yaml
```

> - https://argocd-notifications.readthedocs.io/en/stable/#getting-started

<br>

## 06. ConfigManagementPlugin

> - https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_resource_definition_plugin

<br>
