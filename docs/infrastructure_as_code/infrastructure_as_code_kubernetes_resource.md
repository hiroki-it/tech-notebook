---
title: 【IT技術の知見】Kubernetesリソース＠Kubernetes
description: Kubernetesリソース＠Kubernetesの知見を記録しています。
---

# Kubernetesリソース＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Kubernetesリソースとオブジェクト

### Kubernetesリソース

Kubernetes上でアプリケーションを稼働させる概念のこと。

![kubernetes_workload-resource](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_workload-resource.png)

> - https://developers.redhat.com/articles/2023/04/05/kubernetes-patterns-path-cloud-native#discussion

<br>

### Kubernetesオブジェクト

マニフェストによって量産されたKubernetesリソースのインスタンスのこと。

> - https://qiita.com/cvusk/items/773e222e0971a5391a51

<br>

### スコープ

所属するNamespace内のみにリクエストを送信できるNamespacedスコープなKubernetesリソースと、Cluster全体にリクエストを送信できるClusterスコープなKubernetesリソースがある。

![namespaced-scope_vs_cluster-scoped](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/namespaced-scope_vs_cluster-scoped.png)

> - https://wangwei1237.github.io/Kubernetes-in-Action-Second-Edition/docs/Organizing_objects_into_Namespaces.html

<br>

## 02. Workload系リソース

### Workload系リソースとは

コンテナの実行に関する機能を提供する。

> - https://thinkit.co.jp/article/13542

<br>

### DaemonSet

#### ▼ DaemonSetとは

Node上のPodの個数を維持管理する。

Podの負荷に合わせてPodの自動水平スケーリングを実行しない (HorizontalPodAutoscalerが必要である) 。

ただしReplicaSetとは異なり、Node内でPodを1つだけ維持管理する。

Nodeで1つだけ稼働させる必要のあるプロセス (例：kube-proxy、CNI、FluentBit、datadogエージェント、cAdvisorエージェント、Prometheusの一部のExporterなど) のために使用される。

こういったプロセスが稼働するコンテナは、Node内の全てのコンテナからデータを収集し、可観測性のためのデータセットを整備する。

> - https://thinkit.co.jp/article/13611
> - https://github.com/kubernetes/kops/issues/6527#issue-413870064

#### ▼ Pod数の固定

DaemonSetは、Node内でPodを1つだけ維持管理する。

そのため、例えばClusterネットワーク内に複数のNodeが存在していて、いずれかのNodeが停止したとしても、稼働中のNode内のPodを増やすことはない。

#### ▼ DaemonSet配下のPodへの通信

- NodePort Service
- ClusterIP Service
- PodでのhostPort
- など...

> - https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/#communicating-with-daemon-pods

<br>

### Deployment

#### ▼ Deploymentとは

ReplicaSetを操作し、Clusterネットワーク内のPodのレプリカ数を維持管理する。

Podの負荷に合わせてPodの自動水平スケーリングを実行しない (HorizontalPodAutoscalerが必要である) 。

ただしStatefulSetとは異なり、ストレートレス (例：アプリコンテナ) なコンテナを含むPodを冗長化することに適する。

> - https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
> - https://sorarinu.dev/2021/08/kubernetes_01/

#### ▼ ReplicaSetの置き換えが起こる条件

Deploymentでは、以下の設定値の変更で、ReplicaSetの置き換えが起こる。

| 条件                                 | 説明                                                                                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `.spec.replicas`キーの変更           | レプリカ数 (`.spec.replicas`キー) の変更の場合は、Deploymentは既存のReplicaSetをそのままにし、Podのレプリカ数のみを変更する。 |
| `.spec.template`キー配下の任意の変更 | PodTemplate (`.spec.template`キー) を変更した場合、Deploymentは新しいReplicaSetを作成し、これを古いReplicaSetと置き換える。   |

![kubernetes_deployment_replace_replicaset](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_deployment_replace_replicaset.png)

> - https://qiita.com/tkusumi/items/01cd18c59b742eebdc6a

#### ▼ Podのレプリカ数の維持

Deploymentは、Cluster内のPodのレプリカ数を指定された数だけ維持する。

そのため、例えばCluster内に複数のNodeが存在していて、いずれかのNodeが停止した場合、稼働中のNode内でレプリカ数を維持するようにPod数を増やす。

> - https://dr-asa.hatenablog.com/entry/2018/04/02/174006

<br>

### Job

#### ▼ Jobとは

単発的なバッチ処理を定義したい場合、Jobを使用する。

もう一度実行したい場合は、Jobを削除する必要がある。

複数のPodを作成 (SuccessfulCreate) し、指定された数のPodを正常に削除 (SuccessfulDelete) する。

デフォルトでは、ログの確認のためにPodは削除されず、Jobが削除されて初めてPodも削除される。

`.spec.ttlSecondsAfterFinished`キーを使用すると、Podのみを自動削除できるようになる。

定期的に実行する場合、CronJobのテンプレートとして定義する。

> - https://kubernetes.io/docs/concepts/workloads/controllers/job/
> - https://qiita.com/MahoTakara/items/82853097a1911671a704
> - https://dev.appswingby.com/kubernetes/kubernetes-%E3%81%A7-job%E3%82%92%E8%87%AA%E5%8B%95%E5%89%8A%E9%99%A4%E3%81%99%E3%82%8Bttlsecondsafterfinished%E3%81%8Cv1-21%E3%81%A7beta%E3%81%AB%E3%81%AA%E3%81%A3%E3%81%A6%E3%81%84%E3%81%9F%E4%BB%B6/
> - https://faun.pub/batch-and-cron-jobs-in-kubernetes-cbd29c35fd8

#### ▼ DBマイグレーション

Jobを使用して、DBにマイグレーションを実行する。

GitOpsツール (例：ArgoCDなど) によっては、アノテーションを使用してApply前にJobをフックさせられる。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: foo
  name: foo-migration-job
spec:
  backoffLimit: 0
  template:
    spec:
      containers:
        - name: foo-app
          image: foo-app:1.0.0
          command: ["<マイグレーションを実行するためのコマンド>"]
          envFrom:
            - secretRef:
                # DBの接続情報 (ホスト、ユーザー名、パスワード) はSecretに設定しておく。
                name: foo-secret
      restartPolicy: Never
```

> - https://blog.manabusakai.com/2018/04/migration-job-on-kubernetes/
> - https://qiita.com/butterv/items/65d8663dfa3a69f1bc55

<br>

### CronJob

#### ▼ CronJobとは

定期的なバッチ処理を定義したい場合、CronJobを使用する。

CronJob配下のJobは、決まった時間にならないと実行されない。

任意の時間に実行するためには、CronJobを指定し、これの配下で一時的にJobを作成する。

```bash
$ kubectl create job test-job --from=cronjob/foo-cron-job -n foo
```

ただし、動作確認後はCronJobにJobを作らせたいので、そのJobは削除する。

```bash
$ kubectl delete job test-job -n foo
```

> - https://zenn.dev/kennygt51/articles/2497931b8264de
> - https://qiita.com/koudaiii/items/586a8a0e0f763ddf9a05
> - https://serverfault.com/questions/809632/is-it-possible-to-rerun-kubernetes-job
> - https://faun.pub/batch-and-cron-jobs-in-kubernetes-cbd29c35fd8

<br>

### Node

#### ▼ Nodeとは

Kubernetesリソースを配置するサーバーのこと。

#### ▼ ライフサイクルフェーズ

kubeletは、Nodeのライフサイクルフェーズを設定する。

| フェーズ名 | 説明                                                      |
| ---------- | --------------------------------------------------------- |
| Ready      | NodeがPodをスケジューリング可能な状態であることを表す。   |
| NotReady   | NodeがPodをスケジューリング不可能な状態であることを表す。 |

#### ▼ イベント

| イベント名              | 説明                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NodeHasSufficientMemory |                                                                                                                                                                                       |
| NodeHasSufficientPID    |                                                                                                                                                                                       |
| NodeNotReady            |                                                                                                                                                                                       |
| NodeReady               |                                                                                                                                                                                       |
| Starting                |                                                                                                                                                                                       |
| SystemOOM               | Podの要求するメモリ量が多すぎて、Nodeのメモリ不足が起こったことを表す。Podのメモリで上限 (`limits`) = 下限 (`requests`) のように設定する (Guaranteed QoS) と、SystemOOMを避けられる。 |

> - https://www.reddit.com/r/kubernetes/comments/xc5i9w/keep_running_into_system_oom_encountered_how_to/

<br>

### Pod

#### ▼ Podとは

コンテナの最小グループ単位のこと。

Podを単位として、コンテナ起動/停止や水平スケールアウト/スケールインを実行する。

> - https://kubernetes.io/docs/concepts/workloads/pods/

**＊例＊**

PHP-FPMコンテナとNginxコンテナを稼働させる場合、これら同じPod内に配置する。

![kubernetes_pod_php-fpm_nginx](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_pod_php-fpm_nginx.png)

#### ▼ 例外的なコントロールプレーンNode上のPod

脆弱性の観点で、デフォルトではコントロールプレーンNodeにPodはスケジューリングされない。

これは、コントロールプレーンNodeにはTaint (`node-role.kubernetes.io/master:NoSchedule`) が設定されているためである。

一方で、Nodeにはこれがないため、Podをスケジューリングさせられる。

```bash
# コントロールプレーンNodeの場合
$ kubectl describe node <コントロールプレーンNode名> | grep -i taint

Taints: node-role.kubernetes.io/master:NoSchedule # スケジューリングさせないTaint

# ワーカーNodeの場合
$ kubectl describe node <ワーカーNode名> | grep -i taint

Taints: <none>
```

> - https://stackoverflow.com/questions/43147941/allow-scheduling-of-pods-on-kubernetes-master

ただし、セルフマネージドなコントロールプレーンNodeを採用している場合に、全てのコントロールプレーンNodeでTaintを解除すれば、Podを起動させられる。

コントロールプレーンNodeがマネージドではない環境 (オンプレミス環境、ベアメタル環境など) では、コントロールプレーンNodeにDaemonSetによるPodをスケジューリングさせることがある。

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

> - https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase
> - https://qiita.com/tkusumi/items/825ccde31fdc3d0b8425#%E4%BB%A3%E8%A1%A8%E7%9A%84%E3%81%AA-pod-%E3%81%AE%E3%82%B9%E3%83%86%E3%83%BC%E3%82%BF%E3%82%B9%E8%A1%A8%E8%A8%98

#### ▼ Podのコンディション

Podのライフサイクルのフェーズは、`.status.conditions`キーにコンディション持つ。

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

> - https://access.redhat.com/documentation/ja-jp/openshift_container_platform/3.11/html/developer_guide/diagnosing-evicted-pod

#### ▼ CrashLoopBackOffのデバッグ

PodがCrashLoopBackOffになっている場合、以下を確認すると良い。

- `kubectl logs`コマンドで、該当のコンテナのエラーログを確認する。
- `kubectl describe nodes`コマンドで、PodをスケジューリングさせているNodeを指定し、該当のPodがCPUとメモリの要求量に異常がないかを確認する。
- `kubectl describe pods`コマンドで、該当のPodがCrashLoopBackOffになる原因を確認する。ContainersのLastStateの項目で、メッセージを確認できる。これは、`kubectl logs`コマンドと同じ内容である。

> - https://sysdig.jp/blog/debug-kubernetes-crashloopbackoff/
> - https://newrelic.com/jp/blog/how-to-relic/monitoring-kubernetes-part-three

#### ▼ Podを安全に削除する方法

Podの終了プロセスが始まると、以下の一連のプロセスも開始する。

- Workload (例：Deployment、DaemonSet、StatefulSet、Jobなど) が古いPodを切り離す。
- Serviceとkube-proxyが古いPodの宛先情報を削除する。
- コンテナを停止する。

これらのプロセスはそれぞれ独立して実施され、ユーザーは制御できない。

例えば、Serviceとkube-proxyがPodの宛先情報を削除する前にPodが削除してしまうと、ServiceからPodへの接続を途中で切断することになってしまう。

また、コンテナを停止する前にPodを終了してしまうと、コンテナを強制的に終了することになり、ログにエラーが出力されてしまう。

そのため、Serviceとkube-proxyの処理後にPodを終了できるように、ユーザーがPodの`.spec.containers[*].lifecycle.preStop`キーに任意の秒数を設定し、コンテナに待機処理 (例：`sleep`コマンド) を実行させる必要がある。

また、コンテナの正常な終了後にPodを終了できるように、`.spec.terminationGracePeriodSeconds`キーに任意の秒数を設定し、Podの終了に伴う一連のプロセスの完了を待機する必要がある。

これらの適切な秒数は、ユーザーがそのシステムに応じて調節するしかない。

`.spec.terminationGracePeriodSeconds`キーを長めに設定し、`.spec.containers[*].lifecycle.preStop`キーの秒数も含めて、全てが完了した上でPodを終了可能にする。

![pod_terminating_process](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pod_terminating_process.png)

`(1)`

: クライアントは、`kubectl`コマンドがを使用して、Podを終了するリクエストをkube-apiserverに送信する。

`(2)`

: Podのマニフェストに`deletionTimestamp`キーが追加され、Podが`Terminating`フェーズとなり、削除プロセスを開始する。

`(3)`

: Podの`.spec.terminationGracePeriodSeconds`キーに応じて、Podの終了プロセス完了の待機時間を開始する。

`(4)`

: 最初にpreStopフックが起動し、`.spec.containers[*].lifecycle.preStop`キーで設定した待機処理をコンテナが実行する。

`(5)`

: DeploymentがPodを切り離す。また、Serviceとkube-proxyがPodの宛先情報を削除する。

`(6)`

: `.spec.containers[*].lifecycle.preStop`キーによるコンテナの待機処理が終了する。

`(7)`

: 待機処理が終了したため、kubeletは、コンテナランタイムを経由して、Pod内のコンテナに`SIGTERM`シグナルを送信する。

     これにより、コンテナの停止処理が開始する。

`(8)`

: `.spec.terminationGracePeriodSeconds`キーによるPodの終了プロセス完了の待機時間が終了する。

     この段階でもコンテナが停止していない場合は、コンテナに`SIGKILL`シグナルが送信され、コンテナを強制的に終了することになる。

`(9)`

: Podが削除される。この段階でDeploymentや、Serviceとkube-proxyの処理が完了していない場合は、接続を途中で強制的に切断することになる。

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

> - https://qiita.com/jackchuka/items/b82c545a674975e62c04#cpu

#### ▼ クライアントがPod内のログを参照できる仕組み

`(1)`

: Node上のkubeletとコンテナランタイムは、`/var/log/`ディレクトリの`log`ファイルにログを書き込む。

`(2)`

: クライアント (特に`kubectl`コマンド実行者) が`kubectl logs`コマンドを実行する。

`(3)`

: kube-apiserverが、`/logs/pods/<ログへのパス>`エンドポイントにリクエストを送信する。

`(4)`

: kubeletはリクエストを受信し、Nodeの`/var/log`ディレクトリの`log`ファイルを読み込む。

     コンテナランタイムは、コンテナの標準出力または標準エラー出力に出力したログを`/var/log/container`ディレクトリ配下に保管する。

     `/var/log/container`ディレクトリのログは、Pod全体のログを`/var/log/pods/<Namespace名>_<Pod名>_<UID>/<コンテナ名>/<数字>.log`ファイルのシンボリックになっている。



     なお、削除されたPodのログは、引き続き`/var/log/pods`ディレクトリ配下に保管されている。

![kubernetes_pod_logging](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_pod_logging.png)

> - https://www.creationline.com/lab/29281
> - https://kubernetes.io/docs/concepts/cluster-administration/logging/#log-location-node
> - https://tech.studyplus.co.jp/entry/2020/03/23/094119
> - https://qiita.com/daitak/items/679785bd0724cb1f4971#%E3%83%AD%E3%82%B0%E3%83%87%E3%82%A3%E3%83%AC%E3%82%AF%E3%83%88%E3%83%AA%E9%9A%8E%E5%B1%A4%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E5%90%8D
> - https://dunkshoot.hatenablog.com/entry/kubernetes_container_log

補足として、DaemonSetとして稼働するFluentdは、Nodeの`/var/log`ディレクトリを読み込むことにより、Pod内のコンテナのログを収集する。

> - https://note.com/shift_tech/n/n503b32e5cd35

#### ▼ 待ち受けるポート番号の確認

Pod内のコンテナ内で`netstat`コマンドを実行することにより、コンテナが待ち受けるポート番号を確認できる。

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

#### ▼ バルーンPod (OverProvisioning Pod)

『OverProvisioning Pod』ともいう。

NodeにバルーンPodをスケジューリングさせ、Nodeに常に余剰なリソース (例：CPU/メモリの容量) を確保できる。

バルーンPodの優先度は最低にしておく。

バルーンPodは優先度が低いため、他のPodをNodeに優先してスケジューリングできる。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-balloon
spec:
  # ゾーンが3つあるため、ゾーン間で移動するようにレプリカ数を3つにする
  replicas: 3
  selector:
    matchLabels:
      app: balloon
  template:
    metadata:
      labels:
        app: balloon
    spec:
      containers:
        - args:
            - infinity
          command:
            - sleep
          image: ubuntu
          name: ubuntu
          resources:
            requests:
              cpu: 1000m
              memory: 2048Mi
      priorityClassName: foo-balloon
      terminationGracePeriodSeconds: 10
      # Podを同じゾーンにスケジューリングさせない
      topologySpreadConstraints:
        - labelSelector:
            matchLabels:
              app: balloon
          maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: DoNotSchedule
```

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: foo-balloon
preemptionPolicy: Never
value: -10
description: Priority class for balloon
```

> - https://wdenniss.com/gke-autopilot-spare-capacity
> - https://qiita.com/Morix1500/items/5ea47755bb04f6b08a2a#%E3%82%AA%E3%83%BC%E3%83%90%E3%83%BC%E3%83%97%E3%83%AD%E3%83%93%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0%E3%81%AE%E5%AE%9F%E7%8F%BE%E6%96%B9%E6%B3%95

<br>

### ReplicaSet

#### ▼ ReplicaSetとは

Node上のPod数を維持管理する。

Podの負荷に合わせてPodの自動水平スケーリングを実行しない (HorizontalPodAutoscalerが必要である) 。

DaemonSetとは異なり、Podを指定した個数に維持管理できる。

ReplicaSetを直接的に操作するのではなく、Deployment使用してこれを行うことが推奨される。

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

> - https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#%E5%AE%89%E5%AE%9A%E3%81%97%E3%81%9F%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B8
> - https://sorarinu.dev/2021/08/kubernetes_01/

#### ▼ ライフサイクル

StatefulSetは、DeploymentやReplicaSetとは異なり、同時にPodを作成しない。

作成中のPodがReady状態になってから、次のPodを作成し始める。

そのためDeploymentやReplicaSetと比べて、全てのPodが揃うのに時間がかかる。

> - https://thinkit.co.jp/article/13611

<br>

### DeploymentとStatefulSetとの違い

#### ▼ 設定値

StatefulSetでは、一部の設定変更が禁止されている。

```bash
The StatefulSet "foo-pod" is invalid: spec: Forbidden: updates to statefulset spec for fields other than 'replicas', 'template', 'updateStrategy' and 'minReadySeconds' are forbidden
```

#### ▼ PersistentVolume

Deployment配下のPodは、全てが同じPersistentVolumeClaimを共有する。

そのため、Podに紐づくPersistentVolumeは同じになる。

一方でStatefulSet配下のPodは、別々のPersistentVolumeClaimを使用する。

そのため、Podに紐づくPersistentVolumeは別々になる。

Podが別のNodeに再スケジューリングされても、Podに同じPersistentVolumeをマウントできる。

Podが削除されてもPersistentVolumeClaimsは削除されないため、新しいPodも同じPersistentVolumeをマウントできる。

![kubernetes_deployment_persistent-volume](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_deployment_persistent-volume.png)

> - https://www.amazon.com/dp/1617297615

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

> - https://kubernetes.io/blog/2020/09/02/scaling-kubernetes-networking-with-endpointslices/#splitting-endpoints-up-with-the-endpointslice-api

<br>

### Gateway

#### ▼ Gatewayとは

Gatewayは、`L4`/`L7`プロトコルの通信の受信ルールを定義し、また`L4`/`L7`ロードバランサーとして通信をルーティングする。

> - https://developer.mamezou-tech.com/blogs/2022/07/24/k8s-gateway-api-intro/

#### ▼ Ingressとの違い

`L7`プロトコルの受信ルールしか定義できないIngressとは異なり、`L4`プロトコルの受信ルールも定義できる。

また、Gateway自体が`L4`/`L7`ロードバランサーとしても機能する。

<br>

### GatewayClass

#### ▼ GatewayClassとは

Gatewayの実体として使用するツールを指定する。

<br>

### Ingress

#### ▼ Ingressとは

Ingressは、`L7`プロトコルの通信の受信ルールを定義する。

Ingressを使用する場合、宛先のServiceは、Cluster IP Serviceとする。

NodePort ServiceやLoadBalancer Serviceと同様に、外部からのリクエストを受信する方法の1つである。

![kubernetes_ingress](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_ingress.png)

> - https://kubernetes.io/docs/concepts/services-networking/ingress/#what-is-ingress
> - https://thinkit.co.jp/article/18263
> - https://chidakiyo.hatenablog.com/entry/2018/09/10/Kubernetes_NodePort_vs_LoadBalancer_vs_Ingress%3F_When_should_I_use_what%3F_%28Kubernetes_NodePort_%E3%81%A8_LoadBalancer_%E3%81%A8_Ingress_%E3%81%AE%E3%81%A9%E3%82%8C%E3%82%92%E4%BD%BF%E3%81%86
> - https://www.netone.co.jp/knowledge-center/netone-blog/20210715-01/

#### ▼ Gatewayとの違い

`L7`プロトコルの通信のみを処理できる。

また、Ingressそれ自体はルールのみを持ち、Ingress Controllerがロードバランサーとして機能する。

#### ▼ パスベースルーティング

パスの値に基づいて、Serviceにルーティングする。

![kubernetes_ingress_path](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_ingress_path.png)

> - https://kubernetes.io/docs/concepts/services-networking/ingress/#simple-fanout

#### ▼ ホストベースルーティング

`Host`ヘッダー値に基づいて、Serviceにルーティングする。

本番環境では、ドメインを指定した各種ダッシュボードにリクエストを送信できる必要がある。

![kubernetes_ingress_host](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_ingress_host.png)

> - https://kubernetes.io/docs/concepts/services-networking/ingress/#name-based-virtual-hosting

<br>

### IngressClass

#### ▼ IngressClassとは

Ingress Controllerの実体として使用するツールを指定する。

<br>

### Ingress Controller

#### ▼ Ingress Controllerとは

Ingress Controllerは、`L7`ロードバランサーとしてPodに通信をルーティングする。

Node外から通信を受信し、Ingressに定義されたルールに応じて、単一/複数のServiceにルーティングする。

クラウドプロバイダー (例：AWS) では、Ingress Controller状況下でIngressを作成すると、Ingressの設定値に応じた`L7`ロードバランサー (例：AWS ALBとAWSターゲットグループ) を自動的にプロビジョニングする。

ただし、クラウドプロバイダーによっては、Ingress ControllerとClusterIP Serviceを仲介するカスタムリソース (例：AWS TargetGroupBindingsなど) を提供している場合がある。

この場合、クラウドプロバイダーのリソースとKubernetesが疎結合になり、責務の境界を明確化できる。

> - https://qiita.com/k-sasaki-hisys-biz/items/895cd2e3dd9baff45bd8

<br>

### Service

#### ▼ Serviceとは

Serviceは、`L4`ロードバランサーとしてPodに通信をルーティングする。

kube-proxyが更新したiptablesを使用し、また負荷分散方式によるルーティング先Podの決定に基づいて、Podに通信をルーティングする。

DaemonSetやJobで使用する例は少ないが、Podさえあれば全てのWorkload (例：Deployment、DaemonSet、StatefulSet、Jobなど) でServiceを使用できる。

マイクロサービスアーキテクチャのコンポーネントである『Service』とは区別する。

![kubernetes_kube-proxy_service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_kube-proxy_service.png)

> - https://kubernetes.io/docs/concepts/services-networking/service/
> - https://www.mtioutput.com/entry/kube-proxy-iptable
> - https://www.amazon.co.jp/dp/B079TG2M5N/ (チャプター5)
> - https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/#communicating-with-daemon-pods

#### ▼ ClusterIP Service

![kubernetes_clusterip-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_clusterip-service.png)

`L4`ロードバランサーとして、Serviceに対する通信を、Cluster-IPを経由してPodにルーティングする。

Cluster-IPはServiceの`.spec.clusterIP`キーで指定しない限りランダムで決まり、Podの`/etc/resolv.conf `ファイルに記載されている。

Pod内に複数のコンテナがある場合、各コンテナに同じ内容の`/etc/resolv.conf `ファイルが配置される。

```bash
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>] $ cat /etc/resolv.conf

nameserver *.*.*.* # ClusterネットワークのIPアドレス
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5 # 名前解決時のローカルドメインの優先度
```

Cluster-IPはNode外から宛先として指定できないため、通信にIngressを必要とする。

```yaml
パブリックネットワーク
⬇⬆️︎
# L7ロードバランサー
Ingress Controller (例：Nginx Ingress Controller、AWS Load Balancer Controllerなど)
⬇⬆️︎
# L4ロードバランサー
ClusterIP Service
⬇⬆️︎
Pod
```

Ingressが無いとClusterネットワーク内からのみしかアクセスできず、安全である。

一方でもしIngressを使用する場合、LoadBalancer Serviceと同様にして (レイヤーは異なるが) 、PodのIPアドレスを宛先とする`L7`ロードバランサー (例：AWS ALBとAWSターゲットグループ) を自動的にプロビジョニングする。

そのため、クラウドプロバイダーのリソースとKubernetesリソースが密結合になり、責務の境界が曖昧になってしまう。

> - https://www.imagazine.co.jp/%e5%ae%9f%e8%b7%b5-kubernetes%e3%80%80%e3%80%80%ef%bd%9e%e3%82%b3%e3%83%b3%e3%83%86%e3%83%8a%e7%ae%a1%e7%90%86%e3%81%ae%e3%82%b9%e3%82%bf%e3%83%b3%e3%83%80%e3%83%bc%e3%83%89%e3%83%84%e3%83%bc%e3%83%ab/
> - https://thinkit.co.jp/article/18263
> - https://qiita.com/tkusumi/items/da474798c5c9be88d9c5#%E8%83%8C%E6%99%AF

#### ▼ NodePort Service

![kubernetes_nodeport-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_nodeport-service.png)

`L4`ロードバランサーとして、Serviceに対する通信を、NodeのNICの宛先情報 (IPアドレス、ポート番号) 、Cluster-IPを経由してPodにルーティングする。

NodeのNICの宛先情報は、Node外から宛先IPアドレスとして指定できるため、通信にIngressを必要としない。

```yaml
パブリックネットワーク
⬇⬆️︎
# L4ロードバランサー
NodePort Service
⬇⬆️︎
Pod
```

パブリックプロバイダーのLB (例：AWS ALB) を別に配置しても良い (このLBは、Ingress Controller由来ではない) 。

```yaml
パブリックネットワーク
⬇⬆️︎
AWS Route53
⬇⬆️︎
# L7ロードバランサー
AWS ALB
⬇⬆️︎
# L4ロードバランサー
NodePort Service
⬇⬆️︎
Pod
```

ただし、NodePort Serviceは内部的にCluster-IPを使っている。

そのため、Ingressを作成するとNodePort ServiceのCluster-IPを経由してPodにルーティングする。

この場合、NodeのIPアドレスとIngressの両方がNodeの通信の入り口となり、入口が無闇に増えるため、やめた方が良い。

```yaml
パブリックネットワーク
⬇⬆️︎
# L7ロードバランサー
Ingress Controller (例：Nginx Ingress Controller、AWS Load Balancer Controller)
⬇⬆️︎
# L4ロードバランサー
ClusterIP Service (実体はNodePort Service)
⬇⬆️︎
Pod
```

NodeのNICの宛先情報は、Nodeの作成方法 (例：AWS EC2、Google Cloud GCE、VMWare) に応じて、確認方法が異なる。

Serviceのポート番号と紐づくNodeのNICのポート番号はデフォルトではランダムであるため、NodeのNICのポート番号を固定する必要がある。

`1`個のNodeのポート番号につき、`1`個のServiceとしか紐付けられず、Serviceが増えていってしまうため、実際の運用にやや不向きである。

この場合、クラウドプロバイダーのリソースとKubernetesが疎結合になり、責務の境界を明確化できる。

> - https://stackoverflow.com/a/64605782

#### ▼ LoadBalancer Service

![kubernetes_loadbalancer-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_loadbalancer-service.png)

`L4`ロードバランサーとして、Serviceに対する通信を、External-IP、NodeのNICの宛先情報 (IPアドレス、ポート番号)、Cluster-IPを経由してPodにルーティングする。

External-IPはNode外から宛先IPアドレスとして指定できる。

そのため、通信にIngressを必要としないが、外部のロードバランサーのみが宛先IPアドレスを指定できる。

```yaml
パブリックネットワーク
⬇⬆️︎
AWS Route53
⬇⬆️︎
# L4ロードバランサー
LoadBalancer ServiceによるAWS NLB
⬇⬆️︎
Pod
```

クラウドプロバイダー (例：AWS) では、LoadBalancer Serviceを作成すると、External-IPを宛先とする`L4`ロードバランサー (例：AWS NLBとAWSターゲットグループ) を自動的にプロビジョニングする。

クラウドプロバイダーのリソースとKubernetesリソースが密結合になり、責務の境界が曖昧になってしまう。

なお、注意点として、Ingress Controllerは`L7`ロードバランサーを自動的にプロビジョニングする。

> - https://www.imagazine.co.jp/%e5%ae%9f%e8%b7%b5-kubernetes%e3%80%80%e3%80%80%ef%bd%9e%e3%82%b3%e3%83%b3%e3%83%86%e3%83%8a%e7%ae%a1%e7%90%86%e3%81%ae%e3%82%b9%e3%82%bf%e3%83%b3%e3%83%80%e3%83%bc%e3%83%89%e3%83%84%e3%83%bc%e3%83%ab/
> - https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0
> - https://thinkit.co.jp/article/18263
> - https://www.ios-net.co.jp/blog/20230621-1179/

#### ▼ ExternalName Service

Cluster内DNS名とCluster外CNAMEレコードを対応づけ、Serviceに対する通信を対象にルーティングする。

CoreDNSの代わりとして使用できる。

例えば、`foo-db-service`というExternalName Serviceを作成したとする。

ここ場合、`foo-db-service.default.svc.cluster.local`を指定すると、指定したCNAMEレコードに問い合わせるようになる。

![kubernetes_externalname-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_externalname-service.png)

> - https://thinkit.co.jp/article/13739
> - https://blog.mosuke.tech/entry/2021/08/26/kubernetes-externalname-service/

#### ▼ Headless Service

![kuberentes_headless-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kuberentes_headless-service.png)

Headless Service以外のServiceは、負荷分散方式により、配下のいずれかのPodのIPアドレスを返却する。

その一方で、Headless Serviceは配下の全てのPodのIPアドレスを同時に返却する。

```bash
$ dig <Serviceの完全修飾ドメイン名>

;; QUESTION SECTION:
;<Serviceの完全修飾ドメイン名>. IN   A

;; ANSWER SECTION:
<Serviceの完全修飾ドメイン名>. 30 IN A       10.8.0.30
<Serviceの完全修飾ドメイン名>. 30 IN A       10.8.1.34
<Serviceの完全修飾ドメイン名>. 30 IN A       10.8.2.55
```

> - https://www.linkedin.com/posts/jack-liu-b73b7b2a8_headless-service-in-kubernetes-a-headless-activity-7211615318547345409-qdgg/
> - https://stackoverflow.com/a/52713482/12771072
> - https://stackoverflow.com/a/50892280/12771072

なお、Headless ServiceからStatefulSetにルーティングする場合は、唯一、Podで直接的に名前解決できるようになる。

```bash
$ dig <Pod名>.<Serviceの完全修飾ドメイン名>

;; QUESTION SECTION:
;<Pod名>.<Serviceの完全修飾ドメイン名>. IN A

;; ANSWER SECTION:
<Pod名>.<Serviceの完全修飾ドメイン名>. 30 IN A 10.8.0.30
```

> - https://thinkit.co.jp/article/13739

<br>

## 03-04. Serviceの仕組み

### パケットの処理方法

![kube-proxy_iptables](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kube-proxy_iptables.png)

Serviceは、パケットの`L4`に関するヘッダーの持つ情報を見て、Podに`L4`ロードバランシングする。

ServiceがPodと紐づいたり、切り離したりした後、kube-procyがiptablesを変更する。

受信したリクエストをパケットとして処理していく流れを見ていく。

`(1)`

: ここでは、ClusterIP Serviceを例に挙げる。

     `10.0.0.10`というIPアドレスを持つClusterIP Serviceがいるとする。

```bash
$ kubectl get svc kube-dns -n kube-system

NAME       TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)         AGE
kube-dns   ClusterIP   10.0.0.10    <none>        53/UDP,53/TCP   12d
```

`(2)`

: kube-proxyでiptablesを確認すると、受信したリクエストをパケットとして処理していく流れを確認できる。

     `KUBE-SERVICES`ターゲット配下には`KUBE-SVC`ターゲットがいる。

     `KUBE-SVC`ターゲットは、ClusterIP Serviceである。

```bash
$ kubectl exec -it kube-proxy-wf7qw -n kube-system -- iptables -nL -t nat --line-numbers

Chain KUBE-SERVICES (2 references)
num  target                     prot opt source               destination

...

5    KUBE-MARK-MASQ             udp  --  !172.16.10.0/24      10.0.0.10            /* kube-system/kube-dns:dns cluster IP */ udp dpt:53
# Serviceにルーティングするための設定
6    KUBE-SVC-TCOU7JCQXEZGVUNU  udp  --  0.0.0.0/0            10.0.0.10            /* kube-system/kube-dns:dns cluster IP */ udp dpt:53

...

```

`(2)`

: `KUBE-SVC`ターゲット配下には`KUBE-SEP`ターゲットがいる。

     `statistic mode random probability`に応じて、パケットを`KUBE-SEP`のターゲットいずれかに振り分ける。

```bash
# KUBE-SVC
Chain KUBE-SVC-TCOU7JCQXEZGVUNU (1 references)

num  target                     prot opt source               destination
1    KUBE-SEP-K7EZDDI5TWNJA7RX  all  --  0.0.0.0/0            0.0.0.0/0            /* kube-system/kube-dns:dns */ statistic mode random probability 0.50000000000
2    KUBE-SEP-JTVLMQFBDVPXUWUS  all  --  0.0.0.0/0            0.0.0.0/0            /* kube-system/kube-dns:dns */
```

`(3)` `KUBE-SEP`のターゲットに応じて、異なる`DNAT`ターゲットを持つ。

     `DNAT`ターゲットは、Podである。

     kube-proxyはDNAT処理を実行し、パケットの宛先IPアドレス (ServiceのIPアドレス) をPodのIPアドレスに変換する。

     ここでは、パケットの宛先IPアドレスを`172.16.10.9`と`172.16.10.42`に変換する。

```bash
Chain KUBE-SEP-K7EZDDI5TWNJA7RX (1 references)

num  target          prot  opt  source           destination
1    KUBE-MARK-MASQ  all   --   172.16.10.42     0.0.0.0/0            /* kube-system/kube-dns:dns */
2    DNAT            udp   --   0.0.0.0/0        0.0.0.0/0            /* kube-system/kube-dns:dns */ udp to:172.16.10.42:53

Chain KUBE-SEP-JTVLMQFBDVPXUWUS (1 references)
num  target          prot  opt  source           destination
1    KUBE-MARK-MASQ  all   --   172.16.10.9      0.0.0.0/0            /* kube-system/kube-dns:dns */
2    DNAT            udp   --    0.0.0.0/0       0.0.0.0/0            /* kube-system/kube-dns:dns */ udp to:172.16.10.9:53
```

`(4)` 宛先のPodのIPアドレスを確認すると、DNAT処理の変換後のIPアドレスと一致している。

```bash
$ kubectl get po -n kube-system -o wide -l k8s-app=kube-dns

NAME                     READY   STATUS    RESTARTS   AGE    IP             NODE                                NOMINATED NODE   READINESS GATES
coredns-69c47794-6xnlq   1/1     Running   0          18h    172.16.10.9    aks-nodepool1-19344272-vmss000000   <none>           <none>
coredns-69c47794-cgn9k   1/1     Running   0          7d9h   172.16.10.42   aks-nodepool1-19344272-vmss000001   <none>           <none>
```

> - https://zenn.dev/microsoft/articles/how-cluster-ip-service-is-implemented
> - https://speakerdeck.com/bells17/kube-proxyru-men?slide=36
> - https://christina04.hatenablog.com/entry/kubernetes-pod-graceful-shutdown

<br>

### Headless Serviceのユースケース

#### ▼ ライターPodとリーダーPodのクラスタリングする場合

StatefulSetでMySQLをクラスタリングした場合、ライターPodとリーダーPodがいる。

アプリケーションはライターPodとリーダーPodの両方のIPアドレスを認識し、いずれに永続化するべきかを判断する必要がある。

この場合、全てのPodのIPアドレスを返却するHeadless Serviceが適している。

#### ▼ Pod間でデータ同期が必要な場合

StatefulSetでKeycloakをクラスタリングした場合、JGroupsはInfinispanインスタンス間でセッションデータを同期する。

JGroupsが全てのInfinispanインスタンス間でセッションデータを同期できるように、Infinispanを内蔵した全てのKeycloak Podを認識できるようにする必要がある。

> - https://zenn.dev/cloud_ace/articles/gke-keycloak#headless-service-%E3%81%8C%E5%BF%85%E8%A6%81%E3%81%AA%E7%90%86%E7%94%B1

<br>

## 04. Clusterリソース

### Clusterリソースとは

Cluster全体に渡る機能を提供する。

> - https://thinkit.co.jp/article/13542

<br>

### Namespace

#### ▼ Namespaceとは

各Kubernetesリソースの影響範囲を制御するための領域のこと。

Namespaceが異なれば、`.metadata.labels`キーに同じ値 (例：同じ名前など) を設定できる。

#### ▼ 初期Namespace

| 名前              | 説明                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `default`         | 任意のKubernetesリソースを配置する。                                                                          |
| `kube-node-lease` | Kubernetesリソースのうちで、特にLeaseを配置する。                                                             |
| `kube-public`     | 全てのクライアント (`kubectl`クライアント、Kubernetesリソース) に公開しても良いKubernetesリソースを配置する。 |
| `kube-system`     | Kubernetesが自動的に作成したKubernetesリソースを配置する。ユーザーが設定する必要はない。                      |

> - https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/#initial-namespaces

#### ▼ NamespaceがTerminatingのままになる

以下の方法で対処する。

> - https://komeiy.hatenablog.com/entry/2019/07/28/232356

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

| 変数             | 何のために使用するのか                                       |
| ---------------- | ------------------------------------------------------------ |
| DBホスト名       | コンテナがDBに接続する時に、DBのホスト名として使用する。     |
| DBポート番号     | コンテナがDBに接続する時に、DBのポート番号として使用する。   |
| DBタイムアウト   | コンテナがDBに接続する時に、タイムアウト時間として使用する。 |
| DB接続リトライ数 | コンテナがDBに接続する時に、リトライの回数として使用する。   |
| タイムゾーン     | コンテナ内のタイムゾーンとして使用する。                     |
| ...              | ...                                                          |

<br>

### Secret

#### ▼ Secretとは

コンテナで使用する機密な変数やファイルをキーバリュー型で永続化する。

永続化されている間は`base64`方式でエンコードされており、デコードした上で、変数やファイルとして対象のPodに出力する。

> - https://kubernetes.io/docs/concepts/configuration/secret/#uses-for-secrets

#### ▼ 機密ではない変数の例

| 変数         | 何のために使用するのか                                             |
| ------------ | ------------------------------------------------------------------ |
| DBユーザー名 | コンテナがDBに接続する時に、DBユーザーのユーザー名として使用する。 |
| DBパスワード | コンテナがDBに接続する時に、DBユーザーのパスワードとして使用する。 |
| ...          | ...                                                                |

#### ▼ コンテナイメージプルのパラメーターとして

Podの起動時に、kubectlコマンドが実行され、コンテナイメージをプルする。

Secretに永続化された値を復号化し、`kubectl`コマンドにパラメーターとして出力できる。

> - https://kubernetes.io/docs/concepts/configuration/secret/#using-imagepullsecrets

#### ▼ コンテナの環境変数として

永続化された値を復号化し、Pod内のコンテナに環境変数として出力できる。

> - https://kubernetes.io/docs/concepts/configuration/secret/#using-secrets-as-environment-variables

<br>

## 06. ストレージ系リソース

### ストレージ系リソースの種類

Kubernetesで作成できるストレージは、作成場所で種類を分けられる。

![kubernetes_storage_resource_types](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_storage_resource_types.png)

| ストレージの種類 | Volume           | PersistentVolume |
| ---------------- | ---------------- | ---------------- |
| Pod内ストレージ  | EmptyDir         | なし             |
| Node内ストレージ | HostPath         | HostPath、Local  |
| Node外ストレージ | Node外ストレージ | Node外ストレージ |

> - https://www.netone.co.jp/knowledge-center/netone-blog/20191206-1/

<br>

### PersistentVolume

#### ▼ PersistentVolumeとは

![storage_class](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/storage_class.png)

Node上のストレージ上にVolumeを作成する。

Node上のPod間でVolumeを共有でき、同一Pod内のコンテナ間でもVolumeを共有できる。

PodがPersistentVolumeを使用するためには、PersistentVolumeClaimにPersistentVolumeを要求させておき、PodでこのPersistentVolumeClaimを指定する必要がある。

アプリケーションのディレクトリ名を変更した場合は、PersistentVolumeを再作成しないと、アプリケーション内のディレクトリの読み出しでパスを解決できない場合がある。

DockerのVolumeとは独立した機能であることに注意する。

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

> - https://stackoverflow.com/questions/53200828/how-to-identify-the-storage-space-left-in-a-persistent-volume-claim

また、Grafanaのkubernetes-mixinsには、起動中のPodのPersistentVolumeの使用率を可視化できるダッシュボードがある。

> - https://github.com/monitoring-mixins/website/blob/master/assets/kubernetes/dashboards/persistentvolumesusage.json

#### ▼ PersistentVolumeの使用率の確認方法 (CrashLoopBackOffの場合)

ここでは、Prometheusを例に挙げる。

`(1)`

: PrometheusのPodに紐づくPersistentVolumeは、最大200Giを要求していることがわかる。

```bash
$ kubectl get pvc foo-prometheus-pvc -n prometheus
NAME                 STATUS   VOLUME      CAPACITY   ACCESS MODES   STORAGECLASS    AGE
foo-prometheus-pvc   Bound    pvc-*****   200Gi      RWO            gp3-encrypted   181d
```

`(2)`

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

`(3)`

: `df`コマンドで、ストレージの使用率を確認する。Nodeにマウントされているデータサイズを確認すると、197Gとなっている。 PersistentVolumeに対してデータサイズが大きすぎることがわかる。

```bash
$ df -h /var/lib/kubelet/plugins/kubernetes.io/aws-ebs/mounts/aws/ap-northeast-1a/vol-*****/prometheus-db/

Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme8n1    197G  197G     0 100% /var/lib/kubelet/plugins/kubernetes.io/aws-ebs/mounts/aws/ap-northeast-1a/vol-*****
```

#### ▼ HostPath (本番環境で非推奨)

Nodeのストレージ上にVolumeを作成し、これをコンテナにバインドマウントする。

機能としては、Volumeの一種であるPodによるHostPathと同じである。

マルチNodeはサポートしていないため、本番環境では非推奨である。

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes
> - https://thenewstack.io/10-kubernetes-best-practices-you-can-easily-apply-to-your-clusters/

#### ▼ Local (本番環境で推奨)

Node上にVolumeを作成し、これをコンテナにバインドマウントする。

マルチNodeをサポートしている (明言されているわけではく、HostPathとの明確な違いがよくわからない) 。

> - https://kubernetes.io/docs/concepts/storage/volumes/#local
> - https://qiita.com/sotoiwa/items/09d2f43a35025e7be782#local

#### ▼ Node外ストレージツールのVolume

Node外ストレージツール (例：AWS EBS、NFS、iSCSI、Cephなどなど) が提供するVolumeをコンテナにマウントする。

StorageClassとPersistentVolumeClaimを経由して、PersistentVolumeとNode外ストレージツールを紐付け、Volumeとしてコンテナにマウントする。

また、Node外ストレージを使用する場合には、CSIドライバーも必要である。

![storage_class](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/storage_class.png)

<br>

### Volume

#### ▼ Volumeとは

![storage_class](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/storage_class.png)

Node外ストレージツール (例：AWS EBS、NFS、iSCSI、Cephなどなど) をそのままKubernetesのVolumeとして使用する。

Podの`.spec.volumes`キーで指定する。

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

> - https://thinkit.co.jp/article/14195

#### ▼ DockerのVolumeとの違い

Dockerのボリュームとは独立した機能であることに注意する。

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
                "/var/lib/kubelet/pods/<PodのUUID>/volumes/kubernetes.io~projected/kube-api-access-*****:/var/run/secrets/kubernetes.io/serviceaccount:ro",
                "/var/lib/kubelet/pods/<PodのUUID>/etc-hosts:/etc/hosts",
                "/var/lib/kubelet/pods/<PodのUUID>/containers/foo/*****:/dev/termination-log"
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
                "RW": "true",
                "Propagation": "rprivate"
            },

            ...
        ]
    }
```

> - https://thenewstack.io/10-kubernetes-best-practices-you-can-easily-apply-to-your-clusters/
> - https://qiita.com/umkyungil/items/218be95f7a1f8d881415

#### ▼ EmptyDir

Podの既存のストレージ上にVolume (`/var/lib/kubelet/pods/<PodのUUID>/volumes/kubernetes.io~empty-dir/`ディレクトリ) を作成し、コンテナにボリュームマウントする。

ディレクトリの中身は、NodeのNode外ストレージやメモリ上 (上限はNodeのメモリの`50`%) に保管できる。

同一Node上のPod間でこのVolumeを共有できず、同一Pod内のコンテナ間ではVolumeを共有できる。

また、Podが削除されるとこのVolumeも同時に削除されてしまう。

保持期間を設定できるツール (例：Prometheus、VictoriaMetrics、Grafana Mimirなど) にて、PodのVolumeをEmptyDirとしている場合、Podを保持期間より先に削除すると、保持期間を待たずにVolumeを削除することになってしまう。

> - https://qiita.com/umkyungil/items/218be95f7a1f8d881415
> - https://cstoku.dev/posts/2018/k8sdojo-05/
> - https://pradiptabanerjee.medium.com/how-to-size-a-memory-backed-kubernetes-emptydir-volume-cdfe39d1b7e5

#### ▼ Node外ストレージツールのVolume

Node外ストレージツール (例：AWS EBS、NFS、iSCSI、Cephなどなど) が提供するVolumeをコンテナにマウントする。

同一Node上のPod間でこのVolumeを共有でき、同一Pod内のコンテナ間でもVolumeを共有できる。

また、Podが削除されてもこのVolumeは削除されない。

> - https://kubernetes.io/docs/concepts/storage/volumes/
> - https://zenn.dev/suiudou/articles/31ab107f3c2de6#%E2%96%A0kubernetes%E3%81%AE%E3%81%84%E3%82%8D%E3%82%93%E3%81%AA%E3%83%9C%E3%83%AA%E3%83%A5%E3%83%BC%E3%83%A0

#### ▼ Volumeの代わりにPersistentVolumeを使用する

Podの`.spec.volumes`キーでPersistentVolumeClaimを宣言すれば、Volumeの代わりにPersistentVolumeを使用できる。

<br>

## 06-02. ストレージ要求系

### PersistentVolumeClaim

#### ▼ PersistentVolumeClaimとは

設定された条件に基づいて、Kubernetesで作成済みのPersistentVolumeを要求し、指定したKubernetesリソースに割り当てる。

![storage_class](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/storage_class.png)

> - https://garafu.blogspot.com/2019/07/k8s-pv-and-pvc.html

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

> - https://qiita.com/dss_hashimoto/items/8cbf834c504e57fbe1ff

#### ▼ node affinity conflict

PersistentVolumeClaimは、`annotation`キー配下の`volume.kubernetes.io/selected-node`キーで、紐づくPersistentVolumeが配置されているNode名を指定している。

PersistentVolumeClaimは、条件に応じてPersistentVolumeを探す。

しかし、PersistentVolumeClaimが `volume.kubernetes.io/selected-node` キーで指定するNodeと、PodをスケジューリングさせているNodeが異なるAZであると、以下のエラーになってしまう。

```bash
N node(s) had volume node affinity conflict, N node(s) didn't match Pod's node affinity/selector
```

これが起こる原因はさまざまある (例：Nodeの再作成時にPodのあるNodeのAZが変わる、AWSのスポットインスタンスで特定のAZにしかNodeが作成されない)。

**＊解決例＊**

ここでは、Nodeの再作成でPodのあるNodeのAZが変わった場合の解決策を記載する。

AWSのスポットインスタンスで特定のAZにしかNodeが作成されない問題では対処できない。

例えば、もともと`a`ゾーンにいるPodがNodeの再作成で再スケジューリングされ、`c`ゾーンになったとする。

しかし、Podに紐づくPersistentVolumeClaimは元々の`a`ゾーンのNodeのPersistentVolumeを指定したままになっており、`c`ゾーンのPodは`a`ゾーンのPersistentVolumeを指定できないため、`volume node affinity conflict`になる。

以下の手順で、PersistentVolumeClaimとこれを指定するPodの両方を再作成し、PersistentVolumeClaimはPodと同じゾーンのPersistentVolumeを指定可能にする。

注意点として、何らかの理由 (例：スポットインスタンス) で、特定のAZにNodeを配置できない場合、この手順では解決できない。

`(1)`

: 起動できないPodをいずれのNodeでスケジューリングさせようとしているのか確認する。

```bash
$ kubectl describe pod <Pod名> -o wide | grep Node:
```

`(2)`

: Nodeのあるゾーンを確認する。

```bash
$ kubectl describe node <PodのあるNode名> | grep topology.kubernetes.io
```

`(3)`

: PersistentVolumeClaimの`volume.kubernetes.io/selected-node`キーで、PodがいずれのNodeのPersistentVolumeを指定しているかを確認する。

     このNode名をメモしておく。

```bash
$ kubectl describe pvc <PVC名> -n prometheus | grep selected-node
```

`(4)`

: Nodeのあるゾーンを確認する。

```bash
$ kubectl describe node ip-*-*-*-*.ap-northeast-1.compute.internal | grep zone
```

`(5)`

: (1)と(4)の手順で確認したNodeのゾーンが異なるゾーンであることを確認する。

`(6)`

: PersistentVolumeClaimを削除する。

     この時PersistentVolumeは削除されないため、保管データは削除されない。

`(7)`

: StatefulSet自体を再作成する。

`(8)`

: StatefulSetがPersistentVolumeClaimを新しく作成する。

`(9)`

: PersistentVolumeClaimが、Podと同じゾーンのPersistentVolumeを指定できるようになる。

> - https://github.com/kubernetes/kubernetes/issues/74374#issuecomment-466191847
> - https://stackoverflow.com/questions/51946393/kubernetes-pod-warning-1-nodes-had-volume-node-affinity-conflict

#### ▼ サイズを拡張する

PersitentVolumeClaimの値が変われば、使用するPersistentVolumeを変えられる。

`--cascade`オプションでPodを残してStatefulSetを

```bash
$ kubectl patch prometheus foo --patch '{"spec": {"paused": "true", "storage": {"volumeClaimTemplate": {"spec": {"resources": {"requests": {"storage":"10Gi"}}}}}}}' --type merge

$ kubectl delete statefulset -l operator.prometheus.io/name=foo-operator --cascade=orphan
```

> - https://stackoverflow.com/questions/40335179/can-a-persistent-volume-be-resized
> - https://github.com/prometheus-operator/prometheus-operator/blob/main/Documentation/user-guides/storage.md#resizing-volumes

<br>

### StorageClass

#### ▼ StorageClassとは

Node外ストレージツール (例：AWS EBS、Azure Diskなど) を要求し、これをVolumeとしてPersistentVolumeClaimに提供する。

そのため、PersistentVolumeも合わせて作成する必要がある。

StorageClassを使用する場合は、PersistentVolumeClaimではなくStorageClass側で`reclaimPolicy`キーとして設定する。

![storage_class](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/storage_class.png)

> - https://kubernetes.io/docs/concepts/storage/dynamic-provisioning/#using-dynamic-provisioning
> - https://www.netone.co.jp/knowledge-center/netone-blog/20191206-1/

#### ▼ AWS EBSを要求する場合

`reclaimPolicy`が`Delete`になっているPersistentVolumeClaimを削除すれば、StorageClassがAWS EBSもよしなに削除してくれる。

> - https://github.com/kubernetes-sigs/aws-ebs-csi-driver/issues/1071

<br>

<br>

## 07. 認証系リソース

### CertificateSigningRequest

#### ▼ CertificateSigningRequestとは

認証局に対するSSL証明書の要求 (`openssl x509`コマンド) を宣言的に設定する。

別途、秘密鍵から証明書署名要求を作成し、これをパラメーターとして設定する必要がある。

> - https://qiita.com/knqyf263/items/aefb0ff139cfb6519e27

<br>

### ServiceAccount

#### ▼ ServiceAccountとは

![kubernetes_authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_authorization.png)

kube-apiserverが、クライアント側を認証可能にする。

kube-apiserverが、Kubernetesリソース (特にPod) を認証可能にする。

別途、RoleBindingやClusterRoleBindingを使用してKubernetesリソースに認可スコープを設定する必要がある。

PodでServiceAccountの指定がない場合、service-account-admission-controllerはPodにServiceAccountを自動的に設定する。

> - https://kubernetes.io/docs/reference/access-authn-authz/authentication/
> - https://tech-blog.cloud-config.jp/2021-12-04-kubernetes-authentication/
> - https://support.huaweicloud.com/intl/en-us/usermanual-cce/cce_01_0189.html

#### ▼ ServiceAccountのユーザー名

特にServiceAccountには、より正確な定義のユーザー名がある。

ServiceAccountのユーザー名は、`system:serviceaccount:＜Namespace名＞:＜ServiceAccount名＞`で定義されている。

これは、RoleBindingやClusterBindingの定義時に使用できる。

> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#referring-to-subjects
> - https://knowledge.sakura.ad.jp/21129/

#### ▼ service-account-controller

各Namespace内に`default`というServiceAccountを自動的に作成する。

これは、`default`のNamespaceとは無関係である。

> - https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/#control-plane-details
> - https://qiita.com/knqyf263/items/ecc799650fe247dce9c5#service-account-admission-controller

#### ▼ token-controller

ServiceAccount用のSecretの作成をポーリングし、Secretにトークン文字列を追加する。

一方で、Secretの削除をポーリングし、ServiceAccountからSecretの指定を削除する。

また、ServiceAccountの削除をポーリングし、token-controllerはSecretのトークン文字列を自動的に削除する。

> - https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/#control-plane-details
> - https://qiita.com/knqyf263/items/ecc799650fe247dce9c5#service-account-admission-controller

#### ▼ service-account-admission-controller

AdmissionWebhookの仕組みの中で、Podの作成時にVolume上の`/var/run/secrets/kubernetes.io/serviceaccount`ディレクトリをコンテナにマウントする。

トークンの文字列は、`/var/run/secrets/kubernetes.io/serviceaccount/token`ファイルに記載されている。

> - https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/#control-plane-details
> - https://qiita.com/knqyf263/items/ecc799650fe247dce9c5#service-account-admission-controller

<br>

### UserAccount

#### ▼ UserAccountとは

![kubernetes_authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_authorization.png)

kube-apiserverが、クライアント側を認証可能にする。

kube-apiserverが、クライアントを認証可能にする。別途、RoleBindingやClusterRoleBindingを使用して、クライアントに認可スコープを設定する必要がある。

クライアントの認証に必要なクライアント証明書は、`kubeconfig`ファイルに登録する必要がある。

> - https://kubernetes.io/docs/reference/access-authn-authz/authentication/
> - https://tech-blog.cloud-config.jp/2021-12-04-kubernetes-authentication/
> - https://support.huaweicloud.com/intl/en-us/usermanual-cce/cce_01_0189.html

<br>

### User/Group

クラウド上のユーザーやグループをKubernetes上で使用する場合、User/Groupで指定する。

> - https://qiita.com/toshi1973814/items/d97f857af4aa2250a450
> - https://stackoverflow.com/a/58708162

<br>

## 08. 認可系リソース

### Role、ClusterRole

#### ▼ Role

NamespacedスコープなKubernetesリソースやカスタムリソース (Namespaceを設定できるKubernetesリソース) に関する認可スコープを設定する。

![kubernetes_authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_authorization.png)

> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole
> - https://support.huaweicloud.com/intl/en-us/usermanual-cce/cce_01_0189.html

#### ▼ ClusterRoleとは

ClusterスコープなKubernetesリソースやカスタムリソース (Namespaceを設定できないKubernetesリソース) に関する認可スコープを設定する。

![kubernetes_authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_authorization.png)

> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole
> - https://support.huaweicloud.com/intl/en-us/usermanual-cce/cce_01_0189.html

#### ▼ RBAC：Role-based access control

Role、ClusterRoleを使用して認可スコープを制御する仕組みのこと。

> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/

<br>

### RoleBinding

#### ▼ ClusterRoleBinding

ClusterRoleを、UserAccount / ServiceAccount / Groupに紐付ける。

注意点として、ClusterRoleのみの紐付けに使用できる。

> - https://cloud.google.com/kubernetes-engine/docs/how-to/role-based-access-control?hl=ja
> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding
> - https://support.huaweicloud.com/intl/en-us/usermanual-cce/cce_01_0189.html

#### ▼ RoleBinding

RoleやClusterRoleを、UserAccount / ServiceAccount / Groupに紐付ける。

注意点として、RoleとClusterRoleの両方の紐付けに使用できる。

もしRoleを紐づけた場合は、そのUserAccount / ServiceAccount / Groupは、NamespacedスコープのKubernetesリソースやカスタムリソースに関する権限を得る。

もしClusterRoleを紐づけた場合は、そのUserAccount / ServiceAccount / Groupは、ClusterスコープのKubernetesリソースやカスタムリソースに関する権限を得る。

> - https://cloud.google.com/kubernetes-engine/docs/how-to/role-based-access-control?hl=ja
> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding
> - https://support.huaweicloud.com/intl/en-us/usermanual-cce/cce_01_0189.html

<br>

## 09. ポリシー系リソース

### NetworkPolicy

#### ▼ NetworkPolicyとは

Pod間通信でのインバウンド/アウトバウンド通信の送受信ルールを設定する。

> - https://www.amazon.co.jp/dp/B08FZX8PYW
> - https://qiita.com/dingtianhongjie/items/983417de88db2553f0c2

#### ▼ Ingressの場合

他のPodからの受信する通信のルールを設定する。

Ingressとは関係がないことに注意する。

#### ▼ Egressの場合

他のPodに送信する通信のルールを設定する。

<br>
