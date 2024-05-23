---
title: 【IT技術の知見】リソース定義＠Argo Workflows
description: リソース定義＠Argo Workflowsの知見を記録しています。
---

# リソース定義＠Argo Workflows

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Workflow

### .spec.entrypoint

#### ▼ entrypointとは

一番最初に使用するテンプレート名を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  namespace: argocd
  generateName: foo-workflow
spec:
  entrypoint: foo-template
```

> - https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

<br>

### .spec.templates

#### ▼ templatesとは

パイプラインの処理を設定する。

WorkflowTemplateとして切り分けても良い。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  namespace: argocd
  generateName: foo-workflow
spec:
  entrypoint: foo-template
  templates:
    - name: foo-template
      script:
        - image: alpline:1.0.0
          command:
            - /bin/bash
            - -c
          source: |
            echo "Hello World"
```

> - https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

<br>

### .spec.workflowTemplateRef

#### ▼ workflowTemplateRefとは

切り分けたWorkflowTemplateの名前を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  namespace: argocd
  generateName: foo-workflow
spec:
  workflowTemplateRef:
    name: foo-workflow
```

> - https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

<br>

## 02. WorkflowTemplate

### .spec.templates

#### ▼ templatesとは

パイプラインの処理を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  namespace: argocd
  name: foo-workflow
spec:
  templates:
    - name: foo-template
      script:
        - image: alpline:1.0.0
          cource: |
            echo "Hello World"
```

> - https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

#### ▼ script

コンテナをプルし、コンテナ内でスクリプトを実行する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  namespace: argocd
  name: foo-workflow
spec:
  templates:
    - name: foo-template
      script:
        - image: alpline:1.0.0
          command:
            - /bin/bash
            - -c
          source: |
            echo "Hello World"
```

> - https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

#### ▼ steps

> - https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

<br>

### ConfigMap

#### ▼ data.trigger

通知条件を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-notification-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  trigger.on-sync-status-unknown: |
    - when: app.status.sync.status == 'Unknown'
      send: [app-sync-status, github-commit-status]
  trigger.sync-operation-change: |
    - when: app.status.operationState.phase in ['Error', 'Failed']
      send: [app-sync-failed, github-commit-status]
  trigger.on-deployed: |
    - when: app.status.operationState.phase in ['Succeeded'] and app.status.health.status == 'Healthy'
      oncePer: app.status.sync.revision
      send: [app-sync-succeeded]
```

> - https://zenn.dev/nameless_gyoza/articles/introduction-argocd-notifications#triggers

#### ▼ data.service

通知先のURLを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-notifications-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  service.slack: |
    token: *****
```

> - https://zenn.dev/nameless_gyoza/articles/introduction-argocd-notifications#services

#### ▼ data.template

通知内容を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-notifications-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  context: |
    env: prd

  template.a-slack-template-with-context: |
    message: "ArgoCD sync in {{ .context.env }}"
```

> - https://zenn.dev/nameless_gyoza/articles/introduction-argocd-notifications#templates

<br>
