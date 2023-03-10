---
title: 【IT技術の知見】認証/認可系＠リソース定義
description: 認証/認可系＠リソース定義の知見を記録しています。
---

# 認証/認可系＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 専用Role

### Role

#### ▼ argocd-application-controllerの場合

ArgoCDがSyncできるKubernetesリソースの認可スコープを設定する。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: argocd
  name: argocd-application-controller
  labels:
    app.kubernetes.io/part-of: argocd
rules:
  - apiGroups:
      - ""
    resources:
      - secrets
      - configmaps
    verbs:
      - create
      - get
      - list
      - watch
      - update
      - patch
      - delete
  - apiGroups:
      - argoproj.io
    resources:
      - applications
      - applicationsets
      - appprojects
    verbs:
      - create
      - get
      - list
      - watch
      - update
      - patch
      - delete
  - apiGroups:
      - ""
    resources:
      - events
    verbs:
      - create
      - list
```

<br>

### ClusterRole

#### ▼ argocd-serverの場合

ArgoCDのダッシュボードが持つKubernetesリソースに対する機能 (例：ログ、Exec) の認可スコープを設定する。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  namespace: argocd
  name: argocd-server
  labels:
    app.kubernetes.io/part-of: argocd
rules:
  - apiGroups:
      - "*"
    resources:
      - "*"
    verbs:
      - delete
      - get
      - patch
  - apiGroups:
      - ""
    resources:
      - events
    verbs:
      - list
  - apiGroups:
      - ""
    resources:
      - pods
      - pods/log
    verbs:
      - get
  - apiGroups:
      - ""
    resources:
      - pods/exec
    verbs:
      - create
  - apiGroups:
      - argoproj.io
    resources:
      - applications
    verbs:
      - get
      - list
      - watch
```

<br>

## 02. 専用RoleBinding

ServiceAccountとRoleを紐づけるために、RoleBindingを作成する。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  namespace: argocd
  name: argocd-argocd-repo-server
  labels:
    app.kubernetes.io/part-of: argocd
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: argocd-application-controller
subjects:
  - kind: ServiceAccount
    name: argocd-application-controller
    namespace: argocd
```

<br>

## 03. 専用ServiceAccount

### argocd-manager

#### ▼ argocd-managerとは

ArgoCDのapplication-controllerが、デプロイ先と異なるClusterで稼働している場合に、デプロイ先のClusterにServiceAccountを作成する必要がある。

このServiceAccountを介して、ArgoCDのapplication-controllerはClusterにKubernetesリソースをデプロイする。

`argocd cluster add <デプロイ先のClusterのコンテキスト>`コマンドで、`argocd-manager`というServiceAccountを作成できる。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: argocd-manager
  namespace: kube-system
secrets:
  - name: argocd-manager-token-*****
```

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/getting_started/#5-register-a-cluster-to-deploy-apps-to-optional

<br>

### argocd-application-controller

ArgoCDのServiceAccountを作成する。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  namespace: argocd
  name: argocd-application-controller
  labels:
    app.kubernetes.io/part-of: argocd
automountServiceAccountToken: true
secrets:
  - name: argocd-application-controller-token-*****
```

<br>
