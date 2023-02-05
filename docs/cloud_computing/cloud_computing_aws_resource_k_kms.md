---
title: 【IT技術の知見】KMS＠Kで始まるAWSリソース
description: KMS＠Kで始まるAWSリソースの知見を記録しています。
---

# KMS＠```K```で始まるAWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. KMS

### KMSとは

暗号化キーを管理する。

暗号化キーは、パラメーターストアや暗号化ツール（例：SOPS）で使用できる。

<br>

## 02. セットアップ

### キーポリシー

KMSのアクセス制限を設定する。

**＊例＊**

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Allow an external account to use this KMS key",
      "Effect": "Allow",
      "Principal": {
        "AWS": [
          "<ここで、他のAWSアカウントのIAMユーザーが利用できるように、IAMユーザーやIAMロールのARNを設定する>"
        ]
      },
      "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:GenerateDataKey*",
        "kms:DescribeKey"
      ],
      "Resource": "*"
    }
  ]
}
```

<br>

### 暗号化設定

#### ▼ キータイプ

暗号化キーを対称型（ペアは不要）または非対称（パブリックとプライベートのペアが必要）とするかを設定する。

> ℹ️ 参考：
> 
> - https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#symmetric-cmks
> - https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#asymmetric-keys-concept

#### ▼ オリジン

調査中...

> ℹ️ 参考：https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-origin

#### ▼ キーの仕様


調査中...


> ℹ️ 参考：https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-spec

#### ▼ キーの用途


暗号化キーの用途タイプを設定する。

- 暗号化と復号化（```ENCRYPT_DECRYPT```）
- 署名と検証（```SIGN_VERIFY```）
- MCの生成と検証（```GENERATE_VERIFY_MAC```）


> ℹ️ 参考：https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-usage

<br>
