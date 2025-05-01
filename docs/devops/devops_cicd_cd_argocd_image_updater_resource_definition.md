---
title: 【IT技術の知見】Image Updater＠ArgoCD
description: Image Updater＠ArgoCDの知見を記録しています。
---

# Image Updater＠ArgoCD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Application

### .metadata.annotations

#### ▼ argocd-image-updater.argoproj.io

ArgoCD Image Updaterを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
  annotations:
    argocd-image-updater.argoproj.io/image-list: foo-image=<AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/<イメージリポジトリ名>
    # 変更対象のファイルの相対パスを設定する
    # .spec.source.pathキーを基準とする
    argocd-image-updater.argoproj.io/write-back-target: "helmvalues:values.yaml"
    # コンテナイメージのタグ名をフィルタリングする
    argocd-image-updater.argoproj.io/foo-image.allow-tags: regexp:^v[0-9]+\.[0-9]+\.[0-9]+$
    # YAMLファイルのコンテナイメージ名のパスを設定する
    argocd-image-updater.argoproj.io/foo-image.helm.image-name: image.repository
    # YAMLファイルのタグ名のパスを設定する
    argocd-image-updater.argoproj.io/foo-image.helm.image-tag: image.tag
    argocd-image-updater.argoproj.io/write-back-method: git
    argocd-image-updater.argoproj.io/git.branch: main
    argocd-image-updater.argoproj.io/git.commit-message: "イメージのタグを {{ .tag }} に更新しました"
spec: ...
```

> - https://argocd-image-updater.readthedocs.io/en/stable/configuration/images/
> - https://www.cncf.io/blog/2024/11/05/mastering-argo-cd-image-updater-with-helm-a-complete-configuration-guide/

<br>

## 02. ConfigMap

### argocd-cm

#### ▼ accounts.image-updater

argocd-cm (ConfigMap) で、ArgoCDのAPIユーザーを作成する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  accounts.image-updater: apiKey
```

<br>

### argocd-image-updater-cm

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-image-updater-cm
  namespace: argocd
data:
  argocd.grpcWeb: "true"
  registries.conf: |
    registries:  
      - name: foo-image
        api_url: https://<AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com
        prefix: <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com
        credentials: ext:/scripts/ecr-login.sh
        ping: yes
        credsexpire: 10h
```

<br>

### argocd-image-updater-auth-scripts

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-image-updater-auth-scripts
  namespace: argocd
data:
  scripts:
    # readOnlyRootFilesystem=true としているため、 HOME を /tmp に変更する
    ecr-login.sh: |
      #!/bin/sh
      HOME=/tmp \
      aws ecr get-authorization-token --region ap-northeast-1 --output text --query 'authorizationData[].authorizationToken' | base64 -d
```

<br>

### argocd-rbac-cm

#### ▼ policy.csv

argocd-rbac-cm (ConfigMap) で、APIユーザーに認可スコープを設定する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  policy.default: role:readonly
  policy.csv: |
    # ロールと認可スコープを定義する
    p, role:image-updater, applications, get, */*, allow
    p, role:image-updater, applications, update, */*, allow
    g, image-updater, role:image-updater
```

> - https://argocd-image-updater.readthedocs.io/en/v0.1.0/install/start/#create-a-local-user-within-argocd
> - https://argocd-image-updater.readthedocs.io/en/v0.1.0/install/start/#granting-rbac-permissions-in-argocd

<br>

## 03. Secret

### argocd-image-updater-token

#### ▼ argocd.token

image-updaterユーザーのAPIキーを設定する。

暗号化ツール (例：SOPS) を使用して管理するとよい。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: argocd-image-updater-token
type: Opaque
data:
  argocd.token: *****
```

<br>
