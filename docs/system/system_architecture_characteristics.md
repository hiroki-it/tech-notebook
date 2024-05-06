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

### 明示的/暗示的な種類

#### ▼ 明示的要件

アーキテクチャ特性の要素であり、要件書に明示的に記載されている要件である。

> - https://www.oreilly.com/library/view/fundamentals-of-software/9781492043447/ch04.xhtml
> - https://product.10x.co.jp/entry/defining-architectural-characteristics

#### ▼ 暗黙的要件

アーキテクチャ特性の要素であり、要件書に明示的に記載されていない要件である。

> - https://www.oreilly.com/library/view/fundamentals-of-software/9781492043447/ch04.xhtml
> - https://product.10x.co.jp/entry/defining-architectural-characteristics

<br>

### IPAによる種類

定義が様々ある。

IPAが公開している非機能要件の種類を参考にするとよい。

| 大分類                 | 中分類                                                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 可用性                 | 継続性、耐障害性、回復性                                                                                                                                                                          |
| 性能拡張性             | 業務処理量、性能目標値、リソース拡張性、性能品質保証                                                                                                                                              |
| 運用保守               | 通常運用、保守運用、障害時運用、運用環境、サポート体制、その他                                                                                                                                    |
| 移行性                 | 移行時期、移行方式、移行対策、移行対象、移行計画                                                                                                                                                  |
| セキュリティ (安全性)  | 社内ルール、セキュリティリスク分析、セキュリティ診断、セキュリティリスク管理、アクセス利用制限、データ秘匿、不正追跡監視、ネットワーク対策、マルウェア対策、Web対策、セキュリティインシデント対応 |
| システム環境エコロジー | システム特性、規格、機材設置環境条件、環境マネージメント                                                                                                                                          |

> - https://www.ipa.go.jp/archive/digital/iot-en-ci/jyouryuu/hikinou/ent03-b.html

<br>

## 02. Availability (可用性)

### 可用性とは

システムで仮に障害が起こったとしても、システムの利用可能な時間をどれだけ長くできるかの、程度を表す。

稼働率の高さに基づいて評価する。

そもそもユーザーの利用しない時間帯の障害であれば、稼働率の計算には含まれないため、可用性が低いことにはならない。

> - https://www.weblio.jp/content/%E9%AB%98%E5%8F%AF%E7%94%A8%E6%80%A7
> - https://bongineer.net/entry/rasis/

<br>

### 可用性を高める方法

#### ▼ 冗長化

システムコンポーネントの複数のインスタンスを配置することにより、システム全体としての可用性を高める。

いずれかのインスタンスで障害が起こったとしても、他のインスタンスがこれを埋め合わせ、システム全体として利用可能な稼働時間を長くできる。

ただし、複数のハードウェアを用意することは大変なため、仮想環境の文脈で説明されることが多い。

**＊設定例＊**

通常時`3`台にすると仮定する。

もし、`1`台当たり`60`%未満の負荷になるようにすると、『`60`% × `3` = `180`%』になる。

これであれば、1台停止したとしても、`180`% > `200`%であるため、システム全体として稼働し続けられる。

同様にして、通常時`4`台であれば`70`%未満の負荷になるようにするとちょうどいい。

また、通常時``

> - https://it-trend.jp/words/availability

#### ▼ ロードバランシング

冗長化されたコンポーネントに通信を分散し、コンポーネント当たりの負荷を小さくすることにより、システム全体としての可用性を高める。

また、いずれかのコンポーネントで障害が起こった場合に、正常なコンポーネントにルーティングするようにし、システム全体としての稼働時間を長くする。

> - https://knowledge.sakura.ad.jp/6274/#i-3

#### ▼ コントロールプレーン/データプレーン

システムをコントロールプレーンとデータプレーンに切り分ける。

一部のデータプレーンで障害が起こっても、他のデータプレーンを制御することにより、システム全体としての可用性を高める。

> - https://ganganichamika.medium.com/separating-data-plane-and-control-plane-9fee0b7f3ef8
> - https://danieldonbavand.com/2022/03/08/what-is-a-control-and-data-plane-architecture/
> - https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/control-planes-and-data-planes.html

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

スプリットブレイン対策として、STONITH (問題がある方のインスタンスを強制的に再起動する) がある。

また、冗長化数を奇数にするとよい。

> - https://atmarkit.itmedia.co.jp/ait/articles/1612/16/news015.html
> - https://gihyo.jp/admin/serial/01/pacemaker/0003#sec2
> - https://www.mirantis.com/blog/everything-you-ever-wanted-to-know-about-using-etcd-with-kubernetes-v1-6-but-were-afraid-to-ask/

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

#### ▼ 性能と可用性の関係

性能を高める方法と可用性を高める方法は重複している。

|                  | 冗長化数を増やす    | 冗長化数を減らす    |
| ---------------- | ------------------- | ------------------- |
| 並列処理数の向上 | 性能⬆︎ / 可用性⬆︎ | 性能⬆︎ / 可用性⬇︎ |
| 並列処理数の低下 | 性能⬇︎ / 可用性⬆︎ | 性能⬇︎ / 可用性⬇︎ |

#### ▼ 冗長化

システムコンポーネントの複数のインスタンスを配置することにより、システム全体としての性能を高める。

#### ▼ CPUやメモリの並列処理数の向上

インスタンス当たりのCPUやメモリの並列処理数を向上させることにより、システム全体としての性能を高める。

#### ▼ 効率的な処理の実装

アプリの実装がシンプルであれば、その分処理が効率的になり、システム全体としての性能が高まる。

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

平均故障間隔の短さに基づいて評価する。

そもそもユーザーの利用しない時間帯に障害があっても、平均故障間隔に含まれるため、信頼性が低くなる。

そのため、あらゆる時間帯で障害が長いほど信頼性は低くなる。

注意点として、冗長化はいずれかのインスタンスで障害が起こることを前提とした方法なため、信頼性を高める方法ではない。

> - https://www.amazon.co.jp/dp/4873117917
> - https://bongineer.net/entry/rasis/

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

| 項目       | ヒアリング内容                                                                     | 達成するべき要件 | 検証方法例                                                                                       |
| ---------- | ---------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| 可用性     | 許容できる障害時間、バックアップ規約、稼働率、災害対策規約、など                   | ...              | 可用性テストを実施する。                                                                         |
| 性能       | 将来的に予想される同時アクセス数、など                                             | ...              | 性能テストを実施する。                                                                           |
| 拡張性     | 将来的に予想されるDBレコード数増加率、など                                         | ...              | 将来的に予想されるテストデータをDBに用意した上で、処理速度に問題が起こらないかどうかを検証する。 |
| 安全性     | DoS攻撃、など                                                                      | ...              | 脆弱性診断を実施する。                                                                           |
| 保守性     | 機能修正、障害対応、アップグレード規約、など                                       | ...              | テストデータを、追加/変更/削除できるかどうかを検証する。                                         |
| 運用性     | 監視、定期的な再起動、日時的な作業、ログとメトリクスの保管規約、リリース規約、など | ...              | 意図的にエラーを発生させ、アラートを正しく送信するかどうかを検証する。                           |
| 可搬性     | 新旧移行規約、など                                                                 | ...              | 移行テストを実施する。                                                                           |
| 信頼性     | ストレージの障害対策、など                                                         | ...              | ...                                                                                              |
| 使いやすさ | ペルソナ、エラー処理、など                                                         | ...              | Testing in production (例：カナリアリリース中のテスト、カオスエンジニアリング) を実施する。      |

> - https://thinkit.co.jp/article/17647
> - https://github.com/YoshiiRyo1/document-templates-for-aws/blob/master/survey/doc_source/non-functional-requirement.md
> - https://dev.classmethod.jp/articles/survey-non-functional-requirement/
> - https://www.ipa.go.jp/archive/digital/iot-en-ci/jyouryuu/hikinou/ent03-b.html

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
