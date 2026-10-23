---
title: 【IT技術の知見】フロー＠開発
description: フロー＠開発の知見を記録しています。
---

# フロー＠開発

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.GitLab.io/tech-notebook/

<br>

## 01. ビルド方法

実行環境ごとに適するビルド方法を選ぶ。

すべての実行環境で同じビルド方法を選ぶことが最適だが、現場の制約次第ではそうはならないことがある。

<table>
  <thead>
    <tr>
      <th></th>
      <th>ビルド方法 1</th>
      <th>ビルド方法 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>開発環境</td>
      <td>ビルトインサーバー</td>
      <td>コンテナ</td>
    </tr>
    <tr>
      <td>CI 環境</td>
      <td>コンテナ</td>
      <td>コンテナ</td>
    </tr>
  </tbody>
</table>
