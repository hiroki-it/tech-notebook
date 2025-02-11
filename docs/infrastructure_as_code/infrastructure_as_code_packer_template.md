---
title: 【IT技術の知見】テンプレート＠Packer
description: テンプレート＠Packerの知見を記録しています。
---

# テンプレート＠Packer

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ aptリポジトリから

> - https://www.packer.io/downloads

```bash
$ curl -L https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
$ sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
$ sudo apt-get update && sudo apt-get install packer
```

<br>

### CIによる自動化

#### ▼ GitLab CI

```yaml
variables:
  AWS_DEFAULT_REGION: "ap-northeast-1"
  AWS_ACCOUNT_ID: "*****"
  AWS_IAM_ROLE: "gitlab-ci-packer"

stages:
  - build

build_ami:
  stage: build
  # CIの実行環境
  image: docker:19.03.0
  # サービスコンテナ
  services:
    - name: docker:19.03.0-dind
  variables:
    GIT_SUBMODULE_STRATEGY: "recursive"
  id_tokens:
    GITLAB_OIDC_TOKEN:
      aud: <GitLabのURL>
  before_script:
    - apt-get update && apt-get install -y git jq awscli
    # クレデンシャルを取得する
    - |
      echo "sleeping random seconds (<15s)"
      sleep $(( $RANDOM % 15 ))
      count=0
      backoff=1
      until STS=($(aws sts assume-role-with-web-identity \
      --role-arn arn:aws:iam::${AWS_ACCOUNT_ID}:role/${AWS_IAM_ROLE} \
      --role-session-name ""<任意のセッション名>" \
      --web-identity-token $GITLAB_OIDC_TOKEN \
      --duration-seconds 1800 \
      --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
      --output text)) || (( count++ >= 5 )); do echo "Retrying: $backoff"; sleep $backoff; (( backoff*=2 )); done
      export AWS_ACCESS_KEY_ID="${STS[0]}"
      export AWS_SECRET_ACCESS_KEY="${STS[1]}"
      export AWS_SESSION_TOKEN="${STS[2]}"
      aws sts get-caller-identity
  script:
    - export SOURCE_IMAGE_ID=$(aws ssm get-parameters --names /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-6.1-x86_64 --region ${AWS_DEFAULT_REGION} --query 'Parameters[0].Value' --output text)
    - echo "source ami-id: $SOURCE_IMAGE_ID"
    # Packerを実行する
    - packer init template.pkr.hcl
    - packer build template.pkr.hcl
    - AMI_NAME="foo-$(date "+%Y-%m-%d")"
    - AMI_ID=$(aws ec2 describe-images --region ${AWS_DEFAULT_REGION} --owners self --filters "Name=name,Values=${AMI_NAME}" --query 'Images[*][ImageId]' --output text)
    - SOURCE_IMAGE_NAME=$(git tag -l $CI_COMMIT_TAG -n | awk '{print $2}' | jq -r .image_name)
    - echo $SOURCE_IMAGE_NAME
  rules:
    - if: $CI_COMMIT_TAG
    - when: manual
```

> - https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-store-public-parameters-ami.html

<br>

## 02. build

### sources

実行する`source`を設定する。

```hcl
build {
  sources = ["source.amazon-ebs.foo"]
}
```

<br>

### provisioner

```hcl
build {

  provisioner "shell-local" {

  }
}
```

```hcl
build {

  provisioner "shell" {

  }
}
```

```hcl
build {

  provisioner "ansible" {

  }
}
```

<br>

## 03. provisioner

### provisionerとは

サーバー/コンテナのプロビジョナーを設定する。

<br>

### ansibleの場合

#### ▼ playbook_file

```hcl
build {

  provisioner "ansible" {
    playbook_file = "playbook.yml"
  }
}
```

#### ▼ user

```hcl
build {

  provisioner "ansible" {
    user = "ec2-user"
  }
}
```

<br>

### shell-localの場合

#### ▼ shell-local

Ansibleは、コントロールノード (ansibleデプロイサーバー) と管理対象ノード (ansibleデプロイ先サーバー) から構成される。

`shell-local`では、コントロールノードで実行するコマンドを設定する。

#### ▼ inline

```hcl
build {

  provisioner "shell-local" {
    command = "ansible-galaxy install -f -r requirements.yml -p roles"
  }
}
```

<br>

### shellの場合

#### ▼ shellとは

Ansibleは、コントロールノード (ansibleデプロイサーバー) と管理対象ノード (ansibleデプロイ先サーバー) から構成される。

`shell`では、管理対象ノードで実行するコマンドを設定する。

#### ▼ inline

```hcl
build {

  provisioner "shell" {
    inline = ["echo Hello World"]
  }
}
```

<br>

## 04. source

### sourceとは

作成するマシンイメージやコンテナイメージの内容を設定する。

<br>

### amazon-ebsの場合

#### ▼ ami_name

AWS AMIの名前を設定する。

```hcl
source "amazon-ebs" "foo" {
  "ami_name" = "bar-ami"
}
```

#### ▼ ami_users

```hcl
source "amazon-ebs" "foo" {
  "ami_users" = "<AWSアカウントID>"
}
```

#### ▼ ena_support

```hcl
source "amazon-ebs" "foo" {
  "ena_support" = true
}
```

#### ▼ encrypt_boot

```hcl
source "amazon-ebs" "foo" {
  "encrypt_boot" = false
}
```

#### ▼ force_deregister

同じ名前のマシンイメージが存在する場合に、既存のマシンイメージを登録解除してからこれを作成するか否か、を設定する。

Packerの作成するマシンイメージの名前は、ランダム値をつけない限り、常に同じである。

マシンイメージの名前の重複を許可しないプロバイダー (例：AWS) では、`1`個の名前のマシンイメージを一回しか作成できないことになってしまう。

そういった場合に必要になる。

```hcl
source "amazon-ebs" "foo" {
  "force_deregister" = true
}
```

#### ▼ instance_type

```hcl
source "amazon-ebs" "foo" {
  "instance_type" = "t2.micro"
}
```

#### ▼ launch_block_device_mappings

EC2に紐付けるルートデバイスボリュームを設定する。

```hcl
source "amazon-ebs" "foo" {
  "launch_block_device_mappings" = [
    {
      # ルートボリューム
      "device_name": "/dev/xvda",
      "volume_type": "gp2",
      # AWS AMIの作成後に、元となったEC2のボリュームを削除する
      "delete_on_termination": "true",
      "volume_size": "300",
    },
  ]
}
```

#### ▼ region

AWS AMIを作成するリージョンを設定する。

```hcl
source "amazon-ebs" "foo" {
  "region" = "ap-northeast-1"
}
```

#### ▼ snapshot_users

```hcl
source "amazon-ebs" "foo" {
  "snapshot_users" = "<AWSアカウントID>"
}
```

#### ▼ source_ami

AWS AMIの基とするAWS AMI (例：Amazon Linux 2 AMI) を設定する。

```hcl
source "amazon-ebs" "foo" {
  "source_ami" = "ami-0b7546e839d7ace12"
}
```

> - https://developer.hashicorp.com/packer/integrations/hashicorp/amazon/latest/components/builder/ebs#run-configuration

#### ▼ ssh_username

EC2へのSSH公開鍵認証時に使用するユーザー名を設定する。

```hcl
source "amazon-ebs" "foo" {
  "ssh_username" = "ec2-user"
}
```

> - https://developer.hashicorp.com/packer/integrations/hashicorp/amazon/latest/components/builder/ebs#communicator-configuration

#### ▼ temporary_key_pair_type

暗号化キーの種類を設定する。

```hcl
source "amazon-ebs" "foo" {
  "temporary_key_pair_type" = "rsa"
}
```

> - https://developer.hashicorp.com/packer/integrations/hashicorp/amazon/latest/components/builder/ebs#communicator-configuration

<br>

## 05. variable

### variableとは

ファイル内で使用する変数を設定する。

```hcl
variable "region" {
  type    = string
  default = "ap-northeast-1"
}

source "amazon-ebs" "foo" {
  "region" = "${var.region}"
}
```

<br>
