---
title: 【IT技術の知見】状態管理＠フロントエンドアーキテクチャ
description: 状態管理＠フロントエンドアーキテクチャの知見を記録しています。
---

# 状態管理＠フロントエンドアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 状態管理（状態管理）とは

『状態管理』ともいう。

フロントエンドアプリケーションの状態を管理する。

<br>

## 02. MVPアーキテクチャ

### MVPアーキテクチャとは

以下の要素からなる。

- View：UIレンダリングロジック、CSSスタイリングロジック
- Presenter：状態管理ロジック
- Model：機能モデル

<br>

## 03. MVVMアーキテクチャ

### MVVMアーキテクチャとは

以下の要素からなる。

- View：UIレンダリングロジック、CSSスタイリングロジック
- ViewModel：状態管理ロジック
- Model：機能モデル

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
