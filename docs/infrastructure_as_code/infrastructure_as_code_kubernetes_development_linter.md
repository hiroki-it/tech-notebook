---
title: 【IT技術の知見】静的解析ツール＠Kubernetes
description: 静的解析ツール＠Kubernetesの知見を記録しています。
---

# 静的解析ツール＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. 文法の誤りテスト

調査中...

<br>

## 02. ベストプラクティス違反テスト

調査中...


<br>

## 03. 非推奨apiVersionテスト

### pluto

#### ▼ plutoとは

```bash
$ pluto -h

A tool to detect Kubernetes apiVersions

Usage:
  pluto [flags]
  pluto [command]

Available Commands:
  completion           Generate the autocompletion script for the specified shell
  detect               Checks a single file or stdin for deprecated apiVersions.
  detect-api-resources detect-api-resources
  detect-files         detect-files
  detect-helm          detect-helm
  help                 Help about any command
  list-versions        Outputs a JSON object of the versions that Pluto knows about.
  version              Prints the current version of the tool.

Flags:
  -f, --additional-versions string       Additional deprecated versions file to add to the list. Cannot contain any existing versions
      --columns strings                  A list of columns to print. Mandatory when using --output custom, optional with --output markdown
      --components strings               A list of components to run checks for. If nil, will check for all found in versions.
  -h, --help                             help for pluto
      --ignore-deprecations              Ignore the default behavior to exit 2 if deprecated apiVersions are found.
      --ignore-removals                  Ignore the default behavior to exit 3 if removed apiVersions are found.
  -r, --only-show-removed                Only display the apiVersions that have been removed in the target version.
  -o, --output string                    The output format to use. (normal|wide|custom|json|yaml|markdown|csv) (default "normal")
  -t, --target-versions stringToString   A map of targetVersions to use. This flag supersedes all defaults in version files. (default [])
  -v, --v Level                          number for the log level verbosity

Use "pluto [command] --help" for more information about a command.
```

#### ▼ セットアップ

```bash
$ brew install pluto
```

#### ▼ --target-versions

plutoで検証する非推奨項目のKubernetesバージョンを指定する。

```bash
$ pluto detect - -o wide --target-versions k8s=v1.23.0
```


#### ▼ detect

kube-apiserverからの返信、または標準入力で入力されたマニフェストから、リソース名単位で非推奨のapiVersionを検出する。

```pluto detect-api-resources```コマンドとの違いは調査中...

> ↪️ 参考：https://kakakakakku.hatenablog.com/entry/2022/07/20/091424

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

kube-apiserverからの返信、または標準入力で入力されたマニフェストから、リソース名単位で非推奨のapiVersionを検出する。

```pluto detect```コマンドとの違いは調査中...


```bash
$ pluto detect-api-resources - -o wide

NAME     NAMESPACE       KIND                      VERSION               REPLACEMENT      DEPRECATED   DEPRECATED IN   REMOVED   REMOVED IN
foo-cj   foo-namespace   CronJob                   batch/v1beta1         batch/v1         true         v1.21.0         false     v1.25.0  
bar-pdb  bar-namespace   PodDisruptionBudget       policy/v1beta1        policy/v1        true         v1.21.0         false     v1.25.0     
baz-hpa  baz-namespace   HorizontalPodAutoscaler   autoscaling/v2beta1   autoscaling/v2   true         v1.22.0         false     v1.25.0    
...
```

> ↪️ 参考：https://pluto.docs.fairwinds.com/quickstart/#api-resources-in-cluster


#### ▼ detect-files

標準入力されたファイルから、リソース名単位で非推奨のapiVersionを検出する。

```bash
$ pluto detect-files - -o wide
```

> ↪️ 参考：https://pluto.docs.fairwinds.com/quickstart/#file-detection-in-a-directory

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

> ↪️ 参考：https://pluto.docs.fairwinds.com/quickstart/#file-detection-in-a-directory


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
