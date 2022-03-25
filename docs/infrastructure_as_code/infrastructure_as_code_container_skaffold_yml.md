---
title: 【知見を記録するサイト】skaffold.yml＠Skaffold
description: skaffold.yml＠Skaffoldの知見をまとめました．
---

# skaffold.yml＠Skaffold

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01 Skaffoldの仕組み

### パイプライン構成

CICDパイプラインと同様の，build/test/deployステージに加えて，反復的な開発に役立つステージを持つ．

![skaffold-pipeline](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/skaffold-pipeline.png)

<br>

### 各ステップのツールの選択

Skaffoldの各ステージでは，それ専用のツールをコールできる．

参考：https://skaffold.dev/docs/#skaffold-workflow-and-architecture

![skaffold-pipeline_tools](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/skaffold-pipeline_tools.png)

<br>

## 02. buildステージ

### buildステージとは

dockerイメージのビルド方法を定義する．

参考：https://skaffold.dev/docs/pipeline-stages/builders/

<br>

### artifacts

#### ・image

ビルドされるイメージの名前を設定する．

参考：https://skaffold.dev/docs/references/yaml/#build-artifacts-image

```yaml
build:
  artifacts:
    - image: foo-app
    - image: foo-web
    - image: bar-app
    - image: bar-web
```

#### ・context

マイクロサービスのルートまでのファイルパスを設定する．

参考：https://skaffold.dev/docs/references/yaml/#build-artifacts-context

```yaml
build:
  artifacts:
    - image: foo-app
      context: ./src/foo
    - image: foo-web
      context: ./src/foo
    - image: bar-app
      context: ./src/bar
    - image: bar-web
      context: ./src/bar    
```

<br>

#### ・docker

| 項目       | 説明                                                         | 補足                                                         |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| dockerfile | マイクロサービスのルートからDockerfileまでのファイルパスを設定する． | https://skaffold.dev/docs/references/yaml/#build-artifacts-docker-dockerfile |
| target     | ビルドするイメージのステージを設定する．                     | https://skaffold.dev/docs/references/yaml/#build-artifacts-docker-target |

```yaml
build:
  artifacts:
    - image: foo-app
      context: ./src/foo
      docker:
        dockerfile: ./docker/app/Dockerfile
    - image: foo-web
      context: ./src/foo
      docker:
        dockerfile: ./docker/web/Dockerfile
        target: development
    - image: bar-app
      context: ./src/bar
      docker:
        dockerfile: ./docker/app/Dockerfile
    - image: bar-web
      context: ./src/bar
      docker:
        dockerfile: ./docker/web/Dockerfile
        target: development
```

<br>

### local

#### ・push

ビルドしたイメージをリポジトリにプッシュするかどうかを設定する．

```yaml
build:
  local:
    push: false
```

#### ・useBuildkit

BuildKit機能の有効化を設定する．BuildKitではイメージレイヤーが並列的に構築されるため，ビルド時間を従来よりも短縮できる．

参考：https://genzouw.com/entry/2021/07/17/100615/2724/

```yaml
build:
  local:
    useBuildkit: false
```

<br>

### tagPolicy

#### ・gitCommit

コミットIDをイメージタグとして設定する．

参考：https://skaffold.dev/docs/pipeline-stages/taggers/#gitcommit-uses-git-commitsreferences-as-tags

```yaml
build:
  tagPolicy:
    gitCommit: {}
```

#### ・sha256

sha256ハッシュ値と```latest```タグをイメージタグとして設定する．

参考：https://skaffold.dev/docs/pipeline-stages/taggers/#sha256-uses-latest-to-tag-images

```yaml
build:
  tagPolicy:
    sha256: {}
```

<br>

## 03. portForwardステージ

Skaffoldのコマンド時に，同時にポートフォワーディングを実行する．すでにポート番号が使用中だった場合は，```+1```されたポート番号が自動的に使用される．

```yaml
portForward:
  - resourceType: pod
    resourceName: foo-mysql-pod-0
    localPort: 3308 
    port: 3306
  - resourceType: pod
    resourceName: bar-mysql-pod-0  
    localPort: 3309
    port: 3306
```

<br>

## 04. testステージ

### testステージとは

kubernetesリソースのテスト方法を定義する．

参考：https://skaffold.dev/docs/pipeline-stages/testers/

<br>

### structureTests

ファイルを指定し，コンテナ構造テストを実行する．

参考：https://qiita.com/Kta-M/items/83db480075caabcb0b7a

```yaml
test:
  - image: <リポジトリURL>
    structureTests:
      - ./structure-tests/foo.yml
```

```yaml
schemaVersion: 2.0.0

# イメージにファイルが存在するかどうかをテストする．
fileExistenceTests:
  - name: PHP file
    path: /var/www/public/index.php
    shouldExist: true
```

<br>

## 05. deployステージ

### deployステージとは

kubernetesリソースのデプロイ手法を定義する．

参考：https://skaffold.dev/docs/pipeline-stages/deployers/

<br>

### kubectl

#### ・kubectlとは

kubectlを用いて，kubernetesリソースをデプロイする．

参考：https://skaffold.dev/docs/pipeline-stages/deployers/kubectl/

```yaml
deploy:
  kubectl:
    manifests:
      - ./kubernetes-manifests/**/**.yml
```

<br>

### helm

#### ・helm

helmを用いて，kubernetesリソースをデプロイする．

参考：https://skaffold.dev/docs/pipeline-stages/deployers/helm/

```yaml
deploy:
  helm:
    releases:
    - name: <リリース名>
      artifactOverrides:
        image: <イメージ名> # buildステージのイメージ名と合わせる．
      imageStrategy:
        helm: {}
```

ちなみに，```artifactOverrides```キーのイメージ名とbuildステージのイメージ名は合わせる必要がある．

```yaml
build:
  artifacts:
    - image: <イメージ名> # artifactOverridesのイメージ名と合わせる．
```

