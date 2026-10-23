---
title: 【IT技術の知見】Global Accelerator＠AWSリソース
description: Global Accelerator＠AWSリソースの知見を記録しています。
---

# Global Accelerator＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Global Accelerator とは

`L4`/`L7` ロードバランサーとして機能する。

エンドポイントグループを持ち、特定の IP アドレスに直接ロードバランシングできる。

<br>

## 02. セットアップ

### コンソール画面の場合

#### ▼ 基本的設定

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Accelerator タイプ</td>
      <td>エンドポイントグループへのルーティング時のアルゴリズムを設定する。</td>
      <td>Standard：ユーザーにもっとも近いリージョンにあるエンドポイントグループに、リクエストがルーティングされる。</td>
    </tr>
    <tr>
      <td>IP アドレスプール</td>
      <td>Global Accelerator に割り当てる静的 IP アドレスを設定する。</td>
      <td></td>
    </tr>
  </tbody>
</table>

#### ▼ リスナー

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ポート</td>
      <td>宛先とするポート番号を設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>プロトコル</td>
      <td>ルーティング先のプロトコルを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>Client affinity</td>
      <td>ユーザーごとにルーティング先を固定するかを設定する。</td>
      <td>・None：複数のルーティング先があった場合、各ユーザーの毎リクエスト時のルーティング先は固定されなくなる。<br>・Source IP：複数のルーティング先があったとしても、各ユーザーの毎リクエスト時のルーティング先を固定できるようになる。</td>
    </tr>
  </tbody>
</table>

#### ▼ エンドポイントグループ

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>エンドポイントグループ</td>
      <td>特定のリージョンに紐付くエンドポイントのグループを設定する。</td>
      <td>・<br>・トラフィックダイヤルにて、各エンドポイントグループの重みを設定できる。</td>
    </tr>
    <tr>
      <td>トラフィックダイヤル</td>
      <td>複数のエンドポイントグループがある場合、それぞれの重み (%) を設定する。</td>
      <td>・例えば、カナリアリリースのために、新アプリと旧アプリへのルーティングに重みを付ける場合に役立つ。</td>
    </tr>
    <tr>
      <td>ヘルスチェック</td>
      <td>ルーティング先に対するヘルスチェックを設定する。</td>
      <td></td>
    </tr>
  </tbody>
</table>

#### ▼ エンドポイント

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>エンドポイントタイプ</td>
      <td>ルーティング先の AWS リソースを設定する。</td>
      <td>ALB、NLB、EC2、Elastic IP を選択できる。</td>
    </tr>
    <tr>
      <td>重み</td>
      <td>複数のエンドポイントがある場合、それぞれの重みを設定する。</td>
      <td>各エンドポイントの重みの合計値を 256 とし、1～255 で相対値を設定する。</td>
    </tr>
    <tr>
      <td>クライアント IP アドレスの保持</td>
      <td><code>X-Forwarded-For</code> ヘッダーにクライアント IP アドレスを含めてルーティングするか否かを設定する。</td>
      <td></td>
    </tr>
  </tbody>
</table>

<br>

### 素早いレスポンスの理由

![GlobalAccelerator](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/GlobalAccelerator.png)

最初、クライアント PC からのリクエストはエッジロケーションで受信される。

プライベートネットワーク内のエッジロケーションを経由して、ルーティング先のリージョンまで届く。

パブリックネットワークを使用しないため、小さなレイテシーでトラフィックをルーティングできる。

![GlobalAccelerator導入後](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/GlobalAccelerator導入後.png)

Global Accelerator を使用しない場合、クライアント PC のリージョンから指定したリージョンに至るまで、いくつもパブリックネットワークを経由する必要があり、時間がかかってしまう。

![GlobalAccelerator導入前](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/GlobalAccelerator導入前.png)

以下のサイトで、Global Accelerator を使用した場合としなかった場合のレスポンスタイムを比較できる。

> - [AWS Global Accelerator Speed Comparison](https://speedtest.globalaccelerator.aws/#/)

<br>
