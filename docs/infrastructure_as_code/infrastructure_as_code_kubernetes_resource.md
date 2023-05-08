---
title: 【IT技術の知見】Kubernetesリソース＠Kubernetes
description: Kubernetesリソース＠Kubernetesの知見を記録しています。
---

# Kubernetesリソース＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Kubernetesリソースとオブジェクト

### Kubernetesリソース

Kubernetes上でアプリケーションを稼働させる概念のこと。

<br>

### Kubernetesオブジェクト

マニフェストによって量産されたKubernetesリソースのインスタンスのこと。

> ↪️：https://qiita.com/cvusk/items/773e222e0971a5391a51

<br>

## 02. Workload系リソース

### Workload系リソースとは

コンテナの実行に関する機能を提供する。

> ↪️：https://thinkit.co.jp/article/13542

<br>

### DaemonSet

#### ▼ DaemonSetとは

Node上のPodの個数を維持管理する。

Podの負荷に合わせてPodの自動水平スケーリングを実行しない (HorizontalPodAutoscalerが必要である) 。

ただしReplicaSetとは異なり、Node内でPodを1つだけ維持管理する。

Nodeで1つだけ稼働させる必要のあるプロセス (例：kube-proxy、CNI、FluentBit、datadogエージェント、cAdvisorエージェント、Prometheusの一部のExporter、など) のために使用される。

こういったプロセスが稼働するコンテナは、Node内の全てのコンテナからデータを収集し、可観測性のためのデータセットを整備する。

> ↪️：
>
> - https://thinkit.co.jp/article/13611
> - https://github.com/kubernetes/kops/issues/6527#issue-413870064

#### ▼ Pod数の固定

DaemonSetは、Node内でPodを1つだけ維持管理する。

そのため、例えばClusterネットワーク内に複数のNodeが存在していて、いずれかのNodeが停止したとしても、稼働中のNode内のPodを増やすことはない。

<br>

### Deployment

#### ▼ Deploymentとは

ReplicaSetを操作し、Clusterネットワーク内のPodのレプリカ数を維持管理する。

Podの負荷に合わせてPodの自動水平スケーリングを実行しない (HorizontalPodAutoscalerが必要である) 。

ただしStatefulSetとは異なり、ストレートレス (例：アプリコンテナ) なコンテナを含むPodを冗長化することに適する。

> ↪️：
>
> - https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
> - https://sorarinu.dev/2021/08/kubernetes_01/

#### ▼ ReplicaSetの置き換え

PodTemplate (`.spec.template`キー) を変更した場合、Deploymentは新しいReplicaSetを作成し、これを古いReplicaSetと置き換える。

レプリカ数 (`.spec.replicas`キー) の変更の場合は、Deploymentは既存のReplicaSetをそのままにし、Podのレプリカ数のみを変更する。

![kubernetes_deployment_replace_replicaset](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_deployment_replace_replicaset.png)

> ↪️：https://qiita.com/tkusumi/items/01cd18c59b742eebdc6a

#### ▼ Podのレプリカ数の維持

Deploymentは、Cluster内のPodのレプリカ数を指定された数だけ維持する。

そのため、例えばCluster内に複数のNodeが存在していて、いずれかのNodeが停止した場合、稼働中のNode内でレプリカ数を維持するようにPod数を増やす。

> ↪️：https://dr-asa.hatenablog.com/entry/2018/04/02/174006

#### ▼ PersistentVolumeとの関係性

DeploymentのレプリカのPodは、全てが同じPersistentVolumeを共有する。

> ↪️：https://www.amazon.com/dp/1617297615

![kubernetes_deployment_persistent-volume](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_deployment_persistent-volume.png)

<br>

### Job

#### ▼ Jobとは

複数のPodを作成 (SuccessfulCreate) し、指定された数のPodを正常に削除 (SuccessfulDelete) させる。

デフォルトでは、ログの確認のためにPodは削除されず、Jobが削除されて初めてPodも削除される。

`.spec.ttlSecondsAfterFinished`キーを使用すると、Podのみを自動削除できるようになる。

定期的に実行する場合、CronJobのテンプレートとして定義する。

> ↪️：
>
> - https://kubernetes.io/docs/concepts/workloads/controllers/job/
> - https://qiita.com/MahoTakara/items/82853097a1911671a704
> - https://dev.appswingby.com/kubernetes/kubernetes-%E3%81%A7-job%E3%82%92%E8%87%AA%E5%8B%95%E5%89%8A%E9%99%A4%E3%81%99%E3%82%8Bttlsecondsafterfinished%E3%81%8Cv1-21%E3%81%A7beta%E3%81%AB%E3%81%AA%E3%81%A3%E3%81%A6%E3%81%84%E3%81%9F%E4%BB%B6/

#### ▼ CronJobの動作確認

CronJob配下のJobは、決まった時間にならないと実行されない。

任意の時間に実行するためには、CronJobを指定し、これの配下で一時的にJobを作成する。

```bash
$ kubectl create job test-job --from=cronjob/foo-cron-job -n foo
```

ただし、動作確認後はCronJobにJobを作らせたいので、そのJobは削除する。

```bash
$ kubectl delete job test-job -n foo
```

> ↪️：
>
> - https://zenn.dev/kennygt51/articles/2497931b8264de
> - https://qiita.com/koudaiii/items/586a8a0e0f763ddf9a05
> - https://serverfault.com/questions/809632/is-it-possible-to-rerun-kubernetes-job

<br>

### Node

#### ▼ Nodeとは

Kubernetesリソースを配置するサーバーのこと。

#### ▼ ステータス

| フェーズ名 | 説明                                                      |
| ---------- | --------------------------------------------------------- |
| Ready      | NodeがPodをスケジューリング可能な状態であることを表す。   |
| NotReady   | NodeがPodをスケジューリング不可能な状態であることを表す。 |

<br>

### Pod

#### ▼ Podとは

コンテナの最小グループ単位のこと。

Podを単位として、コンテナ起動/停止や水平スケールアウト/スケールインを実行する。

> ↪️：https://kubernetes.io/docs/concepts/workloads/pods/

**＊例＊**

PHP-FPMコンテナとNginxコンテナを稼働させる場合、これら同じPod内に配置する。

![kubernetes_pod_php-fpm_nginx](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_pod_php-fpm_nginx.png)

#### ▼ 例外的なコントロールプレーンNode上のPod

脆弱性の観点で、デフォルトではコントロールプレーンNodeにPodはスケジューリングされない。

これは、コントロールプレーンNodeにはTaint (`node-role.kubernetes.io/master:NoSchedule`) が設定されているためである。

一方で、Nodeにはこれがないため、Podをスケジューリングできる。

```bash
# コントロールプレーンNodeの場合
$ kubectl describe node <コントロールプレーンNode名> | grep -i taint

Taints: node-role.kubernetes.io/master:NoSchedule # スケジューリングさせないTaint

# ワーカーNodeの場合
$ kubectl describe node <ワーカーNode名> | grep -i taint

Taints: <none>
```

> ↪️：https://stackoverflow.com/questions/43147941/allow-scheduling-of-pods-on-kubernetes-master

ただし、セルフマネージドなコントロールプレーンNodeを採用している場合に、全てのコントロールプレーンNodeでTaintを解除すれば、Podを起動させられる。

コントロールプレーンNodeがマネージドではない環境 (オンプレミス環境、ベアメタル環境、など) では、コントロールプレーンNodeにDaemonSetによるPodをスケジューリングすることがある。

```bash
$ kubectl taint node --all node-role.kubernetes.io/master:NoSchedule-
```

#### ▼ Podのライフサイクルフェーズ

Podは、マニフェストの`.status.phase`キーにライフサイクルのフェーズを持つ。

```yaml
status:
  phase: Running
```

| フェーズ名           | 説明                                                                                              | 補足                                                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Completed            | Pod内の全てのコンテナが正常に終了した。                                                           | Job配下のPodでよく見られるフェーズである。                                                                                                                                                                                                          |
| ContainerCreating    | Pod内にInitContainerがない場合の理由である。コンテナイメージをプルし、コンテナを作成している。    |                                                                                                                                                                                                                                                     |
| CrashLoopBackOff     | Podが、一連のフェーズ (`Running`フェーズ、`Waiting`フェーズ、`Failed`フェーズ) を繰り返している。 |                                                                                                                                                                                                                                                     |
| CreateContainerError | Pod内のコンテナの作成に失敗した。                                                                 |                                                                                                                                                                                                                                                     |
| ErrImagePull         | Pod内のコンテナイメージのプルに失敗した。                                                         |                                                                                                                                                                                                                                                     |
| Error                | Pod内のいずれかのコンテナが異常に終了した。                                                       | Job配下のPodの場合はErrorになっても、次のPodが作成される。Jobの`.spec.ttlSecondsAfterFinished`キーを設定していなければ、ErrorのPodがしばらく残り続けるが、もし新しいPodがCompletedになれば問題ない。                                                |
| Failed               | Pod内の全てのコンテナの起動が完了し、その後に異常に停止した。                                     |                                                                                                                                                                                                                                                     |
| ImagePullBackOff     | Pod内のコンテナイメージのプルに失敗した。                                                         |                                                                                                                                                                                                                                                     |
| OOMKilled            | Podのメモリの空きサイズが足らず、コンテナが強制的に終了された。                                   |                                                                                                                                                                                                                                                     |
| Pending              | PodがNodeにスケジューリングされたが、Pod内の全てのコンテナの起動がまだ完了していない。            |                                                                                                                                                                                                                                                     |
| PodInitializing      | Pod内にInitContainerがある場合の理由である。コンテナイメージをプルし、コンテナを作成している。    |                                                                                                                                                                                                                                                     |
| PostStartHookError   | PodのPostStartフックに失敗した。                                                                  |                                                                                                                                                                                                                                                     |
| Running              | Pod内の全てのコンテナの起動が完了し、実行中である。                                               | コンテナの起動が完了すれば`Running`フェーズになるが、コンテナ内でビルトインサーバーを起動するようなアプリケーション (例：フレームワークのビルトインサーバー機能) の場合は、`Running`フェーズであっても`Ready`コンディションではないことに注意する。 |
| Succeed              | Pod内の全てのコンテナの起動が完了し、その後に正常に停止した。                                     |                                                                                                                                                                                                                                                     |
| Unknown              | NodeとPodの間の通信に異常があり、NodeがPodから情報を取得できなかった。                            |                                                                                                                                                                                                                                                     |

> ↪️：
>
> - https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase
> - https://qiita.com/tkusumi/items/825ccde31fdc3d0b8425#%E4%BB%A3%E8%A1%A8%E7%9A%84%E3%81%AA-pod-%E3%81%AE%E3%82%B9%E3%83%86%E3%83%BC%E3%82%BF%E3%82%B9%E8%A1%A8%E8%A8%98

#### ▼ Podのコンディション

Podのライフサイクルのフェーズは、`.status.conditions`キーにフェーズの詳細を持つ。

```yaml
status:
  phase: Running
  conditions:
    - lastProbeTime: null
      lastTransitionTime: "2022-12-01T18:00:06Z"
      status: "True"
      type: Initialized
    - lastProbeTime: null
      lastTransitionTime: "2022-12-01T18:00:49Z"
      status: "True"
      type: Ready
    - lastProbeTime: null
      lastTransitionTime: "2022-12-01T18:00:49Z"
      status: "True"
      type: ContainersReady
    - lastProbeTime: null
      lastTransitionTime: "2022-12-01T18:00:02Z"
      status: "True"
      type: PodScheduled
```

例えば`Running`フェーズであっても、`Ready`コンディションになっていない可能性がある。

そのため、Podが正常であると見なすためには、『`Running`フェーズ』かつ『`Ready`コンディション』である必要がある。

| 各フェーズのコンディション名 | 説明                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| PodScheduled                 | NodeへのPodのスケジューリングが完了した。                                                            |
| ContainersReady              | 全てのコンテナの起動が完了し、加えてコンテナ内のアプリケーションやミドルウェアの準備が完了している。 |
| Initialized                  | 全ての`init`コンテナの起動が完了した。                                                               |
| Ready                        | Pod全体の準備が完了した。                                                                            |

> ↪️：
>
> - https://stackoverflow.com/a/59354112
> - https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-conditions

#### ▼ Podの最後のフェーズの理由

Podは、`.status.reason`キーに、最後のフェーズの理由を値として持つ。

```yaml
status:
  phase: Failed
  reason: Evicted
```

| 理由      | 説明                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------ |
| Completed | コンテナが正常に終了した。InitContainerの実行後に見られる。                                                        |
| Evicted   | Nodeのハードウェアリソース不足のため、Podが退避対象となった。`Evicted`が理由の場合、`Failed`フェーズが最後となる。 |
| Unknown   | 原因が不明である。                                                                                                 |

> ↪️：https://access.redhat.com/documentation/ja-jp/openshift_container_platform/3.11/html/developer_guide/diagnosing-evicted-pod

#### ▼ CrashLoopBackOffのデバッグ

PodがCrashLoopBackOffになっている場合、以下を確認すると良い。

- `kubectl logs`コマンドで、該当のコンテナのエラーログを確認する。
- `kubectl describe nodes`コマンドで、PodがスケジューリングされているNodeを指定し、該当のPodがCPUとメモリの要求量に異常がないかを確認する。
- `kubectl describe pods`コマンドで、該当のPodがCrashLoopBackOffになる原因を確認する。ContainersのLastStateの項目で、メッセージを確認できる。これは、`kubectl logs`コマンドと同じ内容である。

> ↪️：
>
> - https://sysdig.jp/blog/debug-kubernetes-crashloopbackoff/
> - https://newrelic.com/jp/blog/how-to-relic/monitoring-kubernetes-part-three

#### ▼ Podを安全に削除する方法

Podの削除プロセスが始まると、以下のプロセスも開始する。

- DeploymentがPodを切り離す。
- Serviceとkube-proxyがPodの宛先情報を削除する。
- コンテナを停止する。

これらのプロセスはそれぞれ独立して実施され、ユーザーは制御できない。

この時、コンテナが正常に終了する前にPodを削除してしまうと、コンテナでは強制的に終了として扱われてしまい、ログにエラーが出力されてしまう。

また、Serviceとkube-proxyがPodの宛先情報を削除する前に、Podが削除されてしまうと、ServiceからPodへのコネクションを途中で切断することになってしまう。

そのため、コンテナの正常な終了後にPodを削除できるように、`.spec.terminationGracePeriodSeconds`キーに任意の秒数を設定し、Podの削除プロセスの完了を待機する必要がある。

また、Serviceとkube-proxyの処理後にPodを削除できるように、ユーザーがPodの`.spec.containers[].lifecycle.preStop`キーに任意の秒数を設定し、コンテナに待機処理 (例：`sleep`コマンド) を実行させる必要がある。

これらの適切な秒数は、ユーザーがそのシステムに応じて調節するしかない。

`.spec.terminationGracePeriodSeconds`キーを長めに設定し、`.spec.containers[].lifecycle.preStop`キーの秒数も含めて、全てが完了した上でPodを削除できるようにする。

補足として、サービスメッシュツール (例：Istio、Linkerd) のサイドカーを持つPodを安全に削除する場合も、サイドカーコンテナが停止した上でPodを削除できるように、Podの削除プロセスの完了を待機する必要がある。

> ↪️：https://christina04.hatenablog.com/entry/k8s-graceful-stop-with-istio-proxy

![pod_terminating_process](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pod_terminating_process.png)

`【１】`

: クライアントは、`kubectl`コマンドがを使用して、Podを削除するリクエストをkube-apiserverに送信する。

`【２】`

: Podのマニフェストに`deletionTimestamp`キーが追加され、Podが`Terminating`フェーズとなり、削除プロセスを開始する。

`【３】`

: Podの`.spec.terminationGracePeriodSeconds`キーに応じて、Podの削除プロセス完了の待機時間を開始する。

`【４】`

: 最初にpreStopフックが起動し、`.spec.containers[].lifecycle.preStop`キーで設定した待機処理をコンテナが実行する。

`【５】`

: DeploymentがPodを切り離す。また、Serviceとkube-proxyがPodの宛先情報を削除する。

`【６】`

: `.spec.containers[].lifecycle.preStop`キーによるコンテナの待機処理が終了する。

`【７】`

: 待機処理が終了したため、kubeletは、コンテナランタイムを介して、Pod内のコンテナに`SIGTERM`シグナルを送信する。

     これにより、コンテナの停止処理が開始する。

`【８】`

: `.spec.terminationGracePeriodSeconds`キーによるPodの削除プロセス完了の待機時間が終了する。

     この段階でもコンテナが停止していない場合は、コンテナに```SIGKILL```シグナルが送信され、コンテナを強制的に終了することになる。

`【９】`

: Podが削除される。この段階でDeploymentや、Serviceとkube-proxyの処理が完了していない場合は、コネクションを途中で強制的に切断することになる。

> ↪️：
>
> - https://christina04.hatenablog.com/entry/kubernetes-pod-graceful-shutdown
> - https://qiita.com/superbrothers/items/3ac78daba3560ea406b2
> - https://zenn.dev/hhiroshell/articles/kubernetes-graceful-shutdown-experiment
> - https://44smkn.hatenadiary.com/entry/2018/08/01/022312

#### ▼ ハードウェアリソースの割り当て

そのPodに割り当てられたハードウェアリソース (CPU、メモリ) を、Pod内のコンテナが分け合って使用する。

| 単位            | 例                                 |
| --------------- | ---------------------------------- |
| `m`：millicores | `1`コア = `1000`ユニット = `1000`m |
| `Mi`：mebibyte  | `1`Mi = `1.04858`MB                |

> ↪️：https://qiita.com/jackchuka/items/b82c545a674975e62c04#cpu

#### ▼ クライアントがPod内のログを参照できる仕組み

`【１】`

: クライアント (特に`kubectl`コマンド実行者) が`kubectl logs`コマンドを実行する。

`【２】`

: kube-apiserverが、`/logs/pods/<ログへのパス>`エンドポイントにリクエストを送信する。

`【３】`

: kubeletはリクエストを受信し、Nodeの`/var/log`ディレクトリを読み込む。Nodeの`/var/log/pods/<Namespace名>_<Pod名>_<UID>/container/<数字>.log`ファイルは、Pod内のコンテナの`/var/lib/docker/container/<ID>/<ID>-json.log`ファイルへのシンボリックリンクになっているため、kubeletを介して、コンテナのログを確認できる。補足として、削除されたPodのログは、引き続き`/var/log/pods`ディレクトリ配下に保管されている。

![kubernetes_pod_logging](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_pod_logging.png)

> ↪️：https://www.creationline.com/lab/29281

補足として、DaemonSetとして稼働するFluentdは、Nodeの`/var/log`ディレクトリを読み込むことにより、Pod内のコンテナのログを収集する。

> ↪️：https://note.com/shift_tech/n/n503b32e5cd35

#### ▼ 待ち受けるポート番号の確認

Pod内のコンテナ内で`netstat`コマンドを実行することにより、コンテナが待ち受けているポート番号を確認できる。

```bash
$ kubectl exec foo-istiod -n istio-system -- netstat -tulpn

Active Internet connections (only servers)

Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 127.0.0.1:9876          0.0.0.0:*               LISTEN      1/pilot-discovery
tcp6       0      0 :::15017                :::*                    LISTEN      1/pilot-discovery
tcp6       0      0 :::8080                 :::*                    LISTEN      1/pilot-discovery
tcp6       0      0 :::15010                :::*                    LISTEN      1/pilot-discovery
tcp6       0      0 :::15012                :::*                    LISTEN      1/pilot-discovery
tcp6       0      0 :::15014                :::*                    LISTEN      1/pilot-discovery
```

<br>

### ReplicaSet

#### ▼ ReplicaSetとは

Node上のPod数を維持管理する。

Podの負荷に合わせてPodの自動水平スケーリングを実行しない (HorizontalPodAutoscalerが必要である) 。

DaemonSetとは異なり、Podを指定した個数に維持管理できる。

ReplicaSetを直接的に操作するのではなく、Deployment使用してこれを行うことが推奨される。

> ↪️：
>
> - https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/#replicaset%E3%82%92%E4%BD%BF%E3%81%86%E3%81%A8%E3%81%8D
> - https://thinkit.co.jp/article/13611

#### ▼ PodTemplate

Podの鋳型として動作する。

ReplicaSetは、PodTemplateを用いてPodのレプリカを作成する。

<br>

### StatefulSet

#### ▼ StatefulSetとは

ReplicaSetを操作し、Podの個数を維持管理する。

Podの負荷に合わせてPodを自動水平スケーリングを実行しない (HorizontalPodAutoscalerが必要である) 。

Deploymentとは異なり、ストレートフルなコンテナ (例：dbコンテナ) を含むPodを扱える。

Podが削除されてもPersistentVolumeClaimsは削除されないため、新しいPodにも同じPersistentVolumeを継続的にマウントできる。

その代わり、StatefulSetの作成後に一部の設定変更が禁止されている。

```bash
The StatefulSet "foo-pod" is invalid: spec: Forbidden: updates to statefulset spec for fields other than 'replicas', 'template', 'updateStrategy' and 'minReadySeconds' are forbidden
```

> ↪️：
>
> - https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#%E5%AE%89%E5%AE%9A%E3%81%97%E3%81%9F%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B8
> - https://sorarinu.dev/2021/08/kubernetes_01/

#### ▼ ライフサイクル

StatefulSetは、DeploymentやReplicaSetとは異なり、同時にPodを作成しない。

作成中のPodがReady状態になってから、次のPodを作成し始める。

そのためDeploymentやReplicaSetと比べて、全てのPodが揃うのに時間がかかる。

> ↪️：https://thinkit.co.jp/article/13611

<br>

## 03. ネットワーク系リソース

### ネットワーク系リソースとは

Cluster内のネットワークを制御する。

<br>

### EndpointSlice

#### ▼ EndpointSliceとは

各Service配下に存在する。Serviceでルーティング先のPodの宛先情報を分割して管理し、Podの増減に合わせて、Podの宛先情報を追加/削除する。

kube-proxyによるサービスディスカバリーのために、Podの宛先情報を提供する。

Kubernetesのv1.6より前はEndpointsが使用されていた。

しかし、EndpointsではPodの宛先情報を一括管理しなければならず、これを分割して管理できるように、Endpointsの代わりとしてEndpointSliceが導入された。

![kubernetes_endpoint-slices](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_endpoint-slices.png)

> ↪️：https://kubernetes.io/blog/2020/09/02/scaling-kubernetes-networking-with-endpointslices/#splitting-endpoints-up-with-the-endpointslice-api

<br>

### Ingress

#### ▼ Ingressとは

Ingressは、`L7`のインバウンド通信を受信する。

IngressコントローラーによってNode外からインバウンド通信を受信し、単一/複数のServiceにルーティングする。

Ingressを使用する場合、ルーティング先のIngressは、Cluster IP Serviceとする。

NodePort ServiceやLoadBalancer Serviceと同様に、外部からのインバウンド通信を受信する方法の1つである。

![kubernetes_ingress](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_ingress.png)

> ↪️：
>
> - https://kubernetes.io/docs/concepts/services-networking/ingress/#what-is-ingress
> - https://thinkit.co.jp/article/18263
> - https://chidakiyo.hatenablog.com/entry/2018/09/10/Kubernetes_NodePort_vs_LoadBalancer_vs_Ingress%3F_When_should_I_use_what%3F_%28Kubernetes_NodePort_%E3%81%A8_LoadBalancer_%E3%81%A8_Ingress_%E3%81%AE%E3%81%A9%E3%82%8C%E3%82%92%E4%BD%BF%E3%81%86
> - https://www.netone.co.jp/knowledge-center/netone-blog/20210715-01/

#### ▼ パスベースルーティング

パスの値に基づいて、Serviceにルーティングする。

![kubernetes_ingress_path](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_ingress_path.png)

> ↪️：https://kubernetes.io/docs/concepts/services-networking/ingress/#simple-fanout

#### ▼ ホストベースルーティング

`Host`ヘッダーの値に基づいて、Serviceにルーティングする。

本番環境では、ドメインを指定した各種ダッシュボードにアクセスできるようにする必要がある。

![kubernetes_ingress_host](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_ingress_host.png)

> ↪️：https://kubernetes.io/docs/concepts/services-networking/ingress/#name-based-virtual-hosting

<br>

### Service

#### ▼ Serviceとは

Serviceは、`L4`のインバウンド通信を受信する。

kube-proxyが更新したNode上で稼働するiptablesを使用し、またロードバランシングアルゴリズムによるルーティング先Podの決定に基づいて、Podにインバウンド通信をルーティングする。

マイクロサービスアーキテクチャのコンポーネントである『Service』とは区別する。

![kubernetes_kube-proxy_service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_kube-proxy_service.png)

> ↪️：
>
> - https://kubernetes.io/docs/concepts/services-networking/service/
> - https://www.mtioutput.com/entry/kube-proxy-iptable
> - https://www.amazon.co.jp/dp/B079TG2M5N/ (チャプター5)

#### ▼ ClusterIP Service

![kubernetes_clusterip-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_clusterip-service.png)

Serviceに対するインバウンド通信を、Cluster-IPを介してPodにルーティングする。

Cluster-IPはServiceの`.spec.clusterIP`キーで指定しない限りランダムで決まり、Podの`/etc/resolv.conf `ファイルに記載されている。

Pod内に複数のコンテナがある場合、各コンテナに同じ内容の`/etc/resolv.conf `ファイルが配置される。

```bash
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>] $ cat /etc/resolv.conf

nameserver *.*.*.* # ClusterネットワークのIPアドレス
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5 # 名前解決時のローカルドメインの優先度
```

Cluster-IPはNode外から宛先として指定できないため、インバウンド通信にIngressを必要とする。

```
パブリックネットワーク
⬇︎
Ingressコントローラー ⇄ Ingress
⬇︎
ClusterIP Service
⬇︎
Pod
```

Ingressが無いとClusterネットワーク内からのみしかアクセスできず、安全である。

一方でもしIngressを使用する場合、LoadBalancer Serviceと同様にして (レイヤーは異なるが) 、PodのIPアドレスを宛先とする`L7`ロードバランサー (例：AWS ALBとAWSターゲットグループ) を自動的にプロビジョニングする。

そのため、クラウドプロバイダーのリソースとKubernetesリソースの責務の境界が曖昧になってしまう。

> ↪️：
>
> - https://www.imagazine.co.jp/%e5%ae%9f%e8%b7%b5-kubernetes%e3%80%80%e3%80%80%ef%bd%9e%e3%82%b3%e3%83%b3%e3%83%86%e3%83%8a%e7%ae%a1%e7%90%86%e3%81%ae%e3%82%b9%e3%82%bf%e3%83%b3%e3%83%80%e3%83%bc%e3%83%89%e3%83%84%e3%83%bc%e3%83%ab/
> - https://thinkit.co.jp/article/18263
> - https://qiita.com/tkusumi/items/da474798c5c9be88d9c5#%E8%83%8C%E6%99%AF

ただし、クラウドプロバイダーによっては`L7`ロードバランサーとClusterIP Serviceを仲介するカスタムリソースを提供している場合がある (AWSのTargetGroupBindings) 。

これを使用すれば、ClusterIP Serviceでも、クラウドプロバイダーのリソースとKubernetesの境界を明確化できる。

> ↪️：https://qiita.com/k-sasaki-hisys-biz/items/895cd2e3dd9baff45bd8

#### ▼ NodePort Service

![kubernetes_nodeport-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_nodeport-service.png)

Serviceに対するインバウンド通信を、NodeのNICの宛先情報 (IPアドレス、ポート番号) 、Cluster-IP、を介してPodにルーティングする。

NodeのNICの宛先情報は、Node外から宛先IPアドレスとして指定できるため、インバウンド通信にIngressを必要としない。

```
パブリックネットワーク
⬇︎
NodePort Service
⬇︎
Pod
```

パブリックプロバイダーのLB (例：AWS ALB) を別に置いても良い (このLBは、Ingressコントローラー由来ではない) 。

```
パブリックネットワーク
⬇︎
AWS Route53
⬇︎
AWS ALB
⬇︎
NodePort Service
⬇︎
Pod
```

ただし、NodePort Serviceは内部的にCluster-IPを使っている。

そのため、Ingressを作成するとNodePort ServiceのCluster-IPを介してPodにルーティングする。

この場合、NodeのIPアドレスとIngressの両方がNodeのインバウンド通信の入り口となり、入口が無闇に増えるため、やめた方が良い。

```
パブリックネットワーク
⬇︎
Ingressコントローラー ⇄ Ingress
⬇︎
ClusterIP Service (実体はNodePort Service)
⬇︎
Pod
```

NodeのNICの宛先情報は、Nodeの作成方法 (AWS EC2、GCP GCE、VMWare) に応じて、確認方法が異なる。

Serviceのポート番号と紐づくNodeのNICのポート番号はデフォルトではランダムであるため、NodeのNICのポート番号を固定する必要がある。

この時、`1`個のNodeのポート番号につき、`1`個のServiceとしか紐付けられず、Serviceが増えていってしまうため、実際の運用にやや不向きである。

一方でクラウドプロバイダーのリソースとKubernetesの境界を明確化できる。

> ↪️：https://stackoverflow.com/a/64605782

#### ▼ LoadBalancer Service

![kubernetes_loadbalancer-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_loadbalancer-service.png)

Serviceに対するインバウンド通信を、External-IP、NodeのNICの宛先情報、Cluster-IP、を介してPodにルーティングする。

External-IPはNode外から宛先IPアドレスとして指定できるため、インバウンド通信にIngressを必要としないが、外部のロードバランサーのみが宛先IPアドレスを指定できる。

```
パブリックネットワーク
⬇︎
AWS Route53
⬇︎
AWS ALB
⬇︎
LoadBalancer Service
⬇︎
Pod
```

クラウドプロバイダー環境 (例：AWS) では、LoadBalancer Serviceを作成すると、External-IPを宛先とする`L4`ロードバランサー (例：AWS NLBとAWSターゲットグループ) を自動的にプロビジョニングするため、クラウドプロバイダーのリソースとKubernetesリソースの責務の境界が曖昧になってしまう。

> ↪️：
>
> - https://www.imagazine.co.jp/%e5%ae%9f%e8%b7%b5-kubernetes%e3%80%80%e3%80%80%ef%bd%9e%e3%82%b3%e3%83%b3%e3%83%86%e3%83%8a%e7%ae%a1%e7%90%86%e3%81%ae%e3%82%b9%e3%82%bf%e3%83%b3%e3%83%80%e3%83%bc%e3%83%89%e3%83%84%e3%83%bc%e3%83%ab/
> - https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0
> - https://thinkit.co.jp/article/18263

#### ▼ ExternalName Service

Serviceに対するインバウンド通信をCNAMEレコードを介してPodにルーティングする。

> ↪️：https://thinkit.co.jp/article/13739

#### ▼ Headless Service

Serviceに対するインバウンド通信を、そのままPodにルーティングする。

Podが複数ある場合は、ラウンドロビン方式でIPアドレスが返却されるため、負荷の高いPodにルーティングされる可能性があり、負荷分散には向いていない。

```bash
$ dig <Serviceの完全修飾ドメイン名>

;; QUESTION SECTION:
;<Serviceの完全修飾ドメイン名>. IN   A

;; ANSWER SECTION:
<Serviceの完全修飾ドメイン名>. 30 IN A       10.8.0.30
<Serviceの完全修飾ドメイン名>. 30 IN A       10.8.1.34
<Serviceの完全修飾ドメイン名>. 30 IN A       10.8.2.55
```

> ↪️：
>
> - https://thinkit.co.jp/article/13739
> - https://hyoublog.com/2020/05/22/kubernetes-headless-service/

また、Headless ServiceからStatefulSetにルーティングする場合は、唯一、Podで直接的に名前解決できるようになる。

```bash
$ dig <Pod名>.<Serviceの完全修飾ドメイン名>

;; QUESTION SECTION:
;<Pod名>.<Serviceの完全修飾ドメイン名>. IN A

;; ANSWER SECTION:
<Pod名>.<Serviceの完全修飾ドメイン名>. 30 IN A 10.8.0.30
```

> ↪️：https://thinkit.co.jp/article/13739

<br>

## 04. Clusterリソース

### Clusterリソースとは

Cluster全体に渡る機能を提供する。

> ↪️：https://thinkit.co.jp/article/13542

<br>

### Namespace

#### ▼ Namespaceとは

各Kubernetesリソースの影響範囲を制御するための領域のこと。

Namespaceが異なれば、`.metadata`キーに同じ値 (例：同じ名前、など) を設定できる。

#### ▼ 初期Namespace

| 名前              | 説明                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `default`         | 任意のKubernetesリソースを配置する。                                                                          |
| `kube-node-lease` | Kubernetesリソースのうちで、特にLeaseを配置する。                                                             |
| `kube-public`     | 全てのクライアント (`kubectl`クライアント、Kubernetesリソース) に公開しても良いKubernetesリソースを配置する。 |
| `kube-system`     | Kubernetesが自動的に作成したKubernetesリソースを配置する。ユーザーが設定する必要はない。                      |

> ↪️：https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/#initial-namespaces

<br>

## 05. 設定系リソース

### 設定系リソースとは

コンテナで使用する変数、ファイル、ボリュームに関する機能を提供する。

<br>

### ConfigMap

#### ▼ ConfigMapとは

コンテナで使用する機密ではない変数やファイルをマップ型で保持できる。

改行することにより、設定ファイルも値に格納できる。

#### ▼ 機密ではない変数の例

| 変数               | 何のために使用するのか                                       |
| ------------------ | ------------------------------------------------------------ |
| DBホスト名         | コンテナがDBに接続する時に、DBのホスト名として使用する。     |
| DBポート番号       | コンテナがDBに接続する時に、DBのポート番号として使用する。   |
| DB接続タイムアウト | コンテナがDBに接続する時に、タイムアウト時間として使用する。 |
| DB接続再試行数     | コンテナがDBに接続する時に、再試行の回数として使用する。     |
| タイムゾーン       | コンテナ内のタイムゾーンとして使用する。                     |
| ...                | ...                                                          |

<br>

### Secret

#### ▼ Secretとは

コンテナで使用する機密な変数やファイルをキーバリュー型で永続化する。

永続化されている間は`base64`方式でエンコードされており、デコードした上で、変数やファイルとして対象のPodに出力する。

> ↪️：https://kubernetes.io/docs/concepts/configuration/secret/#uses-for-secrets

#### ▼ 機密ではない変数の例

| 変数         | 何のために使用するのか                                             |
| ------------ | ------------------------------------------------------------------ |
| DBユーザー名 | コンテナがDBに接続する時に、DBユーザーのユーザー名として使用する。 |
| DBパスワード | コンテナがDBに接続する時に、DBユーザーのパスワードとして使用する。 |
| ...          | ...                                                                |

#### ▼ コンテナイメージプルのパラメーターとして

Podの起動時に、kubectlコマンドが実行され、コンテナイメージをプルする。

Secretに永続化された値を復号化し、`kubectl`コマンドにパラメーターとして出力できる。

> ↪️：https://kubernetes.io/docs/concepts/configuration/secret/#using-imagepullsecrets

#### ▼ コンテナの環境変数として

永続化された値を復号化し、Pod内のコンテナに環境変数として出力できる。

> ↪️：https://kubernetes.io/docs/concepts/configuration/secret/#using-secrets-as-environment-variables

<br>

## 06. ストレージ系リソース

### ストレージ系リソースの種類

Kubernetesで作成できるストレージは、作成場所で種類を分けられる。

![kubernetes_storage_resource_types.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_storage_resource_types.png)

| ストレージの種類 | Volume         | PersistentVolume |
| ---------------- | -------------- | ---------------- |
| Pod内ストレージ  | EmptyDir       | なし             |
| Node内ストレージ | HostPath       | HostPath、Local  |
| Node外ストレージ | 外部ストレージ | 外部ストレージ   |

> ↪️：https://www.netone.co.jp/knowledge-center/netone-blog/20191206-1/

<br>

### PersistentVolume

#### ▼ PersistentVolumeとは

![storage_class.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/storage_class.png)

Node上のストレージ上にVolumeを作成する。

Node上のPod間でVolumeを共有でき、同一Pod内のコンテナ間でもVolumeを共有できる。

PodがPersistentVolumeを使用するためには、PersistentVolumeClaimにPersistentVolumeを要求させておき、PodでこのPersistentVolumeClaimを指定する必要がある。

アプリケーションのディレクトリ名を変更した場合は、PersistentVolumeを再作成しないと、アプリケーション内のディレクトリの読み出しでパスを解決できない場合がある。

DockerのVolumeとは独立した機能であることに注意する。

> ↪️：
>
> - https://thinkit.co.jp/article/14195
> - https://stackoverflow.com/questions/62312227/docker-volume-and-kubernetes-volume
> - https://stackoverflow.com/questions/53062547/docker-volume-vs-kubernetes-persistent-volume
> - https://www.netone.co.jp/knowledge-center/netone-blog/20191206-1/

#### ▼ PersistentVolumeの使用率の確認方法 (CrashLoopBackOffでない場合)

Pod内で`df`コマンドを実行することにより、PersistentVolumeの使用率を確認できる。

出力結果で、ファイルシステム全体の使用率を確認する。

```bash
$ kubectl exec -n prometheus foo-pod -- df -hT
```

ただし、CrashLoopBackOffなどが理由で、コンテナがそもそも起動しない場合、この方法で確認できない。

> ↪️：https://stackoverflow.com/questions/53200828/how-to-identify-the-storage-space-left-in-a-persistent-volume-claim

また、Grafanaのkubernetes-mixinsには、起動中のPodのPersistentVolumeの使用率を可視化できるダッシュボードがある。

> ↪️：https://github.com/monitoring-mixins/website/blob/master/assets/kubernetes/dashboards/persistentvolumesusage.json

#### ▼ PersistentVolumeの使用率の確認方法 (CrashLoopBackOffの場合)

ここでは、Prometheusを例に挙げる。

`【１】`

: PrometheusのPodに紐づくPersistentVolumeは、最大200Giを要求していることがわかる。

```bash
$ kubectl get pvc foo-prometheus-pvc -n prometheus
NAME                 STATUS   VOLUME      CAPACITY   ACCESS MODES   STORAGECLASS    AGE
foo-prometheus-pvc   Bound    pvc-*****   200Gi      RWO            gp3-encrypted   181d
```

`【２】`

: Node内 (AWS EKSのEC2ワーカーNodeの場合) で、Podに紐づくPersistentVolumeがマウントされているディレクトリを確認する。

```bash
$ ls -la /var/lib/kubelet/plugins/kubernetes.io/aws-ebs/mounts/aws/<リージョン>/vol-*****/prometheus-db/

-rw-r--r--  1 ec2-user 2000         0 Jun 24 17:07 00004931
-rw-r--r--  1 ec2-user 2000         0 Jun 24 17:09 00004932
-rw-r--r--  1 ec2-user 2000         0 Jun 24 17:12 00004933

...

drwxrwsr-x  2 ec2-user 2000      4096 Jun 20 18:00 checkpoint.00002873.tmp
drwxrwsr-x  2 ec2-user 2000      4096 Jun 21 02:00 checkpoint.00002898
drwxrwsr-x  2 ec2-user 2000      4096 Jun 21 04:00 checkpoint.00002911.tmp
```

`【３】`

: `df`コマンドで、ストレージの使用率を確認する。Nodeにマウントされているデータサイズを確認すると、197Gとなっている。 PersistentVolumeに対してデータサイズが大きすぎることがわかる。

```bash
$ df -h /var/lib/kubelet/plugins/kubernetes.io/aws-ebs/mounts/aws/ap-northeast-1a/vol-*****/prometheus-db/

Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme8n1    197G  197G     0 100% /var/lib/kubelet/plugins/kubernetes.io/aws-ebs/mounts/aws/ap-northeast-1a/vol-*****
```

#### ▼ HostPath (本番環境で非推奨)

Nodeのストレージ上にVolumeを作成し、これをコンテナにバインドマウントする。

機能としては、Volumeの一種であるHostPathと同じである。

マルチNodeには対応していないため、本番環境では非推奨である。

> ↪️：
>
> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes
> - https://thenewstack.io/10-kubernetes-best-practices-you-can-easily-apply-to-your-clusters/

#### ▼ Local (本番環境で推奨)

Node上にVolumeを作成し、これをコンテナにバインドマウントする。

マルチNodeに対応している (明言されているわけではく、HostPathとの明確な違いがよくわからない) 。

> ↪️：
>
> - https://kubernetes.io/docs/concepts/storage/volumes/#local
> - https://qiita.com/sotoiwa/items/09d2f43a35025e7be782#local

#### ▼ 外部サービスのVolume

外部サービス (例：AWS EBS、NFS、など) が提供するVolumeをコンテナにマウントする。

StorageClassとPersistentVolumeClaimを介して、PersistentVolumeと外部サービスを紐付け、Volumeとしてコンテナにマウントする。

また、外部ストレージを使用する場合には、CSIドライバーも必要である。

![storage_class.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/storage_class.png)

<br>

### Volume

#### ▼ Volumeとは

![storage_class.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/storage_class.png)

既存 (例：NFS、iSCSI、Ceph、など) のボリュームをそのままKubernetesのVolumeとして使用する。

Podの`.spec.volumes`キーで指定する。

> ↪️：https://thinkit.co.jp/article/14195

Dockerのボリュームとは独立した機能であることに注意する。

```bash
# Podに接続する
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

# ストレージを表示する
[root@<Pod名>:/var/www/html] $ df -h

Filesystem      Size  Used Avail Use% Mounted on
overlay          59G   36G   20G  65% /
tmpfs            64M     0   64M   0% /dev
tmpfs           3.9G     0  3.9G   0% /sys/fs/cgroup
/dev/vda1        59G   36G   20G  65% /etc/hosts
shm              64M     0   64M   0% /dev/shm
overlay          59G   36G   20G  65% /var/www/foo # 作成したボリューム
tmpfs           7.8G   12K  7.8G   1% /run/secrets/kubernetes.io/serviceaccount
tmpfs           3.9G     0  3.9G   0% /proc/acpi
tmpfs           3.9G     0  3.9G   0% /sys/firmware
```

Podが持つVolumeの一覧は、`kubectl describe`コマンドで確認できる。

```bash
$ kubectl describe pod

...

Volumes:
  foo-volume:
    Type:       EmptyDir (a temporary directory that shares a pod's lifetime)
    Medium:
    SizeLimit:  <unset>
  bar-volume:
    Type:       EmptyDir (a temporary directory that shares a pod's lifetime)
    Medium:
    SizeLimit:  <unset>
  baz-volume:
    Type:      ConfigMap (a volume populated by a ConfigMap)
    Name:      baz-cm
    Optional:  false
```

> ↪️：
>
> - https://stackoverflow.com/questions/62312227/docker-volume-and-kubernetes-volume
> - https://stackoverflow.com/questions/53062547/docker-volume-vs-kubernetes-persistent-volume

#### ▼ HostPath (本番環境で非推奨)

Node上の既存のストレージ上にVolumeを作成し、コンテナにバインドマウントする。

バインドマウントはNodeとPod内のコンテナ間で実行され、同一Node上のPod間でこのVolumeを共有でき、同一Pod内のコンテナ間でもVolumeを共有できる。

また、Podが削除されてもこのVolumeは削除されない。

HostPathは非推奨である。

```bash
# Node内でdockerコマンドを実行
$ docker inspect <コンテナID>

    {

        ...

        "HostConfig": {
            "Binds": [
                "/data:/var/www/foo",
                "/var/lib/kubelet/pods/*****/volumes/kubernetes.io~projected/kube-api-access-*****:/var/run/secrets/kubernetes.io/serviceaccount:ro",
                "/var/lib/kubelet/pods/*****/etc-hosts:/etc/hosts",
                "/var/lib/kubelet/pods/*****/containers/foo/*****:/dev/termination-log"
            ],

            ...
        },

        ...

        "Mounts": [

            ...

            {
                "Type": "bind", # バインドマウントが使用されている。
                "Source": "/data",
                "Destination": "/var/www/foo",
                "Mode": "",
                "RW": true,
                "Propagation": "rprivate"
            },

            ...
        ]
    }
```

> ↪️：
>
> - https://thenewstack.io/10-kubernetes-best-practices-you-can-easily-apply-to-your-clusters/
> - https://qiita.com/umkyungil/items/218be95f7a1f8d881415

#### ▼ EmptyDir

Podの既存のストレージ上にVolumeを作成し、コンテナにボリュームマウントする。

同一Node上のPod間でこのVolumeを共有できず、同一Pod内のコンテナ間ではVolumeを共有できる。

また、Podが削除されるとこのVolumeも同時に削除されてしまう。

> ↪️：
>
> - https://qiita.com/umkyungil/items/218be95f7a1f8d881415
> - https://cstoku.dev/posts/2018/k8sdojo-05/

#### ▼ 外部サービスのVolume

外部サービス (例：AWS EBS、NFS、など) が提供するVolumeをコンテナにマウントする。

同一Node上のPod間でこのVolumeを共有でき、同一Pod内のコンテナ間でもVolumeを共有できる。

また、Podが削除されてもこのVolumeは削除されない。

> ↪️：
>
> - https://kubernetes.io/docs/concepts/storage/volumes/
> - https://zenn.dev/suiudou/articles/31ab107f3c2de6#%E2%96%A0kubernetes%E3%81%AE%E3%81%84%E3%82%8D%E3%82%93%E3%81%AA%E3%83%9C%E3%83%AA%E3%83%A5%E3%83%BC%E3%83%A0

#### ▼ Volumeの代わりにPersistentVolumeを使用する

Podの`.spec.volumes`キーでPersistentVolumeClaimを宣言すれば、Volumeの代わりにPersistentVolumeを使用できる。

<br>

## 06-02. ストレージ要求系

### PersistentVolumeClaim

#### ▼ PersistentVolumeClaimとは

設定された条件に基づいて、Kubernetesで作成済みのPersistentVolumeを要求し、指定したKubernetesリソースに割り当てる。

![storage_class.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/storage_class.png)

> ↪️：https://garafu.blogspot.com/2019/07/k8s-pv-and-pvc.html

#### ▼ 削除できない

PersistentVolumeClaimを削除しようとすると、`.metadata.finalizers`キー配下に`kubernetes.io/pvc-protection`値が設定され、削除できなくなることがある。

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  finalizers:
    - kubernetes.io/pvc-protection
  name: foo-persistent-volume-claim
spec: ...
```

この場合、`kubectl edit`コマンドなどで`.metadata.finalizers`キーを空配列に編集と、削除できるようになる。

```bash
$ kubectl edit pvc <PersistentVolumeClaim名>
```

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  finalizers: []
  name: foo-persistent-volume-claim
spec: ...
```

> ↪️：https://qiita.com/dss_hashimoto/items/8cbf834c504e57fbe1ff

#### ▼ node affinity conflict

PersistentVolumeClaimは、`annotation`キー配下の`volume.kubernetes.io/selected-node`キーで、紐づくPersistentVolumeが配置されているNode名を指定している。

PersistentVolumeClaimは、条件に応じてPersistentVolumeを探す。

しかし、PersistentVolumeClaimが `volume.kubernetes.io/selected-node` キーで指定するNodeと、PodがスケジューリングされているNodeが異なるAZであると、以下のエラーになってしまう。

```bash
N node(s) had volume node affinity conflict, N node(s) didn't match Pod's node affinity/selector
```

これが起こる原因は様々ある (例：Nodeの再作成時にPodのあるNodeのAZが変わる、AWSのスポットインスタンスで特定のAZにしかNodeが作成されない)。

**＊解決例＊**

ここでは、Nodeの再作成でPodのあるNodeのAZが変わった場合の解決策を記載する。

AWSのスポットインスタンスで特定のAZにしかNodeが作成されない問題では対処できない。

例えば、もともと`a`ゾーンにいるPodがNodeの再作成で再スケジューリングされ、`c`ゾーンになったとする。

しかし、Podに紐づくPersistentVolumeClaimは元々の`a`ゾーンのNodeのPersistentVolumeを指定したままになっており、`c`ゾーンのPodは`a`ゾーンのPersistentVolumeを指定できないため、`volume node affinity conflict`になる。

以下の手順で、PersistentVolumeClaimとこれを指定するPodの両方を再作成し、PersistentVolumeClaimはPodと同じゾーンのPersistentVolumeを指定できるようにする。

注意点として、何らかの理由 (例：スポットインスタンス) で、特定のAZにNodeを配置できない場合、この手順では解決できない。

`【１】`

: 起動できないPodをいずれのNodeでスケジューリングしようとしているのか確認する。

```bash
$ kubectl describe pod <Pod名> -o wide | grep Node:
```

`【２】`

: Nodeのあるゾーンを確認する。

```bash
$ kubectl describe node <PodのあるNode名> | grep topology.kubernetes.io
```

`【３】`

: PersistentVolumeClaimの`volume.kubernetes.io/selected-node`キーで、PodがいずれのNodeのPersistentVolumeを指定しているかを確認する。

     このNode名をメモしておく。

```bash
$ kubectl describe pvc <PVC名> -n prometheus | grep selected-node
```

`【４】`

: Nodeのあるゾーンを確認する。

```bash
$ kubectl describe node ip-*-*-*-*.ap-northeast-1.compute.internal | grep zone
```

`【５】`

: 【１】と【４】の手順で確認したNodeのゾーンが異なるゾーンであることを確認する。

`【６】`

: PersistentVolumeClaimを削除する。

     この時PersistentVolumeは削除されないため、保管データは削除されない。

`【７】`

: StatefulSet自体を再作成する。

`【８】`

: StatefulSetがPersistentVolumeClaimを新しく作成する。

`【９】`

: PersistentVolumeClaimが、Podと同じゾーンのPersistentVolumeを指定できるようになる。

> ↪️：
>
> - https://github.com/kubernetes/kubernetes/issues/74374#issuecomment-466191847
> - https://stackoverflow.com/questions/51946393/kubernetes-pod-warning-1-nodes-had-volume-node-affinity-conflict

<br>

### StorageClass

#### ▼ StorageClassとは

Kubernetes外部でプロビジョニングされたストレージ (例：AWS EBS、Azure Disk、など) を要求し、これのVolumeをPersistentVolumeClaimに提供する。

そのため、PersistentVolumeも合わせて作成する必要がある。

![storage_class.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/storage_class.png)

> ↪️：
>
> - https://kubernetes.io/docs/concepts/storage/dynamic-provisioning/#using-dynamic-provisioning
> - https://www.netone.co.jp/knowledge-center/netone-blog/20191206-1/

<br>

<br>

## 07. 認証系リソース

### CertificateSigningRequest

#### ▼ CertificateSigningRequestとは

認証局に対するSSL証明書の要求 (`openssl x509`コマンド) を宣言的に設定する。

別途、秘密鍵から証明書署名要求を作成し、これをパラメーターとして設定する必要がある。

> ↪️：https://qiita.com/knqyf263/items/aefb0ff139cfb6519e27

<br>

### ServiceAccount

#### ▼ ServiceAccountとは

![kubernetes_authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_authorization.png)

kube-apiserverが、リクエストの送信元を認証できるようにする。

kube-apiserverが、Kubernetesリソース (特にPod) を認証できるようにする。

別途、RoleBindingやClusterRoleBindingを使用してKubernetesリソースに認可スコープを設定する必要がある。

標準のKubernetesリソースには自動的にServiceAccountが設定される。

> ↪️：
>
> - https://kubernetes.io/docs/reference/access-authn-authz/authentication/
> - https://tech-blog.cloud-config.jp/2021-12-04-kubernetes-authentication/
> - https://support.huaweicloud.com/intl/en-us/usermanual-cce/cce_01_0189.html

#### ▼ ServiceAccountの仕組み

ServiceAccountは、ServiceAccount本体、service-account-controller、token-controller、service-account-admission-controller、といったコンポーネントから構成されている。

| コンポーネント                       |                                                                                                                                                                                                                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| service-account-controller           | Namespace内に`default`というServiceAccountを自動的に作成する。                                                                                                                                                                                                       |
| token-controller                     | ServiceAccount用のSecretの作成をポーリングし、Secretにトークン文字列を追加する。一方で、Secretの削除をポーリングし、ServiceAccountからSecretの指定を削除する。また、ServiceAccountの削除をポーリングし、token-controllerはSecretのトークン文字列を自動的に削除する。 |
| service-account-admission-controller | AdmissionWebhookの仕組みの中で、Podの作成時に、Volume上の`/var/run/secrets/kubernetes.io/serviceaccount`ディレクトリをコンテナにマウントする。トークンの文字列は、`/var/run/secrets/kubernetes.io/serviceaccount/token`ファイルに記載されている。                    |

> ↪️：https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/#control-plane-details

#### ▼ ServiceAccountのユーザー名

特にServiceAccountには、より正確な定義のユーザー名がある。

ユーザー名は、`system:serviceaccount:＜Namespace名＞:＜ServiceAccount名＞`で定義されている。

これは、RoleBindingやClusterBindingの定義時に使用できる。

> ↪️：
>
> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#referring-to-subjects
> - https://knowledge.sakura.ad.jp/21129/

<br>

### UserAccount

#### ▼ UserAccountとは

![kubernetes_authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_authorization.png)

kube-apiserverが、リクエストの送信元を認証できるようにする。

kube-apiserverが、クライアントを認証できるようにする。別途、RoleBindingやClusterRoleBindingを使用して、クライアントに認可スコープを設定する必要がある。

クライアントの認証に必要なクライアント証明書は、`~/.kube/config`ファイルに登録する必要がある。

> ↪️：
>
> - https://kubernetes.io/docs/reference/access-authn-authz/authentication/
> - https://tech-blog.cloud-config.jp/2021-12-04-kubernetes-authentication/
> - https://support.huaweicloud.com/intl/en-us/usermanual-cce/cce_01_0189.html

## 08. 認可系リソース

### Role、ClusterRole

#### ▼ Role、ClusterRoleとは

![kubernetes_authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_authorization.png)

kube-apiserverが、認証済みのKubernetesリソースからのリクエストを認可できるように、認可スコープを設定する。

| ロール名    | 説明                                                                                 | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Role        | Cluster内の特定のNamespaceに属するKubernetesリソースに関する認可スコープを設定する。 | RoleとRoleBindingは同じNamespaceに属する必要がある。                                                                                                                                                                                                                                                                                                                                                                                             |
| ClusterRole | Cluster内の全てのKubernesリソースに対する認可スコープを設定する。                    | ClusterRoleとClusterRoleBindingは同じNamespaceに属する必要がある。GitOpsを採用する場合、GitOpsツールはKubernetesリソースとして存在している。この時、kube-apiserverがGitOpsからのリクエストを認可できるように、GitOpsツールのServiceAccountにClusterRoleを紐付ける必要がある。このClusterRoleには、全Kubernetesリソースへの全操作を許可する認可スコープを付与する。<br>↪️：https://dev.classmethod.jp/articles/argocd-for-external-cluster/#toc-6 |

> ↪️：
>
> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole
> - https://support.huaweicloud.com/intl/en-us/usermanual-cce/cce_01_0189.html

#### ▼ RBAC：Role-based access control

Role、ClusterRole、を使用して認可スコープを制御する仕組みのこと。

> ↪️：https://kubernetes.io/docs/reference/access-authn-authz/rbac/

<br>

### RoleBinding、ClusterRoleBinding

#### ▼ RoleBinding、ClusterRoleBindingとは

RoleやClusterRoleを、UserAccountやServiceAccountに紐付ける。

| バインディング名   | 説明                             | 補足                                                               |
| ------------------ | -------------------------------- | ------------------------------------------------------------------ |
| RoleBinding        | RoleをAccountに紐付ける。        | RoleとRoleBindingは同じNamespaceに属する必要がある。               |
| ClusterRoleBinding | ClusterRoleをAccountに紐付ける。 | ClusterRoleとClusterRoleBindingは同じNamespaceに属する必要がある。 |

> ↪️：
>
> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding
> - https://support.huaweicloud.com/intl/en-us/usermanual-cce/cce_01_0189.html

<br>

## 09. ポリシー系リソース

### NetworkPolicy

#### ▼ NetworkPolicyとは

Pod間通信でのインバウンド/アウトバウンド通信の送受信ルールを設定する。

> ↪️：
>
> - https://www.amazon.co.jp/dp/B08FZX8PYW
> - https://qiita.com/dingtianhongjie/items/983417de88db2553f0c2

#### ▼ Ingressの場合

他のPodからの受信するインバウンド通信のルールを設定する。

Ingressとは関係がないことに注意する。

#### ▼ Egressの場合

他のPodに送信するアウトバウンド通信のルールを設定する。

<br>
