---
title: 【IT技術の知見】認証要素による分類＠認証
description: 認証要素による分類＠認証の知見を記録しています。
---

# 認証要素による分類＠認証

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. TSV：Two Step Verification (二段階認証)

### 二段階認証とは

`2` 個の認証方法を設定し、クライアントを照合する。

<table>
  <thead>
    <tr>
      <th>一段階目の認証例</th>
      <th>二段階目の認証例</th>
      <th>説明</th>
      <th>備考</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="4">ID とパスワード</td>
      <td>ID とパスワード</td>
      <td>ID とパスワードによる方法の後、別の ID とパスワードによる方法を設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>秘密の質問</td>
      <td>ID とパスワードによる方法の後、質問に対してあらかじめ設定した回答による方法を設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>SMS</td>
      <td>ID とパスワードによる方法の後、SMS 宛に送信した認証コードによる方法を設定する。</td>
      <td>異なる要素のため、これは二要素認証でもある。</td>
    </tr>
    <tr>
      <td>指紋</td>
      <td>ID とパスワードによる方法の後、指紋の解析結果による方法を設定する。</td>
      <td>異なる要素のため、これは二要素認証でもある。</td>
    </tr>
  </tbody>
</table>

<br>

## 02. TFA：Two Factor Authorization (二要素認証)

### 二要素認証とは

二段階認証のうちで特に、認証時に異なる要素の方法を使用して、段階的にクライアントを照合すること方法のこと。

<table>
  <thead>
    <tr>
      <th>一要素目の認証例</th>
      <th>二要素目の認証例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="6">ID とパスワード (知識)</td>
      <td>事前に連携登録された PC 端末の QR コード読込アプリで発行したワンタイムパスワード (所持)</td>
    </tr>
    <tr>
      <td>事前に連携登録されたスマホ端末の QR コード読込アプリで発行したワンタイムパスワード (所持)</td>
    </tr>
    <tr>
      <td>事前登録されたスマホ端末の電話番号の SMS で受信したワンタイムパスワード (所持)</td>
    </tr>
    <tr>
      <td>事前登録されたスマホ端末の電話番号の SMS で受信した認証コード (所持)</td>
    </tr>
    <tr>
      <td>OAuth (所持)</td>
    </tr>
    <tr>
      <td>指紋 (生体)</td>
    </tr>
    <tr>
      <td>暗証番号 (知識)</td>
      <td>キャッシュカード (所持)</td>
    </tr>
  </tbody>
</table>

> - https://www.quix.jp/quix/two-factor-authentication/

<br>

### 生体認証

記入中...

![生体認証-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/生体認証-1.png)

![生体認証-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/生体認証-2.png)

<br>

## 03. MFA：Multiple Factor Authorization (多要素認証)

### 多要素認証とは

記入中...

<br>
