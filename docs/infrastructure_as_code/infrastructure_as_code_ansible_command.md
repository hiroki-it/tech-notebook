---
title: 【IT技術の知見】コマンド＠Ansible
description: コマンド＠Ansibleの知見を記録しています。
---

# コマンド＠Ansible

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ansible-playbookコマンド

### --ask-vault-pass (ask-vault-password)

ansible-vaultプラグインによって暗号化されたパスワードファイルを復号化し、プロビジョニングを実行する。

```bash
$ ansible-playbook <playbookファイル> -i <inventoryファイル/ディレクトリ> --ask-vault-pass
```

**＊例＊**

全てのインベントリーを指定し、また暗号化済みファイルを復号化し、プロビジョニングを実行する。

```bash
$ ansible-playbook foo-playbook.yml -i ./inventories --ask-vault-pass
```

> - https://qiita.com/yteraoka/items/d18e3c353b6e15ca84a8>

<br>

### --vault-password-file

ansible-vaultプラグインによって暗号化されたパスワードファイルを直接的に指定し、プロビジョニングを実行する。

```bash
$ ansible-playbook foo-playbook.yml -i ./inventories --vault-password-file foo-file
```

> - https://tekunabe.hatenablog.jp/entry/2022/03/02/211657

<br>

### -i

#### ▼ -iとは

inventoryファイルを指定する。

これにより、プロビジョニングの実行先の管理対象ノードを指定できる。

基本的には、ディレクトリを指定した方が良い。

```bash
$ ansible-playbook <playbookファイル> -i <inventoryファイル/ディレクトリ>
```

**＊例＊**

fooインベントリのみを指定して、プロビジョニングを実行する。

```bash
$ ansible-playbook foo-playbook.yml -i ./inventories/foo-inventory
```

**＊例＊**

全てのインベントリーを指定して、プロビジョニングを実行する。

```bash
$ ansible-playbook foo-playbook.yml -i ./inventories
```

> - https://qiita.com/prsdnt_hanage/items/447813fb566c1c582849>

<br>

### -u

実行ユーザーを明示的に設定する。

設定しない場合、現在のターミナルの実行ユーザーをそのまま使う。

```bash
$ ansible-playbook -u foo-user <playbookファイル> -i <inventoryファイル/ディレクトリ>
```

<br>

## 02. ansible-vaultコマンド

### decrypt

指定した暗号化済みファイルを復号化する。

```bash
$ ansible-vault decrypt parameters.yml
```

> - https://hawksnowlog.blogspot.com/2020/11/ansible-vault.html>

<br>

### encrypt

指定した平文ファイルを暗号化し、元の平文ファイルを上書きする。暗号化済みのファイルを使用する場合、`ansible-playbook`コマンドで`--ask-vault-pass`オプションを有効化する必要がある。

```bash
$ ansible-vault encrypt parameters.yml

New Vault password:
Confirm New Vault password:
Encryption successful
```

```bash
$ cat parameters.yml

$ANSIBLE_VAULT;1.1;AES256
*****
```

> ↪️：
>
> - https://qiita.com/yteraoka/items/d18e3c353b6e15ca84a8>
> - https://hawksnowlog.blogspot.com/2020/11/ansible-vault.html>

<br>

## 03. ansible-inventoryコマンド

### --list

#### ▼ --listとは

`inventory`ファイルを指定し、`json`形式に変換する。

```bash
$ ansible-playbook -i <inventoryファイル/ディレクトリ> --list
```

**＊例＊**

```bash
$ ansible-inventory -i ./inventories/inventory --list
```

> - https://evrard.me/convert-ansible-inventories-with-ansible-inventory-cli/

#### ▼ -y

`inventory`ファイルを指定し、`yml`形式に変換する。

```bash
$ ansible-playbook -i <inventoryファイル/ディレクトリ> --list -y
```

**＊例＊**

```bash
$ ansible-inventory -i ./inventories/inventory --list -y
```

> - https://evrard.me/convert-ansible-inventories-with-ansible-inventory-cli/

<br>
