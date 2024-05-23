---
title: 【IT技術の知見】c＠CNCF
description: Argo Workflows＠CNCFの知見を記録しています。
---

# Argo Workflows＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Argo Workflowsの仕組み

### アーキテクチャ

記入中...

<br>

## 02. workflow-controller

### workflow-controllerとは

特にArgoCD Workflowのcustom-controllerとして、ArgoCD Workflowのマニフェストを作成/変更する。

application-controllerを分離されている理由は、ArgoCD WorkflowのマニフェストはArgoCDのデプロイ先Clusterに作成するためである。

なお、フロントエンド部分としてargocd-serverが必要である。

![argocd_argo-workflow_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_argo-workflow_architecture.png)

> - https://argoproj.github.io/argo-workflows/architecture/
> - https://www.wantedly.com/companies/wantedly/post_articles/302473

<br>

## 03. ユースケース

### CIパイプライン

Argo Workflows上でコンテナをビルドし、イメージレジストリにプッシュする。

> - https://zenn.dev/tnoyama/articles/d3358cc82f6173#gitops%E3%82%92%E8%80%83%E3%81%88%E3%82%8B%E3%81%A8
> - https://www.reddit.com/r/kubernetes/comments/18683bz/why_use_argo_workflows_over_github_actions/

<br>
