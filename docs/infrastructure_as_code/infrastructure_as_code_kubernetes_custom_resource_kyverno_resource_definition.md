---
title: 【IT技術の知見】リソース定義＠Kyverno
description: リソース定義＠Kyvernoの知見を記録しています。
---

# リソース定義＠Kyverno

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. セットアップ

### インストール

#### ▼ チャートとして

チャートとしてkyvernoをインストールし、リソースを作成する。



> ℹ️ 参考：https://kyverno.github.io/kyverno/

```bash
$ helm repo add <チャートリポジトリ名> https://kyverno.github.io/kyverno/

$ helm repo update

$ kubectl create namespace kyverno

$ helm install <リリース名> <チャートリポジトリ名>/kyverno -n kyverno --version <バージョンタグ>
```

<br>

## 02. ClusterPolicy

### validationFailureAction

#### ▼ validationFailureActionとは

ルールに則っていないKubernetesリソースの作成/更新があった場合に、これを拒否するか、または許可するが監査ログを記録するかを設定する。



> ℹ️ 参考：https://kyverno.io/docs/writing-policies/validate/#validation-failure-action

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: containers-need-have-resources-key-cluster-policy
  namespace: kyverno
spec:
  validationFailureAction: enforce
```

<br>


### background

#### ▼ backgroundとは

Kyvernoの導入後に作成/更新されるKubernetesだけでなく、既存のKubernetesリソースもKyvernoの対象とするかを設定する。



> ℹ️ 参考：https://kyverno.io/docs/writing-policies/background/

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: containers-need-have-resources-key-cluster-policy
  namespace: kyverno
spec:
  background: false
```

<br>

### rules

#### ▼ rulesとは

Webhook時に実行するKyvernoのルールを設定する。



#### ▼ Mutateルールの場合

> ℹ️ 参考：https://kyverno.io/docs/writing-policies/mutate/

**＊実装例＊**

コンテナイメージのタグが『```latest```』だった場合に、マニフェストに```imagePullPolicy```キーを追加する。



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

#### ▼ Validateルールの場合

> ℹ️ 参考：https://kyverno.io/docs/writing-policies/validate/#basic-validations

**＊実装例＊**

Podのマニフェストの```spec.containers```キー以下に、```resources```キーがあるか否かを検証する。



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

<br>
