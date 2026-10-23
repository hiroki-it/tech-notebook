---
title: 【IT技術の知見】Amazon EKS＠リソース定義
description: Amazon EKS＠リソース定義の知見を記録しています。
---

# Amazon EKS＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. metadata.labels

### EC2 Node の場合

#### ▼ `beta.kubernetes.io` キー

<table>
  <thead>
    <tr>
      <th>キー</th>
      <th>値の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>beta.kubernetes.io/arch</code></td>
      <td><code>amd64</code></td>
      <td>EC2 の Node グループの CPU アーキテクチャを自動的に設定する。</td>
    </tr>
  </tbody>
</table>

#### ▼ `eks.amazonaws.com` キー

<table>
  <thead>
    <tr>
      <th>キー</th>
      <th>値の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>eks.amazonaws.com/nodegroup</code></td>
      <td><code>app</code>、<code>system</code></td>
      <td>EC2 の Node グループ名を自動的に設定する。</td>
    </tr>
  </tbody>
</table>

#### ▼ `node.kubernetes.io` キー

<table>
  <thead>
    <tr>
      <th>キー</th>
      <th>値の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>node.kubernetes.io/instance-type</code></td>
      <td><code>t3.xlarge</code></td>
      <td>EC2 Node のインスタンスタイプを自動的に設定する。</td>
    </tr>
  </tbody>
</table>

#### ▼ `topology.kubernetes.io` キー

<table>
  <thead>
    <tr>
      <th>キー</th>
      <th>値の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>topology.kubernetes.io/region</code></td>
      <td><code>ap-northeast-1</code></td>
      <td>EC2 Node のあるリージョン名を自動的に設定する。</td>
    </tr>
    <tr>
      <td><code>topology.kubernetes.io/zone</code></td>
      <td><code>ap-northeast-1a</code></td>
      <td>EC2 Node のある AZ 名を自動的に設定する。</td>
    </tr>
  </tbody>
</table>

<br>
