---
title: 【IT技術の知見】アーキテクチャ特性＠システム
description: アーキテクチャ特性＠システムの知見を記録しています。
---

# アーキテクチャ特性＠システム

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. アーキテクチャ特性

### アーキテクチャ特性とは

『非機能要件』や『品質特性』とも言い換えられる。

ただ、非機能要件や品質特性だとその性質を正しく表現できないとして、アーキテクチャ特性と表現した方が良い。

> - https://iso25000.com/index.php/en/iso-25000-standards/iso-25010
> - https://www.oreilly.com/library/view/fundamentals-of-software/9781492043447/ch04.xhtml

<br>

### 明示的要件

アーキテクチャ特性の要素であり、要件書に明示的に記載されている要件である。

> - https://www.oreilly.com/library/view/fundamentals-of-software/9781492043447/ch04.xhtml
> - https://product.10x.co.jp/entry/defining-architectural-characteristics

<br>

### 暗黙的要件

アーキテクチャ特性の要素であり、要件書に明示的に記載されていない要件である。

> - https://www.oreilly.com/library/view/fundamentals-of-software/9781492043447/ch04.xhtml
> - https://product.10x.co.jp/entry/defining-architectural-characteristics

<br>

## 02. Availability (可用性)

### 可用性とは

システムで仮に障害が起こったとしても、システムの利用可能な時間をどれだけ長くできるかの、程度を表す。

> - https://www.weblio.jp/content/%E9%AB%98%E5%8F%AF%E7%94%A8%E6%80%A7

<br>

### 可用性を高める方法

#### ▼ 冗長化

システムのコンポーネントに関して、複数のインスタンスを配置する。

いずれかのインスタンスで障害が起こったとしても、他のインスタンスがこれを埋め合わせ、システム全体として利用可能な稼働時間を長くできる。

ただし、複数のハードウェアを用意することは大変なため、仮想環境の文脈で説明されることが多い。

> - https://it-trend.jp/words/availability

#### ▼ ロードバランシング

冗長化されたコンポーネントに通信を分散し、コンポーネント当たりの負荷を小さくする。

また、いずれかのコンポーネントで障害が起こった場合に、正常なコンポーネントにルーティングするようにし、システム全体としての稼働時間を長くする。

> - https://knowledge.sakura.ad.jp/6274/#i-3

<br>

## 02-02. 冗長化システムの種類

### デュアルシステム

#### ▼ デュアルシステムとは

![dual-system](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/dual-system.png)

複数の稼働中インスタンスを配置する冗長化方法のこと。

平常時はいずれかの稼働中インスタンスのロードバランシングする。

いずれかの稼働中インスタンスで障害が発生した場合、障害が発生したインスタンスをロードバランサーから切り離す。

> - https://www.fe-siken.com/kakomon/29_aki/q13.html

<br>

### デュプレックスシステム

#### ▼ デュプレックスシステムとは

![duplex-system](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/duplex-system.png)

稼働中インスタンスと待機中インスタンス (ホットスタンバイ/コールドスタンバイ) を配置する冗長化方法のこと。

平常時は稼働中インスタンスのみにルーティングするようにしておく。

稼働中インスタンスで障害が発生した場合、待機中インスタンスを稼働中インスタンスに昇格させ、インバウンド通信のルーティング先をこれに切り替える。

> - https://www.idcf.jp/words/failover.html
> - https://www.itpassportsiken.com/kakomon/02_yosou/q60.html

#### ▼ スイッチオーバー、フェイルオーバー

インバウンド通信のルーティング先を待機中インスタンスに切り替える時、手動で切り替えることを『スイッチオーバー』、自動的に切り替えることを『フェイルオーバー』という。

> - https://www.idcf.jp/words/failover.html

<br>

## 02-03. 冗長化手法の種類

### 垂直スケーリング

#### ▼ 垂直スケーリング (スケールアップ ⇔ スケールダウン) とは

仮想環境のコンポーネント自体のスペックをより高くすることにより、インスタンス当たりの負荷を小さくし、障害が起こらないようにする。

![スケールアップ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/スケールアップ.png)

> - https://www.idcf.jp/words/scale-out.html

<br>

### 水平スケーリング

#### ▼ 水平スケーリング (スケールアウト ⇔ スケールイン) とは

仮想環境のコンポーネントのインスタンス数を増やすことにより、インスタンス当たりの負荷を小さくし、障害が起こらないようにする。

![スケールアウト](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/スケールアウト.png)

> - https://www.idcf.jp/words/scale-out.html

<br>

### 高可用性クラスターシステム

#### ▼ 高可用性クラスターシステムとは

`1`個の処理を分担できる複数の稼働中ノードと待機中ノードを配置する冗長化方法のこと。

平常時は稼働中ノードのみにルーティングするようにしておき、`1`個の処理を分担させる。

稼働中ノードで障害が発生した場合、待機中ノードを稼働中ノードに昇格させ、インバウンド通信のルーティング先をこれに切り替える。

![ha-cluster-system,png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ha-cluster-system,png.png)

> - https://bcblog.sios.jp/drbd-what-is-clustersystem/#HA

#### ▼ スイッチオーバー、フェイルオーバー

デュプレックスシステムと同じである。

<br>

### 負荷分散クラスターシステム

#### ▼ 負荷分散クラスターシステムとは

`1`個の処理を分担できる複数の稼働中ノード (プライマリーインスタンス、スタンバイインスタンス) を配置しつつ、ロードバランシングできるようにした冗長化方法のこと。

> - https://bcblog.sios.jp/drbd-what-is-clustersystem/#HA

#### ▼ スプリットブレイン問題

プライマリーインスタンスとスタンバイインスタンスの間で通信障害が起こり、複数のプライマリーインスタンスが存在してしまう問題のこと。

> - https://atmarkit.itmedia.co.jp/ait/articles/1612/16/news015.html

<br>

## 03. Durability (耐久性)

### 耐久性とは

長時間の高負荷にどれだけ耐えられるかの、程度を表す。

<br>

## 04. Performance (性能)

### 性能とは

システムに割り当てられたハードウェアリソースの中で、十分に処理できるか、どれだけ効率的に処理できるかどうできるかの、程度を表す。

<br>

### 性能を高める方法

#### ▼ 冗長化

記入中...

#### ▼ CPUやメモリの並列処理数の向上

記入中...

<br>

## 05. Fault tolerance (耐障害性)

### 耐障害性とは

システムで仮に障害が起こったとしても、システムの性能を低下させずにどれだけ稼働できるかの、程度を表す。

<br>

## 06. Maintainability (保守性)

### 保守性とは

前提として、稼働中のシステムで突然発生する作業 (例；機能修正、障害対応、アップグレード) を『保守』という。

この時に、保守性は継続的に保守できるかの程度を表す。

継続的に機能追加できるかは、保守性ではなく拡張性である。

> - https://syndicode.com/blog/12-software-architecture-quality-attributes/
> - https://www.itmanage.co.jp/column/about-system-operation/

<br>

## 07. Operability (運用性)

### 運用性とは

前提として、稼働中のシステムで定期的に必ず実施する作業 (例：監視、定期的な再起動、手順書に沿った日時的な作業) を『運用』という。

この時に、運用性は継続的に運用できるかの程度を表す。

> - https://octoperf.com/blog/2019/06/26/non-functional-requirements/
> - https://www.itmanage.co.jp/column/about-system-operation/

<br>

## 06. Recoverability (復旧力)

### 復旧力とは

障害が発生した場合に、どれだけ早く復旧できるかの、程度を表す。

<br>

## 07. Reliability (信頼性)

### 信頼性とは

システムが求められる能力を、定められた条件下で定められた期間にわたり、障害を発生させることなく実行するかの、程度を表す。

> - https://www.amazon.co.jp/dp/4873117917

<br>

### 信頼性を高める方法

#### ▼ スケーリング

システムにて、仮想環境からなるコンポーネントのスペックや数を変更することにより、インスタンス当たりの負荷を小さくし、障害が起こらないようにすること。

ただし、実際のハードウェアをスペックやインスタンス数を変更することは大変な作業であるため、仮想環境の文脈で説明されることが多い。

#### ▼ SLOの遵守

> - https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_service_level.html

<br>

## 08. Scalability (拡張性)

### 拡張性とは

システムがビジネスの成長 (例：機能追加/機能変更、DBレコード数増加、負荷の高まり) に継続的に対応できるかの程度を表す。

> - https://e-words.jp/w/%E6%8B%A1%E5%BC%B5%E6%80%A7.html
> - https://www.cyberlinkasp.com/insights/what-is-software-scalability-and-why-is-it-important

<br>

## 08. Security (安全性)

### 安全性とは

システムの機密なデータがどれだけ流出しにくいかの、程度を表す。

<br>

## 09. Usability (使いやすさ)

### 使いやすさとは

システムの利用ユーザーが特定の機能 (例：何らかの登録/参照/変更/削除) を使用する時にどれだけ満足 (例：目的達成まで至りやすい、エラーがわかりやすい) できるかの、程度を表す。

> - https://syndicode.com/blog/12-software-architecture-quality-attributes/

<br>

## 09. アーキテクチャ特性の要件定義

### ヒアリングの項目

| 項目       | ファクター                               | 達成するべき要件 | 検証方法 |
| ---------- | ---------------------------------------- | ---------------- | -------- |
| 可用性     | ダウンタイム、など                       | ...              | ...      |
| 性能       | 同時アクセス、など                       | ...              | ...      |
| 拡張性     | DBレコード数増加、など                   | ...              | ...      |
| 安全性     | DoS攻撃、など                            | ...              | ...      |
| 保守性     | 機能修正、障害対応、アップグレード、など | ...              | ...      |
| 運用性     | 監視、定期的な再起動、日時的な作業、など | ...              | ...      |
| 可搬性     | 新旧移行方法、など                       | ...              | ...      |
| 使いやすさ | ペルソナ、エラー処理                     | ...              | ...      |

> - https://thinkit.co.jp/article/17647
> - https://github.com/YoshiiRyo1/document-templates-for-aws/blob/master/survey/doc_source/non-functional-requirement.md
> - https://dev.classmethod.jp/articles/survey-non-functional-requirement/

<br>

## 10. アーキテクチャ特性の定量化

### 定量化の方法

アーキテクチャ特性の程度は、例えば以下の観点で定量化できる。

- 採用されたアーキテクチャ
- 採用されたコーディング手法
- ソースコードの複雑さ
- ドキュメントの有無
- 移植性 (汎用性)
- ソースコードのサイズ
- SREingの文脈でのユーザーからの満足度

![software-quality-attributes_measurement](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software-quality-attributes_measurement.png)

> - https://iso25000.com/index.php/en/iso-25000-standards/iso-25010
> - https://en.wikipedia.org/wiki/List_of_system_quality_attributes
> - https://en.wikipedia.org/wiki/Software_quality#Measurement

<br>

### なぜ定量化するのか

システムの品質の定量化には、以下のような利点がある。

エンジニア側にとって

- 中長期的な観点で、システムを拡張しやすくなる (保守性、拡張性) 。
- 障害が起こりにくくなる (信頼性) 。また、障害が起こったとしてもシステムの稼働時間を延長できる (可用性) 。
- する必要がある。
- エンジニアの仕事の成果としての交渉材料になる。

ビジネス側にとって

- ユーザーの満足度を高められ、結果的に売上につながる。
- 技術よりもビジネスを優先する必要がある時の交渉材料になる。

そのため、一定以上の高品質を維持する必要がある。

また、品質を維持しやすくするために、作業を自動的に実施する仕組みづくりが必要である。

<br>
