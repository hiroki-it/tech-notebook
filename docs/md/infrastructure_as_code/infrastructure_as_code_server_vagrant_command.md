# vagrantコマンド

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. コマンド

### add

ボックスをインストールする．

参考：https://www.vagrantup.com/docs/cli/box#box-add

```bash
$ vagrant box add <ボックス名> <URL>
```

<br>

### box

インストール可能なボックス名の一覧を表示する．

参考：https://www.vagrantup.com/docs/cli/box#box-list

```bash
$ vagrant box list
```

<br>

### global-status

起動中の仮想環境の一覧を表示する．

参考：https://www.vagrantup.com/docs/cli/global-status

```bash
$ vagrant global-status
```

<br>

### halt

仮想環境を停止する．

参考：https://www.vagrantup.com/docs/cli/halt

```bash
$ vagrant halt
```

<br>

### reload

仮想環境を再起動する．

```bash
$ vagrant reload
```

<br>

### ssh

仮想環境にSSH接続を行う．

参考：https://www.vagrantup.com/docs/cli/ssh

```bash
$ vagrant ssh
```

<br>

### up

仮想環境を起動する．

参考：https://www.vagrantup.com/docs/cli/up

```bash
$ vagrant up
```

