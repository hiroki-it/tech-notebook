---
title: 【IT技術の知見】Kubernetes＠IaC
description: Kubernetes＠IaCの知見を記録しています。
---

# Kubernetes＠IaC

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Kubernetesの仕組み

### アーキテクチャ

Kubernetesは、コントロールコンポーネント、Nodeコンポーネント、から構成される。

![kubernetes_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_architecture.png)


> ℹ️ 参考：https://kubernetes.io/docs/concepts/overview/components/


<br>


## 02. 証明書

### デフォルトの証明書

![kubernetes_certificates](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_certificates.png)

コンポーネント間でHTTPSプロトコルを使用するためにはクライアント証明書やSSL証明書が必須であり、必須ではないが、通信をさらに安全にするためにクライアント証明書が使用されているところがある。

クライアント証明書の場合、これを使用するクライアント側には、クライアント証明書と秘密鍵の両方を配置することになる。



| 送信元                                             | 宛先           | 種類         | Node上の証明書のマウント先（kubeadmの場合）                                                        | 説明                                                                                                                                                                                                                                                                                                    |
|----------------------------------------------------|----------------|------------|-------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| kube-apiserver                                     | kubelet        | クライアント証明書 | ```/etc/kubernetes/kubelet.conf ```ファイル（証明書の中身は```/var/lib/kubelet/pki/*.pem```ファイル） | kube-apiserverが、kubeletにHTTPSリクエストを送信するための証明書。                                                                                                                                                                                                                                                     |
| kube-apiserver                                     | etcd           | クライアント証明書 | 調査中...                                                                                 | kube-apiserverが、etcdにHTTPSリクエストを送信するための証明書。                                                                                                                                                                                                                                                        |
| クライアント（```kubectl```クライアント、Kubernetesリソース）のローカルマシン | kube-apiserver | クライアント証明書 | ```/etc/kubernetes/admin.conf```ファイル                                                      | クライアントが、kube-apiserverにHTTPSリクエストを送信するための証明書。証明書の値は、```~/.kube/config```ファイルの```client-certificate-data```キーに設定されている。証明書に不一致があると、クライアントからのリクエストで、『```x509: certificate has expired or is not yet valid```』や『```error: You must be logged in to the server (Unauthorized)```』というエラーになる。 |
| kube-controller-manager                            | kube-apiserver | クライアント証明書 | ```/etc/kubernetes/controller-manager.conf ```ファイル                                        | kube-controller-managerがkube-apiserverにHTTPSリクエストを送信するための証明書。証明書とは別に、```~/.kube/config```ファイルも必要になる。                                                                                                                                                                                         |
| kube-scheduler                                     | kube-apiserver | クライアント証明書 | ```/etc/kubernetes/scheduler.conf ```ファイル                                                 | kube-schedulerがkube-apiserverにHTTPSリクエストを送信するための証明書。証明書とは別に、```~/.kube/config```ファイルも必要になる。                                                                                                                                                                                                  |
| その他のコンポーネント                                       | kube-apiserver | SSL証明書    | 調査中...                                                                                 | kube-apiserverが各コンポーネントからHTTPSリクエストを受信するための証明書。                                                                                                                                                                                                                                                   |
| kube-apiserver                                     | kubelet        | SSL証明書    | 調査中                                                                                    | kubeletが、kube-apiserverからのHTTPSリクエストを受信するための証明書。                                                                                                                                                                                                                                                   |
| kube-apiserver                                     | front-proxy    | SSL証明書    | 調査中...                                                                                 | front-proxyが、kube-apiserverからのHTTPSリクエストを受信するための証明書。                                                                                                                                                                                                                                               |


> ℹ️ 参考：
>
> - https://kubernetes.io/docs/setup/best-practices/certificates/#how-certificates-are-used-by-your-cluster
> - https://milestone-of-se.nesuke.com/sv-advanced/digicert/client-cert/


<br>

### SSL証明書の期限

#### ▼ 期限の確認方法

各SSL証明書の有効期限は```1```年間である。

証明書は、KubernetesリソースのConfigの```client-certificate-data```キー配下に設定されている。

```openssl```コマンドの標準入力にこれを渡すと、証明書の期限を確認できる。

Kubernetesでは非常に多くの証明書があるため、期限切れの証明書を特定することは大変である。

> ℹ️ 参考：https://github.com/prometheus-operator/kube-prometheus/issues/881#issuecomment-452356415

```bash
$ cat <証明書が設定されたConfigのマニフェストへのパス> \
    | grep client-certificate-data \
    | cut -f2 -d : \
    | tr -d ' ' \
    | base64 -d \
    | openssl x509 -noout -dates


notBefore=Dec  9 09:31:55 2020 GMT # 開始日
notAfter=Jan 10 09:31:55 2022 GMT  # 終了日
```

Configによっては、証明書のパスが設定されている場合がある。

その場合は、```openssl```コマンドで直接的にこれを指定する。



```bash
$ openssl x509 -noout -dates -in <証明書へのパス>
```

#### ▼ 更新方法

```kubelet```プロセスの実行時に、```--rotate-certificates```オプションを有効化すると、証明書の更新処理を自動化できる。

> ℹ️ 参考：https://kubernetes.io/docs/tasks/tls/certificate-rotation/#enabling-client-certificate-rotation


<br>
