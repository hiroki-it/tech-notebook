---
title: 【IT技術の知見】Artifact Registry＠Google Cloudリソース
description: Artifact Registry＠Google Cloudリソースの知見を記録しています。
---

# Artifact Registry＠Google Cloudリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Artifact Registry

### Artifact Registryとは

様々なアーティファクト (例：コンテナイメージ、チャート、言語系パッケージ、OS系パッケージ、など) のレジストリとして働く。

コンテナイメージレジストリであるGCRの後継である。

> - https://cloud.google.com/blog/ja/products/application-development/understanding-artifact-registry-vs-container-registry
> - https://zenn.dev/cloud_ace/articles/6c401ce3b3bccc

<br>

### GCR

パブリックレジストリとプライベートレジストリがある。

> - https://console.cloud.google.com/gcr/images/google-containers/GLOBAL

<br>

### セットアップ

### コンソール画面の場合

| 設定項目           | 説明                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| 形式               | アーティファクト (例：コンテナイメージ、チャート、言語系パッケージ、OS系パッケージ、など) の種類を設定する。 |
| モード             |                                                                                                              |
| ロケーションタイプ | Artifact Registryを配置するリージョンを設定する。                                                            |
| 暗号化             | アーティファクトを暗号化する場合に、いずれの暗号鍵を使用するかを設定する。                                   |

<br>

### セットアップ

#### ▼ コンテナイメージの場合

ビルドしたコンテナイメージをArtifact Registryにプッシュする。

```bash
# Artifact Registryにログインする。
$ gcloud auth configure-docker asia-northeast1-docker.pkg.dev

# コンテナイメージにタグを付与する。
$ docker tag app:1.0.0 asia-northeast1-docker.pkg.dev/<プロジェクト名>/<コンテナイメージ名>:1.0.0

# コンテナイメージをArtifact Registryにプッシュする。
$ docker push asia-northeast1-docker.pkg.dev/<プロジェクト名>/<コンテナイメージ名>:1.0.0

# コンテナイメージをArtifact Registryからプルする。
$ docker pull asia-northeast1-docker.pkg.dev/<プロジェクト名>/<コンテナイメージ名>:1.0.0
```

> - https://cloud.google.com/artifact-registry/docs/docker/store-docker-container-images#add-image

<br>
