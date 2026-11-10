---
title: 【IT技術の知見】Kaniko＠Docker
description: Kaniko＠Dockerの知見を記録しています。
---

# Kaniko＠Docker

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. Kaniko とは

コンテナ内でコンテナイメージのビルドをエミュレートする。

これにより、Docker in Docker の問題を回避できる。

また、Kubernetes Cluster 内でコンテナイメージをビルドできるようになる。

レイヤー単位でコンテナイメージのキャッシュを作成できる。

そのため、都度、コンテナイメージをビルドしなくてよくなる。

2026/02/28 時点でサポートが停止しており、BuildKit などの代替ツールに移行したほうがよい。

> - [コンテナイメージビルドが遅いなら、Kaniko使うと幸せになれる（全部入りRails Dockerfileを参考に） #GitLab - Qiita](https://qiita.com/chimame/items/7cf8356b7fb55c0990f9#%E3%81%AA%E3%82%93%E3%81%A7%E4%BD%BF%E3%81%86%E3%81%AE)
> - [Building Docker images in Kubernetes \| Snyk](https://snyk.io/blog/building-docker-images-kubernetes/)

<br>

## 02. セットアップ

### Pod 上で実行する場合

#### ▼ Amazon ECR

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
        - "--dockerfile=./docker/Dockerfile"
        - "--context=."
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

> - [GitHub - GoogleContainerTools/kaniko: Build Container Images In Kubernetes · GitHub](https://github.com/GoogleContainerTools/kaniko#running-kaniko)
> - [GitHub - GoogleContainerTools/kaniko: Build Container Images In Kubernetes · GitHub](https://github.com/GoogleContainerTools/kaniko/tree/main#pushing-to-amazon-ecr)

<br>

### GitHub Actions 上で実行する場合

#### ▼ DockerHub

DockerHub の資格情報をエンコードして Actions secrets の `DOCKERHUB_TOKEN` に登録し、Repository variables の `DOCKERHUB_IMAGE` にイメージ名（例：`example/kaniko`）を設定する。

```bash
$ echo -n USER:PASSWORD | base64

*****
```

```yaml
name: Build image for DockerHub

on:
  push:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and push with Kaniko
        env:
          DOCKERHUB_TOKEN: ${{ secrets.DOCKERHUB_TOKEN }}
          DOCKERHUB_IMAGE: ${{ vars.DOCKERHUB_IMAGE }}
        run: |
          mkdir -p "$RUNNER_TEMP/kaniko-config"
          printf '{"auths":{"https://index.docker.io/v1/":{"auth":"%s"}}}\n' \
            "$DOCKERHUB_TOKEN" > "$RUNNER_TEMP/kaniko-config/config.json"
          docker run --rm \
            -v "$GITHUB_WORKSPACE:/workspace" \
            -v "$RUNNER_TEMP/kaniko-config:/kaniko/.docker:ro" \
            gcr.io/kaniko-project/executor:debug \
            --context dir:///workspace \
            --dockerfile /workspace/Dockerfile \
            --destination "$DOCKERHUB_IMAGE:TAG"
```

> - [Kaniko - Pushing to Docker Hub](https://github.com/GoogleContainerTools/kaniko#pushing-to-docker-hub)

<br>

#### ▼ Amazon ECR

AWS の資格情報を Actions secrets の `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` に登録し、Repository variables の `ECR_URL` に既存のイメージリポジトリ URL を設定する。

```yaml
name: Build image for Amazon ECR

on:
  push:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and push with Kaniko
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: ap-northeast-1
          ECR_URL: ${{ vars.ECR_URL }}
        run: |
          mkdir -p "$RUNNER_TEMP/kaniko-config"
          printf '%s\n' '{"credsStore":"ecr-login"}' > "$RUNNER_TEMP/kaniko-config/config.json"
          docker run --rm \
            -e AWS_ACCESS_KEY_ID \
            -e AWS_SECRET_ACCESS_KEY \
            -e AWS_REGION \
            -v "$GITHUB_WORKSPACE:/workspace" \
            -v "$RUNNER_TEMP/kaniko-config:/kaniko/.docker:ro" \
            gcr.io/kaniko-project/executor:debug \
            --context dir:///workspace \
            --dockerfile /workspace/Dockerfile \
            --destination "$ECR_URL:TAG"
```

> - [Kaniko - Pushing to Amazon ECR](https://github.com/GoogleContainerTools/kaniko#pushing-to-amazon-ecr)

<br>

#### ▼ Google Container Registry

サービスアカウントキーの JSON を Actions secrets の `GCP_SERVICE_ACCOUNT_KEY` に登録し、Repository variables の `PROJECT_ID` にプロジェクト ID を設定する。

```yaml
name: Build image for Google Container Registry

on:
  push:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and push with Kaniko
        env:
          GCP_SERVICE_ACCOUNT_KEY: ${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}
          PROJECT_ID: ${{ vars.PROJECT_ID }}
        run: |
          printf '%s\n' "$GCP_SERVICE_ACCOUNT_KEY" > "$RUNNER_TEMP/gcloud-service-key.json"
          docker run --rm \
            -e GOOGLE_APPLICATION_CREDENTIALS=/kaniko/gcloud-service-key.json \
            -v "$GITHUB_WORKSPACE:/workspace" \
            -v "$RUNNER_TEMP/gcloud-service-key.json:/kaniko/gcloud-service-key.json:ro" \
            gcr.io/kaniko-project/executor:debug \
            --context dir:///workspace \
            --dockerfile /workspace/Dockerfile \
            --destination "asia.gcr.io/$PROJECT_ID/image_name:TAG"
```

> - [Kaniko - Pushing to GCR](https://github.com/GoogleContainerTools/kaniko#pushing-to-google-gcr)

<br>
