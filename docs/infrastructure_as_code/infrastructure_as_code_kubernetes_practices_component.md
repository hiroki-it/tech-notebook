---
title: 【IT技術の知見】プラクティス集＠Kubernetesコンポーネント
description: プラクティス集＠Kubernetesコンポーネントの知見を記録しています。
---

# プラクティス集＠Kubernetesコンポーネント

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. コントロールプレーンNode

### 可用性

#### ▼ 冗長化

コントロールプレーン Node は `3`~`7` 台を作成し、Etcd の可用性を担保する。

> - https://www.siderolabs.com/blog/why-should-a-kubernetes-control-plane-be-three-nodes/
> - https://www.techscore.com/blog/2019/03/28/raft-consensus-algorithm/

<br>

## 02. ワーカーNode

### 性能

#### ▼ CPU/メモリ

Node グループにあった CPU とメモリを割り当てる。

例えば、業務アプリは恒常的に CPU とメモリを必要とするため、アプリ系 Node グループには CPU とメモリを多めに割り当てる。

一方で、バッチ系は瞬間的にこれらを必要とするため、バッチ系 Node グループには瞬間的な要求 (バースト) に適した CPU とメモリを選ぶ。

AWS であれば T 系のインスタンスタイプが瞬間的な要求に適している。

#### ▼ ストレージ

Node グループにあったストレージを割り当てる。

例えば、ArgoCD がストレージに永続化するデータ量は少ないので、ArgoCD の Node グループにはストレージはあまり必要ない。

一方で、Prometheus はメトリクスを Node のストレージに保管する (外部 TSDB を使用するにしても数日分は保管することになる)。

<br>

### 可用性

#### ▼ Nodeグループ

ワーカーNode は Pod の種類 (アプリ系、システム系、ロードバランサー系、バッチ系など) ごとに作成し、可用性を担保する。

特にクラウドプロバイダーでは Node グループを作成できる。

#### ▼ 冗長化

Node グループごとにワーカーNode を冗長化する。

Node グループの数に合わせて冗長化する。

例えば、アプリ系 Node グループはユーザーに影響があり、稼働時間を長くしたいので、Node を多く冗長化する。

一方で、システム系 Node グループはユーザーに影響がなく、稼働時間を機にする必要がないため、Node は少なめに冗長化する。

#### ▼ 水平スケーリング

オートスケーラー (例：cluster autoscaler、Karpenter) を使用してワーカーNode を水平スケーリングし、可用性を担保する。

<br>

## 03. コンテナ

### 可用性

kubelet により、コンテナをヘルスチェック (例：LivenessProbe、ReadinessProbe) し、可用性を担保する。

LivenessProbe ヘルスチェックは、コンテナで障害が起こるとコンテナを再起動してくれるため、システム全体として稼働時間を長くできる。

また ReadinessProbe ヘルスチェックは、コンテナで処理待ちが起こるとそのコンテナが処理できるようになるまで通信を流さないようにしてくれるため、システム全体として稼働時間を長くできる。

<br>

### 安全性

#### ▼ プロセスの実行ユーザーに認可スコープを設定する

Pod の `.spec.securityContext` キーを使用して、コンテナのプロセスの実行ユーザーに認可スコープを付与する。

> - https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
> - https://speakerdeck.com/kyohmizu/saibagong-ji-kara-kubernetes-kurasutawoshou-rutamefalsexiao-guo-de-nasekiyuriteidui-ce?slide=18

<br>

### 信頼性

#### ▼ ステートレス化

コンテナにセッションデータを持たせた場合、Pod がスケールインすることにより、コンテナ上のセッションデータを削除してしまう。

セッションデータがなくなると、セッションを途中で維持できなくなってしまう。

コンテナに状態を持たせない代わりに外部のセッションストレージツール (例：Redis) を使用する。

コンテナがスケールイン/スケールアウトしながらセッションストレージツールからセッションデータを取得できるようにし、信頼性を担保する。

あるいは、セッションストレージツールの代わりにスティッキーセッションを使用してもこの問題を避けられる。

> - https://qiita.com/tomoyk/items/67722472a55b8dc7d01d#3-%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E4%BF%9D%E7%AE%A1%E5%85%88
> - https://dev.classmethod.jp/articles/stateless_ec2/#toc-4

<br>
