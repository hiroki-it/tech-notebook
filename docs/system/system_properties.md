---
title: 【IT技術の知見】システム特性＠システム
description: システム特性＠システムの知見を記録しています。
---

# システム特性＠システム

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

システムにて、仮想環境からなるコンポーネントのスペックや数を変更することにより、インスタンス当たりの負荷を小さくし、障害が起こらないようにすること。ただし、実際のハードウェアをスペックやインスタンス数を変更することは大変な作業であるため、仮想環境の文脈で説明されることが多い。

#### ▼ SLOの遵守

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software_development_methodology/software_development_methodology_site_reliability_engineering.html

<br>

## 01-02. スケーリングの種類

### 垂直スケーリング

#### ▼ 垂直スケーリング（スケールアップ ⇔ スケールダウン）とは

仮想環境のコンポーネント自体のスペックをより高くすることにより、インスタンス当たりの負荷を小さくし、障害が起こらないようにする。

ℹ️ 参考：https://www.idcf.jp/words/scale-out.html

![スケールアップ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/スケールアップ.png)

<br>

### 水平スケーリング

#### ▼ 水平スケーリング（スケールアウト ⇔ スケールイン）とは

仮想環境のコンポーネントのインスタンス数を増やすことにより、インスタンス当たりの負荷を小さくし、障害が起こらないようにする。

ℹ️ 参考：https://www.idcf.jp/words/scale-out.html

![スケールアウト](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/スケールアウト.png)

<br>

## 02. Availability（可用性）

### 可用性とは

システムで仮に障害が起こったとしても、どれだけシステムの利用可能な時間を長くできるかを程度を表す。

ℹ️ 参考：https://www.weblio.jp/content/%E9%AB%98%E5%8F%AF%E7%94%A8%E6%80%A7

<br>

### 可用性を高める方法

#### ▼ 可用性のための冗長化

システムのコンポーネントに関して、複数のインスタンスを設置する。いずれかのインスタンスで障害が起こったとしても、他のインスタンスがこれを埋め合わせ、システム全体として利用可能な稼働時間を長くできる。ただし、複数のハードウェアを用意することは大変なため、仮想環境の文脈で説明されることが多い。

ℹ️ 参考：https://it-trend.jp/words/availability

<br>

## 02-02. 可用性のための冗長化

### デュアルシステム

#### ▼ デュアルシステムとは

![dual-system](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/dual-system.png)

複数の稼働中インスタンスを設置する冗長化方法のこと。平常時はいずれかの稼働中インスタンスのロードバランシングする。いずれかの稼働中インスタンスで障害が発生した場合、障害が発生したインスタンスをロードバランサーから切り離す。

ℹ️ 参考：https://www.fe-siken.com/kakomon/29_aki/q13.html

<br>

### デュプレックスシステム

#### ▼ デュプレックスシステムとは

![duplex-system](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/duplex-system.png)

稼働中インスタンスと待機中インスタンス（ホットスタンバイ/コールドスタンバイ）を設置する冗長化方法のこと。平常時は稼働中インスタンスのみにルーティングするようにしておく。稼働中インスタンスで障害が発生した場合、待機中インスタンスを稼働中インスタンスに昇格させ、インバウンド通信のルーティング先をこれに切り替える。

ℹ️ 参考：

- https://www.idcf.jp/words/failover.html
- https://www.itpassportsiken.com/kakomon/02_yosou/q60.html

#### ▼ スイッチオーバー、フェイルオーバー

インバウンド通信のルーティング先を待機中インスタンスに切り替える時、手動で切り替えることを『スイッチオーバー』、自動で切り替えることを『フェイルオーバー』という。

ℹ️ 参考：https://www.idcf.jp/words/failover.html

<br>

### 高可用性クラスターシステム

#### ▼ 高可用性クラスターシステムとは

![ha-cluster-system,png](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ha-cluster-system,png.png)

一つの処理を分担できる複数の稼働中ノードと待機中ノードを設置する冗長化方法のこと。平常時は稼働中ノードのみにルーティングするようにしておき、一つの処理を分担させる。稼働中ノードで障害が発生した場合、待機中ノードを稼働中ノードに昇格させ、インバウンド通信のルーティング先をこれに切り替える。

ℹ️ 参考：https://bcblog.sios.jp/drbd-what-is-clustersystem/#HA

#### ▼ スイッチオーバー、フェイルオーバー

デュプレックスシステムと同じである。

<br>

## 03. Durability（耐久性）

### 耐久性とは

長時間の高負荷にどれだけ耐えられるかの程度を表す。

<br>

## 04. 耐障害性

### 耐障害性とは

障害が起きた時にユーザーへの影響をどれだけ小さくできるかの程度を表す。

<br>
