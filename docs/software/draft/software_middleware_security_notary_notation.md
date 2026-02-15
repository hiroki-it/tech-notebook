---
title: 【IT技術の知見】Notary Notation＠セキュリティ系ミドルウェア
description: Notation＠セキュリティ系ミドルウェアの知見を記録しています。
---

# Notary Notation＠セキュリティ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Notary Notationの仕組み

コンテナイメージを署名し、また署名を検証する。

1. `notation sign` コマンドでコンテナイメージを署名する。
2. `notation policy import` コマンドで信頼ポリシーを読み込む。
3. `notation verify` コマンドでコンテナイメージの署名を検証する。

<br>

## 02. コマンド

### policy

信頼ポリシーを読み込む。

```bash
$ notation policy import <信頼ポリシー名>
```

**＊実行例＊**

AWS Signerを使用するために、信頼ポリシーを読み込む。

```bash
$ notation policy import aws/signer_policy.json
```

```yaml
{
  "version": "1.0",
  "trustPolicies":
    [
      {
        "name": "aws-signer-tp",
        "registryScopes": ["*"],
        "signatureVerification": {"level": "strict"},
        "trustStores": ["signingAuthority:aws-signer-ts"],
        "trustedIdentities":
          [
            "arn:aws:signer:<リージョン>:<AWSアカウントID>:/signing-profiles/<署名プロファイル名>",
          ],
      },
    ],
}
```

> - https://github.com/aws-samples/k8s-notary-admission?tab=readme-ov-file#operation

<br>

### sign

コンテナイメージを署名する。

```bash
$ notation sign <イメージ名>
```

**＊実行例＊**

AWS Signerにある署名プロファイルを使用し、AWS ECR上でのコンテナイメージを署名する。

```bash
$ notation sign <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest \
    --plugin "com.amazonaws.signer.notation.plugin" \
    --id arn:aws:signer:ap-northeast:<AWSアカウントID>:/signing-profiles/<署名プロファイル名>
```

<br>

### verify

コンテナイメージの署名を検証する。

```bash
$ notation verify <イメージ名>
```

**＊実行例＊**

AWS Signerにある署名プロファイルを使用し、AWS ECR上でのコンテナイメージの署名を検証する。

```bash
$ notation verify <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest
```

<br>
