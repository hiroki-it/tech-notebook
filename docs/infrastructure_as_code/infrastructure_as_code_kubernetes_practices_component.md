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

コントロールプレーンNodeは`3`~`7`台を作成し、Etcdの可用性を担保する。

> - https://www.siderolabs.com/blog/why-should-a-kubernetes-control-plane-be-three-nodes/
> - https://www.techscore.com/blog/2019/03/28/raft-consensus-algorithm/

<br>

## 02. ワーカーNode

### 性能

#### ▼ CPU/メモリ

NodeグループにあったCPUとメモリを割り当てる。

例えば、業務アプリは恒常的にCPUとメモリを必要とするため、アプリ系NodeグループにはCPUとメモリを多めに割り当てる。

一方で、バッチ系は瞬間的にこれらを必要とするため、バッチ系Nodeグループには瞬間的な要求 (バースト) に適したCPUとメモリを選ぶ。

AWSであればT系のインスタンスタイプが瞬間的な要求に適している。

#### ▼ ストレージ

Nodeグループにあったストレージを割り当てる。

例えば、ArgoCDがストレージに永続化するデータ量は少ないので、ArgoCDのNodeグループにはストレージはあまり必要ない。

一方で、PrometheusはメトリクスをNodeのストレージに保管する (外部TSDBを使用するにしても数日分は保管することになる)。

<br>

### 可用性

#### ▼ Nodeグループ

ワーカーNodeはPodの種類 (アプリ系、システム系、ロードバランサー系、バッチ系、など) ごとに作成し、可用性を担保する。

特にクラウドプロバイダーではNodeグループを作成できる。

#### ▼ 冗長化

NodeグループごとにワーカーNodeを冗長化する。

Nodeグループにあった数に冗長化する。

例えば、アプリ系Nodeグループはユーザーに影響があり、稼働時間を長くしたいので、Nodeを多く冗長化する。

一方で、システム系Nodeグループはユーザーに影響がなく、稼働時間を機にする必要がないため、Nodeは少なめに冗長化する。

#### ▼ 水平スケーリング

オートスケーラー (例：cluster autoscaler、Karpenter) を使用してワーカーNodeを水平スケーリングし、可用性を担保する。

<br>

## 03. コンテナ

### 可用性

コンテナをヘルスチェック (例：LivenessProbe、ReadinessProbe) し、可用性を担保する。

LivenessProbeヘルスチェックは、コンテナで障害が起こるとコンテナを再起動してくれるため、システム全体として稼働時間を長くできる。

またReadinessProbeヘルスチェックは、コンテナで処理待ちが起こるとそのコンテナが処理できるようになるまで通信を流さないようにしてくれるため、システム全体として稼働時間を長くできる。

<br>

### 安全性

#### ▼ プロセスの実行ユーザーに認可スコープを設定する

Podの `.spec.securityContext`キーを使用して、コンテナのプロセスの実行ユーザーに認可スコープを付与する。

> - https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
> - https://speakerdeck.com/kyohmizu/saibagong-ji-kara-kubernetes-kurasutawoshou-rutamefalsexiao-guo-de-nasekiyuriteidui-ce?slide=18

<br>

### 信頼性

#### ▼ ステートレス化

コンテナにセッションデータを持たせた場合、Podがスケールインすることにより、コンテナ上のセッションデータを削除してしまう。

セッションデータがなくなると、セッションを途中で維持できなくなってしまう。

コンテナに状態を持たせない代わりに外部のセッション管理サーバー (例：Redis) を使用する。

コンテナがスケールイン/スケールアウトしながらセッション管理サーバーからセッションデータを取得できるようにし、信頼性を担保する。

> - https://qiita.com/tomoyk/items/67722472a55b8dc7d01d#3-%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E4%BF%9D%E7%AE%A1%E5%85%88

<br>
