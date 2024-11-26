---
title: 【IT技術の知見】template.json＠Packer
description: template.json＠Packerの知見を記録しています。
---

# template.json＠Packer

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
    - packer build template.json
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

## 02. builders

### buildersとは

作成するマシンイメージやコンテナイメージの内容を設定する。

<br>

### typeがamazon-ebsの場合

#### ▼ ami_name

AMIの名前を設定する。

```yaml
{"builders": [{"type": "amazon-ebs", "ami_name": "bar-ami"}]}
```

#### ▼ ami_users

```yaml
{"builders": [{"type": "amazon-ebs", "ami_users": "<AWSアカウントID>"}]}
```

#### ▼ ena_support

```yaml
{"builders": [{"type": "amazon-ebs", "ena_support": "true"}]}
```

#### ▼ encrypt_boot

```yaml
{"builders": [{"type": "amazon-ebs", "encrypt_boot": "false"}]}
```

#### ▼ force_deregister

同じ名前のマシンイメージが存在する場合に、既存のマシンイメージを登録解除してからこれを作成するか否か、を設定する。

Packerの作成するマシンイメージの名前は、ランダム値をつけない限り、常に同じである。

マシンイメージの名前の重複を許可しないプロバイダー (例：AWS) では、`1`個の名前のマシンイメージを一回しか作成できないことになってしまう。

そういった場合に必要になる。

```yaml
{"builders": [{"type": "amazon-ebs", "force_deregister": "true"}]}
```

#### ▼ instance_type

```yaml
{"builders": [{"type": "amazon-ebs", "instance_type": "t2.micro"}]}
```

#### ▼ launch_block_device_mappings

EC2に紐付けるルートデバイスボリュームを設定する。

```yaml
{"builders": [{"type": "amazon-ebs", "launch_block_device_mappings": [
            {
              # ルートボリューム
              "device_name": "/dev/xvda",
              "volume_type": "gp2",
              # AMIの作成後に、元となったEC2のボリュームを削除する
              "delete_on_termination": "true",
              "volume_size": "300",
            },
          ]}]}
```

#### ▼ region

AMIを作成するリージョンを設定する。

```yaml
{"builders": [{"type": "amazon-ebs", "region": "ap-northeast-1"}]}
```

#### ▼ snapshot_users

```yaml
{"builders": [{"type": "amazon-ebs", "snapshot_users": "<AWSアカウントID>"}]}
```

#### ▼ source_ami

AMIの基とするAMI (例：Amazon Linux 2 AMI) を設定する。

```yaml
{"builders": [{"type": "amazon-ebs", "source_ami": "ami-0b7546e839d7ace12"}]}
```

> - https://developer.hashicorp.com/packer/integrations/hashicorp/amazon/latest/components/builder/ebs#run-configuration

#### ▼ ssh_username

EC2へのSSH公開鍵認証時に使用するユーザー名を設定する。

```yaml
{"builders": [{"type": "amazon-ebs", "ssh_username": "ec2-user"}]}
```

> - https://developer.hashicorp.com/packer/integrations/hashicorp/amazon/latest/components/builder/ebs#communicator-configuration

#### ▼ temporary_key_pair_type

暗号化キーの種類を設定する。

```yaml
{"builders": [{"type": "amazon-ebs", "temporary_key_pair_type": "rsa"}]}
```

> - https://developer.hashicorp.com/packer/integrations/hashicorp/amazon/latest/components/builder/ebs#communicator-configuration

<br>

## 03. provisioners

### type

#### ▼ typeとは

サーバー/コンテナのプロビジョナーを設定する。

<br>

### ansibleの場合

#### ▼ playbook_file

```yaml
{"provisioners": [{"type": "ansible", "playbook_file": "./playbook.yml"}]}
```

#### ▼ user

```yaml
{"provisioners": [{"type": "ansible", "user": "ec2-user"}]}
```

<br>

### shellの場合

#### ▼ inline

```yaml
{"provisioners": [{"type": "shell", "inline": ["echo Hello World"]}]}
```

<br>

## 04. variables

### variablesとは

ファイル内で使用する変数を設定する。

```yaml
{
  "variables": {"region": "ap-northeast-1"},
  "builders": [{"region": "{{ user `region` }}"}],
}
```

<br>
