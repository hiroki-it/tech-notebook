# Envoy

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## Envoyとは

### 特徴

マイクロサービスのプロキシ機能コンテナとして稼働し、マイクロサービス間のリクエスト送受信に関する機能を提供する。Istioに内蔵されているが、これ単体でも使用できる。アンバサダーパターンに基づいている。マイクロサービスからネットワークに関する責務を分離することを目標としており、各マイクロサービスはリクエスト送信先のマイクロサービスのIPアドレスを知らなくとも、これをEnvoyが解決してくれる。

参考：

- https://blog.linkode.co.jp/entry/2020/07/06/162915
- https://openstandia.jp/oss_info/envoy/
- https://speakerdeck.com/kurochan/ru-men-envoy?slide=33

<br>

### 機能

#### ・サービスディスカバリ

サービスレジストリに登録された情報に基づいて、マイクロサービスを識別する。

参考：https://blog.devgenius.io/implementing-service-discovery-for-microservices-df737e012bc2

#### ・ 負荷分散

#### ・ TLS終端

#### ・ HTTP/2、gRPCのプロキシ

#### ・ サーキットブレイカー

#### ・ ヘルスチェック

#### ・ A/Bテスト

#### ・ フォールとインジェクション

#### ・ メトリクスの収集

