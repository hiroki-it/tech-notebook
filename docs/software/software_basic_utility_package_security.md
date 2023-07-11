---
title: 【IT技術の知見】セキュリティ系＠パッケージ
description: セキュリティ系＠パッケージの知見を記録しています。
---

# セキュリティ系＠パッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. SOPS

### インストール

#### ▼ brewリポジトリから

```bash
$ brew install sops
```

<br>

### SOPSの構成要素

#### ▼ 平文ファイル

`.yaml`ファイル、`.env`ファイル、などを暗号化できる。

暗号化すると、`secrets`ファイルになる。

#### ▼ `secrets`ファイル

SOPSによって暗号化されたファイルであり、キーバリュー型バックエンドとして機能する。

`sops`キー以下に暗号化の設定値が記載される。

他のキーバリュー型ストア (例：Hashicorp Vaultなど) よりも安全で、またクラウドキーバリュー型バックエンド (例：AWS パラメーターストア、など) よりも簡単に変数を管理できる。

**＊実装例＊**

ここでは、`.yaml`ファイルを暗号化する。

```bash
# 平文ファイル
$ cat foo-values.yaml

DB_USERNAME: hiroki-it
DB_PASSWORD: password
```

```bash
# 平文ファイルを暗号化する。
$ sops -e ./values/foo-values.yaml > ./secrets/foo-secrets.yaml
```

```bash
# 暗号化されたファイル
$ cat ./secrets/foo-secrets.yaml

# キーバリュー型バックエンド
DB_USERNAME: ENC[AES256...
DB_PASSWORD: ENC[AES256...

# SOPSの暗号化の設定
sops:
    # AWS KMS
    kms:
      - arn: arn:aws:kms:ap-northeast-1:<AWSアカウントID>:key/<KMSのID>
        created_at: '2021-01-01T12:00:00Z'
        enc: *****
        aws_profile: ""
    # Google CKM
    gcp_kms: []
    # Azure Key Vault
    azure_kv: []
    # HashiCorp Vault
    hc_vault: []
    lastmodified: '2021-01-01T12:00:00Z'
    mac: ENC[AES256...
    pgp: []
    unencrypted_suffix: _unencrypted
    # 暗号化に使用したSOPSのバージョン
    version: 3.6.1
```

> - https://blog.serverworks.co.jp/encypt-secrets-by-sops

#### ▼ `.sops.yaml`ファイルを使用する場合

`sops`コマンドのパラメーターを定義する。

コマンドを実行するディレクトリに配置しておく必要がある。

```yaml
creation_rules:
  # 特定の平文ファイル名を設定する。
  - path_regex: ./values/value\.yaml
    # AWS KMSを暗号化キーとして使用する。
    kms: "arn:aws:kms:ap-northeast-1:<AWSアカウントID>:key/*****"
```

```yaml
creation_rules:
  # ワイルドカードで平文ファイルを再帰的に指定できる。
  - path_regex: ./values/*\.yaml
    # Google CKMを暗号化キーとして使用する。
    gcp_kms: "projects/foo-project/locations/global/keyRings/sops/cryptoKeys/sops-key"
```

```bash
# ファイル名が path_regexキーのルールに該当するため、AWS KMSを使用して暗号化される。
$ sops -e ./values/foo-values.yaml
```

#### ▼ `.sops.yaml`ファイルを使用しない場合

`.sops.yaml`ファイルを使用しない場合は、環境変数でパラメーターを渡す必要がある。

```bash
$ export SOPS_KMS_ARN="arn:aws:kms:ap-northeast-1:<AWSアカウントID>:key/*****"

$ sops -e ./values/foo-values.yaml -k $SOPS_KMS_ARN
```

> - https://github.com/mozilla/sops#211using-sopsyaml-conf-to-select-kmspgp-for-new-files

<br>

### 環境変数

`EnvVar`キーの定義された項目を参照せよ。

> - https://github.com/mozilla/sops/blob/e1edc059487ddd14236dfe47267b05052f6c20b4/cmd/sops/main.go#L542-L701

<br>

### サブコマンド無し

#### ▼ -d

`.yaml`ファイルや`.json`ファイルの値の部分を復号化する。

標準出力に出力されるため、ファイルに書き出すようにすると良い。

```bash
$ sops -d <暗号化された.yamlファイル/.jsonファイル> > <復号化された.yamlファイル/.jsonファイル>
```

**＊例＊**

```bash
$ sops -d ./secrets/foo-secrets.yaml > ./values/foo-values.yaml
```

#### ▼ -e

外部の暗号化キー (例：AWS KMS、Google CKM、GPG、PGP、など) に基づいて、`.yaml`ファイルや`.json`ファイルの値の部分を暗号化する。

環境変数や`.sops.yaml`ファイルで暗号化ルールを定義しておく必要がある。

標準出力に出力されるため、ファイルに書き出すようにすると良い。

```bash
# AWS KMSを暗号化キーとして使用する。
$ export SOPS_KMS_ARN="arn:aws:kms:ap-northeast-1:<AWSアカウントID>:key/*****"

$ sops -e <平文の.yamlファイル/.jsonファイル> > <暗号化された.yamlファイル/.jsonファイル>
```

外部の暗号化キーを使用する場合、そのサービスの認証を済ませておく必要がある。

```bash
# AWS KMSを暗号化キーとして使用する場合
Failed to call KMS encryption service: AccessDeniedException: status code: 400, request id: *****
```

**＊例＊**

```bash
$ sops -e ./values/foo-values.yaml > ./secrets/foo-secrets.yaml
```

<br>
