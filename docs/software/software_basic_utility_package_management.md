---
title: 【IT技術の知見】管理ユーティリティ＠ユーティリティ
description: 管理ユーティリティ＠ユーティリティの知見を記録しています。
---

# 管理ユーティリティ＠ユーティリティ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 管理ユーティリティの種類

### 様々な管理ユーティリティ

様々な粒度のプログラムを対象にした管理ユーティリティがある。

![library_package_module](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/library_package_module.png)

<br>

## 02. パッケージ管理ユーティリティ

### Linux系

Linux系のOS全てで使える。

<br>

### Debian系

- apt
- apt-get
- apt-file

<br>

### RedHat系

- rpm
- yum
- dnf

<br>

## 03. 言語バージョン管理ユーティリティ

### phpenv (PHP)

#### ▼ phpenvとは

複数のバージョンのPHPを管理し、切り替えられる。

<br>

### pyenv (Python)

#### ▼ pyenvとは

複数のバージョンのPythonを管理し、切り替えられる。

#### ▼ which

```bash
# pythonのインストールディレクトリを確認
$ pyenv which python
/.pyenv/versions/3.8.0/bin/python
```

<br>

### rbenv (Ruby)

#### ▼ rbenvとは

複数のバージョンのRubyを管理し、切り替えられる。

#### ▼ global

すべてのディレクトリで使用するRubyのバージョンを設定する。

`~/.rbenv/version`ファイルにバージョンを書き込む。

```bash
$ rbenv global <バージョン>
```

> - https://qiita.com/Yinaura/items/0b021984bb21ae77816d

#### ▼ loval

実行したディレクトリ配下で使用するRubyのバージョンを設定する。

`./.ruby-version`ファイルにバージョンを書き込む。

```bash
$ rbenv local <バージョン>
```

> - https://qiita.com/Yinaura/items/0b021984bb21ae77816d

<br>
