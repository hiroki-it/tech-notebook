---
hide:
  - navigation
tags:
  - "IaC"
---

# セクションの目次

## ⚙️ IaC

### IaC

!!! cards ":material-file-code-outline: IaC"

    <div class="grid cards compact" markdown>

    - **[IaC](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code.html)**

      IaC の手続き型と宣言型、プロビジョニング

    </div>

<br>

### 手続き型

!!! cards ":simple-ansible: Ansible"

    <div class="grid cards compact" markdown>

    - **[Ansible](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_ansible.html)**

      Ansible の Playbook と Ansible Galaxy

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_ansible_command.html)**

      ansible-playbook や ansible-vault などのコマンド

    - **[Playbook](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_ansible_playbook.html)**

      playbook ファイルと role の構成

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_ansible_cfg.html)**

      ansible.cfg と inventory の設定

    - **[Ansible Galaxy](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_ansible_galaxy.html)**

      Ansible Galaxy による role の共有

    </div>

!!! cards ":simple-docker: Docker"

    Dockerfile の書き方とコマンド

    <div class="grid cards compact" markdown>

    - **[Dockerfile](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_docker_dockerfile.html)**

      FROM、COPY、CMD などの命令

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_docker_command.html)**

      Docker コマンド (仮想化セクションを参照)

    - **[プラクティス集](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_docker_practices.html)**

      イメージの分割、サイズ削減、脆弱性対策

    </div>

<br>

### 宣言型

!!! cards ":simple-docker: Docker Compose"

    docker-compose.yml によるコンテナの構成管理

    <div class="grid cards compact" markdown>

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_docker_compose_command.html)**

      docker compose コマンド

    - **[docker-compose.yml](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_docker_compose_yml.html)**

      services や networks によるコンテナの定義

    </div>

!!! cards ":simple-kaniko: Kaniko"

    <div class="grid cards compact" markdown>

    - **[Kaniko](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_docker_kaniko.html)**

      Kaniko によるデーモン不要のイメージビルド

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_docker_kaniko_conf.html)**

      config.json によるレジストリの認証

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_docker_kaniko_command.html)**

      executor のビルドオプション

    </div>

!!! cards ":simple-kubernetes: Kubernetes"

    <div class="grid cards compact" markdown>

    - **[Kubernetes](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/kubernetes/index.html)**

      量が多いため、K8s セクションに切り分け

    </div>

!!! cards ":simple-packer: Packer"

    <div class="grid cards compact" markdown>

    - **[Packer](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_packer.html)**

      Packer によるマシンイメージの作成

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_packer_command.html)**

      packer コマンドの使い方

    - **[テンプレート](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_packer_template.html)**

      source、build、provisioner によるイメージ定義

    </div>

!!! cards ":simple-serverless: Serverless Framework"

    serverless.yml によるサーバーレス環境の構築

    <div class="grid cards compact" markdown>

    - **[serverless.yml](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_serverless_framework_serverless_yml.html)**

      functions や provider などの設定

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_serverless_framework_serverless_command.html)**

      serverless コマンドの使い方

    </div>

!!! cards ":simple-terraform: Terraform"

    Terraform のブロック、モジュール、プロバイダー、tfstate 分割

    <div class="grid cards compact" markdown>

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_terraform_command.html)**

      terraform コマンドと tfstate へのインポート

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_terraform_conf.html)**

      バックエンドと資格情報のファイル

    - **[ブロック (tf ファイル)](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_terraform_tf_block.html)**

      resource、data、variable などのブロック

    - **[モジュール (tf ファイル)](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_terraform_tf_module.html)**

      ルートモジュールとチャイルドモジュール

    - **[独自プロバイダー (プロバイダー)](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_terraform_provider_self.html)**

      Terraform Plugin Framework による独自プロバイダー

    - **[AWS プロバイダー (プロバイダー)](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_terraform_provider_aws.html)**

      AWS プロバイダーによる各 AWS リソースの定義

    - **[Kubernetes プロバイダー (プロバイダー)](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_terraform_provider_kubernetes.html)**

      Kubernetes プロバイダーの設定

    - **[CI/CD パイプライン](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_terraform_ci_cd_pipeline.html)**

      CircleCI による Terraform のパイプライン

    - **[プラクティス集 (プラクティス集)](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_terraform_practices.html)**

      リポジトリ、ディレクトリ構成、命名規則

    - **[tfstate ファイル分割 (プラクティス集)](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_terraform_practices_tfstate.html)**

      tfstate ファイルの分割パターン

    </div>

!!! cards ":simple-vagrant: Vagrant"

    Vagrantfile による仮想マシンの構築

    <div class="grid cards compact" markdown>

    - **[Vagrantfile](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_vagrant_vagrantfile.html)**

      Vagrant.configure と config.vm の設定

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_vagrant_command.html)**

      vagrant コマンドの使い方

    </div>

<br>
