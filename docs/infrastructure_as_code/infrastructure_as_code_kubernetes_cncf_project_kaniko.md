---
title: 【IT技術の知見】Kaniko＠CNCF
description: Kaniko＠CNCFの知見を記録しています。
---

# Kaniko＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Kanikoとは

コンテナ内でコンテナイメージをビルドする。

これにより、Docker in Dockerの問題を回避できる。

また、Kubernetes Cluster内でコンテナイメージをビルドできるようになる。

レイヤー単位でコンテナイメージのキャッシュを作成できる。

そのため、都度、コンテナイメージをビルドしなくて良くなる。

> - https://qiita.com/chimame/items/7cf8356b7fb55c0990f9#%E3%81%AA%E3%82%93%E3%81%A7%E4%BD%BF%E3%81%86%E3%81%AE
> - https://snyk.io/blog/building-docker-images-kubernetes/

<br>

## 02. Pod上で実行する場合

### AWS ECR

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

> - https://github.com/GoogleContainerTools/kaniko#running-kaniko
> - https://github.com/GoogleContainerTools/kaniko/tree/main#pushing-to-amazon-ecr

<br>

## 03. GitLab上で実行する場合

### DockerHub

DockerHubの認証情報は、エンコードした上で、あらかじめGitLab CIの変数 (`DOCKERHUB_TOKEN`) に設定しておく。

```bash
$ echo -n USER:PASSWORD | base64

*****
```

```yaml
stages:
  - build

build:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  script:
    - echo '{\"auths\":{\"https://index.docker.io/v2/\":{\"auth\":\"${DOCKERHUB_TOKEN}\"}}}' > /kaniko/.docker/config.json
    - /kaniko/executor --context $CI_PROJECT_DIR --dockerfile $CI_PROJECT_DIR/Dockerfile --destination IMAGE_NAME:TAG
```

> - https://qiita.com/Aruneko/items/7d4474444ff92b76aa88#docker-hub

<br>

### AWS ECR

AWSの認証情報は、あらかじめGitLab CIの変数 (`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`) に設定しておく。

```yaml
build:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  variables:
    ECR_URL: ****.dkr.ecr.ap-northeast-1.amazonaws.com/kaniko
  script:
    - echo '{\"credsStore\":\"ecr-login\"}' > /kaniko/.docker/config.json
    - /kaniko/executor --context $CI_PROJECT_DIR --dockerfile $CI_PROJECT_DIR/Dockerfile --destination ${ECR_URL}:TAG
```

> - https://qiita.com/Aruneko/items/7d4474444ff92b76aa88#aws-ecr

<br>

### Google Container Registry

Google Cloudの認証情報ファイルは、あらかじめGitLab CIの変数 (`GOOGLE_APPLICATION_CREDENTIALS`) に設定しておく。

```yaml
build:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  variables:
    GOOGLE_APPLICATION_CREDENTIALS: /tmp/gcloud-service-key.json
  before_script:
    - mkdir /tmp
    - echo ${Google Cloud_TOKEN} > /tmp/gcloud-service-key.json
  script:
    - /kaniko/executor --context $CI_PROJECT_DIR --dockerfile $CI_PROJECT_DIR/Dockerfile --destination "asia.gcr.io/${PROJECT_ID}/image_name:TAG"
```

> - https://qiita.com/Aruneko/items/7d4474444ff92b76aa88#gcp-gcr

<br>
