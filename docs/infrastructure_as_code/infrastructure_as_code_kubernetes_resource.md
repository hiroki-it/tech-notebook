---
title: 【IT技術の知見】Kubernetesリソース＠Kubernetes
description: Kubernetesリソース＠Kubernetesの知見を記録しています。
---
# Kubernetesリソース＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Kubernetesリソースとオブジェクト

### Kubernetesリソース

Kubernetes上でアプリケーションを稼働させる概念のこと。



<br>

### Kubernetesオブジェクト

マニフェストによって量産されたKubernetesリソースのインスタンスのこと。



> ℹ️ 参考：https://qiita.com/cvusk/items/773e222e0971a5391a51

<br>

## 02. Workloadリソース

### Workloadリソースとは

コンテナの実行に関する機能を提供する。



> ℹ️ 参考：https://thinkit.co.jp/article/13542

<br>

### DaemonSet

#### ▼ DaemonSetとは

Node上のPodの個数を維持管理する。

Podの負荷に合わせてPodの自動水平スケーリングを実行しない（HorizontalPodAutoscalerが必要である）。

ただしReplicaSetとは異なり、Node内でPodを1つだけ維持管理する。

Nodeで1つだけ稼働させる必要のあるプロセス（例：kube-proxy、cni、FluentBit、datadogエージェント、cAdvisorエージェント、Prometheusの一部のExporter、など）のために使用される。

こういったプロセスが稼働するコンテナは、Node内の全てのコンテナからデータを収集し、可観測性のためのデータセットを整備する。

> ℹ️ 参考：
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

Podの負荷に合わせてPodの自動水平スケーリングを実行しない（HorizontalPodAutoscalerが必要である）。

ただしStatefulSetとは異なり、ストレートレス（例：マイクロサービスコンテナ）なコンテナを含むPodを冗長化することに適する。



> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
> - https://sorarinu.dev/2021/08/kubernetes_01/

#### ▼ ReplicaSetの置き換え

PodTemplate（```spec.template```キー）を変更した場合、Deploymentは新しいReplicaSetを作成し、これを古いReplicaSetと置き換える。

レプリカ数（```spec.replicas```キー）の変更の場合は、Deploymentは既存のReplicaSetをそのままにし、Podのレプリカ数のみを変更する。



> ℹ️ 参考：https://qiita.com/tkusumi/items/01cd18c59b742eebdc6a

![kubernetes_deployment_replace_replicaset](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_deployment_replace_replicaset.png)

#### ▼ Podのレプリカ数の維持

Deploymentは、Cluster内のPodのレプリカ数を指定された数だけ維持する。

そのため、例えばCluster内に複数のNodeが存在していて、いずれかのNodeが停止した場合、稼働中のNode内でレプリカ数を維持するようにPod数を増やす。



> ℹ️ 参考：https://dr-asa.hatenablog.com/entry/2018/04/02/174006

#### ▼ PersistentVolumeとの関係性

DeploymentのレプリカのPodは、全てが同じPersistentVolumeを共有する。



> ℹ️ 参考：https://www.amazon.com/dp/1617297615

![kubernetes_deployment_perisitent-volume](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_deployment_perisitent-volume.png)

<br>

### Job

#### ▼ Jobとは

複数のPodを作成（SuccessfulCreate）し、指定された数のPodを正常に削除（SuccessfulDelete）させる。

デフォルトでは、ログの確認のためにPodは削除されず、Jobが削除されて初めてPodも削除される。

```spec.ttlSecondsAfterFinished```キーを使用すると、Podのみを自動削除できるようになる。



> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/workloads/controllers/job/
> - https://qiita.com/MahoTakara/items/82853097a1911671a704
> - https://dev.appswingby.com/kubernetes/kubernetes-%E3%81%A7-job%E3%82%92%E8%87%AA%E5%8B%95%E5%89%8A%E9%99%A4%E3%81%99%E3%82%8Bttlsecondsafterfinished%E3%81%8Cv1-21%E3%81%A7beta%E3%81%AB%E3%81%AA%E3%81%A3%E3%81%A6%E3%81%84%E3%81%9F%E4%BB%B6/

<br>

### Pod

#### ▼ Podとは

コンテナの最小グループ単位のこと。

Podを単位として、コンテナ起動/停止や水平スケールアウト/スケールインを実行する。



> ℹ️ 参考：https://kubernetes.io/docs/concepts/workloads/pods/

**＊例＊**

PHP-FPMコンテナとNginxコンテナを稼働させる場合、これら同じPod内に配置する。

![kubernetes_pod_php-fpm_nginx](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_pod_php-fpm_nginx.png)

#### ▼ 例外的なコントロールプレーンNode上のPod

脆弱性の観点で、デフォルトではコントロールプレーンNodeにPodはスケジューリングされない。これは、コントロールプレーンNodeにはTaint（```node-role.kubernetes.io/master:NoSchedule```）が設定されているためである。一方で、Nodeにはこれがないため、Podをスケジューリングできる。

> ℹ️ 参考：https://stackoverflow.com/questions/43147941/allow-scheduling-of-pods-on-kubernetes-master

```bash
# コントロールプレーンNodeの場合
$ kubectl describe node <コントロールプレーンNode名> | grep -i taint

Taints: node-role.kubernetes.io/master:NoSchedule # スケジューリングさせないTaint

# ワーカーNodeの場合
$ kubectl describe node <ワーカーNode名> | grep -i taint

Taints: <none>
```

ただし、セルフマネージドなコントロールプレーンNodeを採用している場合に、全てのコントロールプレーンNodeでTaintを解除すれば、Podを起動させられる。

コントロールプレーンNodeがマネージドではない環境（オンプレミス環境、ベアメタル環境、など）では、コントロールプレーンNodeにDaemonSetによるPodをスケジューリングすることがある。



```bash
$ kubectl taint node --all node-role.kubernetes.io/master:NoSchedule-
```

#### ▼ Podのライフサイクルフェーズ

Podのライフサイクルにはフェーズがある。


| フェーズ名               | 説明                                                                            | 補足                                                                                                                                                             |
|----------------------|-------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Completed            | Pod内の全てのコンテナが正常に終了した。                                                     |                                                                                                                                                                  |
| ContainerCreating    | Pod内にInitContainerがない場合の理由である。コンテナイメージをプルし、コンテナを作成している。                  |                                                                                                                                                                  |
| CrashLoopBackOff     | Podが、一連のフェーズ（```Running```フェーズ、```Waiting```フェーズ、```Failed```フェーズ）を繰り返している。 |                                                                                                                                                                  |
| CreateContainerError | Pod内のコンテナの作成に失敗した。                                                         |                                                                                                                                                                  |
| ErrImagePull         | Pod内のコンテナイメージのプルに失敗した。                                                       |                                                                                                                                                                  |
| Error                | Pod内のいずれかのコンテナが異常に終了した。                                                    |                                                                                                                                                                  |
| Failed               | Pod内の全てのコンテナの起動が完了し、その後に異常に停止した。                                     |                                                                                                                                                                  |
| ImagePullBackOff     | Pod内のコンテナイメージのプルに失敗した。                                                       |                                                                                                                                                                  |
| OOMKilled            | Podのメモリの空きサイズが足らず、コンテナが強制終了された。                                           |                                                                                                                                                                  |
| Pending              | PodがNodeにスケジューリングされたが、Pod内の全てのコンテナの起動がまだ完了していない。                          |                                                                                                                                                                  |
| PodInitializing      | Pod内にInitContainerがある場合の理由である。コンテナイメージをプルし、コンテナを作成している。                  |                                                                                                                                                                  |
| PostStartHookError   | PodのPostStartフックに失敗した。                                                        |                                                                                                                                                                  |
| Running              | Pod内の全てのコンテナの起動が完了し、実行中である。                                            | コンテナの起動が完了すれば```Running```フェーズになるが、コンテナ内でビルトインサーバーを起動するようなアプリケーション（例：フレームワークのビルトインサーバー機能）の場合は、```Running```フェーズであっても```Ready```コンディションではないことに注意する。 |
| Succeed              | Pod内の全てのコンテナの起動が完了し、その後に正常に停止した。                                     |                                                                                                                                                                  |
| Unknown              | NodeとPodの間の通信に異常があり、NodeがPodから情報を取得できなかった。                             |                                                                                                                                                                  |


> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase
> - https://qiita.com/tkusumi/items/825ccde31fdc3d0b8425#%E4%BB%A3%E8%A1%A8%E7%9A%84%E3%81%AA-pod-%E3%81%AE%E3%82%B9%E3%83%86%E3%83%BC%E3%82%BF%E3%82%B9%E8%A1%A8%E8%A8%98


#### ▼ Podのコンディション

各フェーズには詳細なコンディションがある。

例えば```Running```フェーズであっても、```Ready```コンディションになっていない可能性がある。

そのため、Podが正常であると見なすためには、『```Running```フェーズ』かつ『```Ready```コンディション』である必要がある。


| 各フェーズのコンディション名 | 説明                                                          |
|------------------|-------------------------------------------------------------|
| PodScheduled     | NodeへのPodのスケジューリングが完了した。                                    |
| ContainersReady  | 全てのコンテナの起動が完了し、加えてコンテナ内のアプリケーションやミドルウェアの準備が完了している。 |
| Initialized      | 全ての```init```コンテナの起動が完了した。                               |
| Ready            | Pod全体の準備が完了した。                                          |

> ℹ️ 参考：
>
> - https://stackoverflow.com/a/59354112
> - https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-conditions

#### ▼ CrashLoopBackOffのデバッグ

PodがCrashLoopBackOffになっている場合、以下を確認すると良い。

- ```kubectl logs```コマンドで、該当のコンテナのエラーログを確認する。
- ```kubectl describe nodes```コマンドで、PodがスケジューリングされているNodeを指定し、該当のPodがCPUとメモリの要求量に異常がないかを確認する。
- ```kubectl describe pods```コマンドで、該当のPodがCrashLoopBackOffになる原因を確認する。（Containersの項目で、```kubectl logs```コマンドと同じ内容も確認できる）

#### ▼ Podが削除されるまでの流れ

![pod_terminating_process](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/pod_terminating_process.png)

（１）クライアントは、```kubectl```コマンドがを使用して、Podを削除するリクエストをkube-apiserverに送信する。

（２）Podが、削除を開始する。

（３）preStopフックが起動し、```spec.preStop```キーの設定がコンテナで実行される。

（４）kubeletは、コンテナランタイムを介して、Pod内のコンテナにSIGTERMシグナルを送信する。これにより、コンテナは停止する。この時、```spec.terminationGracePeriodSeconds```キーの設定値を過ぎてもコンテナが停止していない場合は、コンテナにSIGKILLシグナルが送信され、削除プロセスは強制完了する。

（５）他のKubernetesリソース（Deployment、Service、ReplicaSets、など）の管理対象から、該当のPodが削除される。

> ℹ️ 参考：
>
> - https://qiita.com/superbrothers/items/3ac78daba3560ea406b2
> - https://zenn.dev/hhiroshell/articles/kubernetes-graceful-shutdown-experiment

#### ▼ ハードウェアリソースの割り当て

そのPodに割り当てられたハードウェアリソース（CPU、メモリ）を、Pod内のコンテナが分け合って使用する。

> ℹ️ 参考：https://qiita.com/jackchuka/items/b82c545a674975e62c04#cpu


| 単位               | 例                                       |
|--------------------|------------------------------------------|
| ```m```：millicores | ```1```コア = ```1000```ユニット = ```1000```m |
| ```Mi```：mebibyte  | ```1```Mi = ```1.04858```MB              |

#### ▼ クライアントがPod内のログを参照できる仕組み

![kubernetes_pod_logging](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_pod_logging.png)

（１）クライアント（特に```kubectl```コマンド実行者）が```kubectl logs```コマンドを実行する。

（２）kube-apiserverが、```/logs/pods/<ログへのパス>```エンドポイントにリクエストを送信する。

（３）kubeletはリクエストを受信し、Nodeの```/var/log```ディレクトリを読み込む。Nodeの```/var/log/pods/<Namespace名>_<Pod名>_<UID>/container/<数字>.log```ファイルは、Pod内のコンテナの```/var/lib/docker/container/<ID>/<ID>-json.log```ファイルへのシンボリックリンクになっているため、kubeletを介して、コンテナのログを確認できる。なお、削除されたPodのログは、引き続き```/var/log/pods```ディレクトリ配下に保管されている。

> ℹ️ 参考：https://www.creationline.com/lab/29281

補足として、DaemonSetとして稼働するFluentdは、Nodeの```/var/log```ディレクトリを読み込むことにより、Pod内のコンテナのログを収集する。



> ℹ️ 参考：https://note.com/shift_tech/n/n503b32e5cd35


#### ▼ 待ち受けるポート番号の確認

Pod内のコンテナ内で```netstat```コマンドを実行すると、コンテナが待ち受けているポート番号を確認できる。

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

Podの負荷に合わせてPodの自動水平スケーリングを実行しない（HorizontalPodAutoscalerが必要である）。

DaemonSetとは異なり、Podを指定した個数に維持管理できる。

ReplicaSetを直接的に操作するのではなく、Deployment使用してこれを行うことが推奨される。



> ℹ️ 参考：
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

Podの負荷に合わせてPodを自動水平スケーリングを実行しない（HorizontalPodAutoscalerが必要である）。

Deploymentとは異なり、ストレートフルなコンテナ（例：dbコンテナ）を含むPodを扱える。

Podが削除されてもPersistentVolumeClaimsは削除されないため、新しいPodにも同じPersistentVolumeを継続的にマウントできる。

その代わり、StatefulSetの作成後に一部の設定変更が禁止されている。



```bash
The StatefulSet "foo-pod" is invalid: spec: Forbidden: updates to statefulset spec for fields other than 'replicas', 'template', 'updateStrategy' and 'minReadySeconds' are forbidden
```

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#%E5%AE%89%E5%AE%9A%E3%81%97%E3%81%9F%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B8
> - https://sorarinu.dev/2021/08/kubernetes_01/

#### ▼ ライフサイクル

StatefulSetは、DeploymentやReplicaSetとは異なり、同時にPodを作成しない。

作成中のPodがReady状態になってから、次のPodを作成し始める。

そのためDeploymentやReplicaSetと比べて、全てのPodが揃うのに時間がかかる。



> ℹ️ 参考：https://thinkit.co.jp/article/13611

<br>

## 03. Discovery&LBリソース

### Discovery&LBリソースとは

Node上のコンテナをNode外に公開する機能を提供する。



> ℹ️ 参考：https://thinkit.co.jp/article/13542

<br>

### EndpointSlice

#### ▼ EndpointSliceとは

各Service配下に存在する。Serviceでルーティング先のPodの宛先情報を分割して管理し、Podの増減に合わせて、Podの宛先情報を追加/削除する。

kube-proxyによるサービスディスカバリーのために、Podの宛先情報を提供する。

Kubernetesのv1.6より前はEndpointsが使用されていた。

しかし、EndpointsではPodの宛先情報を一括管理しなければならず、これを分割して管理できるように、Endpointsの代わりとしてEndpointSliceが導入された。

> ℹ️ 参考：https://kubernetes.io/blog/2020/09/02/scaling-kubernetes-networking-with-endpointslices/#splitting-endpoints-up-with-the-endpointslice-api

![kubernetes_endpoint-slices](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_endpoint-slices.png)

<br>

### Ingress

#### ▼ Ingressとは

![kubernetes_ingress](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress.png)

IngressコントローラーによってNode外からインバウンド通信を受信し、単一/複数のServiceにルーティングする。

Ingressを使用する場合、ルーティング先のIngressは、Cluster IP Serviceとする。

NodePort ServiceやLoadBalancer Serviceと同様に、外部からのインバウンド通信を受信する方法の1つである。



> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/ingress/#what-is-ingress
> - https://thinkit.co.jp/article/18263
> - https://chidakiyo.hatenablog.com/entry/2018/09/10/Kubernetes_NodePort_vs_LoadBalancer_vs_Ingress%3F_When_should_I_use_what%3F_%28Kubernetes_NodePort_%E3%81%A8_LoadBalancer_%E3%81%A8_Ingress_%E3%81%AE%E3%81%A9%E3%82%8C%E3%82%92%E4%BD%BF%E3%81%86

#### ▼ ルーティング方法

ルーティング方法として、以下がある。




| ルーティング方法   | 説明                                                                                                                                                                                                                                                                                 |
|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| パスベースルーティング  | パスの値に基づいて、Serviceにルーティングする。<br>ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/ingress/#simple-fanout <br>![kubernetes_ingress_path](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress_path.png)                          |
| ホストベースルーティング | ```Host```ヘッダーの値に基づいて、Serviceにルーティングする。<br>ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/ingress/#name-based-virtual-hosting <br>![kubernetes_ingress_host](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress_host.png) |

<br>

### Ingressコントローラー

#### ▼ Ingressコントローラーとは

![kubernetes_ingress-controller](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress-controller.png)

Ingressコントローラーは、Ingressの設定に基づいてNode外からのインバウンド通信を受信し、単一/複数のIngressにルーティングする。

Kubernetesの周辺ツール（Prometheus、AlertManager、Grafana、ArgoCD）のダッシュボードを複数人で共有して参照する場合には、何らかのアクセス制限を付与したIngressを作成することになる。



> ℹ️ 参考：
>
> - https://developers.freee.co.jp/entry/kubernetes-ingress-controller
> - https://www.containiq.com/post/kubernetes-ingress
> - https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/

#### ▼ SSL証明書の割り当て

![kubernetes_ingress-controller_certificate](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress-controller_certificate.png)

Ingressコントローラーは、Secretに設定されたSSL証明書を参照し、これを内部のロードバランサー（例：Nginx）に渡す。

> ℹ️ 参考：
>
> - https://blog.sakamo.dev/post/ingress-nginx/
> - https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/https/

#### ▼ Ingressの設定値のバリデーション

Ingressコントローラーは、『```***-controller-admission```』というServiceでwebhookサーバーを公開している。

このwebhookサーバーは、新しく追加されたIngressの設定値のバリデーションを実行する。

これにより、不正なIngressが稼働することを防止できる。

このwebhookサーバーの登録時、まず『```***-create```』というPodが有効期限の長いSSL証明書を持つSecretを作成する。

その後、『```***-patch```』というPodがValidatingWebhookConfigurationにこのSSL証明書を設定し、webhookサーバーにSSL証明書が割り当てられる。

> ℹ️ 参考：
>
> - https://kubernetes.github.io/ingress-nginx/how-it-works/#avoiding-outage-from-wrong-configuration
> - https://github.com/kubernetes/ingress-nginx/tree/main/charts/ingress-nginx#ingress-admission-webhooks
> - https://blog.sakamo.dev/post/ingress-nginx/

<br>

### Service

#### ▼ Serviceとは

![kubernetes_kube-proxy_service](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_service.png)

Serviceは、kube-proxyが更新したNode上で稼働するiptablesを使用し、またロードバランシングアルゴリズムによるルーティング先Podの決定に基づいて、Podにインバウンド通信をルーティングする。

マイクロサービスアーキテクチャのコンポーネントである『Service』とは区別する。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/service/
> - https://www.mtioutput.com/entry/kube-proxy-iptable
> - https://www.amazon.co.jp/dp/B079TG2M5N/ （チャプター5）

#### ▼ ClusterIP Service

![kubernetes_clusterip-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_clusterip-service.png)

Serviceに対するインバウンド通信を、Cluster-IPを介してPodにルーティングする。

Cluster-IPはServiceの```spec.clusterIP```キーで指定しない限りランダムで決まり、Podの```/etc/resolv.conf ```ファイルに記載されている。

Pod内に複数のコンテナがある場合、各コンテナに同じ内容の```/etc/resolv.conf ```ファイルが配置される。Cluster-IPはNode外から宛先として指定できないため、インバウンド通信にIngressを必要とする。

Ingressが無いとClusterネットワーク内からのみしかアクセスできず、安全である。

一方でもしIngressを使用する場合、LoadBalancer Serviceと同様にして（レイヤーは異なるが）、PodのIPアドレスを宛先とする```L7```ロードバランサー（例：AWS ALBとAWSターゲットグループ）を自動的にプロビジョニングするため、クラウドプロバイダーのリソースとKubernetesリソースの責務の境界が曖昧になってしまう。

> ℹ️ 参考：
>
> - https://www.imagazine.co.jp/%e5%ae%9f%e8%b7%b5-kubernetes%e3%80%80%e3%80%80%ef%bd%9e%e3%82%b3%e3%83%b3%e3%83%86%e3%83%8a%e7%ae%a1%e7%90%86%e3%81%ae%e3%82%b9%e3%82%bf%e3%83%b3%e3%83%80%e3%83%bc%e3%83%89%e3%83%84%e3%83%bc%e3%83%ab/
> - https://thinkit.co.jp/article/18263
> - https://qiita.com/tkusumi/items/da474798c5c9be88d9c5#%E8%83%8C%E6%99%AF

```bash
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>] $ cat /etc/resolv.conf 

nameserver *.*.*.* # ClusterネットワークのIPアドレス
search default.svc.cluster.local svc.cluster.local cluster.local 
options ndots:5
```

#### ▼ NodePort Service

![kubernetes_nodeport-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_nodeport-service.png)

Serviceに対するインバウンド通信を、NodeのNICの宛先情報（IPアドレス、ポート番号）、Cluster-IP、を介してPodにルーティングする。

NodeのNICの宛先情報は、Node外から宛先IPアドレスとして指定できるため、インバウンド通信にIngressを必要としない。

ただし、NodePort Serviceは内部的にCluster-IPを使っているため、Ingressを作成するとNodePort ServiceのCluster-IPを介してPodにルーティングする。（この場合、NodeのIPアドレスとIngressの両方がNodeのインバウンド通信の入り口となり、入口が無闇に増えるため、やめた方が良い。）

NodeのNICの宛先情報は、Nodeの作成方法（AWS EC2、GCP GCE、VMWare）に応じて、確認方法が異なる。

Serviceのポート番号と紐づくNodeのNICのポート番号はデフォルトではランダムであるため、NodeのNICのポート番号を固定する必要がある。

この時、```1```個のNodeのポート番号につき、```1```個のServiceとしか紐づけられず、Serviceが増えていってしまうため、実際の運用にやや不向きである。

一方でクラウドプロバイダーのリソースとKubernetesの境界を明確化できる。

> ℹ️ 参考：https://stackoverflow.com/a/64605782

#### ▼ LoadBalancer Service

![kubernetes_loadbalancer-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_loadbalancer-service.png)

Serviceに対するインバウンド通信を、External-IP、NodeのNICの宛先情報、Cluster-IP、を介してPodにルーティングする。

External-IPはNode外から宛先IPアドレスとして指定できるため、インバウンド通信にIngressを必要としないが、ロードバランサーのみが宛先IPアドレスを指定できる。

クラウドプロバイダー環境（例：AWS）では、LoadBalancer Serviceを作成すると、External-IPを宛先とする```L4```ロードバランサー（例：AWS NLBとAWSターゲットグループ）を自動的にプロビジョニングするため、クラウドプロバイダーのリソースとKubernetesリソースの責務の境界が曖昧になってしまう。

> ℹ️ 参考：
>
> - https://www.imagazine.co.jp/%e5%ae%9f%e8%b7%b5-kubernetes%e3%80%80%e3%80%80%ef%bd%9e%e3%82%b3%e3%83%b3%e3%83%86%e3%83%8a%e7%ae%a1%e7%90%86%e3%81%ae%e3%82%b9%e3%82%bf%e3%83%b3%e3%83%80%e3%83%bc%e3%83%89%e3%83%84%e3%83%bc%e3%83%ab/
> - https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0
> - https://thinkit.co.jp/article/18263

#### ▼ ExternalName Service

Serviceに対するインバウンド通信をCNAMEレコードを介してPodにルーティングする。



> ℹ️ 参考：https://thinkit.co.jp/article/13739

#### ▼ Headless Service

Serviceに対するインバウンド通信を、そのままPodにルーティングする。

Podが複数ある場合は、ラウンドロビン方式でIPアドレスが返却されるため、負荷の高いPodにルーティングされる可能性があり、負荷分散には向いていない。



> ℹ️ 参考：
>
> - https://thinkit.co.jp/article/13739
> - https://hyoublog.com/2020/05/22/kubernetes-headless-service/

```bash
$ dig <Serviceの完全修飾ドメイン名>

;; QUESTION SECTION:
;<Serviceの完全修飾ドメイン名>. IN   A

;; ANSWER SECTION:
<Serviceの完全修飾ドメイン名>. 30 IN A       10.8.0.30
<Serviceの完全修飾ドメイン名>. 30 IN A       10.8.1.34
<Serviceの完全修飾ドメイン名>. 30 IN A       10.8.2.55
```

また、Headless ServiceからStatefulSetにルーティングする場合は、唯一、Podで直接的に名前解決できるようになる。



> ℹ️ 参考：https://thinkit.co.jp/article/13739

```bash
$ dig <Pod名>.<Serviceの完全修飾ドメイン名>

;; QUESTION SECTION:
;<Pod名>.<Serviceの完全修飾ドメイン名>. IN A

;; ANSWER SECTION:
<Pod名>.<Serviceの完全修飾ドメイン名>. 30 IN A 10.8.0.30
```

<br>

## 04. Config&Storageリソース

### Config&Storageリソースとは

コンテナで使用する変数、ファイル、ボリュームに関する機能を提供する。

> ℹ️ 参考：https://thinkit.co.jp/article/13542

<br>

### ConfigMap

#### ▼ ConfigMapとは

コンテナで使用する機密ではない変数やファイルをマップ型で保持できる。

改行することにより、設定ファイルも値に格納できる。

#### ▼ 機密ではない変数の例

| 変数           | 何のために使用するのか                          |
|----------------|-----------------------------------------|
| DBホスト名        | コンテナがDBに接続する時に、DBのホスト名として使用する。    |
| DBポート番号      | コンテナがDBに接続する時に、DBのポート番号として使用する。  |
| DB接続タイムアウト   | コンテナがDBに接続する時に、タイムアウト時間として使用する。  |
| DB接続再試行数 | コンテナがDBに接続する時に、再試行の回数として使用する。 |
| タイムゾーン         | コンテナ内のタイムゾーンとして使用する。                 |
| ...            | ...                                     |

<br>

### PersistentVolumeClaim

#### ▼ PersistentVolumeClaimとは

設定された条件に基づいて、作成済みのPersistentVolumeを要求し、指定したKubernetesリソースに割り当てる。

> ℹ️ 参考：https://garafu.blogspot.com/2019/07/k8s-pv-and-pvc.html

#### ▼ 削除できない

PersistentVolumeClaimを削除しようとすると、```finalizers```キー配下に```kubernetes.io/pvc-protection```値が設定され、削除できなくなることがある。

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  finalizers:
    - kubernetes.io/pvc-protection
  name: foo-persistent-volume-claim
spec:
  ...
```

この場合、```kubectl edit```コマンドなどで```finalizers```キーを空配列に編集と、削除できるようになる。

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  finalizers: []
  name: foo-persistent-volume-claim
spec:
  ...
```

> ℹ️ 参考：https://qiita.com/dss_hashimoto/items/8cbf834c504e57fbe1ff

#### ▼ NodeAffinityによるエラー

PersistentVolumeClaimは、```annotation```キー配下の```volume.kubernetes.io/selected-node```キーで紐づくPersistentVolumeが配置されているNode名を指定している。

PersistentVolumeClaimは、条件に応じてPersistentVolumeを探す。

しかし、PersistentVolumeClaimが指定するNodeと、PersistentVolumeが```spec.nodeAffinity```キーで指定するNodeが合致しないと、PersistentVolumeClaimが条件に合致するPersistentVolumeを以下のようなエラーになる。

```bash
N node(s) had volume node affinity conflict, N node(s) didn't match Pod's node affinity/selector
```

> ℹ️ 参考：https://stackoverflow.com/questions/51946393/kubernetes-pod-warning-1-nodes-had-volume-node-affinity-conflict


（１）PersistentVolumeClaimで指定するPersistentVolumeが、いずれのNodeにあるかを確認する。

```bash
$ kubectl describe pvc <PersistentVolumeClaim名>

...

Annotations:   pv.kubernetes.io/bind-completed: yes
               pv.kubernetes.io/bound-by-controller: yes
               volume.beta.kubernetes.io/storage-provisioner: kubernetes.io/aws-ebs
               volume.kubernetes.io/selected-node: ip-*-*-*-*.ap-northeast-1.compute.internal
               
...
```

（２）PodがいずれのNodeでスケジューリングされているのかを確認する。

```bash
$ kubectl get pod <Pod名> -o wide
```

（３）Nodeが異なる場合、PersistentVolumeClaimがPersistentVolumeを特定できないでいる。そのため、PersistentVolumeClaimを削除し、その後StatefulSet自体を再作成する。


（４）StatefulSetがPersistentVolumeClaimを新しく作成し、PersistentVolumeがPodに紐づく。

> ℹ️ 参考：https://github.com/kubernetes/kubernetes/issues/74374#issuecomment-466191847


<br>

### Secret

#### ▼ Secretとは

コンテナで使用する機密な変数やファイルをキーバリュー型で永続化する。

永続化されている間は```base64```方式でエンコードされており、デコードした上で、変数やファイルとして対象のPodに出力する。


> ℹ️ 参考：https://kubernetes.io/docs/concepts/configuration/secret/#uses-for-secrets

#### ▼ 機密ではない変数の例

| 変数     | 何のために使用するのか                            |
|----------|-------------------------------------------|
| DBユーザー名 | コンテナがDBに接続する時に、DBユーザーのユーザー名として使用する。 |
| DBパスワード  | コンテナがDBに接続する時に、DBユーザーのパスワードとして使用する。  |
| ...      | ...                                       |

#### ▼ コンテナイメージプルのパラメーターとして

Podの起動時に、kubectlコマンドが実行され、コンテナイメージをプルする。

Secretに永続化された値を復号化し、```kubectl```コマンドにパラメーターとして出力できる。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/configuration/secret/#using-imagepullsecrets


#### ▼ コンテナの環境変数として

永続化された値を復号化し、Pod内のコンテナに環境変数として出力できる。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/configuration/secret/#using-secrets-as-environment-variables


<br>

## 05. Clusterリソース

### Clusterリソースとは

セキュリティやクォーターに関する機能を提供する。



> ℹ️ 参考：https://thinkit.co.jp/article/13542

<br>

### CertificateSigningRequest

#### ▼ CertificateSigningRequestとは

認証局に対するSSL証明書の要求（```openssl x509```コマンド）を宣言的に設定する。

別途、秘密鍵から証明書署名要求を作成し、これをパラメーターとして設定する必要がある。



> ℹ️ 参考：https://qiita.com/knqyf263/items/aefb0ff139cfb6519e27

<br>

### NetworkPolicy

#### ▼ NetworkPolicyとは

Pod間通信でのインバウンド/アウトバウンド通信の送受信ルールを設定する。



> ℹ️ 参考：
>
> - https://www.amazon.co.jp/dp/B08FZX8PYW
> - https://qiita.com/dingtianhongjie/items/983417de88db2553f0c2

#### ▼ Ingress

他のPodからの受信するインバウンド通信のルールを設定する。

Ingressとは関係がないことに注意する。



#### ▼ Egress

他のPodに送信するアウトバウンド通信のルールを設定する。



<br>

### PersistentVolume

#### ▼ PersistentVolumeとは

新しく作成したストレージ領域をPluggableなボリュームとし、これをコンテナにボリュームマウントする。

Node上のPod間でボリュームを共有できる。

PodがPersistentVolumeを使用するためには、PersistentVolumeClaimにPersistentVolumeを要求させておき、PodでこのPersistentVolumeClaimを指定する必要がある。

アプリケーションのディレクトリ名を変更した場合は、PersistentVolumeを再作成しないと、アプリケーション内のディレクトリの読み出しでパスを解決できない場合がある。

Dockerのボリュームとは独立した機能であることに注意する。


> ℹ️ 参考：
>
> - https://thinkit.co.jp/article/14195
> - https://stackoverflow.com/questions/62312227/docker-volume-and-kubernetes-volume
> - https://stackoverflow.com/questions/53062547/docker-volume-vs-kubernetes-persistent-volume

#### ▼ PersistentVolumeの使用率の確認方法（CrashLoopBackOffでない場合）

Pod内で```df```コマンドを実行すると、PersistentVolumeの使用率を確認できる。

出力結果で、ファイルシステム全体の使用率を確認する。

```bash
$ kubectl exec -n prometheus foo-pod -- df -hT
```

ただし、CrashLoopBackOffなどが理由で、コンテナがそもそも起動しない場合、この方法で確認できない。

> ℹ️ 参考：https://stackoverflow.com/questions/53200828/how-to-identify-the-storage-space-left-in-a-persistent-volume-claim

また、Grafanaのkubernetes-mixinsには、起動中のPodのPersistentVolumeの使用率を可視化できるダッシュボードがある。

> ℹ️ 参考：https://github.com/monitoring-mixins/website/blob/master/assets/kubernetes/dashboards/persistentvolumesusage.json

#### ▼ PersistentVolumeの使用率の確認方法（CrashLoopBackOffの場合）

ここでは、Prometheusを例に挙げる。

（１）PrometheusのPodに紐づくPersistentVolumeは、最大200Giを要求していることがわかる。

```bash
$ kubectl get pvc foo-prometheus-pvc -n prometheus
NAME                 STATUS   VOLUME      CAPACITY   ACCESS MODES   STORAGECLASS    AGE
foo-prometheus-pvc   Bound    pvc-*****   200Gi      RWO            gp2-encrypted   181d
```

（２）Node内（EKS EC2 Nodeの場合）で、Podに紐づくPersistentVolumeがマウントされているディレクトリを確認する。

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

（３）```df```コマンドで、ストレージの使用率を確認する。Nodeにマウントされているデータサイズを確認すると、197Gとなっている。 PersistentVolumeに対してデータサイズが大きすぎることがわかる。

```bash
$ df -h /var/lib/kubelet/plugins/kubernetes.io/aws-ebs/mounts/aws/ap-northeast-1a/vol-*****/prometheus-db/

Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme8n1    197G  197G     0 100% /var/lib/kubelet/plugins/kubernetes.io/aws-ebs/mounts/aws/ap-northeast-1a/vol-*****
```


#### ▼ HostPath（本番環境で非推奨）

Node上に新しく作成したストレージ領域をボリュームとし、これをコンテナにバインドマウントする。

機能としては、Volumeの一種であるHostPathと同じである。

マルチNodeには対応していないため、本番環境では非推奨である。



> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes
> - https://thenewstack.io/10-kubernetes-best-practices-you-can-easily-apply-to-your-clusters/

#### ▼ Local（本番環境で推奨）

Node上に新しく作成したストレージ領域をボリュームとし、これをコンテナにバインドマウントする。

マルチNodeに対応している（明言されているわけではく、HostPathとの明確な違いがよくわからない）。



> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/storage/volumes/#local
> - https://qiita.com/sotoiwa/items/09d2f43a35025e7be782#local

<br>

### Role、ClusterRole

#### ▼ Role、ClusterRoleとは

![kubernetes_authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_authorization.png)

kube-apiserverが、認証されたKubernetesリソースからのリクエストを認可できるように、認可スコープを設定する。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole
> - https://support.huaweicloud.com/intl/en-us/usermanual-cce/cce_01_0189.html


| ロール名       | 説明                                                             | 補足                                                                                                                                                                                                                                                                                                                                                            |
|-------------|----------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Role        | Cluster内の特定のNamespaceに属するKubernetesリソースに関する認可スコープを設定する。 | RoleとRoleBindingは同じNamespaceに属する必要がある。                                                                                                                                                                                                                                                                                                                      |
| ClusterRole | Cluster内の全てのKubernesリソースに対する認可スコープを設定する。                  | ClusterRoleとClusterRoleBindingは同じNamespaceに属する必要がある。GitOpsを採用する場合、GitOpsツールはKubernetesリソースとして存在している。この時、kube-apiserverがGitOpsからのリクエストを認可できるように、GitOpsツールのServiceAccountにClusterRoleを紐づける必要がある。このClusterRoleには、全Kubernetesリソースへの全操作を許可する認可スコープを付与する。<br>ℹ️ 参考：https://dev.classmethod.jp/articles/argocd-for-external-cluster/#toc-6 |

#### ▼ RBAC：Role-based access control

Role、ClusterRole、を使用して認可スコープを制御する仕組みのこと。



> ℹ️ 参考：https://kubernetes.io/docs/reference/access-authn-authz/rbac/

<br>

### RoleBinding、ClusterRoleBinding

#### ▼ RoleBinding、ClusterRoleBindingとは

RoleやClusterRoleを、UserAccountやServiceAccountに紐づける。



> ℹ️ 参考：
>
> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding
> - https://support.huaweicloud.com/intl/en-us/usermanual-cce/cce_01_0189.html


| バインディング名          | 説明                       | 補足                                                     |
|--------------------|---------------------------|--------------------------------------------------------|
| RoleBinding        | RoleをAccountに紐づける。        | RoleとRoleBindingは同じNamespaceに属する必要がある。               |
| ClusterRoleBinding | ClusterRoleをAccountに紐づける。 | ClusterRoleとClusterRoleBindingは同じNamespaceに属する必要がある。 |

<br>

### ServiceAccount、UserAccount

#### ▼ ServiceAccount、UserAccountとは

![kubernetes_authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_authorization.png)

kube-apiserverが、リクエストの送信元を認証できるようにする。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/reference/access-authn-authz/authentication/
> - https://tech-blog.cloud-config.jp/2021-12-04-kubernetes-authentication/
> - https://support.huaweicloud.com/intl/en-us/usermanual-cce/cce_01_0189.html


| アカウント名        | 説明                                                                                                                                 | 補足                                                                                                                                                                                                                                                                             |
|----------------|------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ServiceAccount | kube-apiserverが、Kubernetesリソース（特にPod）を認証できるようにする。別途、RoleBindingやClusterRoleBindingを使用してKubernetesリソースに認可スコープを設定する必要がある。 | 標準のKubernetesリソースには自動的にServiceAccountが設定される。GitOpsを採用する場合、GitOpsツールはKubernetesリソースとして存在している。この時、kube-apiserverがGitOpsからのリクエストを認証できるように、GitOpsツールのServiceAccountを作成する必要がある。<br>ℹ️ 参考：https://dev.classmethod.jp/articles/argocd-for-external-cluster/#toc-6 |
| UserAccount    | kube-apiserverが、クライアントを認証できるようにする。別途、RoleBindingやClusterRoleBindingを使用して、クライアントに認可スコープを設定する必要がある。                        | クライアントの認証に必要なクライアント証明書は、```~/.kube/config```ファイルに登録する必要がある。                                                                                                                                                                                                           |

<br>

### Volume

#### ▼ Volumeとは

既存（Node、NFS、iSCSI、Cephなど）のボリュームをそのままKubernetesのボリュームとして使用する。



> ℹ️ 参考：https://thinkit.co.jp/article/14195

Dockerのボリュームとは独立した機能であることに注意する。



> ℹ️ 参考：
> 
> - https://stackoverflow.com/questions/62312227/docker-volume-and-kubernetes-volume
> - https://stackoverflow.com/questions/53062547/docker-volume-vs-kubernetes-persistent-volume

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

#### ▼ HostPath（本番環境で非推奨）

Node上の既存のストレージ領域をボリュームとし、コンテナにバインドマウントする。

バインドマウントは、NodeとPod内のコンテナ間で実行され、同一Node上のPod間でこのボリュームを共有できる。



> ℹ️ 参考：https://qiita.com/umkyungil/items/218be95f7a1f8d881415

HostPathは非推奨である。



> ℹ️ 参考：https://thenewstack.io/10-kubernetes-best-practices-you-can-easily-apply-to-your-clusters/

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

#### ▼ EmptyDir

Podの既存のストレージ領域をボリュームとし、コンテナにボリュームマウントする。

そのため、Podが削除されると、このボリュームも同時に削除される。

Node上のPod間でボリュームを共有できない。



> ℹ️ 参考：https://qiita.com/umkyungil/items/218be95f7a1f8d881415

#### ▼ 外部ボリューム

クラウドプロバイダーやNFSから提供されるストレージ領域を使用したボリュームとし、コンテナにマウントする。



> ℹ️ 参考：https://zenn.dev/suiudou/articles/31ab107f3c2de6#%E2%96%A0kubernetes%E3%81%AE%E3%81%84%E3%82%8D%E3%82%93%E3%81%AA%E3%83%9C%E3%83%AA%E3%83%A5%E3%83%BC%E3%83%A0

<br>

## 06. Metadataリソース

### Metadataリソースとは

> ℹ️ 参考：https://thinkit.co.jp/article/13542


<br>

## 07. 共通キー

### annotationsキー


#### ▼ ```kubernetes.io```キー

Kubernetesリソースに関する情報を設定する。

```annotations```キー配下にも同じキーがあることに注意する。


| キー               | 値の例                             | 説明                           |
|------------------|-----------------------------------|------------------------------|
| ```/createdby``` | ```aws-ebs-dynamic-provisioner``` | Kubernetesリソースを作成したツールを設定する。 |


#### ▼ ```pv.kubernetes.io```キー

PersistentVolumeに関する情報を設定する。

| キー                         | 値の例                                              | 説明                            |
|----------------------------|--------------------------------------------------|-------------------------------|
| ```/bound-by-controller``` | ```yes```                                        |                               |
| ```/provisioned-by```       | ```kubernetes.io/aws-ebs``` | そのPersistVolumeを作成したツールを設定する。 |



#### ▼ ```volume.kubernetes.io```キー

PersistentVolumeClaimに関する情報を設定する。

| キー                         | 値の例                                            | 説明                                                                                                                                                                                           |
|----------------------------|--------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ```/storage-provisioner``` | ```kubernetes.io/aws-ebs```                      | PersistentVolumeClaimに紐づくPersistentVolumeを作成したツールを設定する。                                                                                                                                      |
| ```/selected-node```       | ```ip-*-*-*-*.ap-northeast-1.compute.internal``` | PersistentVolumeClaimに紐づくPersistentVolumeが配置されているNode名を設定する。正しいNode名を指定しないと、```N node(s) had volume node affinity conflict, N node(s) didn't match Pod's node affinity/selector```というエラーになる。 |

<br>

### labelsキー

#### ▼ ```app.kubernetes.io```キー

Kubernetes上で稼働するコンテナの情報を設定する。

| キー                | 値の例                         | 説明                             |
|-------------------|-------------------------------|---------------------------------|
| ```/app```        | ```foo```、```foo-service```   | マイクロサービス名                       |
| ```/component```  | ```database```                | コンテナの役割名                      |
| ```/created-by``` | ```kube-controller-manager``` | このKubernetesリソースを作成したリソースやユーザー |
| ```/env```        | ```prd```、```stg```、```dev``` | アプリケーションの実行環境名              |
| ```/instance```   | ```mysql-12345```             | マイクロサービスコンテナのインスタンス名            |
| ```/managed-by``` | ```helm```、```foo-operator``` | アプリケーションの管理ツール名               |
| ```/name```       | ```mysql```                   | マイクロサービスを構成するコンテナのベンダー名       |
| ```/part-of```    | ```bar```                     | マイクロサービス全体のアプリケーション名          |
| ```/type```       | ```host```（PVのマウント対象）       | リソースの設定方法の種類名             |
| ```/version```    | ```5.7.21```                  | マイクロサービスのリリースバージョン名             |

> ℹ️ 参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/


#### ▼ ```argocd.argoproj.io```キー

ArgoCDを使用している場合に、ArgoCDの情報をを設定する。

| キー              | 値の例                 | 説明                                      |
|-----------------|-----------------------|-----------------------------------------|
| ```/instance``` | ```foo-application``` | Kubernetesリソースを管理するArgoCDのApplication名 |

#### ▼ ```helm.sh```キー

Helmを使用している場合に、Helmの情報を設定する。

| キー           | 値の例           | 説明           |
|--------------|-----------------|--------------|
| ```/chart``` | ```foo-chart``` | 使用しているチャート名 |


#### ▼ ```kubernetes.io```キー

Kubernetesリソースに関する情報を設定する。

```annotations```キー配下にも同じキーがあることに注意する。

| キー              | 値の例                                                      | 説明            |
|-----------------|------------------------------------------------------------|-----------------|
| ```/arch```     | ```amd64```                                                | NodeのCPUアーキテクチャ |
| ```/hostname``` | ```ip-*-*-*-*.ap-northeast-1.compute.internal```（AWSの場合） | Nodeのホスト名      |
| ```/os```       | ```linux```                                                | NodeのOS         |


#### ▼ ```topology.kubernetes.io```キー

Nodeに関する情報を設定する。


| キー            | 値の例                           | 説明               |
|---------------|-------------------------------|------------------|
| ```/region``` | ```ap-northeast-1```（AWSの場合）  | Nodeが稼働しているリージョン |
| ```/zone```   | ```ap-northeast-1a```（AWSの場合） | Nodeが稼働しているAZ    |


<br>
