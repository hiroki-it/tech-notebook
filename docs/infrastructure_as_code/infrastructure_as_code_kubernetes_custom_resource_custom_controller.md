---
title: 【IT技術の知見】custom-controller＠カスタムリソース
description: custom-controller＠カスタムリソースの知見を記録しています。
---

# custom-controller＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. custom-controller

### custom-controllerとは

カスタムリソースのためのkube-controllerに相当する。

ただし、kube-controllerとは異なり、Node上で稼働する。

<br>

### カスタムリソースの仕組み

![custom_controller.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/custom_controller.png)

custom-controllerは、kube-apiserverを介して、etcdにwatchイベントを送信している。

カスタムリソースとCRDのマニフェストを何らかの方法 (例：`kubectl apply`コマンド、`kubectl edit`コマンド、など) でetcd上に永続化したとする。

するとcustom-controllerは、etcd上でカスタムリソースとCRDのマニフェストを検知し、実際にカスタムリソースを作成/変更する。

クライアントからのマニフェストの作成/変更は、etcd上のマニフェストの設定値を変更しているのみで、実際のカスタムリソースを作成/変更しているわけではないことに注意する。

その他、etcd上のカスタムリソースに応じて、外部サービスのAPI (例：証明書のFastly) をコールし、カスタムリソースと対になるもの (例：Fastlyの証明書) を作成することも可能である。

注意点として、CRDを削除するとkube-controllerはカスタムリソースを削除する。

この時CRDを改めて作成しても、kube-controllerはカスタムリソースを自動的に作成しない。

kube-controllerに不具合があると、etcd上のCRDの通りにカスタムリソースが作成されない。

> ↪️ 参考：
>
> - https://youtu.be/pw8AVOJQ5uw?t=1372
> - https://note.varu3.me/n/n461302e3ac79

<br>

### reconciliationループ

kube-controller-managerは、Nodeにあるcustom-controllerを反復的に実行する。

これにより、カスタムリソースはCRDの宣言通りに定期的に修復される (reconciliationループ) 。

ただし、custom-controller自体は`kubectl`クライアントが作成する必要がある。

<br>

## 02. セットアップ

### 既にあるものを使用する

> ↪️ 参考：https://github.com/mercari/certificate-expiry-monitor-controller

<br>

### 自前で実装する

custom-controllerを自前で実装する。

> ↪️ 参考：
>
> - https://zenn.dev/hhiroshell/articles/custom-controller-for-out-of-cluster-events
> - https://github.com/hhiroshell/storage-bucket-prober/blob/main/controllers/storagebucket_controller.go

<br>

## 03. Operatorパターン

### Operatorパターンとは

custom-controllerを内蔵し、特定のカスタムリソースをセットアップする責務を持つ。

> ↪️ 参考：https://zoetrope.github.io/kubebuilder-training/

<br>

### Operatorパターンの仕組み

#### ▼ アーキテクチャ

Operatorパターンは、カスタムリソース、custom-controllerのOperator、認可スコープ付与リソース、といったコンポーネントから構成されている。

![kubernetes_operator_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_operator_architecture.png)

> ↪️ 参考：
>
> - https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work
> - https://www.netone.co.jp/knowledge-center/netone-blog/20200629-1/

#### ▼ Operator

custom-controllerとして動作する。

Operatorがいる状況で、カスタムリソースとCRDのマニフェストを何らかの方法 (例：`kubectl apply`コマンド、`kubectl edit`コマンド、など) でetcd上に永続化したとする。

するとOperatorは、operatorはetcd上でカスタムリソースとCRDのマニフェストを検知し、実際にカスタムリソースを作成/変更する。

反対に、CRDを削除すると、Operatorはカスタムリソースを削除する。

この時CRDを改めて作成しても、Operatorはカスタムリソースを自動的に作成しない。

Operatorに不具合があると、etcd上のCRDの通りにカスタムリソースが作成されない。

![kubernetes_operator-controller](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_operator-controller.png)

> ↪️ 参考：
>
> - https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work
> - https://stackoverflow.com/questions/47848258/what-is-the-difference-between-a-kubernetes-controller-and-a-kubernetes-operator
> - https://www.howtogeek.com/devops/what-are-kubernetes-controllers-and-operators/
> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#delete-a-customresourcedefinition

#### ▼ 認可スコープ付与リソース

Operatorがkube-apiserverにリクエストを送信できるように、Operatorに認可スコープを付与する。

> ↪️ 参考：https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work

<br>

## 03-02 Operatorの開発

### 既存のOperatorをカスタマイズする場合

#### ▼ client-goコンポーネント

記入中...

> ↪️ 参考：
>
> - https://github.com/kubernetes/sample-controller/blob/master/docs/controller-client-go.md#client-go-components
> - https://wqwq3215.medium.com/client-go-work-queue%E3%82%92%E7%90%86%E8%A7%A3%E3%81%99%E3%82%8B-6d42614c7c22

#### ▼ custom-controller-componentsコンポーネント

記入中...

> ↪️ 参考：
>
> - https://github.com/kubernetes/sample-controller/blob/master/docs/controller-client-go.md#custom-controller-components
> - https://wqwq3215.medium.com/client-go-work-queue%E3%82%92%E7%90%86%E8%A7%A3%E3%81%99%E3%82%8B-6d42614c7c22

<br>

### 自前のOperatorを作成する場合

#### ▼ OperatorFrameworkとは

Operatorを開発するためのフレームワークのこと。

OperatorHubで公開されている。

> ↪️ 参考：
>
> - https://www.redhat.com/en/blog/introducing-operator-framework-building-apps-kubernetes
> - https://operatorhub.io/

#### ▼ Operator SDK

Operatorを、開発、テスト、リリース、ために必要なツールを提供する。

#### ▼ Operator Lifecycle Manager

Operatorの、作成、削除、を管理する。

#### ▼ Operator Metering

記入中...

<br>
