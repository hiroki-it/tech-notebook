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

GitOps対象のリポジトリごとにApplicationを作成し、これらを同じリポジトリで管理する。

参考：https://atmarkit.itmedia.co.jp/ait/articles/2107/30/news018.html#04

```yaml
repository/
├── dev/
│   ├── foo-repository.yaml # fooリポジトリを対象とするGitOps
│   ├── bar-repository.yaml # barリポジトリを対象とするGitOps
│   └── baz-repository.yaml # bazリポジトリを対象とするGitOps
│
├── prd/
└── stg/
```

<br>

### ポリリポジトリ

GitOps対象のリポジトリごとにApplicationを作成し、これらを異なるリポジトリで管理する。リポジトリを分割することで、認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。

```yaml
foo-repository/ # fooリポジトリを対象とするGitOps
├── dev/
│   └── foo-repository.yaml
│
├── prd/
└── stg/
```

```yaml
bar-repository/ # barリポジトリを対象とするGitOps
├── dev/
│   └── bar-repository.yaml
│
├── prd/
└── stg/
```

```yaml
baz-repository/ # bazリポジトリを対象とするGitOps
├── dev/
│   └── baz-repository.yaml
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

のURLはIngressを入り口に構築することで公開する。また、ログイン方法は、デフォルトのBasic認証ではなく、SSOを使用する。

<br>

### 機密な環境変数

Applicationで使用する機密な環境変数は、Secretで管理する。このSecretをどの場所に保存するかについて議論がなされている。

参考：

- https://argo-cd.readthedocs.io/en/stable/operator-manual/secret-management/
- https://blog.mmmcorp.co.jp/blog/2022/02/24/yassan-argocd-with-aws-secrets-manager/

