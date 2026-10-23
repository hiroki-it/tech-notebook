---
title: 【IT技術の知見】状態管理＠フロントエンドアーキテクチャ
description: 状態管理＠フロントエンドアーキテクチャの知見を記録しています。
---

# 状態管理＠フロントエンドアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. 状態管理とは

UI レンダリングに必要なデータを保持し、ユーザー操作や通信処理結果に応じて非同期に変更すること。

<table>
  <thead>
    <tr>
      <th>フレームワーク／パッケージ</th>
      <th>状態管理関数</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>React</td>
      <td><code>useState</code>、<code>useReducer</code>、<code>useRef</code>、<code>useContext</code></td>
    </tr>
    <tr>
      <td>Vue.js</td>
      <td><code>ref</code>、<code>reactive</code>、<code>computed</code>、<code>watch</code></td>
    </tr>
    <tr>
      <td>Next.js (React と同じ)</td>
      <td><code>useState</code>、<code>useReducer</code>、<code>useRef</code>、<code>useSyncExternalStore</code>、<code>useContext</code></td>
    </tr>
    <tr>
      <td>Nuxt.js (Vue.js と同じ)</td>
      <td><code>ref</code>、<code>reactive</code>、<code>computed</code>、<code>watch</code></td>
    </tr>
  </tbody>
</table>

<br>

## 02. 状態管理するべきデータ

### 選択途中の絞り込み条件

UI で次を設定している間、そのデータをバックエンドに送信することなく、フロントエンド上で管理する。

また、管理されたデータに応じた UI を表示する。

- 絞り込み項目の設定
- 並び替え項目と昇順／降順の設定
- OR 条件と AND 条件の設定

最終的に決定ボタンが押されたタイミングで状態をバックエンドに送信する。

### カーソルをあてている表示項目

UI で次のように操作している間、カーソルを当てている表示項目のデータをフロントエンド上でのみ管理する。

また、管理されたデータに応じた UI を表示する。

- グラフや表の値にカーソルをあてる
- カレンダーの日付にカーソルをあてる
- 地図の位置にカーソルをあてる

<br>

## 02. MVP アーキテクチャ

### MVP アーキテクチャとは

以下の要素が該当のロジックをもつ。

- View：UI レンダリングロジック、CSS スタイリングロジック
- Presenter：状態管理ロジック
- Model：機能モデル

<br>

## 03. MVVM アーキテクチャ

### MVVM アーキテクチャとは

以下の要素が該当のロジックをもつ。

- View：UI レンダリングロジック、CSS スタイリングロジック
- ViewModel：状態管理ロジック
- Model：機能モデル

View と Model の間に ViewModel を配置し、View と ViewModel の間で双方向にデータをやり取り (双方向データバインディング) する。

これによって、View と Model の間を疎結合にする。

Vue.js では、意識せずに MVVM アーキテクチャで実装できるようになっている。

![一般的なMVVMアーキテクチャ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/一般的なMVVMアーキテクチャ.png)

<br>

### 状態管理との関係性

以下の状態管理を使用している場合、MVVM アーキテクチャで構築することになる。

- CSR

> - [SSRアプリではMVCが主流で、SPAではMVVMが主流、だとしてそれは何故だろうか？: ほしまど のweblog](http://fluorite2.sblo.jp/article/189587309.html)

<br>

## 04. Flux アーキテクチャ

記入中...

<br>

## 05. Redux アーキテクチャ

記入中...

<br>
