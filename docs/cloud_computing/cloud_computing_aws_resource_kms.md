---
title: 【IT技術の知見】AWS KMS
description: AWS KMSの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
---

# AWS KMS

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要


暗号化キーを管理する。

暗号化キーは、パラメーターストアや暗号化ツール (例：SOPS、kubesec) で使用できる。

<br>

## 02. 仕組み

### AWS マネージド型のキー管理

暗号化キーを使用する AWS リソースが、ユーザーに代わって暗号化キーを管理する。

暗号化キーを使用できるユーザーをキーポリシーで設定できない。

> - [AWS KMS keys - AWS Key Management Service](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#aws-managed-cmk)
> - https://medium.com/@neonforge/why-you-shouldnt-use-aws-managed-kms-keys-83d9eb9d5090
> - [Features \| AWS Key Management Service (KMS) \| Amazon Web Services (AWS)](https://aws.amazon.com/kms/features/#AWS_Service_Integration)

<br>

### セルフマネージド型のキー管理

ユーザーが暗号化キーを管理する。

暗号化キーを使用できるユーザーをキーポリシーで設定できる。

> - [AWS KMS keys - AWS Key Management Service](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-mgmt)
> - https://medium.com/@neonforge/why-you-shouldnt-use-aws-managed-kms-keys-83d9eb9d5090

<br>

## 03. セットアップ

### Terraformによる構築

## 04. マルチリージョンキー

複数のリージョンで横断的に使用できる暗号化キーを作成できる。

最初に作成された暗号化キーはプライマリキー、別のリージョンで使用できる暗号化キーをレプリカキーという。

これらは、リージョン情報以外は同じ情報を持っている。

もしマルチリージョン化したい場合、暗号化キーを再作成する必要がある。

![kms_multi-region](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kms_multi-region.png)

> - [Multi-Region keys in AWS KMS - AWS Key Management Service](https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-overview.html)

<br>

## 05. キーポリシーによるリクエスト制限

AWS KMS のリクエスト制限を設定する。

```json
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Sid": "Allow an external account to use this AWS KMS key",
        "Effect": "Allow",
        "Principal":
          {
            "AWS":
              [
                "<ここで、他のAWSアカウントのIAMユーザーが利用できるように、IAMユーザーやIAMロールのARNを設定する>",
              ],
          },
        "Action":
          [
            "kms:Encrypt",
            "kms:Decrypt",
            "kms:ReEncrypt*",
            "kms:GenerateDataKey*",
            "kms:DescribeKey",
          ],
        "Resource": "*",
      },
    ],
}
```

<br>

## 06. 暗号化方式とキーマテリアル

### ▼ キータイプ

暗号化キーを対称型 (ペアは不要) または非対称 (パブリックとプライベートのペアが必要) とするかを設定する。

> - [AWS KMS keys - AWS Key Management Service](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#symmetric-cmks)
> - [AWS KMS keys - AWS Key Management Service](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#asymmetric-keys-concept)

### ▼ オリジン

- AWS KMS が作成したキーマテリアル (`AWS_KMS`)
- インポートしたキーマテリアル (`EXTERNAL`)
- AWS CloudHSM のカスタムキーストアで作成したキーマテリアル (`AWS_CLOUDHSM`)
- 外部キーストアのキーマテリアル (`EXTERNAL_KEY_STORE`)

> - [AWS KMS keys - AWS Key Management Service](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-origin)

### ▼ キーの仕様

- 対称暗号化キー (`SYMMETRIC_DEFAULT`)
- RSA キーペア (`RSA_2048`、`RSA_3072`、`RSA_4096`)
- 楕円曲線キーペア (`ECC_NIST_P256`、`ECC_NIST_P384`、`ECC_NIST_P521`、`ECC_SECG_P256K1`)
- HMAC キー (`HMAC_224`、`HMAC_256`、`HMAC_384`、`HMAC_512`)

> - [AWS KMS keys - AWS Key Management Service](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-spec)

### ▼ キーの用途

暗号化キーの用途タイプを設定する。

- 暗号化と復号 (`ENCRYPT_DECRYPT`)
- 署名と検証 (`SIGN_VERIFY`)
- MC の生成と検証 (`GENERATE_VERIFY_MAC`)

> - [AWS KMS keys - AWS Key Management Service](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-usage)

<br>

## 07. キーマテリアルの自動更新

暗号化キーのキーマテリアルを一定期間で自動的に更新する。

![kms_key_rotation](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kms_key_rotation.png)

> - [Rotate AWS KMS keys - AWS Key Management Service](https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html)

<br>

## 08. キーポリシーの設定

AWS KMS にポリシーを設定する。

AWS マネージド型では設定できず、セルフマネージド型でのみ設定できる。

AWS KMS を使用できるユーザーや AWS リソースを制限できるようになる。

> - [KMSのデフォルトのキーポリシーの内容について](https://zenn.dev/m_taiki/articles/77c9542649aca0#%E7%B5%90%E8%AB%96)

<br>
