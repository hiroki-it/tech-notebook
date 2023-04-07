---
title: 【IT技術の知見】CircleCI
description: CircleCIの知見を記録しています。
---

# CircleCI

## 01. CircleCIの仕組み

### アーキテクチャ

![circleci_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/circleci_architecture.png)

> ↪️ 参考：https://circleci.com/docs/2.0/server-3-overview/

<br>

### CIパイプライン/CDパイプライン

`【１】`

: テストクラスを実装したうえで、新機能を設計実装する。

`【２】`

: リポジトリへプッシュすると、CIツールがGituHubからブランチの状態を取得する。

`【３】`

: CIツールによって、CIパイプラインが実行される。

`【４】`

: CIOpsを採用している場合に、CDパイプラインも実行される。

`【５】`

: 結果を通知することも可能。

![継続的インテグレーション](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/継続的インテグレーション.png)

<br>

## 02. セットアップ

### インストール

#### ▼ Webhook

CircleCIの鍵をGitHubに登録すると、リポジトリに対するプッシュによって、CircleCIをフック (プッシュフック) できるようになる。

鍵のうちでデプロイキーを使用することが推奨されている。

注意点として、デプロイキーを追加するには、GitHubアカウントにAdmin権限が必要である。

> ↪️ 参考：https://circleci.com/docs/2.0/gh-bb-integration/

#### ▼ デバッグの事前準備

デバッグでは行数がわからない仕様になっている。

そこで、workflowのjobのどこで失敗しているのかを特定するために、検証しないjobをコメントアウトしておく。

```yaml
workflows:
  # build以外を実行しないことにより、buildのみを検証できる。
  build-test-and-deploy:
    jobs:
      - build
#      - test1:
#          requires:
#            - build
#      - test2:
#          requires:
#            - test1
#      - deploy:
#          requires:
#            - test2
```

#### ▼ バリデーション

ホストで、以下のコマンドを実行する。

```bash
$ circleci config validate

# 以下の文章が表示されれば問題ない。
# Config file at .circleci/config.yml is valid.
```

#### ▼ 処理の展開

設定ファイルを実行した時の処理を展開し、ファイルに出力できる

```bash
$ circleci config process .circleci/config.yml > .circleci/process.yml
```

#### ▼ ローカルテスト

コマンドにより、テストに必要なコンテナイメージをプルし、コンテナを作成する。

続いて、コンテナ内でCircleCIを実行する。

バージョン2.1以降では、事前に、設定ファイルの処理を展開しておく必要がある。

```bash
# バージョン2.1の設定ファイルの処理を展開する。
$ circleci config process .circleci/config.yml > .circleci/process.yml

# 専用のコンテナを作成し、展開ファイルを元にテストを実施する。
$ circleci local execute -c .circleci/process.yml --job <job名>
```

#### ▼ CircleCIコンテナにSSH公開鍵認証

`【１】`

: CircleCI用に鍵を作成してもよいが、ここではGitHubの鍵をそのまま使用することとする。

     GitHubの秘密鍵の中身をコピーし、CircleCIのプロジェクト設定に登録する。

     この時、他の連携サービスと区別しやすいように、ホスト名を```github```とする。

```bash
$ pbcopy < ~/.ssh/github/<秘密鍵名>
```

`【３】`

: CircleCIの`Enable SSH`ステップに表示された`ssh`コマンドをコピーし、CircleCIコンテナにSSH公開鍵認証を行う。

```bash
$ <CircleCIから提示されたコマンドをコピペ> -i ~/.ssh/github/<秘密鍵名>
```

> ↪️ 参考：https://circleci.com/docs/ja/2.0/add-ssh-key/

#### ▼ Test Insights

各テストのパフォーマンスや成功失敗率を確認できる。

> ↪️ 参考：https://circleci.com/docs/2.0/insights-tests/

#### ▼ SSHキー

SSHキーを作成する必要がある。

| 鍵名         | 説明                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| デプロイキー | CircleCIコンテナがプロジェクトのGitHubリポジトリにアクセスするために必要である (例：CIOps) 。GitHubのリポジトリ設定にあるデプロイキーが、自動的に作成される。 |
| ユーザーキー | CircleCIコンテナがプロジェクト以外のGitHubリポジトリにアクセスするために必要である (例：GitOps) 。GitHubのアカウント設定にあるSSHキーが、自動的に作成される。 |

> ↪️ 参考：https://circleci.com/docs/2.0/add-ssh-key/

<br>
