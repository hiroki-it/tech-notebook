---
title: 【IT技術の知見】リソース定義＠Kyverno
description: リソース定義＠Kyvernoの知見を記録しています。
---

# リソース定義＠Kyverno

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://kyverno.github.io/kyverno/

$ helm repo update

$ kubectl create namespace kyverno

$ helm install <Helmリリース名> <チャートリポジトリ名>/kyverno -n kyverno --version <バージョンタグ>
```

> - https://kyverno.github.io/kyverno/

<br>

## 02. ClusterPolicy

### validationFailureAction

#### ▼ validationFailureActionとは

ルールに則っていないKubernetesリソースの作成/更新があった場合に、これを拒否するか、または許可するが監査ログを記録するかを設定する。

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: foo-policy
  namespace: kyverno
spec:
  validationFailureAction: enforce
```

> - https://kyverno.io/docs/writing-policies/validate/#validation-failure-action

<br>

### background

#### ▼ backgroundとは

Kyvernoの導入後に作成/更新されるKubernetesだけでなく、導入前の既存のKubernetesリソースもKyvernoの検査対象とするかを設定する。

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: foo-policy
  namespace: kyverno
spec:
  background: "false"
```

> - https://kyverno.io/docs/writing-policies/background/

<br>

### rules

#### ▼ rulesとは

Webhook時に実行するKyvernoのルールを設定する。

#### ▼ Mutateルールの場合

**＊実装例＊**

コンテナイメージのタグ名が『`latest`』だった場合に、マニフェストに`imagePullPolicy`キーを追加する。

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: foo-policy
  namespace: kyverno
spec:
  rules:
    - name: pod-image-pull-policy-mutator
      match:
        any:
          - resources:
              kinds:
                - Pod
      mutate:
        patchStrategicMerge:
          spec:
            containers:
              - (image): "*:latest"
                imagePullPolicy: "IfNotPresent"
```

> - https://kyverno.io/docs/writing-policies/mutate/

#### ▼ Validateルールの場合

**＊実装例＊**

Podのマニフェストの`metadata.labels`キー以下に、`app.kubernetes.io/name`キーがあるか否かを検証する。

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: foo-policy
  namespace: kyverno
spec:
  rules:
    - name: pod-labels-validator
      match:
        any:
          - resources:
              kinds:
                - Pod
      validate:
        message: "Label ('app.kubernetes.io/name') is required"
        pattern:
          metadata:
            labels:
              app.kubernetes.io/name: "?*"
```

> - https://zenn.dev/k6s4i53rx/articles/5942b9e77b041b#dry-run-%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B

**＊実装例＊**

Podのマニフェストの`.spec.containers`キー以下に、`resources`キーがあるか否かを検証する。

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: foo-policy
  namespace: kyverno
spec:
  rules:
    - name: pod-container-resources-validator
      match:
        resources:
          kinds:
            - Pod
          namespaces:
            - foo
      validate:
        message: "Container resources is required"
        pattern:
          spec:
            containers:
              - name: "*"
                resources:
                  limits:
                    memory: "?*"
                    cpu: "?*"
                  requests:
                    memory: "?*"
                    cpu: "?*"
```

> - https://kyverno.io/docs/writing-policies/validate/#basic-validations

<br>
