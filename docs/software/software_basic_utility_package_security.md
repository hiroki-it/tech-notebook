---
title: 【IT技術の知見】セキュリティ系＠パッケージ
description: セキュリティ系＠パッケージの知見を記録しています。
---

# セキュリティ系＠パッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. sops

### インストール

#### ▼ brewリポジトリから

```bash
$ brew install sops
```

<br>

### sopsの構成要素

#### ▼ ```secrets```ファイル

sopsによって暗号化されたファイルであり、キーバリュー型ストレージを持つ。

```sops```キー以下に暗号化の設定値が記載される。

他のキーバリュー型ストア（例：Hashicorp Vaultなど）よりも安全で、またクラウドキーバリュー型ストレージ（例：AWS パラメーターストア、など）よりも簡単に変数を管理できる。



> ℹ️ 参考：https://blog.serverworks.co.jp/encypt-secrets-by-sops

```bash
# 平文ファイル
$ cat foo-values.yaml

DB_USERNAME: foo-user
DB_PASSWORD: password
```

```bash
# 平文ファイルを暗号化する。
$ sops -e ./values/foo-values.yaml > ./secrets/foo-secrets.yaml
```

```bash
# 暗号化されたファイル
$ cat ./secrets/foo-secrets.yaml

# キーバリュー型ストレージ
DB_USERNAME: ENC[AES256...
DB_PASSWORD: ENC[AES256...

# sopsの暗号化の設定
sops:
    # AWS KMS
    kms:
      - arn: arn:aws:kms:ap-northeast-1:<アカウントID>:key/<KMSのID>
        created_at: '2021-01-01T12:00:00Z'
        enc: *****
        aws_profile: ""
    # GCP KMS
    gcp_kms: []
    # Azure Key Vault
    azure_kv: []
    # HashiCorp Vault
    hc_vault: []
    lastmodified: '2021-01-01T12:00:00Z'
    mac: ENC[AES256...
    pgp: []
    unencrypted_suffix: _unencrypted
    # 暗号化に使用したsopsのバージョン
    version: 3.6.1
```


#### ▼ ```.sops.yaml```ファイル

```sops```コマンドのパラメーターを定義する。

コマンドを実行するディレクトリに配置しておく必要がある。



> ℹ️ 参考：https://github.com/mozilla/sops#211using-sopsyaml-conf-to-select-kmspgp-for-new-files

```yaml
creation_rules:
    # 特定の平文ファイル名を設定する。
  - path_regex: ./values/value\.yaml
    # AWS KMSを暗号化キーとして使用する。
    kms: "arn:aws:kms:ap-northeast-1:<アカウントID>:key/*****"
```

```yaml
creation_rules:
    # ワイルドカードで平文ファイルを再帰的に指定できる。
  - path_regex: ./values/*\.yaml
    # GCP KMSを暗号化キーとして使用する。
    gcp_kms: "projects/foo-project/locations/global/keyRings/sops/cryptoKeys/sops-key"
```

```bash
# ファイル名が path_regexキーののルールに該当するため、AWS KMSを使用して暗号化される。
$ sops -e ./values/foo-values.yaml
```

```.sops.yaml```ファイルを使用しない場合は、環境変数でパラメーターを渡す必要がある。



```bash
$ export SOPS_KMS_ARN="arn:aws:kms:ap-northeast-1:<アカウントID>:key/*****"

$ sops -e ./values/foo-values.yaml
```

<br>

### 環境変数

```EnvVar```キーの定義された項目を参照せよ。



> ℹ️ 参考：https://github.com/mozilla/sops/blob/e1edc059487ddd14236dfe47267b05052f6c20b4/cmd/sops/main.go#L542-L701

<br>

### サブコマンド無し

#### ▼ -d

```.yaml```ファイルや```.json```ファイルの値の部分を復号化する。

標準出力に出力されるため、ファイルに書き出すようにすると良い。



```bash
$ sops -d <暗号化された.yamlファイル/.jsonファイル> > <復号化された.yamlファイル/.jsonファイル>
```

**＊例＊**

```bash
$ sops -d ./secrets/foo-secrets.yaml > ./values/foo-values.yaml
```

#### ▼ -e

外部の暗号化キー（例；AWS KMS、GCP KMS、など）に基づいて、```.yaml```ファイルや```.json```ファイルの値の部分を暗号化する。

環境変数や```.sops.yaml```ファイルで暗号化ルールを定義しておく必要がある。

標準出力に出力されるため、ファイルに書き出すようにすると良い。



```bash
# AWS KMSを暗号化キーとして使用する。
$ export SOPS_KMS_ARN="arn:aws:kms:ap-northeast-1:<アカウントID>:key/*****"

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
