## WHY

以下の理由のため、アプリエンジニアが AWS backup のデータをクローンしたいことがある。

- テスト環境の Redis、RDS、ElasticSearch、の作成し、ストレステストを実施したい。
- 過去データを復元し、特定の状況で検証したい

しかし現在、以下の欠点があり、開発がスムーズに進まないことがある。

- インフラチームが依頼を受けて AWS コンソールから RDS を作り、エンジニアに引き渡さなければならない。
- すべてのエンジニアが AWS コンソールに IAM ユーザーを持っているわけではない。
- IAM ユーザーを作成するには、IT 統制として、CTO による許可 (必要性や認可スコープの精査) が必要。
- IAM ユーザーを作成したとして、すべてのエンジニアが AWS コンソールに慣れているわけではない。

そこで、クローンしたいと思ったエンジニアが、以上の障壁なくクローンを作成/削除し、開発をスムーズに進められる仕組みを考える。

## WHAT

### Goals

現在の欠点は、AWS リソースに対する『**アクセス**』+『**作成**』+『**削除**』の一連の操作の自動化によって解決できると考えた。

これにより、インフラチーム以外であっても、希望する操作を簡単に行えるようになる。

<br>

### Choice

以下の方針を考えた。

- `(1)`

: ：aws-cli、IAM ポリシー、シェルスクリプトによる自動化

- `(2)`

: ：aws-cli、AWS STS、シェルスクリプトによる自動化

- `(3)`

: ：シェルスクリプト以外の案が思い浮かばず

# 補足

## AWS Backupを操作するaws-cliコマンドについて

> - https://docs.aws.amazon.com/cli/latest/reference/backup/index.html
> - https://dev.classmethod.jp/articles/aws_backup_bycli/

## AWS Backupの保管期間

最大 35 日前まで保管でき、また復元できる。

> - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html#USER_WorkingWithAutomatedBackups.BackupRetention

## AWS STS について

IAM ユーザーに対して、一時的にロールを Assume (委譲) するサービスのこと。

これにより、AWS リソースへリクエストできるようになる。

対象の IAM ユーザーには、何も認可スコープを与えないようにしておくと、委譲によってのみ、認可スコープが与えられるようになるため安全。

> - https://blog.serverworks.co.jp/tech/2016/05/18/sts/

## セキュリティに関する留意

- リモートワークに当たり、社内リソースへのアクセスは、GitHub のアカウントのトークンで判定されている。そのため、送信元 IP アドレスは固定されていない。リソースにリクエストしたい場合は、GitHub にログインしておく必要がある。
- 本番環境と開発環境が同じ AWS アカウント内に存在している。
- 例外的に、開発環境の DB はパブリックアクセスとなっており、GitHub を経由せずに、リクエストできる。

# 候補 `(1)`

## IAMポリシー、 aws-cli、シェルスクリプトによる自動化

### Action List

IAM ポリシーを使用して、アクセスを制限する。

aws-cli を活用して、aws-cli 用 IAM ユーザーが特定の AWS リソースへリクエストできるようにする。

シェルスクリプトで自動化する。

#### アクセス

本番/開発環境の AWS Backup からクローン/削除できる最小認可スコープを持った IAM ユーザーを作成する。

このユーザーは、プログラムによるアクセスのみを許可する。

#### 作成/削除

aws-cli コマンドのシェルスクリプトを作成する。クローンと削除のスクリプトは別に作成する。

このとき、日付を引数として、指定した過去日のバックアップをクローン可能にする。

#### 追調査が必要なところ

- IAM ポリシーで、GitHub のアカウントをトークンを判定可能にする設定が必要であるが、現時点で不明。

### Pros

- シェルスクリプトとして実装すれば、誰でも AWS リソースを操作できる。
- `1` 個の IAM ユーザーを作成すればよく、CTO の一度の承諾で済む。
- リクエスト制限の仕組みが単純であり、AWS に関わりが少ないエンジニアにとって理解しやすい。

### Cons

- 資格情報が固定のため、IAM ユーザーの資格情報が漏洩すると、危険が多い。
- 非関係者に IAM ユーザーの資格情報やシェルスクリプトが漏れた場合、AWS リソースにリクエストされる可能性がある。
- 今後、同様の要望があった場合、新しい aws-cli 用 IAM ユーザーを作成するのか、あるいは `1` 個の IAM ユーザーに集約するのか判断する必要がある。前者の場合、CTO の承諾が必要になってしまう。

#### Consの解決方法

- 専用のリポジトリを作成し、CircleCI コンテナ内で実行可能にする。資格情報を環境変数として登録できるため、シェルスクリプトが漏洩しても、社内リソースにはアクセスできない。このとき、日付などの引数は環境変数としてその都度登録する。
- AWS STS を使用して、動的にロールを切り替えるようにする。IAM ユーザーは 1 つで済む。

# 候補 `(2)`

: ※ 安全で実現性がある

## AWS STS、aws-cli、シェルスクリプトによる自動化

### Action List

AWS STS を使用して、aws-cli 用 IAM ユーザーに一時的に IAM ロールを委譲するようにし、アクセスを制限する。

aws-cli を活用して、aws-cli 用 IAM ユーザーが特定の AWS リソースへリクエストできるようにする。

シェルスクリプトで自動化する。

#### アクセス

AWS STS の設定を AWS コンソール上で済ませておく。

#### 作成/削除

IAM ユーザーに IAM ロールを委譲する処理を書いたシェルスクリプトを作成する。

クローンと削除のスクリプトは別に作成する。

このとき、日付を引数として、指定した過去日のバックアップをクローン可能にする。

### Pros

- シェルスクリプトとして実装すれば、誰でも AWS リソースを操作できる。
- `1` 個の IAM ユーザーを作成すればよく、CTO の一度の承諾で済む。
- 資格情報が一時的なため、IAM ユーザーの資格情報が漏洩しても、危険が少ない。
- 今後、同様の要望があった場合、移譲するための IAM ロールを新しく作成すればよく、CTO の手間が少ない。

### Cons

- 非関係者にシェルスクリプトが漏れた場合、AWS リソースにリクエストされる可能性がある。
- 仕組みが難しく、AWS に関わりの少ないエンジニアが理解しにくい。

#### Consの解決方法

- 専用のリポジトリを作成し、CircleCI コンテナ内で実行可能にする。資格情報を環境変数として登録できるため、シェルスクリプトが漏洩しても社内リソースにはアクセスできない。このとき、日付などの引数は環境変数としてその都度登録する。
- もし興味を持つ人がいれば勉強会を開く

## AWS STSを使用するためのスクリプト例

```bash
#!/bin/bash

set -xeuo pipefail

# 事前に環境変数に実行環境名を代入する。
case "${ENV}" in
    "tes")
        aws_account_id="<テスト環境アカウントID>"
        aws_access_key_id="<テスト環境アクセスキーID>"
        aws_secret_access_key="<テスト環境シークレットアクセスキー>"
        aws_iam_role_external_id="<信頼ポリシーに設定した外部ID>"
    ;;
    "prd")
        aws_account_id="<本番環境アカウントID>"
        aws_access_key_id="<本番環境アクセスキーID>"
        aws_secret_access_key="<本番環境シークレットアクセスキー>"
        aws_iam_role_external_id="<信頼ポリシーに設定した外部ID>"
    ;;
    *)
        echo "The parameter "${ENV}" is invalid."
        exit 1
    ;;
esac

# 信頼されたエンティティの資格情報を設定する。
aws configure set aws_access_key_id "$aws_account_id"
aws configure set aws_secret_access_key "$aws_secret_access_key"
aws configure set aws_default_region "ap-northeast-1"

# https://sts.amazonaws.com に、ロールの紐付けをリクエストする。
# セッションの失効秒数を少なくすればより安全
aws_sts_credentials="$(aws sts assume-role \
  --role-arn "arn:aws:iam::${aws_access_key_id}:role/"${ENV}"-<紐付けしたいIAMロール名>" \
  --role-session-name "<任意のセッション名>" \
  --external-id "$aws_iam_role_external_id" \
  --duration-seconds "<セッションデータの失効秒数>" \
  --query "Credentials" \
  --output "json")"
```

<br>
