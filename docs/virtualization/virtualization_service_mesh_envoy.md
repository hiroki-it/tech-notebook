---
title: 【知見を記録するサイト】Envoy
---

# Envoy

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. リバースプロキシサーバーとして

### Pod内の場合

Istioは，マイクロサービスのリバースプロキシコンテナとして，Pod内にistio-proxyコンテナを構築する．Istioによって自動的に構築されるが，Istioを使用しなくとも構築できる．マイクロサービスからネットワークに関する責務を分離することを目標としており，各マイクロサービスはリクエスト送信先のマイクロサービスのIPアドレスを知らなくとも，これをEnvoyが解決してくれる．

参考：

- https://blog.linkode.co.jp/entry/2020/07/06/162915
- https://openstandia.jp/oss_info/envoy/
- https://speakerdeck.com/kurochan/ru-men-envoy?slide=33

<br>

### Pod外の場合（フロントプロキシ）

フロントプロキシ機能と呼ばれている．

参考：https://tech.uzabase.com/entry/2020/09/28/140046

<br>

## 02. フォワードプロキシサーバーとして

<br>

## 03. 機能

#### ・サービスディスカバリ

サービスレジストリに登録された情報を基に，マイクロサービスを識別する．

参考：https://blog.devgenius.io/implementing-service-discovery-for-microservices-df737e012bc2

#### ・ 負荷分散

#### ・ TLS終端

#### ・ HTTP/2，gRPCのプロキシ

#### ・ サーキットブレイカー

#### ・ ヘルスチェック

#### ・ A/Bテスト

#### ・ フォールとインジェクション

#### ・ メトリクスの収集

