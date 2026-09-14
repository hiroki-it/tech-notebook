---
title: 【IT技術の知見】ChaosMesh＠システムテスト
description: ChaosMesh＠システムテストの知見を記録しています。
---

# ChaosMesh＠システムテスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ChaosMesh の仕組み

### アーキテクチャ

ChaosMesh は、chaos-dashboard、chaos-controller-manager、chaos-daemon、といったコンポーネントから構成されている。

他のカオスエンジニアリングツール (例：Chaos monkey、Chaos Kong) と比べて、Kubernetes により合った手法でカオスエンジニアリングを実行できる。

![chaos-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/chaos-mesh_architecture.png)

> - https://chaos-mesh.org/docs/
> - https://www.publickey1.jp/blog/20/kubernetespodchaos_mesh10.html

<br>

### 注入できる障害

#### ▼ Kubernetes

- Pod の障害 (再起動など)

#### ▼ AWS

- Amazon EC2 Node の障害 (再起動など)

#### ▼ Google Cloud

- Google Compute Engine の障害 (再起動など)

<br>

## 02. セットアップ

### マニフェストとして

#### チャートとして

GitHub リポジトリから chaos-mesh チャートをインストールし、リソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://charts.chaos-mesh.org

$ helm repo update

$ kubectl create namespace chaos-testing

$ helm install <Helmリリース名> <チャートリポジトリ名>/chaos-mesh -n chaos-testing --version <バージョンタグ>
```

> - https://chaos-mesh.org/docs/production-installation-using-helm/
> - https://github.com/chaos-mesh/charts

<br>

## 03. 障害例

### Podを一時的に停止させる

対象のPodを一時的に使用できない状態にし、他のPodへの切り替えやサービスの継続性を確認する。

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: Schedule
metadata:
  namespace: system
  name: foo-pod-failure-one-mode
  annotations:
    # 平常時は障害注入を無効化しておく
    experiment.chaos-mesh.org/pause: "true"
spec:
  schedule: "30 10 21 3 *"
  startingDeadlineSeconds: 60
  concurrencyPolicy: Forbid
  historyLimit: 1
  type: PodChaos
  # 注入する障害の内容を設定する
  podChaos:
    selector:
      namespaces:
        - system
      labelSelectors:
        app.kubernetes.io/name: foo
    # 対象のPodからランダムに1個を選択する
    mode: one
    # 選択したPodを一時的に使用できない状態にする
    action: pod-failure
    # 障害を1分間継続する
    duration: 1m
    gracePeriod: 0
```

> - https://chaos-mesh.org/docs/simulate-pod-chaos-on-kubernetes/

<br>

### Podを強制的に削除する

対象のPodを強制的に削除し、KubernetesによるPodの再作成とサービスの復旧を確認する。

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: Schedule
metadata:
  namespace: system
  name: foo-pod-kill-one-mode
  annotations:
    # 平常時は障害注入を無効化しておく
    experiment.chaos-mesh.org/pause: "true"
spec:
  schedule: "35 10 21 3 *"
  startingDeadlineSeconds: 60
  concurrencyPolicy: Forbid
  historyLimit: 1
  type: PodChaos
  # 注入する障害の内容を設定する
  podChaos:
    selector:
      namespaces:
        - system
      labelSelectors:
        app.kubernetes.io/name: foo
    # 対象のPodからランダムに1個を選択する
    mode: one
    # 選択したPodを強制的に削除する
    action: pod-kill
```

> - https://chaos-mesh.org/docs/simulate-pod-chaos-on-kubernetes/

<br>

### レスポンスを遅延させる

対象のPodに対する通信へ遅延を発生させ、レスポンスの遅延やタイムアウト時の動作を確認する。

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: Schedule
metadata:
  namespace: system
  name: foo-response-delay-one-mode
  annotations:
    # 平常時は障害注入を無効化しておく
    experiment.chaos-mesh.org/pause: "true"
spec:
  schedule: "40 10 21 3 *"
  startingDeadlineSeconds: 60
  concurrencyPolicy: Forbid
  historyLimit: 1
  type: NetworkChaos
  # 注入する障害の内容を設定する
  networkChaos:
    action: delay
    selector:
      namespaces:
        - system
      labelSelectors:
        app.kubernetes.io/name: foo
    # 対象のPodからランダムに1個を選択する
    mode: one
    # 送信方向と受信方向の両方に遅延を発生させる
    direction: both
    # 500ミリ秒の遅延と最大100ミリ秒の揺らぎを発生させる
    delay:
      latency: 500ms
      jitter: 100ms
      correlation: "50"
    # 障害を2分間継続する
    duration: 2m
```

> - https://chaos-mesh.org/docs/simulate-network-chaos-on-kubernetes/

<br>

### パケットを損失させる

対象のPodに対する通信でパケット損失を発生させ、通信エラーやリトライ時の動作を確認する。

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: Schedule
metadata:
  namespace: system
  name: foo-network-loss-one-mode
  annotations:
    # 平常時は障害注入を無効化しておく
    experiment.chaos-mesh.org/pause: "true"
spec:
  schedule: "45 10 21 3 *"
  startingDeadlineSeconds: 60
  concurrencyPolicy: Forbid
  historyLimit: 1
  type: NetworkChaos
  # 注入する障害の内容を設定する
  networkChaos:
    action: loss
    selector:
      namespaces:
        - system
      labelSelectors:
        app.kubernetes.io/name: foo
    # 対象のPodからランダムに1個を選択する
    mode: one
    # 送信方向と受信方向の両方でパケットを損失させる
    direction: both
    # 20パーセントの確率でパケットを損失させる
    loss:
      loss: "20"
      correlation: "25"
    # 障害を2分間継続する
    duration: 2m
```

> - https://chaos-mesh.org/docs/simulate-network-chaos-on-kubernetes/

<br>

### CPUに負荷をかける

対象のPodのCPU使用率を高め、処理性能の低下やオートスケーリング時の動作を確認する。

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: Schedule
metadata:
  namespace: system
  name: foo-cpu-stress-one-mode
  annotations:
    # 平常時は障害注入を無効化しておく
    experiment.chaos-mesh.org/pause: "true"
spec:
  schedule: "50 10 21 3 *"
  startingDeadlineSeconds: 60
  concurrencyPolicy: Forbid
  historyLimit: 1
  type: StressChaos
  # 注入する障害の内容を設定する
  stressChaos:
    # 対象のPodからランダムに1個を選択する
    mode: one
    selector:
      namespaces:
        - system
      labelSelectors:
        app.kubernetes.io/name: foo
    # 2個のワーカーでCPU使用率を80パーセントまで高める
    stressors:
      cpu:
        workers: 2
        load: 80
    # 障害を3分間継続する
    duration: 3m
```

> - https://chaos-mesh.org/docs/simulate-heavy-stress-on-kubernetes/

<br>

### メモリに負荷をかける

対象のPodでメモリを消費させ、メモリ不足やPodの再起動時の動作を確認する。

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: Schedule
metadata:
  namespace: system
  name: foo-memory-stress-one-mode
  annotations:
    # 平常時は障害注入を無効化しておく
    experiment.chaos-mesh.org/pause: "true"
spec:
  schedule: "55 10 21 3 *"
  startingDeadlineSeconds: 60
  concurrencyPolicy: Forbid
  historyLimit: 1
  type: StressChaos
  # 注入する障害の内容を設定する
  stressChaos:
    # 対象のPodからランダムに1個を選択する
    mode: one
    selector:
      namespaces:
        - system
      labelSelectors:
        app.kubernetes.io/name: foo
    # 1個のワーカーで256MBのメモリを消費する
    stressors:
      memory:
        workers: 1
        size: 256MB
    # 障害を3分間継続する
    duration: 3m
```

> - https://chaos-mesh.org/docs/simulate-heavy-stress-on-kubernetes/

<br>
