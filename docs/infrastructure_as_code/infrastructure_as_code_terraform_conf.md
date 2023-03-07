---
title: 【IT技術の知見】設定ファイル＠Terraform
description: 設定ファイル＠Terraformの知見を記録しています。
---

# 設定ファイル＠Terraform

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. バックエンド内のファイル

### `.tfstate`ファイル

#### ▼ `.tfstate`ファイルとは

実インフラのインフラの状態が定義されたjsonファイルのこと。

バックエンドの場所に限らず、`terraform apply`コマンドを実行した後、成功もしくは失敗したタイミングで初めて作成される。

```yaml
{
  "version": 4,
  "terraform_version": "1.0.0",
  "serial": 3,
  "lineage": "*****-*****-*****-*****-*****",
  "outputs": { # outputブロックのapplyで追加される。
    "foo_ids": {
      "value": "*****",
      "type": "string"
    }
  },
  "resources": [
    {
      "mode": "data", # dataブロックのapplyで追加される。
      "type": "aws_caller_identity", # resourceタイプ
      "name": "current", # リソース名
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [ # 設定値
        {
          "schema_version": 0,
          "attributes": {
            "account_id": "<アカウントID>",
            "arn": "*****",
            "id": "*****",
            "user_id": "*****"
            ...
          },
          "sensitive_attributes": []
        }
      ]
    },
    {
      "module": "module.ec2", # moduleブロックの場合に追加される。
      "mode": "managed", # importや、resourceブロックのapplyで追加される。
      "type": "aws_instance", # resourceタイプ
      "name": "bastion", # リソース名
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [ # 設定値
        {
          "schema_version": 0,
          "attributes": {
            "arn": "*****",
            "name": "prd-foo-instance",
            "tags": {
              "Env": "prd",
              "ManagedBy": "terraform",
              "Repository": "https://github.com/*****"
            },
            "description": "*****",
            ...
          }
        }
      ]
    }
  ]
}
```

> ↪️ 参考：
>
> - https://blog.gruntwork.io/how-to-manage-terraform-state-28f5697e68fa
> - https://chroju.dev/blog/terraform_state_introduction

#### ▼ `.tfstate`ファイルのロック

`.tfstate`ファイルの競合を防ぐために、`terraform apply`コマンドの処理中に`.tfstate`ファイルはロックされる。

`terraform apply`コマンドが完了すれば、ロックは解除される。

ロックされている間、他のユーザーは一連の`terraform`コマンドを実行できなくなる。

#### ▼ 残骸ロックの解除方法

`terraform apply`コマンドの完了前に処理を強制的に中断してしまうと、ロックが残ってしまう。

これが起こると、以降、一連の`terraform`コマンドを実行できなくなってしまう。

```bash
$ terraform plan
Acquiring state lock. This may take a few moments...

Error: Error acquiring the state lock
Error message: resource temporarily unavailable
Lock Info:
   ID:        89e54252-fef0-2a68-17bf-e0bb411ff1e3 # これを使う
   Path:      terraform.tfstate
   Operation: OperationTypeInvalid
   Who:       hiroki-hasegawa
   Version:   1.1.5
   Created:   2022-02-21 06:26:07.435925 +0000 UTC
   Info:
```

その場合、`terraform force-unlock`コマンドでIDを指定すれば、ロックを解除できる。

```bash
$ terraform force-unlock 89e54252-fef0-2a68-17bf-e0bb411ff1e3
```

> ↪️ 参考：https://dev.classmethod.jp/articles/terraform-state-lock-on-local/

<br>

### `.terraform.lock.hcl`ファイル

#### ▼ `.terraform.lock.hcl`ファイルとは

`terraform`ブロックの設定に基づいて、開発者間で共有するべき情報 (バージョン、ハッシュ値、など) が設定される。

これにより例えば、他の人がリポジトリを使用する時に、異なるプロバイダーを宣言できないようになる。

もし、異なるプロバイダーを使用したい場合は、以下のコマンドを実行する。

これにより、`.terraform.lock.hcl`ファイルのアップグレード/ダウングレードが実行される。

```bash
$ terraform init -upgrade
```

> ↪️ 参考：
>
> - https://www.terraform.io/language/files/dependency-lock
> - https://speakerdeck.com/minamijoyo/how-to-update-terraform-dot-lock-dot-hcl-efficiently
> - https://qiita.com/mziyut/items/0f4109c425165f5011df
> - https://rurukblog.com/post/terraform-lock-hcl/

#### ▼ version

プロバイダーのバージョンを設定する。

```terraform
provider "registry.terraform.io/hashicorp/aws" {

  ...

  version = "4.3.0"

  ...

}
```

#### ▼ constraints

```terraform
provider "registry.terraform.io/hashicorp/aws" {

  ...

  constraints = ">= 3.19.0"

  ...

}
```

#### ▼ hashes

ハッシュ値を設定する、タグごとに役割が異なる。

```terraform
provider "registry.terraform.io/hashicorp/aws" {

  ...

  hashes = [
    "h1:*****",
    "h1:*****",
    "zh:*****",
    ...
  ]

  ...

}
```

| タグ名 | 説明                                                                                                                                                                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `h1`   | 開発者が使用しているOSを表すハッシュ値を設定する。`zh`タグの`zip`パッケージのOS名に存在しないOS値が、`h1`タグに設定されている場合、通信中に改竄されたと見なされ、エラーになる。                                                                |
| `zh`   | プロバイダーの`zip`パッケージ (`terraform-provider-aws_<バージョン>_<OS名>`) のチェックサムハッシュ値を設定する。`h1`タグのOS値に存在しないOS名の`zip`パッケージが、`zh`タグに設定されている場合、通信中に改竄されたと見なされ、エラーになる。 |

> ↪️ 参考：https://speakerdeck.com/minamijoyo/how-to-update-terraform-dot-lock-dot-hcl-efficiently?slide=12

<br>

## 02. ホームディレクトリ (`~/`) 内のファイル

### `~/.terraformrc`ファイル

#### ▼ `.terraformrc`ファイルとは

`terraform`コマンドの実行者のみに適用する動作を設定する。

> ↪️ 参考：https://www.terraform.io/cli/config/config-file#provider-plugin-cache

#### ▼ plugin_cache_dir

最初の`terraform init`コマンド時に、プロバイダープラグインのキャッシュを作成する。

以降、プロバイダープラグインをインストールする必要がなくなり、`terraform init`コマンドの速度を改善できる。

```terraform
# ~/.terraformrcファイル

plugin_cache_dir = "$HOME/.terraform.d/plugin-cache"
```

> ↪️ 参考：
>
> - https://blog.jhashimoto.net/entry/2021/12/24/090000
> - https://www.terraform.io/cli/config/config-file#provider-plugin-cache

<br>

## 03. クレデンシャル情報

### 必要な情報

`terraform`コマンドでクラウドプロバイダーとパケットを送受信ためには、クラウドプロバイダーへの認可スコープが必要にある。

<br>

### 設定方法

#### ▼ ハードコーディングによる設定

リージョンの他、アクセスキーIDとシークレットアクセスキーをハードコーディングで設定する。

誤ってコミットしてしまう可能性があるため、ハードコーディングしないようにする。

**＊実装例＊**

```terraform
# @ルートモジュール

terraform {
  required_version = "0.13.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "3.0"
    }
  }

  backend "s3" {
    bucket     = "prd-foo-tfstate-bucket"
    key        = "terraform.tfstate"
    region     = "ap-northeast-1"
    # アクセスキーID
    access_key = "*****"
    # シークレットアクセスキー
    secret_key = "*****"
  }
}

provider "aws" {
  region     = "ap-northeast-1"
  # アクセスキーID
  access_key = "*****"
  # シークレットアクセスキー
  secret_key = "*****"
}
```

#### ▼ `credentials`ファイルによる設定

クレデンシャル情報は、`~/.aws/credentials`ファイルに記載されている。

```ini
# 標準プロファイル
[default]
aws_access_key_id=*****
aws_secret_access_key=*****

# 独自プロファイル
[bar-profile]
aws_access_key_id=*****
aws_secret_access_key=*****
```

`credentials`ファイルを読み出し、プロファイル名を設定することにより、クレデンシャル情報を参照できる。

**＊実装例＊**

```terraform
# @ルートモジュール

terraform {
  required_version = "0.13.5"

  required_providers {

    aws = {
      source  = "hashicorp/aws"
      version = "3.0"
    }
  }

  # credentialsファイルから、アクセスキーID、シークレットアクセスキーを読み込む
  backend "s3" {
    # バケット名
    bucket                  = "prd-foo-tfstate-bucket"
    # .tfstateファイル名とバケット内ディレクトリ構造
    key                     = "terraform.tfstate"
    region                  = "ap-northeast-1"
    # credentialsファイルへのパス
    shared_credentials_file = "$HOME/.aws/credentials"
    # credentialsファイルのプロファイル名
    profile                 = "bar-profile"
  }
}

# credentialsファイルから、アクセスキーID、シークレットアクセスキーを読み込む
provider "aws" {
  region                  = "ap-northeast-1"
  profile                 = "foo"
  shared_credentials_file = "$HOME/.aws/<Credentialsファイル名>"
}
```

#### ▼ 環境変数による設定

`credentials`ファイルではなく、`export`コマンドを使用して、必要な情報も設定できる。

参照できる環境変数名は決まっている。

```bash
# regionの代わり
$ export AWS_DEFAULT_REGION="ap-northeast-1"

# access_keyの代わり
$ export AWS_ACCESS_KEY_ID="*****"

# secret_keyの代わり
$ export AWS_SECRET_ACCESS_KEY="*****"

# profileの代わり
$ export AWS_PROFILE="bar-profile"

# tokenの代わり (AWS STSを使用する場合)
$ export AWS_SESSION_TOKEN="*****"
```

環境変数を設定すると、値が`provider`ブロックに自動的に出力される。

CircleCIのような、一時的に環境変数が必要になるような状況では有効な方法である。

```terraform
# @ルートモジュール

terraform {
  required_version = "0.13.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "3.0"
    }
  }

  # リージョン、アクセスキーID、シークレットアクセスキーは不要
  backend "s3" {
    bucket  = "<バケット名>"
    key     = "<.tfstateファイル名とバケット内ディレクトリ構造>"
  }
}

# 環境変数から、アクセスキーID、シークレットアクセスキーを読み込む
# リージョン、アクセスキーID、シークレットアクセスキー、の設定は不要
provider "aws" {}
```

<br>
