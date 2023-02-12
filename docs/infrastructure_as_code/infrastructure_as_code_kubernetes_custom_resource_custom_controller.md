---
title: 【IT技術の知見】カスタムコントローラー＠カスタムリソース
description: カスタムコントローラー＠カスタムリソースの知見を記録しています。
---

# カスタムコントローラー＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. カスタムコントローラーとは

### カスタムコントローラーとは

カスタムリソースのためのkube-controllerに相当する。

ただし、kube-controllerとは異なり、Node上で稼働する。

<br>

### カスタムリソースの仕組み

![custom_controller.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/custom_controller.png)


カスタムコントローラーは、kube-apiserverを介して、etcdにwatchイベントを送信している。

カスタムリソースのバインディング情報がetcdに永続化されたことを検知した場合に、kube-apiserverを介して、kubeletにカスタムリソースの作成リクエストを送信する。

加えて、カスタムリソースのマニフェストの設定値をコマンド（例：```kubectl apply```コマンド、```kubectl edit```コマンド、など）で変更した場合に、etcd上でカスタムリソースのマニフェストを検知し、実際にカスタムリソースの設定値を都度変更してくれる。

これらのコマンドは、etcd上のマニフェストの設定値を変更しているのみで、実際のカスタムリソースの設定値を変更しないことに注意する。

その他、etcd上のカスタムリソースに応じて、外部サービスのAPI（例：証明書のFastly）をコールし、カスタムリソースと対になるもの（例：Fastlyの証明書）を作成することも可能である。


> ℹ️ 参考：
>
> - https://youtu.be/pw8AVOJQ5uw?t=1372
> - https://note.varu3.me/n/n461302e3ac79

<br>

### reconciliationループ

kube-controller-managerは、Nodeにあるoperator-controllerを反復的に実行する。

これにより、カスタムリソースはカスタムリソース定義の宣言通りに定期的に修復される（reconciliationループ）。

ただし、カスタムコントローラー自体は```kubectl```クライアントが作成する必要がある。

<br>

## 02. セットアップ

### 既にあるものを使用する

> ℹ️ 参考：https://github.com/mercari/certificate-expiry-monitor-controller

<br>

### 自前で実装する

カスタムコントローラーを自前で実装する。



> ℹ️ 参考：
>
> - https://zenn.dev/hhiroshell/articles/custom-controller-for-out-of-cluster-events
> - https://github.com/hhiroshell/storage-bucket-prober/blob/main/controllers/storagebucket_controller.go

<br>

## 03. Operatorパターン

### Operatorパターンとは

カスタムコントローラーを内蔵し、特定のカスタムリソースをセットアップする責務を持つ。



> ℹ️ 参考：https://zoetrope.github.io/kubebuilder-training/

<br>

### Operatorパターンの仕組み

#### ▼ アーキテクチャ

Operatorパターンは、カスタムリソース、カスタムコントローラーのoperator-controller、認可スコープ付与リソース、から構成されている。

![kubernetes_operator_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_operator_architecture.png)


> ℹ️ 参考：
>
> - https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work
> - https://www.netone.co.jp/knowledge-center/netone-blog/20200629-1/

#### ▼ operator-controller


カスタムコントローラーとして動作する。

operator-controllerが稼働している状況で、etcdにカスタムリソース定義を永続化したとする。

operator-controllerは、NodeとPod間のバインディング情報に基づいて、kubeletにカスタムリソースを作成させる。

operator-controllerに不具合があると、etcd上のカスタムリソース定義の通りにカスタムリソースが作成されない。

![kubernetes_operator-controller](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_operator-controller.png)


> ℹ️ 参考：
>
> - https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work
> - https://stackoverflow.com/questions/47848258/what-is-the-difference-between-a-kubernetes-controller-and-a-kubernetes-operator
> - https://www.howtogeek.com/devops/what-are-kubernetes-controllers-and-operators/

#### ▼ 認可スコープ付与リソース

operator-controllerがkube-apiserverにリクエストを送信できるように、operator-controllerに認可スコープを付与する。

ClusterRoleBinding、ClusterRole、ServiceAccount、などから構成されている。

> ℹ️ 参考：https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work

<br>

## 03-02 Operatorの開発

### 既存のOperatorをカスタマイズする場合

#### ▼ client-goコンポーネント

調査中...

> ℹ️ 参考：
>
> - https://github.com/kubernetes/sample-controller/blob/master/docs/controller-client-go.md#client-go-components
> - https://wqwq3215.medium.com/client-go-work-queue%E3%82%92%E7%90%86%E8%A7%A3%E3%81%99%E3%82%8B-6d42614c7c22

#### ▼ custom-controller-componentsコンポーネント

調査中...

> ℹ️ 参考：
>
> - https://github.com/kubernetes/sample-controller/blob/master/docs/controller-client-go.md#custom-controller-components
> - https://wqwq3215.medium.com/client-go-work-queue%E3%82%92%E7%90%86%E8%A7%A3%E3%81%99%E3%82%8B-6d42614c7c22

<br>

### 自前のOperatorを作成する場合

#### ▼ OperatorFrameworkとは

Operatorを開発するためのフレームワークのこと。

OperatorHubで公開されている。



> ℹ️ 参考：
>
> - https://www.redhat.com/en/blog/introducing-operator-framework-building-apps-kubernetes
> - https://operatorhub.io/

#### ▼ Operator SDK

Operatorを、開発、テスト、リリース、ために必要なツールを提供する。



#### ▼ Operator Lifecycle Manager

Operatorの、作成、削除、を管理する。



#### ▼ Operator Metering

調査中...


<br>
