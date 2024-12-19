---
title: 【IT技術の知見】Notation＠セキュリティ系ミドルウェア
description: Notation＠セキュリティ系ミドルウェアの知見を記録しています。
---

# Notation＠セキュリティ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Notationの仕組み

1. `notation sign`コマンドでコンテナイメージを署名する。
2. `notation policy`コマンドで信頼ポリシーを作成する。
3. `notation verify`コマンドでコンテナイメージの署名を検証する。

<br>

## 02. コマンド

### policy

信頼ポリシーを読み込む。

```bash
$ notation policy import <信頼ポリシー名>
```

**＊実行例＊**

```bash
$ notation policy import .github/aws/signer_policy.json
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
            "arn:aws:signer:<リージョン>:<AWSアカウントID>:/signing-profiles/<プロファイル名>",
          ],
      },
    ],
}
```

> - https://github.com/notaryproject/specifications/blob/main/specs/trust-store-trust-policy.md#trust-policy

<br>

### sign

コンテナイメージを署名する。

```bash
$ notation sign <イメージ名>
```

**＊実行例＊**

```bash
$ notation sign <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest \
    --plugin "com.amazonaws.signer.notation.plugin" \
    --id arn:aws:signer:ap-northeast:<AWSアカウントID>:/signing-profiles/<プロファイル名>
```

<br>

### verify

コンテナイメージの署名を検証する。

```bash
$ notation verify <イメージ名>
```

**＊実行例＊**

```bash
$ notation verify <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest
```

<br>
