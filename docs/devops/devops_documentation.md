---
title: 【IT技術の知見】ドキュメンテーション＠DevOps
description: ドキュメンテーション＠DevOpsの知見を記録しています。
---

# ドキュメンテーション＠DevOps

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. ドキュメンテーション

### ドキュメンテーションとは

システムに関するあらゆることを体系的にまとめた文書のこと。

> - https://www.amazon.co.jp/dp/4873119618

<br>

### ドキュメントの種類

#### ▼ 技術スタック表

システムを構成する技術を分類する。

システムの構成要素が多くなるほど、分類数が多くなる。

<table>
  <thead>
    <tr>
      <th>大分類</th>
      <th>中分類</th>
      <th>小分類</th>
      <th>システムの使用技術</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">言語</td>
      <td>アプリ領域</td>
      <td></td>
      <td>Go、PHP</td>
    </tr>
    <tr>
      <td>テスト領域</td>
      <td>ブラックボックスのシナリオ定義</td>
      <td>テストツールによる (例：Grafana k6 なら JavaScript)</td>
    </tr>
    <tr>
      <td rowspan="2">アプリ</td>
      <td>アーキテクチャ</td>
      <td></td>
      <td>マイクロサービスアーキテクチャ、各マイクロサービスはクリーンアーキテクチャ</td>
    </tr>
    <tr>
      <td>API</td>
      <td></td>
      <td>RPC-API、RESTful-API</td>
    </tr>
    <tr>
      <td rowspan="2">CI/CD</td>
      <td>CI ツール</td>
      <td></td>
      <td>GitHub Actions</td>
    </tr>
    <tr>
      <td>CD ツール</td>
      <td></td>
      <td>ArgoCD</td>
    </tr>
    <tr>
      <td rowspan="6">ミドルウェア</td>
      <td>Web 系</td>
      <td></td>
      <td>Nginx</td>
    </tr>
    <tr>
      <td>アプリ系</td>
      <td></td>
      <td>FastCGI</td>
    </tr>
    <tr>
      <td>DB 系</td>
      <td></td>
      <td>MySQL</td>
    </tr>
    <tr>
      <td>ログ系</td>
      <td></td>
      <td>FluentBit</td>
    </tr>
    <tr>
      <td>セキュリティ系</td>
      <td></td>
      <td>Falco</td>
    </tr>
    <tr>
      <td>サービスメッシュ系</td>
      <td></td>
      <td>Envoy</td>
    </tr>
    <tr>
      <td rowspan="2">物理サーバー、仮想サーバー</td>
      <td>アーキテクチャ</td>
      <td></td>
      <td>DR リージョン構成</td>
    </tr>
    <tr>
      <td>仮想サーバー型 IaaS</td>
      <td></td>
      <td>AWS</td>
    </tr>
    <tr>
      <td>CDN</td>
      <td></td>
      <td></td>
      <td>AWS</td>
    </tr>
    <tr>
      <td>IaC</td>
      <td></td>
      <td></td>
      <td>Terraform、Kubernetes、Ansible</td>
    </tr>
    <tr>
      <td rowspan="2">監視</td>
      <td>アプリ監視、インフラ監視</td>
      <td></td>
      <td>AWS</td>
    </tr>
    <tr>
      <td>ビジネス成果監視</td>
      <td></td>
      <td>Metabase</td>
    </tr>
    <tr>
      <td rowspan="2">セキュリティ</td>
      <td>機密情報のバージョン管理</td>
      <td></td>
      <td>Sops、Vault</td>
    </tr>
    <tr>
      <td>VPN</td>
      <td></td>
      <td>OpenVPN</td>
    </tr>
    <tr>
      <td rowspan="2">テスト</td>
      <td>ホワイトボックス</td>
      <td></td>
      <td><code>go test</code> コマンド、PHPUnit</td>
    </tr>
    <tr>
      <td>ブラックボックス</td>
      <td></td>
      <td>ChaosMesh、Postman、Taurus</td>
    </tr>
  </tbody>
</table>

#### ▼ 設計規約書

- アーキテクチャ
- 命名規則
- コンポーネント間の依存関係
- ステークホルダー
- プロダクト責任者

#### ▼ ドキュメント

- 内部向け API ドキュメント
- 使い方に関するドキュメント (README)

#### ▼ 手順書

- リリース手順書
- 環境構築手順書
- 運用手順書

> - [自己流の手順書フォーマットを公開してみた \| DevelopersIO](https://dev.classmethod.jp/articles/non-97-operation-manual/)

#### ▼ 調査書

- ポストモーテム

#### ▼ 公開書類

- 外部向け API ドキュメント
- SLA

<br>

## 02. ドキュメントの品質

### 品質の種類

#### ▼ 構造品質

表記と文法の正しさのこと。

機能品質よりは重要度が低い。

> - https://www.amazon.co.jp/dp/B0BXSYF2N4/

#### ▼ 機能品質

ドキュメントの有用さのこと。

ドキュメントをコードと同じディレクトリなどでバージョン管理し、コードの変更に合わせてドキュメントも変更する。

有用性の品質を保つとともに、ドキュメントの場所を明確にする。

> - https://www.amazon.co.jp/dp/B0BXSYF2N4/

<br>

### 構造品質の担保

#### ▼ ドキュメント自動作成ツール

追加/変更した機能に関するドキュメントを自動作成し、ドキュメントの内容についてもレビューできる仕組みを作る。

<table>
  <thead>
    <tr>
      <th>領域</th>
      <th>ドキュメントの対象の技術</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">アプリ</td>
      <td>RESTful-API</td>
      <td>RESTful-API を採用している場合、ドキュメント作成ツール (例：openapi-generator など) を使用して、API のドキュメントのおおよその部分を自動的に作成する。</td>
      <td></td>
    </tr>
    <tr>
      <td>RPC-API</td>
      <td>RPC-API を採用している場合、ドキュメント作成ツール (例：protoc-gen-doc など) を使用して、API のドキュメントのおおよその部分を自動的に作成する。</td>
      <td></td>
    </tr>
    <tr>
      <td rowspan="2">インフラ</td>
      <td>Helm</td>
      <td>ユーザー定義のチャートを採用している場合、外部のドキュメント作成ツール (例：helm-docs) を使用して、チャートのドキュメントを自動的に作成する。</td>
      <td>・<a href="https://github.com/norwoodj/helm-docs">https://github.com/norwoodj/helm-docs</a></td>
    </tr>
    <tr>
      <td>Terraform</td>
      <td>外部のドキュメント自動作成ツール (例：terraform-docs) を使用して、<code>variable</code> ブロック、<code>output</code> ブロック、<code>module</code> ブロックなどのドキュメントを作成する。</td>
      <td>・<a href="https://qiita.com/yutachaos/items/1a7f5a93ceaf972c76c6">https://qiita.com/yutachaos/items/1a7f5a93ceaf972c76c6</a></td>
    </tr>
  </tbody>
</table>

#### ▼ 構造検証ツール

ドキュメントの構造を検証するツールを使用して、これを構造を継続的に修正する。

<table>
  <thead>
    <tr>
      <th>能力</th>
      <th>ツール</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>構造整形</td>
      <td>prettier</td>
      <td>テキストファイル中の不要な改行やインデントなどを整形する。</td>
      <td></td>
    </tr>
    <tr>
      <td>文章校正</td>
      <td>textlint</td>
      <td>設定した校正ルールに応じて、テキストファイルの誤った文法を検出する。</td>
      <td></td>
    </tr>
    <tr>
      <td>リンク切れチェック</td>
      <td>markdown-link-check、htmltest</td>
      <td>テキストファイル中の URL のリンク切れを検出する。</td>
      <td></td>
    </tr>
  </tbody>
</table>

> - [良いドキュメントを書きたくなる本を読んだらドキュメンタリアンになりたくなった - じゃあ、おうちで学べる](https://syu-m-5151.hatenablog.com/entry/2023/03/14/130502)

<br>

### 機能品質の担保

#### ▼ 共通編集ツール

ドキュメント共通編集ツール (例：confluence、esa、mkdocs、docusaurus など) を使用すると、改善しやすくなる。その結果、機能品質を高めやすくなる。例えば、フィードバックをもらいやすくなる、誰でも気軽に作成更新できる、構造/機能品質を高めるための機能があるなどである。

<br>
