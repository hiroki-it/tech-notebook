---
title: 【IT技術の知見】SREing：Site Reliability＠DevOps
description: SREing：Site Reliability Engineering＠DevOpsの知見を記録しています。
---

# SREing：Site Reliability Engineering＠DevOps

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. SREingの用語集

### SREingとは

#### ▼ 引用：[サイトリライアビリティエンジニアリング](https://www.amazon.co.jp/dp/4873117917)

サイトの信頼性向上を目的としたエンジニアリング手法のこと。

DevOpsというインターフェースを実装したエンジニアリング手法でもある。

Platform Engineeringとは異なり、サイトの信頼性向上からDevOpsを実現する (出典は俺)。

<br>

### サイトの『信頼性』とは

#### ▼ 引用：[サイトリライアビリティエンジニアリング](https://www.amazon.co.jp/dp/4873117917)

信頼性とは、『システムが求められる機能を、定められた条件下で、定められた期間にわたり、障害を発生させることなく実行する確率』のこと。

#### ▼ 引用：[SRE実践の手引](https://eh-career.com/engineerhub/entry/2019/12/05/103000)

SREerの具体的な行動を明確にするためには、サイトの信頼性を表す指標 (SLI) と、指標の具体的な目標値 (SLO) を定義する必要がある。

エラーバジェットの残量を考慮に入れ、リスクを取りながら、サイトの信頼性の維持に努める。

#### ▼ 引用：[SREの基本と組織への導入](https://dev.classmethod.jp/articles/202105-report-gcd21-d3-infra-01/)

ソフトウェアの最も重要な機能は信頼性であり、信頼性の程度はサイトのユーザーによって決められるべきである。

ユーザーは、SLIを信頼性の指標とし、SLOに至った場合に信頼できるサイトと見なす。

#### ▼ 引用：[組織の信頼性のマインドセット](https://cloud.google.com/blog/ja/products/devops-sre/the-five-phases-of-organizational-reliability)

プロダクトの信頼性は、そのシステムのアーキテクチャ/プロセス/文化/開発組織のマインドセットによって決まる。

<br>

## 02. SREingが有用な業態

### 人命に関する安全性を担保しなくてもよい業態

SREingが信頼性を向上させるソフトウェアは、サイトやそれに類似するサービスである。

原子力発電所、航空機、医療機器、その他安全性が極めて重要なソフトウェアなどの信頼性については考えない。

> - https://www.amazon.co.jp/dp/4873117917

<br>

### システム構築後に機能改善作業がある業態

SREingには、継続的な改善によって、システムの信頼性を向上させようとする思想がある。

そのため、アジャイル開発を採用できないシステム (例：人命にかかわるようなシステム) を扱っている業態や、サイトを扱っていても納品後に改善作業がないような業態 (例：受託会社) では、有効に動作しない。

> - https://eh-career.com/engineerhub/entry/2019/12/05/103000

<br>

## 03. SREingの組織モデルの種類

### プロダクトチーム内フルスタックSREer型 (Embedded SRE)

特定のプロダクトの信頼性を高めるために、アプリケーションチームと同じチームにSREerが参画し、フルスタック的にSREingする。

> - https://x-tech5.co.jp/2022/02/21/204/

<br>

### フルスタックSREerチーム型

様々なプロダクトの信頼性を高めるために、SREer自体をチームとして定義し、SREerチーム全体としてフルスタック的にSREingする。

SREerチームは、T字型のスキルを持った様々なエンジニア (例：アプリエンジニア、インフラエンジニア、ネットワークエンジニア、など) から構成される。

各SREerがフルスタックな人材である必要はなく、各SREerが得意分野を`1`個持っている。

お互いが得意不得意を補い合うことにより、SREerチーム全体としてフルスタック的にSREingできるようになる。

> - https://x-tech5.co.jp/2022/02/21/204/

<br>

### ツール開発SREer型

様々なプロダクトの信頼性を高めるために、SREerがアプリケーションチームを支援する自前ライブラリを開発する。

> - https://x-tech5.co.jp/2022/02/21/204/

<br>

### プラットフォームSREer型

様々なプロダクトの信頼性を高めるために、SREerがアプリケーションチームやチーム内SREerを支援するインフラを開発する。

> - https://hrmos.co/pages/moneyforward/jobs/040infra01

<br>

### Enabling SREer型 (CCoE)

前者にSREのプラクティスを広める。

> - https://hrmos.co/pages/moneyforward/jobs/040infra01

<br>

## 04. スキルセット

### `L4` ~ `L7`

SREerは、`L4` ~ `L7`を領域として業務する。

そのため、インフラだけでなくアプリでもスキルが必要である。

一方で、SREerチーム全体として`L1` ~ `L3`を補完するために、少数の専門的なインフラエンジニアが必要になる。

> - https://sreake.com/blog/sre-vs-infrastructure-engineer/#section1-2

<br>

### 求人から見る

#### ▼ Wantedly

SREチームのValueから、SREerに必要な技術がわかる。

> - https://gist.github.com/south37/85d97e02d7816a31053971d63c164880

#### ▼ 3-shake、Topotal

提供しているサービスから、SREerに必要な技術がわかる。

> - https://sreake.com/
> - https://topotal.com/services/sre-as-a-service

<br>

### ニュース

#### ▼ SREウィークリー

> - https://sreweekly.com/about-sre-weekly-2/

<br>
