---
title: 【IT技術の知見】DevOps
description: DevOpsの知見を記録しています。
---

# DevOps

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. DevOps

### DevOpsとは

開発者 (Dev) と運用者 (Ops) が協調して開発と運用を行い、ソフトウェアを継続的に改善する手法論のこと。

DevOpsを実践しない状況では、開発者 (例：機能追加、機能変更) と運用者 (例：安定稼働のためになるべく機能追加/変更したくない) の利害が一致しないため、ソフトウェアを継続的に改善できない。

> ↪️ 参考：
>
> - https://e-words.jp/w/DevOps.html
> - https://speakerdeck.com/nwiizo/2023nian-mosrezai-kao-tojiao-binasai?slide=12

<br>

### DevOpsの要素

#### ▼ DevOpsの要素とは

DevOpsには、以下の要素がある。

DevOpsのこれらの要素を実践するエンジニアリングを『SREing』、また職種は『SREer』という。

#### ▼ 技術的要素

DevOpsの技術的要素は、CIとCDである。

> ↪️ 参考：
>
> - https://speakerdeck.com/nwiizo/2023nian-mosrezai-kao-tojiao-binasai?slide=23
> - https://www.veritis.com/blog/meet-full-devops-potential-with-devops-maturity-model/

#### ▼ 組織文化的要素

DevOpsの組織文化的要素は、開発者と運用者の協調や、許容の文化である。

> ↪️ 参考：
>
> - https://speakerdeck.com/nwiizo/2023nian-mosrezai-kao-tojiao-binasai?slide=23
> - https://www.veritis.com/blog/meet-full-devops-potential-with-devops-maturity-model/

<br>

## 02. DevOpsによる高品質の維持

### 高品質なシステムの維持とは

DevOpsにて、品質を維持する作業を自動化することにより、一定水準以上の品質を維持しやすくする。

<br>

### システムの品質とは

![software-quality-attributes_measurement](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software-quality-attributes_measurement.png)

システム (ソフトウェアとハードウェア、があるがここでは特にソフトウェア) には、例えば以下の品質の特性がある (ISOの規格の場合) 。

- 機能性
- パフォーマンス効率性
- 互換性
- 利便性 (使いやすさ)
- 信頼性
- 安全性
- 保守性
- 移植性 (汎用性)

<br>

### 定量化

#### ▼ 定量化の方法

品質特性の程度は、例えば以下の観点で定量化できる。

- 採用されたアーキテクチャ
- 採用されたコーディング手法
- ソースコードの複雑さ
- ドキュメントの有無
- 移植性 (汎用性)
- ソースコードのサイズ
- SREingの文脈でのユーザーからの満足度

> ↪️ 参考：
>
> - https://iso25000.com/index.php/en/iso-25000-standards/iso-25010
> - https://en.wikipedia.org/wiki/List_of_system_quality_attributes
> - https://en.wikipedia.org/wiki/Software_quality#Measurement

#### ▼ なぜ定量化するのか

システムの品質の定量化には、以下のような利点がある。

エンジニア側にとって

- 中長期的な観点で、システムを拡張しやすくなる (保守性、拡張性) 。
- 障害が起こりにくくなる (信頼性) 。また、障害が起こったとしてもシステムの稼働時間を延長できる (可用性) 。
- ビジネスよりも技術を優先するべき時の交渉材料になる。
- エンジニアの仕事の成果としての交渉材料になる。

ビジネス側にとって

- ユーザーの満足度を高められ、結果的に売上につながる。
- 技術よりもビジネスを優先するべき時の交渉材料になる。

そのため、一定以上の高品質を維持するべきである。

また、品質を維持しやすくするために、作業を自動的に実施する仕組みづくりが必要である。

<br>

### 品質を高めるリリース

#### ▼ リリースが自動化されていること

アプリケーションのリリースまでの各ステップ (ビルド、ホワイトボックステスト、デプロイ) を自動化する。

これにより、リリースがより簡単になり、ヒューマンエラーを防げる。

DevOpsのCI/CDパイプラインを導入することによりこれを実装する。

> ↪️ 参考：https://www.atlassian.com/ja/agile/software-development/release

#### ▼ ビッグバンリリースではないこと

アプリケーションのリリースの粒度を小さくし、小さなリリースを頻繁に行う。

これにより、人間の確認範囲を小さくし、リリース時に予期せぬ問題が起こることを防げる。

アジャイル開発やマイクロサービスアーキテクチャを導入することによりこれを実装する。

> ↪️ 参考：https://www.atlassian.com/ja/agile/software-development/release

#### ▼ リリース内容がわかるようにしておく

リリース内容がわかるように、タスクやプルリクエストに対するリンクを明記しておく。

これにより、リリース時の予期せぬ問題を即解決できる。

リリースノートやPRRモデルを導入することによりこれを実装する。

> ↪️ 参考：
>
> - https://www.atlassian.com/ja/agile/software-development/release
> - https://tech-blog.optim.co.jp/entry/2020/07/01/080000

<br>
