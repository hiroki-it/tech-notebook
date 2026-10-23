---
title: 【IT技術の知見】プラクティス集＠CircleCI
description: プラクティス集＠CircleCIの知見を記録しています。
---

# プラクティス集＠CircleCI

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. CircleCI に関する脆弱性対策

### CircleCI に関する脆弱性対策とは

対象のソースコードの脆弱性ではなく、CircleCI に関するそれに対処する。

<br>

### 認証／認可

#### ▼ CircleCI の操作ユーザーの場合

CircleCI の操作アカウントを認証し、認可する。

利便的かつ安全な認証／認可方法を選ぶ。

<table>
  <thead>
    <tr>
      <th>認証／認可方法</th>
      <th style="text-align:center">二要素認証</th>
      <th style="text-align:center">推奨/非推奨</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ベーシック認証</td>
      <td style="text-align:center">-</td>
      <td style="text-align:center">非推奨</td>
    </tr>
    <tr>
      <td rowspan="2">OAuth</td>
      <td style="text-align:center">あり</td>
      <td style="text-align:center">推奨</td>
    </tr>
    <tr>
      <td style="text-align:center">なし</td>
      <td style="text-align:center">非推奨</td>
    </tr>
    <tr>
      <td rowspan="2">OIDC</td>
      <td style="text-align:center">あり</td>
      <td style="text-align:center">推奨</td>
    </tr>
    <tr>
      <td style="text-align:center">なし</td>
      <td style="text-align:center">非推奨</td>
    </tr>
    <tr>
      <td rowspan="2">SAML</td>
      <td style="text-align:center">あり</td>
      <td style="text-align:center">推奨</td>
    </tr>
    <tr>
      <td style="text-align:center">なし</td>
      <td style="text-align:center">非推奨</td>
    </tr>
  </tbody>
</table>

#### ▼ CircleCI 自体の場合

CircleCI を認証し、認可する。

<table>
  <thead>
    <tr>
      <th>期限</th>
      <th>説明</th>
      <th>方法</th>
      <th style="text-align:center">推奨/非推奨</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>恒久的</td>
      <td>CircleCI を恒久的に認証し、また同様に恒久的に認可する。</td>
      <td>・AWS の場合、ツールに IAM ユーザを紐付けておき、この IAM ユーザーに常に IAM ロールを紐付けておく。<br>・GCP の場合、ツールに IAM ユーザを紐付けておき、この IAM ユーザーに常にロールを紐付けておく。</td>
      <td style="text-align:center">非推奨</td>
    </tr>
    <tr>
      <td>一時的</td>
      <td>CircleCI を一時的に認証し、また同様に一時的に認可する。</td>
      <td>・AWS の場合、ツールに IAM ユーザー/SAML ユーザー/OIDC ユーザーを紐付けておき、AWS STS で一時的に認証する。また、AssumeRole によるスイッチロールでは、認可スコープを一時的に付与する。<br>・GCP の場合、ツールに IAM ユーザーを紐付けておき、条件付きロールバインディングで認可スコープを付与する。</td>
      <td style="text-align:center">推奨</td>
    </tr>
  </tbody>
</table>

<br>

### 機密な変数やファイルの管理

たとえ、CircleCI から機密な変数が漏洩しても、復号しにくいようにする。

CircleCI の実行環境に出力する変数やファイルは、`base64` 形式や暗号化キーであらかじめエンコードしておき、使用時にデコードまたは復号する。

<br>

## 02. 事後処理

### 通知

CI パイプラインと CD パイプライン上で実行しているステップ (例：ホワイトボックステスト、デプロイなど) の結果が通知されるようにする。

通知があることと品質を高めることは直接的には関係ないが、開発者の作業効率が上がるため、間接的に品質を高めることにつながる。

<br>
