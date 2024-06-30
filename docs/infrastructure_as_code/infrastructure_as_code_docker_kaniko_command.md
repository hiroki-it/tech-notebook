---
title: 【IT技術の知見】コマンド＠Kaniko
description: コマンド＠Kanikoの知見を記録しています。
---

# コマンド＠Kaniko

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. /kaniko/executorコマンド

### --build-arg

コンテナビルド時のオプションを設定する。

```bash
$ /kaniko/executor --build-args "FOO=foo"
```

オプションの値にスペースがあるとkanikoがクラッシュするため、IFSに`NULL`を設定して対処する。

また、`--build-arg`の値をオプションの一部のように解釈してしまうため、`=`でオプションと値を区別させる。

```bash
# IFSに"NULL"を設定する
$ export IFS=''

$ /kaniko/executor --build-args="FOO=foo" --build-args="BAR='bar1 bar2 bar3'"
```

> - https://github.com/GoogleContainerTools/kaniko?tab=readme-ov-file#flag---build-arg
> - https://github.com/GoogleContainerTools/kaniko/issues/1803#issuecomment-1023264341
> - https://github.com/knative/build/issues/565

### --context

指定したDockerfileのあるディレクトリをカレントディレクトリとして、dockerデーモンに送信するディレクトリを設定する。

```bash
$ /kaniko/executor --context=.
```

> - https://github.com/GoogleContainerTools/kaniko?tab=readme-ov-file#kaniko-build-contexts

<br>

### --destination

ビルドしたコンテナイメージのキャッシュを作成するリポジトリを設定する

```bash
$ /kaniko/executor --destination=****.dkr.ecr.ap-northeast-1.amazonaws.com/kaniko
```

<br>

### --dockerfile

コンテナ内でビルドしたいDockerfileのパスを設定する。

```bash
$ /kaniko/executor --dockerfile=./docker/Dockerfile
```

> - https://github.com/GoogleContainerTools/kaniko?tab=readme-ov-file#flag---dockerfile

<br>

### --no-push

コンテナ内でビルドしたコンテナイメージをプッシュしない。

ビルドのみを実行したい場合に使用する。

```bash
$ /kaniko/executor --no-push
```

> - https://github.com/GoogleContainerTools/kaniko?tab=readme-ov-file#flag---no-push

<br>
