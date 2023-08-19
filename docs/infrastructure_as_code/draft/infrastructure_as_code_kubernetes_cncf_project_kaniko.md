---
title: 【IT技術の知見】Kaniko＠CNCFプロジェクト
description: Kaniko＠CNCFプロジェクトの知見を記録しています。
---

# Kaniko＠CNCFプロジェクト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## セットアップ

コンテナ内でコンテナイメージをビルドする。

Docker in Dockerを回避できる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: kaniko
spec:
  containers:
    - name: kaniko
      image: gcr.io/kaniko-project/executor:latest
      args:
        # コンテナ内でビルドしたいDockerfileのパスを設定する
        - "--dockerfile=./docker/Dockerfile"
        # 記入中...
        - "--context=gs://kaniko-bucket/context.tar.gz"
        # ビルドしたコンテナイメージのキャッシュを作成するリポジトリを設定する
        - "--destination=gcr.io/kaniko-project/cache"
      volumeMounts:
        - name: kaniko-secret
          mountPath: /secret
      env:
        - name: GOOGLE_APPLICATION_CREDENTIALS
          value: /secret/kaniko-secret.json
  restartPolicy: Never
  volumes:
    - name: kaniko-secret
      secret:
        secretName: kaniko-secret
```

> - https://github.com/GoogleContainerTools/kaniko#running-kaniko

<br>
