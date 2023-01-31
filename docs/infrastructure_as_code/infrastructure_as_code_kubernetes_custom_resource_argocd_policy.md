---
title: 【IT技術の知見】設計ポリシー＠ArgoCD
description: 設計ポリシー＠ArgoCDの知見を記録しています。
---

# 設計ポリシー＠ArgoCD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. リポジトリ構成ポリシー

### リポジトリ分割のメリット

リポジトリを分割することにより、以下のメリットがある。

- 認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。

<br>

### 各Applicationを異なるリポジトリで管理

監視対象リポジトリごとにApplicationを作成し、これらを異なるリポジトリで管理する。



```yaml
repository/
├── tes/
│   └── foo-application.yaml # fooリポジトリを監視する。
│
├── stg/
└── prd/
```

```yaml
repository/
├── tes/
│   └── bar-application.yaml # barリポジトリを監視する。
│
├── stg/
└── prd/
```

```yaml
repository/
├── tes/
│   └── baz-application.yaml # bazリポジトリを監視する。
│
├── stg/
└── prd/
```

<br>

## 02. Applicationのデザインパターン

### Appパターン（通常パターン）

監視対象リポジトリごとにApplicationを作成し、これらを同じリポジトリで管理する。

この時、全てのApplicationには親Applicationが存在しない。

監視対象リポジトリにはKubernetesリソースのマニフェストやhelmチャートが管理されている。


```yaml
argocd-repository/
├── tes/
│   ├── app-application.yaml
│   └── infra-application.yaml
│
├── stg/
└── prd/
```

```yaml
app-manifest-repository/ # マニフェストリポジトリまたはチャートリポジトリ
├── tes/
│   ├── deployment.yaml
│   ....
│
├── stg/
└── prd/
```


```yaml
infra-manifest-repository/ # マニフェストリポジトリまたはチャートリポジトリ
├── tes/
│   ├── deployment.yaml
│   ....
│
├── stg/
└── prd/
```

> ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/2107/30/news018.html#04


<br>

### App-Of-Appsパターン

#### ▼ App-Of-Appsパターンとは

親Applicationで子Applicationをグループ化したように構成する。

![root-application](https://raw.githubusercontent.com/hiroki-it/helm-charts-practice/main/root-application.png)


> ℹ️ 参考：
>
> - https://medium.com/dzerolabs/turbocharge-argocd-with-app-of-apps-pattern-and-kustomized-helm-ea4993190e7c
> - https://www.arthurkoziel.com/setting-up-argocd-with-helm/
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/#app-of-apps-pattern

#### ▼ root-application

全てのApplicationを監視する最上位Applicationのこと。

```yaml
# 最上位Application
root-argocd-repository/
├── tes/
│   └── root-application.yaml
│
├── stg/
└── prd/
```

#### ▼ parent-application


各AppProjectの子Applicationを監視する親Applicationのこと。

管理チームごとにApplication（app-parent-application、infra-parent-application）を作成すると良い。

parent-applicationは、```default```プロジェクトや```root```プロジェクトに配置する。

```yaml
# 親Application
parent-argocd-repository/
├── tes/ 
│   ├── app-parent-application.yaml # appプロジェクトを監視するapplication
│   └── infra-parent-application.yaml # infraプロジェクトを監視するapplication
│
├── stg/
└── prd/
```

#### ▼ child-application


各AppProjectで、マニフェストリポジトリやチャートリポジトリを監視するApplicationのこと。

マイクロサービス単位のマニフェストやチャートごとに作成すると良い。

child-applicationは、そのマイクロサービスをデプロイする権限を持つチーム名のプロジェクトに配置する。


```yaml
# 子Application
child-argocd-repository/
├── tes/
│   ├── app
│   │   ├── account-application.yaml      
│   │   ├── customer-application.yaml
│   │   ├── orchestrator-application.yaml
│   │   ├── order-application.yaml 
│   │   └── shared-application.yaml        
│   │
│   └── infra
│       ├── fluentd-application.yaml           
│       ├── grafana-application.yaml
│       ├── istio-application.yaml
│       ├── kiali-application.yaml             
│       ├── prometheus-application.yaml
│       ├── shared-application.yaml
│       └── victoria-metrics-application.yaml  
│
├── stg/
└── prd/
```

アプリ領域やインフラ領域のマニフェストやチャートは以下の通りになっているとする。

```yaml
# アプリ領域のマニフェスト
app-manifest-repository/
├── tes/
│   ├── deployment.yaml
│   ....
│
├── stg/
└── prd/
```

```yaml
# インフラ領域のマニフェスト
infra-manifest-repository/
├── tes/
│   ├── deployment.yaml
│   ....
│
├── stg/
└── prd/
```

#### ▼ grand-parent-application



> ℹ️ 参考：https://tech.isid.co.jp/entry/2022/12/05/Argo_CD%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6Istio%E3%82%92%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3%E3%82%A2%E3%83%83%E3%83%97%E3%81%99%E3%82%8B

<br>

## 02. ディレクトリ構成ポリシー

### 実行環境別（必須）

必須の構成である。

実行環境別に、Applicationを異なるディレクトリで管理する。

Applicationでは、実行環境に対応するブランチのみを監視する。



```yaml
repository/
├── tes/ # テスト環境
├── stg/ # ステージング環境
└── prd/ # 本番環境
```

<br>

## 03. CDツールに関する脆弱性対策

### CDツールに関する脆弱性対策とは

対象のソースコードの脆弱性ではなく、CDツールに関するそれに対処する。



<br>

### 認証/認可

#### ▼ CDツールを操作できる開発者に関する認証/認可

CDツールを操作できる開発者を認証し、また認可スコープを付与する。

利便的かつ安全な認証/認可方法を選ぶ。



| 認証/認可方法 | 二要素認証 | 推奨/非推奨 |
|---------------|------------|-----------|
| Bearer認証     | -          | 非推奨      |
| OAuth         | あり         | 推奨        |
|               | なし         | 非推奨      |
| OIDC          | あり         | 推奨        |
|               | なし         | 非推奨      |
| SAML          | あり         | 推奨        |
|               | なし         | 非推奨      |

#### ▼ CDツール自体の認証/認可

CDツールのServiceAccountを認証し、またClusterRoleの認可スコープを付与する。



| 期限   | 説明                                              | 方法                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 推奨/非推奨 |
|------|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| 恒久的 | CDツールを恒久的に認証し、また同様に認可スコープを恒久的に付与する。 | Kubernetes ```v1.21``` 以前では、ServiceAccountの認証用のトークンに期限がない。                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 非推奨      |
| 一時的 | CDツールを一時的に認証し、また同様に認可スコープを一時的に付与する。 | Kubernetes ```v1.22``` 以降ではBoundServiceAccountTokenVolumeにより、ServiceAccountの認証用のトークンが定期的に再作成されるようになっている。そのため、Kubernetes ```v1.22``` 以降に対応したCDツールのServiceAccountでは、一時的な認証を実現できている。一方で、CDツールにClusterRoleの認可スコープ一時的に付与する方法は、調査した限り見つからなかったが、preSyncなどを使用すればできるかも。<br>参考：<br>・https://github.com/argoproj/argo-cd/issues/9417#issuecomment-1162548782 <br>・https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/#bound-service-account-token-volume | 推奨        |


<br>

### 機密な変数やファイルの管理

#### ▼ Secretの変数の場合

> ℹ️ 参考：https://akuity.io/blog/how-to-manage-kubernetes-secrets-gitops/

<br>

## 04. 事後処理

### 通知

CDパイプライン上で実行しているステップ（例：デプロイ、ロールバック、など）の結果が通知されるようにする。

通知があることと品質を高めることは直接的には関係ないが、開発者の作業効率が上がるため、間接的に品質を高めることにつながる。






<br>

## 05. エラー解決

### 削除できない系

#### ▼ ```argocd```というNamespace以外でApplicationを作成できない

古いArgoCDでは、```argocd```というNamespace以外でApplicationを作成できない。

これに起因して、以下のようなエラーが出ることがある。

```
application 'foo-application' in namespace 'foo-namespace' is not permitted to use project 'default'
```

```
error getting app project "foo-project": appproject.argoproj.io "foo-project" not found
```

これは、AppProjectの```.spec.sourceNamespaces```キーで解決できる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # その他、運用チーム名など
spec:
  sourceNamespaces:
    - '*'
```

> ℹ️ 参考：https://github.com/argoproj/argo-cd/pull/9755

#### ▼ Applicationを削除できない

PruneによるKubernetesリソースの削除を有効化し、フォアグラウンドで削除した場合、Applicationが配下にリソースを持たないことにより、Applicationを削除できないことがある。

これらの場合には、以下の手順でApplicationを削除する。



> ℹ️ 参考：https://stackoverflow.com/questions/67597403/argocd-stuck-at-deleting-but-resources-are-already-deleted

```【１】```

:    Applicationの```.spec.syncPolicy.allowEmpty```キーを有効化する。

```【２】```

:    フォアグラウンドで削除すると、Applicationの```.metadata.finalizers```キーの値に削除中のリソースが設定される。この配列を空配列に変更する。ArgoCDのUIからは変更できず、```kubectl patch```コマンドを使用する必要がある。

> ℹ️ 参考：https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/

```bash
$ kubectl patch crd applications.argoproj.io \
    -p '{"metadata":{"finalizers":[]}}' \
    --type=merge
```

```【３】```

:    1つ目の`spec.syncPolicy.allowEmpty`キーの変更を元に戻す。

#### ▼ Namespaceを削除できない

```bash
$ kubectl patch ns argocd \
    -p '{"metadata":{"finalizers":[]}}' \
    --type=merge
```

<br>

### ConfigMapやSecretの設定変更が反映されない

ArgoCDを使用しない場合と同様にして、ConfigMapやSecretの設定変更を反映する場合、Deployment/StatefulSet/DaemonSetを再起動する必要がある。



<br>

### すでに削除されたPodが監視され続ける

すでに削除したPodを監視し続けてしまうことがあり、この場合Podが存在しないため、Podの削除すらできなくなってしまう。

この問題が起こった場合、以下のいずれかで解決する。



- argocd-serverを再起動する。親になるリソースを削除する必要がなく、apply先のClusterには影響がないため、安全な方法である。ArgoCDの使用者に周知しさえすれば問題ない。
- 親になるリソース（Deployment、DaemonSet、など）を一度削除する。ただし、親になるリソースを削除する必要があるため、やや危険である。

<br>

### ヘルスチェックが終了しない

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/faq/#why-is-my-application-stuck-in-progressing-state

<br>

### SyncしてもOutOfSyncステータスが解消されない

Sync後にKubernetesリソースの状態が変更されるような場合、SyncしてもSyncedステータスではなくOutOfSyncステータスになってしまう。



> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/
> - https://argo-cd.readthedocs.io/en/stable/faq/#why-is-my-application-still-outofsync-immediately-after-a-successful-sync

<br>

## 06. システム品質特性の担保

### 可用性の場合

可用性を高めるために、ArgoCDの各コンポーネントを冗長化する。


<br>

## 07. アップグレード

### 設計ポリシー

ArgoCDが自分で自分をアップグレードできるように、親Applicationを子Applicationで管理する。



<br>

## 08. 監視

調査中...

> ℹ️ 参考：https://akuity.io/blog/unveil-the-secret-ingredients-of-continuous-delivery-at-enterprise-scale-with-argocd-kubecon-china-2021/#Monitoring-and-Alerting

<br>
