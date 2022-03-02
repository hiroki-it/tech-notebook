---
title: 【知見を記録するサイト】Argo＠DevOps
description: Argo＠DevOpsの知見をまとめました．
---

# Argo＠DevOps

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 仕組み

### 基本構造

指定したブランチのコードの状態を監視する．プッシュによってコードが変更された場合に，Kubernetesの状態をこれに同期する．

![argo](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argo.png)

参考：

- https://blog.vpantry.net/2021/01/cicd-2/
- https://qiita.com/kanazawa1226/items/bb760bddf8bd594379cb
- https://blog.argoproj.io/introducing-argo-cd-declarative-continuous-delivery-for-kubernetes-da2a73a780cd

<br>

### AWSで使う場合

参考：https://www.ogis-ri.co.jp/otc/hiroba/technical/kubernetes_use/part1.html

![argo_eks](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argo_eks.png)

<br>

## 02. セットアップ

ドキュメント：https://argo-cd.readthedocs.io/en/stable/getting_started/

実運用する場合は，ArgoCDの操作をCircleCI上から行う必要がある（たぶん）

1. ArgoCDを動かすためリソースをKubernetes上にデプロイする．<--- CircleCI上でやる（たぶん）

```bash
$ kubectl create namespace argocd
$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

2. ArgoCDのコマンドをインストールする．

```bash
$ brew install argocd
```

3. ダッシュボードを公開する．

```bash
$ kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
```

4. ダッシュボードのパスワードを取得する．

```bash
$ kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

5. ArgoCD上に，監視対象のアプリケーションのGitリポジトリを登録する．

```bash
$ argocd app create guestbook --repo https://github.com/argoproj/argocd-example-apps.git --path guestbook --dest-server https://kubernetes.default.svc --dest-namespace default
```


6. 今回は，サンプルアプリをローカルPC上にデプロイする．ArgoCD上でアプリケーションの監視を実行する．監視対象のGitリポジトリの最新コミットが更新されると，これを自動的にプルしてくれる．アプリケーションのデプロイにはCircleCIが関与しておらず，Kubernetes上に存在するArgoCDがデプロイを行なっていることに注意する．

```bash
$ argocd app sync guestbook
```
