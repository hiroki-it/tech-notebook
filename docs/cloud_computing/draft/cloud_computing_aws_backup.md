## WHY

以下の理由のため、アプリエンジニアが AWS backup のデータをクローンしたいことがある。

- 検証用環境のRedis、RDS、ElasticSearch、の構築し、ストレステストを行いたい
- 過去データを復元し、特定の状況で検証したい

しかし現在、以下の欠点があり、開発がスムーズに進まないことがある。

- インフラチームが依頼を受けて AWSコンソールから RDS を作り、エンジニアに引き渡さなければならない。
- 全てのエンジニアがAWSコンソールに IAMユーザーを持っているわけではない。
- IAMユーザーを作成するには、IT統制として、CTOによる許可（必要性や権限範囲の精査）が必要。
- IAMユーザーを作成したとして、全てのエンジニアがAWSコンソールに慣れているわけではない。

そこで、クローンしたいと思ったエンジニアが、以上の障壁なくクローンを構築/削除し、開発をスムーズに進められる仕組みを考える。

## WHAT

### Goals

現在の欠点は、AWSリソースに対する『**アクセス**』＋『**構築**』＋『**削除**』の一連の操作の自動化によって解決できると考えた。

これにより、インフラチーム以外であっても、希望する操作を簡単に行えるようになる。

<br>

### Choice

以下の方針を考えた。

- （１）：aws-cli、IAMポリシー、シェルスクリプトによる自動化
- （２）：aws-cli、Amazon STS、シェルスクリプトによる自動化
- （３）：シェルスクリプト以外の案が思い浮かばず

# 補足

## AWS Backupを操作するaws-cliコマンドについて

参考：

- https://docs.aws.amazon.com/cli/latest/reference/backup/index.html
- https://dev.classmethod.jp/articles/aws_backup_bycli/

## AWS Backupの保持期間

最大35日前まで保持でき、また復元できる。

参考：
- https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention

## Amazon STS について

IAMユーザーに対して、一時的にロールをAssume（委譲）し、AWSリソースにアクセスできるようにするサービスのこと。

対象のIAMユーザーには、何も権限を与えないようにしておくと、委譲によってのみ、アクセス権限が与えられるようになるため安全。

参考：

- https://blog.serverworks.co.jp/tech/2016/05/18/sts/

## セキュリティに関する留意

- リモートワークに当たり、社内リソースへのアクセスは、GitHubのアカウントのトークンで判定されている。そのため、送信元IPアドレスは固定されていない。リソースにアクセスしたい場合は、GitHubにログインしておく必要がある。
- 本番環境と開発環境が同じAWSアカウント内に存在している。
- 例外的に、開発環境のDBはパブリックアクセスとなっており、GitHubを経由せずに、アクセスできる。

# 候補（１）

## IAMポリシー、 aws-cli、シェルスクリプトによる自動化

### ■ Action List

IAMポリシーを使用して、アクセスを制限する。
aws-cliを活用して、aws-cli用IAMユーザーが特定のリソースにアクセスできるようにする。
シェルスクリプトで自動化する。

#### アクセス

本番/開発環境のAWS Backupからクローン/削除できる最小権限を持った IAMユーザーを作成する。このユーザーは、プログラムによるアクセスのみを許可する。 

#### 構築/削除

aws-cliコマンドのシェルスクリプトを作成する。クローンと削除のスクリプトは別に作成する。この時、日付を引数として、指定した過去日のバックアップをクローンできるようにする。

#### 追調査が必要なところ

- IAMポリシーで、GitHubのアカウントをトークンを判定できるようにする設定が必要であるが、現時点で不明。

### ■ Pros

- シェルスクリプトとして実装すれば、誰でもAWSリソースを操作できる。
- 1つのIAMユーザーを作成すればよく、CTOの一度の承諾で済む。
- アクセス制限の仕組みが単純のため、AWSに関わりが少ないエンジニアが理解しやすい。

### ■ Cons

- クレデンシャル情報が固定のため、IAMユーザーのクレデンシャル情報が漏洩すると、危険が多い。
- 非関係者にIAMユーザーのクレデンシャルやシェルスクリプトが漏れた場合、AWSリソースにアクセスされる可能性がある。
- 今後、同様の要望があった場合、新しいaws-cli用IAMユーザーを作成するのか、あるいは1つのIAMユーザーに集約するのか判断する必要がある。前者の場合、CTOの承諾が必要になってしまう。

#### Consの解決方法

- 専用のリポジトリを作成し、CirlcleCIコンテナ内で実行できるようにする。クレデンシャル情報を環境変数として登録できるため、シェルスクリプトが漏洩しても、社内リソースにはアクセスできない。この時、日付などの引数は環境変数としてその都度登録する。
- AmazonSTSを使用して、動的にロールを切り替えるようにする。IAMユーザーは1つで済む。

# 候補（２）※ 安全で実現性がある

## Amazon STS、aws-cli、シェルスクリプトによる自動化

### ■ Action List

Amazon STS を使用して、aws-cli用IAMユーザーに一時的にIAMロールを委譲するようにし、アクセスを制限する。
aws-cliを活用して、aws-cli用IAMユーザーが特定のリソースにアクセスできるようにする。
シェルスクリプトで自動化する。

#### アクセス

Amazon STS の設定をAWSコンソール上で済ませておく。

#### 構築/削除

IAMユーザーにIAMロールを委譲する処理を書いたシェルスクリプトを作成する。クローンと削除のスクリプトは別に作成する。この時、日付を引数として、指定した過去日のバックアップをクローンできるようにする。

### ■ Pros

- シェルスクリプトとして実装すれば、誰でもAWSリソースを操作できる。
- 1つのIAMユーザーを作成すればよく、CTOの一度の承諾で済む。
- クレデンシャル情報が一時的なため、IAMユーザーのクレデンシャル情報が漏洩しても、危険が少ない。
- 今後、同様の要望があった場合、移譲するためのIAMロールを新しく作成すればよく、CTOの手間が少ない。

### ■ Cons

- 非関係者にシェルスクリプトが漏れた場合、AWSリソースにアクセスされる可能性がある。
- 仕組みが難しく、AWSに関わりの少ないエンジニアが理解しにくい。

#### Consの解決方法

- 専用のリポジトリを作成し、CirlcleCIコンテナ内で実行できるようにする。クレデンシャル情報を環境変数として登録できるため、シェルスクリプトが漏洩しても、社内リソースにはアクセスできない。この時、日付などの引数は環境変数としてその都度登録する。
- もし興味がある人がいれば勉強会

## AmazonSTSを使用するためのスクリプト例

```bash
#!/bin/bash

set -xeuo pipefail
set -u

# 事前に環境変数にインフラ環境名を代入する。
case $ENV in
    "dev")
        aws_account_id="<作業環境アカウントID>"
        aws_access_key_id="<作業環境アクセスキーID>"
        aws_secret_access_key="<作業環境シークレットアクセスキー>"
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

# 信頼されたエンティティのアカウント情報を設定する。
aws configure set aws_access_key_id "$aws_account_id"
aws configure set aws_secret_access_key "$aws_secret_access_key"
aws configure set aws_default_region "ap-northeast-1"

# https://sts.amazonaws.com に、ロールのアタッチをリクエストする。
aws_sts_credentials="$(aws sts assume-role \
  --role-arn "arn:aws:iam::${aws_access_key_id}:role/${ENV}-<アタッチしたいIAMロール名>" \
  --role-session-name "<任意のセッション名>" \
  --external-id "$aws_iam_role_external_id" \
  --duration-seconds "<セッションの有効秒数>" \ # セッションの有効秒数を少なくすればより安全
  --query "Credentials" \
  --output "json")"
```
