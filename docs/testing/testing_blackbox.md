---
title: 【IT技術の知見】ブラックボックステスト
description: ブラックボックステストの知見を記録しています。
---

# ブラックボックステスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ブラックボックステスト

### ブラックボックステストとは

ホワイトボックステストと組み合わせて単体テストを構成する。実装内容は気にせず、入力に対して、適切な出力が行われているかを検証する。単体テストとホワイト/ブラックボックステストの関係性については、以下の書籍を参考にせよ。

ℹ️ 参考：https://service.shiftinc.jp/column/4801/

![testing_black-box-test](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/testing_black-box-test.png)

<br>

### ブラックボックステストの種類

- 結合テスト
- 総合テスト

<br>

## 02. 単体テスト（ユニットテスト）

### 単体テストとは

機能追加/変更を含むコンポーネントのみが単体で正しく機能するかを検証する。

参考：https://pm-rasinban.com/ut-it-st

![testing_blackbox-test_unit_integration_system](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/testing_blackbox-test_unit_integration_system.png)

<br>

### 単体テストの種類

#### ▼ 機能テスト

| テストの種類 | 検証内容                                                 |
| ------------ | -------------------------------------------------------- |
| 正常系       | 特定のシステムコンポーネントの処理を正しく操作できるか。 |

ℹ️ 参考：

- https://webrage.jp/techblog/non_functional_testing
- https://qiita.com/gevanni/items/ff9a27936a1a6df28b9a#-%E6%A9%9F%E8%83%BD%E8%A6%81%E4%BB%B6

#### ▼ 非機能テスト

| テストの種類 | 検証内容                                                     |
| ------------ | ------------------------------------------------------------ |
| 正常系       | 特定のシステムコンポーネントのヘルスチェックが正常になっているか。 |

ℹ️ 参考：

- https://webrage.jp/techblog/non_functional_testing
- https://qiita.com/gevanni/items/ff9a27936a1a6df28b9a#-%E9%9D%9E%E6%A9%9F%E8%83%BD%E8%A6%81%E4%BB%B6

<br>

## 03. 結合テスト（インテグレーションテスト）

### 結合テストとは

機能追加/変更を含む複数のコンポーネントを組み合わせ、複数のコンポーネント間の連携が正しく機能しているかを検証する。

参考：https://pm-rasinban.com/ut-it-st

![testing_blackbox-test_unit_integration_system](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/testing_blackbox-test_unit_integration_system.png)

<br>

### 結合テストの種類

#### ▼ 機能テスト

| テストの種類 | 検証内容                                           |
| ------------ | -------------------------------------------------- |
| 正常系       | システムコンポーネント間の処理を正しく操作できるか |

ℹ️ 参考：

- https://webrage.jp/techblog/non_functional_testing
- https://qiita.com/gevanni/items/ff9a27936a1a6df28b9a#-%E6%A9%9F%E8%83%BD%E8%A6%81%E4%BB%B6

#### ▼ 非機能テスト

| テストの種類 | 検証内容                                         |
| ------------ | ------------------------------------------------ |
| 正常系       | システムコンポーネント間で正しく連携できているか |

ℹ️ 参考：

- https://webrage.jp/techblog/non_functional_testing
- https://qiita.com/gevanni/items/ff9a27936a1a6df28b9a#-%E9%9D%9E%E6%A9%9F%E8%83%BD%E8%A6%81%E4%BB%B6

<br>

### 結合テストの方向

#### ▼ トップダウンテスト

上層のコンポーネントから下層のコンポーネントに向かって、結合テストを実施する。下層にはテストダブルのスタブを作成する。

![トップダウンテスト](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/トップダウンテスト.jpg)

<br>

#### ▼ ボトムアップテスト

下層のコンポーネントから上層のコンポーネントに向かって、結合テストを実施する。上層にはテストダブルのドライバーを作成する。

![ボトムアップテスト](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ボトムアップテスト.jpg)

<br>

### シナリオテスト

実際の業務フローを参考にし、ユーザーが操作する順にテストを実施する。

<br>

## 04. 回帰テスト

既存コンポーネントの機能テストと非機能テストを改めて実施し、機能追加/変更を含むコンポーネントが、既存のコンポーネントに影響を与えていないかを検証する。

ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

![p496](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p496.jpg)

<br>

## 04. 総合テスト（システムテスト）

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/testing/testing_blackbox_system_test.html

