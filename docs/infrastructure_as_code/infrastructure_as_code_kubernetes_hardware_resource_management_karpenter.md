---
title: 【IT技術の知見】karpenter＠ハードウェアリソース管理
description: karpenter＠ハードウェアリソース管理の知見を記録しています。
---

# karpenter＠ハードウェアリソース管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. karpenter

### アーキテクチャ

karpenterはAWS EC2のグループ (例：AWS EC2フリート) に関するAPIをコールし、Nodeの自動水平スケーリングを実行する。

karpenterを使用しない場合、クラウドプロバイダーのNode数は固定である。

AWSの場合のみ、cluster-autoscalerの代わりにkarpenterを使用できる。

karpenterでは、作成されるNodeのスペックを事前に指定する必要がなく、またリソース効率も良い。

そのため、必要なスペックの上限がわかっている場合はもちろん、上限を決めきれないような要件 (例：負荷が激しく変化するようなシステム) でも合っている。

![karpenter_architecture.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/karpenter_architecture.png)

> ↪️：
>
> - https://sreake.com/blog/learn-about-karpenter/
> - https://blog.inductor.me/entry/2021/12/06/165743
> - https://vishnudeva.medium.com/scaling-kubernetes-with-karpenter-1dc785e79010
> - https://qiita.com/o2346/items/6277a7ff6b1826d8de11

<br>

### cluster-autoscalerとの違い

cluster-autoscalerはクラウドプロバイダーによらずに使用できるが、karpenterは執筆時点 (2023/02/26) では、AWS上でしか使用できない。

そのため、クラウドプロバイダーの自動スケーリング (例：AWS EC2AutoScaling) に関するAPIをコールすることになり、その機能が自動スケーリングに関するAPIに依存する。

一方でkarpenterは、EC2のグループ (例：AWS EC2フリート) に関するAPIをコールするため、より柔軟なNode数にスケーリングできる。

![karpenter_vs_cluster-autoscaler.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/karpenter_vs_cluster-autoscaler.png)

> ↪️：
>
> - https://awstip.com/this-code-works-autoscaling-an-amazon-eks-cluster-with-karpenter-part-1-3-40c7bed26cfd
> - https://www.linkedin.com/pulse/karpenter-%D1%83%D0%BC%D0%BD%D0%BE%D0%B5-%D0%BC%D0%B0%D1%81%D1%88%D1%82%D0%B0%D0%B1%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-kubernetes-%D0%BA%D0%BB%D0%B0%D1%81%D1%82%D0%B5%D1%80%D0%B0-victor-vedmich/?originalSubdomain=ru
> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-fleet.html

<br>

## 02. スケーリングの仕組み

### スケールアウトの場合

例えば、以下のような仕組みで、Nodeの自動水平スケーリングのスケールアウトを実行する。

`【１】`

: Podが、Nodeの`70`%にあたるリソースを要求する。 しかし、Nodeが`1`台では足りない。`70 + 70 = 140%`になるため、既存のNodeの少なくとも`1.4`倍のスペックが必要となる。

`【２】`

: 新しく決定したスペックで、Nodeを新しく作成する。

`【３】`

: 新しく作成したNodeにPodをスケジューリングする。また、既存のNodeが不要であれば削除する。

`【４】`

: 結果として、`1`台で`2`個のPodがスケジューリングされている。

<br>

### スケールインの場合

記入中...

<br>
