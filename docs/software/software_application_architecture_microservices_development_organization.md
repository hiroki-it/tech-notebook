---
title: 【IT技術の知見】開発組織の編成＠開発体制
description: 開発組織の編成＠開発体制の知見を記録しています。
---

# 開発組織の編成＠開発体制

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. チームの種類

### チームの関係性

ストリームアラインドチームがプロダクトを開発し、その他のチーム (イネーブルメントチーム、プラットフォームチーム、複雑サブシステムチーム) はこれを後押しする。

![organization_team-topology](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/organization_team-topology.png)

<br>

### Strong ownership

#### ▼ Strong ownershipとは

1つの開発チームが1つのマイクロサービスに責任を持つ。他のチームがそのマイクロサービスの開発に関わりたい場合、マイクロサービスの担当チームに依頼するか、プルリクエストで承認を得る必要がある。

> - https://www.amazon.co.jp/dp/1491950358

#### ▼ ストリームアラインドチーム (プロダクトチーム)

ストリームアラインドチームは、特定のドメインのプロダクトを継続的に開発し、そのドメインのユーザーに価値を提供する。

ストリームアラインドチームには、プロダクトを開発するためのメンバーが属している。

- プロダクトオーナー
- デザイナー
- フロントエンドエンジニア
- バックエンドエンジニア
- QAエンジニア
- Embedded SRE

![organization_team-topology_stream-aligned-team](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/organization_team-topology_stream-aligned-team.png)

> - https://techblog.ap-com.co.jp/entry/2023/05/22/105800
> - https://medium.com/beyond-agile-leadership/team-topologies-stream-aligned-team-58faaf5729a8
> - https://qiita.com/RepKuririn/items/c1683b501a9cd91b018c#3-4%E3%81%A4%E3%81%AE%E5%9F%BA%E6%9C%AC%E7%9A%84%E3%81%AA%E3%83%81%E3%83%BC%E3%83%A0%E3%82%BF%E3%82%A4%E3%83%97

#### ▼ プラットフォームチーム

プラットフォームチームは組織内サービスを開発し、主にストリームアラインドチームのプロダクト開発を後押しする。

プラットフォームチームには、プラットフォームを開発するためのメンバーが属している。

- プロダクトオーナー
- デザイナー
- フロントエンドエンジニア
- バックエンドエンジニア
- QAエンジニア
- Platform SRE

> - https://techblog.ap-com.co.jp/entry/2023/05/22/105800
> - https://medium.com/beyond-agile-leadership/team-topologies-stream-aligned-team-58faaf5729a8
> - https://qiita.com/RepKuririn/items/c1683b501a9cd91b018c#32-platform-teams%E3%83%97%E3%83%A9%E3%83%83%E3%83%88%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0%E3%83%81%E3%83%BC%E3%83%A0

#### ▼ 複雑サブシステムチーム

ストリームアラインドチームが責任を持つサブシステムに特別な専門知識 (例：ビジネスロジック、AIモデリングロジック、アルゴリズムに関する知識) が必要な場合に、複雑サブシステムチームはこれを支援し、ストリームアラインドチームのプロダクト開発を後押しする。

複雑サブシステムチームには、特定の領域に専門性を持つメンバーが属している。

- 特定の領域に専門性を持つバックエンドエンジニア
- AIエンジニア

> - https://techblog.ap-com.co.jp/entry/2023/05/22/105800
> - https://www.atlassian.com/devops/frameworks/team-topologies

<br>

### Collective ownership

#### ▼ Collective ownershipとは

任意のチームが任意のマイクロサービスに責任を持つ。

> - https://www.amazon.co.jp/dp/1491950358

#### ▼ イネーブルメントチーム

イネーブルメントチームは、ストリームアラインドチームに技術的な知見を提供し、ストリームアラインドチームのプロダクト開発を後押しする。

イネーブルメントチームには、特定の領域に専門性を持つメンバーが属している。

- デザイナー
- フロントエンドエンジニア
- バックエンドエンジニア
- QAエンジニア
- Enabling SRE

> - https://techblog.ap-com.co.jp/entry/2023/05/22/105800
> - https://medium.com/beyond-agile-leadership/team-topologies-stream-aligned-team-58faaf5729a8
> - https://qiita.com/RepKuririn/items/c1683b501a9cd91b018c#32-platform-teams%E3%83%97%E3%83%A9%E3%83%83%E3%83%88%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0%E3%83%81%E3%83%BC%E3%83%A0

<br>
