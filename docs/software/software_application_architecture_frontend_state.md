---
title: 【IT技術の知見】状態管理＠フロントエンドアーキテクチャ
description: 状態管理＠フロントエンドアーキテクチャの知見を記録しています。
---

# 状態管理＠フロントエンドアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>



## 01. MVVMアーキテクチャ

### MVVMアーキテクチャとは

以下の要素からなる。

- View：UIロジック（HTML）
- ViewModel：状態と振る舞いのロジック（JavaScript）
- Model：モデルそのもの（JavaScript）

ViewとModelの間にViewModelを配置し、ViewとViewModelの間で双方向にデータをやり取り (双方向データバインディング) する。

これによって、ViewとModelの間を疎結合にする。

Vue.jsでは、意識せずにMVVMアーキテクチャで実装できるようになっている。

![一般的なMVVMアーキテクチャ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/一般的なMVVMアーキテクチャ.png)

<br>

### 状態管理との関係性

以下の状態管理を使用している場合、MVVMアーキテクチャで構築することになる。

- CSR

> - http://fluorite2.sblo.jp/article/189587309.html

<br>
