---
title: 【IT技術の知見】CI/CDパイプライン＠Terraform
description: CI/CDパイプライン＠Terraformの知見を記録しています。
---

# CI/CDパイプライン＠Terraform

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 02. CircleCIを使用したCI/CDパイプライン

### 要素

#### ▼ 環境

| env  | 説明                                                         |
| ---- | ------------------------------------------------------------ |
| tes  | プルリクエストのレビュー時に、コードの変更を検証するためのインフラ環境 |
| stg  | ステージング環境                                             |
| prd  | 本番環境                                                     |

#### ▼ Job

| jobs     | 説明                                                                        |
|----------|---------------------------------------------------------------------------|
| plan     | aws-cliのインストールから```terraform plan -out```コマンドまでの一連の処理を実行する。               |
| 承認Job    |                                                                           |
| apply    | ステージング環境または本番環境に対して、```terraform apply```コマンドを実行する。                       |
| plan（任意） | ```terraform apply```によって差分が無くなったかを、```terraform plan```コマンドを改めて実行し、確認する。 |


#### ▼ Workflow

| workflows | 説明                         |
| --------- |----------------------------|
| feature   | ```feature```ブランチからテスト環境にデプロイ    |
| develop   | ```develop```ブランチからステージング環境にデプロイ |
| main      | ```main```ブランチから本番環境にデプロイ        |

<br>

### ```config.yml```ファイル

**＊実装例＊**

```yaml
version: 2.1

executors:
  primary_container:
    parameters:
      env:
        type: enum
        enum: [ "tes", "stg", "prd" ]
    docker:
      - image: hashicorp/terraform:1.0.0
    working_directory: ~/foo_infrastructure
    environment:
      ENV: << parameters.env >>

commands:
  # AWSにデプロイするための環境を作成します。
  aws_setup:
    steps:
      - run:
          name: Install jq
          command: |
            apk add curl
            curl -o /usr/bin/jq -L https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64
            chmod +x /usr/bin/jq
      - run:
          name: Install aws-cli
          command: |
            apk add python3
            apk add py-pip
            pip3 install awscli
            aws --version
      - run:
          name: Assume role
          command: |
            set -x
            source ./ops/assume.sh

  # terraform initを行います。
  terraform_init:
    steps:
      - run:
          name: Terraform init
          command: |
            set -x
            source ./ops/terraform_init.sh

  # terraform fmtを行います。
  terraform_fmt:
    steps:
      - run:
          name: Terraform fmt
          command: |
            set -x
            source ./ops/terraform_fmt.sh
            
  # terraform validateを行います。
  terraform_validate:
    steps:
      - run:
          name: Terraform validate
          command: |
            set -x
            source ./export_aws_envs.sh
            source ./ops/terraform_validate.sh

  # terraform planを行います。
  terraform_plan:
    steps:
      - run:
          name: Terraform plan
          command: |
            set -x
            source ./export_aws_envs.sh
            source ./ops/terraform_plan.sh
            ls -la

  # terraform applyを行います。
  terraform_apply:
    steps:
      - run:
          name: Terraform apply
          command: |
            set -x
            ls -la
            source ./export_aws_envs.sh
            source ./ops/terraform_apply.sh

jobs:
  plan:
    parameters:
      exr:
        type: executor
    executor: << parameters.exr >>
    steps:
      - checkout
      - aws_setup
      - terraform_init
      - terraform_fmt
      - terraform_validate
      - terraform_plan
      - persist_to_workspace:
          root: .
          paths:
            - .

  apply:
    parameters:
      exr:
        type: executor
    executor: << parameters.exr >>
    steps:
      - attach_workspace:
          at: .
      - terraform_apply

workflows:
  # テスト環境
  feature:
    jobs:
      - plan:
          name: plan_tes
          exr:
            name: primary_container
            env: tes
          filters:
            branches:
              only:
                - /feature.*/
      - apply:
          name: apply_tes
          exr:
            name: primary_container
            env: tes
          requires:
            - plan_tes

  # ステージング環境
  develop:
    jobs:
      - plan:
          name: plan_stg
          exr:
            name: primary_container
            env: stg
          filters:
            branches:
              only:
                - develop
      - hold_apply:
          name: hold_apply_stg
          type: approval
          requires:
            - plan_stg
      - apply:
          name: apply_stg
          exr:
            name: primary_container
            env: stg
          requires:
            - hold_apply_stg

  # 本番環境
  main:
    jobs:
      - plan:
          name: plan_prd
          exr:
            name: primary_container
            env: prd
          filters:
            branches:
              ignore: /.*/
            tags:
              only: /release\/.*/
      - hold_apply:
          name: hold_apply_prd
          type: approval
          requires:
            - plan_prd
          filters:
            branches:
              ignore: /.*/
            tags:
              only: /release\/.*/
      - apply:
          name: apply_prd
          exr:
            name: primary_container
            env: prd
          requires:
            - hold_apply_prd
          filters:
            branches:
              ignore: /.*/
            tags:
              only: /release\/.*/
```

<br>

### シェルスクリプト

#### ▼ ```assume_role.sh```ファイル

Assume Roleを実行し、CircleCIで使用するIAMユーザーにロールを一時的に委譲する。

**＊実装例＊**

```bash
#!/bin/bash

set -xeuo pipefail
set -u

# 事前に環境変数に実行環境名を代入する。
case $ENV in
    "tes")
        aws_account_id="<テスト環境アカウントID>"
        aws_access_key_id="<テスト環境アクセスキーID>"
        aws_secret_access_key="<テスト環境シークレットアクセスキー>"
        aws_iam_role_external_id="<信頼ポリシーに設定した外部ID>"
    ;;
    "stg")
        aws_account_id="<ステージング環境アカウントID>"
        aws_access_key_id="<ステージング環境アクセスキーID>"
        aws_secret_access_key="<ステージング環境シークレットアクセスキー>"
        aws_iam_role_external_id="<信頼ポリシーに設定した外部ID>"
    ;;
    "prd")
        aws_account_id="<本番環境アカウントID>"
        aws_access_key_id="<本番環境アクセスキーID>"
        aws_secret_access_key="<本番環境シークレットアクセスキー>"
        aws_iam_role_external_id="<信頼ポリシーに設定した外部ID>"
    ;;
    *)
        echo "The parameter ${ENV} is invalid."
        exit 1
    ;;
esac

# 信頼されたエンティティのクレデンシャル情報を設定する。
aws configure set aws_access_key_id "$aws_account_id"
aws configure set aws_secret_access_key "$aws_secret_access_key"
aws configure set aws_default_region "ap-northeast-1"

# https://sts.amazonaws.com に、ロールの紐付けをリクエストする。
aws_sts_credentials="$(aws sts assume-role \
  --role-arn "arn:aws:iam::${aws_access_key_id}:role/${ENV}-<紐付けしたいIAMロール名>" \
  --role-session-name "<任意のセッション名>" \
  --external-id "$aws_iam_role_external_id" \
  --duration-seconds "<セッションの有効秒数>" \
  --query "Credentials" \
  --output "json")"

# クレデンシャル情報を環境変数に出力するためのスクリプトを作成する。
cat << EOT > "export_aws_envs.sh"
export AWS_ACCESS_KEY_ID="$(echo "$aws_sts_credentials" | jq -r '.AccessKeyId')"
export AWS_SECRET_ACCESS_KEY="$(echo "$aws_sts_credentials" | jq -r '.SecretAccessKey')"
export AWS_SESSION_TOKEN="$(echo "$aws_sts_credentials" | jq -r '.SessionToken')"
export AWS_ACCOUNT_ID="$aws_account_id"
export AWS_DEFAULT_REGION="ap-northeast-1"
EOT
```

<br>

#### ▼ ```terraform_apply.sh```ファイル

特定のAWSアカウントに対して```terraform apply```コマンドを実行する。

**＊実装例＊**

```bash
#!/bin/bash

set -xeuo pipefail

# credentialsの情報を出力します。
source ./aws_envs.sh

terraform -chdir=./${ENV} apply \
  -parallelism=30 \
  ${ENV}.tfplan
```

<br>

#### ▼ ```terraform_fmt.sh```ファイル

GitHubリポジトリにプッシュされたコードに対して```terraform fmt```コマンドを実行する。

**＊実装例＊**

```bash
#!/bin/bash

set -xeuo pipefail

terraform fmt \
  -recursive \
  -check
```

<br>

#### ▼ ```terraform_init.sh```ファイル

GitHubリポジトリにプッシュされたコードに対して```terraform init```コマンドを実行する。

**＊実装例＊**

```bash
#!/bin/bash

set -xeuo pipefail

# credentialsの情報を出力します。
source ./aws_envs.sh

terraform -chdir=./${ENV} init \
  -upgrade \
  -reconfigure \
  -backend=true \
  -backend-config="bucket=${ENV}-tfstate-bucket" \
  -backend-config="key=terraform.tfstate" \
  -backend-config="encrypt=true"
```

<br>

#### ▼ ```terraform_plan.sh```ファイル

特定のAWSアカウントに対して```terraform plan```コマンドを実行する。

**＊実装例＊**

```bash
#!/bin/bash

set -xeuo pipefail

# credentialsの情報を出力します。
source ./aws_envs.sh

terraform -chdir=./${ENV} plan \
  -var-file=./${ENV}/foo.tfvars \
  -out=${ENV}.tfplan \
  -parallelism=30
```

<br>

#### ▼ ```terraform_validate.sh```ファイル

GitHubリポジトリにプッシュされたコードに対して```terraform validate```コマンドを実行する。

**＊実装例＊**

```bash
#!/bin/bash

set -xeuo pipefail

terraform -chdir=./${ENV} validate
```

<br>

## 03. tfnotify

### tfnotifyとは

Terraformの```terraform plan```コマンドまたは```terraform apply```コマンドの処理結果を、POSTで送信するバイナリファイルのこと。URLや送信内容を設定ファイルで定義する。CircleCIで利用する場合は、ダウンロードしたtfnotifyのバイナリファイルを実行する。環境別にtfnotifyを配置しておくと良い。

> ℹ️ 参考：https://github.com/mercari/tfnotify/releases/tag/v0.7.0

<br>

### コマンド

#### ▼ --config

設定ファイルを使用して、tfnotifyを実行する。

**＊実装例＊**

```bash
#!/bin/bash

set -xeuo pipefail

terraform -chdir=./${ENV} plan \
  -out=${ENV}.tfplan \
  -parallelism=30 | ./ops/tfnotify --config ./${ENV}/tfnotify.yml plan
```

```bash
#!/bin/bash

set -xeuo pipefail

# credentialsの情報を出力します。
source ./aws_envs.sh

terraform -chdir=./${ENV} apply \
  -parallelism=30 \
  ${ENV}.tfplan | ./ops/tfnotify --config ./${ENV}/tfnotify.yml apply
```

<br>

### ```tfnotify.yml```ファイル

#### ▼ ci

使用するCIツールを設定する。

```yaml
# https://github.com/mercari/tfnotify
---
ci: circleci
```

#### ▼ notifier

リポジトリに通知をPOST送信できるように、認証情報を設定する。

```yaml
# https://github.com/mercari/tfnotify
---
notifier:
  github:
    # 環境変数に登録したパーソナルアクセストークン
    token: $GITHUB_TOKEN
    repository:
      # 宛先のユーザー名もしくは組織名
      owner: "foo-company"
      name: "foo-repository"
```

#### ▼ terraform

通知内容を設定する。

```yaml
# https://github.com/mercari/tfnotify
---
terraform:
  plan:
    template: |
      {{ .Title }} for staging <sup>[CI link]( {{ .Link }} )</sup>
      {{ .Message }}
      {{if .Result}}
      <pre><code> {{ .Result }}
      </pre></code>
      {{end}}
      <details><summary>Details (Click me)</summary>

      <pre><code> {{ .Body }}
      </pre></code></details>
  apply:
    template: |
      {{ .Title }}
      {{ .Message }}
      {{if .Result}}
      <pre><code>{{ .Result }}
      </pre></code>
      {{end}}
      <details><summary>Details (Click me)</summary>

      <pre><code>{{ .Body }}
      </pre></code></details>
```

<br>

