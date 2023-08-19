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
        # 指定したDockerfileのあるディレクトリをカレントディレクトリとして、dockerデーモンに送信するディレクトリを設定する
        - "--context=."
        # ビルドしたコンテナイメージのキャッシュを作成するリポジトリを設定する
        - "--destination=****.dkr.ecr.ap-northeast-1.amazonaws.com/kaniko"
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
