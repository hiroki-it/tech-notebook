---
title: 【IT技術の知見】コマンド＠Ansible
description: コマンド＠Ansibleの知見を記録しています。
---

# コマンド＠Ansible

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ansible-playbookコマンド

### --ask-vault-pass

ansible-vaultプラグインによって暗号化されたファイルを使用して、プロビジョニングを実行する。

> ℹ️ 参考：https://qiita.com/yteraoka/items/d18e3c353b6e15ca84a8

```bash
$ ansible-playbook <playbookファイル> -i <inventoryファイル/ディレクトリ> --ask-vault-pass
```

**＊実行例＊**

全てのインベントリーを指定し、また暗号化済みファイルを復号化し、プロビジョニングを実行する。

```bash
$ ansible-playbook foo-playbook.yaml -i ./inventories --ask-vault-pass
```

<br>

### -i

inventoryファイルを指定する。これにより、プロビジョニングの実行先の管理対象ノードを指定できる。基本的には、ディレクトリを指定した方が良い。

> ℹ️ 参考：https://qiita.com/prsdnt_hanage/items/447813fb566c1c582849

```bash
$ ansible-playbook <playbookファイル> -i <inventoryファイル/ディレクトリ>
```

**＊実行例＊**

fooインベントリのみを指定して、プロビジョニングを実行する。

```bash
$ ansible-playbook foo-playbook.yaml -i ./inventories/foo-inventory
```
**＊実行例＊**

全てのインベントリーを指定して、プロビジョニングを実行する。

```bash
$ ansible-playbook foo-playbook.yaml -i ./inventories
```

<br>

## 02. ansible-vaultコマンド

### decrypt

指定した暗号化済みファイルを復号化する。

> ℹ️ 参考：https://hawksnowlog.blogspot.com/2020/11/ansible-vault.html

```bash
$ ansible-vault decrypt parameters.yaml
```

<br>

### encrypt

指定した平文ファイルを暗号化し、元々の平文ファイルを上書きする。暗号化済みのファイルを使用する場合、```ansible-playbook```コマンドで```--ask-vault-pass```オプションを有効化する必要がある。

> ℹ️ 参考：
>
> - https://qiita.com/yteraoka/items/d18e3c353b6e15ca84a8
> - https://hawksnowlog.blogspot.com/2020/11/ansible-vault.html

```bash
$ ansible-vault encrypt parameters.yaml

New Vault password:
Confirm New Vault password:
Encryption successful
```
```bash
$ cat parameters.yaml

$ANSIBLE_VAULT;1.1;AES256
*****
```
