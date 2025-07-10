---
title: 【IT技術の知見】共通項目＠リソース定義
description: 共通項目＠リソース定義の知見を記録しています。
---

# 共通項目＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ArgoCDの`.metadata.labels`キー

### AppProject、Applicationの場合

| キー         | 値の例                                   | 説明                                                                                                                                                                                                                                 |
| ------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `finalizers` | `resources-finalizer.argocd.argoproj.io` | Applicationのカスケード削除をデフォルトで有効化する。これを有効化していると、マニフェスト管理ツール (例：Helm) でApplicationを削除した場合も、カスケード削除が実行される。削除がスタックすることが多発するため、使用しない方が良い。 |

> - https://argo-cd.readthedocs.io/en/stable/user-guide/app_deletion/

<br>

### 任意のKubernetesリソースの場合

ArgoCDを使用している場合、ArgoCDの情報をを設定する。

Custom Controller (application-controller) が設定してくれるため、開発者が設定する必要はない。

| キー                             | 値の例                                                         | 説明                                                                                                                                                                                                                                                                   |
| -------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `argocd.argoproj.io/instance`    | `foo-application`                                              | ConfigMapの`application.resourceTrackingMethod`で`label`を設定する。ArgoCDのApplication名を設定する。もしKubernetesリソースに設定すれば親Applicationが自動的に紐付き、Applicationに設定さればApp of Appsパターンでの親Applicationが紐づく。なお、CRDには設定されない。 |
| `argocd.argoproj.io/tracking-id` | `foo-application:apps/Deployment:foo-namespace/foo-deployment` | ConfigMapの`application.resourceTrackingMethod` で`annotation`を設定する。`<Application名>:<APIグループ名>/<リソースのkind名>:<Namespace名>/リソース名`というアノテーションを自動的に付与する。                                                                        |

<br>

### ArgoCDの使用するKubernetesリソースの場合

| キー                        | 値の例   | 説明                                                                                   |
| --------------------------- | -------- | -------------------------------------------------------------------------------------- |
| `app.kubernetes.io/part-of` | `argocd` | ArgoCDのコンポーネントが使用するKubernetesリソースを宣言するために、それらに設定する。 |

<br>
