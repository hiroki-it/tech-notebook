---
title: 【IT技術の知見】Job系＠リソース定義
description: Job系＠リソース定義の知見を記録しています。
---

# Job系＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 専用Job

Jobに、ArgoCDのSyncに伴う処理を設定する。

<br>

## 02.metadata

### generateName

Jobに、`Sync`フェーズフック名を設定する。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  generateName: foo-hook
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/resource_hooks/#generate-name

<br>

### annotations

#### ▼ argocd.argoproj.io/hook

Jobに、ArgoCDの`Sync`フェーズを設定する。

設定したフェーズのタイミングで、ArgoCDはこのJobをフックする。

| 設定項目 | 処理の実行タイミング | 適するJobの処理                                    |
| -------- | -------------------- | -------------------------------------------------- |
| PreSync  | Syncの前             | DBマイグレーション処理                             |
| Sync     | Syncと同時           | Deploymentのアップデート戦略以外のデプロイ実行処理 |
| Skip     | Syncスキップ時       |                                                    |
| PostSync | Syncの後             | ヘルスチェック                                     |
| SyncFail | Syncの失敗時         | Sync失敗の残骸となったKubernetesリソースの削除処理 |

> - https://argo-cd.readthedocs.io/en/stable/user-guide/resource_hooks/
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/#sync-phases-and-waves

**＊実行例＊**

DBマイグレーションを実行するJobを定義しておき、これをArgoCDのSync前にフックする。

フックのタイミングは、`argocd.argoproj.io/hook`キーで設定する。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-migration-job
  annotations:
    # Syncの前に実行する。
    argocd.argoproj.io/hook: PreSync
    # 次のフック前に削除する。
    argocd.argoproj.io/hook-delete-policy: BeforeHookCreation
    # 優先度を設定する。
    argocd.argoproj.io/sync-wave: 1
spec:
  backoffLimit: 0
  template:
    spec:
      containers:
        - name: foo-app
          image: foo-app:1.0.0
          command: ["<マイグレーションを実行するためのコマンド>"]
          envFrom:
            - secretRef:
                # DBの接続情報 (ホスト、ユーザー名、パスワード) はSecretに設定しておく。
                name: foo-secret
      restartPolicy: Never
```

> - https://qiita.com/butterv/items/65d8663dfa3a69f1bc55
> - https://blog.manabusakai.com/2018/04/migration-job-on-kubernetes/

#### ▼ argocd.argoproj.io/sync-wave

同じ`Sync`フェーズに実行するように設定したJobが複数ある場合、Jobの実行の優先度付けを設定する。

正負の数字を設定でき、数字が小さい方が優先される。

優先度が同じ場合、ArgoCDがよしなに順番を決めてしまう。

デフォルトでは優先度が`0`であるため、必ず明示的に設定しておく。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  annotations:
    argocd.argoproj.io/hook: SyncFail
    argocd.argoproj.io/sync-wave: -1 # 優先度-1 (3個の中で一番優先される)
```

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  annotations:
    argocd.argoproj.io/hook: SyncFail
    argocd.argoproj.io/sync-wave: 0 # 優先度0 (デフォルトで0になる)
```

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  annotations:
    argocd.argoproj.io/hook: SyncFail
    argocd.argoproj.io/sync-wave: 1 # 優先度1
```

> - https://weseek.co.jp/tech/95/
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/#how-do-i-configure-waves

<br>
