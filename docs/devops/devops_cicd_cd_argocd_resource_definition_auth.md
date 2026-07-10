---
title: 【IT技術の知見】認証／認可系＠リソース定義
description: 認証／認可系＠リソース定義の知見を記録しています。
---

# 認証／認可系＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 専用Role

### Role

#### ▼ argocd-application-controllerの場合

ArgoCD が Sync できる Kubernetes リソースの認可スコープを設定する。

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

ArgoCD のダッシュボードが持つ Kubernetes リソースに対する機能 (例：ログ、Exec) の認可スコープを設定する。

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

ServiceAccount と Role を紐付けるために、RoleBinding を作成する。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  namespace: argocd
  name: argocd-repo-server
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

ArgoCD の application-controller がデプロイ先と異なる Cluster で稼働している場合に、デプロイ先の Cluster にエージェントを作成する必要がある。

argocd-manager は、エージェントとして、デプロイ先 Cluster で application-controller からのリクエストを中継する。

argocd-manager の実体は、ServiceAccount である。

この ServiceAccount を介して、ArgoCD の application-controller は Cluster に Kubernetes リソースをデプロイする。

`argocd cluster add <デプロイ先のClusterのコンテキスト>` コマンドで、`argocd-manager` という ServiceAccount を作成できる。

```bash
# デフォルトでkube-systemに作成するため、nオプションは不要である
$ argocd cluster add <デプロイ先のClusterのARN> --name <ダッシュボード上でのClusterの表示名> -n kube-system

INFO[0011] ServiceAccount "argocd-manager" already exists in namespace "kube-system"
INFO[0011] ClusterRole "argocd-manager-role" updated
INFO[0011] ClusterRoleBinding "argocd-manager-role-binding" updated
Cluster 'https://*****.gr7.ap-northeast-1.eks.amazonaws.com' added
```

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: argocd-manager
  namespace: kube-system
secrets:
  - name: argocd-manager-token-*****
```

> - https://argo-cd.readthedocs.io/en/stable/getting_started/#5-register-a-cluster-to-deploy-apps-to-optional
> - https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_cluster_add/

<br>

### argocd-application-controller

ArgoCD の ServiceAccount を作成する。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  namespace: argocd
  name: argocd-application-controller
  labels:
    app.kubernetes.io/part-of: argocd
automountServiceAccountToken: "true"
secrets:
  - name: argocd-application-controller-token-*****
```

<br>
