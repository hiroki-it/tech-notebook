---
title: 【IT技術の知見】Kaniko＠CNCFプロジェクト
description: Kaniko＠CNCFプロジェクトの知見を記録しています。
---

# Kaniko＠CNCFプロジェクト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

コンテナ内でコンテナイメージをビルドする。

Docker in Dockerを回避できる。

<br>

## 02. `config.json`ファイル

### `config.json`ファイルとは

Kanikoのオプションを設定する。

イメージレジストリごとに、認証処理ヘルパーがある。

```yaml
{
  "credHelpers":
    {"<AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com": "ecr-login"},
}
```

> - https://github.com/awslabs/amazon-ecr-credential-helper#configuration

<br>

### 機密情報の設定

機密情報は、動的に設定できるようにする。

```bash
$ aws ecr get-login-password --region ap-northeast-1 \
    | docker login --username AWS --password-stdin <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com

$ cat > /kaniko/.docker/config.json << EOF
  {
    ...
  }
  EOF
```

> - https://github.com/GoogleContainerTools/kaniko/tree/main#pushing-to-different-registries
> - https://int128.hatenablog.com/entry/2019/09/25/204930

<br>

## 03. コマンド

### Podの場合

#### ▼ AWS ECR

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
        - name: aws-credentials
          value: /root/.aws/
  restartPolicy: Never
  volumes:
    - name: aws-credentials
      secret:
        secretName: aws-credentials
```

> - https://github.com/GoogleContainerTools/kaniko#running-kaniko
> - https://github.com/GoogleContainerTools/kaniko/tree/main#pushing-to-amazon-ecr

<br>
