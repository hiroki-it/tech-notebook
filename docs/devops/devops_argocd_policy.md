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

監視対象リポジトリごとにApplicationを作成し、これらを同じリポジトリで管理する。この時、監視対象リポジトリにはApplicationが管理されている。これにより、親Applicationで子Applicationをグループ化したように構成できる。ここでは、子Applicationが監視するKubernetesリソースやhelmチャートのリポジトリは『ポリリポジトリ』としているが、『モノリポジトリ』でも良い。

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

監視対象リポジトリごとにApplicationを作成し、これらを異なるリポジトリで管理する。リポジトリを分割することで、認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。

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

必須の構成である。各実行環境にapplyするためのApplicationを別々のディレクトリで管理する。Applicationでは、実行環境に対応するブランチのみを監視する。

```yaml
repository/
├── dev/ # 開発環境
├── prd/ # 本番環境
└── stg/ # ステージング環境
```

<br>

## 03. セキュリティ

### ダッシュボード

ダッシュボード

のURLはIngressを入り口に作成することで公開する。また、ログイン方法は、デフォルトのBasic認証ではなく、SSOを使用する。

<br>

### 機密な環境変数

Applicationで使用する機密な環境変数は、Secretで管理する。このSecretをどの場所に保存するかについて議論がなされている。

参考：

- https://argo-cd.readthedocs.io/en/stable/operator-manual/secret-management/
- https://blog.mmmcorp.co.jp/blog/2022/02/24/yassan-argocd-with-aws-secrets-manager/

