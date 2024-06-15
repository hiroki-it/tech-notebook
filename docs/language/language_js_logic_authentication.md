---
title: 【IT技術の知見】認証＠JavaScript
description: 認証＠JavaScriptを記録しています。
---

# 認証＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 認証情報の保管の種類

### SessionStorage

記入中...

<br>

### LocalStorage

記入中...

<br>

### ローカルマシンのディレクトリ (`Cookie`ディレクトリ)

#### ▼ 取得

`document.cookie`から値を出力する。

```javascript
const cookie = document.cookie;

// key=value; key=value; key=value; key=value; key=value; key=value;
console.log(cookie);
```

> - https://tcd-theme.com/2021/11/javascript-cookie.html

#### ▼ 保管

`document.cookie`に値を格納する。

```javascript
// key=value
document.cookie = "user=Tarou";

// user=Tarou
console.log(document.cookie);
```

> - https://tcd-theme.com/2021/11/javascript-cookie.html

#### ▼ 削除

`document.cookie`の有効期限を過去に設定する。

```javascript
document.cookie = "user=Tarou; expires=Mon, 1 Nov 2021 20:00:00 GMT";
```

または、`document.cookie`の有効期限を`0`秒に設定する

```javascript
document.cookie = "user=Tarou; max-age=0";
```

> - https://tcd-theme.com/2021/11/javascript-cookie.html

<br>
