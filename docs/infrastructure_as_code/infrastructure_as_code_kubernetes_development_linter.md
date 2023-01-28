---
title: 【IT技術の知見】静的解析ツール＠Kubernetes
description: 静的解析ツール＠Kubernetesの知見を記録しています。
---

# 静的解析ツール＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. 文法の誤りテスト

調査中...

<br>

## 02. ベストプラクティス違反テスト

調査中...


<br>

## 03. 非推奨apiVersionテスト

### pluto

#### ▼ セットアップ

```bash
$ brew install pluto
```

#### ▼ detect

kube-apiserverからの返信、または標準入力で入力されたマニフェストから、リソース名単位で非推奨のapiVersionを検出する。```pluto detect-api-resources```コマンドとの違いは調査中...

> ℹ️ 参考：https://kakakakakku.hatenablog.com/entry/2022/07/20/091424

```bash
$ pluto detect - -o wide

NAME     NAMESPACE       KIND                      VERSION               REPLACEMENT      DEPRECATED   DEPRECATED IN   REMOVED   REMOVED IN
foo-cj   foo-namespace   CronJob                   batch/v1beta1         batch/v1         true         v1.21.0         false     v1.25.0  
bar-pdb  bar-namespace   PodDisruptionBudget       policy/v1beta1        policy/v1        true         v1.21.0         false     v1.25.0     
baz-hpa  baz-namespace   HorizontalPodAutoscaler   autoscaling/v2beta1   autoscaling/v2   true         v1.22.0         false     v1.25.0    
...
```

```bash
$ helm template foo-chart -f values-prd.yaml | pluto detect - -o wide

NAME     NAMESPACE       KIND                      VERSION               REPLACEMENT      DEPRECATED   DEPRECATED IN   REMOVED   REMOVED IN
foo-cj   foo-namespace   CronJob                   batch/v1beta1         batch/v1         true         v1.21.0         false     v1.25.0  
```


#### ▼ detect-api-resources

kube-apiserverからの返信、または標準入力で入力されたマニフェストから、リソース名単位で非推奨のapiVersionを検出する。```pluto detect```コマンドとの違いは調査中...

> ℹ️ 参考：https://pluto.docs.fairwinds.com/quickstart/#api-resources-in-cluster

```bash
$ pluto detect-api-resources - -o wide

NAME     NAMESPACE       KIND                      VERSION               REPLACEMENT      DEPRECATED   DEPRECATED IN   REMOVED   REMOVED IN
foo-cj   foo-namespace   CronJob                   batch/v1beta1         batch/v1         true         v1.21.0         false     v1.25.0  
bar-pdb  bar-namespace   PodDisruptionBudget       policy/v1beta1        policy/v1        true         v1.21.0         false     v1.25.0     
baz-hpa  baz-namespace   HorizontalPodAutoscaler   autoscaling/v2beta1   autoscaling/v2   true         v1.22.0         false     v1.25.0    
...
```

#### ▼ detect-helm

kube-apiserverからの返信、または標準入力で入力されたマニフェストから、チャート単位で非推奨のapiVersionを検出する。


```bash
$ pluto detect-helm - -o wide

NAME       NAMESPACE       KIND                      VERSION               REPLACEMENT      DEPRECATED   DEPRECATED IN   REMOVED   REMOVED IN
foo-chart  foo-namespace   CronJob                   batch/v1beta1         batch/v1         true         v1.21.0         false     v1.25.0  
bar-chart  bar-namespace   PodDisruptionBudget       policy/v1beta1        policy/v1        true         v1.21.0         false     v1.25.0     
baz-chart  baz-namespace   HorizontalPodAutoscaler   autoscaling/v2beta1   autoscaling/v2   true         v1.22.0         false     v1.25.0     
...
```


```bash
$ helm template foo-chart -f values-prd.yaml | pluto detect-helm - -o wide

NAME       NAMESPACE       KIND                      VERSION               REPLACEMENT      DEPRECATED   DEPRECATED IN   REMOVED   REMOVED IN
foo-chart  foo-namespace   CronJob                   batch/v1beta1         batch/v1         true         v1.21.0         false     v1.25.0  
```

> ℹ️ 参考：https://pluto.docs.fairwinds.com/quickstart/#file-detection-in-a-directory


#### ▼ list-versions

Plutoが非推奨と見なしているバージョンの一覧を取得する。



```bash
$ pluto list-versions

KIND                             NAME                                   DEPRECATED IN   REMOVED IN   REPLACEMENT                            COMPONENT     
Deployment                       extensions/v1beta1                     v1.9.0          v1.16.0      apps/v1                                k8s           
Deployment                       apps/v1beta2                           v1.9.0          v1.16.0      apps/v1                                k8s           
Deployment                       apps/v1beta1                           v1.9.0          v1.16.0      apps/v1                                k8s           
StatefulSet                      apps/v1beta1                           v1.9.0          v1.16.0      apps/v1                                k8s           
StatefulSet                      apps/v1beta2                           v1.9.0          v1.16.0      apps/v1                                k8s           
NetworkPolicy                    extensions/v1beta1                     v1.9.0          v1.16.0      networking.k8s.io/v1                   k8s           
Ingress                          extensions/v1beta1                     v1.14.0         v1.22.0      networking.k8s.io/v1                   k8s           
Ingress                          networking.k8s.io/v1beta1              v1.19.0         v1.22.0      networking.k8s.io/v1                   k8s           
IngressClass                     networking.k8s.io/v1beta1              v1.19.0         v1.22.0      networking.k8s.io/v1                   k8s           
DaemonSet                        apps/v1beta2                           v1.9.0          v1.16.0      apps/v1                                k8s           
DaemonSet                        extensions/v1beta1                     v1.9.0          v1.16.0      apps/v1                                k8s           
PodSecurityPolicy                extensions/v1beta1                     v1.10.0         v1.16.0      policy/v1beta1                         k8s           
PodSecurityPolicy                policy/v1beta1                         v1.21.0         v1.25.0      n/a                                    k8s        
...
```


<br>

## 04. 脆弱性テスト

### kube-score

#### ▼ セットアップ

```bash
$ brew install kube-score
```

#### ▼ score

```bash
$ helm template foo-chart -f values-prd.yaml | kube-score score -
```

<br>
