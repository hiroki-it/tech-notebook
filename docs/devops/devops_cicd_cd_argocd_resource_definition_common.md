---
title: 【IT技術の知見】共通項目＠リソース定義
description: 共通項目＠リソース定義の知見を記録しています。
---

# 共通項目＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. ArgoCD の `.metadata.labels` キー

### AppProject、Application の場合

<table>
  <thead>
    <tr>
      <th>キー</th>
      <th>値の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>finalizers</code></td>
      <td><code>resources-finalizer.argocd.argoproj.io</code></td>
      <td>Application のカスケード削除をデフォルトで有効化する。これを有効化していると、マニフェスト管理ツール (例：Helm) で Application を削除した場合も、カスケード削除が実行される。削除がスタックすることが多発するため、使用しないほうがよい。</td>
    </tr>
  </tbody>
</table>

> - [App Deletion - Argo CD - Declarative GitOps CD for Kubernetes](https://argo-cd.readthedocs.io/en/stable/user-guide/app_deletion/)

<br>

### 任意の Kubernetes リソースの場合

ArgoCD を使用している場合、ArgoCD の情報を設定する。

Custom Controller (application-controller) が設定してくれるため、開発者が設定する必要はない。

<table>
  <thead>
    <tr>
      <th>キー</th>
      <th>値の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>argocd.argoproj.io/instance</code></td>
      <td><code>foo-application</code></td>
      <td>ConfigMap の <code>application.resourceTrackingMethod</code> で <code>label</code> を設定する。ArgoCD の Application 名を設定する。もし Kubernetes リソースに設定すれば親 Application が自動的に紐付き、Application に設定されば App of Apps パターンでの親 Application が紐づく。なお、CRD には設定されない。</td>
    </tr>
    <tr>
      <td><code>argocd.argoproj.io/tracking-id</code></td>
      <td><code>foo-application:apps/Deployment:foo-namespace/foo-deployment</code></td>
      <td>ConfigMap の <code>application.resourceTrackingMethod</code> で <code>annotation</code> を設定する。<code>&lt;Application名&gt;:&lt;APIグループ名&gt;/&lt;リソースのkind名&gt;:&lt;Namespace名&gt;/リソース名</code> というアノテーションを自動的に付与する。</td>
    </tr>
  </tbody>
</table>

<br>

### ArgoCD の使用する Kubernetes リソースの場合

<table>
  <thead>
    <tr>
      <th>キー</th>
      <th>値の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>app.kubernetes.io/part-of</code></td>
      <td><code>argocd</code></td>
      <td>ArgoCD のコンポーネントが使用する Kubernetes リソースを宣言するために、それらに設定する。</td>
    </tr>
  </tbody>
</table>

<br>
