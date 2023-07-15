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

$ helm install <リリース名> <チャートリポジトリ名>/kyverno -n kyverno --version <バージョンタグ>
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
  name: containers-need-have-resources-key-cluster-policy
  namespace: kyverno
spec:
  validationFailureAction: enforce
```

> - https://kyverno.io/docs/writing-policies/validate/#validation-failure-action

<br>

### background

#### ▼ backgroundとは

Kyvernoの導入後に作成/更新されるKubernetesだけでなく、既存のKubernetesリソースもKyvernoの対象とするかを設定する。

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: containers-need-have-resources-key-cluster-policy
  namespace: kyverno
spec:
  background: false
```

> - https://kyverno.io/docs/writing-policies/background/

<br>

### rules

#### ▼ rulesとは

Webhook時に実行するKyvernoのルールを設定する。

#### ▼ Mutateルールの場合

**＊実装例＊**

コンテナイメージのタグが『`latest`』だった場合に、マニフェストに`imagePullPolicy`キーを追加する。

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: containers-need-have-resources-key-cluster-policy
  namespace: kyverno
spec:
  rules:
    - name: pod-need-have-image-pull-policy-key-mutator
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

Podのマニフェストの`.spec.containers`キー以下に、`resources`キーがあるか否かを検証する。

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: pod-need-have-resources-key-cluster-policy
  namespace: kyverno
spec:
  rules:
    - name: pod-need-have-resources-key-validator
      match:
        resources:
          kinds:
            - Pod
          namespaces:
            - foo
      validate:
        message: "Containers need have resources key"
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
