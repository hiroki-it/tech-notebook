---
title: 【IT技術の知見】設定ファイル＠Kaniko
description: 設定ファイル＠Kanikoの知見を記録しています。
---

# 設定ファイル＠Kaniko

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `config.json`ファイル

### `config.json`ファイルとは

Kanikoのオプションを設定する。

`/kaniko/.docker`ディレクトリに配置する。

<br>

### credHelpers

#### ▼ credHelpersとは

イメージレジストリごとに、認証ヘルパーがある。

```yaml
{
  # 使用する認証ヘルパーを設定する
  "credHelpers": {
      # amazon-ecr-credential-helperに設定を渡す
      "<AWSアカウントID (1つ目)>.dkr.ecr.ap-northeast-1.amazonaws.com": "ecr-login",
      "<AWSアカウントID (2つ目)>.dkr.ecr.ap-northeast-1.amazonaws.com": "ecr-login",
    },
}
```

> - https://github.com/awslabs/amazon-ecr-credential-helper#configuration

#### ▼ 機密情報の設定

CIの実行コンテナでは、機密情報を動的に設定できるようにする。

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
