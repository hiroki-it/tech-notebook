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

### Argo Workflows Archive

ワークフローの処理の状況を保存する。

RDBMSとして、PostgreSQLとMySQLを使用できる。

`phase`カラムや`progress`カラムを永続化できる。

```go
type archivedWorkflowMetadata struct {
    ClusterName string             `db:"clustername"`
    InstanceID  string             `db:"instanceid"`
    UID         string             `db:"uid"`
    Name        string             `db:"name"`
    Namespace   string             `db:"namespace"`
    Phase       wfv1.WorkflowPhase `db:"phase"`
    StartedAt   time.Time          `db:"startedat"`
    FinishedAt  time.Time          `db:"finishedat"`
    Labels      string             `db:"labels,omitempty"`
    Annotations string             `db:"annotations,omitempty"`
    Progress    string             `db:"progress,omitempty"`
}
```

> - https://github.com/argoproj/argo-workflows/blob/main/persist/sqldb/workflow_archive.go#L25-L37
> - https://pages.awscloud.com/rs/112-TZM-766/images/20230928_34th_ISV_DiveDeepSeminar_freee.pdf#page=11

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
