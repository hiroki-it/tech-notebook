---
title: 【知見を記録するサイト】設計ポリシー＠ArgoCD
description: 設計ポリシー＠ArgoCDの知見をまとめました。
---

# 設計ポリシー＠ArgoCD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. リポジトリ構成

### モノリポジトリ構成（推奨）

apply単位ごとにApplicationを作成する。マイクロサービスアーキテクチャでは、マイクロサービスがapply単位になるため、マイクロサービスごとにApplicationを作成すると良い。

参考：https://atmarkit.itmedia.co.jp/ait/articles/2107/30/news018.html#04

```yaml
repository/
├── foo/ # fooサービス
│   └── application.yaml
│
├── bar/ # barサービス
│   └── application.yaml
│
├── baz/ # bazサービス
│   └── application.yaml
│
...
```

<br>

### ポリリポジトリ

apply単位ごとに、別々のリポジトリを作成する。リポジトリを分割することで、認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。

```yaml
repository/ # fooサービス
└── application.yaml
```

```yaml
repository/ # barサービス
└── application.yaml
```

```yaml
repository/ # bazサービス
└── application.yaml
```

<br>

## 02. ワークフロー

### Git-flow

Git-flowのブランチに応じたApplicationを作成し、特定の実行環境ではそのブランチのみを監視する。

```yaml
# ステージング環境のApplication
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
  labels:
    app.kubernetes.io/env: prd
spec:
  source:
    targetRevision: main # 本番環境に対応するブランチ
```

```yaml
# ステージング環境のApplication
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
  labels:
    app.kubernetes.io/env: stg
spec:
  source:
    targetRevision: develop # ステージング環境に対応するブランチ
```

<br>

## 03. セキュリティ

### ダッシュボード

ダッシュボード

のURLはIngressを入り口に構築することで公開する。また、ログイン方法は、デフォルトのBasic認証ではなく、SSOを使用する。

<br>

### 機密な環境変数

Applicationで使用する機密な環境変数は、Secretで管理する。このSecretをどの場所に保存するかについて議論がなされている。

参考：

- https://argo-cd.readthedocs.io/en/stable/operator-manual/secret-management/
- https://blog.mmmcorp.co.jp/blog/2022/02/24/yassan-argocd-with-aws-secrets-manager/

