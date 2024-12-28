---
title: 【IT技術の知見】Linux系＠管理ユーティリティ
description: Linux系＠管理ユーティリティの知見を記録しています。
---

# Linux系＠管理ユーティリティ

## 01. apk

### apkとは

Alpineリポジトリのパッケージを管理する。

> - https://pkgs.alpinelinux.org/packages

<br>

### add

Alpineリポジトリからパッケージをインストールする。

常に最新をインストールする仕様になっている。

もし、特定のバージョンをインストールしたい場合や、Alpineリポジトリ以外に置かれているパッケージは、以下のようにインストールする。

```bash
# wgetコマンドで一度ファイルを取得する
$ wget <該当のバージョンのalpineパッケージ>.apk

# 取得したファイルからパッケージをインストールする
$ apk add --allow-untrusted <パッケージ名>.apk
```

> - https://uepon.hatenadiary.com/entry/2023/03/20/165648

<br>

## 02. brew

### brewとは

Linuxで使用できるパッケージを管理する。

最新バージョンしか管理できず、以前のバージョンを管理できない。

> - https://docs.brew.sh/FAQ#how-do-i-keep-old-versions-of-a-formula-when-upgrading
> - https://christina04.hatenablog.com/entry/install-old-version-with-homebrew

<br>

### autoremove

パッケージの依存先としてインストールされたパッケージのうち、現在使用されていないものをアンイントールする。

事前に`--dry-run`オプションを有効化し、対象のパッケージを確認すると良い。

```bash
$ brew autoremove --dry-run

$ brew autoremove
```

> - https://parashuto.com/rriver/tools/homebrew-most-used-commands

<br>

### cleanup

パッケージの旧バージョンのキャッシュを削除する。

```bash
$ brew cleanup
```

> - https://qiita.com/akameco/items/9e5026e892661b75e7b3

<br>

### doctor

brewの設定に不備がないかを検証する。

```bash
$ brew doctor
Your system is ready to brew.

# パッケージとエイリアスが正しく紐づいていない場合
$ brew doctor
Warning: You have unlinked kegs in your Cellar.
Leaving kegs unlinked can lead to build-trouble and cause formulae that depend on
those kegs to fail to run properly once built. Run `brew link` on these:
  <該当のパッケージ名>
  ...
```

<br>

### install

パッケージをインストールする。

```bash
# Intel Macの場合
$ brew install <パッケージ名>

$ brew install <パッケージ名>@<バージョンタグ>
```

<br>

### link

brewによって`~/usr/local/Cellar `ディレクトリにインストールされたパッケージと、`~/usr/local/bin`ディレクトリに作成されたパッケージへのエイリアスを紐付ける。

```bash
$ brew link <パッケージ名>
```

> - https://hacknote.jp/archives/23816/

<br>

### update

brew本体をアップグレードする。

```bash
$ brew update
```

> - https://qiita.com/akameco/items/9e5026e892661b75e7b3

<br>

### upgrade

brew本体とパッケージの両方をアップグレードする。

```bash
$ brew upgrade
```

> - https://www.curict.com/item/bc/bcc0607.html

<br>

## 03. asdf

### asdfとは

Linuxで使用できるパッケージを管理する。

また、異なるバージョンを同時に管理できる。

ただ基本的には、開発時に複数のバージョンが並行して必要になるようなパッケージしか提供していない。

<br>

### `.tool-version`ファイル

`.tool-version`ファイルをリポジトリのルートディレクトリに置いておく必要がある。

異なる開発者がリポジトリ直下でパッケージをインストールした時に、特定のバージョンをインストールを強制できる。

```bash
# .tool-versionsファイル

foo-plugin <バージョンタグ>
```

もし`.tool-version`ファイルがないと、asdfでインストールしたコマンドで以下のようなエラーになってしまう。

```bash
# asdfでSOPSをインストールしたとする。
$ sops -e plain.yaml

No version is set for command sops
Consider adding one of the following versions in your config file at
sops <バージョン>
```

<br>

### セットアップ

#### ▼ brewリポジトリから

`brew`コマンドを使用してインストールする場合、`~/.zshrc`ファイルを編集する必要がある。

```bash
$ brew install asdf
```

#### ▼ GitHubリポジトリから

> - https://asdf-vm.com/guide/getting-started.html#_3-install-asdf

```bash
$ git clone --depth 1 https://github.com/asdf-vm/asdf.git ~/.asdf

$ echo '. "$HOME/.asdf/asdf.sh"' >> ~/.bashrc

# これはセットアップ環境によっては必要ないかも
$ export ASDF_DIR=~/.asdf

$ source ~/.bashrc
```

<br>

### current

現在有効になっているバージョンを確認する。

```bash
$ asdf current

golang          1.19.13         <使用中の.tool-versionsファイルのパス>
helm            3.13.0          <使用中の.tool-versionsファイルのパス>
helmfile        ______          <使用中の.tool-versionsファイルのパス>
kubectl         1.24.0          <使用中の.tool-versionsファイルのパス>
...
```

<br>

### global

ホームディレクトリ (`~/`) に`.tool-version`ファイルを作成する。

```bash
$ asdf global <プラグイン名> 1.0.0

# ファイルが作成されたことを確認する。
$ cat ~/.tool-versions

foo 1.0.0
bar 1.0.0
```

<br>

### list

インストールされているパッケージで使用できるバージョンの一覧を取得する。

```bash
$ asdf list all <プラグイン名>
```

<br>

### local

現在のディレクトリに、`.tool-version`ファイルを作成する。

事前に`asdf install`コマンドでプラグインの特定のバージョンをインストールしておく必要がある。

```bash
$ asdf local <プラグイン名> 1.0.0

# ファイルが作成されたことを確認する。
$ cat .tool-versions

foo 1.0.0
bar 1.0.0
```

<br>

### plugin

```bash
# 現在インストールされているプラグインを取得する。
$ asdf plugin list


# 登録しているプラグインを削除する。
$ asdf plugin remove <プラグイン名>
```

```bash
# プラグインのURLを調べる。
$ asdf plugin list all | grep <プラグイン名>


# プラグインをローカルマシンに登録する。
# まだインストールされていない。
$ asdf plugin add <プラグイン名> <URL>

# URLの指定がなくとも良い
$ asdf plugin add <プラグイン名>
```

<br>

### reshim

asdfでインストールしたツールを使用して、他のパッケージをインストールする場合に、これをasdfに認識させる。

asdf

```bash
$ asdf reshim
```

> - https://blog.framinal.life/entry/2021/07/30/205745

<br>

### install

```bash
# プラグインをローカルマシンに登録する。
# まだインストールされていない。
$ asdf plugin add <プラグイン名> <URL>


# 登録済みのプラグインをインストールする。
$ asdf install <プラグイン名> 1.0.0

Downloading <プラグイン名> from <URL>


# インストールされたことを確認できる。
$ asdf plugin list
```

もし、`.tool-version`ファイルを作成してある場合には、プラグイン名とバージョンが不要になる。

```bash
$ asdf install
```

エディタを使用している場合は、新しくインストールしたバイナリに切り替える。

<br>

### uninstall

#### ▼ uninstallとは

プラグインをアンインストールする。

```bash
$ asdf uninstall <プラグイン名> 1.0.0
```

### ▼ uninstallとは

特定のプラグインを全てのバージョンをアンインストールする。

```bash
$ asdf uninstall <プラグイン名> --all
```

<br>

## 04. mise

### miseとは

パッケージをバージョン管理する。

> - https://blog.sh1ma.dev/articles/20240108_from_asdf_to_mise

<br>

### 設定ファイル

決められた名前の`.toml`ファイルを用意しておく。

- `mise.toml`
- `.mise.toml`

```toml
[tools]
foo = '1.0.0'
bar = '1.0.0'
baz = '1.0.0'
```

> - https://mise.jdx.dev/configuration.html

<br>

### 環境変数

> - https://mise.jdx.dev/configuration.html#environment-variables

<br>

### セットアップ

#### ▼ brewリポジトリから

```bash
$ brew install mise
```

<br>

### activate

miseを初期化する。

初期化前にエラー以上のログのみを出力するようにしておくとよい。

```bash
$ export MISE_LOG_LEVEL=error
$ mise activate bash
```

> - https://mise.jdx.dev/cli/activate.html

<br>

### config

現在参照している`.toml`ファイルを確認する。

```bash
$ mise config

Path                    Tools
~/repository/mise.toml  foo, bar, baz
```

> - https://mise.jdx.dev/cli/config.html

<br>

### doctor

miseに設定されている全てのパラメーターを表示する。

```bash
$ mise doctor

mise doctor
version: 2024.12.20 macos-arm64 (2024-12-25)
activated: yes
shims_on_path: no

...


settings:

No problems found
```

> - https://mise.jdx.dev/cli/doctor.html

<br>

### install

#### ▼ installとは

プラグインをインストールする。

asdfを競合する場合、asdf側で事前にプラグインをアンインストールしておく。

```bash
$ asdf plugin remove <プラグイン名>

$ mise install
```

#### ▼ -f

プラグインを再インストールする。

```bash
$ mise install -f
```

> - https://mise.jdx.dev/cli/install.html

<br>

### trust

`.toml`ファイルを使用してプラグインをインストールする場合に、現在のディレクトリにある`.toml`ファイルを信頼できるものとして設定する。

```bash
$ mise trust
```

> - https://mise.jdx.dev/cli/trust.html

<br>

## 05. direnv

### direnvとは

特定のディレクトリで`.env`ファイルを読み込み、環境変数をOS上に出力する。

> - https://blog.sh1ma.dev/articles/20240108_from_asdf_to_mise

<br>

### セットアップ

#### ▼ brewリポジトリから

```bash
$ brew install direnv
```

<br>
