---
title: 【IT技術の知見】認証ロジック＠JavaScript
description: 認証ロジック＠JavaScriptを記録しています。
---

# 認証ロジック＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 認証アーティファクトの保管の種類

### SessionStorage

#### ▼ 保管

```html
<!-- string型で値を設定する必要がある -->
<script>
  window.sessionStorage.setItem("session_id", "*****");
</script>
```

#### ▼ 取得

```html
<script>
  const access_token = window.sessionStorage.getItem("session_id");
  const header = new Headers();
  header.set("Cookie", "session_id");
</script>
```

#### ▼ 削除

```html
<script>
  window.sessionStorage.removeItem("session_id");
</script>
```

```html
<script>
  window.sessionStorage.clear();
</script>
```

<br>

### LocalStorage

#### ▼ 保管

```html
<script>
  window.localStorage.setItem("access_token", "*****");
</script>
```

#### ▼ 取得

```html
<script>
  const access_token = window.localStorage.getItem("access_token");
  const header = new Headers();
  header.set("Authorization", "Bearer " + access_token);
</script>
```

#### ▼ 削除

```html
<script>
  window.localStorage.removeItem("access_token");
</script>
```

```html
<script>
  window.localStorage.clear();
</script>
```

<br>

### Cookie

#### ▼ 保管

`document.cookie` に値を格納する。

```javascript
// key=value
document.cookie = "user=Tarou";

// user=Tarou
console.log(document.cookie);
```

> - https://tcd-theme.com/2021/11/javascript-cookie.html

#### ▼ 取得

`document.cookie` から値を出力する。

```javascript
const cookie = document.cookie;

// key=value; key=value; key=value; key=value; key=value; key=value;
console.log(cookie);
```

> - https://tcd-theme.com/2021/11/javascript-cookie.html

#### ▼ 削除

`document.cookie` の有効期限を過去に設定する。

```javascript
document.cookie = "user=Tarou; expires=Mon, 1 Nov 2021 20:00:00 GMT";
```

または、`document.cookie` の有効期限を `0` 秒に設定する

```javascript
document.cookie = "user=Tarou; max-age=0";
```

> - https://tcd-theme.com/2021/11/javascript-cookie.html

<br>
