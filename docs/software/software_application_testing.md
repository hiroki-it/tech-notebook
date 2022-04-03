---
title: 【知見を記録するサイト】テスト
description: テストの知見をまとめました．
---

# テスト

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. コードベースのテスト

### テスト手順

1. コードを整形する．
2. コードの静的解析を行う．
3. ユニットテストと機能テストを行う．

<br>

### 整形ツール

#### ▼ PHP

PhpStorm，PHP-CS-Fixer

#### ▼ Go

標準の```go fmt```コマンド

<br>

### 静的解析ツール

#### ▼ PHP

PhpStorm，PHPStan，Larastan

#### ▼ Go

標準の```go vet```コマンド

<br>

### ユニットテストツール，機能テストツール

#### ▼ PHP

PHPUnit

#### ▼ Go

標準の```go fmt```コマンド

<br>

## 02. テスト仕様書ベースのテスト

### テスト手順

1. テスト仕様書に基づく，ユニットテスト，Integrationテスト，User Acceptanceテストを行う．
2. グラフによるテストの可視化



