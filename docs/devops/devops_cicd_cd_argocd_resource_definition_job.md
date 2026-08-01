---
title: 【IT技術の知見】Job系＠リソース定義
description: Job系＠リソース定義の知見を記録しています。
---

# Job 系＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 専用 Job

Job に、ArgoCD の Sync に伴う処理を設定する。

<br>

## 02.metadata

### generateName

Job に、`Sync` フェーズフック名を設定する。

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

Job に、ArgoCD の `Sync` フェーズを設定する。

設定したフェーズのタイミングで、ArgoCD はこの Job をフックする。

| 設定項目 | 処理の実行タイミング | 適する Job の処理                                                           |
| -------- | -------------------- | --------------------------------------------------------------------------- |
| PreSync  | Sync の前            | DB マイグレーション処理（アプリケーションを起動する前に実行する必要がある） |
| Sync     | Sync と同時          | Deployment のアップデート戦略以外のデプロイ実行処理                         |
| Skip     | Sync スキップ時      |                                                                             |
| PostSync | Sync の後            | ヘルスチェック                                                              |
| SyncFail | Sync の失敗時        | Sync 失敗の残骸となった Kubernetes リソースの削除処理                       |

> - https://argo-cd.readthedocs.io/en/stable/user-guide/resource_hooks/
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/#sync-phases-and-waves

**＊実行例＊**

DB マイグレーションを実行する Job を定義しておき、これを ArgoCD の Sync 前にフックする。

フックのタイミングは、`argocd.argoproj.io/hook` キーで設定する。

その場合、`DBマイグレーション ---> ArgoCD Sync開始 ---> アプリ起動 ---> ArgoCD Sync完了` という流れになる。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-migration-job
  annotations:
    # Sync の前に実行する。
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
                # DB の接続情報 (ホスト、ユーザー名、パスワード) は Secret に設定しておく。
                name: foo-secret
      restartPolicy: Never
```

もし ArgoCD の `Sync` フェーズを使用しない場合、アプリケーションの起動直前に DB マイグレーションを実行してしまってもよい。

その場合、`ArgoCD Sync開始 ---> DBマイグレーション ---> アプリ起動 ---> ArgoCD Sync完了` という流れになる。

```dockerfile
FROM node:22.11.0-bullseye-slim as base

...

# Node.jsアプリケーションの起動直前にDBマイグレーションを実行してしまう
ENTRYPOINT ["npx prisma migrate deploy", "npm run start"]
```

もし手動でマイグレーションを実行する運用であれば、`kubectl exec` コマンドで接続した後に、マイグレーションコマンドを実行する。

```bash
$ kubectl exec -it <Pod名> -- bash

/usr/local/src/foo/node_modules/.bin/prisma migrate deploy
```

> - https://qiita.com/butterv/items/65d8663dfa3a69f1bc55
> - https://blog.manabusakai.com/2018/04/migration-job-on-kubernetes/

#### ▼ argocd.argoproj.io/sync-wave

同じ `Sync` フェーズに実行するように設定した Job が複数ある場合、Job の実行の優先度付けを設定する。

正負の数字を設定でき、数字が小さいほうを優先する。

優先度が同じ場合、ArgoCD がよしなに順番を決めてしまう。

デフォルトでは優先度が `0` であるため、必ず明示的に設定しておく。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  annotations:
    argocd.argoproj.io/hook: SyncFail
    argocd.argoproj.io/sync-wave: -1 # 優先度-1 (3 個の中で一番優先される)
```

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  annotations:
    argocd.argoproj.io/hook: SyncFail
    argocd.argoproj.io/sync-wave: 0 # 優先度 0 (デフォルトで 0になる)
```

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  annotations:
    argocd.argoproj.io/hook: SyncFail
    argocd.argoproj.io/sync-wave: 1 # 優先度 1
```

> - https://weseek.co.jp/tech/95/
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/#how-do-i-configure-waves

<br>
