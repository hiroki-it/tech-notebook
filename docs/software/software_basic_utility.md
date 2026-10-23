---
title: 【IT技術の知見】ユーティリティ (サービスプログラム) ＠基本ソフトウェア
description: ユーティリティ (サービスプログラム) ＠基本ソフトウェアの知見を記録しています。
---

# ユーティリティ (サービスプログラム) ＠基本ソフトウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. ユーティリティの種類

### Unix 系の標準ユーティリティ

> - [【IT技術の知見】Unix系標準ユーティリティ＠ユーティリティ - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/software/software_basic_utility_unix.html)

<br>

### Windows 系の標準ユーティリティ

Windows は、GUI でユーティリティを使用する。

よく使用するものを記載する。

<table>
  <thead>
    <tr>
      <th>システム系</th>
      <th>ストレージデバイス管理系</th>
      <th>ファイル管理系</th>
      <th>その他</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>マネージャ</td>
      <td>デフラグメントツール</td>
      <td>ファイル圧縮プログラム</td>
      <td>スクリーンセーバー</td>
    </tr>
    <tr>
      <td>クリップボード</td>
      <td>アンインストーラー</td>
      <td>-</td>
      <td>ファイアウォール</td>
    </tr>
    <tr>
      <td>レジストリクリーナ</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
    </tr>
    <tr>
      <td>アンチウイルス</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
    </tr>
  </tbody>
</table>

<br>

## 02. ユーティリティのバイナリファイルの場所

### ディレクトリとバイナリファイルの種類

<table>
  <thead>
    <tr>
      <th>バイナリファイルのディレクトリ</th>
      <th>配置されているバイナリファイルの種類</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>/bin</code></td>
      <td>Unix ユーティリティのバイナリファイルの多く。</td>
    </tr>
    <tr>
      <td><code>/usr/bin</code></td>
      <td>管理ユーティリティによってインストールされるバイナリファイルの多く。</td>
    </tr>
    <tr>
      <td><code>/usr/local/bin</code></td>
      <td>Unix 外のソフトウェアによってインストールされたバイナリファイル。最初は空になっている。</td>
    </tr>
    <tr>
      <td><code>/sbin</code></td>
      <td>Unix ユーティリティのバイナリファイルうち、<code>sudo</code> 権限が必要なもの。</td>
    </tr>
    <tr>
      <td><code>/usr/sbin</code></td>
      <td>管理ユーティリティによってインストールされたバイナリファイルのうち、<code>sudo</code> 権限が必要なもの。</td>
    </tr>
    <tr>
      <td><code>/usr/local/sbin</code></td>
      <td>Unix 外のソフトウェアによってインストールされたバイナリファイルのうち、<code>sudo</code> 権限が必要なもの。最初は空になっている。</td>
    </tr>
  </tbody>
</table>

<br>

### バイナリファイルの場所の探し方

```bash
# バイナリファイルが全ての場所で見つからないエラー
$ which python3
which: no python3 in (/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin)

# バイナリファイルの場所
$ which python3
/usr/bin/python3
```

<br>

## 04. Posix

### Posix

OS によろずにシステムコールできるようにするためのインターフェースのこと。

<br>

### Posix の規格

#### ▼ ファイルの末尾に改行が必要

Posix ではファイル末尾の改行を『終了』として認識する。

ファイルの末尾に改行がないと『終了』であることを明示できないため、Unix ユーティリティのファイル処理で予期せぬ問題が発生することもある。

この問題に合わせて、一部のツール (例：GitHub) では、ファイルの末尾に改行がないと、警告文がでるようになっている。

> - [What is this ‘no newline at end of file’ - Joachim Schuster’s blog](https://joachimschuster.de/posts/why-inserting-newline-at-the-end-of-file/)
> - https://stackoverflow.com/a/729795

<br>
