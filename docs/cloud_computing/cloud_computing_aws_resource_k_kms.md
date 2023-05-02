---
title: 【IT技術の知見】KMS＠Kで始まるAWSリソース
description: KMS＠Kで始まるAWSリソースの知見を記録しています。
---

# KMS＠`K`で始まるAWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. KMS

### KMSとは

暗号化キーを管理する。

暗号化キーは、パラメーターストアや暗号化ツール (例：SOPS) で使用できる。

『フルマネージド型』と『カスタマーマネージド型』があるが、セキュリティ上の理由でカスタマーマネージド型の方が良い。

> ↪️：https://medium.com/@neonforge/why-you-shouldnt-use-aws-managed-kms-keys-83d9eb9d5090

<br>

## 02. セットアップ (カスタマーマネージド型の場合)

### マルチリージョン

複数のリージョンで横断的に使用できる暗号化キーを作成できる。

最初に作成された暗号化キーはプライマリキー、別のリージョンで使用できる暗号化キーをレプリカキーという。

これらは、リージョン情報以外は同じ情報を持っている。

もしマルチリージョン化したい場合、暗号化キーを再作成する必要がある。

![kms_multi-region.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kms_multi-region.png)

> ↪️：https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-overview.html

<br>

### キーポリシー

KMSのアクセス制限を設定する。

**＊例＊**

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Sid": "Allow an external account to use this KMS key",
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

### 暗号化設定

#### ▼ キータイプ

暗号化キーを対称型 (ペアは不要) または非対称 (パブリックとプライベートのペアが必要) とするかを設定する。

> ↪️：
>
> - https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#symmetric-cmks
> - https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#asymmetric-keys-concept

#### ▼ オリジン

記入中...

> ↪️：https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-origin

#### ▼ キーの仕様

記入中...

> ↪️：https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-spec

#### ▼ キーの用途

暗号化キーの用途タイプを設定する。

- 暗号化と復号化 (`ENCRYPT_DECRYPT`)
- 署名と検証 (`SIGN_VERIFY`)
- MCの生成と検証 (`GENERATE_VERIFY_MAC`)

> ↪️：https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-usage

<br>

### キーローテーション

暗号化キーのキーマテリアルを一定期間で自動的にローテーションする。

![kms_key_rotation.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kms_key_rotation.png)

> ↪️：https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html

<br>
