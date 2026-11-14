---
title: 【IT技術の知見】Load Balancer
description: Load Balancerの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
  - "Load Balancer"
---

# Load Balancer

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要


ロードバランシングしたいプロトコルに合わせて、使用するロードバランサーを選択する。

<table>
  <thead>
    <tr>
      <th>LB 名</th>
      <th>OSI 階層モデルのレイヤー</th>
      <th>リスナーが処理できるプロトコル</th>
      <th>ターゲット</th>
      <th>リクエストヘッダー (<code>L7</code>)</th>
      <th>パケットヘッダーのフィールド (<code>L4</code>)</th>
      <th>セキュリティグループ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ALB：Application Load Balancer</td>
      <td><code>L7</code> (アプリケーション層)</td>
      <td>HTTP、HTTPS、gRPC</td>
      <td>IP アドレス、Amazon EC2 インスタンス、Lambda</td>
      <td>URL、HTTP ヘッダー</td>
      <td>ポート番号フィールド</td>
      <td>可</td>
    </tr>
    <tr>
      <td>NLB：Network Load Balancer</td>
      <td><code>L4</code> (トランスポート層)</td>
      <td>TCP、UDP、TLS</td>
      <td>IP アドレス、Amazon EC2 インスタンス、ALB</td>
      <td>不可</td>
      <td>IP アドレスフィールド、ポート番号フィールド</td>
      <td>不可</td>
    </tr>
    <tr>
      <td>GLB：Gateway Load Balancer</td>
      <td><code>L3</code> (ネットワーク層) 、<code>L4</code></td>
      <td>IP</td>
      <td>IP アドレス、Amazon EC2 インスタンス</td>
      <td>不可</td>
      <td>IP アドレスフィールド、ポート番号フィールド</td>
      <td>不可</td>
    </tr>
    <tr>
      <td>CLB：Classic Load Balancer</td>
      <td><code>L4</code>、<code>L7</code></td>
      <td>HTTP、HTTPS、TCP、SSL/TLS</td>
      <td>なし</td>
      <td>URL、HTTP ヘッダー</td>
      <td>IP アドレスフィールド、ポート番号フィールド</td>
      <td>可</td>
    </tr>
  </tbody>
</table>

> - [ネットワークトラフィックディストリビューション - Elastic Load Balancing - アマゾン ウェブ サービス](https://aws.amazon.com/jp/elasticloadbalancing/features/)
> - [ロードバランサー（L4）とL7ロードバランサー（Ivanti Virtual Traffic Man \| FJcloud-V FAQ](https://faq.support.nifcloud.com/faq/show/420?site_domain=default)
> - [TCPヘッダとは](https://www.infraexpert.com/study/tcpip8.html)
> - [ネットワークトラフィックディストリビューション - Elastic Load Balancing のよくある質問 - アマゾン ウェブ サービス](https://aws.amazon.com/jp/elasticloadbalancing/faqs/)

<br>
