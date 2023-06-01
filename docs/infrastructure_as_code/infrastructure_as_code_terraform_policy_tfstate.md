---
title: 【IT技術の知見】tfstateファイルの分割＠設計ポリシー
description: tfstateファイルの分割＠設計ポリシーの知見を記録しています。
---

# `.tfstate`ファイルの分割＠設計ポリシー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. tfstateファイルの分割について

ディレクトリをゼロから設計する場合や、既存のディレクトリの設計ポリシーを察する場合に使っている見方を整理した。

本ノートで “依存” という言葉を使っているが、これはその対象 ”使用すること” を意味している。

アプリケーション開発の文脈で対象を “使用すること” を “依存” と表現するため、それに合わせている。

Terraformに限らずアプリケーションでも注意が必要ですが、例えば循環参照エラーは相互依存が原因である。

<br>

## 02 `.tfstate`ファイルを含むディレクトリ構成

### `.tfstate`ファイルの分割

#### ▼ 分割とは

Terraformの`.tfstate`ファイルの分割の境目を見つけるコツは、“他の状態にできるだけ依存しない (`terraform_remote_state`ブロックで他のtfstateファイルを参照しない) リソースの関係” に注目することである。

`terraform_remote_state`ブロック以外の方法 (例：dataリソースで他のtfstateファイル由来のリソースをタグ等から取得) で他の`.tfstate`ファイルを取得できるが、考え方は同じである。

分割した`.tfstate`ファイルの依存方向図を書きながら設計することをお勧めする。

#### ▼ メリット

`.tfstate`ファイルを分割することにより、以下のメリットがある。

- `terraform plan`コマンドや`terraform apply`コマンドをバックエンド間で独立させられ (同じバックエンド内で異なるディレクトリ配下に`.tfstate`ファイルを配置している場合も含む) 、特定のバックエンドを変更しても他のバックエンドには差分として表示されない。
- `terraform plan`コマンドや`terraform apply`コマンドの実行時間を短縮できる。
- `terraform apply`コマンドの実行途中に問題が発生し、`.tfstate`ファイルが破損したとしても、影響範囲をその`.tfstate`ファイルのリソース内に閉じられる。
- リソースタイプが同じであっても、同じ名前を付けられる。
- 複数人が同時にTerraformの実装を修正する場合、異なる`.tfstate`ファイルの間では、誰かのプロビジョニングによって他の誰かのプロビジョニングを元に戻してしまうような、作業の衝突が起こらない。

> ↪️：https://qiita.com/yukihira1992/items/a674fe717a8ead7263e4

#### ▼ 方法

前提として、`terraform`ブロックから`backend`オプションを切り分け、`backend.tfvars`ファイルを作成する。

`backend.tfvars`ファイルでは、`.tfstate`ファイルのあるバックエンドを定義するとする。

１と２は必須であるが、３は状況 (例：プロダクトのフェーズ、システムの規模) によって読み手が選ぶようにする。

例ではディレクトリで分割しているが、基点ブランチで作業が衝突する可能性があることと、作業のわかりやすさから、リポジトリを分割した方がよさそうである。

`【１】`

: 最上層をクラウドプロバイダーで切る。

     クラウドプロバイダーに関して、例ではディレクトリで分割している。

     ただし、基点ブランチで作業が衝突する可能性があることと、作業のわかりやすさから、リポジトリを分割した方がよさそう。

`【２】`

: 最下層を実行環境別で切る。

`【３】`

: 中間層を以下のいずれか / 組み合わせで切る。

     CloudFormationの分割プラクティスをTerraformにも適用する。

     - 運用チームの責務範囲
     - プロダクトのサブコンポーネント
     - リソースの状態の変更頻度
     - blast radius (影響範囲、障害範囲)

     > ↪️：
     > - https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html#organizingstacks
     > - https://zoo200.net/terraform-tutorial-module-and-directory/
     > - https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html#organizingstacks
     > - https://zenn.dev/hajimeni/articles/e17b9808e0e82e

プロジェクトによっては、特に中間層ディレクトリで複数の設計ポリシーを組み合わせている場合があり、一つだけ採用されているとは限らないことに注意する。

おそらく一番現実的なのが、後述の通り、運用チームの責務範囲とサブコンポーネントを組み合わせて分割する方法である。

#### ▼ ほかの`.tfstate`ファイルに依存する場合

`.tfstate`ファイルを分割するということは、互いリソース値に依存しない想定である (はじめにの項目に記載がある通り)。

例えば、AWSリソースのブロックがGoogleCloudリソースのブロックに依存することはない

しかし`.tfstate`ファイルを分割したとしても、一方の`.tfstate`ファイルがもう一方に依存せざるを得ない場合がある。

`.tfstate`ファイルが他から独立している想定で分割しているので、あまり望ましくないが、他の`.tfstate`ファイルに依存する場合、`terraform_remote_state`ブロックを使用する

```yaml
repository/
├── foo/
│   ├── backend.tf # バックエンド内の/foo/terraform.tfstate
│   ├── provider.tf
│   ...
│
├── bar/
│   ├── backend.tf # バックエンド内の/bar/terraform.tfstate
│   ├── remote_state.tf # terraform_remote_stateブロックを使用し、fooのtfstateファイルに依存してもよい
│   ├── provider.tf
│   ...
│
...
```

```terraform
# 分割した異なるfooというtfstateファイルから取得する
data "terraform_remote_state" "foo" {
  backend = "s3"

  config = {
    bucket = "foo-tfstate"
    key    = "foo/terraform.tfstate"
    region = "ap-northeast-1"
  }
}
```

<br>

### 最上層ディレクトリ

#### ▼ クラウドプロバイダー別 (必須)

この場合は、ディレクトリではなくリポジトリ自体を別にしてしまっても良い。

最上層ディレクトリはプロバイダー別で`.tfstate`ファイルを含むディレクトリを分割する。

`.tfstate`ファイルのコメントアウトは、バックエンド内のディレクトリ構成を示している。

プロバイダーが他プロバイダーの`.tfstate`ファイルに依存することはない想定なので、`terraform_remote_state`ブロックを使用せずに完全に分割できるはずである。

```mermaid
graph TB
    subgraph pagerduty
    A[tfstate]
    end
    subgraph healthchecks
    B[tfstate]
    end
    subgraph datadog
    C[tfstate]
    end
    subgraph aws
    D[tfstate]
    end
```

```yaml
repository/
├── aws/ # AWS
│   ├── backend.tf # バックエンド内の/aws/terraform.tfstate
│   ├── provider.tf
│   ...
│
├── datadog/ # Datadog
│   ├── backend.tf # バックエンド内の/datadog/terraform.tfstate
│   ├── provider.tf
│   ...
│
├── healthchecks/ # Healthchecks
│   ├── backend.tf # バックエンド内の/healthchecks/terraform.tfstate
│   ├── provider.tf
│   ...
│
└── pagerduty/ # PagerDuty
    ├── backend.tf
    ├── provider.tf
    ...
```

<br>

### 最下層ディレクトリ

#### ▼ 実行環境別 (必須)

この場合は、リポジトリ自体は分割しない。

実行環境別に`.tfstate`ファイルを含むディレクトリを分割する。

`.tfstate`ファイルのコメントアウトは、バックエンド内のディレクトリ構成を示している。

実行環境が他実行環境の`.tfstate`ファイルに依存することはない想定なので、`terraform_remote_state`ブロックを使用せずに完全に分割できるはずである。

```mermaid
graph TB
    subgraph pagerduty
    J[tes-tfstate]
    K[stg-tfstate]
    L[prd-tfstate]
    end
    subgraph healthchecks
    G[tes-tfstate]
    H[stg-tfstate]
    I[prd-tfstate]
    end
    subgraph datadog
    D[tes-tfstate]
    E[stg-tfstate]
    F[prd-tfstate]
    end
    subgraph aws
    A[tes-tfstate]
    B[stg-tfstate]
    C[prd-tfstate]
    end
```

```yaml
repository/
├── aws/ # AWS
│   ├── provider.tf
│   ├── tes/ # テスト環境
│   │   ├── backend.tfvars # バックエンド内のaws/terraform.tfstate
│   │   ...
│   │
│   ├── stg/ # ステージング環境
│   └── prd/ # 本番環境
│
├── datadog/ # Datadog
│   ├── provider.tf
│   ├── tes/ # テスト環境
│   ├── stg/ # ステージング環境
│   └── prd/ # 本番環境
│
├── healthchecks/ # Healthchecks
│   ├── provider.tf
│   ├── tes/ # テスト環境
│   ├── stg/ # ステージング環境
│   └── prd/ # 本番環
│
└── pagerduty/ # PagerDuty
    ├── provider.tf
    ├── tes/ # テスト環境
    ├── stg/ # ステージング環境
    └── prd/ # 本番環境
```

<br>

### 中間層ディレクトリ

#### ▼ 運用チームの責務範囲

この場合は、ディレクトリではなくリポジトリ自体を別にしてしまっても良い。

運用チームのリソースの責務範囲別でディレクトリを分割する。

この時、バックエンド（例：AWS S3、GCP GCS、など）のポリシー（例：IAM、バケットポリシー、など）で認可スコープを制御する。

`.tfstate`ファイルのコメントアウトは、バックエンド内のディレクトリ構成を示している。

チーム別のディレクトリの名前は一例であり、任意である。

互いに依存することがあり、各運用チームが`terraform_remote_state`ブロックを使用する可能性がある

（例）

2つのappチーム / sreチーム、があるとする。

appチーム間では不本意ながら相互依存があり、両方のappチームからsreチームに依存方向がある。

```mermaid
graph TB
    subgraph aws
    subgraph tes
    A[foo-app-team-tfstate]-->B
    B[bar-app-team-tfstate]-->A
    B-->C[baz-sre-team-tfstate]
    end
    subgraph stg
    D[tfstate]
    end
    subgraph prd
    e[tfstate]
    end
    end
```

```yaml
repository/
├── aws/ # AWS
│   ├── foo-team # fooチーム
│   │   ├── provider.tf
│   │   ├── tes # テスト環境
│   │   │   ├── backend.tfvars # バックエンド内の/aws/foo-team/terraform.tfstate
│   │   │   ├── remote_state.tf # terraform_remote_stateブロックを使用し、bar-teamのtfstateファイルに依存してもよい
│   │   │   ...
│   │   │
│   │   ├── stg # ステージング環境
│   │   │   ├── backend.tfvars # バックエンド内の/aws/bar-team/terraform.tfstate
│   │   │   ├── remote_state.tf # terraform_remote_stateブロックを使用し、bar-teamのtfstateファイルに依存してもよい
│   │   │   ...
│   │   │
│   │   └── prd # 本番環境
│   │       ├── backend.tfvars # バックエンド内の/aws/baz-team/terraform.tfstate
│   │       ├── remote_state.tf # terraform_remote_stateブロックを使用し、bar-teamのtfstateファイルに依存してもよい
│   │       ...
│   │
│   ├── bar-team # barチーム
│   │   ├── provider.tf
│   │   ├── tes
│   │   │   ├── backend.tfvars
│   │   │   ├── remote_state.tf # terraform_remote_stateブロックを使用し、foo-teamのtfstateファイルに依存してもよい
│   │   │   ...
│   │   │
│   │   ├── stg
│   │   │   ├── backend.tfvars
│   │   │   ├── remote_state.tf # terraform_remote_stateブロックを使用し、foo-teamのtfstateファイルに依存してもよい
│   │   │   ...
│   │   │
│   │   └── prd
│   │       ├── backend.tfvars
│   │       ├── remote_state.tf # terraform_remote_stateブロックを使用し、foo-teamのtfstateファイルに依存してもよい
│   │       ...
│   │
│   └── baz-team # bazチーム
│       ├── provider.tf
│       ├── tes
│       │   ├── backend.tfvars
│       │   ...
│       │
│       ├── stg
│       │   ├── backend.tfvars
│       │   ...
│       │
│       └── prd
│           ├── backend.tfvars
│           ...
│
├── datadog/ # Datadog
├── healthchecks/ # Healthchecks
└── pagerduty/ # PagerDuty
```

#### ▼ サブコンポーネント

一つのプロダクトを構成するサブコンポーネント（どの程度の大きさかはシステムの規模、プロダクトのフェーズ、による）別でディレクトリを分割する。

ディレクトリ名に番号をつけて、番号の小さい方から大きい方に依存関係の方向があることを明示するなどもあり。

`.tfstate`ファイルのコメントアウトは、バックエンド内のディレクトリ構成を示している。

ディレクトリの名前は一例であり、任意である。

多くのリソースを要する上位のコンポーネント (例：EKS、EC2) がそれだけで完結する下位のコンポーネント (例：VPC、Route53) に依存することがあり、前者がterraform_remote_stateブロックを使用する可能性がある。

(例)

それだけで完結するnetwork系コンポーネント (例：VPC、Route53)

他の多くのリソース値に依存するアプリケーション系 (例：AWS ECS、AWS EKS) やdatastore / storage系 (例：AWS Aurora RDS)のコンポーネントがあるとする。

applicationコンポーネントとdatastoreコンポーネントからnetworkコンポーネントに依存方向がある。

```mermaid
graph TB
    subgraph aws
    subgraph tes
    A[foo-application-tfstate]-->C
    B[bar-datastore-tfstate]-->C
    C[baz-network-tfstate]
    end
    subgraph stg
    D[tfstate]
    end
    subgraph prd
    e[tfstate]
    end
    end
```

```yaml
repository/
├── aws/ # AWS
│   ├── foo-application/
│   │   ├── provider.tf
│   │   ├── tes # テスト環境
│   │   │   ├── backend.tfvars # バックエンド内の/aws/foo-team/terraform.tfstate
│   │   │   ...
│   │   │
│   │   ├── stg # ステージング環境
│   │   │   ├── backend.tfvars # バックエンド内の/aws/bar-team/terraform.tfstate
│   │   │   ...
│   │   │
│   │   └── prd # 本番環境
│   │       ├── backend.tfvars # バックエンド内の/aws/baz-team/terraform.tfstate
│   │       ...
│   │
│   ├── bar-datastore/
│   └── baz-network
│
├── datadog/ # Datadog
├── healthchecks/
└── pagerduty/
```

コンポーネントとしては、例えば以下の分け方がある。

| 分け方    | 例                                                 |
| --------- | -------------------------------------------------- |
| 領域      | `network`、`database`、`k8s_cluster`、`monotoring` |
| 記入中... | 記入中...                                          |

> ↪️：https://sreake.com/blog/terraform-state-structure/

<br>

#### ▼ リソースの状態の変更頻度

リソースの状態をどの程度の頻度で変更するか別にディレクトリを分割する。

`.tfstate`ファイルのコメントアウトは、バックエンド内のディレクトリ構成を示している。

頻度別のディレクトリの名前は一例であり、任意である。

リソースの状態の変更頻度の大きい方 (例：EC2、セキュリティグループ、CloudWatch、s3) がそれの小さい方 (例：VPC、Route53) に依存することがあり、リソースの状態の変更頻度の大きい方がterraform_remote_stateブロックを使用する可能性がある。

（例）

変更高頻度 / 中頻度 / 低頻度なコンポーネント があるとする。

変更高頻度と中頻度なコンポーネントから、低頻度なそれに依存方向がある。

```mermaid
graph TB
    subgraph aws
    subgraph tes
    A[high-freq-tfstate]-->C
    B[middle-freq-tfstate]-->C
    C[low-freq-tfstate]
    end
    subgraph stg
    D[tfstate]
    end
    subgraph prd
    e[tfstate]
    end
    end
```

```yaml
repository/
├── aws/ # AWS
│   ├── high-freq # 高頻度リソース（サーバー系、コンテナ系、セキュリティ系、監視系、ストレージ系など）
│   │   ├── provider.tf
│   │   ├── tes # テスト環境
│   │   │   ├── backend.tfvars # バックエンド内のaws/terraform.tfstateaws/high-freq/terraform.tfstate
│   │   │   ├── remote_state.tf # terraform_remote_stateブロックを使用し、low-freqのtfstateファイルに依存してもよい
│   │   │   ...
│   │   │
│   │   ├── stg # ステージング環境
│   │   │   ├── backend.tfvars # バックエンド内のaws/low-freq/terraform.tfstate
│   │   │   ├── remote_state.tf # terraform_remote_stateブロックを使用し、low-freqのtfstateファイルに依存してもよい
│   │   │   ...
│   │   │
│   │   └── prd # 本番環境
│   │       ├── backend.tfvars # バックエンド内のaws/middle-freq/terraform.tfstate
│   │       ├── remote_state.tf # terraform_remote_stateブロックを使用し、low-freqのtfstateファイルに依存してもよい
│   │       ...
│   │
│   ├── low-freq # 低頻度リソース（ネットワーク系、など）
│   │   ├── provider.tf
│   │   ├── tes
│   │   │   ├── backend.tfvars
│   │   │   ...
│   │   │
│   │   ├── stg
│   │   │   ├── backend.tfvars
│   │   │   ...
│   │   │
│   │   └── prd
│   │       ├── backend.tfvars
│   │       ...
│   │
│   └── middle-freq # 中頻度リソース（高頻度とも低頻度とも言えないリソース）
│       ├── provider.tf
│       ├── tes
│       │   ├── backend.tfvars
│       │   ├── remote_state.tf # terraform_remote_stateブロックを使用し、low-freqのtfstateファイルに依存してもよい
│       │   ...
│       │
│       ├── stg
│       │   ├── backend.tfvars
│       │   ├── remote_state.tf # terraform_remote_stateブロックを使用し、low-freqのtfstateファイルに依存してもよい
│       │   ...
│       │
│       └── prd
│           ├── backend.tfvars
│           ├── remote_state.tf # terraform_remote_stateブロックを使用し、low-freqのtfstateファイルに依存してもよい
│           ...
│
├── datadog/ # Datadog
├── healthchecks/ # Healthchecks
└── pagerduty/ # PagerDuty
```

> ↪️：
>
> - https://towardsdatascience.com/data-quality-dataops-and-the-trust-blast-radius-4b0e9556bbda
> - https://qiita.com/yukihira1992/items/a674fe717a8ead7263e4

#### ▼ blast radius (障害範囲、影響範囲)

記入中...

#### ▼ 運用チーム × サブコンポーネント

最初の手順の項目にも記載したが、運用チームとサブコンポーネントの組み合わせが一番現実的かも。

なお、Terraformの運用チームが一つだけしかなければ、サブコンポーネントのみになる。

組み合わせる場合は、まず大きく運用チームでディレクトリを切って、その下に各運用チームでサブコンポーネントを分割していく。

運用チームとサブコンポーネントそれぞれについては前述の説明を参照。

<br>

## 03. モノリスな`.tfstate`ファイルを分割する

モノリスな`.tfstate`ファイルとは、例えば特定のAWSアカウント内のAWSリソースを全て一つの`.tfstate`ファイルで管理している場合である。

AWSリソース値を参照しない関係であれば、これらは別の`.tfstate`ファイルに分割できる。

`【１】`

: 既存のバックエンド内に新しいディレクトリを作成し、その配下に`.tfstate`ファイルを新しく作成する。

     ここでは、サブシステムを分割するとする。

```yaml
repository/
├── foo/
│   ├── backend.tf # バックエンド内の/foo/terraform.tfstate
│   ├── provider.tf
│   ...
│
├── bar/
│   ├── backend.tf # バックエンド内の/bar/terraform.tfstate
│   ├── remote_state.tfvars # terraform_remote_stateブロックを使用し、fooのtfstateファイルに依存してもよい
│   ├── provider.tf
│   ...
│
...
```

```terraform
terraform {
  backend "s3" {
    bucket = "foo-tfstate"
    key    = "foo-sub-system/terraform.tfstate"
    region = "ap-northeast-1"
  }
}
```

`【２】`

: bar側では、foo側の`.tfstate`ファイルからリソース値を取得しつつ、

```terraform
# 分割した異なるfooというtfstateファイルから取得する
data "terraform_remote_state" "foo" {
  backend = "s3"

  config = {
    bucket = "foo-tfstate"
    key    = "foo/terraform.tfstate"
    region = "ap-northeast-1"
  }
}
```

`【３】`

: 新しい`.tfstate`ファイルに、既存のサブシステムの状態をインポートする。

     事前に、バックエンドを新しいサブシステムの`.tfstate`ファイルに切り替える。

```bash
$ terraform init -reconfigure -backend-config=foo-sub-backend.tfvars
$ terraform import
```

`【４】`

: サブシステムの`.tfstate`ファイルで差分がないことを確認する。

```bash
$ terraform init -reconfigure -backend-config=foo-sub-backend.tfvars
$ terraform plan
```

`【５】`

: モノリスな`.tfstate`ファイルから、サブシステムの状態を削除する。

     事前に、バックエンドをモノリスな`.tfstate`ファイルに切り替える。

```bash
$ terraform init -reconfigure -backend-config=foo-backend.tfvars
$ terraform state rm <サブシステムの状態>
```

<br>
