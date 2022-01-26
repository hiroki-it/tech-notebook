---
title: 【知見を記録するサイト】CI/CD@Terraform
---

# CI/CD@Terraform

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. リリース

### リリースの粒度

#### ・大原則：PullReqを1つずつリリース

基本的には，PullReqを1つずつリリースするようにする．ただ，軽微なupdate処理が実行されるPullReqであれば，まとめてリリースしても良い．もしリリース時に問題が起こった場合，インフラのバージョンのロールバックを行う必要がある．経験則で，create処理やdestroy処理よりもupdate処理の方がエラーが少ないため，ロールバックにもたつきにくい．PullReqを複数まとめてリリースすると，create処理やdestroy処理が実行されるロールバックに失敗する可能性が高くなる．

#### ・既存のリソースに対して，新しいリソースを紐づける場合

既存のリソースに対して，新しいリソースを紐づける場合，新しいリソースの構築と紐づけを別々にリリースする．ロールバックでもたつきにくく，またTerraformで問題が起こったとしても変更点が紐づけだけなので，原因を追究しやすい．

#### ・Terraformとプロバイダーの両方をアップグレードする場合

Teraformとプロバイダーを別々にリリースする．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_cloud_terraform.html

#### ・DBインスタンスの設定変更でダウンタイムが発生する場合

DBインスタンスの設定変更でダウンタイムが発生する場合，それぞれのDBインスタンスに対する変更を別々にリリースする．また，リリース順序は以下の通りとする．プライマリインスタンスのリリース時にフェールオーバーが発生するため，ダウンタイムを短縮できる．

1. リードレプリカの変更をリリースする．
2. プライマリインスタンスの変更をリリースする．リリース時にフェールオーバーを発生し，現プライマリインスタンスはリードレプリカに降格する．また，前のリリースですでに更新されたリードレプリカがプライマリインスタンスに昇格する．新しいリードレプリカがアップグレードされる間，代わりに新しいプライマリインスタンスが機能する．

ダウンタイムが発生するDBインスタンスの設定項目は以下のリンクを参考にせよ．RDSの項目として書かれており，Auroraではないが，おおよそ同じなため参考にしている．

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.Settings

<br>

### ロールバックの方法

Terraformには，インフラのバージョンのロールバック機能がない．そこで，1つ前のリリースタグをRerunすることで，バージョンのロールバックを実行する．今回のリリースのcreate処理が少ないほどRerunでdestroy処理が少なく，反対にdestroy処理が少ないほどcreate処理が少なくなる．もしリリース時に問題が起こった場合，インフラのバージョンのロールバックを行う必要があるが，経験則でcreate処理やdestroy処理よりもupdate処理の方がエラーが少ないため，ロールバックにもたつきにくい．そのため，Rerun時にどのくらいのcreate処理やdestroy処理が実行されるかと考慮し，1つ前のリリースタグをRerunするか否かを判断する．



## 02. CircleCIを用いたCI/CD

### 要素

#### ・環境

| env  | 説明                                                         |
| ---- | ------------------------------------------------------------ |
| dev  | PullReqのレビュー時に，コードの変更を検証するためのインフラ環境 |
| stg  | ステージング環境                                             |
| prd  | 本番環境                                                     |

#### ・ジョブ

| jobs       | 説明                                                         |
| ---------- | ------------------------------------------------------------ |
| plan       | aws-cliのインストールから```terraform plan -out```コマンドまでの一連の処理を実行する． |
| 承認ジョブ |                                                              |
| apply      | stg環境またはprd環境にデプロイ                               |

#### ・ワークフロー

| workflows | 説明                                 |
| --------- | ------------------------------------ |
| feature   | featureブランチからdev環境にデプロイ |
| develop   | developブランチからstg環境にデプロイ |
| main      | mainブランチからprd環境にデプロイ    |

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
        enum: [ "dev", "stg", "prd" ]
    docker:
      - image: hashicorp/terraform:x.xx.x
    working_directory: ~/foo_infrastructure
    environment:
      ENV: << parameters.env >>

commands:
  # AWSにデプロイするための環境を構築します．
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

  # terraform initを行います．
  terraform_init:
    steps:
      - run:
          name: Terraform init
          command: |
            set -x
            source ./ops/terraform_init.sh

  # terraform fmtを行います．
  terraform_fmt:
    steps:
      - run:
          name: Terraform fmt
          command: |
            set -x
            source ./ops/terraform_fmt.sh
            
  # terraform validateを行います．
  terraform_validate:
    steps:
      - run:
          name: Terraform validate
          command: |
            set -x
            source ./export_aws_envs.sh
            source ./ops/terraform_validate.sh

  # terraform planを行います．
  terraform_plan:
    steps:
      - run:
          name: Terraform plan
          command: |
            set -x
            source ./export_aws_envs.sh
            source ./ops/terraform_plan.sh
            ls -la

  # terraform applyを行います．
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
  # Development env
  feature:
    jobs:
      - plan:
          name: plan_dev
          exr:
            name: primary_container
            env: dev
          filters:
            branches:
              only:
                - /feature.*/
      - apply:
          name: apply_dev
          exr:
            name: primary_container
            env: dev
          requires:
            - plan_dev

  # Staging env
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

  # Production env
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

#### ・```assume_role.sh```ファイル

Assume Roleを実行し，CircleCIで用いるIAMユーザーにロールを一時的に委譲する．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/cloud_computing/cloud_computing_aws.html

**＊実装例＊**

```bash
#!/bin/bash

set -xeuo pipefail
set -u

# 事前に環境変数にインフラ環境名を代入する．
case $ENV in
    "dev")
        aws_account_id="<作業環境アカウントID>"
        aws_access_key_id="<作業環境アクセスキーID>"
        aws_secret_access_key="<作業環境シークレットアクセスキー>"
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

# 信頼されたエンティティのアカウント情報を設定する．
aws configure set aws_access_key_id "$aws_account_id"
aws configure set aws_secret_access_key "$aws_secret_access_key"
aws configure set aws_default_region "ap-northeast-1"

# https://sts.amazonaws.com に、ロールのアタッチをリクエストする．
aws_sts_credentials="$(aws sts assume-role \
  --role-arn "arn:aws:iam::${aws_access_key_id}:role/${ENV}-<アタッチしたいIAMロール名>" \
  --role-session-name "<任意のセッション名>" \
  --external-id "$aws_iam_role_external_id" \
  --duration-seconds "<セッションの有効秒数>" \
  --query "Credentials" \
  --output "json")"

# アカウント情報を環境変数に出力するためのスクリプトを作成する．
cat << EOT > "export_aws_envs.sh"
export AWS_ACCESS_KEY_ID="$(echo "$aws_sts_credentials" | jq -r '.AccessKeyId')"
export AWS_SECRET_ACCESS_KEY="$(echo "$aws_sts_credentials" | jq -r '.SecretAccessKey')"
export AWS_SESSION_TOKEN="$(echo "$aws_sts_credentials" | jq -r '.SessionToken')"
export AWS_ACCOUNT_ID="$aws_account_id"
export AWS_DEFAULT_REGION="ap-northeast-1"
EOT
```

<br>

#### ・```terraform_apply.sh```ファイル

特定のAWS環境に対して```apply```コマンドを実行する．

**＊実装例＊**

```bash
#!/bin/bash

set -xeuo pipefail

# credentialsの情報を出力します．
source ./aws_envs.sh

terraform -chdir=./${ENV} apply \
  -parallelism=30 \
  ${ENV}.tfplan
```

<br>

#### ・```terraform_fmt.sh```ファイル

GitHubにプッシュされたコードに対して```fmt```コマンドを実行する．

**＊実装例＊**

```bash
#!/bin/bash

set -xeuo pipefail

terraform fmt \
  -recursive \
  -check
```

<br>

#### ・```terraform_init.sh```ファイル

GitHubにプッシュされたコードに対して```init```コマンドを実行する．

**＊実装例＊**

```bash
#!/bin/bash

set -xeuo pipefail

# credentialsの情報を出力します．
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

#### ・```terraform_plan.sh```ファイル

特定のAWS環境に対して```plan```コマンドを実行する．

**＊実装例＊**

```bash
#!/bin/bash

set -xeuo pipefail

# credentialsの情報を出力します．
source ./aws_envs.sh

terraform -chdir=./${ENV} plan \
  -var-file=./${ENV}/foo.tfvars \
  -out=${ENV}.tfplan \
  -parallelism=30
```

<br>

#### ・```terraform_validate.sh```ファイル

GitHubにプッシュされたコードに対して```validate```コマンドを実行する．

**＊実装例＊**

```bash
#!/bin/bash

set -xeuo pipefail

terraform -chdir=./${ENV} validate
```

<br>

## 03. tfnotify

### tfnotifyとは

terraformの```plan```コマンドまたは```apply```コマンドの処理結果を，POSTで送信するバイナリファイルのこと．URLや送信内容を設定ファイルで定義する．CircleCIで利用する場合は，ダウンロードしたtfnotifyのバイナリファイルを実行する．環境別にtfnotifyを配置しておくと良い．

参考：https://github.com/mercari/tfnotify/releases/tag/v0.7.0

<br>

### コマンド

#### ・--config

設定ファイルを用いて，tfnotifyを実行する．

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

# credentialsの情報を出力します．
source ./aws_envs.sh

terraform -chdir=./${ENV} apply \
  -parallelism=30 \
  ${ENV}.tfplan | ./ops/tfnotify --config ./${ENV}/tfnotify.yml apply
```

<br>

### ```tfnotify.yml```ファイル

あらかじめ，GitHubのアクセストークンを発行し，CIツールの環境変数に登録しておく．

**＊実装例＊**

例として，GitHubの特定のリポジトリのPullReqエストにPOSTで送信する．

```yaml
# https://github.com/mercari/tfnotify
---
ci: circleci

notifier:
  github:
    # 環境変数に登録したパーソナルアクセストークン
    token: $GITHUB_TOKEN
    repository:
      # 送信先のユーザー名もしくは組織名
      owner: "foo-company"
      name: "foo-repository"

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
