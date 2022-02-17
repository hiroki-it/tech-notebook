---
title: 【知見を記録するサイト】CloudFormation＠AWS
description: CloudFormation＠AWSの知見をまとめました．

---

# CloudFormation＠AWS

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

<br>

## 02. リージョン

### 単一リージョン

#### ・Stack

CloudFormationでは，通常のStackを作成したリージョンでプロビジョニングが実行される．そのため，単一リージョンの場合は，Stackのリージョンさえ注意すれば問題ない．

<br>

### 複数リージョン

####  ・StackSets

![cloudformation_stacksets](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/cloudformation_stacksets.png)


StackSetsを用いると，複数のリージョンだけでなく，複数のアカウント間でもプロビジョニングを実行できる．

参考：

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/what-is-cfnstacksets.html
- https://dev.classmethod.jp/articles/introducing-cloudformation-stacksets/clou