---
title: 【IT技術の知見】CloudFormation＠AWSリソース
description: CloudFormation＠AWSの知見を記録しています。
---

# CloudFormation＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

記入中...

<br>

## 02. リージョン

### 単一リージョン

#### ▼ Stack

CloudFormationでは、通常のStackを作成したリージョンでプロビジョニングが実行される。

そのため、単一リージョンの場合は、Stackのリージョンさえ注意すれば問題ない。

<br>

### 複数リージョン

#### ▼ StackSets

StackSetsを使用すると、複数のリージョンのみでなく、複数のアカウント間でもプロビジョニングを実行できる。

![cloudformation_stacksets](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloudformation_stacksets.png)

> - https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/what-is-cfnstacksets.html
> - https://dev.classmethod.jp/articles/introducing-cloudformation-stacksets/clou

<br>

## 03. テンプレート

### テンプレートとは

スタックの鋳型のこと。

指定したパラメーターを渡すことにより、新しいスタックを作成できる。

<br>

### パラメーター

スタックに代入するオプションを設定する。

インフラの作成時にコンソール画面上で入力フォームが現れる。

また、更新時も画面上から対応できる。

```yaml
AWSTemplateFormatVersion: 2010-09-09
Description: WAF IPSet

# オプションを設定する。
Parameters:
  AllowAddresses:
    Description: IP list allowed to access
    Type: CommaDelimitedList
    Default: "*.*.*.*/*"

# スタック
Resources:
  IPWhiteList:
    Type: "AWS::WAFv2::IPSet"
    Properties:
      Name: foo-ip-white-list
      Scope: REGIONAL
      IPAddressVersion: IPV4
      # パラメーターを参照する。
      Addresses: !Ref AllowAddresses
```

> - https://dev.classmethod.jp/articles/cloudfromation-used-commadelimitedlist/

<br>

## 04. 出力

特定のスタックで作成されたリソース値を他のスタックで使用できるようにする。

> - https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/outputs-section-structure.html

<br>
