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

> ℹ️ 参考：https://kubernetes.io/docs/concepts/overview/components/

![kubernetes_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_architecture.png)

<br>


## 02. SSL証明書

### デフォルトのSSL証明書

コンポーネント間でHTTPSプロトコルを使用するためにはSSL証明書が必須であり、必須ではないが、通信をさらに安全にするためにクライアント証明書が使用されているところがある。クライアント証明書の場合、これを使用するクライアント側には、クライアント証明書と秘密鍵の両方を配置することになる。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/setup/best-practices/certificates/#how-certificates-are-used-by-your-cluster
> - https://milestone-of-se.nesuke.com/sv-advanced/digicert/client-cert/

![kubernetes_certificates](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_certificates.png)

| 送信元                     | 宛先            | 種類        | 説明                                                                                           |
|-------------------------|----------------|-----------|----------------------------------------------------------------------------------------------|
| kube-apiserver          | kubelet        | クライアント証明書 | kube-apiserverが、kubeletにHTTPSリクエストを送信するための証明書。                                               |
| kube-apiserver          | etcd           | クライアント証明書 | kube-apiserverが、etcdにHTTPSリクエストを送信するための証明書。                                                      |
| クライアント（```kubectl```クライアント、Kubernetesリソース）のローカルマシン          | kube-apiserver | クライアント証明書 | クライアントが、kube-apiserverにHTTPSリクエストを送信するための証明書。証明書の値は、```~/.kube/config```ファイルの```client-certificate-data```キーに設定されている。証明書に不一致があると、クライアントからのリクエストで、『```x509: certificate has expired or is not yet valid```』や『```error: You must be logged in to the server (Unauthorized)```』というエラーになる。                                  |
| kube-controller-manager | kube-apiserver | クライアント証明書 | kube-controller-managerがkube-apiserverにHTTPSリクエストを送信するための証明書。証明書とは別に、```~/.kube/config```ファイルも必要になる。 |
| kube-scheduler          | kube-apiserver | クライアント証明書 | kube-schedulerがkube-apiserverにHTTPSリクエストを送信するための証明書。証明書とは別に、```~/.kube/config```ファイルも必要になる。          |
| その他のコンポーネント             | kube-apiserver    | SSL証明書    | kube-apiserverが各コンポーネントからHTTPSリクエストを受信するための証明書。                                                  |
| kube-apiserver          | kubelet             | SSL証明書    | kubeletが、kube-apiserverからのHTTPSリクエストを受信するための証明書。                                                 |
| kube-apiserver          | front-proxy         | SSL証明書    | front-proxyが、kube-apiserverからのHTTPSリクエストを受信するための証明書。                                             |

<br>

#### ▼ SSL証明書の期限と更新

各SSL証明書の有効期限は```1```年間である。```kubelet```プロセスの実行時に、```--rotate-certificates```オプションを有効化すると、証明書の更新処理を自動化できる。

> ℹ️ 参考：https://kubernetes.io/docs/tasks/tls/certificate-rotation/#enabling-client-certificate-rotation


<br>
