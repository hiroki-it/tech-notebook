---
title: 【IT技術の知見】Job系＠リソース定義
description: Job系＠リソース定義の知見を記録しています。
---

# Job系＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 専用Job

### .metadata

#### ▼ generateName

`Sync`フェーズフック名を設定する。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  generateName: foo-hook
```

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/resource_hooks/#generate-name

<br>

### .metadata.annotations

#### ▼ argocd.argoproj.io/hook

フックを設定する`Sync`フェーズ (Sync前、Sync時、Syncスキップ時、Sync後、Sync失敗時) を設定する。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  annotations:
    argocd.argoproj.io/hook: SyncFail # Sync失敗時
```

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/resource_hooks/#usage
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/#sync-phases-and-waves

#### ▼ argocd.argoproj.io/sync-wave

同じ`Sync`フェーズに実行するように設定したフックが複数ある場合、これらの実行の優先度付けを設定する。

正負の数字を設定でき、数字が小さい方が優先される。

優先度が同じ場合、ArgoCDがよしなに順番を決めてしまう。

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

> ↪️ 参考：
>
> - https://weseek.co.jp/tech/95/
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/#how-do-i-configure-waves

<br>
