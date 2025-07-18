---
title: 【IT技術の知見】コマンド@Git
description: コマンド@Gitの知見を記録しています。
---

# コマンド@Git

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## add

### --all

変更した全てのファイルをaddする。

<br>

## branch

### branch --all

作業中のローカルブランチとリモート追跡ブランチを取得する。

```bash
$ git branch --all
```

<br>

### branch -d

マージ済みのローカルブランチを削除する。

```bash
$ git branch | xargs git branch -d
```

> - https://qiita.com/mather314/items/a1536c52a2eb0426b2b5

### branch -M

現在のブランチを新しい名前に変更する。

```bash
$ git branch -M main
```

> - https://qiita.com/obonno3/items/f44bb730facc29a3b7d5

<br>

## clone

### 認証

#### ▼ HTTPSリクエスト

ベーシック認証でGitHubにログインし、クローンする。

GitHubのユーザー名とパスワードが必要になる。

```bash
$ git clone https://github.com/<組織名>/<GitHubリポジトリ名>.git
```

ユーザー名とパスワードの入力は、ターミナルに手動で入力する方法と、自動的に入力する方法がある。

後者の場合、`1`個目にURLに設定する方法がある。

```bash
$ git clone https://<ユーザー名>:<パスワード>@github.com/<組織名>/<GitHubリポジトリ名>.git
```

もう`1`個の方法として、`~/.netrc`ファイルに定義しておく。

```bash
machine github.com
login <ユーザー名>
password <パスワード>
```

> - https://qiita.com/azusanakano/items/8dc1d7e384b00239d4d9#%E3%83%A6%E3%83%BC%E3%82%B6%E5%90%8D%E3%83%91%E3%82%B9%E3%83%AF%E3%83%BC%E3%83%89%E4%B8%A1%E6%96%B9%E7%9C%81%E7%95%A5%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95
> - https://qiita.com/r-tamura/items/c6e49a3eb7f7f8aafb9d

#### ▼ SSH公開鍵認証

SSH公開鍵認証でGitHubにログインし、クローンする。

GitHubの自身の公開鍵を登録する必要がある。

サーバー接続名は、SSH公開鍵認証の設定ファイル (`~/.ssh/config`) に記載されている。

デフォルトでは、GitHubの接続名は、『`github.com`』になっている。

```bash
$ git clone git@<ssh-configファイルでのサーバー接続名>:<組織名>/<GitHubリポジトリ名>.git
```

#### ▼ アクセストークン

アクセストークンを使用して、クローンする。

```bash
$ git clone https://<ユーザー名>:<トークン>@github.com/<GitHubリポジトリ名>.git
```

> - https://blog.stu345.com/github-clone_using_token/
> - https://qiita.com/reflet/items/b7ed9979828819b2b42c

<br>

### オプション

#### ▼ 名前指定

リポジトリのクローンを別名でクローンする。

```bash
# fooという名前でクローン
$ git clone https://github.com/hiroki-hasegawa/foo-repository.git foo
```

#### ▼ --recursive

リポジトリがサブモジュールを含む場合、サブモジュールも合わせてクローンする。

```bash
$ git clone --recursive https://github.com/hiroki-hasegawa/foo-repository.git
```

> - https://blog.kyanny.me/entry/2020/07/04/172905

#### ▼ --depth

最近コミットのみをクローンする。

処理速度が求められる場合 (例：CIの実行コンテナなど) に役立つ。

```bash
$ git clone --depth 1 https://github.com/hiroki-hasegawa/foo-repository.git
```

> - https://kakakakakku.hatenablog.com/entry/2017/03/22/195640

<br>

## config

### 設定の影響範囲の種類

| 影響範囲 | 意味                           | 上書き順 | 設定ファイルの場所                 |
| :------- | :----------------------------- | -------- | :--------------------------------- |
| system   | 全PCユーザーの全リポジトリ     | 1        | `/etc/gitconfig`                   |
| global   | 現在のPCユーザーの全リポジトリ | 2        | `~/.gitconfig`                     |
| local    | 現在のリポジトリ               | 3        | `<GitHubリポジトリ名>/.git/config` |

<br>

### --`<影響範囲>` --list

指定した影響範囲で適用されている設定値を取得する。`--local`で設定されていない項目は、`--global`の設定値が適用される。

```bash
$ git config --local --list
```

Macでは、`1`個のマシンで`2`個のGutHubアカウントを使用する場合、キーチェーンという機能で設定が必要になる。

> - https://sy-base.com/myrobotics/others/git-push_403error/

<br>

### --`<影響範囲>` user.name

AuthorとCommitterの名前を設定する。

`local`が一番最後に上書きされ、適用される。

```bash
$ git config --local user.name "hiroki.hasegawa"
```

<br>

### --`<影響範囲>` user.email

AuthorとCommitterのメールアドレスを設定する。

`local`が一番最後に上書きされ、適用される。

```bash
$ git config --local user.email "example@gmail.com"
```

Authorの情報は、コミット時に反映される (Committerは表示されない) 。

```bash
$ git log

commit ee299250a4741555eb5027ad3e56ce782fe90ccb
Author: hiroki.hasegawa <example@gmail.com>
Date:   Sat Sep 12 00:00:00 2020 +0900

    add ◯◯を実装した。


```

<br>

### --global core.autocrlf

改行コードを、特定のタイミングで自動変換するように設定する。

`input`としておくのが良い。

```bash
$ git config --global core.autocrlf <値>
```

| 設定値 | チェックアウト時 | コミット時 |
| ------ | ---------------- | ---------- |
| input  | 変換しない       | CRLF ➡️ LF |
| true   | LF ➡️ CRLF       | CRLF ➡️ LF |
| false  | 変換しない       | 変換しない |

<br>

### --global core.editor

gitのデフォルトエディタを設定する。

ここでは、Vimをデフォルトとする。

```bash
$ git config --global core.editor "vim -c "set fenc=utf-8""
```

<br>

## init

### initとは

ローカルマシンのディレクトリとGitHubリポジトリを紐付ける。

エディタにGitHubリポジトリを再反映するためにも使用できる。

```bash
$ git init
```

<br>

### GitHubへの公開鍵の登録方法

GitHubとSSH公開鍵認証を実行するために、秘密鍵と公開鍵は次の方法で作成し、GitHubアカウント設定画面のSSHの項目に登録する。

> - https://gist.github.com/g-empr/fc793caf3a0a18c31d8c708787bdf5f0

`(1)`

: `ssh-keygen`コマンドで、秘密鍵と効果鍵のセットを作成する。

```bash
# 鍵を保管するディレクトリに移動
$ cd ~/.ssh/github

$ ssh-keygen -t rsa

# 秘密鍵と公開鍵の名前はGitHubのユーザー名にしておくとわかりやすい
Enter file in which to save the key: hiroki-it
# 鍵の使用時にパスワードの入力を要求するか否かは任意である。
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
```

`(2)`

: このうち、公開鍵をクリップボードにコピーする。

```bash
# Mac
$ pbcopy < ~/.ssh/github/<鍵名>.pub

# Windows
$ clip < ~/.ssh/github/<鍵名>.pub
```

`(3)`

: コピーした公開鍵を、GitHubアカウント設定画面のSSHの項目 ( https://github.com/settings/ssh ) にペーストする。`ssh`コマンドで接続を確認する。

```bash
$ ssh -T <接続名>

Hi hiroki.hasegawa! You've successfully authenticated, but GitHub does not provide shell access.
```

<br>

<br>

## ignore

### global ignore

`gitignore`ファイルとして、`~/.config/git/ignore`ファイルを作成する。

この`gitignore`ファイルで指定したファイルは、グローバルにバージョン管理から無視される。

```ignore
# IDEA
*.idea/*

# VSCode
*.code-workspace
.vscode/

# Mac
*.DS_Store
```

> - https://zenn.dev/phi/articles/gitignore-global-ds-store

<br>

## remote

### add origin

プライベートリポジトリのURLを登録し、プッシュ/プル可能にする。

**＊実行例＊**

ベーシック認証の場合、以下の通りである。

```bash
$ git init

# ベーシック認証
$ git remote add origin https://github.com/hiroki-hasegawa/example.git

# 登録されたGitHubリポジトリ
remote.origin.url=https://github.com/hiroki-hasegawa/example.git
```

**＊実行例＊**

SSH公開鍵認証の場合、以下の通りである。

```bash
$ git init

# SSH公開鍵認証
$ git remote add origin git@github.com:<組織名またはgitユーザー名>/<GitHubリポジトリ名>.git

# 登録されたGitHubリポジトリ
remote.origin.url=git@github.com:<組織名またはgitユーザー名>/<GitHubリポジトリ名>.git
```

<br>

### set-url origin

プライベートリポジトリのURLを変更し、プッシュ/プル可能にする。

`config`ファイルに記述されたユーザー名と接続名を設定する。

`1`個のマシンで複数のGitHubアカウントを使用している場合、設定が必須である。

プロジェクトをクローンした時、SSH URLはデフォルトで『`git@github.com:<組織名またはgitユーザー名>/<プロジェクト名>.git`』となっている。

使用頻度の高いアカウントで所有するリポジトリでは、SSH URLを変更することが手間なので接続名を『`github.com`』としておく。

一方で、使用頻度の低いアカウントで所有するリポジトリでは、標準のSSH URLを異なる接続名で再設定する。

**＊実行例＊**

ベーシック認証の場合、以下の通りである。

```bash
# ベーシック認証
$ git remote set-url origin https://github.com/hiroki-hasegawa/example.git

# 登録されたGitHubリポジトリ
remote.origin.url=https://github.com/hiroki-hasegawa/example.git

$ git config --local --list

# 変更されたURL
remote.origin.url=https://github.com/hiroki-hasegawa/example.git
```

**＊実行例＊**

SSH公開鍵認証の場合、以下の通りである。

```bash
# SSH公開鍵認証
# 使用頻度の高いアカウントで所有するリポジトリ
$ git remote set-url origin git@github.com:<組織名またはgitユーザー名>/<GitHubリポジトリ名>.git

# 使用頻度の低いアカウントで所有するリポジトリ
$ git remote set-url origin git@<任意の接続名>:<組織名またはgitユーザー名>/<GitHubリポジトリ名>.git

$ git config --local --list

# 変更されたURL
remote.origin.url=git@<任意の接続名>:<組織名またはgitユーザー名>/<GitHubリポジトリ名>.git
```

```bash
# 使用頻度の高いアカウント
Host github.com
    User git
    Port 22
    HostName github.com
    IdentityFile <秘密鍵へのパス>

# 使用頻度の低いアカウント
Host <任意の接続名>
    User git
    Port 22
    HostName github.com
    IdentityFile <秘密へのパス>

# その他Gitlabなど
Host gitlab.com
    User git
    Port 22
    HostName gitlab.com
    IdentityFile <秘密へのパス> # GitHabとは別の鍵を作成した方が良い。
```

リポジトリに対してコミットをプッシュし、エラーが出た場合、異なる接続名が選択されている場合は、URLの『接続名』の部分が正しく設定されているか否かを確認する。

```bash
$ git push

ERROR: Permission to hiroki-hasegawa/*****.git denied to Foo.
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

<br>

## submodule

### サブモジュールとは

リポジトリ内の特定のディレクトリで他のリポジトリをリモート参照可能にする。

フォークと似た仕組みであり、`git submodule update`コマンドを実行しないと、サブモジュールの更新を取り込めない。

また、`git clone`コマンドの実行時には`--recursive`オプションを有効化しないと、サブモジュールも合わせてクローンできない。

そのため、更新頻度の高いリポジトリをサブモジュールにすると、取り込む作業が大変になる。

> - https://qiita.com/kohashi/items/f4a50c5436b326e9475b
> - https://blog.kyanny.me/entry/2020/07/04/172905

<br>

### add

カレントディレクトリにサブモジュールを作成する。

```bash
$ git submodule add --branch main https://github.com/hiroki-hasegawa/foo-sub-module.git ./modules/foo-sub-module
```

コマンドを実行すると、`.gitmodules`ファイルが作成される。

```init
[submodule "modules/foo-sub-module"]
	path = modules/foo-sub-module
	url = https://github.com/hiroki-hasegawa/foo-sub-module.git
	branch = main
```

> - https://zenn.dev/noraworld/articles/follow-latest-version-with-git-submodules#%E3%83%AA%E3%83%A2%E3%83%BC%E3%83%88%E3%83%AA%E3%83%9D%E3%82%B8%E3%83%88%E3%83%AA%E3%81%AE-master-%E3%81%AB%E8%BF%BD%E5%BE%93

<br>

### update

参照先のリポジトリで更新があった場合、それを取り込む。

参照先の更新を自動的に取り込むことはできないため、以下のコマンドを必要なタイミングで実行する必要がある。

上記を実行すると、サブモジュールのコミット情報が更新されて差分が生じるため、それをプッシュする。

```bash
$ git submodule update --remote <.gitmodulesに定義されたサブモジュール名>
```

<br>

### --contains

現在にいるブランチを取得する。

```bash
$ git branch --contains

* main
```

### --delete --force

プッシュとマージの状態に関係なく、ローカルブランチを削除する。

```bash
$ git branch --delete --force <ローカルブランチ名>
```

<br>

### --move

作業中のローカルブランチの名前を変更する。

```bash
$ git branch --move <ローカルブランチ名>
```

<br>

### --delete --remote

```bash
$ git branch --delete --remote origin/<ローカルブランチ名>
```

リモート追跡ブランチを削除する。

`(1)`

: まず、`branch --all`で作業中のローカルブランチとリモート追跡ブランチを取得する。

```bash
$ git branch --all

* main
  remotes/origin/2019/Symfony_Nyumon/main
  remotes/origin/main
```

`(2)`

: `remotes/origin/2019/Symfony_Nyumon/main`を削除する。

```bash
$ git branch -d -r origin/2019/Symfony_Nyumon/main

Deleted remote-tracking branch origin/2019/Symfony_Nyumon/main (was 18a31b5).
```

`(3)`

: 再び、`branch --all`で削除されたことを確認。

```bash
$ git branch --all
* main
  remotes/origin/main
```

<br>

### checkout -b

指定のコミットから新しいブランチを生やせる。

```bash
$ git branch checkout -b <新しいローカルブランチ名> <コミット番号>
```

```bash
$ git checkout -b feature/3 d7e49b04
```

<br>

## cherry-pick

### cherry-pickとは

現在のブランチに対して、指定したコミットそれ単体をマージする。

```bash
$ git cherry-pick <コミットID>
```

**＊例＊**

```bash
$ git cherry-pick 1d0ddeb9e52
```

プルリクエストのマージによるマージコミットを指定すると、そのプルリクエストで変更されたファイルのみがコミットの内容として取得できる。

これにより、`develop`ブランチ上の必要な変更のみをリリースできる。

ただし、マージコミットを指定する時は`-m`オプションを有効化しないとエラーになってしまうことに注意する。

また、マージコミットには`2`個の親がおり、マージ先の基点ブランチで変更されたファイルが被るコミットと作業ブランチの最後のコミットである。

前者は1番、また後者は2番となっており、1番を選択すること。

```bash
# mainブランチ上でreleaseブランチを作成し、チェックアウトする
$ git checkout -b release

# mオプションがないとエラー
$ git cherry-pick d7e49b04
error: commit d7e49b04 is a merge but no -m option was given.
fatal: cherry-pick failed

# mオプションを有効化する
$ git cherry-pick -m 1 d7e49b04

[main a9ebcb4] Merge pull request #276 from feature/123
 Author: hiroki.hasegawa <*****@users.noreply.github.com>
 Date: Wed Sep 15 00:00:00 2021 +0900
 1 file changed, 7 insertions(+)

# 指定したコミットのみがマージされているか否かを確認する。
$ git log

# releaseブランチをmainブランチにマージする。
$ git checkout main
$ git merge release
```

<br>

## diff

結果に応じた終了コードをを出力する。

空文字を`true`として判定する。

`too many arguments`のエラーにならないように、ダブルクオーテーションをつける。

```bash
DIFF=$(git diff origin/main --name-only --relative ./...)

# 空文字かどうかを検証する
if [ -z "$DIFF" ] ; then
  echo "差分なし";
  exit 0
fi

echo "差分あり";
```

空文字でないことを`true`として判定することもできる。

ダブルクオーテーションをつける。

```bash
DIFF=$(git diff origin/main --name-only --relative ./...)

# 空文字でないかどうかを検証する
if [ -n "$DIFF" ] ; then
  echo "差分あり";
  exit 1
fi

echo "差分なし";
```

> - https://stackoverflow.com/a/74817537
> - https://zenn.dev/aki_artisan/articles/bash-test-option-zn
> - https://qiita.com/XYZXYZXYZ/items/9bc17ec8466fa6bf875a

```bash
EXIT_CODE=$(git diff origin/main --quiet)

# 終了コードを検証する
case $EXIT_CODE in
  0) echo "差分なし" ;;
  1) echo "差分あり" ;;
  128) echo "パラーメーターが誤っている" ;;
  *) echo "予期せぬエラー" ;;
esac
```

> - https://stackoverflow.com/a/74817582

<br>

## stash

### stashとは

ファイルが、『インデックス』 (=`add`) あるいは『HEAD』 (=コミット) に存在している状態で、異なるローカルブランチを`checkout`しようとすると、以下のエラーが出る。

```bash
$ git checkout 2019/Symfony2_Ny

umon/main
error: Your local changes to the following files would be overwritten by checkout:
        app/config/config.yml
        src/AppBundle/Entity/Inquiry.php
Please commit your changes or stash them before you switch branches.
Aborting
```

この場合、一度`stash`を行い、『インデックス』 (=`add`) あるいは『HEAD』 (=コミット) を横に配置しておく必要がある。

### --include-untracked

トラッキングされていないファイルも含めて、全てのファイルを退避させる。

`git status`をしたところ、修正ファイルが`3`個、トラックされていないファイルが`1`個ある。

```bash
$ git status

On branch 2019/foo-repository/feature/6
Your branch is up to date with "origin/2019/foo-repository/feature/6".

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   app/Resources/views/Inquiry/index.html.twig
        modified:   app/config/config.yml
        modified:   src/AppBundle/Entity/Inquiry.php

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        app/Resources/views/Toppage/menu.html.twig

no changes added to commit (use "git add" and/or "git commit -a")
```

これを、`stash -u`する

```bash
$ git stash -u

Saved working directory and index state WIP on 2019/foo-repository/feature/6: 649995e update #6 *****
```

これらのファイルの変更点を一時的に退避できる。

### -- <パス>

特定のディレクトリやファイルのみ`stash`できる。

```bash
git stash -- ./
```

### list

退避している『ファイル番号ブランチ親コミットとコミットメッセージ』の一覧を取得する。

```bash
$ git stash list

stash@{0}: WIP on 2019/foo-repository/feature/6: 649995e update #6 *****
```

### pop

退避している指定のファイルを復元する。

```bash
$ git stash pop stash@{<番号>}
```

```bash
$ git stash pop stash@{0}

On branch 2019/foo-repository/feature/8
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   app/Resources/views/Inquiry/index.html.twig
        modified:   app/config/config.yml
        modified:   src/AppBundle/Entity/Inquiry.php

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        app/Resources/views/Toppage/menu.html.twig

no changes added to commit (use "git add" and/or "git commit -a")
```

### drop

退避している指定のファイルを復元せずに削除する。

```bash
$ git stash drop stash@{<番号>}
```

```bash
$ git stash drop stash@{0}

Dropped refs/stash@{0} (1d0ddeb9e52a737dcdbff7296272080e9ff71815)
```

### clear

退避している全てのファイルを復元せずに削除する。

```bash
$ git stash clear
```

<br>

## status

### statusとは

addステージやcommitステージにファイルが存在しているか否かを取得する。

### --porcelain

`git status`コマンドを他のコマンドに入力できる形式で出力する。

CIの自動化で使用することが多い。

> - https://www.stefanjudis.com/today-i-learned/the-short-version-of-git-status-and-the-close-but-different-porcelain-mode/

```bash
 $ git status --porcelain

 M foo
 M bar
 M baz
```

```bash
#!/bin/bash

git add .

if [ -z "$(git status --porcelain)" ]; then
  echo "変更点がないため、終了しました。"
  exit 0;
fi

git commit -m "CIツールが自動的にプッシュしました。"

git pull

git push origin HEAD
```

<br>

## revert

### revertとは

作業中のローカルブランチで、指定の履歴を削除する。

![revert](https://qiita-image-store.s3.amazonaws.com/0/292201/995d8f16-0a3e-117f-945f-c20a511edeaf.png)

<br>

### `<コミットID>` --no-edit

指定したコミットのみを打ち消す新しいコミットを作成する。

コミットメッセージは、打ち消すコミットと同じものになる。

リリース後に元に戻したい時に役立つ。

```bash
$ git revert <コミットID> --no-edit
```

<br>

### `<コミットID>` --edit

指定したコミットのみを打ち消す新しいコミットを作成する。

vimが起動するため、コミットメッセージを新しいものに変更する。

```bash
$ git revert <コミットID> --edit
```

<br>

### -m <マージナンバー> <マージコミットID>

指定したマージコミットのみを打ち消す新しいコミットを作成する。

コミットメッセージは、打ち消すコミットと同じものになる。

マージナンバーを事前に確認しておく必要がある。

```bash
$ git show

commit xyz
Merge: 1a1a1a 2b2b2b    #ここに注目
Author: xxxx xxxx
Date:   Thu Jul 13 09:00:00 2017 +0000

    Merge commit

$ git revert -m 1 xyz
```

<br>

## reset

### resetとは

作業中のローカルブランチで、指定の履歴まで戻し、それ以降を削除する。

![reset](https://qiita-image-store.s3.amazonaws.com/0/292201/e96468c4-57cc-bf2b-941a-d179ac829627.png)

<br>

### HEAD <ファイル名/パス>

インデックスから、指定したファイルを削除する。

```bash
$ git reset HEAD <ファイル名/パス>
```

<br>

### --soft <コミットID>

作業中のブランチで、最新のHEAD (=コミット後) を指定の履歴まで戻し、それ以降を削除する。

コミットのみを取り消したい場合はこれ。

```bash
$ git reset --soft <コミットID>
```

<br>

### --mixed <コミットID>

作業中のローカルブランチで、インデックス (=`add`後) 、HEAD (=コミット後) を指定の履歴まで戻し、それ以降を削除する。

`add`とコミットを取り消したい場合はこれ。

```bash
$ git reset --mixed <コミットID>
```

<br>

### --hard <コミットID> (ブランチ)

作業中のローカルブランチで、最新のワークツリー (=ディレクトリ) 、インデックス (=`add`後) 、HEAD (=コミット後) を指定の履歴まで戻し、それ以降を削除する。

<font color="red">**ワークツリー (=ディレクトリ) 内のファイルの状態も戻ってしまうため、取り扱い注意！！**</font>

```bash
$ git reset --hard <コミットID>
```

```bash
$ git reset --hard <ブランチ名>
```

> - https://blog.junpeko.com/git-reset

<br>

### resetの使用例

`(1)`

: まず、`log `コマンドで、作業中のローカルブランチにおけるコミットIDを確認。

```bash
$ git log

commit f17f68e287b7d84318b4c49e133b2d1819f6c3db (HEAD -> main, 2019/foo-repository/main)
Merge: 41cc21b f81c813
Author: hiroki.hasegawa <example@gmail.com>
Date:   Wed Mar 20 22:56:32 2019 +0900

    Merge remote-tracking branch "refs/remotes/origin/main"

commit 41cc21bb53a8597270b5deae3259751df18bce81
Author: hiroki.hasegawa <example@gmail.com>
Date:   Wed Mar 20 20:54:34 2019 +0900

    add #0 fooさんのREADME_2を追加

commit f81c813a1ead9a968c109671e6d83934debcab2e
Author: hiroki.hasegawa <example@gmail.com>
Date:   Wed Mar 20 20:54:34 2019 +0900

    add #0 fooさんのREADME_1を追加
```

`(2)`

: 指定のコミットまで履歴を戻す。

```bash
$ git reset --soft f81c813a1ead9a968c109671e6d83934debcab2e
```

`(3)`

: `log `コマンドで、正しく変更されているか確認。

```bash
$ git log

commit f81c813a1ead9a968c109671e6d83934debcab2e (HEAD -> main)
Author: Hiroki Hasegawa <example@gmail.com>
Date:   Wed Mar 20 20:54:34 2019 +0900

    add 新しいREADMEを追加
```

`(4)`

: `push --force`でローカルリポジトリの変更をリモートリポジトリに強制的に反映する。
<font color="red">**『強制的にプッシュした』というログも、リモート側には残らない。**</font>

```bash
$ git push --force

Total 0 (delta 0), reused 0 (delta 0)
To github.com:hiroki-hasegawa/foo-repository.git
 + f0d8b1a...f81c813 main -> main (forced update)
```

<br>

### 強制的にpullする

```bash
$ git reset --hard origin/<ブランチ名>
```

<br>

## rebase

### rebaseとは (注意点あり)

作業中のローカルブランチで、ブランチの派生元を変更する。

例えば、作業ブランチで基点ブランチのコミットを取り込みたい場合に使用する。

リモートブランチにプッシュした後は使用してはならず、他のコマンドを使用する。

処理結果が`git merge`コマンドと似ているが、`git rebase`コマンドはマージコミットを作らず、ない。

> - https://zenn.dev/tana0102/articles/475d8952933af6#git-rebase%E3%81%AE%E5%9F%BA%E6%9C%AC
> - https://zenn.dev/tana0102/articles/475d8952933af6#git-merge%E3%81%A8%E3%81%AE%E9%81%95%E3%81%84

<br>

### --interactive <コミットID>

派生元を変更する機能を応用して、過去のコミットのメッセージ変更、削除、統合などを実行する。

**＊例 (コミットメッセージの変更) ＊**

`(1)`

: まず、`log `コマンドで、作業中のローカルブランチにおけるコミットIDを確認。

```bash
$ git log

commit f17f68e287b7d84318b4c49e133b2d1819f6c3db (HEAD -> main, 2019/foo-repository/main)
Merge: 41cc21b f81c813
Author: Hiroki Hasegawa <example@gmail.com>
Date:   Wed Mar 20 22:56:32 2019 +0900

    Merge remote-tracking branch "refs/remotes/origin/main"

commit 41cc21bb53a8597270b5deae3259751df18bce81
Author: Hiroki Hasegawa <example@gmail.com>
Date:   Wed Mar 20 20:54:34 2019 +0900

    add #0 fooさんのREADME_2を追加

commit f81c813a1ead9a968c109671e6d83934debcab2e
Author: Hiroki Hasegawa <example@gmail.com>
Date:   Wed Mar 20 20:54:34 2019 +0900

    add #0 fooさんのREADME_1を追加
```

`(2)`

: 指定した履歴の削除

```bash
$ git rebase --interactive 41cc21bb53a8597270b5deae3259751df18bce81
```

とすると、タブが表示され、指定のコミットIDの履歴が表示される

```bash
pick b1b5c0f add #0 *****
```

『挿入モード』に変更し、この１行の`pick`を`edit`に変更。

その後、

```bash
:w
```

として保管。

その後、エディタ上で『Ctrl+C』を押し、

```bash
:qa!
```

で終了。

`(3)`

: `git commit --amend`に`-m`オプションを付けて、メッセージを変更する。

```bash
$ git commit --amend -m="<変更後のメッセージ>"
```

`(4)`

: `git rebase --continue`コマンドを実行することにより、変更を反映させる。

```bash
$ git rebase --continue

Successfully rebased and updated refs/heads/develop.
```

`(5)`

: プッシュしようとすると、`![rejected] develop -> develop (non-fast-forward)`とエラーが出るため、

```bash
$ git merge <ブランチ名> --allow-unrelated-histories
```

で解決し、プッシュする。

**＊例 (Author名とCommiter名の変更) ＊**

`(1)`

: ハッシュ値を指定して、`git rebase`コマンドを実行する。

```bash
$ git rebase --interactive 41cc21bb53a8597270b5deae3259751df18bce81
```

`(2)`

: `git commit --amend`コマンドに`--reset-author`オプションを付けて、configで設定した名前をAuthor名とComitter名に適用する。

```bash
$ git commit --amend --reset-author
```

`(3)`

: `git rebase --continue`コマンドを実行し、変更を反映させる。

```bash
$ git rebase --continue
Successfully rebased and updated refs/heads/develop.
```

過去の全てのコミットに対して、Author名とCommitter名を適用するコマンドもある。

しかし、危険な方法であるため、個人利用のリポジトリのみで使用するようにする必要がある。

```bash
#!/bin/bash

git filter-branch -f --env-filter "
    # Author名かCommitter名のいずれかが誤っていれば適用します。
    if [ ${GIT_AUTHOR_NAME}="hiroki.hasegawa" -o ${GIT_COMMITTER_NAME}="hiroki.hasegawa" ] ; then
    export GIT_AUTHOR_NAME="hiroki.hasegawa"
    export GIT_AUTHOR_EMAIL="example@gmail.com"
    export GIT_COMMITTER_NAME="hiroki.hasegawa"
    export GIT_COMMITTER_EMAIL="example@gmail.com"
fi"
```

<br>

### --onto <派生元にしたいローカルブランチ名> <誤って派生元にしたローカルブランチ名> <派生元を変更したいローカルブランチ名>

作業中のローカルブランチの派生元を変更する。

```bash
$ git rebase --onto <派生元にしたいローカルブランチ名> <誤って派生元にしたローカルブランチ名> <派生元を変更したいローカルブランチ名>
```

<br>

### --interactive --root

一番古い、最初の履歴を削除する。

`(1)`

: 変更タブの表示

```bash
$ git rebase --interactive --root
```

とすると、最初の履歴が記述されたタブが表示される

```bash
pick b1b5c0f add #0 *****
```

`(2)`

: `pick b1b5c0f add #0 *****`の行を削除して保管し、タブを閉じ、エディタ上で『Ctrl+C』を押す。

```bash
:qa!
```

ここで未知のエラー

```bash
CONFLICT (modify/delete): README.md deleted in HEAD and modified in 37bee65... update #0 README.mdに本レポジトリのタイトルと引用を記載した
した. Version 37bee65... update #0 README.mdに本レポジトリのタイトルと引用を記載した of README.md left in tree.
error: could not apply 37bee65... update #0 README.mdに本レポジトリのタイトルと引用を記載した

Resolve all conflicts manually, mark them as resolved with
"git add/rm <conflicted_files>", then run "git rebase --continue".
You can instead skip this commit: run "git rebase --skip".
To abort and get back to the state before "git rebase", run "git rebase --abort".

Could not apply 37bee65... update #0 README.mdに本レポジトリのタイトルと引用を記載した
```

<br>

### --abort

やりかけの`rebase`を取り消し。

作業中のローカルブランチにおける`(main|REBASE-i)`が、` (main)`に変更されていることからも確認可能。

```bash
hiroki.hasegawa@PC /var/www/foo (main)
$ git rebase --interactive

hiroki.hasegawa@PC /var/www/foo (main|REBASE-i)
$ git rebase --abort

hiroki.hasegawa@PC /var/www/foo (main)
$
```

<br>

## pull

### コマンド組み合わせ

全てのリモートブランチをpullする。

```bash
$ git branch -r \
    | grep -v "\->" \
    | grep -v main \
    | while read remote; do git branch --track "${remote#origin/}" "$remote"; done

$ git fetch --all

$ git pull --all
```

<br>

## push

### -u origin <作成したブランチ名>

ローカルで作成したブランチを、リモートにプッシュする。

コミットは無くても良い。

```bash
$ git push -u origin <作成したブランチ名>
```

<br>

### origin <コミットID>:main

トラウマコマンド。

```bash
$ git push origin <コミットID>:main
```

<br>

### --delete origin <バージョンタグ>

リモートブランチのタグを削除する。

```bash
$ git push --delete origin <バージョンタグ>
```

**＊例＊**

```bash
$ git push --delete origin v1.0.0
```

注意点として、ローカルマシンのタグは別に削除する必要がある。

```bash
$ git tag -d v1.0.0
```

<br>

### --tags

ローカルマシンのコミットに付与したタグをリモートにプッシュする。

```bash
$ git push --tags
```

<br>

## show-branch

作業ブランチの派生元になっているブランチを確認。

```bash
$ git show-branch \
    | grep "*" \
    | grep -v "$(git rev-parse --abbrev-ref HEAD)" \
    | head -1 \
    | awk -F"[]~^[]" "{print $2}"
```

<br>

## filter-branch

### -f --env-filter

指定した名前とメールアドレスを上書きする。

```bash
$ git filter-branch --force --env-filter '
    # GIT_AUTHOR_NAMEの書き換え
    if [ "$GIT_AUTHOR_NAME"="<変更前のコミッター名>" ];
    then
      GIT_AUTHOR_NAME="<変更後のコミッター名>";
    fi

    # GIT_AUTHOR_EMAILの書き換え
    if [ "$GIT_AUTHOR_EMAIL"="<変更前のコミッターメールアドレス>" ];
    then
      GIT_AUTHOR_EMAIL="<変更後のコミッターメールアドレス>";
    fi

    # GIT_COMMITTER_NAMEの書き換え
    if [ "$GIT_COMMITTER_NAME"="<変更前のコミッター名>" ];
    then
      GIT_COMMITTER_NAME="<変更後のコミッター名>";
    fi

    # GIT_COMMITTER_EMAILの書き換え
    if [ "$GIT_COMMITTER_EMAIL"="<変更前のコミッターメールアドレス>" ];
    then
      GIT_COMMITTER_EMAIL="<変更後のコミッターメールアドレス>";
    fi
    ' -- --all
```

> - https://zenn.dev/flyingbarbarian/articles/241627cae5988a

<br>

### -f --tree-filter

全てのコミットに対して、指定した処理を実行する。

**＊例＊**

全てのコミットに対して、特定のファイルを削除する処理を実行する。

加えて、ローカルリポジトリに対してガーベジコレクションを実行すると、ローカルリポジトリから完全に削除できる。

```bash
$ git filter-branch -f --tree-filter \
    'rm -f <パス>' \
    HEAD

# ガベージコレクションを実行する
$ git gc --aggressive --prune=now
```

<br>
