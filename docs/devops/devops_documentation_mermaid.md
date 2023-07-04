---
title: 【IT技術の知見】マーメイド＠開発手法
description: マーメイド＠開発手法の知見を記録しています。
---

# マーメイド＠開発手法

### はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## フローチャート

```mermaid
---
title: プロバイダーのアカウント別
---
%%{init:{'theme':'default'}}%%
flowchart LR
    subgraph PagerDuty
        pagerDuty["tfstate"]
    end
    subgraph Healthchecks
        healthchecks["tfstate"]
    end
    subgraph Datadog
        datadog["tfstate"]
    end
    subgraph AWS
        aws["tfstate"]
    end
    aws -...-> datadog
    aws -...-> healthchecks
    aws -...-> pagerDuty
    datadog -...-> aws
    healthchecks -...-> aws
    pagerDuty -...-> aws
```

<br>

> ↪️：https://mermaid.js.org/syntax/flowchart.html?id=flowcharts-basic-syntax

## Gitグラフ

```mermaid
---
title: ブランチの作業状況
---
%%{init: { 'theme': "default", 'themeVariables': { 'commitLabelFontSize': '13px' }}}%%
gitGraph
   commit id: "8c8e6"
   commit id: "0e3c3"
     branch feature/foo
     checkout feature/foo
     commit id: "4e9e8"
     commit id: "fooさんがApply"
   checkout main
     branch feature/bar
     commit id: "barさんがPlan"
   checkout main
   commit id: "e74d6"
     branch feature/baz
     commit id: "bazさんがPlan"
```

> ↪️：https://mermaid.js.org/syntax/gitgraph.html

<br>

## ガントチャート

```mermaid
%%{init:{'theme':'default'}}%%
gantt
  title プロジェクトのスケジュール
  %% 現在の日時を表示する
  dateFormat MM-DD

  section インフラ
    設計 : 07-01, 07-14
    実装 : 07-07, 07-21
    テスト : 07-14, 07-31

  section バックエンド
    設計 : 07-01, 07-14
    実装 : 07-07, 07-21
    テスト : 07-14, 07-31

  section フロントエンド
    設計 : 07-01, 07-14
    実装 : 07-07, 07-21
    テスト : 07-14, 07-31
```

> ↪️：https://mermaid.js.org/syntax/gantt.html

<br>
