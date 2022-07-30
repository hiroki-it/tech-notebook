---
title: 【IT技術の知見】設計ポリシー＠ArgoCD
description: 設計ポリシー＠ArgoCDの知見を記録しています。
---

# 設計ポリシー＠ArgoCD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. リポジトリ構成

### リポジトリ分割のメリット

リポジトリを分割することにより、以下のメリットがある。

- 認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。

<br>

### モノリポジトリ構成（推奨）

#### ▼ Kubernetesリソースのマニフェストファイルを監視する場合

監視対象リポジトリごとにApplicationを作成し、これらを同じリポジトリで管理する。この時、監視対象リポジトリにはKubernetesリソースのマニフェストファイルやhelmチャートが管理されている。

参考：https://atmarkit.itmedia.co.jp/ait/articles/2107/30/news018.html#04

```yaml
argocd-repository/
├── dev/
│   ├── foo-application.yaml # foo-k8sリポジトリのdevディレクトリを監視
│   ├── bar-application.yaml # bar-k8sリポジトリのdevディレクトリを監視
│   └── baz-application.yaml # baz-k8sリポジトリのdevディレクトリを監視
│
├── prd/
└── stg/
```

```yaml
k8s-repository/
├── dev/
│   ├── deployment.yaml # あるいはhelmチャート
│   ....
│
├── prd/
└── stg/
```

#### ▼ Applicationのマニフェストファイルを監視する場合

監視対象リポジトリごとにApplicationを作成し、これらを同じリポジトリで管理する。この時、監視対象リポジトリにはApplicationが管理されている。これにより、親Applicationで子Applicationをグループ化したように構成できる。また、親Applicationを使用して、ArgoCDが自身をアップグレードできるようになる。ここでは、子Applicationが監視するKubernetesリソースやhelmチャートのリポジトリは『ポリリポジトリ』としているが、『モノリポジトリ』でも良い。注意点として、同期時の操作手順として、親Applicationの画面で子Applicationの同期を実行し、その後子Applicationの画面で同期を実行することになる。

参考：https://www.arthurkoziel.com/setting-up-argocd-with-helm/

```yaml
# 親Application
parent-argocd-repository/
├── dev/ # Applicationを管理する
│   ├── app-application.yaml # child-argocd-manifestリポジトリの/dev/appディレクトリを監視
│   └── obsv-application.yaml # child-argocd-manifestリポジトリの/dev/obsvディレクトリを監視
│
├── prd/
└── stg/
```

```yaml
# 子Application
child-argocd-repository/
├── dev/
│   ├── app
│   │   ├── account-application.yaml      # k8sリポジトリの/dev/app/accountディレクトリを監視
│   │   ├── customer-application.yaml     # k8sリポジトリの/dev/app/customerディレクトリを監視
│   │   ├── orchestrator-application.yaml # k8sリポジトリの/dev/app/orchestratorディレクトリを監視
│   │   └── order-application.yaml        # k8sリポジトリの/dev/app/orderディレクトリを監視
│   │
│   └── obsv
│       ├── fluentd-application.yaml           # k8sリポジトリの/dev/obsv/fluentdディレクトリを監視
│       ├── grafana-application.yaml           # k8sリポジトリの/dev/obsv/grafanaディレクトリを監視
│       ├── kiali-application.yaml             # k8sリポジトリの/dev/obsv/kialiディレクトリを監視
│       ├── prometheus-application.yaml        # k8sリポジトリの/dev/obsv/prometheusディレクトリを監視
│       └── vicotoria-metrics-application.yaml # k8sリポジトリの/dev/obsv/vicotoria-metricsディレクトリを監視
│
├── prd/
└── stg/
```

```yaml
k8s-repository/
├── dev/
│   ├── app
│   │   ├── account
│   │   │   ├── deployment.yaml  # あるいはhelmチャート
│   │   ...
│   │
│   └── obsv
│       ├── fluentd
│       │   ├── deployment.yaml # あるいはhelmチャート
│       ...
│ 
├── prd/
└── stg/
```

<br>

### ポリリポジトリ

監視対象リポジトリごとにApplicationを作成し、これらを異なるリポジトリで管理する。

```yaml
repository/
├── dev/
│   └── foo-application.yaml # fooリポジトリを監視する。
│
├── prd/
└── stg/
```

```yaml
repository/
├── dev/
│   └── bar-application.yaml # barリポジトリを監視する。
│
├── prd/
└── stg/
```

```yaml
repository/
├── dev/
│   └── baz-application.yaml # bazリポジトリを監視する。
│
├── prd/
└── stg/
```

<br>

## 02. ディレクトリ構成

### 実行環境別（必須）

必須の構成である。各実行環境に```terraform apply```コマンドを実行するためのApplicationを別々のディレクトリで管理する。Applicationでは、実行環境に対応するブランチのみを監視する。

```yaml
repository/
├── dev/ # 開発環境
├── prd/ # 本番環境
└── stg/ # ステージング環境
```

<br>

## 03. セキュリティ

### ダッシュボード

ダッシュボードのURLはIngressを入り口に作成することにより、公開する。また、ログイン方法は、デフォルトのBasic認証ではなく、SSOを使用する。

<br>

### 機密な環境変数

Applicationで使用する機密な環境変数は、Secretで管理する。このSecretをどの場所に保存するかについて議論がなされている。

参考：

- https://argo-cd.readthedocs.io/en/stable/operator-manual/secret-management/
- https://blog.mmmcorp.co.jp/blog/2022/02/24/yassan-argocd-with-aws-secrets-manager/

<br>

## 05. エラー解決

### 削除できない系

#### ▼ Applicationを削除できない

PruneによるKubernetesリソースの削除を有効化し、フォアグラウンドで削除した場合、Applicationが配下にリソースを持たないことにより、Applicationを削除できないことがある。これらの場合には、以下の手順でApplicationを削除する。

参考：https://stackoverflow.com/questions/67597403/argocd-stuck-at-deleting-but-resources-are-already-deleted

（１）Applicationの```spec.syncPolicy.allowEmpty```キーを有効化する。

（２）フォアグラウンドで削除すると、Applicationの`metadata.finalizers`キーの値に削除中のリソースが設定される。この配列を空配列に変更する。ArgoCDのUIからは変更できず、```kubectl patch```コマンドを使用する必要がある。

参考：https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/

```bash
$ kubectl patch crd applications.argoproj.io \
    -p '{"metadata":{"finalizers":[]}} ' \
    --type=merge
```

（３）1つ目の`spec.syncPolicy.allowEmpty`キーの変更を元に戻す。

#### ▼ Namespaceを削除できない

```bash
$ kubectl patch ns argocd \
    -p '{"metadata":{"finalizers":[]}} ' \
    --type=merge
```

<br>

### すでに削除されたPodが監視され続ける

すでに削除したPodを監視し続けてしまうことがあり、この場合Podが存在しないため、Podの削除すらできなくなってしまう。この問題が起こった場合、以下のいずれかで解決する。

- argocd-serverを再起動する。親になるリソースを削除する必要がなく、apply先のClusterには影響がないため、安全な方法である。ArgoCDの使用者に周知しさえすれば問題ない。
- 親になるリソース（Deployment、DaemonSet、など）を一度削除する。ただ、親になるリソースを削除する必要があるため、やや危険である。

<br>

### ヘルスチェックが終わらない

参考：https://argo-cd.readthedocs.io/en/stable/faq/#why-is-my-application-stuck-in-progressing-state

<br>

### 同期してもOut of syncが解消されない

同期後にKubernetesリソースの状態が変更されるような場合、同期してもOut of syncになってしまう。

参考：

- https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/
- https://argo-cd.readthedocs.io/en/stable/faq/#why-is-my-application-still-outofsync-immediately-after-a-successful-sync

<br>

## 06. アップグレード

ArgoCDが自分自身をアップグレードできるように、親Applicationを子Applicationで管理する。
