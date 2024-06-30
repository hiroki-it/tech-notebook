---
title: 【IT技術の知見】AWS EKS＠リソース定義
description: AWS EKS＠リソース定義の知見を記録しています。
---

# AWS EKS＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. metadata.labels

### EC2 Nodeの場合

#### ▼ `beta.kubernetes.io`キー

| キー                      | 値の例  | 説明                                                     |
| ------------------------- | ------- | -------------------------------------------------------- |
| `beta.kubernetes.io/arch` | `amd64` | EC2のNodeグループのCPUアーキテクチャを自動的に設定する。 |

#### ▼ `eks.amazonaws.com`キー

| キー                          | 値の例          | 説明                                    |
| ----------------------------- | --------------- | --------------------------------------- |
| `eks.amazonaws.com/nodegroup` | `app`、`system` | EC2のNodeグループ名を自動的に設定する。 |

#### ▼ `node.kubernetes.io`キー

| キー                               | 値の例      | 説明                                             |
| ---------------------------------- | ----------- | ------------------------------------------------ |
| `node.kubernetes.io/instance-type` | `t3.xlarge` | EC2 Nodeのインスタンスタイプを自動的に設定する。 |

#### ▼ `topology.kubernetes.io`キー

| キー                            | 値の例            | 説明                                           |
| ------------------------------- | ----------------- | ---------------------------------------------- |
| `topology.kubernetes.io/region` | `ap-northeast-1`  | EC2 Nodeのあるリージョン名を自動的に設定する。 |
| `topology.kubernetes.io/zone`   | `ap-northeast-1a` | EC2 NodeのあるAZ名を自動的に設定する。         |

<br>
