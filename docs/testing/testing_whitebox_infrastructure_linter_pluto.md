---
title: 【IT技術の知見】 Pluto＠非推奨apiVersionテスト
description: Pluto＠非推奨apiVersionテストの知見を記録しています。
---

# Pluto＠非推奨apiVersionテスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

```bash
$ brew install pluto
```

> ↪️：https://pluto.docs.fairwinds.com/installation/

<br>

## 02. グローバルオプション

### --target-versions

plutoで検証する非推奨項目のKubernetesバージョンを指定する。

```bash
$ pluto detect - -o wide --target-versions k8s=v1.23.0
```

<br>

### -o

出力形式を指定する。

```bash
$ pluto detect - -o wide
```

> ↪️：https://pluto.docs.fairwinds.com/advanced/#display-options

```bash
$ pluto detect - -o markdown
```

> ↪️：https://pluto.docs.fairwinds.com/advanced/#display-options

<br>

## 03. サブコマンド

### detect

kube-apiserverからの返信、または標準入力で入力されたマニフェストから、リソース名単位で非推奨のapiVersionを検出する。

`pluto detect-api-resources`コマンドとの違いは記入中...

> ↪️：https://kakakakakku.hatenablog.com/entry/2022/07/20/091424

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

<br>

### detect-api-resources

kube-apiserverからの返信、または標準入力で入力されたマニフェストから、リソース名単位で非推奨のapiVersionを検出する。

`pluto detect`コマンドとの違いは記入中...

```bash
$ pluto detect-api-resources - -o wide

NAME     NAMESPACE       KIND                      VERSION               REPLACEMENT      DEPRECATED   DEPRECATED IN   REMOVED   REMOVED IN
foo-cj   foo-namespace   CronJob                   batch/v1beta1         batch/v1         true         v1.21.0         false     v1.25.0
bar-pdb  bar-namespace   PodDisruptionBudget       policy/v1beta1        policy/v1        true         v1.21.0         false     v1.25.0
baz-hpa  baz-namespace   HorizontalPodAutoscaler   autoscaling/v2beta1   autoscaling/v2   true         v1.22.0         false     v1.25.0
...
```

> ↪️：https://pluto.docs.fairwinds.com/quickstart/#api-resources-in-cluster

<br>

### detect-files

ディレクトリ内のファイルを再帰的に検証し、リソース名単位で非推奨のapiVersionを検出する。

```bash
$ pluto detect-files - -o wide
```

> ↪️：
>
> - https://pluto.docs.fairwinds.com/quickstart/#file-detection-in-a-directory
> - https://qiita.com/wadason/items/c9d5f6a475bf7764fc9d#%E6%A4%9C%E8%A8%BC

<br>

### detect-helm

kube-apiserverからの返信、または標準入力で入力されたマニフェストから、チャート単位で非推奨のapiVersionを検出する。

ローカルマシンのチャートを検証するわけでない。

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

> ↪️：https://pluto.docs.fairwinds.com/quickstart/#file-detection-in-a-directory

<br>

### list-versions

plutoが非推奨と見なしているバージョンの一覧を取得する。

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
