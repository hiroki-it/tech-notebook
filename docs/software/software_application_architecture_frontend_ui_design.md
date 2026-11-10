---
title: 【IT技術の知見】UI設計
description: UI設計の知見を記録しています。
tags:
  - "アプリ"
  - "フロントエンドアーキテクチャ"
---

# UI 設計

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. Atomic Design

### Atmic Design とは

UI レンダリングロジックを構成する要素を、5 つのレイヤー (Atoms、Molecules、Organisms、Templates、Pages) に分ける設計方法のこと。

> - [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)

<br>

## 02. Component-Driven Development

UI をコンポーネント単位でボトムアップに開発し、Storybook などで各コンポーネントを独立して確認してから画面に組み立てる開発方法のこと。

<br>
