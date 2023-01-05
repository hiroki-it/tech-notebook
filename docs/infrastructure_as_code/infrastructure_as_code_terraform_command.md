---
title: 【IT技術の知見】コマンド＠Terraform
description: コマンド＠Terraformの知見を記録しています。
---

# コマンド＠Terraform

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. terraformコマンド

### global option

#### ▼ -chdir

コマンドを実行する作業ディレクトリを指定する。



> ℹ️ 参考：https://www.terraform.io/cli/commands#switching-working-directory-with-chdir

<br>

### apply

#### ▼ applyとは

インフラリソースをプロビジョニングする。



#### ▼ -destroy

指定したバックエンドで管理するリソースを削除する。

削除後に、パラメーターとして使用した```tfvars```ファイル自体を削除する必要がある。



```bash
# 削除するまでに以下の手順が必要である。

# 初期化
$ terraform init -reconfigure -backend-config=backend.tfvars

# 現状のtfstateファイルと実インフラの間に、差分がないことを確認する。
$ terraform plan -var-file=terraform.tfvars

No changes. Your infrastructure matches the configuration.


# 実行計画
$ terraform plan -destroy -var-file=foo.tfvars

# 削除
$ terraform apply -destroy -var-file=foo.tfvars
```

#### ▼ -parallelism

並列処理数を設定できる。

デフォルト値は```10```である。

クラウドプロバイダーのレートリミットが小さい場合は、並列処理数を小さくし、コマンドのAPIのコールがレートリミットを超過しないようにする。



```bash
$ terraform apply \
    -var-file=foo.tfvars \
    -parallelism=30
```

#### ▼ -refresh-only

すでに管理対象になっている実インフラが、Terraformの管理外から変更された場合、実インフラの状態はそのままに、```.tfstate```ファイルにその状態を書き込む。

具体的は、```terraform plan```コマンドで出力される```Note: Objects have changed outside of Terraform```の内容を指す。

ただし、そもそもTerraformで管理されていない実インフラ（create処理判定されるもの）を処理することはできず、代わりに```terraform import```コマンドの実行が必要になる。



> ℹ️ 参考：
>
> - https://learn.hashicorp.com/tutorials/terraform/refresh
> - https://stackoverflow.com/questions/71327232/what-does-terraform-apply-plan-refresh-only-do
> - https://rurukblog.com/post/terraform-refresh-onlyt/

```bash
$ terraform apply -refresh-only

Apply complete! Resources: 0 added, 0 changed, 0 destroyed. # 実インフラは変更しない。
```

#### ▼ -target

特定の```resource```ブロックを使用して、```terraform apply```コマンドを実行する。

リリース用のブランチに、今回はリリースしたくない差分が含まれてしまっているような場合、特定の差分のみをプロビジョニングできる。



```bash
$ terraform apply \
    -var-file=foo.tfvars \
    -target='<resourceタイプ>.<resourceブロック名>'
```

```module```ブロックを採用している場合、指定の方法が異なる。



```bash
$ terraform apply \
    -var-file=foo.tfvars \
    -target='module.<moduleブロック名>.<resourceタイプ>.<resourceブロック名>'
```

**＊例＊**

```bash
$ terraform apply \
    -var-file=foo.tfvars \
    -target='aws_instance.bastion'
```

#### ▼ -var-file

クラウドプロバイダー上にクラウドインフラストラクチャを作成する。



```bash
$ terraform apply -var-file foo.tfvars
```

```bash
# ディレクトリを指定することも可能
$ terraform -chdir=<ルートモジュールのディレクトリへの相対パス> apply \
    -var-file=<ルートモジュールのディレクトリへの相対パス>/foo.tfvars
```

成功すると、以下のメッセージが表示される。



```bash
Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

#### ▼ ```.tfplan```ファイル

事前に、```terraform plan```コマンドによって作成された実行プランファイルを元に、```terraform apply```コマンドを実行する。

実行プランを渡す場合は、環境変数をオプションに設定する必要はない。



```bash
$ terraform apply foo.tfplan
```

<br>

### init

#### ▼ initとは

```terraform```コマンドを実行しているローカルマシンの```.terraform```ディレクトリを初期化（```terraform.lock.hcl```ファイルの作成、ローカル/リモートモジュールやプロバイダーのインストール、バックエンドの切り替えなど）を実行する。

```.tfstate```ファイルを書き換えることはしないため、基本的には安全である。

もしプロバイダーをアップグレードした場合は、新バージョンのインストールするために、本コマンドを実行する必要がある。



> ℹ️ 参考：
>
> - https://spacelift.io/blog/terraform-init
> - https://reboooot.net/post/what-is-terraform/
> - https://www.terraform.io/cli/commands/init#usage

```bash
Initializing provider plugins...
- Reusing previous version of hashicorp/aws from the dependency lock file
- Reusing previous version of pagerduty/pagerduty from the dependency lock file
# AWSプロバイダーのバージョン
- Installing hashicorp/aws v4.3.0... 
- Installed hashicorp/aws v4.3.0 (signed by HashiCorp)
# 使用しているその他のプロバイダーのバージョン
- Installing foo/bar v2.3.0...
- Installed foo/bar v2.3.0 (signed by a HashiCorp partner, key ID *****)
```

#### ▼ -backend=false

指定したバックエンドの初期化をスキップする。

一度でもバックエンドを初期化している場合は、改めて初期化することは不要なため、このオプションを使用する。



> ℹ️ 参考：https://www.terraform.io/cli/commands/init#backend-initialization

```bash
$ terraform init -backend=false
```

```bash
# ディレクトリを指定することも可能
$ terraform -chdir=<ルートモジュールのディレクトリへの相対パス> init -backend=false
```

#### ▼ -backend=true, -backend-config

指定したバックエンドにある```.tfstate```ファイルを使用して、ローカルマシンの```.terraform```ディレクトリを初期化する。

また、```terraform plan```コマンドや```terraform apply```コマンドの向き先を別のバックエンドに切り替える。

バックエンドの代わりに、```terraform```ブロック内の```backend```オプションで指定しても良い。

ただし、```terraform setting```ブロック内では通常変数を使用できないため、こちらのオプションが推奨である。



```bash
$ terraform init \
    -backend=true \
    -reconfigure \
    # バケット名
    -backend-config="bucket=prd-foo-tfstate-bucket" \
    # ```.tfstate```ファイル名
    -backend-config="key=terraform.tfstate" \
    # credentialsファイルのプロファイル名
    -backend-config="profile=bar" \
    -backend-config="encrypt=true"
```

#### ▼ -reconfigure

初期化のための```terraform init```コマンドの時、今現在で設定しているバックエンドにある```.tfstate```ファイルをそのまま使用する。```--migrate-state```オプションとは異なり、元のバックエンドが異なる場合、元のバックエンドの```.tfstate```ファイルはそのまま保持される。

> ℹ️ 参考：
>
> - https://www.terraform.io/cli/commands/init#backend-initialization
> - https://dev.classmethod.jp/articles/tfstate-s3-local-migration-method/

```bash
$ terraform init -reconfigure -backend-config=./foo/backend.tfvars
```

また、開発時に一時的にlocalをバックエンドとして使用する場合にも役立つ。



> ℹ️ 参考：https://repl.info/archives/1435/

#### ▼ --migrate-state

初期化のための```terraform init```コマンドの時、この時、元のバックエンドにある```.tfstate```ファイルをコピーし、指定したバックエンドに移行する。

元のバックエンドの```.tfstate```ファイルを削除するか否かを選択できる。



> ℹ️ 参考：https://www.terraform.io/cli/commands/init#backend-initialization

```bash
$ terraform init --migrate-state -backend-config=./foo/backend.tfvars
```

#### ▼ -upgrade

現在のバージョンを基に、```.terraform.lock.hcl```ファイル、モジュール、プラグインのアップグレード/ダウングレードを行う。



> ℹ️ 参考：https://www.terraform.io/cli/commands/init#upgrade

```bash
$ terraform init -upgrade
```

<br>

### fmt

#### ▼ fmtとは

```.tf```ファイルのコードを整形する。



#### ▼ -check

インデントを揃えるべき箇所が存在するか否かを判定する。

もし存在する場合『```1```』、存在しない場合は『```0```』を返却する。



```bash
$ terraform fmt -check
```

#### ▼ -diff

インデントを揃えるべき箇所が存在する場合、これを取得する。



```bash
$ terraform fmt -diff
```

#### ▼ -recursive

設定ファイルのインデントを揃える。

処理を行ったファイルが表示される。



```bash
# -recursive: サブディレクトリを含む全ファイルをフォーマット
$ terraform fmt -recursive

main.tf
```

<br>

### get

```terraform```コマンドを実行しているローカルマシンの```.terraform```ディレクトリに、ローカル/リモートモジュールをインストールする。

ただし、```terraform init```コマンドに同じ機能が含まれている。



> ℹ️ 参考：https://ozashu.hatenablog.com/entry/2019/05/07/000541

```bash
$ terraform get
```

<br>

### graph

#### ▼ graphとは

rosource間の依存関係をグラフ化する。

これにより、どの```resource```ブロックが他のどの```resource```ブロックを使用しているかがわかる。

Graphvizのダウンロードが必要である。



> ℹ️ 参考：https://graphviz.org/download/

```bash
$ terraform graph | dot -Tsvg > graph.svg
```

#### ▼ 図形の見方

> ℹ️ 参考：https://kazuhira-r.hatenablog.com/entry/2020/05/02/225355

| 図形 | 種類                                                |
|------|-----------------------------------------------------|
| 楕円 | ルートモジュール                                            |
| 菱形 | ```provider```ブロック                                  |
| 四角 | ```resource```ブロック、```data```ブロック                   |
| ノート  | ```variable```ブロック、```output```ブロック、```local```ブロック |

<br>

### import

#### ▼ importとは

実インフラの状態を読み込み、```.tfstate```ファイルに反映する。



#### ▼ -var-file

```.tfvars```ファイルを指定して、```terraform import```コマンドを実行する。



```bash
$ terraform import \
    -var-file=foo.tfvars \
    <resourceタイプ>.<resourceブロック名> <ARN、ID、名前、など>

    
Import successful!

The resources that were imported are shown above. These resources are now in
your Terraform state and will henceforth be managed by Terraform.
```

<br>

### importのプラクティス

#### ▼ importの手順

（１）Terraformによる作成ではない方法ですでにクラウド上にインフラリソースが作成されている場合、これの設定値を```resource```ブロックの設定値として```.tfstate```ファイルに書き込み、Terraformの管理下におく必要がある（```.tfstate```ファイル上では、```resource```ブロックは```managed```モードという表記になる）。執筆時点（2022/07/19）で、複数のインフラリソースを網羅的に確認する方法は公式になく、インフラリソースを```1```個ずつ指定して、```.tfstate```ファイルに書き込んでいく必要がある。

> ℹ️ 参考：https://dtan4.hatenablog.com/entry/2016/08/18/010652

（２）```resource```タイプと```resource```ブロック名を指定し、```.tfstate```ファイルに実インフラの状態を書き込む。パラメーターの『```<resourceタイプ>.<resourceブロック名>```』は、```terraform plan```コマンドの結果が参考になる。また『ARN、ID、名前、など』は、```resource```タイプによって異なるため、リファレンスの『Import』の項目を確認すること。

> ℹ️ 参考：
>
> - https://github.com/hashicorp/terraform/issues/18810#issuecomment-422879471
> - https://dev.classmethod.jp/articles/terraform_import_for_each/

```bash
# 関数を使用せずに定義されている場合
$ terraform import \
    -var-file=foo.tfvars \
    <resourceタイプ>.<resourceブロック名> <ARN、ID、名前、など>
```

```bash
# moduleブロックを使用して定義されている場合
$ terraform import \
    -var-file=foo.tfvars \
    module.<moduleブロック名>.<resourceタイプ>.<resourceブロック名> <ARN、ID、名前、など>
```

```bash
# for_each関数で定義されている場合
$ terraform import \
    -var-file=foo.tfvars \
    '<resourceタイプ>.<resourceブロック名>["<キー名1>"]' <ARN、ID、名前、など>
    
# その他のキー名もimportが必要になる
$ terraform import \
    -var-file=foo.tfvars \
    '<resourceタイプ>.<resourceブロック名>["<キー名2>"]' <ARN、ID、名前、など>
```

```bash
# count関数で定義されている場合
$ terraform import \
    -var-file=foo.tfvars \
    '<resourceタイプ>.<resourceブロック名>[0]' <ARN、ID、名前、など>
    
# その他のインデックス番号もimportが必要になる
$ terraform import \
    -var-file=foo.tfvars \
    '<resourceタイプ>.<resourceブロック名>[1]' <ARN、ID、名前、など>
```

```bash
# moduleブロックを使用して、for_each関数で定義されている場合
$ terraform import \
    -var-file=foo.tfvars \
    'module.<moduleブロック名>.<resourceタイプ>.<resourceブロック名>["<キー名1>"]' <ARN、ID、名前、など>

# その他のキー名もimportが必要になる
$ terraform import \
    -var-file=foo.tfvars \
    'module.<moduleブロック名>.<resourceタイプ>.<resourceブロック名>["<キー名2>"]' <ARN、ID、名前、など>
```

そして、ローカルマシンの```.tfstate```ファイルと実インフラの差分が無くなるまで、```terraform import```コマンドを繰り返す。



```bash
$ terraform plan -var-file=foo.tfvars

No changes. Infrastructure is up-to-date.
```

何らかの理由で```terraform import```コマンドを実行し直したい場合は、```terraform state rm```コマンドで```resource```ブロックを削除し、改めて書き込む。



> ℹ️ 参考：https://qiita.com/yyoshiki41/items/57ad95846fa36b3fc4a6

#### ▼ importできない```resource```タイプ

```resource```ブロック間の紐付けに特化したような```resource```ブロックは、```terraform import```コマンドに対応していないものが多い（AWSであれば、```aws_acm_certificate_validation```、```aws_lb_target_group_attachment```、など）。

その場合、```.tfstate```ファイルと実インフラの差分を解消できない。

ただし、こういった非対応の```resource```ブロックは、クラウドプロバイダーにはインフラリソースが存在しないTerraform特有の```resource```ブロックであることが多い。

そのため、実際に```terraform apply```コマンドを実行してみても、実インフラに影響が起こらない可能性がある。



#### ▼ importを行わなかった場合のエラー

もし```terraform import```コマンドを行わないと、すでにクラウド上にインフラリソースが存在しているためにインフラリソースを作成できない、というエラーになる。



（エラー例1）

```bash
Error: InvalidParameterException: Creation of service was not idempotent.
```

（エラー例2）

```bash
Error: error creating ECR repository: RepositoryAlreadyExistsException: The repository with name 'f' already exists in the registry with id '*****'
```

<br>r
### output

```.tfstate```ファイルの```output```ブロックを表示する。



> ℹ️ 参考：
> 
> - https://www.terraform.io/cli/commands/output
> - https://qiita.com/kyntk/items/2cdd38c2438ac257ac4e

```bash
$ terraform output -json

{
  "vpc_id": {
    "sensitive": false,
    "type": "string",
    "value": "vpc-004c2d1ba7394b3d6"
  }
}
```

### plan

#### ▼ planとは

実行計画を取得する。



#### ▼ -destroy

指定したバックエンドで管理するリソースを削除する場合の実行計画を取得する。



```bash
$ terraform plan -destroy -var-file=foo.tfvars

Terraform will perform the following actions:

...

Plan: 0 to add, 0 to change, 10 to destroy.
```

#### ▼ -var-file

クラウドに対してリクエストを行い、現在のインフラリソースの状態を```.tfstate```ファイルには反映せずに、設定ファイルの記述との差分を検証する。

スクリプト実行時に、環境変数が定義されたファイルを実行すると、```variable```ブロックで宣言した変数に、値が格納される。



```bash
$ terraform plan -var-file=foo.tfvars
```

```bash
# ディレクトリを指定することも可能
# 第一引数で環境変数ファイルの相対パス、第二引数でをルートモジュールの相対パス
$ terraform -chdir=<ルートモジュールのディレクトリへの相対パス> plan \
    -var-file=<ルートモジュールのディレクトリへの相対パス>/foo.tfvars
```

差分がなければ、以下の通りになる。



```bash
No changes. Infrastructure is up-to-date.

This means that Terraform did not detect any differences between your
configuration and real physical resources that exist. As a result, no
actions need to be performed.
```

#### ▼ -target

特定の```resource```ブロックを使用して、```terraform plan```コマンドを実行する。```terraform plan```コマンドの最初のRefreshingStateフェーズを実行するブロックも絞り込めるため、特定のブロックRefreshingStateフェーズでバグがある場合の回避策にも使用できる。```-target```オプションで指定するアドレスは、```terraform plan```コマンド自身の出力結果や、```terraform state list```コマンドで確認できる。

> ℹ️ 参考：https://tech.fusic.co.jp/posts/2021-09-07-tf-target-state-list/

```bash
$ terraform plan \
    -var-file=foo.tfvars \
    -target='<resourceタイプ>.<resourceブロック名>'
```

```module```ブロックを使用している場合、指定の方法が異なる。



```bash
$ terraform plan \
    -var-file=foo.tfvars \
    -target='module.<moduleブロック名>.<resourceタイプ>.<resourceブロック名>'
```

指定方法は、全てのブロックを対象とした```terraform plan```コマンドが参考になる。

```grep```コマンドを使用してresourceタイプ名や```module```ブロック名で抽出すると、指定方法がわかる。



```bash
# resourceブロックの指定方法を調べる。
$ terraform plan | grep <resourceタイプ>

# foo.bar will be created
# foo.baz will be changed

$ terraform plan \
    -var-file=foo.tfvars \
    -target='foo.bar' \
    -target='foo.baz'
```

```bash
# moduleブロックの指定方法を調べる。
$ terraform plan | grep <moduleブロック名>

# module.qux.quux will be changed
# module.qux.corge will be changed
# module.grault will be destoryed

$ terraform plan \
    -var-file=foo.tfvars \
    -target='module.qux.quux' \
    -target='module.qux.corge' \
    -target='module.grault'
```

#### ▼ -refresh

このオプションをつければ、```terraform refresh```コマンドを同時に実行してくれる。

ただし、デフォルトで```true```なため、不要である。



```bash
$ terraform plan \
    -var-file=foo.tfvars \
    -refresh=true
```

> ℹ️ 参考：https://github.com/hashicorp/terraform/issues/17311

#### ▼ -parallelism

並列処理数を設定できる。

デフォルト値は```10```である。

クラウドプロバイダーのレートリミットが小さい場合は、並列処理数を小さくし、コマンドのAPIのコールがレートリミットを超過しないようにする。



```bash
$ terraform plan \
    -var-file=foo.tfvars \
    -parallelism=30
```

#### ▼ -out

実行プランファイルを作成する。

```terraform apply```コマンドのために使用できる。



```bash
$ terraform plan \
    -var-file=foo.tfvars \
    # 実行プランファイル名
    -out=foo.tfplan
```

<br>

### planのプラクティス

#### ▼ 出力内容の読み方

リソースの作成（```+```）、更新（```~```）、削除（```-```）、再作成（```-/+```）で表す。

```mathematica
+ create
~ update in-place
- destroy
-/+ destroy and then create replacement
```

前半部分と後半部分に区別されている。

前半部分は、Terraform管理外の方法（画面上、他ツール）による実インフラの変更について、その変更前後を検出する。

また、クラウドプロバイダーの新機能に伴う新しいAPIの追加も検出される。

検出のため、applyによって変更される実インフラを表しているわけではない。

そして後半部分は、Terraformのコードの変更によって、実インフラがどのように変更されるか、を表している。

結果の最後に表示される対象の```resource```ブロックの数を確認しても、前半部分の```resource```ブロックは含まれていないことがわかる。



```bash
Note: Objects have changed outside of Terraform

Terraform detected the following changes made outside of Terraform since the
last "terraform apply":

  # Terraform管理外の方法（画面上、他ツール）による実インフラの変更について、その変更前後を検出。

Unless you have made equivalent changes to your configuration, or ignored the
relevant attributes using ignore_changes, the following plan may include
actions to undo or respond to these changes.

─────────────────────────────────────────────────────────────────────────────

Terraform used the selected providers to generate the following execution
plan. Resource actions are indicated with the following symbols:
  ~ update in-place

Terraform will perform the following actions:
  
  # Terraformのコードの変更によって、実インフラがどのように変更されるか。
  
Plan: 0 to add, 1 to change, 0 to destroy.  
```

#### ▼ 差分認識される/されない変更

| 変更内容                                                                | される/されない |
|----------------------------------------------------------------------|----------|
| ```resource```ブロック名の変更                                               | される      |
| ```module```ブロック名の変更                                                 | される      |
| ファイルやディレクトリを指定するパスの変更                                               | されない     |
| ```resource```ブロックにハードコーディングされた値を環境変数に変更（```.tfvars```ファイルに移行） | されない     |
| ```variables```ブロック名の変更                                              | されない     |

<br>

### refresh（非推奨）

#### ▼ -var-file

クラウドに対してリクエストを行い、現在のインフラリソースの状態を```.tfstate```ファイルに反映する。非推奨であり、代わりに、```terraform apply -refresh-only```コマンドを使用する。

```bash
$ terraform refresh -var-file=foo.tfvars
```

<br>

### state

#### ▼ stateとは

```.tfstate```ファイルを操作する。



#### ▼ list

```.tfstate```ファイルで定義されている```resource```ブロック（```.tfstate```ファイル上では```managed```モード）の一覧を取得する。```terraform apply```コマンドで```-target```オプションを使用する前にアドレスを確認したい場合や、```terraform apply```コマンドの実行に失敗した時に```.tfstate```ファイルと実インフラにどのような差分があるかを確認する場合に使用する。

> ℹ️ 参考：https://tech.fusic.co.jp/posts/2021-09-07-tf-target-state-list/

```bash
$ terraform state list
```

以下の通り、```module```ブロックも含めて、```resource```ブロックが表示される。



```bash
aws_instance.www-1a
aws_instance.www-1c
aws_key_pair.key_pair
module.alb_module.aws_alb.alb
module.ami_module.data.aws_ami.amazon_linux_2
module.route53_module.aws_route53_record.r53_record
module.route53_module.aws_route53_zone.r53_zone
module.security_group_module.aws_security_group.security_group_alb
module.security_group_module.aws_security_group.security_group_ecs
module.security_group_module.aws_security_group.security_group_instance
module.vpc_module.aws_internet_gateway.internet_gateway
module.vpc_module.aws_route_table.route_table_public
module.vpc_module.aws_route_table_association.route_table_association_public_1a
module.vpc_module.aws_route_table_association.route_table_association_public_1c
module.vpc_module.aws_subnet.subnet_public_1a
module.vpc_module.aws_subnet.subnet_public_1c
module.vpc_module.aws_vpc.vpc
```

#### ▼ pull

リモートにある```.tfstate```ファイルをローカルマシンにダウンロードする。



```bash
$ terraform state pull > <tfstateファイル名>
```

#### ▼ rm

```terraform import```コマンドで```.tfstate```ファイルに反映した設定値を削除する。

```count```引数や```for_each```引数を使用している場合は、シングルクオーテーションで囲う必要がある。



> ℹ️ 参考：
>
> - https://qiita.com/yyoshiki41/items/57ad95846fa36b3fc4a6
> - https://github.com/hashicorp/terraform/issues/18810#issuecomment-422879471
> - https://dev.classmethod.jp/articles/terraform_import_for_each/

```bash
# 関数を使用せずに定義されている場合
$ terraform state rm aws_instance.bastion

Removed aws_instance.bastion
Successfully removed 1 resource instance(s).
```

```bash
# moduleブロックを使用して定義されている場合
$ terraform state rm module.ec2.aws_instance.bastion

Removed module.ec2.aws_instance.bastion
Successfully removed 1 resource instance(s).
```

```bash
# for_each関数で定義されている場合
$ terraform state rm 'aws_instance.bastion["<キー名1>"]'

Removed aws_instance.bastion["<キー名1>"]
Successfully removed 1 resource instance(s).

# その他のキー名も削除が必要になる。
$ terraform state rm 'aws_instance.bastion["<キー名2>"]'
```

```bash
# count関数で定義されている場合
$ terraform state rm 'aws_instance.bastion[0]'

Removed aws_instance.bastion[0]
Successfully removed 1 resource instance(s).

# その他のインデックス番号も削除が必要になる。
$ terraform state rm 'aws_instance.bastion[1]'
```

```bash
# moduleブロックを使用して、for_each関数で定義されている場合
$ terraform state rm 'module.ec2.aws_instance.bastion["<キー名1>"]'

Removed module.ec2.aws_instance.bastion["<キー名1>"]
Successfully removed 1 resource instance(s).

# その他のキー名も削除が必要になる。
$ terraform state rm 'module.ec2.aws_instance.bastion["<キー名2>"]'
```

#### ▼ show

```bash
$ terraform state show

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
            "name": "prd-foo-instance"
            "tags": {
              "Env": "prd",
              "ManagedBy": "terraform"
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

特定の```resource```ブロックのみを表示することもできる。



```bash
$ terraform state show aws_instance.bastion
```

<br>

### taint

#### ▼ -var-file <resourceブロック>

バックエンドにある```.tfstate```ファイルにて、指定された```resource```ブロックの```tainted```フラグを立てる。

例えば、```apply```したが、途中でエラーが発生してしまい、実インフラに中途半端に作成されてしまうことがある。

ここで、```tainted```を立てておくと、実インフラの```resource```ブロックを削除したと想定した```plan```を実行できる。



```bash
$ terraform taint \
    -var-file=foo.tfvars \
    module.<moduleブロック名>.<resourceタイプ>.<resourceブロック名>
```

この後の```terraform plan```コマンドのログからも、```-/+```で削除が行われる想定で、差分を比較していることがわかる。

```bash
$ terraform plan -var-file=foo.tfvars

An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
-/+ destroy and then create replacement

Terraform will perform the following actions:

-/+ <resourceタイプ>.<resourceブロック名> (tainted) (new resource required)
      id: '1492336661259070634' => <computed> (forces new resource)


Plan: 1 to add, 0 to change, 1 to destroy.
```

<br>

### validate

#### ▼ validateとは

設定ファイルの検証を行う。



```bash
$ terraform validate

Success! The configuration is valid.
```

```bash
# ディレクトリを指定することも可能
$ terraform -chdir=<ルートモジュールのディレクトリへの相対パス> validate
```

<br>
