---
title: 【IT技術の知見】Envoy＠サービスメッシュ
description: Envoy＠サービスメッシュの知見を記録しています。
---

# Envoy＠サービスメッシュ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Envoyの仕組み

### アーキテクチャ

Envoyは、コントロールプレーンに相当するxDSサーバーと、データプレーンに相当するプロキシコンテナから構成される。Envoyには静的/動的な設定がある。静的な設定は、Envoyの起動時に適用される。一方で動的な設定は、xDSサーバーによってEnvoyの実行時に初めて適用される。インバウンド通信を受信したプロキシコンテナは、ルーティングに必要な情報をxDSサーバーに問い合わせ、返却された情報に基づいてルーティングを実行する。

![envoy_structure](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/envoy_structure.png)

> ℹ️ 参考：
>
> - https://qiita.com/kitauji/items/a2a7b583ed3f5b4cc47e
> - https://i-beam.org/2019/03/13/envoy-xds-server/
> - https://github.com/salrashid123/envoy_discovery#prerequsites

<br>

### コントロールプレーン

#### ▼ XDSサーバーの種類

EnvoyからgRPCのコールを受信し、動的な設定を返却するAPIを持つサーバー。主要なサーバーの一覧を示す。

> ℹ️ 参考：
>
> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/dynamic_configuration
> - https://www.netstars.co.jp/kubestarblog/k8s-10/

| サーバー名                           | 説明                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| CDS：Cluster Discovery Service       | Envoyの実行時に、ルーティング先のClusterの設定を動的に検出できるようにする。 |
| EDS：Endpoint Discovery Service      | Envoyの実行時に、ルーティング先のClusterに含まれるメンバーを動的に検出できるようにする。 |
| LDS：Listener Discovery Service      | Envoyの実行時に、リスナーの設定を動的に検出できるようにする。 |
| RDS：Route Discovery Service         | Envoyの実行時に、ルーティングの設定を動的に検出できるようにする。 |
| SDS：Secret Discovery Service        | Envoyの実行時に、リスナーの暗号化の設定を動的に検出できるようにする。 |
| VHDS：Virtual Host Discovery Service | Envoyの実行時に、Cluster内メンバーのルーティングの設定を動的に検出できるようにする。 |

<br>

## 01-02. ユースケース

### リバースプロキシのミドルウェアとして

#### ▼ Pod内の場合

Istioは、マイクロサービスのリバースプロキシコンテナとして、Pod内に```istio-proxy```コンテナを注入する。Istioによって自動的に作成されるが、Istioリソースを使用しなくとも作成できる。マイクロサービスからネットワークに関する責務を分離することを目標としており、各マイクロサービスはリクエスト送信先のマイクロサービスのIPアドレスを知らなくとも、これをEnvoyが解決してくれる。

> ℹ️ 参考：
>
> - https://blog.linkode.co.jp/entry/2020/07/06/162915
> - https://openstandia.jp/oss_info/envoy/
> - https://speakerdeck.com/kurochan/ru-men-envoy?slide=33

<br>

#### ▼ Pod外の場合（フロントプロキシ）

フロントプロキシ機能と呼ばれている。

> ℹ️ 参考：https://tech.uzabase.com/entry/2020/09/28/140046

<br>

### ロードバランサーのミドルウェアとして

<br>

### フォワードプロキシのミドルウェアとして

<br>
