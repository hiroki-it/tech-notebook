# Gitコマンド

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. セットアップ系コマンド

### clone

#### ・```clone <HTTPS接続>```

一番、クローンの速度が速く、コマンドの引数も簡単。

```bash
$ git clone https://github.com/<組織名>/<リポジトリ名>.git
```

#### ・```clone <SSH接続>```

サーバー接続名は、SSH接続の設定ファイル（```~/.ssh/config```）に記載されている。デフォルトでは、Githubの接続名は、『```github.com```』になっている。

```bash
$ git clone git@<ssh-configファイルでのサーバー接続名>:<組織名>/<リポジトリ名>.git
```

<br>

### config

#### ・ 設定の影響範囲の種類

| 影響範囲 | 意味                           | 上書き順 | 設定ファイルの場所               |
| :------- | :----------------------------- | -------- | :------------------------------- |
| system   | 全PCユーザーの全リポジトリ       | 1        | ```/etc/gitconfig```             |
| global   | 現在のPCユーザーの全リポジトリ | 2        | ```~/.gitconfig```               |
| local    | 現在のリポジトリ               | 3        | ```<リポジトリ名>/.git/config``` |

#### ・```config --<影響範囲> --list```

指定した影響範囲で適用されている設定値を表示する。```--local```で設定されていない項目は、```--global```の設定値が適用される。

```bash
$ git config --local --list
```

Macでは、1つのPCで二つのGutHubアカウントを用いる場合、キーチェーンという機能で設定が必要になる。

参考：https://sy-base.com/myrobotics/others/git-push_403error/

#### ・```config --<影響範囲> user.name```

AuthorとCommitterの名前を設定する。```local```が一番最後に上書きされ、適用される。

```bash
$ git config --local user.name "hiroki-it"
```


#### ・```config --<影響範囲> user.email```

AuthorとCommitterのメールアドレスを設定する。```local```が一番最後に上書きされ、適用される。

```bash
$ git config --local user.email "example@gmail.com"
```

Authorの情報は、コミット時に反映される。（Committerは表示されない）

```bash
$ git log

commit ee299250a4741555eb5027ad3e56ce782fe90ccb
Author: hiroki-it <example@gmail.com>
Date:   Sat Sep 12 00:00:00 2020 +0900

    add ◯◯を実装した。
```

#### ・```config --global core.autocrlf```

改行コードを、特定のタイミングで自動変換するように設定する。```input```としておくのが良い。

```bash
$ git config --global core.autocrlf <値>
```

| 設定値 | チェックアウト時 | コミット時 |
| :----: | :--------------: | :--------: |
| input  |    変換しない    | CRLF -> LF |
|  true  |    LF -> CRLF    | CRLF -> LF |
| false  |    変換しない    | 変換しない |

#### ・```config --global core.editor```

gitのデフォルトエディタを設定する。ここでは、Vimをデフォルトとする。

```bash
$ git config --global core.editor "vim -c "set fenc=utf-8""
```

<br>

### remote

#### ・```remote set-url origin <SSH URL>```

プライベートリポジトリに接続する。```config```ファイルに記述されたユーザー名と接続名を設定する。1つのPCで複数のGitHubアカウントを用いている場合、設定が必須である。プロジェクトをクローンした時、SSH URLはデフォルトで『```git@github.com:<組織名またはgitユーザー名>/<プロジェクト名>.git```』となっている。使用頻度の高いアカウントで所有するリポジトリでは、SSH URLを変更することが手間なので接続名を『```github.com```』としておく。一方で、使用頻度の低いアカウントで所有するリポジトリでは、標準のSSH URLを異なる接続名で設定し直す。

```bash
# 使用頻度の高いアカウントで所有するリポジトリ
$ git remote set-url origin git@github.com:<組織名またはgitユーザー名>/<リポジトリ名>.git

# 使用頻度の低いアカウントで所有するリポジトリ
$ git remote set-url origin git@<任意の接続名>:<組織名またはgitユーザー名>/<リポジトリ名>.git
```

```bash
# 使用頻度の高いアカウント
Host github.com
    User git
    Port 22
    HostName github.com
    IdentityFile <秘密鍵へのパス>

# 使用頻度の高いアカウント
Host <任意の接続名>
    User git
    Port 22
    HostName github.com
    IdentityFile <秘密へのパス>
```

リポジトリに対してプッシュを実行してエラーが出た場合、異なる接続名が選ばれている場合は、URLの『接続名』の部分が正しく設定されているかを確認する。

```bash
$ git push                                                                   
ERROR: Permission to hiroki-it/*****.git denied to Foo.
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

<br>

### GitHubへの公開鍵の登録方法

GitHubとSSH接続を行うために、秘密鍵と公開鍵は次の方法で作成し、GitHubアカウント設定画面のSSHの項目に登録する。

参考：https://gist.github.com/g-empr/fc793caf3a0a18c31d8c708787bdf5f0

（１）```ssh-keygen```コマンドで、秘密鍵と効果鍵のセットを作成する。

```bash
# 鍵を保管するディレクトリに移動
$ cd ~/.ssh/github

# 秘密鍵と公開鍵の名前はGitHubのユーザー名にしておくとわかりやすい
$ ssh-keygen -t rsa
```

（２）このうち、公開鍵をクリップボードにコピーする。

```bash
# Mac
$ pbcopy < ~/.ssh/github/<鍵名>.pub

# Windows
$ clip < ~/.ssh/github/<鍵名>.pub
```

（３）コピーした公開鍵を、GitHubアカウント設定画面のSSHの項目（ https://github.com/settings/ssh ）にペーストする。```ssh```コマンドで接続を確認する。

```bash
$ ssh -T <接続名>

Hi hiroki-it! You've successfully authenticated, but GitHub does not provide shell access.
```

<br>

## 02. 開発系コマンド

### add

#### ・```add --all```

変更した全てのファイルをaddする。

<br>

### branch

#### ・```branch --all```
作業中のローカルブランチとリモート追跡ブランチを表示。

#### ・```branch --delete --force ローカルブランチ名}```
プッシュとマージの状態に関係なく、ローカルブランチを削除。

#### ・```branch --move <新しいローカルブランチ名>```
作業中のローカルブランチの名前を変更。

#### ・```branch --delete --remote origin/<ローカルブランチ名>```
リモート追跡ブランチを削除。
（１）まず、```branch --all```で作業中のローカルブランチとリモート追跡ブランチを表示。

```bash
$ git branch --all
* master
  remotes/origin/2019/Symfony_Nyumon/master
  remotes/origin/master
```

（２）```remotes/origin/2019/Symfony_Nyumon/master```を削除。

```bash
$ git branch -d -r origin/2019/Symfony_Nyumon/master
Deleted remote-tracking branch origin/2019/Symfony_Nyumon/master (was 18a31b5).
```

（３）再び、```branch --all```で削除されたことを確認。

```bash
$ git branch --all
* master
  remotes/origin/master
```

#### ・```branch checkout -b <新しいローカルブランチ名> <コミット番号>```

```bash
$ git checkout -b feature/3 d7e49b04
```

指定のコミットから新しいブランチを生やすことができる。

<br>

### cherry-pick

#### ・```cherry-pick <コミットID>```

現在のブランチに対して、指定したコミットそれ単体をマージする。

```bash
$ git cherry-pick 1d0ddeb9e52
```

PullReqのマージによるマージコミットを指定すると、そのPullReqで変更されたファイルのみがコミットの内容として取得できる。これにより、developブランチ上の必要な変更のみをリリースすることも可能である。ただし、マージコミットを指定する時は```-m```オプションを有効化しないとエラーになることに注意する。また、マージコミットには2つの親がおり、マージ先の基点ブランチで変更されたファイルが被るコミットと作業ブランチの最後のコミットである。前者は1番、また後者は2番となっており、1番を選ぶこと。

```bash
# cherrypickブランチにチェックアウト
$ git checkout cherrypick

# mオプションがないとエラー
$ git cherry-pick d7e49b04
error: commit d7e49b04 is a merge but no -m option was given.
fatal: cherry-pick failed

# mオプションを有効化する
$ git cherry-pick -m 1 d7e49b04

[master a9ebcb4] Merge pull request #276 from feature/123
 Author: hiroki-it <*****@users.noreply.github.com>
 Date: Wed Sep 15 00:00:00 2021 +0900
 1 file changed, 7 insertions(+)
```

<br>

### stash

#### ・```stash```とは

ファイルが、『インデックス』（=```add```）あるいは『HEAD』（=コミット）に存在している状態で、異なるローカルブランチを```checkout```しようとすると、以下のエラーが出る。

```bash
$ git checkout 2019/Symfony2_Ny
umon/master
error: Your local changes to the following files would be overwritten by checkout:
        app/config/config.yml
        src/AppBundle/Entity/Inquiry.php
Please commit your changes or stash them before you switch branches.
Aborting
```

この場合、一度```stash```を行い、『インデックス』（=```add```）あるいは『HEAD』（=コミット）を横に置いておく必要がある。

#### ・```stash -u --include-untracked```
トラッキングされていないファイルも含めて、全てのファイルを退避。
```git status```をしたところ、修正ファイルが3つ、トラックされていないファイルが1つある。

```bash
$ git status
On branch 2019/Symfony2_Nyumon/feature/6
Your branch is up to date with "origin/2019/Symfony2_Nyumon/feature/6".

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

これを、```stash -u```する

```bash
$ git stash -u
Saved working directory and index state WIP on 2019/Symfony2_Nyumon/feature/6: 649995e update #6 *****
```

これらのファイルの変更点を一時的に退避できる。

#### ・```stash -- <パス> ```

特定のディレクトリやファイルのみ```stash```できる。

```bash
git stash -- src/...
```

#### ・```stash list```
退避している『ファイル番号ブランチ親コミットとコミットメッセージ』の一覧を表示する。

```bash
$ git stash list
stash@{0}: WIP on 2019/Symfony2_Nyumon/feature/6: 649995e update #6 *****
```

#### ・```stash pop stash@{<番号>}```
退避している指定のファイルを復元。

```bash
$ git stash pop stash@{0}
On branch 2019/Symfony2_Nyumon/feature/8
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

#### ・```stash drop stash@{<番号>}```
退避している指定のファイルを復元せずに削除。

```bash
$ git stash drop stash@{0}
Dropped refs/stash@{0} (1d0ddeb9e52a737dcdbff7296272080e9ff71815)
```

#### ・```stash clear```
退避している全てのファイルを復元せずに削除。

```bash
$ git stash clear
```

<br>

### revert

#### ・```revert```とは

作業中のローカルブランチで、指定の履歴を削除。

![revert.png](https://qiita-image-store.s3.amazonaws.com/0/292201/995d8f16-0a3e-117f-945f-c20a511edeaf.png)

#### ・```revert <コミットID> --no-edit```

指定したコミットのみを打ち消す新しいコミットを作成する。コミットメッセージは、打ち消すコミットと同じものになる。リリース後に元に戻したい時に役立つ。

```bash
$ git revert <コミットID> --no-edit
```

#### ・```revert <コミットID> --edit```

指定したコミットのみを打ち消す新しいコミットを作成する。vimが起動するので、コミットメッセージを新しいものに変更する。

```bash
$ git revert <コミットID> --edit
```

#### ・```revert -m <マージナンバー> <マージコミットID>```

指定したマージコミットのみを打ち消す新しいコミットを作成する。コミットメッセージは、打ち消すコミットと同じものになる。マージナンバーを事前に確認しておく必要がある。

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

### reset

#### ・```reset```とは

作業中のローカルブランチで、指定の履歴まで戻し、それ以降を削除。

![reset.png](https://qiita-image-store.s3.amazonaws.com/0/292201/e96468c4-57cc-bf2b-941a-d179ac829627.png)

#### ・```reset HEAD <ファイル名/ファイルパス>```
インデックスから、指定したファイルを削除。

```bash
$ git reset HEAD <ファイル名/ファイルパス>
```

#### ・```reset --soft <コミットID>```
作業中のローカルブランチで、最新のHEAD（=コミット後）を指定の履歴まで戻し、それ以降を削除する。コミットのみを取り消したい場合はこれ。

```bash
$ git reset --soft <コミットID>
```

#### ・```reset --mixed <コミットID>```
作業中のローカルブランチで、インデックス（=```add```後）、HEAD（=コミット後）を指定の履歴まで戻し、それ以降を削除。```add```とコミットを取り消したい場合はこれ。

```bash
$ git reset --mixed <コミットID>
```

#### ・```reset --hard <コミットID>```
作業中のローカルブランチで、最新のワークツリー（=フォルダ）、インデックス（=```add```後）、HEAD（=コミット後）を指定の履歴まで戻し、それ以降を削除。
<font color="red">**ワークツリー（=フォルダ）内のファイルの状態も戻ってしまうので、取り扱い注意！！**</font>

```bash
$ git reset --hard <コミットID>
```

#### ・```reset```の使用例

1. まず、```log ```コマンドで、作業中のローカルブランチにおけるコミットIDを確認。

```bash
$ git log
commit f17f68e287b7d84318b4c49e133b2d1819f6c3db (HEAD -> master, 2019/Symfony2_Nyumon/master)
Merge: 41cc21b f81c813
Author: hiroki-it <example@gmail.com>
Date:   Wed Mar 20 22:56:32 2019 +0900

    Merge remote-tracking branch "refs/remotes/origin/master"

commit 41cc21bb53a8597270b5deae3259751df18bce81
Author: hiroki-it <example@gmail.com>
Date:   Wed Mar 20 20:54:34 2019 +0900

    add #0 fooさんのREADME_2を追加

commit f81c813a1ead9a968c109671e6d83934debcab2e
Author: hiroki-it <example@gmail.com>
Date:   Wed Mar 20 20:54:34 2019 +0900

    add #0 fooさんのREADME_1を追加
```

2. 指定のコミットまで履歴を戻す。

```bash
$ git reset --soft f81c813a1ead9a968c109671e6d83934debcab2e
```

3. ```log ```コマンドで、正しく変更されているか確認。

```bash
$ git log
commit f81c813a1ead9a968c109671e6d83934debcab2e (HEAD -> master)
Author: Hiroki Hasegawa <example@gmail.com>
Date:   Wed Mar 20 20:54:34 2019 +0900

    add 新しいREADMEを追加
```

4. ```push --force```でローカルリポジトリの変更をリモートリポジトリに強制的に反映。
   <font color="red">**『強制的にプッシュした』というログも、リモート側には残らない。**</font>

```bash
$ git push --force
Total 0 (delta 0), reused 0 (delta 0)
To github.com:hiroki-it/Symfony2_Nyumon.git
 + f0d8b1a...f81c813 master -> master (forced update)
```

### rebase

#### ・```rebase```とは（注意点あり）

作業中のローカルブランチで、ブランチの派生元を変更。リモートブランチにプッシュした後は使ってはならず、他のコマンドを使う。

#### ・```rebase --interactive <コミットID>```

派生元を変更する機能を応用して、過去のコミットのメッセージ変更、削除、統合などを行う。

**＊例（コミットメッセージの変更）＊**

1. まず、```log ```コマンドで、作業中のローカルブランチにおけるコミットIDを確認。

```bash
$ git log
commit f17f68e287b7d84318b4c49e133b2d1819f6c3db (HEAD -> master, 2019/Symfony2_Nyumon/master)
Merge: 41cc21b f81c813
Author: Hiroki Hasegawa <example@gmail.com>
Date:   Wed Mar 20 22:56:32 2019 +0900

    Merge remote-tracking branch "refs/remotes/origin/master"

commit 41cc21bb53a8597270b5deae3259751df18bce81
Author: Hiroki Hasegawa <example@gmail.com>
Date:   Wed Mar 20 20:54:34 2019 +0900

    add #0 fooさんのREADME_2を追加

commit f81c813a1ead9a968c109671e6d83934debcab2e
Author: Hiroki Hasegawa <example@gmail.com>
Date:   Wed Mar 20 20:54:34 2019 +0900

    add #0 fooさんのREADME_1を追加
```

2. 指定した履歴の削除

```bash
$ git rebase --interactive 41cc21bb53a8597270b5deae3259751df18bce81
```
とすると、タブが表示され、指定のコミットIDの履歴が表示される

```bash
pick b1b5c0f add #0 *****
```

『挿入モード』に変更し、この一行の```pick```を```edit```に変更。その後、

```bash
:w
```

として保存。その後、エディタ上で『Ctrl+C』を押し、

```bash
:qa!
```

で終了。

3. ```commit --amend```に```m```オプションを付けて、メッセージを変更。

```bash
$ git commit --amend -m="<変更後のメッセージ>"
```

4. ```rebase --continue```を実行し、変更を反映させる。

```bash
$ git rebase --continue
Successfully rebased and updated refs/heads/develop.
```

5. プッシュしようとすると、```![rejected] develop -> develop (non-fast-forward)```とエラーが出るので、

```bash
$ git merge <ブランチ名> --allow-unrelated-histories
```
で解決し、プッシュする。

**＊例（Author名とCommiter名の変更）＊**

1. ハッシュ値を指定して、```rebase```コマンドを実行する。

```bash
$ git rebase --interactive 41cc21bb53a8597270b5deae3259751df18bce81
```

2. ```commit --amend```に```reset-author```オプションを付けて、configで設定した名前をAuthor名とComitter名に適用する。

```bash
$ git commit --amend --reset-author
```

3. ```rebase --continue```を実行し、変更を反映させる。

```bash
$ git rebase --continue
Successfully rebased and updated refs/heads/develop.
```

過去の全てのコミットに対して、Author名とCommitter名を適用するコマンドもある。しかし、危険な方法であるため、個人利用のリポジトリのみで用いるようにするべきである。

```bash
#!/bin/bash

git filter-branch -f --env-filter "
    # Author名かCommitter名のいずれかが誤っていれば適用します。
    if [ ${GIT_AUTHOR_NAME}="Hiroki-Hasegawa" -o ${GIT_COMMITTER_NAME}="Hiroki-Hasegawa" ] ; then
    export GIT_AUTHOR_NAME="hiroki-it"
    export GIT_AUTHOR_EMAIL="example@gmail.com"
    export GIT_COMMITTER_NAME="hiroki-it"
    export GIT_COMMITTER_EMAIL="example@gmail.com"
fi"
```

#### ・```rebase --onto <派生元にしたいローカルブランチ名> <誤って派生元にしたローカルブランチ名> <派生元を変更したいローカルブランチ名>```

作業中のローカルブランチの派生元を変更。

```bash
$ git rebase --onto <派生元にしたいローカルブランチ名> <誤って派生元にしたローカルブランチ名> <派生元を変更したいローカルブランチ名>
```

#### ・```rebase --interactive --root```
一番古い、最初の履歴を削除。

（１）変更タブの表示

```bash
$ git rebase --interactive --root
```
とすると、最初の履歴が記述されたタブが表示される

```bash
pick b1b5c0f add #0 *****
```

（２）```pick b1b5c0f add #0 *****```の行を削除して保存し、タブを閉じ、エディタ上で『Ctrl+C』を押す。

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

#### ・```rebase --abort```

やりかけの```rebase```を取り消し。
作業中のローカルブランチにおける```(master|REBASE-i)```が、``` (master)```に変更されていることからも確認可能。

```bash
hiroki-it@PC /var/www/foo (master)
$ git rebase --interactive

hiroki-it@PC /var/www/foo (master|REBASE-i)
$ git rebase --abort

hiroki-it@PC /var/www/foo (master)
$
```

<br>

### pull

#### ・コマンド組み合わせ

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

### push 

#### ・```push -u origin <作成したブランチ名>```

ローカルで作成したブランチを、リモートにプッシュする。コミットは無くても良い。

#### ・```push origin <コミットID>:master```

トラウマコマンド

#### ・```push --delete origin <タグ名>```

リモートブランチのタグを削除する。

```bash
$ git push --delete origin v1.0.0
```

なお、ローカルのタグは別に削除する必要がある。

```bash
$ git tag -d v1.0.0
```

#### ・```push --tags```

ローカルのコミットに付与したタグをリモートにプッシュする。

<br>

### show-branch

作業ブランチの派生元になっているブランチを確認。

```bash
$ git show-branch \
  | grep "*" \
  | grep -v "$(git rev-parse --abbrev-ref HEAD)" \
  | head -1 \
  | awk -F"[]~^[]" "{print $2}"
```

<br>

### filter-branch

#### ・```filter-branch -f --env-filter```

全てのコミットの名前とメールアドレスを上書きする。

```bash
$ git filter-branch -f --env-filter \
    "GIT_AUTHOR_NAME="hiroki-it"; \
     GIT_AUTHOR_EMAIL="example@gmail.com"; \
     GIT_COMMITTER_NAME="hiroki-it"; \
     GIT_COMMITTER_EMAIL="example@gmail.com";" \
    HEAD
```

#### ・```filter-branch -f --tree-filter```

全てのコミットに対して、指定した処理を実行する。

**＊例＊**

全てのコミットに対して、特定のファイルを削除する処理を実行する。加えて、ローカルリポジトリに対してガーベジコレクションを実行すると、ローカルリポジトリから完全に削除できる。

```bash
$ git filter-branch -f --tree-filter \
    'rm -f <ファイルパス>' \
    HEAD

# ガベージコレクションを実行
$ git gc --aggressive --prune=now
```
