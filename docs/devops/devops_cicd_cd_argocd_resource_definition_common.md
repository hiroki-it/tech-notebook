---
title: 【IT技術の知見】共通項目＠リソース定義
description: 共通項目＠リソース定義の知見を記録しています。
---

# 共通項目＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ArgoCD の `.metadata.labels` キー

### AppProject、Application の場合

| キー         | 値の例                                   | 説明                                                                                                                                                                                                                                      |
| ------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `finalizers` | `resources-finalizer.argocd.argoproj.io` | Application のカスケード削除をデフォルトで有効化する。これを有効化していると、マニフェスト管理ツール (例：Helm) で Application を削除した場合も、カスケード削除が実行される。削除がスタックすることが多発するため、使用しないほうがよい。 |

> - https://argo-cd.readthedocs.io/en/stable/user-guide/app_deletion/

<br>

### 任意の Kubernetes リソースの場合

ArgoCD を使用している場合、ArgoCD の情報を設定する。

Custom Controller (application-controller) が設定してくれるため、開発者が設定する必要はない。

| キー                             | 値の例                                                         | 説明                                                                                                                                                                                                                                                                                    |
| -------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `argocd.argoproj.io/instance`    | `foo-application`                                              | ConfigMap の `application.resourceTrackingMethod` で `label` を設定する。ArgoCD のApplication 名を設定する。もし Kubernetes リソースに設定すれば親 Application が自動的に紐付き、Application に設定されば App of Apps パターンでの親 Application が紐づく。なお、CRD には設定されない。 |
| `argocd.argoproj.io/tracking-id` | `foo-application:apps/Deployment:foo-namespace/foo-deployment` | ConfigMap の `application.resourceTrackingMethod` で `annotation` を設定する。`<Application名>:<APIグループ名>/<リソースのkind名>:<Namespace名>/リソース名` というアノテーションを自動的に付与する。                                                                                    |

<br>

### ArgoCD の使用する Kubernetes リソースの場合

| キー                        | 値の例   | 説明                                                                                      |
| --------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `app.kubernetes.io/part-of` | `argocd` | ArgoCD のコンポーネントが使用する Kubernetes リソースを宣言するために、それらに設定する。 |

<br>
