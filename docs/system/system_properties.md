---
title: 【IT技術の知見】システム特性＠仮想化
description: システム特性＠仮想化の知見を記録しています。
---

# システム特性＠仮想化

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 信頼性

### 信頼性とは

システムが求められる機能を、定められた条件下で、定められた期間にわたり、障害を起こすことなく実行する程度のこと。

<br>

### 信頼性を高める方法

#### ▼ スケーリング

ハードウェアのスペックやインスタンス数を変更することにより、障害が起こらないようにすること。ただし、実際のハードウェアをスペックやインスタンス数を変更することは大変な作業であるため、仮想環境の文脈で説明されることが多い。

#### ▼ SLOの遵守

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software_development_methodology/software_development_methodology_site_reliability_engineering.html

<br>

## 01-02. スケーリングの種類

### 垂直スケーリング

#### ▼ 垂直スケーリング（スケールアップ ⇔ スケールダウン）とは

仮想環境自体のスペックをより高くすることにより、インスタンス当たりの負荷を小さくし、障害が起こらないようにする。

参考：https://www.idcf.jp/words/scale-out.html

![スケールアップ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/スケールアップ.png)

<br>

### 水平スケーリング

#### ▼ 水平スケーリング（スケールアウト ⇔ スケールイン）とは

仮想環境のインスタンス数を増やすことにより、インスタンス当たりの負荷を小さくし、障害が起こらないようにする。

参考：https://www.idcf.jp/words/scale-out.html

![スケールアウト](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/スケールアウト.png)

<br>

## 02. Availability（可用性）

### 可用性とは

システムで仮に障害が起こったとしても、どれだけシステムの利用可能な時間を長くできるかを程度を表す。

ℹ️ 参考：https://www.weblio.jp/content/%E9%AB%98%E5%8F%AF%E7%94%A8%E6%80%A7

<br>

### 可用性を高める方法

#### ▼ 冗長化

同じ状態の複数のシステムやコンポーネントを設置し、システムやコンポーネントで障害が起こったとしても、利用可能な稼働時間を長くする。ただし、複数のハードウェアを用意することは大変なため、仮想環境の文脈で説明されることが多い。

参考：https://it-trend.jp/words/availability

<br>

## 02-02. 冗長化の種類

### デュアルシステム

#### ▼ デュアルシステム

複数の稼働中インスタンスを設置する冗長化方法のこと。通常時はいずれかの稼働中インスタンスのロードバランシングする。いずれかの稼働中インスタンスで障害が発生した場合、障害が発生したインスタンスをロードバランサーから切り離す。

![デュアルシステム](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/デュアルシステム.png)

<br>

### デュプレックスシステム

#### ▼ デュプレックスシステム

稼働中インスタンスと待機中インスタンスを設置する冗長化方法のこと。通常時は稼働中インスタンスのみにルーティングするようにしておく。稼働中インスタンスで障害が発生した場合、インバウンド通信のルーティング先を待機中インスタンスに切り替える。

参考：https://www.idcf.jp/words/failover.html

![デュプレックスシステム](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/デュプレックスシステム.png)

#### ▼ スイッチオーバー、フェイルオーバー

インバウンド通信のルーティング先を待機中インスタンスに切り替える時、手動で切り替えることを『スイッチオーバー』、自動で切り替えることを『フェイルオーバー』という。

参考：https://www.idcf.jp/words/failover.html

<br>

## 03. Durability（耐久性）

### 耐久性とは

長時間の高負荷にどれだけ耐えられるかの程度を表す。

<br>

## 04. 耐障害性

### 耐障害性とは

障害が起きた時にユーザーへの影響をどれだけ小さくできるかの程度を表す。

<br>
